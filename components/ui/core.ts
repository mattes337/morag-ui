/**
 * Core UI Components - Essential components always loaded
 * These are the most commonly used components with small bundle size
 */

// Essential primitives
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

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

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export { Spinner, spinnerVariants } from './Spinner';
export type { SpinnerProps } from './Spinner';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Separator, separatorVariants } from './Separator';
export type { SeparatorProps } from './Separator';

export { Progress, progressVariants } from './Progress';
export type { ProgressProps } from './Progress';

export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from './Avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './Avatar';

// Re-export utility functions
export { cn } from '@/lib/utils';