/**
 * ToastNotification Component
 * Provides immediate feedback with auto-dismiss and manual actions
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Info, AlertTriangle, Bell } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Card } from './Card';
import { Progress } from './Progress';
import { 
  Notification,
  NotificationType, 
  NotificationPriority 
} from '@/lib/websocket/eventTypes';

const toastVariants = cva(
  'fixed z-[100] flex items-start space-x-3 w-full max-w-md p-4 rounded-lg shadow-lg border transition-all duration-300 ease-in-out transform',
  {
    variants: {
      type: {
        [NotificationType.SUCCESS]: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
        [NotificationType.INFO]: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300',
        [NotificationType.WARNING]: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300',
        [NotificationType.ERROR]: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
      },
      position: {
        'top-right': 'top-4 right-4',
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
      },
      priority: {
        [NotificationPriority.LOW]: '',
        [NotificationPriority.MEDIUM]: 'ring-1 ring-current/20',
        [NotificationPriority.HIGH]: 'ring-2 ring-current/30',
        [NotificationPriority.URGENT]: 'ring-2 ring-current/50 animate-pulse',
      },
      state: {
        entering: 'translate-x-full opacity-0 scale-95',
        entered: 'translate-x-0 opacity-100 scale-100',
        exiting: 'translate-x-full opacity-0 scale-95',
      },
    },
    defaultVariants: {
      type: NotificationType.INFO,
      position: 'top-right',
      priority: NotificationPriority.MEDIUM,
      state: 'entered',
    },
  }
);

const getTypeIcon = (type: NotificationType) => {
  const iconClass = 'h-5 w-5 flex-shrink-0';
  
  switch (type) {
    case NotificationType.SUCCESS:
      return <Check className={cn(iconClass, 'text-green-600')} />;
    case NotificationType.INFO:
      return <Info className={cn(iconClass, 'text-blue-600')} />;
    case NotificationType.WARNING:
      return <AlertTriangle className={cn(iconClass, 'text-yellow-600')} />;
    case NotificationType.ERROR:
      return <AlertCircle className={cn(iconClass, 'text-red-600')} />;
    default:
      return <Bell className={cn(iconClass)} />;
  }
};

export interface ToastNotificationProps extends VariantProps<typeof toastVariants> {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction?: (actionId: string, notificationId: string) => void;
  autoHideDuration?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}

export interface ToastContainerProps {
  notifications: Notification[];
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  maxToasts?: number;
  onDismiss: (id: string) => void;
  onAction?: (actionId: string, notificationId: string) => void;
  autoHideDuration?: number;
  showProgress?: boolean;
  pauseOnHover?: boolean;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  type = notification.type,
  priority = notification.priority,
  position = 'top-right',
  onDismiss,
  onAction,
  autoHideDuration = 5000,
  showProgress = true,
  pauseOnHover = true,
  className,
}) => {
  const [state, setState] = useState<'entering' | 'entered' | 'exiting'>('entering');
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(autoHideDuration);

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => setState('entered'), 50);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide functionality
  useEffect(() => {
    if (autoHideDuration <= 0 || notification.persistent) return;

    const startTimer = () => {
      startTimeRef.current = Date.now();
      
      intervalRef.current = setInterval(() => {
        if (!isPaused) {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, remainingTimeRef.current - elapsed);
          const progressValue = (remaining / autoHideDuration) * 100;
          
          setProgress(progressValue);
          
          if (remaining <= 0) {
            handleDismiss();
          }
        }
      }, 16); // ~60fps
    };

    const pauseTimer = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    };

    const resumeTimer = () => {
      if (!intervalRef.current) {
        startTimer();
      }
    };

    if (!isPaused) {
      startTimer();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoHideDuration, isPaused, notification.persistent]);

  const handleDismiss = () => {
    setState('exiting');
    
    timeoutRef.current = setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  const handleActionClick = (actionId: string) => {
    onAction?.(actionId, notification.id);
    
    // Execute the action if it has an onClick handler
    const action = notification.actions?.find(a => a.id === actionId);
    action?.onClick?.();
    
    // Auto-dismiss after action unless it's persistent
    if (!notification.persistent) {
      handleDismiss();
    }
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        toastVariants({ type, position, priority, state }),
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live={priority === NotificationPriority.URGENT ? 'assertive' : 'polite'}
    >
      {/* Icon */}
      <div className="flex-shrink-0">
        {type && getTypeIcon(type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm leading-5">
              {notification.title}
            </h4>
            {notification.message && (
              <p className="text-sm opacity-90 mt-1 leading-5">
                {notification.message}
              </p>
            )}
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDismiss}
            className="h-6 w-6 ml-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Actions */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={() => handleActionClick(action.id)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {showProgress && autoHideDuration > 0 && !notification.persistent && (
          <div className="mt-3">
            <Progress
              value={progress}
              className="h-1"
              aria-label="Auto-dismiss progress"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  position = 'top-right',
  maxToasts = 5,
  onDismiss,
  onAction,
  autoHideDuration = 5000,
  showProgress = true,
  pauseOnHover = true,
}) => {
  // Sort by priority and timestamp (most recent urgent notifications first)
  const sortedNotifications = [...notifications]
    .sort((a, b) => {
      const priorityOrder = {
        [NotificationPriority.URGENT]: 4,
        [NotificationPriority.HIGH]: 3,
        [NotificationPriority.MEDIUM]: 2,
        [NotificationPriority.LOW]: 1,
      };
      
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return b.timestamp - a.timestamp;
    })
    .slice(0, maxToasts);

  if (sortedNotifications.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'fixed z-[100] pointer-events-none',
      position === 'top-right' && 'top-4 right-4',
      position === 'top-left' && 'top-4 left-4',
      position === 'top-center' && 'top-4 left-1/2 transform -translate-x-1/2',
      position === 'bottom-right' && 'bottom-4 right-4',
      position === 'bottom-left' && 'bottom-4 left-4',
      position === 'bottom-center' && 'bottom-4 left-1/2 transform -translate-x-1/2'
    )}>
      <div className="flex flex-col gap-2">
        {sortedNotifications.map((notification, index) => (
          <div
            key={notification.id}
            className="pointer-events-auto"
            style={{
              zIndex: sortedNotifications.length - index,
            }}
          >
            <ToastNotification
              notification={notification}
              position={position}
              onDismiss={onDismiss}
              {...(onAction && { onAction })}
              autoHideDuration={autoHideDuration}
              showProgress={showProgress}
              pauseOnHover={pauseOnHover}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Hook for managing toast notifications
export const useToastNotifications = () => {
  const [toasts, setToasts] = useState<Notification[]>([]);

  const showToast = (toast: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...toast,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      read: false,
    };

    setToasts(prev => [...prev, notification]);
    
    return notification.id;
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    showToast,
    dismissToast,
    clearAllToasts,
  };
};

export default ToastNotification;