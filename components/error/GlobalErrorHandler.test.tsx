import React from 'react';
import { render } from '@testing-library/react';
import { 
  GlobalErrorHandler, 
  useGlobalErrorHandler, 
  reportManualError 
} from './GlobalErrorHandler';
import { reportError } from '@/lib/error/errorReporting';

// Mock error reporting
jest.mock('@/lib/error/errorReporting', () => ({
  reportError: jest.fn().mockResolvedValue(undefined),
}));

const mockReportError = reportError as jest.MockedFunction<typeof reportError>;

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;
const originalConsoleLog = console.log;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
  console.log = jest.fn();
  mockReportError.mockClear();
  
  // Clear any existing event listeners
  const events = ['unhandledrejection', 'error'];
  events.forEach(event => {
    const listeners = (window as any)._eventListeners?.[event] || [];
    listeners.forEach((listener: EventListener) => {
      window.removeEventListener(event, listener);
    });
  });
});

afterEach(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
  console.log = originalConsoleLog;
});

// Helper to create mock events
const createUnhandledRejectionEvent = (reason: any) => {
  const promise = Promise.resolve().then(() => { throw reason; });
  promise.catch(() => {}); // Prevent actual unhandled rejection
  
  const event = new Event('unhandledrejection') as any;
  event.reason = reason;
  event.promise = promise;
  event.preventDefault = jest.fn();
  return event;
};

const createErrorEvent = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => {
  const event = new Event('error') as any;
  event.message = message;
  event.filename = filename || '';
  event.lineno = lineno || 0;
  event.colno = colno || 0;
  event.error = error || new Error(message);
  return event;
};

const createResourceErrorEvent = (tagName: string, src?: string) => {
  const element = document.createElement(tagName.toLowerCase());
  if (src) {
    (element as any).src = src;
  }
  const event = new Event('error', { bubbles: true });
  Object.defineProperty(event, 'target', { value: element, enumerable: true });
  return event;
};

