
import { supabase } from "@/integrations/supabase/client";
import { TaskType } from "@/components/Task";

/**
 * Updates an existing task in the database
 */
export async function updateExistingTask(
  projectId: string,
  updatedTask: TaskType
): Promise<boolean> {
  // First ensure parent_id is correctly formatted for the database
  const parent_id = updatedTask.parentId || null;
  
  // Ensure priority is a valid value
  const priority = updatedTask.priority !== undefined 
    ? (updatedTask.priority as 1 | 2 | 3 | 4 | 5) 
    : 3;
      
  const { error } = await supabase
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
  
  await updateTaskAssignees(updatedTask);
  await updateTaskDependencies(projectId, updatedTask);
  
  return true;
}

/**
 * Update task assignees
 */
async function updateTaskAssignees(updatedTask: TaskType): Promise<void> {
  if (!updatedTask.assignees) return;
  
  // First fetch current assignees
  const { data: currentAssignees, error: fetchError } = await supabase
    .from('task_assignees')
    .select('user_id')
    .eq('task_id', updatedTask.id);
    
  if (fetchError) throw fetchError;
  
  const currentUserIds = currentAssignees?.map(a => a.user_id) || [];
  const updatedUserIds = updatedTask.assignees || [];
  
  // Determine which to add and which to remove
  const toAdd = updatedUserIds.filter(id => !currentUserIds.includes(id));
  const toRemove = currentUserIds.filter(id => !updatedUserIds.includes(id));
  
  // Add new assignees
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
  
  // Remove assignees
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

/**
 * Update task dependencies
 */
async function updateTaskDependencies(
  projectId: string, 
  updatedTask: TaskType
): Promise<void> {
  if (!updatedTask.dependencies) return;
  
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
