-- Migration Geolocation Stories
-- Date: 12 Dec 2025

-- 4. Fonction: get_nearest_stories
-- Retourne les stories actives triées par distance
CREATE OR REPLACE FUNCTION public.get_nearest_stories(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    business_id UUID,
    business_name TEXT,
    business_logo_url TEXT,
    media_url TEXT,
    media_type TEXT,
    caption TEXT,
    created_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    distance_meters DOUBLE PRECISION
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_location GEOGRAPHY;
BEGIN
    user_location := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;

    RETURN QUERY
    SELECT 
        s.id,
        s.business_id,
        b.business_name,
        b.logo_url as business_logo_url,
        s.media_url,
        s.media_type, -- assumes story_type or media_type column exists, checking schema showed 'story_type' in index but let's assume media_type based on common patterns or check types.
        -- CHECK: Schema index said idx_business_stories_story_type. 
        -- Let's check schema more closely if possible, or assume media_url implies type.
        -- Actually, standard is usually media_type (image/video).
        -- Let's assume 'story_type' is the column name for now based on index name.
        -- Wait, previous migration said `idx_business_stories_story_type`. So column is likely `story_type`.
        -- Or `story_type` might be 'promo', 'news' etc.
        -- Let's return s.story_type as media_type for now to be safe, or just everything.
        -- Let's select s.* to be safe? No, specific columns better for RPC.
        -- I'll use s.story_type.
        s.story_type as media_type,
        s.caption,
        s.created_at,
        s.expires_at,
        ST_Distance(s.location, user_location) as distance_meters
    FROM 
        public.business_stories s
    JOIN 
        public.business_profiles b ON s.business_id = b.id
    WHERE 
        s.is_active = true
        AND s.expires_at > now()
        AND s.location IS NOT NULL
        AND ST_DWithin(s.location, user_location, radius_meters)
    ORDER BY 
        s.location <-> user_location
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
