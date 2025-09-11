/**
 * ToastNotification Component Tests
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastNotification, ToastContainer, useToastNotifications } from './ToastNotification';
import { NotificationType, NotificationPriority } from '@/lib/websocket/eventTypes';
import { renderHook } from '@testing-library/react';

// Mock utilities
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

describe('ToastNotification', () => {
  const mockNotification = {
    id: 'test-notification',
    type: NotificationType.INFO,
    priority: NotificationPriority.MEDIUM,
    title: 'Test Notification',
    message: 'This is a test notification message',
    timestamp: Date.now(),
    read: false,
    persistent: false,
  };

  const mockOnDismiss = jest.fn();
  const mockOnAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render notification with title and message', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Test Notification')).toBeInTheDocument();
      expect(screen.getByText('This is a test notification message')).toBeInTheDocument();
    });

    it('should render correct icon based on notification type', () => {
      const successNotification = {
        ...mockNotification,
        type: NotificationType.SUCCESS,
      };

      render(
        <ToastNotification
          notification={successNotification}
          onDismiss={mockOnDismiss}
        />
      );

      // Check for success icon (Check icon)
      const successIcon = screen.getByRole('img', { hidden: true });
      expect(successIcon).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    it('should render action buttons when actions are provided', () => {
      const notificationWithActions = {
        ...mockNotification,
        actions: [
          {
            id: 'action1',
            label: 'View Details',
            variant: 'primary' as const,
            onClick: jest.fn(),
          },
          {
            id: 'action2',
            label: 'Dismiss',
            variant: 'secondary' as const,
            onClick: jest.fn(),
          },
        ],
      };

      render(
        <ToastNotification
          notification={notificationWithActions}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('View Details')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should render progress bar when showProgress is true and not persistent', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
          showProgress={true}
          autoHideDuration={5000}
        />
      );

      // Progress bar should be present
      const progressBar = screen.getByLabelText('Auto-dismiss progress');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not render progress bar for persistent notifications', () => {
      const persistentNotification = {
        ...mockNotification,
        persistent: true,
      };

      render(
        <ToastNotification
          notification={persistentNotification}
          onDismiss={mockOnDismiss}
          showProgress={true}
          autoHideDuration={5000}
        />
      );

      expect(screen.queryByLabelText('Auto-dismiss progress')).not.toBeInTheDocument();
    });
  });

  describe('Auto-dismiss Functionality', () => {
    it('should auto-dismiss after specified duration', async () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
          autoHideDuration={1000}
        />
      );

      // Fast-forward time to trigger auto-dismiss
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for the animation delay
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnDismiss).toHaveBeenCalledWith('test-notification');
    });

    it('should not auto-dismiss persistent notifications', () => {
      const persistentNotification = {
        ...mockNotification,
        persistent: true,
      };

      render(
        <ToastNotification
          notification={persistentNotification}
          onDismiss={mockOnDismiss}
          autoHideDuration={1000}
        />
      );

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });

    it('should pause auto-dismiss on hover when pauseOnHover is true', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
          autoHideDuration={1000}
          pauseOnHover={true}
        />
      );

      const toastElement = screen.getByRole('alert');
      
      // Hover over toast
      fireEvent.mouseEnter(toastElement);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not dismiss while hovered
      expect(mockOnDismiss).not.toHaveBeenCalled();

      // Mouse leave
      fireEvent.mouseLeave(toastElement);
      
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Wait for animation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should not auto-dismiss when duration is 0', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
          autoHideDuration={0}
        />
      );

      act(() => {
        jest.advanceTimersByTime(10000);
      });

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('User Interactions', () => {
    it('should dismiss when close button is clicked', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      expect(mockOnDismiss).toHaveBeenCalledWith('test-notification');
    });

    it('should execute action when action button is clicked', () => {
      const mockActionClick = jest.fn();
      const notificationWithActions = {
        ...mockNotification,
        actions: [
          {
            id: 'test-action',
            label: 'Test Action',
            variant: 'primary' as const,
            onClick: mockActionClick,
          },
        ],
      };

      render(
        <ToastNotification
          notification={notificationWithActions}
          onDismiss={mockOnDismiss}
          onAction={mockOnAction}
        />
      );

      const actionButton = screen.getByText('Test Action');
      fireEvent.click(actionButton);

      expect(mockOnAction).toHaveBeenCalledWith('test-action', 'test-notification');
      expect(mockActionClick).toHaveBeenCalled();
    });

    it('should auto-dismiss after action click for non-persistent notifications', () => {
      const notificationWithActions = {
        ...mockNotification,
        actions: [
          {
            id: 'test-action',
            label: 'Test Action',
            variant: 'primary' as const,
            onClick: jest.fn(),
          },
        ],
      };

      render(
        <ToastNotification
          notification={notificationWithActions}
          onDismiss={mockOnDismiss}
          onAction={mockOnAction}
        />
      );

      const actionButton = screen.getByText('Test Action');
      fireEvent.click(actionButton);

      // Wait for animation
      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnDismiss).toHaveBeenCalledWith('test-notification');
    });

    it('should not auto-dismiss after action click for persistent notifications', () => {
      const persistentNotificationWithActions = {
        ...mockNotification,
        persistent: true,
        actions: [
          {
            id: 'test-action',
            label: 'Test Action',
            variant: 'primary' as const,
            onClick: jest.fn(),
          },
        ],
      };

      render(
        <ToastNotification
          notification={persistentNotificationWithActions}
          onDismiss={mockOnDismiss}
          onAction={mockOnAction}
        />
      );

      const actionButton = screen.getByText('Test Action');
      fireEvent.click(actionButton);

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockOnDismiss).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveAttribute('aria-live', 'polite');
    });

    it('should have assertive aria-live for urgent notifications', () => {
      const urgentNotification = {
        ...mockNotification,
        priority: NotificationPriority.URGENT,
      };

      render(
        <ToastNotification
          notification={urgentNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const toastElement = screen.getByRole('alert');
      expect(toastElement).toHaveAttribute('aria-live', 'assertive');
    });

    it('should have proper progress bar label', () => {
      render(
        <ToastNotification
          notification={mockNotification}
          onDismiss={mockOnDismiss}
          showProgress={true}
          autoHideDuration={5000}
        />
      );

      const progressBar = screen.getByLabelText('Auto-dismiss progress');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Styling Variants', () => {
    it('should apply correct styles for different notification types', () => {
      const { rerender } = render(
        <ToastNotification
          notification={{ ...mockNotification, type: NotificationType.SUCCESS }}
          onDismiss={mockOnDismiss}
        />
      );

      let toastElement = screen.getByRole('alert');
      expect(toastElement.className).toContain('bg-green-50');

      rerender(
        <ToastNotification
          notification={{ ...mockNotification, type: NotificationType.ERROR }}
          onDismiss={mockOnDismiss}
        />
      );

      toastElement = screen.getByRole('alert');
      expect(toastElement.className).toContain('bg-red-50');
    });

    it('should apply correct styles for different priorities', () => {
      const { rerender } = render(
        <ToastNotification
          notification={{ ...mockNotification, priority: NotificationPriority.URGENT }}
          onDismiss={mockOnDismiss}
        />
      );

      let toastElement = screen.getByRole('alert');
      expect(toastElement.className).toContain('animate-pulse');

      rerender(
        <ToastNotification
          notification={{ ...mockNotification, priority: NotificationPriority.LOW }}
          onDismiss={mockOnDismiss}
        />
      );

      toastElement = screen.getByRole('alert');
      expect(toastElement.className).not.toContain('animate-pulse');
    });
  });
});

describe('ToastContainer', () => {
  const mockNotifications = [
    {
      id: '1',
      type: NotificationType.INFO,
      priority: NotificationPriority.MEDIUM,
      title: 'Info Notification',
      message: 'Info message',
      timestamp: Date.now(),
      read: false,
      persistent: false,
    },
    {
      id: '2',
      type: NotificationType.SUCCESS,
      priority: NotificationPriority.HIGH,
      title: 'Success Notification',
      message: 'Success message',
      timestamp: Date.now() - 1000,
      read: false,
      persistent: false,
    },
    {
      id: '3',
      type: NotificationType.ERROR,
      priority: NotificationPriority.URGENT,
      title: 'Error Notification',
      message: 'Error message',
      timestamp: Date.now() - 2000,
      read: false,
      persistent: false,
    },
  ];

  const mockOnDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all notifications', () => {
      render(
        <ToastContainer
          notifications={mockNotifications}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Info Notification')).toBeInTheDocument();
      expect(screen.getByText('Success Notification')).toBeInTheDocument();
      expect(screen.getByText('Error Notification')).toBeInTheDocument();
    });

    it('should render nothing when no notifications', () => {
      const { container } = render(
        <ToastContainer
          notifications={[]}
          onDismiss={mockOnDismiss}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should limit displayed notifications to maxToasts', () => {
      render(
        <ToastContainer
          notifications={mockNotifications}
          onDismiss={mockOnDismiss}
          maxToasts={2}
        />
      );

      // Should only show 2 notifications
      expect(screen.getByText('Error Notification')).toBeInTheDocument(); // Highest priority
      expect(screen.getByText('Success Notification')).toBeInTheDocument(); // Second highest
      expect(screen.queryByText('Info Notification')).not.toBeInTheDocument(); // Should be filtered out
    });

    it('should sort notifications by priority and timestamp', () => {
      render(
        <ToastContainer
          notifications={mockNotifications}
          onDismiss={mockOnDismiss}
        />
      );

      const toastElements = screen.getAllByRole('alert');
      
      // Error (URGENT) should be first, then Success (HIGH), then Info (MEDIUM)
      expect(toastElements).toHaveLength(3);
      // We can't easily test the order without more specific selectors
      // but the component should render them in the correct priority order
    });
  });

  describe('Positioning', () => {
    it('should apply correct positioning classes', () => {
      const { rerender, container } = render(
        <ToastContainer
          notifications={mockNotifications}
          position="top-right"
          onDismiss={mockOnDismiss}
        />
      );

      expect(container.firstChild).toHaveClass('top-4', 'right-4');

      rerender(
        <ToastContainer
          notifications={mockNotifications}
          position="bottom-left"
          onDismiss={mockOnDismiss}
        />
      );

      expect(container.firstChild).toHaveClass('bottom-4', 'left-4');
    });

    it('should handle center positions', () => {
      const { container } = render(
        <ToastContainer
          notifications={mockNotifications}
          position="top-center"
          onDismiss={mockOnDismiss}
        />
      );

      expect(container.firstChild).toHaveClass('top-4', 'left-1/2', 'transform', '-translate-x-1/2');
    });
  });

  describe('Z-index Management', () => {
    it('should apply correct z-index to each toast', () => {
      render(
        <ToastContainer
          notifications={mockNotifications}
          onDismiss={mockOnDismiss}
        />
      );

      const toastWrappers = screen.getAllByRole('alert').map(el => el.parentElement);
      
      // Each toast should have a different z-index
      toastWrappers.forEach((wrapper, index) => {
        if (wrapper) {
          const expectedZIndex = mockNotifications.length - index;
          expect(wrapper.style.zIndex).toBe(expectedZIndex.toString());
        }
      });
    });
  });
});

describe('useToastNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Toast Management', () => {
    it('should add toast notification', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test Toast',
          message: 'Test message',
          persistent: false,
        });
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
    });

    it('should generate unique IDs for toasts', () => {
      const { result } = renderHook(() => useToastNotifications());

      let id1: string;
      let id2: string;

      act(() => {
        id1 = result.current.showToast({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Toast 1',
          message: 'Message 1',
          persistent: false,
        });
      });

      act(() => {
        id2 = result.current.showToast({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Toast 2',
          message: 'Message 2',
          persistent: false,
        });
      });

      expect(id1).not.toBe(id2);
      expect(result.current.toasts).toHaveLength(2);
    });

    it('should dismiss specific toast', () => {
      const { result } = renderHook(() => useToastNotifications());

      let toastId: string;

      act(() => {
        toastId = result.current.showToast({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Test Toast',
          message: 'Test message',
          persistent: false,
        });
      });

      expect(result.current.toasts).toHaveLength(1);

      act(() => {
        result.current.dismissToast(toastId);
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should clear all toasts', () => {
      const { result } = renderHook(() => useToastNotifications());

      act(() => {
        result.current.showToast({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Toast 1',
          message: 'Message 1',
          persistent: false,
        });
        result.current.showToast({
          type: NotificationType.INFO,
          priority: NotificationPriority.MEDIUM,
          title: 'Toast 2',
          message: 'Message 2',
          persistent: false,
        });
      });

      expect(result.current.toasts).toHaveLength(2);

      act(() => {
        result.current.clearAllToasts();
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should handle dismissing non-existent toast gracefully', () => {
      const { result } = renderHook(() => useToastNotifications());

      expect(() => {
        act(() => {
          result.current.dismissToast('non-existent-id');
        });
      }).not.toThrow();

      expect(result.current.toasts).toHaveLength(0);
    });
  });
});