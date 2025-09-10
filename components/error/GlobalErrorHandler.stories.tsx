import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { GlobalErrorHandler, useGlobalErrorHandler } from './GlobalErrorHandler';
import { Button } from '@/components/ui/Button';

const meta: Meta<typeof GlobalErrorHandler> = {
  title: 'Error/GlobalErrorHandler',
  component: GlobalErrorHandler,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'GlobalErrorHandler catches unhandled errors and promise rejections globally. It provides error reporting, logging, and user notifications for critical application errors.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    showNotifications: {
      description: 'Whether to show user notifications for unhandled errors',
      control: 'boolean',
    },
    enableReporting: {
      description: 'Whether to report errors to external service',
      control: 'boolean',
    },
    onError: {
      description: 'Custom error notification handler',
      control: false,
    },
    enableConsoleLogging: {
      description: 'Whether to log errors to console in development',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Error simulation components
const ErrorSimulator = ({ onError }: { onError?: (error: Error, context?: string) => void }) => {
  const [errorLog, setErrorLog] = React.useState<Array<{ type: string; message: string; time: string }>>([]);

  const addToLog = (type: string, message: string) => {
    const time = new Date().toLocaleTimeString();
    setErrorLog(prev => [...prev.slice(-4), { type, message, time }]);
  };

  const simulateUnhandledRejection = () => {
    addToLog('promise', 'Triggered unhandled promise rejection');
    // Create an unhandled promise rejection
    Promise.reject(new Error('Simulated unhandled promise rejection'));
  };

  const simulateWindowError = () => {
    addToLog('window', 'Triggered window error');
    // Simulate a window error
    setTimeout(() => {
      throw new Error('Simulated window error');
    }, 0);
  };

  const simulateNetworkError = () => {
    addToLog('network', 'Triggered network error simulation');
    // Simulate a network error via failed fetch
    fetch('/nonexistent-endpoint')
      .catch(err => {
        // This won't trigger global handlers but shows error handling flow
        console.warn('Network error caught:', err);
      });
  };

  const simulateManualError = () => {
    addToLog('manual', 'Triggered manual error report');
    const error = new Error('Manually reported error');
    if (onError) {
      onError(error, 'manual-simulation');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button 
          variant="destructive" 
          onClick={simulateUnhandledRejection}
          className="justify-start"
        >
          <span role="img" aria-label="Prohibited">🚫</span> Unhandled Promise Rejection
        </Button>
        
        <Button 
          variant="destructive" 
          onClick={simulateWindowError}
          className="justify-start"
        >
          <span role="img" aria-label="Warning">⚠️</span> Window Error
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulateNetworkError}
          className="justify-start border-orange-200 hover:bg-orange-50"
        >
          <span role="img" aria-label="Globe">🌐</span> Network Error
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulateManualError}
          className="justify-start"
        >
          <span role="img" aria-label="Note">📝</span> Manual Error Report
        </Button>
      </div>

      <div className="mt-6">
        <h4 className="font-medium text-sm mb-2">Error Log (last 5 events):</h4>
        <div className="bg-muted rounded-md p-3 max-h-32 overflow-y-auto">
          {errorLog.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No errors triggered yet</p>
          ) : (
            <div className="space-y-1">
              {errorLog.map((entry, index) => (
                <div key={index} className="text-xs font-mono">
                  <span className="text-muted-foreground">[{entry.time}]</span>{' '}
                  <span className="font-medium">{entry.type}:</span> {entry.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <span role="img" aria-label="Light bulb">💡</span> <strong>Note:</strong> Open your browser's Developer Tools console to see the error handling in action. 
          Error reporting and logging behavior depends on the GlobalErrorHandler configuration.
        </p>
      </div>
    </div>
  );
};

export const Default: Story = {
  args: {},
  render: (args) => (
    <div className="space-y-4">
      <GlobalErrorHandler {...args} />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Global Error Handler (Default Configuration)</h3>
        <p className="text-sm text-muted-foreground">
          This shows the GlobalErrorHandler with default settings. It will catch unhandled errors and log them to the console.
        </p>
      </div>
      <ErrorSimulator />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Default GlobalErrorHandler configuration with standard error handling behavior.',
      },
    },
  },
};

export const WithNotifications: Story = {
  args: {
    showNotifications: true,
  },
  render: (args) => (
    <div className="space-y-4">
      <GlobalErrorHandler {...args} />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">With User Notifications</h3>
        <p className="text-sm text-muted-foreground">
          User notifications are enabled. Check the browser console for notification messages when errors occur.
        </p>
      </div>
      <ErrorSimulator />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'GlobalErrorHandler with user notifications enabled. Users will see error notifications when unhandled errors occur.',
      },
    },
  },
};

export const WithCustomErrorHandler: Story = {
  args: {
    enableReporting: false,
    enableConsoleLogging: true,
  },
  render: (args) => {
    const [notifications, setNotifications] = React.useState<Array<{ message: string; time: string }>>([]);

    const handleError = (error: Error, context?: string) => {
      const time = new Date().toLocaleTimeString();
      const message = `${context}: ${error.message}`;
      setNotifications(prev => [...prev.slice(-2), { message, time }]);
    };

    return (
      <div className="space-y-4">
        <GlobalErrorHandler {...args} onError={handleError} />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">With Custom Error Handler</h3>
          <p className="text-sm text-muted-foreground">
            Custom error handler displays notifications in the UI instead of just logging to console.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Custom Error Notifications:</h4>
            <div className="space-y-1">
              {notifications.map((notif, index) => (
                <div 
                  key={index} 
                  className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800"
                >
                  <span className="text-red-600">[{notif.time}]</span> {notif.message}
                </div>
              ))}
            </div>
          </div>
        )}

        <ErrorSimulator onError={handleError} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'GlobalErrorHandler with custom error handling callback that displays notifications in the UI.',
      },
    },
  },
};

