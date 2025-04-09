
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Member } from "@/contexts/WorkloadDashboardContext";
import { AllocationTable } from "./AllocationTable";
import { AllocationHeader } from "./AllocationHeader";
import { AllocationFilters } from "./AllocationFilters";
import { AllocationCalendar } from "./AllocationCalendar";

interface WorkloadAllocationViewProps {
  tasks: any[];
  members: Member[];
  projects: any[];
  canEdit?: boolean;
  canDelete?: boolean;
}

export function WorkloadAllocationView({ 
  tasks, 
  members, 
  projects,
  canEdit = false,
  canDelete = false
}: WorkloadAllocationViewProps) {
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("calendar");
  const [selectedMember, setSelectedMember] = React.useState<string>("all");
  const [timeFrame, setTimeFrame] = React.useState<string>("month");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Filtragem de tarefas
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      // Filtrar por membro
      if (selectedMember !== "all" && (!task.assignees || !task.assignees.includes(selectedMember))) {
        return false;
      }
      
      // Filtrar por pesquisa
      if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [tasks, selectedMember, searchQuery]);
  
  return (
    <div className="space-y-6">
      <AllocationHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        totalTasks={filteredTasks.length}
      />
      
      <AllocationFilters 
        members={members}
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
        timeFrame={timeFrame}
        setTimeFrame={setTimeFrame}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {viewMode === "table" ? (
        <AllocationTable 
          filteredTasks={filteredTasks}
          projects={projects}
          members={members}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      ) : (
        <AllocationCalendar 
          tasks={filteredTasks}
          projects={projects}
          members={members}
          timeFrame={timeFrame}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
