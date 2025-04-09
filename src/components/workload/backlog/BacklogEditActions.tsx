
import React from 'react';
import { Button } from "@/components/ui/button";

interface BacklogEditActionsProps {
  onCancel: () => void;
  onSave: () => Promise<void>;
  disabled?: boolean;
}

export function BacklogEditActions({ 
  onCancel, 
  onSave,
  disabled = false 
}: BacklogEditActionsProps) {
  return (
    <>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave} disabled={disabled}>
        Salvar
      </Button>
    </>
  );
}
