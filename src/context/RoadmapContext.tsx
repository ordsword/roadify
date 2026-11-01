import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Roadmap, StageNode, ConnectionLink, CanvasTool, FilterTab, PriorityLevel, TextNote, TaskGroup, TaskItem } from '../types';
import { INITIAL_ROADMAPS } from '../presets/initialData';
import { useAuth } from './AuthContext';

interface RoadmapContextType {
  roadmaps: Roadmap[];
  activeRoadmapId: string;
  activeRoadmap: Roadmap | undefined;
  activeStageId: string | null;
  filterTab: FilterTab;
  searchQuery: string;
  canvasState: { panX: number; panY: number; zoom: number };
  activeTool: CanvasTool;
  isConnecting: boolean;
  connectingFromId: string | null;
  wsConnected: boolean;

  // Actions
  setActiveRoadmapId: (id: string) => void;
  setActiveStageId: (id: string | null) => void;
  setFilterTab: (tab: FilterTab) => void;
  setSearchQuery: (query: string) => void;
  setActiveTool: (tool: CanvasTool) => void;
  setPanZoom: (panX: number, panY: number, zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  focusStage: (stageId: string) => void;

  // Data mutations
  createRoadmap: (title: string, description?: string) => Promise<Roadmap | null>;
  deleteRoadmap: (id: string) => Promise<boolean>;
  addStage: (stage: Partial<StageNode>) => Promise<StageNode | null>;
  updateStage: (stageId: string, updates: Partial<StageNode>) => Promise<void>;
  deleteStage: (stageId: string) => Promise<void>;
  addTaskGroup: (stageId: string, title: string) => Promise<void>;
  addSubtask: (stageId: string, groupId: string | null, title: string, priority?: PriorityLevel) => Promise<void>;
  toggleSubtask: (stageId: string, taskId: string) => Promise<void>;
  deleteSubtask: (stageId: string, taskId: string) => Promise<void>;
  createConnection: (fromId: string, toId: string, label?: string) => Promise<void>;
  deleteConnection: (connId: string) => Promise<void>;
  addTextNote: (x: number, y: number, text?: string) => TextNote | null;
  updateTextNote: (noteId: string, updates: Partial<TextNote>) => void;
  deleteTextNote: (noteId: string) => void;
  autoLayout: (direction?: 'horizontal' | 'vertical') => Promise<void>;
  startConnecting: (fromStageId: string) => void;
  cancelConnecting: () => void;
  completeConnecting: (toStageId: string) => void;
  importRoadmapJSON: (jsonString: string) => boolean;
  importRoadmapFile: (file: File) => Promise<boolean>;
  loadSampleTemplate: () => void;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // Load from local storage, start with a clean starter project if first time
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
    try {
      const saved = localStorage.getItem('roadify_roadmaps');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    const defaultProject: Roadmap = {
      id: 'rm-main',
      title: 'Мой проект',
      description: 'Основная дорожная карта и планирование спринтов',
      author: 'Пользователь',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      canvasState: { panX: 180, panY: 80, zoom: 1.0 },
      stages: [],
      connections: [],
      textNotes: [
        {
          id: 'note-welcome',
          roadmapId: 'rm-main',
          x: 260,
          y: 40,
          text: 'Мой проект — дорожная карта спринта',
          color: '#facc15',
          fontSize: 18,
        },
      ],
    };
    return [defaultProject];
  });

