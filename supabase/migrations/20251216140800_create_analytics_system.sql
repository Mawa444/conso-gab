-- Migration: Create Business Analytics System
-- Description: Tables for tracking business performance metrics (views, engagement, conversions)

-- ============================================
-- 1. Main Analytics Events Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Event classification
  event_type TEXT NOT NULL, -- 'VIEW', 'LIKE', 'COMMENT', 'SHARE', 'CLICK', 'CONVERSION'
  event_category TEXT, -- 'PROFILE', 'CATALOG', 'IMAGE', 'CONTACT'
  target_id UUID, -- ID of catalog/image/etc
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Demographics
  user_location_city TEXT,
  user_location_country TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  referrer_source TEXT, -- 'direct', 'search', 'social', 'share'
  
  -- Session tracking
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_business_date 
  ON public.business_analytics_events(business_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type 
  ON public.business_analytics_events(event_type, business_id);

CREATE INDEX IF NOT EXISTS idx_analytics_target 
  ON public.business_analytics_events(target_id, event_type) 
  WHERE target_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_user 
  ON public.business_analytics_events(user_id, created_at DESC) 
  WHERE user_id IS NOT NULL;

-- ============================================
-- 2. Daily Summary Table (Pre-aggregated)
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  
  -- Daily metrics
  total_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  total_impressions INT DEFAULT 0,
  total_likes INT DEFAULT 0,
  total_comments INT DEFAULT 0,
  total_shares INT DEFAULT 0,
  total_clicks INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  
  -- Calculated rates
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(business_id, date)
);

CREATE INDEX IF NOT EXISTS idx_summary_business_date 
  ON public.business_analytics_summary(business_id, date DESC);

-- ============================================
-- 3. RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE public.business_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_analytics_summary ENABLE ROW LEVEL SECURITY;

-- Analytics Events Policies
CREATE POLICY "Anyone can insert analytics events" 
  ON public.business_analytics_events 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Business owners can view their analytics" 
  ON public.business_analytics_events 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
  );

-- Summary Policies
CREATE POLICY "Business owners can view their summary" 
  ON public.business_analytics_summary 
  FOR SELECT 
  USING (
    business_id IN (
      SELECT id FROM public.business_profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 4. Helper Functions
-- ============================================

-- Function to update daily summary
CREATE OR REPLACE FUNCTION public.update_analytics_summary()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.business_analytics_summary (
    business_id,
    date,
    total_views,
    total_likes,
    total_clicks,
    total_conversions
  )
  VALUES (
    NEW.business_id,
    DATE(NEW.created_at),
    CASE WHEN NEW.event_type = 'VIEW' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'LIKE' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'CLICK' THEN 1 ELSE 0 END,
    CASE WHEN NEW.event_type = 'CONVERSION' THEN 1 ELSE 0 END
  )
  ON CONFLICT (business_id, date) 
  DO UPDATE SET
    total_views = business_analytics_summary.total_views + 
      CASE WHEN NEW.event_type = 'VIEW' THEN 1 ELSE 0 END,
    total_likes = business_analytics_summary.total_likes + 
      CASE WHEN NEW.event_type = 'LIKE' THEN 1 ELSE 0 END,
    total_clicks = business_analytics_summary.total_clicks + 
      CASE WHEN NEW.event_type = 'CLICK' THEN 1 ELSE 0 END,
    total_conversions = business_analytics_summary.total_conversions + 
      CASE WHEN NEW.event_type = 'CONVERSION' THEN 1 ELSE 0 END,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update summary
DROP TRIGGER IF EXISTS trigger_update_analytics_summary ON public.business_analytics_events;
CREATE TRIGGER trigger_update_analytics_summary
  AFTER INSERT ON public.business_analytics_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_analytics_summary();

-- ============================================
-- 5. Grant Permissions
-- ============================================
GRANT SELECT, INSERT ON public.business_analytics_events TO authenticated;
GRANT SELECT, INSERT ON public.business_analytics_events TO anon;
GRANT SELECT ON public.business_analytics_summary TO authenticated;
