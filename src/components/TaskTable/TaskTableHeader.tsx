
import { Calendar, Clock, Flag, Users } from "lucide-react";
import { TableHead, TableRow } from "@/components/ui/table";

const TaskTableHeader = () => {
  return (
    <TableRow className="dark-mode-fix">
      <TableHead className="w-[300px]">Nome da Tarefa</TableHead>
      <TableHead className="w-[150px]">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Data de Início
        </div>
      </TableHead>
      <TableHead className="w-[120px]">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          Duração
        </div>
      </TableHead>
      <TableHead className="w-[150px]">Data de Fim</TableHead>
      <TableHead className="w-[150px]">Progresso</TableHead>
      <TableHead className="w-[100px]">Prioridade</TableHead>
      <TableHead className="w-[150px]">
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-1" />
          Responsáveis
        </div>
      </TableHead>
      <TableHead className="w-[100px]">Ações</TableHead>
    </TableRow>
  );
};

export default TaskTableHeader;
