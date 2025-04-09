
import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/use-media-query";

interface WorkloadHeaderProps {
  title: string;
  description: string;
  itemCount: number;
  itemLabel: string;
  children?: React.ReactNode;
}

export function WorkloadHeader({ 
  title,
  description,
  itemCount,
  itemLabel,
  children 
}: WorkloadHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  return (
    <>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>

      <div className="flex justify-between items-center px-6 mb-4">
        <Badge variant="outline">
          {itemCount} {itemCount === 1 ? itemLabel : `${itemLabel}s`}
        </Badge>
        
        {children}
      </div>
    </>
  );
}
