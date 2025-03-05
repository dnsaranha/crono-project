
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyTaskStateProps {
  onAddTask: () => void;
}

const EmptyTaskState = ({ onAddTask }: EmptyTaskStateProps) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-8 text-center">
      <p className="text-gray-500 mb-4">Nenhuma tarefa encontrada para este projeto</p>
      <Button 
        onClick={onAddTask}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        <Plus className="h-4 w-4 mr-1" />
        Adicionar primeira tarefa
      </Button>
    </div>
  );
};

export default EmptyTaskState;
