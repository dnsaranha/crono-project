
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BacklogItem } from './BacklogTypes';

interface BacklogContextProps {
  children: React.ReactNode;
  projects?: any[];
  projectId?: string;
  onItemConverted?: () => Promise<void>;
}

interface BacklogContextValue {
  filteredItems: BacklogItem[];
  items: BacklogItem[];
  loading: boolean;
  filterStatus: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  selectedItem: BacklogItem | null;
  isEditingDialogOpen: boolean;
  isPromotingDialogOpen: boolean;
  isCreatingDialogOpen: boolean;
  projects: any[];
  newItem: Partial<BacklogItem>;
  setNewItem: React.Dispatch<React.SetStateAction<Partial<BacklogItem>>>;
  setFilterStatus: (status: string) => void;
  setSortField: (field: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setSearchQuery: (query: string) => void;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  setIsEditingDialogOpen: (isOpen: boolean) => void;
  setIsPromotingDialogOpen: (isOpen: boolean) => void;
  setIsCreatingDialogOpen: (isOpen: boolean) => void;
  loadBacklogItems: () => Promise<void>;
  createBacklogItem: () => Promise<void>;
  updateBacklogItem: () => Promise<void>;
  deleteBacklogItem: (id: string) => Promise<void>;
  promoteToTask: () => Promise<void>;
  getProjectName: (projectId: string | null | undefined) => string;
  getPriorityInfo: (priority: number) => { color: string; label: string };
  getStatusInfo: (status: string) => { color: string; label: string };
  formatDate: (dateString: string) => string;
  canUserEdit: (item: BacklogItem) => boolean;
  canUserDelete: (item: BacklogItem) => boolean;
}

const BacklogContext = createContext<BacklogContextValue | undefined>(undefined);

export const BacklogProvider = ({ children, projects = [], projectId, onItemConverted }: BacklogContextProps) => {
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<BacklogItem>>({
    title: '',
    description: '',
    priority: 3,
    status: 'pending',
    target_project_id: projectId || null
  });
  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [isPromotingDialogOpen, setIsPromotingDialogOpen] = useState(false);
  const [isCreatingDialogOpen, setIsCreatingDialogOpen] = useState(false);

  // Função para carregar itens do backlog
  const loadBacklogItems = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('backlog_items').select('*');
      
      // Se um projectId específico foi fornecido, filtrar por esse projeto
      if (projectId) {
        query = query.eq('target_project_id', projectId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Carregar os nomes dos criadores
      const userIds = data.map(item => item.creator_id).filter(Boolean);
      const uniqueUserIds = [...new Set(userIds)];
      
      const profiles: Record<string, string> = {};
      
      if (uniqueUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', uniqueUserIds);
          
        if (profilesData) {
          profilesData.forEach(profile => {
            profiles[profile.id] = profile.full_name || profile.email;
          });
        }
      }
      
      // Adicionar o nome do criador a cada item
      const itemsWithCreator = data.map(item => ({
        ...item,
        creator_name: item.creator_id ? profiles[item.creator_id] : 'Usuário desconhecido'
      }));
      
      setItems(itemsWithCreator);
      applyFilters(itemsWithCreator, filterStatus, searchQuery, sortField, sortDirection);
    } catch (error) {
      console.error('Erro ao carregar itens do backlog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um novo item no backlog
  const createBacklogItem = async () => {
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");
      
      // Garantir que creator_id e title estão definidos
      const itemToCreate = {
        ...newItem,
        creator_id: user.id,
        title: newItem.title || "Novo Item" // Garantir que title não seja vazio
      };
      
      const { data, error } = await supabase
        .from('backlog_items')
        .insert(itemToCreate)
        .select('*')
        .single();

      if (error) throw error;

      // Carregar o nome do criador
      let creator_name = 'Usuário desconhecido';
      if (data.creator_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', data.creator_id)
          .single();

        if (profileData) {
          creator_name = profileData.full_name || profileData.email;
        }
      }

      const createdItem = { ...data, creator_name };

      setItems(prevItems => [...prevItems, createdItem]);
      setFilteredItems(prevFilteredItems => [...prevFilteredItems, createdItem]);
      
      // Limpar o formulário
      setNewItem({
        title: '',
        description: '',
        priority: 3,
        status: 'pending',
        target_project_id: projectId || null
      });
      
      // Fechar o diálogo
      setIsCreatingDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar item do backlog:', error);
    }
  };

  // Função para atualizar um item do backlog
  const updateBacklogItem = async () => {
    try {
      if (!selectedItem) return;
      
      const { data, error } = await supabase
        .from('backlog_items')
        .update(selectedItem)
        .eq('id', selectedItem.id)
        .select('*')
        .single();

      if (error) throw error;

      // Carregar o nome do criador
      let creator_name = 'Usuário desconhecido';
      if (data.creator_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', data.creator_id)
          .single();

        if (profileData) {
          creator_name = profileData.full_name || profileData.email;
        }
      }

      const updatedItem = { ...data, creator_name };

      setItems(prevItems =>
        prevItems.map(i => (i.id === selectedItem.id ? updatedItem : i))
      );
      setFilteredItems(prevFilteredItems =>
        prevFilteredItems.map(i => (i.id === selectedItem.id ? updatedItem : i))
      );
      
      // Fechar o diálogo
      setIsEditingDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar item do backlog:', error);
    }
  };

  // Função para deletar um item do backlog
  const deleteBacklogItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('backlog_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prevItems => prevItems.filter(item => item.id !== id));
      setFilteredItems(prevFilteredItems =>
        prevFilteredItems.filter(item => item.id !== id)
      );
    } catch (error) {
      console.error('Erro ao deletar item do backlog:', error);
    }
  };

  // Função para promover um item do backlog para uma task
  const promoteToTask = async () => {
    try {
      if (!selectedItem) return;
      
      // Verificar se o item já foi convertido
      if (selectedItem.status === 'converted') {
        console.warn('Item já foi convertido para tarefa.');
        return;
      }

      // Criar a task com os dados do item do backlog
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .insert([
          {
            name: selectedItem.title,
            description: selectedItem.description,
            project_id: selectedItem.target_project_id,
            priority: selectedItem.priority,
            status: 'pending',
            start_date: new Date().toISOString().split('T')[0],
            duration: 1,
            progress: 0,
            is_milestone: false,
          },
        ])
        .select('*')
        .single();

      if (taskError) throw taskError;

      // Atualizar o item do backlog para o status 'converted'
      const { error: updateError } = await supabase
        .from('backlog_items')
        .update({ status: 'converted' })
        .eq('id', selectedItem.id);

      if (updateError) throw updateError;

      // Atualizar o estado local
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === selectedItem.id ? { ...i, status: 'converted' } : i
        )
      );
      setFilteredItems(prevFilteredItems =>
        prevFilteredItems.map(i =>
          i.id === selectedItem.id ? { ...i, status: 'converted' } : i
        )
      );

      // Fechar o diálogo
      setIsPromotingDialogOpen(false);
      
      // Chamar a função onItemConverted para atualizar a lista de tasks
      if (onItemConverted) {
        await onItemConverted();
      }
    } catch (error) {
      console.error('Erro ao promover item para tarefa:', error);
    }
  };

