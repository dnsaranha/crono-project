
import React from 'react';
import { TaskType } from '@/components/Task';
import { Task } from '@/components/Task';

interface TaskRowProps {
  task: TaskType;
  rowIndex: number;
  getTaskStyle: (task: TaskType) => React.CSSProperties;
  timeUnits: { date: Date; label: string }[];
  cellWidth: number;
  handleTaskDragOver: (e: React.DragEvent<HTMLElement>, task: TaskType) => void;
  handleTaskDragLeave: () => void;
  handleCellDragOver: (e: React.DragEvent<HTMLElement>, weekIndex: number, rowIndex: number) => void;
  handleCellDrop: (e: React.DragEvent<HTMLElement>, weekIndex: number, rowIndex: number) => void;
  handleTaskClick: (task: TaskType) => void;
  handleTaskDragStart: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>, task: TaskType) => void;
  handleTaskDragEnd: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>, task: TaskType) => void;
  handleTouchStart: (e: React.TouchEvent<HTMLElement>, task: TaskType) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
  handleTouchEnd: (e: React.TouchEvent<HTMLElement>, task: TaskType) => void;
  handleTaskResizeStart: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, task: TaskType) => void;
  onTaskUpdate?: (updatedTask: TaskType) => void;
  hasEditPermission: boolean;
  timeScale: "day" | "week" | "month" | "quarter" | "year";
  createDependencyMode: {active: boolean, sourceId: string} | null;
  dragOverTask: TaskType | null;
  dragOverPosition: 'above' | 'below' | null;
  dragOverCell: { weekIndex: number, rowIndex: number } | null;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  rowIndex,
  getTaskStyle,
  timeUnits,
  cellWidth,
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
  createDependencyMode,
  dragOverTask,
  dragOverPosition,
  dragOverCell
}) => {
  return (
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
      onDragOver={(e) => hasEditPermission ? handleTaskDragOver(e, task) : undefined}
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
            onDragOver={(e) => hasEditPermission ? handleCellDragOver(e, timeIndex, rowIndex) : undefined}
            onDrop={(e) => hasEditPermission ? handleCellDrop(e, timeIndex, rowIndex) : undefined}
          />
        ))}
      </div>
      
      <Task 
        task={task}
        style={getTaskStyle(task)}
        onClick={() => handleTaskClick(task)}
        onDragStart={hasEditPermission ? (e) => handleTaskDragStart(e as any, task) : undefined}
        onDragEnd={hasEditPermission ? (e) => handleTaskDragEnd(e as any, task) : undefined}
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
        timeScale={timeScale}
        draggable={hasEditPermission}
      />
    </div>
  );
};
