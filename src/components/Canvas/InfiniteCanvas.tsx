import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useRoadmap } from '../../context/RoadmapContext';
import { NodeCard } from './NodeCard';
import { ConnectionLine } from './ConnectionLine';
import { Toolbar } from './Toolbar';
import { ZoomControls } from './ZoomControls';
import { Minimap } from './Minimap';
import { TimelineScrubber } from './TimelineScrubber';

interface InfiniteCanvasProps {
  onOpenNewStage: () => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({ onOpenNewStage }) => {
  const {
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
  } = useRoadmap();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

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

    // Keep point under cursor invariant
    const newPanX = mouseX - (mouseX - canvasState.panX) * (newZoom / canvasState.zoom);
    const newPanY = mouseY - (mouseY - canvasState.panY) * (newZoom / canvasState.zoom);

    setPanZoom(newPanX, newPanY, newZoom);
  };

  // Canvas Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    // If middle click or space key or hand tool or clicking on background
    if (e.button === 1 || activeTool === 'hand' || e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
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
      // Dragging a node
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

  // Compute active connection draft line
  const connectingSourceStage = isConnecting && connectingFromId ? stages.find((s) => s.id === connectingFromId) : null;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative flex-1 h-[calc(100vh-3rem)] overflow-hidden bg-[#0c0e17] canvas-grid-dots select-none ${
        activeTool === 'hand' || isPanning ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Floating Toolbar */}
      <Toolbar onAddStageClick={onOpenNewStage} />

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
