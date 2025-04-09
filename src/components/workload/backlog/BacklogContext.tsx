
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BacklogItem } from "./BacklogTypes";
import { getStatusInfo, getPriorityInfo, formatDate } from "./BacklogUtils";

interface BacklogContextType {
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
  // Add the missing properties
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsPromotingIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getStatusInfo: (status: string) => { color: string; label: string };
  getPriorityInfo: (priority: number) => { color: string; label: string };
  formatDate: (dateString: string) => string;
  canUserEdit: (item: BacklogItem) => boolean;
  canUserDelete: (item: BacklogItem) => boolean;
  userRoleMap: Record<string, string>;
}

const BacklogContext = createContext<BacklogContextType | undefined>(undefined);

export function useBacklog() {
  const context = useContext(BacklogContext);
  if (context === undefined) {
    throw new Error("useBacklog must be used within a BacklogProvider");
  }
  return context;
}

interface BacklogProviderProps {
  children: ReactNode;
  projects: any[];
  onItemConverted?: () => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function BacklogProvider({
  children,
  projects,
  onItemConverted,
}: BacklogProviderProps) {
  const [backlogItems, setBacklogItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<string>("desc");
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<BacklogItem>>({
    title: "",
    description: "",
    priority: 3,
    status: "pending"
  });
  const [isCreatingDialogOpen, setIsCreatingDialogOpen] = useState(false);
  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [isPromotingDialogOpen, setIsPromotingDialogOpen] = useState(false);
  const [userRoleMap, setUserRoleMap] = useState<Record<string, string>>({});
  
  // Add aliases for backward compatibility
  const setIsOpen = setIsEditingDialogOpen;
  const setIsPromotingIsOpen = setIsPromotingDialogOpen;
  
  const { toast } = useToast();
  
  useEffect(() => {
    loadBacklogItems();
    loadUserRoles();
  }, []);

  // Carregar as funções de usuário para os projetos
  const loadUserRoles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberRoles, error } = await supabase
        .from('project_members')
        .select('project_id, role')
        .eq('user_id', user.id);

      if (error) throw error;

      // Criar um mapa de ID do projeto para função do usuário
      const roleMap: Record<string, string> = {};
      memberRoles?.forEach(item => {
        roleMap[item.project_id] = item.role;
      });

      // Adicionar projetos de proprietário como 'owner'
      projects.forEach(project => {
        if (project.owner_id === user.id) {
          roleMap[project.id] = 'owner';
        }
      });

      setUserRoleMap(roleMap);
    } catch (error: any) {
      console.error("Erro ao carregar funções do usuário:", error.message);
    }
  };
  
  // Verificações de permissão baseadas no papel do usuário e criador do item
  const canUserEdit = (item: BacklogItem) => {
    // Criador sempre pode editar
    if (item.creator_id === supabase.auth.getUser().then(({ data }) => data.user?.id)) {
      return true;
    }
    
    // Verificar se o usuário é admin ou editor do projeto associado
    const role = item.target_project_id ? userRoleMap[item.target_project_id] : null;
    return role === 'admin' || role === 'editor' || role === 'owner';
  };
  
  const canUserDelete = (item: BacklogItem) => {
    // Criador sempre pode excluir
    if (item.creator_id === supabase.auth.getUser().then(({ data }) => data.user?.id)) {
      return true;
    }
    
    // Apenas admin ou proprietário pode excluir
    const role = item.target_project_id ? userRoleMap[item.target_project_id] : null;
    return role === 'admin' || role === 'owner';
  };
  
  // Filter items based on current filter settings
  const filteredItems = backlogItems.filter(item => {
    // Filter by status
    if (filterStatus !== "all" && item.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projeto Desconhecido";
  };
  
  const loadBacklogItems = async () => {
    try {
      setLoading(true);
      
      // Carregar todos os itens de backlog (as políticas RLS cuidarão do acesso)
      const { data, error } = await supabase
        .from('backlog_items')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) {
        throw error;
      }
      
      // Fetch profiles separately for creator information
      const itemsWithCreatorInfo = await Promise.all(data.map(async (item: any) => {
        try {
          // Only fetch profile if we have a creator_id
          if (item.creator_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', item.creator_id)
              .single();
              
            if (!profileError && profileData) {
              return {
                ...item,
                creator_name: profileData.full_name || profileData.email || "Usuário"
              };
            }
          }
          
          // Default if we couldn't get the profile
          return {
            ...item,
            creator_name: "Usuário"
          };
        } catch (e) {
          console.error("Error fetching profile:", e);
          return {
            ...item,
            creator_name: "Usuário"
          };
        }
      }));
      
      setBacklogItems(itemsWithCreatorInfo);
    } catch (error: any) {
      console.error("Error loading backlog items:", error.message);
      toast({
        title: "Erro ao carregar backlog",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const createBacklogItem = async () => {
    try {
      if (!newItem.title) {
        toast({
          title: "Erro ao criar item",
          description: "O título é obrigatório",
          variant: "destructive",
        });
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar itens",
          variant: "destructive",
        });
        return;
      }
      
      const itemToCreate = {
        title: newItem.title,
        description: newItem.description || null,
        priority: newItem.priority || 3,
        status: newItem.status || "pending",
        creator_id: user.id,
        target_project_id: newItem.target_project_id || null
      };
      
      console.log("Creating item:", itemToCreate);
      
      const { data, error } = await supabase
        .from('backlog_items')
        .insert(itemToCreate)
        .select();
        
      if (error) throw error;
      
      // Reset form
      setNewItem({
        title: "",
        description: "",
        priority: 3,
        status: "pending"
      });
      
      // Close dialog
      setIsCreatingDialogOpen(false);
      
      // Reload items
      loadBacklogItems();
      
      toast({
        title: "Item criado com sucesso",
        description: "O item foi adicionado ao backlog",
      });
    } catch (error: any) {
      console.error("Error creating backlog item:", error.message);
      toast({
        title: "Erro ao criar item",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const updateBacklogItem = async () => {
    try {
      if (!selectedItem || !selectedItem.id) {
        return;
      }
      
      setLoading(true);

      const { error } = await supabase
        .from('backlog_items')
        .update({
          title: selectedItem.title,
          description: selectedItem.description,
          priority: selectedItem.priority,
          status: selectedItem.status,
          target_project_id: selectedItem.target_project_id
        })
        .eq('id', selectedItem.id);
        
      if (error) throw error;
      
      // Close dialog and reload items
      setIsEditingDialogOpen(false);
      await loadBacklogItems();
      
      toast({
        title: "Item atualizado",
        description: "As alterações foram salvas com sucesso",
      });
    } catch (error: any) {
      console.error("Error updating backlog item:", error.message);
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const deleteBacklogItem = async (id: string) => {
    try {
      const confirmed = window.confirm("Tem certeza que deseja excluir este item?");
      
      if (!confirmed) return;
      
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Reload items
      loadBacklogItems();
      
      toast({
        title: "Item excluído",
        description: "O item foi removido do backlog",
      });
    } catch (error: any) {
      console.error("Error deleting backlog item:", error.message);
      toast({
        title: "Erro ao excluir",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const promoteToTask = async () => {
    try {
      if (!selectedItem || !selectedItem.id) return;
      
      if (!selectedItem.target_project_id) {
        toast({
          title: "Erro ao promover",
          description: "Selecione um projeto de destino",
          variant: "destructive",
        });
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado para criar tarefas",
          variant: "destructive",
        });
        return;
      }
      
      // Create a new task in the target project
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert({
          name: selectedItem.title,
          description: selectedItem.description,
          project_id: selectedItem.target_project_id,
          priority: selectedItem.priority,
          start_date: new Date().toISOString().split('T')[0],
          duration: 1, // Default duration of 1 day
          progress: 0,
          is_group: false,
          is_milestone: false,
          created_by: user.id
        })
        .select();
        
      if (taskError) throw taskError;
      
      // Update backlog item status to converted
      const { error: updateError } = await supabase
        .from('backlog_items')
        .update({
          status: 'converted',
          target_project_id: selectedItem.target_project_id
        })
        .eq('id', selectedItem.id);
        
      if (updateError) throw updateError;
      
      // Close dialog
      setIsPromotingDialogOpen(false);
      
      // Reload items
      loadBacklogItems();
      
      // Notify parent about conversion if callback provided
      if (onItemConverted) {
        onItemConverted();
      }
      
      toast({
        title: "Convertido para tarefa",
        description: "O item do backlog foi convertido em tarefa do projeto",
      });
    } catch (error: any) {
      console.error("Error promoting backlog item:", error.message);
      toast({
        title: "Erro ao converter",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    backlogItems,
    loading,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    selectedItem,
    setSelectedItem,
    newItem,
    setNewItem,
    loadBacklogItems,
    createBacklogItem,
    updateBacklogItem,
    deleteBacklogItem,
    promoteToTask,
    filteredItems,
    isCreatingDialogOpen,
    setIsCreatingDialogOpen,
    isEditingDialogOpen,
    setIsEditingDialogOpen,
    isPromotingDialogOpen,
    setIsPromotingDialogOpen,
    projects,
    onItemConverted,
    getProjectName,
    // Add the utility functions and missing aliases
    getStatusInfo,
    getPriorityInfo,
    formatDate,
    setIsOpen,
    setIsPromotingIsOpen,
    // Adicionando as verificações de permissão
    canUserEdit,
    canUserDelete,
    userRoleMap,
  };

  return (
    <BacklogContext.Provider value={value}>
      {children}
    </BacklogContext.Provider>
  );
}
