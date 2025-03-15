import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handlePasswordReset = async () => {
    const { data, error } = await supabase.auth.api.resetPasswordForEmail(email);

    if (error) {
      setMessage("Erro ao solicitar redefinição de senha. Por favor, tente novamente.");
    } else {
      setMessage("Solicitação de redefinição de senha enviada. Verifique seu email.");
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-background justify-center items-center">
      <div className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center">Redefinir Senha</h1>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu email"
          required
        />
        <Button onClick={handlePasswordReset}>Solicitar Redefinição de Senha</Button>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
}