
import React from "react";
import { 
  Card, CardContent, CardDescription,
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { WorkloadBarChart } from "./WorkloadBarChart";

interface WorkloadVisualizationProps {
  data: {
    name: string;
    taskCount: number;
    totalDuration: number;
    highPriorityTasks: number;
  }[];
}

export function WorkloadVisualization({ data }: WorkloadVisualizationProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visualização de Carga de Trabalho</CardTitle>
        <CardDescription>
          Mostra a distribuição de tarefas entre os colaboradores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <WorkloadBarChart data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
