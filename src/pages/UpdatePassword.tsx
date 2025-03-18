// Verificar se o usuário está autenticado via hash na URL
useEffect(() => {
  const handleHashChange = async () => {
    // O Supabase envia os parâmetros de autenticação via URL hash
    if (window.location.hash) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        
        if (!accessToken || type !== "recovery") {
          throw new Error("Link inválido");
        }
        
        // Armazenar os tokens e estabelecer a sessão
        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error || !data.session) {
            throw new Error("Não foi possível estabelecer a sessão");
          }
        } else {
          // Se não tem refresh token, pelo menos verificar a sessão
          const { data, error } = await supabase.auth.getSession();  
          if (error || !data.session) {
            throw new Error("Sessão inválida ou expirada");
          }
        }
      } catch (error: any) {
        console.error("Erro de autenticação:", error);
        toast({
          title: "Erro de autenticação",
          description: "O link parece ser inválido ou expirou. Solicite um novo.",
          variant: "destructive",
        });
        navigate("/auth/reset-password");
      }
    } else {
      // Se não há hash, redirecionar para o reset
      navigate("/auth/reset-password");
    }
  };

  handleHashChange();
}, [navigate, toast]);