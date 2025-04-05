
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BacklogItem, BacklogPromoteModalProps } from "./BacklogTypes";

export function BacklogPromoteModal({
  selectedItem,
  setSelectedItem,
  isOpen,
  setIsOpen,
  promoteToTask,
  projects,
  getPriorityInfo,
  isMobile,
  onPromote
}: BacklogPromoteModalProps) {
  if (!selectedItem) return null;

  // Handler that works with both property patterns
  const handlePromote = async () => {
    if (onPromote) {
      await onPromote();
    } else {
      await promoteToTask();
    }
  };
  
  const handleProjectChange = (projectId: string) => {
    setSelectedItem(prev => prev ? { ...prev, target_project_id: projectId } : null);
  };
  
  // Use the provided getPriorityInfo or a fallback
  const priorityInfo = getPriorityInfo ? 
    getPriorityInfo(selectedItem.priority) : 
    { label: `Prioridade ${selectedItem.priority}`, color: 'bg-gray-200' };
  
  const content = (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Detalhes do Item</h3>
          <p className="text-sm text-gray-500">{selectedItem.title}</p>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="outline" className={priorityInfo.color}>
              {priorityInfo.label}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="project" className="text-sm font-medium">
            Selecione o Projeto
          </label>
          <Select
            value={selectedItem.target_project_id || ""}
            onValueChange={handleProjectChange}
          >
            <SelectTrigger>
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
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Converter para Tarefa</DrawerTitle>
            <DrawerDescription>
              Converta este item do backlog em uma tarefa de projeto
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            {content}
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePromote}
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
            Converta este item do backlog em uma tarefa de projeto
          </DialogDescription>
        </DialogHeader>
        {content}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handlePromote}
            disabled={!selectedItem.target_project_id}
          >
            Converter para Tarefa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
