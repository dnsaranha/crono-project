
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ViewHeader from "@/components/ViewHeader";
import { TaskType } from "@/components/Task";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkloadOverview } from "@/components/workload/WorkloadOverview";
import { BacklogManager } from "@/components/workload/BacklogManager";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Filter, Users, ListChecks } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";

export default function WorkloadDashboardView() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [allTasks, setAllTasks] = useState<TaskType[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all user's projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          id, 
          name, 
          start_date, 
          end_date, 
          description
        `)
        .order('created_at', { ascending: false });
      
      if (projectsError) throw projectsError;
      
      // Set the projects
      setProjects(projectsData || []);
      
      // Load tasks for all projects
      const allProjectsTasks: TaskType[] = [];
      
      for (const project of projectsData || []) {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id);
          
        if (tasksError) {
          console.error(`Error loading tasks for project ${project.id}:`, tasksError);
          continue;
        }
        
        // Load dependencies and assignees for each task
        const taskIds = tasksData.map(t => t.id);
        
        // Get dependencies
        const { data: dependencies } = await supabase
          .from('task_dependencies')
          .select('predecessor_id, successor_id')
          .in('successor_id', taskIds);
          
        // Get assignees
        const { data: assignees } = await supabase
          .from('task_assignees')
          .select('task_id, user_id')
          .in('task_id', taskIds);
          
        // Map tasks with their dependencies and assignees
        const mappedTasks = tasksData.map((task: any) => {
          const taskDependencies = dependencies
            ?.filter(d => d.successor_id === task.id)
            .map(d => d.predecessor_id) || [];
            
          const taskAssignees = assignees
            ?.filter(a => a.task_id === task.id)
            .map(a => a.user_id) || [];
          
          return {
            id: task.id,
            name: task.name,
            startDate: task.start_date,
            duration: task.duration,
            progress: task.progress,
            parentId: task.parent_id,
            isGroup: task.is_group,
            isMilestone: task.is_milestone,
            dependencies: taskDependencies,
            assignees: taskAssignees,
            priority: task.priority,
            description: task.description,
            projectId: project.id,
            projectName: project.name
          };
        });
        
        allProjectsTasks.push(...mappedTasks);
      }
      
      setAllTasks(allProjectsTasks);
      
      // Load all team members across projects
      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id,
          user_id,
          project_id,
          role,
          profiles (
            id,
            email,
            full_name
          )
        `);
      
      if (membersError) throw membersError;
      
      // Transform members data into a more usable format
      const uniqueMembers = new Map();
      
      membersData?.forEach(member => {
        if (!uniqueMembers.has(member.user_id)) {
          uniqueMembers.set(member.user_id, {
            id: member.user_id,
            name: member.profiles.full_name || member.profiles.email,
            email: member.profiles.email,
            projects: [member.project_id]
          });
        } else {
          const existingMember = uniqueMembers.get(member.user_id);
          if (!existingMember.projects.includes(member.project_id)) {
            existingMember.projects.push(member.project_id);
          }
        }
      });
      
      setMembers(Array.from(uniqueMembers.values()));
    } catch (error: any) {
      console.error("Error loading data:", error.message);
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando visão geral do trabalho..." />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <ViewHeader 
        title="Visão Panorâmica" 
        onAddItem={() => {}} 
        buttonText="Nova Atividade"
        hideAddButton={true}
        extraActions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData}>
              <Filter className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        }
      />
      
      <Tabs defaultValue="workload" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="workload">
            <Users className="h-4 w-4 mr-2" />
            Carga de Trabalho
          </TabsTrigger>
          <TabsTrigger value="backlog">
            <ListChecks className="h-4 w-4 mr-2" />
            Backlog
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workload" className="space-y-4">
          <WorkloadOverview 
            tasks={allTasks} 
            members={members} 
            projects={projects} 
          />
        </TabsContent>
        
        <TabsContent value="backlog" className="space-y-4">
          <BacklogManager 
            projects={projects} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
