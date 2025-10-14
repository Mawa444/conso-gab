-- Create function for getting or creating direct conversations (user-to-user)
-- Similar to business conversations, ensures one unique conversation between two users

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
BEGIN
  -- Chercher conversation existante entre ces 2 utilisateurs
  SELECT c.id INTO v_conversation_id
  FROM conversations c
  WHERE c.origin_type = 'direct'
    AND EXISTS (
      SELECT 1 FROM participants p1
      WHERE p1.conversation_id = c.id AND p1.user_id = p_user_id_1
    )
    AND EXISTS (
      SELECT 1 FROM participants p2
      WHERE p2.conversation_id = c.id AND p2.user_id = p_user_id_2
    )
  LIMIT 1;

  -- Si existe, retourner
  IF v_conversation_id IS NOT NULL THEN
    RETURN v_conversation_id;
  END IF;

  -- Sinon, créer nouvelle conversation
  INSERT INTO conversations (conversation_type, origin_type, last_activity)
  VALUES ('direct', 'direct', NOW())
  RETURNING id INTO v_conversation_id;

  -- Ajouter les 2 participants
  INSERT INTO participants (conversation_id, user_id, role)
  VALUES 
    (v_conversation_id, p_user_id_1, 'member'),
    (v_conversation_id, p_user_id_2, 'member');

  RETURN v_conversation_id;
END;
$$;

COMMENT ON FUNCTION public.get_or_create_direct_conversation IS 'Ensures one unique conversation between two users (WhatsApp/Messenger style)';

-- Add index for better performance on direct conversation lookups
CREATE INDEX IF NOT EXISTS idx_conversations_origin_type ON conversations(origin_type);
CREATE INDEX IF NOT EXISTS idx_participants_conv_user ON participants(conversation_id, user_id);