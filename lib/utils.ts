import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes with clsx and tailwind-merge
 * Handles conditional classes and resolves Tailwind class conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Creates focus-visible styles for accessibility
 * Used for keyboard navigation indicators
 */
export function focusRing(className?: string) {
  return cn(
    // Base focus styles
    'outline-none ring-offset-2 ring-offset-background',
    // Focus visible styles - only show when keyboard navigating
    'focus-visible:ring-2 focus-visible:ring-ring',
    className
  );
}

/**
 * Creates accessible button focus styles
 */
export function buttonFocusRing(className?: string) {
  return cn(
    'outline-none ring-offset-2 ring-offset-background',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    className
  );
}

/**
 * Creates accessible input focus styles
 */
export function inputFocusRing(className?: string) {
  return cn(
    'outline-none ring-offset-0',
    'focus:ring-2 focus:ring-ring focus:ring-offset-0',
    'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0',
    className
  );
}

/**
 * Utility for creating disabled styles
 */
export function disabledStyles(className?: string) {
  return cn(
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    className
  );
}

/**
 * Creates transition styles for interactive elements
 */
export function transition(className?: string) {
  return cn(
    'transition-colors duration-200 ease-in-out',
    className
  );
}

/**
 * Creates hover styles with proper accessibility considerations
 */
export function hoverStyles(className?: string) {
  return cn(
    'hover:opacity-80 active:opacity-90',
    'transition-opacity duration-150 ease-in-out',
    className
  );
}

/**
 * Creates press animation for buttons and interactive elements
 */
export function pressAnimation(className?: string) {
  return cn(
    'active:scale-95 transition-transform duration-100 ease-in-out',
    className
  );
}

/**
 * Utility for screen reader only content (visually hidden but accessible)
 */
export function srOnly(className?: string) {
  return cn(
    'absolute w-px h-px p-0 -m-px overflow-hidden clip-[rect(0,0,0,0)] whitespace-nowrap border-0',
    className
  );
}

/**
 * Creates consistent spacing for form elements
 */
export function formSpacing(className?: string) {
  return cn('space-y-2', className);
}

/**
 * Creates consistent card shadow styles
 */
export function cardShadow(elevation: 'sm' | 'md' | 'lg' = 'md', className?: string) {
  const shadows = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };
  
  return cn(
    shadows[elevation],
    'border border-border',
    className
  );
}