import { cn } from "@/lib/utils";
import { useRef } from "react";

export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  color?: string;
  isGroup?: boolean;
  isMilestone?: boolean;
  parentId?: string;
  progress?: number;
  dependencies?: string[];
  assignees?: string[];
  description?: string; // Add the description property
}

interface TaskProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: (task: TaskType) => void;
  className?: string;
  onDragStart?: (e: React.DragEvent, task: TaskType) => void;
  onDragEnd?: (e: React.DragEvent, task: TaskType) => void;
  onDrag?: (e: React.DragEvent, task: TaskType) => void;
  cellWidth: number;
  onResize?: (task: TaskType, newDuration: number) => void;
}

const Task = ({
  task,
  style,
  onClick,
  className,
  onDragStart,
  onDragEnd,
  onDrag,
  cellWidth,
  onResize
}: TaskProps) => {
  let defaultColor = "bg-gantt-blue";
  if (task.isGroup) {
    defaultColor = "bg-gantt-teal";
  } else if (task.isMilestone) {
    defaultColor = "bg-purple-600";
  }
  
  const taskColor = task.color ? `bg-${task.color}` : defaultColor;
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on resize handle, don't trigger task selection
    if (e.target === resizeHandleRef.current) {
      e.stopPropagation();
    } else if (onClick) {
      onClick(task);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Set data for drag operation
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
    
    // Add visual cue for dragging
    if (taskRef.current) {
      setTimeout(() => {
        if (taskRef.current) taskRef.current.style.opacity = "0.5";
      }, 0);
    }
    
    if (onDragStart) onDragStart(e, task);
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    // Reset styles
    if (taskRef.current) {
      taskRef.current.style.opacity = "1";
    }
    
    if (onDragEnd) onDragEnd(e, task);
  };

  // For group tasks or tasks with dependencies, we might want to restrict some operations
  const isDraggable = !task.isGroup && !task.isMilestone;
  
  // Setup resize functionality
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = parseInt(style?.width?.toString() || "0", 10);
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!onResize) return;
      
      const dx = moveEvent.clientX - startX;
      const newWidth = Math.max(cellWidth, startWidth + dx);
      const newDuration = Math.round((newWidth / cellWidth) * 7); // Convert width to days
      
      onResize(task, newDuration);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Different rendering for milestones
  if (task.isMilestone) {
    return (
      <div
        ref={taskRef}
        className={cn(
          "gantt-milestone w-0 h-0 relative animate-task-appear cursor-pointer",
          className
        )}
        style={{
          ...style,
          width: 0,
          height: 0,
          marginTop: '12px'
        }}
        onClick={handleMouseDown}
      >
        <div 
          className={cn(
            "absolute w-4 h-4 transform rotate-45 bg-purple-600", 
            "left-0 top-0 -ml-2 -mt-2"
          )}
        />
        <div className="absolute left-6 top-0 whitespace-nowrap text-sm font-medium">
          {task.name}
          {task.assignees && task.assignees.length > 0 && (
            <span className="ml-2 px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
              {task.assignees.length} assignee(s)
            </span>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={taskRef}
      className={cn(
        "gantt-task rounded-sm h-8 relative animate-task-appear cursor-grab",
        taskColor,
        className,
        isDraggable ? "cursor-grab active:cursor-grabbing" : ""
      )}
      style={style}
      onClick={handleMouseDown}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDrag={onDrag ? (e) => onDrag(e, task) : undefined}
    >
      <div className="absolute inset-0 flex items-center px-2 text-white text-sm font-medium truncate">
        {task.name}
      </div>
      
      {task.progress !== undefined && task.progress > 0 && (
        <div 
          className="absolute top-0 left-0 bottom-0 bg-white bg-opacity-20 rounded-l-sm transition-all duration-500 ease-out"
          style={{ width: `${task.progress}%` }}
        />
      )}
      
      <div className="absolute -bottom-3 left-0 w-full h-3 flex justify-center items-center pointer-events-none">
        {task.dependencies?.length > 0 && (
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
        )}
      </div>
      
      {/* Assignees indicator */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="absolute -top-3 right-2 flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-blue-700">{task.assignees.length}</span>
        </div>
      )}
      
      {/* Resize handle */}
      {!task.isGroup && !task.isMilestone && (
        <div
          ref={resizeHandleRef}
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white hover:bg-opacity-30"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};

export default Task;
