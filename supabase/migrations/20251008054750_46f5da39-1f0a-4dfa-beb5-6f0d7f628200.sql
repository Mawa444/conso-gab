-- ============================================
-- CORRECTION 1: Ajouter SET search_path aux fonctions manquantes
-- ============================================

-- Fonction trigger pour unicité business-user conversation
CREATE OR REPLACE FUNCTION check_unique_business_user_conversation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = NEW.conversation_id 
    AND origin_type = 'business'
  ) THEN
    IF EXISTS (
      SELECT 1 
      FROM conversations c
      JOIN participants p ON c.id = p.conversation_id
      WHERE c.origin_type = 'business'
        AND c.origin_id = (SELECT origin_id FROM conversations WHERE id = NEW.conversation_id)
        AND p.user_id = NEW.user_id
        AND c.id != NEW.conversation_id
    ) THEN
      RAISE EXCEPTION 'L''utilisateur a déjà une conversation avec ce business';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- CORRECTION 2: Créer la fonction RPC get_unified_profiles_batch
-- ============================================

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
  -- Récupérer les profils unifiés pour tous les user_ids fournis
  FOR user_rec IN
    SELECT 
      COALESCE(p.user_id, up.user_id) as user_id,
      COALESCE(
        p.display_name,
        p.first_name,
        up.pseudo,
        'Utilisateur'
      ) as display_name,
      COALESCE(p.avatar_url, '') as avatar_url,
      COALESCE(p.phone, up.phone) as phone
    FROM unnest(p_user_ids) AS uid(id)
    LEFT JOIN profiles p ON p.user_id = uid.id
    LEFT JOIN user_profiles up ON up.user_id = uid.id
    WHERE p.user_id IS NOT NULL OR up.user_id IS NOT NULL
  LOOP
    result := result || jsonb_build_object(
      user_rec.user_id::TEXT,
      jsonb_build_object(
        'display_name', user_rec.display_name,
        'avatar_url', user_rec.avatar_url,
        'phone', user_rec.phone
      )
    );
  END LOOP;
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_unified_profiles_batch IS 'Récupère les profils unifiés (profiles + user_profiles) pour un batch d''user_ids';

-- ============================================
-- CORRECTION 3: Créer get_conversation_context pour MessagingContext
-- ============================================

CREATE OR REPLACE FUNCTION public.get_conversation_context(p_conversation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  conv_rec RECORD;
BEGIN
  -- Récupérer le contexte business d'une conversation
  SELECT 
    c.origin_id,
    c.origin_type,
    bp.business_name,
    bp.business_category as category,
    bp.logo_url,
    bp.whatsapp,
    bp.phone,
    bp.email
  INTO conv_rec
  FROM conversations c
  LEFT JOIN business_profiles bp ON c.origin_id = bp.id AND c.origin_type = 'business'
  WHERE c.id = p_conversation_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  IF conv_rec.origin_type = 'business' THEN
    result := jsonb_build_object(
      'business_id', conv_rec.origin_id,
      'business_name', conv_rec.business_name,
      'category', conv_rec.category,
      'logo_url', conv_rec.logo_url,
      'whatsapp', conv_rec.whatsapp,
      'phone', conv_rec.phone,
      'email', conv_rec.email
    );
  ELSE
    result := NULL;
  END IF;
  
  RETURN result;
END;
$$;

COMMENT ON FUNCTION public.get_conversation_context IS 'Récupère le contexte (business, etc.) d''une conversation';