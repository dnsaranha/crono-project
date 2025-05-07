
import React from "react";
import { 
  Tabs, TabsList, TabsTrigger
} from "@/components/ui/tabs";
import {
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  CalendarDays, Table2, Activity
} from "lucide-react";

interface AllocationHeaderProps {
  viewMode: "table" | "calendar" | "heatmap";
  setViewMode: (mode: "table" | "calendar" | "heatmap") => void;
  totalTasks: number;
}

export function AllocationHeader({ viewMode, setViewMode, totalTasks }: AllocationHeaderProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Alocação de atividades</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalTasks} {totalTasks === 1 ? "tarefa" : "tarefas"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "calendar" | "heatmap")}>
          <TabsList className="grid grid-cols-3 w-full touch-manipulation">
            <TabsTrigger value="table" className="touch-manipulation">
              <Table2 className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="touch-manipulation">
              <CalendarDays className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="touch-manipulation">
              <Activity className="h-4 w-4 mr-1" />
              <span className="hidden xs:inline">Carga</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}
