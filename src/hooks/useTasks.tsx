
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
      
      // Fetch basic task data
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('id, name, start_date, duration, progress, parent_id, is_group, is_milestone, priority, description, project_id, created_by')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });
      
      if (taskError) throw taskError;
      
      if (!taskData || taskData.length === 0) {
        setTasks([]);
        return;
      }
      
      // Separately fetch dependencies with minimal fields
      const { data: dependencies, error: depError } = await supabase
        .from('task_dependencies')
        .select('predecessor_id, successor_id')
        .eq('successor_project_id', projectId);
      
      if (depError) {
        console.error("Erro ao carregar dependências:", depError);
      }
      
      // Separately fetch assignees with minimal fields
      const { data: assignees, error: assigneeError } = await supabase
        .from('task_assignees')
        .select('task_id, user_id')
        .in('task_id', taskData.map(t => t.id));
        
      if (assigneeError) {
        console.error("Erro ao carregar responsáveis:", assigneeError);
      }
      
      // Create a simple lookup object for dependencies to avoid complex filtering
      const dependencyMap: Record<string, string[]> = {};
      if (dependencies) {
        for (const dep of dependencies) {
          if (!dependencyMap[dep.successor_id]) {
            dependencyMap[dep.successor_id] = [];
          }
          dependencyMap[dep.successor_id].push(dep.predecessor_id);
        }
      }
      
      // Create a simple lookup object for assignees to avoid complex filtering
      const assigneeMap: Record<string, string[]> = {};
      if (assignees) {
        for (const assign of assignees) {
          if (!assigneeMap[assign.task_id]) {
            assigneeMap[assign.task_id] = [];
          }
          assigneeMap[assign.task_id].push(assign.user_id);
        }
      }
      
      // Map tasks with simple object assignment to avoid deep type recursion
      const mappedTasks: TaskType[] = [];
      for (const task of taskData) {
        // Use lookup maps instead of filter operations
        const taskDeps = dependencyMap[task.id] || [];
        const taskAssignees = assigneeMap[task.id] || [];
        
        // Cast priority to the correct type with a fallback
        const priority = task.priority !== undefined 
          ? (task.priority as 1 | 2 | 3 | 4 | 5) 
          : 3;
        
        // Create the task object with explicit typing and push to array
        mappedTasks.push({
          id: task.id,
          name: task.name,
          startDate: task.start_date,
          duration: task.duration,
          isGroup: task.is_group || false,
          isMilestone: task.is_milestone || false,
          progress: task.progress || 0,
          parentId: task.parent_id || undefined,
          dependencies: taskDeps,
          assignees: taskAssignees,
          priority: priority,
          description: task.description
        });
      }
      
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
  
  // Update the detection cycle function to use a non-recursive approach
  function detectCyclicDependency(sourceId: string, targetId: string): boolean {
    // Simple adjacency list using a plain object instead of Map
    const adjacencyList: Record<string, string[]> = {};
    
    // Initialize adjacency list for all tasks
    for (const task of tasks) {
      adjacencyList[task.id] = [];
    }
    
    // Build the adjacency list with existing dependencies
    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (adjacencyList[depId]) {
            adjacencyList[depId].push(task.id);
          }
        }
      }
    }
    
    // Add the potential new dependency for checking
    if (adjacencyList[sourceId]) {
      adjacencyList[sourceId].push(targetId);
    }
    
    // Use iterative DFS with a manually managed stack
    const visited: Record<string, boolean> = {};
    const stack: string[] = [targetId];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (current === sourceId) {
        // We found a cycle
        return true;
      }
      
      if (!visited[current]) {
        visited[current] = true;
        
        // Add all dependencies to the stack
        const dependencies = adjacencyList[current] || [];
        for (let i = 0; i < dependencies.length; i++) {
          if (!visited[dependencies[i]]) {
            stack.push(dependencies[i]);
          }
        }
      }
    }
    
    // No cycle detected
    return false;
  }

  // Função para atualizar uma tarefa no banco de dados
  async function updateTask(updatedTask: TaskType) {
    try {
      // First ensure parent_id is correctly formatted for the database
      const parent_id = updatedTask.parentId || null;
      
      // Ensure priority is a valid value
      const priority = updatedTask.priority !== undefined 
        ? (updatedTask.priority as 1 | 2 | 3 | 4 | 5) 
        : 3;
          
      const { data, error } = await supabase
        .from('tasks')
        .update({
          name: updatedTask.name,
          start_date: updatedTask.startDate,
          duration: updatedTask.duration,
          progress: updatedTask.progress,
          parent_id: parent_id,
          is_group: updatedTask.isGroup || false,
          is_milestone: updatedTask.isMilestone || false,
          priority: priority,
          description: updatedTask.description
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

      // Handle dependencies separately
      if (updatedTask.dependencies) {
        // Get existing dependencies
        const { data: existingDeps, error: depsError } = await supabase
          .from('task_dependencies')
          .select('predecessor_id')
          .eq('successor_id', updatedTask.id);
          
        if (depsError) throw depsError;
        
        const existingDepIds = existingDeps?.map(d => d.predecessor_id) || [];
        const newDepIds = updatedTask.dependencies || [];
        
        // Find dependencies to add and remove
        const depsToAdd = newDepIds.filter(id => !existingDepIds.includes(id));
        const depsToRemove = existingDepIds.filter(id => !newDepIds.includes(id));
        
        // Add new dependencies
        if (depsToAdd.length > 0) {
          const depsToInsert = depsToAdd.map(depId => ({
            predecessor_id: depId,
            successor_id: updatedTask.id,
            successor_project_id: projectId
          }));
          
          const { error: insertDepsError } = await supabase
            .from('task_dependencies')
            .insert(depsToInsert);
            
          if (insertDepsError) throw insertDepsError;
        }
        
        // Remove old dependencies
        if (depsToRemove.length > 0) {
          for (const depId of depsToRemove) {
            const { error: deleteDepsError } = await supabase
              .from('task_dependencies')
              .delete()
              .eq('predecessor_id', depId)
              .eq('successor_id', updatedTask.id);
              
            if (deleteDepsError) throw deleteDepsError;
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
      
      // First ensure parent_id is correctly formatted for the database
      const parent_id = newTask.parentId || null;
      
      // Ensure priority is a valid value
      const priority = newTask.priority !== undefined 
        ? (newTask.priority as 1 | 2 | 3 | 4 | 5) 
        : 3;
          
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          name: newTask.name,
          start_date: newTask.startDate,
          duration: newTask.duration,
          progress: newTask.progress || 0,
          parent_id: parent_id,
          project_id: projectId,
          is_group: newTask.isGroup || false,
          is_milestone: newTask.isMilestone || false,
          created_by: user.id,
          priority: priority,
          description: newTask.description
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Adicionar dependências se houver
      if (newTask.dependencies && newTask.dependencies.length > 0) {
        const depsToInsert = newTask.dependencies.map(depId => ({
          predecessor_id: depId,
          successor_id: data.id,
          successor_project_id: projectId
        }));
        
        const { error: depsError } = await supabase
          .from('task_dependencies')
          .insert(depsToInsert);
          
        if (depsError) throw depsError;
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
      
      // Assign the priority correctly when creating the task
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
        assignees: newTask.assignees,
        priority: data.priority !== undefined ? (data.priority as 1 | 2 | 3 | 4 | 5) : 3,
        description: data.description
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
  
  // Fixed implementation to avoid excessive type instantiation
  function detectCyclicDependency(sourceId: string, targetId: string): boolean {
    // Simple adjacency list without using complex types
    const adjacencyList: Record<string, string[]> = {};
    
    // Initialize adjacency list for all tasks
    for (const task of tasks) {
      adjacencyList[task.id] = [];
    }
    
    // Build the adjacency list with existing dependencies
    for (const task of tasks) {
      if (task.dependencies) {
        for (const depId of task.dependencies) {
          if (adjacencyList[depId]) {
            adjacencyList[depId].push(task.id);
          }
        }
      }
    }
    
    // Add the potential new dependency for checking
    if (adjacencyList[sourceId]) {
      adjacencyList[sourceId].push(targetId);
    }
    
    // Use iterative DFS with a manually managed stack
    const visited: Record<string, boolean> = {};
    const stack: string[] = [targetId];
    
    while (stack.length > 0) {
      const current = stack.pop()!;
      
      if (current === sourceId) {
        // We found a cycle
        return true;
      }
      
      if (!visited[current]) {
        visited[current] = true;
        
        // Add all dependencies to the stack
        const dependencies = adjacencyList[current] || [];
        for (let i = 0; i < dependencies.length; i++) {
          if (!visited[dependencies[i]]) {
            stack.push(dependencies[i]);
          }
        }
      }
    }
    
    // No cycle detected
    return false;
  }

  // Update createDependency to use the new cycle detection
  async function createDependency(sourceId: string, targetId: string) {
    try {
      console.log("Criando dependência:", sourceId, "->", targetId);
      
      // Check if this dependency already exists
      const { data: existingDep, error: checkError } = await supabase
        .from('task_dependencies')
        .select('id')
        .eq('predecessor_id', sourceId)
        .eq('successor_id', targetId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Erro ao verificar dependência existente:", checkError);
        throw checkError;
      }
      
      if (existingDep) {
        console.log("Dependência já existe:", existingDep);
        
        // Update local tasks to ensure UI consistency
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
      }

      // Use our non-recursive cycle detection
      if (detectCyclicDependency(sourceId, targetId)) {
        toast({
          title: "Erro ao criar dependência",
          description: "Não é possível criar dependências circulares",
          variant: "destructive",
        });
        return false;
      }
      
      // Insert the dependency
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert({
          predecessor_id: sourceId,
          successor_id: targetId,
          successor_project_id: projectId
        })
        .select();
      
      if (error) {
        console.error("Erro ao inserir dependência:", error);
        throw error;
      }
      
      console.log("Dependência criada com sucesso:", data);
      
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
