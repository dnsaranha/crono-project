import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LoadingState } from '@/components/LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectPath?: string;
}

/**
 * Componente que protege rotas para usuários autenticados
 * Redireciona para a página de login se o usuário não estiver autenticado
 */
const ProtectedRoute = ({ children, redirectPath = '/login' }: ProtectedRouteProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };

    checkAuth();

    // Inscrever para atualizações da sessão
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Estado de carregamento enquanto verifica a autenticação
  if (isAuthenticated === null) {
    return <LoadingState message="Verificando autenticação..." />;
  }

  // Redirecionar para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Renderizar o conteúdo protegido se estiver autenticado
  return <>{children}</>;
};

export default ProtectedRoute; 