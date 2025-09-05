import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const progressVariants = cva(
  'relative h-4 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        default: 'h-4',
        sm: 'h-2',
        lg: 'h-6',
      },
      variant: {
        default: 'bg-secondary',
        success: 'bg-green-100 dark:bg-green-950',
        warning: 'bg-yellow-100 dark:bg-yellow-950',
        destructive: 'bg-red-100 dark:bg-red-950',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const progressIndicatorVariants = cva(
  'h-full w-full flex-1 bg-primary transition-all',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        destructive: 'bg-red-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  /**
   * The progress value (0-100)
   */
  value?: number;
  /**
   * The maximum value (defaults to 100)
   */
  max?: number;
  /**
   * Whether to show the percentage text
   */
  showValue?: boolean;
  /**
   * Custom label for the progress
   */
  label?: string;
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  max = 100, 
  size, 
  variant, 
  showValue = false, 
  label,
  ...props 
}, ref) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="w-full space-y-2">
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-foreground font-medium">{label}</span>}
          {showValue && (
            <span className="text-muted-foreground">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, variant }), className)}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(progressIndicatorVariants({ variant }))}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressVariants };