/**
 * Error Reporting Utilities
 * Handles error logging, reporting, and analytics
 */

export interface ErrorReport {
  message: string;
  stack: string | undefined;
  context: string;
  timestamp: string;
  url: string;
  userAgent: string;
  userId: string | undefined;
  sessionId: string | undefined;
  additional: Record<string, any> | undefined;
}

export interface ErrorReportingConfig {
  endpoint: string | undefined;
  apiKey: string | undefined;
  enabled: boolean | undefined;
  maxRetries: number | undefined;
  retryDelay: number | undefined;
  batchSize: number | undefined;
  flushInterval: number | undefined;
}

class ErrorReporter {
  private config: Required<ErrorReportingConfig>;
  private errorQueue: ErrorReport[] = [];
  private flushTimer?: NodeJS.Timeout;
  private retryCount = 0;

  constructor(config: ErrorReportingConfig = {}) {
    this.config = {
      endpoint: config.endpoint || '/api/errors',
      apiKey: config.apiKey || '',
      enabled: config.enabled ?? (process.env.NODE_ENV === 'production'),
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      batchSize: config.batchSize ?? 10,
      flushInterval: config.flushInterval ?? 30000, // 30 seconds
    };

    // Start flush timer in browser environment
    if (typeof window !== 'undefined' && this.config.enabled) {
      this.startFlushTimer();
    }
  }

  async reportError(error: ErrorReport): Promise<void> {
    if (!this.config.enabled) {
      this.logToDevelopment(error);
      return;
    }

    // Add error to queue
    this.errorQueue.push(error);

    // Flush immediately if queue is full or if it's a critical error
    if (this.errorQueue.length >= this.config.batchSize || this.isCriticalError(error)) {
      await this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      await this.sendErrors(errors);
      this.retryCount = 0;
    } catch (error) {
      console.warn('Failed to send error reports:', error);
      
      // Re-queue errors for retry if we haven't exceeded max retries
      if (this.retryCount < this.config.maxRetries) {
        this.errorQueue.unshift(...errors);
        this.retryCount++;
        
        // Retry with exponential backoff
        setTimeout(() => {
          this.flush();
        }, this.config.retryDelay * Math.pow(2, this.retryCount));
      } else {
        console.error('Max retries exceeded, dropping error reports:', errors);
        this.retryCount = 0;
      }
    }
  }

  private async sendErrors(errors: ErrorReport[]): Promise<void> {
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      body: JSON.stringify({
        errors,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  private isCriticalError(error: ErrorReport): boolean {
    // Define critical error patterns
    const criticalPatterns = [
      /security/i,
      /authentication/i,
      /authorization/i,
      /payment/i,
      /database/i,
      /network/i,
    ];

    return criticalPatterns.some(pattern => 
      pattern.test(error.message) || 
      (error.stack && pattern.test(error.stack))
    );
  }

  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  private logToDevelopment(error: ErrorReport): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`📊 Error Report (${error.context})`);
      console.error('Message:', error.message);
      if (error.stack) console.error('Stack:', error.stack);
      console.log('Context:', error.context);
      console.log('URL:', error.url);
      console.log('Timestamp:', error.timestamp);
      if (error.additional) console.log('Additional Info:', error.additional);
      console.groupEnd();
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush(); // Final flush before destruction
  }
}

// Global instance
let globalReporter: ErrorReporter;

export function initializeErrorReporting(config?: ErrorReportingConfig): void {
  globalReporter = new ErrorReporter(config);
}

export async function reportError(error: ErrorReport): Promise<void> {
  if (!globalReporter) {
    globalReporter = new ErrorReporter();
  }
  return globalReporter.reportError(error);
}

// Helper functions for common error reporting scenarios

export function reportJavaScriptError(
  error: Error, 
  context: string = 'javascript',
  additional?: Record<string, any>
): Promise<void> {
  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    userId: undefined,
    sessionId: undefined,
    additional,
  };
  
  return reportError(errorReport);
}

export function reportApiError(
  url: string, 
  status: number, 
  statusText: string, 
  responseBody?: string,
  additional?: Record<string, any>
): Promise<void> {
  const errorReport: ErrorReport = {
    message: `API Error: ${status} ${statusText}`,
    stack: undefined,
    context: 'api',
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    userId: undefined,
    sessionId: undefined,
    additional: {
      apiUrl: url,
      status,
      statusText,
      responseBody,
      ...additional,
    },
  };
  
  return reportError(errorReport);
}

export function reportUserAction(
  action: string, 
  error: Error,
  additional?: Record<string, any>
): Promise<void> {
  const errorReport: ErrorReport = {
    message: `User Action Error: ${action}`,
    stack: error.stack,
    context: 'userAction',
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    userId: undefined,
    sessionId: undefined,
    additional: {
      action,
      originalError: error.message,
      ...additional,
    },
  };
  
  return reportError(errorReport);
}

export function reportPerformanceIssue(
  metric: string, 
  value: number, 
  threshold: number,
  additional?: Record<string, any>
): Promise<void> {
  const errorReport: ErrorReport = {
    message: `Performance Issue: ${metric} (${value}ms) exceeded threshold (${threshold}ms)`,
    stack: undefined,
    context: 'performance',
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    userId: undefined,
    sessionId: undefined,
    additional: {
      metric,
      value,
      threshold,
      ...additional,
    },
  };
  
  return reportError(errorReport);
}

// Error boundary integration  
export function createErrorBoundaryReporter(componentName: string) {
  return (error: Error, errorInfo: { componentStack: string | null }) => {
    reportJavaScriptError(error, 'errorBoundary', {
      componentName,
      componentStack: errorInfo.componentStack || '',
    });
  };
}

// Cleanup function for SPA/SSR environments
export function destroyErrorReporting(): void {
  if (globalReporter) {
    globalReporter.destroy();
  }
}