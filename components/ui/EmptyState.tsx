import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './Button';

const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center',
  {
    variants: {
      variant: {
        default: 'border border-border bg-background rounded-lg',
        error: 'border border-destructive/20 bg-destructive/5 rounded-lg',
        loading: 'animate-pulse border border-border bg-background rounded-lg',
        minimal: '',
      },
      size: {
        sm: 'max-w-xs p-4',
        default: 'max-w-md p-6',
        lg: 'max-w-xl p-8',
      },
      compact: {
        true: 'py-4',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      compact: false,
    },
  }
);

const emptyStateTitleVariants = cva(
  'font-semibold tracking-tight',
  {
    variants: {
      size: {
        sm: 'text-base',
        default: 'text-lg',
        lg: 'text-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const emptyStateDescriptionVariants = cva(
  'text-muted-foreground mt-2',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const emptyStateIconVariants = cva(
  'text-muted-foreground mb-4',
  {
    variants: {
      size: {
        sm: '[&>*]:h-8 [&>*]:w-8',
        default: '[&>*]:h-12 [&>*]:w-12',
        lg: '[&>*]:h-16 [&>*]:w-16',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  actionVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  actionDisabled?: boolean;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  secondaryActionVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  secondaryActionDisabled?: boolean;
  compact?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      variant,
      size,
      compact,
      title,
      description,
      icon,
      actionText,
      onAction,
      actionVariant = 'default',
      actionDisabled = false,
      secondaryActionText,
      onSecondaryAction,
      secondaryActionVariant = 'outline',
      secondaryActionDisabled = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={cn(emptyStateVariants({ variant, size, compact }), className)}
        aria-label="Empty state"
        {...props}
      >
        {icon && (
          <div className={cn(emptyStateIconVariants({ size }))}>
            {icon}
          </div>
        )}
        
        <h3 className={cn(emptyStateTitleVariants({ size }))}>
          {title}
        </h3>
        
        {description && (
          <p className={cn(emptyStateDescriptionVariants({ size }))}>
            {description}
          </p>
        )}
        
        {children && (
          <div className={cn(emptyStateDescriptionVariants({ size }))}>
            {children}
          </div>
        )}
        
        {(actionText && onAction) || (secondaryActionText && onSecondaryAction) ? (
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            {actionText && onAction && (
              <Button
                variant={actionVariant}
                onClick={onAction}
                disabled={actionDisabled}
                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
              >
                {actionText}
              </Button>
            )}
            
            {secondaryActionText && onSecondaryAction && (
              <Button
                variant={secondaryActionVariant}
                onClick={onSecondaryAction}
                disabled={secondaryActionDisabled}
                size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'}
              >
                {secondaryActionText}
              </Button>
            )}
          </div>
        ) : null}
      </section>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState, emptyStateVariants };