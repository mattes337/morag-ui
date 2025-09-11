import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground',
  {
    variants: {
      variant: {
        default: 'border-border',
        outlined: 'border-border shadow-sm',
        elevated: 'border-border shadow-md',
        ghost: 'border-transparent bg-transparent',
      },
      padding: {
        none: '',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

/**
 * Props for the Card component and its sub-components
 * 
 * A flexible card component system for creating content containers with consistent styling.
 * Includes header, content, footer sections and multiple visual variants.
 * 
 * @example
 * ```tsx
 * // Basic card with content
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Document Analysis</CardTitle>
 *     <CardDescription>AI-powered insights from your documents</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Processing complete. Found 15 key insights.</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>View Details</Button>
 *   </CardFooter>
 * </Card>
 * ```
 * 
 * @example
 * ```tsx
 * // Different variants and padding
 * <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 *   <Card variant="outlined" padding="sm">
 *     <CardContent>Compact card with small padding</CardContent>
 *   </Card>
 *   
 *   <Card variant="elevated" padding="lg">
 *     <CardContent>Elevated card with large padding</CardContent>
 *   </Card>
 *   
 *   <Card variant="ghost">
 *     <CardContent>Borderless ghost card</CardContent>
 *   </Card>
 * </div>
 * ```
 * 
 * @example
 * ```tsx
 * // Interactive card with hover effects
 * <Card 
 *   className="cursor-pointer transition-all hover:shadow-lg"
 *   onClick={() => router.push('/document/123')}
 * >
 *   <CardHeader>
 *     <CardTitle>Q4 Financial Report.pdf</CardTitle>
 *     <CardDescription>Last modified 2 hours ago</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <div className="flex items-center gap-2">
 *       <Badge variant="secondary">PDF</Badge>
 *       <Badge variant="success">Processed</Badge>
 *     </div>
 *   </CardContent>
 * </Card>
 * ```
 * 
 * @example
 * ```tsx
 * // Complex card with multiple sections
 * <Card variant="outlined" className="max-w-md">
 *   <CardHeader className="text-center">
 *     <Avatar className="mx-auto mb-2">
 *       <AvatarImage src={user.avatar} />
 *       <AvatarFallback>{user.initials}</AvatarFallback>
 *     </Avatar>
 *     <CardTitle>{user.name}</CardTitle>
 *     <CardDescription>{user.role}</CardDescription>
 *   </CardHeader>
 *   
 *   <CardContent className="space-y-4">
 *     <div className="grid grid-cols-3 text-center">
 *       <div>
 *         <div className="font-bold">{user.documentsCount}</div>
 *         <div className="text-sm text-muted-foreground">Documents</div>
 *       </div>
 *       <div>
 *         <div className="font-bold">{user.searchesCount}</div>
 *         <div className="text-sm text-muted-foreground">Searches</div>
 *       </div>
 *       <div>
 *         <div className="font-bold">{user.realmCount}</div>
 *         <div className="text-sm text-muted-foreground">Realms</div>
 *       </div>
 *     </div>
 *   </CardContent>
 *   
 *   <CardFooter className="flex-col gap-2">
 *     <Button className="w-full">View Profile</Button>
 *     <Button variant="outline" className="w-full">Send Message</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding }), className)}
      {...props}
    />
  )
);

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  >
    {children}
  </h3>
));

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardFooter.displayName = 'CardFooter';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};