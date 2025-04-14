// components/WifiSimulator/Instructions.tsx
import React from "react";
import { SimulationMode } from "@/types";

interface InstructionsProps {
  mode: SimulationMode;
  wallWidth: number;
}

const Instructions: React.FC<InstructionsProps> = ({ mode, wallWidth }) => {
  return (
    <div className="instructions mb-8 mt-4">
      <h3 className="font-bold">Instructions:</h3>
      {mode === "draw" ? (
        <p>
          Click and drag to draw walls. Use Undo/Redo buttons to fix mistakes.
          Walls have a fixed width of {wallWidth}px. Select wall material
          from the dropdown. Upload a floor plan image to use as a stencil.
        </p>
      ) : (
        <p>
          Drag the blue router to see how signal strength changes. Use
          &quot;Find Optimal Position&quot; to automatically place the router.
        </p>
      )}
    </div>
  );
};

export default Instructions;