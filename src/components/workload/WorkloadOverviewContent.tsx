
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload, Filter } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getProjectMembersList } from "@/services/taskService";
import { WorkloadTask, WorkloadProject, WorkloadMember, TimeScale } from "@/types/workload";
import { WorkloadTaskForm } from "./WorkloadTaskForm";
import { WorkloadTimeline } from "./WorkloadTimeline";
import { exportTasksToCSV, parseCSVToTasks } from "@/utils/csvUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function WorkloadOverviewContent() {
  const { toast } = useToast();
  
  // Estados locais carregados do banco
  const [tasks, setTasks] = useState<WorkloadTask[]>([]);
  const [projects, setProjects] = useState<WorkloadProject[]>([]);
  const [members, setMembers] = useState<WorkloadMember[]>([]);
  
  // Estados da UI
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WorkloadTask | null>(null);
  const [timeScale, setTimeScale] = useState<TimeScale>('week');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [groupByProject, setGroupByProject] = useState(true);

  const refreshData = useCallback(async () => {
    try {
      // 1) Projetos acessíveis (com cor e status)
      const { data: projectsData, error: projErr } = await supabase
        .from('projects')
        .select('id, name, color, status');
      if (projErr) throw projErr;

      const mappedProjects: WorkloadProject[] = (projectsData ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        color: p.color || '#60A5FA',
      }));
      setProjects(mappedProjects);

      // 2) Membros (agregados de todos os projetos)
      const memberLists = await Promise.all(
        mappedProjects.map((p) => getProjectMembersList(p.id).catch(() => []))
      );
      const membersMap = new Map<string, WorkloadMember>();
      memberLists.flat().forEach((m: any) => {
        if (m?.id) membersMap.set(m.id, m);
      });
      const membersArr = Array.from(membersMap.values());
      setMembers(membersArr);

      // 3) Tarefas do workload
      const projectIds = mappedProjects.map((p) => p.id);
      if (projectIds.length === 0) {
        setTasks([]);
        return;
      }
      const { data: tasksData, error: tasksErr } = await supabase
        .from('workload_tasks')
        .select('id, name, project_id, assignee_id, start_date, end_date, hours_per_day, status, created_at, updated_at, category')
        .in('project_id', projectIds);
      if (tasksErr) throw tasksErr;

      const tasksMapped: WorkloadTask[] = (tasksData ?? []).map((t: any) => {
        const proj = mappedProjects.find((p) => p.id === t.project_id);
        const assignee = t.assignee_id ? membersArr.find((m) => m.id === t.assignee_id) : undefined;
        return {
          id: t.id,
          name: t.name,
          project_id: t.project_id,
          project_name: proj?.name ?? 'Projeto',
          assignee_id: t.assignee_id ?? '',
          assignee_name: assignee?.name ?? '',
          start_date: t.start_date,
          end_date: t.end_date,
          hours_per_day: t.hours_per_day ?? 8,
          status: (t.status as any) ?? 'pending',
          created_at: t.created_at,
          updated_at: t.updated_at,
        };
      });
      setTasks(tasksMapped);
    } catch (err: any) {
      console.error('Erro ao carregar workload:', err);
      toast({ title: 'Erro ao carregar dados', description: err.message, variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Filtrar tarefas
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (selectedProject !== 'all' && task.project_id !== selectedProject) {
        return false;
      }
      return true;
    });
  }, [tasks, selectedProject]);

  // Agrupar tarefas por projeto se necessário
  const organizedTasks = useMemo(() => {
    if (!groupByProject) return filteredTasks;
    
    const tasksByProject: Record<string, WorkloadTask[]> = {};
    filteredTasks.forEach(task => {
      if (!tasksByProject[task.project_id]) {
        tasksByProject[task.project_id] = [];
      }
      tasksByProject[task.project_id].push(task);
    });
    
    return filteredTasks; // Por enquanto retornamos todas as tarefas filtradas
  }, [filteredTasks, groupByProject]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: WorkloadTask) => {
    setSelectedTask(task);
    setIsTaskFormOpen(true);
  };

  const handleSubmitTask = async (taskData: Omit<WorkloadTask, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (selectedTask) {
        const { error } = await supabase
          .from('workload_tasks')
          .update({
            name: taskData.name,
            project_id: taskData.project_id,
            assignee_id: taskData.assignee_id || null,
            start_date: taskData.start_date,
            end_date: taskData.end_date,
            hours_per_day: taskData.hours_per_day,
            status: taskData.status,
          })
          .eq('id', selectedTask.id);
        if (error) throw error;

        toast({ title: 'Tarefa atualizada', description: 'A tarefa foi atualizada com sucesso.' });
      } else {
        const { data, error } = await supabase
          .from('workload_tasks')
          .insert([
            {
              name: taskData.name,
              project_id: taskData.project_id,
              assignee_id: taskData.assignee_id || null,
              start_date: taskData.start_date,
              end_date: taskData.end_date,
              hours_per_day: taskData.hours_per_day,
              status: taskData.status,
            },
          ])
          .select()
          .maybeSingle();
        if (error) throw error;

        toast({ title: 'Tarefa criada', description: 'A nova tarefa foi criada com sucesso.' });
      }

      await refreshData();
      setIsTaskFormOpen(false);
    } catch (err: any) {
      console.error('Erro ao salvar tarefa:', err);
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' });
    }
  };

  const handleTaskMove = async (taskId: string, newStartDate: string) => {
    // Otimista: atualiza UI
    let previous: WorkloadTask | null = null;
    setTasks((prev) => prev.map((task) => {
      if (task.id === taskId) {
        previous = task;
        const oldStart = new Date(task.start_date);
        const oldEnd = new Date(task.end_date);
        const duration = Math.ceil((oldEnd.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24));

        const newStart = new Date(newStartDate);
        const newEnd = new Date(newStart);
        newEnd.setDate(newEnd.getDate() + duration);

        return {
          ...task,
          start_date: newStartDate,
          end_date: newEnd.toISOString().split('T')[0],
          updated_at: new Date().toISOString(),
        };
      }
      return task;
    }));

    try {
      // Persistir no banco
      const movingTask = previous;
      if (!movingTask) return;
      const oldStart = new Date(movingTask.start_date);
      const oldEnd = new Date(movingTask.end_date);
      const duration = Math.ceil((oldEnd.getTime() - oldStart.getTime()) / (1000 * 60 * 60 * 24));
      const newStart = new Date(newStartDate);
      const newEnd = new Date(newStart);
      newEnd.setDate(newEnd.getDate() + duration);

      const { error } = await supabase
        .from('workload_tasks')
        .update({ start_date: newStartDate, end_date: newEnd.toISOString().split('T')[0] })
        .eq('id', taskId);
      if (error) throw error;

      toast({ title: 'Tarefa movida', description: 'A tarefa foi reposicionada na timeline.' });
    } catch (err: any) {
      console.error('Erro ao mover tarefa:', err);
      toast({ title: 'Erro ao mover', description: err.message, variant: 'destructive' });
      // Recarregar estado do banco para reverter
      await refreshData();
    }
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      toast({
        title: "Nenhuma tarefa para exportar",
        description: "Crie algumas tarefas antes de exportar.",
        variant: "destructive"
      });
      return;
    }
    
    exportTasksToCSV(tasks);
    
    toast({
      title: "Exportação concluída",
      description: `${tasks.length} tarefas exportadas para CSV.`
    });
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvContent = e.target?.result as string;
        const importedTasks = parseCSVToTasks(csvContent);
        
        // Converter para tarefas completas
        const newTasks: WorkloadTask[] = importedTasks.map(taskData => ({
          ...taskData,
          id: `imported-${Date.now()}-${Math.random()}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        setTasks(prev => [...prev, ...newTasks]);
        
        toast({
          title: "Importação concluída",
          description: `${newTasks.length} tarefas importadas com sucesso.`
        });
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Não foi possível importar o arquivo CSV.",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    event.target.value = ''; // Limpar input
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Timeline de Carga de Trabalho</h2>
          <p className="text-sm text-muted-foreground">
            {tasks.length} tarefa(s) • {members.length} colaborador(es)
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleCreateTask}
            className="touch-manipulation"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="touch-manipulation"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          
          <div className="relative">
            <Button 
              variant="outline"
              className="touch-manipulation"
              onClick={() => document.getElementById('csv-import')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importar CSV
            </Button>
            <input
              id="csv-import"
              type="file"
              accept=".csv"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImportCSV}
            />
          </div>
        </div>
      </div>

      {/* Filtros e controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-muted/30 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Label htmlFor="time-scale" className="text-sm font-medium">
            Visualização:
          </Label>
          <Select value={timeScale} onValueChange={(value: TimeScale) => setTimeScale(value)}>
            <SelectTrigger className="w-32 touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Dia</SelectItem>
              <SelectItem value="week">Semana</SelectItem>
              <SelectItem value="month">Mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Label htmlFor="project-filter" className="text-sm font-medium">
            Projeto:
          </Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-40 touch-manipulation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Projetos</SelectItem>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="group-by-project"
            checked={groupByProject}
            onCheckedChange={setGroupByProject}
          />
          <Label htmlFor="group-by-project" className="text-sm">
            Agrupar por projeto
          </Label>
        </div>
      </div>

      {/* Timeline principal */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">
            Nenhuma tarefa encontrada. Crie sua primeira tarefa para começar.
          </p>
          <Button onClick={handleCreateTask} className="touch-manipulation">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Tarefa
          </Button>
        </div>
      ) : (
        <WorkloadTimeline
          tasks={organizedTasks}
          members={members}
          timeScale={timeScale}
          onTaskClick={handleEditTask}
          onTaskMove={handleTaskMove}
        />
      )}

      {/* Formulário de tarefa */}
      <WorkloadTaskForm
        open={isTaskFormOpen}
        onOpenChange={setIsTaskFormOpen}
        task={selectedTask}
        projects={projects}
        members={members}
        onSubmit={handleSubmitTask}
      />
    </div>
  );
}
