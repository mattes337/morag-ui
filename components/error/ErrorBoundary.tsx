/**
 * ErrorBoundary - React Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and displays a fallback UI
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error: Error | null;
    errorInfo: ErrorInfo | null;
    onRetry: () => void;
  }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number | boolean | null | undefined>;
}

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Sanitize error information for production
    const sanitizedError = this.sanitizeError(error);
    const sanitizedErrorInfo = this.sanitizeErrorInfo(errorInfo);

    // Log error details and update state with sanitized error info
    this.setState({
      errorInfo: sanitizedErrorInfo,
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(sanitizedError, sanitizedErrorInfo);
    }

    // In development, also log to console with full details
    if (process.env.NODE_ENV === 'development') {
      console.group('React Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    } else {
      // In production, log minimal error information without sensitive details
      console.error('Application Error:', {
        message: sanitizedError.message,
        timestamp: new Date().toISOString(),
        errorId: this.generateErrorId(),
      });
    }
  }

  /**
   * Sanitizes error object for production to prevent information disclosure
   */
  private sanitizeError = (error: Error): Error => {
    if (process.env.NODE_ENV === 'development') {
      return error;
    }

    // Create a new sanitized error with minimal information
    const sanitizedError = new Error('An unexpected error occurred');
    
    // Only include safe error messages (no stack traces or sensitive paths)
    const safeMessages = [
      'Network Error',
      'Validation Error',
      'Authentication Error',
      'Authorization Error',
      'Not Found',
      'Service Unavailable'
    ];

    // Check if the error message is safe to expose
    const isSafeMessage = safeMessages.some(safeMsg => 
      error.message.toLowerCase().includes(safeMsg.toLowerCase())
    );

    if (isSafeMessage) {
      sanitizedError.message = error.message;
    }

    return sanitizedError;
  };

  /**
   * Sanitizes error info for production
   */
  private sanitizeErrorInfo = (errorInfo: ErrorInfo): ErrorInfo => {
    if (process.env.NODE_ENV === 'development') {
      return errorInfo;
    }

    // Return minimal error info for production
    return {
      componentStack: 'Error occurred in component tree',
    };
  };

  /**
   * Generates a unique error ID for tracking
   */
  private generateErrorId = (): string => {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset error boundary if resetKeys changed
    if (hasError && resetKeys !== prevProps.resetKeys) {
      if (resetKeys?.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary();
      }
    }

    // Reset error boundary if any props changed and resetOnPropsChange is true
    if (hasError && resetOnPropsChange && prevProps !== this.props) {
      this.resetErrorBoundary();
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 0);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback: FallbackComponent } = this.props;

    if (hasError) {
      // If a custom fallback component is provided, render it
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={error}
            errorInfo={errorInfo}
            onRetry={this.resetErrorBoundary}
          />
        );
      }

      // Default fallback UI for development - shows full error details
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="max-w-2xl w-full space-y-4">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-destructive mb-2">
                  <span role="img" aria-label="Warning">🚨</span> Development Error
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  An error occurred in the component tree. This detailed error information is only shown in development.
                </p>
              </div>
              
              {error && (
                <div className="space-y-2">
                  <h3 className="font-medium text-destructive">Error Message:</h3>
                  <pre className="text-xs bg-background p-3 rounded border overflow-auto">
                    {error.message}
                  </pre>
                </div>
              )}
              
              {error?.stack && (
                <div className="space-y-2">
                  <h3 className="font-medium text-destructive">Stack Trace:</h3>
                  <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-48">
                    {error.stack}
                  </pre>
                </div>
              )}
              
              {errorInfo?.componentStack && (
                <div className="space-y-2">
                  <h3 className="font-medium text-destructive">Component Stack:</h3>
                  <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="text-center pt-4">
                <button
                  onClick={this.resetErrorBoundary}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Production fallback - minimal error display
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h2 className="text-lg font-semibold text-destructive">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground max-w-md">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <button
              onClick={this.resetErrorBoundary}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Higher-order component wrapper for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

export default ErrorBoundary;