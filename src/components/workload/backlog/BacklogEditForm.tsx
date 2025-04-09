
import React from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BacklogItem } from './BacklogTypes';

interface BacklogEditFormProps {
  selectedItem: BacklogItem;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  projects: any[];
  disabled?: boolean;
}

export function BacklogEditForm({
  selectedItem,
  handleInputChange,
  handleSelectChange,
  projects,
  disabled = false
}: BacklogEditFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          value={selectedItem.title}
          onChange={handleInputChange}
          placeholder="Título do item"
          disabled={disabled}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          value={selectedItem.description || ''}
          onChange={handleInputChange}
          placeholder="Descrição do item"
          disabled={disabled}
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="priority">Prioridade</Label>
        <Select
          disabled={disabled}
          value={String(selectedItem.priority)}
          onValueChange={(value) => handleSelectChange('priority', value)}
        >
          <SelectTrigger id="priority">
            <SelectValue placeholder="Selecione a prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="1">1 - Alta</SelectItem>
              <SelectItem value="2">2 - Média-Alta</SelectItem>
              <SelectItem value="3">3 - Média</SelectItem>
              <SelectItem value="4">4 - Média-Baixa</SelectItem>
              <SelectItem value="5">5 - Baixa</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="status">Status</Label>
        <Select
          disabled={disabled}
          value={selectedItem.status}
          onValueChange={(value) => handleSelectChange('status', value)}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="project">Projeto Associado</Label>
        <Select
          disabled={disabled}
          value={selectedItem.target_project_id || ''}
          onValueChange={(value) => handleSelectChange('target_project_id', value)}
        >
          <SelectTrigger id="project">
            <SelectValue placeholder="Selecione um projeto" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="">Nenhum</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {selectedItem.creator_name && (
        <div className="grid gap-2">
          <Label>Criado por</Label>
          <Input
            value={selectedItem.creator_name}
            disabled
            className="bg-muted"
          />
        </div>
      )}

      {selectedItem.target_project_id && (
        <div className="mt-4 text-sm text-muted-foreground">
          <p>
            <strong>Sobre permissões do projeto:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Administradores e proprietários podem editar e excluir itens</li>
            <li>Editores podem visualizar e editar, mas não excluir</li>
            <li>Visualizadores podem apenas ver os itens</li>
          </ul>
        </div>
      )}
    </div>
  );
}
