import React from "react";
import { TaskType } from "@/components/Task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumnProps {
  title: string;
  tasks: TaskType[];
  statuses: string[];
  onTaskClick?: (task: TaskType) => void;
  onStatusChange?: (task: TaskType, newStatus: string) => Promise<void>;
}

const KanbanColumn = ({ title, tasks, onTaskClick, onStatusChange, statuses }: KanbanColumnProps) => {
  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return "bg-gray-200 text-gray-800";
      case 2: return "bg-blue-200 text-blue-800";
      case 3: return "bg-green-200 text-green-800";
      case 4: return "bg-yellow-200 text-yellow-800";
      case 5: return "bg-red-200 text-red-800";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 75) return "bg-green-400";
    if (progress >= 50) return "bg-yellow-400";
    if (progress >= 25) return "bg-orange-400";
    return "bg-gray-300";
  };

  return (
    <Card className="w-80 flex-shrink-0">
      <CardHeader className="py-3 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge variant="outline">{tasks.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <ScrollArea className="h-[calc(100vh-13rem)] px-2">
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card 
                key={task.id} 
                className="p-3 cursor-pointer hover:bg-accent"
                onClick={() => onTaskClick && onTaskClick(task)}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-sm">{task.name}</h3>
                    
                    {onStatusChange && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {statuses.map((status) => (
                            <DropdownMenuItem 
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange(task, status);
                              }}
                            >
                              Mover para {status}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(task.priority)}>
                      P{task.priority}
                    </Badge>
                    
                    {task.progress !== undefined && (
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getProgressColor(task.progress)}`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span>{task.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default KanbanColumn;
