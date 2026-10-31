import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Sparkles, Map, MoveRight } from 'lucide-react';
import { useRoadmap } from '../../context/RoadmapContext';
import { useAuth } from '../../context/AuthContext';
import { NodeCard } from './NodeCard';
import { ConnectionLine } from './ConnectionLine';
import { Toolbar } from './Toolbar';
import { ZoomControls } from './ZoomControls';
import { Minimap } from './Minimap';
import { TimelineScrubber } from './TimelineScrubber';

interface InfiniteCanvasProps {
  onOpenNewStage: () => void;
  onOpenNewRoadmap: () => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  onOpenNewStage,
  onOpenNewRoadmap,
}) => {
  const {
    roadmaps,
    activeRoadmap,
    activeStageId,
    setActiveStageId,
    canvasState,
    setPanZoom,
    activeTool,
    updateStage,
    deleteStage,
    isConnecting,
    connectingFromId,
    cancelConnecting,
    importRoadmapFile,
    loadSampleTemplate,
  } = useRoadmap();

  const { currentUser } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const fileDropInputRef = useRef<HTMLInputElement>(null);

  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  // Node Dragging State
  const [draggingStageId, setDraggingStageId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connect Dragging line state (mouse world pos)
  const [mouseWorldPos, setMouseWorldPos] = useState({ x: 0, y: 0 });

  const stages = activeRoadmap?.stages || [];
  const connections = activeRoadmap?.connections || [];

  // Convert screen coordinates to canvas world coordinates
  const screenToWorld = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - canvasState.panX) / canvasState.zoom;
      const y = (clientY - rect.top - canvasState.panY) / canvasState.zoom;
      return { x, y };
    },
    [canvasState]
  );

  // Mouse Wheel Zoom centered at cursor
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.min(Math.max(canvasState.zoom * zoomFactor, 0.2), 3.0);

    const newPanX = mouseX - (mouseX - canvasState.panX) * (newZoom / canvasState.zoom);
    const newPanY = mouseY - (mouseY - canvasState.panY) * (newZoom / canvasState.zoom);

    setPanZoom(newPanX, newPanY, newZoom);
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.button === 1 ||
      activeTool === 'hand' ||
      e.target === containerRef.current ||
      (e.target as HTMLElement).tagName === 'svg'
    ) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - canvasState.panX, y: e.clientY - canvasState.panY });
      setActiveStageId(null);
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const world = screenToWorld(e.clientX, e.clientY);
    setMouseWorldPos(world);

    if (isPanning) {
      setPanZoom(e.clientX - startPan.x, e.clientY - startPan.y, canvasState.zoom);
    } else if (draggingStageId) {
      const stage = stages.find((s) => s.id === draggingStageId);
      if (stage) {
        const newX = Math.round(world.x - dragOffset.x);
        const newY = Math.round(world.y - dragOffset.y);
        updateStage(draggingStageId, { x: newX, y: newY });
      }
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingStageId(null);
  };

  // Start Node Drag
  const handleNodeDragStart = (stageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stage = stages.find((s) => s.id === stageId);
    if (!stage) return;

    setActiveStageId(stageId);
    setDraggingStageId(stageId);

    const world = screenToWorld(e.clientX, e.clientY);
    setDragOffset({
      x: world.x - stage.x,
      y: world.y - stage.y,
    });
  };

  // Drag & drop .json files onto canvas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.json') || file.type.includes('json'))) {
      const ok = await importRoadmapFile(file);
      if (ok) {
        alert(`Дорожная карта из "${file.name}" успешно импортирована!`);
      } else {
        alert('Не удалось прочитать .json файл.');
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeStageId) {
          const s = stages.find((item) => item.id === activeStageId);
          if (s && confirm(`Удалить этап "${s.title}"?`)) {
            deleteStage(activeStageId);
          }
        }
      } else if (e.key === 'Escape') {
        cancelConnecting();
        setActiveStageId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStageId, stages, deleteStage, cancelConnecting, setActiveStageId]);

  const connectingSourceStage =
    isConnecting && connectingFromId ? stages.find((s) => s.id === connectingFromId) : null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative flex-1 h-[calc(100vh-3rem)] overflow-hidden bg-[#0c0e17] canvas-grid-dots select-none ${
        activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      <input
        ref={fileDropInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await importRoadmapFile(f);
        }}
      />

      {/* Floating Toolbar (only when a roadmap exists) */}
      {activeRoadmap && <Toolbar onAddStageClick={onOpenNewStage} />}

      {/* Drag Over Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-indigo-950/70 backdrop-blur-sm border-2 border-dashed border-indigo-400 z-40 flex flex-col items-center justify-center pointer-events-none text-white">
          <Upload className="w-12 h-12 text-indigo-400 animate-bounce mb-2" />
          <p className="text-base font-bold">Отпустите .json файл для импорта проекта</p>
        </div>
      )}

      {/* Empty State: No Roadmaps */}
      {roadmaps.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-6 z-10 pointer-events-auto">
          <div className="max-w-md w-full bg-[#131625]/95 border border-[#232740] rounded-2xl p-7 text-center shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-600/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#101322] rounded-[14px] flex items-center justify-center">
                <Map className="w-7 h-7 text-indigo-400" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Здравствуйте, {currentUser?.name || 'Создатель'}!
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ваше пространство Roadify готово. Создайте свою первую дорожную карту, перетащите существующий <code className="text-indigo-300 font-mono">.json</code> файл или загрузите демонстрационный шаблон.
              </p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={onOpenNewRoadmap}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Создать новую дорожную карту</span>
              </button>

              <button
                onClick={() => fileDropInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-[#1a1f35] hover:bg-[#232948] border border-[#2d3557] text-slate-200 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Импортировать .json файл</span>
              </button>

              <button
                onClick={loadSampleTemplate}
                className="w-full py-2 px-4 text-slate-400 hover:text-indigo-300 text-xs transition-colors flex items-center justify-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Загрузить пример спринта (Egg Incubator)</span>
              </button>
            </div>
          </div>
        </div>
      ) : stages.length === 0 ? (
        /* Empty State: Roadmap with 0 stages */
        <div className="absolute inset-0 flex items-center justify-center p-6 z-10 pointer-events-auto">
          <div className="max-w-md w-full bg-[#131625]/90 border border-[#232740] rounded-2xl p-6 text-center shadow-xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Проект «{activeRoadmap?.title}» пока пуст
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Добавьте первый этап разработки, импортируйте задачи из .json или попросите подключенного ИИ составить план!
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-1">
              <button
                onClick={onOpenNewStage}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить этап</span>
              </button>
              <button
                onClick={() => fileDropInputRef.current?.click()}
                className="px-4 py-2 bg-[#1a1f35] hover:bg-[#232948] border border-[#2d3557] text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-indigo-400" />
                <span>Импорт .json</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Canvas World Container with Transform Matrix */}
      <div
        style={{
          transform: `translate(${canvasState.panX}px, ${canvasState.panY}px) scale(${canvasState.zoom})`,
          transformOrigin: '0 0',
        }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* SVG Layer for Connection Arrows */}
        <svg
          className="absolute inset-0 overflow-visible pointer-events-auto"
          style={{ width: '100%', height: '100%' }}
        >
          {connections.map((conn) => {
            const from = stages.find((s) => s.id === conn.fromStageId);
            const to = stages.find((s) => s.id === conn.toStageId);
            if (!from || !to) return null;
            return (
              <ConnectionLine
                key={conn.id}
                connection={conn}
                fromStage={from}
                toStage={to}
              />
            );
          })}

          {/* Active Connect Drafter Curve */}
          {connectingSourceStage && (
            <path
              d={`M ${connectingSourceStage.x + (connectingSourceStage.width || 500) / 2} ${
                connectingSourceStage.y + 160
              } Q ${(connectingSourceStage.x + mouseWorldPos.x) / 2} ${
                (connectingSourceStage.y + mouseWorldPos.y) / 2 - 50
              }, ${mouseWorldPos.x} ${mouseWorldPos.y}`}
              fill="none"
              stroke="#818cf8"
              strokeWidth={3}
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {stages.map((stage) => (
            <NodeCard
              key={stage.id}
              stage={stage}
              isSelected={stage.id === activeStageId}
              onSelect={() => setActiveStageId(stage.id)}
              onDragStart={(e) => handleNodeDragStart(stage.id, e)}
            />
          ))}
        </div>
      </div>

      {/* Floating Zoom Controls (Bottom Left) */}
      <ZoomControls />

      {/* Floating Sprint Timeline Scrubber (Bottom Center) */}
      <TimelineScrubber />

      {/* Floating Radar Minimap (Bottom Right) */}
      <Minimap />
    </div>
  );
};
