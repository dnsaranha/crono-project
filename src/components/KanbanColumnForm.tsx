import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface KanbanColumnFormProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  existingColumns: string[];
  onAddColumn?: (columnName: string) => void;
}

const KanbanColumnForm = ({ open, onOpenChange, onAddColumn, existingColumns }: KanbanColumnFormProps) => {
  const [columnName, setColumnName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate column name
    if (!columnName.trim()) {
      setError("O nome da coluna é obrigatório");
      return;
    }
    
    // Check if column already exists
    if (existingColumns.includes(columnName.trim())) {
      setError("Esta coluna já existe");
      return;
    }
    
    // Add column
    if (onAddColumn) {
      onAddColumn(columnName.trim());
    }
    
    // Reset form
    setColumnName("");
    setError("");
    onOpenChange(false);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Adicionar Nova Coluna</DialogTitle>
        <DialogDescription>
          Crie uma nova coluna para organizar suas tarefas
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="columnName" className="text-right">
              Nome
            </Label>
            <Input
              id="columnName"
              value={columnName}
              onChange={(e) => {
                setColumnName(e.target.value);
                setError("");
              }}
              className="col-span-3"
              placeholder="Ex: Em Revisão"
            />
          </div>
          
          {error && (
            <div className="text-sm text-red-500 pl-[calc(25%+16px)]">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setColumnName("");
              setError("");
              onOpenChange(false);
            }}
          >
            Cancelar
          </Button>
          <Button type="submit">Adicionar</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default KanbanColumnForm;
