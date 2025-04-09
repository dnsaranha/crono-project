
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Pencil,
  Trash2,
  ArrowUpRight,
  LocateIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "./BacklogUtils";
import { useBacklog } from "./BacklogContext";

interface BacklogItemRowProps {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  status: string;
  created_at: string;
  target_project_id?: string | null;
  creator_id: string;
  creator_name?: string;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  getProjectName: (projectId: string) => string;
  onEdit: () => void;
  onPromote: () => void;
  onDelete: () => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function BacklogItemRow({
  id,
  title,
  description,
  priority,
  status,
  created_at,
  target_project_id,
  creator_id,
  creator_name,
  getPriorityInfo,
  getStatusInfo,
  getProjectName,
  onEdit,
  onPromote,
  onDelete,
  canEdit = true,
  canDelete = true,
}: BacklogItemRowProps) {
  const priorityInfo = getPriorityInfo(priority);
  const statusInfo = getStatusInfo(status);
  const formattedDate = formatDate(created_at);
  const { canUserEdit, canUserDelete } = useBacklog();
  
  // Verificar se o usuário tem permissão para editar e excluir este item específico
  const hasEditPermission = canUserEdit({ id, title, description, priority, status, created_at, target_project_id, creator_id, creator_name });
  const hasDeletePermission = canUserDelete({ id, title, description, priority, status, created_at, target_project_id, creator_id, creator_name });
  
  // Permissões efetivas (combinando permissões da página e específicas do item)
  const effectiveCanEdit = canEdit && hasEditPermission;
  const effectiveCanDelete = canDelete && hasDeletePermission;
  
  // Determinar se o item pode ser promovido (apenas itens pendentes ou em progresso)
  const canPromote = status !== 'converted' && status !== 'done' && effectiveCanEdit;

  return (
    <tr className="border-b hover:bg-muted/50">
      <td className="py-3 px-4">
        <div className="font-medium">{title}</div>
        {description && (
          <div className="text-sm text-muted-foreground line-clamp-1">
            {description}
          </div>
        )}
      </td>
      <td className="py-3 px-4">
        <Badge className={`bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800 hover:bg-${priorityInfo.color}-200`}>
          {priorityInfo.label}
        </Badge>
      </td>
      <td className="py-3 px-4">
        <Badge className={`bg-${statusInfo.color}-100 text-${statusInfo.color}-800 hover:bg-${statusInfo.color}-200`}>
          {statusInfo.label}
        </Badge>
      </td>
      <td className="py-3 px-4">
        {target_project_id ? (
          <div className="flex items-center gap-1">
            <LocateIcon className="h-3 w-3" />
            <span>{getProjectName(target_project_id)}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Não atribuído</span>
        )}
      </td>
      <td className="py-3 px-4">{formattedDate}</td>
      <td className="py-3 px-4">{creator_name || "Usuário"}</td>
      <td className="py-3 px-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {effectiveCanEdit && (
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
            )}
            {canPromote && (
              <DropdownMenuItem onClick={onPromote}>
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Promover para Tarefa
              </DropdownMenuItem>
            )}
            {effectiveCanDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </>
            )}
            {!effectiveCanEdit && !effectiveCanDelete && (
              <DropdownMenuItem disabled>
                Você não tem permissões
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

export function BacklogItemRowSkeleton() {
  return (
    <tr className="border-b">
      <td className="py-3 px-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-20" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-6 w-24" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-5 w-32" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-5 w-24" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-5 w-20" />
      </td>
      <td className="py-3 px-4">
        <Skeleton className="h-8 w-8 rounded-full" />
      </td>
    </tr>
  );
}
