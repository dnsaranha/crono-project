import { useState, useRef, useEffect, useMemo, TouchEvent } from "react";
import Task, { TaskType } from "./Task";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ChevronLeftSquare, PanelLeft, 
         ZoomIn, ZoomOut, Download, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useTaskResize } from "@/hooks/use-task-resize";
import GanttTimeScale from "./GanttTimeScale";
import TodayMarker from "./TodayMarker";
import { format, isWithinInterval, addDays, addWeeks, addMonths, differenceInDays } from "date-fns";

interface GanttChartProps {
  tasks: TaskType[];
  onTaskClick?: (task: TaskType) => void;
  onAddTask?: () => void;
  onTaskUpdate?: (updatedTask: TaskType) => void;
  onCreateDependency?: (sourceId: string, targetId: string) => void;
  sidebarVisible?: boolean;
  onToggleSidebar?: () => void;
  hasEditPermission?: boolean;
}

type TimeScale = "day" | "week" | "month" | "quarter" | "year";

const GanttChart = ({ 
  tasks, 
  onTaskClick, 
  onAddTask, 
  onTaskUpdate,
  onCreateDependency,
  sidebarVisible = true,
  onToggleSidebar,
  hasEditPermission = true
}: GanttChartProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [draggingTask, setDraggingTask] = useState<TaskType | null>(null);
  const [dragOverTask, setDragOverTask] = useState<TaskType | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'above' | 'below' | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{ weekIndex: number, rowIndex: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttGridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [createDependencyMode, setCreateDependencyMode] = useState<{active: boolean, sourceId: string} | null>(null);
  const [baseZoomLevel, setBaseZoomLevel] = useState(1); // Base zoom level (1-5)
  const [timeScale, setTimeScale] = useState<TimeScale>("week");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const { isMobile } = useMobile();
  
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
    
    // Adjust start date to beginning of month/week based on timeScale
    if (timeScale === "month" || timeScale === "quarter" || timeScale === "year") {
      earliestStart.setDate(1); // Start of month
    } else {
      // Start of week (Sunday)
      const day = earliestStart.getDay();
      earliestStart.setDate(earliestStart.getDate() - day);
    }
    
    // Add buffer to end date
    if (timeScale === "month" || timeScale === "quarter" || timeScale === "year") {
      latestEnd.setMonth(latestEnd.getMonth() + 1);
      latestEnd = new Date(latestEnd.getFullYear(), latestEnd.getMonth() + 1, 0); // End of month
    } else {
      latestEnd.setDate(latestEnd.getDate() + 14); // Add two weeks buffer
    }
    
    return { startDate: earliestStart, endDate: latestEnd };
  };
  
  const dateRange = calculateDateRange();
  const startDate = dateRange.startDate;
  const endDate = dateRange.endDate;
  
  // Dynamically determine time scale units based on zoom level
  const determineTimeScaleFromZoom = (zoom: number) => {
    if (zoom <= 0.6) return "month";
    if (zoom <= 0.8) return "week";
    return "day";
  };
  
  // Update time scale when zoom changes
  useEffect(() => {
    const newTimeScale = determineTimeScaleFromZoom(baseZoomLevel);
    setTimeScale(newTimeScale);
  }, [baseZoomLevel]);
  
  const getTimeUnitCount = () => {
    switch (timeScale) {
      case "day":
        return differenceInDays(endDate, startDate) + 1;
      case "week":
        return Math.ceil(differenceInDays(endDate, startDate) / 7);
      case "month":
        return (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
               (endDate.getMonth() - startDate.getMonth()) + 1;
      default:
        return Math.ceil(differenceInDays(endDate, startDate) / 7);
    }
  };
  
  const timeUnits = useMemo(() => {
    const units = [];
    let current = new Date(startDate);
    
    switch (timeScale) {
      case "day":
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: format(current, "dd/MM")
          });
          current = addDays(current, 1);
        }
        break;
      case "week":
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: `${format(current, "dd/MM")} - ${format(addDays(current, 6), "dd/MM")}`
          });
          current = addDays(current, 7);
        }
        break;
      case "month":
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: format(current, "MMM yyyy")
          });
          current = addMonths(current, 1);
        }
        break;
      default:
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: `Semana ${format(current, "dd/MM")}`
          });
          current = addDays(current, 7);
        }
    }
    
    return units;
  }, [startDate, endDate, timeScale]);
  
  // Calculate cell width based on zoom level and screen size
  const getCellWidth = () => {
    const baseWidth = timeScale === "day" ? 40 : timeScale === "week" ? 100 : 160;
    const zoomFactor = baseZoomLevel;
    
    // Adjust for mobile
    const mobileAdjust = isMobile ? 0.8 : 1;
    
    return Math.max(30, baseWidth * zoomFactor * mobileAdjust);
  };
  
  const cellWidth = getCellWidth();
  const tableWidth = cellWidth * timeUnits.length;
  
  // Adicionar o hook useTaskResize
  const { handleTaskResizeStart } = useTaskResize({
    onTaskResize: onTaskUpdate,
    timeScale,
    cellWidth,
    hasEditPermission: Boolean(hasEditPermission)
  });
  
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
  
  const getTaskStyle = (task: TaskType) => {
    const taskStart = new Date(task.startDate);
    let position = 0;
    let width = 0;
    
    switch (timeScale) {
      case "day":
        position = differenceInDays(taskStart, startDate) * cellWidth;
        width = task.duration * cellWidth / 1;
        break;
      case "week":
        position = Math.floor(differenceInDays(taskStart, startDate) / 7) * cellWidth;
        width = Math.ceil(task.duration / 7) * cellWidth;
        break;
      case "month":
        const monthDiff = (taskStart.getFullYear() - startDate.getFullYear()) * 12 + 
                          (taskStart.getMonth() - startDate.getMonth());
        position = monthDiff * cellWidth;
        width = Math.ceil(task.duration / 30) * cellWidth;
        break;
      default:
        position = differenceInDays(taskStart, startDate) / 7 * cellWidth;
        width = task.duration / 7 * cellWidth;
    }
    
    return {
      marginLeft: `${position}px`,
      width: `${Math.max(width, 4)}px`, // Ensure minimum width
    };
  };

  const getCurrentDateLinePosition = () => {
    const today = new Date();
    
    switch (timeScale) {
      case "day":
        return differenceInDays(today, startDate) * cellWidth;
      case "week":
        return differenceInDays(today, startDate) / 7 * cellWidth;
      case "month":
        const monthDiff = (today.getFullYear() - startDate.getFullYear()) * 12 + 
                          (today.getMonth() - startDate.getMonth());
        const daysIntoMonth = today.getDate() / new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        return (monthDiff + daysIntoMonth) * cellWidth;
      default:
        return differenceInDays(today, startDate) / 7 * cellWidth;
    }
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

  const sortTasksHierarchically = (taskList: TaskType[]): TaskType[] => {
    const topLevelTasks = taskList.filter(t => !t.parentId);
    
    const getTaskWithChildren = (parentTask: TaskType): TaskType[] => {
      const children = taskList.filter(t => t.parentId === parentTask.id);
      
      if (children.length === 0) {
        return [parentTask];
      }
      
      return [
        parentTask,
        ...children.flatMap(child => getTaskWithChildren(child))
      ];
    };
    
    return topLevelTasks.flatMap(task => getTaskWithChildren(task));
  };

  const processedTasks = sortTasksHierarchically(tasks);
  const visibleTasks = processedTasks.filter(isTaskVisible);
  
  const handleZoomIn = () => {
    setBaseZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setBaseZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  // Helper function to get date from position
  const getDateFromPosition = (xPosition: number) => {
    const cellIndex = Math.floor(xPosition / cellWidth);
    
    if (cellIndex < 0 || cellIndex >= timeUnits.length) {
      return null;
    }
    
    return timeUnits[cellIndex].date;
  };
  
  const handleTaskDragStart = (e: React.DragEvent | React.TouchEvent, task: TaskType) => {
    if (createDependencyMode) {
      if ('preventDefault' in e) e.preventDefault();
      return;
    }
    
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
      
      const targetIndex = processedTasks.findIndex(t => t.id === dragOverTask.id);
      
      let newParentId = task.parentId;
      
      if (dragOverTask.id !== task.id) {
        if (dragOverTask.isGroup) {
          newParentId = dragOverTask.id;
          setExpandedGroups(prev => ({
            ...prev,
            [dragOverTask.id]: true
          }));
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
      
      if (weekIndex >= 0 && weekIndex < timeUnits.length) {
        const newStartDate = timeUnits[weekIndex].date;
        const formattedDate = newStartDate.toISOString().split('T')[0];
        
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
  const handleTouchStart = (e: TouchEvent, task: TaskType) => {
    if (!hasEditPermission) return;
    
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setDraggingTask(task);
  };
  
  const handleTouchMove = (e: TouchEvent) => {
    if (!draggingTask || !touchStartX || !hasEditPermission) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    
    // If the user is moving horizontally (changing date)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      // Calculate cell movement
      const cellsMoved = Math.round(deltaX / cellWidth);
      
      if (cellsMoved !== 0 && ganttGridRef.current) {
        const taskElement = e.currentTarget as HTMLElement;
        const taskRect = taskElement.getBoundingClientRect();
        const gridRect = ganttGridRef.current.getBoundingClientRect();
        
        // Calculate the position within the grid
        const posX = taskRect.left - gridRect.left + deltaX;
        const timeIndex = Math.floor(posX / cellWidth);
        
        if (timeIndex >= 0 && timeIndex < timeUnits.length) {
          setDragOverCell({ 
            weekIndex: timeIndex, 
            rowIndex: processedTasks.findIndex(t => t.id === draggingTask.id) 
          });
        }
      }
      
      e.preventDefault(); // Prevent scrolling
    }
  };
  
  const handleTouchEnd = (e: TouchEvent, task: TaskType) => {
    if (!hasEditPermission) return;
    
    if (dragOverCell && onTaskUpdate) {
      const { weekIndex } = dragOverCell;
      
      if (weekIndex >= 0 && weekIndex < timeUnits.length) {
        const newStartDate = timeUnits[weekIndex].date;
        const formattedDate = newStartDate.toISOString().split('T')[0];
        
        const updatedTask = { ...task, startDate: formattedDate };
        onTaskUpdate(updatedTask);
      }
    }
    
    setTouchStartX(null);
    setTouchStartY(null);
    setDraggingTask(null);
    setDragOverCell(null);
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

  // Função para exportar o gráfico como imagem
  const exportToImage = async () => {
    if (!containerRef.current) return;
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        allowTaint: true,
        useCORS: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        scale: 1.5
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `gantt-${new Date().toISOString().split('T')[0]}.png`;
      link.href = image;
      link.click();
      
      // Feedback para o usuário
      toast({
        title: "Exportado com sucesso",
        description: "A imagem do gráfico de Gantt foi baixada.",
      });
    } catch (error) {
      console.error("Erro ao exportar imagem:", error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o gráfico como imagem.",
        variant: "destructive",
      });
    }
  };
  
  const priorityLegend = [
    { level: 1, label: "Muito Baixa", color: "bg-gray-400" },
    { level: 2, label: "Baixa", color: "bg-blue-400" },
    { level: 3, label: "Média", color: "bg-green-400" },
    { level: 4, label: "Alta", color: "bg-yellow-400" },
    { level: 5, label: "Muito Alta", color: "bg-red-400" }
  ];
  
  // Importe o hook useToast
  const { toast } = useToast();
  
  return (
    <div className="rounded-md border overflow-hidden" ref={containerRef}>
      <div className="overflow-auto">
        <div className="flex">
          {sidebarVisible && (
            <div className="min-w-48 w-48 border-r bg-card flex-shrink-0 sm:min-w-64 sm:w-64">
              <div className="h-24 px-4 flex items-end border-b">
                <div className="text-sm font-medium text-muted-foreground pb-2">Nome da Tarefa</div>
              </div>
              
              <div>
                {visibleTasks.map((task, rowIndex) => (
                  <div 
                    key={task.id} 
                    className={`h-10 flex items-center px-2 sm:px-4 border-b ${
                      task.isGroup ? 'bg-gantt-gray' : 'bg-card'
                    } ${
                      dragOverTask?.id === task.id && dragOverPosition === 'above' 
                        ? 'border-t-2 border-t-primary' 
                        : dragOverTask?.id === task.id && dragOverPosition === 'below'
                        ? 'border-b-2 border-b-primary'
                        : ''
                    }`}
                    onDragOver={(e) => hasEditPermission ? handleTaskDragOver(e, task) : null}
                    onDragLeave={handleTaskDragLeave}
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
                        className={`ml-1 text-xs sm:text-sm truncate flex-1 ${task.isGroup ? 'font-medium' : ''}`}
                        style={{ paddingLeft: task.parentId ? '12px' : '0px' }}
                      >
                        {task.name}
                      </div>
                      
                      {!task.isGroup && hasEditPermission && (
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
          )}
          
          <div className="overflow-auto flex-grow" style={{ minWidth: `${tableWidth}px` }}>
            {/* Usar o novo componente GanttTimeScale */}
            <GanttTimeScale 
              startDate={startDate}
              endDate={endDate}
              timeScale={timeScale}
              cellWidth={cellWidth}
            />
            
            <div 
              ref={ganttGridRef}
              className={`gantt-grid relative ${createDependencyMode?.active ? 'dependency-mode' : ''}`}
              style={{ height: `${visibleTasks.length * 40}px`, width: `${tableWidth}px` }}
              onClick={handleGridClick}
            >
              <svg className="absolute inset-0 h-full w-full pointer-events-none z-20">
                {/* Usar o novo componente TodayMarker */}
                <TodayMarker 
                  startDate={startDate}
                  endDate={endDate}
                  position={getCurrentDateLinePosition()}
                />
                
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
              
              {visibleTasks.map((task, rowIndex) => (
                <div 
                  key={task.id} 
                  className={`absolute h-10 w-full ${
                    dragOverTask?.id === task.id && dragOverPosition === 'above' 
                      ? 'border-t-2 border-t-primary' 
                      : dragOverTask?.id === task.id && dragOverPosition === 'below'
                      ? 'border-b-2 border-b-primary'
                      : ''
                  }`}
                  style={{ top: `${rowIndex * 40}px` }}
                  onDragOver={(e) => hasEditPermission ? handleTaskDragOver(e, task) : null}
                  onDragLeave={handleTaskDragLeave}
                >
                  <div className="absolute inset-0 flex">
                    {timeUnits.map((unit, timeIndex) => (
                      <div
                        key={timeIndex}
                        className={`h-full ${
                          dragOverCell?.weekIndex === timeIndex && dragOverCell?.rowIndex === rowIndex
                            ? 'bg-blue-100 dark:bg-blue-900/20'
                            : ''
                        }`}
                        style={{ 
                          width: `${cellWidth}px`,
                          minWidth: `${cellWidth}px`
                        }}
                        onDragOver={(e) => hasEditPermission ? handleCellDragOver(e, timeIndex, rowIndex) : null}
                        onDrop={(e) => hasEditPermission ? handleCellDrop(e, timeIndex, rowIndex) : null}
                      />
                    ))}
                  </div>
                  
                  <Task 
                    task={task}
                    style={getTaskStyle(task)}
                    onClick={() => handleTaskClick(task)}
                    onDragStart={hasEditPermission ? (e) => handleTaskDragStart(e, task) : undefined}
                    onDragEnd={hasEditPermission ? (e) => handleTaskDragEnd(e, task) : undefined}
                    onTouchStart={hasEditPermission ? (e) => handleTouchStart(e, task) : undefined}
                    onTouchMove={hasEditPermission ? handleTouchMove : undefined}
                    onTouchEnd={hasEditPermission ? (e) => handleTouchEnd(e, task) : undefined}
                    cellWidth={cellWidth}
                    onResize={hasEditPermission ? (newDuration) => 
                      onTaskUpdate?.({ ...task, duration: newDuration }) : undefined}
                    onResizeStart={hasEditPermission ? (e) => handleTaskResizeStart(e, task) : undefined}
                    className={createDependencyMode?.active ? 
                      createDependencyMode.sourceId === task.id ? 
                        'dependency-source' : 'dependency-target-candidate' 
                      : ''}
                    timeScale={timeScale}
                    draggable={hasEditPermission}
                  />
                </div>
              ))}
              
              {createDependencyMode?.active && (
                <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-auto z-50 pointer-events-none">
                  <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md shadow-md">
                    Clique em uma tarefa para criar dependência
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Toggle sidebar button - better placement for mobile */}
          <div className="absolute left-0 top-24 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="bg-card/70 hover:bg-card border-r border-t border-b rounded-l-none"
              aria-label={sidebarVisible ? "Esconder lista de tarefas" : "Mostrar lista de tarefas"}
            >
              {sidebarVisible ? (
                <ChevronLeftSquare className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-2 bg-card border-t flex flex-wrap justify-between items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
              <span>Dependências</span>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4">
            {priorityLegend.map(priority => (
              <div key={priority.level} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${priority.color} mr-1`}></div>
                <span className="text-xs text-muted-foreground">{priority.label}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background dark:bg-gray-800"
              onClick={handleZoomOut}
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-10 text-center">
              {timeScale === "day" ? "Dias" : timeScale === "week" ? "Semanas" : "Meses"}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-background dark:bg-gray-800"
              onClick={handleZoomIn}
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Botão para exportar como imagem */}
          <Button
            variant="outline"
            size="sm"
            className="ml-0 sm:ml-2"
            onClick={exportToImage}
            title="Exportar como imagem"
          >
            <Download className="h-4 w-4 mr-0 sm:mr-1" />
