
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTasks } from "@/hooks/tasks";
import { TaskType } from "@/components/Task";
import TaskForm from "@/components/TaskForm";
import NewTaskButton from "@/components/NewTaskButton";
import GanttChart from "@/components/gantt/GanttChart";
import GanttControls from "@/components/gantt/GanttControls";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EmptyTaskState from "@/components/EmptyTaskState";
import LoadingState from "@/components/LoadingState";
import ExcelExportImport from "@/components/ExcelExportImport";

export default function GanttView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, loading, updateTask, createTask, createDependency, batchUpdateTasks, getProjectMembers } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [timeScale, setTimeScale] = useState<"day" | "week" | "month" | "quarter" | "year">("week");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  
  // Load project members
  useEffect(() => {
    async function loadProjectMembers() {
      const members = await getProjectMembers();
      setProjectMembers(members || []);
    }
    
    loadProjectMembers();
  }, [getProjectMembers]);
  
  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleTaskSelect = (task: TaskType) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };
  
  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setTimeout(() => setSelectedTask(null), 200);
  };

  const handleTaskCreate = async (task: Omit<TaskType, 'id'>) => {
    await createTask(task);
    handleCloseTaskForm();
  };

  const handleTaskUpdate = async (task: TaskType) => {
    await updateTask(task);
    handleCloseTaskForm();
  };
  
  const handleDependencyCreate = async (sourceId: string, targetId: string) => {
    await createDependency(sourceId, targetId);
  };
  
  const handleSaveTask = (taskData: TaskType) => {
    if (selectedTask) {
      return handleTaskUpdate(taskData);
    } else {
      return handleTaskCreate(taskData as Omit<TaskType, 'id'>);
    }
  };
  
  if (loading) {
    return <LoadingState message="Carregando dados do projeto..." />;
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-2">
          <ExcelExportImport 
            tasks={tasks}
            projectId={projectId || ""}
            onImport={(tasksToUpdate, tasksToCreate) => batchUpdateTasks(tasksToUpdate, tasksToCreate)} 
          />
          <NewTaskButton onClick={() => setShowTaskForm(true)} />
        </div>
      </div>
      
      <div className="flex-grow border rounded-md bg-card overflow-hidden">
        {tasks.length === 0 ? (
          <div className="h-full">
            <EmptyTaskState onAddTask={() => setShowTaskForm(true)} />
          </div>
        ) : (
          <GanttChart 
            tasks={tasks}
            onTaskClick={handleTaskSelect}
            onTaskUpdate={handleTaskUpdate}
            onCreateDependency={handleDependencyCreate}
            sidebarVisible={showSidebar}
            onToggleSidebar={handleToggleSidebar}
          />
        )}
      </div>
      
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <TaskForm
            open={showTaskForm}
            onOpenChange={setShowTaskForm}
            onSubmit={handleSaveTask}
            initialData={selectedTask}
            tasks={tasks}
            projectMembers={projectMembers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
