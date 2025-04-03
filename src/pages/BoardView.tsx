
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/tasks";
import { TaskType } from "@/components/Task";
import KanbanColumn from "@/components/KanbanColumn";
import KanbanColumnForm from "@/components/KanbanColumnForm";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Columns } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import EmptyTaskState from "@/components/EmptyTaskState";
import LoadingState from "@/components/LoadingState";

export default function BoardView() {
  const { tasks, loading, updateTask, createTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [statuses, setStatuses] = useState<string[]>([
    "Não Iniciado", "Em Andamento", "Concluído"
  ]);
  const [showMobileColumnSelector, setShowMobileColumnSelector] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(statuses);

  useEffect(() => {
    // Extract all unique status values from tasks
    if (tasks && tasks.length > 0) {
      const extractedStatuses = new Set<string>();
      
      // Add default statuses
      extractedStatuses.add("Não Iniciado");
      extractedStatuses.add("Em Andamento");
      extractedStatuses.add("Concluído");
      
      // Add custom statuses from tasks
      tasks.forEach(task => {
        if (!task.isGroup && task.customStatus) {
          extractedStatuses.add(task.customStatus);
        }
      });
      
      setStatuses(Array.from(extractedStatuses));
      setVisibleColumns(Array.from(extractedStatuses).slice(0, 3)); // Show first 3 by default on mobile
    }
  }, [tasks]);

  const handleAddColumn = (columnName: string) => {
    if (columnName && !statuses.includes(columnName)) {
      setStatuses(prev => [...prev, columnName]);
      setVisibleColumns(prev => [...prev, columnName]);
    }
    setShowColumnForm(false);
  };

  const handleTaskClick = (task: TaskType) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const handleTaskCreate = async (task: Omit<TaskType, 'id'>) => {
    await createTask(task);
    setShowTaskForm(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = async (task: TaskType) => {
    await updateTask(task);
    setShowTaskForm(false);
    setSelectedTask(null);
  };

  const handleStatusChange = async (task: TaskType, newStatus: string) => {
    const updatedTask = { ...task, customStatus: newStatus };
    await updateTask(updatedTask);
  };

  const handleToggleColumnVisibility = (status: string) => {
    if (visibleColumns.includes(status)) {
      setVisibleColumns(prev => prev.filter(s => s !== status));
    } else {
      setVisibleColumns(prev => [...prev, status]);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando dados do projeto..." />;
  }

  if (tasks.length === 0) {
    return (
      <EmptyTaskState onAddTask={() => setShowTaskForm(true)} />
    );
  }

  // Group tasks by status
  const groupedTasks = statuses.reduce((acc, status) => {
    acc[status] = tasks.filter(task => 
      !task.isGroup && (
        (status === "Não Iniciado" && (!task.customStatus && task.progress === 0)) ||
        (status === "Em Andamento" && (!task.customStatus && task.progress > 0 && task.progress < 100)) ||
        (status === "Concluído" && (!task.customStatus && task.progress === 100)) ||
        task.customStatus === status
      )
    );
    return acc;
  }, {} as Record<string, TaskType[]>);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold">Quadro Kanban</h2>
          
          {/* Mobile column selector */}
          <div className="md:hidden ml-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMobileColumnSelector(!showMobileColumnSelector)}
            >
              <Columns className="h-4 w-4 mr-1" />
              Colunas ({visibleColumns.length})
            </Button>
            
            {showMobileColumnSelector && (
              <div className="absolute z-10 mt-1 bg-card shadow-lg rounded-md border p-2">
                {statuses.map(status => (
                  <div key={status} className="flex items-center my-1">
                    <input 
                      type="checkbox" 
                      id={`col-${status}`}
                      checked={visibleColumns.includes(status)}
                      onChange={() => handleToggleColumnVisibility(status)}
                      className="mr-2"
                    />
                    <label htmlFor={`col-${status}`} className="text-sm">
                      {status}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowColumnForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Coluna
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => setShowTaskForm(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Tarefa
          </Button>
        </div>
      </div>
      
      <div className="flex-grow overflow-x-auto">
        <div className="flex h-full space-x-4 pb-4">
          {statuses.map(status => (
            visibleColumns.includes(status) && (
              <KanbanColumn
                key={status}
                title={status}
                tasks={groupedTasks[status] || []}
                onTaskClick={handleTaskClick}
                onStatusChange={handleStatusChange}
                statuses={statuses}
              />
            )
          ))}
        </div>
      </div>
      
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <TaskForm
          open={showTaskForm}
          onOpenChange={setShowTaskForm}
          onClose={() => {
            setShowTaskForm(false);
            setTimeout(() => setSelectedTask(null), 200);
          }}
          onSubmit={selectedTask ? handleTaskUpdate : handleTaskCreate}
          initialData={selectedTask}
          tasks={tasks}
          availableStatuses={statuses}
        />
      </Dialog>
      
      <Dialog open={showColumnForm} onOpenChange={setShowColumnForm}>
        <KanbanColumnForm
          open={showColumnForm}
          onOpenChange={setShowColumnForm}
          onAddColumn={handleAddColumn}
          existingColumns={statuses}
        />
      </Dialog>
    </div>
  );
}
