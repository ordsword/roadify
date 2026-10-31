export type StageStatus = 'done' | 'in_progress' | 'planned' | 'paused';
export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'normal';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority?: PriorityLevel;
  badge?: string;
  notes?: string;
}

export interface TaskGroup {
  id: string;
  title: string;
  collapsed?: boolean;
  tasks: TaskItem[];
}

export interface StageNode {
  id: string;
  roadmapId: string;
  title: string;
  tag: string;
  description: string;
  status: StageStatus;
  deadline: string;
  priority: PriorityLevel;
  x: number;
  y: number;
  width?: number;
  collapsed?: boolean;
  taskGroups: TaskGroup[];
}

export interface ConnectionLink {
  id: string;
  fromStageId: string;
  toStageId: string;
  label?: string;
  color?: string;
  style?: 'curved' | 'bezier' | 'straight';
}

export interface CanvasState {
  panX: number;
  panY: number;
  zoom: number;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string;
  author: string;
  created: string;
  updated: string;
  stages: StageNode[];
  connections: ConnectionLink[];
  canvasState?: CanvasState;
}

export type CanvasTool = 'select' | 'hand' | 'node' | 'connect' | 'note' | 'text';
export type FilterTab = 'all' | 'active' | 'done';
