import React from 'react';
import { WallMaterial } from '@/types';
import { Button } from "@/components/ui/button"
import { Select } from '@/components/ui/Select';

interface DrawingToolsProps {
  selectedMaterial: WallMaterial;
  onMaterialChange: (material: WallMaterial) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const materialOptions = [
  { value: 'drywall', label: 'Drywall' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'glass', label: 'Glass' },
  { value: 'wood', label: 'Wood' },
  { value: 'metal', label: 'Metal' },
  { value: 'brick', label: 'Brick' },
  { value: 'other', label: 'Other' }
];

const DrawingTools: React.FC<DrawingToolsProps> = ({ 
  selectedMaterial, 
  onMaterialChange, 
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  return (
    <div className="drawing-tools flex items-center gap-3">
      <Select 
        value={selectedMaterial}
        onChange={(e) => onMaterialChange(e.target.value as WallMaterial)}
        options={materialOptions}
        label="Wall Material"
      />
      
      <div className="history-buttons flex gap-2">
        <Button 
          onClick={onUndo} 
          disabled={!canUndo}
          variant="secondary"
          title="Undo"
        >
          Undo
        </Button>
        
        <Button 
          onClick={onRedo} 
          disabled={!canRedo}
          variant="secondary"
          title="Redo"
        >
          Redo
        </Button>
      </div>
      
      <Button onClick={onClear} variant="destructive">
        Clear Walls
      </Button>
    </div>
  );
};

export default DrawingTools;