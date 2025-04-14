// components/WifiSimulator/ModeToggleButton.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Play, PenLine } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SimulationMode } from "@/types";

interface ModeToggleButtonProps {
  mode: SimulationMode;
  onToggle: () => void;
}

const ModeToggleButton: React.FC<ModeToggleButtonProps> = ({ mode, onToggle }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onToggle}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition"
          >
            {mode === "draw" ? <Play /> : <PenLine />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {mode === "draw" ? "Start simulation" : "Return to Drawing"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ModeToggleButton;