
import React from 'react';
import { Button } from "@/components/ui/button";

interface BacklogPromoteActionsProps {
  onCancel: () => void;
  onPromote: () => Promise<void>;
  isDisabled?: boolean;
}

export function BacklogPromoteActions({
  onCancel,
  onPromote,
  isDisabled = false
}: BacklogPromoteActionsProps) {
  return (
    <>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button 
        onClick={onPromote}
        disabled={isDisabled}
      >
        Converter para Tarefa
      </Button>
    </>
  );
}
