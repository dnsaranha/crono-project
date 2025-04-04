
import React from 'react';
import { TaskType } from '@/components/Task';

interface DependencyLineProps {
  fromTask: TaskType;
  toTask: TaskType;
  fromIndex: number;
  toIndex: number;
  getTaskStyle: (task: TaskType) => React.CSSProperties;
}

export const DependencyLine: React.FC<DependencyLineProps> = ({ 
  fromTask, 
  toTask, 
  fromIndex, 
  toIndex, 
  getTaskStyle 
}) => {
  // Convert the style values to numbers with proper error handling
  const fromStyle = getTaskStyle(fromTask);
  const toStyle = getTaskStyle(toTask);

  const fromLeft = typeof fromStyle.marginLeft === 'string' 
    ? parseInt(fromStyle.marginLeft, 10) || 0 
    : 0;
    
  const fromWidth = typeof fromStyle.width === 'string' 
    ? parseInt(fromStyle.width, 10) || 0 
    : 0;
    
  const toLeft = typeof toStyle.marginLeft === 'string' 
    ? parseInt(toStyle.marginLeft, 10) || 0 
    : 0;

  const fromX = fromLeft + fromWidth;
  const fromY = fromIndex * 40 + 20;
  const toX = toLeft;
  const toY = toIndex * 40 + 20;
  const midX = (fromX + toX) / 2;

  // Build the SVG path as a string for the Bezier curve
  const pathD = "M " + fromX + " " + fromY + " C " + midX + " " + fromY + ", " + midX + " " + toY + ", " + toX + " " + toY;

  return (
    <path
      key={`${fromTask.id}-${toTask.id}`}
      className="gantt-connection"
      d={pathD}
      stroke="#FFB236"
      strokeWidth="2"
      fill="none"
      markerEnd="url(#arrowhead)"
    />
  );
};
