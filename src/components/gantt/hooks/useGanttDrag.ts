
import { useState } from 'react';
import { TaskType } from '../../task';

interface TimeUnit {
  date: Date;
  label: string;
}

export function useGanttDrag(
  tasks: TaskType[] = [], 
  onTaskUpdate?: (updatedTask: TaskType) => void,
  timeUnits?: TimeUnit[],
  cellWidth?: number,
  startDate?: Date,
  processedTasks?: TaskType[]
) {
  // Drag and drop state
  const [draggingTask, setDraggingTask] = useState<TaskType | null>(null);
  const [dragOverTask, setDragOverTask] = useState<TaskType | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'above' | 'below' | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ weekIndex: number, rowIndex: number } | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  
  // Group expansion state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Toggle group expansion
  const toggleGroup = (taskId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  // Check if task should be visible (used for collapsing groups)
  const isTaskVisible = (task: TaskType): boolean => {
    if (!task.parentId) return true;
    
    // Check if any parent in the hierarchy is collapsed
    let currentParentId = task.parentId;
    const parentChain = [currentParentId];
    
    // Build chain of parents
    while (currentParentId) {
      const parent = tasks.find(t => t.id === currentParentId);
      if (!parent) break;
      
      if (parent.parentId) {
        parentChain.push(parent.parentId);
        currentParentId = parent.parentId;
      } else {
        break;
      }
    }
    
    // Check if any parent is collapsed
    for (const pid of parentChain) {
      if (expandedGroups[pid] === false) return false;
    }
    
    return true;
  };
  
  // Sort tasks hierarchically
  const sortTasksHierarchically = (taskList: TaskType[]): TaskType[] => {
    const result: TaskType[] = [];
    const added = new Set<string>();
    
    // Add root tasks first
    const rootTasks = taskList.filter(t => !t.parentId);
    
    // Recursive function to add tasks in hierarchy
    const addTaskWithChildren = (task: TaskType) => {
      if (added.has(task.id)) return;
      
      result.push(task);
      added.add(task.id);
      
      // Find and add children
      const children = taskList.filter(t => t.parentId === task.id);
      children.forEach(addTaskWithChildren);
    };
    
    // Process all root tasks
    rootTasks.forEach(addTaskWithChildren);
    
    // Add any remaining tasks that might not be connected in hierarchy
    taskList.forEach(task => {
      if (!added.has(task.id)) {
        result.push(task);
        added.add(task.id);
      }
    });
    
    return result;
  };
  
  // Drag handlers
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
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setDraggingTask(task);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!draggingTask || !touchStartX) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // If the user is moving horizontally (changing date)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      const defaultCellWidth = 100; // Default width, will be determined dynamically in real usage
      const actualCellWidth = cellWidth || defaultCellWidth;
      const cellsMoved = Math.round(deltaX / actualCellWidth);
      
      if (cellsMoved !== 0) {
        const taskElement = e.currentTarget as HTMLElement;
        const taskRect = taskElement.getBoundingClientRect();
        const gridRect = document.querySelector('.gantt-grid')?.getBoundingClientRect();
        
        if (gridRect) {
          // Calculate the position within the grid
          const posX = taskRect.left - gridRect.left + deltaX;
          const timeIndex = Math.floor(posX / actualCellWidth);
          
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
    if (dragOverCell && onTaskUpdate) {
      const { weekIndex } = dragOverCell;
      
      if (timeUnits && weekIndex >= 0 && weekIndex < timeUnits.length && startDate) {
        // Get the date at the target cell
        const targetDate = new Date(startDate);
        targetDate.setDate(targetDate.getDate() + weekIndex * 7); // Assuming weekly units
        const formattedDate = targetDate.toISOString().split('T')[0];
        
        const updatedTask = { ...task, startDate: formattedDate };
        onTaskUpdate(updatedTask);
      }
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
    expandedGroups,
    toggleGroup,
    isTaskVisible,
    sortTasksHierarchically,
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
