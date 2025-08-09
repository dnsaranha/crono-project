
import React, { useMemo, useState } from 'react';
import { format, addDays, addWeeks, addMonths, differenceInDays, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WorkloadTask, WorkloadMember, TimeScale, TimeUnit } from '@/types/workload';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkloadTimelineProps {
  tasks: WorkloadTask[];
  members: WorkloadMember[];
  timeScale: TimeScale;
  onTaskClick?: (task: WorkloadTask) => void;
  onTaskMove?: (taskId: string, newStartDate: string) => void;
}

export function WorkloadTimeline({ 
  tasks, 
  members, 
  timeScale, 
  onTaskClick,
  onTaskMove 
}: WorkloadTimelineProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Gerar unidades de tempo baseado na escala
  const timeUnits = useMemo(() => {
    const units: TimeUnit[] = [];
    const start = new Date(currentDate);
    start.setDate(1); // Início do mês
    
    const periodsToShow = timeScale === 'day' ? 30 : timeScale === 'week' ? 12 : 6;
    
    for (let i = 0; i < periodsToShow; i++) {
      let date: Date;
      let label: string;
      
      switch (timeScale) {
        case 'day':
          date = addDays(start, i);
          label = format(date, 'dd/MM', { locale: ptBR });
          break;
        case 'week':
          date = addWeeks(start, i);
          label = `Sem ${format(date, 'dd/MM', { locale: ptBR })}`;
          break;
        case 'month':
          date = addMonths(start, i);
          label = format(date, 'MMM yyyy', { locale: ptBR });
          break;
      }
      
      units.push({ date, label });
    }
    
    return units;
  }, [currentDate, timeScale]);

  const cellWidth = timeScale === 'day' ? 40 : timeScale === 'week' ? 100 : 150;
  
  // Calcular posição e largura das tarefas
  const getTaskStyle = (task: WorkloadTask) => {
    const taskStart = parseISO(task.start_date);
    const taskEnd = parseISO(task.end_date);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    let position = 0;
    let width = 0;
    
    // Encontrar a posição inicial
    const startUnit = timeUnits.find(unit => {
      switch (timeScale) {
        case 'day':
          return isSameDay(unit.date, taskStart);
        case 'week':
          return taskStart >= unit.date && taskStart < addWeeks(unit.date, 1);
        case 'month':
          return taskStart >= unit.date && taskStart < addMonths(unit.date, 1);
      }
    });
    
    if (startUnit) {
      const startIndex = timeUnits.indexOf(startUnit);
      position = startIndex * cellWidth;
      
      switch (timeScale) {
        case 'day':
          width = duration * cellWidth;
          break;
        case 'week':
          width = Math.ceil(duration / 7) * cellWidth;
          break;
        case 'month':
          width = Math.ceil(duration / 30) * cellWidth;
          break;
      }
    }
    
    return {
      left: `${position}px`,
      width: `${Math.max(width, cellWidth * 0.5)}px`
    };
  };

  const navigateTime = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    switch (timeScale) {
      case 'day':
        direction === 'next' ? newDate.setDate(newDate.getDate() + 30) : newDate.setDate(newDate.getDate() - 30);
        break;
      case 'week':
        direction === 'next' ? newDate.setDate(newDate.getDate() + 84) : newDate.setDate(newDate.getDate() - 84);
        break;
      case 'month':
        direction === 'next' ? newDate.setMonth(newDate.getMonth() + 6) : newDate.setMonth(newDate.getMonth() - 6);
        break;
    }
    
    setCurrentDate(newDate);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Cabeçalho de navegação */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigateTime('prev')}
          className="touch-manipulation"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-sm font-medium">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigateTime('next')}
          className="touch-manipulation"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-auto">
        {/* Cabeçalho da timeline */}
        <div className="flex">
          <div className="w-48 p-3 border-r bg-muted/20 font-medium">
            Colaborador
          </div>
          <div className="flex">
            {timeUnits.map((unit, index) => (
              <div 
                key={index}
                className="border-r p-2 text-xs text-center bg-muted/10"
                style={{ width: `${cellWidth}px`, minWidth: `${cellWidth}px` }}
              >
                {unit.label}
              </div>
            ))}
          </div>
        </div>

        {/* Linhas dos colaboradores */}
        {members.map((member) => {
          const memberTasks = tasks.filter(task => task.assignee_id === member.id);
          
          return (
            <div key={member.id} className="flex border-t">
              {/* Nome do colaborador */}
              <div className="w-48 p-3 border-r bg-card">
                <div className="font-medium text-sm">{member.name}</div>
                <div className="text-xs text-muted-foreground">
                  {memberTasks.length} tarefa(s)
                </div>
              </div>
              
              {/* Timeline do colaborador */}
              <div className="flex-1 relative" style={{ height: '60px' }}>
                {/* Grid de fundo */}
                <div className="flex h-full">
                  {timeUnits.map((_, index) => (
                    <div 
                      key={index}
                      className="border-r h-full"
                      style={{ width: `${cellWidth}px` }}
                    />
                  ))}
                </div>
                
                {/* Tarefas */}
                {memberTasks.map((task) => (
                  <div
                    key={task.id}
                    className="absolute top-2 h-8 bg-primary/80 hover:bg-primary rounded px-2 cursor-pointer flex items-center text-xs text-primary-foreground font-medium truncate transition-colors touch-manipulation"
                    style={getTaskStyle(task)}
                    onClick={() => onTaskClick?.(task)}
                    title={`${task.name} - ${task.project_name}`}
                  >
                    {task.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
