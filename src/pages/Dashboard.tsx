import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/components/UserProfile";
import { ProjectList } from "@/components/ProjectList";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [accessLevel, setAccessLevel] = useState<string>("");
  const navigate = useNavigate();

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
          <ProjectList ownerName="dnsaranha" accessLevel={accessLevel} />
        </div>
      )}
    </div>
  );
}

// Placeholder function to get user's access level
async function getUserAccessLevel(userId) {
  // Implement the logic to get the access level from GitHub or your backend
  return "leitura";  // Example access level
}