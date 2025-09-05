import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const drawerOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
);

const drawerContentVariants = cva(
  'fixed z-50 flex flex-col bg-background shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out',
  {
    variants: {
      side: {
        top: 'inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom: 'inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
        right: 'inset-y-0 right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
      size: {
        sm: '',
        default: '',
        lg: '',
        xl: '',
        full: '',
      },
    },
    compoundVariants: [
      {
        side: ['top', 'bottom'],
        size: 'sm',
        class: 'h-1/3',
      },
      {
        side: ['top', 'bottom'],
        size: 'default',
        class: 'h-1/2',
      },
      {
        side: ['top', 'bottom'],
        size: 'lg',
        class: 'h-2/3',
      },
      {
        side: ['top', 'bottom'],
        size: 'xl',
        class: 'h-3/4',
      },
      {
        side: ['top', 'bottom'],
        size: 'full',
        class: 'h-full',
      },
      {
        side: ['left', 'right'],
        size: 'sm',
        class: 'w-80',
      },
      {
        side: ['left', 'right'],
        size: 'default',
        class: 'w-96',
      },
      {
        side: ['left', 'right'],
        size: 'lg',
        class: 'w-2/3',
      },
      {
        side: ['left', 'right'],
        size: 'xl',
        class: 'w-3/4',
      },
      {
        side: ['left', 'right'],
        size: 'full',
        class: 'w-full',
      },
    ],
    defaultVariants: {
      side: 'right',
      size: 'default',
    },
  }
);

const drawerHeaderVariants = cva(
  'flex flex-col space-y-1.5 text-center sm:text-left px-6 py-4 border-b'
);

const drawerBodyVariants = cva(
  'flex-1 overflow-auto px-6 py-4'
);

const drawerFooterVariants = cva(
  'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 px-6 py-4 border-t'
);

const drawerTitleVariants = cva(
  'text-lg font-semibold leading-none tracking-tight'
);

const drawerDescriptionVariants = cva(
  'text-sm text-muted-foreground'
);

export interface DrawerProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

export interface DrawerContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof drawerContentVariants> {
  modal?: boolean;
}

export interface DrawerHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerBodyProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export interface DrawerTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {}

export interface DrawerDescriptionProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> {}

const Drawer = DialogPrimitive.Root;

const DrawerTrigger = DialogPrimitive.Trigger;

const DrawerClose = DialogPrimitive.Close;

const DrawerPortal = DialogPrimitive.Portal;

const DrawerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(drawerOverlayVariants(), className)}
    data-testid="drawer-overlay"
    {...props}
  />
));
DrawerOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DrawerContentProps
>(({ side = 'right', size = 'default', className, children, modal = true, ...props }, ref) => (
  <DrawerPortal>
    {modal && <DrawerOverlay />}
    <DialogPrimitive.Content
      ref={ref}
      className={cn(drawerContentVariants({ side, size }), className)}
      data-testid="drawer-content"
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DrawerPortal>
));
DrawerContent.displayName = DialogPrimitive.Content.displayName;

const DrawerHeader = React.forwardRef<HTMLDivElement, DrawerHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(drawerHeaderVariants(), className)}
      {...props}
    />
  )
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerBody = React.forwardRef<HTMLDivElement, DrawerBodyProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(drawerBodyVariants(), className)}
      {...props}
    />
  )
);
DrawerBody.displayName = 'DrawerBody';

const DrawerFooter = React.forwardRef<HTMLDivElement, DrawerFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(drawerFooterVariants(), className)}
      {...props}
    />
  )
);
DrawerFooter.displayName = 'DrawerFooter';

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  DrawerTitleProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(drawerTitleVariants(), className)}
    {...props}
  />
));
DrawerTitle.displayName = DialogPrimitive.Title.displayName;

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  DrawerDescriptionProps
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(drawerDescriptionVariants(), className)}
    {...props}
  />
));
DrawerDescription.displayName = DialogPrimitive.Description.displayName;

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
};