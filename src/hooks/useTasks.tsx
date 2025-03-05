
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TaskType } from "@/components/Task";
import { useToast } from "@/components/ui/use-toast";

export function useTasks() {
  const { projectId } = useParams<{ projectId: string }>();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  async function loadTasks() {
    try {
      setLoading(true);
      
      // Buscar tarefas do projeto no Supabase
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setTasks([]);
        return;
      }
      
      // Buscar dependências de tarefas
      const { data: dependencies, error: depError } = await supabase
        .from('task_dependencies')
        .select('*')
        .in('predecessor_id', data.map(t => t.id));
      
      if (depError) {
        console.error("Erro ao carregar dependências:", depError);
      }
      
      // Mapear as tarefas para o formato esperado pelo componente
      const mappedTasks: TaskType[] = data.map(task => {
        // Encontrar todas as dependências para esta tarefa
        const taskDeps = dependencies?.filter(dep => dep.successor_id === task.id) || [];
        
        return {
          id: task.id,
          name: task.name,
          startDate: task.start_date,
          duration: task.duration,
          isGroup: task.is_group || false,
          progress: task.progress || 0,
          parentId: task.parent_id || undefined,
          dependencies: taskDeps.map(dep => dep.predecessor_id)
        };
      });
      
      console.log("Tarefas carregadas do banco:", mappedTasks);
      setTasks(mappedTasks);
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
  
  // Função para atualizar uma tarefa no banco de dados
  async function updateTask(updatedTask: TaskType) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          name: updatedTask.name,
          start_date: updatedTask.startDate,
          duration: updatedTask.duration,
          progress: updatedTask.progress,
          parent_id: updatedTask.parentId,
          is_group: updatedTask.isGroup || false
        })
        .eq('id', updatedTask.id)
        .select();
      
      if (error) throw error;
      
      // Atualizar tarefas localmente
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task)
      );
      
      return true;
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
  
  // Função para criar uma nova tarefa
  async function createTask(newTask: Omit<TaskType, 'id'>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar uma tarefa.",
          variant: "destructive",
        });
        return null;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          name: newTask.name,
          start_date: newTask.startDate,
          duration: newTask.duration,
          progress: newTask.progress || 0,
          parent_id: newTask.parentId,
          project_id: projectId,
          is_group: newTask.isGroup || false,
          created_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Adicionar dependências se houver
      if (newTask.dependencies && newTask.dependencies.length > 0) {
        for (const depId of newTask.dependencies) {
          await supabase
            .from('task_dependencies')
            .insert({
              predecessor_id: depId,
              successor_id: data.id
            });
        }
      }
      
      // Adicionar nova tarefa à lista local
      const createdTask: TaskType = {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        duration: data.duration,
        isGroup: data.is_group,
        progress: data.progress,
        parentId: data.parent_id,
        dependencies: newTask.dependencies
      };
      
      setTasks(prevTasks => [...prevTasks, createdTask]);
      
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
  
  // Função para adicionar uma dependência entre tarefas
  async function createDependency(sourceId: string, targetId: string) {
    try {
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert({
          predecessor_id: sourceId,
          successor_id: targetId
        })
        .select();
      
      if (error) throw error;
      
      // Atualizar tarefas localmente
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
      
      return true;
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

  return { 
    tasks, 
    loading, 
    updateTask, 
    createTask, 
    createDependency 
  };
}
