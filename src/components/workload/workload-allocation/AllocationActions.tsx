
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";
import { Task } from "@/contexts/WorkloadDashboardContext";

export function getAllocationTableActions(task: Task, canEdit: boolean, canDelete: boolean) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 touch-manipulation">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="cursor-pointer touch-manipulation"
          onClick={() => {
            window.location.href = `/project/${task.project_id}?task=${task.id}`;
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Visualizar
        </DropdownMenuItem>
        {canEdit && (
          <DropdownMenuItem 
            className="cursor-pointer touch-manipulation"
            onClick={() => {
              window.location.href = `/project/${task.project_id}/grid?edit=${task.id}`;
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem 
            className="cursor-pointer text-destructive touch-manipulation"
            onClick={() => {
              if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
                // Implementar excluir tarefa aqui
              }
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
