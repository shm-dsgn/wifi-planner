// hooks/useBackgroundImage.ts
import { useState, useRef } from "react";

export function useBackgroundImage(floorPlanWidth: number, floorPlanHeight: number) {
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;

        img.onload = () => {
          // Scale the image to fit within the canvas while maintaining aspect ratio
          const scale = Math.min(
            floorPlanWidth / img.width,
            floorPlanHeight / img.height
          );

          img.width = img.width * scale;
          img.height = img.height * scale;

          setBackgroundImage(img);
        };
      };

      reader.readAsDataURL(files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageOpacity(parseFloat(e.target.value));
  };

  return {
    backgroundImage,
    imageOpacity,
    fileInputRef,
    handleImageUpload,
    handleUploadClick,
    handleRemoveImage,
    handleOpacityChange,
  };
}