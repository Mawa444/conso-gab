-- ============================================
-- NETTOYAGE DES CONVERSATIONS DUPLIQUÉES
-- ============================================
-- Problème: Multiples conversations entre les mêmes utilisateurs/businesses
-- Solution: Supprimer les doublons et garder uniquement la plus récente

-- 1. Nettoyer les conversations business dupliquées
-- Garder uniquement la conversation la plus récente entre un utilisateur et un business
WITH ranked_business_convos AS (
  SELECT 
    c.id,
    c.origin_id as business_id,
    p.user_id,
    c.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY c.origin_id, p.user_id 
      ORDER BY c.created_at DESC
    ) as rn
  FROM conversations c
  JOIN participants p ON p.conversation_id = c.id
  WHERE c.origin_type = 'business'
    AND c.origin_id IS NOT NULL
),
business_duplicates AS (
  SELECT id FROM ranked_business_convos WHERE rn > 1
)
DELETE FROM conversations
WHERE id IN (SELECT id FROM business_duplicates);

-- 2. Nettoyer les conversations directes dupliquées
-- Garder uniquement la conversation la plus récente entre deux utilisateurs
WITH direct_conversations AS (
  SELECT 
    c.id,
    c.created_at,
    array_agg(p.user_id ORDER BY p.user_id) as user_ids
  FROM conversations c
  JOIN participants p ON p.conversation_id = c.id
  WHERE c.origin_type = 'direct' 
    OR (c.conversation_type = 'private' AND c.origin_type IS NULL)
  GROUP BY c.id, c.created_at
  HAVING COUNT(p.user_id) = 2
),
ranked_direct AS (
  SELECT 
    id,
    user_ids,
    ROW_NUMBER() OVER (
      PARTITION BY user_ids 
      ORDER BY created_at DESC
    ) as rn
  FROM direct_conversations
),
direct_duplicates AS (
  SELECT id FROM ranked_direct WHERE rn > 1
)
DELETE FROM conversations
WHERE id IN (SELECT id FROM direct_duplicates);

-- 3. Mettre à jour les conversations pour s'assurer qu'elles ont le bon origin_type
UPDATE conversations
SET origin_type = 'direct'
WHERE conversation_type = 'private' 
  AND origin_type IS NULL
  AND (
    SELECT COUNT(*) 
    FROM participants 
    WHERE conversation_id = conversations.id
  ) = 2;

-- Ajouter des commentaires pour la documentation
COMMENT ON FUNCTION public.get_or_create_direct_conversation IS 
'Meta-style: Garantit 1 conversation unique entre 2 utilisateurs (WhatsApp/Messenger style). Idempotent et thread-safe.';

COMMENT ON FUNCTION public.get_or_create_business_conversation IS 
'Meta-style: Garantit 1 conversation unique entre un utilisateur et un business. Idempotent et thread-safe.';