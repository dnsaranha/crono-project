
import { useState, useEffect } from 'react';
import { addDays, addMonths } from 'date-fns';
import { TaskType } from '../../task';

type TimeScale = "day" | "week" | "month" | "quarter" | "year";

export function useGanttDateRange(tasks: TaskType[], timeScale: TimeScale) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 3));
  
  useEffect(() => {
    calculateDateRange();
  }, [tasks, timeScale]);
  
  const calculateDateRange = () => {
    if (tasks.length === 0) {
      // Default range if no tasks
      const today = new Date();
      setStartDate(today);
      
      switch (timeScale) {
        case "day":
          setEndDate(addDays(today, 30));
          break;
        case "week":
          setEndDate(addDays(today, 90));
          break;
        case "month":
          setEndDate(addMonths(today, 6));
          break;
        case "quarter":
          setEndDate(addMonths(today, 12));
          break;
        case "year":
          setEndDate(addMonths(today, 24));
          break;
        default:
          setEndDate(addMonths(today, 3));
      }
      
      return;
    }
    
    // Find earliest start date and latest end date from tasks
    let earliest = new Date();
    let latest = addDays(new Date(), 30);
    
    tasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = addDays(taskStart, task.duration);
      
      if (taskStart < earliest) {
        earliest = taskStart;
      }
      
      if (taskEnd > latest) {
        latest = taskEnd;
      }
    });
    
    // Add buffer on both sides
    const buffer = timeScale === "day" ? 3 : timeScale === "week" ? 7 : 15;
    earliest = addDays(earliest, -buffer);
    latest = addDays(latest, buffer);
    
    setStartDate(earliest);
    setEndDate(latest);
  };
  
  return { startDate, endDate, calculateDateRange };
}
