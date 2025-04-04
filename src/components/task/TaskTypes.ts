
import React from "react";

export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  progress: number;
  dependencies?: string[];
  assignees?: string[];
  parentId?: string;
  isGroup?: boolean;
  isMilestone?: boolean;
  priority?: number; // Changed from '1 | 2 | 3 | 4 | 5' to number
  description?: string;
  customStatus?: string; // For BoardView component
}

export interface TaskProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: () => void;
  onResize?: (newDuration: number) => void;
  onResizeStart?: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onDragStart?: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLElement>) => void;
  cellWidth?: number;
  className?: string;
  draggable?: boolean;
  timeScale?: "day" | "week" | "month" | "quarter" | "year";
  dependencies?: string[]; // Added for GanttChart
  dependencyMode?: boolean; // Added for GanttChart
  onDependencyStart?: () => void; // Added for GanttChart
  canEdit?: boolean; // Added for GanttChart
}

export interface TaskMilestoneProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove?: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchEnd?: (e: React.TouchEvent<HTMLElement>) => void;
  className?: string;
}

export interface TaskResizeHookProps {
  task?: TaskType;
  onResize?: (newDuration: number) => void;
  onResizeStart?: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
  onClick?: () => void;
  timeScale: "day" | "week" | "month" | "quarter" | "year";
  cellWidth: number;
  style?: React.CSSProperties;
  hasEditPermission?: boolean;
  onTaskUpdate?: (task: TaskType) => void;
}
