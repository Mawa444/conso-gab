-- Activer PostGIS pour recherche spatiale performante
CREATE EXTENSION IF NOT EXISTS postgis;

-- Ajouter colonne geography pour recherches spatiales optimisées
-- (garde latitude/longitude pour compatibilité)
ALTER TABLE business_profiles 
ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Index spatial pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_business_profiles_location 
ON business_profiles USING GIST(location);

-- Trigger pour synchroniser lat/lng avec location geography
CREATE OR REPLACE FUNCTION sync_business_location()
RETURNS TRIGGER AS $$
BEGIN
  -- Si latitude et longitude sont définies, créer le point geography
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_business_location
BEFORE INSERT OR UPDATE ON business_profiles
FOR EACH ROW EXECUTE FUNCTION sync_business_location();

-- Fonction RPC: recherche d'entreprises dans un bbox (viewport)
CREATE OR REPLACE FUNCTION get_businesses_in_bbox(
  min_lng double precision,
  min_lat double precision,
  max_lng double precision,
  max_lat double precision,
  limit_count int DEFAULT 500
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
  latitude double precision,
  longitude double precision,
  is_verified boolean,
  is_active boolean
) AS $$
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
  WHERE bp.location IS NOT NULL
    AND bp.is_active = true
    AND bp.is_sleeping = false
    AND bp.location && ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)::geography
  ORDER BY bp.is_verified DESC, bp.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Fonction RPC: recherche d'entreprises les plus proches
CREATE OR REPLACE FUNCTION get_nearest_businesses(
  user_lat double precision,
  user_lng double precision,
  radius_meters int DEFAULT 20000,
  limit_count int DEFAULT 100
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
  latitude double precision,
  longitude double precision,
  distance_meters double precision,
  is_verified boolean,
  is_active boolean
) AS $$
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
    ST_Distance(
      bp.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    bp.is_verified,
    bp.is_active
  FROM business_profiles bp
  WHERE bp.location IS NOT NULL
    AND bp.is_active = true
    AND bp.is_sleeping = false
    AND ST_DWithin(
      bp.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC, bp.is_verified DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Mise à jour des données existantes pour remplir location
UPDATE business_profiles 
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL 
  AND longitude IS NOT NULL 
  AND location IS NULL;