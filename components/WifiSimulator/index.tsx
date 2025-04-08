// Modified version of components/WifiSimulator/index.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Image as KonvaImage,
  Line,
} from "react-konva";
import DrawingTools from "./DrawingTools";
import SimulationControls from "./SimulationControls";
import Legend from "./Legend";
import {
  Wall,
  Position,
  SimulationMode,
  WallMaterial,
  SignalPoint,
} from "@/types";
import {
  calculateSignalStrength,
  findOptimalPosition,
} from "./utils/signalCalculation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { defaultFloorPlanSize } from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { ImageUp, ImageOff, Play, PenLine } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const WifiSimulator = () => {
  const [floorPlan, setFloorPlan] = useLocalStorage("floorPlan", {
    walls: [] as Wall[],
    width: defaultFloorPlanSize.width,
    height: defaultFloorPlanSize.height,
  });

  const [routerPosition, setRouterPosition] = useState<Position>({
    x: Math.floor(floorPlan.width / 2),
    y: Math.floor(floorPlan.height / 2),
  });
  const [signalStrengthMap, setSignalStrengthMap] = useState<SignalPoint[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentWall, setCurrentWall] = useState<Partial<Wall> | null>(null);
  const [selectedMaterial, setSelectedMaterial] =
    useState<WallMaterial>("drywall");
  const [mode, setMode] = useState<SimulationMode>("draw");
  const [backgroundImage, setBackgroundImage] =
    useState<HTMLImageElement | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [isDraggingRouter, setIsDraggingRouter] = useState(false);

  // Add history states for undo/redo functionality
  const [history, setHistory] = useState<Wall[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Set fixed wall width
  const WALL_WIDTH = 10; // This is our fixed wall width in pixels

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize history when component mounts
  useEffect(() => {
    if (history.length === 0 && floorPlan.walls.length > 0) {
      setHistory([floorPlan.walls]);
      setHistoryIndex(0);
    } else if (history.length === 0) {
      setHistory([[]]);
      setHistoryIndex(0);
    }
  });

  // Calculate signal strength when needed
  useEffect(() => {
    if (mode === "simulate") {
      const strengthMap = calculateSignalStrength(floorPlan, routerPosition);
      setSignalStrengthMap(strengthMap);
    }
  }, [routerPosition, floorPlan, mode]);

  const handleRouterDragStart = () => {
    setIsDraggingRouter(true);
  };

  const handleRouterDragEnd = (e: any) => {
    setRouterPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
    setIsDraggingRouter(false);
  };

  const getMaterialColor = (material: WallMaterial) => {
    switch (material) {
      case "drywall":
        return "#E0E0E0"; // Light gray
      case "concrete":
        return "#A0A0A0"; // Dark gray
      case "glass":
        return "#ADD8E6"; // Light blue
      case "wood":
        return "#D2B48C"; // Tan
      case "metal":
        return "#C0C0C0"; // Silver
      case "brick":
        return "#B22222"; // Firebrick
      default:
        return "#000000"; // Black
    }
  };

  // Drawing mode functions
  const handleCanvasMouseDown = (e: any) => {
    // Ignore if we're in simulate mode or if we're clicking the router
    if (mode !== "draw" || isDraggingRouter) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    setDrawing(true);
    setCurrentWall({
      id: `wall-${Date.now()}`,
      x1: pointerPosition.x,
      y1: pointerPosition.y,
      x2: pointerPosition.x,
      y2: pointerPosition.y,
      material: selectedMaterial,
      color: getMaterialColor(selectedMaterial),
      width: WALL_WIDTH, // Store the fixed width
    });
  };

  const handleCanvasMouseMove = (e: any) => {
    if (!drawing || !currentWall || mode !== "draw") return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    setCurrentWall({
      ...currentWall,
      x2: pointerPosition.x,
      y2: pointerPosition.y,
    });
  };

  const handleCanvasMouseUp = () => {
    if (!drawing || !currentWall || mode !== "draw") return;

    // Only add wall if it has length
    if (
      currentWall.x1 !== undefined &&
      currentWall.y1 !== undefined &&
      currentWall.x2 !== undefined &&
      currentWall.y2 !== undefined &&
      (Math.abs(currentWall.x1 - currentWall.x2) > 5 ||
        Math.abs(currentWall.y1 - currentWall.y2) > 5)
    ) {
      const newWalls = [...floorPlan.walls, currentWall as Wall];

      // Update the floor plan
      setFloorPlan({
        ...floorPlan,
        walls: newWalls,
      });

      // Update history for undo/redo
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(newWalls);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }

    setDrawing(false);
    setCurrentWall(null);
  };

  // Undo function
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setFloorPlan({
        ...floorPlan,
        walls: history[newIndex],
      });
    }
  };

  // Redo function
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setFloorPlan({
        ...floorPlan,
        walls: history[newIndex],
      });
    }
  };

  const clearFloorPlan = () => {
    setFloorPlan({
      ...floorPlan,
      walls: [],
    });

    // Update history for undo/redo
    const newHistory = [...history, []];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const toggleMode = () => {
    setMode(mode === "draw" ? "simulate" : "draw");
  };

  const handleFindOptimalPosition = () => {
    const bestPosition = findOptimalPosition(floorPlan);
    setRouterPosition(bestPosition);
  };

  const handleMaterialChange = (material: WallMaterial) => {
    setSelectedMaterial(material);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // Scale the image to fit within the canvas while maintaining aspect ratio
          const scale = Math.min(
            floorPlan.width / img.width,
            floorPlan.height / img.height
          );

          img.width = img.width * scale;
          img.height = img.height * scale;

          setBackgroundImage(img);
        };
      };

      reader.readAsDataURL(files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageOpacity(parseFloat(e.target.value));
  };

  return (
    <div className="wifi-simulator mx-auto">
      <div className="instructions mb-8 mt-4">
        <h3 className="font-bold">Instructions:</h3>
        {mode === "draw" ? (
          <p>
            Click and drag to draw walls. Use Undo/Redo buttons to fix mistakes.
            Walls have a fixed width of {WALL_WIDTH}px. Select wall material
            from the dropdown. Upload a floor plan image to use as a stencil.
          </p>
        ) : (
          <p>
            Drag the blue router to see how signal strength changes. Use
            &quot;Find Optimal Position&quot; to automatically place the router.
          </p>
        )}
      </div>

      <div className="controls flex flex-wrap gap-8 items-end mb-4">
        {mode === "draw" ? (
          <DrawingTools
            selectedMaterial={selectedMaterial}
            onMaterialChange={handleMaterialChange}
            onClear={clearFloorPlan}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
          />
        ) : (
          <SimulationControls
            onFindOptimalPosition={handleFindOptimalPosition}
          />
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleMode}
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

        {/* Floor plan image controls */}
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {!backgroundImage && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleUploadClick}
                    className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 transition"
                  >
                    <ImageUp />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload floor plan</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {backgroundImage && (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="opacity">Opacity:</label>
                <input
                  id="opacity"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={imageOpacity}
                  onChange={handleOpacityChange}
                  className="w-24"
                />
                <span>{Math.round(imageOpacity * 100)}%</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRemoveImage}
                      className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 transition"
                    >
                      <ImageOff />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove floor plan</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </div>

      {/* Canvas container with proper styling to center it */}
      <div
        className="canvas-container mx-auto"
        style={{ width: `${floorPlan.width}px` }}
      >
        <Stage
          width={floorPlan.width}
          height={floorPlan.height}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          className="bg-white border border-gray-300"
          style={{ display: "block" }}
        >
          {/* Background Layer */}
          <Layer>
            <Rect
              x={0}
              y={0}
              width={floorPlan.width}
              height={floorPlan.height}
              fill="white"
              stroke="gray"
            />

            {/* Floor plan image */}
            {backgroundImage && (
              <KonvaImage
                image={backgroundImage}
                x={(floorPlan.width - backgroundImage.width) / 2}
                y={(floorPlan.height - backgroundImage.height) / 2}
                width={backgroundImage.width}
                height={backgroundImage.height}
                opacity={imageOpacity}
              />
            )}
          </Layer>

          {/* Signal strength visualization layer */}
          {mode === "simulate" && (
            <Layer>
              {signalStrengthMap.map((point, index) => (
                <Rect
                  key={index}
                  x={point.x - 5}
                  y={point.y - 5}
                  width={10}
                  height={10}
                  fill={point.color}
                  opacity={0.5}
                />
              ))}
            </Layer>
          )}

          {/* Walls Layer */}
          <Layer>
            {floorPlan.walls.map((wall) => (
              <Line
                key={wall.id}
                points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                stroke={wall.color}
                strokeWidth={wall.width || WALL_WIDTH}
                lineCap="round"
                lineJoin="round"
              />
            ))}

            {/* Current Wall being drawn */}
            {currentWall && (
              <Line
                points={[
                  currentWall.x1 || 0,
                  currentWall.y1 || 0,
                  currentWall.x2 || 0,
                  currentWall.y2 || 0,
                ]}
                stroke={currentWall.color || "#000"}
                strokeWidth={WALL_WIDTH}
                lineCap="round"
                lineJoin="round"
                opacity={0.7}
              />
            )}
          </Layer>

          {/* Router Layer */}
          <Layer>
            <Circle
              x={routerPosition.x}
              y={routerPosition.y}
              radius={10}
              fill="#3498db"
              stroke="#2980b9"
              strokeWidth={2}
              draggable={true}
              onDragStart={handleRouterDragStart}
              onDragEnd={handleRouterDragEnd}
            />
          </Layer>
        </Stage>
      </div>

      <Legend mode={mode} />
    </div>
  );
};

export default WifiSimulator;
