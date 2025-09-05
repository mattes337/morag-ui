// Core UI Components - Comprehensive Radix UI + Tailwind CSS Library
// Export all UI components for easy importing

// Button
export { Button, buttonVariants } from './Button';
export type { ButtonProps } from './Button';

// Form Components
export { Input, inputVariants } from './Input';
export type { InputProps } from './Input';

export { Label, labelVariants } from './Label';
export type { LabelProps } from './Label';

export { Checkbox, checkboxVariants } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { Textarea, textareaVariants } from './Textarea';
export type { TextareaProps } from './Textarea';

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  selectTriggerVariants,
} from './Select';
export type { SelectProps, SelectTriggerProps, SelectContentProps } from './Select';

// Toggle Components
export { Switch, switchVariants } from './Switch';
export type { SwitchProps } from './Switch';

// Layout Components
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

export { Separator, separatorVariants } from './Separator';
export type { SeparatorProps } from './Separator';

// Navigation Components
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
} from './Tabs';
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './Tabs';

// Overlay Components
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogContentVariants,
} from './Dialog';
export type { DialogProps, DialogContentProps } from './Dialog';

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './Tooltip';

// Feedback Components
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  toastVariants,
} from './Toast';
export type {
  ToastProps,
  ToastActionProps,
  ToastCloseProps,
  ToastTitleProps,
  ToastDescriptionProps,
} from './Toast';

// Progress Components
export { Progress, progressVariants } from './Progress';
export type { ProgressProps } from './Progress';

// Display Components
export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from './Avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './Avatar';

export { Badge, badgeVariants } from './Badge';
export type { BadgeProps } from './Badge';

export { Skeleton } from './Skeleton';
export type { SkeletonProps } from './Skeleton';

export { Spinner, spinnerVariants } from './Spinner';
export type { SpinnerProps } from './Spinner';

// Re-export utility functions for external use
export { cn } from '@/lib/utils';
// Data Display Components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableVariants,
  tableRowVariants,
  tableHeadVariants,
  tableCellVariants,
} from './Table';
export type {
  TableProps,
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
} from './Table';

export { EmptyState, emptyStateVariants } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

// Form Components (Additional)
export { RadioGroup, RadioGroupItem, radioGroupVariants, radioGroupItemVariants } from './RadioGroup';
export type { RadioGroupProps, RadioGroupItemProps } from './RadioGroup';

// Layout Components (Additional)
export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  drawerContentVariants,
} from './Drawer';
export type {
  DrawerProps,
  DrawerContentProps,
  DrawerHeaderProps,
  DrawerBodyProps,
  DrawerFooterProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
} from './Drawer';
