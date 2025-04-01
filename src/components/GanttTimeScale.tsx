
import { useMemo } from 'react';
import { format, addDays, addMonths, getYear, getMonth, getDate, isSameMonth, isSameYear } from 'date-fns';

type TimeScale = 'day' | 'week' | 'month' | 'quarter' | 'year';

interface TimeUnit {
  date: Date;
  label: string;
}

interface GanttTimeScaleProps {
  startDate: Date;
  endDate: Date;
  timeScale: TimeScale;
  cellWidth: number;
}

export function GanttTimeScale({ startDate, endDate, timeScale, cellWidth }: GanttTimeScaleProps) {
  // Gerar as unidades de tempo (dias, semanas, meses)
  const timeUnits = useMemo(() => {
    const units: TimeUnit[] = [];
    let current = new Date(startDate);
    
    switch (timeScale) {
      case "day":
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: format(current, "dd")
          });
          current = addDays(current, 1);
        }
        break;
      case "week":
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: `${format(current, "dd/MM")}`
          });
          current = addDays(current, 7);
        }
        break;
      case "month":
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: format(current, "MMM")
          });
          current = addMonths(current, 1);
        }
        break;
      default:
        while (current <= endDate) {
          units.push({
            date: new Date(current),
            label: `${format(current, "dd/MM")}`
          });
          current = addDays(current, 7);
        }
    }
    
    return units;
  }, [startDate, endDate, timeScale]);

  // Função para agrupar células por mês
  const monthGroups = useMemo(() => {
    if (timeUnits.length === 0) return [];
    
    const groups: { month: string; startIndex: number; span: number }[] = [];
    let currentMonth = format(timeUnits[0].date, 'MMM yyyy');
    let startIndex = 0;
    let span = 1;
    
    for (let i = 1; i < timeUnits.length; i++) {
      const monthYear = format(timeUnits[i].date, 'MMM yyyy');
      
      if (monthYear === currentMonth) {
        span++;
      } else {
        groups.push({ month: currentMonth, startIndex, span });
        currentMonth = monthYear;
        startIndex = i;
        span = 1;
      }
    }
    
    // Add the last group
    groups.push({ month: currentMonth, startIndex, span });
    
    return groups;
  }, [timeUnits]);

  // Função para agrupar células por ano
  const yearGroups = useMemo(() => {
    if (timeUnits.length === 0) return [];
    
    const groups: { year: string; startIndex: number; span: number }[] = [];
    let currentYear = format(timeUnits[0].date, 'yyyy');
    let startIndex = 0;
    let span = 1;
    
    for (let i = 1; i < timeUnits.length; i++) {
      const year = format(timeUnits[i].date, 'yyyy');
      
      if (year === currentYear) {
        span++;
      } else {
        groups.push({ year: currentYear, startIndex, span });
        currentYear = year;
        startIndex = i;
        span = 1;
      }
    }
    
    // Add the last group
    groups.push({ year: currentYear, startIndex, span });
    
    return groups;
  }, [timeUnits]);

  return (
    <div className="border-b">
      {/* Linha do Ano */}
      <div className="flex h-8 border-b">
        {yearGroups.map((group, idx) => (
          <div 
            key={`year-${idx}`} 
            className="border-r flex items-center justify-center bg-muted/30"
            style={{ 
              width: `${cellWidth * group.span}px`, 
              minWidth: `${cellWidth * group.span}px` 
            }}
          >
            <div className="text-xs font-medium text-foreground truncate">
              {group.year}
            </div>
          </div>
        ))}
      </div>
      
      {/* Linha do Mês */}
      <div className="flex h-8 border-b">
        {monthGroups.map((group, idx) => (
          <div 
            key={`month-${idx}`} 
            className="border-r flex items-center justify-center bg-muted/20"
            style={{ 
              width: `${cellWidth * group.span}px`, 
              minWidth: `${cellWidth * group.span}px` 
            }}
          >
            <div className="text-xs font-medium text-foreground truncate">
              {group.month.split(' ')[0]} {/* Remove year part */}
            </div>
          </div>
        ))}
      </div>
      
      {/* Linha do Dia */}
      <div className="flex h-8">
        {timeUnits.map((unit, idx) => (
          <div 
            key={`day-${idx}`}
            className="border-r flex items-center justify-center"
            style={{ 
              width: `${cellWidth}px`,
              minWidth: `${cellWidth}px` 
            }}
          >
            <div className="text-xs font-medium text-foreground truncate px-1">
              {unit.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GanttTimeScale;
