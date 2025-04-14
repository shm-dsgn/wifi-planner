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
}

const ScaleCalibration: React.FC<ScaleCalibrationProps> = ({
  onSetScale,
  currentScale,
}) => {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [realWorldLength, setRealWorldLength] = useState<string>("10");
  const [unit, setUnit] = useState<"feet" | "inches">("feet");
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset calibration state when starting
  const startCalibration = () => {
    setIsCalibrating(true);
    setStartPoint(null);
    setEndPoint(null);
    setDistance(0);
  };

  // Handle click on the stage during calibration
  const handleCalibrationClick = (e: React.MouseEvent) => {
    if (!isCalibrating) return;
    
    // Get position relative to the container
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (!startPoint) {
      setStartPoint({ x, y });
    } else if (!endPoint) {
      setEndPoint({ x, y });
      const pixelDistance = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
      );
      setDistance(pixelDistance);
    }
  };

  // Apply calibration
  const applyCalibration = () => {
    if (distance > 0) {
      let lengthInFeet;
      if (unit === "inches") {
        lengthInFeet = parseFloat(realWorldLength) / 12;
      } else {
        lengthInFeet = parseFloat(realWorldLength);
      }
      
      const pixelsPerFoot = distance / lengthInFeet;
      onSetScale(pixelsPerFoot);
    }
    
    setIsCalibrating(false);
  };

  // Cancel calibration
  const cancelCalibration = () => {
    setIsCalibrating(false);
  };

  // Format scale display
  const formatScaleDisplay = () => {
    if (!currentScale) return "Not set";
    const feetPerPixel = 1 / currentScale;
    const inchesPerPixel = feetPerPixel * 12;
    
    if (inchesPerPixel < 1) {
      return `1 pixel = ${(inchesPerPixel).toFixed(2)} inches`;
    } else {
      return `1 pixel = ${feetPerPixel.toFixed(2)} feet`;
    }
  };

  return (
    <div className="scale-calibration" ref={containerRef}>
      {!isCalibrating ? (
        <div className="flex items-end gap-3">
          <div>
            <Label>Floor Plan Scale</Label>
            <div className="text-sm mt-1">{formatScaleDisplay()}</div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={startCalibration} variant="outline" size="icon">
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
        <div className="calibration-mode space-y-4">
          <div className="text-sm">
            {!startPoint
              ? "Click on the first point of a known distance"
              : !endPoint
              ? "Click on the second point"
              : "Enter the real-world length of this line"}
          </div>
          
          {endPoint && (
            <div className="flex gap-3 items-end">
              <div className="space-y-2">
                <Label htmlFor="real-length">Length</Label>
                <Input
                  id="real-length"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={realWorldLength}
                  onChange={(e:any) => setRealWorldLength(e.target.value)}
                  className="w-24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as "feet" | "inches")}
                  className="border rounded p-2 w-24"
                >
                  <option value="feet">feet</option>
                  <option value="inches">inches</option>
                </select>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={applyCalibration} variant="default">
                  Apply
                </Button>
                <Button onClick={cancelCalibration} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScaleCalibration;