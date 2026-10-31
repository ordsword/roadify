import React, { useState, useRef } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Flag,
  Plus,
  Trash2,
  MoreHorizontal,
  FolderPlus,
  Link2,
} from 'lucide-react';
import { StageNode, PriorityLevel, StageStatus } from '../../types';
import { useRoadmap } from '../../context/RoadmapContext';

interface NodeCardProps {
  stage: StageNode;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
}

export const NodeCard: React.FC<NodeCardProps> = ({
  stage,
  isSelected,
  onSelect,
  onDragStart,
}) => {
  const {
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    addTaskGroup,
    updateStage,
    deleteStage,
    startConnecting,
    completeConnecting,
    isConnecting,
    connectingFromId,
  } = useRoadmap();

  const [collapsed, setCollapsed] = useState(stage.collapsed || false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [addingTaskGroupId, setAddingTaskGroupId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>('normal');
  const [showMenu, setShowMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(stage.title);

  // Compute progress
  const allTasks = stage.taskGroups.flatMap((g) => g.tasks);
  const totalCount = allTasks.length;
  const doneCount = allTasks.filter((t) => t.completed).length;
  const progressPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const isDone = stage.status === 'done' || (totalCount > 0 && doneCount === totalCount);
  const isInProgress = stage.status === 'in_progress';

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAddTask = (groupId: string) => {
    if (!newTaskTitle.trim()) return;
    addSubtask(stage.id, groupId, newTaskTitle.trim(), newTaskPriority);
    setNewTaskTitle('');
    setAddingTaskGroupId(null);
  };

  const handleStatusChange = (newStatus: StageStatus) => {
    updateStage(stage.id, { status: newStatus });
    setShowMenu(false);
  };

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateStage(stage.id, { title: titleInput.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div
      style={{
        transform: `translate(${stage.x}px, ${stage.y}px)`,
        width: `${stage.width || 520}px`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
        if (isConnecting && connectingFromId && connectingFromId !== stage.id) {
          completeConnecting(stage.id);
        }
      }}
      className={`absolute group rounded-xl border bg-[#131622]/95 backdrop-blur-md shadow-2xl transition-shadow select-none ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10'
          : 'border-[#232740] hover:border-[#343b60]'
      }`}
    >
      {/* Connection Anchor Handles */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          startConnecting(stage.id);
        }}
        title="Протянуть связь к другому этапу"
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#1e233d] border-2 border-indigo-400 opacity-0 group-hover:opacity-100 cursor-crosshair hover:scale-125 transition-all z-20 flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          startConnecting(stage.id);
        }}
        title="Протянуть связь к другому этапу"
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#1e233d] border-2 border-indigo-400 opacity-0 group-hover:opacity-100 cursor-crosshair hover:scale-125 transition-all z-20 flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          startConnecting(stage.id);
        }}
        title="Протянуть связь к другому этапу"
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#1e233d] border-2 border-indigo-400 opacity-0 group-hover:opacity-100 cursor-crosshair hover:scale-125 transition-all z-20 flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          startConnecting(stage.id);
        }}
        title="Протянуть связь к другому этапу"
        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#1e233d] border-2 border-indigo-400 opacity-0 group-hover:opacity-100 cursor-crosshair hover:scale-125 transition-all z-20 flex items-center justify-center"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
      </div>

      {/* Card Header (Drag handle) */}
      <div
        onMouseDown={onDragStart}
        className="p-3.5 pb-2.5 cursor-grab active:cursor-grabbing border-b border-[#1f243c] flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          {/* Category Tag Badge */}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#1c2138] text-indigo-300 border border-[#2b3356]">
            {stage.tag}
          </span>

          {/* Status Pill matching screenshots */}
          {isDone ? (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span>Готово</span>
            </span>
          ) : isInProgress ? (
            <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>В работе</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/40">
              <span>Запланировано</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Collapse/Expand Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1a1f33] rounded transition-colors"
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* More options menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-[#1a1f33] rounded transition-colors"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-6 w-48 py-1 bg-[#101322] border border-[#232740] rounded-lg shadow-2xl z-30 text-xs text-slate-300 space-y-0.5"
              >
                <button
                  onClick={() => handleStatusChange('done')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b2038] text-emerald-400 flex items-center space-x-2"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Пометить готовым</span>
                </button>
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b2038] text-indigo-300 flex items-center space-x-2"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>В работе</span>
                </button>
                <button
                  onClick={() => handleStatusChange('planned')}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b2038] text-slate-400 flex items-center space-x-2"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Запланировано</span>
                </button>
                <div className="border-t border-[#1f243c] my-1"></div>
                <button
                  onClick={() => {
                    const groupTitle = prompt('Название новой группы подзадач:');
                    if (groupTitle) addTaskGroup(stage.id, groupTitle);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-[#1b2038] text-slate-200 flex items-center space-x-2"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Добавить группу</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Удалить этап "${stage.title}"?`)) {
                      deleteStage(stage.id);
                    }
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-950/40 text-rose-400 flex items-center space-x-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить этап</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Title */}
        {isEditingTitle ? (
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
            autoFocus
            className="w-full bg-[#181d33] text-sm font-bold text-white px-2 py-1 rounded border border-indigo-500 focus:outline-none"
          />
        ) : (
          <h3
            onDoubleClick={() => setIsEditingTitle(true)}
            title="Двойной клик для редактирования"
            className="text-[15px] font-bold text-slate-100 hover:text-indigo-200 cursor-text transition-colors leading-tight"
          >
            {stage.title}
          </h3>
        )}

        {/* Description / Scope notes */}
        {stage.description && (
          <p className="text-xs text-slate-400 leading-relaxed font-sans font-normal border-l-2 border-[#2b3356] pl-2.5 py-0.5">
            {stage.description}
          </p>
        )}

        {/* Progress Bar matching screenshots */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[11px] font-mono font-medium text-slate-400">
              {doneCount} из {totalCount}
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-300">
              {progressPercent}%
            </span>
          </div>

          <div className="h-2 w-full bg-[#1a1f33] rounded-full overflow-hidden p-0.5 border border-[#232740]">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDone
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Nested Checklist Tree (if not collapsed) */}
        {!collapsed && (
          <div className="pt-2 space-y-3">
            {stage.taskGroups.map((group) => {
              const grpTotal = group.tasks.length;
              const grpDone = group.tasks.filter((t) => t.completed).length;
              const isGroupCollapsed = collapsedGroups[group.id] || false;

              return (
                <div key={group.id} className="space-y-1">
                  {/* Group Header */}
                  <div
                    onClick={() => toggleGroupCollapse(group.id)}
                    className="flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white cursor-pointer py-0.5"
                  >
                    <div className="flex items-center space-x-1.5 truncate">
                      <ChevronDown
                        className={`w-3 h-3 text-slate-500 transition-transform ${
                          isGroupCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                      <span className="truncate">{group.title}</span>
                    </div>

                    <span className="font-mono text-[11px] text-slate-500 shrink-0">
                      {grpDone}/{grpTotal}
                    </span>
                  </div>

                  {/* Tasks inside group */}
                  {!isGroupCollapsed && (
                    <div className="pl-3.5 space-y-1">
                      {group.tasks.map((task) => (
                        <div
                          key={task.id}
                          className="group/task flex items-start justify-between py-1 text-xs text-slate-300 hover:text-white transition-colors"
                        >
                          <div
                            onClick={() => toggleSubtask(stage.id, task.id)}
                            className="flex items-start space-x-2 cursor-pointer flex-1 pr-2"
                          >
                            <button
                              type="button"
                              className={`mt-0.5 w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                task.completed
                                  ? 'bg-emerald-500 border border-emerald-400 text-slate-900'
                                  : 'border border-slate-600 hover:border-slate-400 bg-[#121524]'
                              }`}
                            >
                              {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </button>

                            {task.priority === 'critical' && (
                              <span className="text-amber-400 font-bold shrink-0">!</span>
                            )}

                            <span
                              className={`leading-snug ${
                                task.completed
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-300'
                              }`}
                            >
                              {task.title}
                            </span>
                          </div>

                          <button
                            onClick={() => deleteSubtask(stage.id, task.id)}
                            className="opacity-0 group-hover/task:opacity-100 p-0.5 hover:text-rose-400 transition-opacity"
                            title="Удалить задачу"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Add task inline input */}
                      {addingTaskGroupId === group.id ? (
                        <div className="flex items-center space-x-1.5 pt-1">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTask(group.id);
                              if (e.key === 'Escape') setAddingTaskGroupId(null);
                            }}
                            placeholder="Новая подзадача..."
                            autoFocus
                            className="flex-1 bg-[#181d33] text-xs text-white px-2 py-1 rounded border border-[#2b3356] focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleAddTask(group.id)}
                            className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setAddingTaskGroupId(group.id);
                            setNewTaskTitle('');
                          }}
                          className="flex items-center space-x-1 text-[11px] text-slate-500 hover:text-indigo-300 transition-colors pt-0.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Добавить подзадачу</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Card Footer matching screenshots */}
      <div className="px-4 py-2.5 bg-[#0f111c] rounded-b-xl border-t border-[#1f243c] flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-[11px] font-mono">{stage.deadline || 'Без срока'}</span>
        </div>

        <div className="flex items-center space-x-1.5 text-amber-400">
          <Flag className="w-3 h-3" />
          <span className="text-[11px] font-medium">
            {stage.priority === 'critical'
              ? 'Критический'
              : stage.priority === 'high'
              ? 'Высокий приоритет'
              : stage.priority === 'medium'
              ? 'Средний'
              : 'Низкий'}
          </span>
        </div>
      </div>
    </div>
  );
};
