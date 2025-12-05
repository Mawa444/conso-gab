-- =============================================
-- MIGRATION COMPLÈTE - Ajout des colonnes et fonctions manquantes
-- =============================================

-- =============================================
-- 1. MISE À JOUR DE LA TABLE CATALOGS
-- =============================================
ALTER TABLE public.catalogs 
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS catalog_type TEXT DEFAULT 'product',
ADD COLUMN IF NOT EXISTS keywords TEXT[],
ADD COLUMN IF NOT EXISTS synonyms TEXT[],
ADD COLUMN IF NOT EXISTS price_type TEXT DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS price_currency TEXT DEFAULT 'XAF',
ADD COLUMN IF NOT EXISTS min_price NUMERIC,
ADD COLUMN IF NOT EXISTS max_price NUMERIC,
ADD COLUMN IF NOT EXISTS has_limited_quantity BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quantity_available INTEGER,
ADD COLUMN IF NOT EXISTS delivery_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS delivery_cost NUMERIC,
ADD COLUMN IF NOT EXISTS delivery_zones TEXT[],
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS price_details JSONB;

-- =============================================
-- 2. MISE À JOUR DE LA TABLE PRODUCTS
-- =============================================
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_on_sale BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sale_price NUMERIC,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS sku TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS subcategory TEXT;

-- =============================================
-- 3. MISE À JOUR DE LA TABLE PROFILES
-- =============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cover_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- =============================================
-- 4. MISE À JOUR DE LA TABLE REVIEW_REPLIES
-- =============================================
ALTER TABLE public.review_replies
ADD COLUMN IF NOT EXISTS reply_text TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- =============================================
-- 5. MISE À JOUR DE LA TABLE CATALOG_COMMENTS (ajout rating)
-- =============================================
ALTER TABLE public.catalog_comments
ADD COLUMN IF NOT EXISTS rating INTEGER;

-- =============================================
-- 6. MISE À JOUR DE LA TABLE LOCATION_REQUESTS
-- =============================================
ALTER TABLE public.location_requests
ADD COLUMN IF NOT EXISTS conversation_id UUID,
ADD COLUMN IF NOT EXISTS requester_id UUID,
ADD COLUMN IF NOT EXISTS target_id UUID,
ADD COLUMN IF NOT EXISTS share_mode TEXT DEFAULT 'once',
ADD COLUMN IF NOT EXISTS purpose TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- =============================================
-- 7. MISE À JOUR DE LA TABLE LOCATION_SHARE_HISTORY
-- =============================================
ALTER TABLE public.location_share_history
ADD COLUMN IF NOT EXISTS request_id UUID,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS accuracy NUMERIC;

-- =============================================
-- 8. FONCTIONS RPC - Gestion des conversations
-- =============================================

