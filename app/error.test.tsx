/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorPage from './error';
import { reportJavaScriptError } from '@/lib/error/errorReporting';

// Mock error reporting
jest.mock('@/lib/error/errorReporting', () => ({
  reportJavaScriptError: jest.fn().mockResolvedValue(undefined),
}));

// Mock ErrorFallback component
jest.mock('@/components/error/ErrorFallback', () => ({
  ErrorFallback: ({ error, onRetry, title, description, variant, showDetails }: any) => (
    <div data-testid="error-fallback">
      <h1>{title}</h1>
      <p>{description}</p>
      <button onClick={onRetry} data-testid="retry-button">
        Try Again
      </button>
      <div data-variant={variant} data-show-details={showDetails}>
        Error: {error?.message}
      </div>
      {error?.digest && (
        <div data-testid="error-digest">Digest: {error.digest}</div>
      )}
    </div>
  ),
}));

const mockReportJavaScriptError = reportJavaScriptError as jest.MockedFunction<typeof reportJavaScriptError>;

describe('ErrorPage', () => {
  const mockReset = jest.fn();
  const sampleError = new Error('Test error message');
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console to avoid noise in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders error page with basic props', () => {
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByTestId('retry-button')).toBeInTheDocument();
    });

    test('calls reset function when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(mockReset).toHaveBeenCalledTimes(1);
    });

    test('renders with error digest when provided', () => {
      const errorWithDigest = new Error('Error with digest') as Error & { digest?: string };
      errorWithDigest.digest = 'abc123def456';

      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(<ErrorPage error={errorWithDigest} reset={mockReset} />);

      expect(screen.getByTestId('error-digest')).toBeInTheDocument();
      expect(screen.getByText('Digest: abc123def456')).toBeInTheDocument();
    });
  });

  describe('Error Reporting', () => {
    test('reports error on mount', () => {
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(mockReportJavaScriptError).toHaveBeenCalledWith(
        sampleError,
        'nextjs-error-page',
        expect.objectContaining({
          digest: undefined,
          page: 'error-boundary',
        })
      );
    });

    test('reports error with digest when available', () => {
      const errorWithDigest = new Error('Error with digest') as Error & { digest?: string };
      errorWithDigest.digest = 'test-digest-123';

      render(<ErrorPage error={errorWithDigest} reset={mockReset} />);

      expect(mockReportJavaScriptError).toHaveBeenCalledWith(
        errorWithDigest,
        'nextjs-error-page',
        expect.objectContaining({
          digest: 'test-digest-123',
          page: 'error-boundary',
        })
      );
    });

    test('handles error reporting failure gracefully', async () => {
      const reportingError = new Error('Reporting failed');
      mockReportJavaScriptError.mockRejectedValueOnce(reportingError);
      
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(mockReportJavaScriptError).toHaveBeenCalled();
      
      // Wait for the promise rejection to be handled
      await new Promise(resolve => setTimeout(resolve, 10));
      
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to report error:', 
        reportingError
      );
    });

    test('does not log reporting failures in production', () => {
      mockReportJavaScriptError.mockRejectedValueOnce(new Error('Reporting failed'));
      
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(mockReportJavaScriptError).toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
    });
  });

  describe('Environment-Specific Behavior', () => {
    test('shows error message in development mode', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    test('shows generic message in production mode', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(screen.getByText(/something went wrong with the application/i)).toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });

    test('shows error details in development mode', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      const errorFallback = screen.getByTestId('error-fallback');
      const variantElement = errorFallback.querySelector('[data-variant]');
      const showDetailsElement = errorFallback.querySelector('[data-show-details]');
      
      expect(variantElement).toHaveAttribute('data-variant', 'detailed');
      expect(showDetailsElement).toHaveAttribute('data-show-details', 'true');
    });

    test('hides error details in production mode', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'production');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      const errorFallback = screen.getByTestId('error-fallback');
      const variantElement = errorFallback.querySelector('[data-variant]');
      const showDetailsElement = errorFallback.querySelector('[data-show-details]');
      
      expect(variantElement).toHaveAttribute('data-variant', 'detailed');
      expect(showDetailsElement).toHaveAttribute('data-show-details', 'false');
    });
  });

  describe('Props and Configuration', () => {
    test('uses ErrorFallback component with correct props', () => {
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      const errorFallback = screen.getByTestId('error-fallback');
      expect(errorFallback).toBeInTheDocument();
      expect(screen.getByText('Application Error')).toBeInTheDocument();
    });

    test('passes reset function to ErrorFallback', async () => {
      const user = userEvent.setup();
      
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      const retryButton = screen.getByTestId('retry-button');
      await user.click(retryButton);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Layout and Structure', () => {
    test('has proper page structure', () => {
      const { container } = render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(container.firstChild).toHaveClass('min-h-screen');
      expect(container.querySelector('.max-w-2xl')).toBeInTheDocument();
    });

    test('is responsive and accessible', () => {
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      const mainContainer = screen.getByTestId('error-fallback').closest('.min-h-screen');
      expect(mainContainer).toHaveClass('flex', 'items-center', 'justify-center', 'p-4');
    });
  });

  describe('Error Scenarios', () => {
    test('handles error without message', () => {
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';

      render(<ErrorPage error={errorWithoutMessage} reset={mockReset} />);

      expect(mockReportJavaScriptError).toHaveBeenCalledWith(
        errorWithoutMessage,
        'nextjs-error-page',
        expect.any(Object)
      );
    });

    test('handles error with null digest', () => {
      const errorWithNullDigest = new Error('Test error') as Error & { digest?: string };
      // Don't set digest property - it's optional

      render(<ErrorPage error={errorWithNullDigest} reset={mockReset} />);

      expect(mockReportJavaScriptError).toHaveBeenCalledWith(
        errorWithNullDigest,
        'nextjs-error-page',
        expect.objectContaining({
          digest: undefined,
        })
      );
    });
  });

  describe('Next.js Integration', () => {
    test('is compatible with Next.js error page API', () => {
      // Test that the component accepts the exact props Next.js provides
      const nextjsError = new Error('Next.js error') as Error & { digest?: string };
      nextjsError.digest = 'nextjs-digest';

      const nextjsReset = jest.fn();

      expect(() => {
        render(<ErrorPage error={nextjsError} reset={nextjsReset} />);
      }).not.toThrow();
    });

    test('works without digest property', () => {
      const basicError = new Error('Basic error');
      
      expect(() => {
        render(<ErrorPage error={basicError} reset={mockReset} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    test('has accessible error message structure', () => {
      render(<ErrorPage error={sampleError} reset={mockReset} />);

      // Should have proper heading structure
      const heading = screen.getByText('Application Error');
      expect(heading).toBeInTheDocument();

      // Should have accessible retry button
      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeEnabled();
    });

    test('provides meaningful error information', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'development');

      render(<ErrorPage error={sampleError} reset={mockReset} />);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    test('works as Next.js error page component', () => {
      // Simulate how Next.js would call this component
      const nextjsStyleError = new Error('Next.js style error') as Error & { digest?: string };
      nextjsStyleError.digest = 'abc123';

      render(<ErrorPage error={nextjsStyleError} reset={mockReset} />);

      expect(screen.getByText('Application Error')).toBeInTheDocument();
      expect(mockReportJavaScriptError).toHaveBeenCalledWith(
        nextjsStyleError,
        'nextjs-error-page',
        expect.objectContaining({
          digest: 'abc123',
          page: 'error-boundary',
        })
      );
    });
  });
});