
import { useState, useEffect } from "react";
import { TaskType } from "@/components/Task";
import { Table, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import TaskTableHeader from "./TaskTableHeader";
import TaskTableRow from "./TaskTableRow";
import { useTaskHierarchy } from "./hooks/useTaskHierarchy";

interface TaskTableProps {
  tasks: TaskType[];
  onEditTask: (task: TaskType) => void;
  onDeleteTask?: (taskId: string) => void;
  projectMembers?: Array<{ id: string; name: string; email: string }>;
}

const TaskTable = ({ tasks, onEditTask, onDeleteTask, projectMembers = [] }: TaskTableProps) => {
  const [showSubtasks, setShowSubtasks] = useState(true);
  const { 
    expandedGroups, 
    setExpandedGroups, 
    toggleGroup, 
    buildTaskHierarchy, 
    flattenTaskHierarchy 
  } = useTaskHierarchy();
  
  // Initialize expanded groups state with all groups expanded
  useEffect(() => {
    const initialExpandState: Record<string, boolean> = {};
    tasks.forEach(task => {
      if (task.isGroup) {
        initialExpandState[task.id] = true;
      }
    });
    setExpandedGroups(initialExpandState);
  }, [tasks, setExpandedGroups]);

  // Build task hierarchy and flatten based on current expanded state
  const hierarchicalTasks = buildTaskHierarchy(tasks);
  const displayTasks = flattenTaskHierarchy(hierarchicalTasks, showSubtasks, expandedGroups);

  return (
    <div>
      <div className="p-2 flex items-center space-x-4 bg-gray-50 dark:bg-gray-800 border-b">
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
      
      <Table className="dark-mode-fix">
        <TableHeader>
          <TaskTableHeader />
        </TableHeader>
        <TableBody>
          {displayTasks.map((task) => (
            <TaskTableRow 
              key={task.id}
              task={task}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              toggleGroup={toggleGroup}
              expandedGroups={expandedGroups}
              projectMembers={projectMembers}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TaskTable;
