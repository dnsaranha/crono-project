
import { AuthForm } from "@/components/AuthForm";
import { CronoLogo } from "@/components/CronoLogo";

export default function Auth() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <div className="flex flex-col items-center justify-center flex-1 px-4 sm:px-8 py-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <div className="flex justify-center mb-6">
              <CronoLogo size="lg" />
            </div>
            
            <h1 className="text-2xl font-semibold tracking-tight">
              Bem-vindo de volta
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
