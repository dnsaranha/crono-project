
import { useState, useEffect, useRef } from "react";
import { useParams, useOutletContext, useSearchParams } from "react-router-dom";
import GanttChart from "@/components/GanttChart";
import TaskForm from "@/components/TaskForm";
import { TaskType } from "@/components/Task";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/components/ui/use-toast";
import NewTaskButton from "@/components/NewTaskButton";
import LoadingState from "@/components/LoadingState";
import EmptyTaskState from "@/components/EmptyTaskState";
import ViewHeader from "@/components/ViewHeader";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

type ContextType = { hasEditPermission: boolean };

const GanttView = () => {
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const { hasEditPermission } = useOutletContext<ContextType>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const ganttRef = useRef<HTMLDivElement>(null);
  
  const { tasks, loading, updateTask, createTask, createDependency, getProjectMembers } = useTasks();

  useEffect(() => {
    const loadMembers = async () => {
      const members = await getProjectMembers();
      setProjectMembers(members);
    };
    
    loadMembers();
  }, [getProjectMembers]);

  // Check for task ID in URL params to open edit form
  useEffect(() => {
    const taskId = searchParams.get('taskId');
    if (taskId && hasEditPermission) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setIsNewTask(false);
        setIsTaskFormOpen(true);
      }
    }
  }, [searchParams, tasks, hasEditPermission]);

  const handleEditTask = (task: TaskType) => {
    if (!hasEditPermission) return;
    
    setSelectedTask(task);
    setIsNewTask(false);
    setIsTaskFormOpen(true);
  };

  const handleAddTask = () => {
    if (!hasEditPermission) return;
    
    setSelectedTask(null);
    setIsNewTask(true);
    setIsTaskFormOpen(true);
  };

  const handleTaskFormSubmit = async (taskData: Partial<TaskType>) => {
    if (!hasEditPermission) return;
    
    if (isNewTask) {
      const newTaskDetails: Omit<TaskType, 'id'> = {
        name: taskData.name || "Nova Tarefa",
        startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        duration: taskData.duration || 7,
        progress: taskData.progress || 0,
        dependencies: taskData.dependencies || [],
        assignees: taskData.assignees || [],
        isGroup: taskData.isGroup || false,
        isMilestone: taskData.isMilestone || false,
        parentId: taskData.parentId,
        priority: taskData.priority || 3
      };
      
      const result = await createTask(newTaskDetails);
      
      if (result) {
        toast({
          title: "Tarefa adicionada",
          description: `${newTaskDetails.name} foi adicionada com sucesso.`,
        });
        setIsTaskFormOpen(false);
        
        // Remove taskId from URL if present
        if (searchParams.has('taskId')) {
          searchParams.delete('taskId');
          setSearchParams(searchParams);
        }
      }
    } else if (selectedTask) {
      const updatedTaskData: TaskType = {
        ...selectedTask,
        ...taskData
      };
      
      const success = await updateTask(updatedTaskData);
      
      if (success) {
        toast({
          title: "Tarefa atualizada",
          description: `${updatedTaskData.name} foi atualizada com sucesso.`,
        });
        setIsTaskFormOpen(false);
        
        // Remove taskId from URL if present
        if (searchParams.has('taskId')) {
          searchParams.delete('taskId');
          setSearchParams(searchParams);
        }
      }
    }
  };

  const handleDependencyCreated = async (sourceId: string, targetId: string) => {
    if (!hasEditPermission) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para criar dependências.",
        variant: "destructive",
      });
      return;
    }
    
    if (sourceId === targetId) {
      toast({
        title: "Dependência inválida",
        description: "Uma tarefa não pode depender de si mesma.",
        variant: "destructive",
      });
      return;
    }
    
    const sourceTask = tasks.find(t => t.id === sourceId);
    const targetTask = tasks.find(t => t.id === targetId);
    
    if (!sourceTask || !targetTask) {
      toast({
        title: "Erro",
        description: "Tarefa não encontrada.",
        variant: "destructive",
      });
      return;
    }
    
    const hasCyclicDependency = (checkId: string, visitedIds = new Set<string>()): boolean => {
      if (checkId === sourceId) return true;
      if (visitedIds.has(checkId)) return false;
      
      visitedIds.add(checkId);
      
      const task = tasks.find(t => t.id === checkId);
      if (task?.dependencies?.length) {
        for (const depId of task.dependencies) {
          if (hasCyclicDependency(depId, new Set(visitedIds))) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    if (hasCyclicDependency(targetId)) {
      toast({
        title: "Dependência cíclica",
        description: "Esta dependência criaria um ciclo entre as tarefas.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await createDependency(sourceId, targetId);
    
    if (success) {
      toast({
        title: "Dependência criada",
        description: "A dependência foi criada com sucesso.",
      });
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const exportGanttChart = async () => {
    if (!ganttRef.current) return;
    
    try {
      const element = ganttRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2, // Higher resolution
      });
      
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = 'gantt-chart.png';
      link.href = image;
      link.click();
      
      toast({
        title: "Gráfico Exportado",
        description: "Imagem do gráfico de Gantt salva com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar gráfico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o gráfico.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <ViewHeader 
        title="Gráfico de Gantt" 
        onAddItem={hasEditPermission ? handleAddTask : undefined}
        buttonText="Nova Tarefa"
        extraActions={
          <Button
            variant="outline"
            size="sm"
            onClick={exportGanttChart}
            className="flex items-center ml-2"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        }
        hideAddButton={!hasEditPermission}
      />
      
      {loading ? (
        <LoadingState />
      ) : tasks.length === 0 ? (
        <EmptyTaskState onAddTask={hasEditPermission ? handleAddTask : undefined} hideAddButton={!hasEditPermission} />
      ) : (
        <div ref={ganttRef} className="gantt-container flex-1 min-h-[500px] overflow-auto bg-white dark:bg-gray-800 rounded-md shadow">
          <GanttChart 
            tasks={tasks} 
            onTaskClick={hasEditPermission ? handleEditTask : undefined}
            onCreateDependency={hasEditPermission ? handleDependencyCreated : undefined}
            onAddTask={hasEditPermission ? handleAddTask : undefined}
            sidebarVisible={sidebarVisible}
            onToggleSidebar={toggleSidebar}
            hasEditPermission={hasEditPermission}
          />
        </div>
      )}
      
      {hasEditPermission && <NewTaskButton onClick={handleAddTask} />}
      
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSubmit={handleTaskFormSubmit}
        tasks={tasks}
        isNew={isNewTask}
        projectMembers={projectMembers}
        readOnly={!hasEditPermission}
      />
    </div>
  );
};

export default GanttView;
