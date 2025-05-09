
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import NotFound from "@/pages/NotFound";
import GanttView from "@/pages/GanttView";
import GridView from "@/pages/GridView";
import BoardView from "@/pages/BoardView";
import TimelineView from "@/pages/TimelineView";
import WBSView from "@/pages/WBSView";
import CriticalPathView from "@/pages/CriticalPathView";
import WorkloadDashboardView from "@/pages/WorkloadDashboardView";
import ResetPassword from "@/pages/ResetPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import { Layout } from "@/components/Layout";
import { ThemeProvider } from "@/providers/ThemeProvider";

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/reset-password" element={<UpdatePassword />} />
          <Route path="/dashboard" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/workload" element={
            <Layout>
              <WorkloadDashboardView />
            </Layout>
          } />
          <Route path="/project/:projectId" element={
            <Layout>
              <ProjectView />
            </Layout>
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
