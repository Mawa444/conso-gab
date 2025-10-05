/**
 * Centralized logging system for GABOMA
 * - Development: All logs visible in console
 * - Production: Only errors logged, console.* stripped by Vite
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDev = import.meta.env.DEV;

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: LogContext, additionalContext?: LogContext): void {
    const mergedContext = { ...context, ...additionalContext };
    if (this.isDev) {
      console.log(this.formatMessage('debug', message, mergedContext));
    }
  }

  info(message: string, context?: LogContext, additionalContext?: LogContext): void {
    const mergedContext = { ...context, ...additionalContext };
    if (this.isDev) {
      console.info(this.formatMessage('info', message, mergedContext));
    }
  }

  warn(message: string, context?: LogContext, additionalContext?: LogContext): void {
    const mergedContext = { ...context, ...additionalContext };
    if (this.isDev) {
      console.warn(this.formatMessage('warn', message, mergedContext));
    }
  }

  error(message: string, context?: LogContext, errorOrContext?: Error | LogContext): void {
    // Handle both error object and additional context
    let errorContext = context || {};
    
    if (errorOrContext) {
      if (errorOrContext instanceof Error) {
        errorContext = { 
          ...context, 
          error: errorOrContext.message, 
          stack: errorOrContext.stack 
        };
      } else {
        errorContext = { ...context, ...errorOrContext };
      }
    }
    
    // Always log errors, even in production
    console.error(this.formatMessage('error', message, errorContext));
    
    // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
    // this.sendToMonitoring(message, errorContext);
  }

  // Performance tracking
  time(label: string): void {
    if (this.isDev) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.isDev) {
      console.timeEnd(label);
    }
  }
}

export const logger = new Logger();

/**
 * Create a domain-specific logger with prefixed messages
 * Example: createDomainLogger('auth') will prefix all logs with [AUTH]
 */
export const createDomainLogger = (domain: string) => {
  const prefix = `[${domain.toUpperCase()}]`;
  
  return {
    debug: (message: string, context?: LogContext, additionalContext?: LogContext) => 
      logger.debug(`${prefix} ${message}`, context, additionalContext),
    info: (message: string, context?: LogContext, additionalContext?: LogContext) => 
      logger.info(`${prefix} ${message}`, context, additionalContext),
    warn: (message: string, context?: LogContext, additionalContext?: LogContext) => 
      logger.warn(`${prefix} ${message}`, context, additionalContext),
    error: (message: string, context?: LogContext, errorOrContext?: Error | LogContext) => 
      logger.error(`${prefix} ${message}`, context, errorOrContext),
    time: (label: string) => 
      logger.time(`${prefix} ${label}`),
    timeEnd: (label: string) => 
      logger.timeEnd(`${prefix} ${label}`),
  };
};