export const DevelopmentMode: Story = {
  args: {
    enableConsoleLogging: true,
    showNotifications: false,
    enableReporting: false,
  },
  render: (args) => {
    // Simulate development environment
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true });
    
    React.useEffect(() => {
      return () => {
        Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
      };
    }, [originalEnv]);

    return (
      <div className="space-y-4">
        <GlobalErrorHandler {...args} />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Development Mode</h3>
          <p className="text-sm text-muted-foreground">
            In development mode, detailed error logging is enabled. Check the browser console for comprehensive error information.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <p className="text-sm text-amber-800">
              <span role="img" aria-label="Wrench">🔧</span> <strong>Development Mode:</strong> Enhanced console logging with error grouping and detailed stack traces.
            </p>
          </div>
        </div>
        <ErrorSimulator />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'GlobalErrorHandler optimized for development with detailed console logging and debugging information.',
      },
    },
  },
};

export const ProductionMode: Story = {
  args: {
    enableConsoleLogging: false,
    showNotifications: true,
    enableReporting: true,
  },
  render: (args) => {
    // Simulate production environment
    const originalEnv = process.env.NODE_ENV;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true });
    
    React.useEffect(() => {
      return () => {
        Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv, configurable: true });
      };
    }, [originalEnv]);

    return (
      <div className="space-y-4">
        <GlobalErrorHandler {...args} />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Production Mode</h3>
          <p className="text-sm text-muted-foreground">
            In production mode, console logging is disabled and error reporting is enabled for monitoring services.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-sm text-green-800">
              <span role="img" aria-label="Rocket">🚀</span> <strong>Production Mode:</strong> Minimal console output with error reporting enabled for monitoring.
            </p>
          </div>
        </div>
        <ErrorSimulator />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'GlobalErrorHandler optimized for production with error reporting enabled and reduced console noise.',
      },
    },
  },
};

export const DisabledHandler: Story = {
  args: {
    showNotifications: false,
    enableReporting: false,
    enableConsoleLogging: false,
  },
  render: (args) => (
    <div className="space-y-4">
      <GlobalErrorHandler {...args} />
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Disabled Error Handler</h3>
        <p className="text-sm text-muted-foreground">
          All error handling features are disabled. Errors will only show in the browser's default console.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-sm text-gray-600">
            <span role="img" aria-label="Muted speaker">🔇</span> <strong>Silent Mode:</strong> No custom error handling, reporting, or notifications.
          </p>
        </div>
      </div>
      <ErrorSimulator />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'GlobalErrorHandler with all features disabled for testing or minimal error handling scenarios.',
      },
    },
  },
};

