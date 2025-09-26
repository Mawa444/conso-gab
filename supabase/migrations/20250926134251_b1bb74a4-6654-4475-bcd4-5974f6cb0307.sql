-- Simply add messages to existing conversations that don't have any
INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at)
SELECT 
  c.id,
  'd213783b-767c-4127-b751-f99544097513'::uuid,
  CASE 
    WHEN c.conversation_type = 'private' THEN 'Salut ! Comment ça va ?'
    WHEN c.conversation_type = 'commande' THEN 'Bonjour, je voudrais commander une pizza'
    WHEN c.conversation_type = 'rendez_vous' THEN 'Bonjour, puis-je prendre rendez-vous ?'
    WHEN c.conversation_type = 'appel' THEN 'Bonjour, j''ai besoin d''aide technique'
    ELSE 'Bonjour !'
  END,
  'text',
  now() - INTERVAL '1 hour'
FROM conversations c
WHERE NOT EXISTS (SELECT 1 FROM messages WHERE conversation_id = c.id)
AND c.title IN ('Support Tech', 'RDV Salon', 'Commande Pizza', 'Chat avec Khavap');

-- Update last_activity for all conversations
UPDATE conversations 
SET last_activity = COALESCE(
  (SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id),
  conversations.created_at
);