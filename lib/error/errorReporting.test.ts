import {
  initializeErrorReporting,
  reportError,
  reportJavaScriptError,
  reportApiError,
  reportUserAction,
  reportPerformanceIssue,
  createErrorBoundaryReporter,
  destroyErrorReporting,
  type ErrorReport,
  type ErrorReportingConfig,
} from './errorReporting';
import {
  withEnv,
  describeWithEnv
} from '../testing/envMockUtils';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock timers
jest.useFakeTimers();

// Mock window methods
const mockLocation = { href: 'https://test.example.com/page' };
const mockUserAgent = 'Test User Agent';

try {
  Object.defineProperty(window, 'location', {
    get: () => mockLocation,
    configurable: true,
  });
} catch (e) {
  // Location might already be mocked in other tests
  // Use a different mocking approach
  delete (window as any).location;
  (window as any).location = mockLocation;
}

Object.defineProperty(navigator, 'userAgent', {
  get: () => mockUserAgent,
  configurable: true,
});

describe('ErrorReporting', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
    } as Response);

    // Reset any global state
    destroyErrorReporting();
    
    // Clear all timers
    jest.clearAllTimers();
    
    // Mock console to avoid noise
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    destroyErrorReporting();
  });

  describe('Initialization', () => {
    test('initializes with default config', () => {
      initializeErrorReporting();
      
      // Should work without throwing
      expect(() => {
        reportJavaScriptError(new Error('Test'), 'test');
      }).not.toThrow();
    });

    test('initializes with custom config', () => {
      const config: ErrorReportingConfig = {
        endpoint: '/custom/errors',
        apiKey: 'test-key',
        enabled: true,
        maxRetries: 5,
        batchSize: 20,
      };

      initializeErrorReporting(config);
      
      expect(() => {
        reportJavaScriptError(new Error('Custom config test'), 'test');
      }).not.toThrow();
    });

    test('creates global reporter if not initialized', async () => {
      const errorReport: ErrorReport = {
        message: 'Auto init test',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(errorReport);

      // Should have created global reporter and not thrown
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('Error Reporting', () => {
    beforeEach(() => {
      initializeErrorReporting({ enabled: true });
    });

    test('reports errors to endpoint', async () => {
      const errorReport: ErrorReport = {
        message: 'Test error message',
        stack: 'Error stack trace',
        context: 'test-context',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(errorReport);

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors: [errorReport],
          timestamp: expect.any(String),
        }),
      });
    });

    test('includes API key in headers when provided', async () => {
      initializeErrorReporting({ 
        enabled: true, 
        apiKey: 'test-api-key' 
      });

      const errorReport: ErrorReport = {
        message: 'API key test',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(errorReport);

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key',
        },
        body: expect.any(String),
      });
    });

    test('batches errors when queue is full', async () => {
      initializeErrorReporting({ 
        enabled: true, 
        batchSize: 2 
      });

      const error1: ErrorReport = {
        message: 'Error 1',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const error2: ErrorReport = {
        message: 'Error 2',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const error3: ErrorReport = {
        message: 'Error 3',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(error1);
      expect(mockFetch).not.toHaveBeenCalled();

      await reportError(error2);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      await reportError(error3);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1, third error in new batch
    });

    test('flushes immediately for critical errors', async () => {
      initializeErrorReporting({ 
        enabled: true, 
        batchSize: 10 
      });

      const criticalError: ErrorReport = {
        message: 'Security breach detected',
        context: 'security',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(criticalError);

      // Should flush immediately despite batch size being 10
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Development Mode', () => {
    test('logs to console in development when disabled', () => {
      withEnv({ NODE_ENV: 'development' }, () => {
        initializeErrorReporting({ enabled: false });

        const errorReport: ErrorReport = {
          message: 'Dev logging test',
          stack: 'Stack trace here',
          context: 'development',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        };

        reportError(errorReport);

        expect(console.group).toHaveBeenCalledWith('📊 Error Report (development)');
        expect(console.error).toHaveBeenCalledWith('Message:', 'Dev logging test');
        expect(console.error).toHaveBeenCalledWith('Stack:', 'Stack trace here');
        expect(console.groupEnd).toHaveBeenCalled();
      });
    });

    test('does not log in production when disabled', () => {
      withEnv({ NODE_ENV: 'production' }, () => {
        initializeErrorReporting({ enabled: false });

        const errorReport: ErrorReport = {
          message: 'Prod no-logging test',
          context: 'production',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        };

        reportError(errorReport);

        expect(console.group).not.toHaveBeenCalled();
      });
    });
  });

  describe('Retry Logic', () => {
    test('retries failed requests with exponential backoff', async () => {
      initializeErrorReporting({ 
        enabled: true, 
        maxRetries: 2,
        retryDelay: 100,
      });

      // Mock fetch to fail first two times, succeed third time
      mockFetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        } as Response);

      const errorReport: ErrorReport = {
        message: 'Retry test',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const reportPromise = reportError(errorReport);

      // Fast-forward through retries
      jest.advanceTimersByTime(100); // First retry
      await Promise.resolve(); // Let microtasks run
      jest.advanceTimersByTime(200); // Second retry (exponential backoff)
      await Promise.resolve();

      await reportPromise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(console.warn).toHaveBeenCalledTimes(2); // Two failures logged
    });

    test('drops errors after max retries exceeded', async () => {
      initializeErrorReporting({ 
        enabled: true, 
        maxRetries: 1,
        retryDelay: 50,
      });

      // Mock fetch to always fail
      mockFetch.mockRejectedValue(new Error('Persistent network error'));

      const errorReport: ErrorReport = {
        message: 'Max retries test',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const reportPromise = reportError(errorReport);

      // Fast-forward through retries
      jest.advanceTimersByTime(50); // First retry
      await Promise.resolve();
      jest.advanceTimersByTime(100); // Second retry attempt
      await Promise.resolve();

      await reportPromise;

      expect(mockFetch).toHaveBeenCalledTimes(2); // Original + 1 retry
      expect(console.error).toHaveBeenCalledWith(
        'Max retries exceeded, dropping error reports:', 
        expect.any(Array)
      );
    });
  });

  describe('HTTP Error Handling', () => {
    test('handles HTTP error responses', async () => {
      initializeErrorReporting({ enabled: true });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const errorReport: ErrorReport = {
        message: 'HTTP error test',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(errorReport);

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to send error reports:', 
        expect.objectContaining({
          message: 'HTTP 500: Internal Server Error'
        })
      );
    });
  });

  describe('Helper Functions', () => {
    beforeEach(() => {
      initializeErrorReporting({ enabled: true });
    });

    test('reportJavaScriptError creates correct error report', async () => {
      const jsError = new Error('JavaScript test error');
      jsError.stack = 'Error: JavaScript test error\n    at test';

      await reportJavaScriptError(jsError, 'javascript-test', { extra: 'data' });

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [{
            message: 'JavaScript test error',
            stack: 'Error: JavaScript test error\n    at test',
            context: 'javascript-test',
            timestamp: expect.any(String),
            url: window.location.href,
            userAgent: navigator.userAgent,
            additional: { extra: 'data' },
          }],
          timestamp: expect.any(String),
        }),
      });
    });

    test('reportApiError creates correct error report', async () => {
      await reportApiError(
        '/api/test', 
        404, 
        'Not Found', 
        '{"error": "Resource not found"}',
        { userId: '123' }
      );

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [{
            message: 'API Error: 404 Not Found',
            context: 'api',
            timestamp: expect.any(String),
            url: window.location.href,
            userAgent: navigator.userAgent,
            additional: {
              apiUrl: '/api/test',
              status: 404,
              statusText: 'Not Found',
              responseBody: '{"error": "Resource not found"}',
              userId: '123',
            },
          }],
          timestamp: expect.any(String),
        }),
      });
    });

    test('reportUserAction creates correct error report', async () => {
      const actionError = new Error('Button click failed');

      await reportUserAction('click-submit-button', actionError, { formId: 'login-form' });

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [{
            message: 'User Action Error: click-submit-button',
            stack: expect.any(String),
            context: 'userAction',
            timestamp: expect.any(String),
            url: window.location.href,
            userAgent: navigator.userAgent,
            additional: {
              action: 'click-submit-button',
              originalError: 'Button click failed',
              formId: 'login-form',
            },
          }],
          timestamp: expect.any(String),
        }),
      });
    });

    test('reportPerformanceIssue creates correct error report', async () => {
      await reportPerformanceIssue('page-load', 5000, 3000, { page: '/dashboard' });

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [{
            message: 'Performance Issue: page-load (5000ms) exceeded threshold (3000ms)',
            context: 'performance',
            timestamp: expect.any(String),
            url: window.location.href,
            userAgent: navigator.userAgent,
            additional: {
              metric: 'page-load',
              value: 5000,
              threshold: 3000,
              page: '/dashboard',
            },
          }],
          timestamp: expect.any(String),
        }),
      });
    });
  });

  describe('Error Boundary Integration', () => {
    test('createErrorBoundaryReporter creates correct reporter function', async () => {
      initializeErrorReporting({ enabled: true });

      const reporter = createErrorBoundaryReporter('TestComponent');
      const testError = new Error('Boundary error');
      const errorInfo = { componentStack: '\n    at TestComponent\n    at ErrorBoundary' };

      await reporter(testError, errorInfo);

      expect(mockFetch).toHaveBeenCalledWith('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errors: [{
            message: 'Boundary error',
            stack: expect.any(String),
            context: 'errorBoundary',
            timestamp: expect.any(String),
            url: window.location.href,
            userAgent: navigator.userAgent,
            additional: {
              componentName: 'TestComponent',
              componentStack: '\n    at TestComponent\n    at ErrorBoundary',
            },
          }],
          timestamp: expect.any(String),
        }),
      });
    });

    test('handles null component stack', async () => {
      initializeErrorReporting({ enabled: true });

      const reporter = createErrorBoundaryReporter('TestComponent');
      const testError = new Error('Boundary error');
      const errorInfo = { componentStack: null };

      await reporter(testError, errorInfo);

      expect(mockFetch).toHaveBeenCalledWith(expect.any(String), 
        expect.objectContaining({
          body: expect.stringContaining('"componentStack":""')
        })
      );
    });
  });

  describe('Timer Management', () => {
    test('starts flush timer in browser environment', () => {
      // Mock setInterval
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      initializeErrorReporting({ 
        enabled: true, 
        flushInterval: 1000 
      });

      expect(setIntervalSpy).toHaveBeenCalledWith(
        expect.any(Function), 
        1000
      );

      setIntervalSpy.mockRestore();
    });

    test('flushes on page unload', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      
      initializeErrorReporting({ enabled: true });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload', 
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
    });
  });

  describe('Critical Error Detection', () => {
    beforeEach(() => {
      initializeErrorReporting({ 
        enabled: true, 
        batchSize: 10 // Large batch size to test immediate flushing
      });
    });

    test('identifies security errors as critical', async () => {
      const securityError: ErrorReport = {
        message: 'Security violation detected',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(securityError);

      // Should flush immediately despite large batch size
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('identifies authentication errors as critical', async () => {
      const authError: ErrorReport = {
        message: 'Authentication failed',
        stack: 'Error: Authentication failed\n    at auth module',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(authError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('identifies database errors as critical', async () => {
      const dbError: ErrorReport = {
        message: 'Normal error message',
        stack: 'Error: Database connection failed\n    at db module',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(dbError);

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    test('does not flush non-critical errors immediately', async () => {
      const normalError: ErrorReport = {
        message: 'Normal error message',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(normalError);

      // Should not flush immediately
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    test('destroyErrorReporting cleans up properly', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      initializeErrorReporting({ enabled: true });
      destroyErrorReporting();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    test('final flush on destroy', async () => {
      initializeErrorReporting({ 
        enabled: true, 
        batchSize: 10 
      });

      // Add an error to queue
      const errorReport: ErrorReport = {
        message: 'Cleanup test',
        context: 'test',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      await reportError(errorReport);
      expect(mockFetch).not.toHaveBeenCalled(); // Not flushed yet

      destroyErrorReporting();

      expect(mockFetch).toHaveBeenCalledTimes(1); // Flushed on destroy
    });
  });
});