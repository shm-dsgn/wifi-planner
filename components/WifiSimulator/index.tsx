"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Circle, Image as KonvaImage } from 'react-konva';
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
    width: 800,
    height: 600,
  });
  
  const [routerPosition, setRouterPosition] = useState<Position>({ x: Math.floor(floorPlan.width / 2), y: Math.floor(floorPlan.height / 2) });
  const [signalStrengthMap, setSignalStrengthMap] = useState<SignalPoint[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [currentWall, setCurrentWall] = useState<Partial<Wall> | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<WallMaterial>('drywall');
  const [mode, setMode] = useState<SimulationMode>('draw');
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const [isDraggingRouter, setIsDraggingRouter] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Calculate signal strength when needed
  useEffect(() => {
    if (mode === 'simulate') {
      const strengthMap = calculateSignalStrength(floorPlan, routerPosition);
      setSignalStrengthMap(strengthMap);
    }
  }, [routerPosition, floorPlan, mode]);
  
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
    // Ignore if we're in simulate mode or if we're clicking the router
    if (mode !== 'draw' || isDraggingRouter) return;
    
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
      color: getMaterialColor(selectedMaterial)
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
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          // Scale the image to fit within the canvas while maintaining aspect ratio
          const scale = Math.min(
            floorPlan.width / img.width,
            floorPlan.height / img.height
          );
          
          img.width = img.width * scale;
          img.height = img.height * scale;
          
          setBackgroundImage(img);
        };
      };
      
      reader.readAsDataURL(files[0]);
    }
  };
  
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleRemoveImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageOpacity(parseFloat(e.target.value));
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
      
      {/* Floor plan image controls */}
      <div className="image-controls mb-4 p-3 border rounded bg-gray-50">
        <h3 className="font-bold mb-2">Floor Plan Background</h3>
        <div className="flex flex-wrap items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            onClick={handleUploadClick}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Upload Floor Plan Image
          </button>
          
          {backgroundImage && (
            <>
              <div className="flex items-center gap-2">
                <label htmlFor="opacity">Opacity:</label>
                <input
                  id="opacity"
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={imageOpacity}
                  onChange={handleOpacityChange}
                  className="w-24"
                />
                <span>{Math.round(imageOpacity * 100)}%</span>
              </div>
              
              <button
                onClick={handleRemoveImage}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Remove Image
              </button>
            </>
          )}
        </div>
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
          
          {/* Floor plan image */}
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={(floorPlan.width - backgroundImage.width) / 2}
              y={(floorPlan.height - backgroundImage.height) / 2}
              width={backgroundImage.width}
              height={backgroundImage.height}
              opacity={imageOpacity}
            />
          )}
        </Layer>
        
        {/* Signal strength visualization layer */}
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
        
        {/* Router Layer */}
        <Layer>
          <Circle
            x={routerPosition.x}
            y={routerPosition.y}
            radius={10}
            fill="#3498db"
            stroke="#2980b9"
            strokeWidth={2}
            draggable={true}
            onDragStart={handleRouterDragStart}
            onDragEnd={handleRouterDragEnd}
          />
        </Layer>
      </Stage>
      
      <Legend mode={mode} />
      
      <div className="instructions mt-4">
        <h3 className="font-bold">Instructions:</h3>
        {mode === 'draw' ? (
          <p>Click and drag to draw walls. Select wall material from the dropdown. Upload a floor plan image to use as a stencil.</p>
        ) : (
          <p>Drag the blue router to see how signal strength changes. Use "Find Optimal Position" to automatically place the router.</p>
        )}
      </div>
    </div>
  );
};

export default WifiSimulator;