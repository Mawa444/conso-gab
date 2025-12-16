/**
 * Analytics Facade
 * API simplifiée pour le tracking (remplace AnalyticsService)
 */

import { EventTracker } from './event-tracker';
import { AnalyticsRepository } from './repository/analytics.repository';

export class Analytics {
  /**
   * Track profile view
   */
  static trackProfileView(businessId: string, metadata?: Record<string, any>): void {
    EventTracker.track({
      business_id: businessId,
      event_type: 'VIEW',
      event_category: 'PROFILE',
      metadata,
    });
  }

  /**
   * Track catalog view
   */
  static trackCatalogView(businessId: string, catalogId: string, metadata?: Record<string, any>): void {
    EventTracker.track({
      business_id: businessId,
      event_type: 'VIEW',
      event_category: 'CATALOG',
      target_id: catalogId,
      metadata,
    });
  }

  /**
   * Track click
   */
  static trackClick(businessId: string, clickTarget: string, metadata?: Record<string, any>): void {
    EventTracker.track({
      business_id: businessId,
      event_type: 'CLICK',
      metadata: {
        ...metadata,
        click_target: clickTarget,
      },
    });
  }

  /**
   * Track conversion
   */
  static trackConversion(businessId: string, conversionType: string, metadata?: Record<string, any>): void {
    EventTracker.track({
      business_id: businessId,
      event_type: 'CONVERSION',
      event_category: 'CONTACT',
      metadata: {
        ...metadata,
        conversion_type: conversionType,
      },
    });
  }

  /**
   * Get analytics summary
   */
  static async getSummary(businessId: string, startDate: string, endDate: string) {
    return AnalyticsRepository.getSummary(businessId, startDate, endDate);
  }

  /**
   * Get recent events
   */
  static async getRecentEvents(businessId: string, limit?: number) {
    return AnalyticsRepository.getRecentEvents(businessId, limit);
  }

  /**
   * Flush pending events
   */
  static async flush(): Promise<void> {
    await EventTracker.flush();
  }
}

// Export pour compatibilité
export { EventTracker, AnalyticsRepository };
