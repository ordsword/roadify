import React from 'react';
import {
  MousePointer,
  Hand,
  Square,
  Diamond,
  Circle,
  MoveRight,
  PenTool,
  Type,
  Image,
  StickyNote,
  LayoutGrid,
  Plus,
} from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { CanvasTool } from '../../types';

interface ToolbarProps {
  onAddStageClick: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAddStageClick }) => {
  const { activeTool, setActiveTool, autoLayout } = useRoadmap();

  const tools: { id: CanvasTool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select', icon: <MousePointer className="w-4 h-4" />, label: 'Выбор', shortcut: 'V' },
    { id: 'hand', icon: <Hand className="w-4 h-4" />, label: 'Рука / Панорама', shortcut: 'H' },
    { id: 'node', icon: <Square className="w-4 h-4" />, label: 'Новый этап', shortcut: 'N' },
    { id: 'connect', icon: <MoveRight className="w-4 h-4" />, label: 'Связь / Стрелка', shortcut: 'C' },
    { id: 'text', icon: <Type className="w-4 h-4" />, label: 'Текст', shortcut: 'T' },
    { id: 'note', icon: <StickyNote className="w-4 h-4" />, label: 'Заметка', shortcut: 'S' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center p-1 bg-[#131624]/90 backdrop-blur-md rounded-xl border border-[#232740] shadow-2xl space-x-1 select-none">
      {tools.map((t) => {
        const isActive = activeTool === t.id;
        return (
          <button
            key={t.id}
            onClick={() => {
              if (t.id === 'node') {
                onAddStageClick();
              } else {
                setActiveTool(t.id);
              }
            }}
            title={`${t.label} (${t.shortcut})`}
            className={`p-2 rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
              isActive
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e233d]'
            }`}
          >
            {t.icon}
          </button>
        );
      })}

      <div className="w-[1px] h-5 bg-[#232740] my-auto mx-1" />

      {/* Auto-layout helper */}
      <button
        onClick={() => autoLayout('horizontal')}
        title="Авто-выравнивание спринта по колонкам"
        className="p-2 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-[#1e233d] transition-all flex items-center space-x-1"
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="text-[11px] hidden sm:inline">Сетка</span>
      </button>

      {/* Quick Add Stage Button */}
      <button
        onClick={onAddStageClick}
        title="Добавить новый этап в спринт"
        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all flex items-center space-x-1 ml-1"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="text-[11px]">Этап</span>
      </button>
    </div>
  );
};
