import { useState, useRef, useEffect, useMemo } from "react";
import { TaskType } from "./task/TaskTypes";
import { Button } from "@/components/ui/button";
import { ChevronLeftSquare, PanelLeft, ZoomIn, ZoomOut, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { useToast } from "@/components/ui/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import { useTaskResize } from "@/hooks/use-task-resize";
import GanttTimeScale from "./GanttTimeScale";
import TodayMarker from "./TodayMarker";
import { format, addDays, addMonths, differenceInDays } from "date-fns";
import GanttSidebar from "./gantt/GanttSidebar";
import GanttGrid from "./gantt/GanttGrid";
import GanttControls from "./gantt/GanttControls";
import { useDependencyMode } from "./gantt/hooks/useDependencyMode";
import { useGanttDateRange } from "./gantt/hooks/useGanttDateRange";
import { useGanttDrag } from "./gantt/hooks/useGanttDrag";

export type TimeScale = "day" | "week" | "month" | "quarter" | "year";

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
  
  const containerRef = useRef<HTMLDivElement>(null);
  const ganttGridRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [baseZoomLevel, setBaseZoomLevel] = useState(1); // Base zoom level (1-5)
  const [timeScale, setTimeScale] = useState<TimeScale>("week");
  const { isMobile } = useMobile();
  const { toast } = useToast();
  
  const { expandedGroups, toggleGroup, isTaskVisible, sortTasksHierarchically } = useGanttDrag(tasks);
  const { createDependencyMode, handleDependencyStartClick, handleGridClick, setCreateDependencyMode } = useDependencyMode(onCreateDependency);
  const { startDate, endDate, calculateDateRange } = useGanttDateRange(tasks, timeScale);
  
  
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
    
    return () => window.removeEventListener('resize', updateWidth);
  }, [tasks]);
  
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
  
  
  const processedTasks = sortTasksHierarchically(tasks);
  const visibleTasks = processedTasks.filter(isTaskVisible);
  
  const handleZoomIn = () => {
    setBaseZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const handleZoomOut = () => {
    setBaseZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const {
    draggingTask,
    dragOverTask,
    dragOverPosition,
    dragOverCell,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleTaskDragOver,
    handleTaskDragLeave,
    handleCellDragOver,
    handleCellDrop,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd
  } = useGanttDrag(tasks, onTaskUpdate, timeUnits, cellWidth, startDate, processedTasks);
  
  const handleTaskClick = (task: TaskType) => {
    if (createDependencyMode && createDependencyMode.active) {
      handleDependencyTargetClick(task.id);
    } else if (onTaskClick) {
      onTaskClick(task);
    }
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
  
  return (
    <div className="rounded-md border overflow-hidden" ref={containerRef}>
      <div className="overflow-auto">
        <div className="flex">
          <GanttSidebar
            visibleTasks={visibleTasks}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            handleDependencyStartClick={handleDependencyStartClick}
            createDependencyMode={createDependencyMode}
            hasEditPermission={hasEditPermission}
            sidebarVisible={sidebarVisible}
            handleTaskDragOver={handleTaskDragOver}
            handleTaskDragLeave={handleTaskDragLeave}
          />
          
          <div className="overflow-auto flex-grow" style={{ minWidth: `${tableWidth}px` }}>
            {/* Usar o novo componente GanttTimeScale */}
            <GanttTimeScale 
              startDate={startDate}
              endDate={endDate}
              timeScale={timeScale}
              cellWidth={cellWidth}
            />
            
            <GanttGrid
              ref={ganttGridRef}
              visibleTasks={visibleTasks}
              timeUnits={timeUnits}
              cellWidth={cellWidth}
              tableWidth={tableWidth}
              getTaskStyle={getTaskStyle}
              handleGridClick={handleGridClick}
              createDependencyMode={createDependencyMode}
              getCurrentDateLinePosition={getCurrentDateLinePosition}
              startDate={startDate}
              endDate={endDate}
              handleTaskDragOver={handleTaskDragOver}
              handleTaskDragLeave={handleTaskDragLeave}
              handleCellDragOver={handleCellDragOver}
              handleCellDrop={handleCellDrop}
              handleTaskClick={handleTaskClick}
              handleTaskDragStart={handleTaskDragStart}
              handleTaskDragEnd={handleTaskDragEnd}
              handleTouchStart={handleTouchStart}
              handleTouchMove={handleTouchMove}
              handleTouchEnd={handleTouchEnd}
              handleTaskResizeStart={handleTaskResizeStart}
              onTaskUpdate={onTaskUpdate}
              hasEditPermission={hasEditPermission}
              timeScale={timeScale}
              dragOverTask={dragOverTask}
              dragOverPosition={dragOverPosition}
              dragOverCell={dragOverCell}
            />
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
      
      <GanttControls
        priorityLegend={priorityLegend}
        handleZoomOut={handleZoomOut}
        timeScale={timeScale}
        handleZoomIn={handleZoomIn}
        exportToImage={exportToImage}
      />
    </div>
  );
};

export default GanttChart;
