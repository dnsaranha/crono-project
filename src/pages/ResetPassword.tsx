import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CronoLogo } from "@/components/CronoLogo";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleResetPassword() {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;
      
      setSent(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error("Erro ao enviar email de redefinição:", error);
      toast({
        title: "Erro ao enviar email",
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
            <CardTitle>Redefinir Senha</CardTitle>
            <CardDescription>
              Digite seu email para receber as instruções de redefinição de senha.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Email enviado! Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/auth")}
                  className="w-full"
                >
                  Voltar para Login
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-11 text-base sm:text-sm"
                  />
                </div>
                
                <Button
                  className="w-full"
                  onClick={handleResetPassword}
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Enviando..." : "Enviar Email"}
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