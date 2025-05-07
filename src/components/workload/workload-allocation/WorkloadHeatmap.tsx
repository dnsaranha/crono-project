
import React, { useMemo } from "react";
import { format, parseISO, isWithinInterval, addDays, addWeeks, getWeek, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar } from "@/components/ui/avatar";
import { Task } from "@/contexts/WorkloadDashboardContext";

interface WorkloadHeatmapProps {
  tasks: Task[];
  members: any[];
  timeFrame: string;
}

export function WorkloadHeatmap({ tasks, members, timeFrame }: WorkloadHeatmapProps) {
  // Gerar as semanas para exibição
  const weeks = useMemo(() => {
    const result = [];
    const today = new Date();
    const totalWeeks = timeFrame === "week" ? 2 : 
                       timeFrame === "month" ? 4 : 6;
    
    for (let i = 0; i < totalWeeks; i++) {
      const weekStart = addWeeks(today, i);
      const weekEnd = addDays(weekStart, 6);
      const weekNumber = getWeek(weekStart);
      const year = getYear(weekStart);
      const month = format(weekStart, 'MMMM', { locale: ptBR });
      
      result.push({
        start: weekStart,
        end: weekEnd,
        label: `W${weekNumber}`,
        sublabel: i === 0 || format(weekStart, 'MMM') !== format(addWeeks(today, i-1), 'MMM') 
          ? format(weekStart, 'MMM yyyy', { locale: ptBR })
          : null
      });
    }
    
    return result;
  }, [timeFrame]);

  // Preparar dados do membro não atribuído
  const unassignedMember = {
    id: 'unassigned',
    name: 'Não atribuído',
    avatar_url: null,
    isUnassigned: true
  };

  // Combinar membros com a opção não atribuída
  const allMembers = [...members, unassignedMember];

  // Calcular tarefas por membro e semana
  const memberWeeklyTasks = useMemo(() => {
    const result = {};
    
    // Inicializar estrutura para todos os membros
    allMembers.forEach(member => {
      const memberId = member.id || member.user_id || 'unassigned';
      result[memberId] = {};
      
      weeks.forEach(week => {
        result[memberId][week.label] = [];
      });
    });
    
    // Atribuir tarefas às semanas e membros correspondentes
    tasks.forEach(task => {
      if (!task.startDate) return;
      
      const taskStart = parseISO(task.startDate);
      const taskEnd = addDays(taskStart, task.duration);
      
      // Verificar em quais semanas a tarefa se encaixa
      weeks.forEach(week => {
        if (isWithinInterval(taskStart, { start: week.start, end: week.end }) ||
            isWithinInterval(taskEnd, { start: week.start, end: week.end }) ||
            (taskStart <= week.start && taskEnd >= week.end)) {
          
          // Se tem responsáveis atribuídos
          if (task.assignees && task.assignees.length > 0) {
            task.assignees.forEach(assigneeId => {
              // Tentar encontrar por id ou user_id
              const member = members.find(m => m.id === assigneeId || m.user_id === assigneeId);
              const memberId = member ? (member.id || member.user_id) : assigneeId;
              
              if (result[memberId] && result[memberId][week.label]) {
                result[memberId][week.label].push(task);
              }
            });
          } else {
            // Não atribuído
            if (result['unassigned'] && result['unassigned'][week.label]) {
              result['unassigned'][week.label].push(task);
            }
          }
        }
      });
    });
    
    return result;
  }, [tasks, weeks, allMembers, members]);

  // Calcular tamanho do círculo com base na quantidade de tarefas
  const getCircleSize = (count) => {
    if (count === 0) return 'h-0 w-0';
    if (count === 1) return 'h-8 w-8';
    if (count === 2) return 'h-10 w-10';
    if (count === 3) return 'h-12 w-12';
    return 'h-14 w-14';
  };
  
  // Calcular cor do círculo com base na quantidade de tarefas
  const getCircleColor = (count) => {
    if (count === 0) return '';
    if (count === 1) return 'bg-blue-100';
    if (count === 2) return 'bg-blue-200';
    if (count === 3) return 'bg-blue-300';
    return 'bg-blue-500';
  };
  
  // Calcular cor do ponto central com base na quantidade de tarefas
  const getCenterDotColor = (count) => {
    if (count === 0) return '';
    if (count <= 3) return 'bg-blue-600';
    return 'bg-white';
  };

  return (
    <div className="overflow-x-auto touch-manipulation">
      <div className="min-w-[800px]">
        {/* Cabeçalho com as semanas */}
        <div className="grid" style={{ gridTemplateColumns: `240px repeat(${weeks.length}, 1fr)` }}>
          <div className="p-2 font-medium text-center">Colaborador</div>
          {weeks.map((week, index) => (
            <div key={index} className="px-2 py-1 text-center">
              {week.sublabel && (
                <div className="text-xs text-muted-foreground capitalize">
                  {week.sublabel}
                </div>
              )}
              <div className="font-medium">{week.label}</div>
            </div>
          ))}
        </div>
        
        {/* Linhas para cada membro */}
        {allMembers.map((member, memberIndex) => (
          <div
            key={member.id || member.user_id || 'unassigned'}
            className={`grid ${memberIndex % 2 === 0 ? 'bg-card' : 'bg-muted/20'}`}
            style={{ gridTemplateColumns: `240px repeat(${weeks.length}, 1fr)` }}
          >
            {/* Informações do membro */}
            <div className="p-3 flex items-center gap-3 border-b">
              {member.isUnassigned ? (
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground">?</span>
                </div>
              ) : (
                <Avatar className="h-10 w-10 border">
                  {member.avatar_url ? (
                    <img src={member.avatar_url} alt={member.name} />
                  ) : (
                    <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                      {member.name.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                </Avatar>
              )}
              <div>
                <div className="font-medium">{member.name}</div>
                {member.role && <div className="text-xs text-muted-foreground">{member.role}</div>}
              </div>
            </div>
            
            {/* Células para cada semana */}
            {weeks.map((week) => {
              const memberId = member.id || member.user_id || 'unassigned';
              const tasksForWeek = memberWeeklyTasks[memberId]?.[week.label] || [];
              const taskCount = tasksForWeek.length;
              
              return (
                <div key={week.label} className="flex items-center justify-center p-2 border-b">
                  {taskCount > 0 ? (
                    <div className={`relative flex items-center justify-center rounded-full ${getCircleSize(taskCount)} ${getCircleColor(taskCount)} transition-all`}>
                      <div className={`absolute ${getCenterDotColor(taskCount)} h-2.5 w-2.5 rounded-full`} />
                      {taskCount > 0 && (
                        <div className="absolute bottom-0 right-0 text-xs font-medium">
                          {taskCount}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
