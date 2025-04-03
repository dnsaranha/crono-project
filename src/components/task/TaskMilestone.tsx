
import React from "react";
import { TaskMilestoneProps } from "./TaskTypes";

const TaskMilestone: React.FC<TaskMilestoneProps> = ({
  task,
  style,
  onClick,
  draggable,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  className = "",
}) => {
  return (
    <div 
      className={`gantt-milestone absolute cursor-pointer top-[12px] ${className}`}
      style={{
        ...style,
        width: 0,
        height: 0,
        marginLeft: `${parseInt(style?.marginLeft?.toString() || "0") - 8}px`,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderBottom: '16px solid purple',
      }}
      onClick={onClick}
      draggable={draggable && !!onDragStart}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    />
  );
};

export default TaskMilestone;
