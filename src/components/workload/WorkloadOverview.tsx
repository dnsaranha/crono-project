
import { useState, useMemo } from "react";
import { TaskType } from "@/components/Task";
import { WorkloadFilters } from "./WorkloadFilters";
import { WorkloadVisualization } from "./WorkloadVisualization";
import { TaskAllocationTable } from "./TaskAllocationTable";
import { isWithinInterval, addDays, parseISO } from "date-fns";
import { useWorkloadDashboard } from "@/contexts/WorkloadDashboardContext";

interface WorkloadOverviewProps {
  tasks: TaskType[];
  members: any[];
  projects: any[];
}

export function WorkloadOverview({ tasks, members, projects }: WorkloadOverviewProps) {
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [timeFrame, setTimeFrame] = useState<string>("month");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { canEdit, canDelete } = useWorkloadDashboard();
  
  // Normalizamos o tratamento de IDs de membros para garantir que a filtragem funcione
  const normalizeAssigneeId = (assigneeId: string) => {
    // Procura se o ID corresponde a algum member.id
    const memberById = members.find(m => m.id === assigneeId);
    if (memberById) return assigneeId;
    
    // Procura se o ID corresponde a algum member.user_id
    const memberByUserId = members.find(m => m.user_id === assigneeId);
    if (memberByUserId) return memberByUserId.id;
    
    // Se não encontrar, retorna o ID original
    return assigneeId;
  };
  
  // Filter tasks based on current search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Filter by member if selected
      if (selectedMember !== "all") {
        // Verifica se a task tem assignees
        if (!task.assignees || task.assignees.length === 0) {
          return false;
        }
        
        // Normaliza os IDs e verifica se o membro selecionado está entre os assignees
        const normalizedSelectedMember = normalizeAssigneeId(selectedMember);
        const hasSelectedMember = task.assignees.some(assigneeId => {
          const normalizedAssigneeId = normalizeAssigneeId(assigneeId);
          return normalizedAssigneeId === normalizedSelectedMember || 
                 assigneeId === selectedMember;
        });
        
        if (!hasSelectedMember) {
          return false;
        }
      }

      // Filter by search query
      if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Filter by timeframe
      if (task.startDate) {
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
        } else if (timeFrame === "all") {
          return true;
        }
      }
      
      return timeFrame === "all"; // Se não tiver data de início, só mostra em "all"
    });
  }, [tasks, selectedMember, timeFrame, searchQuery, members]);
  
  // Calculate workload per member
  const memberWorkloadData = useMemo(() => {
    const workloadMap = new Map();
    
    // Inicializa dados para todos os membros
    members.forEach(member => {
      workloadMap.set(member.id || member.user_id, { 
        name: member.name, 
        taskCount: 0,
        totalDuration: 0,
        highPriorityTasks: 0,
        tasks: []
      });
    });
    
    // Processa as tarefas filtradas
    filteredTasks.forEach(task => {
      if (task.assignees && task.assignees.length > 0) {
        task.assignees.forEach(assigneeId => {
          // Normaliza o ID do assignee
          const normalizedId = normalizeAssigneeId(assigneeId);
          
          if (workloadMap.has(normalizedId) || workloadMap.has(assigneeId)) {
            // Usa o ID correto que existe no mapa
            const memberId = workloadMap.has(normalizedId) ? normalizedId : assigneeId;
            
            const memberStats = workloadMap.get(memberId);
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

  return (
    <div className="space-y-6">
      <WorkloadFilters 
        members={members}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <WorkloadVisualization data={memberWorkloadData} />
      
      <TaskAllocationTable 
        filteredTasks={filteredTasks}
        projects={projects}
        members={members}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
