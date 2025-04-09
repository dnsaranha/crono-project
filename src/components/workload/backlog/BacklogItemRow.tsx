
import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, ArrowUpRight, Trash2 } from "lucide-react";
import { BacklogItem } from "./BacklogTypes";

interface BacklogItemRowProps {
  item: BacklogItem;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  getProjectName: (projectId: string) => string;
  formatDate: (dateString: string) => string;
  onEdit: (item: BacklogItem) => void;
  onPromote: (item: BacklogItem) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
  canDelete: boolean;
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
  canEdit,
  canDelete
}: BacklogItemRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.title}</TableCell>
      <TableCell>
        <Badge variant="outline" className={`${getPriorityInfo(item.priority).color}`}>
          {getPriorityInfo(item.priority).label}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`${getStatusInfo(item.status).color}`}>
          {getStatusInfo(item.status).label}
        </Badge>
      </TableCell>
      <TableCell>
        {item.target_project_id ? getProjectName(item.target_project_id) : '-'}
      </TableCell>
      <TableCell>{item.creator_name || "Usuário"}</TableCell>
      <TableCell>{formatDate(item.created_at)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 touch-manipulation">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEdit(item)}
              disabled={!canEdit || item.status === 'converted'}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onPromote(item)}
              disabled={item.status === 'converted'}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Converter para Tarefa
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={() => onDelete(item.id)}
              disabled={!canDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
