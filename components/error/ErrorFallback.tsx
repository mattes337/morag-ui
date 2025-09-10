/**
 * ErrorFallback - Error Fallback UI Component
 * Uses existing EmptyState component to display error information with retry functionality
 */

'use client';

import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { ErrorInfo } from 'react';

export interface ErrorFallbackProps {
  error: Error | null;
  errorInfo?: ErrorInfo | null;
  onRetry: () => void;
  title?: string;
  description?: string;
  showDetails?: boolean;
  variant?: 'default' | 'minimal' | 'detailed';
}

export function ErrorFallback({
  error,
  errorInfo,
  onRetry,
  title = "Something went wrong",
  description,
  showDetails = process.env.NODE_ENV === 'development',
  variant = 'default',
}: ErrorFallbackProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const defaultDescription = error?.message 
    ? "We encountered an unexpected error. Please try again or contact support if the problem persists."
    : "An unexpected error occurred. Please try again.";

  const finalDescription = description || defaultDescription;

  // Minimal variant - just the EmptyState
  if (variant === 'minimal') {
    return (
      <EmptyState
        variant="error"
        size="default"
        icon={<AlertTriangle />}
        title={title}
        description={finalDescription}
        actionText="Try Again"
        onAction={onRetry}
        actionVariant="default"
      />
    );
  }

  // Detailed variant - more comprehensive error information
  if (variant === 'detailed') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <EmptyState
          variant="error"
          size="lg"
          icon={<AlertTriangle />}
          title={title}
          description={finalDescription}
        />
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          
          {showDetails && error && (
            <Button
              variant="outline"
              onClick={() => setShowErrorDetails(!showErrorDetails)}
              className="gap-2"
            >
              {showErrorDetails ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  Show Details
                </>
              )}
            </Button>
          )}
        </div>

        {showDetails && showErrorDetails && error && (
          <div className="mt-6 space-y-4">
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <h3 className="text-sm font-medium text-destructive mb-2">
                Error Details (Development Only)
              </h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Message:</h4>
                  <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                    {error.message || 'No error message available'}
                  </pre>
                </div>
                
                {error.stack && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Stack Trace:</h4>
                    <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-32">
                      {error.stack}
                    </pre>
                  </div>
                )}
                
                {errorInfo?.componentStack && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Component Stack:</h4>
                    <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-24">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default variant - EmptyState with retry button and optional details toggle
  return (
    <div className="space-y-6">
      <EmptyState
        variant="error"
        size="default"
        icon={<AlertTriangle />}
        title={title}
        description={finalDescription}
        actionText="Try Again"
        onAction={onRetry}
        actionVariant="default"
        secondaryActionText={showDetails && error ? (showErrorDetails ? "Hide Details" : "Show Details") : undefined}
        onSecondaryAction={showDetails && error ? () => setShowErrorDetails(!showErrorDetails) : undefined}
        secondaryActionVariant="outline"
      />

      {showDetails && showErrorDetails && error && (
        <div className="max-w-md mx-auto">
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h3 className="text-sm font-medium text-destructive mb-3">
              Error Details (Development Only)
            </h3>
            
            <div className="space-y-2">
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Message:</h4>
                <pre className="text-xs bg-background p-2 rounded border overflow-auto">
                  {error.message || 'No error message available'}
                </pre>
              </div>
              
              {error.stack && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Stack:</h4>
                  <pre className="text-xs bg-background p-2 rounded border overflow-auto max-h-24">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Predefined variants for common use cases
export function MinimalErrorFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="minimal" />;
}

export function DetailedErrorFallback(props: Omit<ErrorFallbackProps, 'variant'>) {
  return <ErrorFallback {...props} variant="detailed" />;
}

export default ErrorFallback;