
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BacklogItem, BacklogItemsTableProps } from "./BacklogTypes";
import { BacklogItemRow } from "./BacklogItemRow";
import { TableLoadingSkeleton } from "./TableLoadingSkeleton";

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
  canDelete = true,
  // Support both property styles for compatibility
  items,
  onEdit,
  onPromote,
  onDelete
}: BacklogItemsTableProps) {
  
  // Create handlers that support both property patterns
  const handleEdit = (item: BacklogItem) => {
    if (onEdit) {
      onEdit(item);
    } else if (setSelectedItem && setIsEditingDialogOpen) {
      setSelectedItem(item);
      setIsEditingDialogOpen(true);
    }
  };
  
  const handlePromote = (item: BacklogItem) => {
    if (onPromote) {
      onPromote(item);
    } else if (setSelectedItem && setIsPromotingDialogOpen) {
      setSelectedItem(item);
      setIsPromotingDialogOpen(true);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (onDelete) {
      await onDelete(id);
    } else if (deleteBacklogItem) {
      await deleteBacklogItem(id);
    }
  };
  
  if (loading) {
    return <TableLoadingSkeleton />;
  }
  
  // Use the appropriate items array (support both patterns)
  const itemsToDisplay = items || filteredItems || [];
  
  if (itemsToDisplay.length === 0) {
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
            {itemsToDisplay.map((item) => (
              <BacklogItemRow 
                key={item.id}
                item={item}
                getPriorityInfo={getPriorityInfo}
                getStatusInfo={getStatusInfo}
                getProjectName={getProjectName}
                formatDate={formatDate}
                onEdit={handleEdit}
                onPromote={handlePromote}
                onDelete={handleDelete}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