-- Fonction pour obtenir ou créer une conversation directe
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
  p_user_id UUID,
  p_other_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Chercher une conversation existante entre les deux utilisateurs
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.type = 'direct'
  AND EXISTS (
    SELECT 1 FROM participants p1 
    WHERE p1.conversation_id = c.id AND p1.user_id = p_user_id
  )
  AND EXISTS (
    SELECT 1 FROM participants p2 
    WHERE p2.conversation_id = c.id AND p2.user_id = p_other_user_id
  )
  LIMIT 1;

  -- Si pas de conversation existante, en créer une nouvelle
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, created_at, updated_at)
    VALUES ('direct', now(), now())
    RETURNING id INTO v_conversation_id;

    -- Ajouter les deux participants
    INSERT INTO participants (conversation_id, user_id, joined_at)
    VALUES 
      (v_conversation_id, p_user_id, now()),
      (v_conversation_id, p_other_user_id, now());
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- Fonction pour obtenir ou créer une conversation business
CREATE OR REPLACE FUNCTION public.get_or_create_business_conversation(
  p_user_id UUID,
  p_business_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_business_owner_id UUID;
BEGIN
  -- Obtenir le propriétaire du business
  SELECT user_id INTO v_business_owner_id
  FROM business_profiles
  WHERE id = p_business_id;

  -- Chercher une conversation existante
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.business_id = p_business_id
  AND c.type = 'business'
  AND EXISTS (
    SELECT 1 FROM participants p 
    WHERE p.conversation_id = c.id AND p.user_id = p_user_id
  )
  LIMIT 1;

  -- Si pas de conversation existante, en créer une nouvelle
  IF v_conversation_id IS NULL THEN
    INSERT INTO conversations (type, business_id, created_at, updated_at)
    VALUES ('business', p_business_id, now(), now())
    RETURNING id INTO v_conversation_id;

    -- Ajouter l'utilisateur et le propriétaire du business
    INSERT INTO participants (conversation_id, user_id, joined_at)
    VALUES 
      (v_conversation_id, p_user_id, now());
    
    -- Ajouter le propriétaire s'il est différent
    IF v_business_owner_id IS NOT NULL AND v_business_owner_id != p_user_id THEN
      INSERT INTO participants (conversation_id, user_id, joined_at)
      VALUES (v_conversation_id, v_business_owner_id, now());
    END IF;
  END IF;

  RETURN v_conversation_id;
END;
$$;

-- =============================================
-- 9. FONCTIONS RPC - Contexte utilisateur
-- =============================================

CREATE OR REPLACE FUNCTION public.get_user_context(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p_user_id,
    'profile', (SELECT row_to_json(up.*) FROM user_profiles up WHERE up.user_id = p_user_id),
    'businesses', (
      SELECT COALESCE(jsonb_agg(row_to_json(bp.*)), '[]'::jsonb)
      FROM business_profiles bp 
      WHERE bp.user_id = p_user_id OR bp.owner_id = p_user_id
    ),
    'current_mode', (
      SELECT current_mode FROM user_current_mode WHERE user_id = p_user_id
    ),
    'roles', (
      SELECT COALESCE(jsonb_agg(role), '[]'::jsonb)
      FROM user_roles WHERE user_id = p_user_id
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- =============================================
-- 10. FONCTIONS RPC - Gestion des business
-- =============================================

-- Planifier la suppression d'un business
CREATE OR REPLACE FUNCTION public.schedule_business_deletion(
  p_business_id UUID,
  p_days_until_deletion INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE business_profiles
  SET 
    deactivation_scheduled_at = now() + (p_days_until_deletion || ' days')::interval,
    is_active = false,
    updated_at = now()
  WHERE id = p_business_id
  AND (user_id = auth.uid() OR owner_id = auth.uid());

  RETURN FOUND;
END;
$$;

-- Annuler la suppression d'un business
CREATE OR REPLACE FUNCTION public.cancel_business_deletion(p_business_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE business_profiles
  SET 
    deactivation_scheduled_at = NULL,
    is_active = true,
    updated_at = now()
  WHERE id = p_business_id
  AND (user_id = auth.uid() OR owner_id = auth.uid());

  RETURN FOUND;
END;
$$;

-- Toggle mode sommeil
CREATE OR REPLACE FUNCTION public.toggle_business_sleep_mode(
  p_business_id UUID,
  p_is_sleeping BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE business_profiles
  SET 
    is_sleeping = p_is_sleeping,
    updated_at = now()
  WHERE id = p_business_id
  AND (user_id = auth.uid() OR owner_id = auth.uid());

  RETURN FOUND;
END;
$$;

-- =============================================
-- 11. FONCTION RPC - Log d'activité
-- =============================================

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_action_type TEXT,
  p_action_description TEXT,
  p_business_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO activity_log (
    user_id,
    action_type,
    action_description,
    business_id,
    metadata,
    created_at
  )
  VALUES (
    auth.uid(),
    p_action_type,
    p_action_description,
    p_business_id,
    p_metadata,
    now()
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- =============================================
-- 12. FONCTIONS RPC - Recherche géographique
-- =============================================

-- Obtenir les businesses dans une zone
CREATE OR REPLACE FUNCTION public.get_businesses_in_bbox(
  p_min_lat NUMERIC,
  p_min_lng NUMERIC,
  p_max_lat NUMERIC,
  p_max_lng NUMERIC,
  p_limit INTEGER DEFAULT 100
)
RETURNS SETOF business_profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM business_profiles
  WHERE is_active = true
  AND NOT COALESCE(is_sleeping, false)
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND latitude BETWEEN p_min_lat AND p_max_lat
  AND longitude BETWEEN p_min_lng AND p_max_lng
  LIMIT p_limit;
END;
$$;

-- Obtenir les businesses les plus proches
CREATE OR REPLACE FUNCTION public.get_nearest_businesses(
  p_lat NUMERIC,
  p_lng NUMERIC,
  p_radius_km NUMERIC DEFAULT 10,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  business_category TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  address TEXT,
  city TEXT,
  quartier TEXT,
  phone TEXT,
  whatsapp TEXT,
  distance_km NUMERIC
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
    bp.description,
    bp.logo_url,
    bp.cover_image_url,
    bp.business_category::TEXT,
    bp.latitude,
    bp.longitude,
    bp.address,
    bp.city,
    bp.quartier,
    bp.phone,
    bp.whatsapp,
    (
      6371 * acos(
        cos(radians(p_lat)) * cos(radians(bp.latitude)) *
        cos(radians(bp.longitude) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(bp.latitude))
      )
    )::NUMERIC AS distance_km
  FROM business_profiles bp
  WHERE bp.is_active = true
  AND NOT COALESCE(bp.is_sleeping, false)
  AND bp.latitude IS NOT NULL
  AND bp.longitude IS NOT NULL
  AND (
    6371 * acos(
      cos(radians(p_lat)) * cos(radians(bp.latitude)) *
      cos(radians(bp.longitude) - radians(p_lng)) +
      sin(radians(p_lat)) * sin(radians(bp.latitude))
    )
  ) <= p_radius_km
  ORDER BY distance_km ASC
  LIMIT p_limit;
END;
$$;

-- =============================================
-- 13. INDEX POUR PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_catalogs_business_id ON catalogs(business_id);
CREATE INDEX IF NOT EXISTS idx_catalogs_category ON catalogs(category);
CREATE INDEX IF NOT EXISTS idx_catalogs_is_active ON catalogs(is_active);
CREATE INDEX IF NOT EXISTS idx_products_catalog_id ON products(catalog_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_business_profiles_location ON business_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_business_profiles_category ON business_profiles(business_category);
CREATE INDEX IF NOT EXISTS idx_conversations_business_id ON conversations(business_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- =============================================
-- 14. POLITIQUES RLS ADDITIONNELLES
-- =============================================

-- Politique pour catalogs - lecture publique des catalogues actifs
DROP POLICY IF EXISTS "Public can view active catalogs" ON catalogs;
CREATE POLICY "Public can view active catalogs" 
ON catalogs FOR SELECT 
USING (is_active = true AND (is_public = true OR is_public IS NULL));

-- Politique pour catalogs - les propriétaires peuvent gérer
CREATE POLICY "Business owners can manage catalogs" 
ON catalogs FOR ALL 
USING (
  business_id IN (
    SELECT id FROM business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- Politique pour products - les propriétaires peuvent gérer
CREATE POLICY "Business owners can manage products" 
ON products FOR ALL 
USING (
  business_id IN (
    SELECT id FROM business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
)
WITH CHECK (
  business_id IN (
    SELECT id FROM business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- Politique pour participants
CREATE POLICY "Users can view their participations"
ON participants FOR SELECT
USING (user_id = auth.uid());

-- Politique pour conversations - insertion
CREATE POLICY "Users can create conversations"
ON conversations FOR INSERT
WITH CHECK (true);

-- Politique pour conversations - mise à jour
CREATE POLICY "Participants can update conversations"
ON conversations FOR UPDATE
USING (
  id IN (SELECT conversation_id FROM participants WHERE user_id = auth.uid())
);

-- Politique pour activity_log
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity"
ON activity_log FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activity"
ON activity_log FOR INSERT
WITH CHECK (user_id = auth.uid());

-- =============================================
-- 15. GRANT PERMISSIONS
-- =============================================

GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_business_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_context TO authenticated;
GRANT EXECUTE ON FUNCTION public.schedule_business_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_business_deletion TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_business_sleep_mode TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_businesses_in_bbox TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.get_nearest_businesses TO authenticated, anon;