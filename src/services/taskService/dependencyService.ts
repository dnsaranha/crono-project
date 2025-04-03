
import { supabase } from "@/integrations/supabase/client";

/**
 * Creates a dependency between two tasks
 */
export async function createTaskDependency(
  projectId: string,
  sourceId: string, 
  targetId: string
): Promise<boolean> {
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
    return true;
  }
  
  // Insert the dependency
  const { error } = await supabase
    .from('task_dependencies')
    .insert({
      predecessor_id: sourceId,
      successor_id: targetId
    })
    .select();
  
  if (error) {
    console.error("Erro ao inserir dependência:", error);
    throw error;
  }
  
  return true;
}
