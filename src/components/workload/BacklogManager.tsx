import { useState, useEffect } from "react";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter 
} from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Drawer, DrawerContent, DrawerDescription, 
  DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Tooltip, TooltipContent, 
  TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, MoveRight, Filter, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMobile } from "@/hooks/use-mobile";
import { format } from "date-fns";
import { CreateItemForm } from "./CreateItemForm";

interface BacklogManagerProps {
  projects: any[];
  onItemConverted?: () => void;
}

interface BacklogItem {
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

export function BacklogManager({ projects, onItemConverted }: BacklogManagerProps) {
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
  
  // Get priority label and color
  const getPriorityInfo = (priority: number) => {
    const options = [
      { value: 1, label: "Muito Baixa", color: "bg-gray-400" },
      { value: 2, label: "Baixa", color: "bg-blue-400" },
      { value: 3, label: "Média", color: "bg-green-400" },
      { value: 4, label: "Alta", color: "bg-yellow-400" },
      { value: 5, label: "Muito Alta", color: "bg-red-400" }
    ];
    
    return options.find(o => o.value === priority) || options[2];
  };
  
  // Get status label and color
  const getStatusInfo = (status: string) => {
    const options = [
      { value: "pending", label: "Pendente", color: "bg-gray-200 text-gray-800" },
      { value: "in_progress", label: "Em Progresso", color: "bg-blue-200 text-blue-800" },
      { value: "done", label: "Concluído", color: "bg-green-200 text-green-800" },
      { value: "converted", label: "Convertido", color: "bg-purple-200 text-purple-800" }
    ];
    
    return options.find(o => o.value === status) || options[0];
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (e) {
      return dateString;
    }
  };
  
  // Get project name by ID
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Projeto Desconhecido";
  };
  
