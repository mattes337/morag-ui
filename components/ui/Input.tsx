import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        default: 'h-10 px-3 py-2',
        sm: 'h-9 px-3 py-2 text-xs',
        lg: 'h-11 px-4 py-3',
      },
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Left icon or element to display before the input
   */
  leftElement?: React.ReactNode;
  /**
   * Right icon or element to display after the input
   */
  rightElement?: React.ReactNode;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size, variant, leftElement, rightElement, error, helperText, type, ...props }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    if (leftElement || rightElement) {
      return (
        <div className="w-full">
          <div className="relative">
            {leftElement && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {leftElement}
              </div>
            )}
            <input
              type={type}
              className={cn(
                inputVariants({ size, variant: finalVariant }),
                leftElement && 'pl-10',
                rightElement && 'pr-10',
                className
              )}
              ref={ref}
              {...props}
            />
            {rightElement && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {rightElement}
              </div>
            )}
          </div>
          {(error || helperText) && (
            <p className={cn(
              'mt-1 text-xs',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {error || helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(inputVariants({ size, variant: finalVariant }), className)}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            'mt-1 text-xs',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };