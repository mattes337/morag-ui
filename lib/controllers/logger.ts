import { ControllerLogger } from './types';

/**
 * Creates a logger instance for a controller with consistent formatting
 */
export function createControllerLogger(controllerName: string): ControllerLogger {
  const formatMessage = (level: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] 🎮 [${controllerName}]`;
    
    if (data) {
      console.log(`${prefix} ${level}: ${message}`, data);
    } else {
      console.log(`${prefix} ${level}: ${message}`);
    }
  };

  return {
    debug: (message: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        formatMessage('DEBUG', message, data);
      }
    },

    info: (message: string, data?: any) => {
      formatMessage('INFO', message, data);
    },

    warn: (message: string, data?: any) => {
      formatMessage('WARN', message, data);
    },

    error: (message: string, data?: any) => {
      formatMessage('ERROR', message, data);
    },

    trace: (action: string, data?: any) => {
      if (process.env.NODE_ENV === 'development') {
        formatMessage('TRACE', `Action: ${action}`, data);
      }
    }
  };
}

/**
 * State change logger utility
 */
export function logStateChange<T>(
  logger: ControllerLogger,
  stateName: string,
  oldState: T,
  newState: T,
  action?: string
) {
  logger.trace(`State change: ${stateName}`, {
    action,
    oldState,
    newState,
    changed: JSON.stringify(oldState) !== JSON.stringify(newState)
  });
}
