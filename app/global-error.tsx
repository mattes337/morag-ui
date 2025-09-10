/**
 * Next.js Global Error Page Component
 * Handles errors that occur at the root level of the application
 * This file is required for the app router and catches errors in the root layout
 */

'use client';

import React, { useEffect } from 'react';
import { reportJavaScriptError } from '@/lib/error/errorReporting';

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  useEffect(() => {
    // Log the error to our error reporting service
    reportJavaScriptError(error, 'nextjs-global-error', {
      digest: error.digest,
      page: 'global-error-boundary',
      critical: true,
    }).catch((reportingError) => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to report global error:', reportingError);
      }
    });
  }, [error]);

  const handleRefresh = () => {
    // Try resetting first, if that doesn't work, force refresh
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <html lang="en">
      <head>
        <title>Application Error - MoRAG</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Include basic Tailwind reset and styles inline since we can't rely on CSS loading */}
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #1a1a1a;
              background-color: #ffffff;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 1rem;
            }
            .container {
              max-width: 600px;
              width: 100%;
              text-align: center;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              background: white;
              border: 1px solid #e5e7eb;
            }
            .icon {
              width: 64px;
              height: 64px;
              color: #dc2626;
              margin: 0 auto 1.5rem auto;
            }
            h1 {
              font-size: 1.875rem;
              font-weight: 700;
              color: #dc2626;
              margin-bottom: 1rem;
            }
            p {
              color: #6b7280;
              margin-bottom: 2rem;
              font-size: 1.125rem;
            }
            .button {
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.75rem 1.5rem;
              margin: 0 0.5rem;
              background-color: #dc2626;
              color: white;
              border: none;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              font-size: 1rem;
              text-decoration: none;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #b91c1c;
            }
            .button-secondary {
              background-color: transparent;
              color: #6b7280;
              border: 1px solid #d1d5db;
            }
            .button-secondary:hover {
              background-color: #f9fafb;
              color: #374151;
            }
            .error-details {
              margin-top: 2rem;
              padding: 1rem;
              background-color: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 6px;
              text-align: left;
            }
            .error-details h3 {
              color: #dc2626;
              font-size: 0.875rem;
              font-weight: 600;
              margin-bottom: 0.5rem;
            }
            .error-details pre {
              font-size: 0.75rem;
              color: #374151;
              overflow: auto;
              white-space: pre-wrap;
              word-break: break-word;
            }
            .buttons {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              margin-bottom: 1.5rem;
            }
            @media (min-width: 640px) {
              .buttons {
                flex-direction: row;
                justify-content: center;
              }
            }
            .icon-refresh, .icon-home {
              width: 20px;
              height: 20px;
            }
          `
        }} />

        <div className="container">
          {/* Error Icon */}
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h1>Something went wrong</h1>
          
          <p>
            The application encountered an unexpected error and needs to restart. 
            We apologize for the inconvenience.
          </p>

          <div className="buttons">
            <button onClick={handleRefresh} className="button">
              <svg className="icon-refresh" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Try Again
            </button>
            
            <button onClick={handleGoHome} className="button button-secondary">
              <svg className="icon-home" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </div>

          {/* Development-only error details */}
          {process.env.NODE_ENV === 'development' && (
            <div className="error-details">
              <h3>Error Details (Development Only)</h3>
              <div>
                <strong>Message:</strong>
                <pre>{error.message || 'No error message available'}</pre>
              </div>
              {error.stack && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Stack Trace:</strong>
                  <pre>{error.stack}</pre>
                </div>
              )}
              {error.digest && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Error Digest:</strong>
                  <pre>{error.digest}</pre>
                </div>
              )}
            </div>
          )}

          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '2rem', marginBottom: '0' }}>
            If this problem persists, please contact support with the error information above.
          </p>
        </div>
      </body>
    </html>
  );
}