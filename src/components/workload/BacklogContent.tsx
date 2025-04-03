
import React from "react";
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";
import { BacklogManager } from "./BacklogManager";

export function BacklogContent() {
  const { projects, refreshData } = useWorkloadDashboard();

  return (
    <BacklogManager 
      projects={projects}
      onItemConverted={refreshData}
    />
  );
}
