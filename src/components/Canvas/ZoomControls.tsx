import React from 'react';
import { Plus, Minus, Maximize2, RotateCcw } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

export const ZoomControls: React.FC = () => {
  const { canvasState, zoomIn, zoomOut, resetZoom, fitToScreen } = useRoadmap();
  const zoomPercent = Math.round(canvasState.zoom * 100);

  return (
    <div className="absolute bottom-4 left-4 z-20 flex items-center p-1 bg-[#101322]/90 backdrop-blur-md rounded-xl border border-[#232740] shadow-2xl space-x-1 select-none">
      {/* Zoom percentage display */}
      <button
        onClick={resetZoom}
        title="Сбросить масштаб к 100%"
        className="px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-[#1a1f35] transition-colors"
      >
        {zoomPercent}%
      </button>

      <div className="w-[1px] h-4 bg-[#1f243c]" />

      {/* Zoom In */}
      <button
        onClick={zoomIn}
        title="Приблизить (+)"
        className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a1f35] rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={zoomOut}
        title="Отдалить (-)"
        className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a1f35] rounded-lg transition-colors"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-[#1f243c]" />

      {/* Fit to View */}
      <button
        onClick={fitToScreen}
        title="Вписать всю карту в экран"
        className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a1f35] rounded-lg transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
      </button>

      {/* Reset view */}
      <button
        onClick={resetZoom}
        title="Вернуть в исходное положение"
        className="p-1.5 text-slate-400 hover:text-white hover:bg-[#1a1f35] rounded-lg transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
