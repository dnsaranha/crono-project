import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define types for projects and members
export interface Project {
  id: string;
  name: string;
  owner_id: string;
}

export interface Member {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  email: string;
}

// Define types for tasks
export interface Task {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  progress: number;
  project_id: string;
  project_name: string;
  priority?: number;
  assignees?: string[];
  isMilestone?: boolean;
  projectId?: string;
}

interface WorkloadDashboardContextType {
  loading: boolean;
  projects: Project[];
  members: Member[];
  tasks: Task[];
  refreshData: () => Promise<void>;
}

const WorkloadDashboardContext = createContext<WorkloadDashboardContextType | undefined>(undefined);

export function WorkloadDashboardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          owner_id,
          start_date,
          end_date
        `);

      if (projectError) throw projectError;

      setProjects(projectData || []);

      const projectIds = projectData?.map(p => p.id) || [];

      if (projectIds.length > 0) {
        const { data: memberData, error: memberError } = await supabase
          .from('project_members')
          .select(`
            id,
            user_id,
            project_id,
            profiles (
              id,
              email,
              full_name
            )
          `)
          .in('project_id', projectIds);

        if (memberError) throw memberError;

        const formattedMembers = memberData?.map(member => ({
          id: member.id,
          user_id: member.user_id,
          project_id: member.project_id,
          name: member.profiles.full_name || member.profiles.email,
          email: member.profiles.email
        })) || [];

        setMembers(formattedMembers);

        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select(`
            id,
            name,
            start_date,
            duration,
            progress,
            project_id,
            priority,
            is_milestone
          `)
          .in('project_id', projectIds);

        if (taskError) throw taskError;

        const taskIds = taskData?.map(t => t.id) || [];
        let assigneeMap: Record<string, string[]> = {};

        if (taskIds.length > 0) {
          const { data: assigneeData, error: assigneeError } = await supabase
            .from('task_assignees')
            .select('task_id, user_id')
            .in('task_id', taskIds);

          if (assigneeError) throw assigneeError;

          assigneeMap = assigneeData?.reduce((acc, item) => {
            if (!acc[item.task_id]) {
              acc[item.task_id] = [];
            }
            acc[item.task_id].push(item.user_id);
            return acc;
          }, {} as Record<string, string[]>) || {};
        }

        const formattedTasks = taskData?.map(task => {
          const projectName = projectData?.find(p => p.id === task.project_id)?.name || 'Projeto Desconhecido';
          return {
            id: task.id,
            name: task.name,
            startDate: task.start_date,
            duration: task.duration,
            progress: task.progress,
            project_id: task.project_id,
            project_name: projectName,
            assignees: assigneeMap[task.id] || [],
            priority: task.priority,
            isMilestone: task.is_milestone,
            projectId: task.project_id
          };
        }) || [];

        setTasks(formattedTasks);
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados do dashboard:", error.message);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    loading,
    projects,
    members,
    tasks,
    refreshData: loadDashboardData
  };

  return (
    <WorkloadDashboardContext.Provider value={value}>
      {children}
    </WorkloadDashboardContext.Provider>
  );
}

export function useWorkloadDashboard() {
  const context = useContext(WorkloadDashboardContext);
  if (context === undefined) {
    throw new Error('useWorkloadDashboard must be used within a WorkloadDashboardProvider');
  }
  return context;
}
