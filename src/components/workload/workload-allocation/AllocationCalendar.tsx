
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Task } from "@/contexts/WorkloadDashboardContext";
import { format, parseISO, addDays, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getAllocationTableActions } from "./AllocationActions";
import { BigCalendarView } from "./BigCalendarView";

interface AllocationCalendarProps {
  tasks: Task[];
  projects: any[];
  members: any[];
  timeFrame: string;
  isMobile: boolean;
  useBigCalendar?: boolean;
}

export function AllocationCalendar({
  tasks,
  projects,
  members,
  timeFrame,
  isMobile,
  useBigCalendar = false
}: AllocationCalendarProps) {
  // Se estiver usando o BigCalendar, renderiza ele diretamente
  if (useBigCalendar) {
    return (
      <BigCalendarView 
        tasks={tasks}
        projects={projects}
        members={members}
        timeFrame={timeFrame}
      />
    );
  }
  
  const today = new Date();
  
  // Determinar período de visualização
  const getDateRange = () => {
    switch(timeFrame) {
      case "week":
        return { start: today, end: addDays(today, 7) };
      case "month":
        return { start: startOfMonth(today), end: endOfMonth(addMonths(today, 0)) };
      case "quarter":
        return { start: today, end: addDays(today, 90) };
      default:
        return { start: today, end: addDays(today, 30) };
    }
  };
  
  const { start, end } = getDateRange();
  
  // Gerar dias do calendário
  const calendarDays = [];
  let currentDate = new Date(start);
  
  while (currentDate <= end) {
    calendarDays.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
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
  
  // Agrupar tarefas por membro
  const tasksByMember = React.useMemo(() => {
    const result = new Map();
    
    // Primeiro, adicionar todos os membros (mesmo sem tarefas)
    members.forEach(member => {
      result.set(member.id, {
        memberName: member.name,
        tasks: []
      });
    });
    
    // Adicionar "Não atribuído" grupo
    result.set('unassigned', {
      memberName: "Não atribuído",
      tasks: []
    });
    
    // Adicionar tarefas aos membros
    tasks.forEach(task => {
      const taskStart = parseISO(task.startDate);
      const taskEnd = addDays(taskStart, task.duration);
      
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach(assigneeId => {
          if (result.has(assigneeId)) {
            result.get(assigneeId).tasks.push({
              ...task,
              taskStart,
              taskEnd
            });
          }
        });
      } else {
        result.get('unassigned').tasks.push({
          ...task,
          taskStart,
          taskEnd
        });
      }
    });
    
    // Converter para array e filtrar membros sem tarefas
    return Array.from(result.values())
      .filter(item => item.tasks.length > 0)
      .sort((a, b) => a.memberName.localeCompare(b.memberName));
  }, [tasks, members]);
  
  if (tasksByMember.length === 0) {
    return (
      <div className="bg-card rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhuma tarefa encontrada com os filtros selecionados</p>
      </div>
    );
  }
  
  // Verificar se uma tarefa está ativa em determinada data
  const isTaskActiveOnDate = (task: any, date: Date) => {
    return date >= task.taskStart && date <= task.taskEnd;
  };
  
  // Obter cor baseada na prioridade
  const getColorByPriority = (priority: number) => {
    switch(priority) {
      case 1: return "bg-gray-200 dark:bg-gray-600";
      case 2: return "bg-blue-200 dark:bg-blue-600";
      case 3: return "bg-green-200 dark:bg-green-600"; 
      case 4: return "bg-yellow-200 dark:bg-yellow-600";
      case 5: return "bg-red-200 dark:bg-red-600";
      default: return "bg-green-200 dark:bg-green-600";
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Cabeçalho do Calendário */}
            <div className="flex border-b">
              <div className="w-40 shrink-0 p-3 font-medium">Colaborador</div>
              <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${calendarDays.length}, minmax(50px, 1fr))` }}>
                {calendarDays.map((day, index) => (
                  <div 
                    key={index} 
                    className={`p-1 text-center text-xs border-r 
                      ${format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'bg-primary/10' : ''}
                      ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/50' : ''}
                    `}
                  >
                    <div className="font-medium">
                      {format(day, 'dd', { locale: ptBR })}
                    </div>
                    <div className="text-muted-foreground">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Linhas do calendário */}
            {tasksByMember.map((memberData, memberIndex) => (
              <div key={memberIndex} className="flex border-b">
                <div className="w-40 shrink-0 p-3 font-medium flex items-center">
                  {memberData.memberName}
                </div>
                <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${calendarDays.length}, minmax(50px, 1fr))` }}>
                  {calendarDays.map((day, dayIndex) => (
                    <div 
                      key={dayIndex} 
                      className={`h-[80px] border-r border-b
                        ${format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'bg-primary/10' : ''}
                        ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-muted/50' : ''}
                      `}
                    >
                      {/* Conteúdo do dia */}
                    </div>
                  ))}
                  
                  {/* Tarefas */}
                  {memberData.tasks.map((task, taskIndex) => {
                    // Calcular posição e tamanho
                    const startIndex = calendarDays.findIndex(day => 
                      format(day, 'yyyy-MM-dd') === format(task.taskStart, 'yyyy-MM-dd')
                    );
                    
                    const endIndex = calendarDays.findIndex(day => 
                      format(day, 'yyyy-MM-dd') === format(task.taskEnd, 'yyyy-MM-dd')
                    );
                    
                    const taskLength = endIndex >= 0 ? (endIndex - startIndex + 1) : 
                      (calendarDays.length - startIndex);
                    
                    // Verificar se a tarefa está visível no calendário
                    if (startIndex < 0) return null;
                    
                    return (
                      <div
                        key={taskIndex}
                        className={`absolute rounded-md p-1 text-xs ${getColorByPriority(task.priority || 3)}`}
                        style={{
                          left: `${(startIndex / calendarDays.length) * 100}%`,
                          top: `${(taskIndex % 2) * 40 + 4}px`,
                          width: `${(taskLength / calendarDays.length) * 100}%`,
                          maxWidth: `${(taskLength / calendarDays.length) * 100}%`,
                          minWidth: '50px',
                          height: '36px',
                          zIndex: 10,
                          overflow: 'hidden'
                        }}
                        title={`${task.name} - ${getProjectName(task.project_id)}`}
                      >
                        <div className="flex justify-between items-center h-full">
                          <span className="truncate max-w-[80%]">{task.name}</span>
                          <span>
                            {getAllocationTableActions(task, true, true)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
