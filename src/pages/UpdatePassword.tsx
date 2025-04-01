
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CronoLogo } from "@/components/CronoLogo";
import { Eye, EyeOff } from "lucide-react";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se o usuário está autenticado via hash/query params na URL
  useEffect(() => {
    const processAuthRedirect = async () => {
      try {
        // Check if there's a hash in the URL (Supabase auth redirect)
        if (window.location.hash) {
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Erro ao verificar sessão:", error);
            throw error;
          }
          
          if (data.session) {
            console.log("Usuário autenticado para redefinição de senha");
            setIsTokenValid(true);
          } else {
            // Try to exchange the access token in the URL for a session
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            const accessToken = hashParams.get("access_token");
            
            if (accessToken) {
              // Set the access token
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: "",
              });
              
              if (error) {
                console.error("Erro ao definir sessão:", error);
                throw error;
              }
              
              if (data.session) {
                console.log("Sessão definida com sucesso usando token de acesso");
                setIsTokenValid(true);
              }
            }
          }
        } else {
          console.error("Sem hash na URL para redefinição de senha");
          throw new Error("Link inválido ou expirado");
        }
      } catch (error: any) {
        console.error("Erro ao processar redirecionamento de autenticação:", error);
        toast({
          title: "Erro de autenticação",
          description: "O link parece ser inválido ou expirou. Solicite um novo.",
          variant: "destructive",
        });
        navigate("/reset-password");
      }
    };

    processAuthRedirect();
  }, [navigate, toast]);

  async function handleUpdatePassword() {
    if (password !== confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso.",
      });
      
      // Redirecionar para o login após alguns segundos
      setTimeout(() => {
        navigate("/auth");
      }, 2000);
      
    } catch (error: any) {
      console.error("Erro ao atualizar senha:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <header className="bg-background px-4 py-3 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <CronoLogo size="md" />
        </div>
      </header>
      
      <div className="flex flex-col items-center justify-center flex-1 px-4 py-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Definir Nova Senha</CardTitle>
            <CardDescription>
              Crie uma nova senha para sua conta.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {!isTokenValid ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Verificando link de redefinição de senha...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nova senha"
                      className="h-11 text-base sm:text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme a nova senha"
                      className="h-11 text-base sm:text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleUpdatePassword}
                  disabled={loading || !password || !confirmPassword}
                >
                  {loading ? "Atualizando..." : "Atualizar Senha"}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Voltar para Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
