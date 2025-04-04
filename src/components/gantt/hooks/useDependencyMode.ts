
import { useState } from 'react';

export function useDependencyMode(onCreateDependency?: (sourceId: string, targetId: string) => void) {
  const [createDependencyMode, setCreateDependencyMode] = useState<{active: boolean, sourceId: string} | null>(null);
  
  const handleDependencyStartClick = (taskId: string) => {
    setCreateDependencyMode({
      active: true,
      sourceId: taskId
    });
  };
  
  const handleDependencyTargetClick = (taskId: string) => {
    if (createDependencyMode && createDependencyMode.active) {
      if (createDependencyMode.sourceId !== taskId && onCreateDependency) {
        onCreateDependency(createDependencyMode.sourceId, taskId);
      }
      
      setCreateDependencyMode(null);
    }
  };
  
  const handleGridClick = (e: React.MouseEvent) => {
    // If clicking on the background (not a task) while in dependency mode, cancel it
    if (createDependencyMode && createDependencyMode.active && e.target === e.currentTarget) {
      setCreateDependencyMode(null);
    }
  };
  
  return {
    createDependencyMode,
    setCreateDependencyMode,
    handleDependencyStartClick,
    handleDependencyTargetClick,
    handleGridClick
  };
}
