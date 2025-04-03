
import { useState, useEffect } from 'react';
import { TaskType } from '../../Task';
import { TimeScale } from '../GanttChart';

export function useGanttDateRange(tasks: TaskType[], timeScale: TimeScale) {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  // Calculate date range based on tasks
  const calculateDateRange = () => {
    if (!tasks || tasks.length === 0) {
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(today.getMonth() + 1);
      
      return {
        startDate: new Date(today.getFullYear(), today.getMonth(), 1),
        endDate: new Date(oneMonthLater.getFullYear(), oneMonthLater.getMonth() + 2, 0)
      };
    }
    
    let earliestStart = new Date();
    let latestEnd = new Date();
    
    tasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      
      const taskEnd = new Date(taskStart);
      taskEnd.setDate(taskStart.getDate() + (task.duration || 0));
      
      if (taskStart < earliestStart || earliestStart.toString() === new Date().toString()) {
        earliestStart = new Date(taskStart);
      }
      
      if (taskEnd > latestEnd) {
        latestEnd = new Date(taskEnd);
      }
    });
    
    // Adjust start date to beginning of month/week based on timeScale
    if (timeScale === "month" || timeScale === "quarter" || timeScale === "year") {
      earliestStart.setDate(1); // Start of month
    } else {
      // Start of week (Sunday)
      const day = earliestStart.getDay();
      earliestStart.setDate(earliestStart.getDate() - day);
    }
    
    // Add buffer to end date
    if (timeScale === "month" || timeScale === "quarter" || timeScale === "year") {
      latestEnd.setMonth(latestEnd.getMonth() + 1);
      latestEnd = new Date(latestEnd.getFullYear(), latestEnd.getMonth() + 1, 0); // End of month
    } else {
      latestEnd.setDate(latestEnd.getDate() + 14); // Add two weeks buffer
    }
    
    return { startDate: earliestStart, endDate: latestEnd };
  };
  
  useEffect(() => {
    const range = calculateDateRange();
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  }, [tasks, timeScale]);
  
  return { startDate, endDate, calculateDateRange };
}
