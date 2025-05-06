import { FloorPlan, NetworkDevice,Position, SignalPoint } from "@/types";
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

// Calculate signal strength at a given point
export const calculateSignalAtPoint = (
  floorPlan: FloorPlan,
  device: NetworkDevice,
  point: Position
): number => {
  // Calculate distance
  const distance = Math.sqrt(
    Math.pow(device.x - point.x, 2) +
      Math.pow(device.y - point.y, 2)
  );

  // Calculate base signal strength based on distance
  // Extenders have slightly lower base signal than the main router
  const deviceBasePower = device.type === 'router' ? BASE_SIGNAL_STRENGTH : BASE_SIGNAL_STRENGTH - 5;
  let signalStrength = deviceBasePower - distance / DISTANCE_FACTOR;

  // Check for wall intersections
  for (const wall of floorPlan.walls) {
    // Define the line from router to the point
    const line = {
      x1: device.x,
      y1: device.y,
      x2: point.x,
      y2: point.y,
    };

    // Check if the signal line intersects with the wall
    const wallLine = {
      x1: wall.x1,
      y1: wall.y1,
      x2: wall.x2,
      y2: wall.y2,
    };

    if (lineIntersect(line, wallLine)) {
      // Apply attenuation based on wall material
      signalStrength -= MATERIAL_ATTENUATION[wall.material] || 3.0;
    }
  }

  return signalStrength;
};

// Calculate the best signal strength at a point from all devices
export const calculateBestSignalAtPoint = (
  floorPlan: FloorPlan,
  devices: NetworkDevice[],
  point: Position
): { strength: number, sourceDeviceId: string } => {
  let bestStrength = -Infinity;
  let sourceDeviceId = '';

  for (const device of devices) {
    const strength = calculateSignalFromDevice(floorPlan, device, point);
    if (strength > bestStrength) {
      bestStrength = strength;
      sourceDeviceId = device.id;
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

// Generate a heatmap representation of signal strength
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

      const strength = calculateSignalAtPoint(floorPlan, routerPosition, {
        x: pointX,
        y: pointY,
      });

      data[y][x] = strength;
      min = Math.min(min, strength);
      max = Math.max(max, strength);
    }
  }

  return { data, min, max };
};
