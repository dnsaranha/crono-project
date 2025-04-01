
import { Handle, Position } from '@xyflow/react';
import { TaskType } from './Task';
import { Edit, Save, X, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export interface TaskNodeData {
  task: TaskType;
  isCritical: boolean;
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  float: number;
  hasEditPermission: boolean;
  isEditing?: boolean;
  onStartEdit?: (taskId: string) => void;
  onCancelEdit?: () => void;
  onUpdateDependency?: (taskId: string, dependencyId: string, action: 'add' | 'remove') => void;
  allTasks?: TaskType[];
}

export function TaskNode({ data }: { data: TaskNodeData }) {
  const {
    task,
    isCritical,
    earlyStart,
    earlyFinish,
    lateStart,
    lateFinish, 
    float,
    hasEditPermission,
    isEditing,
    onStartEdit,
    onCancelEdit,
    onUpdateDependency,
    allTasks = []
  } = data;
  
  const [newDependency, setNewDependency] = useState<string>('');
  
  const bgColor = isCritical ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30';
  const borderColor = isCritical ? 'border-red-500' : 'border-blue-500';
  const textColor = isCritical ? 'text-red-800 dark:text-red-300' : 'text-blue-800 dark:text-blue-300';
  
  const handleAddDependency = () => {
    if (newDependency && onUpdateDependency) {
      onUpdateDependency(task.id, newDependency, 'add');
      setNewDependency('');
    }
  };
  
  const handleRemoveDependency = (dependencyId: string) => {
    if (onUpdateDependency) {
      onUpdateDependency(task.id, dependencyId, 'remove');
    }
  };
  
  return (
    <div className={`px-4 py-3 shadow-md rounded-md min-w-[200px] border-2 ${borderColor} ${bgColor}`}>
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        className={`w-3 h-3 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
      />
      
      <div className="flex justify-between items-start">
        <div className={`font-bold ${textColor} text-sm`}>{task.name}</div>
        
        {hasEditPermission && !isEditing && onStartEdit && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 -mt-1 -mr-1" 
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(task.id);
            }}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
        
        {isEditing && onCancelEdit && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5 -mt-1 -mr-1" 
            onClick={(e) => {
              e.stopPropagation();
              onCancelEdit();
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      
      <div className="flex mt-2 gap-x-4 text-xs">
        <div>
          <div className="text-muted-foreground">Duração</div>
          <div className="font-medium">{task.duration} dias</div>
        </div>
        
        <div>
          <div className="text-muted-foreground">Folga</div>
          <div className="font-medium">{float} dias</div>
        </div>
      </div>
      
      {isEditing && (
        <div className="mt-3 border-t pt-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="font-medium text-xs mb-1">Dependências</div>
          
          {task.dependencies && task.dependencies.length > 0 ? (
            <ul className="space-y-1 mb-2">
              {task.dependencies.map(depId => {
                const depTask = allTasks.find(t => t.id === depId) || { name: 'Tarefa desconhecida' };
                return (
                  <li key={depId} className="flex items-center justify-between text-xs">
                    <span className="truncate">{depTask.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5" 
                      onClick={() => handleRemoveDependency(depId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-xs text-muted-foreground mb-2">Sem dependências</div>
          )}
          
          <div className="flex items-center gap-1 mt-2">
            <Select value={newDependency} onValueChange={setNewDependency}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Adicionar dependência" />
              </SelectTrigger>
              <SelectContent>
                {allTasks
                  .filter(t => !task.dependencies?.includes(t.id))
                  .map(t => (
                    <SelectItem key={t.id} value={t.id} className="text-xs">
                      {t.name}
                    </SelectItem>
                  ))
                }
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="h-7 w-7" 
              onClick={handleAddDependency}
              disabled={!newDependency}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
      
      <Handle
        type="source"
        position={Position.Right}
        id="out"
        className={`w-3 h-3 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
      />
    </div>
  );
}
