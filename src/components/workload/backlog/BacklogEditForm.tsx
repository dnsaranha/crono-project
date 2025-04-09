
import React from 'react';
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

interface BacklogEditFormProps {
  selectedItem: BacklogItem;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

export function BacklogEditForm({
  selectedItem,
  handleInputChange,
  handleSelectChange
}: BacklogEditFormProps) {
  return (
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
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label htmlFor="priority" className="text-sm font-medium">
            Prioridade
          </label>
          <Select
            value={String(selectedItem.priority)}
            onValueChange={(value) => handleSelectChange('priority', value)}
          >
            <SelectTrigger className="w-full h-12 px-4 text-base">
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
            <SelectTrigger className="w-full h-12 px-4 text-base">
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
  );
}
