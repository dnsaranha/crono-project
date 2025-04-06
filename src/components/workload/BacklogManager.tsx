import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useMobile } from "@/hooks/use-mobile";
import { BacklogItem, BacklogManagerProps } from "./BacklogTypes";
import { BacklogFilters } from "./BacklogFilters";
import { BacklogItemsTable } from "./BacklogItemsTable";
import { BacklogEditModal } from "./BacklogEditModal";
import { BacklogPromoteModal } from "./BacklogPromoteModal";
import { BacklogHeader } from "./BacklogHeader";
import { BacklogProvider, useBacklog } from "./BacklogContext";
import { getStatusInfo, getPriorityInfo, formatDate } from "./BacklogUtils";

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
    projects,
    setIsEditingDialogOpen: setIsOpen,
    setIsPromotingDialogOpen: setIsPromotingIsOpen
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
        setIsOpen={setIsOpen}
        updateBacklogItem={updateBacklogItem}
        isMobile={isMobile}
      />
      
      {/* Promote Modal */}
      <BacklogPromoteModal
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        isOpen={isPromotingDialogOpen}
        setIsOpen={setIsPromotingIsOpen}
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
