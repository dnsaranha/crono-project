import { useState } from "react";
import { CheckCircle2, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  progress: number;
  dependencies?: string[];
  assignees?: string[];
  isGroup?: boolean;
  isMilestone?: boolean;
  parentId?: string;
  priority?: number;
  description?: string; // Added description field
}

interface TaskProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: (task: TaskType) => void;
  onDragStart?: (e: React.DragEvent, task: TaskType) => void;
  onDragEnd?: (e: React.DragEvent, task: TaskType) => void;
  cellWidth?: number;
  onResize?: (task: TaskType, newDuration: number) => void;
  className?: string;
}

const Task = ({ 
  task, 
  style, 
  onClick, 
  onDragStart, 
  onDragEnd, 
  cellWidth = 100,
  onResize,
  className = ""
}: TaskProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [initialX, setInitialX] = useState(0);
  const [initialWidth, setInitialWidth] = useState(0);
  
  // Get task color based on priority
  const getPriorityColor = (priority: number = 3) => {
    switch(priority) {
      case 1: return "bg-gray-400 border-gray-500";
      case 2: return "bg-blue-400 border-blue-500";
      case 3: return "bg-green-400 border-green-500";
      case 4: return "bg-yellow-400 border-yellow-500";
      case 5: return "bg-red-400 border-red-500";
      default: return "bg-green-400 border-green-500";
    }
  };
  
  // Base task classes based on task type
  const getTaskClasses = () => {
    if (task.isMilestone) {
      return "absolute w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[16px] border-b-purple-500 cursor-pointer transform translate-x-[-8px]";
    } else if (task.isGroup) {
      return cn(
        "absolute h-6 rounded cursor-pointer bg-gantt-teal border-l-4 border-teal-700 flex items-center px-2",
        "animate-task-appear overflow-hidden text-ellipsis whitespace-nowrap text-xs text-white font-medium"
      );
    } else {
      return cn(
        "absolute h-6 rounded cursor-pointer border-l-4 flex items-center px-2",
        getPriorityColor(task.priority),
        "animate-task-appear overflow-hidden text-ellipsis whitespace-nowrap text-xs text-white font-medium"
      );
    }
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    if (task.isMilestone || !onResize) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setInitialX(e.clientX);
    setInitialWidth(e.currentTarget.parentElement?.offsetWidth || 0);
    
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - initialX;
    const newWidth = Math.max(initialWidth + deltaX, cellWidth / 2);
    
    if (style && onResize) {
      const resizeHandleEl = document.getElementById(`resize-handle-${task.id}`);
      const taskEl = resizeHandleEl?.parentElement;
      
      if (taskEl) {
        taskEl.style.width = `${newWidth}px`;
      }
    }
  };
  
  // Handle resize end
  const handleResizeEnd = (e: MouseEvent) => {
    if (!isResizing) return;
    
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    if (style && onResize) {
      const resizeHandleEl = document.getElementById(`resize-handle-${task.id}`);
      const taskEl = resizeHandleEl?.parentElement;
      
      if (taskEl) {
        const newWidth = taskEl.offsetWidth;
        const newDuration = Math.max(Math.round((newWidth / cellWidth) * 7), 1);
        onResize(task, newDuration);
      }
    }
  };
  
  return (
    <div
      className={cn(getTaskClasses(), className)}
      style={style}
      onClick={() => onClick && onClick(task)}
      draggable={!task.isMilestone}
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onDragEnd={(e) => onDragEnd && onDragEnd(e, task)}
    >
      {!task.isMilestone && (
        <>
          <span className="truncate">
            {task.name}
          </span>
          
          {task.progress === 100 && (
            <CheckCircle2 className="ml-1 h-3 w-3 text-white" />
          )}
          
          {onResize && !task.isMilestone && (
            <div 
              id={`resize-handle-${task.id}`}
              className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-opacity-50 hover:bg-opacity-100"
              onMouseDown={handleResizeStart}
              onClick={(e) => e.stopPropagation()}
            ></div>
          )}
        </>
      )}
      
      {task.isMilestone && (
        <div className="absolute top-4 flex justify-center w-0">
          <Flag className="h-3 w-3 text-purple-600" />
        </div>
      )}
    </div>
  );
};

export default Task;
