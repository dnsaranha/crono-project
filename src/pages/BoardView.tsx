
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Pencil } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import TaskForm from "@/components/TaskForm";
import { TaskType } from "@/components/Task";
import { useTasks } from "@/hooks/useTasks";
import { useParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LoadingState from "@/components/LoadingState";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  assigneeId?: string;
  taskId: string;
}

interface Column {
  id: string;
  title: string;
  tasks: TaskItem[];
}

const BoardView = () => {
  const { toast } = useToast();
  const { projectId } = useParams<{ projectId: string }>();
  const { tasks, loading, updateTask, createTask, getProjectMembers } = useTasks();
  
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [isNewTask, setIsNewTask] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [columnDialog, setColumnDialog] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [columnTitle, setColumnTitle] = useState("");
  const [columnDescription, setColumnDescription] = useState("");
  const [projectMembers, setProjectMembers] = useState<any[]>([]);
  
  useEffect(() => {
    async function loadMembers() {
      const members = await getProjectMembers();
      setProjectMembers(members || []);
    }
    loadMembers();
  }, []);
  
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      const defaultColumns = [
        { id: "todo", title: "A Fazer", tasks: [] },
        { id: "in-progress", title: "Em Progresso", tasks: [] },
        { id: "done", title: "Concluído", tasks: [] }
      ];
      
      let existingColumns: Column[] = [];
      try {
        const savedColumns = localStorage.getItem(`board-columns-${projectId}`);
        if (savedColumns) {
          existingColumns = JSON.parse(savedColumns);
        } else {
          existingColumns = defaultColumns;
        }
      } catch (error) {
        console.error("Error loading columns:", error);
        existingColumns = defaultColumns;
      }
      
      const mappedColumns = existingColumns.map(column => {
        return {
          ...column,
          tasks: []
        };
      });
      
      tasks.forEach(task => {
        if (task.isGroup) return;
        
        const assigneeNames = task.assignees?.map(assigneeId => {
          const member = projectMembers.find(m => m.id === assigneeId);
          return member ? member.name : "Não atribuído";
        }).join(", ");
        
        const taskItem: TaskItem = {
          id: `item-${task.id}`,
          title: task.name,
          description: task.description || `Duração: ${task.duration} dias`,
          priority: task.isMilestone ? 'high' : task.duration < 3 ? 'low' : 'medium',
          assignee: assigneeNames,
          assigneeId: task.assignees?.[0],
          taskId: task.id
        };
        
        if (task.progress >= 100) {
          const doneColumn = mappedColumns.find(col => col.id === "done");
          if (doneColumn) doneColumn.tasks.push(taskItem);
        } else if (task.progress > 0) {
          const progressColumn = mappedColumns.find(col => col.id === "in-progress");
          if (progressColumn) progressColumn.tasks.push(taskItem);
        } else {
          const todoColumn = mappedColumns.find(col => col.id === "todo");
          if (todoColumn) todoColumn.tasks.push(taskItem);
        }
      });
      
      setColumns(mappedColumns);
    }
  }, [tasks, loading, projectMembers]);
  
  useEffect(() => {
    if (columns.length > 0 && projectId) {
      localStorage.setItem(`board-columns-${projectId}`, JSON.stringify(columns));
    }
  }, [columns, projectId]);
  
  const handleAddColumn = () => {
    setEditingColumn(null);
    setColumnTitle("Nova Coluna");
    setColumnDescription("");
    setColumnDialog(true);
  };
  
  const handleEditColumn = (column: Column) => {
    setEditingColumn(column);
    setColumnTitle(column.title);
    setColumnDescription("");
    setColumnDialog(true);
  };
  
  const handleSaveColumn = () => {
    if (editingColumn) {
      setColumns(prev => prev.map(col => 
        col.id === editingColumn.id 
          ? {...col, title: columnTitle}
          : col
      ));
    } else {
      const newColumnId = `column-${Date.now()}`;
      setColumns([
        ...columns, 
        {
          id: newColumnId,
          title: columnTitle,
          tasks: []
        }
      ]);
    }
    
    setColumnDialog(false);
    toast({
      title: editingColumn ? "Coluna atualizada" : "Coluna adicionada",
      description: editingColumn 
        ? `A coluna "${columnTitle}" foi atualizada.` 
        : `A coluna "${columnTitle}" foi adicionada.`
    });
  };

  const handleDeleteColumn = () => {
    if (!editingColumn) return;
    
    // Mover tarefas para a primeira coluna ou a coluna "A Fazer"
    const targetColumn = columns.find(col => col.id !== editingColumn.id);
    if (!targetColumn) return;
    
    setColumns(prev => {
      const newColumns = prev.map(col => {
        if (col.id === targetColumn.id) {
          return {
            ...col,
            tasks: [...col.tasks, ...editingColumn.tasks]
          };
        }
        return col;
      }).filter(col => col.id !== editingColumn.id);
      
      return newColumns;
    });
    
    setColumnDialog(false);
    toast({
      title: "Coluna excluída",
      description: `A coluna "${editingColumn.title}" foi excluída.`
    });
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsNewTask(false);
      setIsTaskFormOpen(true);
    }
  };
  
  const handleAddTask = () => {
    setSelectedTask(null);
    setIsNewTask(true);
    setIsTaskFormOpen(true);
  };
  
  const handleTaskFormSubmit = async (taskData: Partial<TaskType>) => {
    try {
      if (isNewTask) {
        const newTask = await createTask({
          name: taskData.name || "Nova Tarefa",
          startDate: taskData.startDate || new Date().toISOString().split('T')[0],
          duration: taskData.duration || 7,
          progress: taskData.progress || 0,
          dependencies: taskData.dependencies || [],
          assignees: taskData.assignees || [],
          description: taskData.description,
          isMilestone: taskData.isMilestone || false
        });
        
        if (newTask) {
          const newBoardItem: TaskItem = {
            id: `item-${newTask.id}`,
            title: newTask.name,
            description: newTask.description || `Duração: ${newTask.duration} dias`,
            priority: newTask.isMilestone ? 'high' : 'medium',
            taskId: newTask.id,
            assignee: newTask.assignees?.map(id => {
              const member = projectMembers.find(m => m.id === id);
              return member ? member.name : "";
            }).join(", ")
          };
          
          const updatedColumns = columns.map(col => {
            if (col.id === "todo") {
              return {
                ...col,
                tasks: [...col.tasks, newBoardItem]
              };
            }
            return col;
          });
          
          setColumns(updatedColumns);
          
          toast({
            title: "Tarefa adicionada",
            description: `${newTask.name} foi adicionada com sucesso.`,
          });
        }
      } else if (selectedTask) {
        const success = await updateTask({
          ...selectedTask,
          ...taskData
        });
        
        if (success) {
          toast({
            title: "Tarefa atualizada",
            description: `${taskData.name} foi atualizada com sucesso.`,
          });
        }
      }
      
      setIsTaskFormOpen(false);
    } catch (error) {
      console.error("Error handling task submission:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive"
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, itemId: string, columnId: string) => {
    e.dataTransfer.setData("itemId", itemId);
    e.dataTransfer.setData("sourceColumnId", columnId);
    
    // Para dispositivos móveis, adicione informações extras
    if ('ontouchstart' in window) {
      const target = e.target as HTMLElement;
      target.classList.add('task-dragging');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dropZone = target.closest(".drop-zone");
    
    if (dropZone) {
      dropZone.classList.add("drag-over");
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent, itemId: string, columnId: string) => {
    const target = e.currentTarget as HTMLElement;
    target.setAttribute('data-item-id', itemId);
    target.setAttribute('data-column-id', columnId);
    target.classList.add('task-dragging');
  };
  
  const handleTouchEnd = (e: React.TouchEvent, targetColumnId: string) => {
    const target = e.currentTarget as HTMLElement;
    const itemId = target.getAttribute('data-item-id');
    const sourceColumnId = target.getAttribute('data-column-id');
    
    if (itemId && sourceColumnId && sourceColumnId !== targetColumnId) {
      moveTaskBetweenColumns(itemId, sourceColumnId, targetColumnId);
    }
    
    target.classList.remove('task-dragging');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const dropZone = target.closest(".drop-zone");
    
    if (dropZone) {
      dropZone.classList.remove("drag-over");
    }
  };

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const itemId = e.dataTransfer.getData("itemId");
    const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
    
    if (sourceColumnId === targetColumnId) return;
    
    await moveTaskBetweenColumns(itemId, sourceColumnId, targetColumnId);
    
    const dropZones = document.querySelectorAll(".drop-zone");
    dropZones.forEach(zone => zone.classList.remove("drag-over"));
  };
  
  const moveTaskBetweenColumns = async (itemId: string, sourceColumnId: string, targetColumnId: string) => {
    const sourceColIndex = columns.findIndex(col => col.id === sourceColumnId);
    const targetColIndex = columns.findIndex(col => col.id === targetColumnId);
    
    if (sourceColIndex !== -1 && targetColIndex !== -1) {
      const item = columns[sourceColIndex].tasks.find(t => t.id === itemId);
      
      if (item) {
        const sourceCol = {
          ...columns[sourceColIndex],
          tasks: columns[sourceColIndex].tasks.filter(t => t.id !== itemId)
        };
        
        const targetCol = {
          ...columns[targetColIndex],
          tasks: [...columns[targetColIndex].tasks, item]
        };
        
        const newColumns = [...columns];
        newColumns[sourceColIndex] = sourceCol;
        newColumns[targetColIndex] = targetCol;
        
        setColumns(newColumns);
        
        if (item.taskId) {
          const taskToUpdate = tasks.find(t => t.id === item.taskId);
          
          if (taskToUpdate) {
            const progress = targetColumnId === "done" ? 100 : 
                            targetColumnId === "in-progress" ? 50 : 0;
            
            await updateTask({
              ...taskToUpdate,
              progress
            });
          }
        }
      }
    }
  };
  
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case 'medium':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'low':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="flex-1 overflow-auto p-3 sm:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl font-semibold">Quadro de Tarefas</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAddColumn}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Coluna
          </Button>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white font-medium w-full sm:w-auto"
            onClick={handleAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Tarefa
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 h-auto sm:h-[calc(100vh-160px)] overflow-x-auto pb-6">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-full sm:w-80">
            <div 
              className="bg-white dark:bg-board-column-bg rounded-lg shadow-sm h-full flex flex-col drop-zone board-column"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-medium">{column.title} ({column.tasks.length})</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handleEditColumn(column)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                {column.tasks.map((task) => (
                  <Card 
                    key={task.id} 
                    className="shadow-sm hover:shadow-md transition-shadow animate-task-appear board-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                    onTouchStart={(e) => handleTouchStart(e, task.id, column.id)}
                    onTouchEnd={(e) => handleTouchEnd(e, column.id)}
                  >
                    <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                      <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                      {task.taskId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0" 
                          onClick={() => handleEditTask(task.taskId)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{task.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        {task.assignee && (
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            {task.assignee}
                          </div>
                        )}
                        <div className={cn(
                          "ml-auto px-2 py-0.5 rounded text-xs font-medium",
                          getPriorityStyles(task.priority)
                        )}>
                          {task.priority === 'high' ? 'Alta' : 
                           task.priority === 'medium' ? 'Média' : 'Baixa'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Separator />
              <div className="p-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  onClick={handleAddTask}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar tarefa
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex-shrink-0 w-full sm:w-80 h-32 sm:h-auto bg-gray-100 dark:bg-gray-800 bg-opacity-60 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
          <Button 
            variant="ghost" 
            className="text-gray-500 dark:text-gray-400"
            onClick={handleAddColumn}
          >
            <Plus className="h-5 w-5 mr-1" />
            Adicionar Coluna
          </Button>
        </div>
      </div>
      
      <TaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        onSubmit={handleTaskFormSubmit}
        tasks={tasks}
        isNew={isNewTask}
      />
      
      <Dialog open={columnDialog} onOpenChange={setColumnDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingColumn ? "Editar Coluna" : "Nova Coluna"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Título
              </label>
              <Input
                id="name"
                value={columnTitle}
                onChange={(e) => setColumnTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <Textarea
                id="description"
                value={columnDescription}
                onChange={(e) => setColumnDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            {editingColumn && (
              <Button variant="destructive" onClick={handleDeleteColumn} className="w-full sm:w-auto">
                Excluir
              </Button>
            )}
            <Button variant="outline" onClick={() => setColumnDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleSaveColumn} disabled={!columnTitle.trim()} className="w-full sm:w-auto">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardView;
