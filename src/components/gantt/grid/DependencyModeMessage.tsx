
import React from 'react';

interface DependencyModeMessageProps {
  isActive: boolean;
}

export const DependencyModeMessage: React.FC<DependencyModeMessageProps> = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded-lg opacity-90">
        Clique em outra tarefa para criar uma dependência
      </div>
    </div>
  );
};
