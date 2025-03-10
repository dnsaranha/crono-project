
import { useEffect, useState, useCallback } from "react";
import {
  ReactFlow,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
  Position,
  MarkerType,
  Controls,
  Background,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTasks } from "@/hooks/useTasks";
import { TaskType } from "@/components/Task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";

// Define custom node type for critical path visualization
interface CriticalPathNodeProps {
  data: {
    label: string;
    duration: number;
    isCritical: boolean;
    isMilestone: boolean;
  };
}

const CriticalPathNode = ({ data }: CriticalPathNodeProps) => {
  return (
    <div
      className={`px-4 py-2 rounded-md shadow-md border text-sm font-medium touch-none ${
        data.isCritical
          ? "bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700 dark:text-red-200"
          : data.isMilestone
          ? "bg-purple-100 border-purple-300 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-200"
          : "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200"
      }`}
    >
      <div className="flex flex-col">
        <div className="text-xs sm:text-sm line-clamp-2">{data.label}</div>
        <div className="text-xs mt-1">
          {data.isMilestone ? "Marco" : `${data.duration} dias`}
        </div>
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  criticalPath: CriticalPathNode,
};

interface CriticalPathViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CriticalPathView = ({ open, onOpenChange }: CriticalPathViewProps) => {
  const { tasks } = useTasks();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const reactFlowInstance = useReactFlow();
  const isMobile = useMobile();

  // Find the critical path through the network of tasks
  // This uses a simplified version of the Critical Path Method (CPM)
  const calculateCriticalPath = useCallback((tasksData: TaskType[]) => {
    setLoading(true);
    
    // Create a map for each task for easy lookup
    const taskMap = new Map<string, TaskType & { 
      earliestStart: number; 
      earliestFinish: number; 
      latestStart: number; 
      latestFinish: number; 
      slack: number;
      isCritical: boolean;
    }>();
    
    // Initialize task map with all tasks
    tasksData.forEach(task => {
      taskMap.set(task.id, { 
        ...task, 
        earliestStart: 0, 
        earliestFinish: 0, 
        latestStart: 0, 
        latestFinish: 0, 
        slack: 0,
        isCritical: false
      });
    });
    
    // Find tasks with no dependencies (starting tasks)
    const startTasks = tasksData.filter(task => 
      !tasksData.some(t => t.dependencies?.includes(task.id))
    );
    
    // Find tasks that are not predecessors to any task (ending tasks)
    const endTasks = tasksData.filter(task => 
      !task.dependencies || task.dependencies.length === 0
    );
    
    // Forward pass - calculate earliest start and finish times
    const toVisit = [...startTasks];
    const visited = new Set<string>();
    
    while (toVisit.length > 0) {
      const task = toVisit.shift()!;
      
      if (!visited.has(task.id)) {
        const mappedTask = taskMap.get(task.id)!;
        
        // Check if all dependencies have been visited
        const allDepsVisited = 
          !task.dependencies || 
          task.dependencies.length === 0 || 
          task.dependencies.every(depId => visited.has(depId));
        
        if (allDepsVisited) {
          // Calculate earliest start time based on predecessors
          let earliestStart = 0;
          
          if (task.dependencies && task.dependencies.length > 0) {
            earliestStart = Math.max(
              ...task.dependencies.map(depId => {
                const dep = taskMap.get(depId);
                return dep ? dep.earliestFinish : 0;
              })
            );
          }
          
          mappedTask.earliestStart = earliestStart;
          mappedTask.earliestFinish = earliestStart + (task.duration || 0);
          
          // Mark as visited
          visited.add(task.id);
          
          // Add all tasks that depend on this task to the queue
          const dependents = tasksData.filter(t => 
            t.dependencies && t.dependencies.includes(task.id)
          );
          
          toVisit.push(...dependents);
        } else {
          // Put back in the queue for later processing
          toVisit.push(task);
        }
      }
    }
    
    // Determine the overall project duration
    let projectDuration = 0;
    endTasks.forEach(task => {
      const mappedTask = taskMap.get(task.id);
      if (mappedTask && mappedTask.earliestFinish > projectDuration) {
        projectDuration = mappedTask.earliestFinish;
      }
    });
    
    // Backward pass - calculate latest start and finish times
    tasksData.forEach(task => {
      const mappedTask = taskMap.get(task.id)!;
      
      // For end tasks, latest finish = earliest finish
      if (!tasksData.some(t => t.dependencies?.includes(task.id))) {
        mappedTask.latestFinish = projectDuration;
      } else {
        mappedTask.latestFinish = Number.MAX_SAFE_INTEGER;
      }
    });
    
    // Process tasks in reverse order
    const reverseVisited = new Set<string>();
    const reverseToVisit = [...endTasks];
    
    while (reverseToVisit.length > 0) {
      const task = reverseToVisit.shift()!;
      
      if (!reverseVisited.has(task.id)) {
        const mappedTask = taskMap.get(task.id)!;
        
        // Calculate latest finish based on successors
        const successors = tasksData.filter(t => 
          t.dependencies && t.dependencies.includes(task.id)
        );
        
        if (successors.length > 0) {
          mappedTask.latestFinish = Math.min(
            ...successors.map(succ => {
              const succTask = taskMap.get(succ.id);
              return succTask ? succTask.latestStart : Number.MAX_SAFE_INTEGER;
            })
          );
        }
        
        // Calculate latest start
        mappedTask.latestStart = mappedTask.latestFinish - (task.duration || 0);
        
        // Calculate slack
        mappedTask.slack = mappedTask.latestStart - mappedTask.earliestStart;
        
        // Determine if task is on critical path
        mappedTask.isCritical = mappedTask.slack === 0;
        
        // Mark as visited
        reverseVisited.add(task.id);
        
        // Add all dependencies to the queue
        if (task.dependencies && task.dependencies.length > 0) {
          const dependencies = task.dependencies
            .map(depId => tasksData.find(t => t.id === depId))
            .filter(Boolean) as TaskType[];
          
          reverseToVisit.push(...dependencies);
        }
      }
    }
    
    // Convert to nodes and edges for react-flow
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    
    // Position calculation helpers
    const taskLevels = new Map<string, number>();
    const maxTasksPerLevel: number[] = [];
    
    // Determine task level in the hierarchy
    const calculateTaskLevel = (taskId: string, level: number) => {
      if (!taskLevels.has(taskId) || level > taskLevels.get(taskId)!) {
        taskLevels.set(taskId, level);
      }
      
      // Update count for this level
      maxTasksPerLevel[level] = (maxTasksPerLevel[level] || 0) + 1;
      
      // Get successors and calculate their levels
      const successors = tasksData.filter(t => 
        t.dependencies && t.dependencies.includes(taskId)
      );
      
      successors.forEach(succ => {
        calculateTaskLevel(succ.id, level + 1);
      });
    };
    
    // Calculate levels starting from each start task
    startTasks.forEach(task => {
      calculateTaskLevel(task.id, 0);
    });
    
    // Use horizontal layout on mobile, vertical on desktop
    const direction = isMobile ? 'TB' : 'LR'; // TB = top-to-bottom, LR = left-to-right
    
    // Calculate node positions and create nodes
    tasksData.forEach(task => {
      const mappedTask = taskMap.get(task.id)!;
      const level = taskLevels.get(task.id) || 0;
      
      // Count how many tasks are at this level
      const tasksAtThisLevel = tasksData.filter(t => 
        taskLevels.get(t.id) === level
      ).length;
      
      // Calculate position based on layout direction
      const horizontalSpacing = isMobile ? 150 : 250;
      const verticalSpacing = isMobile ? 180 : 100;
      
      // Find tasks with same level to distribute them vertically/horizontally
      const tasksWithSameLevel = tasksData
        .filter(t => taskLevels.get(t.id) === level)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const index = tasksWithSameLevel.findIndex(t => t.id === task.id);
      
      // Position based on direction
      let x, y;
      let sourcePos, targetPos;
      
      if (direction === 'LR') {
        // Left to right layout
        x = level * horizontalSpacing;
        y = index * verticalSpacing;
        sourcePos = Position.Right;
        targetPos = Position.Left;
      } else {
        // Top to bottom layout
        x = index * horizontalSpacing;
        y = level * verticalSpacing;
        sourcePos = Position.Bottom;
        targetPos = Position.Top;
      }
      
      // Create the node
      flowNodes.push({
        id: task.id,
        type: 'criticalPath',
        position: { x, y },
        data: {
          label: task.name,
          duration: task.duration || 0,
          isCritical: mappedTask.isCritical,
          isMilestone: task.isMilestone || false
        },
        sourcePosition: sourcePos,
        targetPosition: targetPos,
      });
      
      // Create edges for dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          flowEdges.push({
            id: `e-${depId}-${task.id}`,
            source: depId,
            target: task.id,
            type: 'default',
            animated: mappedTask.isCritical,
            style: {
              stroke: mappedTask.isCritical ? '#ef4444' : '#93c5fd',
              strokeWidth: mappedTask.isCritical ? 2 : 1,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: mappedTask.isCritical ? '#ef4444' : '#93c5fd',
            },
          });
        });
      }
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
    setLoading(false);
  }, [isMobile]);

  useEffect(() => {
    if (open && tasks.length > 0) {
      calculateCriticalPath(tasks);
    }
  }, [tasks, open, calculateCriticalPath]);
  
  useEffect(() => {
    // Fit view whenever nodes change or when dialog opens
    if (open && nodes.length > 0 && !loading) {
      // Small delay to ensure the component is rendered
      const timer = setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [nodes, open, loading, reactFlowInstance]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6">
          <DialogTitle className="flex items-center justify-between">
            <span>Análise de Caminho Crítico</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex h-full flex-col space-y-2 p-2 sm:p-4 pt-0">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card>
              <CardHeader className="p-2 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm">Caminho Crítico</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700 rounded"></div>
                  <span className="text-xs">Tarefas críticas</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-2 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm">Marcos</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-100 border border-purple-300 dark:bg-purple-900/30 dark:border-purple-700 rounded"></div>
                  <span className="text-xs">Marcos do projeto</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="p-2 sm:pb-2">
                <CardTitle className="text-xs sm:text-sm">Outras Tarefas</CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded"></div>
                  <span className="text-xs">Tarefas não críticas</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900 rounded-md border relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <span className="mt-2 text-sm">Calculando caminho crítico...</span>
                </div>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.1}
                maxZoom={1.5}
                defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
                attributionPosition="bottom-right"
                proOptions={{ hideAttribution: true }}
              >
                <Background />
                <Controls showInteractive={false} />
                <Panel position="top-right" className="flex space-x-2">
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 bg-background"
                    onClick={() => reactFlowInstance.fitView({ padding: 0.2 })}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="h-8 w-8 bg-background"
                    onClick={() => calculateCriticalPath(tasks)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </Panel>
              </ReactFlow>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CriticalPathView;
