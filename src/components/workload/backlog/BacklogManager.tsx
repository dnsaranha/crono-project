
import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle
} from "@/components/ui/card";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Drawer, DrawerContent, DrawerDescription, 
  DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMobile } from "@/hooks/use-mobile";
import { BacklogItem, BacklogManagerProps } from "./BacklogTypes";
import { BacklogFilters } from "./BacklogFilters";
import { BacklogItemsTable } from "./BacklogItemsTable";
import { BacklogEditModal } from "./BacklogEditModal";
import { BacklogPromoteModal } from "./BacklogPromoteModal";
import { CreateItemForm } from "../CreateItemForm";
import { getStatusInfo, getPriorityInfo, formatDate } from "./BacklogUtils";

export function BacklogManager({ 
  projects, 
  onItemConverted,
  canCreate = true,
  canEdit = true, 
  canDelete = true 
}: BacklogManagerProps) {
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
  const { toast } = useToast();
  const { isMobile } = useMobile();
  const [isCreatingDialogOpen, setIsCreatingDialogOpen] = useState(false);
  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [isPromotingDialogOpen, setIsPromotingDialogOpen] = useState(false);
  
  useEffect(() => {
    loadBacklogItems();
  }, []);
  
  const loadBacklogItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('backlog_items')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });
        
      if (error) {
        throw error;
      }
      
      // Map the data to include creator name
      const itemsWithCreatorNames = data.map((item: any) => ({
        ...item,
        creator_name: item.profiles?.full_name || item.profiles?.email || "Usuário"
      }));
      
      setBacklogItems(itemsWithCreatorNames);
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
        creator_id: user.id
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
      
      const { error } = await supabase
        .from('backlog_items')
        .update({
          title: selectedItem.title,
          description: selectedItem.description,
          priority: selectedItem.priority,
          status: selectedItem.status
        })
        .eq('id', selectedItem.id);
        
      if (error) throw error;
      
      // Close dialog
      setIsEditingDialogOpen(false);
      
      // Reload items
      loadBacklogItems();
      
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
  
  // Render the create item modal
  const renderCreateItemModal = () => {
    if (isMobile) {
      return (
        <Drawer open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
          <DrawerTrigger asChild>
            <Button 
              className="flex items-center gap-1" 
              onClick={() => setIsCreatingDialogOpen(true)}
              disabled={!canCreate}
            >
              <Plus className="h-4 w-4" />
              Novo Item
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Adicionar Novo Item</DrawerTitle>
              <DrawerDescription>
                Preencha os detalhes para adicionar um novo item ao backlog
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <CreateItemForm 
                newItem={newItem}
                setNewItem={setNewItem}
                onCancel={() => {
                  setNewItem({
                    title: "",
                    description: "",
                    priority: 3,
                    status: "pending"
                  });
                  setIsCreatingDialogOpen(false);
                }}
                onSubmit={createBacklogItem}
              />
            </div>
            <DrawerFooter className="pt-0" />
          </DrawerContent>
        </Drawer>
      );
    } else {
      return (
        <Dialog open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="flex items-center gap-1" 
              onClick={() => setIsCreatingDialogOpen(true)}
              disabled={!canCreate}
            >
              <Plus className="h-4 w-4" />
              Novo Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Item</DialogTitle>
              <DialogDescription>
                Preencha os detalhes para adicionar um novo item ao backlog
              </DialogDescription>
            </DialogHeader>
            <CreateItemForm 
              newItem={newItem}
              setNewItem={setNewItem}
              onCancel={() => {
                setNewItem({
                  title: "",
                  description: "",
                  priority: 3,
                  status: "pending"
                });
                setIsCreatingDialogOpen(false);
              }}
              onSubmit={createBacklogItem}
            />
          </DialogContent>
        </Dialog>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciador de Backlog</CardTitle>
          <CardDescription>
            Gerencie ideias e atividades que podem se transformar em tarefas de projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BacklogFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortField={sortField}
            sortDirection={sortDirection}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            loadBacklogItems={loadBacklogItems}
          />
          
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
            </Badge>
            
            {/* Create item button/dialog */}
            {renderCreateItemModal()}
          </div>
          
          <BacklogItemsTable
            filteredItems={filteredItems}
            loading={loading}
            getPriorityInfo={getPriorityInfo}
            getStatusInfo={getStatusInfo}
            formatDate={formatDate}
            getProjectName={getProjectName}
            setSelectedItem={setSelectedItem}
            setIsEditingDialogOpen={setIsEditingDialogOpen}
            setIsPromotingDialogOpen={setIsPromotingDialogOpen}
            deleteBacklogItem={deleteBacklogItem}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        </CardContent>
      </Card>
      
      {/* Edit Modal */}
      <BacklogEditModal
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isEditingDialogOpen={isEditingDialogOpen}
        setIsEditingDialogOpen={setIsEditingDialogOpen}
        updateBacklogItem={updateBacklogItem}
        isMobile={isMobile}
      />
      
      {/* Promote Modal */}
      <BacklogPromoteModal
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isPromotingDialogOpen={isPromotingDialogOpen}
        setIsPromotingDialogOpen={setIsPromotingDialogOpen}
        promoteToTask={promoteToTask}
        projects={projects}
        getPriorityInfo={getPriorityInfo}
        isMobile={isMobile}
      />
    </div>
  );
}
