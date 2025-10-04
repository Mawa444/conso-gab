
-- ============================================
-- ARCHITECTURE META: CONVERSATION UNIQUE (Approche simplifiée)
-- ============================================

-- 1. Nettoyer les conversations dupliquées (garder la plus récente)
WITH ranked_conversations AS (
  SELECT 
    c.id,
    ROW_NUMBER() OVER (
      PARTITION BY c.origin_id, p.user_id 
      ORDER BY c.created_at DESC
    ) as rn
  FROM conversations c
  JOIN participants p ON c.id = p.conversation_id
  WHERE c.origin_type = 'business'
)
DELETE FROM conversations
WHERE id IN (
  SELECT id FROM ranked_conversations WHERE rn > 1
);

-- 2. Fonction atomique Meta-style : Trouver OU créer conversation
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
  JOIN participants p ON c.id = p.conversation_id
  WHERE c.origin_type = 'business'
    AND c.origin_id = p_business_id
    AND p.user_id = p_user_id
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
  
  -- Message système
  INSERT INTO messages (conversation_id, sender_id, message_type, content)
  VALUES (v_conversation_id, p_user_id, 'system', 'Conversation créée');
  
  RETURN v_conversation_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_business_conversation IS 'Architecture Meta: 1 user + 1 business = 1 conversation unique et stable';
