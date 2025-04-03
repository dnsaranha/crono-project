
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BacklogItem } from "./BacklogTypes";
import { getPriorityInfo } from "./BacklogUtils";

interface BacklogPromoteModalProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedItem: BacklogItem;
  setSelectedItem: (item: BacklogItem | null) => void;
  projects: any[];
  onPromote: () => Promise<void>;
}

export function BacklogPromoteModal({
  isMobile,
  isOpen,
  setIsOpen,
  selectedItem,
  setSelectedItem,
  projects,
  onPromote
}: BacklogPromoteModalProps) {
  const content = (
    <>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="target-project">Projeto de Destino *</Label>
          <Select
            value={selectedItem.target_project_id || ""}
            onValueChange={(value) => setSelectedItem({ ...selectedItem, target_project_id: value })}
          >
            <SelectTrigger id="target-project">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1 mt-4">
          <p className="text-sm font-medium">Detalhes do Item:</p>
          <p className="text-sm"><strong>Título:</strong> {selectedItem.title}</p>
          <p className="text-sm"><strong>Prioridade:</strong> {getPriorityInfo(selectedItem.priority).label}</p>
          <p className="text-sm line-clamp-3"><strong>Descrição:</strong> {selectedItem.description || "Sem descrição"}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSelectedItem(null);
            setIsOpen(false);
          }}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onPromote}
        >
          Converter em Tarefa
        </Button>
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
              Escolha um projeto para adicionar esta tarefa
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {content}
          </div>
          <DrawerFooter className="pt-0" />
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Converter para Tarefa</DialogTitle>
          <DialogDescription>
            Escolha um projeto para adicionar esta tarefa
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
