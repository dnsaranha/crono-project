
import React from "react";
import { Button } from "@/components/ui/button";
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";
import { WorkloadOverview } from "./WorkloadOverview";
import { RefreshCw } from "lucide-react";

export function WorkloadOverviewContent() {
  const { tasks, members, projects, refreshData, loading } = useWorkloadDashboard();

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={refreshData}
        disabled={loading}
        className="mb-4 h-10 w-full sm:w-auto touch-manipulation"
        aria-label="Atualizar dados"
      >
        <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden xs:inline">Atualizar Dados</span>
        <span className="xs:hidden">Atualizar</span>
      </Button>
      
      <WorkloadOverview 
        projects={projects}
        members={members}
        tasks={tasks}
      />
    </>
  );
}