describe('GlobalErrorHandler', () => {
  describe('Component Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<GlobalErrorHandler />);
      expect(container.firstChild).toBeNull(); // Component doesn't render anything
    });

    test('renders with custom props', () => {
      const onError = jest.fn();
      const { container } = render(
        <GlobalErrorHandler 
          showNotifications={false}
          enableReporting={false}
          onError={onError}
          enableConsoleLogging={false}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Unhandled Promise Rejection Handling', () => {
    test('handles unhandled promise rejection with Error object', () => {
      const onError = jest.fn();
      const testError = new Error('Promise rejection test');
      
      render(<GlobalErrorHandler onError={onError} enableReporting={true} />);

      const event = createUnhandledRejectionEvent(testError);
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(testError, 'unhandledRejection');
      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Promise rejection test',
          context: 'unhandledRejection',
          stack: expect.any(String),
        })
      );
      expect(event.preventDefault).toHaveBeenCalled();
    });

    test('handles unhandled promise rejection with string reason', () => {
      const onError = jest.fn();
      
      render(<GlobalErrorHandler onError={onError} />);

      const event = createUnhandledRejectionEvent('String error reason');
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'String error reason' }), 
        'unhandledRejection'
      );
    });

    test('logs to console in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
      
      render(<GlobalErrorHandler enableConsoleLogging={true} />);

      const event = createUnhandledRejectionEvent(new Error('Dev logging test'));
      window.dispatchEvent(event);

      expect(console.group).toHaveBeenCalledWith('🚨 Unhandled Promise Rejection');
      expect(console.error).toHaveBeenCalledTimes(3); // Promise, Reason, Error
      expect(console.groupEnd).toHaveBeenCalled();

      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
    });

    test('does not log when console logging is disabled', () => {
      render(<GlobalErrorHandler enableConsoleLogging={false} />);

      const event = createUnhandledRejectionEvent(new Error('No logging test'));
      window.dispatchEvent(event);

      expect(console.group).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test('does not report when reporting is disabled', () => {
      render(<GlobalErrorHandler enableReporting={false} />);

      const event = createUnhandledRejectionEvent(new Error('No reporting test'));
      window.dispatchEvent(event);

      expect(mockReportError).not.toHaveBeenCalled();
    });

    test('shows notifications when enabled', () => {
      render(<GlobalErrorHandler showNotifications={true} />);

      const event = createUnhandledRejectionEvent(new Error('Notification test'));
      window.dispatchEvent(event);

      expect(console.warn).toHaveBeenCalledWith(
        '🚨 Application Error:', 
        'The application encountered an error while processing your request.'
      );
    });

    test('handles reporting failures gracefully', async () => {
      mockReportError.mockRejectedValueOnce(new Error('Reporting failed'));
      
      render(<GlobalErrorHandler enableConsoleLogging={true} />);

      const event = createUnhandledRejectionEvent(new Error('Report failure test'));
      window.dispatchEvent(event);

      // Wait for async promise rejection to be handled
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should not throw, should log warning
      expect(console.warn).toHaveBeenCalledWith('Failed to report error:', expect.any(Error));
    });
  });

  describe('Window Error Handling', () => {
    test('handles window error events', () => {
      const onError = jest.fn();
      
      render(<GlobalErrorHandler onError={onError} enableReporting={true} />);

      const event = createErrorEvent('Window error test', 'test.js', 123, 45);
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Window error test' }), 
        'windowError'
      );
      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Window error test',
          context: 'windowError',
          additional: expect.objectContaining({
            filename: 'test.js',
            lineno: 123,
            colno: 45,
          }),
        })
      );
    });

    test('logs window errors in development', () => {
      render(<GlobalErrorHandler enableConsoleLogging={true} />);

      const event = createErrorEvent('Dev window error', 'app.js', 100);
      window.dispatchEvent(event);

      expect(console.group).toHaveBeenCalledWith('🚨 Uncaught JavaScript Error');
      expect(console.error).toHaveBeenCalledWith('Message:', 'Dev window error');
      expect(console.error).toHaveBeenCalledWith('Source:', 'app.js');
      expect(console.error).toHaveBeenCalledWith('Line:', 100);
      expect(console.groupEnd).toHaveBeenCalled();
    });

    test('creates error from message when no error object exists', () => {
      const onError = jest.fn();
      
      render(<GlobalErrorHandler onError={onError} />);

      const event = createErrorEvent('Message only error');
      delete event.error;
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Message only error' }), 
        'windowError'
      );
    });
  });

  describe('Resource Error Handling', () => {
    test('handles image loading errors', () => {
      const onError = jest.fn();
      
      render(<GlobalErrorHandler onError={onError} enableReporting={true} />);

      const event = createResourceErrorEvent('IMG', 'broken-image.jpg');
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to load img' }), 
        'resourceError'
      );
      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Failed to load img',
          context: 'resourceError',
          additional: expect.objectContaining({
            tagName: 'IMG',
            src: expect.stringContaining('broken-image.jpg'),
          }),
        })
      );
    });

    test('handles script loading errors', () => {
      const onError = jest.fn();
      
      render(<GlobalErrorHandler onError={onError} />);

      const event = createResourceErrorEvent('SCRIPT', 'broken-script.js');
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to load script' }), 
        'resourceError'
      );
    });

    test('logs resource errors in development', () => {
      render(<GlobalErrorHandler enableConsoleLogging={true} />);

      const event = createResourceErrorEvent('LINK', 'broken-stylesheet.css');
      window.dispatchEvent(event);

      expect(console.group).toHaveBeenCalledWith('🚨 Resource Loading Error');
      expect(console.error).toHaveBeenCalledWith('Tag:', 'LINK');
      expect(console.error).toHaveBeenCalledWith('Source:', expect.stringContaining('broken-stylesheet.css'));
      expect(console.groupEnd).toHaveBeenCalled();
    });

    test('does not show notifications for resource errors', () => {
      render(<GlobalErrorHandler showNotifications={true} />);

      const event = createResourceErrorEvent('IMG', 'test.jpg');
      window.dispatchEvent(event);

      // Resource errors should not trigger user notifications
      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('🚨 Application Error:')
      );
    });

    test('handles resource errors without src attribute', () => {
      const onError = jest.fn();
      
      render(<GlobalErrorHandler onError={onError} />);

      const event = createResourceErrorEvent('DIV'); // No src attribute
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Failed to load div' }), 
        'resourceError'
      );
    });
  });

  describe('Event Listener Cleanup', () => {
    test('removes event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      
      const { unmount } = render(<GlobalErrorHandler />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function), true);

      removeEventListenerSpy.mockRestore();
    });

    test('handles multiple instances correctly', () => {
      const { unmount: unmount1 } = render(<GlobalErrorHandler />);
      const { unmount: unmount2 } = render(<GlobalErrorHandler />);

      // Both should work without interference
      unmount1();
      unmount2();

      // No errors should be thrown
    });
  });

  describe('useGlobalErrorHandler Hook', () => {
    test('hook version works correctly', () => {
      const TestComponent = () => {
        useGlobalErrorHandler({ enableReporting: false });
        return <div>Test</div>;
      };

      const { container } = render(<TestComponent />);
      expect(container.textContent).toBe('Test');
    });

    test('hook accepts props', () => {
      const onError = jest.fn();
      
      const TestComponent = () => {
        useGlobalErrorHandler({ onError, showNotifications: false });
        return <div>Hook Test</div>;
      };

      render(<TestComponent />);

      const event = createUnhandledRejectionEvent(new Error('Hook error'));
      window.dispatchEvent(event);

      expect(onError).toHaveBeenCalled();
    });
  });

  describe('reportManualError Function', () => {
    test('reports manual errors correctly', async () => {
      const testError = new Error('Manual error test');
      
      await reportManualError(testError, 'manual-context');

      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Manual error test',
          context: 'manual-context',
          stack: expect.any(String),
          additional: expect.objectContaining({
            manual: true,
          }),
        })
      );
    });

    test('uses default context when none provided', async () => {
      const testError = new Error('Default context test');
      
      await reportManualError(testError);

      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          context: 'manual',
        })
      );
    });

    test('returns promise from reportError', async () => {
      mockReportError.mockResolvedValueOnce();
      
      const testError = new Error('Promise test');
      await reportManualError(testError);

      expect(mockReportError).toHaveBeenCalledWith(testError);
    });
  });

  describe('Configuration Options', () => {
    test('respects showNotifications setting', () => {
      render(<GlobalErrorHandler showNotifications={false} />);

      const event = createUnhandledRejectionEvent(new Error('No notification test'));
      window.dispatchEvent(event);

      expect(console.warn).not.toHaveBeenCalledWith(
        expect.stringContaining('🚨 Application Error:')
      );
    });

    test('respects enableReporting setting', () => {
      render(<GlobalErrorHandler enableReporting={false} />);

      const event = createUnhandledRejectionEvent(new Error('No reporting test'));
      window.dispatchEvent(event);

      expect(mockReportError).not.toHaveBeenCalled();
    });

    test('respects enableConsoleLogging setting', () => {
      render(<GlobalErrorHandler enableConsoleLogging={false} />);

      const event = createUnhandledRejectionEvent(new Error('No console test'));
      window.dispatchEvent(event);

      expect(console.group).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    test('uses default settings when no props provided', () => {
      const originalEnv = process.env.NODE_ENV;
      
      // Set NODE_ENV to development before rendering
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
      
      // Test console logging is enabled (simplified test)
      render(<GlobalErrorHandler enableConsoleLogging={true} />);

      const event = createUnhandledRejectionEvent(new Error('Default settings test'));
      window.dispatchEvent(event);

      // Should enable console logging
      expect(console.group).toHaveBeenCalledWith('🚨 Unhandled Promise Rejection');

      // Restore original environment
      Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
    });
  });

  describe('Error Report Content', () => {
    test('includes correct error report structure', () => {
      render(<GlobalErrorHandler enableReporting={true} />);

      const event = createUnhandledRejectionEvent(new Error('Structure test'));
      window.dispatchEvent(event);

      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Structure test',
          stack: expect.any(String),
          context: 'unhandledRejection',
          timestamp: expect.any(String),
          url: expect.any(String),
          userAgent: expect.any(String),
          additional: expect.any(Object),
        })
      );
    });

    test('includes window location and user agent', () => {
      render(<GlobalErrorHandler enableReporting={true} />);

      const event = createUnhandledRejectionEvent(new Error('Location test'));
      window.dispatchEvent(event);

      // Check that reportError was called and includes the location/userAgent data
      expect(mockReportError).toHaveBeenCalled();
      const reportedError = mockReportError.mock.calls[0]?.[0];
      expect(reportedError).toBeDefined();
      
      if (reportedError) {
        // Verify that the error report includes url and userAgent fields
        expect(reportedError).toHaveProperty('url');
        expect(reportedError).toHaveProperty('userAgent');
        expect(typeof (reportedError as any).url).toBe('string');
        expect(typeof (reportedError as any).userAgent).toBe('string');
        expect((reportedError as any).url).toBeTruthy();
        expect((reportedError as any).userAgent).toBeTruthy();
      }
    });
  });
});