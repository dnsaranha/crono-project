
import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Edit, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskAllocationTableProps {
  filteredTasks: any[];
  projects: any[];
  members: any[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export function TaskAllocationTable({ 
  filteredTasks, 
  projects, 
  members,
  canEdit = true,
  canDelete = true 
}: TaskAllocationTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<string>("startDate");
  const [sortDirection, setSortDirection] = useState<string>("asc");

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Calculate end date
  const calculateEndDate = (startDate: string, duration: number) => {
    try {
      const date = new Date(startDate);
      const endDate = addDays(date, duration);
      return formatDate(endDate.toISOString());
    } catch (e) {
      return "N/A";
    }
  };

  // Get project by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projeto Desconhecido";
  };

  // Get member name by ID
  const getMemberName = (userId: string) => {
    const member = members.find(m => m.id === userId);
    return member ? member.name : "Usuário";
  };

  // Get priority display info
  const getPriorityInfo = (priority: number = 3) => {
    const options = [
      { value: 1, label: "Muito Baixa", color: "bg-gray-400 text-white" },
      { value: 2, label: "Baixa", color: "bg-blue-400 text-white" },
      { value: 3, label: "Média", color: "bg-green-400 text-white" },
      { value: 4, label: "Alta", color: "bg-yellow-400 text-white" },
      { value: 5, label: "Muito Alta", color: "bg-red-400 text-white" }
    ];
    
    return options.find(o => o.value === priority) || options[2];
  };

  // Handle table sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort tasks based on current sort field and direction
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "priority":
          comparison = (a.priority || 3) - (b.priority || 3);
          break;
        case "startDate":
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case "duration":
          comparison = a.duration - b.duration;
          break;
        case "project":
          comparison = getProjectName(a.project_id).localeCompare(getProjectName(b.project_id));
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredTasks, sortField, sortDirection]);

  // Navigate to task in project
  const goToTask = (projectId: string) => {
    navigate(`/project/${projectId}/grid`);
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 bg-muted/20">
        <h3 className="font-medium text-lg">Tarefas Alocadas</h3>
        <p className="text-muted-foreground text-sm">
          {sortedTasks.length} {sortedTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}
        </p>
      </div>
      
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[250px] cursor-pointer" 
                onClick={() => handleSort("name")}
              >
                Nome da Tarefa {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="w-[130px] cursor-pointer" 
                onClick={() => handleSort("priority")}
              >
                Prioridade {sortField === "priority" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="w-[130px] cursor-pointer" 
                onClick={() => handleSort("startDate")}
              >
                Data de Início {sortField === "startDate" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead 
                className="w-[100px] cursor-pointer" 
                onClick={() => handleSort("duration")}
              >
                Duração {sortField === "duration" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[130px]">Data de Fim</TableHead>
              <TableHead 
                className="w-[150px] cursor-pointer" 
                onClick={() => handleSort("project")}
              >
                Projeto {sortField === "project" && (sortDirection === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[200px]">Responsáveis</TableHead>
              {canEdit && <TableHead className="w-[80px]">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canEdit ? 8 : 7} className="h-24 text-center">
                  Nenhuma tarefa encontrada no período selecionado.
                </TableCell>
              </TableRow>
            ) : (
              sortedTasks.map(task => {
                const priorityInfo = getPriorityInfo(task.priority);
                
                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium">{task.name}</TableCell>
                    <TableCell>
                      <Badge className={priorityInfo.color}>
                        {priorityInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(task.startDate)}</TableCell>
                    <TableCell>{task.duration} dias</TableCell>
                    <TableCell>{calculateEndDate(task.startDate, task.duration)}</TableCell>
                    <TableCell>{getProjectName(task.project_id)}</TableCell>
                    <TableCell>
                      {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {task.assignees.slice(0, 2).map((assigneeId: string) => (
                            <TooltipProvider key={assigneeId}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 min-w-8 text-center">
                                    {getMemberName(assigneeId).split(' ')[0] || "Usuário"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{getMemberName(assigneeId)}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {task.assignees.length > 2 && (
                            <Badge variant="outline">+{task.assignees.length - 2}</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Não atribuído</span>
                      )}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => goToTask(task.project_id)}
                          className="h-9 w-9 p-0 touch-manipulation"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
