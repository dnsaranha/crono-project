
export interface TaskType {
  id: string;
  name: string;
  startDate: string;
  duration: number;
  progress: number;
  isGroup?: boolean;
  isMilestone?: boolean;
  parentId?: string | null;
  dependencies?: string[];
  customStatus?: string;
  // Change priority to accept any number instead of just literals
  priority: number; // Changed from '1 | 2 | 3 | 4 | 5' to number
  // Add other properties as needed
}
