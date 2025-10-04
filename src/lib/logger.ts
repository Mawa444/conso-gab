interface LogContext {
  user_id?: string;
  session_id?: string;
  trace_id?: string;
  service: string;
  action?: string;
  from?: string;
  to?: string;
  business_id?: string;
  business_name?: string;
  status?: 'success' | 'error' | 'warning' | 'info';
  sensitive?: boolean;
}

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

class StructuredLogger {
  private sessionId: string;
  
  constructor() {
    this.sessionId = Math.random().toString(36).substring(2, 15);
  }

  private createLogEntry(level: LogLevel, message: string, context: LogContext, data?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      service: context.service,
      session_id: this.sessionId,
      trace_id: context.trace_id || Math.random().toString(36).substring(2, 15),
      user_id: context.user_id,
      action: context.action,
      message,
      status: context.status,
      from: context.from,
      to: context.to,
      business_id: context.business_id,
      business_name: context.business_name,
      data: context.sensitive ? '[REDACTED]' : data,
      path: window.location.pathname,
      user_agent: navigator.userAgent.split(' ')[0] // Simplified UA
    };

    // Filter out undefined values to keep JSON clean
    Object.keys(entry).forEach(key => {
      if ((entry as any)[key] === undefined) {
        delete (entry as any)[key];
      }
    });

    return entry;
  }

  private log(level: LogLevel, message: string, context: LogContext, data?: any) {
    const entry = this.createLogEntry(level, message, context, data);
    
    // Production: only ERROR, WARN, INFO
    if (import.meta.env.PROD && level === 'DEBUG') {
      return;
    }

    // Safe JSON stringification with circular reference handling
    const safeStringify = (obj: any) => {
      const seen = new WeakSet();
      return JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return '[Circular]';
          }
          seen.add(value);
        }
        return value;
      }, 2);
    };

    try {
      const logString = safeStringify(entry);
      switch (level) {
        case 'ERROR':
          console.error(logString);
          break;
        case 'WARN':
          console.warn(logString);
          break;
        case 'INFO':
          console.info(logString);
          break;
        case 'DEBUG':
          console.log(logString);
          break;
      }
    } catch (error) {
      // Fallback if stringification fails
      console.error(`[Logger] Failed to stringify log entry: ${message}`);
    }
  }

  error(message: string, context: LogContext, data?: any) {
    this.log('ERROR', message, { ...context, status: 'error' }, data);
  }

  warn(message: string, context: LogContext, data?: any) {
    this.log('WARN', message, { ...context, status: 'warning' }, data);
  }

  info(message: string, context: LogContext, data?: any) {
    this.log('INFO', message, { ...context, status: 'info' }, data);
  }

  debug(message: string, context: LogContext, data?: any) {
    this.log('DEBUG', message, { ...context, status: 'info' }, data);
  }

  // Specialized logging methods
  navigation(from: string, to: string, context: Partial<LogContext> = {}) {
    this.info('Navigation', {
      service: 'router',
      action: 'navigate',
      from,
      to,
      status: 'success',
      ...context
    });
  }

  profileSwitch(fromMode: string, toMode: string, businessId?: string, context: Partial<LogContext> = {}) {
    this.info('Profile mode switch', {
      service: 'profile-manager',
      action: 'switch_mode',
      from: fromMode,
      to: toMode,
      business_id: businessId,
      status: 'success',
      ...context
    });
  }

  authEvent(action: string, context: Partial<LogContext> = {}) {
    this.info(`Auth ${action}`, {
      service: 'auth',
      action,
      status: 'success',
      ...context
    });
  }

  businessAction(action: string, businessId: string, context: Partial<LogContext> = {}) {
    this.info(`Business ${action}`, {
      service: 'business',
      action,
      business_id: businessId,
      status: 'success',
      ...context
    });
  }
}

// Singleton instance
export const logger = new StructuredLogger();

// Domain-specific loggers
export const createDomainLogger = (service: string) => {
  return {
    error: (message: string, context: Partial<LogContext> = {}, data?: any) => 
      logger.error(message, { service, ...context }, data),
    warn: (message: string, context: Partial<LogContext> = {}, data?: any) => 
      logger.warn(message, { service, ...context }, data),
    info: (message: string, context: Partial<LogContext> = {}, data?: any) => 
      logger.info(message, { service, ...context }, data),
    debug: (message: string, context: Partial<LogContext> = {}, data?: any) => 
      logger.debug(message, { service, ...context }, data),
  };
};
