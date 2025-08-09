
export interface WorkloadTask {
  id: string;
  name: string;
  project_id: string;
  project_name: string;
  assignee_id: string;
  assignee_name: string;
  start_date: string;
  end_date: string;
  hours_per_day: number;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface WorkloadProject {
  id: string;
  name: string;
  color: string;
}

export interface WorkloadMember {
  id: string;
  name: string;
  email: string;
}

export type TimeScale = 'day' | 'week' | 'month';

export interface TimeUnit {
  date: Date;
  label: string;
}
