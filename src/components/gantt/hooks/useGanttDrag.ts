
import { useState } from 'react';
import { TaskType } from '../../Task';

export function useGanttDrag(
  tasks: TaskType[], 
  hasEditPermission: boolean, 
  onTaskUpdate?: (updatedTask: TaskType) => void
) {
  const [draggingTask, setDraggingTask] = useState<TaskType | null>(null);
  const [dragOverTask, setDragOverTask] = useState<TaskType | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'above' | 'below' | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ weekIndex: number, rowIndex: number } | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  
  const handleTaskDragStart = (e: React.DragEvent | React.TouchEvent, task: TaskType) => {
    if ('dataTransfer' in e) {
      e.dataTransfer.setData("application/x-task-reorder", task.id);
      e.dataTransfer.setData("task-id", task.id);
      e.dataTransfer.effectAllowed = "move";
    }
    
    setDraggingTask(task);
  };
  
  const handleTaskDragEnd = (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>, task: TaskType) => {
    if (dragOverTask && dragOverPosition && onTaskUpdate) {
      const siblingTasks = tasks.filter(t => 
        t.parentId === (task.parentId || null) && t.id !== task.id
      );
      
      let newParentId = task.parentId;
      
      if (dragOverTask.id !== task.id) {
        if (dragOverTask.isGroup) {
          newParentId = dragOverTask.id;
        } 
        else {
          newParentId = dragOverTask.parentId;
        }
        
        if (task.parentId !== newParentId) {
          const updatedTask = { ...task, parentId: newParentId };
          onTaskUpdate(updatedTask);
        }
      }
    }
    
    else if (dragOverCell && onTaskUpdate) {
      const { weekIndex } = dragOverCell;
      
      const timeUnits = document.querySelectorAll('.gantt-grid > div > div > div');
      
      if (weekIndex >= 0 && weekIndex < timeUnits.length) {
        // Get date from the cell using dataset
        const date = new Date();
        date.setDate(date.getDate() + weekIndex);
        const formattedDate = date.toISOString().split('T')[0];
        
        const updatedTask = { ...task, startDate: formattedDate };
        onTaskUpdate(updatedTask);
      }
    }
    
    setDraggingTask(null);
    setDragOverTask(null);
    setDragOverPosition(null);
    setDragOverCell(null);
  };
  
  const handleTaskDragOver = (e: React.DragEvent, task: TaskType) => {
    e.preventDefault();
    
    if (draggingTask && draggingTask.id !== task.id) {
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseY = e.clientY;
      const threshold = rect.top + (rect.height / 2);
      
      const position = mouseY < threshold ? 'above' : 'below';
      
      setDragOverTask(task);
      setDragOverPosition(position);
    }
  };
  
  const handleTaskDragLeave = () => {
    setDragOverTask(null);
    setDragOverPosition(null);
  };
  
  const handleCellDragOver = (e: React.DragEvent, weekIndex: number, rowIndex: number) => {
    e.preventDefault();
    setDragOverCell({ weekIndex, rowIndex });
  };
  
  const handleCellDrop = (e: React.DragEvent, weekIndex: number, rowIndex: number) => {
    e.preventDefault();
    setDragOverCell(null);
  };
  
  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent, task: TaskType) => {
    if (!hasEditPermission) return;
    
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setDraggingTask(task);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingTask || !touchStartX || !hasEditPermission) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // If the user is moving horizontally (changing date)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      const cellWidth = 100; // Default width, will be determined dynamically in real usage
      const cellsMoved = Math.round(deltaX / cellWidth);
      
      if (cellsMoved !== 0) {
        const taskElement = e.currentTarget as HTMLElement;
        const taskRect = taskElement.getBoundingClientRect();
        const gridRect = document.querySelector('.gantt-grid')?.getBoundingClientRect();
        
        if (gridRect) {
          // Calculate the position within the grid
          const posX = taskRect.left - gridRect.left + deltaX;
          const timeIndex = Math.floor(posX / cellWidth);
          
          setDragOverCell({ 
            weekIndex: timeIndex, 
            rowIndex: tasks.findIndex(t => t.id === draggingTask.id) 
          });
        }
      }
      
      e.preventDefault(); // Prevent scrolling
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent, task: TaskType) => {
    if (!hasEditPermission) return;
    
    if (dragOverCell && onTaskUpdate) {
      const { weekIndex } = dragOverCell;
      
      const date = new Date();
      date.setDate(date.getDate() + weekIndex);
      const formattedDate = date.toISOString().split('T')[0];
      
      const updatedTask = { ...task, startDate: formattedDate };
      onTaskUpdate(updatedTask);
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
    setDraggingTask(null);
    setDragOverCell(null);
  };
  
  return {
    draggingTask,
    dragOverTask,
    dragOverPosition,
    dragOverCell,
    setDraggingTask,
    setDragOverTask,
    setDragOverPosition,
    setDragOverCell,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleTaskDragOver,
    handleTaskDragLeave,
    handleCellDragOver,
    handleCellDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  };
}
