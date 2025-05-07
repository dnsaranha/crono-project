
import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parseISO, addDays } from "date-fns";
import { Task } from "@/contexts/WorkloadDashboardContext";
import { useNavigate } from "react-router-dom";
import { ptBR } from "date-fns/locale";

// Configurar o localizer para o calendário
const localizer = momentLocalizer(moment);

// Definir mensagens em português
const messages = {
  week: 'Semana',
  day: 'Dia',
  month: 'Mês',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Horário',
  event: 'Tarefa',
  noEventsInRange: 'Não há tarefas neste período.',
};

interface BigCalendarViewProps {
  tasks: Task[];
  projects: any[];
  members: any[];
  timeFrame: string;
  selectedMember?: string;
}

// Estilos personalizados para os eventos no calendário
const eventStyleGetter = (event: any) => {
  let backgroundColor = '#3174ad';
  
  // Definir cores baseadas na prioridade
  switch (event.priority) {
    case 1:
      backgroundColor = '#6B7280'; // cinza para prioridade baixa
      break;
    case 2:
      backgroundColor = '#3B82F6'; // azul para prioridade normal-baixa
      break;
    case 3:
      backgroundColor = '#10B981'; // verde para prioridade normal
      break;
    case 4:
      backgroundColor = '#F59E0B'; // amarelo para prioridade normal-alta
      break;
    case 5:
      backgroundColor = '#EF4444'; // vermelho para prioridade alta
      break;
    default:
      backgroundColor = '#3174ad'; // azul padrão
  }

  const style = {
    backgroundColor,
    borderRadius: '4px',
    opacity: 0.9,
    color: 'white',
    border: '0px',
    display: 'block',
    fontSize: '0.8em',
    padding: '2px 4px',
  };

  return {
    style
  };
};

export const BigCalendarView: React.FC<BigCalendarViewProps> = ({ 
  tasks, 
  projects, 
  members, 
  timeFrame,
  selectedMember = "all"
}) => {
  const navigate = useNavigate();

  // Converter tarefas para o formato de eventos do Big Calendar
  const events = useMemo(() => {
    return tasks.map(task => {
      const startDate = parseISO(task.startDate);
      const endDate = addDays(startDate, task.duration);
      
      // Buscar o projeto correspondente
      const project = projects.find(p => p.id === task.project_id);
      const projectName = project ? project.name : "Projeto Desconhecido";
      
      // Obter o nome dos responsáveis
      let assigneeNames = "Não atribuído";
      if (task.assignees && task.assignees.length > 0) {
        assigneeNames = task.assignees
          .map(id => {
            const member = members.find(m => m.id === id || m.user_id === id);
            return member ? member.name : "Desconhecido";
          })
          .join(", ");
      }
      
      return {
        id: task.id,
        title: task.name,
        start: startDate,
        end: endDate,
        priority: task.priority || 3,
        resourceId: task.assignees && task.assignees.length > 0 ? task.assignees[0] : 'unassigned',
        project: projectName,
        project_id: task.project_id,
        assignees: assigneeNames,
        allDay: true,
      };
    });
  }, [tasks, projects, members]);

  // Preparar recursos (membros da equipe) para visualização por recurso
  const resources = useMemo(() => {
    if (selectedMember !== "all") {
      // Se um membro específico foi selecionado
      const member = members.find(m => m.id === selectedMember || m.user_id === selectedMember);
      if (member) {
        return [{ id: selectedMember, title: member.name }];
      } else if (selectedMember === 'unassigned') {
        return [{ id: 'unassigned', title: 'Não atribuído' }];
      }
    }

    // Caso contrário, mostrar todos os membros
    const memberResources = members.map(member => ({
      id: member.id || member.user_id,
      title: member.name || 'Sem nome',
    }));
    
    // Adicionar opção para tarefas não atribuídas
    return [
      ...memberResources,
      { id: 'unassigned', title: 'Não atribuído' }
    ];
  }, [members, selectedMember]);

  // Determinar a visualização padrão com base no timeFrame
  const getDefaultView = () => {
    switch(timeFrame) {
      case 'week':
        return Views.WEEK;
      case 'day':
        return Views.DAY;
      case 'month':
      default:
        return Views.MONTH;
    }
  };

  // Manipulador para clicar em um evento
  const handleSelectEvent = (event: any) => {
    navigate(`/project/${event.project_id}?task=${event.id}`);
  };

  // Componente personalizado para exibir eventos
  const EventComponent = ({ event }: { event: any }) => (
    <div className="text-xs">
      <div className="font-semibold">{event.title}</div>
      <div>{event.project}</div>
    </div>
  );

  return (
    <div className="h-[700px] mt-4 touch-manipulation">
      <Calendar
        localizer={localizer}
        events={events}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={getDefaultView()}
        defaultDate={new Date()}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        messages={messages}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        components={{
          event: EventComponent,
        }}
        className="bg-card rounded-md shadow-sm border p-2"
      />
    </div>
  );
}
