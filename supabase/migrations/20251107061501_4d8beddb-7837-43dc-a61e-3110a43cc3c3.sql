-- Vérifier que la fonction get_or_create_direct_conversation existe et fonctionne correctement
-- Si elle n'existe pas, la créer

-- Drop et recrée pour s'assurer qu'elle fonctionne
DROP FUNCTION IF EXISTS public.get_or_create_direct_conversation(UUID, UUID);

CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_user1_name TEXT;
  v_user2_name TEXT;
BEGIN
  -- Normaliser l'ordre des IDs pour garantir unicité (toujours le plus petit en premier)
  IF p_user_id_1 > p_user_id_2 THEN
    -- Échanger les IDs
    v_conversation_id := p_user_id_1;
    p_user_id_1 := p_user_id_2;
    p_user_id_2 := v_conversation_id;
    v_conversation_id := NULL;
  END IF;

  -- Chercher conversation existante entre ces 2 utilisateurs
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.origin_type = 'direct'
    AND c.conversation_type = 'private'
    AND EXISTS (
      SELECT 1 FROM participants p1 
      WHERE p1.conversation_id = c.id AND p1.user_id = p_user_id_1
    )
    AND EXISTS (
      SELECT 1 FROM participants p2 
      WHERE p2.conversation_id = c.id AND p2.user_id = p_user_id_2
    )
    AND (
      SELECT COUNT(*) FROM participants p 
      WHERE p.conversation_id = c.id
    ) = 2
  LIMIT 1;
  
  -- Si trouvée, retourner
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;
  
  -- Récupérer les noms des utilisateurs
  SELECT pseudo INTO v_user1_name 
  FROM user_profiles 
  WHERE user_id = p_user_id_1;
  
  SELECT pseudo INTO v_user2_name 
  FROM user_profiles 
  WHERE user_id = p_user_id_2;
  
  -- Créer la conversation
  INSERT INTO conversations (
    origin_type,
    origin_id,
    conversation_type,
    title,
    last_activity
  ) VALUES (
    'direct',
    NULL,
    'private',
    COALESCE(v_user1_name, 'User') || ' & ' || COALESCE(v_user2_name, 'User'),
    NOW()
  )
  RETURNING id INTO v_conversation_id;
  
  -- Ajouter les 2 participants
  INSERT INTO participants (conversation_id, user_id, role)
  VALUES 
    (v_conversation_id, p_user_id_1, 'member'),
    (v_conversation_id, p_user_id_2, 'member');
  
  RETURN v_conversation_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_direct_conversation IS 'Meta-style: Ensures one unique conversation between two users (WhatsApp/Messenger style)';

-- Corriger aussi la fonction business pour s'assurer qu'elle est idempotente
DROP FUNCTION IF EXISTS public.get_or_create_business_conversation(UUID, UUID);

CREATE OR REPLACE FUNCTION public.get_or_create_business_conversation(
  p_business_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversation_id UUID;
  v_business_user_id UUID;
  v_business_name TEXT;
BEGIN
  -- Chercher conversation existante (1 user + 1 business = 1 thread unique)
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.origin_type = 'business'
    AND c.origin_id = p_business_id
    AND EXISTS (
      SELECT 1 FROM participants p 
      WHERE p.conversation_id = c.id AND p.user_id = p_user_id
    )
  LIMIT 1;
  
  -- Si trouvée, retourner
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;
  
  -- Récupérer infos business
  SELECT user_id, business_name INTO v_business_user_id, v_business_name
  FROM business_profiles
  WHERE id = p_business_id;
  
  IF v_business_user_id IS NULL THEN
    RAISE EXCEPTION 'Business introuvable';
  END IF;
  
  -- Créer conversation
  INSERT INTO conversations (
    origin_type,
    origin_id,
    conversation_type,
    title,
    last_activity
  ) VALUES (
    'business',
    p_business_id,
    'private',
    v_business_name,
    NOW()
  )
  RETURNING id INTO v_conversation_id;
  
  -- Ajouter participants
  INSERT INTO participants (conversation_id, user_id, role)
  VALUES 
    (v_conversation_id, p_user_id, 'consumer'),
    (v_conversation_id, v_business_user_id, 'business');
  
  RETURN v_conversation_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_business_conversation IS 'Meta-style: 1 user + 1 business = 1 conversation unique et stable';