import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTasks } from "@/hooks/tasks";
import { TaskType } from "@/components/Task";
import TaskForm from "@/components/TaskForm";
import NewTaskButton from "@/components/NewTaskButton";
import { useTheme } from "next-themes";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import EmptyTaskState from "@/components/EmptyTaskState";
import LoadingState from "@/components/LoadingState";
import ExcelExportImport from "@/components/ExcelExportImport";

declare global {
  interface Window {
    gantt: any;
  }
}

export default function GanttView() {
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, loading, updateTask, createTask, createDependency, batchUpdateTasks, getProjectMembers } = useTasks();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const ganttInitialized = useRef(false);
  const { theme } = useTheme();
  const { toast } = useToast();

  // Load project members
  useEffect(() => {
    async function loadProjectMembers() {
      const members = await getProjectMembers();
      setProjectMembers(members || []);
    }
    loadProjectMembers();
  }, [getProjectMembers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.gantt && !ganttInitialized.current && ganttContainerRef.current) {
      initGantt();
    }
  }, [tasks, theme]);

  const initGantt = () => {
    if (!ganttContainerRef.current || !window.gantt) return;

    const gantt = window.gantt;
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.scale_height = 50;
    gantt.config.row_height = 30;
    gantt.config.task_height = 16;
    gantt.config.drag_links = true;
    gantt.config.drag_progress = true;
    gantt.config.drag_resize = true;
    gantt.config.drag_move = true;

    if (theme === "dark") {
      gantt.templates.scale_cell_class = () => "gantt_scale_cell_dark";
      gantt.templates.grid_cell_class = () => "gantt_grid_cell_dark";
      gantt.templates.task_cell_class = () => "gantt_task_cell_dark";
      gantt.templates.timeline_cell_class = () => "gantt_timeline_cell_dark";
    }

    gantt.config.scales = [
      { unit: "month", step: 1, format: "%F, %Y" },
      { unit: "week", step: 1, format: "Semana #%W" },
    ];

    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      text: task.name,
      start_date: task.startDate,
      duration: task.duration || 1,
      progress: task.progress / 100,
      parent: task.dependencies.length > 0 ? task.dependencies[0] : undefined,
      open: true,
    }));

    const links = [];
    tasks.forEach((task) => {
      task.dependencies.forEach((depId) => {
        links.push({
          source: depId,
          target: task.id,
          type: "0",
        });
      });
    });

    gantt.init(ganttContainerRef.current);
    gantt.clearAll();
    gantt.parse({ data: formattedTasks, links });

    gantt.attachEvent("onTaskDblClick", (id) => {
      setSelectedTask(tasks.find((task) => task.id === id) || null);
      setShowTaskForm(true);
      return false;
    });

    gantt.attachEvent("onAfterTaskDrag", (id, mode) => {
      const task = gantt.getTask(id);
      updateTask(id, {
        startDate: task.start_date,
        duration: task.duration,
      });
      toast({ title: "Task Updated", description: "Task dates updated successfully." });
    });

    ganttInitialized.current = true;
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleCloseTaskForm = () => {
    setShowTaskForm(false);
    setTimeout(() => setSelectedTask(null), 200);
  };

  const handleSaveTask = async (taskData: TaskType) => {
    if (selectedTask) {
      await updateTask(taskData.id, taskData);
    } else {
      await createTask(taskData as Omit<TaskType, "id">);
    }
    handleCloseTaskForm();
  };

  if (loading) {
    return <LoadingState message="Loading Project..." />;
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
        <ExcelExportImport
          tasks={tasks}
          projectId={projectId || ""}
          onImport={(tasksToUpdate, tasksToCreate) => batchUpdateTasks(tasksToUpdate, tasksToCreate)}
        />
        <NewTaskButton onClick={() => setShowTaskForm(true)} />
      </div>
      <div className="flex-grow border rounded-md bg-card overflow-hidden">
        <div className="gantt-container" ref={ganttContainerRef}></div>
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
