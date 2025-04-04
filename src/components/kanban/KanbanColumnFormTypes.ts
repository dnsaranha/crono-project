
export interface KanbanColumnFormProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  onAddColumn: (columnName: string) => void;
  existingColumns: string[];
}
