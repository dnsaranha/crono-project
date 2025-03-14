import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { ProjectList } from "@/components/ProjectList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectForm } from "@/components/ProjectForm";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [accessLevel, setAccessLevel] = useState<string>("");
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        navigate('/auth');
      } else {
        // Assuming you have a function to get the user's access level
        const userAccessLevel = await getUserAccessLevel(user.id);
        setAccessLevel(userAccessLevel);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);

        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Bem Vindo ao seu Gerenciador de Projetos e Cronogramas!
        </h1>
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Gerencie seus projetos e equipes em um só lugar.
          </p>
          <Button onClick={() => navigate('/perfil')} variant="outline">
            Visualizar Perfil
          </Button>
        </div>
      </div>
      
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground">Seus Projetos</h2>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </div>
        
        <ProjectList />
      </div>
      
      <ProjectForm 
        open={formOpen} 
        onOpenChange={setFormOpen} 
        onProjectCreated={(projectId) => {
          navigate(`/project/${projectId}/gantt`);
        }}
      />
    </div>
  );
}

// Placeholder function to get user's access level
async function getUserAccessLevel(userId) {
  // Implement the logic to get the access level from GitHub or your backend
  return "leitura";  // Example access level
}