import React from 'react';
import { WallMaterial } from '@/types';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface DrawingToolsProps {
  selectedMaterial: WallMaterial;
  onMaterialChange: (material: WallMaterial) => void;
  onClear: () => void;
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
  onClear 
}) => {
  return (
    <div className="drawing-tools flex items-center gap-3">
      <Select 
        value={selectedMaterial}
        onChange={(e) => onMaterialChange(e.target.value as WallMaterial)}
        options={materialOptions}
        label="Wall Material"
      />
      
      <Button onClick={onClear} variant="danger">
        Clear Walls
      </Button>
    </div>
  );
};

export default DrawingTools;