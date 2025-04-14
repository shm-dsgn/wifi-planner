import { FloorPlan, Position, SignalPoint } from "@/types";
import { lineIntersect } from "./lineIntersection";

// Signal attenuation values for different materials (in dB)
const MATERIAL_ATTENUATION = {
  drywall: 2.5,
  wood: 3.0,
  brick: 6.0,
  concrete: 10.0,
  metal: 15.0,
  glass: 2.0,
  other: 4.0,
};

// Base signal strength (in dBm)
const BASE_SIGNAL_STRENGTH = -30;

// Real-world distance factors - based on empirical Wi-Fi propagation models
// Signal drops by approximately 1dBm per these distances in free space
const DISTANCE_FACTORS = {
  FEET: 3, // Signal drops ~1dBm every 3 feet
  METERS: 1, // Signal drops ~1dBm every 1 meter
  PIXEL_DEFAULT: 10 // Default pixel factor when no scale is set
};

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
  routerPosition: Position,
  point: Position,
  scale: number | null
): number => {
  // Calculate distance in pixels
  const pixelDistance = Math.sqrt(
    Math.pow(routerPosition.x - point.x, 2) +
    Math.pow(routerPosition.y - point.y, 2)
  );
  
  // Convert to real-world distance if scale is available
  let realDistance: number;
  let distanceFactor: number;
  
  if (scale) {
    // Convert pixel distance to feet using scale
    realDistance = pixelDistance / scale;
    distanceFactor = DISTANCE_FACTORS.FEET;
  } else {
    // Use pixel distance directly with default factor
    realDistance = pixelDistance;
    distanceFactor = DISTANCE_FACTORS.PIXEL_DEFAULT;
  }

  // Calculate base signal strength based on distance using inverse square law model
  // Signal strength decreases proportionally to the square of the distance
  let signalStrength = BASE_SIGNAL_STRENGTH - (20 * Math.log10(1 + realDistance / distanceFactor));

  // Check for wall intersections
  for (const wall of floorPlan.walls) {
    // Define the line from router to the point
    const line = {
      x1: routerPosition.x,
      y1: routerPosition.y,
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

// Calculate signal strength for the entire floor plan
export const calculateSignalStrength = (
  floorPlan: FloorPlan,
  routerPosition: Position,
  scale: number | null,
  resolution: number = 10
): SignalPoint[] => {
  const points: SignalPoint[] = [];
  
  // Calculate density of points based on scale if available
  let actualResolution = resolution;
  if (scale) {
    // Adjust resolution so we have reasonable sampling density
    // Aim for approximately one sample point per foot
    actualResolution = Math.max(5, Math.round(scale / 3));
  }

  // Calculate signal strength at grid points
  for (let x = 0; x <= floorPlan.width; x += actualResolution) {
    for (let y = 0; y <= floorPlan.height; y += actualResolution) {
      const strength = calculateSignalAtPoint(
        floorPlan, 
        routerPosition, 
        { x, y },
        scale
      );

      points.push({
        x,
        y,
        strength,
        color: getSignalColor(strength),
      });
    }
  }

  return points;
};

// Find optimal router position
export const findOptimalPosition = (floorPlan: FloorPlan, scale: number | null): Position => {
  // Adjust grid size based on scale if available
  let gridSize = 20; // Default resolution for checking positions
  if (scale) {
    // Aim for approximately one sample point per 2 feet
    gridSize = Math.max(10, Math.round(scale / 2));
  }
  
  let bestPosition = { x: floorPlan.width / 2, y: floorPlan.height / 2 };
  let bestAverageStrength = -Infinity;

  // Try different positions
  for (let x = 0; x <= floorPlan.width; x += gridSize) {
    for (let y = 0; y <= floorPlan.height; y += gridSize) {
      const testPosition: Position = { x, y };

      // Sample points throughout the floor plan
      const sampleSize = 50;
      let totalStrength = 0;
      let minStrength = Infinity;

      for (let i = 0; i < sampleSize; i++) {
        const sampleX = Math.random() * floorPlan.width;
        const sampleY = Math.random() * floorPlan.height;

        const strength = calculateSignalAtPoint(floorPlan, testPosition, {
          x: sampleX,
          y: sampleY,
        }, scale);

        totalStrength += strength;
        minStrength = Math.min(minStrength, strength);
      }

      // Calculate average strength with penalty for very weak spots
      const averageStrength =
        totalStrength / sampleSize + (minStrength < -85 ? -10 : 0);

      if (averageStrength > bestAverageStrength) {
        bestAverageStrength = averageStrength;
        bestPosition = testPosition;
      }
    }
  }

  return bestPosition;
};

// Convert real-world distance to a human-readable format
export const formatRealDistance = (pixelDistance: number, scale: number | null): string => {
  if (!scale) return `${pixelDistance.toFixed(1)} pixels`;
  
  const feet = pixelDistance / scale;
  
  if (feet < 1) {
    // Show in inches if less than a foot
    return `${(feet * 12).toFixed(1)}"`;
  } else {
    // Show in feet and inches format for clarity
    const wholeFeet = Math.floor(feet);
    const inches = Math.round((feet - wholeFeet) * 12);
    
    if (inches === 0) {
      return `${wholeFeet}'`;
    } else if (inches === 12) {
      return `${wholeFeet + 1}'`;
    } else {
      return `${wholeFeet}' ${inches}"`;
    }
  }
};

// Calculate coverage percentage at different signal levels
export const calculateCoverage = (
  floorPlan: FloorPlan,
  routerPosition: Position,
  scale: number | null
): { excellent: number, good: number, fair: number, poor: number, bad: number } => {
  const sampleSize = 1000;
  let excellent = 0, good = 0, fair = 0, poor = 0, bad = 0;
  
  for (let i = 0; i < sampleSize; i++) {
    const sampleX = Math.random() * floorPlan.width;
    const sampleY = Math.random() * floorPlan.height;
    
    const strength = calculateSignalAtPoint(floorPlan, routerPosition, {
      x: sampleX,
      y: sampleY,
    }, scale);
    
    if (strength > -50) excellent++;
    else if (strength > -60) good++;
    else if (strength > -70) fair++;
    else if (strength > -80) poor++;
    else bad++;
  }
  
  return {
    excellent: excellent / sampleSize * 100,
    good: good / sampleSize * 100,
    fair: fair / sampleSize * 100,
    poor: poor / sampleSize * 100,
    bad: bad / sampleSize * 100
  };
};