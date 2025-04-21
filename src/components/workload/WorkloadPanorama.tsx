
import React from "react";

/**
 * Props esperadas:
 * members: array de objetos { id, nome, avatarUrl, totalTarefas }
 */
interface WorkloadPanoramaProps {
  members: {
    id: string;
    name: string;
    avatarUrl?: string;
    workload: number;
  }[];
}

export function WorkloadPanorama({ members }: WorkloadPanoramaProps) {
  return (
    <div className="flex flex-col gap-2 w-full px-2 py-3 md:gap-4 md:px-4">
      {members?.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          Nenhum membro atribuído a tarefas no momento.
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {members.map(({ id, name, avatarUrl, workload }) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-xl bg-muted/40 border p-3 min-w-0 touch-manipulation"
          >
            <img
              src={avatarUrl ?? '/placeholder.svg'}
              alt={name}
              className="w-10 h-10 rounded-full border object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{name}</div>
              <div className="text-xs text-muted-foreground">
                {workload} tarefa{workload !== 1 ? 's' : ''}
              </div>
            </div>
            <div
              className={`ml-auto flex items-center justify-center rounded-lg text-xs px-2 py-1 font-bold bg-primary/10 text-primary`}
              style={{ minWidth: 38 }}
            >
              {workload}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorkloadPanorama;
