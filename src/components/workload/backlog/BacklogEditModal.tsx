
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BacklogItem } from "./BacklogTypes";

export interface BacklogEditModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateBacklogItem: () => Promise<void>;
  isMobile: boolean;
}

export function BacklogEditModal({
  selectedItem,
  setSelectedItem,
  isOpen,
  setIsOpen,
  updateBacklogItem,
  isMobile
}: BacklogEditModalProps) {
  if (!selectedItem) return null;
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedItem(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setSelectedItem(prev => prev ? { ...prev, [name]: name === 'priority' ? Number(value) : value } : null);
  };
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar Item</DrawerTitle>
            <DrawerDescription>
              Altere os detalhes deste item do backlog
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título
                </label>
                <Input
                  id="title"
                  name="title"
                  value={selectedItem.title}
                  onChange={handleInputChange}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Descrição
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={selectedItem.description || ''}
                  onChange={handleInputChange}
                  className="w-full min-h-[120px]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">
                    Prioridade
                  </label>
                  <Select
                    value={String(selectedItem.priority)}
                    onValueChange={(value) => handleSelectChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Muito Baixa</SelectItem>
                      <SelectItem value="2">Baixa</SelectItem>
                      <SelectItem value="3">Média</SelectItem>
                      <SelectItem value="4">Alta</SelectItem>
                      <SelectItem value="5">Muito Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={selectedItem.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateBacklogItem}>
              Salvar
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
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Altere os detalhes deste item do backlog
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Título
            </label>
            <Input
              id="title"
              name="title"
              value={selectedItem.title}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição
            </label>
            <Textarea
              id="description"
              name="description"
              value={selectedItem.description || ''}
              onChange={handleInputChange}
              className="w-full min-h-[120px]"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Prioridade
              </label>
              <Select
                value={String(selectedItem.priority)}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Muito Baixa</SelectItem>
                  <SelectItem value="2">Baixa</SelectItem>
                  <SelectItem value="3">Média</SelectItem>
                  <SelectItem value="4">Alta</SelectItem>
                  <SelectItem value="5">Muito Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={selectedItem.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={updateBacklogItem}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
