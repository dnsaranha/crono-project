
import React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Member } from "@/contexts/WorkloadDashboardContext";
import { AllocationTable } from "./AllocationTable";
import { AllocationHeader } from "./AllocationHeader";
import { AllocationFilters } from "./AllocationFilters";
import { AllocationCalendar } from "./AllocationCalendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [useBigCalendar, setUseBigCalendar] = React.useState<boolean>(true);
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
        <>
          {/* Switcher para alternar entre calendários */}
          <div className="flex items-center space-x-2 touch-manipulation">
            <Switch 
              id="calendar-toggle" 
              checked={useBigCalendar} 
              onCheckedChange={setUseBigCalendar}
              className="touch-manipulation"
            />
            <Label htmlFor="calendar-toggle" className="cursor-pointer">
              {useBigCalendar ? 'Calendário Detalhado' : 'Calendário Simples'}
            </Label>
          </div>
          
          <AllocationCalendar 
            tasks={filteredTasks}
            projects={projects}
            members={members}
            timeFrame={timeFrame}
            isMobile={isMobile}
            useBigCalendar={useBigCalendar}
          />
        </>
      )}
    </div>
  );
}