  // Verificação de permissões de edição
  const canUserEdit = (item: BacklogItem) => {
    // Por enquanto, permitimos que qualquer usuário edite qualquer item
    // Esta função pode ser expandida para verificar se o usuário é o criador ou tem permissões específicas
    return true;
  };

  // Verificação de permissões de exclusão
  const canUserDelete = (item: BacklogItem) => {
    // Por enquanto, permitimos que qualquer usuário delete qualquer item
    // Esta função pode ser expandida para verificar se o usuário é o criador ou tem permissões específicas
    return true;
  };

  // Função para aplicar filtros
  const applyFilters = (
    items: BacklogItem[],
    filterStatus: string,
    searchQuery: string,
    sortField: string,
    sortDirection: 'asc' | 'desc'
  ) => {
    let filtered = [...items];

    // Aplicar filtro de status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Aplicar filtro de pesquisa
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredItems(filtered);
  };

  // Função para obter o nome do projeto
  const getProjectName = (projectId: string | null | undefined) => {
    if (!projectId) return 'Nenhum';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Desconhecido';
  };

  const getPriorityInfo = (priority: number) => {
    switch (priority) {
      case 1:
        return { label: 'Alta', color: 'bg-red-500 text-white' };
      case 2:
        return { label: 'Média-Alta', color: 'bg-orange-500 text-white' };
      case 3:
        return { label: 'Média', color: 'bg-yellow-500' };
      case 4:
        return { label: 'Média-Baixa', color: 'bg-lime-500' };
      case 5:
        return { label: 'Baixa', color: 'bg-green-500 text-white' };
      default:
        return { label: `Prioridade ${priority}`, color: 'bg-gray-200' };
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Pendente', color: 'bg-gray-200' };
      case 'in_progress':
        return { label: 'Em Progresso', color: 'bg-blue-500 text-white' };
      case 'done':
        return { label: 'Concluído', color: 'bg-green-500 text-white' };
      case 'converted':
        return { label: 'Convertido', color: 'bg-purple-500 text-white' };
      default:
        return { label: 'Desconhecido', color: 'bg-gray-200' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  useEffect(() => {
    applyFilters(items, filterStatus, searchQuery, sortField, sortDirection);
  }, [items, filterStatus, searchQuery, sortField, sortDirection]);

  useEffect(() => {
    loadBacklogItems();
  }, [projectId]);

  return (
    <BacklogContext.Provider value={{
      items,
      filteredItems,
      loading,
      filterStatus,
      sortField,
      sortDirection,
      searchQuery,
      selectedItem,
      newItem,
      setNewItem,
      isEditingDialogOpen,
      isPromotingDialogOpen,
      isCreatingDialogOpen,
      projects,
      setFilterStatus,
      setSortField,
      setSortDirection,
      setSearchQuery,
      setSelectedItem,
      setIsEditingDialogOpen,
      setIsPromotingDialogOpen,
      setIsCreatingDialogOpen,
      loadBacklogItems,
      createBacklogItem,
      updateBacklogItem,
      deleteBacklogItem,
      promoteToTask,
      getProjectName,
      getPriorityInfo,
      getStatusInfo,
      formatDate,
      canUserEdit,
      canUserDelete
    }}>
      {children}
    </BacklogContext.Provider>
  );
};

export const useBacklog = () => {
  const context = useContext(BacklogContext);
  if (!context) {
    throw new Error('useBacklog deve ser usado dentro de um BacklogProvider');
  }
  return context;
};
