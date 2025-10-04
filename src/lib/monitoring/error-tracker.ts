/**
 * ============================================
 * ERROR TRACKING & MONITORING
 * ============================================
 * Système de monitoring pour tracker les erreurs, performances et comportements utilisateurs
 */

export interface ErrorContext {
  userId?: string;
  businessId?: string;
  route?: string;
  timestamp: number;
  userAgent: string;
  [key: string]: any;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private enabled: boolean = true;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];
  private performanceMetrics: PerformanceMetric[] = [];

  /**
   * Track une erreur avec son contexte
   */
  trackError(error: Error, context: Partial<ErrorContext> = {}) {
    if (!this.enabled) return;

    const fullContext: ErrorContext = {
      ...context,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      route: window.location.pathname,
    };

    console.error('[ErrorTracker]', error, fullContext);

    this.errorQueue.push({ error, context: fullContext });

    // Log vers la console en développement
    if (import.meta.env.DEV) {
      console.group('🔴 Error Tracked');
      console.error('Error:', error);
      console.log('Context:', fullContext);
      console.trace();
      console.groupEnd();
    }

    // En production, on pourrait envoyer vers un service externe (Sentry, LogRocket, etc.)
    // this.sendToExternalService({ error, context: fullContext });
  }

  /**
   * Track une métrique de performance
   */
  trackPerformance(metric: PerformanceMetric) {
    if (!this.enabled) return;

    this.performanceMetrics.push(metric);

    if (import.meta.env.DEV) {
      console.log('[Performance]', metric.name, `${metric.value}ms`);
    }

    // Alerte si la performance est mauvaise
    if (metric.value > 3000) {
      console.warn(`⚠️ Slow operation: ${metric.name} took ${metric.value}ms`);
    }
  }

  /**
   * Track un événement utilisateur
   */
  trackEvent(eventName: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const event = {
      name: eventName,
      properties,
      timestamp: Date.now(),
      route: window.location.pathname,
    };

    if (import.meta.env.DEV) {
      console.log('[Event]', eventName, properties);
    }

    // En production, envoyer vers analytics
    // this.sendToAnalytics(event);
  }

  /**
   * Récupère les erreurs en queue
   */
  getErrorQueue() {
    return [...this.errorQueue];
  }

  /**
   * Récupère les métriques de performance
   */
  getPerformanceMetrics() {
    return [...this.performanceMetrics];
  }

  /**
   * Clear la queue d'erreurs
   */
  clearErrorQueue() {
    this.errorQueue = [];
  }

  /**
   * Clear les métriques
   */
  clearMetrics() {
    this.performanceMetrics = [];
  }

  /**
   * Active/désactive le tracking
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Méthode pour envoyer vers un service externe (à implémenter selon les besoins)
   */
  private sendToExternalService(data: { error: Error; context: ErrorContext }) {
    // Exemple: Sentry.captureException(data.error, { extra: data.context });
    // Exemple: LogRocket.captureException(data.error);
  }

  /**
   * Méthode pour envoyer vers analytics (à implémenter selon les besoins)
   */
  private sendToAnalytics(event: any) {
    // Exemple: analytics.track(event.name, event.properties);
  }
}

// Export singleton
export const errorTracker = new ErrorTracker();

/**
 * Hook React pour utiliser le error tracker
 */
export const useErrorTracking = () => {
  return {
    trackError: errorTracker.trackError.bind(errorTracker),
    trackPerformance: errorTracker.trackPerformance.bind(errorTracker),
    trackEvent: errorTracker.trackEvent.bind(errorTracker),
  };
};

/**
 * Utility pour mesurer la performance d'une fonction
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T,
  metadata?: Record<string, any>
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    errorTracker.trackPerformance({
      name,
      value: duration,
      timestamp: Date.now(),
      metadata,
    });
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    
    errorTracker.trackPerformance({
      name: `${name} (failed)`,
      value: duration,
      timestamp: Date.now(),
      metadata: { ...metadata, error: true },
    });
    
    throw error;
  }
}

/**
 * Decorator pour tracker automatiquement les erreurs d'une fonction
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  context?: Partial<ErrorContext>
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.catch((error) => {
          errorTracker.trackError(error, context);
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      errorTracker.trackError(error as Error, context);
      throw error;
    }
  }) as T;
}
