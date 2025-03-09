
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Outlet, Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectMembers } from "@/components/ProjectMembers";
import LoadingState from "@/components/LoadingState";
import ExcelExportImport from "@/components/ExcelExportImport";
import { useTasks } from "@/hooks/useTasks";
import { TaskType } from "@/components/Task";

interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
}

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const { tasks, batchUpdateTasks } = useTasks();
  
  useEffect(() => {
    if (projectId) {
      loadProject();
      checkPermissions();
    }
  }, [projectId]);

  async function loadProject() {
    try {
      if (!projectId) return;
      
      const { data: projectData, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      
      setProject(projectData);
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function checkPermissions() {
    try {
      if (!projectId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Check if user is owner
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      
      if (projectData.owner_id === user.id) {
        setIsOwnerOrAdmin(true);
        return;
      }
      
      // Check if user is admin
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
        
      if (memberError && memberError.code !== 'PGRST116') throw memberError;
      
      setIsOwnerOrAdmin(memberData?.role === 'admin');
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
    }
  }
  
  // Handle the import of Excel data
  const handleExcelImport = async (
    tasksToUpdate: TaskType[], 
    tasksToCreate: Omit<TaskType, 'id'>[]
  ) => {
    return await batchUpdateTasks(tasksToUpdate, tasksToCreate);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!project) {
    return <div>Projeto não encontrado</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        
        <div className="flex space-x-4 items-center">
          <ExcelExportImport 
            tasks={tasks} 
            projectId={projectId || ''} 
            onImport={handleExcelImport}
          />
        </div>
      </div>
      
      <Tabs defaultValue="gantt" className="w-full">
        <TabsList className="mb-6 flex overflow-x-auto touch-pan-x pb-1 scrollbar-none">
          <TabsTrigger value="gantt" asChild>
            <Link to={`/project/${projectId}/gantt`}>Gantt</Link>
          </TabsTrigger>
          <TabsTrigger value="grid" asChild>
            <Link to={`/project/${projectId}/grid`}>Grade</Link>
          </TabsTrigger>
          <TabsTrigger value="board" asChild>
            <Link to={`/project/${projectId}/board`}>Quadro</Link>
          </TabsTrigger>
          <TabsTrigger value="timeline" asChild>
            <Link to={`/project/${projectId}/timeline`}>Linha do Tempo</Link>
          </TabsTrigger>
          <TabsTrigger value="wbs" asChild>
            <Link to={`/project/${projectId}/wbs`}>EAP</Link>
          </TabsTrigger>
          <TabsTrigger value="team" asChild>
            <Link to={`/project/${projectId}/team`}>Equipe</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="border-none p-0">
          <ProjectMembers projectId={projectId || ''} isOwnerOrAdmin={isOwnerOrAdmin} />
        </TabsContent>
        
        <TabsContent value="gantt" className="border-none p-0">
          <Outlet />
        </TabsContent>
        
        <TabsContent value="grid" className="border-none p-0">
          <Outlet />
        </TabsContent>
        
        <TabsContent value="board" className="border-none p-0">
          <Outlet />
        </TabsContent>
        
        <TabsContent value="timeline" className="border-none p-0">
          <Outlet />
        </TabsContent>
        
        <TabsContent value="wbs" className="border-none p-0">
          <Outlet />
        </TabsContent>
      </Tabs>
    </div>
  );
}
