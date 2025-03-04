
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const TimelineView = () => {
  const { toast } = useToast();
  
  const timelineItems = [
    {
      id: "1",
      title: "Planejamento",
      date: "Janeiro 2024",
      description: "Fase inicial do projeto onde são definidos escopo, requisitos e cronograma.",
      status: "Concluído"
    },
    {
      id: "2",
      title: "Desenvolvimento",
      date: "Fevereiro - Março 2024",
      description: "Implementação do frontend, backend e banco de dados do projeto.",
      status: "Em Andamento"
    },
    {
      id: "3",
      title: "Testes",
      date: "Abril 2024",
      description: "Execução de testes unitários, de integração e de aceitação.",
      status: "Pendente"
    }
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
          <h1 className="text-2xl font-semibold">Linha do Tempo</h1>
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white font-medium"
            onClick={handleAction}
          >
            <span className="mr-1">+</span> Nova Tarefa
          </Button>
        </div>
        
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Timeline items */}
          <div className="space-y-8">
            {timelineItems.map((item, index) => (
              <div key={item.id} className="relative animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
                {/* Timeline dot */}
                <div className={`absolute left-6 top-8 w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10
                  ${item.status === 'Concluído' ? 'bg-green-500' : 
                    item.status === 'Em Andamento' ? 'bg-blue-500' : 'bg-gray-400'}`}
                ></div>
                
                {/* Content card */}
                <Card className="ml-12 shadow-sm hover:shadow transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 mb-3">{item.date}</p>
                        <p className="text-gray-700">{item.description}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium
                        ${item.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                          item.status === 'Em Andamento' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {item.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TimelineView;
