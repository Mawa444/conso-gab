-- Migration C2C User Listings
-- Date: 12 Dec 2025

-- 1. Table: user_listings
CREATE TABLE IF NOT EXISTS public.user_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'XAF',
    images TEXT[] DEFAULT '{}',
    category TEXT NOT NULL, -- e.g., 'vehicle', 'electronics', 'fashion', 'home', 'other'
    condition TEXT DEFAULT 'good', -- 'new', 'like_new', 'good', 'fair'
    location GEOGRAPHY(Point, 4326),
    city TEXT,
    is_active BOOLEAN DEFAULT true,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_user_listings_user_id ON public.user_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_listings_location ON public.user_listings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_user_listings_category ON public.user_listings(category);
CREATE INDEX IF NOT EXISTS idx_user_listings_active ON public.user_listings(is_active) WHERE is_active = true;

-- 3. RLS
ALTER TABLE public.user_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public listings are viewable by everyone" 
ON public.user_listings FOR SELECT 
USING (is_active = true);

CREATE POLICY "Users can insert their own listings" 
ON public.user_listings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings" 
ON public.user_listings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings" 
ON public.user_listings FOR DELETE 
USING (auth.uid() = user_id);

-- 4. RPC: get_nearest_user_listings
CREATE OR REPLACE FUNCTION public.get_nearest_user_listings(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0,
    search_query TEXT DEFAULT NULL,
    category_filter TEXT DEFAULT NULL,
    min_price NUMERIC DEFAULT NULL,
    max_price NUMERIC DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    price NUMERIC,
    currency TEXT,
    images TEXT[],
    category TEXT,
    condition TEXT,
    city TEXT,
    user_id UUID,
    user_full_name TEXT,
    user_avatar_url TEXT,
    created_at TIMESTAMPTZ,
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
        l.id,
        l.title,
        l.description,
        l.price,
        l.currency,
        l.images,
        l.category,
        l.condition,
        l.city,
        l.user_id,
        p.full_name as user_full_name,
        p.avatar_url as user_avatar_url,
        l.created_at,
        ST_Distance(l.location, user_location) as distance_meters
    FROM 
        public.user_listings l
    JOIN 
        public.profiles p ON l.user_id = p.id
    WHERE 
        l.is_active = true
        AND l.location IS NOT NULL
        AND ST_DWithin(l.location, user_location, radius_meters)
        AND (search_query IS NULL OR l.title ILIKE '%' || search_query || '%' OR l.description ILIKE '%' || search_query || '%')
        AND (category_filter IS NULL OR l.category = category_filter)
        AND (min_price IS NULL OR l.price >= min_price)
        AND (max_price IS NULL OR l.price <= max_price)
    ORDER BY 
        l.location <-> user_location
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
