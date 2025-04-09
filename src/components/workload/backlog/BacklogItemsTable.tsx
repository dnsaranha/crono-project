
import React from "react";
import { BacklogItem, BacklogItemsTableProps } from "./BacklogTypes";
import { BacklogItemRow, BacklogItemRowSkeleton } from "./BacklogItemRow";
import { TableLoadingSkeleton } from "./TableLoadingSkeleton";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useBacklog } from "./BacklogContext";

export function BacklogItemsTable({
  // Suporta ambos os padrões de propriedades
  filteredItems,
  items,
  loading,
  getPriorityInfo,
  getStatusInfo,
  formatDate,
  getProjectName,
  setSelectedItem,
  setIsEditingDialogOpen,
  setIsPromotingDialogOpen,
  deleteBacklogItem,
  onEdit,
  onPromote,
  onDelete,
  canEdit = true,
  canDelete = true,
}: BacklogItemsTableProps) {
  // Usa o contexto para obter as funções se não forem fornecidas como props
  const context = useBacklog();
  
  // Determinar que fonte de dados usar
  const dataItems = filteredItems || items || [];
  
  // Usar as funções fornecidas como props ou as do contexto
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
  
  // Usar as funções de utilidade fornecidas ou do contexto
  const usedGetPriorityInfo = getPriorityInfo || context.getPriorityInfo;
  const usedGetStatusInfo = getStatusInfo || context.getStatusInfo;
  const usedFormatDate = formatDate || context.formatDate;
  const usedGetProjectName = getProjectName || context.getProjectName;

  if (loading) {
    return <TableLoadingSkeleton />;
  }

  return (
    <div className="relative overflow-hidden rounded-md border">
      <div className="overflow-auto max-h-[600px]">
        <table className="w-full">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr className="border-b">
              <th className="text-left py-2 px-4">Título</th>
              <th className="text-left py-2 px-4">Prioridade</th>
              <th className="text-left py-2 px-4">Status</th>
              <th className="text-left py-2 px-4">Projeto</th>
              <th className="text-left py-2 px-4">Criado em</th>
              <th className="text-left py-2 px-4">Criado por</th>
              <th className="text-right py-2 px-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={context.loadBacklogItems}
                  title="Atualizar lista"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </th>
            </tr>
          </thead>
          <tbody>
            {dataItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-muted-foreground">
                  Nenhum item encontrado
                </td>
              </tr>
            ) : (
              dataItems.map((item: BacklogItem) => (
                <BacklogItemRow
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  description={item.description}
                  priority={item.priority}
                  status={item.status}
                  created_at={item.created_at}
                  target_project_id={item.target_project_id}
                  creator_id={item.creator_id}
                  creator_name={item.creator_name}
                  getPriorityInfo={usedGetPriorityInfo}
                  getStatusInfo={usedGetStatusInfo}
                  getProjectName={usedGetProjectName}
                  onEdit={() => handleEdit(item)}
                  onPromote={() => handlePromote(item)}
                  onDelete={() => handleDelete(item.id)}
                  canEdit={canEdit}
                  canDelete={canDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
