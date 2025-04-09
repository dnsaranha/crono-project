
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Verificar se o usuário estava tentando acessar uma página de backlog
  const isBacklogPath = location.pathname.includes('/backlog');
  
  // Extrair o ID do projeto se estiver em um caminho de projeto
  const projectIdMatch = location.pathname.match(/\/project\/([^\/]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! Página não encontrada</p>
        <p className="text-gray-500 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
          >
            Voltar para o Gantt
          </Button>
          
          {isBacklogPath && projectId && (
            <Button 
              onClick={() => navigate(`/project/${projectId}/backlog`)}
              variant="outline"
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Ver Backlog do Projeto
            </Button>
          )}
        </div>
        
        {isBacklogPath && !projectId && (
          <p className="mt-6 text-sm text-muted-foreground">
            Dica: Para acessar o backlog, vá para um projeto específico primeiro e depois selecione a aba "Backlog".
          </p>
        )}
      </div>
    </div>
  );
};

export default NotFound;
