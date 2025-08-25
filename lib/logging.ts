export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  error?: Error;
}

export interface Logger {
  error(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  info(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}

class ProductionLogger implements Logger {
  private logLevel: LogLevel;
  private requestId?: string;
  private userId?: string;
  private ip?: string;
  private userAgent?: string;

  constructor() {
    // Set log level based on environment
    const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
    switch (envLogLevel) {
      case 'ERROR':
        this.logLevel = LogLevel.ERROR;
        break;
      case 'WARN':
        this.logLevel = LogLevel.WARN;
        break;
      case 'INFO':
        this.logLevel = LogLevel.INFO;
        break;
      case 'DEBUG':
        this.logLevel = LogLevel.DEBUG;
        break;
      default:
        this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    }
  }

  setContext(context: {
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
  }): void {
    this.requestId = context.requestId;
    this.userId = context.userId;
    this.ip = context.ip;
    this.userAgent = context.userAgent;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private formatLogEntry(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId,
      requestId: this.requestId,
      ip: this.ip,
      userAgent: this.userAgent,
      error,
    };
  }

  private writeLog(entry: LogEntry): void {
    const logData = {
      ...entry,
      error: entry.error ? {
        name: entry.error.name,
        message: entry.error.message,
        stack: entry.error.stack,
      } : undefined,
    };

    // In production, you might want to send logs to a service like:
    // - CloudWatch Logs
    // - Datadog
    // - New Relic
    // - Sentry
    // - ELK Stack
    
    if (process.env.NODE_ENV === 'production') {
      // Use structured JSON logging for production
      console.log(JSON.stringify(logData));
    } else {
      // Use readable format for development
      const levelName = LogLevel[entry.level];
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
      const errorStr = entry.error ? `\nError: ${entry.error.message}\n${entry.error.stack}` : '';
      
      console.log(`[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}${errorStr}`);
    }
  }

  error(message: string, context?: Record<string, any>, error?: Error): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.writeLog(this.formatLogEntry(LogLevel.ERROR, message, context, error));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.writeLog(this.formatLogEntry(LogLevel.WARN, message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.writeLog(this.formatLogEntry(LogLevel.INFO, message, context));
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.writeLog(this.formatLogEntry(LogLevel.DEBUG, message, context));
    }
  }
}

// Global logger instance
export const logger = new ProductionLogger();

// Security audit logging
export class SecurityLogger {
  static logAuthAttempt(success: boolean, email: string, ip: string, userAgent: string): void {
    logger.info('Authentication attempt', {
      event: 'auth_attempt',
      success,
      email,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  static logRateLimitExceeded(endpoint: string, ip: string, userAgent: string): void {
    logger.warn('Rate limit exceeded', {
      event: 'rate_limit_exceeded',
      endpoint,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  static logSuspiciousActivity(activity: string, details: Record<string, any>, ip: string): void {
    logger.warn('Suspicious activity detected', {
      event: 'suspicious_activity',
      activity,
      details,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  static logFileUpload(success: boolean, fileName: string, fileSize: number, userId: string, ip: string): void {
    logger.info('File upload attempt', {
      event: 'file_upload',
      success,
      fileName,
      fileSize,
      userId,
      ip,
      timestamp: new Date().toISOString(),
    });
  }

  static logDataAccess(resource: string, action: string, userId: string, realmId?: string): void {
    logger.info('Data access', {
      event: 'data_access',
      resource,
      action,
      userId,
      realmId,
      timestamp: new Date().toISOString(),
    });
  }

  static logSecurityViolation(violation: string, details: Record<string, any>, ip: string): void {
    logger.error('Security violation', {
      event: 'security_violation',
      violation,
      details,
      ip,
      timestamp: new Date().toISOString(),
    });
  }
}

// Performance monitoring
export class PerformanceLogger {
  private static timers = new Map<string, number>();

  static startTimer(operation: string): void {
    this.timers.set(operation, Date.now());
  }

  static endTimer(operation: string, context?: Record<string, any>): void {
    const startTime = this.timers.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.timers.delete(operation);
      
      logger.info('Performance metric', {
        event: 'performance',
        operation,
        duration,
        ...context,
      });
      
      // Log slow operations as warnings
      if (duration > 5000) { // 5 seconds
        logger.warn('Slow operation detected', {
          event: 'slow_operation',
          operation,
          duration,
          ...context,
        });
      }
    }
  }

  static logDatabaseQuery(query: string, duration: number, rowCount?: number): void {
    logger.debug('Database query', {
      event: 'db_query',
      query: query.substring(0, 200), // Truncate long queries
      duration,
      rowCount,
    });
    
    // Log slow queries
    if (duration > 1000) { // 1 second
      logger.warn('Slow database query', {
        event: 'slow_db_query',
        query: query.substring(0, 200),
        duration,
        rowCount,
      });
    }
  }

  static logAPICall(endpoint: string, method: string, statusCode: number, duration: number, userId?: string): void {
    logger.info('API call', {
      event: 'api_call',
      endpoint,
      method,
      statusCode,
      duration,
      userId,
    });
  }
}

// Error tracking
export class ErrorLogger {
  static logError(error: Error, context?: Record<string, any>): void {
    logger.error('Application error', context, error);
    
    // In production, you might want to send critical errors to:
    // - Sentry
    // - Bugsnag
    // - Rollbar
    // - Custom error tracking service
  }

  static logValidationError(field: string, value: any, rule: string, userId?: string): void {
    logger.warn('Validation error', {
      event: 'validation_error',
      field,
      value: typeof value === 'string' ? value.substring(0, 100) : value,
      rule,
      userId,
    });
  }

  static logBusinessLogicError(operation: string, details: Record<string, any>, userId?: string): void {
    logger.error('Business logic error', {
      event: 'business_logic_error',
      operation,
      details,
      userId,
    });
  }
}

// Request logging middleware helper
export function createRequestLogger(requestId: string) {
  const requestLogger = new ProductionLogger();
  requestLogger.setContext({ requestId });
  return requestLogger;
}

// Health check logging
export class HealthLogger {
  static logHealthCheck(service: string, status: 'healthy' | 'unhealthy' | 'degraded', details?: Record<string, any>): void {
    const level = status === 'healthy' ? LogLevel.INFO :
                  status === 'degraded' ? LogLevel.WARN : LogLevel.ERROR;
    
    if (level === LogLevel.ERROR) {
      logger.error(`Health check failed: ${service}`, {
        event: 'health_check',
        service,
        status,
        details,
      });
    } else if (level === LogLevel.WARN) {
      logger.warn(`Health check degraded: ${service}`, {
        event: 'health_check',
        service,
        status,
        details,
      });
    } else {
      logger.info(`Health check passed: ${service}`, {
        event: 'health_check',
        service,
        status,
        details,
      });
    }
  }
}
