import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from '@/hooks/useSubscription';

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (projectId: string) => void;
  initialData?: any;
}

export function ProjectForm({ open, onOpenChange, onProjectCreated, initialData }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    ...(initialData || {})
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  
  const subscription = useSubscription();
  const canCreateProject = subscription.canCreateProject(projectCount);
  const limitMessage = subscription.getProjectLimitMessage(projectCount);
  
  useEffect(() => {
    const loadProjectCount = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { count, error } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', session.user.id);
            
          if (error) {
            console.error('Erro ao carregar contagem de projetos:', error);
          } else if (count !== null) {
            setProjectCount(count);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar contagem de projetos:', error);
      }
    };
    
    loadProjectCount();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateProject && !initialData) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input 
              id="name" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Digite o nome do projeto" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea 
              id="description" 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva o projeto brevemente" 
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Término</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {!initialData && (
            <div className={`text-sm ${!canCreateProject ? 'text-red-500' : 'text-gray-500'}`}>
              {limitMessage}
              
              {!canCreateProject && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => subscription.upgradeToPremium()}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Fazer upgrade para o plano Premium
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || (!initialData && !canCreateProject)}
          >
            {isSubmitting ? 'Salvando...' : initialData ? 'Atualizar Projeto' : 'Criar Projeto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
