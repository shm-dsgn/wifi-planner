"use client";

import type React from "react";
import type { WallMaterial } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Undo2, Redo2, Eraser } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WALL_MATERIALS } from "@/utils/constants";

interface DrawingToolsProps {
  selectedMaterial: WallMaterial;
  onMaterialChange: (material: WallMaterial) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  selectedMaterial,
  onMaterialChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="drawing-tools flex items-end gap-3">
      <Select
        value={selectedMaterial}
        onValueChange={(value) => onMaterialChange(value as WallMaterial)}
      >
        <SelectTrigger id="wall-material">
          <SelectValue placeholder="Select material" className="text-sm"/>
        </SelectTrigger>
        <SelectContent>
          {WALL_MATERIALS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-sm">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="history-buttons flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="secondary"
                size="icon"
              >
                <Undo2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Undo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                variant="secondary"
                size="icon"
              >
                <Redo2 />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Redo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onClear} variant="destructive" size="icon">
              <Eraser />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Clear all</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default DrawingTools;
