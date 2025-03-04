
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import TaskForm from "@/components/TaskForm";
import { TaskType } from "@/components/Task";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  taskId?: string; // Reference to the actual task in the system
}

interface Column {
  id: string;
  title: string;
  tasks: TaskItem[];
}

const BoardView = () => {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  
  // Tasks would normally be shared across views - for demo purposes these are kept separate
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
      id: "task-3-1",
      name: "Testes Unitários",
      startDate: "2024-04-01",
      duration: 10,
      parentId: "task-3",
      progress: 0
    }
  ]);
  
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "A Fazer",
      tasks: [
        {
          id: "item-1",
          title: "Definir Escopo",
          description: "Delimitar o escopo do projeto e definir objetivos",
          priority: "high",
          assignee: "Ana Silva",
          taskId: "task-1-1"
        },
        {
          id: "item-5",
          title: "Testes Unitários",
          description: "Implementar testes unitários",
          priority: "medium",
          assignee: "Mariana Oliveira",
          taskId: "task-3-1"
        }
      ]
    },
    {
      id: "in-progress",
      title: "Em Progresso",
      tasks: [
        {
          id: "item-3",
          title: "Desenvolvimento Frontend",
          description: "Implementar interface do usuário",
          priority: "high",
          assignee: "Rafael Costa",
          taskId: "task-2-1"
        },
        {
          id: "item-4",
          title: "Desenvolvimento Backend",
          description: "Desenvolver API e lógica do servidor",
          priority: "high",
          assignee: "Carla Ferreira",
          taskId: "task-2-2"
        }
      ]
    },
    {
      id: "done",
      title: "Concluído",
      tasks: []
    }
  ]);
  
  const handleAddColumn = () => {
    const newColumnId = `column-${Date.now()}`;
    setColumns([
      ...columns, 
      {
        id: newColumnId,
        title: "Nova Coluna",
        tasks: []
      }
    ]);
    
    toast({
      title: "Coluna adicionada",
      description: "Nova coluna foi adicionada com sucesso."
    });
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsNewTask(false);
      setIsTaskFormOpen(true);
    }
  };
  
  const handleAddTask = () => {
    setSelectedTask(null);
    setIsNewTask(true);
    setIsTaskFormOpen(true);
  };
  
  const handleTaskFormSubmit = (taskData: Partial<TaskType>) => {
    if (isNewTask) {
      // Create new task with unique ID
      const newTaskId = `task-${Date.now()}`;
      const newTask: TaskType = {
        id: newTaskId,
        name: taskData.name || "Nova Tarefa",
        startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        duration: taskData.duration || 7,
        progress: taskData.progress || 0,
        dependencies: taskData.dependencies || []
      };
      
      setTasks([...tasks, newTask]);
      
      // Also add to board in "Todo" column
      const newBoardItem: TaskItem = {
        id: `item-${Date.now()}`,
        title: newTask.name,
        description: `Duração: ${newTask.duration} dias`,
        priority: "medium",
        taskId: newTaskId
      };
      
      const updatedColumns = columns.map(col => {
        if (col.id === "todo") {
          return {
            ...col,
            tasks: [...col.tasks, newBoardItem]
          };
        }
        return col;
      });
      
      setColumns(updatedColumns);
      
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
      
      // Update board item if it exists
      const updatedColumns = columns.map(col => {
        return {
          ...col,
          tasks: col.tasks.map(item => {
            if (item.taskId === selectedTask.id) {
              return {
                ...item,
                title: taskData.name || item.title,
                description: item.description
              };
            }
            return item;
          })
        };
      });
      
      setColumns(updatedColumns);
      
      toast({
        title: "Tarefa atualizada",
        description: `${taskData.name} foi atualizada com sucesso.`,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string, columnId: string) => {
    e.dataTransfer.setData("itemId", itemId);
    e.dataTransfer.setData("sourceColumnId", columnId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dropZone = target.closest(".drop-zone");
    
    if (dropZone) {
      dropZone.classList.add("drag-over");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dropZone = target.closest(".drop-zone");
    
    if (dropZone) {
      dropZone.classList.remove("drag-over");
    }
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData("itemId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    
    if (sourceColumnId === targetColumnId) return;
    
    const sourceColIndex = columns.findIndex(col => col.id === sourceColumnId);
    const targetColIndex = columns.findIndex(col => col.id === targetColumnId);
    
    if (sourceColIndex !== -1 && targetColIndex !== -1) {
      const item = columns[sourceColIndex].tasks.find(t => t.id === itemId);
      
      if (item) {
        // Remove from source
        const sourceCol = {
          ...columns[sourceColIndex],
          tasks: columns[sourceColIndex].tasks.filter(t => t.id !== itemId)
        };
        
        // Add to target
        const targetCol = {
          ...columns[targetColIndex],
          tasks: [...columns[targetColIndex].tasks, item]
        };
        
        // Update columns
        const newColumns = [...columns];
        newColumns[sourceColIndex] = sourceCol;
        newColumns[targetColIndex] = targetCol;
        
        setColumns(newColumns);
        
        // Update task progress based on column
        if (item.taskId) {
          const progress = targetColumnId === "done" ? 100 : 
                          targetColumnId === "in-progress" ? 50 : 0;
          
          const updatedTasks = tasks.map(task => {
            if (task.id === item.taskId) {
              return { ...task, progress };
            }
            return task;
          });
          
          setTasks(updatedTasks);
        }
      }
    }
    
    const dropZones = document.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => zone.classList.remove("drag-over"));
  };
  
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-800";
      case 'medium':
        return "bg-yellow-100 text-yellow-800";
      case 'low':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 overflow-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quadro de Tarefas</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddColumn}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Coluna
            </Button>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-medium"
              onClick={handleAddTask}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Tarefa
            </Button>
          </div>
        </div>
        
        <div className="flex gap-6 h-[calc(100vh-160px)] pb-6 overflow-x-auto">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div 
                className="bg-white rounded-lg shadow-sm h-full flex flex-col drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="px-4 py-3 border-b flex justify-between items-center">
                  <h3 className="font-medium">{column.title} ({column.tasks.length})</h3>
                </div>
                
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {column.tasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className="shadow-sm hover:shadow-md transition-shadow animate-task-appear"
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                    >
                      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                        <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                        {task.taskId && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => handleEditTask(task.taskId || '')}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        {task.description && (
                          <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          {task.assignee && (
                            <div className="text-xs text-gray-600">
                              {task.assignee}
                            </div>
                          )}
                          <div className={cn(
                            "ml-auto px-2 py-0.5 rounded text-xs font-medium",
                            getPriorityStyles(task.priority)
                          )}>
                            {task.priority === 'high' ? 'Alta' : 
                             task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Separator />
                <div className="p-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-gray-500 hover:text-gray-900"
                    onClick={handleAddTask}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar tarefa
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex-shrink-0 w-80 bg-gray-100 bg-opacity-60 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
            <Button 
              variant="ghost" 
              className="text-gray-500"
              onClick={handleAddColumn}
            >
              <Plus className="h-5 w-5 mr-1" />
              Adicionar Coluna
            </Button>
          </div>
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

export default BoardView;
