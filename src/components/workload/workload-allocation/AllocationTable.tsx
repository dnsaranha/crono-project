
import React from "react";
import { 
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { Task } from "@/contexts/WorkloadDashboardContext";
import { getAllocationTableActions } from "./AllocationActions";

interface AllocationTableProps {
  filteredTasks: Task[];
  projects: any[];
  members: any[];
  canEdit: boolean;
  canDelete: boolean;
}

export function AllocationTable({ 
  filteredTasks, 
  projects, 
  members,
  canEdit,
  canDelete
}: AllocationTableProps) {
  // Função para obter o nome do projeto
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projeto Desconhecido";
  };
  
  // Função para obter o nome dos membros assignados
  const getAssigneeNames = (assigneeIds: string[]): string => {
    if (!assigneeIds || assigneeIds.length === 0) return "Não Atribuído";
    
    return assigneeIds
      .map(id => {
        const member = members.find(m => m.id === id || m.user_id === id);
        return member ? member.name : "Desconhecido";
      })
      .join(", ");
  };
  
  // Obter a cor de prioridade
  const getPriorityInfo = (priority: number) => {
    switch(priority) {
      case 1: return { color: "bg-gray-100 text-gray-800", label: "Muito Baixa" };
      case 2: return { color: "bg-blue-100 text-blue-800", label: "Baixa" };
      case 3: return { color: "bg-green-100 text-green-800", label: "Média" };
      case 4: return { color: "bg-yellow-100 text-yellow-800", label: "Alta" };
      case 5: return { color: "bg-red-100 text-red-800", label: "Muito Alta" };
      default: return { color: "bg-green-100 text-green-800", label: "Média" };
    }
  };
  
  // Formatar data
  const formatDate = (dateString: string): string => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy");
    } catch (e) {
      return "Data Inválida";
    }
  };

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-card rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhuma tarefa encontrada com os filtros selecionados</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableCaption>Lista de alocação de tarefas por colaborador</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Tarefa</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead className="text-center">Prioridade</TableHead>
              <TableHead className="text-right">Data Início</TableHead>
              <TableHead className="text-right">Duração</TableHead>
              <TableHead className="text-right">Progresso</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
                <TableCell>{getProjectName(task.project_id)}</TableCell>
                <TableCell>{getAssigneeNames(task.assignees || [])}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className={`${getPriorityInfo(task.priority || 3).color}`}>
                    {getPriorityInfo(task.priority || 3).label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{formatDate(task.startDate)}</TableCell>
                <TableCell className="text-right">{task.duration} dias</TableCell>
                <TableCell className="text-right">{task.progress}%</TableCell>
                <TableCell className="text-right">
                  {getAllocationTableActions(task, canEdit, canDelete)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
