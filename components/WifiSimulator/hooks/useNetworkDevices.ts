import { useState } from "react";
import { NetworkDevice, Position } from "@/types";

export function useNetworkDevices(initialRouterPosition: Position) {
  const [devices, setDevices] = useState<NetworkDevice[]>([
    { id: 'router-main', x: initialRouterPosition.x, y: initialRouterPosition.y, type: 'router' }
  ]);
  const [isDraggingDevice, setIsDraggingDevice] = useState<string | null>(null);
  const [showExtenderControls, setShowExtenderControls] = useState(false);

  // Add a new extender
  const addExtender = (position: Position) => {
    const newExtender: NetworkDevice = {
      id: `extender-${Date.now()}`,
      x: position.x,
      y: position.y,
      type: 'extender'
    };
    
    setDevices(prev => [...prev, newExtender]);
  };

  // Remove an extender
  const removeExtender = (id: string) => {
    setDevices(prev => prev.filter(device => device.id !== id));
  };

  // Handle device drag start
  const handleDeviceDragStart = (id: string) => {
    setIsDraggingDevice(id);
  };

  // Handle device drag end
  const handleDeviceDragEnd = (id: string, newPosition: Position) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === id 
          ? { ...device, x: newPosition.x, y: newPosition.y }
          : device
      )
    );
    setIsDraggingDevice(null);
  };

  // Toggle extender controls visibility
  const toggleExtenderControls = () => {
    setShowExtenderControls(prev => !prev);
  };

  // Get router position (for backward compatibility)
  const getRouterPosition = (): Position => {
    const router = devices.find(device => device.type === 'router');
    if (router) {
      return { x: router.x, y: router.y };
    }
    return initialRouterPosition;
  };

  // Update router position (for backward compatibility)
  const updateRouterPosition = (position: Position) => {
    setDevices(prev => 
      prev.map(device => 
        device.type === 'router' 
          ? { ...device, x: position.x, y: position.y }
          : device
      )
    );
  };

  return {
    devices,
    isDraggingDevice,
    showExtenderControls,
    addExtender,
    removeExtender,
    handleDeviceDragStart,
    handleDeviceDragEnd,
    toggleExtenderControls,
    getRouterPosition,
    updateRouterPosition
  };
}
