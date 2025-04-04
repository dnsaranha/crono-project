
import React from 'react';
import { Task } from '@/components/Task';
import { TaskType } from '@/components/task';

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
  
  // Style for the task
  const taskStyle = getTaskStyle(task);
  
  // Determine if this is the row being targeted for drag and drop
  const isTargetRow = dragOverTask?.id === task.id;
  
  return (
    <div 
      className="gantt-row relative"
      style={{ height: '40px' }}
    >
      {/* Background grid cells */}
      <div className="absolute inset-0 flex">
        {timeUnits.map((week, weekIndex) => (
          <div
            key={`cell-${rowIndex}-${weekIndex}`}
            className={`h-full border-r border-b ${
              dragOverCell?.weekIndex === weekIndex && dragOverCell?.rowIndex === rowIndex
                ? 'bg-muted/50'
                : weekIndex % 2 === 0 ? 'bg-muted/20' : ''
            }`}
            style={{ width: `${cellWidth}px` }}
            onDragOver={(e) => hasEditPermission ? handleCellDragOver(e, weekIndex, rowIndex) : null}
            onDrop={(e) => hasEditPermission ? handleCellDrop(e, weekIndex, rowIndex) : null}
          />
        ))}
      </div>
      
      {/* Task component */}
      {!task.isGroup || task.isMilestone ? (
        <Task
          task={task}
          style={taskStyle}
          onClick={() => handleTaskClick(task)}
          onResizeStart={(e) => hasEditPermission ? handleTaskResizeStart(e, task) : undefined}
          onDragStart={(e) => hasEditPermission ? handleTaskDragStart(e, task) : undefined}
          onDragEnd={(e) => hasEditPermission ? handleTaskDragEnd(e, task) : undefined}
          onTouchStart={(e) => hasEditPermission ? handleTouchStart(e, task) : undefined}
          onTouchMove={(e) => hasEditPermission ? handleTouchMove(e) : undefined}
          onTouchEnd={(e) => hasEditPermission ? handleTouchEnd(e, task) : undefined}
          className={createDependencyMode?.active ? 'hover:ring-2 hover:ring-yellow-400' : ''}
          draggable={hasEditPermission}
          timeScale={timeScale}
        />
      ) : (
        <div 
          className="gantt-group-task absolute"
          style={taskStyle}
          onClick={() => handleTaskClick(task)}
        >
          <div className="h-1 bg-gray-400 w-full" />
        </div>
      )}
      
      {/* Target indicators for drag and drop */}
      {isTargetRow && dragOverPosition === 'above' && (
        <div className="absolute h-1 bg-primary w-full top-0 z-10" />
      )}
      {isTargetRow && dragOverPosition === 'below' && (
        <div className="absolute h-1 bg-primary w-full bottom-0 z-10" />
      )}
    </div>
  );
};
