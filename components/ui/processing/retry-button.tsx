'use client';

import React from 'react';
import { Button } from '../button';
import { RotateCcw, Loader2 } from 'lucide-react';

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
  className?: string;
}

/**
 * A retry button component that ensures soft navigation without page reloads.
 * Prevents default form submission behavior and handles async retry operations.
 */
export function RetryButton({
  onRetry,
  isLoading = false,
  disabled = false,
  variant = 'outline',
  size = 'default',
  children,
  className = ''
}: RetryButtonProps) {
  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent any default behavior that might cause page reload
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || disabled) return;
    
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry operation failed:', error);
      // Don't throw the error to prevent unhandled promise rejections
    }
  };

  return (
    <Button
      type="button" // Explicitly set type to prevent form submission
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <RotateCcw className="w-4 h-4 mr-2" />
      )}
      {children || (isLoading ? 'Retrying...' : 'Retry')}
    </Button>
  );
}

/**
 * Hook to create a safe retry handler that prevents page reloads
 */
export function useSafeRetry(retryFn: () => Promise<void> | void) {
  return React.useCallback(async (e?: React.MouseEvent | React.FormEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      await retryFn();
    } catch (error) {
      console.error('Safe retry operation failed:', error);
      // Don't re-throw to prevent unhandled promise rejections
    }
  }, [retryFn]);
}
