
import { supabase } from "@/integrations/supabase/client";
import { TaskType } from "@/components/Task";

/**
 * Loads tasks for a given project from Supabase
 */
export async function loadProjectTasks(projectId: string): Promise<TaskType[]> {
  // Fetch basic task data - select minimal fields to avoid type recursion
  const { data: taskData, error: taskError } = await supabase
    .from('tasks')
    .select('id, name, start_date, duration, progress, parent_id, is_group, is_milestone, priority, description, project_id, created_by')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });
  
  if (taskError) throw taskError;
  
  if (!taskData || taskData.length === 0) {
    return [];
  }
  
  // Separately fetch dependencies with minimal fields
  const { data: dependencies, error: depError } = await supabase
    .from('task_dependencies')
    .select('predecessor_id, successor_id')
    .in('successor_id', taskData.map(t => t.id));
  
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
  
  // Create lookup maps for dependencies and assignees
  const dependencyMap: Record<string, string[]> = {};
  if (dependencies) {
    for (const dep of dependencies) {
      if (!dependencyMap[dep.successor_id]) {
        dependencyMap[dep.successor_id] = [];
      }
      dependencyMap[dep.successor_id].push(dep.predecessor_id);
    }
  }
  
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
  return taskData.map(task => {
    // Use lookup maps instead of filter operations
    const taskDeps = dependencyMap[task.id] || [];
    const taskAssignees = assigneeMap[task.id] || [];
    
    // Cast priority to the correct type with a fallback
    const priority = task.priority !== undefined 
      ? (task.priority as 1 | 2 | 3 | 4 | 5) 
      : 3;
    
    // Create the task object with explicit typing
    return {
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
    };
  });
}
