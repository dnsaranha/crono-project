
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { MoreHorizontal, FileText, ArrowUpRight, Trash2, Edit } from "lucide-react";
import { BacklogItem } from "./BacklogTypes";
import { Skeleton } from "@/components/ui/skeleton";

export interface BacklogItemsTableProps {
  filteredItems: BacklogItem[];
  loading: boolean;
  getPriorityInfo: (priority: number) => { label: string; color: string };
  getStatusInfo: (status: string) => { label: string; color: string };
  formatDate: (date: string) => string;
  getProjectName: (projectId: string) => string;
  setSelectedItem: (item: BacklogItem) => void;
  setIsEditingDialogOpen: (isOpen: boolean) => void;
  setIsPromotingDialogOpen: (isOpen: boolean) => void;
  deleteBacklogItem: (id: string) => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function BacklogItemsTable({
  filteredItems,
  loading,
  getPriorityInfo,
  getStatusInfo,
  formatDate,
  getProjectName,
  setSelectedItem,
  setIsEditingDialogOpen,
  setIsPromotingDialogOpen,
  deleteBacklogItem,
  canEdit = true,
  canDelete = true
}: BacklogItemsTableProps) {
  const handleEdit = (item: BacklogItem) => {
    setSelectedItem(item);
    setIsEditingDialogOpen(true);
  };
  
  const handlePromote = (item: BacklogItem) => {
    setSelectedItem(item);
    setIsPromotingDialogOpen(true);
  };
  
  if (loading) {
    return <TableLoadingSkeleton />;
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Nenhum item encontrado com os filtros atuais
      </div>
    );
  }
  
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead className="w-[100px]">Prioridade</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Projeto Destino</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead className="w-[120px]">Data</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item.id}>
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
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handleEdit(item)}
                        disabled={!canEdit || item.status === 'converted'}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => handlePromote(item)}
                        disabled={item.status === 'converted'}
                      >
                        <ArrowUpRight className="mr-2 h-4 w-4" />
                        Converter para Tarefa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive"
                        onClick={() => deleteBacklogItem(item.id)}
                        disabled={!canDelete}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TableLoadingSkeleton() {
  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Título</TableHead>
              <TableHead className="w-[100px]">Prioridade</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead>Projeto Destino</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead className="w-[120px]">Data</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
