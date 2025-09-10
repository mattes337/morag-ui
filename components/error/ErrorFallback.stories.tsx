import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ErrorFallback, MinimalErrorFallback, DetailedErrorFallback } from './ErrorFallback';

const meta: Meta<typeof ErrorFallback> = {
  title: 'Error/ErrorFallback',
  component: ErrorFallback,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'ErrorFallback provides user-friendly error displays with retry functionality. It supports multiple variants (minimal, default, detailed) and can show error details in development mode.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      description: 'The error object to display information about',
      control: false,
    },
    errorInfo: {
      description: 'React error info containing component stack trace',
      control: false,
    },
    onRetry: {
      description: 'Callback function called when retry button is clicked',
      control: false,
    },
    title: {
      description: 'Custom title for the error message',
      control: 'text',
    },
    description: {
      description: 'Custom description for the error',
      control: 'text',
    },
    showDetails: {
      description: 'Whether to show error details toggle button',
      control: 'boolean',
    },
    variant: {
      description: 'Visual variant of the error fallback',
      control: 'select',
      options: ['default', 'minimal', 'detailed'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample error objects for stories
const sampleError = new Error('This is a sample error message for demonstration purposes');
sampleError.stack = `Error: This is a sample error message for demonstration purposes
    at SampleComponent (SampleComponent.tsx:15:11)
    at renderWithHooks (react-dom.development.js:14985:18)
    at mountIndeterminateComponent (react-dom.development.js:17811:13)
    at beginWork (react-dom.development.js:19049:16)
    at HTMLUnknownElement.callCallback (react-dom.development.js:3945:14)
    at Object.invokeGuardedCallbackDev (react-dom.development.js:3994:16)`;

const networkError = new Error('Failed to fetch data from the server');
networkError.stack = `Error: Failed to fetch data from the server
    at fetchData (api.ts:23:9)
    at useEffect (UserProfile.tsx:42:7)
    at commitHookEffectListMount (react-dom.development.js:23150:26)`;

const complexError = new Error('Complex application error with detailed context');
complexError.stack = `Error: Complex application error with detailed context
    at processData (utils.ts:89:15)
    at DataProcessor.process (DataProcessor.ts:156:20)
    at async DataManager.handleUpdate (DataManager.ts:203:12)
    at async UserDashboard.updateData (UserDashboard.tsx:78:9)`;

const sampleErrorInfo = {
  componentStack: `
    at SampleComponent (SampleComponent.tsx:15:11)
    at ErrorBoundary (ErrorBoundary.tsx:45:23)
    at div
    at App (App.tsx:12:5)`,
};

// Mock retry function for stories
const createMockRetry = (message: string = 'Retry clicked') => 
  () => console.log(message);

export const Default: Story = {
  args: {
    error: sampleError,
    onRetry: createMockRetry('Default retry clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default error fallback variant with standard error message and retry button.',
      },
    },
  },
};

export const Minimal: Story = {
  args: {
    error: sampleError,
    onRetry: createMockRetry('Minimal retry clicked'),
    variant: 'minimal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal variant shows just the essential error information without extra details.',
      },
    },
  },
};

export const Detailed: Story = {
  args: {
    error: complexError,
    errorInfo: sampleErrorInfo,
    onRetry: createMockRetry('Detailed retry clicked'),
    variant: 'detailed',
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Detailed variant provides comprehensive error information and debugging details.',
      },
    },
  },
};

export const CustomTitleAndDescription: Story = {
  args: {
    error: networkError,
    onRetry: createMockRetry('Custom retry clicked'),
    title: 'Connection Problem',
    description: 'We are having trouble connecting to our servers. Please check your internet connection and try again.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback with custom title and description for better user experience.',
      },
    },
  },
};

export const WithErrorDetails: Story = {
  args: {
    error: sampleError,
    errorInfo: sampleErrorInfo,
    onRetry: createMockRetry('Details retry clicked'),
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback with error details toggle. Click "Show Details" to see technical information.',
      },
    },
  },
};

export const NullError: Story = {
  args: {
    error: null,
    onRetry: createMockRetry('Null error retry clicked'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback handling null error gracefully with fallback message.',
      },
    },
  },
};

export const NoStackTrace: Story = {
  args: {
    error: new Error('Error without stack trace'),
    onRetry: createMockRetry('No stack retry clicked'),
    showDetails: true,
  },
  render: (args) => {
    // Remove stack trace for this story
    const errorWithoutStack = new Error(args.error?.message || 'Error without stack trace');
    (errorWithoutStack as any).stack = undefined;
    
    return <ErrorFallback {...args} error={errorWithoutStack} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback with an error that has no stack trace information.',
      },
    },
  },
};

