import React from "react";
import { Stage, Layer, Rect, Circle, Image as KonvaImage, Line, Group, Text } from "react-konva";
import { SimulationMode, Wall, Position, SignalPoint, NetworkDevice } from "@/types";

interface SimulationCanvasProps {
  width: number;
  height: number;
  walls: Wall[];
  currentWall: Partial<Wall> | null;
  devices: NetworkDevice[];
  signalStrengthMap: SignalPoint[];
  backgroundImage: HTMLImageElement | null;
  imageOpacity: number;
  mode: SimulationMode;
  wallWidth: number;
  isPlacingExtender: boolean;
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: () => void;
  onDeviceDragStart: (id: string) => void;
  onDeviceDragEnd: (id: string, e: any) => void;
  onCanvasClick: (e: any) => void;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  width,
  height,
  walls,
  currentWall,
  devices,
  signalStrengthMap,
  backgroundImage,
  imageOpacity,
  mode,
  wallWidth,
  isPlacingExtender,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDeviceDragStart,
  onDeviceDragEnd,
  onCanvasClick,
}) => {
  // Find main router
  const router = devices.find(device => device.type === 'router');
  const extenders = devices.filter(device => device.type === 'extender');

  return (
    <div className="canvas-container mx-auto" style={{ width: `${width}px` }}>
      <Stage
        width={width}
        height={height}
        onMouseDown={mode === "draw" ? onMouseDown : undefined}
        onMouseMove={mode === "draw" ? onMouseMove : undefined}
        onMouseUp={mode === "draw" ? onMouseUp : undefined}
        onClick={mode === "simulate" && isPlacingExtender ? onCanvasClick : undefined}
        className="bg-white border border-gray-300"
        style={{ display: "block", cursor: isPlacingExtender ? "crosshair" : "default" }}
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

        {/* Network Devices Layer */}
        <Layer>
          {/* Extender-to-Router connections */}
          {mode === "simulate" && router && extenders.map((extender) => (
            <Line
              key={`conn-${extender.id}`}
              points={[router.x, router.y, extender.x, extender.y]}
              stroke="#87CEEB"
              strokeWidth={1}
              dash={[5, 3]}
              opacity={0.7}
            />
          ))}
          
          {/* Network Devices */}
          {devices.map((device) => (
            <Group key={device.id}>
              <Circle
                x={device.x}
                y={device.y}
                radius={device.type === 'router' ? 8 : 6}
                fill={device.type === 'router' ? "#EB8232" : "#32A4EB"}
                stroke={device.type === 'router' ? "#9A4C11" : "#1165A4"}
                strokeWidth={2}
                draggable={mode === "simulate"}
                onDragStart={() => onDeviceDragStart(device.id)}
                onDragEnd={(e) => onDeviceDragEnd(device.id, e)}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default SimulationCanvas;