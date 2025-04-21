
import React from "react";
import { 
  Card, CardContent, CardDescription,
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

interface WorkloadFiltersProps {
  members: any[];
  selectedMember: string;
  setSelectedMember: (value: string) => void;
  timeFrame: string;
  setTimeFrame: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function WorkloadFilters({
  members,
  selectedMember,
  setSelectedMember,
  timeFrame,
  setTimeFrame,
  searchQuery,
  setSearchQuery
}: WorkloadFiltersProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Garantir que os membros estão devidamente formatados
  const formattedMembers = members.map(member => ({
    id: member.id || member.user_id,
    name: member.name || "Sem nome"
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center">
          <Filter className="h-5 w-5 mr-2 text-muted-foreground" />
          <div>
            <CardTitle>Filtros</CardTitle>
            <CardDescription className="hidden sm:block">
              Ajuste as configurações para visualizar a carga de trabalho
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Colaborador</label>
            <Select 
              value={selectedMember} 
              onValueChange={setSelectedMember}
            >
              <SelectTrigger className="h-12 sm:h-10 touch-manipulation">
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent className="touch-manipulation">
                <SelectItem value="all" className="h-10 sm:h-8">Todos os Colaboradores</SelectItem>
                {formattedMembers.map(member => (
                  <SelectItem key={member.id} value={member.id} className="h-10 sm:h-8">
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select 
              value={timeFrame} 
              onValueChange={setTimeFrame}
            >
              <SelectTrigger className="h-12 sm:h-10 touch-manipulation">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent className="touch-manipulation">
                <SelectItem value="week" className="h-10 sm:h-8">Próxima Semana</SelectItem>
                <SelectItem value="month" className="h-10 sm:h-8">Próximo Mês</SelectItem>
                <SelectItem value="quarter" className="h-10 sm:h-8">Próximo Trimestre</SelectItem>
                <SelectItem value="all" className="h-10 sm:h-8">Todas as Atividades</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Buscar Atividade</label>
            <div className="relative">
              <Search className="absolute left-2 top-4 sm:top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome da atividade"
                className="pl-8 h-12 sm:h-10 touch-manipulation"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
