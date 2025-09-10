'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback } from './ErrorFallback';
import { createErrorBoundaryReporter } from '@/lib/error/errorReporting';

interface RootErrorBoundaryProps {
  children: React.ReactNode;
}

export function RootErrorBoundary({ children }: RootErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={({ error, onRetry }) => (
        <ErrorFallback
          error={error}
          errorInfo={null}
          onRetry={onRetry}
          title="Application Error"
          description="Something went wrong with the application. Please try again."
          showDetails={process.env.NODE_ENV === 'development'}
          variant="detailed"
        />
      )}
      onError={(error, errorInfo) => {
        const reporter = createErrorBoundaryReporter('RootLayout');
        reporter(error, {
          componentStack: errorInfo.componentStack || null
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}