
import { useState } from "react";
import * as taskService from "@/services/taskService";

export function useProjectMembers(projectId: string) {
  const [members, setMembers] = useState<Array<{ id: string; email: string; name: string }>>([]);

  async function getProjectMembers() {
    try {
      const projectMembers = await taskService.getProjectMembersList(projectId);
      setMembers(projectMembers);
      return projectMembers;
    } catch (error: any) {
      console.error("Erro ao buscar membros do projeto:", error.message);
      return [];
    }
  }

  return { members, getProjectMembers };
}
