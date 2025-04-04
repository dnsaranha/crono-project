
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
  priority?: 1 | 2 | 3 | 4 | 5;
  description?: string;
  customStatus?: string; // Adding this for the BoardView component
}

export interface TaskProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: () => void;
  onResize?: (newDuration: number) => void;
  onResizeStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  onDragStart?: (e: React.DragEvent | React.TouchEvent) => void;
  onDragEnd?: (e: React.DragEvent | React.TouchEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  cellWidth?: number;
  className?: string;
  draggable?: boolean;
  timeScale?: "day" | "week" | "month" | "quarter" | "year";
}

export interface TaskMilestoneProps {
  task: TaskType;
  style?: React.CSSProperties;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent | React.TouchEvent) => void;
  onDragEnd?: (e: React.DragEvent | React.TouchEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
  className?: string;
}

export interface TaskResizeHookProps {
  task: TaskType;
  onResize?: (newDuration: number) => void;
  onResizeStart?: (e: React.MouseEvent | React.TouchEvent) => void;
  onClick?: () => void;
  timeScale: "day" | "week" | "month" | "quarter" | "year";
  cellWidth: number;
  style?: React.CSSProperties;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}
