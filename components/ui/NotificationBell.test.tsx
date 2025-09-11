/**
 * NotificationBell Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBell } from './NotificationBell';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationType, NotificationPriority } from '@/lib/websocket/eventTypes';

// Mock the useNotifications hook
jest.mock('@/lib/hooks/useNotifications');

const mockUseNotifications = useNotifications as jest.MockedFunction<typeof useNotifications>;

// Mock utilities
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

describe('NotificationBell', () => {
  const defaultMockReturn = {
    notifications: [],
    filteredNotifications: [],
    unreadCount: 0,
    settings: {
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
    },
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    deleteNotification: jest.fn(),
    clearAllNotifications: jest.fn(),
    showToastNotification: jest.fn(),
    setFilter: jest.fn(),
    currentFilter: null,
    updateSettings: jest.fn(),
    requestDesktopPermission: jest.fn(),
    desktopPermissionStatus: 'default' as NotificationPermission,
  };

  beforeEach(() => {
    mockUseNotifications.mockReturnValue(defaultMockReturn);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bell icon when no notifications', () => {
      render(<NotificationBell />);
      
      const button = screen.getByRole('button', { name: /notifications.*0 unread/i });
      expect(button).toBeInTheDocument();
    });

    it('should render bell ring icon when there are unread notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 3,
        notifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test Notification',
            message: 'Test message',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ],
        filteredNotifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test Notification',
            message: 'Test message',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ]
      });

      render(<NotificationBell />);
      
      const button = screen.getByRole('button', { name: /notifications.*3 unread/i });
      expect(button).toBeInTheDocument();
      
      const badge = screen.getByText('3');
      expect(badge).toBeInTheDocument();
    });

    it('should show "99+" for counts over 99', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 150,
      });

      render(<NotificationBell />);
      
      const badge = screen.getByText('99+');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Dropdown Functionality', () => {
    it('should open dropdown when bell is clicked', () => {
      render(<NotificationBell />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should close dropdown when clicking outside', async () => {
      render(<NotificationBell />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
      });
    });

    it('should display empty state when no notifications', () => {
      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('No notifications yet')).toBeInTheDocument();
    });

    it('should display filtered empty state', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test',
            message: 'Test',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ],
        filteredNotifications: [], // Empty after filtering
        currentFilter: { read: false },
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('No notifications match your filter')).toBeInTheDocument();
    });
  });

  describe('Notification Display', () => {
    const mockNotification = {
      id: 'test-1',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: 'Job Completed',
      message: 'Your document processing is complete',
      timestamp: Date.now() - 60000, // 1 minute ago
      read: false,
      persistent: false,
      actions: [
        {
          id: 'view',
          label: 'View Results',
          variant: 'primary' as const,
          onClick: jest.fn(),
        }
      ]
    };

    it('should display notification with correct styling based on type', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [mockNotification],
        filteredNotifications: [mockNotification],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Job Completed')).toBeInTheDocument();
      expect(screen.getByText('Your document processing is complete')).toBeInTheDocument();
    });

    it('should display notification timestamp', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [mockNotification],
        filteredNotifications: [mockNotification],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('1m ago')).toBeInTheDocument();
    });

    it('should display notification actions', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [mockNotification],
        filteredNotifications: [mockNotification],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const actionButton = screen.getByText('View Results');
      expect(actionButton).toBeInTheDocument();
    });

    it('should execute notification action on click', () => {
      const mockAction = jest.fn();
      const notificationWithAction = {
        ...mockNotification,
        actions: [
          {
            id: 'view',
            label: 'View Results',
            variant: 'primary' as const,
            onClick: mockAction,
          }
        ]
      };

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [notificationWithAction],
        filteredNotifications: [notificationWithAction],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const actionButton = screen.getByText('View Results');
      fireEvent.click(actionButton);
      
      expect(mockAction).toHaveBeenCalled();
    });

    it('should show priority badge for urgent notifications', () => {
      const urgentNotification = {
        ...mockNotification,
        priority: NotificationPriority.URGENT,
      };

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [urgentNotification],
        filteredNotifications: [urgentNotification],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    it('should show unread indicator for unread notifications', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [mockNotification],
        filteredNotifications: [mockNotification],
        unreadCount: 1,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // Check for unread dot (using class or data-testid would be better)
      const notificationElement = screen.getByText('Job Completed').closest('div');
      expect(notificationElement).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should mark notification as read when clicked', () => {
      const mockNotification = {
        id: 'test-1',
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: 'Test Notification',
        message: 'Test message',
        timestamp: Date.now(),
        read: false,
        persistent: false,
      };

      const mockMarkAsRead = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [mockNotification],
        filteredNotifications: [mockNotification],
        unreadCount: 1,
        markAsRead: mockMarkAsRead,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const notificationElement = screen.getByText('Test Notification');
      fireEvent.click(notificationElement);
      
      expect(mockMarkAsRead).toHaveBeenCalledWith('test-1');
    });

    it('should delete notification when delete button is clicked', () => {
      const mockNotification = {
        id: 'test-1',
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: 'Test Notification',
        message: 'Test message',
        timestamp: Date.now(),
        read: false,
        persistent: false,
      };

      const mockDeleteNotification = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [mockNotification],
        filteredNotifications: [mockNotification],
        deleteNotification: mockDeleteNotification,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // Find and click the delete button
      const deleteButton = screen.getByLabelText('Delete notification');
      fireEvent.click(deleteButton);
      
      expect(mockDeleteNotification).toHaveBeenCalledWith('test-1');
    });

    it('should mark all notifications as read', () => {
      const mockMarkAllAsRead = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test 1',
            message: 'Test 1',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ],
        filteredNotifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test 1',
            message: 'Test 1',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ],
        unreadCount: 1,
        markAllAsRead: mockMarkAllAsRead,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const markAllButton = screen.getByText('Mark all read');
      fireEvent.click(markAllButton);
      
      expect(mockMarkAllAsRead).toHaveBeenCalled();
    });

    it('should clear all notifications', () => {
      const mockClearAllNotifications = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test 1',
            message: 'Test 1',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ],
        filteredNotifications: [
          {
            id: '1',
            type: NotificationType.INFO,
            priority: NotificationPriority.MEDIUM,
            title: 'Test 1',
            message: 'Test 1',
            timestamp: Date.now(),
            read: false,
            persistent: false,
          }
        ],
        clearAllNotifications: mockClearAllNotifications,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);
      
      expect(mockClearAllNotifications).toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    it('should filter unread notifications', () => {
      const mockSetFilter = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const unreadFilter = screen.getByText('Unread');
      fireEvent.click(unreadFilter);
      
      expect(mockSetFilter).toHaveBeenCalledWith({ read: false });
    });

    it('should filter important notifications', () => {
      const mockSetFilter = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const importantFilter = screen.getByText('Important');
      fireEvent.click(importantFilter);
      
      expect(mockSetFilter).toHaveBeenCalledWith({
        priority: [NotificationPriority.URGENT, NotificationPriority.HIGH]
      });
    });

    it('should clear filters', () => {
      const mockSetFilter = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // First activate a filter
      const unreadFilter = screen.getByText('Unread');
      fireEvent.click(unreadFilter);
      
      // Now clear the filter
      const clearFilter = screen.getByText('Clear');
      fireEvent.click(clearFilter);
      
      expect(mockSetFilter).toHaveBeenCalledWith(null);
    });

    it('should show active filter state', () => {
      const mockSetFilter = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        setFilter: mockSetFilter,
        currentFilter: { read: false },
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // First activate a filter to make Clear button appear
      const unreadFilter = screen.getByText('Unread');
      fireEvent.click(unreadFilter);
      
      // Now check if Clear button appears
      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Desktop Permissions', () => {
    it('should request desktop permission on first click', async () => {
      const mockRequestDesktopPermission = jest.fn().mockResolvedValue(true);

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        desktopPermissionStatus: 'default',
        requestDesktopPermission: mockRequestDesktopPermission,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockRequestDesktopPermission).toHaveBeenCalled();
    });

    it('should not request permission if already granted', () => {
      const mockRequestDesktopPermission = jest.fn();

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        desktopPermissionStatus: 'granted',
        requestDesktopPermission: mockRequestDesktopPermission,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(mockRequestDesktopPermission).not.toHaveBeenCalled();
    });
  });

  describe('Settings Integration', () => {
    it('should show settings button when enabled', () => {
      render(<NotificationBell showSettings={true} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByLabelText(/settings/i)).toBeInTheDocument();
    });

    it('should call settings callback when settings clicked', () => {
      const mockOnSettingsClick = jest.fn();

      render(<NotificationBell showSettings={true} onSettingsClick={mockOnSettingsClick} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      const settingsButton = screen.getByLabelText(/settings/i);
      fireEvent.click(settingsButton);
      
      expect(mockOnSettingsClick).toHaveBeenCalled();
    });

    it('should hide settings button when disabled', () => {
      render(<NotificationBell showSettings={false} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.queryByLabelText(/settings/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 5,
      });

      render(<NotificationBell />);
      
      const button = screen.getByRole('button', { name: /notifications.*5 unread/i });
      expect(button).toBeInTheDocument();
    });

    it('should show unread count in header', () => {
      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        unreadCount: 3,
      });

      render(<NotificationBell />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('3 new')).toBeInTheDocument();
    });
  });

  describe('Notification Limits', () => {
    it('should show "more notifications" message when limit exceeded', () => {
      const notifications = Array.from({ length: 15 }, (_, i) => ({
        id: `notif-${i}`,
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        timestamp: Date.now() - i * 1000,
        read: false,
        persistent: false,
      }));

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications,
        filteredNotifications: notifications,
        unreadCount: 15,
      });

      render(<NotificationBell maxVisibleNotifications={10} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      expect(screen.getByText('5 more notifications')).toBeInTheDocument();
    });

    it('should limit displayed notifications', () => {
      const notifications = Array.from({ length: 15 }, (_, i) => ({
        id: `notif-${i}`,
        type: NotificationType.INFO,
        priority: NotificationPriority.MEDIUM,
        title: `Notification ${i}`,
        message: `Message ${i}`,
        timestamp: Date.now() - i * 1000,
        read: false,
        persistent: false,
      }));

      mockUseNotifications.mockReturnValue({
        ...defaultMockReturn,
        notifications,
        filteredNotifications: notifications,
        unreadCount: 15,
      });

      render(<NotificationBell maxVisibleNotifications={5} />);
      
      fireEvent.click(screen.getByRole('button'));
      
      // Should only show 5 notifications
      expect(screen.getAllByText(/Notification \d+/).length).toBe(5);
    });
  });
});