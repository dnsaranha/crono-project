
import React from 'react';
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
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { BacklogPromoteModalProps } from "./BacklogTypes";
import { BacklogPromoteContent } from "./BacklogPromoteContent";
import { BacklogPromoteActions } from "./BacklogPromoteActions";

export function BacklogPromoteModal({
  selectedItem,
  setSelectedItem,
  isOpen,
  setIsOpen,
  promoteToTask,
  projects,
  getPriorityInfo,
  isMobile,
  onPromote
}: BacklogPromoteModalProps) {
  if (!selectedItem) return null;

  // Handler that works with both property patterns
  const handlePromote = async () => {
    if (onPromote) {
      await onPromote();
    } else if (promoteToTask) {
      await promoteToTask();
    }
  };
  
  const handleProjectChange = (projectId: string) => {
    setSelectedItem(prev => prev ? { ...prev, target_project_id: projectId } : null);
  };
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Converter para Tarefa</DrawerTitle>
            <DrawerDescription>
              Converta este item do backlog em uma tarefa de projeto
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <BacklogPromoteContent 
              selectedItem={selectedItem}
              projects={projects}
              getPriorityInfo={getPriorityInfo}
              handleProjectChange={handleProjectChange}
            />
          </div>
          <DrawerFooter>
            <BacklogPromoteActions 
              onCancel={() => setIsOpen(false)}
              onPromote={handlePromote}
              isDisabled={!selectedItem.target_project_id}
            />
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Converter para Tarefa</DialogTitle>
          <DialogDescription>
            Converta este item do backlog em uma tarefa de projeto
          </DialogDescription>
        </DialogHeader>
        <BacklogPromoteContent 
          selectedItem={selectedItem}
          projects={projects}
          getPriorityInfo={getPriorityInfo}
          handleProjectChange={handleProjectChange}
        />
        <div className="flex justify-end gap-2 mt-4">
          <BacklogPromoteActions 
            onCancel={() => setIsOpen(false)}
            onPromote={handlePromote}
            isDisabled={!selectedItem.target_project_id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
