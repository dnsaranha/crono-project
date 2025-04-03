
import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';

interface PriorityLegend {
  level: number;
  label: string;
  color: string;
}

interface GanttControlsProps {
  timeScale: string;
  handleZoomOut: () => void;
  handleZoomIn: () => void;
  exportToImage: () => void;
}

const GanttControls: React.FC<GanttControlsProps> = ({
  timeScale,
  handleZoomOut,
  handleZoomIn,
  exportToImage
}) => {
  const priorityLegend: PriorityLegend[] = [
    { level: 1, label: "Muito Baixa", color: "bg-gray-400" },
    { level: 2, label: "Baixa", color: "bg-blue-400" },
    { level: 3, label: "Média", color: "bg-green-400" },
    { level: 4, label: "Alta", color: "bg-yellow-400" },
    { level: 5, label: "Muito Alta", color: "bg-red-400" }
  ];

  return (
    <div className="p-2 bg-card border-t flex flex-wrap justify-between items-center gap-2">
      <div className="flex flex-wrap items-center gap-1 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></div>
            <span>Dependências</span>
          </div>
        </div>
        
        <div className="hidden sm:flex flex-wrap items-center gap-2 sm:gap-4">
          {priorityLegend.map(priority => (
            <div key={priority.level} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${priority.color} mr-1`}></div>
              <span className="text-xs text-muted-foreground">{priority.label}</span>
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-background dark:bg-gray-800"
            onClick={handleZoomOut}
            title="Diminuir Zoom"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground min-w-10 text-center">
            {timeScale === "day" ? "Dias" : timeScale === "week" ? "Semanas" : "Meses"}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-background dark:bg-gray-800"
            onClick={handleZoomIn}
            title="Aumentar Zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Export as image button */}
        <Button
          variant="outline"
          size="sm"
          className="ml-0 sm:ml-2"
          onClick={exportToImage}
          title="Exportar como imagem"
        >
          <Download className="h-4 w-4 mr-0 sm:mr-1" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </div>
    </div>
  );
};

export default GanttControls;
