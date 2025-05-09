
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { BacklogItem, BacklogManagerProps } from "./backlog/BacklogTypes";
import { BacklogFilters } from "./backlog/BacklogFilters";
import { BacklogItemsTable } from "./backlog/BacklogItemsTable";
import { BacklogEditModal } from "./backlog/BacklogEditModal";
import { BacklogPromoteModal } from "./backlog/BacklogPromoteModal";
import { BacklogHeader } from "./backlog/BacklogHeader";
import { BacklogProvider, useBacklog } from "./backlog/BacklogContext";
import { getStatusInfo, getPriorityInfo, formatDate } from "./backlog/BacklogUtils";

function BacklogContent({ canEdit = true, canDelete = true }: { canEdit?: boolean, canDelete?: boolean }) {
  const { 
    filteredItems, 
    loading, 
    setSelectedItem, 
    setIsEditingDialogOpen, 
    setIsPromotingDialogOpen, 
    deleteBacklogItem,
    getProjectName,
    filterStatus, 
    setFilterStatus,
    sortField,
    sortDirection,
    setSortField,
    setSortDirection,
    searchQuery,
    setSearchQuery,
    loadBacklogItems,
    selectedItem,
    updateBacklogItem,
    isEditingDialogOpen,
    isPromotingDialogOpen,
    setIsCreatingDialogOpen,
    promoteToTask,
    projects
  } = useBacklog();
  
  const { isMobile } = useMobile();

  return (
    <>
      <BacklogHeader isMobile={isMobile} canCreate={canEdit} />
      
      <CardContent>
        <BacklogFilters
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortField={sortField}
          sortDirection={sortDirection}
          setSortField={setSortField}
          setSortDirection={setSortDirection}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loadBacklogItems={loadBacklogItems}
        />
        
        <BacklogItemsTable
          filteredItems={filteredItems}
          loading={loading}
          getPriorityInfo={getPriorityInfo}
          getStatusInfo={getStatusInfo}
          formatDate={formatDate}
          getProjectName={getProjectName}
          setSelectedItem={setSelectedItem}
          setIsEditingDialogOpen={setIsEditingDialogOpen}
          setIsPromotingDialogOpen={setIsPromotingDialogOpen}
          deleteBacklogItem={deleteBacklogItem}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </CardContent>
      
      {/* Edit Modal */}
      <BacklogEditModal
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isOpen={isEditingDialogOpen}
        setIsOpen={setIsEditingDialogOpen}
        updateBacklogItem={updateBacklogItem}
        isMobile={isMobile}
      />
      
      {/* Promote Modal */}
      <BacklogPromoteModal
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isOpen={isPromotingDialogOpen}
        setIsOpen={setIsPromotingDialogOpen}
        promoteToTask={promoteToTask}
        projects={projects}
        getPriorityInfo={getPriorityInfo}
        isMobile={isMobile}
      />
    </>
  );
}

export function BacklogManager({ 
  projects, 
  onItemConverted,
  canCreate = true,
  canEdit = true, 
  canDelete = true 
}: BacklogManagerProps) {
  return (
    <div className="space-y-6">
      <Card>
        <BacklogProvider projects={projects} onItemConverted={onItemConverted}>
          <BacklogContent canEdit={canEdit} canDelete={canDelete} />
        </BacklogProvider>
      </Card>
    </div>
  );
}
