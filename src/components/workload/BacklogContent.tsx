
import React from "react";
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";
import { BacklogManager } from "./backlog/BacklogManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export function BacklogContent() {
  const { projects, refreshData, canCreate, userRole } = useWorkloadDashboard();
  
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
    <BacklogManager 
      projects={projects}
      onItemConverted={refreshData}
      canCreate={canCreate}
      canEdit={canCreate}
      canDelete={canCreate}
    />
  );
}
