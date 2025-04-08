
import React, { useState } from "react";
import { WorkloadDashboardProvider } from "@/contexts/WorkloadDashboardContext";
import { WorkloadTabs } from "@/components/workload/WorkloadTabs";

export default function WorkloadDashboardView() {
  const [selectedTab, setSelectedTab] = useState("overview");

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      <div className="flex flex-col">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Visão Panorâmica</h2>

        <WorkloadDashboardProvider>
          <WorkloadTabs 
            selectedTab={selectedTab} 
            onTabChange={setSelectedTab} 
          />
        </WorkloadDashboardProvider>
      </div>
    </div>
  );
}
