
import { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
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
  const { tasks, loading, updateTask, createTask } = useTasks();

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

  // Get the displayed tasks (top-level tasks and their immediate children)
  const displayedTasks = tasks.filter(task => !task.parentId || tasks.find(t => t.id === task.parentId)?.isGroup);

  return (
    <div className="flex flex-col">
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
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          Carregando tarefas...
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Nenhuma tarefa encontrada para este projeto</p>
          <Button 
            onClick={handleAddTask}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar primeira tarefa
          </Button>
        </div>
      ) : (
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

export default GridView;
