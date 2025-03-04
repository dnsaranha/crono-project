
import Navbar from "@/components/Navbar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const GridView = () => {
  const { toast } = useToast();
  
  const tasks = [
    {
      id: "task-1",
      name: "Planejamento",
      startDate: "01/01/2024",
      duration: "30 dias",
      endDate: "31/01/2024",
      progress: 100,
      responsible: "Ana Silva"
    },
    {
      id: "task-1-1",
      name: "Definir Escopo",
      startDate: "01/01/2024",
      duration: "10 dias",
      endDate: "10/01/2024",
      progress: 100,
      responsible: "João Santos"
    },
    {
      id: "task-1-2",
      name: "Análise de Requisitos",
      startDate: "11/01/2024",
      duration: "10 dias",
      endDate: "20/01/2024",
      progress: 100,
      responsible: "Carla Ferreira"
    },
    {
      id: "task-2",
      name: "Desenvolvimento",
      startDate: "01/02/2024",
      duration: "60 dias",
      endDate: "31/03/2024",
      progress: 60,
      responsible: "Rafael Costa"
    },
    {
      id: "task-3",
      name: "Testes",
      startDate: "01/04/2024",
      duration: "30 dias",
      endDate: "30/04/2024",
      progress: 0,
      responsible: "Mariana Oliveira"
    },
  ];

  const handleAction = () => {
    toast({
      title: "Ação",
      description: "Esta funcionalidade será implementada em breve."
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 overflow-auto p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Grade de Tarefas</h1>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white font-medium"
            onClick={handleAction}
          >
            <span className="mr-1">+</span> Nova Tarefa
          </Button>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome da Tarefa</TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Data de Início
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Duração
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">Data de Fim</TableHead>
                <TableHead className="w-[150px]">Progresso</TableHead>
                <TableHead className="w-[150px]">Responsável</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{task.startDate}</TableCell>
                  <TableCell>{task.duration}</TableCell>
                  <TableCell>{task.endDate}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gantt-blue h-2.5 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{task.progress}%</div>
                  </TableCell>
                  <TableCell>{task.responsible}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={handleAction}>
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default GridView;
