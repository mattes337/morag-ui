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

/**
 * Props for the Button component
 * 
 * A comprehensive button component with multiple variants, loading states, and accessibility features.
 * Supports composition patterns, icon placement, and proper ARIA attributes.
 * 
 * @example
 * ```tsx
 * // Basic button
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * // Primary button with icon
 * <Button variant="default" leftIcon={<SaveIcon />}>
 *   Save Document
 * </Button>
 * 
 * // Loading state with custom text
 * <Button loading={isSubmitting} loadingText="Saving...">
 *   Save Changes
 * </Button>
 * 
 * // Destructive action
 * <Button variant="destructive" onClick={handleDelete}>
 *   Delete File
 * </Button>
 * 
 * // As child composition (advanced)
 * <Button asChild>
 *   <Link href="/dashboard">Go to Dashboard</Link>
 * </Button>
 * ```
 * 
 * @example
 * ```tsx
 * // Different sizes and variants
 * <div className="space-x-2">
 *   <Button size="sm" variant="ghost">Small Ghost</Button>
 *   <Button size="default" variant="outline">Default Outline</Button>
 *   <Button size="lg" variant="secondary">Large Secondary</Button>
 *   <Button size="icon" variant="ghost"><SearchIcon /></Button>
 * </div>
 * ```
 * 
 * @example
 * ```tsx
 * // Form submission with validation
 * const handleSubmit = async () => {
 *   setIsSubmitting(true);
 *   try {
 *     await submitForm();
 *   } finally {
 *     setIsSubmitting(false);
 *   }
 * };
 * 
 * <Button 
 *   onClick={handleSubmit}
 *   loading={isSubmitting}
 *   disabled={!isFormValid}
 *   loadingText="Submitting form..."
 *   leftIcon={<CheckIcon />}
 * >
 *   Submit Application
 * </Button>
 * ```
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * When true, renders as a Slot component for composition with other elements
   * Useful for wrapping Links or other interactive elements while maintaining button styling
   * 
   * @example
   * ```tsx
   * <Button asChild>
   *   <Link href="/profile">View Profile</Link>
   * </Button>
   * ```
   */
  asChild?: boolean;
  
  /**
   * Shows loading spinner and disables interaction when true
   * Automatically adds proper ARIA attributes for screen readers
   * 
   * @example
   * ```tsx
   * <Button loading={isUploading} loadingText="Uploading file...">
   *   Upload Document
   * </Button>
   * ```
   */
  loading?: boolean;
  
  /**
   * Icon element to display before the button text
   * Automatically hidden when loading to avoid visual conflicts
   * 
   * @example
   * ```tsx
   * <Button leftIcon={<DownloadIcon />}>Download Report</Button>
   * ```
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Icon element to display after the button text  
   * Commonly used for action indicators like external links or dropdowns
   * 
   * @example
   * ```tsx
   * <Button rightIcon={<ExternalLinkIcon />}>Open in New Tab</Button>
   * <Button rightIcon={<ChevronDownIcon />}>More Options</Button>
   * ```
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Custom text announced to screen readers during loading state
   * Provides context about what action is being performed
   * 
   * @default "Loading..."
   * @example
   * ```tsx
   * <Button loading={isSaving} loadingText="Saving your changes...">
   *   Save Draft
   * </Button>
   * ```
   */
  loadingText?: string;
  
  /**
   * When true, prevents the button from being focusable but keeps it visible
   * Different from disabled which also prevents interaction and changes styling
   * Useful for temporarily inactive states that should remain visually consistent
   * 
   * @example
   * ```tsx
   * <Button inert={isFormSubmitting && !isCurrentStep}>
   *   Next Step
   * </Button>
   * ```
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