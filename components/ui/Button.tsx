import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 transition-transform duration-100',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        success: 'bg-green-600 text-white hover:bg-green-700',
        warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
        muted: 'bg-muted text-muted-foreground hover:bg-muted/80',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8 text-base',
        xl: 'h-12 rounded-lg px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 text-xs',
        'icon-lg': 'h-12 w-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders as a Slot component for composition
   */
  asChild?: boolean;
  /**
   * Optional loading state
   */
  loading?: boolean;
  /**
   * Optional icon to display before the button text
   */
  leftIcon?: React.ReactNode;
  /**
   * Optional icon to display after the button text
   */
  rightIcon?: React.ReactNode;
  /**
   * Loading text announced to screen readers when loading is true
   * @default "Loading..."
   */
  loadingText?: string;
  /**
   * When true, prevents the button from being focusable but keeps it visible
   * Different from disabled which also prevents interaction
   */
  inert?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled, 
    loadingText = "Loading...",
    inert = false,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const isDisabled = disabled || loading;
    const isInert = inert || isDisabled;
    
    // Generate unique ID for loading announcement
    const loadingId = React.useId();
    
    // Determine accessible label
    const getAccessibleLabel = () => {
      if (loading && loadingText) {
        return loadingText;
      }
      return props['aria-label'];
    };
    
    // Determine if we need aria-describedby for loading state
    const getAriaDescribedBy = () => {
      const existingDescribedBy = props['aria-describedby'];
      if (loading) {
        return existingDescribedBy ? `${existingDescribedBy} ${loadingId}` : loadingId;
      }
      return existingDescribedBy;
    };
    
    return (
      <>
        <Comp
          className={cn(buttonVariants({ variant, size }), className)}
          ref={ref}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          aria-busy={loading}
          aria-label={getAccessibleLabel()}
          aria-describedby={getAriaDescribedBy()}
          tabIndex={isInert ? -1 : props.tabIndex}
          {...props}
        >
          {loading && (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
              role="img"
              aria-label="Loading spinner"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {!loading && leftIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children}
          {!loading && rightIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </Comp>
        
        {/* Screen reader announcement for loading state */}
        {loading && (
          <span
            id={loadingId}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {loadingText}
          </span>
        )}
      </>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };