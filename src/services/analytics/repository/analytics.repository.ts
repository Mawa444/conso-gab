/**
 * Analytics Repository
 * Couche d'accès aux données analytics (abstraction Supabase)
 */

import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEventData {
  business_id: string;
  user_id?: string;
  event_type: string;
  event_category?: string;
  target_id?: string;
  metadata?: Record<string, any>;
  user_location_city?: string;
  user_location_country?: string;
  device_type?: string;
  referrer_source?: string;
  session_id?: string;
  user_agent?: string;
}

export interface AnalyticsSummaryData {
  business_id: string;
  date: string;
  total_views: number;
  unique_visitors: number;
  total_likes: number;
  total_clicks: number;
  total_conversions: number;
  engagement_rate: number;
  conversion_rate: number;
}

export class AnalyticsRepository {
  /**
   * Insère un événement analytics
   */
  static async insertEvent(event: AnalyticsEventData): Promise<void> {
    const { error } = await (supabase as any)
      .from('business_analytics_events')
      .insert(event);

    if (error) {
      throw new Error(`Failed to insert analytics event: ${error.message}`);
    }
  }

  /**
   * Insère plusieurs événements en batch
   */
  static async insertEvents(events: AnalyticsEventData[]): Promise<void> {
    if (events.length === 0) return;

    const { error } = await (supabase as any)
      .from('business_analytics_events')
      .insert(events);

    if (error) {
      throw new Error(`Failed to insert analytics events: ${error.message}`);
    }
  }

  /**
   * Récupère le résumé analytics pour une période
   */
  static async getSummary(
    businessId: string,
    startDate: string,
    endDate: string
  ): Promise<AnalyticsSummaryData[]> {
    const { data, error } = await (supabase as any)
      .from('business_analytics_summary')
      .select('*')
      .eq('business_id', businessId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analytics summary: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Récupère les événements récents
   */
  static async getRecentEvents(
    businessId: string,
    limit: number = 100
  ): Promise<any[]> {
    const { data, error } = await (supabase as any)
      .from('business_analytics_events')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch recent events: ${error.message}`);
    }

    return data || [];
  }
}
