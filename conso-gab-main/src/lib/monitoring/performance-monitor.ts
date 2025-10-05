/**
 * Performance Monitoring System
 * Tracks Web Vitals, custom metrics, and performance regressions
 */

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  navigationType?: string;
}

interface CustomMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  context?: Record<string, any>;
}

interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  url: string;
  webVitals: WebVitalsMetric[];
  customMetrics: CustomMetric[];
  navigationTiming: PerformanceNavigationTiming;
  resourceTiming: PerformanceResourceTiming[];
}

class PerformanceMonitor {
  private sessionId: string;
  private metrics: CustomMetric[] = [];
  private webVitals: WebVitalsMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private reportInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeWebVitalsTracking();
    this.initializeResourceTiming();
    this.initializeNavigationTiming();
    this.startPeriodicReporting();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize Web Vitals tracking using web-vitals library
   */
  private initializeWebVitalsTracking() {
    // Check if web-vitals is available
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        // Dynamic import to avoid bundling issues
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          // Track Core Web Vitals
          getCLS(this.trackWebVital.bind(this));
          getFID(this.trackWebVital.bind(this));
          getFCP(this.trackWebVital.bind(this));
          getLCP(this.trackWebVital.bind(this));
          getTTFB(this.trackWebVital.bind(this));
        }).catch((error) => {
          console.warn('[PerformanceMonitor] web-vitals not available:', error);
          // Fallback to manual tracking
          this.initializeManualWebVitals();
        });
      } catch (error) {
        console.warn('[PerformanceMonitor] Failed to load web-vitals:', error);
        this.initializeManualWebVitals();
      }
    }
  }

  /**
   * Manual Web Vitals tracking as fallback
   */
  private initializeManualWebVitals() {
    // LCP (Largest Contentful Paint)
    this.observePerformanceEntry('largest-contentful-paint', (entry) => {
      this.trackWebVital({
        name: 'LCP',
        value: entry.startTime,
        rating: this.getRating('LCP', entry.startTime),
      });
    });

    // FID (First Input Delay) - requires user interaction
    this.observePerformanceEntry('first-input', (entry) => {
      this.trackWebVital({
        name: 'FID',
        value: (entry as any).processingStart - entry.startTime,
        rating: this.getRating('FID', (entry as any).processingStart - entry.startTime),
      });
    });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    this.observePerformanceEntry('layout-shift', (entry) => {
      if (!(entry as any).hadRecentInput) {
        clsValue += (entry as any).value;
      }
    });

    // Report CLS after page becomes hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.trackWebVital({
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('CLS', clsValue),
        });
      }
    });
  }

  /**
   * Initialize resource timing tracking
   */
  private initializeResourceTiming() {
    this.observePerformanceEntry('resource', (entry) => {
      const resourceEntry = entry as PerformanceResourceTiming;

      // Track slow resources (>1s)
      if (resourceEntry.duration > 1000) {
        this.trackMetric('slow_resource', resourceEntry.duration, 'ms', {
          url: resourceEntry.name,
          type: this.getResourceType(resourceEntry.initiatorType),
          size: resourceEntry.transferSize,
        });
      }

      // Track failed resources
      if (resourceEntry.transferSize === 0 && resourceEntry.decodedBodySize === 0) {
        this.trackMetric('failed_resource', 1, 'count', {
          url: resourceEntry.name,
          type: this.getResourceType(resourceEntry.initiatorType),
        });
      }
    });
  }

  /**
   * Initialize navigation timing tracking
   */
  private initializeNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const navEntry = navigationEntries[0];

        // Track navigation metrics
        this.trackMetric('dns_lookup', navEntry.domainLookupEnd - navEntry.domainLookupStart, 'ms');
        this.trackMetric('tcp_connect', navEntry.connectEnd - navEntry.connectStart, 'ms');
        this.trackMetric('server_response', navEntry.responseStart - navEntry.requestStart, 'ms');
        this.trackMetric('page_load', navEntry.loadEventEnd - navEntry.navigationStart, 'ms');
        this.trackMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart, 'ms');
      }
    }
  }

  /**
   * Generic performance observer helper
   */
  private observePerformanceEntry(
    entryType: string,
    callback: (entry: PerformanceEntry) => void
  ) {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(callback);
        });

        observer.observe({ entryTypes: [entryType] });
        this.observers.push(observer);
      } catch (error) {
        console.warn(`[PerformanceMonitor] Failed to observe ${entryType}:`, error);
      }
    }
  }

  /**
   * Track a Web Vital metric
   */
  private trackWebVital(metric: Omit<WebVitalsMetric, 'timestamp'>) {
    const webVital: WebVitalsMetric = {
      ...metric,
      timestamp: Date.now(),
      navigationType: this.getNavigationType(),
    };

    this.webVitals.push(webVital);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[WebVital] ${metric.name}: ${metric.value} (${metric.rating})`);
    }

    // Send to analytics service
    this.sendToAnalytics('web_vital', webVital);
  }

  /**
   * Track a custom metric
   */
  public trackMetric(
    name: string,
    value: number,
    unit: string,
    context?: Record<string, any>
  ) {
    const metric: CustomMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      context,
    };

    this.metrics.push(metric);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Metric] ${name}: ${value}${unit}`, context);
    }

    // Send to analytics service
    this.sendToAnalytics('custom_metric', metric);
  }

  /**
   * Track user interaction performance
   */
  public trackInteraction(name: string, startTime: number) {
    const duration = performance.now() - startTime;
    this.trackMetric(`interaction_${name}`, duration, 'ms');
  }

  /**
   * Track route change performance
   */
  public trackRouteChange(from: string, to: string, duration: number) {
    this.trackMetric('route_change', duration, 'ms', { from, to });
  }

  /**
   * Get performance rating for a metric
   */
  private getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Get navigation type
   */
  private getNavigationType(): string {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        return navigationEntries[0].type;
      }
    }
    return 'unknown';
  }

  /**
   * Get resource type from initiator type
   */
  private getResourceType(initiatorType: string): string {
    const typeMap: Record<string, string> = {
      'img': 'image',
      'script': 'javascript',
      'link': 'stylesheet',
      'xmlhttprequest': 'ajax',
      'fetch': 'fetch',
      'beacon': 'beacon',
    };

    return typeMap[initiatorType] || initiatorType || 'unknown';
  }

  /**
   * Send data to analytics service
   */
  private sendToAnalytics(type: string, data: any) {
    // In production, send to your analytics service
    if (import.meta.env.PROD) {
      try {
        // Example: Send to your analytics endpoint
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            data,
            sessionId: this.sessionId,
            timestamp: Date.now(),
          }),
        }).catch((error) => {
          console.warn('[PerformanceMonitor] Failed to send analytics:', error);
        });
      } catch (error) {
        console.warn('[PerformanceMonitor] Analytics error:', error);
      }
    }
  }

  /**
   * Generate and send performance report
   */
  private generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      webVitals: [...this.webVitals],
      customMetrics: [...this.metrics],
      navigationTiming: {} as PerformanceNavigationTiming,
      resourceTiming: [],
    };

    // Get navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        report.navigationTiming = navigationEntries[0];
      }

      // Get resource timing (last 100 entries to avoid too much data)
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      report.resourceTiming = resourceEntries.slice(-100);
    }

    return report;
  }

  /**
   * Start periodic reporting
   */
  private startPeriodicReporting() {
    // Report every 5 minutes in production
    const interval = import.meta.env.PROD ? 5 * 60 * 1000 : 60 * 1000; // 5min prod, 1min dev

    this.reportInterval = setInterval(() => {
      const report = this.generateReport();
      this.sendToAnalytics('performance_report', report);

      // Clear old metrics to prevent memory leaks
      this.metrics = this.metrics.filter(m => Date.now() - m.timestamp < 10 * 60 * 1000); // Keep last 10min
      this.webVitals = this.webVitals.filter(v => Date.now() - v.timestamp < 10 * 60 * 1000);
    }, interval);
  }

  /**
   * Clean up observers and intervals
   */
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    if (this.reportInterval) {
      clearInterval(this.reportInterval);
      this.reportInterval = null;
    }
  }

  /**
   * Get current performance summary
   */
  public getSummary() {
    const report = this.generateReport();

    return {
      sessionId: this.sessionId,
      webVitalsCount: report.webVitals.length,
      metricsCount: report.customMetrics.length,
      resourcesCount: report.resourceTiming.length,
      averageLCP: this.calculateAverage('LCP'),
      averageFID: this.calculateAverage('FID'),
      averageCLS: this.calculateAverage('CLS'),
    };
  }

  /**
   * Calculate average for a Web Vital
   */
  private calculateAverage(metricName: string): number | null {
    const metrics = this.webVitals.filter(v => v.name === metricName);
    if (metrics.length === 0) return null;

    const sum = metrics.reduce((acc, m) => acc + m.value, 0);
    return sum / metrics.length;
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export const getPerformanceMonitor = (): PerformanceMonitor => {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
};

export const trackInteraction = (name: string, startTime: number) => {
  getPerformanceMonitor().trackInteraction(name, startTime);
};

export const trackRouteChange = (from: string, to: string, duration: number) => {
  getPerformanceMonitor().trackRouteChange(from, to, duration);
};

// React hook for component-level performance tracking
export const usePerformanceTracking = () => {
  const trackInteraction = (name: string, startTime: number) => {
    getPerformanceMonitor().trackInteraction(name, startTime);
  };

  const trackMetric = (name: string, value: number, unit: string, context?: Record<string, any>) => {
    getPerformanceMonitor().trackMetric(name, value, unit, context);
  };

  return { trackInteraction, trackMetric };
};