
import React, { forwardRef } from 'react';
import { Task } from '../Task';
import { TaskType } from '../task/TaskTypes';
import TodayMarker from '../TodayMarker';
import { DependenciesOverlay } from './grid/DependenciesOverlay';
import { TaskRow } from './grid/TaskRow';
import { DependencyModeMessage } from './grid/DependencyModeMessage';

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
      <DependenciesOverlay 
        visibleTasks={visibleTasks} 
        getTaskStyle={getTaskStyle} 
      />
      
      <svg className="absolute inset-0 h-full w-full pointer-events-none z-20">
        <TodayMarker 
          position={getCurrentDateLinePosition()}
        />
      </svg>
      
      {visibleTasks.map((task, rowIndex) => (
        <TaskRow
          key={task.id}
          task={task}
          rowIndex={rowIndex}
          getTaskStyle={getTaskStyle}
          timeUnits={timeUnits}
          cellWidth={cellWidth}
          handleTaskDragOver={handleTaskDragOver}
          handleTaskDragLeave={handleTaskDragLeave}
          handleCellDragOver={handleCellDragOver}
          handleCellDrop={handleCellDrop}
          handleTaskClick={handleTaskClick}
          handleTaskDragStart={handleTaskDragStart}
          handleTaskDragEnd={handleTaskDragEnd}
          handleTouchStart={handleTouchStart}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          handleTaskResizeStart={handleTaskResizeStart}
          onTaskUpdate={onTaskUpdate}
          hasEditPermission={hasEditPermission}
          timeScale={timeScale}
          createDependencyMode={createDependencyMode}
          dragOverTask={dragOverTask}
          dragOverPosition={dragOverPosition}
          dragOverCell={dragOverCell}
        />
      ))}
      
      <DependencyModeMessage isActive={!!createDependencyMode?.active} />
    </div>
  );
});

GanttGrid.displayName = 'GanttGrid';

export default GanttGrid;
