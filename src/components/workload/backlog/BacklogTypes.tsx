

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
  filteredItems: BacklogItem[];
  loading: boolean;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  formatDate: (dateString: string) => string;
  getProjectName: (projectId: string) => string;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  setIsEditingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPromotingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteBacklogItem: (id: string) => Promise<void>;
  canEdit: boolean;
  canDelete: boolean;
  // Add these properties to match how it's called in BacklogManager.tsx
  items?: BacklogItem[];
  onEdit?: (item: BacklogItem) => void;
  onPromote?: (item: BacklogItem) => void;
  onDelete?: (id: string) => Promise<void>;
}

export interface BacklogEditModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateBacklogItem: () => Promise<void>;
  isMobile: boolean;
  // Add this property to match how it's used
  onSave?: () => Promise<void>;
}

export interface BacklogPromoteModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  promoteToTask: () => Promise<void>;
  projects: any[];
  getPriorityInfo: (priority: number) => { color: string; label: string };
  isMobile: boolean;
  // Add this property to match how it's used
  onPromote?: () => Promise<void>;
}
