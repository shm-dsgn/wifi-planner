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
        <h3 className="font-bold mb-2">Materials:</h3>
        <div className="flex gap-2">
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
          <h3 className="font-bold mb-2">Signal Strength:</h3>
          <div className="flex gap-2">
            {SIGNAL_STRENGTH_LEVELS.map(level => (
              <div key={level.label} className="flex items-center">
                <div 
                  className="w-4 h-4 mr-2 rounded-md" 
                  style={{ backgroundColor: level.color }} 
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