
import { ChevronDown, ChevronRight, Pencil, Flag, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskType } from "@/components/Task";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useDateFormatter } from "./hooks/useDateFormatter";
import { usePriorityInfo } from "./hooks/usePriorityInfo";

interface TaskTableRowProps {
  task: TaskType & { level?: number };
  onEditTask: (task: TaskType) => void;
  onDeleteTask?: (taskId: string) => void;
  toggleGroup: (groupId: string) => void;
  expandedGroups: Record<string, boolean>;
  projectMembers: Array<{ id: string; name: string; email: string }>;
}

const TaskTableRow = ({ 
  task, 
  onEditTask, 
  onDeleteTask, 
  toggleGroup, 
  expandedGroups,
  projectMembers 
}: TaskTableRowProps) => {
  const { formatDate, calculateEndDate } = useDateFormatter();
  const { getPriorityInfo } = usePriorityInfo();
  const priorityInfo = getPriorityInfo(task.priority);
  
  // Helper to get member name from user ID
  const getMemberName = (userId: string) => {
    const member = projectMembers.find(m => m.id === userId);
    return member ? member.name : "Usuário";
  };
  
  return (
    <TableRow 
      key={task.id} 
      className={`task-table-row dark-mode-fix ${task.isGroup ? "bg-gray-50 dark:bg-gray-800 font-medium" : ""}`}
    >
      <TableCell className={`dark-mode-fix ${task.isGroup ? "font-bold" : "font-medium"}`}>
        <div className="flex items-center">
          {/* Indent based on level */}
          {task.level && task.level > 0 && (
            <div style={{ width: `${task.level * 20}px` }} className="flex-shrink-0"></div>
          )}
          
          {task.isGroup ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-0 mr-1 h-6 w-6 touch-manipulation"
              onClick={() => toggleGroup(task.id)}
            >
              {expandedGroups[task.id] ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          ) : null}
          
          {task.isMilestone && (
            <Flag className="h-4 w-4 mr-1 text-purple-600 dark:text-purple-500" />
          )}
          
          <span className="line-clamp-2">{task.name}</span>
        </div>
      </TableCell>
      <TableCell className="dark-mode-fix">{formatDate(task.startDate)}</TableCell>
      <TableCell className="dark-mode-fix">
        {task.isMilestone ? (
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/30 dark:text-purple-200">Marco</Badge>
        ) : (
          `${task.duration} dias`
        )}
      </TableCell>
      <TableCell className="dark-mode-fix">{calculateEndDate(task.startDate, task.duration || 0)}</TableCell>
      <TableCell className="dark-mode-fix">
        {!task.isMilestone && (
          <>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-gantt-blue dark:bg-blue-500 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${task.progress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{task.progress}%</div>
          </>
        )}
      </TableCell>
      <TableCell className="dark-mode-fix">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`}></div>
          <span className="text-xs">{priorityInfo.label}</span>
        </div>
      </TableCell>
      <TableCell className="dark-mode-fix">
        {task.assignees && task.assignees.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.assignees.slice(0, 2).map(userId => (
              <TooltipProvider key={userId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 min-w-8 text-center">
                      {getMemberName(userId).split(' ')[0]}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getMemberName(userId)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            {task.assignees.length > 2 && (
              <Badge variant="outline">+{task.assignees.length - 2}</Badge>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">Nenhum</span>
        )}
      </TableCell>
      <TableCell className="dark-mode-fix">
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onEditTask(task)}
            className="px-2 h-9 touch-manipulation"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          
          {onDeleteTask && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onDeleteTask(task.id)}
              className="px-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 h-9 touch-manipulation"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Excluir</span>
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default TaskTableRow;
