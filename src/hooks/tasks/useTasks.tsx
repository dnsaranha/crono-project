
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { TaskType } from "@/components/Task";
import { useToast } from "@/components/ui/use-toast";
import * as taskService from "@/services/taskService";
import { useTaskOperations } from "./useTaskOperations";
import { useTaskDependencies } from "./useTaskDependencies";
import { useProjectMembers } from "./useProjectMembers";

export function useTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Import funcionalidades de outros hooks
  const { updateTask, createTask, deleteTask, batchUpdateTasks } = useTaskOperations(
    projectId as string,
    tasks,
    setTasks,
    toast
  );
  
  const { createDependency } = useTaskDependencies(
    projectId as string,
    tasks,
    setTasks,
    toast
  );
  
  const { getProjectMembers } = useProjectMembers(projectId as string);

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  async function loadTasks() {
    try {
      setLoading(true);
      
      const loadedTasks = await taskService.loadProjectTasks(projectId as string);
      console.log("Tarefas carregadas do banco:", loadedTasks);
      setTasks(loadedTasks);
    } catch (error: any) {
      console.error("Erro ao carregar tarefas:", error.message);
      toast({
        title: "Erro ao carregar tarefas",
        description: error.message,
        variant: "destructive",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  return { 
    tasks, 
    loading, 
    updateTask, 
    createTask, 
    createDependency,
    batchUpdateTasks,
    getProjectMembers,
    deleteTask
  };
}
