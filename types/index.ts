export type DeviceType = 'router' | 'extender';

export type WallMaterial = 'drywall' | 'concrete' | 'glass' | 'wood' | 'metal' | 'brick';

export type SimulationMode = 'draw' | 'simulate';

export interface Position {
  x: number;
  y: number;
}

export interface NetworkDevice {
  id: string;
  x: number;
  y: number;
  type: DeviceType;
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  material: WallMaterial;
  color: string; // Add color property
  width: number;
}

export interface SignalPoint {
  x: number;
  y: number;
  strength: number;
  color: string;
  sourceDeviceId?: string; // ID of the device providing the signal
}

export interface FloorPlan {
  walls: Wall[];
  width: number;
  height: number;
}