/**
 * Production-safe logger utility
 * Remplace console.log avec des logs conditionnels et monitoring Sentry
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isEnabled = this.isDevelopment || import.meta.env.VITE_ENABLE_LOGS === 'true';

  /**
   * Log de debug (uniquement en développement)
   */
  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log d'information
   */
  info(message: string, context?: LogContext) {
    if (this.isEnabled) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log de warning
   */
  warn(message: string, context?: LogContext) {
    if (this.isEnabled) {
      console.warn(`[WARN] ${message}`, context || '');
    }
    
    // En production, envoyer à Sentry
    if (!this.isDevelopment && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(message, {
        level: 'warning',
        contexts: { extra: context }
      });
    }
  }

  /**
   * Log d'erreur (toujours actif + Sentry)
   */
  error(message: string, error?: Error | any, context?: LogContext) {
    // Toujours logger les erreurs
    console.error(`[ERROR] ${message}`, error, context || '');
    
    // Envoyer à Sentry en production
    if (!this.isDevelopment && typeof window !== 'undefined' && (window as any).Sentry) {
      if (error instanceof Error) {
        (window as any).Sentry.captureException(error, {
          contexts: { extra: { message, ...context } }
        });
      } else {
        (window as any).Sentry.captureMessage(message, {
          level: 'error',
          contexts: { extra: { error, ...context } }
        });
      }
    }
  }

  /**
   * Log de performance (mesure de temps)
   */
  performance(label: string, startTime: number) {
    const duration = Date.now() - startTime;
    if (this.isDevelopment) {
      console.log(`[PERF] ${label}: ${duration}ms`);
    }
    
    // En production, envoyer les métriques lentes à Sentry
    if (!this.isDevelopment && duration > 3000 && typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(`Slow operation: ${label}`, {
        level: 'warning',
        contexts: { extra: { duration } }
      });
    }
    
    return duration;
  }

  /**
   * Log une action utilisateur (analytics)
   */
  track(eventName: string, properties?: LogContext) {
    if (this.isDevelopment) {
      console.log(`[TRACK] ${eventName}`, properties || '');
    }
    
    // En production, envoyer aux analytics (Google Analytics, Mixpanel, etc.)
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // TODO: Intégrer avec votre solution d'analytics
      // Exemple: window.gtag?.('event', eventName, properties);
    }
  }

  /**
   * Log structuré pour debug complexe
   */
  group(label: string, callback: () => void) {
    if (this.isDevelopment) {
      console.group(label);
      callback();
      console.groupEnd();
    } else {
      callback();
    }
  }

  /**
   * Log table (utile pour arrays/objects)
   */
  table(data: any) {
    if (this.isDevelopment) {
      console.table(data);
    }
  }
}

// Export singleton
export const logger = new Logger();

// Exports nommés pour faciliter l'utilisation
export const { debug, info, warn, error, performance, track, group, table } = logger;
