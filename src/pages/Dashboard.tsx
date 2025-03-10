
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { ProjectList } from "@/components/ProjectList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        navigate('/auth');
      }
    };
    
    getUser();
    
    // Listen for auth changes
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {showProfile ? (
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold">Seu Perfil</h2>
            <Button variant="outline" onClick={() => setShowProfile(false)} className="w-full sm:w-auto">
              Voltar para Projetos
            </Button>
          </div>
          <UserProfile />
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-bold">Bem Vindo ao seu Gerenciador de Projetos e Cronogramas!</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowProfile(true)}
              className="text-sm w-full sm:w-auto"
            >
              Visualizar Perfil
            </Button>
          </div>
          <ProjectList />
        </div>
      )}
    </div>
  );
}
