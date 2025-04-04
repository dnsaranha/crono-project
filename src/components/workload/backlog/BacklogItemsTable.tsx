
import React from 'react';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip, TooltipContent,
  TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { Edit, MoveRight, Trash2 } from 'lucide-react';
import { BacklogItem } from './BacklogTypes';

interface BacklogItemsTableProps {
  filteredItems: BacklogItem[];
  loading: boolean;
  getPriorityInfo: (priority: number) => any;
  getStatusInfo: (status: string) => any;
  formatDate: (dateString: string) => string;
  getProjectName: (projectId: string) => string;
  setSelectedItem: (item: BacklogItem) => void;
  setIsEditingDialogOpen: (isOpen: boolean) => void;
  setIsPromotingDialogOpen: (isOpen: boolean) => void;
  deleteBacklogItem: (id: string) => void;
  canEdit: boolean;
  canDelete: boolean;
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
  return (
    <div className="rounded-md border overflow-hidden max-h-[500px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Título</TableHead>
            <TableHead className="w-[100px]">Prioridade</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Criado Em</TableHead>
            <TableHead className="w-[120px]">Criado Por</TableHead>
            <TableHead className="w-[150px]">Projeto Destino</TableHead>
            <TableHead className="w-[120px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {loading ? (
                  "Carregando itens do backlog..."
                ) : (
                  "Nenhum item encontrado no backlog. Clique em 'Novo Item' para adicionar."
                )}
              </TableCell>
            </TableRow>
          ) : (
            filteredItems.map(item => {
              const priorityInfo = getPriorityInfo(item.priority);
              const statusInfo = getStatusInfo(item.status);
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.title}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`}></div>
                      <span className="text-xs">{priorityInfo.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.created_at)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
                      {item.creator_name || "Usuário"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.target_project_id ? (
                      <Badge>{getProjectName(item.target_project_id)}</Badge>
                    ) : (
                      <span className="text-xs text-gray-400">Nenhum</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      {canEdit && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsEditingDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Editar</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {item.status !== "converted" && canEdit && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsPromotingDialogOpen(true);
                                }}
                              >
                                <MoveRight className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Converter para Tarefa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {canDelete && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                onClick={() => deleteBacklogItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Excluir</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
