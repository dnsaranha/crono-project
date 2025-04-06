
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
import { BacklogEditModalProps } from "./BacklogTypes";
import { BacklogEditForm } from "./BacklogEditForm";

export function BacklogEditModal({
  selectedItem,
  setSelectedItem,
  isOpen,
  setIsOpen,
  updateBacklogItem,
  isMobile,
  onSave
}: BacklogEditModalProps) {
  if (!selectedItem) return null;
  
  // Handler that works with both property patterns
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    } else if (updateBacklogItem) {
      await updateBacklogItem();
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedItem(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setSelectedItem(prev => prev ? { ...prev, [name]: name === 'priority' ? Number(value) : value } : null);
  };
  
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Editar Item</DrawerTitle>
            <DrawerDescription>
              Altere os detalhes deste item do backlog
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <BacklogEditForm
              selectedItem={selectedItem}
              handleInputChange={handleInputChange}
              handleSelectChange={handleSelectChange}
            />
          </div>
          <DrawerFooter>
            <div className="flex justify-end gap-2">
              <BacklogEditActions 
                onCancel={() => setIsOpen(false)} 
                onSave={handleSave} 
              />
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Item</DialogTitle>
          <DialogDescription>
            Altere os detalhes deste item do backlog
          </DialogDescription>
        </DialogHeader>
        <BacklogEditForm
          selectedItem={selectedItem}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
        />
        <div className="flex justify-end gap-2 mt-4">
          <BacklogEditActions 
            onCancel={() => setIsOpen(false)} 
            onSave={handleSave} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
