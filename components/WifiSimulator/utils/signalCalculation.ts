// components/WifiSimulator/utils/signalCalculation.ts
import { FloorPlan, NetworkDevice, Position, SignalPoint } from "@/types";
import { lineIntersect } from "./lineIntersection";

// Signal attenuation values for different materials (in dB)
const MATERIAL_ATTENUATION = {
  drywall: 2.5,
  wood: 3.0,
  brick: 6.0,
  concrete: 10.0,
  metal: 15.0,
  glass: 2.0,
};

// Base signal strength (in dBm)
const BASE_SIGNAL_STRENGTH = -30;

// Distance at which signal drops by 1dBm (in pixels)
const DISTANCE_FACTOR = 10;

// Signal strength to color mapping
const getSignalColor = (strength: number): string => {
  if (strength > -50) return "rgba(0, 255, 0, 0.7)"; // Excellent: Green
  if (strength > -60) return "rgba(144, 238, 144, 0.7)"; // Good: Light Green
  if (strength > -70) return "rgba(255, 255, 0, 0.7)"; // Fair: Yellow
  if (strength > -80) return "rgba(255, 165, 0, 0.7)"; // Poor: Orange
  return "rgba(255, 0, 0, 0.7)"; // Bad: Red
};

// Calculate raw signal strength (without wall interference) based on distance
const calculateRawSignalStrength = (sourceX: number, sourceY: number, targetX: number, targetY: number, isExtender = false): number => {
  const distance = Math.sqrt(
    Math.pow(sourceX - targetX, 2) +
    Math.pow(sourceY - targetY, 2)
  );
  
  // Extenders have slightly lower base power than the main router
  const deviceBasePower = isExtender ? BASE_SIGNAL_STRENGTH - 5 : BASE_SIGNAL_STRENGTH;
  return deviceBasePower - distance / DISTANCE_FACTOR;
};

// Calculate signal strength accounting for wall interference
const calculateWallInterference = (
  floorPlan: FloorPlan,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number
): number => {
  let attenuation = 0;
  
  // Define the line from source to the target
  const line = {
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
  };

  // Check for wall intersections
  for (const wall of floorPlan.walls) {
    const wallLine = {
      x1: wall.x1,
      y1: wall.y1,
      x2: wall.x2,
      y2: wall.y2,
    };

    if (lineIntersect(line, wallLine)) {
      // Apply attenuation based on wall material
      attenuation += MATERIAL_ATTENUATION[wall.material] || 3.0;
    }
  }

  return attenuation;
};

// Calculate the signal an extender receives from the router
const calculateExtenderSignal = (
  floorPlan: FloorPlan,
  router: NetworkDevice,
  extender: NetworkDevice
): number => {
  // Get raw signal based on distance
  const rawSignal = calculateRawSignalStrength(router.x, router.y, extender.x, extender.y);
  
  // Calculate wall interference
  const wallAttenuation = calculateWallInterference(
    floorPlan,
    router.x,
    router.y,
    extender.x,
    extender.y
  );
  
  // Final signal = raw signal - wall attenuation
  return rawSignal - wallAttenuation;
};

