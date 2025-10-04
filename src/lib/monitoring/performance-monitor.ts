/**
 * ============================================
 * PERFORMANCE MONITORING
 * ============================================
 * Monitore les Core Web Vitals et autres métriques de performance
 */

import { errorTracker } from './error-tracker';

export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;

  /**
   * Initialise le monitoring des Web Vitals
   */
  init() {
    if (typeof window === 'undefined') return;

    // Monitor LCP (Largest Contentful Paint)
    this.observeLCP();

    // Monitor FID (First Input Delay) / INP (Interaction to Next Paint)
    this.observeINP();

    // Monitor CLS (Cumulative Layout Shift)
    this.observeCLS();

    // Monitor resource loading
    this.observeResources();

    // Monitor long tasks
    this.observeLongTasks();
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          errorTracker.trackPerformance({
            name: 'LCP',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            metadata: {
              element: (lastEntry as any).element?.tagName,
              url: (lastEntry as any).url,
            },
          });
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }
  }

  /**
   * Observe Interaction to Next Paint
   */
  private observeINP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (entry.duration > 200) {
            errorTracker.trackPerformance({
              name: 'INP',
              value: entry.duration,
              timestamp: Date.now(),
              metadata: {
                type: entry.name,
                target: entry.target,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['event'] });
    } catch (e) {
      console.warn('INP observation not supported');
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS() {
    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }

        errorTracker.trackPerformance({
          name: 'CLS',
          value: clsValue,
          timestamp: Date.now(),
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  /**
   * Observe resource loading times
   */
  private observeResources() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          // Alert sur les ressources lentes (> 1s)
          if (entry.duration > 1000) {
            errorTracker.trackPerformance({
              name: 'Slow Resource',
              value: entry.duration,
              timestamp: Date.now(),
              metadata: {
                url: entry.name,
                type: entry.initiatorType,
                size: entry.transferSize,
              },
            });
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    } catch (e) {
      console.warn('Resource observation not supported');
    }
  }

  /**
   * Observe long tasks (> 50ms)
   */
  private observeLongTasks() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          errorTracker.trackPerformance({
            name: 'Long Task',
            value: entry.duration,
            timestamp: Date.now(),
            metadata: {
              startTime: entry.startTime,
            },
          });
        });
      });

      observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      console.warn('Long task observation not supported');
    }
  }

  /**
   * Récupère les navigation timings
   */
  getNavigationTimings() {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (!navigation) return null;

    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart,
    };
  }

  /**
   * Récupère les métriques mémoire (Chrome uniquement)
   */
  getMemoryInfo() {
    const memory = (performance as any).memory;
    
    if (!memory) return null;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }

  /**
   * Log un rapport de performance complet
   */
  logPerformanceReport() {
    console.group('📊 Performance Report');
    
    const timings = this.getNavigationTimings();
    if (timings) {
      console.table(timings);
    }

    const memory = this.getMemoryInfo();
    if (memory) {
      console.log('Memory:', memory);
    }

    console.log('Metrics:', errorTracker.getPerformanceMetrics());
    console.groupEnd();
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-init en production
if (typeof window !== 'undefined' && !import.meta.env.DEV) {
  performanceMonitor.init();
}
