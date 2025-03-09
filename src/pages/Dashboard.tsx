
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/components/UserProfile";
import { ProjectList } from "@/components/ProjectList";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Menu } from "lucide-react";
import { CronoLogo } from "@/components/CronoLogo";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user and setup listener
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

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              className="p-0 mr-2"
              onClick={() => navigate('/')}
            >
              <CronoLogo size="md" />
            </Button>
            
            <div className="flex items-center">
              <div className="hidden sm:flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowProfile(!showProfile)}
                  className="text-sm md:text-base"
                >
                  {user.email}
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {menuOpen && (
            <div className="mt-2 sm:hidden bg-white rounded-md shadow-md p-3 absolute right-4 z-10 w-[200px]">
              <div className="flex flex-col space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowProfile(!showProfile);
                    setMenuOpen(false);
                  }}
                  className="justify-start w-full"
                >
                  {user.email}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="justify-start w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
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
          <ProjectList />
        )}
      </main>
    </div>
  );
}
