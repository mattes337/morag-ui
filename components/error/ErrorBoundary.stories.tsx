import type { Meta, StoryObj } from '@storybook/react';
import React, { type ErrorInfo } from 'react';
import { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Error/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ErrorBoundary catches React errors in child components and displays fallback UI. It supports custom fallback components, error reporting, and automatic retry functionality.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      description: 'The child components to wrap with error boundary',
      control: false,
    },
    fallback: {
      description: 'Custom fallback component to render when an error occurs',
      control: false,
    },
    onError: {
      description: 'Callback function called when an error is caught',
      control: false,
    },
    resetOnPropsChange: {
      description: 'Whether to reset the error boundary when props change',
      control: 'boolean',
    },
    resetKeys: {
      description: 'Array of values that will trigger a reset when changed',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Component that throws an error for demonstration
const ThrowError = ({ 
  shouldThrow = true, 
  message = 'This is a demonstration error',
  delay = 0 
}: { 
  shouldThrow?: boolean; 
  message?: string;
  delay?: number;
}) => {
  React.useEffect(() => {
    if (shouldThrow && delay > 0) {
      const timer = setTimeout(() => {
        throw new Error(message);
      }, delay);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [shouldThrow, message, delay]);

  if (shouldThrow && delay === 0) {
    throw new Error(message);
  }

  return (
    <div className="p-8 text-center">
      <h3 className="text-lg font-semibold mb-4">Component Working Normally</h3>
      <p className="text-muted-foreground mb-6">
        This component is rendering successfully without any errors.
      </p>
      <div className="space-y-4">
        <Button variant="outline">Sample Button 1</Button>
        <Button variant="outline">Sample Button 2</Button>
      </div>
    </div>
  );
};

// Interactive component for testing error states
const ErrorTester = () => {
  const [shouldThrow, setShouldThrow] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('User triggered error');

  if (shouldThrow) {
    throw new Error(errorMessage);
  }

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h3 className="text-lg font-semibold">Error Boundary Tester</h3>
      <p className="text-sm text-muted-foreground">
        Use the controls below to test different error scenarios:
      </p>
      
      <div className="space-y-3">
        <div>
          <label htmlFor="error-message" className="block text-sm font-medium mb-1">
            Error Message:
          </label>
          <input
            id="error-message"
            type="text"
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
            placeholder="Enter error message..."
          />
        </div>
        
        <Button 
          variant="destructive" 
          onClick={() => setShouldThrow(true)}
          className="w-full"
        >
          Trigger Error
        </Button>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {},
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default error boundary behavior. Shows the built-in fallback UI when an error occurs.',
      },
    },
  },
};

export const WorkingComponent: Story = {
  args: {},
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error boundary with a component that works normally. The boundary is invisible when no errors occur.',
      },
    },
  },
};

// Create a wrapper to adapt ErrorFallback to the interface ErrorBoundary expects
const ErrorFallbackAdapter: React.ComponentType<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}> = ({ error, errorInfo, onRetry }) => {
  return (
    <ErrorFallback
      error={error}
      errorInfo={errorInfo}
      onRetry={onRetry}
    />
  );
};

export const CustomFallback: Story = {
  args: {
    fallback: ErrorFallbackAdapter,
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError message="Custom fallback demonstration error" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error boundary using a custom fallback component (ErrorFallback) instead of the built-in fallback UI.',
      },
    },
  },
};

export const WithErrorReporting: Story = {
  args: {
    onError: (error, errorInfo) => {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    },
  },
  render: (args) => (
    <ErrorBoundary {...args}>
      <ThrowError message="Error with reporting callback" />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error boundary with error reporting callback. Check the browser console to see the reported error details.',
      },
    },
  },
};

export const InteractiveTester: Story = {
  args: {},
  render: (args) => (
    <ErrorBoundary {...args}>
      <ErrorTester />
    </ErrorBoundary>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Interactive error boundary tester. You can customize the error message and trigger errors to see how the boundary responds.',
      },
    },
  },
};

