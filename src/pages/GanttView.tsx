
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import GanttChart from "@/components/GanttChart";
import NewTaskButton from "@/components/NewTaskButton";
import { TaskType } from "@/components/Task";
import { useToast } from "@/components/ui/use-toast";
import TaskForm from "@/components/TaskForm";

const GanttView = () => {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const { tasks, loading, updateTask, createTask, createDependency } = useTasks();
  
  const handleTaskClick = (task: TaskType) => {
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
      // Criar nova tarefa
      const newTaskDetails: Omit<TaskType, 'id'> = {
        name: taskData.name || "Nova Tarefa",
        startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        duration: taskData.duration || 7,
        progress: taskData.progress || 0,
        dependencies: taskData.dependencies || [],
        isGroup: taskData.isGroup || false,
        parentId: taskData.parentId
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
      // Atualizar tarefa existente
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
  
  const handleTaskUpdate = async (updatedTask: TaskType) => {
    const success = await updateTask(updatedTask);
    
    if (success) {
      toast({
        title: "Tarefa atualizada",
        description: `${updatedTask.name} foi atualizada com sucesso.`,
      });
    }
  };
  
  const handleTaskDependencyCreated = async (sourceId: string, targetId: string) => {
    // Verificar que a tarefa alvo existe
    const targetTask = tasks.find(t => t.id === targetId);
    if (!targetTask) return;
    
    // Verificar se a dependência já existe
    const dependencies = targetTask.dependencies || [];
    if (dependencies.includes(sourceId)) return;
    
    // Verificar dependência circular
    if (wouldCreateCircularDependency(sourceId, targetId, tasks)) {
      toast({
        title: "Erro",
        description: "Não é possível criar uma dependência circular.",
        variant: "destructive"
      });
      return;
    }
    
    const success = await createDependency(sourceId, targetId);
    
    if (success) {
      toast({
        title: "Dependência criada",
        description: "Dependência adicionada com sucesso.",
      });
    }
  };
  
  // Função para verificar se adicionar uma dependência criaria uma dependência circular
  function wouldCreateCircularDependency(sourceId: string, targetId: string, allTasks: TaskType[], visited: Set<string> = new Set()): boolean {
    // Se já visitamos esta tarefa neste caminho, não há ciclo
    if (visited.has(targetId)) return false;
    
    const target = allTasks.find(t => t.id === targetId);
    if (!target) return false;

    // Marcar tarefa atual como visitada neste caminho
    visited.add(targetId);
    
    // Se o alvo depende da origem diretamente, criaria um ciclo
    if (target.id === sourceId) return true;
    
    // Verificar recursivamente cada dependência
    if (target.dependencies) {
      for (const depId of target.dependencies) {
        if (wouldCreateCircularDependency(sourceId, depId, allTasks, new Set(visited))) {
          return true;
        }
      }
    }
    
    return false;
  }

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Projeto</h1>
        <NewTaskButton onClick={handleAddTask} />
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          Carregando tarefas...
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma tarefa encontrada para este projeto</p>
          <NewTaskButton onClick={handleAddTask} />
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <GanttChart 
            tasks={tasks} 
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onTaskUpdate={handleTaskUpdate}
            onCreateDependency={handleTaskDependencyCreated}
          />
        </div>
      )}
      
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSubmit={handleTaskFormSubmit}
        tasks={tasks}
        isNew={isNewTask}
      />
    </div>
  );
};

export default GanttView;
