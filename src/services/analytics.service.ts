import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  business_id: string;
  user_id?: string;
  event_type: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE' | 'CLICK' | 'CONVERSION';
  event_category?: 'PROFILE' | 'CATALOG' | 'IMAGE' | 'CONTACT';
  target_id?: string;
  metadata?: Record<string, any>;
  user_location_city?: string;
  user_location_country?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  referrer_source?: 'direct' | 'search' | 'social' | 'share';
}

export interface AnalyticsSummary {
  date: string;
  total_views: number;
  unique_visitors: number;
  total_likes: number;
  total_clicks: number;
  total_conversions: number;
  engagement_rate: number;
  conversion_rate: number;
}

export class AnalyticsService {
  /**
   * Track a generic analytics event
   */
  static async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Get device type from user agent
      const deviceType = this.getDeviceType();
      
      // Get current user if authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('business_analytics_events').insert({
        ...event,
        user_id: user?.id || event.user_id,
        device_type: event.device_type || deviceType,
        session_id: this.getSessionId(),
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      // Don't throw - analytics should never break the app
    }
  }

  /**
   * Track profile view
   */
  static async trackProfileView(businessId: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      business_id: businessId,
      event_type: 'VIEW',
      event_category: 'PROFILE',
      metadata,
    });
  }

  /**
   * Track catalog view
   */
  static async trackCatalogView(businessId: string, catalogId: string, metadata?: Record<string, any>): Promise<void> {
    await this.trackEvent({
      business_id: businessId,
      event_type: 'VIEW',
      event_category: 'CATALOG',
      target_id: catalogId,
      metadata,
    });
  }

  /**
   * Track interaction (like, comment, share)
   */
  static async trackInteraction(
    type: 'LIKE' | 'COMMENT' | 'SHARE',
    businessId: string,
    category: 'PROFILE' | 'CATALOG' | 'IMAGE',
    targetId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      business_id: businessId,
      event_type: type,
      event_category: category,
      target_id: targetId,
      metadata,
    });
  }

  /**
   * Track conversion (call, message, order)
   */
  static async trackConversion(
    businessId: string,
    conversionType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
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
   * Track click (button, link)
   */
  static async trackClick(
    businessId: string,
    clickTarget: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      business_id: businessId,
      event_type: 'CLICK',
      metadata: {
        ...metadata,
        click_target: clickTarget,
      },
    });
  }

  /**
   * Get analytics summary for a business
   */
  static async getAnalyticsSummary(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<AnalyticsSummary[]> {
    const { data, error } = await supabase
      .from('business_analytics_summary')
      .select('*')
      .eq('business_id', businessId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching analytics summary:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get real-time analytics (last 24h)
   */
  static async getRealTimeAnalytics(businessId: string) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data, error } = await supabase
      .from('business_analytics_events')
      .select('event_type, event_category, created_at')
      .eq('business_id', businessId)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching real-time analytics:', error);
      return [];
    }

    return data || [];
  }

  // Helper methods
  private static getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }
}