// Hook version story
const HookDemo = () => {
  const [errorCount, setErrorCount] = React.useState(0);

  useGlobalErrorHandler({
    enableReporting: false,
    enableConsoleLogging: true,
    onError: (error, context) => {
      setErrorCount(prev => prev + 1);
      console.log('Hook error handler:', error, context);
    },
  });

  const triggerError = () => {
    Promise.reject(new Error('Hook demo error'));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">useGlobalErrorHandler Hook</h3>
        <p className="text-sm text-muted-foreground">
          This component uses the useGlobalErrorHandler hook instead of the component version.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <span role="img" aria-label="Bar chart">📊</span> Errors caught by hook: <strong>{errorCount}</strong>
          </p>
        </div>
      </div>
      
      <Button onClick={triggerError} variant="destructive">
        Trigger Error (Hook Version)
      </Button>
    </div>
  );
};

export const HookVersion: Story = {
  render: () => <HookDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Using the useGlobalErrorHandler hook instead of the component version for more flexible integration.',
      },
    },
  },
};

// Interactive configuration story
export const InteractiveConfiguration: Story = {
  render: () => {
    const [config, setConfig] = React.useState({
      showNotifications: true,
      enableReporting: false,
      enableConsoleLogging: true,
    });
    
    const [errorCount, setErrorCount] = React.useState(0);
    const [lastError, setLastError] = React.useState<string>('');

    const handleError = (error: Error, context?: string) => {
      setErrorCount(prev => prev + 1);
      setLastError(`${context}: ${error.message}`);
    };

    return (
      <div className="space-y-6">
        <GlobalErrorHandler 
          {...config} 
          onError={handleError}
        />
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Interactive Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.showNotifications}
                onChange={(e) => setConfig(prev => ({ ...prev, showNotifications: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Show Notifications</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.enableReporting}
                onChange={(e) => setConfig(prev => ({ ...prev, enableReporting: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Enable Reporting</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.enableConsoleLogging}
                onChange={(e) => setConfig(prev => ({ ...prev, enableConsoleLogging: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Console Logging</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-sm font-medium">Errors Handled:</p>
              <p className="text-2xl font-bold text-slate-700">{errorCount}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Last Error:</p>
              <p className="text-sm text-slate-600 truncate" title={lastError}>
                {lastError || 'None'}
              </p>
            </div>
          </div>

          <ErrorSimulator onError={handleError} />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive story allowing you to test different GlobalErrorHandler configurations and see their effects in real-time.',
      },
    },
  },
};

// Resource error simulation
const ResourceErrorDemo = () => {
  const simulateImageError = () => {
    const img = document.createElement('img');
    img.src = '/nonexistent-image.jpg';
    img.onerror = () => console.log('Image error simulated');
    document.body.appendChild(img);
    setTimeout(() => document.body.removeChild(img), 100);
  };

  const simulateScriptError = () => {
    const script = document.createElement('script');
    script.src = '/nonexistent-script.js';
    script.onerror = () => console.log('Script error simulated');
    document.head.appendChild(script);
    setTimeout(() => document.head.removeChild(script), 100);
  };

  return (
    <div className="space-y-4">
      <GlobalErrorHandler 
        enableConsoleLogging={true}
        showNotifications={false}
        enableReporting={false}
      />
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Resource Error Handling</h3>
        <p className="text-sm text-muted-foreground">
          GlobalErrorHandler also catches resource loading errors (images, scripts, stylesheets).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          onClick={simulateImageError}
          className="justify-start"
        >
          <span role="img" aria-label="Framed picture">🖼️</span> Simulate Image Error
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulateScriptError}
          className="justify-start"
        >
          <span role="img" aria-label="Page facing up">📄</span> Simulate Script Error
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <p className="text-sm text-yellow-800">
          <span role="img" aria-label="Information">ℹ️</span> Resource errors are logged but don't trigger user notifications by default to avoid spam.
        </p>
      </div>
    </div>
  );
};

export const ResourceErrors: Story = {
  render: () => <ResourceErrorDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how GlobalErrorHandler catches and handles resource loading errors (images, scripts, etc.).',
      },
    },
  },
};