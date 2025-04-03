
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";

interface BacklogItemFormData {
  title?: string;
  description?: string;
  priority?: number;
  status?: 'pending' | 'in_progress' | 'done' | 'converted';
}

interface CreateItemFormProps {
  newItem: BacklogItemFormData;
  setNewItem: (item: BacklogItemFormData) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export function CreateItemForm({ newItem, setNewItem, onCancel, onSubmit }: CreateItemFormProps) {
  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            placeholder="Título do item"
            value={newItem.title || ""}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            placeholder="Descreva o item em detalhes"
            value={newItem.description || ""}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={String(newItem.priority || 3)}
            onValueChange={(value) => setNewItem({ ...newItem, priority: parseInt(value) })}
          >
            <SelectTrigger id="priority">
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
          <Label htmlFor="status">Status</Label>
          <Select
            value={newItem.status || "pending"}
            onValueChange={(value) => setNewItem({ ...newItem, status: value as any })}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="done">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
        >
          Adicionar Item
        </Button>
      </div>
    </>
  );
}
