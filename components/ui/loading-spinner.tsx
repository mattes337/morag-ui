'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'inline';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default',
  className
}: LoadingSpinnerProps) {
  if (variant === 'inline') {
    return (
      <Loader2 
        className={cn('animate-spin', sizeClasses[size], className)} 
      />
    );
  }

  return (
    <div 
      className={cn('flex items-center justify-center p-8', className)}
    >
      <Loader2 
        className={cn('animate-spin', sizeClasses[size])} 
      />
    </div>
  );
}

export default LoadingSpinner;