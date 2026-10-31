import React, { useRef } from 'react';
import { Eye, Compass } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';

export const Minimap: React.FC = () => {
  const { activeRoadmap, canvasState, setPanZoom } = useRoadmap();
  const containerRef = useRef<HTMLDivElement>(null);

  const stages = activeRoadmap?.stages || [];
  if (stages.length === 0) return null;

  // Compute world bounding box
  const minX = Math.min(0, ...stages.map((s) => s.x));
  const maxX = Math.max(2800, ...stages.map((s) => s.x + (s.width || 500)));
  const minY = Math.min(0, ...stages.map((s) => s.y));
  const maxY = Math.max(1400, ...stages.map((s) => s.y + 500));

  const worldWidth = maxX - minX + 400;
  const worldHeight = maxY - minY + 400;

  const mapWidth = 160;
  const mapHeight = 90;

  const scaleX = mapWidth / worldWidth;
  const scaleY = mapHeight / worldHeight;
  const scale = Math.min(scaleX, scaleY);

  // Viewport calculation
  const viewportW = window.innerWidth - 320;
  const viewportH = window.innerHeight - 80;

  const vpWorldX = -canvasState.panX / canvasState.zoom;
  const vpWorldY = -canvasState.panY / canvasState.zoom;
  const vpWorldW = viewportW / canvasState.zoom;
  const vpWorldH = viewportH / canvasState.zoom;

  const vpMapX = Math.max(0, (vpWorldX - minX) * scale);
  const vpMapY = Math.max(0, (vpWorldY - minY) * scale);
  const vpMapW = Math.min(mapWidth, vpWorldW * scale);
  const vpMapH = Math.min(mapHeight, vpWorldH * scale);

  const handleMinimapClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = minX + clickX / scale;
    const targetWorldY = minY + clickY / scale;

    const newPanX = viewportW / 2 - targetWorldX * canvasState.zoom;
    const newPanY = viewportH / 2 - targetWorldY * canvasState.zoom;

    setPanZoom(newPanX, newPanY, canvasState.zoom);
  };

  return (
    <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end select-none">
      <div className="bg-[#101322]/90 backdrop-blur-md rounded-xl border border-[#232740] p-2 shadow-2xl space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3 text-indigo-400" />
            <span>Обзор</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {stages.length} этапов
          </span>
        </div>

        {/* Minimap Screen Canvas */}
        <div
          ref={containerRef}
          onClick={handleMinimapClick}
          style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
          className="relative bg-[#0c0e17] rounded-lg border border-[#1e233d] overflow-hidden cursor-pointer"
        >
          {/* Mini Cards */}
          {stages.map((stage) => {
            const x = (stage.x - minX) * scale;
            const y = (stage.y - minY) * scale;
            const w = Math.max((stage.width || 500) * scale, 6);
            const h = Math.max(380 * scale, 6);

            const isDone = stage.status === 'done';
            const isInProgress = stage.status === 'in_progress';

            const bgClass = isDone
              ? 'bg-emerald-500/80 shadow-[0_0_4px_rgba(16,185,129,0.8)]'
              : isInProgress
              ? 'bg-indigo-500/80 shadow-[0_0_4px_rgba(99,102,241,0.8)]'
              : 'bg-slate-600/60';

            return (
              <div
                key={stage.id}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${w}px`,
                  height: `${h}px`,
                }}
                className={`absolute rounded-sm ${bgClass}`}
              />
            );
          })}

          {/* Viewport Frame */}
          <div
            style={{
              left: `${vpMapX}px`,
              top: `${vpMapY}px`,
              width: `${Math.max(vpMapW, 10)}px`,
              height: `${Math.max(vpMapH, 8)}px`,
            }}
            className="absolute border-2 border-indigo-400/90 bg-indigo-500/10 rounded pointer-events-none transition-all"
          />
        </div>
      </div>
    </div>
  );
};
