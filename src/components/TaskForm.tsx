
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskType } from "@/components/Task";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Slider } from "@/components/ui/slider";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskType | null;
  onSubmit: (task: Partial<TaskType>) => void;
  tasks: TaskType[];
  isNew?: boolean;
}

const TaskForm = ({ open, onOpenChange, task, onSubmit, tasks, isNew = false }: TaskFormProps) => {
  const [formData, setFormData] = useState<Partial<TaskType>>({
    name: "",
    startDate: new Date().toISOString().split("T")[0],
    duration: 7,
    progress: 0,
    dependencies: []
  });

  // When task changes, update form data
  useEffect(() => {
    if (task) {
      setFormData({
        ...task
      });
    } else if (isNew) {
      // Reset form for new task
      setFormData({
        name: "",
        startDate: new Date().toISOString().split("T")[0],
        duration: 7,
        progress: 0,
        dependencies: []
      });
    }
  }, [task, isNew]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onOpenChange(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Filter tasks that could be dependencies (no circular dependencies)
  const availableDependencies = tasks.filter(t => 
    t.id !== formData.id && 
    !isCircularDependency(t.id, formData.id, tasks)
  );

  // Function to check if adding a dependency would create a circular dependency
  function isCircularDependency(sourceId: string, targetId: string, allTasks: TaskType[], visited: Set<string> = new Set()): boolean {
    // If we've already visited this task in this path, we have a cycle
    if (visited.has(sourceId)) return false;
    
    const source = allTasks.find(t => t.id === sourceId);
    if (!source) return false;

    // Mark current task as visited in this path
    visited.add(sourceId);
    
    // Check if any of source's dependencies is the target (would create a cycle)
    if (source.dependencies?.includes(targetId)) return true;
    
    // Recursively check each dependency
    if (source.dependencies) {
      for (const depId of source.dependencies) {
        if (isCircularDependency(depId, targetId, allTasks, new Set(visited))) {
          return true;
        }
      }
    }
    
    return false;
  }

  const toggleDependency = (depId: string) => {
    const currentDeps = formData.dependencies || [];
    if (currentDeps.includes(depId)) {
      handleChange('dependencies', currentDeps.filter(id => id !== depId));
    } else {
      handleChange('dependencies', [...currentDeps, depId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Nova Tarefa' : 'Editar Tarefa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Tarefa</Label>
            <Input 
              id="name" 
              value={formData.name || ''} 
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !formData.startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(new Date(formData.startDate), "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => handleChange('startDate', date?.toISOString().split('T')[0])}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (dias)</Label>
              <Input 
                id="duration" 
                type="number" 
                min="1"
                value={formData.duration || 7} 
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Progresso ({formData.progress || 0}%)</Label>
            <Slider
              min={0}
              max={100}
              step={5}
              value={[formData.progress || 0]}
              onValueChange={(value) => handleChange('progress', value[0])}
            />
          </div>
          
          {formData.id && !formData.isGroup && (
            <div className="space-y-2">
              <Label>Dependências</Label>
              <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-2 border rounded-md">
                {availableDependencies.length > 0 ? (
                  availableDependencies.map(depTask => (
                    <div key={depTask.id} className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id={`dep-${depTask.id}`} 
                        checked={formData.dependencies?.includes(depTask.id) || false}
                        onChange={() => toggleDependency(depTask.id)}
                        className="rounded border-gray-300 text-primary"
                      />
                      <label htmlFor={`dep-${depTask.id}`} className="text-sm">
                        {depTask.name}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 col-span-2 text-center py-2">
                    Não há tarefas disponíveis para dependência
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="submit" variant="default">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskForm;
