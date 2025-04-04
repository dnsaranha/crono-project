
import React from 'react';
import { TaskType } from '@/components/task';

interface DependenciesOverlayProps {
  visibleTasks: TaskType[];
  getTaskStyle: (task: TaskType) => React.CSSProperties;
}

export const DependenciesOverlay: React.FC<DependenciesOverlayProps> = ({
  visibleTasks,
  getTaskStyle
}) => {
  // Find all tasks with dependencies
  const tasksWithDependencies = visibleTasks.filter(task => 
    task.dependencies && task.dependencies.length > 0
  );
  
  if (tasksWithDependencies.length === 0) return null;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="0"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#888"
          />
        </marker>
      </defs>
      
      {tasksWithDependencies.map(task => (
        task.dependencies?.map(depId => {
          const sourceTask = visibleTasks.find(t => t.id === depId);
          if (!sourceTask) return null;
          
          const targetStyle = getTaskStyle(task);
          const sourceStyle = getTaskStyle(sourceTask);
          
          // Extract positions from style
          const targetLeft = parseInt(targetStyle.marginLeft?.toString() || '0', 10);
          const sourceLeft = parseInt(sourceStyle.marginLeft?.toString() || '0', 10);
          const sourceWidth = parseInt(sourceStyle.width?.toString() || '0', 10);
          
          // Find the task indices to determine vertical positions
          const sourceIndex = visibleTasks.findIndex(t => t.id === sourceTask.id);
          const targetIndex = visibleTasks.findIndex(t => t.id === task.id);
          
          if (sourceIndex < 0 || targetIndex < 0) return null;
          
          const sourceY = sourceIndex * 40 + 20; // middle of the row
          const targetY = targetIndex * 40 + 20; // middle of the row
          
          const sourceRight = sourceLeft + sourceWidth;
          
          return (
            <path
              key={`dep-${sourceTask.id}-${task.id}`}
              d={`M ${sourceRight} ${sourceY} C ${sourceRight + 30} ${sourceY}, ${targetLeft - 30} ${targetY}, ${targetLeft} ${targetY}`}
              fill="none"
              stroke="#888"
              strokeWidth="1.5"
              strokeDasharray="4"
              markerEnd="url(#arrowhead)"
            />
          );
        })
      ))}
    </svg>
  );
};
