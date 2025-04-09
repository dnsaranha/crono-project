
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BacklogCreateDialog } from "./BacklogCreateDialog";
import { useBacklog } from "./BacklogContext";

interface BacklogHeaderProps {
  isMobile: boolean;
  canCreate?: boolean;
}

export function BacklogHeader({ isMobile, canCreate = true }: BacklogHeaderProps) {
  const { filteredItems } = useBacklog();

  return (
    <>
      <CardHeader>
        <CardTitle>Gerenciador de Backlog</CardTitle>
        <CardDescription>
          Gerencie ideias e atividades que podem se transformar em tarefas de projeto
        </CardDescription>
      </CardHeader>

      <div className="flex justify-between items-center px-6 mb-4">
        <Badge variant="outline">
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'itens'}
        </Badge>
        
        {canCreate && <BacklogCreateDialog isMobile={isMobile} />}
      </div>
    </>
  );
}
