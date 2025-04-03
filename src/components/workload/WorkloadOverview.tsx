
import { useState, useMemo } from "react";
import { 
  Card, CardContent, CardDescription,
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, Search, Users } from "lucide-react";
import { TaskType } from "@/components/Task";
import { WorkloadBarChart } from "./WorkloadBarChart";
import { 
  Tooltip, TooltipContent, 
  TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { format, isWithinInterval, addDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface WorkloadOverviewProps {
  tasks: TaskType[];
  members: any[];
  projects: any[];
}

export function WorkloadOverview({ tasks, members, projects }: WorkloadOverviewProps) {
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [timeFrame, setTimeFrame] = useState<string>("month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Filter tasks based on current search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter by member if selected
      if (selectedMember !== "all" && (!task.assignees || !task.assignees.includes(selectedMember))) {
        return false;
      }

      // Filter by search query
      if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by timeframe
      const taskStart = parseISO(task.startDate);
      const today = new Date();
      
      if (timeFrame === "week") {
        const weekEnd = addDays(today, 7);
        return isWithinInterval(taskStart, { start: today, end: weekEnd });
      } else if (timeFrame === "month") {
        const monthEnd = addDays(today, 30);
        return isWithinInterval(taskStart, { start: today, end: monthEnd });
      } else if (timeFrame === "quarter") {
        const quarterEnd = addDays(today, 90);
        return isWithinInterval(taskStart, { start: today, end: quarterEnd });
      }
      
      return true;
    });
  }, [tasks, selectedMember, timeFrame, searchQuery]);
  
  // Calculate workload per member
  const memberWorkloadData = useMemo(() => {
    const workloadMap = new Map();
    
    members.forEach(member => {
      workloadMap.set(member.id, { 
        name: member.name, 
        taskCount: 0,
        totalDuration: 0,
        highPriorityTasks: 0,
        tasks: []
      });
    });
    
    filteredTasks.forEach(task => {
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach(assigneeId => {
          if (workloadMap.has(assigneeId)) {
            const memberStats = workloadMap.get(assigneeId);
            memberStats.taskCount += 1;
            memberStats.totalDuration += task.duration || 0;
            if ((task.priority || 3) >= 4) {
              memberStats.highPriorityTasks += 1;
            }
            memberStats.tasks.push(task);
          }
        });
      }
    });
    
    return Array.from(workloadMap.values())
      .filter(data => data.taskCount > 0)
      .sort((a, b) => b.totalDuration - a.totalDuration);
  }, [filteredTasks, members]);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Controles</CardTitle>
          <CardDescription>Ajuste as configurações para visualizar a carga de trabalho</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Colaborador</label>
              <Select 
                value={selectedMember} 
                onValueChange={setSelectedMember}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um colaborador" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Colaboradores</SelectItem>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select 
                value={timeFrame} 
                onValueChange={setTimeFrame}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Próxima Semana</SelectItem>
                  <SelectItem value="month">Próximo Mês</SelectItem>
                  <SelectItem value="quarter">Próximo Trimestre</SelectItem>
                  <SelectItem value="all">Todas as Atividades</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Atividade</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome da atividade"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Workload Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Visualização de Carga de Trabalho</CardTitle>
          <CardDescription>
            Mostra a distribuição de tarefas entre os colaboradores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <WorkloadBarChart data={memberWorkloadData} />
          </div>
        </CardContent>
      </Card>
      
      {/* Task Allocation Table */}
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
        <CardContent>
          <div className="rounded-md border overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Nome da Tarefa</TableHead>
                  <TableHead className="w-[150px]">Projeto</TableHead>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Início
                    </div>
                  </TableHead>
                  <TableHead className="w-[80px]">Duração</TableHead>
                  <TableHead className="w-[100px]">Prioridade</TableHead>
                  <TableHead className="w-[150px]">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      Responsáveis
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
                      <TableRow key={task.id}>
                        <TableCell className="font-medium">
                          {task.name}
                          {task.isMilestone && (
                            <Badge variant="outline" className="ml-2 bg-purple-50 dark:bg-purple-900/30">
                              Marco
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.projectId && (
                            <Badge variant="outline">{getProjectName(task.projectId)}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(parseISO(task.startDate), "dd 'de' MMM", { locale: ptBR })}
                        </TableCell>
                        <TableCell>{task.duration} dias</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`}></div>
                            <span className="text-xs">{priorityInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
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
    </div>
  );
}
