import { useState, useEffect, useRef } from "react";
import { useTasks } from "@/hooks/useTasks";
import GanttChart from "@/components/GanttChart";
import NewTaskButton from "@/components/NewTaskButton";
import { TaskType } from "@/components/Task";
import { useToast } from "@/components/ui/use-toast";
import TaskForm from "@/components/TaskForm";
import { Button } from "@/components/ui/button";
import { Download, SidebarClose, SidebarOpen } from "lucide-react";
import html2canvas from "html2canvas";

const GanttView = () => {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const ganttRef = useRef<HTMLDivElement>(null);
  const { tasks, loading, updateTask, createTask, createDependency, getProjectMembers } = useTasks();
  
  useEffect(() => {
    loadProjectMembers();
  }, []);

  const loadProjectMembers = async () => {
    const members = await getProjectMembers();
    setProjectMembers(members);
  };
  
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
        duration: taskData.duration || 1,
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

  // Function to export Gantt chart as PNG
  const exportAsPNG = async () => {
    if (!ganttRef.current) return;
    
    try {
      const canvas = await html2canvas(ganttRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });
      
      const img = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'cronogram-gantt.png';
      link.href = img;
      link.click();
      
      toast({
        title: "Exportação concluída",
        description: "O gráfico Gantt foi exportado com sucesso.",
      });
    } catch (error) {
      console.error('Error exporting gantt chart:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar o gráfico Gantt.",
        variant: "destructive"
      });
    }
  };

  // Sort tasks to make sure subtasks appear under their parent
  const sortedTasks = [...tasks].sort((a, b) => {
    // If both tasks have the same parent, sort them normally
    if (a.parentId === b.parentId) return 0;
    
    // If b is a child of a, a comes first
    if (b.parentId === a.id) return -1;
    
    // If a is a child of b, b comes first
    if (a.parentId === b.id) return 1;
    
    // Otherwise, maintain original order
    return 0;
  });

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Projeto</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarVisible(!sidebarVisible)}
            className="ml-2"
            title={sidebarVisible ? "Esconder barra lateral" : "Mostrar barra lateral"}
          >
            {sidebarVisible ? <SidebarClose className="h-5 w-5" /> : <SidebarOpen className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportAsPNG}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            Exportar PNG
          </Button>
          <NewTaskButton onClick={handleAddTask} />
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          Carregando tarefas...
        </div>
      ) : sortedTasks.length === 0 ? (
        <div className="bg-card shadow-sm rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">Nenhuma tarefa encontrada para este projeto</p>
          <NewTaskButton onClick={handleAddTask} />
        </div>
      ) : (
        <div ref={ganttRef} className="bg-card shadow-sm rounded-lg overflow-hidden">
          <GanttChart 
            tasks={sortedTasks} 
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onTaskUpdate={handleTaskUpdate}
            onCreateDependency={handleTaskDependencyCreated}
            sidebarVisible={sidebarVisible}
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
        projectMembers={projectMembers}
      />
    </div>
  );
};

export default GanttView;
