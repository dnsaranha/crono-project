
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectView />}>
          <Route index element={<Navigate to="gantt" replace />} />
          <Route path="gantt" element={<GanttView />} />
          <Route path="grid" element={<GridView />} />
          <Route path="board" element={<BoardView />} />
          <Route path="timeline" element={<TimelineView />} />
          <Route path="team" element={<ProjectView />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </Router>
  );
}
