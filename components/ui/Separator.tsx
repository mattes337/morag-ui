import React from 'react';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const separatorVariants = cva(
  'shrink-0 bg-border',
  {
    variants: {
      orientation: {
        horizontal: 'h-[1px] w-full',
        vertical: 'h-full w-[1px]',
      },
      size: {
        default: '',
        sm: 'opacity-50',
        lg: 'opacity-75',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
      size: 'default',
    },
  }
);

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, 'orientation'>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = 'horizontal', size, decorative = true, ...props }, ref) => {
  const orientationValue = orientation || 'horizontal';
  
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientationValue}
      className={cn(separatorVariants({ orientation: orientationValue, size }), className)}
      {...props}
    />
  );
});

Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator, separatorVariants };