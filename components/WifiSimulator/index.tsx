"use client";

import React, { useState } from "react";
import { useWifiSimulation } from "./hooks/useWifiSimulation";
import { useWallDrawing } from "./hooks/useWallDrawing";
import { useBackgroundImage } from "./hooks/useBackgroundImage";
import SimulationCanvas from "./SimulationCanvas";
import DrawingTools from "./DrawingTools";
import Legend from "./Legend";
import Instructions from "./Instructions";
import BackgroundImageControls from "./BackgroundImageControls";
import ModeToggleButton from "./ModeToggleButton";
import ExtenderControls from "./ExtenderControls";
import { Position } from "@/types";

const WifiSimulator = () => {
  // Core simulation logic
  const {
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
  } = useWifiSimulation();

  // Wall drawing logic
  const {
    drawing,
    currentWall,
    selectedMaterial,
    WALL_WIDTH,
    historyIndex,
    history,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleUndo,
    handleRedo,
    clearFloorPlan,
    handleMaterialChange,
  } = useWallDrawing(floorPlan, setFloorPlan);

  // Background image management
  const {
    backgroundImage,
    imageOpacity,
    fileInputRef,
    handleImageUpload,
    handleUploadClick,
    handleRemoveImage,
    handleOpacityChange,
  } = useBackgroundImage(floorPlan.width, floorPlan.height);

  // Extender controls
  const [showExtenderControls, setShowExtenderControls] = React.useState(false);
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);
  const [scale, setScale] = useState<{ value: number; unit: string } | null>(null); // real-world units per pixel and unit

  // Toggle extender controls visibility
  const toggleExtenderControls = () => {
    setShowExtenderControls(prev => !prev);
  };

  // Handle clicking to place extender
  const handleCanvasClick = (e: any) => {
    if (mode === "simulate" && isPlacingExtender) {
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      
      addExtender({
        x: pointerPosition.x,
        y: pointerPosition.y
      });
    }
  };

  // Toggle extender placement mode
  const handleToggleExtenderPlacement = () => {
    setIsPlacingExtender(prev => !prev);
  };

  // Handle device drag start
  const handleDeviceDragStart = (id: string) => {
    setDraggingDeviceId(id);
  };

  // Handle device drag end
  const handleDeviceDragEnd = (id: string, e: any) => {
    const position = {
      x: e.target.x(),
      y: e.target.y()
    };
    
    // Update device position
    const updatedDevices = devices.map(device => 
      device.id === id 
        ? { ...device, x: position.x, y: position.y }
        : device
    );
    
    setDevices(updatedDevices);
    setDraggingDeviceId(null);
    
    // Recalculate signal strength if in simulation mode
    if (mode === "simulate") {
      handleDeviceDrag(id, position);
    }
  };

  return (
    <div className="wifi-simulator mx-auto">
      <Instructions mode={mode} wallWidth={WALL_WIDTH} />

      <div className="controls flex flex-wrap gap-8 items-end mb-4">
        {mode === "draw" && (
          <DrawingTools
            selectedMaterial={selectedMaterial}
            onMaterialChange={handleMaterialChange}
            onClear={clearFloorPlan}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            scale={scale}
            setScale={setScale}
            walls={floorPlan.walls}
          />
        )}

        <ModeToggleButton mode={mode} onToggle={toggleMode} />

        {mode === "simulate" && (
          <ExtenderControls
            devices={devices}
            showExtenderControls={showExtenderControls}
            onToggleControls={toggleExtenderControls}
            onRemoveExtender={removeExtender}
            onClickCanvas={handleToggleExtenderPlacement}
            isPlacingExtender={isPlacingExtender}
          />
        )}

        <BackgroundImageControls
          backgroundImage={backgroundImage}
          imageOpacity={imageOpacity}
          fileInputRef={fileInputRef}
          onUploadClick={handleUploadClick}
          onRemoveImage={handleRemoveImage}
          onOpacityChange={handleOpacityChange}
          onImageUpload={handleImageUpload}
        />
      </div>

      <SimulationCanvas
        width={floorPlan.width}
        height={floorPlan.height}
        walls={floorPlan.walls}
        currentWall={currentWall}
        devices={devices}
        signalStrengthMap={signalStrengthMap}
        backgroundImage={backgroundImage}
        imageOpacity={imageOpacity}
        mode={mode}
        wallWidth={WALL_WIDTH}
        isPlacingExtender={isPlacingExtender && mode === "simulate"}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDeviceDragStart={handleDeviceDragStart}
        onDeviceDragEnd={handleDeviceDragEnd}
        onCanvasClick={handleCanvasClick}
        scale={scale}
        setScale={setScale}
      />

      <Legend mode={mode} />
    </div>
  );
};

export default WifiSimulator;