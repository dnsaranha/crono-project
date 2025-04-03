
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BacklogItem } from "./BacklogTypes";

interface BacklogEditModalProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedItem: BacklogItem;
  setSelectedItem: (item: BacklogItem | null) => void;
  onSave: () => Promise<void>;
}

export function BacklogEditModal({
  isMobile,
  isOpen,
  setIsOpen,
  selectedItem,
  setSelectedItem,
  onSave
}: BacklogEditModalProps) {
  const content = (
    <>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="edit-title">Título *</Label>
          <Input
            id="edit-title"
            placeholder="Título do item"
            value={selectedItem.title || ""}
            onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-description">Descrição</Label>
          <Textarea
            id="edit-description"
            placeholder="Descreva o item em detalhes"
            value={selectedItem.description || ""}
            onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="edit-priority">Prioridade</Label>
          <Select
            value={String(selectedItem.priority || 3)}
            onValueChange={(value) => setSelectedItem({ ...selectedItem, priority: parseInt(value) })}
          >
            <SelectTrigger id="edit-priority">
              <SelectValue placeholder="Selecione a prioridade" />
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
          <Label htmlFor="edit-status">Status</Label>
          <Select
            value={selectedItem.status || "pending"}
            onValueChange={(value) => setSelectedItem({ ...selectedItem, status: value as any })}
          >
            <SelectTrigger id="edit-status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
              {selectedItem.status === 'converted' && (
                <SelectItem value="converted">Convertido</SelectItem>
              )}
            </SelectContent>
          </Select>
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
          onClick={onSave}
        >
          Salvar Alterações
        </Button>
      </div>
    </>
  );
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar Item</DrawerTitle>
            <DrawerDescription>
              Modifique os detalhes do item do backlog
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
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Modifique os detalhes do item do backlog
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
