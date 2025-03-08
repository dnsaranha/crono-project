import { useState, useRef, useEffect } from "react";
import Task, { TaskType } from "./Task";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus, ZoomIn, ZoomOut } from "lucide-react";

interface GanttChartProps {
  tasks: TaskType[];
  onTaskClick?: (task: TaskType) => void;
  onAddTask?: () => void;
  onTaskUpdate?: (updatedTask: TaskType) => void;
  onCreateDependency?: (sourceId: string, targetId: string) => void;
}

const GanttChart = ({ 
  tasks, 
  onTaskClick, 
  onAddTask, 
  onTaskUpdate,
  onCreateDependency
}: GanttChartProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [draggingTask, setDraggingTask] = useState<TaskType | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ weekIndex: number, rowIndex: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttGridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [createDependencyMode, setCreateDependencyMode] = useState<{active: boolean, sourceId: string} | null>(null);
  const [cellWidth, setCellWidth] = useState(100); // Base cell width
  const [zoomLevel, setZoomLevel] = useState(1); // Default zoom level
  
  const calculateDateRange = () => {
    if (!tasks || tasks.length === 0) {
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(today.getMonth() + 1);
      
      return {
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(oneMonthLater.getFullYear(), oneMonthLater.getMonth() + 2, 0)
      };
    }
    
    let earliestStart = new Date();
    let latestEnd = new Date();
    
    tasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      
      const taskEnd = new Date(taskStart);
      taskEnd.setDate(taskStart.getDate() + (task.duration || 0));
      
      if (taskStart < earliestStart || earliestStart.toString() === new Date().toString()) {
        earliestStart = new Date(taskStart);
      }
      
      if (taskEnd > latestEnd) {
        latestEnd = new Date(taskEnd);
      }
    });
    
    earliestStart.setDate(1);
    latestEnd.setMonth(latestEnd.getMonth() + 1);
    latestEnd = new Date(latestEnd.getFullYear(), latestEnd.getMonth() + 1, 0);
    
    return { startDate: earliestStart, endDate: latestEnd };
  };
  
  const dateRange = calculateDateRange();
  const startDate = dateRange.startDate;
  const endDate = dateRange.endDate;
  
  const getMonthDifference = (start: Date, end: Date) => {
    return (end.getFullYear() - start.getFullYear()) * 12 + 
           (end.getMonth() - start.getMonth()) + 1;
  };
  
  const monthsToShow = getMonthDifference(startDate, endDate);
  const weeksPerMonth = 4;
  const totalCells = monthsToShow * weeksPerMonth;
  
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    
    const initialExpanded: Record<string, boolean> = {};
    tasks.filter(t => t.isGroup).forEach(task => {
      initialExpanded[task.id] = true;
    });
    setExpandedGroups(initialExpanded);
    
    return () => window.removeEventListener('resize', updateWidth);
  }, [tasks]);
  
  const toggleGroup = (taskId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const months = [];
  for (let i = 0; i < monthsToShow; i++) {
    const month = new Date(startDate);
    month.setMonth(month.getMonth() + i);
    months.push({
      name: month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      weeks: weeksPerMonth
    });
  }
  
  const weeks = [];
  for (let i = 0; i < totalCells; i++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(weekDate.getDate() + (i * 7));
    weeks.push(`Semana ${weekDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'numeric' })}`);
  }
  
  const actualCellWidth = cellWidth * zoomLevel;
  const tableWidth = actualCellWidth * totalCells;
  
  const getTaskStyle = (task: TaskType) => {
    const taskStart = new Date(task.startDate);
    const diffTime = Math.abs(taskStart.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const position = (diffDays / 7) * actualCellWidth;
    const width = (task.duration / 7) * actualCellWidth;
    
    return {
      marginLeft: `${position}px`,
      width: `${width}px`,
    };
  };

  const isTaskVisible = (task: TaskType) => {
    if (!task.parentId) return true;
    
    let currentParentId = task.parentId;
    while (currentParentId) {
      if (!expandedGroups[currentParentId]) return false;
      
      const parentTask = tasks.find(t => t.id === currentParentId);
      currentParentId = parentTask?.parentId;
    }
    
    return true;
  };

  const visibleTasks = tasks.filter(isTaskVisible);
  
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const handleTaskDragStart = (e: React.DragEvent, task: TaskType) => {
    if (createDependencyMode) {
      e.preventDefault();
      return;
    }
    
    setDraggingTask(task);
    e.dataTransfer.setData("task-id", task.id);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleTaskDragEnd = (e: React.DragEvent, task: TaskType) => {
    if (dragOverCell && onTaskUpdate) {
      const { weekIndex } = dragOverCell;
      
      const newStartDate = new Date(startDate);
      newStartDate.setDate(newStartDate.getDate() + (weekIndex * 7));
      
      const formattedDate = newStartDate.toISOString().split('T')[0];
      
      const updatedTask = { ...task, startDate: formattedDate };
      onTaskUpdate(updatedTask);
    }
    
    setDraggingTask(null);
    setDragOverCell(null);
  };
  
  const handleCellDragOver = (e: React.DragEvent, weekIndex: number, rowIndex: number) => {
    e.preventDefault();
    setDragOverCell({ weekIndex, rowIndex });
  };
  
  const handleCellDrop = (e: React.DragEvent, weekIndex: number, rowIndex: number) => {
    e.preventDefault();
    setDragOverCell(null);
  };
  
  const handleTaskResize = (task: TaskType, newDuration: number) => {
    if (onTaskUpdate) {
      const updatedTask = { ...task, duration: newDuration };
      onTaskUpdate(updatedTask);
    }
  };
  
  const handleDependencyStartClick = (taskId: string) => {
    setCreateDependencyMode({
      active: true,
      sourceId: taskId
    });
  };
  
  const handleDependencyTargetClick = (taskId: string) => {
    if (createDependencyMode && createDependencyMode.active) {
      if (createDependencyMode.sourceId !== taskId) {
        if (onCreateDependency) {
          onCreateDependency(createDependencyMode.sourceId, taskId);
        }
      }
      
      setCreateDependencyMode(null);
    }
  };
  
  const handleTaskClick = (task: TaskType) => {
    if (createDependencyMode && createDependencyMode.active) {
      handleDependencyTargetClick(task.id);
    } else if (onTaskClick) {
      onTaskClick(task);
    }
  };
  
  const handleGridClick = (e: React.MouseEvent) => {
    if (createDependencyMode && e.target === ganttGridRef.current) {
      setCreateDependencyMode(null);
    }
  };
  
  return (
    <div className="rounded-md border bg-gantt-lightGray overflow-hidden" ref={containerRef}>
      <div className="overflow-auto">
        <div className="flex">
          <div className="min-w-64 w-64 border-r bg-white flex-shrink-0">
            <div className="h-24 px-4 flex items-end border-b bg-white">
              <div className="text-sm font-medium text-gray-500 pb-2">Nome da Tarefa</div>
            </div>
            
            <div>
              {visibleTasks.map((task, rowIndex) => (
                <div 
                  key={task.id} 
                  className={`h-10 flex items-center px-4 border-b ${task.isGroup ? 'bg-gantt-gray' : 'bg-white'}`}
                >
                  <div className="flex items-center w-full">
                    <div className="w-5 flex-shrink-0">
                      {task.isGroup && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 p-0"
                          onClick={() => toggleGroup(task.id)}
                        >
                          {expandedGroups[task.id] ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div 
                      className={`ml-1 text-sm truncate flex-1 ${task.isGroup ? 'font-medium' : ''}`}
                      style={{ paddingLeft: task.parentId ? '12px' : '0px' }}
                    >
                      {task.name}
                    </div>
                    
                    {!task.isGroup && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 rounded-full ${createDependencyMode?.sourceId === task.id ? 'bg-yellow-200' : ''}`}
                        onClick={() => handleDependencyStartClick(task.id)}
                        title="Criar dependência a partir desta tarefa"
                      >
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="overflow-auto flex-grow" style={{ minWidth: `${tableWidth}px` }}>
            <div className="flex h-12 border-b">
              {months.map((month, idx) => (
                <div 
                  key={idx} 
                  className="border-r flex items-center justify-center"
                  style={{ width: `${month.weeks * actualCellWidth}px` }}
                >
                  <div className="text-sm font-medium text-gray-700">{month.name}</div>
                </div>
              ))}
            </div>
            
            <div className="flex h-12 border-b">
              {weeks.map((week, idx) => (
                <div 
                  key={idx} 
                  className="border-r flex items-center justify-center"
                  style={{ width: `${actualCellWidth}px` }}
                >
                  <div className="text-xs text-gray-500">{week}</div>
                </div>
              ))}
            </div>
            
            <div 
              ref={ganttGridRef}
              className={`gantt-grid relative ${createDependencyMode?.active ? 'dependency-mode' : ''}`}
              style={{ height: `${visibleTasks.length * 40}px`, width: `${tableWidth}px` }}
              onClick={handleGridClick}
            >
              {visibleTasks.map((task, rowIndex) => (
                <div 
                  key={task.id} 
                  className="absolute h-10 w-full"
                  style={{ top: `${rowIndex * 40}px` }}
                >
                  <div className="absolute inset-0 flex">
                    {Array.from({ length: totalCells }).map((_, weekIndex) => (
                      <div
                        key={weekIndex}
                        className={`h-full ${
                          dragOverCell?.weekIndex === weekIndex && dragOverCell?.rowIndex === rowIndex
                            ? 'bg-blue-100'
                            : ''
                        }`}
                        style={{ width: `${actualCellWidth}px` }}
                        onDragOver={(e) => handleCellDragOver(e, weekIndex, rowIndex)}
                        onDrop={(e) => handleCellDrop(e, weekIndex, rowIndex)}
                      />
                    ))}
                  </div>
                  
                  <Task 
                    task={task}
                    style={getTaskStyle(task)}
                    onClick={handleTaskClick}
                    onDragStart={handleTaskDragStart}
                    onDragEnd={handleTaskDragEnd}
                    cellWidth={actualCellWidth}
                    onResize={handleTaskResize}
                    className={createDependencyMode?.active ? 
                      createDependencyMode.sourceId === task.id ? 
                        'dependency-source' : 'dependency-target-candidate' 
                      : ''}
                  />
                </div>
              ))}
              
              <svg className="absolute inset-0 h-full w-full pointer-events-none">
                {visibleTasks.map(task => {
                  if (!task.dependencies?.length) return null;
                  
                  return task.dependencies.map(depId => {
                    const dependencyTask = visibleTasks.find(t => t.id === depId);
                    if (!dependencyTask || !isTaskVisible(dependencyTask)) return null;
                    
                    const fromIndex = visibleTasks.findIndex(t => t.id === depId);
                    const toIndex = visibleTasks.findIndex(t => t.id === task.id);
                    
                    if (fromIndex === -1 || toIndex === -1) return null;
                    
                    const fromStyle = getTaskStyle(dependencyTask);
                    const toStyle = getTaskStyle(task);
                    
                    const fromX = parseInt(fromStyle.marginLeft) + parseInt(fromStyle.width);
                    const fromY = fromIndex * 40 + 20;
                    
                    const toX = parseInt(toStyle.marginLeft);
                    const toY = toIndex * 40 + 20;
                    
                    const midX = (fromX + toX) / 2;
                    
                    return (
                      <path
                        key={`${depId}-${task.id}`}
                        className="gantt-connection"
                        d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                        markerEnd="url(#arrowhead)"
                      />
                    );
                  });
                })}
                
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#FFB236" />
                  </marker>
                </defs>
              </svg>
              
              {createDependencyMode?.active && (
                <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10">
                  <div className="absolute text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded shadow-sm">
                    Clique em uma tarefa para criar dependência
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2 bg-white border-t flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
              <span>Dependências</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleZoomOut}
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-gray-500 min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={handleZoomIn}
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {!createDependencyMode?.active && onAddTask && (
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Adicionar Tarefa</span>
          </Button>
        )}
        
        {createDependencyMode?.active && (
          <Button 
            variant="outline" 
            size="sm"
            className="text-yellow-600 border-yellow-300"
            onClick={() => setCreateDependencyMode(null)}
          >
            Cancelar criação de dependência
          </Button>
        )}
      </div>
    </div>
  );
};

export default GanttChart;
