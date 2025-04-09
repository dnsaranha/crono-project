
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BacklogEditForm } from "./BacklogEditForm";
import { BacklogEditActions } from "./BacklogEditActions";
import { BacklogItem } from "./BacklogTypes";
import { useBacklog } from "./BacklogContext";

interface BacklogEditModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateBacklogItem?: () => Promise<void>;
  isMobile: boolean;
}

export function BacklogEditModal({
  isOpen,
  setIsOpen,
  isMobile
}: BacklogEditModalProps) {
  const {
    selectedItem,
    setSelectedItem,
    updateBacklogItem,
    canUserEdit
  } = useBacklog();

  // Se não houver item selecionado ou não tiver permissão para editar, não renderiza nada
  if (!selectedItem) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (updateBacklogItem) {
      await updateBacklogItem();
    }
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <form onSubmit={handleSubmit}>
            <DrawerHeader>
              <DrawerTitle>Editar Item do Backlog</DrawerTitle>
              <DrawerDescription>
                Edite os detalhes deste item do backlog
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <BacklogEditForm
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
            </div>
            <div className="p-4 mt-2">
              <BacklogEditActions
                setIsOpen={setIsOpen}
              />
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Item do Backlog</DialogTitle>
            <DialogDescription>
              Edite os detalhes deste item do backlog
            </DialogDescription>
          </DialogHeader>
          <BacklogEditForm
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
          <BacklogEditActions
            setIsOpen={setIsOpen}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
