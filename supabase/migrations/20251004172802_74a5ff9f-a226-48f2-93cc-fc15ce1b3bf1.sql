-- Créer le bucket de stockage pour les médias de chat si non existant
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-media',
  'chat-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS : Les utilisateurs peuvent uploader leurs propres médias
CREATE POLICY "Users can upload their own chat media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique RLS : Les utilisateurs peuvent voir les médias de leurs conversations
CREATE POLICY "Users can view chat media in their conversations"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'chat-media'
  AND (
    -- L'utilisateur a uploadé le fichier
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Ou l'utilisateur est participant d'une conversation (via messages)
    EXISTS (
      SELECT 1 FROM messages m
      INNER JOIN participants p ON m.conversation_id = p.conversation_id
      WHERE p.user_id = auth.uid()
      AND m.attachment_url LIKE '%' || name || '%'
    )
  )
);

-- Politique RLS : Les utilisateurs peuvent supprimer leurs propres médias
CREATE POLICY "Users can delete their own chat media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-media' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Ajouter un index pour optimiser les requêtes de conversations par business
CREATE INDEX IF NOT EXISTS idx_conversations_business 
ON conversations (origin_type, origin_id) 
WHERE origin_type = 'business';

-- Ajouter un index pour optimiser les requêtes de messages par conversation
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages (conversation_id, created_at DESC);

-- Fonction pour vérifier l'unicité d'une conversation business
-- Garantit qu'il n'y a qu'une seule conversation par paire (user, business)
CREATE OR REPLACE FUNCTION check_unique_business_conversation(
  p_business_id UUID,
  p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_conv_id UUID;
BEGIN
  -- Chercher une conversation existante
  SELECT c.id INTO existing_conv_id
  FROM conversations c
  INNER JOIN participants p ON c.id = p.conversation_id
  WHERE c.origin_type = 'business'
    AND c.origin_id = p_business_id
    AND p.user_id = p_user_id
  LIMIT 1;
  
  RETURN existing_conv_id;
END;
$$;

COMMENT ON FUNCTION check_unique_business_conversation IS 'Vérifie si une conversation existe déjà entre un utilisateur et un business';
