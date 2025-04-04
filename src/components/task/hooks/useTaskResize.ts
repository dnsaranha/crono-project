
import { useState, useRef } from "react";
import { TaskResizeHookProps } from "../TaskTypes";

export function useTaskResize({
  task,
  onResize,
  onResizeStart,
  onClick,
  timeScale,
  cellWidth,
  style,
  onTouchStart: propsTouchStart,
  onTouchMove: propsTouchMove,
  onTouchEnd: propsTouchEnd
}: TaskResizeHookProps) {
  const resizeHandleRef = useRef<HTMLDivElement | null>(null);
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
      if (e.currentTarget.getAttribute('draggable') === 'true') {
        const dragEvent = new Event('dragstart', { bubbles: true }) as any;
        dragEvent.dataTransfer = {
          setData: () => {},
          effectAllowed: 'move'
        };
      }
    }, 500); // 500ms for long press
    
    setLongPressTimer(timer);
    
    if (propsTouchStart) {
      propsTouchStart(e);
    }
  };
  
  const handleTaskTouchMove = (e: React.TouchEvent) => {
    // Clear long press timer if user moves finger
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    if (propsTouchMove) {
      propsTouchMove(e);
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
    
    if (propsTouchEnd) {
      propsTouchEnd(e);
    }
    
    // If it wasn't a long press, treat as a click
    if (!isLongPress && onClick) {
      onClick();
    }
  };

  return {
    resizeHandleRef,
    isResizing,
    handleResizeStart,
    handleTaskTouchStart,
    handleTaskTouchMove,
    handleTaskTouchEnd
  };
}
