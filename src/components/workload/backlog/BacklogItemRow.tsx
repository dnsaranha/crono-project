
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBacklog } from './BacklogContext';
import { BacklogItem } from './BacklogTypes';

interface BacklogItemRowProps {
  item: BacklogItem;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  getProjectName: (projectId: string) => string;
  formatDate: (dateString: string) => string;
  onEdit: (item: BacklogItem) => void;
  onPromote: (item: BacklogItem) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function BacklogItemRow({
  item,
  getPriorityInfo,
  getStatusInfo,
  getProjectName,
  formatDate,
  onEdit,
  onPromote,
  onDelete,
  canEdit = true,
  canDelete = true
}: BacklogItemRowProps) {
  // Usar o hook para obter o contexto com as novas funções de permissão
  const { canUserEdit, canUserDelete } = useBacklog();
  
  // Verificar se este item específico pode ser editado/excluído pelo usuário atual
  const canEditThisItem = canEdit && canUserEdit(item);
  const canDeleteThisItem = canDelete && canUserDelete(item);
  
  const priorityInfo = getPriorityInfo(item.priority);
  const statusInfo = getStatusInfo(item.status);
  
  return (
    <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <TableCell className="py-3 font-medium">
        {item.title}
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
            {item.description}
          </p>
        )}
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${priorityInfo.color}`} />
          <span className="text-xs">{priorityInfo.label}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge variant="outline" className={`${statusInfo.color} px-2 py-0.5`}>
          {statusInfo.label}
        </Badge>
      </TableCell>
      
      <TableCell>
        {item.target_project_id ? (
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
            {getProjectName(item.target_project_id)}
          </Badge>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">Não definido</span>
        )}
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {item.creator_name || "Usuário"}
        </span>
      </TableCell>
      
      <TableCell>
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {formatDate(item.created_at)}
        </span>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2 justify-end">
          {canEditThisItem && item.status !== 'converted' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(item)}
              className="h-8 w-8 p-0" 
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Button>
          )}
          
          {canEditThisItem && item.status !== 'converted' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onPromote(item)} 
              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400"
              title="Converter para tarefa"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="sr-only">Converter para tarefa</span>
            </Button>
          )}
          
          {canDeleteThisItem && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(item.id)} 
              className="h-8 w-8 p-0 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
