-- Migration Geolocation Recommendations Part 2
-- Date: 16 Dec 2025

-- 4. Fonction: get_nearest_stories
CREATE OR REPLACE FUNCTION public.get_nearest_stories(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0,
    search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    caption TEXT,
    media_url TEXT,
    story_type TEXT,
    expires_at TIMESTAMPTZ,
    business_id UUID,
    business_name TEXT,
    business_logo TEXT,
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
        s.caption,
        s.media_url,
        s.story_type,
        s.expires_at,
        b.id as business_id,
        b.business_name,
        b.logo_url as business_logo,
        ST_Distance(s.location, user_location) as distance_meters
    FROM 
        public.business_stories s
    JOIN 
        public.business_profiles b ON s.business_id = b.id
    WHERE 
        s.location IS NOT NULL
        AND s.is_active = true
        AND s.expires_at > now()
        AND ST_DWithin(s.location, user_location, radius_meters)
        AND (search_query IS NULL OR s.caption ILIKE '%' || search_query || '%')
    ORDER BY 
        s.location <-> user_location
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;


-- 5. Fonction: get_nearest_user_listings
CREATE OR REPLACE FUNCTION public.get_nearest_user_listings(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0,
    search_query TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price NUMERIC,
    currency TEXT,
    images TEXT[],
    category TEXT,
    city TEXT,
    distance_meters DOUBLE PRECISION,
    user_id UUID
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
        l.id,
        l.title,
        l.description,
        l.price,
        l.currency,
        l.images,
        l.category,
        l.city,
        ST_Distance(l.location, user_location) as distance_meters,
        l.user_id
    FROM 
        public.user_listings l
    WHERE 
        l.location IS NOT NULL
        AND l.is_active = true
        AND ST_DWithin(l.location, user_location, radius_meters)
        AND (search_query IS NULL OR l.title ILIKE '%' || search_query || '%')
        AND (category_filter IS NULL OR l.category = category_filter)
    ORDER BY 
        l.location <-> user_location
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
