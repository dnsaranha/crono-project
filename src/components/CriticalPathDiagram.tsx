
import { useEffect, useState, useRef, useCallback } from 'react';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Position,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  Panel,
  MarkerType,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TaskType } from './Task';
import { TaskNodeData, TaskNode } from './TaskNode';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedTaskType extends TaskType {
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  float: number;
}

interface ConnectionType {
  source: string;
  target: string;
  isCritical: boolean;
}

interface CriticalPathDiagramProps {
  criticalTasks: EnhancedTaskType[];
  nonCriticalTasks: EnhancedTaskType[];
  connections: ConnectionType[];
  hasEditPermission: boolean;
}

// Define node types for the flow
const nodeTypes = {
  taskNode: TaskNode,
};

export default function CriticalPathDiagram({ 
  criticalTasks, 
  nonCriticalTasks,
  connections,
  hasEditPermission
}: CriticalPathDiagramProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLayouting, setIsLayouting] = useState(true);
  const flowRef = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();

  // Initialize the diagram with tasks and connections
  useEffect(() => {
    if (!criticalTasks || !nonCriticalTasks) return;
    
    setIsLayouting(true);
    
    // Calculate positions - horizontal layout
    const allTasks = [...criticalTasks, ...nonCriticalTasks];
    
    // Group tasks by their early start time for horizontal positioning
    const tasksByEarlyStart: Record<number, EnhancedTaskType[]> = {};
    
    // Manual implementation of groupBy since Object.groupBy might not be available
    allTasks.forEach((task) => {
      const earlyStart = task.earlyStart;
      if (!tasksByEarlyStart[earlyStart]) {
        tasksByEarlyStart[earlyStart] = [];
      }
      tasksByEarlyStart[earlyStart].push(task);
    });
    
    const timeSlots = Object.keys(tasksByEarlyStart).map(Number).sort((a, b) => a - b);
    
    // Calculate spacing
    const horizontalGap = 280; // px between columns
    const verticalGap = 120;   // px between rows
    
    // Create nodes for each task
    const flowNodes: Node[] = [];
    
    // Layout nodes in columns by early start time
    timeSlots.forEach((timeSlot, columnIndex) => {
      const tasksInSlot = tasksByEarlyStart[timeSlot];
      
      tasksInSlot.forEach((task, rowIndex) => {
        const isCritical = criticalTasks.some(t => t.id === task.id);
        
        // Create node data with task information
        const nodeData: TaskNodeData = {
          task: task,
          isCritical,
          earlyStart: task.earlyStart,
          earlyFinish: task.earlyFinish,
          lateStart: task.lateStart,
          lateFinish: task.lateFinish,
          float: task.float,
          hasEditPermission,
        };
        
        // Create the node with explicit type casting
        flowNodes.push({
          id: task.id,
          type: 'taskNode',
          data: nodeData as any,
          position: { 
            x: columnIndex * horizontalGap + 50, 
            y: rowIndex * verticalGap + 50
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        });
      });
    });
    
    // Create edges for connections
    const flowEdges: Edge[] = connections.map((connection) => ({
      id: `e-${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      animated: false,
      style: { 
        stroke: connection.isCritical ? '#ef4444' : '#3b82f6',
        strokeWidth: connection.isCritical ? 3 : 2
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: connection.isCritical ? '#ef4444' : '#3b82f6',
      },
    }));
    
    // Update the flow with nodes and edges
    setNodes(flowNodes);
    setEdges(flowEdges);
    setIsLayouting(false);
  }, [criticalTasks, nonCriticalTasks, connections, hasEditPermission, setNodes, setEdges]);

  // Handle node click to navigate to task edit
  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    if (!hasEditPermission) return;
    
    const taskId = node.id;
    
    // Navigate to the task edit form directly with this task highlighted
    navigate(`../gantt?taskId=${taskId}`);
    
    toast({
      title: "Editar Tarefa",
      description: "Navegando para a edição desta tarefa no gráfico de Gantt.",
    });
  };

  // Function to export diagram as image
  const exportDiagram = async () => {
    if (!flowRef.current) return;
    
    try {
      const element = flowRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2, // Higher resolution
      });
      
      const image = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement('a');
      link.download = 'caminho-critico.png';
      link.href = image;
      link.click();
      
      toast({
        title: "Diagrama Exportado",
        description: "Imagem do caminho crítico salva com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar diagrama:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o diagrama.",
        variant: "destructive",
      });
    }
  };

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.2, 2);
      reactFlowInstance.setViewport({ zoom: newZoom, x: 0, y: 0 });
      return newZoom;
    });
  }, [reactFlowInstance]);
  
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.2, 0.5);
      reactFlowInstance.setViewport({ zoom: newZoom, x: 0, y: 0 });
      return newZoom;
    });
  }, [reactFlowInstance]);

  return (
    <div className="flex flex-col w-full h-full gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
            <span className="text-sm">Tarefa Crítica</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
            <span className="text-sm">Tarefa com Folga</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={handleZoomOut}
              title="Diminuir Zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8"
              onClick={handleZoomIn}
              title="Aumentar Zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportDiagram}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
        </div>
      </div>

      <div ref={flowRef} style={{ width: '100%', height: '500px' }} className="touch-manipulation">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          minZoom={0.1}
          maxZoom={1.5}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScroll={true}
          defaultZoom={zoomLevel}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls showInteractive={false} className="react-flow__controls-mobile" />
          <Panel position="top-left" className="bg-transparent">
            {isLayouting && (
              <div className="text-sm text-muted-foreground">
                Organizando diagrama...
              </div>
            )}
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}
