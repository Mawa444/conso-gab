-- DATA REPAIR AND SCHEMA STABILIZATION v3
-- This script fixes missing tables and functions identified during debugging.
-- CHANGELOG: Added PostGIS extension enabling.

-- 00. Enable PostGIS extension (REQUIRED FOR GEOLOCATION)
CREATE EXTENSION IF NOT EXISTS postgis SCHEMA public;

-- 0. Create business_profiles table (FOUNDATIONAL)
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  business_name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  
  -- Contact & Location
  address TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'Gabon',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location geography(Point, 4326), -- PostGIS column
  
  phone TEXT,
  email TEXT,
  website TEXT,
  whatsapp TEXT,
  
  -- Media
  logo_url TEXT,
  cover_url TEXT,
  cover_image_url TEXT, -- Handling legacy/dual naming if needed, ideally consolidated
  carousel_images TEXT[],
  
  -- Settings & Flags
  opening_hours JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  is_sleeping BOOLEAN DEFAULT false,
  deactivation_scheduled_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for PostGIS location
CREATE INDEX IF NOT EXISTS idx_business_profiles_location ON public.business_profiles USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_category ON public.business_profiles(category);

-- RLS for business_profiles
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active businesses" ON public.business_profiles;
CREATE POLICY "Public can view active businesses" ON public.business_profiles 
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Owners can manage their business" ON public.business_profiles;
CREATE POLICY "Owners can manage their business" ON public.business_profiles 
  FOR ALL USING (user_id = auth.uid() OR owner_id = auth.uid());


-- 1. Ensure profile_image_likes has correct schema
CREATE TABLE IF NOT EXISTS public.profile_image_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('avatar', 'cover')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_user_id, image_type)
);

-- RLS for profile_image_likes
ALTER TABLE public.profile_image_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view profile likes" ON public.profile_image_likes;
CREATE POLICY "Public can view profile likes" ON public.profile_image_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their profile likes" ON public.profile_image_likes;
CREATE POLICY "Users can manage their profile likes" ON public.profile_image_likes FOR ALL USING (user_id = auth.uid());


-- 2. Create missing business_image_likes table
CREATE TABLE IF NOT EXISTS public.business_image_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('logo', 'cover')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id, image_type)
);

-- RLS for business_image_likes
ALTER TABLE public.business_image_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view business likes" ON public.business_image_likes;
CREATE POLICY "Public can view business likes" ON public.business_image_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their business likes" ON public.business_image_likes;
CREATE POLICY "Users can manage their business likes" ON public.business_image_likes FOR ALL USING (user_id = auth.uid());


-- 3. Restore get_unified_profiles_batch RPC
CREATE OR REPLACE FUNCTION public.get_unified_profiles_batch(p_user_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB := '{}'::JSONB;
  user_rec RECORD;
BEGIN
  FOR user_rec IN
    SELECT 
      COALESCE(p.user_id, up.user_id) as user_id,
      COALESCE(p.display_name, p.first_name || ' ' || p.last_name, up.pseudo, 'Utilisateur') as display_name,
      COALESCE(p.avatar_url, up.profile_picture_url, '') as avatar_url,
      COALESCE(p.phone, up.phone) as phone
    FROM unnest(p_user_ids) AS uid(id)
    LEFT JOIN profiles p ON p.user_id = uid.id
    LEFT JOIN user_profiles up ON up.user_id = uid.id
    WHERE p.user_id IS NOT NULL OR up.user_id IS NOT NULL
  LOOP
    result := result || jsonb_build_object(
      user_rec.user_id::text, jsonb_build_object(
        'id', user_rec.user_id,
        'display_name', user_rec.display_name,
        'avatar_url', user_rec.avatar_url,
        'phone', user_rec.phone
      )
    );
  END LOOP;
  
  RETURN result;
END;
$$;


-- 4. Restore get_nearest_businesses RPC
CREATE OR REPLACE FUNCTION public.get_nearest_businesses(
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
)
LANGUAGE plpgsql 
STABLE 
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
    ST_Distance(
      bp.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_meters,
    bp.is_verified,
    bp.is_active
  FROM business_profiles bp
  WHERE bp.location IS NOT NULL
    AND bp.is_active = true
    AND COALESCE(bp.is_sleeping, false) = false
    AND ST_DWithin(
      bp.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters ASC, bp.is_verified DESC
  LIMIT limit_count;
END;
$$;
