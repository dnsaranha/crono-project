
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListTodo } from "lucide-react";
import { WorkloadOverviewContent } from "./WorkloadOverviewContent";
import { BacklogContent } from "./BacklogContent";

interface WorkloadTabsProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export function WorkloadTabs({ selectedTab, onTabChange }: WorkloadTabsProps) {
  return (
    <Tabs value={selectedTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2 mb-6 touch-manipulation h-[50px]">
        <TabsTrigger value="overview" className="h-full py-3 touch-manipulation">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="hidden xs:inline">Carga de Trabalho</span>
          <span className="xs:hidden">Carga</span>
        </TabsTrigger>
        <TabsTrigger value="backlog" className="h-full py-3 touch-manipulation">
          <ListTodo className="h-4 w-4 mr-2" />
          <span>Backlog</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <WorkloadOverviewContent />
      </TabsContent>
      
      <TabsContent value="backlog" className="space-y-4">
        <BacklogContent />
      </TabsContent>
    </Tabs>
  );
}
