import React from "react";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NetworkDevice } from "@/types";

interface ExtenderControlsProps {
  devices: NetworkDevice[];
  showExtenderControls: boolean;
  onToggleControls: () => void;
  onRemoveExtender: (id: string) => void;
  onClickCanvas: (e: React.MouseEvent) => void;
  isPlacingExtender: boolean;
}

const ExtenderControls: React.FC<ExtenderControlsProps> = ({
  devices,
  showExtenderControls,
  onToggleControls,
  onRemoveExtender,
  onClickCanvas,
  isPlacingExtender,
}) => {
  const extenders = devices.filter(device => device.type === 'extender');

  return (
    <div className="extender-controls">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onToggleControls}
              className={`px-3 py-1 ${showExtenderControls ? 'bg-blue-600' : 'bg-blue-500'} text-white hover:bg-blue-600 transition`}
            >
              <Wifi />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>WiFi Extender Controls</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showExtenderControls && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md">
          <h4 className="font-medium text-sm mb-2">WiFi Extenders</h4>
          
          {/* Add extender button */}
          <Button
            onClick={onClickCanvas}
            className={`mb-2 w-full text-sm ${isPlacingExtender ? 'bg-green-600' : 'bg-green-500'} text-white hover:bg-green-600`}
            size="sm"
          >
            {isPlacingExtender ? 'Click on map to place' : 'Add Extender'}
          </Button>
          
          {/* List of current extenders */}
          {extenders.length > 0 ? (
            <div className="space-y-1">
              {extenders.map(extender => (
                <div key={extender.id} className="flex justify-between items-center text-xs p-1 bg-white rounded">
                  <span>Extender at ({Math.round(extender.x)}, {Math.round(extender.y)})</span>
                  <Button
                    onClick={() => onRemoveExtender(extender.id)}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <WifiOff size={14} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No extenders placed</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtenderControls;