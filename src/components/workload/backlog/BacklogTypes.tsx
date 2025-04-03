
export interface BacklogItem {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  status: 'pending' | 'in_progress' | 'done' | 'converted';
  created_at: string;
  target_project_id?: string | null;
  creator_id: string;
  creator_name?: string;
}

export interface BacklogManagerProps {
  projects: any[];
  onItemConverted?: () => void;
}
