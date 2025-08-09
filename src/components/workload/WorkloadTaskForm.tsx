
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkloadTask, WorkloadProject, WorkloadMember } from '@/types/workload';
import { format } from 'date-fns';

interface WorkloadTaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: WorkloadTask | null;
  projects: WorkloadProject[];
  members: WorkloadMember[];
  onSubmit: (task: Omit<WorkloadTask, 'id' | 'created_at' | 'updated_at'>) => void;
}

export function WorkloadTaskForm({ 
  open, 
  onOpenChange, 
  task, 
  projects, 
  members, 
  onSubmit 
}: WorkloadTaskFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    assignee_id: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    hours_per_day: 8,
    status: 'pending' as const
  });

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        start_date: task.start_date,
        end_date: task.end_date,
        hours_per_day: task.hours_per_day,
        status: task.status
      });
    } else {
      setFormData({
        name: '',
        project_id: '',
        assignee_id: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        hours_per_day: 8,
        status: 'pending'
      });
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedProject = projects.find(p => p.id === formData.project_id);
    const selectedMember = members.find(m => m.id === formData.assignee_id);
    
    if (!selectedProject || !selectedMember) return;

    onSubmit({
      ...formData,
      project_name: selectedProject.name,
      assignee_name: selectedMember.name
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>
            {task ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Tarefa</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome da tarefa"
              required
              className="touch-manipulation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projeto</Label>
            <Select 
              value={formData.project_id} 
              onValueChange={(value) => setFormData({ ...formData, project_id: value })}
            >
              <SelectTrigger className="touch-manipulation">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Colaborador</Label>
            <Select 
              value={formData.assignee_id} 
              onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}
            >
              <SelectTrigger className="touch-manipulation">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
                className="touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                required
                className="touch-manipulation"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours_per_day">Horas por Dia</Label>
            <Input
              id="hours_per_day"
              type="number"
              min="1"
              max="24"
              value={formData.hours_per_day}
              onChange={(e) => setFormData({ ...formData, hours_per_day: parseInt(e.target.value) })}
              required
              className="touch-manipulation"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1 touch-manipulation"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 touch-manipulation"
            >
              {task ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
