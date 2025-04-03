
import { Dispatch, SetStateAction } from "react";
import { TaskType } from "@/components/Task";
import * as taskService from "@/services/taskService";
import { detectCyclicDependency } from "@/utils/cycleDetection";

type ToastFunction = {
  title: string;
  description: string;
  variant?: "default" | "destructive";
};

export function useTaskDependencies(
  projectId: string,
  tasks: TaskType[],
  setTasks: Dispatch<SetStateAction<TaskType[]>>,
  toast: (props: ToastFunction) => void
) {
  async function createDependency(sourceId: string, targetId: string) {
    try {
      console.log("Criando dependência:", sourceId, "->", targetId);
      
      // Check for circular dependencies before creating
      if (detectCyclicDependency(tasks, sourceId, targetId)) {
        toast({
          title: "Erro ao criar dependência",
          description: "Não é possível criar dependências circulares",
          variant: "destructive",
        });
        return false;
      }
      
      const success = await taskService.createTaskDependency(projectId, sourceId, targetId);
      
      if (success) {
        // Update local tasks
        setTasks(prevTasks => {
          return prevTasks.map(task => {
            if (task.id === targetId) {
              const deps = task.dependencies || [];
              if (!deps.includes(sourceId)) {
                return {
                  ...task,
                  dependencies: [...deps, sourceId]
                };
              }
            }
            return task;
          });
        });
      }
      
      return success;
    } catch (error: any) {
      console.error("Erro ao criar dependência:", error.message);
      toast({
        title: "Erro ao criar dependência",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  }

  return { createDependency };
}
