/**
 * Notifications Hook
 * Manages in-app notifications with real-time updates and persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { mockWebSocket } from '../websocket/mockWebSocket';
import { 
  EventType, 
  WebSocketEvent, 
  Notification, 
  NotificationType, 
  NotificationPriority,
  NotificationAction,
  JobStatusEvent,
  DocumentEvent,
  UserCollaborationEvent,
  SystemNotificationEvent,
  ErrorWarningEvent
} from '../websocket/eventTypes';

export interface NotificationSettings {
  enableToasts: boolean;
  enableSounds: boolean;
  enableDesktopNotifications: boolean;
  priorities: {
    [NotificationPriority.LOW]: boolean;
    [NotificationPriority.MEDIUM]: boolean;
    [NotificationPriority.HIGH]: boolean;
    [NotificationPriority.URGENT]: boolean;
  };
  categories: {
    jobs: boolean;
    documents: boolean;
    collaboration: boolean;
    system: boolean;
    errors: boolean;
  };
}

export interface NotificationFilter {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  read?: boolean;
  persistent?: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface UseNotificationsOptions {
  realmId?: string;
  settings?: Partial<NotificationSettings>;
  maxNotifications?: number;
  persistToLocalStorage?: boolean;
  onNewNotification?: (notification: Notification) => void;
}

export interface UseNotificationsReturn {
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  filteredNotifications: Notification[];

  // Settings
  settings: NotificationSettings;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;

  // Actions
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  showToastNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;

  // Filtering
  setFilter: (filter: NotificationFilter | null) => void;
  currentFilter: NotificationFilter | null;

  // Permission management
  requestDesktopPermission: () => Promise<boolean>;
  desktopPermissionStatus: NotificationPermission;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enableToasts: true,
  enableSounds: false,
  enableDesktopNotifications: true,
  priorities: {
    [NotificationPriority.LOW]: true,
    [NotificationPriority.MEDIUM]: true,
    [NotificationPriority.HIGH]: true,
    [NotificationPriority.URGENT]: true,
  },
  categories: {
    jobs: true,
    documents: true,
    collaboration: true,
    system: true,
    errors: true,
  },
};

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const {
    realmId,
    settings: initialSettings,
    maxNotifications = 100,
    persistToLocalStorage = true,
    onNewNotification,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [currentFilter, setCurrentFilter] = useState<NotificationFilter | null>(null);
  const [desktopPermissionStatus, setDesktopPermissionStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const subscriptionRef = useRef<string | null>(null);
  const ws = mockWebSocket();

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (persistToLocalStorage) {
      const stored = localStorage.getItem(`morag-notifications-${realmId || 'default'}`);
      if (stored) {
        try {
          const parsedNotifications = JSON.parse(stored) as Notification[];
          setNotifications(parsedNotifications);
        } catch (error) {
          console.warn('Failed to load notifications from localStorage:', error);
        }
      }

      const storedSettings = localStorage.getItem(`morag-notification-settings-${realmId || 'default'}`);
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings) as NotificationSettings;
          setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
        } catch (error) {
          console.warn('Failed to load notification settings from localStorage:', error);
        }
      }
    }
  }, [persistToLocalStorage, realmId]);

  // Save notifications to localStorage
  useEffect(() => {
    if (persistToLocalStorage && notifications.length > 0) {
      localStorage.setItem(
        `morag-notifications-${realmId || 'default'}`,
        JSON.stringify(notifications)
      );
    }
  }, [notifications, persistToLocalStorage, realmId]);

  // Save settings to localStorage
  useEffect(() => {
    if (persistToLocalStorage) {
      localStorage.setItem(
        `morag-notification-settings-${realmId || 'default'}`,
        JSON.stringify(settings)
      );
    }
  }, [settings, persistToLocalStorage, realmId]);

  // Convert WebSocket event to notification
  const eventToNotification = useCallback((event: WebSocketEvent): Notification | null => {
    const baseNotification = {
      id: `notif_${event.id}`,
      timestamp: event.timestamp,
      read: false,
      persistent: false,
      metadata: { eventId: event.id, realmId: event.realmId },
    };

    switch (event.type) {
      case EventType.JOB_STARTED: {
        if (!settings.categories.jobs) return null;
        const jobEvent = event as JobStatusEvent;
        return {
          ...baseNotification,
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Job Started',
          message: `Processing job ${jobEvent.data.jobId} has started`,
          actions: [
            {
              id: 'view-job',
              label: 'View Job',
              variant: 'primary',
              onClick: () => {
                // Navigate to job details
                window.location.href = `/jobs/${jobEvent.data.jobId}`;
              },
            },
          ],
        };
      }

      case EventType.JOB_COMPLETED: {
        if (!settings.categories.jobs) return null;
        const jobEvent = event as JobStatusEvent;
        return {
          ...baseNotification,
          type: NotificationType.SUCCESS,
          priority: NotificationPriority.HIGH,
          title: 'Job Completed',
          message: `Processing job ${jobEvent.data.jobId} has completed successfully`,
          persistent: true,
          actions: [
            {
              id: 'view-results',
              label: 'View Results',
              variant: 'primary',
              onClick: () => {
                window.location.href = `/documents/${jobEvent.data.documentId}`;
              },
            },
          ],
        };
      }

      case EventType.JOB_FAILED: {
        if (!settings.categories.jobs) return null;
        const jobEvent = event as JobStatusEvent;
        return {
          ...baseNotification,
          type: NotificationType.ERROR,
          priority: NotificationPriority.URGENT,
          title: 'Job Failed',
          message: `Processing job ${jobEvent.data.jobId} failed: ${jobEvent.data.error || 'Unknown error'}`,
          persistent: true,
          actions: [
            {
              id: 'retry-job',
              label: 'Retry',
              variant: 'primary',
              onClick: () => {
                // Retry job logic
                console.log('Retrying job:', jobEvent.data.jobId);
              },
            },
            {
              id: 'view-logs',
              label: 'View Logs',
              variant: 'secondary',
              onClick: () => {
                window.location.href = `/jobs/${jobEvent.data.jobId}/logs`;
              },
            },
          ],
        };
      }

      case EventType.DOCUMENT_UPLOADED: {
        if (!settings.categories.documents) return null;
        const docEvent = event as DocumentEvent;
        return {
          ...baseNotification,
          type: NotificationType.INFO,
          priority: NotificationPriority.LOW,
          title: 'Document Uploaded',
          message: `New document "${docEvent.data.documentTitle}" has been uploaded`,
          actions: [
            {
              id: 'view-document',
              label: 'View Document',
              variant: 'primary',
              onClick: () => {
                window.location.href = `/documents/${docEvent.data.documentId}`;
              },
            },
          ],
        };
      }

      case EventType.DOCUMENT_PROCESSED: {
        if (!settings.categories.documents) return null;
        const docEvent = event as DocumentEvent;
        return {
          ...baseNotification,
          type: NotificationType.SUCCESS,
          priority: NotificationPriority.MEDIUM,
          title: 'Document Processed',
          message: `Document "${docEvent.data.documentTitle}" has been processed successfully`,
          actions: [
            {
              id: 'explore-document',
              label: 'Explore',
              variant: 'primary',
              onClick: () => {
                window.location.href = `/documents/${docEvent.data.documentId}/explore`;
              },
            },
          ],
        };
      }

      case EventType.USER_JOINED_REALM: {
        if (!settings.categories.collaboration) return null;
        const userEvent = event as UserCollaborationEvent;
        return {
          ...baseNotification,
          type: NotificationType.INFO,
          priority: NotificationPriority.LOW,
          title: 'User Joined',
          message: `${userEvent.data.userName} joined the realm as ${userEvent.data.role}`,
        };
      }

      case EventType.DOCUMENT_SHARED: {
        if (!settings.categories.collaboration) return null;
        const userEvent = event as UserCollaborationEvent;
        return {
          ...baseNotification,
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Document Shared',
          message: `${userEvent.data.userName} shared a document with you`,
          actions: [
            {
              id: 'view-shared',
              label: 'View',
              variant: 'primary',
              onClick: () => {
                window.location.href = `/documents/${userEvent.data.documentId}`;
              },
            },
          ],
        };
      }

      case EventType.SYSTEM_MAINTENANCE: {
        if (!settings.categories.system) return null;
        const sysEvent = event as SystemNotificationEvent;
        return {
          ...baseNotification,
          type: NotificationType.WARNING,
          priority: NotificationPriority.HIGH,
          title: 'Scheduled Maintenance',
          message: sysEvent.data.message,
          persistent: true,
        };
      }

      case EventType.QUOTA_WARNING: {
        if (!settings.categories.system) return null;
        const sysEvent = event as SystemNotificationEvent;
        return {
          ...baseNotification,
          type: NotificationType.WARNING,
          priority: NotificationPriority.HIGH,
          title: 'Storage Warning',
          message: `Storage usage is at ${sysEvent.data.quotaUsage}% of quota limit`,
          persistent: true,
        };
      }

      case EventType.QUOTA_EXCEEDED: {
        if (!settings.categories.system) return null;
        const sysEvent = event as SystemNotificationEvent;
        return {
          ...baseNotification,
          type: NotificationType.ERROR,
          priority: NotificationPriority.URGENT,
          title: 'Storage Quota Exceeded',
          message: 'Storage quota has been exceeded. Please delete files or upgrade your plan.',
          persistent: true,
        };
      }

      case EventType.PROCESSING_ERROR:
      case EventType.STORAGE_ERROR:
      case EventType.NETWORK_ERROR: {
        if (!settings.categories.errors) return null;
        const errorEvent = event as ErrorWarningEvent;
        return {
          ...baseNotification,
          type: NotificationType.ERROR,
          priority: errorEvent.data.recoverable ? NotificationPriority.HIGH : NotificationPriority.URGENT,
          title: 'System Error',
          message: errorEvent.data.message,
          persistent: !errorEvent.data.recoverable,
          actions: errorEvent.data.recoverable ? [
            {
              id: 'retry-action',
              label: 'Retry',
              variant: 'primary',
              onClick: () => {
                console.log('Retrying action for error:', errorEvent.data.code);
              },
            },
          ] : undefined,
        };
      }

      default:
        return null;
    }
  }, [settings.categories]);

  // Handle incoming WebSocket events
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    const notification = eventToNotification(event);
    if (!notification) return;

    // Check if priority is enabled
    if (!settings.priorities[notification.priority]) return;

    // Add notification
    setNotifications(prev => {
      const newNotifications = [notification, ...prev].slice(0, maxNotifications);
      return newNotifications;
    });

    // Show desktop notification if enabled and permitted
    if (settings.enableDesktopNotifications && 
        desktopPermissionStatus === 'granted' &&
        (notification.priority === NotificationPriority.HIGH || notification.priority === NotificationPriority.URGENT)) {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }

    // Call callback if provided
    onNewNotification?.(notification);
  }, [eventToNotification, settings, desktopPermissionStatus, maxNotifications, onNewNotification]);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (subscriptionRef.current) {
      ws.unsubscribe(subscriptionRef.current);
    }

    subscriptionRef.current = ws.subscribe(
      [
        EventType.JOB_STARTED,
        EventType.JOB_COMPLETED,
        EventType.JOB_FAILED,
        EventType.DOCUMENT_UPLOADED,
        EventType.DOCUMENT_PROCESSED,
        EventType.USER_JOINED_REALM,
        EventType.DOCUMENT_SHARED,
        EventType.COMMENT_ADDED,
        EventType.SYSTEM_MAINTENANCE,
        EventType.QUOTA_WARNING,
        EventType.QUOTA_EXCEEDED,
        EventType.PROCESSING_ERROR,
        EventType.STORAGE_ERROR,
        EventType.NETWORK_ERROR,
        EventType.AUTH_WARNING,
      ],
      handleWebSocketEvent,
      realmId
    );

    return () => {
      if (subscriptionRef.current) {
        ws.unsubscribe(subscriptionRef.current);
      }
    };
  }, [ws, handleWebSocketEvent, realmId]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    if (!currentFilter) return true;

    if (currentFilter.type && !currentFilter.type.includes(notification.type)) return false;
    if (currentFilter.priority && !currentFilter.priority.includes(notification.priority)) return false;
    if (currentFilter.read !== undefined && notification.read !== currentFilter.read) return false;
    if (currentFilter.persistent !== undefined && notification.persistent !== currentFilter.persistent) return false;
    
    if (currentFilter.dateRange) {
      const notificationDate = new Date(notification.timestamp);
      if (notificationDate < currentFilter.dateRange.from || notificationDate > currentFilter.dateRange.to) return false;
    }

    return true;
  });

  // Actions
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showToastNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const fullNotification: Notification = {
      ...notification,
      id: `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications(prev => [fullNotification, ...prev].slice(0, maxNotifications));
    onNewNotification?.(fullNotification);
  }, [maxNotifications, onNewNotification]);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const requestDesktopPermission = useCallback(async (): Promise<boolean> => {
    if (typeof Notification === 'undefined') {
      setDesktopPermissionStatus('denied');
      return false;
    }

    if (Notification.permission === 'granted') {
      setDesktopPermissionStatus('granted');
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setDesktopPermissionStatus(permission);
      return permission === 'granted';
    }

    return false;
  }, []);

  const setFilter = useCallback((filter: NotificationFilter | null) => {
    setCurrentFilter(filter);
  }, []);

  return {
    // Notifications
    notifications,
    unreadCount,
    filteredNotifications,

    // Settings
    settings,
    updateSettings,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    showToastNotification,

    // Filtering
    setFilter,
    currentFilter,

    // Permission management
    requestDesktopPermission,
    desktopPermissionStatus,
  };
};

export default useNotifications;