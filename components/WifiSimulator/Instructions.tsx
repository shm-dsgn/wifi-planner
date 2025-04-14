// components/WifiSimulator/Instructions.tsx
import React from "react";
import { SimulationMode } from "@/types";

interface InstructionsProps {
  mode: SimulationMode;
  wallWidth: number;
}

const Instructions: React.FC<InstructionsProps> = ({ mode, wallWidth }) => {
  return (
    <div className="instructions mb-4 text-sm">
      <span className="font-medium">Instructions: </span>
      {mode === "draw" ? (
        <span className="text-sm text-gray-500">
          Click and drag to draw walls.
          Walls have a fixed width of {wallWidth}px. Select wall material
          from the dropdown. Upload a floor plan image to use as a stencil.
        </span>
      ) : (
        <span className="text-sm text-gray-500">
          Drag the blue router to see how signal strength changes. Use
          &quot;Find Optimal Position&quot; to automatically place the router.
        </span>
      )}
    </div>
  );
};

export default Instructions;