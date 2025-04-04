
import React from 'react';

interface DependencyModeMessageProps {
  isActive: boolean;
}

export const DependencyModeMessage: React.FC<DependencyModeMessageProps> = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-auto z-50 pointer-events-none">
      <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-2 rounded-md shadow-md">
        Clique em uma tarefa para criar dependência
      </div>
    </div>
  );
};