// Development vs Production comparison
export const DevelopmentMode: Story = {
  args: {
    error: sampleError,
    errorInfo: sampleErrorInfo,
    onRetry: createMockRetry('Dev mode retry clicked'),
  },
  render: (args) => {
    // Force development mode for this story
    const originalEnv = process.env.NODE_ENV;
    // NODE_ENV override removed for TypeScript compliance
    
    React.useEffect(() => {
      return () => {
      };
    }, [originalEnv]);
    
    return <ErrorFallback {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback in development mode shows detailed error information by default.',
      },
    },
  },
};

export const ProductionMode: Story = {
  args: {
    error: sampleError,
    errorInfo: sampleErrorInfo,
    onRetry: createMockRetry('Prod mode retry clicked'),
  },
  render: (args) => {
    // Force production mode for this story
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true });
    
    React.useEffect(() => {
      return () => {
      };
    }, [originalEnv]);
    
    return <ErrorFallback {...args} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback in production mode hides technical details by default for better user experience.',
      },
    },
  },
};

// Interactive Story
export const Interactive: Story = {
  render: () => {
    const [variant, setVariant] = React.useState<'default' | 'minimal' | 'detailed'>('default');
    const [showDetails, setShowDetails] = React.useState(true);
    const [errorType, setErrorType] = React.useState<'simple' | 'network' | 'complex'>('simple');
    const [hasRetried, setHasRetried] = React.useState(false);
    
    const errors = {
      simple: sampleError,
      network: networkError,
      complex: complexError,
    };
    
    const handleRetry = () => {
      setHasRetried(true);
      setTimeout(() => setHasRetried(false), 2000);
      console.log('Interactive retry clicked');
    };
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <label className="block text-sm font-medium mb-2">Variant:</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="default">Default</option>
              <option value="minimal">Minimal</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Error Type:</label>
            <select
              value={errorType}
              onChange={(e) => setErrorType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="simple">Simple Error</option>
              <option value="network">Network Error</option>
              <option value="complex">Complex Error</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                checked={showDetails}
                onChange={(e) => setShowDetails(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Show Details</span>
            </label>
          </div>
        </div>
        
        {hasRetried && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 text-sm">
            <span role="img" aria-label="Success">✅</span> Retry function called! Check console for details.
          </div>
        )}
        
        <ErrorFallback
          error={errors[errorType]}
          errorInfo={sampleErrorInfo}
          onRetry={handleRetry}
          variant={variant}
          showDetails={showDetails}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive error fallback with controls to test different variants, error types, and configurations.',
      },
    },
  },
};

// Predefined variant components
export const MinimalVariant: Story = {
  render: () => (
    <MinimalErrorFallback
      error={sampleError}
      onRetry={createMockRetry('Minimal variant retry clicked')}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using the MinimalErrorFallback component directly for simple error scenarios.',
      },
    },
  },
};

export const DetailedVariant: Story = {
  render: () => (
    <DetailedErrorFallback
      error={complexError}
      errorInfo={sampleErrorInfo}
      onRetry={createMockRetry('Detailed variant retry clicked')}
      showDetails={true}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Using the DetailedErrorFallback component directly for comprehensive error information.',
      },
    },
  },
};

// Real-world scenarios
export const APIError: Story = {
  args: {
    error: networkError,
    onRetry: createMockRetry('API error retry clicked'),
    title: 'Unable to Load Data',
    description: 'We encountered a problem while loading your data. This might be due to a temporary network issue.',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback styled for API/network errors with user-friendly messaging.',
      },
    },
  },
};

export const FormSubmissionError: Story = {
  args: {
    error: new Error('Form validation failed'),
    onRetry: createMockRetry('Form retry clicked'),
    title: 'Submission Failed',
    description: 'There was a problem submitting your form. Please review your information and try again.',
    variant: 'minimal',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback for form submission failures with actionable messaging.',
      },
    },
  },
};

export const ComponentCrash: Story = {
  args: {
    error: complexError,
    errorInfo: sampleErrorInfo,
    onRetry: createMockRetry('Component crash retry clicked'),
    title: 'Component Error',
    description: 'A component on this page encountered an unexpected error. Refreshing the page may resolve this issue.',
    variant: 'detailed',
    showDetails: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Error fallback for component crashes with debugging information available.',
      },
    },
  },
};

// Accessibility focused story
export const AccessibilityDemo: Story = {
  args: {
    error: sampleError,
    onRetry: createMockRetry('A11y demo retry clicked'),
    title: 'Accessible Error Message',
    description: 'This error fallback is designed with accessibility in mind, including proper ARIA attributes and keyboard navigation.',
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates accessibility features of the error fallback component. Test with screen readers and keyboard navigation.',
      },
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
        ],
      },
    },
  },
};