
import { Calendar, Clock, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TaskType } from "@/components/Task";

interface TaskTableProps {
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
}

const TaskTable = ({ tasks, onEditTask }: TaskTableProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Calculate end date based on start date and duration
  const calculateEndDate = (startDate: string, duration: number) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + duration);
    return formatDate(date.toISOString());
  };

  // Get the displayed tasks (top-level tasks and their immediate children)
  const displayedTasks = tasks.filter(task => !task.parentId || tasks.find(t => t.id === task.parentId)?.isGroup);

  return (
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
          <TableHead className="w-[150px]">Dependências</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayedTasks.map((task) => (
          <TableRow key={task.id} className={task.isGroup ? "bg-gray-50 font-medium" : ""}>
            <TableCell className={task.isGroup ? "font-bold" : "font-medium"}>
              {task.parentId && <span className="ml-4">├─ </span>}
              {task.name}
            </TableCell>
            <TableCell>{formatDate(task.startDate)}</TableCell>
            <TableCell>{task.duration} dias</TableCell>
            <TableCell>{calculateEndDate(task.startDate, task.duration)}</TableCell>
            <TableCell>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-gantt-blue h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
            </TableCell>
            <TableCell>
              {task.dependencies && task.dependencies.length > 0 ? (
                <div className="text-xs">
                  {task.dependencies.map(depId => {
                    const depTask = tasks.find(t => t.id === depId);
                    return depTask ? (
                      <span key={depId} className="inline-block bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 mr-1 mb-1">
                        {depTask.name}
                      </span>
                    ) : null;
                  })}
                </div>
              ) : (
                <span className="text-gray-400 text-xs">Nenhuma</span>
              )}
            </TableCell>
            <TableCell>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onEditTask(task)}
                className="px-2"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TaskTable;
