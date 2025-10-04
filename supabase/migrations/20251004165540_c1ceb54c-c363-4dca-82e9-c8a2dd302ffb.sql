-- ========================================
-- P0.2: OPTIMISATION SUPABASE (CORRIGÉ)
-- ========================================

-- 1. Créer une fonction RPC unifiée pour récupérer le contexte utilisateur
CREATE OR REPLACE FUNCTION public.get_user_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  user_profile jsonb;
  user_businesses jsonb;
  user_mode jsonb;
BEGIN
  SELECT to_jsonb(up.*) INTO user_profile
  FROM user_profiles up
  WHERE up.user_id = auth.uid()
  LIMIT 1;

  SELECT jsonb_agg(to_jsonb(bp.*)) INTO user_businesses
  FROM business_profiles bp
  WHERE (bp.user_id = auth.uid() OR bp.owner_id = auth.uid())
    AND bp.is_active = true;

  SELECT to_jsonb(ucm.*) INTO user_mode
  FROM user_current_mode ucm
  WHERE ucm.user_id = auth.uid()
  LIMIT 1;

  result := jsonb_build_object(
    'profile', COALESCE(user_profile, '{}'::jsonb),
    'businesses', COALESCE(user_businesses, '[]'::jsonb),
    'current_mode', COALESCE(user_mode, '{}'::jsonb)
  );

  RETURN result;
END;
$$;

-- 2. Index composites pour filtres multiples
CREATE INDEX IF NOT EXISTS idx_business_profiles_active_filters 
ON business_profiles(is_active, is_sleeping, is_deactivated, latitude, longitude)
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- 3. Index pour catalogues
CREATE INDEX IF NOT EXISTS idx_catalogs_business_active 
ON catalogs(business_id, is_active, is_public)
WHERE is_active = true;

-- 4. Index pour produits
CREATE INDEX IF NOT EXISTS idx_products_catalog_active 
ON products(catalog_id, is_active)
WHERE is_active = true;

-- 5. Index pour messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_members_user_active 
ON conversation_members(user_id, is_active)
WHERE is_active = true;