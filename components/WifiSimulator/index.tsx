"use client";

import React, { useState, useEffect } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import DrawingTools from './DrawingTools';
import SimulationControls from './SimulationControls';
import Legend from './Legend';
import { Wall, Position, SimulationMode, WallMaterial, SignalPoint } from '@/types';
import { calculateSignalStrength, findOptimalPosition } from './utils/signalCalculation';
import useLocalStorage from '@/hooks/useLocalStorage';
import { defaultFloorPlanSize } from '@/utils/constants';

const WifiSimulator = () => {
  const [floorPlan, setFloorPlan] = useLocalStorage('floorPlan', {
    walls: [] as Wall[],
    width: defaultFloorPlanSize.width,
    height: defaultFloorPlanSize.height,
  });
  
  const [routerPosition, setRouterPosition] = useState<Position>({ x: Math.floor(floorPlan.width / 2), y: Math.floor(floorPlan.height / 2) });
  const [signalStrengthMap, setSignalStrengthMap] = useState<SignalPoint[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentWall, setCurrentWall] = useState<Partial<Wall> | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<WallMaterial>('drywall');
  const [mode, setMode] = useState<SimulationMode>('draw');
  
  // Calculate signal strength when needed
  useEffect(() => {
    if (mode === 'simulate') {
      const strengthMap = calculateSignalStrength(floorPlan, routerPosition);
      setSignalStrengthMap(strengthMap);
    }
  }, [routerPosition, floorPlan, mode]);
  
  const handleRouterDragEnd = (e: any) => {
    setRouterPosition({
      x: e.target.x(),
      y: e.target.y(),
    });
  };
  

  const getMaterialColor = (material: WallMaterial) => {
    switch(material) {
      case 'drywall': return '#E0E0E0'; // Light gray
      case 'concrete': return '#A0A0A0'; // Dark gray
      case 'glass': return '#ADD8E6'; // Light blue
      case 'wood': return '#D2B48C'; // Tan
      case 'metal': return '#C0C0C0'; // Silver
      case 'brick': return '#B22222'; // Firebrick
      default: return '#000000'; // Black
    }
  };

  // Drawing mode functions
  const handleCanvasMouseDown = (e: any) => {
    if (mode !== 'draw') return;
    
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
      color: getMaterialColor(selectedMaterial) // Add this function
    });
  };
  
  const handleCanvasMouseMove = (e: any) => {
    if (!drawing || !currentWall || mode !== 'draw') return;
    
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    
    setCurrentWall({
      ...currentWall,
      x2: pointerPosition.x,
      y2: pointerPosition.y
    });
  };
  
  const handleCanvasMouseUp = () => {
    if (!drawing || !currentWall || mode !== 'draw') return;
    
    // Only add wall if it has length
    if (
      currentWall.x1 !== undefined && 
      currentWall.y1 !== undefined && 
      currentWall.x2 !== undefined && 
      currentWall.y2 !== undefined &&
      (Math.abs(currentWall.x1 - currentWall.x2) > 5 || Math.abs(currentWall.y1 - currentWall.y2) > 5)
    ) {
      setFloorPlan({
        ...floorPlan,
        walls: [
          ...floorPlan.walls,
          currentWall as Wall
        ]
      });
    }
    
    setDrawing(false);
    setCurrentWall(null);
  };

  const clearFloorPlan = () => {
    setFloorPlan({
      ...floorPlan,
      walls: []
    });
  };
  
  const toggleMode = () => {
    setMode(mode === 'draw' ? 'simulate' : 'draw');
  };
  
  const handleFindOptimalPosition = () => {
    const bestPosition = findOptimalPosition(floorPlan);
    setRouterPosition(bestPosition);
  };
  
  const handleMaterialChange = (material: WallMaterial) => {
    setSelectedMaterial(material);
  };
  
  return (
    <div className="wifi-simulator max-w-4xl mx-auto">
      <div className="controls flex flex-wrap justify-between mb-4">
        {mode === 'draw' ? (
          <DrawingTools 
            selectedMaterial={selectedMaterial}
            onMaterialChange={handleMaterialChange}
            onClear={clearFloorPlan}
          />
        ) : (
          <SimulationControls
            onFindOptimalPosition={handleFindOptimalPosition}
          />
        )}
        
        <button 
          onClick={toggleMode} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {mode === 'draw' ? 'Start Simulation' : 'Return to Drawing'}
        </button>
      </div>
      
      <Stage 
        width={floorPlan.width} 
        height={floorPlan.height}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        className="bg-white"
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
        </Layer>
        
        {/* All layers rendered by child components */}
        {mode === 'simulate' && (
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
          <Rect
            key={wall.id}
            x={Math.min(wall.x1, wall.x2)}
            y={Math.min(wall.y1, wall.y2)}
            width={Math.abs(wall.x2 - wall.x1) || 1}
            height={Math.abs(wall.y2 - wall.y1) || 1}
            fill={wall.color}
          />
        ))}
          
          {/* Current Wall being drawn */}
          {currentWall && (
            <Rect
              x={Math.min(currentWall.x1 || 0, currentWall.x2 || 0)}
              y={Math.min(currentWall.y1 || 0, currentWall.y2 || 0)}
              width={Math.abs((currentWall.x2 || 0) - (currentWall.x1 || 0)) || 1}
              height={Math.abs((currentWall.y2 || 0) - (currentWall.y1 || 0)) || 1}
              fill={currentWall.color || '#000'}
              opacity={0.7}
            />
          )}
        </Layer>
      </Stage>
      
      <Legend mode={mode} />
      
      <div className="instructions mt-4">
        <h3 className="font-bold">Instructions:</h3>
        {mode === 'draw' ? (
          <p>Click and drag to draw walls. Select wall material from the dropdown.</p>
        ) : (
          <p>Drag the blue router to see how signal strength changes. Use "Find Optimal Position" to automatically place the router.</p>
        )}
      </div>
    </div>
  );
};

export default WifiSimulator;