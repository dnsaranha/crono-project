
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Position,
  MarkerType,
  Controls,
  Background,
  Panel,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useTasks } from "@/hooks/useTasks";
import { TaskType } from "@/components/Task";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

const nodeTypes = {
  criticalPath: CriticalPathNode,
};

interface CriticalPathViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Internal component wrapped with ReactFlowProvider
const CriticalPathFlowContent = ({ tasks, loading, calculateCriticalPath }: { 
  tasks: TaskType[], 
  loading: boolean,
  calculateCriticalPath: (tasks: TaskType[]) => void 
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (tasks.length > 0 && !loading) {
      calculateCriticalPathInternal(tasks);
    }
  }, [tasks, loading]);
  
  const calculateCriticalPathInternal = useCallback((tasksData: TaskType[]) => {
    // Skip calculation if there are no tasks
    if (tasksData.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Use only tasks that aren't groups for critical path calculation
    const workTasks = tasksData.filter(task => !task.isGroup);
    
    // Create a map of tasks with critical path calculations
    const taskMap = new Map<string, TaskType & { 
      earliestStart: number; 
      earliestFinish: number; 
      latestStart: number; 
      latestFinish: number; 
      slack: number;
      isCritical: boolean;
    }>();
    
    // Initialize the task map
    workTasks.forEach(task => {
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
    
    // Find start tasks (no dependencies) and end tasks (no successors)
    const startTasks = workTasks.filter(task => 
      !workTasks.some(t => t.dependencies?.includes(task.id))
    );
    
    const endTasks = workTasks.filter(task => 
      !task.dependencies || task.dependencies.length === 0 ||
      !task.dependencies.some(depId => 
        workTasks.some(t => t.id === depId)
      )
    );
    
    // Forward pass - calculate earliest start and finish times
    const toVisit = [...startTasks];
    const visited = new Set<string>();
    
    while (toVisit.length > 0) {
      const task = toVisit.shift()!;
      
      if (!visited.has(task.id)) {
        const mappedTask = taskMap.get(task.id)!;
        
        const allDepsVisited = 
          !task.dependencies || 
          task.dependencies.length === 0 || 
          task.dependencies.every(depId => visited.has(depId) || !workTasks.some(t => t.id === depId));
        
        if (allDepsVisited) {
          let earliestStart = 0;
          
          if (task.dependencies && task.dependencies.length > 0) {
            earliestStart = Math.max(
              ...task.dependencies
                .filter(depId => workTasks.some(t => t.id === depId))
                .map(depId => {
                  const dep = taskMap.get(depId);
                  return dep ? dep.earliestFinish : 0;
                })
            );
          }
          
          mappedTask.earliestStart = earliestStart;
          mappedTask.earliestFinish = earliestStart + (task.duration || 0);
          
          visited.add(task.id);
          
          const dependents = workTasks.filter(t => 
            t.dependencies && t.dependencies.includes(task.id)
          );
          
          toVisit.push(...dependents);
        } else {
          // Add back to the end of the queue
          toVisit.push(task);
        }
      }
    }
    
    // Find the project duration
    let projectDuration = 0;
    endTasks.forEach(task => {
      const mappedTask = taskMap.get(task.id);
      if (mappedTask && mappedTask.earliestFinish > projectDuration) {
        projectDuration = mappedTask.earliestFinish;
      }
    });
    
    // Backward pass - calculate latest start and finish times
    workTasks.forEach(task => {
      const mappedTask = taskMap.get(task.id)!;
      
      if (!workTasks.some(t => t.dependencies?.includes(task.id))) {
        mappedTask.latestFinish = projectDuration;
        mappedTask.latestStart = mappedTask.latestFinish - (task.duration || 0);
      } else {
        mappedTask.latestFinish = Number.MAX_SAFE_INTEGER;
      }
    });
    
    const reverseVisited = new Set<string>();
    const reverseToVisit = [...endTasks];
    
    while (reverseToVisit.length > 0) {
      const task = reverseToVisit.shift()!;
      
      if (!reverseVisited.has(task.id)) {
        const mappedTask = taskMap.get(task.id)!;
        
        const successors = workTasks.filter(t => 
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
        
        mappedTask.latestStart = mappedTask.latestFinish - (task.duration || 0);
        mappedTask.slack = mappedTask.latestStart - mappedTask.earliestStart;
        mappedTask.isCritical = mappedTask.slack === 0;
        
        reverseVisited.add(task.id);
        
        if (task.dependencies && task.dependencies.length > 0) {
          const dependencies = task.dependencies
            .filter(depId => workTasks.some(t => t.id === depId))
            .map(depId => workTasks.find(t => t.id === depId))
            .filter(Boolean) as TaskType[];
          
          reverseToVisit.push(...dependencies);
        }
      }
    }
    
    // Create nodes and edges for ReactFlow
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];
    
    // Calculate levels for each task (for layout)
    const taskLevels = new Map<string, number>();
    const maxTasksPerLevel: number[] = [];
    
    const calculateTaskLevel = (taskId: string, level: number, visited = new Set<string>()) => {
      if (visited.has(taskId)) return; // Prevent cycles
      visited.add(taskId);
      
      if (!taskLevels.has(taskId) || level > taskLevels.get(taskId)!) {
        taskLevels.set(taskId, level);
      }
      
      maxTasksPerLevel[level] = (maxTasksPerLevel[level] || 0) + 1;
      
      const successors = workTasks.filter(t => 
        t.dependencies && t.dependencies.includes(taskId)
      );
      
      successors.forEach(succ => {
        calculateTaskLevel(succ.id, level + 1, new Set(visited));
      });
    };
    
    startTasks.forEach(task => {
      calculateTaskLevel(task.id, 0);
    });
    
    // Use horizontal layout for desktops, vertical for mobile
    const direction = isMobile ? 'TB' : 'LR';
    
    // Create ReactFlow nodes and edges
    workTasks.forEach(task => {
      const mappedTask = taskMap.get(task.id)!;
      const level = taskLevels.get(task.id) || 0;
      
      const horizontalSpacing = isMobile ? 150 : 250;
      const verticalSpacing = isMobile ? 180 : 100;
      
      const tasksWithSameLevel = workTasks
        .filter(t => taskLevels.get(t.id) === level)
        .sort((a, b) => a.name.localeCompare(b.name));
      
      const index = tasksWithSameLevel.findIndex(t => t.id === task.id);
      
      let x, y;
      let sourcePos, targetPos;
      
      if (direction === 'LR') {
        x = level * horizontalSpacing;
        y = index * verticalSpacing;
        sourcePos = Position.Right;
        targetPos = Position.Left;
      } else {
        x = index * horizontalSpacing;
        y = level * verticalSpacing;
        sourcePos = Position.Bottom;
        targetPos = Position.Top;
      }
      
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
      
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies
          .filter(depId => workTasks.some(t => t.id === depId))
          .forEach(depId => {
            const depTask = taskMap.get(depId);
            if (!depTask) return;
            
            flowEdges.push({
              id: `e-${depId}-${task.id}`,
              source: depId,
              target: task.id,
              type: 'default',
              animated: mappedTask.isCritical && depTask.isCritical,
              style: {
                stroke: mappedTask.isCritical && depTask.isCritical ? '#ef4444' : '#93c5fd',
                strokeWidth: mappedTask.isCritical && depTask.isCritical ? 2 : 1,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: mappedTask.isCritical && depTask.isCritical ? '#ef4444' : '#93c5fd',
              },
            });
          });
      }
    });
    
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [isMobile]);

  // Handle empty tasks case
  const emptyMessage = useMemo(() => {
    if (loading) return null;
    if (tasks.length === 0) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <p>Não há tarefas para calcular o caminho crítico.</p>
          </div>
        </div>
      );
    }
    return null;
  }, [tasks, loading]);

  // Logic for fit view
  const onInit = (reactFlowInstance: any) => {
    setTimeout(() => {
      reactFlowInstance.fitView({ padding: 0.2 });
    }, 100);
  };

  return (
    <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-900 rounded-md border relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            <span className="mt-2 text-sm">Calculando caminho crítico...</span>
          </div>
        </div>
      ) : (
        <>
          {emptyMessage}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.1}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            attributionPosition="bottom-right"
            proOptions={{ hideAttribution: true }}
            onInit={onInit}
            className="touch-auto"
          >
            <Background />
            <Controls showInteractive={false} />
            <Panel position="top-right" className="flex space-x-2">
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8 bg-background"
                onClick={() => calculateCriticalPath(tasks)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8 bg-background"
                onClick={(reactFlowInstance) => {
                  // @ts-ignore This is expected to be called by ReactFlow
                  if (reactFlowInstance && reactFlowInstance.zoomOut) {
                    // @ts-ignore This is expected to be called by ReactFlow
                    reactFlowInstance.zoomOut();
                  }
                }}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                size="icon" 
                variant="outline" 
                className="h-8 w-8 bg-background"
                onClick={(reactFlowInstance) => {
                  // @ts-ignore This is expected to be called by ReactFlow
                  if (reactFlowInstance && reactFlowInstance.zoomIn) {
                    // @ts-ignore This is expected to be called by ReactFlow
                    reactFlowInstance.zoomIn();
                  }
                }}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </Panel>
          </ReactFlow>
        </>
      )}
    </div>
  );
};

const CriticalPathView = ({ open, onOpenChange }: CriticalPathViewProps) => {
  const { tasks } = useTasks();
  const [loading, setLoading] = useState(true);
  
  const calculateCriticalPath = useCallback((tasksData: TaskType[]) => {
    setLoading(true);
    // Shorter loading time to improve responsiveness
    setTimeout(() => {
      setLoading(false);
    }, 100);
  }, []);

  useEffect(() => {
    if (open) {
      calculateCriticalPath(tasks);
    }
  }, [open, tasks, calculateCriticalPath]);

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
          
          {/* Wrap the ReactFlow in ReactFlowProvider */}
          <ReactFlowProvider>
            <CriticalPathFlowContent 
              tasks={tasks} 
              loading={loading} 
              calculateCriticalPath={calculateCriticalPath}
            />
          </ReactFlowProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CriticalPathView;
