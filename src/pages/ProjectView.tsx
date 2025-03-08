
import { useState, useEffect } from "react";
import { useParams, Link, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ProjectMembers } from "@/components/ProjectMembers";
import { UserProfile } from "@/components/UserProfile";
import GanttView from "@/pages/GanttView";
import GridView from "@/pages/GridView";
import TimelineView from "@/pages/TimelineView";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, Users, UserCircle } from "lucide-react";
import { ExcelExportImport } from "@/components/ExcelExportImport";
import { useTasks } from "@/hooks/useTasks";

interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
}

export default function ProjectView() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  const { tasks, createTask } = useTasks();

  useEffect(() => {
    if (projectId) {
      loadProject();
      checkUserRole();
    }
  }, [projectId]);

  async function loadProject() {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
        
      if (error) throw error;
      
      setProject(data);
      
      // Check if user is the owner
      const { data: { user } } = await supabase.auth.getUser();
      if (user && data.owner_id === user.id) {
        setIsOwner(true);
      }
    } catch (error: any) {
      console.error('Erro ao carregar projeto:', error.message);
      toast({
        title: "Erro ao carregar projeto",
        description: error.message,
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function checkUserRole() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Check if user is the owner
      const { data: projectData } = await supabase
        .from('projects')
        .select('owner_id')
        .eq('id', projectId)
        .single();
        
      if (projectData && projectData.owner_id === user.id) {
        setUserRole('owner');
        return;
      }
      
      // Check project membership role
      const { data: memberData } = await supabase
        .from('project_members')
        .select('role')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();
        
      if (memberData) {
        setUserRole(memberData.role);
      } else {
        // User is not a member of this project
        toast({
          title: "Acesso negado",
          description: "Você não tem acesso a este projeto.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erro ao verificar papel do usuário:', error.message);
    }
  }

  const handleTasksImported = async (importedTasks: any[]) => {
    try {
      for (const task of importedTasks) {
        await createTask(task);
      }
      
      toast({
        title: "Tarefas importadas",
        description: `${importedTasks.length} tarefas foram importadas com sucesso.`,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao importar tarefas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Carregando projeto...</div>;
  }

  if (!project) {
    return <Navigate to="/" />;
  }

  const isOwnerOrAdmin = isOwner || userRole === 'admin';
  const canEdit = isOwnerOrAdmin || userRole === 'editor';

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white border-b py-4 px-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Link>
              <h1 className="text-2xl font-bold mt-2">{project.name}</h1>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {projectId && (
                <ExcelExportImport 
                  projectId={projectId} 
                  tasks={tasks} 
                  onTasksImported={handleTasksImported} 
                />
              )}
              
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/project/${projectId}/members`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Membros
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/project/${projectId}/profile`)}
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Perfil
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex mt-6 border-b">
            <Link 
              to={`/project/${projectId}/gantt`} 
              className={`px-4 py-2 border-b-2 ${currentPath.endsWith('/gantt') ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
            >
              Gantt
            </Link>
            <Link 
              to={`/project/${projectId}/grid`} 
              className={`px-4 py-2 border-b-2 ${currentPath.endsWith('/grid') ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
            >
              Grade
            </Link>
            <Link 
              to={`/project/${projectId}/timeline`}
              className={`px-4 py-2 border-b-2 ${currentPath.endsWith('/timeline') ? 'border-primary text-primary font-medium' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
            >
              Linha do Tempo
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto bg-gray-50">
        <div className="container mx-auto py-6 px-6">
          <Routes>
            <Route path="/gantt" element={<GanttView />} />
            <Route path="/grid" element={<GridView />} />
            <Route path="/timeline" element={<TimelineView />} />
            <Route path="/members" element={<ProjectMembers projectId={projectId || ''} isOwnerOrAdmin={isOwnerOrAdmin} />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/" element={<Navigate to={`/project/${projectId}/gantt`} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
