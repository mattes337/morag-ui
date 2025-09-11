/**
 * Core UI Components - Essential components always loaded
 * These are the most commonly used components with small bundle size
 */

// Essential primitives
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './input';
export type { InputProps } from './input';

export { Label, labelVariants } from './Label';
export type { LabelProps } from './Label';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
} from './Card';
export type { CardProps } from './Card';

export { Badge, badgeVariants } from './badge';
export type { BadgeProps } from './badge';

export { Spinner, spinnerVariants } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { Skeleton } from './skeleton';
export type { SkeletonProps } from './skeleton';

export { Separator, separatorVariants } from './Separator';
export type { SeparatorProps } from './Separator';

export { Progress, progressVariants } from './Progress';
export type { ProgressProps } from './Progress';

export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from './Avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './Avatar';

// Re-export utility functions
export { cn } from '@/lib/utils';