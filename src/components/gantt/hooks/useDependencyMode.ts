
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
      if (createDependencyMode.sourceId !== taskId) {
        if (onCreateDependency) {
          onCreateDependency(createDependencyMode.sourceId, taskId);
        }
      }
      
      setCreateDependencyMode(null);
    }
  };
  
  return {
    createDependencyMode,
    setCreateDependencyMode,
    handleDependencyStartClick,
    handleDependencyTargetClick
  };
}
