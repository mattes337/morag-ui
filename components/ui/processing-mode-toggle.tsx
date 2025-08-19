'use client';

import React from 'react';
import { Switch } from './switch';
import { Badge } from './badge';
import { Settings, Zap } from 'lucide-react';

interface ProcessingModeToggleProps {
  mode: 'MANUAL' | 'AUTOMATIC';
  onModeChange: (mode: 'MANUAL' | 'AUTOMATIC') => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

export function ProcessingModeToggle({
  mode,
  onModeChange,
  disabled = false,
  size = 'md',
  showLabels = true,
  className = ''
}: ProcessingModeToggleProps) {
  const isAutomatic = mode === 'AUTOMATIC';
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleToggle = () => {
    if (!disabled) {
      onModeChange(isAutomatic ? 'MANUAL' : 'AUTOMATIC');
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabels && (
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-gray-500" />
          <span className={`font-medium text-gray-700 ${sizeClasses[size]}`}>
            Manual
          </span>
        </div>
      )}
      
      <Switch
        checked={isAutomatic}
        onCheckedChange={handleToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-blue-600"
      />
      
      {showLabels && (
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className={`font-medium text-blue-700 ${sizeClasses[size]}`}>
            Automatic
          </span>
        </div>
      )}
      
      <Badge 
        variant={isAutomatic ? 'default' : 'secondary'}
        className={`ml-2 ${sizeClasses[size]}`}
      >
        {mode}
      </Badge>
    </div>
  );
}

export default ProcessingModeToggle;