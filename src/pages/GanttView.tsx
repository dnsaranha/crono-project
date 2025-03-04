
import { useState } from "react";
import Navbar from "@/components/Navbar";
import GanttChart from "@/components/GanttChart";
import NewTaskButton from "@/components/NewTaskButton";
import { TaskType } from "@/components/Task";
import { useToast } from "@/components/ui/use-toast";

const GanttView = () => {
  const { toast } = useToast();
  
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
    toast({
      title: "Tarefa selecionada",
      description: `${task.name} - Duração: ${task.duration} dias`,
    });
  };

  const handleAddTask = () => {
    toast({
      title: "Adicionar nova tarefa",
      description: "Esta funcionalidade será implementada em breve.",
    });
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
          />
        </div>
      </main>
    </div>
  );
};

export default GanttView;
