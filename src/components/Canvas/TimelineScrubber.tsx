import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

export const TimelineScrubber: React.FC = () => {
  const { activeRoadmap, activeStageId, focusStage } = useRoadmap();

  const stages = activeRoadmap?.stages || [];
  if (stages.length === 0) return null;

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center select-none pointer-events-auto">
      <div className="flex items-center space-x-1 px-3 py-1.5 bg-[#101322]/90 backdrop-blur-md rounded-xl border border-[#232740] shadow-2xl">
        <div className="flex items-center space-x-1.5 pr-2.5 border-r border-[#1e233d] text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] font-medium text-slate-300">Спринт</span>
        </div>

        {/* Milestone Tick Segments */}
        <div className="flex items-center space-x-1 px-1">
          {stages.map((stage, idx) => {
            const isActive = stage.id === activeStageId;
            const isDone = stage.status === 'done';
            const isInProgress = stage.status === 'in_progress';

            return (
              <button
                key={stage.id}
                onClick={() => focusStage(stage.id)}
                title={`${stage.tag}: ${stage.title} (${stage.deadline})`}
                className={`group relative flex items-center h-5 px-2 rounded text-[11px] font-mono transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-bold ring-1 ring-indigo-400'
                    : isDone
                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60'
                    : isInProgress
                    ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/60'
                    : 'bg-[#181d33] text-slate-400 hover:text-slate-200 border border-[#232740]'
                }`}
              >
                <span>{stage.tag.replace('ВЕХА ', '')}</span>

                {isDone && (
                  <CheckCircle2 className="w-2.5 h-2.5 ml-1 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
