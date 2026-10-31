import React from 'react';
import { ChevronRight, Download, Bot, Layers, Sparkles } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenMCPModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport, onOpenMCPModal }) => {
  const { activeRoadmap, activeStageId, wsConnected } = useRoadmap();

  const stages = activeRoadmap?.stages || [];
  const currentStageIndex = stages.findIndex((s) => s.id === activeStageId);
  const stageInfoText =
    currentStageIndex !== -1
      ? `${currentStageIndex + 1} из ${stages.length} этапов`
      : `${stages.length} этапов`;

  return (
    <header className="h-12 bg-[#0d0f1b]/95 backdrop-blur-md border-b border-[#232740] flex items-center justify-between px-4 z-30 select-none">
      {/* Breadcrumbs matching screenshots */}
      <div className="flex items-center space-x-2 text-xs md:text-sm text-slate-400">
        <div className="flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Дорожные карты</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />

        <span className="font-medium text-slate-200 hover:text-white cursor-pointer transition-colors">
          {activeRoadmap?.title || 'Egg Incubator'}
        </span>

        <span className="text-slate-500 font-mono text-xs pl-2">
          {stageInfoText}
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-3">
        {/* MCP Status Pill */}
        <button
          onClick={onOpenMCPModal}
          className="flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[#161b2e] hover:bg-[#1d243d] border border-[#2d3454] text-slate-300 transition-all cursor-pointer group shadow-sm"
          title="Открыть панель подключения MCP для ИИ агентов"
        >
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${wsConnected ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${wsConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <Bot className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
          <span className="font-mono text-[11px] text-slate-300">
            {wsConnected ? 'MCP Online' : 'MCP Standby'}
          </span>
          <Sparkles className="w-3 h-3 text-amber-400 ml-0.5" />
        </button>

        {/* Export Button matching screenshot */}
        <button
          onClick={onOpenExport}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1f33] hover:bg-[#232945] border border-[#2d3454] text-slate-200 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Экспорт</span>
        </button>
      </div>
    </header>
  );
};
