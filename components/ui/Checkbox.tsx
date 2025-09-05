import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
  {
    variants: {
      size: {
        default: 'h-4 w-4',
        sm: 'h-3 w-3',
        lg: 'h-5 w-5',
      },
      variant: {
        default: 'border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        destructive: 'border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground',
        success: 'border-green-600 data-[state=checked]:bg-green-600 data-[state=checked]:text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface CheckboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>, 'checked'>,
    VariantProps<typeof checkboxVariants> {
  /**
   * Label text for the checkbox
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
  /**
   * Indeterminate state (for partial selections)
   */
  indeterminate?: boolean;
  /**
   * Checked state
   */
  checked?: boolean | 'indeterminate';
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, variant, label, description, error, id, indeterminate, checked, ...props }, ref) => {
  const generatedId = React.useId();
  const checkboxId = id || `checkbox-${generatedId}`;
  const hasError = !!error;

  const checkboxElement = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      className={cn(
        checkboxVariants({ size, variant: hasError ? 'destructive' : variant }),
        className
      )}
      checked={indeterminate ? 'indeterminate' : (checked ?? false)}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
        <svg
          className={cn(
            'fill-current',
            size === 'sm' && 'h-2 w-2',
            size === 'default' && 'h-3 w-3',
            size === 'lg' && 'h-4 w-4'
          )}
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
            fill="currentColor"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (label || description || error) {
    return (
      <div className="flex items-start space-x-2">
        {checkboxElement}
        <div className="grid gap-1.5 leading-none">
          {label && (
            <label
              htmlFor={checkboxId}
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

  return checkboxElement;
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox, checkboxVariants };