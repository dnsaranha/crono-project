
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BacklogFiltersProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: string;
  sortDirection: string;
  setSortField: (field: string) => void;
  setSortDirection: (direction: string) => void;
  loadBacklogItems: () => void;
}

export function BacklogFilters({
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  loadBacklogItems
}: BacklogFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Status</label>
        <Select 
          value={filterStatus} 
          onValueChange={setFilterStatus}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="in_progress">Em Progresso</SelectItem>
            <SelectItem value="done">Concluído</SelectItem>
            <SelectItem value="converted">Convertido</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Ordenar Por</label>
        <Select 
          value={`${sortField}-${sortDirection}`} 
          onValueChange={(value) => {
            const [field, direction] = value.split('-');
            setSortField(field);
            setSortDirection(direction);
            loadBacklogItems();
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Data de Criação (Mais Recente)</SelectItem>
            <SelectItem value="created_at-asc">Data de Criação (Mais Antiga)</SelectItem>
            <SelectItem value="priority-desc">Prioridade (Alto → Baixo)</SelectItem>
            <SelectItem value="priority-asc">Prioridade (Baixo → Alto)</SelectItem>
            <SelectItem value="title-asc">Título (A-Z)</SelectItem>
            <SelectItem value="title-desc">Título (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Buscar Item</label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Título do item"
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
