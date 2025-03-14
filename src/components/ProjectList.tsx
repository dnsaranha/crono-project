import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectForm } from "@/components/ProjectForm";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Plus } from "lucide-react";
import LoadingState from "@/components/LoadingState";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  owner_id: string;
  owner?: {
    full_name: string | null;
    email: string;
  };
  role?: string;
}

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
    
    // Subscribe to changes
    const channel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        () => {
          loadProjects();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadProjects() {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProjects([]);
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
      
      // Process member projects data
      const processedMemberProjects = memberProjects
        .filter(item => item.project) // Ensure project exists
        .map(item => ({
          ...item.project,
          role: item.role
        }));
      
      // Combine owned and member projects
      setProjects([...ownedProjectsWithRole, ...processedMemberProjects]);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: 'Erro ao carregar projetos',
        description: 'Ocorreu um erro ao buscar seus projetos. Por favor, tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleProjectCreated = (projectId: string) => {
    loadProjects();
    // Navegar para o projeto recém-criado
    navigate(`/project/${projectId}/gantt`);
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Seus Projetos</h3>
          <Button onClick={() => setIsFormOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Você ainda não tem projetos.</p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Meu Primeiro Projeto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">
                    <Link to={`/project/${project.id}/gantt`} className="hover:underline">
                      {project.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(project.created_at).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {project.description || "Sem descrição."}
                  </p>
                </CardContent>
                <CardFooter className="pt-2 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {project.role === 'owner' ? 'Proprietário' : 
                     project.role === 'admin' ? 'Administrador' : 
                     project.role === 'editor' ? 'Editor' : 'Visualizador'}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/project/${project.id}/gantt`}>
                      Acessar
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <ProjectForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onProjectCreated={handleProjectCreated} 
      />
    </>
  );
}
