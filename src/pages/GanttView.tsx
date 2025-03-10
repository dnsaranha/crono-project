
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GanttChart } from "@/components/GanttChart";
import TaskForm from "@/components/TaskForm";
import { TaskType } from "@/components/Task";
import { useTasks } from "@/hooks/useTasks";
import { useToast } from "@/components/ui/use-toast";
import NewTaskButton from "@/components/NewTaskButton";
import LoadingState from "@/components/LoadingState";
import EmptyTaskState from "@/components/EmptyTaskState";
import ViewHeader from "@/components/ViewHeader";
import { Route } from "lucide-react";
import CriticalPathView from "@/components/CriticalPathView";

const GanttView = () => {
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [isCriticalPathOpen, setIsCriticalPathOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  
  const { tasks, loading, updateTask, createTask, createDependency, getProjectMembers } = useTasks();

  useState(() => {
    const loadMembers = async () => {
      const members = await getProjectMembers();
      setProjectMembers(members);
    };
    
    loadMembers();
  });

  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task);
    setIsNewTask(false);
    setIsTaskFormOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsNewTask(true);
    setIsTaskFormOpen(true);
  };

  const handleTaskFormSubmit = async (taskData: Partial<TaskType>) => {
    if (isNewTask) {
      // Create new task
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
      }
    } else if (selectedTask) {
      // Update existing task
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
      }
    }
  };

  const handleDependencyCreated = async (sourceId: string, targetId: string) => {
    if (sourceId === targetId) {
      toast({
        title: "Dependência inválida",
        description: "Uma tarefa não pode depender de si mesma.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for circular dependency
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
    
    // Check if the target task already depends on the source task (directly or indirectly)
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

  return (
    <div className="flex flex-col">
      <ViewHeader 
        title="Gráfico de Gantt" 
        onAddItem={handleAddTask}
        extraActions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsCriticalPathOpen(true)} 
            className="flex items-center"
          >
            <Route className="mr-2 h-4 w-4" />
            Caminho Crítico
          </Button>
        }
      />
      
      {loading ? (
        <LoadingState />
      ) : tasks.length === 0 ? (
        <EmptyTaskState onAddTask={handleAddTask} />
      ) : (
        <div className="gantt-container flex-1 min-h-[500px] overflow-auto bg-white dark:bg-gray-800 rounded-md shadow">
          <GanttChart 
            tasks={tasks} 
            onTaskClick={handleEditTask}
            onDependencyCreated={handleDependencyCreated}
          />
        </div>
      )}
      
      <NewTaskButton onClick={handleAddTask} />
      
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSubmit={handleTaskFormSubmit}
        tasks={tasks}
        isNew={isNewTask}
        projectMembers={projectMembers}
      />
      
      <CriticalPathView 
        open={isCriticalPathOpen}
        onOpenChange={setIsCriticalPathOpen}
      />
    </div>
  );
};

export default GanttView;
