import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ScaleCalibrationProps {
  onSetScale: (pixelsPerFoot: number) => void;
  currentScale: number | null;
  onStartCalibration: () => void;
  isCalibrating: boolean;
  calibrationLine?: {start: {x: number, y: number} | null, end: {x: number, y: number} | null};
  onApplyCalibration: (realLength: number, unit: string) => void;
  onCancelCalibration: () => void;
}

const ScaleCalibration: React.FC<ScaleCalibrationProps> = ({
  onSetScale,
  currentScale,
  onStartCalibration,
  isCalibrating,
  calibrationLine,
  onApplyCalibration,
  onCancelCalibration
}) => {
  const [realWorldLength, setRealWorldLength] = useState<string>("10");
  const [unit, setUnit] = useState<"feet" | "inches" | "meters" | "centimeters">("feet");

  // Format scale display
  const formatScaleDisplay = () => {
    if (!currentScale) return "Not set";
    
    const feetPerPixel = 1 / currentScale;
    const inchesPerPixel = feetPerPixel * 12;
    
    if (inchesPerPixel < 1) {
      return `1 pixel = ${inchesPerPixel.toFixed(2)} inches`;
    } else {
      return `1 pixel = ${feetPerPixel.toFixed(2)} feet`;
    }
  };

  // Reverse calculation - how many pixels per measurement unit
  const getPixelsPerUnit = () => {
    if (!currentScale) return null;
    
    return {
      feet: currentScale,
      inches: currentScale / 12,
      meters: currentScale * 3.28084,
      centimeters: currentScale * 3.28084 / 100
    };
  };

  const pixelsPerUnit = getPixelsPerUnit();

  const handleApplyCalibration = () => {
    onApplyCalibration(parseFloat(realWorldLength), unit);
  };

  // Calculate line length if we have a calibration line
  const calculateLineLength = () => {
    if (calibrationLine?.start && calibrationLine?.end) {
      return Math.sqrt(
        Math.pow(calibrationLine.end.x - calibrationLine.start.x, 2) + 
        Math.pow(calibrationLine.end.y - calibrationLine.start.y, 2)
      ).toFixed(1);
    }
    return "0";
  };

  return (
    <div className="scale-calibration">
      {!isCalibrating ? (
        <div className="flex items-end gap-3">
          <div>
            <Label>Floor Plan Scale</Label>
            <div className="text-sm mt-1">{formatScaleDisplay()}</div>
            {pixelsPerUnit && (
              <div className="text-xs text-gray-500 mt-1">
                1 foot = {pixelsPerUnit.feet.toFixed(1)} px | 
                1 meter = {pixelsPerUnit.meters.toFixed(1)} px
              </div>
            )}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={onStartCalibration} variant="outline" size="icon">
                  <Ruler />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Calibrate scale</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <div className="calibration-mode p-4 border rounded-md bg-gray-50">
          <h3 className="font-medium mb-2">Scale Calibration</h3>
          <p className="text-sm mb-4">
            Draw a line on your floor plan along a surface with known dimensions.
            Then enter the real-world measurement to establish the scale.
          </p>
          
          {calibrationLine?.start && calibrationLine?.end && (
            <p className="mb-2">Line length: {calculateLineLength()} pixels</p>
          )}
          
          <div className="flex gap-3 items-end">
            <div className="space-y-2">
              <Label htmlFor="real-length">Length</Label>
              <Input
                id="real-length"
                type="number"
                min="0.1"
                step="0.1"
                value={realWorldLength}
                onChange={(e) => setRealWorldLength(e.target.value)}
                className="w-24"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <select
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="border rounded p-2 w-32"
              >
                <option value="feet">feet</option>
                <option value="inches">inches</option>
                <option value="meters">meters</option>
                <option value="centimeters">cm</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleApplyCalibration} variant="default">Apply</Button>
              <Button onClick={onCancelCalibration} variant="secondary">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScaleCalibration;