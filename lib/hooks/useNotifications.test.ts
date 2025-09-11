/**
 * useNotifications Hook Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './useNotifications';
import { mockWebSocket } from '../websocket/mockWebSocket';
import { 
  EventType, 
  JobStatusEvent, 
  DocumentEvent,
  SystemNotificationEvent,
  NotificationType, 
  NotificationPriority 
} from '../websocket/eventTypes';

// Enhanced mocking with proper isolation
const createLocalStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Create isolated notification API mock
const createNotificationMock = () => {
  const mockNotification = jest.fn((title: string, options?: NotificationOptions) => ({
    title,
    ...options,
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  
  mockNotification.permission = 'default' as NotificationPermission;
  mockNotification.requestPermission = jest.fn().mockResolvedValue('granted');
  
  return mockNotification;
};

// Mock the WebSocket
jest.mock('../websocket/mockWebSocket', () => ({
  mockWebSocket: jest.fn(() => ({
    subscribe: jest.fn(() => 'mock-subscription-id'),
    unsubscribe: jest.fn(),
  }))
}));

const mockWs = {
  subscribe: jest.fn(() => 'mock-subscription-id'),
  unsubscribe: jest.fn(),
};

(mockWebSocket as jest.Mock).mockReturnValue(mockWs);

describe('useNotifications', () => {
  let localStorageMock: any;
  let mockNotification: any;
  
  beforeEach(() => {
    // Create fresh mocks for each test
    localStorageMock = createLocalStorageMock();
    mockNotification = createNotificationMock();
    
    // Apply mocks to global objects
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    
    Object.defineProperty(window, 'Notification', {
      value: mockNotification,
      writable: true,
      configurable: true,
    });
    
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockNotification.permission = 'default';
  });

  describe('Initialization', () => {
    it('should initialize with default settings', () => {
      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toEqual([]);
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.settings.enableToasts).toBe(true);
      expect(result.current.settings.enableDesktopNotifications).toBe(true);
    });

    it('should load notifications from localStorage', () => {
      const storedNotifications = JSON.stringify([
        {
          id: 'notif1',
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test',
          message: 'Test message',
          timestamp: Date.now(),
          read: false,
          persistent: false,
        }
      ]);

      localStorageMock.getItem.mockReturnValue(storedNotifications);

      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Test');
    });

    it('should load settings from localStorage', () => {
      const storedSettings = JSON.stringify({
        enableToasts: false,
        enableSounds: true,
      });

      localStorageMock.getItem
        .mockReturnValueOnce(null) // notifications
        .mockReturnValueOnce(storedSettings); // settings

      const { result } = renderHook(() => useNotifications());

      expect(result.current.settings.enableToasts).toBe(false);
      expect(result.current.settings.enableSounds).toBe(true);
    });

    it('should handle localStorage parsing errors gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const consoleWarn = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useNotifications());

      expect(result.current.notifications).toEqual([]);
      expect(consoleWarn).toHaveBeenCalled();
      
      consoleWarn.mockRestore();
    });
  });

  describe('WebSocket Event Handling', () => {
    it('should subscribe to notification events', () => {
      renderHook(() => useNotifications({ realmId: 'test-realm' }));

      expect(mockWs.subscribe).toHaveBeenCalledWith(
        expect.arrayContaining([
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
        ]),
        expect.any(Function),
        'test-realm'
      );
    });

    it('should convert job started event to notification', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useNotifications());

      const jobEvent: JobStatusEvent = {
        id: 'job-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: {
          jobId: 'test-job',
          documentId: 'test-doc'
        }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: 'Job Started',
        message: expect.stringContaining('test-job')
      });
    });

    it('should convert job completed event to notification with actions', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useNotifications());

      const jobEvent: JobStatusEvent = {
        id: 'job-event',
        type: EventType.JOB_COMPLETED,
        timestamp: Date.now(),
        data: {
          jobId: 'test-job',
          documentId: 'test-doc'
        }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      expect(result.current.notifications).toHaveLength(1);
      const notification = result.current.notifications[0];
      expect(notification.type).toBe(NotificationType.SUCCESS);
      expect(notification.priority).toBe(NotificationPriority.HIGH);
      expect(notification.persistent).toBe(true);
      expect(notification.actions).toHaveLength(1);
      expect(notification.actions![0].label).toBe('View Results');
    });

    it('should convert job failed event to urgent notification', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useNotifications());

      const jobEvent: JobStatusEvent = {
        id: 'job-event',
        type: EventType.JOB_FAILED,
        timestamp: Date.now(),
        data: {
          jobId: 'test-job',
          error: 'Processing failed'
        }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      expect(result.current.notifications).toHaveLength(1);
      const notification = result.current.notifications[0];
      expect(notification.type).toBe(NotificationType.ERROR);
      expect(notification.priority).toBe(NotificationPriority.URGENT);
      expect(notification.actions).toHaveLength(2);
    });

    it('should convert document uploaded event to notification', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useNotifications());

      const docEvent: DocumentEvent = {
        id: 'doc-event',
        type: EventType.DOCUMENT_UPLOADED,
        timestamp: Date.now(),
        data: {
          documentId: 'test-doc',
          documentTitle: 'Test Document',
          documentType: 'PDF'
        }
      };

      act(() => {
        eventHandler(docEvent);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0]).toMatchObject({
        type: NotificationType.INFO,
        priority: NotificationPriority.LOW,
        title: 'Document Uploaded',
        message: expect.stringContaining('Test Document')
      });
    });

    it('should respect category settings', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useNotifications({
        settings: {
          categories: {
            jobs: false,
            documents: true,
            collaboration: true,
            system: true,
            errors: true,
          }
        }
      }));

      const jobEvent: JobStatusEvent = {
        id: 'job-event',
        type: EventType.JOB_STARTED,
        timestamp: Date.now(),
        data: { jobId: 'test-job' }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      // Should not create notification because jobs category is disabled
      expect(result.current.notifications).toHaveLength(0);
    });

    it('should respect priority settings', () => {
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      const { result } = renderHook(() => useNotifications({
        settings: {
          priorities: {
            [NotificationPriority.LOW]: false,
            [NotificationPriority.MEDIUM]: true,
            [NotificationPriority.HIGH]: true,
            [NotificationPriority.URGENT]: true,
          }
        }
      }));

      const docEvent: DocumentEvent = {
        id: 'doc-event',
        type: EventType.DOCUMENT_UPLOADED, // Creates LOW priority notification
        timestamp: Date.now(),
        data: {
          documentId: 'test-doc',
          documentTitle: 'Test Document',
          documentType: 'PDF'
        }
      };

      act(() => {
        eventHandler(docEvent);
      });

      // Should not create notification because LOW priority is disabled
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('Desktop Notifications', () => {
    it('should request desktop notification permission', async () => {
      // Setup mock before rendering hook
      const mockRequestPermission = jest.fn().mockResolvedValue('granted');
      Object.defineProperty(window.Notification, 'requestPermission', {
        value: mockRequestPermission,
        configurable: true,
      });

      const { result } = renderHook(() => useNotifications());

      let permissionGranted;
      await act(async () => {
        permissionGranted = await result.current.requestDesktopPermission();
      });

      expect(mockRequestPermission).toHaveBeenCalled();
      expect(permissionGranted).toBe(true);
      expect(result.current.desktopPermissionStatus).toBe('granted');
    });

    it('should show desktop notification for high priority events', () => {
      // Setup granted permission
      Object.defineProperty(window.Notification, 'permission', {
        get: () => 'granted',
        configurable: true,
      });
      
      const mockNotificationInstance = jest.fn();
      Object.defineProperty(window, 'Notification', {
        value: mockNotificationInstance,
        configurable: true,
      });
      
      let eventHandler: (event: any) => void = () => {};
      
      mockWs.subscribe.mockImplementation((eventTypes, handler) => {
        eventHandler = handler;
        return 'mock-sub-id';
      });

      renderHook(() => useNotifications({
        settings: { enableDesktopNotifications: true }
      }));

      const jobEvent: JobStatusEvent = {
        id: 'job-event',
        type: EventType.JOB_COMPLETED, // HIGH priority
        timestamp: Date.now(),
        data: {
          jobId: 'test-job',
          documentId: 'test-doc'
        }
      };

      act(() => {
        eventHandler(jobEvent);
      });

      expect(mockNotificationInstance).toHaveBeenCalledWith(
        'Job Completed',
        expect.objectContaining({
          body: expect.any(String),
          icon: '/favicon.ico',
          tag: expect.any(String)
        })
      );
    });
  });

  describe('Notification Management', () => {
    it('should mark notification as read', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test',
          message: 'Test message',
          persistent: false
        });
      });

      expect(result.current.unreadCount).toBe(1);

      act(() => {
        result.current.markAsRead(result.current.notifications[0].id);
      });

      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications[0].read).toBe(true);
    });

    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test 1',
          message: 'Test message 1',
          persistent: false
        });
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test 2',
          message: 'Test message 2',
          persistent: false
        });
      });

      expect(result.current.unreadCount).toBe(2);

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
    });

    it('should delete notification', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test',
          message: 'Test message',
          persistent: false
        });
      });

      expect(result.current.notifications).toHaveLength(1);
      const notificationId = result.current.notifications[0].id;

      act(() => {
        result.current.deleteNotification(notificationId);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test 1',
          message: 'Test message 1',
          persistent: false
        });
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test 2',
          message: 'Test message 2',
          persistent: false
        });
      });

      expect(result.current.notifications).toHaveLength(2);

      act(() => {
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('should limit notifications to maxNotifications', () => {
      const { result } = renderHook(() => useNotifications({ maxNotifications: 3 }));

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.showToastNotification({
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: `Test ${i}`,
            message: `Test message ${i}`,
            persistent: false
          });
        }
      });

      expect(result.current.notifications).toHaveLength(3);
      expect(result.current.notifications[0].title).toBe('Test 4'); // Most recent
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      // Mock some notifications for filtering tests
    });

    it('should filter notifications by type', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.SUCCESS,
          priority: NotificationPriority.MEDIUM,
          title: 'Success',
          message: 'Success message',
          persistent: false
        });
        result.current.showToastNotification({
          type: NotificationType.ERROR,
          priority: NotificationPriority.MEDIUM,
          title: 'Error',
          message: 'Error message',
          persistent: false
        });
      });

      act(() => {
        result.current.setFilter({ type: [NotificationType.SUCCESS] });
      });

      expect(result.current.filteredNotifications).toHaveLength(1);
      expect(result.current.filteredNotifications[0].type).toBe(NotificationType.SUCCESS);
    });

    it('should filter notifications by read status', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test 1',
          message: 'Test message 1',
          persistent: false
        });
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test 2',
          message: 'Test message 2',
          persistent: false
        });
      });

      const firstId = result.current.notifications[1].id; // Older one
      act(() => {
        result.current.markAsRead(firstId);
      });

      act(() => {
        result.current.setFilter({ read: false });
      });

      expect(result.current.filteredNotifications).toHaveLength(1);
      expect(result.current.filteredNotifications[0].read).toBe(false);
    });

    it('should filter notifications by priority', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.LOW,
          title: 'Low Priority',
          message: 'Low priority message',
          persistent: false
        });
        result.current.showToastNotification({
          type: NotificationType.WARNING,
          priority: NotificationPriority.HIGH,
          title: 'High Priority',
          message: 'High priority message',
          persistent: false
        });
      });

      act(() => {
        result.current.setFilter({ priority: [NotificationPriority.HIGH] });
      });

      expect(result.current.filteredNotifications).toHaveLength(1);
      expect(result.current.filteredNotifications[0].priority).toBe(NotificationPriority.HIGH);
    });

    it('should clear filter', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test',
          message: 'Test message',
          persistent: false
        });
      });

      act(() => {
        result.current.setFilter({ read: false });
      });

      expect(result.current.currentFilter).toEqual({ read: false });

      act(() => {
        result.current.setFilter(null);
      });

      expect(result.current.currentFilter).toBeNull();
      expect(result.current.filteredNotifications).toHaveLength(1);
    });
  });

  describe('Settings Management', () => {
    it('should update notification settings', () => {
      const { result } = renderHook(() => useNotifications());

      act(() => {
        result.current.updateSettings({
          enableToasts: false,
          enableSounds: true
        });
      });

      expect(result.current.settings.enableToasts).toBe(false);
      expect(result.current.settings.enableSounds).toBe(true);
    });

    it('should save settings to localStorage', () => {
      const { result } = renderHook(() => useNotifications({ persistToLocalStorage: true }));

      act(() => {
        result.current.updateSettings({
          enableToasts: false
        });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'morag-notification-settings-default',
        expect.stringContaining('enableToasts')
      );
    });
  });

  describe('Callback Handling', () => {
    it('should call onNewNotification callback', () => {
      const mockCallback = jest.fn();
      const { result } = renderHook(() => useNotifications({
        onNewNotification: mockCallback
      }));

      act(() => {
        result.current.showToastNotification({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test',
          message: 'Test message',
          persistent: false
        });
      });

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test',
          message: 'Test message'
        })
      );
    });
  });
});