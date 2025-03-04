
import { cn } from "@/lib/utils";
import { useRef } from "react";

export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  color?: string;
  isGroup?: boolean;
  parentId?: string;
  progress?: number;
  dependencies?: string[];
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
  const defaultColor = task.isGroup ? "bg-gantt-teal" : "bg-gantt-blue";
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
  const isDraggable = !task.isGroup;
  
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
      
      {/* Resize handle */}
      {!task.isGroup && (
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
