-- ============================================
-- CORRECTION DES FONCTIONS RPC POSTGIS
-- ============================================

-- Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS get_businesses_in_bbox(numeric, numeric, numeric, numeric, integer);
DROP FUNCTION IF EXISTS get_nearest_businesses(numeric, numeric, numeric, integer);

-- ============================================
-- Fonction 1: get_businesses_in_bbox
-- Retourne les entreprises dans un rectangle (bbox)
-- ============================================
CREATE OR REPLACE FUNCTION get_businesses_in_bbox(
  min_lng numeric,
  min_lat numeric,
  max_lng numeric,
  max_lat numeric,
  limit_count integer DEFAULT 500
)
RETURNS TABLE (
  id uuid,
  business_name text,
  business_category text,
  description text,
  address text,
  city text,
  phone text,
  email text,
  logo_url text,
  latitude numeric,
  longitude numeric,
  is_verified boolean,
  is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.business_name,
    bp.business_category::text,
    bp.description,
    bp.address,
    bp.city,
    bp.phone,
    bp.email,
    bp.logo_url,
    bp.latitude,
    bp.longitude,
    bp.is_verified,
    bp.is_active
  FROM business_profiles bp
  WHERE bp.latitude IS NOT NULL 
    AND bp.longitude IS NOT NULL
    AND bp.is_active = true
    AND bp.is_sleeping = false
    AND bp.is_deactivated = false
    AND bp.latitude BETWEEN min_lat AND max_lat
    AND bp.longitude BETWEEN min_lng AND max_lng
  ORDER BY bp.is_verified DESC, bp.created_at DESC
  LIMIT limit_count;
END;
$$;

-- ============================================
-- Fonction 2: get_nearest_businesses
-- Retourne les entreprises les plus proches avec distance
-- ============================================
CREATE OR REPLACE FUNCTION get_nearest_businesses(
  user_lat numeric,
  user_lng numeric,
  radius_meters numeric DEFAULT 20000,
  limit_count integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  business_name text,
  business_category text,
  description text,
  address text,
  city text,
  phone text,
  email text,
  logo_url text,
  latitude numeric,
  longitude numeric,
  is_verified boolean,
  is_active boolean,
  distance_meters numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.business_name,
    bp.business_category::text,
    bp.description,
    bp.address,
    bp.city,
    bp.phone,
    bp.email,
    bp.logo_url,
    bp.latitude,
    bp.longitude,
    bp.is_verified,
    bp.is_active,
    ST_Distance(
      ST_MakePoint(user_lng, user_lat)::geography,
      ST_MakePoint(bp.longitude, bp.latitude)::geography
    ) as distance_meters
  FROM business_profiles bp
  WHERE bp.latitude IS NOT NULL 
    AND bp.longitude IS NOT NULL
    AND bp.is_active = true
    AND bp.is_sleeping = false
    AND bp.is_deactivated = false
    AND ST_DWithin(
      ST_MakePoint(user_lng, user_lat)::geography,
      ST_MakePoint(bp.longitude, bp.latitude)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT limit_count;
END;
$$;