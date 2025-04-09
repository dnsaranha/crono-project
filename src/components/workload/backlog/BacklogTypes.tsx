
import React from 'react';

// Definição do item de backlog
export interface BacklogItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'done' | 'converted';
  created_at: string;
  target_project_id: string | null;
  creator_id: string;
  creator_name?: string;
  updated_at: string;
}

// Props para o componente BacklogEditForm
export interface BacklogEditFormProps {
  selectedItem: BacklogItem;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

// Props para ações de edição
export interface BacklogEditActionsProps {
  onCancel: () => void;
  onSave: () => Promise<void>;
}

// Props para o modal de edição
export interface BacklogEditModalProps {
  selectedItem: BacklogItem;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updateBacklogItem?: () => Promise<void>;
  isMobile: boolean;
  onSave?: () => Promise<void>;
}

// Props para o conteúdo de promoção
export interface BacklogPromoteContentProps {
  selectedItem: BacklogItem;
  projects: any[];
  getPriorityInfo: (priority: number) => { color: string; label: string };
}

// Props para ações de promoção
export interface BacklogPromoteActionsProps {
  onCancel: () => void;
  onPromote: () => Promise<void>;
}

// Props para o modal de promoção
export interface BacklogPromoteModalProps {
  selectedItem: BacklogItem;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem>>;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  promoteToTask?: () => Promise<void>;
  projects: any[];
  getPriorityInfo: (priority: number) => { color: string; label: string };
  isMobile: boolean;
  onPromote?: () => Promise<void>;
}

// Props para a tabela de itens
export interface BacklogItemsTableProps {
  filteredItems?: BacklogItem[];
  loading?: boolean;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  formatDate: (dateString: string) => string;
  getProjectName: (projectId: string) => string;
  setSelectedItem?: React.Dispatch<React.SetStateAction<BacklogItem>>;
  setIsEditingDialogOpen?: (isOpen: boolean) => void;
  setIsPromotingDialogOpen?: (isOpen: boolean) => void;
  deleteBacklogItem?: (id: string) => Promise<void>;
  canEdit?: boolean;
  canDelete?: boolean;
  // Compatibilidade com o padrão de props alternativo
  items?: BacklogItem[];
  onEdit?: (item: BacklogItem) => void;
  onPromote?: (item: BacklogItem) => void;
  onDelete?: (id: string) => Promise<void>;
}

// Props para a linha de item
export interface BacklogItemRowProps {
  item: BacklogItem;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  getProjectName: (projectId: string) => string;
  formatDate: (dateString: string) => string;
  onEdit: (item: BacklogItem) => void;
  onPromote: (item: BacklogItem) => void;
  onDelete: (id: string) => Promise<void>;
  canEdit: boolean;
  canDelete: boolean;
}

export interface BacklogManagerProps {
  projects: any[];
  onItemConverted?: () => Promise<void>;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}
