import { WallMaterial } from "@/types";

//Canvas size in pixels
export const defaultFloorPlanSize = {
  width: 1200,
  height: 650,
};

export const ROUTER_POWER = 20; // dBm - typical for home routers
export const FREQUENCY = 2.4; // GHz - standard WiFi frequency

//These are average values for the materials, they can differ from real life situations
export const WALL_ATTENUATION: Record<WallMaterial, number> = {
  drywall: 3, // dB
  concrete: 12, // dB
  glass: 2, // dB
  wood: 4, // dB
  metal: 20, // dB
  brick: 8, // dB
};

//Used for select menu, and for the wall material colors
export const WALL_MATERIALS = [
  { value: "drywall", label: "Drywall", color: "#CCCCCC" },
  { value: "concrete", label: "Concrete", color: "#888888" },
  { value: "glass", label: "Glass", color: "#AADDFF" },
  { value: "wood", label: "Wood", color: "#AA7744" },
  { value: "metal", label: "Metal", color: "#AAAAAA" },
  { value: "brick", label: "Brick", color: "#BB4444" },
];

//Not sure yet what is this exactly for, but it is used in the code
export const SIGNAL_STRENGTH_LEVELS = [
  { threshold: -30, label: "Excellent", color: "#00FF00" },
  { threshold: -50, label: "Good", color: "#90EE90" },
  { threshold: -70, label: "Fair", color: "#FFFF00" },
  { threshold: -80, label: "Poor", color: "#FFA500" },
  { threshold: -100, label: "Very Poor", color: "#FF0000" },
];