  // Render the create item dialog/drawer based on device
  const renderCreateItemModal = () => {
    const content = (
      <>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Título do item"
              value={newItem.title || ""}
              onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o item em detalhes"
              value={newItem.description || ""}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Prioridade</Label>
            <Select
              value={String(newItem.priority || 3)}
              onValueChange={(value) => setNewItem({ ...newItem, priority: parseInt(value) })}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Muito Baixa</SelectItem>
                <SelectItem value="2">Baixa</SelectItem>
                <SelectItem value="3">Média</SelectItem>
                <SelectItem value="4">Alta</SelectItem>
                <SelectItem value="5">Muito Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={newItem.status || "pending"}
              onValueChange={(value) => setNewItem({ ...newItem, status: value as any })}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="done">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setNewItem({
                title: "",
                description: "",
                priority: 3,
                status: "pending"
              });
              setIsCreatingDialogOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={createBacklogItem}
          >
            Adicionar Item
          </Button>
        </div>
      </>
    );
    
    if (isMobile) {
      return (
        <Drawer open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
          <DrawerTrigger asChild>
            <Button className="flex items-center gap-1" onClick={() => setIsCreatingDialogOpen(true)}>
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
              {content}
            </div>
            <DrawerFooter className="pt-0">
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-1" onClick={() => setIsCreatingDialogOpen(true)}>
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
          {content}
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render the edit item dialog/drawer based on device
  const renderEditItemModal = () => {
    if (!selectedItem) return null;
    
    const content = (
      <>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              placeholder="Título do item"
              value={selectedItem.title || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              placeholder="Descreva o item em detalhes"
              value={selectedItem.description || ""}
              onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-priority">Prioridade</Label>
            <Select
              value={String(selectedItem.priority || 3)}
              onValueChange={(value) => setSelectedItem({ ...selectedItem, priority: parseInt(value) })}
            >
              <SelectTrigger id="edit-priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Muito Baixa</SelectItem>
                <SelectItem value="2">Baixa</SelectItem>
                <SelectItem value="3">Média</SelectItem>
                <SelectItem value="4">Alta</SelectItem>
                <SelectItem value="5">Muito Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={selectedItem.status || "pending"}
              onValueChange={(value) => setSelectedItem({ ...selectedItem, status: value as any })}
            >
              <SelectTrigger id="edit-status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="done">Concluído</SelectItem>
                {selectedItem.status === 'converted' && (
                  <SelectItem value="converted">Convertido</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedItem(null);
              setIsEditingDialogOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={updateBacklogItem}
          >
            Salvar Alterações
          </Button>
        </div>
      </>
    );
    
    if (isMobile) {
      return (
        <Drawer open={isEditingDialogOpen} onOpenChange={setIsEditingDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Editar Item</DrawerTitle>
              <DrawerDescription>
                Modifique os detalhes do item do backlog
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              {content}
            </div>
            <DrawerFooter className="pt-0">
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isEditingDialogOpen} onOpenChange={setIsEditingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
            <DialogDescription>
              Modifique os detalhes do item do backlog
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render the promote item dialog/drawer based on device
  const renderPromoteItemModal = () => {
    if (!selectedItem) return null;
    
    const content = (
      <>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-project">Projeto de Destino *</Label>
            <Select
              value={selectedItem.target_project_id || ""}
              onValueChange={(value) => setSelectedItem({ ...selectedItem, target_project_id: value })}
            >
              <SelectTrigger id="target-project">
                <SelectValue placeholder="Selecione um projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 mt-4">
            <p className="text-sm font-medium">Detalhes do Item:</p>
            <p className="text-sm"><strong>Título:</strong> {selectedItem.title}</p>
            <p className="text-sm"><strong>Prioridade:</strong> {getPriorityInfo(selectedItem.priority).label}</p>
            <p className="text-sm line-clamp-3"><strong>Descrição:</strong> {selectedItem.description || "Sem descrição"}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedItem(null);
              setIsPromotingDialogOpen(false);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={promoteToTask}
          >
            Converter em Tarefa
          </Button>
        </div>
      </>
    );
    
    if (isMobile) {
      return (
        <Drawer open={isPromotingDialogOpen} onOpenChange={setIsPromotingDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Converter para Tarefa</DrawerTitle>
              <DrawerDescription>
                Escolha um projeto para adicionar esta tarefa
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              {content}
            </div>
            <DrawerFooter className="pt-0">
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      );
    }
    
    return (
      <Dialog open={isPromotingDialogOpen} onOpenChange={setIsPromotingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Converter para Tarefa</DialogTitle>
            <DialogDescription>
              Escolha um projeto para adicionar esta tarefa
            </DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filterStatus} 
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="done">Concluído</SelectItem>
                  <SelectItem value="converted">Convertido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar Por</label>
              <Select 
                value={`${sortField}-${sortDirection}`} 
                onValueChange={(value) => {
                  const [field, direction] = value.split('-');
                  setSortField(field);
                  setSortDirection(direction);
                  loadBacklogItems();
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Data de Criação (Mais Recente)</SelectItem>
                  <SelectItem value="created_at-asc">Data de Criação (Mais Antiga)</SelectItem>
                  <SelectItem value="priority-desc">Prioridade (Alto → Baixo)</SelectItem>
                  <SelectItem value="priority-asc">Prioridade (Baixo → Alto)</SelectItem>
                  <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Título (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Item</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Título do item"
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline">
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
            </Badge>
            
            {/* Create item button/dialog */}
            {isMobile ? (
              <Drawer open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
                <DrawerTrigger asChild>
                  <Button className="flex items-center gap-1" onClick={() => setIsCreatingDialogOpen(true)}>
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
            ) : (
              <Dialog open={isCreatingDialogOpen} onOpenChange={setIsCreatingDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-1" onClick={() => setIsCreatingDialogOpen(true)}>
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
            )}
          </div>
          
          <div className="rounded-md border overflow-hidden max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Título</TableHead>
                  <TableHead className="w-[100px]">Prioridade</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[100px]">Criado Em</TableHead>
                  <TableHead className="w-[120px]">Criado Por</TableHead>
                  <TableHead className="w-[150px]">Projeto Destino</TableHead>
                  <TableHead className="w-[120px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {loading ? (
                        "Carregando itens do backlog..."
                      ) : (
                        "Nenhum item encontrado no backlog. Clique em 'Novo Item' para adicionar."
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map(item => {
                    const priorityInfo = getPriorityInfo(item.priority);
                    const statusInfo = getStatusInfo(item.status);
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`}></div>
                            <span className="text-xs">{priorityInfo.label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30">
                            {item.creator_name || "Usuário"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.target_project_id ? (
                            <Badge>{getProjectName(item.target_project_id)}</Badge>
                          ) : (
                            <span className="text-xs text-gray-400">Nenhum</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsEditingDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Editar</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {item.status !== "converted" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsPromotingDialogOpen(true);
                                      }}
                                    >
                                      <MoveRight className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Converter para Tarefa</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:
