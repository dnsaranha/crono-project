
import React, { forwardRef } from "react";

interface TodayMarkerProps {
  position?: number;
}

export const TodayMarker = forwardRef<SVGLineElement, TodayMarkerProps>(({ position = 0 }, ref) => {
  return (
    <line
      ref={ref}
      x1={position}
      y1="0"
      x2={position}
      y2="100%"
      stroke="red"
      strokeWidth="2"
      strokeDasharray="5,5"
    />
  );
});

TodayMarker.displayName = "TodayMarker";

export default TodayMarker;