// Calculate signal strength at a point from a device
export const calculateSignalFromDevice = (
  floorPlan: FloorPlan,
  device: NetworkDevice,
  point: Position,
  router?: NetworkDevice // For extenders, we need the router to calculate their received signal
): number => {
  // If this is an extender, its output signal strength depends on what it receives from the router
  let maxDeviceStrength = 0;
  
  if (device.type === 'extender' && router) {
    // Calculate what signal the extender receives from the router
    const receivedSignal = calculateExtenderSignal(floorPlan, router, device);
    
    // Extender can't boost signal higher than what it receives
    // But it can broadcast at full strength if it receives good signal
    if (receivedSignal > -70) {
      maxDeviceStrength = Math.min(BASE_SIGNAL_STRENGTH - 5, receivedSignal + 10); // 10dB boost
    } else if (receivedSignal > -80) {
      maxDeviceStrength = Math.min(BASE_SIGNAL_STRENGTH - 10, receivedSignal + 5); // 5dB boost
    } else {
      // Poor signal - extender is barely working
      maxDeviceStrength = receivedSignal;
    }
  } else {
    // It's a router with full power
    maxDeviceStrength = BASE_SIGNAL_STRENGTH;
  }
  
  // Calculate raw signal based on distance
  const rawSignal = calculateRawSignalStrength(device.x, device.y, point.x, point.y, device.type === 'extender');
  
  // Limit by max device strength
  const cappedSignal = Math.min(rawSignal, maxDeviceStrength);
  
  // Calculate wall interference
  const wallAttenuation = calculateWallInterference(
    floorPlan,
    device.x,
    device.y,
    point.x,
    point.y
  );
  
  // Final signal = capped signal - wall attenuation
  return cappedSignal - wallAttenuation;
};

// Calculate the best signal strength at a point from all devices
export const calculateBestSignalAtPoint = (
  floorPlan: FloorPlan,
  devices: NetworkDevice[],
  point: Position
): { strength: number, sourceDeviceId: string } => {
  let bestStrength = -Infinity;
  let sourceDeviceId = '';

  // Find router device
  const router = devices.find(d => d.type === 'router');
  
  if (!router) {
    return { strength: -100, sourceDeviceId: '' };
  }

  // Calculate signal from router
  const routerSignal = calculateSignalFromDevice(floorPlan, router, point);
  bestStrength = routerSignal;
  sourceDeviceId = router.id;

  // Calculate signal from each extender
  for (const device of devices) {
    if (device.type === 'extender') {
      const strength = calculateSignalFromDevice(floorPlan, device, point, router);
      if (strength > bestStrength) {
        bestStrength = strength;
        sourceDeviceId = device.id;
      }
    }
  }

  return { strength: bestStrength, sourceDeviceId };
};

// Calculate signal strength for the entire floor plan
export const calculateSignalStrength = (
  floorPlan: FloorPlan,
  devices: NetworkDevice[],
  resolution: number = 10
): SignalPoint[] => {
  const points: SignalPoint[] = [];

  // Calculate signal strength at grid points
  for (let x = 0; x <= floorPlan.width; x += resolution) {
    for (let y = 0; y <= floorPlan.height; y += resolution) {
      const { strength, sourceDeviceId } = calculateBestSignalAtPoint(floorPlan, devices, { x, y });

      points.push({
        x,
        y,
        strength,
        sourceDeviceId,
        color: getSignalColor(strength),
      });
    }
  }

  return points;
};

// Calculate signal strength at a specific point (wrapper function for backward compatibility)
export const calculateSignalAtPoint = (
  floorPlan: FloorPlan,
  device: NetworkDevice,
  point: Position
): number => {
  return calculateSignalFromDevice(floorPlan, device, point);
};

// Generate a heatmap representation of signal strength (not used in current implementation)
export const generateHeatmap = (
  floorPlan: FloorPlan,
  routerPosition: Position,
  resolution: number = 5
): { data: number[][]; min: number; max: number } => {
  const width = Math.ceil(floorPlan.width / resolution);
  const height = Math.ceil(floorPlan.height / resolution);

  // Create a 2D array for the heatmap
  const data: number[][] = Array(height)
    .fill(0)
    .map(() => Array(width).fill(0));

  let min = Infinity;
  let max = -Infinity;

  // Calculate signal strength at each point
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pointX = x * resolution;
      const pointY = y * resolution;

      const strength = calculateSignalAtPoint(
        floorPlan, 
        { 
          id: 'router-main', 
          x: routerPosition.x, 
          y: routerPosition.y, 
          type: 'router' 
        },
        {
          x: pointX,
          y: pointY,
        }
      );

      data[y][x] = strength;
      min = Math.min(min, strength);
      max = Math.max(max, strength);
    }
  }

  return { data, min, max };
};