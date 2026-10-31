import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Roadmap, StageNode, ConnectionLink, CanvasTool, FilterTab, PriorityLevel } from '../types';
import { INITIAL_ROADMAPS } from '../presets/initialData';

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
  autoLayout: (direction?: 'horizontal' | 'vertical') => Promise<void>;
  startConnecting: (fromStageId: string) => void;
  cancelConnecting: () => void;
  completeConnecting: (toStageId: string) => void;
  importRoadmapJSON: (jsonString: string) => boolean;
}

const RoadmapContext = createContext<RoadmapContextType | undefined>(undefined);

export const RoadmapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(() => {
    const saved = localStorage.getItem('roadify_roadmaps');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ROADMAPS;
  });

  const [activeRoadmapId, setActiveRoadmapId] = useState<string>('egg-incubator');
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

  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId) || roadmaps[0];

  // Persist locally
  useEffect(() => {
    localStorage.setItem('roadify_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  // Initial fetch from backend if available
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
      // Offline fallback: keep local data
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

      socket.onopen = () => {
        setWsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.event) {
            // Refresh state from server
            fetchFromServer();
          }
        } catch (err) {}
      };

      socket.onclose = () => {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWS, 2500);
      };

      socket.onerror = () => {
        socket.close();
      };
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

    const targetPanX = 320 + (viewportW / 2) - (stage.x + cardWidth / 2) * canvasState.zoom;
    const targetPanY = 80 + (viewportH / 2) - (stage.y + cardHeight / 2) * canvasState.zoom;

    setCanvasState((prev) => ({
      ...prev,
      panX: targetPanX,
      panY: targetPanY,
    }));
  }, [activeRoadmap, canvasState.zoom]);

  // Mutations
  const createRoadmap = async (title: string, description: string = '') => {
    try {
      const res = await fetch('/api/roadmaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, author: 'Валера' }),
      });
      if (res.ok) {
        const rm = await res.json();
        setRoadmaps((prev) => [...prev, rm]);
        setActiveRoadmapId(rm.id);
        return rm;
      }
    } catch (e) {}

    // Fallback local
    const newRm: Roadmap = {
      id: `rm-${Date.now()}`,
      title,
      description,
      author: 'Валера',
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      canvasState: { panX: 100, panY: 100, zoom: 1.0 },
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
    } catch (e) {}
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
    if (!activeRoadmap) return null;
    try {
      const res = await fetch(`/api/roadmaps/${activeRoadmap.id}/stages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stageData),
      });
      if (res.ok) {
        const stage = await res.json();
        fetchFromServer();
        return stage;
      }
    } catch (e) {}

    // Local fallback
    const newStage: StageNode = {
      id: stageData.id || `stage-${Date.now()}`,
      roadmapId: activeRoadmap.id,
      title: stageData.title || 'Новый этап',
      tag: stageData.tag || 'ЭТАП',
      description: stageData.description || '',
      status: stageData.status || 'planned',
      deadline: stageData.deadline || 'Без срока',
      priority: stageData.priority || 'medium',
      x: stageData.x ?? 400,
      y: stageData.y ?? 200,
      width: stageData.width || 480,
      collapsed: false,
      taskGroups: stageData.taskGroups || [
        { id: `grp-${Date.now()}`, title: 'Подзадачи', tasks: [] },
      ],
    };

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? { ...r, stages: [...r.stages, newStage], updated: new Date().toISOString() }
          : r
      )
    );
    return newStage;
  };

  const updateStage = async (stageId: string, updates: Partial<StageNode>) => {
    try {
      await fetch(`/api/stages/${stageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (e) {}

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
    } catch (e) {}

    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        stages: r.stages.filter((s) => s.id !== stageId),
        connections: r.connections.filter((c) => c.fromStageId !== stageId && c.toStageId !== stageId),
      }))
    );
  };

  const addTaskGroup = async (stageId: string, title: string) => {
    try {
      await fetch(`/api/stages/${stageId}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      fetchFromServer();
    } catch (e) {}
  };

  const addSubtask = async (
    stageId: string,
    groupId: string | null,
    title: string,
    priority: PriorityLevel = 'normal'
  ) => {
    try {
      await fetch(`/api/stages/${stageId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, title, priority }),
      });
      fetchFromServer();
    } catch (e) {}
  };

  const toggleSubtask = async (stageId: string, taskId: string) => {
    try {
      await fetch(`/api/stages/${stageId}/tasks/${taskId}/toggle`, {
        method: 'POST',
      });
    } catch (e) {}

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
    } catch (e) {}

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
    try {
      const res = await fetch(`/api/roadmaps/${activeRoadmap.id}/connections`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromStageId: fromId, toStageId: toId, label }),
      });
      if (res.ok) {
        fetchFromServer();
        return;
      }
    } catch (e) {}

    const newConn: ConnectionLink = {
      id: `link-${Date.now()}`,
      fromStageId: fromId,
      toStageId: toId,
      label: label || '',
      color: '#6366f1',
      style: 'curved',
    };

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id ? { ...r, connections: [...r.connections, newConn] } : r
      )
    );
  };

  const deleteConnection = async (connId: string) => {
    if (!activeRoadmap) return;
    try {
      await fetch(`/api/roadmaps/${activeRoadmap.id}/connections/${connId}`, {
        method: 'DELETE',
      });
    } catch (e) {}

    setRoadmaps((prev) =>
      prev.map((r) =>
        r.id === activeRoadmap.id
          ? { ...r, connections: r.connections.filter((c) => c.id !== connId) }
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
    } catch (e) {}
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

  const importRoadmapJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.id && parsed.title && Array.isArray(parsed.stages)) {
        setRoadmaps((prev) => {
          const filtered = prev.filter((r) => r.id !== parsed.id);
          return [...filtered, parsed];
        });
        setActiveRoadmapId(parsed.id);
        return true;
      }
    } catch (e) {}
    return false;
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
        autoLayout,
        startConnecting,
        cancelConnecting,
        completeConnecting,
        importRoadmapJSON,
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
