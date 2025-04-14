import React, { useState, useRef, useEffect } from "react";
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
}

const ScaleCalibration: React.FC<ScaleCalibrationProps> = ({
  onSetScale,
  currentScale,
  onStartCalibration,
  isCalibrating,
}) => {
  const [distance, setDistance] = useState<number>(0);
  const [realWorldLength, setRealWorldLength] = useState<string>("10");
  const [unit, setUnit] = useState<"feet" | "inches" | "meters" | "centimeters">("feet");
  
  // Apply calibration
  const applyCalibration = (pixelDistance: number, realLength: number, unit: string) => {
    let lengthInFeet;
    
    switch(unit) {
      case "inches":
        lengthInFeet = realLength / 12;
        break;
      case "meters":
        lengthInFeet = realLength * 3.28084;
        break;
      case "centimeters":
        lengthInFeet = realLength * 0.0328084;
        break;
      default: // feet
        lengthInFeet = realLength;
        break;
    }
    
    const pixelsPerFoot = pixelDistance / lengthInFeet;
    onSetScale(pixelsPerFoot);
  };

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
          </div>
        </div>
      )}
    </div>
  );
};

export default ScaleCalibration;