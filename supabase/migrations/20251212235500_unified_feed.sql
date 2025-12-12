-- Migration Unified Roaming Feed
-- Date: 12 Dec 2025

-- 5. FUNCTION: get_unified_feed
-- Aggregates:
-- 1. Active Stories (24h)
-- 2. User Listings (C2C)
-- 3. Business Profiles (Promoted/Active)
-- Sorted by Distance first, then Freshness.

CREATE OR REPLACE FUNCTION public.get_unified_feed(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    item_type TEXT, -- 'story', 'listing', 'business'
    id UUID,
    title TEXT,
    subtitle TEXT, -- Description or Category
    image_url TEXT,
    distance_meters DOUBLE PRECISION,
    created_at TIMESTAMPTZ,
    data JSONB -- Full payload for details
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_location GEOGRAPHY;
BEGIN
    user_location := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;

    RETURN QUERY
    WITH combined_data AS (
        -- 1. STORIES (High Priority)
        SELECT 
            'story'::TEXT as item_type,
            s.id,
            COALESCE(s.caption, 'Story') as title,
            b.business_name as subtitle,
            COALESCE(s.media_url, b.logo_url) as image_url,
            ST_Distance(s.location, user_location) as distance_meters,
            s.created_at,
            jsonb_build_object(
                'business_id', s.business_id,
                'media_type', s.story_type,  -- Using story_type as media_type based on prev discussions
                'expires_at', s.expires_at,
                'business_name', b.business_name,
                'business_logo', b.logo_url
            ) as data
        FROM public.business_stories s
        JOIN public.business_profiles b ON s.business_id = b.id
        WHERE s.is_active = true 
          AND s.expires_at > now()
          AND s.location IS NOT NULL
          AND ST_DWithin(s.location, user_location, radius_meters)

        UNION ALL

        -- 2. USER LISTINGS (C2C)
        SELECT 
            'listing'::TEXT as item_type,
            l.id,
            l.title,
            l.price || ' ' || COALESCE(l.currency, 'XAF') as subtitle,
            l.images[1] as image_url,
            ST_Distance(l.location, user_location) as distance_meters,
            l.created_at,
            jsonb_build_object(
                'price', l.price,
                'currency', l.currency,
                'user_id', l.user_id,
                'city', l.city
            ) as data
        FROM public.user_listings l
        WHERE l.is_active = true
          AND l.location IS NOT NULL
          AND ST_DWithin(l.location, user_location, radius_meters)

        UNION ALL

        -- 3. BUSINESSES (Discovery)
        -- We take a random sample or sorted by rating? 
        -- For 'Feed', we probably want 'New Businesses' or just 'Nearby'.
        SELECT 
            'business'::TEXT as item_type,
            b.id,
            b.business_name as title,
            b.business_category as subtitle,
            COALESCE(b.cover_image_url, b.logo_url) as image_url,
            ST_Distance(b.location, user_location) as distance_meters,
            b.created_at, -- Or updated_at?
            jsonb_build_object(
                'rating', 4.5, -- Mock for now or real
                'verified', b.is_verified,
                'slug', b.slug
            ) as data
        FROM public.business_profiles b
        WHERE b.location IS NOT NULL
          AND ST_DWithin(b.location, user_location, radius_meters)
          AND b.is_active = true
    )
    SELECT 
        item_type,
        id,
        title,
        subtitle,
        image_url,
        distance_meters,
        created_at,
        data
    FROM combined_data
    ORDER BY distance_meters ASC, created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
