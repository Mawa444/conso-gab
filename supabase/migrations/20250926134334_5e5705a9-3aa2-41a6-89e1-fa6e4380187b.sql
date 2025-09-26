-- Simply add test messages to existing conversations
INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at)
SELECT 
  c.id,
  'd213783b-767c-4127-b751-f99544097513'::uuid,
  CASE 
    WHEN c.conversation_type = 'private' THEN 'Salut ! Comment ça va ?'
    WHEN c.conversation_type = 'commande' THEN 'Je voudrais commander une pizza'
    WHEN c.conversation_type = 'rendez_vous' THEN 'Puis-je prendre rendez-vous ?'
    WHEN c.conversation_type = 'appel' THEN 'J''ai besoin d''aide technique'
    ELSE 'Message de test'
  END,
  'text',
  now() - INTERVAL '1 hour'
FROM conversations c
WHERE c.title IN ('Support Tech', 'RDV Salon', 'Commande Pizza', 'Chat avec Khavap', 'Conversation de test')
ON CONFLICT DO NOTHING;

-- Update last_activity for these conversations
UPDATE conversations 
SET last_activity = now() - INTERVAL '30 minutes'
WHERE title IN ('Support Tech', 'RDV Salon', 'Commande Pizza', 'Chat avec Khavap', 'Conversation de test');