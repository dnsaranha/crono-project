
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BacklogItem } from "./BacklogTypes";

export interface BacklogPromoteModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  promoteToTask: () => Promise<void>;
  projects: { id: string, name: string }[];
  getPriorityInfo: (priority: number) => { label: string, color: string };
  isMobile: boolean;
}

export function BacklogPromoteModal({
  selectedItem,
  setSelectedItem,
  isOpen,
  setIsOpen,
  promoteToTask,
  projects,
  getPriorityInfo,
  isMobile
}: BacklogPromoteModalProps) {
  if (!selectedItem) return null;
  
  const handleSelectChange = (projectId: string) => {
    setSelectedItem(prev => prev ? { ...prev, target_project_id: projectId } : null);
  };
  
  const selectedPriority = selectedItem ? getPriorityInfo(selectedItem.priority) : { label: '', color: '' };
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Converter para Tarefa</DrawerTitle>
            <DrawerDescription>
              Selecione um projeto para adicionar este item como tarefa
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Título da Tarefa
                </label>
                <div className="p-2 border rounded-md bg-muted/20">
                  {selectedItem.title}
                </div>
              </div>
              
              {selectedItem.description && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Descrição
                  </label>
                  <div className="p-2 border rounded-md bg-muted/20 whitespace-pre-wrap h-20 overflow-y-auto">
                    {selectedItem.description}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Prioridade
                </label>
                <div>
                  <Badge variant="outline" className={selectedPriority.color}>
                    {selectedPriority.label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="project" className="text-sm font-medium">
                  Projeto de Destino
                </label>
                <Select
                  value={selectedItem.target_project_id || ''}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger id="project">
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
              
              <div className="pt-2 text-sm text-muted-foreground">
                Esta ação irá criar uma tarefa no projeto selecionado com os detalhes deste item de backlog.
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={promoteToTask}
              disabled={!selectedItem.target_project_id}
            >
              Converter para Tarefa
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Converter para Tarefa</DialogTitle>
          <DialogDescription>
            Selecione um projeto para adicionar este item como tarefa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Título da Tarefa
            </label>
            <div className="p-2 border rounded-md bg-muted/20">
              {selectedItem.title}
            </div>
          </div>
          
          {selectedItem.description && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Descrição
              </label>
              <div className="p-2 border rounded-md bg-muted/20 whitespace-pre-wrap h-24 overflow-y-auto">
                {selectedItem.description}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Prioridade
            </label>
            <div>
              <Badge variant="outline" className={selectedPriority.color}>
                {selectedPriority.label}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="project" className="text-sm font-medium">
              Projeto de Destino
            </label>
            <Select
              value={selectedItem.target_project_id || ''}
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="project">
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
          
          <div className="pt-2 text-sm text-muted-foreground">
            Esta ação irá criar uma tarefa no projeto selecionado com os detalhes deste item de backlog.
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={promoteToTask}
            disabled={!selectedItem.target_project_id}
          >
            Converter para Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
