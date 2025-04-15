// components/WifiSimulator/SimulationCanvas.tsx
import React from "react";
import { Stage, Layer, Rect, Circle, Image as KonvaImage, Line } from "react-konva";
import { SimulationMode, Wall, Position, SignalPoint } from "@/types";

interface SimulationCanvasProps {
  width: number;
  height: number;
  walls: Wall[];
  currentWall: Partial<Wall> | null;
  routerPosition: Position;
  signalStrengthMap: SignalPoint[];
  backgroundImage: HTMLImageElement | null;
  imageOpacity: number;
  mode: SimulationMode;
  wallWidth: number;
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: () => void;
  onRouterDragStart: () => void;
  onRouterDragEnd: (e: any) => void;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  width,
  height,
  walls,
  currentWall,
  routerPosition,
  signalStrengthMap,
  backgroundImage,
  imageOpacity,
  mode,
  wallWidth,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onRouterDragStart,
  onRouterDragEnd,
}) => {
  return (
    <div className="canvas-container mx-auto" style={{ width: `${width}px` }}>
      <Stage
        width={width}
        height={height}
        onMouseDown={mode === "draw" ? onMouseDown : undefined}
        onMouseMove={mode === "draw" ? onMouseMove : undefined}
        onMouseUp={mode === "draw" ? onMouseUp : undefined}
        className="bg-white border border-gray-300"
        style={{ display: "block" }}
      >
        {/* Background Layer */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="white"
            stroke="gray"
          />

          {/* Floor plan image */}
          {backgroundImage && (
            <KonvaImage
              image={backgroundImage}
              x={(width - backgroundImage.width) / 2}
              y={(height - backgroundImage.height) / 2}
              width={backgroundImage.width}
              height={backgroundImage.height}
              opacity={imageOpacity}
            />
          )}
        </Layer>

        {/* Signal strength visualization layer */}
        {mode === "simulate" && (
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
          {walls.map((wall) => (
            <Line
              key={wall.id}
              points={[wall.x1, wall.y1, wall.x2, wall.y2]}
              stroke={wall.color}
              strokeWidth={wall.width || wallWidth}
              lineCap="round"
              lineJoin="round"
            />
          ))}

          {/* Current Wall being drawn */}
          {currentWall && (
            <Line
              points={[
                currentWall.x1 || 0,
                currentWall.y1 || 0,
                currentWall.x2 || 0,
                currentWall.y2 || 0,
              ]}
              stroke={currentWall.color || "#000"}
              strokeWidth={wallWidth}
              lineCap="round"
              lineJoin="round"
              opacity={0.7}
            />
          )}
        </Layer>

        {/* Router Layer */}
        <Layer>
          <Circle
            x={routerPosition.x}
            y={routerPosition.y}
            radius={5}
            fill="#EB8232"
            stroke="#9A4C11"
            strokeWidth={2}
            draggable={true}
            onDragStart={onRouterDragStart}
            onDragEnd={onRouterDragEnd}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default SimulationCanvas;