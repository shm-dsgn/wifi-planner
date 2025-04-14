// components/WifiSimulator/BackgroundImageControls.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ImageUp, ImageOff } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BackgroundImageControlsProps {
  backgroundImage: HTMLImageElement | null;
  imageOpacity: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onUploadClick: () => void;
  onRemoveImage: () => void;
  onOpacityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BackgroundImageControls: React.FC<BackgroundImageControlsProps> = ({
  backgroundImage,
  imageOpacity,
  fileInputRef,
  onUploadClick,
  onRemoveImage,
  onOpacityChange,
  onImageUpload,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageUpload}
        className="hidden"
      />
      {!backgroundImage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUploadClick}
                className="px-3 py-1 bg-blue-500 text-white hover:bg-blue-600 transition"
              >
                <ImageUp />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Upload floor plan</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

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
              onChange={onOpacityChange}
              className="w-24"
            />
            <span>{Math.round(imageOpacity * 100)}%</span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onRemoveImage}
                  className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 transition"
                >
                  <ImageOff />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Remove floor plan</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
    </div>
  );
};

export default BackgroundImageControls;