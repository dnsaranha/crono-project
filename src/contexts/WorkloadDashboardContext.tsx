
import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define types for projects and members
export interface Project {
  id: string;
  name: string;
  owner_id: string;
  role?: string;
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
  userRole: 'owner' | 'admin' | 'editor' | 'viewer' | null;
  canEdit: boolean;
  canDelete: boolean;
  canCreate: boolean;
  refreshData: () => Promise<void>;
}

const WorkloadDashboardContext = createContext<WorkloadDashboardContextType | undefined>(undefined);

export function WorkloadDashboardProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'editor' | 'viewer' | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
        setMembers([]);
        setTasks([]);
        return;
      }

      // Fetch owned projects with owner profile info
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_owner_id_fkey (
            full_name,
            email
          )
        `)
        .eq('owner_id', user.id);
        
      if (ownedError) throw ownedError;
      
      // Add role 'owner' to owned projects
      const ownedProjectsWithRole = ownedProjects.map(project => ({
        ...project,
        role: 'owner'
      }));
      
      // Fetch member projects with owner profile info and role
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select(`
          role,
          project:projects (
            *,
            owner:profiles!projects_owner_id_fkey (
              full_name,
              email
            )
          )
        `)
        .eq('user_id', user.id);
        
      if (memberError) throw memberError;
      
      // Format member projects
      const memberProjectsFormatted = memberProjects
        .filter(item => item.project) // Filter out any null projects
        .map(item => ({
          ...item.project,
          role: item.role
        }));
      
      // Combine and remove duplicates
      const allProjects = [...ownedProjectsWithRole, ...memberProjectsFormatted];
      const uniqueProjects = Array.from(
        new Map(allProjects.map(item => [item.id, item])).values()
      );
      
      setProjects(uniqueProjects);

      // Determine user's highest role across all projects
      let highestRole: 'owner' | 'admin' | 'editor' | 'viewer' | null = 'viewer';
      uniqueProjects.forEach(project => {
        if (project.role === 'owner') highestRole = 'owner';
        else if (project.role === 'admin' && highestRole !== 'owner') highestRole = 'admin';
        else if (project.role === 'editor' && highestRole !== 'owner' && highestRole !== 'admin') highestRole = 'editor';
      });
      
      setUserRole(highestRole);

      const projectIds = uniqueProjects.map(p => p.id) || [];

      if (projectIds.length > 0) {
        // Fetch members for all projects user has access to
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

        // Fetch tasks for all projects user has access to
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
          const projectName = uniqueProjects.find(p => p.id === task.project_id)?.name || 'Projeto Desconhecido';
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

  // Determine permissions based on user role
  const canEdit = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'owner' || userRole === 'admin';
  const canCreate = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';

  const value = {
    loading,
    projects,
    members,
    tasks,
    userRole,
    canEdit,
    canDelete,
    canCreate,
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
