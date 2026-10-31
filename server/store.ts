import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Roadmap, StageNode, TaskGroup, TaskItem, ConnectionLink } from '../src/types';
import { INITIAL_ROADMAPS } from '../src/presets/initialData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'roadmaps.json');

// Real-time subscribers
type BroadcastCallback = (event: string, data: any) => void;
const subscribers: Set<BroadcastCallback> = new Set();

export function subscribeToStore(cb: BroadcastCallback): () => void {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function broadcast(event: string, data: any) {
  for (const cb of subscribers) {
    try {
      cb(event, data);
    } catch (e) {
      console.error('Error notifying store subscriber:', e);
    }
  }
}

class Store {
  private roadmaps: Roadmap[] = [];

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        this.roadmaps = JSON.parse(content);
      } else {
        this.roadmaps = JSON.parse(JSON.stringify(INITIAL_ROADMAPS));
        this.save();
      }
    } catch (err) {
      console.warn('Failed to load roadmaps from disk, falling back to defaults:', err);
      this.roadmaps = JSON.parse(JSON.stringify(INITIAL_ROADMAPS));
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.roadmaps, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save roadmaps to disk:', err);
    }
  }

  public getAllRoadmaps(): Roadmap[] {
    return this.roadmaps;
  }

  public getRoadmapById(id: string): Roadmap | undefined {
    return this.roadmaps.find(r => r.id === id);
  }

  public createRoadmap(title: string, description: string = '', author: string = 'User'): Roadmap {
    const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `rm-${Date.now()}`;
    const newRoadmap: Roadmap = {
      id: id + '-' + Math.floor(Math.random() * 1000),
      title,
      description,
      author,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      canvasState: { panX: 100, panY: 100, zoom: 1.0 },
      stages: [],
      connections: []
    };
    this.roadmaps.push(newRoadmap);
    this.save();
    broadcast('roadmap_created', newRoadmap);
    return newRoadmap;
  }

  public updateRoadmap(id: string, updates: Partial<Roadmap>): Roadmap | null {
    const rm = this.getRoadmapById(id);
    if (!rm) return null;
    Object.assign(rm, updates, { updated: new Date().toISOString() });
    this.save();
    broadcast('roadmap_updated', rm);
    return rm;
  }

  public deleteRoadmap(id: string): boolean {
    const index = this.roadmaps.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.roadmaps.splice(index, 1);
    this.save();
    broadcast('roadmap_deleted', { id });
    return true;
  }

  public addStage(roadmapId: string, stageData: Partial<StageNode>): StageNode | null {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return null;

    const newStage: StageNode = {
      id: stageData.id || `stage-${Date.now()}`,
      roadmapId,
      title: stageData.title || 'Новый этап',
      tag: stageData.tag || 'ЭТАП',
      description: stageData.description || '',
      status: stageData.status || 'planned',
      deadline: stageData.deadline || 'Без срока',
      priority: stageData.priority || 'medium',
      x: stageData.x ?? 300,
      y: stageData.y ?? 200,
      width: stageData.width || 480,
      collapsed: false,
      taskGroups: stageData.taskGroups || [
        {
          id: `grp-${Date.now()}`,
          title: 'Подзадачи',
          collapsed: false,
          tasks: []
        }
      ]
    };

    rm.stages.push(newStage);
    rm.updated = new Date().toISOString();
    this.save();
    broadcast('stage_added', { roadmapId, stage: newStage });
    return newStage;
  }

  public updateStage(stageId: string, updates: Partial<StageNode>): StageNode | null {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find(s => s.id === stageId);
      if (stage) {
        Object.assign(stage, updates);
        rm.updated = new Date().toISOString();
        this.save();
        broadcast('stage_updated', { roadmapId: rm.id, stage });
        return stage;
      }
    }
    return null;
  }

  public deleteStage(stageId: string): boolean {
    for (const rm of this.roadmaps) {
      const idx = rm.stages.findIndex(s => s.id === stageId);
      if (idx !== -1) {
        rm.stages.splice(idx, 1);
        // Clean up connections
        rm.connections = rm.connections.filter(c => c.fromStageId !== stageId && c.toStageId !== stageId);
        rm.updated = new Date().toISOString();
        this.save();
        broadcast('stage_deleted', { roadmapId: rm.id, stageId });
        return true;
      }
    }
    return false;
  }

  public addTaskGroup(stageId: string, title: string): TaskGroup | null {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find(s => s.id === stageId);
      if (stage) {
        const group: TaskGroup = {
          id: `grp-${Date.now()}`,
          title,
          collapsed: false,
          tasks: []
        };
        stage.taskGroups.push(group);
        rm.updated = new Date().toISOString();
        this.save();
        broadcast('stage_updated', { roadmapId: rm.id, stage });
        return group;
      }
    }
    return null;
  }

  public addSubtask(stageId: string, groupId: string | null, taskData: Partial<TaskItem>): TaskItem | null {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find(s => s.id === stageId);
      if (stage) {
        let group = stage.taskGroups.find(g => g.id === groupId);
        if (!group) {
          if (stage.taskGroups.length === 0) {
            stage.taskGroups.push({ id: `grp-${Date.now()}`, title: 'Подзадачи', tasks: [] });
          }
          group = stage.taskGroups[0];
        }

        const task: TaskItem = {
          id: taskData.id || `task-${Date.now()}`,
          title: taskData.title || 'Новая задача',
          completed: !!taskData.completed,
          priority: taskData.priority || 'normal',
          badge: taskData.badge
        };

        group.tasks.push(task);
        rm.updated = new Date().toISOString();
        this.save();
        broadcast('stage_updated', { roadmapId: rm.id, stage });
        return task;
      }
    }
    return null;
  }

  public toggleSubtask(stageId: string, taskId: string): boolean {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find(s => s.id === stageId);
      if (stage) {
        for (const grp of stage.taskGroups) {
          const t = grp.tasks.find(x => x.id === taskId);
          if (t) {
            t.completed = !t.completed;
            
            // Check if all tasks in stage are completed
            const allTasks = stage.taskGroups.flatMap(g => g.tasks);
            if (allTasks.length > 0 && allTasks.every(task => task.completed)) {
              stage.status = 'done';
            } else if (allTasks.some(task => task.completed) && stage.status === 'planned') {
              stage.status = 'in_progress';
            }

            rm.updated = new Date().toISOString();
            this.save();
            broadcast('stage_updated', { roadmapId: rm.id, stage });
            return true;
          }
        }
      }
    }
    return false;
  }

  public updateSubtask(stageId: string, taskId: string, updates: Partial<TaskItem>): TaskItem | null {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find(s => s.id === stageId);
      if (stage) {
        for (const grp of stage.taskGroups) {
          const t = grp.tasks.find(x => x.id === taskId);
          if (t) {
            Object.assign(t, updates);
            rm.updated = new Date().toISOString();
            this.save();
            broadcast('stage_updated', { roadmapId: rm.id, stage });
            return t;
          }
        }
      }
    }
    return null;
  }

  public deleteSubtask(stageId: string, taskId: string): boolean {
    for (const rm of this.roadmaps) {
      const stage = rm.stages.find(s => s.id === stageId);
      if (stage) {
        for (const grp of stage.taskGroups) {
          const idx = grp.tasks.findIndex(x => x.id === taskId);
          if (idx !== -1) {
            grp.tasks.splice(idx, 1);
            rm.updated = new Date().toISOString();
            this.save();
            broadcast('stage_updated', { roadmapId: rm.id, stage });
            return true;
          }
        }
      }
    }
    return false;
  }

  public addConnection(roadmapId: string, connectionData: Partial<ConnectionLink>): ConnectionLink | null {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return null;

    if (!connectionData.fromStageId || !connectionData.toStageId) return null;

    // Check if connection already exists
    const exists = rm.connections.some(c => 
      c.fromStageId === connectionData.fromStageId && c.toStageId === connectionData.toStageId
    );
    if (exists) return null;

    const newConn: ConnectionLink = {
      id: connectionData.id || `link-${Date.now()}`,
      fromStageId: connectionData.fromStageId,
      toStageId: connectionData.toStageId,
      label: connectionData.label || '',
      color: connectionData.color || '#6366f1',
      style: connectionData.style || 'curved'
    };

    rm.connections.push(newConn);
    rm.updated = new Date().toISOString();
    this.save();
    broadcast('connection_added', { roadmapId, connection: newConn });
    return newConn;
  }

  public deleteConnection(roadmapId: string, connectionId: string): boolean {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return false;

    const idx = rm.connections.findIndex(c => c.id === connectionId);
    if (idx === -1) return false;

    rm.connections.splice(idx, 1);
    rm.updated = new Date().toISOString();
    this.save();
    broadcast('connection_deleted', { roadmapId, connectionId });
    return true;
  }

  public autoLayout(roadmapId: string, direction: 'horizontal' | 'vertical' = 'horizontal'): boolean {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return false;

    const stages = rm.stages;
    if (stages.length === 0) return true;

    if (direction === 'horizontal') {
      const SPACING_X = 580;
      const SPACING_Y = 580;
      let col = 0;
      let row = 0;
      const MAX_COLS = 4;

      stages.forEach((stage, idx) => {
        stage.x = 80 + (idx % MAX_COLS) * SPACING_X;
        stage.y = 80 + Math.floor(idx / MAX_COLS) * SPACING_Y;
      });
    } else {
      const SPACING_Y = 480;
      stages.forEach((stage, idx) => {
        stage.x = 100;
        stage.y = 80 + idx * SPACING_Y;
      });
    }

    rm.updated = new Date().toISOString();
    this.save();
    broadcast('roadmap_updated', rm);
    return true;
  }

  public exportMarkdown(roadmapId: string): string {
    const rm = this.getRoadmapById(roadmapId);
    if (!rm) return '# Дорожная карта не найдена';

    let md = `# 🗺️ Дорожная карта: ${rm.title}\n\n`;
    if (rm.description) md += `> ${rm.description}\n\n`;
    md += `**Автор:** ${rm.author} | **Обновлено:** ${new Date(rm.updated).toLocaleString()}\n\n`;
    md += `---\n\n`;

    const totalTasks = rm.stages.reduce((acc, s) => acc + s.taskGroups.reduce((a, g) => a + g.tasks.length, 0), 0);
    const completedTasks = rm.stages.reduce((acc, s) => acc + s.taskGroups.reduce((a, g) => a + g.tasks.filter(t => t.completed).length, 0), 0);
    const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    md += `### 📊 Общий прогресс: ${completedTasks} / ${totalTasks} задач (${pct}%)\n\n`;

    for (const stage of rm.stages) {
      const stageTasks = stage.taskGroups.flatMap(g => g.tasks);
      const stageDone = stageTasks.filter(t => t.completed).length;
      const statusEmoji = stage.status === 'done' ? '✅' : stage.status === 'in_progress' ? '🔄' : '⏳';
      
      md += `## ${statusEmoji} [${stage.tag}] ${stage.title}\n`;
      md += `* **Статус:** ${stage.status} | **Срок:** ${stage.deadline} | **Приоритет:** ${stage.priority}\n`;
      md += `* **Прогресс:** ${stageDone} из ${stageTasks.length}\n`;
      if (stage.description) md += `* **Описание:** ${stage.description}\n`;
      md += `\n`;

      for (const group of stage.taskGroups) {
        if (group.title) md += `### 📁 ${group.title}\n`;
        for (const task of group.tasks) {
          const check = task.completed ? '[x]' : '[ ]';
          const p = task.priority === 'critical' ? ' 🔥' : task.priority === 'high' ? ' ⚡' : '';
          md += `- ${check} ${task.title}${p}\n`;
        }
        md += `\n`;
      }
      md += `---\n\n`;
    }

    if (rm.connections.length > 0) {
      md += `### 🔗 Зависимости и связи\n`;
      for (const conn of rm.connections) {
        const from = rm.stages.find(s => s.id === conn.fromStageId)?.title || conn.fromStageId;
        const to = rm.stages.find(s => s.id === conn.toStageId)?.title || conn.toStageId;
        md += `- **${from}** ➔ **${to}** ${conn.label ? `_(${conn.label})_` : ''}\n`;
      }
      md += `\n`;
    }

    return md;
  }
}

export const store = new Store();
