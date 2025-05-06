import { useState, useEffect } from "react";
import {
  Wall,
  Position,
  SimulationMode,
  WallMaterial,
  SignalPoint,
  FloorPlan,
  NetworkDevice
} from "@/types";
import {
  calculateSignalStrength
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

  // Initial router position (center of floor plan)
  const initialRouterPosition: Position = {
    x: Math.floor(floorPlan.width / 2),
    y: Math.floor(floorPlan.height / 2),
  };

  // Network devices (router + extenders)
  const [devices, setDevices] = useState<NetworkDevice[]>([
    { id: 'router-main', x: initialRouterPosition.x, y: initialRouterPosition.y, type: 'router' }
  ]);

  // Simulation state
  const [signalStrengthMap, setSignalStrengthMap] = useState<SignalPoint[]>([]);
  const [mode, setMode] = useState<SimulationMode>("draw");

  // Calculate signal strength when needed
  useEffect(() => {
    if (mode === "simulate") {
      const strengthMap = calculateSignalStrength(floorPlan, devices);
      setSignalStrengthMap(strengthMap);
    }
  }, [devices, floorPlan, mode]);

  // Simulation mode toggle
  const toggleMode = () => {
    setMode(mode === "draw" ? "simulate" : "draw");
  };

  return {
    floorPlan,
    setFloorPlan,
    devices,
    setDevices,
    signalStrengthMap,
    mode,
    toggleMode,
  };
}
