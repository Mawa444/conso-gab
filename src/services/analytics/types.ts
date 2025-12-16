// Temporary type fix until Supabase types are regenerated
// This file adds missing analytics table types

export interface BusinessAnalyticsEvent {
  id: string;
  business_id: string;
  user_id?: string;
  event_type: 'VIEW' | 'LIKE' | 'COMMENT' | 'SHARE' | 'CLICK' | 'CONVERSION';
  event_category?: 'PROFILE' | 'CATALOG' | 'IMAGE' | 'CONTACT';
  target_id?: string;
  metadata?: any;
  user_location_city?: string;
  user_location_country?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  referrer_source?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface BusinessAnalyticsSummary {
  id: string;
  business_id: string;
  date: string;
  total_views: number;
  unique_visitors: number;
  total_impressions: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  total_clicks: number;
  total_conversions: number;
  engagement_rate: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
}

// Extend Supabase Database type
declare module '@/integrations/supabase/client' {
  interface Database {
    public: {
      Tables: {
        business_analytics_events: {
          Row: BusinessAnalyticsEvent;
          Insert: Omit<BusinessAnalyticsEvent, 'id' | 'created_at'>;
          Update: Partial<Omit<BusinessAnalyticsEvent, 'id' | 'created_at'>>;
        };
        business_analytics_summary: {
          Row: BusinessAnalyticsSummary;
          Insert: Omit<BusinessAnalyticsSummary, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<BusinessAnalyticsSummary, 'id' | 'created_at' | 'updated_at'>>;
        };
      };
    };
  }
}