  const [activeRoadmapId, setActiveRoadmapId] = useState<string>(() => {
    return localStorage.getItem('roadify_active_id') || 'rm-main';
  });

  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTool, setActiveTool] = useState<CanvasTool>('select');

  const [canvasState, setCanvasState] = useState<{ panX: number; panY: number; zoom: number }>({
    panX: 180,
    panY: 80,
    zoom: 1.0,
  });

  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Active roadmap lookup
  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId) || roadmaps[0];

  // Keep active ID valid
  useEffect(() => {
    if (activeRoadmap && activeRoadmap.id !== activeRoadmapId) {
      setActiveRoadmapId(activeRoadmap.id);
    }
  }, [activeRoadmap, activeRoadmapId]);

  // Persist locally
  useEffect(() => {
    localStorage.setItem('roadify_roadmaps', JSON.stringify(roadmaps));
    if (activeRoadmapId) {
      localStorage.setItem('roadify_active_id', activeRoadmapId);
    }
  }, [roadmaps, activeRoadmapId]);

  // Fetch from local server on mount
  const fetchFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/roadmaps');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setRoadmaps(data);
        }
      }
    } catch (e) {
      // Local mode
    }
  }, []);

  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  // WebSocket Live Sync
  useEffect(() => {
    let socket: WebSocket;
    let reconnectTimeout: any;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:3001/ws`;
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => setWsConnected(true);
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event && message.data) {
            // Live update from server/MCP
            if (message.event === 'stage_updated' || message.event === 'stage_added' || message.event === 'roadmap_updated') {
              fetchFromServer();
            }
          }
        } catch {}
      };
      socket.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 3000);
      };
      socket.onerror = () => socket.close();
    };

    connectWS();
    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) socket.close();
    };
  }, [fetchFromServer]);

  // Camera / Canvas control
  const setPanZoom = useCallback((panX: number, panY: number, zoom: number) => {
    setCanvasState({
      panX,
      panY,
      zoom: Math.min(Math.max(zoom, 0.2), 3.0),
    });
  }, []);

  const zoomIn = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.2, 3.0),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setCanvasState((prev) => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.2, 0.2),
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setCanvasState({ panX: 180, panY: 80, zoom: 1.0 });
  }, []);

  const fitToScreen = useCallback(() => {
    if (!activeRoadmap || activeRoadmap.stages.length === 0) {
      resetZoom();
      return;
    }

    const stages = activeRoadmap.stages;
    const minX = Math.min(...stages.map((s) => s.x));
    const maxX = Math.max(...stages.map((s) => s.x + (s.width || 480)));
    const minY = Math.min(...stages.map((s) => s.y));
    const maxY = Math.max(...stages.map((s) => s.y + 400));

    const contentWidth = maxX - minX + 200;
    const contentHeight = maxY - minY + 200;

    const viewportW = window.innerWidth - 320;
    const viewportH = window.innerHeight - 120;

    const scale = Math.min(viewportW / contentWidth, viewportH / contentHeight, 1.2);
    const zoom = Math.max(scale, 0.35);

    const panX = (viewportW - (maxX + minX) * zoom) / 2 + 320;
    const panY = (viewportH - (maxY + minY) * zoom) / 2 + 60;

    setCanvasState({ panX, panY, zoom });
  }, [activeRoadmap, resetZoom]);

  const focusStage = useCallback((stageId: string) => {
    const stage = activeRoadmap?.stages.find((s) => s.id === stageId);
    if (!stage) return;

    setActiveStageId(stageId);
    const viewportW = window.innerWidth - 320;
    const viewportH = window.innerHeight - 80;
    const cardWidth = stage.width || 500;
    const cardHeight = 400;

    const targetPanX = 320 + viewportW / 2 - (stage.x + cardWidth / 2) * canvasState.zoom;
    const targetPanY = 80 + viewportH / 2 - (stage.y + cardHeight / 2) * canvasState.zoom;

    setCanvasState((prev) => ({
      ...prev,
      panX: targetPanX,
      panY: targetPanY,
    }));
  }, [activeRoadmap, canvasState.zoom]);

  // Mutations
  const createRoadmap = async (title: string, description: string = '') => {
    const authorName = currentUser?.name || 'Пользователь';
    try {
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, author: authorName }),
      });
      if (res.ok) {
        const rm = await res.json();
        setRoadmaps((prev) => [...prev, rm]);
        setActiveRoadmapId(rm.id);
        return rm;
      }
    } catch {}

    // Fallback local
    const newRm: Roadmap = {
      id: `rm-${Date.now()}`,
      title,
      description,
      author: authorName,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      canvasState: { panX: 180, panY: 80, zoom: 1.0 },
      stages: [],
      connections: [],
    };
    setRoadmaps((prev) => [...prev, newRm]);
    setActiveRoadmapId(newRm.id);
    return newRm;
  };

  const deleteRoadmap = async (id: string) => {
    try {
      await fetch(`/api/roadmaps/${id}`, { method: 'DELETE' });
    } catch {}
    setRoadmaps((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      if (activeRoadmapId === id && filtered.length > 0) {
        setActiveRoadmapId(filtered[0].id);
      }
      return filtered;
    });
    return true;
  };

  const addStage = async (stageData: Partial<StageNode>) => {
    let targetRm = activeRoadmap;
    if (!targetRm) {
      targetRm = await createRoadmap('Мой проект', 'Основная дорожная карта');
      if (!targetRm) return null;
    }

    const newStage: StageNode = {
      id: stageData.id || `stage-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roadmapId: targetRm.id,
      title: stageData.title || 'Новый этап',
      tag: stageData.tag || 'ЭТАП',
      description: stageData.description || '',
      status: stageData.status || 'planned',
      deadline: stageData.deadline || 'Без срока',
      priority: stageData.priority || 'medium',
      x: stageData.x ?? (targetRm.stages.length > 0 ? targetRm.stages[targetRm.stages.length - 1].x + 550 : 260),
      y: stageData.y ?? 140,
      width: stageData.width || 520,
      collapsed: false,
      taskGroups: stageData.taskGroups && stageData.taskGroups.length > 0
        ? stageData.taskGroups
        : [
            {
              id: `grp-${Date.now()}`,
              title: 'Задачи этапа',
              tasks: [],
            },
          ],
    };

    // Optimistically update React state immediately!
    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === targetRm!.id
          ? { ...r, stages: [...r.stages, newStage], updated: new Date().toISOString() }
          : r
      )
    );

    // Persist to server in background
    try {
      await fetch(`/api/roadmaps/${targetRm.id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStage),
      });
    } catch {}

    return newStage;
  };

  const updateStage = async (stageId: string, updates: Partial<StageNode>) => {
    try {
      await fetch(`/api/stages/${stageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch {}

    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        stages: r.stages.map((s) => (s.id === stageId ? { ...s, ...updates } : s)),
      }))
    );
  };

  const deleteStage = async (stageId: string) => {
    try {
      await fetch(`/api/stages/${stageId}`, { method: 'DELETE' });
    } catch {}

    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        stages: r.stages.filter((s) => s.id !== stageId),
        connections: r.connections.filter((c) => c.fromStageId !== stageId && c.toStageId !== stageId),
      }))
    );
  };

  const addTaskGroup = async (stageId: string, title: string) => {
    if (!activeRoadmap) return;
    const newGroup: TaskGroup = {
      id: `grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title || 'Новая группа',
      collapsed: false,
      tasks: [],
    };

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              stages: r.stages.map((s) =>
                s.id === stageId
                  ? { ...s, taskGroups: [...(s.taskGroups || []), newGroup] }
                  : s
              ),
              updated: new Date().toISOString(),
            }
          : r
      )
    );

    try {
      await fetch(`/api/stages/${stageId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
    } catch {}
  };

  const addSubtask = async (
    stageId: string,
    groupId: string | null,
    title: string,
    priority: PriorityLevel = 'normal'
  ) => {
    if (!activeRoadmap || !title.trim()) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: title.trim(),
      completed: false,
      priority,
    };

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              stages: r.stages.map((s) => {
                if (s.id !== stageId) return s;
                let targetGroupFound = false;
                const updatedGroups = (s.taskGroups || []).map((g) => {
                  if (groupId ? g.id === groupId : !targetGroupFound) {
                    targetGroupFound = true;
                    return { ...g, tasks: [...g.tasks, newTask] };
                  }
                  return g;
                });
                if (!targetGroupFound) {
                  updatedGroups.push({
                    id: `grp-${Date.now()}`,
                    title: 'Задачи этапа',
                    tasks: [newTask],
                  });
                }
                return { ...s, taskGroups: updatedGroups };
              }),
              updated: new Date().toISOString(),
            }
          : r
      )
    );

    try {
      await fetch(`/api/stages/${stageId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, title, priority }),
      });
    } catch {}
  };

  const toggleSubtask = async (stageId: string, taskId: string) => {
    try {
      await fetch(`/api/stages/${stageId}/tasks/${taskId}/toggle`, {
        method: 'POST',
      });
    } catch {}

    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        stages: r.stages.map((s) => {
          if (s.id !== stageId) return s;
          const updatedGroups = s.taskGroups.map((g) => ({
            ...g,
            tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
          }));

          const allTasks = updatedGroups.flatMap((g) => g.tasks);
          const allDone = allTasks.length > 0 && allTasks.every((t) => t.completed);
          if (allDone) {
            confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
          }

          const newStatus = allDone ? 'done' : allTasks.some((t) => t.completed) ? 'in_progress' : s.status;
          return { ...s, taskGroups: updatedGroups, status: newStatus };
        }),
      }))
    );
  };

  const deleteSubtask = async (stageId: string, taskId: string) => {
    try {
      await fetch(`/api/stages/${stageId}/tasks/${taskId}`, {
        method: 'DELETE',
      });
    } catch {}

    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        stages: r.stages.map((s) => {
          if (s.id !== stageId) return s;
          return {
            ...s,
            taskGroups: s.taskGroups.map((g) => ({
              ...g,
              tasks: g.tasks.filter((t) => t.id !== taskId),
            })),
          };
        }),
      }))
    );
  };

  const createConnection = async (fromId: string, toId: string, label?: string) => {
    if (!activeRoadmap || fromId === toId) return;

    const currentConns = activeRoadmap.connections || [];
    if (currentConns.some((c) => c.fromStageId === fromId && c.toStageId === toId)) {
      return;
    }

    const newConn: ConnectionLink = {
      id: `link-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fromStageId: fromId,
      toStageId: toId,
      label: label || '',
      color: '#ffffff',
      style: 'curved',
    };

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              connections: [...(r.connections || []), newConn],
              updated: new Date().toISOString(),
            }
          : r
      )
    );

    try {
      await fetch(`/api/roadmaps/${activeRoadmap.id}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConn),
      });
    } catch {}
  };

  const deleteConnection = async (connId: string) => {
    if (!activeRoadmap) return;
    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              connections: (r.connections || []).filter((c) => c.id !== connId),
              updated: new Date().toISOString(),
            }
          : r
      )
    );

    try {
      await fetch(`/api/roadmaps/${activeRoadmap.id}/connections/${connId}`, {
        method: 'DELETE',
      });
    } catch {}
  };

  const addTextNote = (x: number, y: number, text: string = 'Новая надпись'): TextNote | null => {
    if (!activeRoadmap) return null;
    const newNote: TextNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roadmapId: activeRoadmap.id,
      x,
      y,
      text,
      color: '#facc15',
      fontSize: 16,
    };

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              textNotes: [...(r.textNotes || []), newNote],
              updated: new Date().toISOString(),
            }
          : r
      )
    );
    return newNote;
  };

  const updateTextNote = (noteId: string, updates: Partial<TextNote>) => {
    if (!activeRoadmap) return;
    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              textNotes: (r.textNotes || []).map((n) =>
                n.id === noteId ? { ...n, ...updates } : n
              ),
              updated: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const deleteTextNote = (noteId: string) => {
    if (!activeRoadmap) return;
    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? {
              ...r,
              textNotes: (r.textNotes || []).filter((n) => n.id !== noteId),
              updated: new Date().toISOString(),
            }
          : r
      )
    );
  };

  const autoLayout = async (direction: 'horizontal' | 'vertical' = 'horizontal') => {
    if (!activeRoadmap) return;
    try {
      await fetch(`/api/roadmaps/${activeRoadmap.id}/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      fetchFromServer();
    } catch {}
  };

  const startConnecting = (fromStageId: string) => {
    setConnectingFromId(fromStageId);
    setActiveTool('connect');
  };

  const cancelConnecting = () => {
    setConnectingFromId(null);
    setActiveTool('select');
  };

  const completeConnecting = (toStageId: string) => {
    if (connectingFromId && connectingFromId !== toStageId) {
      createConnection(connectingFromId, toStageId);
    }
    setConnectingFromId(null);
    setActiveTool('select');
  };

  // Import JSON string
  const importRoadmapJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      const itemsToImport: Roadmap[] = Array.isArray(parsed) ? parsed : [parsed];

      let lastImportedId = '';
      const validRoadmaps: Roadmap[] = [];

      for (const item of itemsToImport) {
        if (item && item.title) {
          const rm: Roadmap = {
            id: item.id || `rm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            title: item.title,
            description: item.description || '',
            author: item.author || currentUser?.name || 'Пользователь',
            created: item.created || new Date().toISOString(),
            updated: new Date().toISOString(),
            canvasState: item.canvasState || { panX: 180, panY: 80, zoom: 1.0 },
            stages: Array.isArray(item.stages) ? item.stages : [],
            connections: Array.isArray(item.connections) ? item.connections : [],
          };
          validRoadmaps.push(rm);
          lastImportedId = rm.id;
        }
      }

      if (validRoadmaps.length > 0) {
        setRoadmaps((prev) => {
          const existingIds = new Set(validRoadmaps.map((v) => v.id));
          const kept = prev.filter((r) => !existingIds.has(r.id));
          return [...kept, ...validRoadmaps];
        });
        setActiveRoadmapId(lastImportedId);
        return true;
      }
    } catch (e) {
      console.error('Import error:', e);
    }
    return false;
  };

  // Import .json file
  const importRoadmapFile = async (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const success = importRoadmapJSON(text);
          resolve(success);
        } else {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    });
  };

  // Optional: load sample Egg Incubator
  const loadSampleTemplate = () => {
    setRoadmaps(INITIAL_ROADMAPS);
    setActiveRoadmapId('egg-incubator');
    confetti({ particleCount: 50 });
  };

  return (
    <RoadmapContext.Provider
      value={{
        roadmaps,
        activeRoadmapId,
        activeRoadmap,
        activeStageId,
        filterTab,
        searchQuery,
        canvasState,
        activeTool,
        isConnecting: !!connectingFromId,
        connectingFromId,
        wsConnected,
        setActiveRoadmapId,
        setActiveStageId,
        setFilterTab,
        setSearchQuery,
        setActiveTool,
        setPanZoom,
        zoomIn,
        zoomOut,
        resetZoom,
        fitToScreen,
        focusStage,
        createRoadmap,
        deleteRoadmap,
        addStage,
        updateStage,
        deleteStage,
        addTaskGroup,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        createConnection,
        deleteConnection,
        addTextNote,
        updateTextNote,
        deleteTextNote,
        autoLayout,
        startConnecting,
        cancelConnecting,
        completeConnecting,
        importRoadmapJSON,
        importRoadmapFile,
        loadSampleTemplate,
      }}
    >
      {children}
    </RoadmapContext.Provider>
  );
};

export const useRoadmap = () => {
  const context = useContext(RoadmapContext);
  if (!context) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  return context;
};
