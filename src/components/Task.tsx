
import { useState, useRef } from "react";
import { ChevronRight } from "lucide-react";
import { cva } from "class-variance-authority";

export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  progress: number;
  dependencies?: string[];
  assignees?: string[];
  parentId?: string;
  isGroup?: boolean;
  isMilestone?: boolean;
  priority?: 1 | 2 | 3 | 4 | 5;
  description?: string;
}

interface TaskProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: () => void;
  onResize?: (newDuration: number) => void;
  onResizeStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  cellWidth?: number;
  className?: string;
  draggable?: boolean;
  timeScale?: "day" | "week" | "month" | "quarter" | "year";
}

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

const Task = ({ 
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
  const resizeHandleRef = useRef<HTMLDivElement | null>(null);
  const taskRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartX, setResizeStartX] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!onResize) return;
    
    e.stopPropagation();
    
    if (onResizeStart) {
      onResizeStart(e);
    } else {
      // Default resize behavior
      setIsResizing(true);
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      setResizeStartX(clientX);
      setOriginalWidth(parseInt(style?.width?.toString() || "0"));
      
      const handleMouseMove = (e: MouseEvent | TouchEvent) => {
        if (!isResizing) return;
        
        const currentX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const diff = currentX - resizeStartX;
        
        let daysDiff = 0;
        
        switch (timeScale) {
          case "day":
            daysDiff = Math.round(diff / cellWidth);
            break;
          case "week":
            daysDiff = Math.round((diff / cellWidth) * 7);
            break;
          case "month":
            daysDiff = Math.round((diff / cellWidth) * 30);
            break;
          default:
            daysDiff = Math.round((diff / cellWidth) * 7);
        }
        
        const newDuration = Math.max(1, task.duration + daysDiff);
        
        if (resizeHandleRef.current?.parentElement) {
          const newWidth = calculateWidth(newDuration);
          resizeHandleRef.current.parentElement.style.width = `${newWidth}px`;
        }
      };
      
      const handleMouseUp = () => {
        if (!isResizing || !onResize) return;
        
        setIsResizing(false);
        
        if (resizeHandleRef.current?.parentElement) {
          const newWidth = parseInt(resizeHandleRef.current.parentElement.style.width || '0');
          
          // Convert width back to duration
          let newDuration = 0;
          switch (timeScale) {
            case "day":
              newDuration = Math.round(newWidth / cellWidth);
              break;
            case "week":
              newDuration = Math.round((newWidth / cellWidth) * 7);
              break;
            case "month":
              newDuration = Math.round((newWidth / cellWidth) * 30);
              break;
            default:
              newDuration = Math.round((newWidth / cellWidth) * 7);
          }
          
          onResize(Math.max(1, newDuration));
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
    }
  };
  
  // Calculate width based on duration and time scale
  const calculateWidth = (duration: number) => {
    switch (timeScale) {
      case "day":
        return duration * cellWidth;
      case "week":
        return (duration / 7) * cellWidth;
      case "month":
        return (duration / 30) * cellWidth;
      default:
        return (duration / 7) * cellWidth;
    }
  };
  
  // Enhanced touch event handling for mobile
  const handleTaskTouchStart = (e: React.TouchEvent) => {
    // Start long press timer
    const timer = setTimeout(() => {
      setIsLongPress(true);
      
      // Trigger drag start after long press
      if (onDragStart && draggable) {
        const dragEvent = new Event('dragstart', { bubbles: true }) as any;
        dragEvent.dataTransfer = {
          setData: () => {},
          effectAllowed: 'move'
        };
        
        if (onDragStart) {
          onDragStart(dragEvent);
        }
      }
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
    
    if (onTouchStart) {
      onTouchStart(e);
    }
  };
  
  const handleTaskTouchMove = (e: React.TouchEvent) => {
    // Clear long press timer if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (onTouchMove) {
      onTouchMove(e);
    }
    
    // Prevent default to avoid page scrolling if we're dragging
    if (isLongPress) {
      e.preventDefault();
    }
  };
  
  const handleTaskTouchEnd = (e: React.TouchEvent) => {
    // Clear long press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Reset long press state
    setIsLongPress(false);
    
    if (onTouchEnd) {
      onTouchEnd(e);
    }
    
    // If it wasn't a long press, treat as a click
    if (!isLongPress && onClick) {
      onClick();
    }
  };

  if (task.isMilestone) {
    return (
      <div 
        ref={taskRef}
        className={`gantt-milestone absolute cursor-pointer top-[12px] ${className}`}
        style={{
          ...style,
          width: 0,
          height: 0,
          marginLeft: `${parseInt(style?.marginLeft?.toString() || "0") - 8}px`,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '16px solid purple',
        }}
        onClick={onClick}
        draggable={draggable && !!onDragStart}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onTouchStart={handleTaskTouchStart}
        onTouchMove={handleTaskTouchMove}
        onTouchEnd={handleTaskTouchEnd}
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

export default Task;
