
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkloadOverview from "@/components/workload/WorkloadOverview";
import BacklogManager from "@/components/workload/BacklogManager";
import { Calendar, ListTodo } from "lucide-react";

// Define tipos para projetos e membros
interface Project {
  id: string;
  name: string;
  owner_id: string;
}

interface Member {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  email: string;
}

// Define tipos para tarefas
interface Task {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  progress: number;
  project_id: string;
  project_name: string;
  assignees?: string[];
}

export default function WorkloadDashboardView() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTab, setSelectedTab] = useState("overview");

  // Carregar dados quando o componente montar
  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Carregar projetos que o usuário tem acesso
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

      // Armazenar projetos
      setProjects(projectData || []);

      // Carregar membros de todos os projetos
      const projectIds = projectData?.map(p => p.id) || [];

      if (projectIds.length > 0) {
        // Buscar membros de todos os projetos
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

        // Formatar membros
        const formattedMembers = memberData?.map(member => ({
          id: member.id,
          user_id: member.user_id,
          project_id: member.project_id,
          name: member.profiles.full_name || member.profiles.email,
          email: member.profiles.email
        })) || [];

        setMembers(formattedMembers);

        // Buscar tarefas de todos os projetos
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select(`
            id,
            name,
            start_date,
            duration,
            progress,
            project_id
          `)
          .in('project_id', projectIds);

        if (taskError) throw taskError;

        // Buscar assignees para todas as tarefas
        const taskIds = taskData?.map(t => t.id) || [];
        let assigneeMap: Record<string, string[]> = {};

        if (taskIds.length > 0) {
          const { data: assigneeData, error: assigneeError } = await supabase
            .from('task_assignees')
            .select('task_id, user_id')
            .in('task_id', taskIds);

          if (assigneeError) throw assigneeError;

          // Agrupar assignees por task_id
          assigneeMap = assigneeData?.reduce((acc, item) => {
            if (!acc[item.task_id]) {
              acc[item.task_id] = [];
            }
            acc[item.task_id].push(item.user_id);
            return acc;
          }, {} as Record<string, string[]>) || {};
        }

        // Formatar tarefas com nomes de projetos e assignees
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
            assignees: assigneeMap[task.id] || []
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Carregando visão panorâmica...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">Visão Panorâmica</h2>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="overview">
              <Calendar className="h-4 w-4 mr-2" />
              Carga de Trabalho
            </TabsTrigger>
            <TabsTrigger value="backlog">
              <ListTodo className="h-4 w-4 mr-2" />
              Backlog
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDashboardData}
              className="mb-4"
            >
              Atualizar Dados
            </Button>
            
            <WorkloadOverview 
              projects={projects}
              members={members}
              tasks={tasks}
            />
          </TabsContent>
          
          <TabsContent value="backlog" className="space-y-4">
            <BacklogManager 
              projects={projects}
              onItemConverted={loadDashboardData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
