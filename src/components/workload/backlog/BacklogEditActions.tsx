
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
    <div className="flex flex-wrap gap-2 w-full justify-end">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="w-full sm:w-auto mb-2 sm:mb-0"
      >
        Cancelar
      </Button>
      <Button 
        onClick={onSave} 
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        Salvar
      </Button>
    </div>
  );
}
