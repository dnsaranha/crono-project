
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
import { BacklogPromoteContent } from "./BacklogPromoteContent";
import { BacklogPromoteActions } from "./BacklogPromoteActions";
import { BacklogItem } from "./BacklogTypes";
import { useBacklog } from "./BacklogContext";

interface BacklogPromoteModalProps {
  selectedItem: BacklogItem | null;
  setSelectedItem: React.Dispatch<React.SetStateAction<BacklogItem | null>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  projects: any[];
  getPriorityInfo?: (priority: number) => { color: string; label: string };
  isMobile: boolean;
}

export function BacklogPromoteModal({
  isOpen,
  setIsOpen,
  isMobile
}: BacklogPromoteModalProps) {
  const {
    selectedItem,
    setSelectedItem,
    promoteToTask,
    projects,
    getPriorityInfo
  } = useBacklog();

  // Se não houver item selecionado, não renderiza nada
  if (!selectedItem) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await promoteToTask();
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <form onSubmit={handleSubmit}>
            <DrawerHeader>
              <DrawerTitle>Promover para Tarefa</DrawerTitle>
              <DrawerDescription>
                Promova este item do backlog para uma tarefa no projeto
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <BacklogPromoteContent
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                projects={projects}
                getPriorityInfo={getPriorityInfo}
              />
            </div>
            <div className="p-4 mt-2">
              <BacklogPromoteActions
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
            <DialogTitle>Promover para Tarefa</DialogTitle>
            <DialogDescription>
              Promova este item do backlog para uma tarefa no projeto
            </DialogDescription>
          </DialogHeader>
          <BacklogPromoteContent
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
            projects={projects}
            getPriorityInfo={getPriorityInfo}
          />
          <BacklogPromoteActions
            setIsOpen={setIsOpen}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
