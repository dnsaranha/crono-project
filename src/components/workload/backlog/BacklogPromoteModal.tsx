"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBacklog } from "@/contexts/BacklogContext";
import { Project } from "@/services/projectService";
import { BacklogItem } from "@/services/backlogService";
import { BacklogPromoteContent } from "./BacklogPromoteContent";
import { BacklogPromoteActions } from "./BacklogPromoteActions";

interface BacklogPromoteModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  projects: Project[];
}

export function BacklogPromoteModal({
  open,
  setOpen,
  projects,
}: BacklogPromoteModalProps) {
  const { selectedItem, promoteBacklogItem, getPriorityInfo } = useBacklog();

  const handleCancel = () => {
    setOpen(false);
  };

  const handlePromote = async () => {
    if (selectedItem) {
      await promoteBacklogItem(selectedItem.id);
      setOpen(false);
    }
  };

  // Supondo existência destas funções de manipulação
  const handleProjectChange = () => {}; // função dummy para cumprir tipagem
  const isDisabled = false;              // valor dummy para cumprir tipagem
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Promover Item do Backlog</DialogTitle>
          <DialogDescription>
            Selecione o projeto para o qual deseja promover este item.
          </DialogDescription>
        </DialogHeader>

        <BacklogPromoteContent
          selectedItem={selectedItem}
          projects={projects}
          getPriorityInfo={getPriorityInfo}
          handleProjectChange={handleProjectChange} // ADICIONADA
        />

        <BacklogPromoteActions
          onCancel={handleCancel}
          onPromote={handlePromote}
          isDisabled={isDisabled}                  // ADICIONADA
        />
      </DialogContent>
    </Dialog>
  );
}
