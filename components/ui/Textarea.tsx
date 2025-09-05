import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'min-h-[50px] px-2 py-1.5 text-xs',
        default: 'min-h-[60px] px-3 py-2',
        lg: 'min-h-[80px] px-4 py-3 text-base',
      },
      variant: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-green-500 focus-visible:ring-green-500',
      },
      resize: {
        true: 'resize-y',
        false: 'resize-none',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
      resize: true,
    },
  }
);

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'>,
    VariantProps<typeof textareaVariants> {
  /**
   * Error message to display below the textarea
   */
  error?: string;
  /**
   * Helper text to display below the textarea
   */
  helperText?: string;
  /**
   * Whether the textarea is resizable
   */
  resize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, variant, error, helperText, resize, ...props }, ref) => {
    const hasError = !!error;
    const finalVariant = hasError ? 'error' : variant;

    return (
      <div className="w-full">
        <textarea
          className={cn(textareaVariants({ size, variant: finalVariant, resize }), className)}
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

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };