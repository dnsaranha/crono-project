
import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTasks } from "@/hooks/tasks";
import { TaskType } from "@/components/task";
import TaskTable from "@/components/TaskTable";
import TaskForm from "@/components/TaskForm";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import LoadingState from "@/components/LoadingState";

interface ProjectContextType {
  hasEditPermission: boolean;
}

export default function GridView() {
  const { hasEditPermission = false } = useOutletContext<ProjectContextType>();
  const { tasks, loading, updateTask, createTask, deleteTask, getProjectMembers } = useTasks();
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);

  // Carregar membros do projeto
  React.useEffect(() => {
    async function loadProjectMembers() {
      const members = await getProjectMembers();
      setProjectMembers(members || []);
    }
    
    loadProjectMembers();
  }, [getProjectMembers]);

  // Função para lidar com a edição de tarefas
  const handleEditTask = (task: TaskType) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  // Função para lidar com a criação/atualização de tarefas
  const handleSaveTask = async (taskData: TaskType) => {
    if (selectedTask) {
      await updateTask({ ...selectedTask, ...taskData });
    } else {
      await createTask(taskData);
    }
    
    setIsTaskFormOpen(false);
    setSelectedTask(null);
  };

  // Função para lidar com a exclusão de tarefas
  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      await deleteTask(taskId);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="container mx-auto px-0 md:px-4 py-2">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden">
        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <h3 className="text-lg font-medium">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Comece adicionando tarefas ao seu projeto.
            </p>
          </div>
        ) : (
          <div className="overflow-auto">
            <TaskTable 
              tasks={tasks} 
              onEditTask={handleEditTask} 
              onDeleteTask={hasEditPermission ? handleDeleteTask : undefined}
              projectMembers={projectMembers}
            />
          </div>
        )}
      </div>

      {/* Modal de formulário de tarefa */}
      <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <TaskForm
            task={selectedTask}
            onSubmit={handleSaveTask}
            onCancel={() => {
              setIsTaskFormOpen(false);
              setSelectedTask(null);
            }}
            isEditing={!!selectedTask}
            projectMembers={projectMembers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
