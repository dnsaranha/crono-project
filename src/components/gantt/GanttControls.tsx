
import React from 'react';
import { ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface GanttControlsProps {
  timeScale: "day" | "week" | "month" | "quarter" | "year";
  handleZoomOut: () => void;
  handleZoomIn: () => void;
  exportToImage: () => Promise<void>;
  priorityLegend?: Array<{ level: number; label: string; color: string }>;
}

const GanttControls: React.FC<GanttControlsProps> = ({
  timeScale,
  handleZoomOut,
  handleZoomIn,
  exportToImage,
  priorityLegend
}) => {
  return (
    <div className="flex justify-between items-center p-2 border-t bg-card/80 gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="h-8 w-8"
          aria-label="Diminuir Zoom"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        
        <div className="text-xs font-medium px-2">
          {timeScale === "day" ? "Dia" : timeScale === "week" ? "Semana" : "Mês"}
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="h-8 w-8"
          aria-label="Aumentar Zoom"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>
      
      {priorityLegend && (
        <div className="hidden md:flex items-center gap-2 flex-grow justify-center">
          {priorityLegend.map(item => (
            <div key={item.level} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={exportToImage}
        className="h-8 gap-1"
        aria-label="Exportar como imagem"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Exportar</span>
      </Button>
    </div>
  );
};

export default GanttControls;
