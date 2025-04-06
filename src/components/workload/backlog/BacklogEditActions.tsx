
import React from 'react';
import { Button } from "@/components/ui/button";

interface BacklogEditActionsProps {
  onCancel: () => void;
  onSave: () => Promise<void>;
}

export function BacklogEditActions({
  onCancel,
  onSave
}: BacklogEditActionsProps) {
  return (
    <>
      <Button variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button onClick={onSave}>
        Salvar
      </Button>
    </>
  );
}
