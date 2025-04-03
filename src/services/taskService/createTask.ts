
import { supabase } from "@/integrations/supabase/client";
import { TaskType } from "@/components/Task";

/**
 * Creates a new task in the database
 */
export async function createNewTask(
  projectId: string, 
  newTask: Omit<TaskType, 'id'>
): Promise<TaskType | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Você precisa estar logado para criar uma tarefa.");
  }
  
  // Ensure parent_id is correctly formatted for the database
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
  
  // Add dependencies
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
  
  // Add assignees
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
  
  // Construct and return the created task
  return {
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
}

/**
 * Deletes a task from the database
 */
export async function deleteProjectTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
    
  if (error) throw error;
  
  return true;
}
