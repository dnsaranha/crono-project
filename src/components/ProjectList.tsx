import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
}

export function ProjectList({ ownerName, accessLevel }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

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
      
      // Fetch owned projects
      const { data: ownedProjects, error: ownedError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', user.id);
        
      if (ownedError) throw ownedError;
      
      // Fetch member projects
      const { data: memberProjects, error: memberError } = await supabase
        .from('project_members')
        .select(`
          project_id,
          projects:project_id (*)
        `)
        .eq('user_id', user.id);
        
      if (memberError) throw memberError;
      
      // Combine results
      const memberProjectList = memberProjects
        .map(item => item.projects)
        .filter(Boolean) as Project[];
      
      const allProjects = [...(ownedProjects || []), ...memberProjectList];
      
      // Remove duplicates based on ID
      const uniqueProjects = Array.from(
        new Map(allProjects.map(item => [item.id, item])).values()
      );
      
      setProjects(uniqueProjects);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Seus Projetos</h2>
        
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Projeto
        </Button>
      </div>
      
      {loading ? (
        <LoadingState message="Carregando projetos..." />
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Você ainda não tem projetos</p>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar seu primeiro projeto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription>
                  Criado em {formatDate(project.created_at)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600">
                  {project.description || "Sem descrição"}
                </p>
                <p className="text-gray-600">
                  Projeto de <a href={`https://github.com/${ownerName}`}>{ownerName}</a>
                </p>
                <p className="text-gray-600">
                  Nível de acesso: {accessLevel}
                </p>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(project.created_at)}
                  </div>
                </div>
                
                <Link to={`/project/${project.id}`}>
                  <Button size="sm">Visualizar</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <ProjectForm 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen} 
        onProjectCreated={(projectId) => {
          loadProjects();
        }}
      />
    </div>
  );
}