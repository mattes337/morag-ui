import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
 
  testComponentAccessibility,
  ScreenReaderTestUtils
} from '@/lib/accessibility/a11y-test-utils';
import { 
  withEnv
} from '@/lib/testing/envMockUtils';
import { 
  ErrorFallback, 
  MinimalErrorFallback, 
  DetailedErrorFallback 
} from './ErrorFallback';

// Mock the UI components
jest.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title, description, actionText, onAction, variant, icon, ...props }: any) => (
    <div data-testid="empty-state" data-variant={variant}>
      <div data-testid="icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      {actionText && (
        <button onClick={onAction} data-testid="action-button">
          {actionText}
        </button>
      )}
      {props.secondaryActionText && (
        <button 
          onClick={props.onSecondaryAction} 
          data-testid="secondary-action-button"
        >
          {props.secondaryActionText}
        </button>
      )}
    </div>
  ),
}));

jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, variant, className, ...props }: any) => (
    <button 
      onClick={onClick} 
      data-variant={variant}
      className={className}
      {...props}
    >
      {children}
    </button>
  ),
}));

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  const mockOnRetry = jest.fn();
  const mockErrorInfo = {
    componentStack: '\n    at TestComponent\n    at ErrorBoundary',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    test('renders with minimal required props', () => {
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    test('displays custom title and description', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          title="Custom Error Title"
          description="Custom error description"
        />
      );

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
      expect(screen.getByText('Custom error description')).toBeInTheDocument();
    });

    test('calls onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });

    test('handles null error gracefully', () => {
      render(<ErrorFallback error={null} onRetry={mockOnRetry} />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });
  });

  describe('Variant Behavior', () => {
    test('minimal variant renders correctly', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          variant="minimal"
        />
      );

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toHaveAttribute('data-variant', 'error');
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    test('detailed variant renders with additional controls', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          variant="detailed"
          showDetails={true}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });

    test('default variant renders correctly', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          variant="default"
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('Error Details Toggle', () => {
    test('shows details toggle button when showDetails is true', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });

    test('does not show details toggle when showDetails is false', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          showDetails={false}
        />
      );

      expect(screen.queryByRole('button', { name: /show details/i })).not.toBeInTheDocument();
    });

    test('toggles error details visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorFallback 
          error={mockError} 
          errorInfo={mockErrorInfo}
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show details/i });
      
      // Initially details should be hidden
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();

      // Click to show details
      await user.click(toggleButton);

      expect(screen.getByText('Test error message')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hide details/i })).toBeInTheDocument();

      // Click to hide details again
      await user.click(screen.getByRole('button', { name: /hide details/i }));

      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });

    test('shows error stack trace when available', async () => {
      const errorWithStack = new Error('Stack trace error');
      errorWithStack.stack = 'Error: Stack trace error\n    at TestComponent\n    at render';
      
      const user = userEvent.setup();
      
      render(
        <ErrorFallback 
          error={errorWithStack} 
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show details/i });
      await user.click(toggleButton);

      expect(screen.getByText(/stack trace error/i)).toBeInTheDocument();
      expect(screen.getByText(/at TestComponent/)).toBeInTheDocument();
    });

    test('shows component stack when available', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorFallback 
          error={mockError} 
          errorInfo={mockErrorInfo}
          onRetry={mockOnRetry}
          showDetails={true}
          variant="detailed"
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show details/i });
      await user.click(toggleButton);

      expect(screen.getByText(/component stack/i)).toBeInTheDocument();
      expect(screen.getByText(/at TestComponent/)).toBeInTheDocument();
      expect(screen.getByText(/at ErrorBoundary/)).toBeInTheDocument();
    });
  });

  describe('Environment-Specific Behavior', () => {
    test('shows details by default in development', () => {
      withEnv({ NODE_ENV: 'development' }, () => {
        render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);
        expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
      });
    });

    test('hides details by default in production', () => {
      withEnv({ NODE_ENV: 'production' }, () => {
        render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);
        expect(screen.queryByRole('button', { name: /show details/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testComponentAccessibility(
        <ErrorFallback error={mockError} onRetry={mockOnRetry} />
      );
    });

    test('retry button is accessible', () => {
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeEnabled();
      expect(retryButton).toBeVisible();
    });

    test('details toggle button is accessible when visible', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show details/i });
      expect(toggleButton).toBeEnabled();
      expect(toggleButton).toBeVisible();
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      // Tab to retry button
      await user.tab();
      expect(screen.getByRole('button', { name: /try again/i })).toHaveFocus();

      // Tab to details toggle button
      await user.tab();
      expect(screen.getByRole('button', { name: /show details/i })).toHaveFocus();

      // Activate with Enter
      await user.keyboard('{Enter}');
      expect(mockOnRetry).not.toHaveBeenCalled(); // Should toggle details, not retry
    });

    test('error message has proper heading structure', () => {
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      const heading = screen.getByText('Something went wrong');
      expect(heading.tagName).toBe('H2');
    });

    test('screen reader can access error information', () => {
      const screenReader = new ScreenReaderTestUtils();
      
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      screenReader.testAccessibleName(retryButton, 'Try Again');
      screenReader.testRole(retryButton, 'button');
    });
  });

  describe('Predefined Variants', () => {
    test('MinimalErrorFallback renders minimal variant', () => {
      render(<MinimalErrorFallback error={mockError} onRetry={mockOnRetry} />);

      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toHaveAttribute('data-variant', 'error');
      expect(screen.queryByRole('button', { name: /show details/i })).not.toBeInTheDocument();
    });

    test('DetailedErrorFallback renders detailed variant', () => {
      render(
        <DetailedErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show details/i })).toBeInTheDocument();
    });
  });

  describe('Error Message Handling', () => {
    test('displays error message when available', () => {
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      // Should use default description since error message is used internally
      expect(screen.getByText(/we encountered an unexpected error/i)).toBeInTheDocument();
    });

    test('handles error without message', () => {
      const errorWithoutMessage = new Error();
      errorWithoutMessage.message = '';

      render(<ErrorFallback error={errorWithoutMessage} onRetry={mockOnRetry} />);

      expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
    });

    test('uses custom description over default', () => {
      render(
        <ErrorFallback 
          error={mockError} 
          onRetry={mockOnRetry}
          description="Custom error description"
        />
      );

      expect(screen.getByText('Custom error description')).toBeInTheDocument();
      expect(screen.queryByText(/we encountered an unexpected error/i)).not.toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    test('renders alert triangle icon', () => {
      render(<ErrorFallback error={mockError} onRetry={mockOnRetry} />);

      const iconContainer = screen.getByTestId('icon');
      expect(iconContainer).toBeInTheDocument();
    });
  });

  describe('Error Scenarios', () => {
    test('handles undefined error info', async () => {
      const user = userEvent.setup();
      
      render(
        <ErrorFallback 
          error={mockError} 
          errorInfo={null}
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show details/i });
      await user.click(toggleButton);

      // Should still show error details without crashing
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    test('handles error with null stack trace', async () => {
      const errorWithoutStack = new Error('No stack error');
      (errorWithoutStack as any).stack = null;
      
      const user = userEvent.setup();
      
      render(
        <ErrorFallback 
          error={errorWithoutStack} 
          onRetry={mockOnRetry}
          showDetails={true}
        />
      );

      const toggleButton = screen.getByRole('button', { name: /show details/i });
      await user.click(toggleButton);

      expect(screen.getByText('No stack error')).toBeInTheDocument();
      expect(screen.queryByText(/stack trace/i)).not.toBeInTheDocument();
    });
  });
});