
import React from "react";
import WorkloadPanorama from "./WorkloadPanorama";
// Suponha que getProjectMembers e getTasks vêm via contexto/hooks (ajuste para sua app)
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";

export function WorkloadOverviewContent() {
  const { projectMembers, tasks } = useWorkloadDashboard();

  // Organize e conte tarefas por membro
  const dutyMap: { [memberId: string]: number } = {};
  tasks.forEach(t =>
    (t.assignees || []).forEach((userId: string) => {
      dutyMap[userId] = (dutyMap[userId] || 0) + 1;
    })
  );
  const membersWithLoad = projectMembers.map(m => ({
    id: m.id,
    name: m.name,
    avatarUrl: m.avatarUrl,
    workload: dutyMap[m.id] || 0
  }));

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-2 sm:mb-4">Panorama de Carga de Trabalho</h2>
      <WorkloadPanorama members={membersWithLoad} />
    </div>
  );
}
