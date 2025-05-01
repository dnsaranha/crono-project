
import React, { useState } from 'react';
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
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para gerenciar a mudança de projeto selecionado
  const handleProjectChange = (projectId: string) => {
    setSelectedItem({
      ...selectedItem,
      target_project_id: projectId
    });
  };

  // Função que suporta ambos os padrões de propriedades
  const handlePromote = async () => {
    setIsSubmitting(true);
    
    try {
      if (onPromote) {
        await onPromote();
      } else if (promoteToTask) {
        await promoteToTask();
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Versão para dispositivos móveis
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Converter para Tarefa</DrawerTitle>
            <DrawerDescription>
              Transforme este item de backlog em uma tarefa do projeto
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <BacklogPromoteContent
              selectedItem={selectedItem}
              projects={projects}
              getPriorityInfo={getPriorityInfo}
              handleProjectChange={handleProjectChange}
            />
          </div>
          <DrawerFooter className="pt-2">
            <div className="flex justify-end gap-2 w-full">
              <BacklogPromoteActions 
                onCancel={() => setIsOpen(false)} 
                onPromote={handlePromote}
                isDisabled={isSubmitting || !selectedItem.target_project_id}
              />
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  // Versão para desktop
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Converter para Tarefa</DialogTitle>
          <DialogDescription>
            Transforme este item de backlog em uma tarefa do projeto
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
            isDisabled={isSubmitting || !selectedItem.target_project_id}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
