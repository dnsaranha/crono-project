
import React from "react";
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { 
  Drawer, DrawerContent, DrawerDescription, 
  DrawerFooter, DrawerHeader, DrawerTitle, 
  DrawerTrigger 
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateItemForm } from "../CreateItemForm";
import { useBacklog } from "./BacklogContext";

interface BacklogCreateDialogProps {
  isMobile: boolean;
  canCreate: boolean;
}

export function BacklogCreateDialog({ isMobile, canCreate }: BacklogCreateDialogProps) {
  const { 
    newItem, 
    setNewItem, 
    createBacklogItem, 
    isCreatingDialogOpen, 
    setIsCreatingDialogOpen 
  } = useBacklog();

  const handleCancel = () => {
    setNewItem({
      title: "",
      description: "",
      priority: 3,
      status: "pending"
    });
    setIsCreatingDialogOpen(false);
  };

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
              onCancel={handleCancel}
              onSubmit={createBacklogItem}
            />
          </div>
          <DrawerFooter className="pt-0" />
        </DrawerContent>
      </Drawer>
    );
  }

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
          onCancel={handleCancel}
          onSubmit={createBacklogItem}
        />
      </DialogContent>
    </Dialog>
  );
}
