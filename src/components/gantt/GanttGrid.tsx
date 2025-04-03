
import React, { forwardRef } from 'react';
import Task from '../task';
import { TaskType } from '../task/TaskTypes';
import TodayMarker from '../TodayMarker';

interface TimeUnit {
  date: Date;
  label: string;
}

interface GanttGridProps {
  visibleTasks: TaskType[];
  timeUnits: TimeUnit[];
  cellWidth: number;
  tableWidth: number;
  getTaskStyle: (task: TaskType) => React.CSSProperties;
  handleGridClick: (e: React.MouseEvent) => void;
  createDependencyMode: {active: boolean, sourceId: string} | null;
  getCurrentDateLinePosition: () => number;
  startDate: Date;
  endDate: Date;
  handleTaskDragOver: (e: React.DragEvent, task: TaskType) => void;
  handleTaskDragLeave: () => void;
  handleCellDragOver: (e: React.DragEvent, weekIndex: number, rowIndex: number) => void;
  handleCellDrop: (e: React.DragEvent, weekIndex: number, rowIndex: number) => void;
  handleTaskClick: (task: TaskType) => void;
  handleTaskDragStart: (e: React.DragEvent | React.TouchEvent, task: TaskType) => void;
  handleTaskDragEnd: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>, task: TaskType) => void;
  handleTouchStart: (e: React.TouchEvent, task: TaskType) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: (e: React.TouchEvent, task: TaskType) => void;
  handleTaskResizeStart: (e: React.MouseEvent | React.TouchEvent, task: TaskType) => void;
  onTaskUpdate?: (updatedTask: TaskType) => void;
  hasEditPermission: boolean;
  timeScale: string;
  dragOverTask: TaskType | null;
  dragOverPosition: 'above' | 'below' | null;
  dragOverCell: { weekIndex: number, rowIndex: number } | null;
}

const GanttGrid = forwardRef<HTMLDivElement, GanttGridProps>(({
  visibleTasks,
  timeUnits,
  cellWidth,
  tableWidth,
  getTaskStyle,
  handleGridClick,
  createDependencyMode,
  getCurrentDateLinePosition,
  startDate,
  endDate,
  handleTaskDragOver,
  handleTaskDragLeave,
  handleCellDragOver,
  handleCellDrop,
  handleTaskClick,
  handleTaskDragStart,
  handleTaskDragEnd,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
  handleTaskResizeStart,
  onTaskUpdate,
  hasEditPermission,
  timeScale,
  dragOverTask,
  dragOverPosition,
  dragOverCell
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`gantt-grid relative ${createDependencyMode?.active ? 'dependency-mode' : ''}`}
      style={{ height: `${visibleTasks.length * 40}px`, width: `${tableWidth}px` }}
      onClick={handleGridClick}
    >
      <svg className="absolute inset-0 h-full w-full pointer-events-none z-20">
        <TodayMarker 
          startDate={startDate}
          endDate={endDate}
          position={getCurrentDateLinePosition()}
        />
        
        {visibleTasks.map(task => {
          if (!task.dependencies?.length) return null;
      
          return task.dependencies.map(depId => {
            const dependencyTask = visibleTasks.find(t => t.id === depId);
            if (!dependencyTask) return null;
      
            const fromIndex = visibleTasks.findIndex(t => t.id === depId);
            const toIndex = visibleTasks.findIndex(t => t.id === task.id);
      
            if (fromIndex === -1 || toIndex === -1) return null;
      
            const fromStyle = getTaskStyle(dependencyTask);
            const toStyle = getTaskStyle(task);
      
            const fromX = parseInt(fromStyle.marginLeft as string) + parseInt(fromStyle.width as string);
            const fromY = fromIndex * 40 + 20;
      
            const toX = parseInt(toStyle.marginLeft as string);
            const toY = toIndex * 40 + 20;
      
            const midX = (fromX + toX) / 2;
      
            return (
              <path
                key={`${depId}-${task.id}`}
                className="gantt-connection"
                d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                markerEnd="url(#arrowhead)"
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
      
      {visibleTasks.map((task, rowIndex) => (
        <div 
          key={task.id} 
          className={`absolute h-10 w-full ${
            dragOverTask?.id === task.id && dragOverPosition === 'above' 
              ? 'border-t-2 border-t-primary' 
              : dragOverTask?.id === task.id && dragOverPosition === 'below'
              ? 'border-b-2 border-b-primary'
              : ''
          }`}
          style={{ top: `${rowIndex * 40}px` }}
          onDragOver={(e) => hasEditPermission ? handleTaskDragOver(e, task) : null}
          onDragLeave={handleTaskDragLeave}
        >
          <div className="absolute inset-0 flex">
            {timeUnits.map((unit, timeIndex) => (
              <div
                key={timeIndex}
                className={`h-full ${
                  dragOverCell?.weekIndex === timeIndex && dragOverCell?.rowIndex === rowIndex
                    ? 'bg-blue-100 dark:bg-blue-900/20'
                    : ''
                }`}
                style={{ 
                  width: `${cellWidth}px`,
                  minWidth: `${cellWidth}px`
                }}
                onDragOver={(e) => hasEditPermission ? handleCellDragOver(e, timeIndex, rowIndex) : null}
                onDrop={(e) => hasEditPermission ? handleCellDrop(e, timeIndex, rowIndex) : null}
              />
            ))}
          </div>
          
          <Task 
            task={task}
            style={getTaskStyle(task)}
            onClick={() => handleTaskClick(task)}
            onDragStart={hasEditPermission ? (e) => handleTaskDragStart(e, task) : undefined}
            onDragEnd={hasEditPermission ? (e) => handleTaskDragEnd(e, task) : undefined}
            onTouchStart={hasEditPermission ? (e) => handleTouchStart(e, task) : undefined}
            onTouchMove={hasEditPermission ? handleTouchMove : undefined}
            onTouchEnd={hasEditPermission ? (e) => handleTouchEnd(e, task) : undefined}
            cellWidth={cellWidth}
            onResize={hasEditPermission ? (newDuration) => 
              onTaskUpdate?.({ ...task, duration: newDuration }) : undefined}
            onResizeStart={hasEditPermission ? (e) => handleTaskResizeStart(e, task) : undefined}
            className={createDependencyMode?.active ? 
              createDependencyMode.sourceId === task.id ? 
                'dependency-source' : 'dependency-target-candidate' 
              : ''}
            timeScale={timeScale as any}
            draggable={hasEditPermission}
          />
        </div>
      ))}
      
      {createDependencyMode?.active && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-auto z-50 pointer-events-none">
          <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md shadow-md">
            Clique em uma tarefa para criar dependência
          </div>
        </div>
      )}
    </div>
  );
});

GanttGrid.displayName = "GanttGrid";

export default GanttGrid;
