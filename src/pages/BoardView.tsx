
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: TaskItem[];
}

const BoardView = () => {
  const { toast } = useToast();
  
  const [columns, setColumns] = useState<Column[]>([
    {
      id: "todo",
      title: "A Fazer",
      tasks: [
        {
          id: "task-1",
          title: "Definir Escopo",
          description: "Delimitar o escopo do projeto e definir objetivos",
          priority: "high",
          assignee: "Ana Silva"
        },
        {
          id: "task-2",
          title: "Análise de Requisitos",
          description: "Identificar e analisar os requisitos do sistema",
          priority: "medium",
          assignee: "João Santos"
        }
      ]
    },
    {
      id: "in-progress",
      title: "Em Progresso",
      tasks: [
        {
          id: "task-3",
          title: "Desenvolvimento Frontend",
          description: "Implementar interface do usuário",
          priority: "high",
          assignee: "Rafael Costa"
        },
        {
          id: "task-4",
          title: "Desenvolvimento Backend",
          description: "Desenvolver API e lógica do servidor",
          priority: "high",
          assignee: "Carla Ferreira"
        }
      ]
    },
    {
      id: "done",
      title: "Concluído",
      tasks: [
        {
          id: "task-5",
          title: "Planejamento",
          description: "Planejar a estrutura e fases do projeto",
          priority: "medium",
          assignee: "Equipe"
        }
      ]
    }
  ]);
  
  const handleAddTask = () => {
    toast({
      title: "Adicionar tarefa",
      description: "Esta funcionalidade será implementada em breve."
    });
  };
  
  const handleAddColumn = () => {
    toast({
      title: "Adicionar coluna",
      description: "Esta funcionalidade será implementada em breve."
    });
  };
  
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return "bg-red-100 text-red-800";
      case 'medium':
        return "bg-yellow-100 text-yellow-800";
      case 'low':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 overflow-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Quadro de Tarefas</h1>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleAddColumn}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Coluna
            </Button>
            <Button 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-medium"
              onClick={handleAddTask}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nova Tarefa
            </Button>
          </div>
        </div>
        
        <div className="flex gap-6 h-[calc(100vh-160px)] pb-6 overflow-x-auto">
          {columns.map((column) => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
                <div className="px-4 py-3 border-b">
                  <h3 className="font-medium">{column.title} ({column.tasks.length})</h3>
                </div>
                
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {column.tasks.map((task) => (
                    <Card key={task.id} className="shadow-sm hover:shadow-md transition-shadow animate-task-appear">
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-base font-medium">{task.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        {task.description && (
                          <p className="text-sm text-gray-500 mb-3">{task.description}</p>
                        )}
                        <div className="flex justify-between items-center">
                          {task.assignee && (
                            <div className="text-xs text-gray-600">
                              {task.assignee}
                            </div>
                          )}
                          <div className={cn(
                            "ml-auto px-2 py-0.5 rounded text-xs font-medium",
                            getPriorityStyles(task.priority)
                          )}>
                            {task.priority === 'high' ? 'Alta' : 
                             task.priority === 'medium' ? 'Média' : 'Baixa'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Separator />
                <div className="p-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-gray-500 hover:text-gray-900"
                    onClick={handleAddTask}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar tarefa
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex-shrink-0 w-80 bg-gray-100 bg-opacity-60 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
            <Button 
              variant="ghost" 
              className="text-gray-500"
              onClick={handleAddColumn}
            >
              <Plus className="h-5 w-5 mr-1" />
              Adicionar Coluna
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BoardView;
