
import { useState, useRef } from "react";
import { cva } from "class-variance-authority";
import { TaskProps, TaskType } from "./TaskTypes";
import TaskMilestone from "./TaskMilestone";
import { useTaskResize } from "./hooks/useTaskResize";

const taskVariants = cva("gantt-task cursor-pointer absolute top-0 rounded-sm shadow-sm text-xs overflow-hidden transition-shadow duration-200", {
  variants: {
    priority: {
      1: "bg-gray-200 dark:bg-gray-700",      // Very Low
      2: "bg-blue-200 dark:bg-blue-800",      // Low
      3: "bg-green-200 dark:bg-green-800",    // Medium
      4: "bg-yellow-200 dark:bg-yellow-800",  // High
      5: "bg-red-200 dark:bg-red-800",        // Very High
    },
    type: {
      normal: "h-8 mt-1",
      group: "h-5 mt-[10px] bg-gantt-group-bg dark:bg-gray-700",
      milestone: "h-0 w-0 mt-[20px] shadow-none transform-origin-center"
    }
  },
  defaultVariants: {
    priority: 3,
    type: "normal"
  }
});

const TaskComponent = ({ 
  task, 
  style, 
  onClick, 
  onResize,
  onResizeStart,
  onDragStart, 
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  cellWidth = 30,
  className = "",
  draggable = true,
  timeScale = "week"
}: TaskProps) => {
  const taskRef = useRef<HTMLDivElement>(null);
  
  const { 
    resizeHandleRef, 
    isResizing, 
    handleResizeStart, 
    handleTaskTouchStart,
    handleTaskTouchMove,
    handleTaskTouchEnd
  } = useTaskResize({
    task,
    onResize,
    onResizeStart,
    onClick,
    timeScale,
    cellWidth,
    style
  });

  if (task.isMilestone) {
    return (
      <TaskMilestone
        task={task}
        style={style}
        onClick={onClick}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTouchStart={handleTaskTouchStart}
        onTouchMove={handleTaskTouchMove}
        onTouchEnd={handleTaskTouchEnd}
        className={className}
      />
    );
  }
  
  // Calculate priority for styling - make sure it's a valid value
  const priority = (task.priority || 3) as 1 | 2 | 3 | 4 | 5;
  
  return (
    <div 
      ref={taskRef}
      className={`${taskVariants({
        priority, 
        type: task.isGroup ? "group" : "normal"
      })} ${className} active:scale-y-110`}
      style={style}
      onClick={onClick}
      draggable={draggable && !!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={handleTaskTouchStart}
      onTouchMove={handleTaskTouchMove}
      onTouchEnd={handleTaskTouchEnd}
    >
      {!task.isGroup && !task.isMilestone && (
        <div 
          className="absolute inset-0 bg-foreground/5 z-0"
          style={{ width: `${task.progress}%` }}
        />
      )}
      
      <div className="relative z-10 p-1 flex items-center justify-between h-full truncate">
        <div className="truncate text-xs">
          {task.name}
        </div>
        
        {!task.isGroup && !task.isMilestone && (onResize || onResizeStart) && (
          <div 
            ref={resizeHandleRef}
            className="absolute top-0 right-0 w-4 h-full cursor-ew-resize opacity-50 hover:opacity-100 active:opacity-100 bg-gray-400 hover:bg-gray-600"
            onMouseDown={(e) => handleResizeStart(e)}
            onTouchStart={(e) => {
              e.stopPropagation();
              handleResizeStart(e);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TaskComponent;
