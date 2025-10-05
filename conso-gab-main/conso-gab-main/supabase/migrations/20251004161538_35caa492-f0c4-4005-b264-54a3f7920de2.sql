-- Supprimer toutes les versions existantes des fonctions problématiques
DROP FUNCTION IF EXISTS public.get_nearest_businesses(double precision, double precision, integer, integer);
DROP FUNCTION IF EXISTS public.get_nearest_businesses(numeric, numeric, numeric, integer);
DROP FUNCTION IF EXISTS public.get_businesses_in_bbox(double precision, double precision, double precision, double precision, integer);
DROP FUNCTION IF EXISTS public.get_businesses_in_bbox(numeric, numeric, numeric, numeric, integer);

-- Créer une seule version propre de get_nearest_businesses
CREATE OR REPLACE FUNCTION public.get_nearest_businesses(
  user_lat double precision,
  user_lng double precision,
  radius_meters integer DEFAULT 50000,
  limit_count integer DEFAULT 20
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
  distance_meters double precision
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
      ST_MakePoint(bp.longitude::double precision, bp.latitude::double precision)::geography
    ) as distance_meters
  FROM business_profiles bp
  WHERE 
    bp.is_active = true
    AND bp.is_sleeping = false
    AND bp.is_deactivated = false
    AND bp.latitude IS NOT NULL
    AND bp.longitude IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint(user_lng, user_lat)::geography,
      ST_MakePoint(bp.longitude::double precision, bp.latitude::double precision)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT limit_count;
END;
$$;

-- Créer une seule version propre de get_businesses_in_bbox
CREATE OR REPLACE FUNCTION public.get_businesses_in_bbox(
  min_lng double precision,
  min_lat double precision,
  max_lng double precision,
  max_lat double precision,
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
  WHERE 
    bp.is_active = true
    AND bp.is_sleeping = false
    AND bp.is_deactivated = false
    AND bp.latitude IS NOT NULL
    AND bp.longitude IS NOT NULL
    AND bp.latitude BETWEEN min_lat AND max_lat
    AND bp.longitude BETWEEN min_lng AND max_lng
  LIMIT limit_count;
END;
$$;