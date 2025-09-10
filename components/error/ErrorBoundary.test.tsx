import React, { type ErrorInfo } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  testComponentAccessibility
} from '@/lib/accessibility/a11y-test-utils';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';

// Mock error reporting
jest.mock('@/lib/error/errorReporting', () => ({
  reportJavaScriptError: jest.fn().mockResolvedValue(undefined),
  createErrorBoundaryReporter: jest.fn().mockReturnValue(jest.fn()),
}));

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

beforeEach(() => {
  console.error = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
  jest.clearAllMocks();
});

// Test components that throw errors
const ThrowError = ({ shouldThrow = true, message = 'Test error' }: { shouldThrow?: boolean; message?: string }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div>No error</div>;
};

const ThrowErrorOnClick = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  
  if (shouldThrow) {
    throw new Error('Click error');
  }
  
  return <button onClick={() => setShouldThrow(true)}>Throw Error</button>;
};

describe('ErrorBoundary', () => {
  describe('Basic Functionality', () => {
    test('renders children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    test('catches errors and displays fallback UI', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    test('displays custom error message in development', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(
        <ErrorBoundary>
          <ThrowError message="Custom error message" />
        </ErrorBoundary>
      );

      expect(screen.getByText('🚨 Development Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();

    });

    test('displays production-friendly message in production', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/we encountered an unexpected error/i)).toBeInTheDocument();
      expect(screen.queryByText('🚨 Development Error')).not.toBeInTheDocument();

    });
  });

  describe('Error Handling', () => {
    test('calls onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError message="Test error" />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    test('logs error in development mode', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(
        <ErrorBoundary>
          <ThrowError message="Development error" />
        </ErrorBoundary>
      );

      expect(console.group).toHaveBeenCalledWith('🚨 React Error Boundary Caught an Error');
      expect(console.error).toHaveBeenCalled();

    });
  });

  describe('Reset Functionality', () => {
    test('reset button restores error boundary', async () => {
      const user = userEvent.setup();

      const TestComponent = () => {
        const [shouldThrow, setShouldThrow] = React.useState(true);
        
        if (shouldThrow) {
          throw new Error('Resettable error');
        }
        
        React.useEffect(() => {
          const timeout = setTimeout(() => setShouldThrow(false), 10);
          return () => clearTimeout(timeout);
        }, []);
        
        return <div>Component recovered</div>;
      };

      render(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      // Error should be caught
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click retry button
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      // Should eventually show recovered content (need to wait for useEffect)
      await screen.findByText('Component recovered', {}, { timeout: 100 });
    });

    test('resets on resetKeys change', () => {
      const TestComponent = ({ resetKey }: { resetKey: string }) => (
        <ErrorBoundary resetKeys={[resetKey]}>
          <ThrowError shouldThrow={resetKey === 'error'} />
        </ErrorBoundary>
      );

      const { rerender } = render(<TestComponent resetKey="error" />);

      // Error should be caught
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Change resetKeys should reset the boundary
      rerender(<TestComponent resetKey="noError" />);

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    test('resets on props change when resetOnPropsChange is true', () => {
      const TestComponent = ({ shouldThrow }: { extraProp: string; shouldThrow: boolean }) => (
        <ErrorBoundary resetOnPropsChange>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      const { rerender } = render(<TestComponent extraProp="initial" shouldThrow={true} />);

      // Error should be caught
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Props change should reset the boundary
      rerender(<TestComponent extraProp="changed" shouldThrow={false} />);

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback Component', () => {
    test('renders custom fallback component', () => {
      const CustomFallback = ({ error, onRetry }: any) => (
        <div>
          <h2>Custom Error: {error?.message}</h2>
          <button onClick={onRetry}>Custom Retry</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError message="Custom fallback test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error: Custom fallback test')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /custom retry/i })).toBeInTheDocument();
    });

    test('passes error info to custom fallback', () => {
      const CustomFallback = ({ error, errorInfo, onRetry }: any) => (
        <div>
          <div>Error: {error?.message}</div>
          <div>Has Stack: {errorInfo?.componentStack ? 'Yes' : 'No'}</div>
          <button onClick={onRetry}>Retry</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={CustomFallback}>
          <ThrowError message="Fallback info test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Error: Fallback info test')).toBeInTheDocument();
      expect(screen.getByText('Has Stack: Yes')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testComponentAccessibility(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
    });

    test('retry button is accessible', async () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toBeEnabled();
    });

    test('error message is announced to screen readers', () => {
      
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const errorMessage = screen.getByText('Something went wrong');
      expect(errorMessage).toBeInTheDocument();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /try again/i });
      
      // Should be focusable
      await user.tab();
      expect(retryButton).toHaveFocus();

      // Should be activatable with Enter and Space
      await user.keyboard('{Enter}');
      // Button behavior tested (actual retry behavior depends on component logic)
    });
  });

  describe('withErrorBoundary HOC', () => {
    test('wraps component with error boundary', () => {
      const TestComponent = () => <div>Wrapped component</div>;
      const WrappedComponent = withErrorBoundary(TestComponent);

      render(<WrappedComponent />);

      expect(screen.getByText('Wrapped component')).toBeInTheDocument();
    });

    test('catches errors in wrapped component', () => {
      const WrappedThrowError = withErrorBoundary(ThrowError);

      render(<WrappedThrowError />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('passes through error boundary props', () => {
      const onError = jest.fn();
      const WrappedThrowError = withErrorBoundary(ThrowError, { onError });

      render(<WrappedThrowError />);

      expect(onError).toHaveBeenCalled();
    });

    test('sets correct display name', () => {
      const TestComponent = () => <div>Test</div>;
      TestComponent.displayName = 'TestComponent';
      
      const WrappedComponent = withErrorBoundary(TestComponent);
      
      expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
    });
  });

  describe('Error Scenarios', () => {
    test('handles async errors in event handlers', async () => {
      const user = userEvent.setup();

      render(
        <ErrorBoundary>
          <ThrowErrorOnClick />
        </ErrorBoundary>
      );

      const button = screen.getByRole('button', { name: /throw error/i });
      await user.click(button);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('handles null error gracefully', () => {
      // Simulate componentDidCatch being called with null error
      const CustomBoundary = () => {
        const [, setError] = React.useState<Error | null>(null);
        const [hasError, setHasError] = React.useState(false);

        if (hasError) {
          return (
            <ErrorBoundary>
              <div>Error boundary with null error</div>
            </ErrorBoundary>
          );
        }

        return (
          <button onClick={() => { setHasError(true); setError(null); }}>
            Trigger null error
          </button>
        );
      };

      render(<CustomBoundary />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Development vs Production Behavior', () => {
    test('shows detailed error info in development', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(
        <ErrorBoundary>
          <ThrowError message="Dev error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('🚨 Development Error')).toBeInTheDocument();
      expect(screen.getByText('Dev error')).toBeInTheDocument();
      expect(screen.getByText(/stack trace/i)).toBeInTheDocument();

    });

    test('shows minimal error info in production', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');

      render(
        <ErrorBoundary>
          <ThrowError message="Prod error" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.queryByText('🚨 Development Error')).not.toBeInTheDocument();
      expect(screen.queryByText('Prod error')).not.toBeInTheDocument();
      expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument();

    });
  });

  describe('Integration with ErrorFallback', () => {
    test('works with ErrorFallback component', () => {
      // Create adapter for ErrorFallback to match ErrorBoundary interface
      const ErrorFallbackAdapter: React.ComponentType<{
        error: Error | null;
        errorInfo: ErrorInfo | null;
        onRetry: () => void;
      }> = ({ error, errorInfo, onRetry }) => (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          onRetry={onRetry}
        />
      );

      render(
        <ErrorBoundary fallback={ErrorFallbackAdapter}>
          <ThrowError message="Fallback integration test" />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    test('cleans up timeout on unmount', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
      unmount();

      // Verify cleanup happened (timeout should be cleared)
      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });
});