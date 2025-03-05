
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ViewHeaderProps {
  title: string;
  onAddItem: () => void;
  buttonText?: string;
}

const ViewHeader = ({ title, onAddItem, buttonText = "Nova Tarefa" }: ViewHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Button 
        size="sm"
        className="bg-primary hover:bg-primary/90 text-white font-medium"
        onClick={onAddItem}
      >
        <Plus className="h-4 w-4 mr-1" />
        {buttonText}
      </Button>
    </div>
  );
};

export default ViewHeader;
