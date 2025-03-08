
import { Calendar, Clock, Pencil, Flag, ChevronRight, ChevronDown, Trash2, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TaskType } from "@/components/Task";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskTableProps {
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
  onDeleteTask?: (taskId: string) => void;
  projectMembers?: Array<{ id: string; name: string; email: string }>;
}

const TaskTable = ({ tasks, onEditTask, onDeleteTask, projectMembers = [] }: TaskTableProps) => {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: number) => {
    if (duration === 0) return formatDate(startDate); // For milestones
    
    const date = new Date(startDate);
    date.setDate(date.getDate() + duration);
    return formatDate(date.toISOString());
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Get member name from id
  const getMemberName = (userId: string) => {
    const member = projectMembers.find(m => m.id === userId);
    return member ? member.name : "Usuário";
  };

  // Filter tasks based on showSubtasks toggle and expansion state
  const getFilteredTasks = () => {
    // First, get all top-level tasks (no parent)
    const topLevelTasks = tasks.filter(task => !task.parentId);
    
    if (!showSubtasks) {
      return topLevelTasks;
    }
    
    // For each expanded group, add its children
    const result = [...topLevelTasks];
    
    topLevelTasks.forEach(task => {
      if (task.isGroup && expandedGroups[task.id]) {
        // Get all direct children of this group
        const children = tasks.filter(t => t.parentId === task.id);
        // Insert children right after their parent
        const parentIndex = result.findIndex(t => t.id === task.id);
        result.splice(parentIndex + 1, 0, ...children);
      }
    });
    
    return result;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div>
      <div className="p-2 flex items-center space-x-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <Switch
            id="showSubtasks"
            checked={showSubtasks}
            onCheckedChange={setShowSubtasks}
          />
          <label htmlFor="showSubtasks" className="text-sm">
            Mostrar Subtarefas
          </label>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Nome da Tarefa</TableHead>
            <TableHead className="w-[150px]">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Data de Início
              </div>
            </TableHead>
            <TableHead className="w-[120px]">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Duração
              </div>
            </TableHead>
            <TableHead className="w-[150px]">Data de Fim</TableHead>
            <TableHead className="w-[150px]">Progresso</TableHead>
            <TableHead className="w-[150px]">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Responsáveis
              </div>
            </TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => (
            <TableRow key={task.id} className={task.isGroup ? "bg-gray-50 font-medium" : ""}>
              <TableCell className={task.isGroup ? "font-bold" : "font-medium"}>
                <div className="flex items-center">
                  {task.isGroup ? (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 mr-1 h-6 w-6"
                      onClick={() => toggleGroup(task.id)}
                    >
                      {expandedGroups[task.id] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </Button>
                  ) : task.parentId ? (
                    <span className="ml-6"></span>
                  ) : null}
                  
                  {task.isMilestone && (
                    <Flag className="h-4 w-4 mr-1 text-purple-600" />
                  )}
                  
                  {task.name}
                </div>
              </TableCell>
              <TableCell>{formatDate(task.startDate)}</TableCell>
              <TableCell>
                {task.isMilestone ? (
                  <Badge variant="outline" className="bg-purple-50">Marco</Badge>
                ) : (
                  `${task.duration} dias`
                )}
              </TableCell>
              <TableCell>{calculateEndDate(task.startDate, task.duration || 0)}</TableCell>
              <TableCell>
                {!task.isMilestone && (
                  <>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gantt-blue h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
                  </>
                )}
              </TableCell>
              <TableCell>
                {task.assignees && task.assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {task.assignees.slice(0, 2).map(userId => (
                      <TooltipProvider key={userId}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="bg-blue-50">
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
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEditTask(task)}
                    className="px-2"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  {onDeleteTask && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="px-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
