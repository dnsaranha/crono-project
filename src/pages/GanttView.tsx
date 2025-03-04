
import { useState } from "react";
import Navbar from "@/components/Navbar";
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
  
  // Sample tasks data
  const [tasks, setTasks] = useState<TaskType[]>([
    {
      id: "task-1",
      name: "Planejamento",
      startDate: "2024-01-01",
      duration: 30,
      isGroup: true,
      progress: 100
    },
    {
      id: "task-1-1",
      name: "Definir Escopo",
      startDate: "2024-01-01",
      duration: 10,
      parentId: "task-1",
      progress: 100
    },
    {
      id: "task-1-2",
      name: "Análise de Requisitos",
      startDate: "2024-01-11",
      duration: 10,
      parentId: "task-1",
      progress: 100,
      dependencies: ["task-1-1"]
    },
    {
      id: "task-1-3",
      name: "Cronograma Inicial",
      startDate: "2024-01-21",
      duration: 10,
      parentId: "task-1",
      progress: 100,
      dependencies: ["task-1-2"]
    },
    {
      id: "task-2",
      name: "Desenvolvimento",
      startDate: "2024-02-01",
      duration: 60,
      isGroup: true,
      progress: 60,
      dependencies: ["task-1"]
    },
    {
      id: "task-2-1",
      name: "Frontend",
      startDate: "2024-02-01",
      duration: 30,
      parentId: "task-2",
      progress: 100
    },
    {
      id: "task-2-2",
      name: "Backend",
      startDate: "2024-02-15",
      duration: 30,
      parentId: "task-2",
      progress: 70,
      dependencies: ["task-2-1"]
    },
    {
      id: "task-2-3",
      name: "Banco de Dados",
      startDate: "2024-03-01",
      duration: 20,
      parentId: "task-2",
      progress: 30,
      dependencies: ["task-2-2"]
    },
    {
      id: "task-3",
      name: "Testes",
      startDate: "2024-04-01",
      duration: 30,
      isGroup: true,
      progress: 0,
      dependencies: ["task-2"]
    },
    {
      id: "task-3-1",
      name: "Testes Unitários",
      startDate: "2024-04-01",
      duration: 10,
      parentId: "task-3"
    },
    {
      id: "task-3-2",
      name: "Testes de Integração",
      startDate: "2024-04-11",
      duration: 10,
      parentId: "task-3",
      dependencies: ["task-3-1"]
    },
    {
      id: "task-3-3",
      name: "Testes de Aceitação",
      startDate: "2024-04-21",
      duration: 10,
      parentId: "task-3",
      dependencies: ["task-3-2"]
    }
  ]);

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
  
  const handleTaskFormSubmit = (taskData: Partial<TaskType>) => {
    if (isNewTask) {
      // Create new task with unique ID
      const newTask: TaskType = {
        id: `task-${Date.now()}`,
        name: taskData.name || "Nova Tarefa",
        startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        duration: taskData.duration || 7,
        progress: taskData.progress || 0,
        dependencies: taskData.dependencies || []
      };
      
      setTasks([...tasks, newTask]);
      
      toast({
        title: "Tarefa adicionada",
        description: `${newTask.name} foi adicionada com sucesso.`,
      });
    } else if (selectedTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === selectedTask.id ? { ...task, ...taskData } : task
      );
      
      setTasks(updatedTasks);
      
      toast({
        title: "Tarefa atualizada",
        description: `${taskData.name} foi atualizada com sucesso.`,
      });
    }
  };
  
  const handleTaskUpdate = (updatedTask: TaskType) => {
    const newTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    setTasks(newTasks);
    
    toast({
      title: "Tarefa atualizada",
      description: `${updatedTask.name} foi atualizada com sucesso.`,
    });
  };
  
  const handleTaskDependencyCreated = (sourceId: string, targetId: string) => {
    // Find the target task
    const targetTask = tasks.find(t => t.id === targetId);
    if (targetTask) {
      // Check if dependency already exists
      const dependencies = targetTask.dependencies || [];
      if (!dependencies.includes(sourceId)) {
        // Check for circular dependency
        if (!wouldCreateCircularDependency(sourceId, targetId, tasks)) {
          const updatedTask = {
            ...targetTask,
            dependencies: [...dependencies, sourceId]
          };
          
          handleTaskUpdate(updatedTask);
          
          toast({
            title: "Dependência criada",
            description: `Dependência adicionada com sucesso.`,
          });
        } else {
          toast({
            title: "Erro",
            description: "Não é possível criar uma dependência circular.",
            variant: "destructive"
          });
        }
      }
    }
  };
  
  // Function to check if adding a dependency would create a circular dependency
  function wouldCreateCircularDependency(sourceId: string, targetId: string, allTasks: TaskType[], visited: Set<string> = new Set()): boolean {
    // If we've already visited this task in this path, we have a cycle
    if (visited.has(targetId)) return false;
    
    const target = allTasks.find(t => t.id === targetId);
    if (!target) return false;

    // Mark current task as visited in this path
    visited.add(targetId);
    
    // If target depends on source directly, it would create a cycle
    if (target.id === sourceId) return true;
    
    // Recursively check each dependency
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
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 overflow-hidden p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Projeto</h1>
          <NewTaskButton onClick={handleAddTask} />
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <GanttChart 
            tasks={tasks} 
            onTaskClick={handleTaskClick}
            onAddTask={handleAddTask}
            onTaskUpdate={handleTaskUpdate}
            onCreateDependency={handleTaskDependencyCreated}
          />
        </div>
      </main>
      
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
