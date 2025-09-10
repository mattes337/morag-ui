/**
 * Next.js Error Page Component
 * Handles errors that occur during server-side rendering or in the app router
 * Uses ErrorFallback component with reset functionality
 */

'use client';

import React, { useEffect } from 'react';
import { ErrorFallback } from '@/components/error/ErrorFallback';
import { reportJavaScriptError } from '@/lib/error/errorReporting';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to our error reporting service
    reportJavaScriptError(error, 'nextjs-error-page', {
      digest: error.digest,
      page: 'error-boundary',
    }).catch((reportingError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to report error:', reportingError);
      }
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <ErrorFallback
          error={error}
          onRetry={reset}
          title="Application Error"
          description={
            process.env.NODE_ENV === 'development'
              ? error.message
              : "Something went wrong with the application. Please try again."
          }
          variant="detailed"
          showDetails={process.env.NODE_ENV === 'development'}
        />
        
        {process.env.NODE_ENV === 'development' && error.digest && (
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Error Digest: <code className="bg-muted px-2 py-1 rounded text-xs">{error.digest}</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}