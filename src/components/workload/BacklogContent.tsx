
import React from "react";
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";
import { BacklogManager } from "./backlog/BacklogManager";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

interface BacklogContentProps {
  // Propriedades para uso na rota do projeto
  projectId?: string;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function BacklogContent({ projectId, canCreate, canEdit, canDelete }: BacklogContentProps) {
  const location = useLocation();
  const isProjectRoute = location.pathname.includes('/project/');
  
  // Se estamos na rota de projeto, usamos as props fornecidas
  // Se estamos na rota de workload, usamos o contexto
  if (isProjectRoute && projectId) {
    // Na rota do projeto, só precisamos do projectId
    return (
      <BacklogManager 
        projectId={projectId}
        canCreate={canCreate || false}
        canEdit={canEdit || false}
        canDelete={canDelete || false}
      />
    );
  } else {
    // Na rota de workload, usamos o contexto
    try {
      const { projects, refreshData, canCreate: ctxCanCreate, canEdit: ctxCanEdit, canDelete: ctxCanDelete, userRole } = useWorkloadDashboard();
      
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
          canCreate={ctxCanCreate}
          canEdit={ctxCanEdit}
          canDelete={ctxCanDelete}
        />
      );
    } catch (error) {
      // Captura o erro se o contexto não estiver disponível
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar o backlog. Por favor, verifique se você está acessando pela rota correta.
          </AlertDescription>
        </Alert>
      );
    }
  }
}
