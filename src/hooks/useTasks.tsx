
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
      
      // Buscar assignees para as tarefas
      const { data: assignees, error: assigneeError } = await supabase
        .from('task_assignees')
        .select('task_id, user_id')
        .in('task_id', data.map(t => t.id));
        
      if (assigneeError) {
        console.error("Erro ao carregar responsáveis:", assigneeError);
      }
      
      // Mapear as tarefas para o formato esperado pelo componente
      const mappedTasks: TaskType[] = data.map(task => {
        // Encontrar todas as dependências para esta tarefa
        const taskDeps = dependencies?.filter(dep => dep.successor_id === task.id) || [];
        
        // Encontrar todos os responsáveis para esta tarefa
        const taskAssignees = assignees?.filter(assign => assign.task_id === task.id) || [];
        
        return {
          id: task.id,
          name: task.name,
          startDate: task.start_date,
          duration: task.duration,
          isGroup: task.is_group || false,
          isMilestone: task.is_milestone || false,
          progress: task.progress || 0,
          parentId: task.parent_id || undefined,
          dependencies: taskDeps.map(dep => dep.predecessor_id),
          assignees: taskAssignees.map(assign => assign.user_id)
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
          is_group: updatedTask.isGroup || false,
          is_milestone: updatedTask.isMilestone || false
        })
        .eq('id', updatedTask.id)
        .select();
      
      if (error) throw error;
      
      // Atualizar tarefas localmente primeiro
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === updatedTask.id ? 
          {...task, ...updatedTask} : task)
      );
      
      // Atualizar os responsáveis pelas tarefas, se houver mudanças
      if (updatedTask.assignees) {
        // Primeiro buscar os responsáveis atuais
        const { data: currentAssignees, error: fetchError } = await supabase
          .from('task_assignees')
          .select('user_id')
          .eq('task_id', updatedTask.id);
          
        if (fetchError) throw fetchError;
        
        const currentUserIds = currentAssignees?.map(a => a.user_id) || [];
        const updatedUserIds = updatedTask.assignees || [];
        
        // Determinar quais adicionar e quais remover
        const toAdd = updatedUserIds.filter(id => !currentUserIds.includes(id));
        const toRemove = currentUserIds.filter(id => !updatedUserIds.includes(id));
        
        // Adicionar novos responsáveis
        if (toAdd.length > 0) {
          const assigneesToAdd = toAdd.map(userId => ({
            task_id: updatedTask.id,
            user_id: userId
          }));
          
          const { error: insertError } = await supabase
            .from('task_assignees')
            .insert(assigneesToAdd);
            
          if (insertError) throw insertError;
        }
        
        // Remover responsáveis
        if (toRemove.length > 0) {
          for (const userId of toRemove) {
            const { error: deleteError } = await supabase
              .from('task_assignees')
              .delete()
              .eq('task_id', updatedTask.id)
              .eq('user_id', userId);
              
            if (deleteError) throw deleteError;
          }
        }
      }
      
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
          is_milestone: newTask.isMilestone || false,
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
      
      // Adicionar responsáveis se houver
      if (newTask.assignees && newTask.assignees.length > 0) {
        const assigneesToAdd = newTask.assignees.map(userId => ({
          task_id: data.id,
          user_id: userId
        }));
        
        const { error: assigneeError } = await supabase
          .from('task_assignees')
          .insert(assigneesToAdd);
          
        if (assigneeError) throw assigneeError;
      }
      
      // Adicionar nova tarefa à lista local
      const createdTask: TaskType = {
        id: data.id,
        name: data.name,
        startDate: data.start_date,
        duration: data.duration,
        isGroup: data.is_group,
        isMilestone: data.is_milestone,
        progress: data.progress,
        parentId: data.parent_id,
        dependencies: newTask.dependencies,
        assignees: newTask.assignees
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

  // Função para modificar várias tarefas de uma vez (usado na importação)
  async function batchUpdateTasks(tasksToUpdate: TaskType[], tasksToCreate: Omit<TaskType, 'id'>[]) {
    try {
      // Verificar usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para atualizar tarefas.",
          variant: "destructive",
        });
        return false;
      }
      
      // Atualizar tarefas existentes
      for (const task of tasksToUpdate) {
        await updateTask(task);
      }
      
      // Criar novas tarefas
      for (const task of tasksToCreate) {
        await createTask(task);
      }
      
      // Recarregar tarefas para garantir consistência
      await loadTasks();
      
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
  
  // Buscar membros do projeto para assinalar tarefas
  async function getProjectMembers() {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          id,
          user_id,
          role,
          profiles (
            id,
            email,
            full_name
          )
        `)
        .eq('project_id', projectId);
        
      if (error) throw error;
      
      return data.map(member => ({
        id: member.user_id,
        email: member.profiles.email,
        name: member.profiles.full_name || member.profiles.email
      }));
      
    } catch (error: any) {
      console.error("Erro ao buscar membros do projeto:", error.message);
      return [];
    }
  }
  
  // Função para deletar uma tarefa
  async function deleteTask(taskId: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Remover tarefa da lista local
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      return true;
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
