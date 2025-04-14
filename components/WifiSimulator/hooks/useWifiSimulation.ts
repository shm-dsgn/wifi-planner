// hooks/useWifiSimulation.ts
import { useState, useEffect } from "react";
import {
  Wall,
  Position,
  SimulationMode,
  WallMaterial,
  SignalPoint,
  FloorPlan,
} from "@/types";
import {
  calculateSignalStrength,
  findOptimalPosition,
} from "@/components/WifiSimulator/utils/signalCalculation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { defaultFloorPlanSize } from "@/utils/constants";

export function useWifiSimulation() {
  // Floor plan and localStorage management
  const [floorPlan, setFloorPlan] = useLocalStorage("floorPlan", {
    walls: [] as Wall[],
    width: defaultFloorPlanSize.width,
    height: defaultFloorPlanSize.height,
  });

  // Router position management
  const [routerPosition, setRouterPosition] = useState<Position>({
    x: Math.floor(floorPlan.width / 2),
    y: Math.floor(floorPlan.height / 2),
  });

  // Simulation state
  const [signalStrengthMap, setSignalStrengthMap] = useState<SignalPoint[]>([]);
  const [mode, setMode] = useState<SimulationMode>("draw");
  const [isDraggingRouter, setIsDraggingRouter] = useState(false);

  // Calculate signal strength when needed
  useEffect(() => {
    if (mode === "simulate") {
      const strengthMap = calculateSignalStrength(floorPlan, routerPosition);
      setSignalStrengthMap(strengthMap);
    }
  }, [routerPosition, floorPlan, mode]);

  // Router drag handlers
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

  // Simulation mode toggle
  const toggleMode = () => {
    setMode(mode === "draw" ? "simulate" : "draw");
  };

  // Optimal position finder
  const handleFindOptimalPosition = () => {
    const bestPosition = findOptimalPosition(floorPlan);
    setRouterPosition(bestPosition);
  };

  return {
    floorPlan,
    setFloorPlan,
    routerPosition,
    setRouterPosition,
    signalStrengthMap,
    mode,
    toggleMode,
    isDraggingRouter,
    handleRouterDragStart,
    handleRouterDragEnd,
    handleFindOptimalPosition,
  };
}