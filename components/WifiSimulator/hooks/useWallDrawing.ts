// hooks/useWallDrawing.ts
import { useState, useEffect } from "react";
import { Wall, WallMaterial } from "@/types";
import { WALL_MATERIALS } from "@/utils/constants";

export function useWallDrawing(
  floorPlan: any,
  setFloorPlan: (floorPlan: any) => void
) {
  // Drawing state
  const [drawing, setDrawing] = useState(false);
  const [currentWall, setCurrentWall] = useState<Partial<Wall> | null>(null);
  const [selectedMaterial, setSelectedMaterial] =
    useState<WallMaterial>("concrete");

  // History for undo/redo
  const [history, setHistory] = useState<Wall[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Fixed wall width
  const WALL_WIDTH = 10;

  // Initialize history when component mounts
  useEffect(() => {
    if (history.length === 0 && floorPlan.walls.length > 0) {
      setHistory([floorPlan.walls]);
      setHistoryIndex(0);
    } else if (history.length === 0) {
      setHistory([[]]);
      setHistoryIndex(0);
    }
  }, []);

  const getMaterialColor = (material: WallMaterial) => {
    const materialObj = WALL_MATERIALS.find((m) => m.value === material);
    return materialObj ? materialObj.color : "#000000";
  };

  // Drawing mode functions
  const handleCanvasMouseDown = (e: any) => {
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
      width: WALL_WIDTH,
    });
  };

  const handleCanvasMouseMove = (e: any) => {
    if (!drawing || !currentWall) return;

    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();

    setCurrentWall({
      ...currentWall,
      x2: pointerPosition.x,
      y2: pointerPosition.y,
    });
  };

  const handleCanvasMouseUp = () => {
    if (!drawing || !currentWall) return;

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

  const handleMaterialChange = (material: WallMaterial) => {
    setSelectedMaterial(material);
  };

  return {
    drawing,
    currentWall,
    selectedMaterial,
    WALL_WIDTH,
    historyIndex,
    history,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleUndo,
    handleRedo,
    clearFloorPlan,
    handleMaterialChange,
  };
}