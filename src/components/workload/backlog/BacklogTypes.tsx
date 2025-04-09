
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
  projects?: any[];
  projectId?: string; // Adicionando projectId como opção
  onItemConverted?: () => Promise<void>;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface BacklogItemsTableProps {
  // Original properties
  filteredItems?: BacklogItem[];
  loading: boolean;
  getPriorityInfo?: (priority: number) => { color: string; label: string };
  getStatusInfo?: (status: string) => { color: string; label: string };
  formatDate?: (dateString: string) => string;
  getProjectName: (projectId: string) => string;
  setSelectedItem?: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  setIsEditingDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPromotingDialogOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  deleteBacklogItem?: (id: string) => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
  // Alternative property pattern
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
  updateBacklogItem?: () => Promise<void>;
  isMobile: boolean;
  // Alternative property pattern
  onSave?: () => Promise<void>;
}

export interface BacklogPromoteModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  promoteToTask?: () => Promise<void>;
  projects: any[];
  getPriorityInfo?: (priority: number) => { color: string; label: string };
  isMobile: boolean;
  // Alternative property pattern
  onPromote?: () => Promise<void>;
}

export interface BacklogContextType {
  backlogItems: BacklogItem[];
  loading: boolean;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortField: string;
  setSortField: (field: string) => void;
  sortDirection: string;
  setSortDirection: (direction: string) => void;
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  newItem: Partial<BacklogItem>;
  setNewItem: React.Dispatch<React.SetStateAction<Partial<BacklogItem>>>;
  loadBacklogItems: () => Promise<void>;
  createBacklogItem: () => Promise<void>;
  updateBacklogItem: () => Promise<void>;
  deleteBacklogItem: (id: string) => Promise<void>;
  promoteToTask: () => Promise<void>;
  filteredItems: BacklogItem[];
  isCreatingDialogOpen: boolean;
  setIsCreatingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isEditingDialogOpen: boolean;
  setIsEditingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPromotingDialogOpen: boolean;
  setIsPromotingDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projects: any[];
  onItemConverted?: () => void;
  getProjectName: (projectId: string) => string;
  // Add the properties that were causing errors
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPromotingIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getStatusInfo: (status: string) => { color: string; label: string };
  getPriorityInfo: (priority: number) => { color: string; label: string };
  formatDate: (dateString: string) => string;
  // Adicionar funções para verificar permissões
  canUserEdit: (item: BacklogItem) => boolean;
  canUserDelete: (item: BacklogItem) => boolean;
  userRoleMap: Record<string, string>;
}
