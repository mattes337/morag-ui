import React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
  {
    variants: {
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        lg: 'h-7 w-13',
      },
      variant: {
        default: 'data-[state=checked]:bg-primary',
        success: 'data-[state=checked]:bg-green-600',
        warning: 'data-[state=checked]:bg-yellow-600',
        destructive: 'data-[state=checked]:bg-destructive',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

const switchThumbVariants = cva(
  'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=unchecked]:translate-x-0',
  {
    variants: {
      size: {
        default: 'h-5 w-5 data-[state=checked]:translate-x-5',
        sm: 'h-4 w-4 data-[state=checked]:translate-x-4',
        lg: 'h-6 w-6 data-[state=checked]:translate-x-6',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
    VariantProps<typeof switchVariants> {
  /**
   * Label text for the switch
   */
  label?: string;
  /**
   * Description text shown below the label
   */
  description?: string;
  /**
   * Error message to display
   */
  error?: string;
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, size, variant, label, description, error, id, ...props }, ref) => {
  const switchId = id || `switch-${React.useId()}`;
  const hasError = !!error;

  const switchElement = (
    <SwitchPrimitives.Root
      className={cn(
        switchVariants({ size, variant: hasError ? 'destructive' : variant }), 
        className
      )}
      id={switchId}
      ref={ref}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={cn(switchThumbVariants({ size }))}
      />
    </SwitchPrimitives.Root>
  );

  if (label || description || error) {
    return (
      <div className="flex items-start space-x-3">
        {switchElement}
        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                hasError && 'text-destructive'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={cn(
              'text-xs text-muted-foreground',
              hasError && 'text-destructive/80'
            )}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-xs text-destructive">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return switchElement;
});

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch, switchVariants };