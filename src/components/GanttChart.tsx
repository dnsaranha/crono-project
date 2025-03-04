
import { useState, useRef, useEffect } from "react";
import Task, { TaskType } from "./Task";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

interface GanttChartProps {
  tasks: TaskType[];
  onTaskClick?: (task: TaskType) => void;
  onAddTask?: () => void;
}

const GanttChart = ({ tasks, onTaskClick, onAddTask }: GanttChartProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Sample date range (for the chart header)
  const startDate = new Date(2024, 0, 1); // Jan 1, 2024
  const monthsToShow = 4; // Jan, Feb, Mar, Apr
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
    
    // Initialize all parent tasks as expanded
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
  
  // Generate months for the header
  const months = [];
  for (let i = 0; i < monthsToShow; i++) {
    const month = new Date(startDate);
    month.setMonth(month.getMonth() + i);
    months.push({
      name: month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      weeks: weeksPerMonth
    });
  }
  
  // Generate week numbers for sub-header
  const weeks = [];
  for (let i = 0; i < totalCells; i++) {
    weeks.push(`Semana #${i+1}`);
  }
  
  // Calculate cell width based on container width
  const cellWidth = 100;
  const tableWidth = cellWidth * totalCells;
  
  // Function to calculate task position and width
  const getTaskStyle = (task: TaskType) => {
    // Convert start date to days from project start
    const taskStart = new Date(task.startDate);
    const diffTime = Math.abs(taskStart.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate position and width in pixels
    const position = (diffDays / 7) * cellWidth; // Convert to weeks
    const width = (task.duration / 7) * cellWidth; // Assuming duration is in days, convert to weeks
    
    return {
      marginLeft: `${position}px`,
      width: `${width}px`,
    };
  };

  const isTaskVisible = (task: TaskType) => {
    if (!task.parentId) return true;
    
    // Check if any parent in the hierarchy is collapsed
    let currentParentId = task.parentId;
    while (currentParentId) {
      if (!expandedGroups[currentParentId]) return false;
      
      // Find the parent task to check if it has a parent too
      const parentTask = tasks.find(t => t.id === currentParentId);
      currentParentId = parentTask?.parentId;
    }
    
    return true;
  };

  const visibleTasks = tasks.filter(isTaskVisible);
  
  return (
    <div className="rounded-md border bg-gantt-lightGray overflow-hidden" ref={containerRef}>
      <div className="overflow-auto">
        <div className="flex">
          {/* Task names column */}
          <div className="min-w-64 w-64 border-r bg-white flex-shrink-0">
            <div className="h-24 px-4 flex items-end border-b bg-white">
              <div className="text-sm font-medium text-gray-500 pb-2">Task name</div>
            </div>
            
            {/* Task names */}
            <div>
              {visibleTasks.map((task) => (
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
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gantt chart area */}
          <div className="overflow-auto flex-grow" style={{ minWidth: `${tableWidth}px` }}>
            {/* Months header */}
            <div className="flex h-12 border-b">
              {months.map((month, idx) => (
                <div 
                  key={idx} 
                  className="border-r flex items-center justify-center"
                  style={{ width: `${month.weeks * cellWidth}px` }}
                >
                  <div className="text-sm font-medium text-gray-700">{month.name}</div>
                </div>
              ))}
            </div>
            
            {/* Weeks header */}
            <div className="flex h-12 border-b">
              {weeks.map((week, idx) => (
                <div 
                  key={idx} 
                  className="border-r flex items-center justify-center"
                  style={{ width: `${cellWidth}px` }}
                >
                  <div className="text-xs text-gray-500">{week}</div>
                </div>
              ))}
            </div>
            
            {/* Tasks grid with lines */}
            <div 
              className="gantt-grid relative"
              style={{ height: `${visibleTasks.length * 40}px`, width: `${tableWidth}px` }}
            >
              {/* Task bars */}
              {visibleTasks.map((task, index) => (
                <div 
                  key={task.id} 
                  className="absolute h-10 w-full"
                  style={{ top: `${index * 40}px` }}
                >
                  <Task 
                    task={task}
                    style={getTaskStyle(task)}
                    onClick={onTaskClick}
                  />
                </div>
              ))}
              
              {/* Task connections (simplified) */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none">
                {visibleTasks.map(task => {
                  if (!task.dependencies?.length) return null;
                  
                  return task.dependencies.map(depId => {
                    const dependencyTask = visibleTasks.find(t => t.id === depId);
                    if (!dependencyTask || !isTaskVisible(dependencyTask)) return null;
                    
                    const fromIndex = visibleTasks.findIndex(t => t.id === depId);
                    const toIndex = visibleTasks.findIndex(t => t.id === task.id);
                    
                    // Skip if tasks are not visible
                    if (fromIndex === -1 || toIndex === -1) return null;
                    
                    const fromStyle = getTaskStyle(dependencyTask);
                    const toStyle = getTaskStyle(task);
                    
                    // Calculate end point of from task
                    const fromX = parseInt(fromStyle.marginLeft) + parseInt(fromStyle.width);
                    const fromY = fromIndex * 40 + 20;
                    
                    // Calculate start point of to task
                    const toX = parseInt(toStyle.marginLeft);
                    const toY = toIndex * 40 + 20;
                    
                    // Create a path with bezier curves
                    const midX = (fromX + toX) / 2;
                    
                    return (
                      <path
                        key={`${depId}-${task.id}`}
                        className="gantt-connection"
                        d={`M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`}
                      />
                    );
                  });
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {onAddTask && (
        <div className="p-2 bg-white border-t">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full flex items-center justify-center text-primary"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>Adicionar Tarefa</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default GanttChart;
