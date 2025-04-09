
import * as React from "react";
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
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBacklog } from "./BacklogContext";

export function BacklogCreateDialog({ isMobile }: { isMobile: boolean }) {
  const { 
    isCreatingDialogOpen, 
    setIsCreatingDialogOpen, 
    newItem, 
    setNewItem,
    createBacklogItem,
    projects
  } = useBacklog();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBacklogItem();
  };

  if (isMobile) {
    return (
      <Drawer open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
        <DrawerContent>
          <form onSubmit={handleSubmit}>
            <DrawerHeader>
              <DrawerTitle>Adicionar Item ao Backlog</DrawerTitle>
              <DrawerDescription>
                Adicione uma nova ideia, requisito ou tarefa ao backlog
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input 
                    id="title" 
                    value={newItem.title || ''}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Título do item"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newItem.description || ''}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    placeholder="Descreva o item em detalhes"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Projeto Associado</Label>
                  <Select 
                    value={newItem.target_project_id || 'none'} 
                    onValueChange={(value) => setNewItem({ ...newItem, target_project_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Selecione um projeto (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem projeto</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select 
                      value={String(newItem.priority || 3)} 
                      onValueChange={(value) => setNewItem({ ...newItem, priority: parseInt(value) })}
                    >
                      <SelectTrigger id="priority">
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
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newItem.status || 'pending'} 
                      onValueChange={(value) => setNewItem({ ...newItem, status: value as any })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="in_progress">Em Progresso</SelectItem>
                        <SelectItem value="done">Concluído</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 mt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreatingDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Backlog</DialogTitle>
            <DialogDescription>
              Adicione uma nova ideia, requisito ou tarefa ao backlog
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input 
                id="title" 
                value={newItem.title || ''}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Título do item"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newItem.description || ''}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Descreva o item em detalhes"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Projeto Associado</Label>
              <Select 
                value={newItem.target_project_id || 'none'} 
                onValueChange={(value) => setNewItem({ ...newItem, target_project_id: value === 'none' ? '' : value })}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder="Selecione um projeto (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem projeto</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select 
                  value={String(newItem.priority || 3)} 
                  onValueChange={(value) => setNewItem({ ...newItem, priority: parseInt(value) })}
                >
                  <SelectTrigger id="priority">
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
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newItem.status || 'pending'} 
                  onValueChange={(value) => setNewItem({ ...newItem, status: value as any })}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsCreatingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
