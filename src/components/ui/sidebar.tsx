import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown } from "lucide-react";

interface SidebarProps {
  className?: string;
  children?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  title?: string;
  footer?: React.ReactNode;
  isMobile?: boolean;
}

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function Sidebar({
  className,
  children,
  collapsible = false,
  defaultCollapsed = false,
  title,
  footer,
  isMobile
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  if (collapsible) {
    return (
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
        className={cn(
          "flex flex-col border-r bg-card",
          isCollapsed ? "w-12" : "w-64",
          className
        )}
      >
        {title && (
          <div className="flex h-14 items-center border-b px-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <ChevronRight className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="font-semibold">{title}</div>
            </CollapsibleContent>
          </div>
        )}
        <ScrollArea className="flex-1">
          <CollapsibleContent className="flex flex-col gap-1 p-2">
            {children}
          </CollapsibleContent>
          {isCollapsed && (
            <div className="flex flex-col items-center py-2">
              {/* Collapsed icons would go here */}
            </div>
          )}
        </ScrollArea>
        {footer && (
          <CollapsibleContent>
            <div className="border-t p-2">{footer}</div>
          </CollapsibleContent>
        )}
      </Collapsible>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card w-64",
        className
      )}
    >
      {title && (
        <div className="flex h-14 items-center border-b px-4">
          <div className="font-semibold">{title}</div>
        </div>
      )}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">{children}</div>
      </ScrollArea>
      {footer && <div className="border-t p-2">{footer}</div>}
    </div>
  );
}

export function SidebarSection({
  title,
  children,
  defaultOpen = true,
  className
}: SidebarSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className={cn("mb-2", className)}>
      <div 
        className="flex items-center justify-between px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>{title}</div>
        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
      {isOpen && <div className="mt-1">{children}</div>}
    </div>
  );
}

export function SidebarItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
