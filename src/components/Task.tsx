
import { cn } from "@/lib/utils";

export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  color?: string;
  isGroup?: boolean;
  parentId?: string;
  progress?: number;
  dependencies?: string[];
}

interface TaskProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: (task: TaskType) => void;
  className?: string;
}

const Task = ({ task, style, onClick, className }: TaskProps) => {
  const defaultColor = task.isGroup ? "bg-gantt-teal" : "bg-gantt-blue";
  const taskColor = task.color ? `bg-${task.color}` : defaultColor;
  
  return (
    <div
      className={cn(
        "gantt-task rounded-sm h-8 relative animate-task-appear",
        taskColor,
        className
      )}
      style={style}
      onClick={() => onClick?.(task)}
    >
      <div className="absolute inset-0 flex items-center px-2 text-white text-sm font-medium truncate">
        {task.name}
      </div>
      
      {task.progress !== undefined && task.progress > 0 && (
        <div 
          className="absolute top-0 left-0 bottom-0 bg-white bg-opacity-20 rounded-l-sm transition-all duration-500 ease-out"
          style={{ width: `${task.progress}%` }}
        />
      )}
      
      <div className="absolute -bottom-3 left-0 w-full h-3 flex justify-center items-center pointer-events-none">
        {task.dependencies?.length && (
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
        )}
      </div>
    </div>
  );
};

export default Task;
