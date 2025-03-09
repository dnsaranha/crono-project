
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
            <h2 className="text-xl sm:text-2xl font-bold">Bem Vindo ao Crono Project!</h2>
            <Button 
              variant="outline" 
              onClick={() => setShowProfile(true)}
              className="text-sm"
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
