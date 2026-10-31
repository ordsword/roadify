import React, { useState } from 'react';
import { X } from 'lucide-react';
import { ConnectionLink, StageNode } from '../../types';
import { useRoadmap } from '../../context/RoadmapContext';

interface ConnectionLineProps {
  connection: ConnectionLink;
  fromStage: StageNode;
  toStage: StageNode;
}

export const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  fromStage,
  toStage,
}) => {
  const { deleteConnection } = useRoadmap();
  const [isHovered, setIsHovered] = useState(false);

  // Card dimensions
  const fromW = fromStage.width || 520;
  const fromH = 400; // estimated card height
  const toW = toStage.width || 520;
  const toH = 400;

  // Calculate anchor points
  // If fromStage is to the left of toStage
  let startX = fromStage.x + fromW;
  let startY = fromStage.y + 120;
  let endX = toStage.x;
  let endY = toStage.y + 120;

  if (fromStage.x > toStage.x + toW) {
    // fromStage is to the right of toStage
    startX = fromStage.x;
    endX = toStage.x + toW;
  } else if (Math.abs(fromStage.x - toStage.x) < 200) {
    // Vertically stacked
    if (fromStage.y < toStage.y) {
      startX = fromStage.x + fromW / 2;
      startY = fromStage.y + fromH;
      endX = toStage.x + toW / 2;
      endY = toStage.y;
    } else {
      startX = fromStage.x + fromW / 2;
      startY = fromStage.y;
      endX = toStage.x + toW / 2;
      endY = toStage.y + toH;
    }
  }

  // Cubic Bézier control points
  const dx = Math.abs(endX - startX);
  const dy = Math.abs(endY - startY);
  const offset = Math.max(dx * 0.45, 60);

  const cp1x = startX + (endX > startX ? offset : -offset);
  const cp1y = startY;
  const cp2x = endX + (endX > startX ? -offset : offset);
  const cp2y = endY;

  const path = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

  // Midpoint for label
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const color = connection.color || '#6366f1';

  return (
    <g
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      {/* Invisible thick path for easy hovering */}
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={24}
      />

      {/* Main Connection Curve */}
      <path
        d={path}
        fill="none"
        stroke={isHovered ? '#818cf8' : color}
        strokeWidth={isHovered ? 3.5 : 2.5}
        strokeDasharray={connection.label === 'параллельно' ? '6 4' : undefined}
        markerEnd={`url(#arrow-${connection.id})`}
        className="transition-all duration-200"
      />

      {/* Marker Defs */}
      <defs>
        <marker
          id={`arrow-${connection.id}`}
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={isHovered ? '#818cf8' : color} />
        </marker>
      </defs>

      {/* Label Badge or Delete Button in center */}
      {isHovered ? (
        <foreignObject
          x={midX - 16}
          y={midY - 16}
          width={32}
          height={32}
          className="overflow-visible"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteConnection(connection.id);
            }}
            className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
            title="Удалить связь"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </foreignObject>
      ) : connection.label ? (
        <foreignObject
          x={midX - 70}
          y={midY - 14}
          width={140}
          height={28}
          className="overflow-visible pointer-events-none"
        >
          <div className="flex justify-center">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#131622]/95 border border-[#2d3454] text-slate-300 shadow-md whitespace-nowrap">
              {connection.label}
            </span>
          </div>
        </foreignObject>
      ) : null}
    </g>
  );
};
