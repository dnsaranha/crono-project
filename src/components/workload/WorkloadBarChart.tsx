
import { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, TooltipProps 
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";

interface WorkloadBarChartProps {
  data: {
    name: string;
    taskCount: number;
    totalDuration: number;
    highPriorityTasks: number;
  }[];
}

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function WorkloadBarChart({ data }: WorkloadBarChartProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const chartData = useMemo(() => {
    return data.map(item => ({
      name: item.name.split(' ')[0], // First name for display
      fullName: item.name,
      tasks: item.taskCount,
      duration: item.totalDuration,
      highPriority: item.highPriorityTasks
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-md shadow-md p-3 text-sm">
          <p className="font-bold mb-1">{data.fullName}</p>
          <div className="space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
              <span>Total de Dias: {data.duration}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <span>Tarefas de Alta Prioridade: {data.highPriority}</span>
            </div>
            <Badge variant="outline" className="mt-1">
              {data.tasks} {data.tasks === 1 ? 'tarefa' : 'tarefas'} no total
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ 
          top: 20, 
          right: isMobile ? 10 : 30, 
          left: isMobile ? 0 : 20, 
          bottom: 5 
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: isMobile ? 10 : 12 }}
          interval={isMobile ? 1 : 0}
        />
        <YAxis 
          yAxisId="left"
          label={isMobile ? null : { 
            value: 'Dias de Trabalho', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
          width={isMobile ? 30 : 60}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <YAxis 
          yAxisId="right" 
          orientation="right" 
          label={isMobile ? null : { 
            value: 'Tarefas Críticas', 
            angle: 90, 
            position: 'insideRight',
            style: { textAnchor: 'middle' }
          }}
          width={isMobile ? 30 : 60}
          tick={{ fontSize: isMobile ? 10 : 12 }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          wrapperStyle={isMobile ? { fontSize: '10px' } : undefined}
        />
        <Bar 
          yAxisId="left"
          dataKey="duration" 
          fill="var(--primary)" 
          name="Dias de Trabalho" 
          radius={[4, 4, 0, 0]} 
        />
        <Bar 
          yAxisId="right"
          dataKey="highPriority" 
          fill="#FFA500" 
          name="Tarefas Críticas" 
          radius={[4, 4, 0, 0]} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
