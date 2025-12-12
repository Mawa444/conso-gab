-- Migration Geolocation Recommendations
-- Date: 12 Dec 2025

-- 1. Fonction: get_nearest_businesses
-- Retourne les entreprises triées par distance
CREATE OR REPLACE FUNCTION public.get_nearest_businesses(
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
    business_name TEXT,
    business_category TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    city TEXT,
    slug TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
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
        b.id,
        b.business_name,
        b.business_category,
        b.logo_url,
        b.cover_image_url,
        b.city,
        b.slug,
        b.latitude,
        b.longitude,
        ST_Distance(b.location, user_location) as distance_meters
    FROM 
        public.business_profiles b
    WHERE 
        b.location IS NOT NULL
        AND ST_DWithin(b.location, user_location, radius_meters)
        AND (search_query IS NULL OR b.business_name ILIKE '%' || search_query || '%')
        AND (category_filter IS NULL OR b.business_category = category_filter)
    ORDER BY 
        b.location <-> user_location -- Opérateur de distance PostGIS optimisé (Index GIST)
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;


-- 2. Fonction: get_nearest_catalogs
-- Retourne les catalogues actifs triés par distance de l'entreprise
CREATE OR REPLACE FUNCTION public.get_nearest_catalogs(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0,
    search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT, -- name dans la table catalogs
    description TEXT,
    cover_image TEXT, -- image_url
    business_id UUID,
    business_name TEXT,
    business_city TEXT,
    distance_meters DOUBLE PRECISION,
    product_count BIGINT
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
        c.id,
        c.name as title,
        c.description,
        c.image_url as cover_image,
        b.id as business_id,
        b.business_name,
        b.city as business_city,
        ST_Distance(b.location, user_location) as distance_meters,
        (SELECT count(*) FROM public.catalog_products cp WHERE cp.catalog_id = c.id) as product_count
    FROM 
        public.catalogs c
    JOIN 
        public.business_profiles b ON c.business_id = b.id
    WHERE 
        b.location IS NOT NULL
        AND c.is_active = true
        AND c.visibility = 'public'
        AND ST_DWithin(b.location, user_location, radius_meters)
        AND (search_query IS NULL OR c.name ILIKE '%' || search_query || '%')
    ORDER BY 
        b.location <-> user_location
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;


-- 3. Fonction: get_nearest_products
-- Retourne les produits actifs triés par distance
CREATE OR REPLACE FUNCTION public.get_nearest_products(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 50000,
    limit_count INT DEFAULT 20,
    offset_count INT DEFAULT 0,
    search_query TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    price NUMERIC,
    image_url TEXT,
    catalog_id UUID,
    business_id UUID,
    business_name TEXT,
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
        cp.id,
        cp.name,
        cp.description,
        cp.price,
        cp.image_url,
        c.id as catalog_id,
        b.id as business_id,
        b.business_name,
        ST_Distance(b.location, user_location) as distance_meters
    FROM 
        public.catalog_products cp
    JOIN 
        public.catalogs c ON cp.catalog_id = c.id
    JOIN 
        public.business_profiles b ON c.business_id = b.id
    WHERE 
        b.location IS NOT NULL
        AND c.is_active = true
        AND c.visibility = 'public' -- Important: produit visible seulement si catalogue public
        AND ST_DWithin(b.location, user_location, radius_meters)
        AND (search_query IS NULL OR cp.name ILIKE '%' || search_query || '%')
    ORDER BY 
        b.location <-> user_location
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;
