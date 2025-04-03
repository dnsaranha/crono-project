
import { useState, useEffect } from "react";
import { useTasks } from "@/hooks/tasks";
import TaskTable from "@/components/TaskTable";
import { TaskType } from "@/components/Task";
import NewTaskButton from "@/components/NewTaskButton";
import TaskForm from "@/components/TaskForm";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTask } from "@/components/task/hooks/useTask";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EmptyTaskState from "@/components/EmptyTaskState";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function GridView() {
  const { tasks, loading, updateTask, createTask, getProjectMembers, deleteTask } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [projectMembers, setProjectMembers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { toast } = useToast();

  useEffect(() => {
    loadProjectMembers();
  }, []);

  const loadProjectMembers = async () => {
    const members = await getProjectMembers();
    setProjectMembers(members || []);
  };

  const handleTaskSelect = (task: TaskType) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };
  
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setTimeout(() => setSelectedTask(null), 300);
  };

  const handleTaskCreate = async (task: Omit<TaskType, 'id'>) => {
    await createTask(task);
    handleCloseTaskForm();
  };

  const handleTaskUpdate = async (task: TaskType) => {
    await updateTask(task);
    handleCloseTaskForm();
  };
  
  const handleConfirmDelete = (taskId: string) => {
    setConfirmingDelete(taskId);
  };
  
  const handleDeleteTask = async () => {
    if (!confirmingDelete) return;
    
    try {
      await deleteTask(confirmingDelete);
      setConfirmingDelete(null);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a tarefa",
        variant: "destructive",
      });
    }
  };

  if (loading || !tasks) {
    return <div className="flex items-center justify-center p-8">Carregando tarefas...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="h-full">
        <EmptyTaskState onAddTask={() => setShowTaskForm(true)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end my-2">
        <NewTaskButton onClick={() => setShowTaskForm(true)} />
      </div>
      
      <div className="flex-grow border rounded-md bg-card overflow-auto">
        <TaskTable 
          tasks={tasks} 
          onEditTask={handleTaskSelect} 
          onDeleteTask={handleConfirmDelete}
          projectMembers={projectMembers}
        />
      </div>
      
      {showTaskForm && (
        <TaskForm
          open={showTaskForm}
          onOpenChange={setShowTaskForm}
          onClose={handleCloseTaskForm}
          onSubmit={selectedTask ? handleTaskUpdate : handleTaskCreate}
          tasks={tasks}
          projectMembers={projectMembers}
          initialData={selectedTask}
        />
      )}
      
      <Dialog open={!!confirmingDelete} onOpenChange={(open) => !open && setConfirmingDelete(null)}>
        <DialogContent className="max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Confirmar exclusão</h2>
            <p>Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setConfirmingDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteTask}>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
