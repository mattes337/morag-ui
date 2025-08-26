'use client';

import React from 'react';
import { Switch } from './switch';
import { Settings, Zap } from 'lucide-react';

interface ProcessingModeToggleProps {
  mode: 'MANUAL' | 'AUTOMATIC';
  onModeChange: (mode: 'MANUAL' | 'AUTOMATIC') => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProcessingModeToggle({
  mode,
  onModeChange,
  disabled = false,
  size = 'md',
  className = ''
}: ProcessingModeToggleProps) {
  const isAutomatic = mode === 'AUTOMATIC';

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleToggle = () => {
    if (!disabled) {
      onModeChange(isAutomatic ? 'MANUAL' : 'AUTOMATIC');
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Manual Mode */}
      <div className={`flex items-center space-x-2 transition-all duration-200 ${
        !isAutomatic
          ? 'text-gray-900 font-semibold'
          : 'text-gray-400 font-normal'
      }`}>
        <Settings className={`${iconSizeClasses[size]} ${!isAutomatic ? 'text-gray-700' : 'text-gray-400'}`} />
        <span className={sizeClasses[size]}>
          Manual
        </span>
      </div>

      <Switch
        checked={isAutomatic}
        onCheckedChange={handleToggle}
        disabled={disabled}
        className="data-[state=checked]:bg-blue-600"
      />

      {/* Automatic Mode */}
      <div className={`flex items-center space-x-2 transition-all duration-200 ${
        isAutomatic
          ? 'text-blue-700 font-semibold'
          : 'text-gray-400 font-normal'
      }`}>
        <Zap className={`${iconSizeClasses[size]} ${isAutomatic ? 'text-blue-500' : 'text-gray-400'}`} />
        <span className={sizeClasses[size]}>
          Automatic
        </span>
      </div>
    </div>
  );
}

export default ProcessingModeToggle;