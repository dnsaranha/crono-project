
import React, { useState, useRef } from "react";
import { 
  Card, CardContent, CardDescription,
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/components/Task";
import { Calendar, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Tooltip, TooltipContent, 
  TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { useSwipeable } from "react-swipeable";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";

interface TaskAllocationTableProps {
  filteredTasks: TaskType[];
  projects: any[];
  members: any[];
}

export function TaskAllocationTable({ filteredTasks, projects, members }: TaskAllocationTableProps) {
  const [currentScroll, setCurrentScroll] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Get project by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projeto Desconhecido";
  };

  // Get member name by ID
  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : "Membro Desconhecido";
  };

  // Get priority info
  const getPriorityInfo = (priority?: number) => {
    const priorityLevel = priority || 3;
    const options = [
      { value: 1, label: "Muito Baixa", color: "bg-gray-400" },
      { value: 2, label: "Baixa", color: "bg-blue-400" },
      { value: 3, label: "Média", color: "bg-green-400" },
      { value: 4, label: "Alta", color: "bg-yellow-400" },
      { value: 5, label: "Muito Alta", color: "bg-red-400" }
    ];
    
    return options.find(o => o.value === priorityLevel) || options[2];
  };

  // Setup swipe handlers for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      scrollTable(100);
    },
    onSwipedRight: () => {
      scrollTable(-100);
    },
    trackMouse: false,
    preventDefaultTouchmoveEvent: true
  });

  const scrollTable = (amount: number) => {
    if (tableRef.current) {
      const newScroll = Math.max(0, currentScroll + amount);
      tableRef.current.scrollLeft = newScroll;
      setCurrentScroll(newScroll);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Alocação de Tarefas</CardTitle>
          <CardDescription>
            Detalhe de todas as tarefas atribuídas no período
          </CardDescription>
        </div>
        <Badge variant="outline" className="ml-2">
          {filteredTasks.length} tarefas
        </Badge>
      </CardHeader>
      <CardContent className="relative">
        {isMobile && (
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => scrollTable(-150)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Rolar para esquerda</span>
            </Button>
            
            <div className="text-xs text-center text-muted-foreground px-2">
              Deslize para navegar
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => scrollTable(150)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Rolar para direita</span>
            </Button>
          </div>
        )}
        <div 
          ref={tableRef}
          {...handlers}
          className="rounded-md border overflow-auto max-h-[70vh] touch-pan-x"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px] font-medium">Nome da Tarefa</TableHead>
                <TableHead className="w-[100px]">Projeto</TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Início</span>
                    <span className="xs:hidden">Data</span>
                  </div>
                </TableHead>
                <TableHead className="w-[70px]">Dias</TableHead>
                <TableHead className="w-[100px]">Prioridade</TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="hidden xs:inline">Responsáveis</span>
                    <span className="xs:hidden">Resp.</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma tarefa encontrada com os filtros atuais.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map(task => {
                  const priorityInfo = getPriorityInfo(task.priority);
                  return (
                    <TableRow key={task.id} className="touch-manipulation">
                      <TableCell className="font-medium py-2 sm:py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <span className="truncate max-w-[130px] sm:max-w-full">
                            {task.name}
                          </span>
                          {task.isMilestone && (
                            <Badge variant="outline" className="mt-1 sm:mt-0 sm:ml-2 bg-purple-50 dark:bg-purple-900/30 inline-flex">
                              Marco
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-4">
                        {task.projectId && (
                          <Badge variant="outline" className="truncate max-w-[80px]">
                            {getProjectName(task.projectId)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 sm:py-4">
                        {format(parseISO(task.startDate), "dd 'de' MMM", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="py-2 sm:py-4">{task.duration}</TableCell>
                      <TableCell className="py-2 sm:py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`}></div>
                          <span className="text-xs">{priorityInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 sm:py-4">
                        {task.assignees && task.assignees.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {task.assignees.slice(0, 2).map(userId => (
                              <TooltipProvider key={userId}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
                                      {getMemberName(userId).split(' ')[0]}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{getMemberName(userId)}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                            {task.assignees.length > 2 && (
                              <Badge variant="outline">+{task.assignees.length - 2}</Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Nenhum</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
