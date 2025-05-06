"use client";

import React, { useState } from "react";
import { useWifiSimulation } from "./hooks/useWifiSimulation";
import { useWallDrawing } from "./hooks/useWallDrawing";
import { useBackgroundImage } from "./hooks/useBackgroundImage";
import { useNetworkDevices } from "./hooks/useNetworkDevices";
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
    signalStrengthMap,
    mode,
    toggleMode,
  } = useWifiSimulation();

  // Network devices management (router + extenders)
  const initialRouterPosition: Position = {
    x: Math.floor(floorPlan.width / 2),
    y: Math.floor(floorPlan.height / 2)
  };

  const {
    devices,
    isDraggingDevice,
    showExtenderControls,
    addExtender,
    removeExtender,
    handleDeviceDragStart,
    handleDeviceDragEnd,
    toggleExtenderControls,
  } = useNetworkDevices(initialRouterPosition);

  // Extender placement state
  const [isPlacingExtender, setIsPlacingExtender] = useState(false);

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

  // Handle clicking to place extender
  const handleCanvasClick = (e: any) => {
    if (mode === "simulate" && isPlacingExtender) {
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      
      addExtender({
        x: pointerPosition.x,
        y: pointerPosition.y
      });
      
      // Exit placement mode after placing
      setIsPlacingExtender(false);
    }
  };

  // Toggle extender placement mode
  const handleToggleExtenderPlacement = () => {
    setIsPlacingExtender(prev => !prev);
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
        onDeviceDragEnd={(id, e) => {
          const position = { x: e.target.x(), y: e.target.y() };
          handleDeviceDragEnd(id, position);
        }}
        onCanvasClick={handleCanvasClick}
      />

      <Legend mode={mode} />
    </div>
  );
};

export default WifiSimulator;