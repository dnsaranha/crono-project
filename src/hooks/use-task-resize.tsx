
import { useState, useCallback } from 'react';
import { TaskType } from '@/components/Task';

interface UseTaskResizeProps {
  onTaskResize?: (task: TaskType, newDuration: number) => void;
  onTaskUpdate?: (task: TaskType) => void; // Added for GanttChart
  timeScale: 'day' | 'week' | 'month' | 'quarter' | 'year';
  cellWidth: number;
  hasEditPermission: boolean;
}

export function useTaskResize({ onTaskResize, onTaskUpdate, timeScale, cellWidth, hasEditPermission }: UseTaskResizeProps) {
  const [resizingTask, setResizingTask] = useState<{
    task: TaskType;
    startX: number;
    startDuration: number;
    element?: HTMLElement;
  } | null>(null);

  const handleTaskResizeStart = useCallback((
    e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>, 
    task: TaskType
  ) => {
    if ((!onTaskResize && !onTaskUpdate) || !hasEditPermission) return;
    
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const targetElement = e.currentTarget.parentElement as HTMLElement;
    
    if (!targetElement) return;

    setResizingTask({
      task,
      startX: clientX,
      startDuration: task.duration,
      element: targetElement
    });
    
    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!resizingTask) return;
      
      const moveClientX = 'touches' in moveEvent 
        ? (moveEvent as TouchEvent).touches[0].clientX 
        : (moveEvent as MouseEvent).clientX;
      
      const diff = moveClientX - resizingTask.startX;
      
      // Calculate how many days to add/remove based on timeScale and diff
      let daysChange = 0;
      
      switch (timeScale) {
        case "day":
          daysChange = Math.round(diff / cellWidth);
          break;
        case "week":
          daysChange = Math.round((diff / cellWidth) * 7);
          break;
        case "month":
          daysChange = Math.round((diff / cellWidth) * 30);
          break;
        default:
          daysChange = Math.round((diff / cellWidth) * 7);
      }
      
      const newDuration = Math.max(1, resizingTask.startDuration + daysChange);
      
      if (resizingTask.element) {
        const width = Math.max(4, getTaskDurationWidth(newDuration, timeScale, cellWidth));
        resizingTask.element.style.width = `${width}px`;
      }
    };
    
    const handleEnd = () => {
      if (!resizingTask || !resizingTask.element) return;
      
      let finalDuration = 0;
      
      // Calculate final duration based on element width
      const elementWidth = parseInt(resizingTask.element.style.width || '0');
      
      switch (timeScale) {
        case "day":
          finalDuration = Math.max(1, Math.round(elementWidth / cellWidth));
          break;
        case "week":
          finalDuration = Math.max(1, Math.round((elementWidth / cellWidth) * 7));
          break;
        case "month":
          finalDuration = Math.max(1, Math.round((elementWidth / cellWidth) * 30));
          break;
        default:
          finalDuration = Math.max(1, Math.round((elementWidth / cellWidth) * 7));
      }
      
      const updatedTask = { ...resizingTask.task, duration: finalDuration };
      
      if (onTaskResize) {
        onTaskResize(resizingTask.task, finalDuration);
      } else if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
      
      setResizingTask(null);
      
      document.removeEventListener('mousemove', handleMove as EventListener);
      document.removeEventListener('touchmove', handleMove as EventListener);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
    
    document.addEventListener('mousemove', handleMove as EventListener);
    document.addEventListener('touchmove', handleMove as EventListener);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  }, [onTaskResize, onTaskUpdate, hasEditPermission, cellWidth, timeScale, resizingTask]);

  // Helper para calcular a largura da tarefa com base na duração
  const getTaskDurationWidth = (duration: number, scale: string, width: number) => {
    switch (scale) {
      case "day":
        return duration * width / 1;
      case "week":
        return Math.ceil(duration / 7) * width;
      case "month":
        return Math.ceil(duration / 30) * width;
      default:
        return duration / 7 * width;
    }
  };

  return {
    handleTaskResizeStart,
    resizingTask
  };
}
