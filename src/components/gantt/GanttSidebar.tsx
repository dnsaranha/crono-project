
import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskType } from '../task';

interface GanttSidebarProps {
  visibleTasks: TaskType[];
  expandedGroups: Record<string, boolean>;
  toggleGroup: (taskId: string) => void;
  handleTaskDragOver: (e: React.DragEvent, task: TaskType) => void;
  handleTaskDragLeave: () => void;
  dragOverTask?: TaskType | null;
  dragOverPosition?: 'above' | 'below' | null;
  handleDependencyStartClick: (taskId: string) => void;
  createDependencyMode: {active: boolean, sourceId: string} | null;
  hasEditPermission: boolean;
  sidebarVisible?: boolean;
  handleTaskClick?: (task: TaskType) => void;
}

const GanttSidebar: React.FC<GanttSidebarProps> = ({
  visibleTasks,
  expandedGroups,
  toggleGroup,
  handleTaskDragOver,
  handleTaskDragLeave,
  dragOverTask,
  dragOverPosition,
  handleDependencyStartClick,
  createDependencyMode,
  hasEditPermission,
  sidebarVisible = true,
  handleTaskClick
}) => {
  if (!sidebarVisible) return null;
  
  return (
    <div className="min-w-48 w-48 border-r bg-card flex-shrink-0 sm:min-w-64 sm:w-64">
      <div className="h-24 px-4 flex items-end border-b">
        <div className="text-sm font-medium text-muted-foreground pb-2">Nome da Tarefa</div>
      </div>
      
      <div>
        {visibleTasks.map((task, rowIndex) => (
          <div 
            key={task.id} 
            className={`h-10 flex items-center px-2 sm:px-4 border-b ${
              task.isGroup ? 'bg-gantt-gray' : 'bg-card'
            } ${
              dragOverTask?.id === task.id && dragOverPosition === 'above' 
                ? 'border-t-2 border-t-primary' 
                : dragOverTask?.id === task.id && dragOverPosition === 'below'
                ? 'border-b-2 border-b-primary'
                : ''
            }`}
            onDragOver={(e) => hasEditPermission ? handleTaskDragOver(e, task) : null}
            onDragLeave={handleTaskDragLeave}
            onClick={() => handleTaskClick && handleTaskClick(task)}
          >
            <div className="flex items-center w-full">
              <div className="w-5 flex-shrink-0">
                {task.isGroup && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(task.id);
                    }}
                  >
                    {expandedGroups[task.id] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
              <div 
                className={`ml-1 text-xs sm:text-sm truncate flex-1 ${task.isGroup ? 'font-medium' : ''}`}
                style={{ paddingLeft: task.parentId ? '12px' : '0px' }}
              >
                {task.name}
              </div>
              
              {!task.isGroup && hasEditPermission && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 w-6 p-0 rounded-full ${createDependencyMode?.sourceId === task.id ? 'bg-yellow-200' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDependencyStartClick(task.id);
                  }}
                  title="Criar dependência a partir desta tarefa"
                >
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttSidebar;
