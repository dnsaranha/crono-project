
import { Dispatch, SetStateAction } from "react";
import { TaskType } from "@/components/Task";
import * as taskService from "@/services/taskService";
import { supabase } from "@/integrations/supabase/client";

type ToastFunction = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export function useTaskOperations(
  projectId: string,
  tasks: TaskType[],
  setTasks: Dispatch<SetStateAction<TaskType[]>>,
  toast: (props: ToastFunction) => void
) {
  async function updateTask(updatedTask: TaskType) {
    try {
      const success = await taskService.updateExistingTask(projectId, updatedTask);
      
      if (success) {
        // Update tasks locally first for a responsive UI
        setTasks(prevTasks => 
          prevTasks.map(task => task.id === updatedTask.id ? 
            {...task, ...updatedTask} : task)
        );
      }
      
      return success;
    } catch (error: any) {
      console.error("Erro ao atualizar tarefa:", error.message);
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
  
  async function createTask(newTask: Omit<TaskType, 'id'>) {
    try {
      const createdTask = await taskService.createNewTask(projectId, newTask);
      
      if (createdTask) {
        setTasks(prevTasks => [...prevTasks, createdTask]);
      }
      
      return createdTask;
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error.message);
      toast({
        title: "Erro ao criar tarefa",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  }
  
  async function deleteTask(taskId: string) {
    try {
      const success = await taskService.deleteProjectTask(taskId);
      
      if (success) {
        // Remove task from local list
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      }
      
      return success;
    } catch (error: any) {
      console.error("Erro ao deletar tarefa:", error.message);
      toast({
        title: "Erro ao deletar tarefa",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }
  
  async function batchUpdateTasks(tasksToUpdate: TaskType[], tasksToCreate: Omit<TaskType, 'id'>[]) {
    try {
      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para atualizar tarefas.",
          variant: "destructive",
        });
        return false;
      }
      
      // Update existing tasks
      for (const task of tasksToUpdate) {
        await updateTask(task);
      }
      
      // Create new tasks
      for (const task of tasksToCreate) {
        await createTask(task);
      }
      
      return true;
    } catch (error: any) {
      console.error("Erro na atualização em lote:", error.message);
      toast({
        title: "Erro ao atualizar tarefas",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }

  return { updateTask, createTask, deleteTask, batchUpdateTasks };
}
