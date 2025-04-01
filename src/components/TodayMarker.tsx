
import { isWithinInterval } from 'date-fns';

interface TodayMarkerProps {
  startDate: Date;
  endDate: Date;
  position: number;
}

export function TodayMarker({ startDate, endDate, position }: TodayMarkerProps) {
  const today = new Date();
  const isVisible = isWithinInterval(today, { start: startDate, end: endDate });
  
  if (!isVisible) return null;
  
  return (
    <>
      <line
        x1={position}
        y1="0"
        x2={position}
        y2="100%"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeDasharray="4"
        className="drop-shadow-sm"
      />
      <rect 
        x={position - 20} 
        y="4" 
        width="40" 
        height="18" 
        rx="4" 
        fill="hsl(var(--primary))" 
        className="drop-shadow-md"
      />
      <text
        x={position}
        y="16"
        fill="hsl(var(--primary-foreground))"
        textAnchor="middle"
        dominantBaseline="middle"
        className="text-xs font-medium"
      >
        Hoje
      </text>
    </>
  );
}

export default TodayMarker;
