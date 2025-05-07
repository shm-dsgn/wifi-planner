import React, { useState } from "react";
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
  scale: { value: number; unit: string } | null;
  setScale: React.Dispatch<React.SetStateAction<{ value: number; unit: string } | null>>;
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
  scale,
  setScale,
}) => {
  const [hoveredWallId, setHoveredWallId] = useState<string | null>(null);

  // Find main router
  const router = devices.find(device => device.type === 'router');
  const extenders = devices.filter(device => device.type === 'extender');

  // Helper to get wall name (A, B, C, ...)
  const getWallName = (idx: number) => String.fromCharCode(65 + idx);

  // Helper to get wall length in px and real units
  const getWallLengths = (wall: Wall) => {
    const px = Math.sqrt(Math.pow(wall.x2 - wall.x1, 2) + Math.pow(wall.y2 - wall.y1, 2));
    const real = scale ? px * scale.value : null;
    return { px, real };
  };

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
          {walls.map((wall, idx) => {
            const isHovered = wall.id === hoveredWallId;
            const { px, real } = getWallLengths(wall);
            const midX = (wall.x1 + wall.x2) / 2;
            const midY = (wall.y1 + wall.y2) / 2;
            return (
              <React.Fragment key={wall.id}>
                <Line
                  points={[wall.x1, wall.y1, wall.x2, wall.y2]}
                  stroke={wall.color}
                  strokeWidth={wall.width || wallWidth}
                  lineCap="round"
                  lineJoin="round"
                  onMouseEnter={() => setHoveredWallId(wall.id)}
                  onMouseLeave={() => setHoveredWallId(null)}
                />
                {isHovered && (
                  <Text
                    x={midX}
                    y={midY - 20}
                    text={`Wall ${getWallName(idx)}\n${px.toFixed(1)} px${scale ? ` / ${(real!).toFixed(2)} ${scale.unit}` : ""}`}
                    fontSize={16}
                    fill="#333"
                    align="center"
                    verticalAlign="middle"
                    offsetX={60}
                    offsetY={10}
                    padding={4}
                    background="rgba(255,255,255,0.8)"
                  />
                )}
              </React.Fragment>
            );
          })}

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