
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches project members
 */
export async function getProjectMembersList(projectId: string) {
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
}
