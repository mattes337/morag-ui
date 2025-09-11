/**
 * NotificationBell Component
 * Bell icon with unread count and notification center dropdown
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Check, X, Trash2, Settings, Filter } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from './Button';
import { Badge } from './badge';
import { Card } from './Card';
import { Separator } from './Separator';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  NotificationFilter 
} from '@/lib/websocket/eventTypes';

const bellVariants = cva(
  'relative inline-flex items-center justify-center transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'text-muted-foreground hover:text-foreground',
        active: 'text-primary hover:text-primary/80',
        muted: 'text-muted-foreground/50 hover:text-muted-foreground',
      },
      size: {
        default: 'h-5 w-5',
        sm: 'h-4 w-4',
        lg: 'h-6 w-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const notificationVariants = cva(
  'flex items-start space-x-3 p-3 hover:bg-muted/50 transition-colors cursor-pointer border-l-2',
  {
    variants: {
      type: {
        [NotificationType.SUCCESS]: 'border-l-green-500',
        [NotificationType.INFO]: 'border-l-blue-500',
        [NotificationType.WARNING]: 'border-l-yellow-500',
        [NotificationType.ERROR]: 'border-l-red-500',
      },
      read: {
        true: 'opacity-60',
        false: 'bg-muted/20',
      },
      priority: {
        [NotificationPriority.LOW]: '',
        [NotificationPriority.MEDIUM]: '',
        [NotificationPriority.HIGH]: 'ring-1 ring-orange-200',
        [NotificationPriority.URGENT]: 'ring-2 ring-red-200 bg-red-50/50',
      },
    },
    defaultVariants: {
      type: NotificationType.INFO,
      read: false,
      priority: NotificationPriority.MEDIUM,
    },
  }
);

interface NotificationBellProps extends VariantProps<typeof bellVariants> {
  realmId?: string;
  maxVisibleNotifications?: number;
  className?: string;
  showSettings?: boolean;
  onSettingsClick?: () => void;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (actionId: string, notificationId: string) => void;
}

const getTypeIcon = (type: NotificationType) => {
  switch (type) {
    case NotificationType.SUCCESS:
      return <Check className="h-4 w-4 text-green-600" />;
    case NotificationType.INFO:
      return <Bell className="h-4 w-4 text-blue-600" />;
    case NotificationType.WARNING:
      return <BellRing className="h-4 w-4 text-yellow-600" />;
    case NotificationType.ERROR:
      return <X className="h-4 w-4 text-red-600" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityLabel = (priority: NotificationPriority) => {
  switch (priority) {
    case NotificationPriority.URGENT:
      return 'Urgent';
    case NotificationPriority.HIGH:
      return 'High';
    case NotificationPriority.MEDIUM:
      return 'Medium';
    case NotificationPriority.LOW:
      return 'Low';
    default:
      return '';
  }
};

const formatTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return new Date(timestamp).toLocaleDateString();
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}) => {
  const handleActionClick = (actionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onAction?.(actionId, notification.id);
    
    // Execute the action if it has an onClick handler
    const action = notification.actions?.find(a => a.id === actionId);
    action?.onClick?.();
  };

  return (
    <div
      className={cn(
        notificationVariants({
          type: notification.type,
          read: notification.read,
          priority: notification.priority,
        })
      )}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div className="flex-shrink-0 mt-0.5">
        {getTypeIcon(notification.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground">
              {notification.title}
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              {notification.message}
            </p>
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {notification.priority === NotificationPriority.URGENT && (
              <Badge variant="destructive" className="text-xs">
                {getPriorityLabel(notification.priority)}
              </Badge>
            )}
            {notification.priority === NotificationPriority.HIGH && (
              <Badge variant="secondary" className="text-xs">
                {getPriorityLabel(notification.priority)}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete notification"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(notification.timestamp)}
          </span>
          
          {!notification.read && (
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
          )}
        </div>

        {notification.actions && notification.actions.length > 0 && (
          <div className="flex gap-2 mt-3">
            {notification.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : action.variant === 'destructive' ? 'destructive' : 'outline'}
                size="sm"
                onClick={(e) => handleActionClick(action.id, e)}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  realmId,
  variant,
  size,
  maxVisibleNotifications = 10,
  className,
  showSettings = true,
  onSettingsClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    setFilter: applyFilter,
    requestDesktopPermission,
    desktopPermissionStatus,
  } = useNotifications({ 
    ...(realmId && { realmId }), 
    maxNotifications: 100 
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply filter when it changes
  useEffect(() => {
    applyFilter(filter);
  }, [filter, applyFilter]);

  // Request desktop permission on first interaction
  const handleBellClick = () => {
    setIsOpen(!isOpen);
    
    if (desktopPermissionStatus === 'default') {
      requestDesktopPermission();
    }
  };

  const handleFilterChange = (newFilter: Partial<NotificationFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  };

  const visibleNotifications = filteredNotifications.slice(0, maxVisibleNotifications);
  const hasMoreNotifications = filteredNotifications.length > maxVisibleNotifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className={cn(bellVariants({ variant, size }), className)}
        aria-label={`Notifications (${unreadCount} unread)`}
      >
        {unreadCount > 0 ? (
          <BellRing className={cn('animate-pulse', bellVariants({ size }))} />
        ) : (
          <Bell className={bellVariants({ size })} />
        )}
        
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-[600px] z-50 shadow-lg border">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              {showSettings && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onSettingsClick}
                  className="h-6 w-6"
                  aria-label="Notification settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
              
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          {/* Filter Controls */}
          <div className="p-3 border-b bg-muted/20">
            <div className="flex items-center space-x-2 text-xs">
              <Filter className="h-3 w-3" />
              <Button
                variant={filter?.read === false ? "default" : "ghost"}
                size="sm"
                onClick={() => handleFilterChange({ read: filter?.read === false ? undefined : false })}
                className="h-6 text-xs"
              >
                Unread
              </Button>
              <Button
                variant={filter?.priority?.includes(NotificationPriority.URGENT) ? "destructive" : "ghost"}
                size="sm"
                onClick={() => handleFilterChange({ 
                  priority: filter?.priority?.includes(NotificationPriority.URGENT) 
                    ? undefined 
                    : [NotificationPriority.URGENT, NotificationPriority.HIGH] 
                })}
                className="h-6 text-xs"
              >
                Important
              </Button>
              {(filter?.read !== undefined || filter?.priority !== undefined) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilter(null)}
                  className="h-6 text-xs text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {visibleNotifications.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {notifications.length === 0 
                    ? 'No notifications yet' 
                    : 'No notifications match your filter'
                  }
                </p>
              </div>
            ) : (
              <div className="group">
                {visibleNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                    {index < visibleNotifications.length - 1 && (
                      <Separator className="mx-3" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <>
              <Separator />
              <div className="p-3 bg-muted/20 flex items-center justify-between">
                {hasMoreNotifications && (
                  <p className="text-xs text-muted-foreground">
                    {filteredNotifications.length - maxVisibleNotifications} more notifications
                  </p>
                )}
                
                <div className="flex items-center space-x-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-xs"
                  >
                    View All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllNotifications}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default NotificationBell;