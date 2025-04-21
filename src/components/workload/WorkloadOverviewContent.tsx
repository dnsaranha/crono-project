
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { WorkloadAllocationView } from "./workload-allocation/WorkloadAllocationView";

export function WorkloadOverviewContent() {
  const { tasks, members, projects, refreshData, loading, userRole, canEdit, canDelete } = useWorkloadDashboard();
  
  if (!userRole) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta visualização. 
          Por favor, solicite acesso a um administrador.
        </AlertDescription>
      </Alert>
    );
  }

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
      
      <WorkloadAllocationView
        projects={projects}
        members={members}
        tasks={tasks}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </>
  );
}
