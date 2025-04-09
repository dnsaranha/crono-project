
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
  const [isSaving, setIsSaving] = React.useState(false);
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        onClick={onCancel} 
        className="min-w-24 h-11 touch-manipulation"
      >
        Cancelar
      </Button>
      <Button 
        onClick={handleSave}
        disabled={isSaving}
        className="min-w-24 h-11 touch-manipulation"
      >
        {isSaving ? "Salvando..." : "Salvar"}
      </Button>
    </>
  );
}
