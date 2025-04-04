
import React from 'react';
import { TaskType } from '@/components/Task';
import { DependencyLine } from './DependencyLine';

interface DependenciesOverlayProps {
  visibleTasks: TaskType[];
  getTaskStyle: (task: TaskType) => React.CSSProperties;
}

export const DependenciesOverlay: React.FC<DependenciesOverlayProps> = ({ 
  visibleTasks, 
  getTaskStyle 
}) => {
  return (
    <svg className="absolute inset-0 h-full w-full pointer-events-none z-20">
      <TodayMarkerLine />
      
      {visibleTasks.map(task => {
        if (!task.dependencies?.length) return null;
    
        return task.dependencies.map(depId => {
          const dependencyTask = visibleTasks.find(t => t.id === depId);
          if (!dependencyTask) return null;
    
          const fromIndex = visibleTasks.findIndex(t => t.id === depId);
          const toIndex = visibleTasks.findIndex(t => t.id === task.id);
    
          if (fromIndex === -1 || toIndex === -1) return null;
    
          return (
            <DependencyLine
              key={`${depId}-${task.id}`}
              fromTask={dependencyTask}
              toTask={task}
              fromIndex={fromIndex}
              toIndex={toIndex}
              getTaskStyle={getTaskStyle}
            />
          );
        });
      })}
      
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#FFB236" />
        </marker>
      </defs>
    </svg>
  );
};

const TodayMarkerLine = () => {
  // This is a placeholder for the TodayMarker component
  // We'll include the actual functionality in the GanttGrid component
  return null;
};
