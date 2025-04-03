
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { ProjectList } from "@/components/ProjectList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListChecks, Users2, FolderKanban } from "lucide-react";
import WorkloadDashboardView from "@/pages/WorkloadDashboardView";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [activeView, setActiveView] = useState<string>("projects");
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        navigate('/auth');
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
    <div className="container mx-auto px-4 py-6">
      {showProfile ? (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Seu Perfil</h2>
            <Button variant="outline" onClick={() => setShowProfile(false)}>
              Voltar para Projetos
            </Button>
          </div>
          <UserProfile />
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold">Bem Vindo ao seu Gerenciador de Projetos e Cronogramas!</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowProfile(true)}
              className="text-sm"
            >
              Visualizar Perfil
            </Button>
          </div>
          
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
              <TabsTrigger value="projects">
                <FolderKanban className="h-4 w-4 mr-2" />
                Projetos
              </TabsTrigger>
              <TabsTrigger value="workload">
                <Users2 className="h-4 w-4 mr-2" />
                Visão Panorâmica
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="projects" className="space-y-4">
              <ProjectList />
            </TabsContent>
            
            <TabsContent value="workload" className="space-y-4">
              <WorkloadDashboardView />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
