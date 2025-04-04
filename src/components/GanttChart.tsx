import React, { useState, useEffect, useRef } from "react";
import { format, isEqual, add, differenceInDays, parseISO, startOfDay, isBefore, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskType } from './Task';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Moon,
  Plus,
  Sun,
  SunMedium,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowRight,
  ArrowLeft,
  MoreVertical,
  FileText,
  Trash2,
  ChevronDown,
  CheckCircle2,
  CircleDashed,
  Clock,
  Settings,
  Users,
  Pencil
} from "lucide-react";
import { TodayMarker } from "./TodayMarker";
import { Task } from "./Task";
import { cn } from "@/lib/utils";
import html2canvas from "html2canvas";
import { useTaskResize } from "@/hooks/use-task-resize";

export interface GanttProps {
  tasks: TaskType[];
  onTaskClick?: (taskId: string) => void;
  onTaskUpdate?: (task: TaskType) => void;
  onTaskDelete?: (taskId: string) => void;
  onAddDependency?: (predecessorId: string, successorId: string) => void;
  canEdit?: boolean;
  showToolbar?: boolean;
  selectedTaskId?: string | null;
  setDependencyMode?: React.Dispatch<React.SetStateAction<boolean>>;
  dependencyMode?: boolean;
  dependenciesMap?: Record<string, string[]>;
  onDateRangeChanged?: (startDate: Date, endDate: Date) => void;
}

