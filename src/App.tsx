import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/providers/ThemeProvider';
import { SubscriptionProvider } from '@/providers/SubscriptionProvider';

// Importações das páginas
import Home from '@/pages/Home';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import GanttView from '@/pages/GanttView';
import BoardView from '@/pages/BoardView';
import GridView from '@/pages/GridView';
import TimelineView from '@/pages/TimelineView';
import WBSView from '@/pages/WBSView';
import NotFound from '@/pages/NotFound';
import ProjectView from '@/pages/ProjectView';
import CriticalPathView from '@/pages/CriticalPathView';

// Componente de rota protegida
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <SubscriptionProvider>
        <Router>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth mode="signup" />} />
            
            {/* Rotas protegidas - requerem autenticação */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* Rotas de projeto */}
            <Route 
              path="/project/:projectId" 
              element={
                <ProtectedRoute>
                  <ProjectView />
                </ProtectedRoute>
              }
            >
              <Route path="gantt" element={<GanttView />} />
              <Route path="board" element={<BoardView />} />
              <Route path="grid" element={<GridView />} />
              <Route path="timeline" element={<TimelineView />} />
              <Route path="wbs" element={<WBSView />} />
              <Route path="critical-path" element={<CriticalPathView />} />
              <Route index element={<GanttView />} />
            </Route>
            
            {/* Rotas antigas para retrocompatibilidade */}
            <Route 
              path="/gantt" 
              element={
                <ProtectedRoute>
                  <GanttView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/board" 
              element={
                <ProtectedRoute>
                  <BoardView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/grid" 
              element={
                <ProtectedRoute>
                  <GridView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/timeline" 
              element={
                <ProtectedRoute>
                  <TimelineView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/wbs" 
              element={
                <ProtectedRoute>
                  <WBSView />
                </ProtectedRoute>
              } 
            />
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          <Toaster />
        </Router>
      </SubscriptionProvider>
    </ThemeProvider>
  );
}

export default App;
