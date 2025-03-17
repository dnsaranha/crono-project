import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import NotFound from "@/pages/NotFound";
import GanttView from "@/pages/GanttView";
import GridView from "@/pages/GridView";
import BoardView from "@/pages/BoardView";
import TimelineView from "@/pages/TimelineView";
import WBSView from "@/pages/WBSView";
import CriticalPathView from "@/pages/CriticalPathView";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthenticated(!!session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    setAuthenticated(!!session);
    setLoading(false);
  }

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/auth" />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Rotas Privadas */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/project/:projectId" element={
            <PrivateRoute>
              <Layout>
                <ProjectView />
              </Layout>
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="gantt" replace />} />
            <Route path="gantt" element={<GanttView />} />
            <Route path="grid" element={<GridView />} />
            <Route path="board" element={<BoardView />} />
            <Route path="timeline" element={<TimelineView />} />
            <Route path="wbs" element={<WBSView />} />
            <Route path="critical-path" element={<CriticalPathView />} />
            <Route path="team" element={<ProjectView />} />
          </Route>

          <Route path="*" element={
            <Layout>
              <NotFound />
            </Layout>
          } />
        </Routes>
        
        <Toaster />
      </Router>
    </ThemeProvider>
  );
}