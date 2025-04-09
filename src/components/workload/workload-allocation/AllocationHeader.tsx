
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, LayoutGrid } from "lucide-react";

interface AllocationHeaderProps {
  viewMode: "table" | "calendar";
  setViewMode: (mode: "table" | "calendar") => void;
  totalTasks: number;
}

export function AllocationHeader({ 
  viewMode, 
  setViewMode, 
  totalTasks 
}: AllocationHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-center gap-4">
      <Badge variant="outline" className="text-sm py-1.5 px-3">
        {totalTasks} {totalTasks === 1 ? 'tarefa' : 'tarefas'} encontradas
      </Badge>
      
      <div className="flex items-center space-x-2 touch-manipulation">
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("table")}
          className="h-10 touch-manipulation"
        >
          <LayoutGrid className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Tabela</span>
        </Button>
        <Button
          variant={viewMode === "calendar" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("calendar")}
          className="h-10 touch-manipulation"
        >
          <Calendar className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Calendário</span>
        </Button>
      </div>
    </div>
  );
}
