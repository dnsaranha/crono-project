
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BacklogItem } from "./BacklogTypes";

interface BacklogPromoteContentProps {
  selectedItem: BacklogItem;
  projects: any[];
  getPriorityInfo?: (priority: number) => { color: string; label: string };
  handleProjectChange: (projectId: string) => void;
}

export function BacklogPromoteContent({
  selectedItem,
  projects,
  getPriorityInfo,
  handleProjectChange
}: BacklogPromoteContentProps) {
  // Use the provided getPriorityInfo or a fallback
  const priorityInfo = getPriorityInfo ? 
    getPriorityInfo(selectedItem.priority) : 
    { label: `Prioridade ${selectedItem.priority}`, color: 'bg-gray-200' };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Detalhes do Item</h3>
        <p className="text-sm text-gray-500">{selectedItem.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline" className={priorityInfo.color}>
            {priorityInfo.label}
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="project" className="text-sm font-medium">
          Selecione o Projeto
        </label>
        <Select
          value={selectedItem.target_project_id || ""}
          onValueChange={handleProjectChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
