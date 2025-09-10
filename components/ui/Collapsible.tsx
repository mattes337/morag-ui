import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const collapsibleVariants = cva('', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent> & {
    className?: string;
  }
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
      className
    )}
    {...props}
  />
));

CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName;

export type CollapsibleProps = React.ComponentProps<typeof Collapsible>;
export type CollapsibleTriggerProps = React.ComponentProps<typeof CollapsibleTrigger>;
export type CollapsibleContentProps = React.ComponentProps<typeof CollapsibleContent>;

export { Collapsible, CollapsibleTrigger, CollapsibleContent, collapsibleVariants };
export type { VariantProps };
export default Collapsible;