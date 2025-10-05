-- ÉTAPE 1: Nettoyer les conversations dupliquées (garder la plus récente)
WITH ranked_convs AS (
  SELECT 
    c.id,
    c.origin_id,
    p.user_id,
    ROW_NUMBER() OVER (
      PARTITION BY c.origin_id, p.user_id 
      ORDER BY c.last_activity DESC, c.created_at DESC
    ) as rn
  FROM conversations c
  JOIN participants p ON c.id = p.conversation_id
  WHERE c.origin_type = 'business'
)
DELETE FROM conversations
WHERE id IN (
  SELECT id FROM ranked_convs WHERE rn > 1
);

-- ÉTAPE 2: Créer un index unique pour empêcher les doublons futurs
-- Note: On ne peut pas créer d'index unique direct car plusieurs users peuvent avoir 
-- une conversation avec le même business. On va utiliser une fonction trigger à la place.

-- Fonction pour garantir l'unicité conversation business + user
CREATE OR REPLACE FUNCTION check_unique_business_user_conversation()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est une insertion de participant dans une conversation business
  IF EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = NEW.conversation_id 
    AND origin_type = 'business'
  ) THEN
    -- Vérifier qu'il n'existe pas déjà une conversation pour ce user + business
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
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table participants
DROP TRIGGER IF EXISTS trigger_check_unique_business_user ON participants;
CREATE TRIGGER trigger_check_unique_business_user
  BEFORE INSERT ON participants
  FOR EACH ROW
  EXECUTE FUNCTION check_unique_business_user_conversation();