export const ResetOnPropsChange: Story = {
  args: {
    resetOnPropsChange: true,
  },
  render: (args) => {
    const [resetKey, setResetKey] = React.useState(0);
    const [hasError, setHasError] = React.useState(true);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setResetKey(prev => prev + 1);
              setHasError(false);
            }}
          >
            Reset Boundary (resetKey: {resetKey})
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setHasError(true)}
          >
            Trigger Error
          </Button>
        </div>
        
        <ErrorBoundary {...args} key={resetKey}>
          <ThrowError shouldThrow={hasError} message={`Error #${resetKey + 1}`} />
        </ErrorBoundary>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary that resets when props change. Use the reset button to change props and recover from error state.',
      },
    },
  },
};

export const ResetKeys: Story = {
  args: {},
  render: (args) => {
    const [userId, setUserId] = React.useState('user-1');
    const [shouldError, setShouldError] = React.useState(true);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setUserId(`user-${Date.now()}`);
              setShouldError(false);
            }}
          >
            Change User (Current: {userId})
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setShouldError(true)}
          >
            Trigger Error
          </Button>
        </div>
        
        <ErrorBoundary {...args} resetKeys={[userId]}>
          <ThrowError 
            shouldThrow={shouldError} 
            message={`Error for ${userId}`} 
          />
        </ErrorBoundary>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Error boundary that resets when specific keys change. Useful for user-scoped or route-scoped error boundaries.',
      },
    },
  },
};

export const DevelopmentVsProduction: Story = {
  render: () => {
    const [mode, setMode] = React.useState<'development' | 'production'>('development');
    
    // Note: NODE_ENV override for demonstration purposes
    // In real tests, use jest.replaceProperty(process.env, 'NODE_ENV', mode)
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={mode === 'development' ? 'default' : 'outline'}
            onClick={() => setMode('development')}
          >
            Development Mode
          </Button>
          <Button 
            variant={mode === 'production' ? 'default' : 'outline'}
            onClick={() => setMode('production')}
          >
            Production Mode
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Current mode: <strong>{mode}</strong>
        </p>
        
        <ErrorBoundary key={mode}>
          <ThrowError message="Environment demonstration error" />
        </ErrorBoundary>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how error boundary displays differently in development vs production modes. Development shows detailed error information while production shows user-friendly messages.',
      },
    },
  },
};

// HOC Wrapper Story
const SampleComponent = ({ shouldFail }: { shouldFail?: boolean }) => {
  if (shouldFail) {
    throw new Error('HOC wrapped component error');
  }
  
  return (
    <div className="p-6 text-center border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">HOC Wrapped Component</h3>
      <p className="text-muted-foreground">
        This component is wrapped with the withErrorBoundary HOC.
      </p>
    </div>
  );
};

const WrappedComponent = withErrorBoundary(SampleComponent, {
  onError: (error, errorInfo) => {
    console.log('HOC Error:', error, errorInfo);
  },
});

export const WithErrorBoundaryHOC: Story = {
  render: () => {
    const [shouldFail, setShouldFail] = React.useState(false);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShouldFail(false)}
            disabled={!shouldFail}
          >
            Working State
          </Button>
          <Button 
            variant="destructive"
            onClick={() => setShouldFail(true)}
            disabled={shouldFail}
          >
            Trigger Error
          </Button>
        </div>
        
        <WrappedComponent shouldFail={shouldFail} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates the withErrorBoundary Higher-Order Component (HOC) that wraps components with error boundary functionality.',
      },
    },
  },
};

export const AsyncError: Story = {
  render: (args) => {
    const AsyncErrorComponent = () => {
      const [countdown, setCountdown] = React.useState(3);
      
      React.useEffect(() => {
        const timer = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(timer);
              // This will trigger the error boundary
              throw new Error('Async error after countdown');
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }, []);
      
      return (
        <div className="p-6 text-center border rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Async Error Demo</h3>
          <p className="text-muted-foreground mb-4">
            This component will throw an error in:
          </p>
          <div className="text-3xl font-bold text-destructive">
            {countdown}
          </div>
        </div>
      );
    };
    
    return (
      <ErrorBoundary {...args}>
        <AsyncErrorComponent />
      </ErrorBoundary>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how error boundaries catch errors that occur asynchronously in useEffect hooks.',
      },
    },
  },
};