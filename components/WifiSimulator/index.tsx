// components/WifiSimulator/index.tsx
"use client";

import React from "react";
import { useWifiSimulation } from "./hooks/useWifiSimulation";
import { useWallDrawing } from "./hooks/useWallDrawing";
import { useBackgroundImage } from "./hooks/useBackgroundImage";
import SimulationCanvas from "./SimulationCanvas";
import DrawingTools from "./DrawingTools";
import Legend from "./Legend";
import Instructions from "./Instructions";
import BackgroundImageControls from "./BackgroundImageControls";
import ModeToggleButton from "./ModeToggleButton";

const WifiSimulator = () => {
  // Core simulation logic
  const {
    floorPlan,
    setFloorPlan,
    routerPosition,
    signalStrengthMap,
    mode,
    toggleMode,
    isDraggingRouter,
    handleRouterDragStart,
    handleRouterDragEnd,
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
        routerPosition={routerPosition}
        signalStrengthMap={signalStrengthMap}
        backgroundImage={backgroundImage}
        imageOpacity={imageOpacity}
        mode={mode}
        wallWidth={WALL_WIDTH}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onRouterDragStart={handleRouterDragStart}
        onRouterDragEnd={handleRouterDragEnd}
      />

      <Legend mode={mode} />
    </div>
  );
};

export default WifiSimulator;
