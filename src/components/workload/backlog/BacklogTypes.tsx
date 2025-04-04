
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
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface BacklogItemsTableProps {
  items: BacklogItem[];
  loading: boolean;
  getProjectName: (projectId: string) => any;
  onEdit: (item: BacklogItem) => void;
  onPromote: (item: BacklogItem) => void;
  onDelete: (id: string) => Promise<void>;
}

export interface BacklogEditModalProps {
  selectedItem: BacklogItem;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem>>;
  isEditingDialogOpen: boolean;
  setIsEditingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateBacklogItem: () => Promise<void>;
  isMobile: boolean;
}

export interface BacklogPromoteModalProps {
  selectedItem: BacklogItem;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem>>;
  isPromotingDialogOpen: boolean;
  setIsPromotingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  promoteToTask: () => Promise<void>;
  projects: any[];
  getPriorityInfo: (priority: number) => { color: string; label: string };
  isMobile: boolean;
}
