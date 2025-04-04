import { useState, useRef, useCallback } from 'react';
import type { TaskType } from '../TaskTypes';
import type { TaskResizeHookProps } from '../TaskTypes';

export function useTaskResize({
  task,
  onResize,
  onResizeStart,
  onClick,
  timeScale,
  cellWidth,
  style
}: TaskResizeHookProps) {
  const [isResizing, setIsResizing] = useState(false);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleResizeStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    
    if (onResizeStart) {
      onResizeStart(e);
    }
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startPositionRef.current = clientX;
    
    const element = e.currentTarget.parentElement;
    if (element) {
      const width = element.getBoundingClientRect().width;
      startWidthRef.current = width;
    }
    
    setIsResizing(true);
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      const moveClientX = 'touches' in moveEvent 
        ? moveEvent.touches[0].clientX 
        : moveEvent.clientX;
      
      const diff = moveClientX - startPositionRef.current;
      
      if (element) {
        element.style.width = `${Math.max(startWidthRef.current + diff, 4)}px`;
      }
    };
    
    const handleEnd = () => {
      setIsResizing(false);
      
      if (element && onResize) {
        const width = element.getBoundingClientRect().width;
        let newDuration = task.duration;
        
        switch (timeScale) {
          case "day":
            newDuration = Math.max(1, Math.round(width / cellWidth));
            break;
          case "week":
            newDuration = Math.max(7, Math.round((width / cellWidth) * 7));
            break;
          case "month":
            newDuration = Math.max(28, Math.round((width / cellWidth) * 30));
            break;
          default:
            newDuration = Math.max(7, Math.round((width / cellWidth) * 7));
        }
        
        onResize(newDuration);
      }
      
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  }, [task, onResize, onResizeStart, cellWidth, timeScale]);

  // Handlers for touch events that manage the task card directly
  const handleTaskTouchStart = useCallback((e: React.TouchEvent) => {
    if (resizeHandleRef.current && resizeHandleRef.current.contains(e.target as Node)) {
      // If touching the resize handle, let the resize handler take over
      return;
    }
    
    if (onClick) {
      // Use a flag to differentiate between taps and drags
      let moved = false;
      
      const handleTouchMove = () => {
        moved = true;
      };
      
      const handleTouchEnd = () => {
        if (!moved) {
          onClick();
        }
        
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
      
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
  }, [onClick]);

  const handleTaskTouchMove = useCallback((e: React.TouchEvent) => {
    // Handle touch move for the task card
  }, []);

  const handleTaskTouchEnd = useCallback((e: React.TouchEvent) => {
    // Handle touch end for the task card
  }, []);

  return {
    resizeHandleRef,
    isResizing,
    handleResizeStart,
    handleTaskTouchStart,
    handleTaskTouchMove,
    handleTaskTouchEnd
  };
}
