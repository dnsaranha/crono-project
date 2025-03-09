
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthForm } from "@/components/AuthForm";
import { CronoLogo } from "@/components/CronoLogo";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // User is already logged in, redirect to dashboard
        navigate("/");
      }
    };
    
    checkUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-white px-4 py-3">
        <div className="container mx-auto">
          <CronoLogo size="md" />
        </div>
      </header>
      
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-8 py-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <h1 className="text-2xl font-semibold tracking-tight">
              Bem-vindo ao CronoProject
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com seu email e senha para acessar sua conta
            </p>
          </div>
          
          <AuthForm />
        </div>
      </div>
    </div>
  );
}
