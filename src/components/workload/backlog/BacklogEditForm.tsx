
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BacklogItem } from './BacklogTypes';

interface BacklogEditFormProps {
  selectedItem: BacklogItem;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  projects?: any[];
}

export function BacklogEditForm({
  selectedItem,
  handleInputChange,
  handleSelectChange,
  projects = []
}: BacklogEditFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={selectedItem.title}
            onChange={handleInputChange}
            placeholder="Título do item"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={selectedItem.description || ""}
            onChange={handleInputChange}
            placeholder="Descreva o item em detalhes"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project">Projeto Associado</Label>
          <Select
            value={selectedItem.target_project_id || ""}
            onValueChange={(value) => handleSelectChange("target_project_id", value)}
          >
            <SelectTrigger id="project">
              <SelectValue placeholder="Selecione um projeto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Sem projeto</SelectItem>
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
              value={String(selectedItem.priority)}
              onValueChange={(value) => handleSelectChange("priority", value)}
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
              value={selectedItem.status}
              onValueChange={(value) => handleSelectChange("status", value as any)}
              disabled={selectedItem.status === 'converted'}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Status" />
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
      </div>
    </div>
  );
}
