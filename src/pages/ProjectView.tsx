import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams, Outlet, Link, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectMembers } from "@/components/ProjectMembers";
import LoadingState from "@/components/LoadingState";
import ExcelExportImport from "@/components/ExcelExportImport";
import { useTasks } from "@/hooks/useTasks";
import { TaskType } from "@/components/Task";
import { ProjectActions } from "@/components/ProjectActions";
import { useToast } from "@/components/ui/use-toast";
import { User } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at?: string;
}

interface ProfileInfo {
  id: string;
  full_name?: string;
  email?: string;
}

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [ownerProfile, setOwnerProfile] = useState<ProfileInfo | null>(null);
  const { tasks, batchUpdateTasks } = useTasks();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
      
      // Load owner profile information
      if (projectData.owner_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', projectData.owner_id)
          .single();
          
        if (!profileError && profileData) {
          setOwnerProfile(profileData);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o projeto. Verifique sua conexão e tente novamente.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }
  
  async function checkPermissions() {
    try {
      if (!projectId) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Check if user is owner
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();
        
      if (projectError) throw projectError;
      
      if (projectData.owner_id === user.id) {
        setIsOwnerOrAdmin(true);
        setHasEditPermission(true);
        return;
      }
      
      // Check if user is admin
      const { data: memberData, error: memberError } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
        
      if (memberError && memberError.code !== 'PGRST116') {
        // Check if user has any access to project
        const { data: anyMember, error: anyMemberError } = await supabase
          .from('project_members')
          .select('id')
          .eq('project_id', projectId)
          .eq('user_id', user.id);
          
        if (anyMemberError || !anyMember || anyMember.length === 0) {
          // User has no access to this project
          toast({
            title: "Acesso negado",
            description: "Você não tem permissão para acessar este projeto.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
      }
      
      setIsOwnerOrAdmin(memberData?.role === 'admin');
      setHasEditPermission(memberData?.role === 'admin' || memberData?.role === 'editor');
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível verificar suas permissões. Tente novamente mais tarde.",
        variant: "destructive",
      });
      navigate('/');
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

  const formattedDate = project.created_at 
    ? new Date(project.created_at).toLocaleDateString('pt-BR') 
    : '';

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
          
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <User className="h-4 w-4 mr-1" />
            <span>Criado por: {ownerProfile?.full_name || ownerProfile?.email || 'Usuário'}</span>
            {formattedDate && <span className="ml-2">em {formattedDate}</span>}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <ProjectActions 
            project={project} 
            isOwnerOrAdmin={isOwnerOrAdmin}
            onProjectUpdated={loadProject}
          />
          
          {hasEditPermission && (
            <ExcelExportImport 
              tasks={tasks} 
              projectId={projectId || ''} 
              onImport={handleExcelImport}
            />
          )}
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
          <TabsTrigger value="critical-path" asChild>
            <Link to={`/project/${projectId}/critical-path`}>Caminho Crítico</Link>
          </TabsTrigger>
          <TabsTrigger value="team" asChild>
            <Link to={`/project/${projectId}/team`}>Equipe</Link>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="team" className="border-none p-0">
          <ProjectMembers projectId={projectId || ''} isOwnerOrAdmin={isOwnerOrAdmin} />
        </TabsContent>
        
        <TabsContent value="gantt" className="border-none p-0">
          <Outlet context={{ hasEditPermission }} />
        </TabsContent>
        
        <TabsContent value="grid" className="border-none p-0">
          <Outlet context={{ hasEditPermission }} />
        </TabsContent>
        
        <TabsContent value="board" className="border-none p-0">
          <Outlet context={{ hasEditPermission }} />
        </TabsContent>
        
        <TabsContent value="timeline" className="border-none p-0">
          <Outlet context={{ hasEditPermission }} />
        </TabsContent>
        
        <TabsContent value="wbs" className="border-none p-0">
          <Outlet context={{ hasEditPermission }} />
        </TabsContent>
        
        <TabsContent value="critical-path" className="border-none p-0">
          <Outlet context={{ hasEditPermission }} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
