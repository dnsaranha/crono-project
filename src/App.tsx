
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ProjectView from "@/pages/ProjectView";
import NotFound from "@/pages/NotFound";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:projectId/*" element={<ProjectView />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </Router>
  );
}
