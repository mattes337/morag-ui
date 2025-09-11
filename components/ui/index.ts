/**
 * UI Components Library - Simplified Export System
 */

// Core UI components
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

// Form components
export { Checkbox, checkboxVariants } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { Textarea, textareaVariants } from './Textarea';
export type { TextareaProps } from './Textarea';

export { Switch, switchVariants } from './Switch';
export type { SwitchProps } from './Switch';

export { RadioGroup, RadioGroupItem, radioGroupVariants, radioGroupItemVariants } from './RadioGroup';
export type { RadioGroupProps, RadioGroupItemProps } from './RadioGroup';

// Dialog components
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
} from './dialog';
export type { DialogProps, DialogContentProps } from './dialog';

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './Tooltip';

export { Progress, progressVariants } from './Progress';
export type { ProgressProps } from './Progress';

export { Avatar, AvatarImage, AvatarFallback, avatarVariants } from './Avatar';
export type { AvatarProps, AvatarImageProps, AvatarFallbackProps } from './Avatar';

// Complex components - direct exports only
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
} from './select';
export type { SelectProps, SelectTriggerProps, SelectContentProps } from './select';

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

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  tabsTriggerVariants,
} from './tabs';
export type { TabsProps, TabsListProps, TabsTriggerProps, TabsContentProps } from './tabs';

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

export { EmptyState, emptyStateVariants } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

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

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  collapsibleVariants,
} from './Collapsible';
export type {
  CollapsibleProps,
  CollapsibleTriggerProps,
  CollapsibleContentProps,
} from './Collapsible';

// Utilities
export { cn } from '@/lib/utils';
