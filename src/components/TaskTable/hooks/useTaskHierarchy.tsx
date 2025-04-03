
import { useState } from "react";
import { TaskType } from "@/components/Task";

export function useTaskHierarchy() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Helper function to build a nested task hierarchy
  const buildTaskHierarchy = (allTasks: TaskType[]): TaskType[] => {
    // Create a map of tasks by ID for quick lookup
    const taskMap = new Map<string, TaskType & { children?: TaskType[] }>();
    
    // First pass: map all tasks to their IDs
    allTasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });
    
    // Second pass: build tree structure
    const rootTasks: TaskType[] = [];
    
    allTasks.forEach(task => {
      const mappedTask = taskMap.get(task.id)!;
      
      if (task.parentId && taskMap.has(task.parentId)) {
        // This is a child task
        const parent = taskMap.get(task.parentId)!;
        parent.children = parent.children || [];
        parent.children.push(mappedTask);
      } else {
        // This is a root task
        rootTasks.push(mappedTask);
      }
    });
    
    return rootTasks;
  };

  // Recursively flatten task hierarchy based on expanded state
  const flattenTaskHierarchy = (
    tasks: (TaskType & { children?: TaskType[] })[], 
    showSubtasks: boolean,
    expandedGroups: Record<string, boolean>,
    level = 0, 
    result: (TaskType & { level: number })[] = []
  ): (TaskType & { level: number })[] => {
    tasks.forEach(task => {
      // Add the task with its nesting level
      result.push({ ...task, level });
      
      // Add children if this group is expanded and we're showing subtasks
      if (task.isGroup && task.children && task.children.length > 0 && expandedGroups[task.id] && showSubtasks) {
        flattenTaskHierarchy(task.children, showSubtasks, expandedGroups, level + 1, result);
      }
    });
    
    return result;
  };

  return {
    expandedGroups,
    setExpandedGroups,
    toggleGroup,
    buildTaskHierarchy,
    flattenTaskHierarchy
  };
}
