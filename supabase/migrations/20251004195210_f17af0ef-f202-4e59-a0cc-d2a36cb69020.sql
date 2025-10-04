
-- ============================================
-- ARCHITECTURE META-STYLE: IDENTITÉ UNIFIÉE
-- ============================================

-- 1. Fonction pour récupérer un profil unifié (consumer OU business)
-- Comme Facebook User ID qui est unique et partagé
CREATE OR REPLACE FUNCTION public.get_unified_profile(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Essayer d'abord profiles (consommateurs)
  SELECT jsonb_build_object(
    'user_id', user_id,
    'display_name', COALESCE(display_name, first_name || ' ' || last_name),
    'avatar_url', avatar_url,
    'type', 'consumer'
  ) INTO result
  FROM profiles
  WHERE user_id = p_user_id;
  
  IF result IS NOT NULL THEN
    RETURN result;
  END IF;
  
  -- Sinon, essayer user_profiles
  SELECT jsonb_build_object(
    'user_id', user_id,
    'display_name', pseudo,
    'avatar_url', profile_picture_url,
    'type', 'consumer'
  ) INTO result
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  IF result IS NOT NULL THEN
    RETURN result;
  END IF;
  
  -- Sinon, essayer business_profiles
  SELECT jsonb_build_object(
    'user_id', user_id,
    'display_name', business_name,
    'avatar_url', logo_url,
    'type', 'business',
    'business_id', id
  ) INTO result
  FROM business_profiles
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 2. Fonction batch pour récupérer plusieurs profils à la fois (optimisation N+1)
CREATE OR REPLACE FUNCTION public.get_unified_profiles_batch(p_user_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  WITH consumer_profiles AS (
    SELECT 
      user_id,
      jsonb_build_object(
        'user_id', user_id,
        'display_name', COALESCE(display_name, first_name || ' ' || last_name),
        'avatar_url', avatar_url,
        'type', 'consumer'
      ) as profile_data
    FROM profiles
    WHERE user_id = ANY(p_user_ids)
  ),
  user_consumer_profiles AS (
    SELECT 
      user_id,
      jsonb_build_object(
        'user_id', user_id,
        'display_name', pseudo,
        'avatar_url', profile_picture_url,
        'type', 'consumer'
      ) as profile_data
    FROM user_profiles
    WHERE user_id = ANY(p_user_ids)
    AND user_id NOT IN (SELECT user_id FROM consumer_profiles)
  ),
  business_user_profiles AS (
    SELECT 
      user_id,
      jsonb_build_object(
        'user_id', user_id,
        'display_name', business_name,
        'avatar_url', logo_url,
        'type', 'business',
        'business_id', id
      ) as profile_data
    FROM business_profiles
    WHERE user_id = ANY(p_user_ids)
    AND user_id NOT IN (
      SELECT user_id FROM consumer_profiles
      UNION
      SELECT user_id FROM user_consumer_profiles
    )
  ),
  all_profiles AS (
    SELECT * FROM consumer_profiles
    UNION ALL
    SELECT * FROM user_consumer_profiles
    UNION ALL
    SELECT * FROM business_user_profiles
  )
  SELECT jsonb_object_agg(user_id::text, profile_data)
  INTO result
  FROM all_profiles;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 3. Fonction pour récupérer le contexte d'une conversation (équivalent à Facebook Conversation Context)
CREATE OR REPLACE FUNCTION public.get_conversation_context(p_conversation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  conv_origin_type TEXT;
  conv_origin_id UUID;
BEGIN
  -- Récupérer le type de conversation
  SELECT origin_type, origin_id 
  INTO conv_origin_type, conv_origin_id
  FROM conversations
  WHERE id = p_conversation_id;
  
  -- Si conversation business, récupérer les détails du business
  IF conv_origin_type = 'business' AND conv_origin_id IS NOT NULL THEN
    SELECT jsonb_build_object(
      'business_id', id,
      'business_name', business_name,
      'logo_url', logo_url,
      'category', business_category,
      'whatsapp', whatsapp,
      'phone', phone,
      'email', email
    ) INTO result
    FROM business_profiles
    WHERE id = conv_origin_id;
  END IF;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;

-- 4. Index pour optimiser les recherches de profils
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);

-- 5. Index pour optimiser les conversations
CREATE INDEX IF NOT EXISTS idx_conversations_origin ON conversations(origin_type, origin_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participants_conversation_user ON participants(conversation_id, user_id);

COMMENT ON FUNCTION public.get_unified_profile IS 'Retourne le profil unifié d''un utilisateur (consumer OU business) - Architecture Meta-style';
COMMENT ON FUNCTION public.get_unified_profiles_batch IS 'Batch fetch de profils unifiés pour éviter les N+1 queries - Architecture Meta-style';
COMMENT ON FUNCTION public.get_conversation_context IS 'Récupère le contexte complet d''une conversation (business info, etc.) - Architecture Meta-style';