export const GanttChart = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onAddDependency,
  canEdit = true,
  showToolbar = true,
  selectedTaskId = null,
  setDependencyMode,
  dependencyMode = false,
  dependenciesMap = {},
  onDateRangeChanged
}: GanttProps) => {
  // References
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ganttRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<SVGLineElement>(null); // Changed to SVGLineElement
  
  // Task resize hook
  const { handleTaskResizeStart } = useTaskResize({
    onTaskUpdate,
    timeScale: "day",
    cellWidth: 50,
    hasEditPermission: Boolean(canEdit)
  });

  // State for dates and view
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(add(new Date(), { months: 3 }));
  const [daysToShow, setDaysToShow] = useState<Date[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [cellWidth, setCellWidth] = useState(50);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [isDraggingTask, setIsDraggingTask] = useState(false);
  const [draggedTask, setDraggedTask] = useState<TaskType | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    name: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    duration: "1",
  });
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Dependency mode state
  const [activePredecessor, setActivePredecessor] = useState<string | null>(null);
  
  // Calculate date range based on tasks
  useEffect(() => {
    if (tasks.length === 0) return;
    
    let earliest = new Date();
    let latest = add(new Date(), { months: 3 });
    
    tasks.forEach(task => {
      const taskStart = parseISO(task.startDate);
      const taskEnd = add(taskStart, { days: task.duration });
      
      if (isBefore(taskStart, earliest)) {
        earliest = taskStart;
      }
      
      if (isAfter(taskEnd, latest)) {
        latest = taskEnd;
      }
    });
    
    // Add buffer days
    earliest = add(earliest, { days: -3 });
    latest = add(latest, { days: 7 });
    
    setStartDate(earliest);
    setEndDate(latest);
    
    if (onDateRangeChanged) {
      onDateRangeChanged(earliest, latest);
    }
  }, [tasks]);
  
  // Generate days to show based on start and end date
  useEffect(() => {
    const days: Date[] = [];
    let current = startOfDay(startDate);
    const end = startOfDay(endDate);
    
    while (!isAfter(current, end)) {
      days.push(current);
      current = add(current, { days: 1 });
    }
    
    setDaysToShow(days);
  }, [startDate, endDate]);
  
  // Calculate cell width based on view mode
  useEffect(() => {
    switch (viewMode) {
      case 'day':
        setCellWidth(50);
        break;
      case 'week':
        setCellWidth(70);
        break;
      case 'month':
        setCellWidth(120);
        break;
    }
  }, [viewMode]);
  
  // Ensure tasks is an array
  const tasksArray = Array.isArray(tasks) ? tasks : [];
  
  // Helpers
  const isMilestone = (task: TaskType) => task.isMilestone;
  const isGroup = (task: TaskType) => task.isGroup;
  
  const getTaskChildren = (taskId: string) => {
    return tasksArray.filter(task => task.parentId === taskId);
  };
  
  const hasChildren = (taskId: string) => {
    return tasksArray.some(task => task.parentId === taskId);
  };
  
  // Task filtering and organization
  const rootTasks = tasksArray.filter(task => !task.parentId);
  
  const getTaskPosition = (task: TaskType) => {
    const taskStart = parseISO(task.startDate);
    const daysDiff = differenceInDays(taskStart, startDate);
    const leftPos = daysDiff * cellWidth;
    const width = task.isMilestone ? cellWidth : task.duration * cellWidth;
    
    return {
      left: leftPos,
      width: width,
    };
  };
  
  const getTaskDependencies = (taskId: string) => {
    return dependenciesMap[taskId] || [];
  };
  
  const toggleGroupExpand = (taskId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };
  
  const isGroupExpanded = (taskId: string) => {
    return expandedGroups[taskId] !== false; // Default to true if not set
  };
  
  // Handle scroll to today
  const scrollToToday = () => {
    if (todayRef.current && scrollContainerRef.current) {
      const todayLeft = todayRef.current.offsetLeft;
      scrollContainerRef.current.scrollLeft = todayLeft - 100;
    }
  };
  
  // Zoom controls
  const zoomIn = () => {
    setCellWidth(prev => Math.min(prev + 10, 120));
  };
  
  const zoomOut = () => {
    setCellWidth(prev => Math.max(prev - 10, 20));
  };
  
  // Date navigation
  const moveLeft = () => {
    setStartDate(prev => add(prev, { days: -7 }));
    setEndDate(prev => add(prev, { days: -7 }));
  };
  
  const moveRight = () => {
    setStartDate(prev => add(prev, { days: 7 }));
    setEndDate(prev => add(prev, { days: 7 }));
  };
  
  // Export as image
  const exportAsImage = async () => {
    if (!ganttRef.current) return;
    
    try {
      const canvas = await html2canvas(ganttRef.current, {
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true
      });
      
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `gantt-chart-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.click();
    } catch (error) {
      console.error("Error generating chart image:", error);
    }
  };
  
  const handleTaskClick = (taskId: string) => {
    if (dependencyMode && activePredecessor) {
      // Add dependency
      if (activePredecessor !== taskId && onAddDependency) {
        onAddDependency(activePredecessor, taskId);
      }
      setActivePredecessor(null);
      return;
    }
    
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };
  
  const handleDependencyStart = (taskId: string) => {
    setActivePredecessor(taskId);
  };
  
  // Include the remaining components inline (would normally be separate files)
  const TaskNameItem = ({ task, level, tasks, isExpanded, toggleExpand, hasChildren, canEdit, onTaskDelete, selectedTaskId }) => {
    const hasTaskChildren = hasChildren(task.id);
    const paddingLeft = level * 16 + 8;
    const children = tasks.filter(t => t.parentId === task.id);
    
    return (
      <>
        <div 
          className={cn(
            "flex items-center border-b py-2 px-2 pr-4 min-h-[40px]",
            selectedTaskId === task.id ? "bg-primary/10" : "hover:bg-muted/50"
          )}
          style={{ paddingLeft: `${paddingLeft}px` }}
        >
          {hasTaskChildren && (
            <button 
              onClick={() => toggleExpand(task.id)} 
              className="mr-1 p-1 rounded hover:bg-muted"
            >
              {isExpanded(task.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {task.isGroup ? (
              <FolderIcon size={14} className="shrink-0 text-amber-500" />
            ) : task.isMilestone ? (
              <DiamondIcon size={14} className="shrink-0 text-purple-500" />
            ) : (
              <TaskIcon size={14} className="shrink-0 text-blue-500" />
            )}
            
            <span className="truncate">
              {task.name}
            </span>
          </div>
          
          {canEdit && onTaskDelete && (
            <div className="ml-auto flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-6 w-6 p-0 ml-1">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTaskDelete(task.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        {hasTaskChildren && isExpanded(task.id) && children.map(child => (
          <TaskNameItem
            key={child.id}
            task={child}
            level={level + 1}
            tasks={tasks}
            isExpanded={isExpanded}
            toggleExpand={toggleExpand}
            hasChildren={hasChildren}
            canEdit={canEdit}
            onTaskDelete={onTaskDelete}
            selectedTaskId={selectedTaskId}
          />
        ))}
      </>
    );
  };

  const RenderTasksRecursively = ({ task, tasks, taskIndex, level, getTaskPosition, onTaskClick, handleTaskResizeStart, isGroupExpanded, dependencyMode, handleDependencyStart, activePredecessor, getTaskDependencies, selectedTaskId, canEdit }) => {
    const children = tasks.filter(t => t.parentId === task.id);
    const taskPosition = getTaskPosition(task);
    const hasTaskChildren = children.length > 0;
    const isDependencySource = activePredecessor === task.id;
    const isDependencyTarget = activePredecessor !== null && activePredecessor !== task.id;
    const dependencies = getTaskDependencies(task.id);
    
    return (
      <>
        <div
          className={cn(
            "absolute h-10 flex items-center",
            selectedTaskId === task.id ? "z-20" : "z-10"
          )}
          style={{
            left: `${taskPosition.left}px`,
            top: `${taskIndex * 40}px`,
            width: `${taskPosition.width}px`,
          }}
        >
          <Task
            task={task}
            style={taskPosition}
            onClick={() => onTaskClick(task.id)}
            onResizeStart={(e) => handleTaskResizeStart(e, task)}
            className={cn(
              selectedTaskId === task.id && "ring-2 ring-primary ring-offset-2",
              isDependencySource && "ring-2 ring-amber-500",
              isDependencyTarget && "ring-2 ring-blue-500 animate-pulse"
            )}
            dependencies={dependencies}
            dependencyMode={dependencyMode}
            onDependencyStart={() => handleDependencyStart(task.id)}
            canEdit={canEdit}
          />
        </div>
        
        {hasTaskChildren && isGroupExpanded(task.id) && children.map((child, index) => (
          <RenderTasksRecursively
            key={child.id}
            task={child}
            tasks={tasks}
            taskIndex={taskIndex + index + 1}
            level={level + 1}
            getTaskPosition={getTaskPosition}
            onTaskClick={onTaskClick}
            handleTaskResizeStart={handleTaskResizeStart}
            isGroupExpanded={isGroupExpanded}
            dependencyMode={dependencyMode}
            handleDependencyStart={handleDependencyStart}
            activePredecessor={activePredecessor}
            getTaskDependencies={getTaskDependencies}
            selectedTaskId={selectedTaskId}
            canEdit={canEdit}
          />
        ))}
      </>
    );
  };

  // Small icon components
  const TaskIcon = ({ size, className }) => (
    <div className={cn("flex-none", className)}>
      <CircleDashed size={size} />
    </div>
  );

  const FolderIcon = ({ size, className }) => (
    <div className={cn("flex-none", className)}>
      <Settings size={size} />
    </div>
  );

  const DiamondIcon = ({ size, className }) => (
    <div className={cn("flex-none", className)}>
      <CheckCircle2 size={size} />
    </div>
  );

  return (
    <div className="flex flex-col w-full h-full" ref={containerRef}>
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-2 p-2 border-b">
          <div className="flex-1 flex flex-wrap gap-1">
            {/* Zoom controls */}
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToToday}
              className="h-8"
            >
              Hoje
            </Button>
            
            {/* Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={moveLeft}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={moveRight}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* View mode selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                >
                  {viewMode === "day" ? "Dia" : viewMode === "week" ? "Semana" : "Mês"}
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setViewMode("day")}>
                  Dia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("week")}>
                  Semana
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode("month")}>
                  Mês
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Dependency mode toggle */}
            {setDependencyMode && (
              <Button
                variant={dependencyMode ? "default" : "outline"}
                size="sm"
                onClick={() => setDependencyMode(!dependencyMode)}
                className="h-8"
              >
                {dependencyMode ? "Sair do Modo Dependência" : "Modo Dependência"}
              </Button>
            )}
          </div>
          
          <div className="flex gap-1">
            {/* Add task dialog */}
            {canEdit && (
              <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="h-8 gap-1"
                  >
                    <Plus className="h-4 w-4" /> Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
                    <DialogDescription>
                      Preencha os detalhes para criar uma nova tarefa
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        Nome
                      </label>
                      <Input
                        id="name"
                        value={newTask.name}
                        onChange={(e) => setNewTask({...newTask, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="startDate" className="text-right">
                        Data Inicial
                      </label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newTask.startDate}
                        onChange={(e) => setNewTask({...newTask, startDate: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="duration" className="text-right">
                        Duração (dias)
                      </label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={newTask.duration}
                        onChange={(e) => setNewTask({...newTask, duration: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddTaskDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" onClick={() => {
                      // TODO: Add new task logic
                      setShowAddTaskDialog(false);
                    }}>
                      Adicionar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={exportAsImage}
              className="h-8"
            >
              <FileText className="h-4 w-4 mr-1" /> Exportar
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar with task names */}
        <div className="flex flex-col min-w-[200px] max-w-[300px] border-r">
          {/* Header */}
          <div className="flex items-center h-10 px-3 border-b bg-muted/50 font-medium">
            Nome da Tarefa
          </div>
          
          {/* Tasks list */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {rootTasks.map((task) => (
                <TaskNameItem 
                  key={task.id} 
                  task={task} 
                  level={0} 
                  tasks={tasksArray}
                  isExpanded={isGroupExpanded}
                  toggleExpand={toggleGroupExpand}
                  hasChildren={hasChildren}
                  canEdit={canEdit}
                  onTaskDelete={onTaskDelete}
                  selectedTaskId={selectedTaskId}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* Gantt chart area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex flex-col h-full">
            {/* Date header */}
            <div className="flex border-b sticky top-0 z-10 bg-background">
              <div className="flex flex-shrink-0">
                {daysToShow.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex flex-col items-center justify-center border-r border-b h-10",
                      isEqual(day, startOfDay(new Date())) ? "bg-blue-50 dark:bg-blue-950" : "bg-muted/50"
                    )}
                    style={{ width: `${cellWidth}px` }}
                  >
                    <div className="text-xs font-medium">
                      {format(day, "EEE", { locale: ptBR })}
                    </div>
                    <div className="text-xs">
                      {format(day, "dd/MM")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Gantt chart content with scrolling */}
            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-auto"
            >
              <div 
                ref={ganttRef}
                className="relative"
                style={{ 
                  width: `${daysToShow.length * cellWidth}px`,
                  minHeight: `${rootTasks.length * 40}px` 
                }}
              >
                {/* Grid lines */}
                {daysToShow.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "absolute top-0 bottom-0 border-r",
                      isEqual(day, startOfDay(new Date())) ? "bg-blue-50/50 dark:bg-blue-950/20" : "",
                      format(day, "E") === "Sun" || format(day, "E") === "Sat" ? "bg-gray-50 dark:bg-gray-800/20" : ""
                    )}
                    style={{
                      left: `${index * cellWidth}px`,
                      width: `${cellWidth}px`,
                      height: "100%"
                    }}
                  />
                ))}
                
                {/* Today marker */}
                <TodayMarker 
                  startDate={startDate}
                  cellWidth={cellWidth}
                  ref={todayRef}
                />
                
                {/* Tasks bars */}
                {rootTasks.map((task, taskIndex) => (
                  <RenderTasksRecursively
                    key={task.id}
                    task={task}
                    tasks={tasksArray}
                    taskIndex={taskIndex}
                    level={0}
                    getTaskPosition={getTaskPosition}
                    onTaskClick={handleTaskClick}
                    handleTaskResizeStart={handleTaskResizeStart}
                    isGroupExpanded={isGroupExpanded}
                    dependencyMode={dependencyMode}
                    handleDependencyStart={handleDependencyStart}
                    activePredecessor={activePredecessor}
                    getTaskDependencies={getTaskDependencies}
                    selectedTaskId={selectedTaskId}
                    canEdit={canEdit}
                  />
                ))}
                
                {/* Dependency lines */}
                {Object.entries(dependenciesMap).map(([predId, successors]) => (
                  successors.map((succId) => {
                    const predecessor = tasksArray.find(t => t.id === predId);
                    const successor = tasksArray.find(t => t.id === succId);
                    
                    if (!predecessor || !successor) return null;
                    
                    const predPos = getTaskPosition(predecessor);
                    const predEnd = predPos.left + predPos.width;
                    const succPos = getTaskPosition(successor);
                    
                    // Find vertical positions
                    const predTaskIndex = tasksArray.findIndex(t => t.id === predId);
                    const succTaskIndex = tasksArray.findIndex(t => t.id === succId);
                    
                    const predY = (predTaskIndex + 0.5) * 40;
                    const succY = (succTaskIndex + 0.5) * 40;
                    
                    return (
                      <svg
                        key={`${predId}-${succId}`}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{
                          zIndex: 5,
                          overflow: "visible"
                        }}
                      >
                        <defs>
                          <marker
                            id="arrowhead"
                            markerWidth="10"
                            markerHeight="7"
                            refX="0"
                            refY="3.5"
                            orient="auto"
                          >
                            <polygon
                              points="0 0, 10 3.5, 0 7"
                              className="fill-current text-blue-500"
                            />
                          </marker>
                        </defs>
                        <path
                          d={`M ${predEnd} ${predY} H ${(predEnd + succPos.left) / 2} V ${succY} H ${succPos.left}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-blue-500"
                          strokeDasharray="4"
                          markerEnd="url(#arrowhead)"
                        />
                      </svg>
                    );
                  })
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
