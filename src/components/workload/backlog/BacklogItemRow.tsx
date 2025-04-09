
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, FileEdit, Star, Trash } from "lucide-react";
import { BacklogItem } from "./BacklogTypes";
import { useBacklog } from "./BacklogContext";

interface BacklogItemRowProps {
  item: BacklogItem;
  getPriorityInfo?: (priority: number) => { color: string; label: string };
  getStatusInfo?: (status: string) => { color: string; label: string };
  formatDate?: (dateString: string) => string;
  getProjectName?: (projectId: string | null | undefined) => string;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function BacklogItemRow({
  item,
  getPriorityInfo,
  getStatusInfo,
  formatDate,
  getProjectName,
  canEdit = true,
  canDelete = true,
}: BacklogItemRowProps) {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  
  const {
    setSelectedItem,
    setIsEditingDialogOpen,
    setIsPromotingDialogOpen,
    deleteBacklogItem,
    canUserEdit,
    canUserDelete
  } = useBacklog();

  const handleEdit = () => {
    setSelectedItem(item);
    setIsEditingDialogOpen(true);
  };

  const handlePromote = () => {
    setSelectedItem(item);
    setIsPromotingDialogOpen(true);
  };

  const handleDelete = async () => {
    await deleteBacklogItem(item.id);
    setIsDeleteAlertOpen(false);
  };

  const isEditable = canEdit && canUserEdit(item);
  const isDeletable = canDelete && canUserDelete(item);

  const priorityInfo = getPriorityInfo ? getPriorityInfo(item.priority) : { label: String(item.priority), color: "" };
  const statusInfo = getStatusInfo ? getStatusInfo(item.status) : { label: item.status, color: "" };
  const createdDate = formatDate ? formatDate(item.created_at) : new Date(item.created_at).toLocaleDateString();
  const projectName = getProjectName ? getProjectName(item.target_project_id) : (item.target_project_id || "Nenhum");

  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="px-4 py-2 font-medium">{item.title}</td>
      <td className="px-4 py-2 hidden md:table-cell">
        <Badge variant="outline" className={priorityInfo.color}>
          {priorityInfo.label}
        </Badge>
      </td>
      <td className="px-4 py-2 hidden lg:table-cell">
        <Badge variant="outline" className={statusInfo.color}>
          {statusInfo.label}
        </Badge>
      </td>
      <td className="px-4 py-2 hidden xl:table-cell">{projectName}</td>
      <td className="px-4 py-2 hidden lg:table-cell">{createdDate}</td>
      <td className="px-4 py-2">
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Opções</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isEditable && (
                <DropdownMenuItem onClick={handleEdit}>
                  <FileEdit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
              )}
              {item.status !== "converted" && (
                <DropdownMenuItem onClick={handlePromote}>
                  <Star className="h-4 w-4 mr-2" />
                  Promover para Tarefa
                </DropdownMenuItem>
              )}
              {isDeletable && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setIsDeleteAlertOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este item do backlog? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </td>
    </tr>
  );
}
