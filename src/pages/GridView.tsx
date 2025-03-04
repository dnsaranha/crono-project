
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Pencil, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import TaskForm from "@/components/TaskForm";
import { TaskType } from "@/components/Task";

const GridView = () => {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  
  // Sample tasks data - in a real app, this would be shared with GanttView
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
      parentId: "task-3",
      progress: 0
    },
    {
      id: "task-3-2",
      name: "Testes de Integração",
      startDate: "2024-04-11",
      duration: 10,
      parentId: "task-3",
      progress: 0,
      dependencies: ["task-3-1"]
    },
    {
      id: "task-3-3",
      name: "Testes de Aceitação",
      startDate: "2024-04-21",
      duration: 10,
      parentId: "task-3",
      progress: 0,
      dependencies: ["task-3-2"]
    }
  ]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + duration);
    return formatDate(date.toISOString());
  };

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

  // Get the displayed tasks (top-level tasks and their immediate children)
  const displayedTasks = tasks.filter(task => !task.parentId || tasks.find(t => t.id === task.parentId)?.isGroup);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 overflow-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Grade de Tarefas</h1>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white font-medium"
            onClick={handleAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Tarefa
          </Button>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome da Tarefa</TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Data de Início
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duração
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">Data de Fim</TableHead>
                <TableHead className="w-[150px]">Progresso</TableHead>
                <TableHead className="w-[150px]">Dependências</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTasks.map((task) => (
                <TableRow key={task.id} className={task.isGroup ? "bg-gray-50 font-medium" : ""}>
                  <TableCell className={task.isGroup ? "font-bold" : "font-medium"}>
                    {task.parentId && <span className="ml-4">├─ </span>}
                    {task.name}
                  </TableCell>
                  <TableCell>{formatDate(task.startDate)}</TableCell>
                  <TableCell>{task.duration} dias</TableCell>
                  <TableCell>{calculateEndDate(task.startDate, task.duration)}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gantt-blue h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
                  </TableCell>
                  <TableCell>
                    {task.dependencies && task.dependencies.length > 0 ? (
                      <div className="text-xs">
                        {task.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId);
                          return depTask ? (
                            <span key={depId} className="inline-block bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 mr-1 mb-1">
                              {depTask.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">Nenhuma</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditTask(task)}
                      className="px-2"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

export default GridView;
