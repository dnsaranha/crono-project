
import React, { forwardRef } from 'react';

export interface TodayMarkerProps {
  position?: number;
  startDate?: Date;
  endDate?: Date;
  cellWidth?: number;
}

export const TodayMarker = forwardRef<HTMLDivElement, TodayMarkerProps>(
  ({ position, startDate, endDate, cellWidth }, ref) => {
    return (
      <line
        x1={position}
        y1="0"
        x2={position}
        y2="100%"
        stroke="currentColor"
        strokeWidth="2"
        className="text-red-500"
        strokeDasharray="4"
      />
    );
  }
);

TodayMarker.displayName = 'TodayMarker';

export default TodayMarker;
