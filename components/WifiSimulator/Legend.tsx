import React from 'react';
import { SimulationMode } from '@/types';
import { WALL_MATERIALS, SIGNAL_STRENGTH_LEVELS } from '@/utils/constants';

interface LegendProps {
  mode: SimulationMode;
}

const Legend: React.FC<LegendProps> = ({ mode }) => {
  return (
    <div className="legend mt-4 flex flex-wrap gap-8">
      <div className="material-legend">
        <h3 className="font-medium mb-2 text-sm">Materials:</h3>
        <div className="flex gap-2 text-xs">
          {WALL_MATERIALS.map(material => (
            <div key={material.value} className="flex items-center">
              <div 
                className="w-4 h-4 mr-2 rounded-md" 
                style={{ backgroundColor: material.color }} 
              />
              <span>{material.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {mode === 'simulate' && (
        <div className="signal-legend">
          <h3 className="font-medium mb-2 text-sm">Signal Strength:</h3>
          <div className="flex gap-2 text-xs">
            {SIGNAL_STRENGTH_LEVELS.map(level => (
              <div key={level.label} className="flex items-center">
                <div 
                  className="w-4 h-4 mr-2 rounded-md" 
                  style={{ backgroundColor: level.color, opacity: 0.5 }} 
                />
                <span>{level.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Legend;