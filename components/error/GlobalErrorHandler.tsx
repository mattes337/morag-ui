/**
 * GlobalErrorHandler - Global Error Handling Component
 * Handles unhandled promise rejections and window errors
 * Provides user-friendly notifications and error reporting
 */

'use client';

import { useEffect } from 'react';
import { reportError, type ErrorReport } from '@/lib/error/errorReporting';

export interface GlobalErrorHandlerProps {
  /**
   * Whether to show user notifications for unhandled errors
   */
  showNotifications?: boolean;
  /**
   * Whether to report errors to external service
   */
  enableReporting?: boolean;
  /**
   * Custom error notification handler
   */
  onError?: (error: Error, context?: string) => void;
  /**
   * Whether to log errors to console in development
   */
  enableConsoleLogging?: boolean;
}

export function GlobalErrorHandler({
  showNotifications = true,
  enableReporting = true,
  onError,
  enableConsoleLogging = process.env.NODE_ENV === 'development',
}: GlobalErrorHandlerProps) {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      if (enableConsoleLogging) {
        console.group('🚨 Unhandled Promise Rejection');
        console.error('Promise:', event.promise);
        console.error('Reason:', event.reason);
        console.error('Error:', error);
        console.groupEnd();
      }

      // Create error report
      const errorReport: ErrorReport = {
        message: error.message || 'Unhandled Promise Rejection',
        stack: error.stack,
        context: 'unhandledRejection',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: undefined,
        sessionId: undefined,
        additional: {
          promise: event.promise.toString(),
          reason: String(event.reason),
        },
      };

      // Report error if enabled
      if (enableReporting) {
        reportError(errorReport).catch((reportingError) => {
          if (enableConsoleLogging) {
            console.warn('Failed to report error:', reportingError);
          }
        });
      }

      // Call custom error handler
      if (onError) {
        onError(error, 'unhandledRejection');
      }

      // Show user notification
      if (showNotifications) {
        // Simple notification - can be enhanced with a proper toast system later
        if (typeof window !== 'undefined') {
          // Use browser notification or fallback to console
          console.warn('🚨 Application Error:', 'The application encountered an error while processing your request.');
          
          // Optional: Could show a simple alert in development
          if (process.env.NODE_ENV === 'development') {
            setTimeout(() => {
              console.log('💡 Error Notification: An unexpected error occurred');
            }, 100);
          }
        }
      }

      // Prevent the default browser error handling
      event.preventDefault();
    };

    // Handle uncaught JavaScript errors
    const handleError = (event: ErrorEvent) => {
      // Skip this handler if it's a resource loading error (has HTML element target)
      if (event.target instanceof HTMLElement) {
        return;
      }
      
      const error = event.error instanceof Error ? event.error : new Error(event.message);

      if (enableConsoleLogging) {
        console.group('🚨 Uncaught JavaScript Error');
        console.error('Message:', event.message);
        console.error('Source:', event.filename);
        console.error('Line:', event.lineno);
        console.error('Column:', event.colno);
        console.error('Error:', event.error);
        console.groupEnd();
      }

      // Create error report
      const errorReport: ErrorReport = {
        message: event.message || 'Uncaught JavaScript Error',
        stack: error.stack,
        context: 'windowError',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: undefined,
        sessionId: undefined,
        additional: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      };

      // Report error if enabled
      if (enableReporting) {
        reportError(errorReport).catch((reportingError) => {
          if (enableConsoleLogging) {
            console.warn('Failed to report error:', reportingError);
          }
        });
      }

      // Call custom error handler
      if (onError) {
        onError(error, 'windowError');
      }

      // Show user notification
      if (showNotifications) {
        // Simple notification - can be enhanced with a proper toast system later
        if (typeof window !== 'undefined') {
          console.warn('🚨 JavaScript Error:', 'The page encountered an error. Please refresh if problems persist.');
          
          // Optional: Could show a simple alert in development
          if (process.env.NODE_ENV === 'development') {
            setTimeout(() => {
              console.log('💡 Error Notification: An unexpected JavaScript error occurred');
            }, 100);
          }
        }
      }

      // Return true to prevent default browser error handling
      return true;
    };

    // Handle resource loading errors (images, scripts, etc.)
    const handleResourceError = (event: Event) => {
      if (event.target instanceof HTMLElement) {
        const error = new Error(`Failed to load ${event.target.tagName.toLowerCase()}`);
        
        if (enableConsoleLogging) {
          console.group('🚨 Resource Loading Error');
          console.error('Element:', event.target);
          console.error('Tag:', event.target.tagName);
          console.error('Source:', (event.target as any).src || (event.target as any).href);
          console.groupEnd();
        }

        // Create error report
        const errorReport: ErrorReport = {
          message: `Failed to load ${event.target.tagName.toLowerCase()}`,
          stack: undefined,
          context: 'resourceError',
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          userId: undefined,
          sessionId: undefined,
          additional: {
            tagName: event.target.tagName,
            src: (event.target as any).src || (event.target as any).href,
            outerHTML: event.target.outerHTML,
          },
        };

        // Report error if enabled
        if (enableReporting) {
          reportError(errorReport).catch((reportingError) => {
            if (enableConsoleLogging) {
              console.warn('Failed to report resource error:', reportingError);
            }
          });
        }

        // Call custom error handler
        if (onError) {
          onError(error, 'resourceError');
        }

        // Don't show notification for resource errors unless it's critical
        // (most resource errors are not critical and would spam the user)
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('error', handleResourceError, true); // Capture phase for resource errors

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, [showNotifications, enableReporting, enableConsoleLogging, onError]);

  // This component doesn't render anything
  return null;
}

// Hook version for easier usage
export function useGlobalErrorHandler(props?: GlobalErrorHandlerProps) {
  return GlobalErrorHandler(props || {});
}

// Helper function to manually report errors
export function reportManualError(error: Error, context?: string) {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context: context || 'manual',
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    userId: undefined,
    sessionId: undefined,
    additional: {
      manual: true,
    },
  };

  return reportError(errorReport);
}

export default GlobalErrorHandler;