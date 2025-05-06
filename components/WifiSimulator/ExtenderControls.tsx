import React from "react";
import { Button } from "@/components/ui/button";
import { WifiOff, Wifi, Plus, Trash2 } from "lucide-react";
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
              <Wifi className="mr-1" />
              {showExtenderControls ? "Hide Extenders" : "Extenders"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>WiFi Extender Controls</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showExtenderControls && (
        <div className="mt-2 p-3 bg-gray-100 rounded-md shadow-sm">
          <h4 className="font-medium text-sm mb-2">WiFi Extenders</h4>
          
          {/* Add extender button */}
          <Button
            onClick={onClickCanvas}
            className={`mb-3 w-full text-sm ${isPlacingExtender ? 'bg-green-600' : 'bg-green-500'} text-white hover:bg-green-600`}
            size="sm"
          >
            <Plus size={16} className="mr-1" />
            {isPlacingExtender ? 'Click on map to place' : 'Add Extender'}
          </Button>
          
          {/* List of current extenders */}
          {extenders.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-1">
                Extenders relay the signal they receive from your main router
              </p>
              {extenders.map(extender => (
                <div key={extender.id} className="flex justify-between items-center text-xs p-2 bg-white rounded border border-gray-200">
                  <span>Extender at ({Math.round(extender.x)}, {Math.round(extender.y)})</span>
                  <Button
                    onClick={() => onRemoveExtender(extender.id)}
                    variant="destructive"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Remove extender"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No extenders placed yet. Add extenders to improve coverage in areas with weak signal.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ExtenderControls;