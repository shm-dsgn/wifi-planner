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
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DrawingToolsProps {
  selectedMaterial: WallMaterial;
  onMaterialChange: (material: WallMaterial) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  scale: { value: number; unit: string } | null;
  setScale: React.Dispatch<React.SetStateAction<{ value: number; unit: string } | null>>;
  walls: import("@/types").Wall[];
}

const DrawingTools: React.FC<DrawingToolsProps> = ({
  selectedMaterial,
  onMaterialChange,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  scale,
  setScale,
  walls,
}) => {
  const [isSettingScale, setIsSettingScale] = useState(false);
  const [selectedWallId, setSelectedWallId] = useState<string | null>(null);
  const [realLength, setRealLength] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [unit, setUnit] = useState<string>("feet");
  const [feet, setFeet] = useState<string>("");
  const [inches, setInches] = useState<string>("");

  const handleSetScaleClick = () => {
    setIsSettingScale(true);
    setSelectedWallId(null);
    setRealLength("");
    setError("");
  };

  const handleModalClose = () => {
    setIsSettingScale(false);
    setSelectedWallId(null);
    setRealLength("");
    setError("");
  };

  const handleScaleSubmit = () => {
    if (!selectedWallId) {
      setError("Please select a wall.");
      return;
    }
    const wall = walls.find(w => w.id === selectedWallId);
    if (!wall) {
      setError("Invalid wall selected.");
      return;
    }
    const pixelLength = Math.sqrt(
      Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2)
    );
    let real = 0;
    if (unit === "feet-inches") {
      const ft = parseInt(feet) || 0;
      const inch = parseFloat(inches) || 0;
      if (ft < 0 || inch < 0 || inch >= 12) {
        setError("Please enter valid feet and inches (0 <= inches < 12).");
        return;
      }
      real = ft + inch / 12; // store as feet
      if (real <= 0) {
        setError("Please enter a valid real-world length.");
        return;
      }
    } else {
      real = parseFloat(realLength);
      if (isNaN(real) || real <= 0) {
        setError("Please enter a valid real-world length.");
        return;
      }
    }
    if (pixelLength === 0) {
      setError("Selected wall has zero length.");
      return;
    }
    setScale({ value: real / pixelLength, unit: unit === "feet-inches" ? "feet" : unit });
    setIsSettingScale(false);
  };

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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleSetScaleClick} variant="outline" size="sm">
              Set Scale
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Set real-world scale using a reference wall</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {scale && (
        <span className="text-xs text-gray-500 ml-2">Scale: 1px = {(scale.value).toFixed(3)} {scale.unit}</span>
      )}
      <Dialog open={isSettingScale} onOpenChange={setIsSettingScale}>
        <DialogContent className="max-w-md w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Set Scale</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
            <label className="text-sm font-medium">Select Reference Wall</label>
            <select
              className="border rounded px-2 py-1 max-w-full truncate"
              value={selectedWallId || ""}
              onChange={e => setSelectedWallId(e.target.value)}
            >
              <option value="">-- Select a wall --</option>
              {walls.map((wall, idx) => {
                const pxLen = Math.sqrt(
                  Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2)
                ).toFixed(1);
                const name = String.fromCharCode(65 + idx); // A, B, C, ...
                return (
                  <option key={wall.id} value={wall.id}>
                    Wall {name} (Start: [{wall.x1},{wall.y1}], End: [{wall.x2},{wall.y2}], {pxLen} px)
                  </option>
                );
              })}
            </select>
            <label className="text-sm font-medium">Enter Real-World Length</label>
            {unit === "feet-inches" ? (
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={feet}
                  onChange={e => setFeet(e.target.value)}
                  placeholder="Feet"
                  className="w-20"
                />
                <span>ft</span>
                <Input
                  type="number"
                  min="0"
                  max="11.99"
                  step="any"
                  value={inches}
                  onChange={e => setInches(e.target.value)}
                  placeholder="Inches"
                  className="w-20"
                />
                <span>in</span>
              </div>
            ) : (
              <Input
                type="number"
                min="0"
                step="any"
                value={realLength}
                onChange={e => setRealLength(e.target.value)}
                placeholder={`e.g. 14 (${unit})`}
                className="max-w-xs"
              />
            )}
            <label className="text-sm font-medium">Units</label>
            <select
              className="border rounded px-2 py-1 max-w-xs"
              value={unit}
              onChange={e => {
                setUnit(e.target.value);
                if (e.target.value === "feet-inches") {
                  setRealLength("");
                } else {
                  setFeet("");
                  setInches("");
                }
              }}
            >
              <option value="feet">feet</option>
              <option value="meters">meters</option>
              <option value="cm">cm</option>
              <option value="inches">inches</option>
              <option value="feet-inches">feet & inches</option>
            </select>
            {error && <span className="text-xs text-red-500 break-words max-w-xs">{error}</span>}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
            <Button onClick={handleScaleSubmit}>Set Scale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrawingTools;
