
import { useState, useMemo } from "react";
import { TaskType } from "@/components/Task";
import { WorkloadFilters } from "./WorkloadFilters";
import { WorkloadVisualization } from "./WorkloadVisualization";
import { TaskAllocationTable } from "./TaskAllocationTable";
import { isWithinInterval, addDays, parseISO } from "date-fns";

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
        return isWithinInterval(taskStart, { start: today, end: monthEnd });
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
      />
    </div>
  );
}
