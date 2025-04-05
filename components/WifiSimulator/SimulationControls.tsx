import React from 'react';
import { Button } from '@/components/ui/Button';

interface SimulationControlsProps {
  onFindOptimalPosition: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({ 
  onFindOptimalPosition 
}) => {
  return (
    <div className="simulation-controls flex items-center gap-3">
      <Button onClick={onFindOptimalPosition} variant="success">
        Find Optimal Position
      </Button>
    </div>
  );
};

export default SimulationControls;