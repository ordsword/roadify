import React, { useState } from 'react';
import {
  Search,
  Plus,
  Map,
  ChevronDown,
  CheckCircle2,
  Circle,
  Clock,
  Flag,
  Settings,
  MoreVertical,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { FilterTab, StageNode } from '../../types';

interface SidebarProps {
  onOpenNewRoadmap: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenNewRoadmap, onOpenSettings }) => {
  const {
    roadmaps,
    activeRoadmapId,
    activeRoadmap,
    activeStageId,
    filterTab,
    searchQuery,
    setActiveRoadmapId,
    setFilterTab,
    setSearchQuery,
    focusStage,
    deleteRoadmap,
  } = useRoadmap();

  const [stagesOpen, setStagesOpen] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter stages based on tab and search
  const stages = activeRoadmap?.stages || [];

  const filteredStages = stages.filter((stage) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = stage.title.toLowerCase().includes(q);
      const inTag = stage.tag.toLowerCase().includes(q);
      const inTasks = stage.taskGroups.some((g) =>
        g.tasks.some((t) => t.title.toLowerCase().includes(q))
      );
      if (!inTitle && !inTag && !inTasks) return false;
    }

    // Tab filter
    if (filterTab === 'active') return stage.status === 'in_progress';
    if (filterTab === 'done') return stage.status === 'done';
    return true; // 'all'
  });

  const getStageCounts = (stage: StageNode) => {
    const total = stage.taskGroups.reduce((acc, g) => acc + g.tasks.length, 0);
    const done = stage.taskGroups.reduce(
      (acc, g) => acc + g.tasks.filter((t) => t.completed).length,
      0
    );
    return { done, total };
  };

  return (
    <aside className="w-72 h-[calc(100vh-3rem)] bg-[#0d0f1b] border-r border-[#232740] flex flex-col select-none text-slate-300 z-20">
      {/* Search Input */}
      <div className="p-3 border-b border-[#1c2035]">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по картам и этапам"
            className="w-full bg-[#141728] text-xs text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2 rounded-lg border border-[#232740] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {/* Roadmaps Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Дорожные карты
            </span>
            <button
              onClick={onOpenNewRoadmap}
              className="p-1 text-slate-400 hover:text-white hover:bg-[#1a1f35] rounded transition-colors"
              title="Создать новую дорожную карту"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {roadmaps.map((rm) => {
              const isActive = rm.id === activeRoadmapId;
              return (
                <div
                  key={rm.id}
                  onClick={() => setActiveRoadmapId(rm.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#1e233d] text-indigo-300 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-[#141728] hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Map className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="truncate">{rm.title}</span>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {roadmaps.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Удалить карту "${rm.title}"?`)) {
                            deleteRoadmap(rm.id);
                          }
                        }}
                        className="p-1 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Stages Section */}
        <div>
          <div
            onClick={() => setStagesOpen(!stagesOpen)}
            className="flex items-center justify-between px-2 mb-2 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              Этапы карты
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                stagesOpen ? 'rotate-0' : '-rotate-90'
              }`}
            />
          </div>

          {stagesOpen && (
            <div className="space-y-2.5">
              {/* Filter Tabs */}
              <div className="flex p-0.5 bg-[#121524] rounded-lg border border-[#1e233d]">
                {(['all', 'active', 'done'] as FilterTab[]).map((tab) => {
                  const label = tab === 'all' ? 'Все' : tab === 'active' ? 'Активные' : 'Готовые';
                  const isSelected = filterTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${
                        isSelected
                          ? 'bg-[#232947] text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Stages List */}
              <div className="space-y-1">
                {filteredStages.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    Нет этапов в этой категории
                  </div>
                ) : (
                  filteredStages.map((stage) => {
                    const { done, total } = getStageCounts(stage);
                    const isSelected = stage.id === activeStageId;
                    const isDone = stage.status === 'done';
                    const isInProgress = stage.status === 'in_progress';

                    return (
                      <div
                        key={stage.id}
                        onClick={() => focusStage(stage.id)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#1c223c] text-white'
                            : 'text-slate-300 hover:bg-[#141829] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate pr-2">
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : isInProgress ? (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 flex items-center justify-center shrink-0">
                              <span className="w-1.5 h-0.5 bg-indigo-400 rounded"></span>
                            </span>
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}

                          <span className="truncate">{stage.title}</span>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          {stage.priority === 'high' || stage.priority === 'critical' ? (
                            <Flag className="w-3 h-3 text-amber-400" />
                          ) : null}

                          <span className="font-mono text-[10px] text-slate-400 group-hover:text-slate-300">
                            {done}/{total}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Widget matching bottom left of screenshot */}
      <div className="p-3 border-t border-[#1c2035] bg-[#0b0c16] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            В
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Валера</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {roadmaps.length} карты
            </div>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-[#1a1f33] rounded-lg transition-colors"
          title="Настройки Roadify"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
