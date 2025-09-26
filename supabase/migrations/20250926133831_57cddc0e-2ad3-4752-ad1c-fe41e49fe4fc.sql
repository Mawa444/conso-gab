-- Clean up test data and create fresh test conversations
DELETE FROM messages WHERE conversation_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004'
);

DELETE FROM conversation_members WHERE conversation_id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004'
);

DELETE FROM conversations WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004'
);

-- Create fresh test conversations
INSERT INTO conversations (id, title, conversation_type, metadata, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', 'Conversation avec Khavap', 'private', '{}', now() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Commande Pizza Margherita', 'commande', '{"order_type": "food"}', now() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440013', 'RDV Coiffure', 'rendez_vous', '{"service": "haircut"}', now() - INTERVAL '3 hours'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Appel technique', 'appel', '{"call_type": "support"}', now() - INTERVAL '1 hour');

-- Add conversation members
INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, last_read_at) VALUES
  -- Conversation 1: Dito + Khavap
  ('550e8400-e29b-41d4-a716-446655440011', 'd213783b-767c-4127-b751-f99544097513', 'owner', now() - INTERVAL '2 days', now() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440011', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'member', now() - INTERVAL '2 days', now() - INTERVAL '2 hours'),
  
  -- Conversation 2: Dito + Ndo (commande)
  ('550e8400-e29b-41d4-a716-446655440012', 'd213783b-767c-4127-b751-f99544097513', 'owner', now() - INTERVAL '1 day', now() - INTERVAL '30 minutes'),
  ('550e8400-e29b-41d4-a716-446655440012', '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'member', now() - INTERVAL '1 day', now() - INTERVAL '1 hour'),
  
  -- Conversation 3: Khavap + Ndo (rendez-vous)  
  ('550e8400-e29b-41d4-a716-446655440013', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'owner', now() - INTERVAL '3 hours', now() - INTERVAL '10 minutes'),
  ('550e8400-e29b-41d4-a716-446655440013', '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'member', now() - INTERVAL '3 hours', now() - INTERVAL '30 minutes'),
  
  -- Conversation 4: Dito + Khavap (appel)
  ('550e8400-e29b-41d4-a716-446655440014', 'd213783b-767c-4127-b751-f99544097513', 'owner', now() - INTERVAL '1 hour', now() - INTERVAL '5 minutes'),
  ('550e8400-e29b-41d4-a716-446655440014', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'member', now() - INTERVAL '1 hour', now() - INTERVAL '10 minutes');

-- Add test messages
INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at) VALUES
  -- Conversation 1 messages
  ('550e8400-e29b-41d4-a716-446655440011', 'd213783b-767c-4127-b751-f99544097513', 'Salut Khavap ! Comment ça va ?', 'text', now() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440011', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Salut Dito ! Ça va bien et toi ?', 'text', now() - INTERVAL '2 days' + INTERVAL '10 minutes'),
  ('550e8400-e29b-41d4-a716-446655440011', 'd213783b-767c-4127-b751-f99544097513', 'Super ! On se voit bientôt ?', 'text', now() - INTERVAL '1 hour'),
  
  -- Conversation 2 messages (commande)
  ('550e8400-e29b-41d4-a716-446655440012', 'd213783b-767c-4127-b751-f99544097513', 'Bonjour, je voudrais commander une pizza Margherita', 'text', now() - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440012', '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'Bonjour ! Bien sûr, c''est 8000 FCFA. Livraison ou à emporter ?', 'text', now() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  ('550e8400-e29b-41d4-a716-446655440012', 'd213783b-767c-4127-b751-f99544097513', 'Livraison s''il vous plaît !', 'text', now() - INTERVAL '30 minutes'),
  
  -- Conversation 3 messages (rendez-vous)
  ('550e8400-e29b-41d4-a716-446655440013', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Disponible pour une coupe demain à 14h ?', 'text', now() - INTERVAL '3 hours'),
  ('550e8400-e29b-41d4-a716-446655440013', '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'Parfait ! RDV confirmé pour demain 14h', 'text', now() - INTERVAL '2 hours 30 minutes'),
  
  -- Conversation 4 messages (appel)
  ('550e8400-e29b-41d4-a716-446655440014', 'd213783b-767c-4127-b751-f99544097513', 'Besoin d''aide technique pour mon compte', 'text', now() - INTERVAL '1 hour'),
  ('550e8400-e29b-41d4-a716-446655440014', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Pas de problème ! Je t''appelle dans 5 minutes', 'text', now() - INTERVAL '50 minutes');

-- Update last_activity for conversations
UPDATE conversations SET last_activity = (
  SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id
) WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440011',
  '550e8400-e29b-41d4-a716-446655440012', 
  '550e8400-e29b-41d4-a716-446655440013',
  '550e8400-e29b-41d4-a716-446655440014'
);