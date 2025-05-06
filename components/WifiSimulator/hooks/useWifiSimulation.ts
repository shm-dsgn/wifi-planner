import { useState, useEffect } from "react";
import {
  Wall,
  Position,
  SimulationMode,
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
  
  // Extender placement mode
  const [isPlacingExtender, setIsPlacingExtender] = useState(false);

  // Calculate signal strength when needed
  useEffect(() => {
    if (mode === "simulate") {
      try {
        const strengthMap = calculateSignalStrength(floorPlan, devices);
        setSignalStrengthMap(strengthMap);
      } catch (error) {
        console.error("Error calculating signal strength:", error);
        // Fallback to empty map if calculation fails
        setSignalStrengthMap([]);
      }
    }
  }, [devices, floorPlan, mode]);

  // Simulation mode toggle
  const toggleMode = () => {
    setMode(mode === "draw" ? "simulate" : "draw");
    // Exit extender placement mode when toggling
    if (isPlacingExtender) setIsPlacingExtender(false);
  };

  // Add extender at specific position
  const addExtender = (position: Position) => {
    const newExtender: NetworkDevice = {
      id: `extender-${Date.now()}`,
      x: position.x,
      y: position.y,
      type: 'extender'
    };
    
    setDevices(prev => [...prev, newExtender]);
    setIsPlacingExtender(false); // Exit placement mode
  };

  // Remove extender by ID
  const removeExtender = (id: string) => {
    setDevices(prev => prev.filter(device => device.id !== id));
  };

  // Handle device drag
  const handleDeviceDrag = (id: string, newPosition: Position) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === id 
          ? { ...device, x: newPosition.x, y: newPosition.y }
          : device
      )
    );
    
    // Recalculate signal map after device is moved
    if (mode === "simulate") {
      try {
        const updatedDevices = devices.map(device => 
          device.id === id 
            ? { ...device, x: newPosition.x, y: newPosition.y }
            : device
        );
        const strengthMap = calculateSignalStrength(floorPlan, updatedDevices);
        setSignalStrengthMap(strengthMap);
      } catch (error) {
        console.error("Error updating signal strength:", error);
      }
    }
  };

  // Toggle extender placement mode
  const toggleExtenderPlacement = () => {
    setIsPlacingExtender(prev => !prev);
  };

  return {
    floorPlan,
    setFloorPlan,
    devices,
    setDevices,
    signalStrengthMap,
    mode,
    toggleMode,
    isPlacingExtender,
    setIsPlacingExtender,
    addExtender,
    removeExtender,
    handleDeviceDrag,
    toggleExtenderPlacement
  };
}