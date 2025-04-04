
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTasks } from "@/hooks/tasks";
import { TaskType } from "@/components/Task";
import TaskForm from "@/components/TaskForm";
import NewTaskButton from "@/components/NewTaskButton";
import GanttChart from "@/components/gantt/GanttChart";
import GanttControls from "@/components/gantt/GanttControls";
import { Dialog } from "@/components/ui/dialog";
import EmptyTaskState from "@/components/EmptyTaskState";
import LoadingState from "@/components/LoadingState";
import ExcelExportImport from "@/components/ExcelExportImport";

export default function GanttView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, loading, updateTask, createTask, createDependency, batchUpdateTasks } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [timeScale, setTimeScale] = useState<"day" | "week" | "month" | "quarter" | "year">("week");
  
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
  
  const handleZoomIn = () => {
    // Placeholder for zoom in functionality
  };
  
  const handleZoomOut = () => {
    // Placeholder for zoom out functionality
  };
  
  const exportToImage = async () => {
    // Placeholder for export functionality
    return Promise.resolve();
  };
  
  if (loading) {
    return <LoadingState message="Carregando dados do projeto..." />;
  }
  
  if (tasks.length === 0) {
    return (
      <div className="h-full">
        <EmptyTaskState onAddTask={() => setShowTaskForm(true)} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <GanttControls 
          timeScale={timeScale}
          handleZoomOut={handleZoomOut}
          handleZoomIn={handleZoomIn}
          exportToImage={exportToImage}
        />
        <div className="flex gap-2">
          <ExcelExportImport 
            tasks={tasks} 
            projectId={projectId as string}
            onImport={(tasksToUpdate, tasksToCreate) => batchUpdateTasks(tasksToUpdate, tasksToCreate)} 
          />
          <NewTaskButton onClick={() => setShowTaskForm(true)} />
        </div>
      </div>
      
      <div className="flex-grow border rounded-md bg-card overflow-hidden">
        <GanttChart 
          tasks={tasks}
          onTaskClick={handleTaskSelect}
          onTaskUpdate={handleTaskUpdate}
          onCreateDependency={handleDependencyCreate}
          sidebarVisible={showSidebar}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
      
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <TaskForm
          open={showTaskForm}
          onOpenChange={setShowTaskForm}
          onClose={handleCloseTaskForm}
          onSubmit={selectedTask ? handleTaskUpdate : handleTaskCreate}
          initialData={selectedTask}
          tasks={tasks}
        />
      </Dialog>
    </div>
  );
}
