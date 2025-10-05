-- Add missing messages for existing conversations
INSERT INTO messages (id, conversation_id, sender_id, content, message_type, created_at) VALUES
  -- Conversation 1 messages
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'd213783b-767c-4127-b751-f99544097513', 'Salut Khavap ! Comment ça va ?', 'text', now() - INTERVAL '2 days'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Salut Dito ! Ça va bien et toi ?', 'text', now() - INTERVAL '2 days' + INTERVAL '10 minutes'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'd213783b-767c-4127-b751-f99544097513', 'Super ! On se voit bientôt ?', 'text', now() - INTERVAL '1 hour'),
  
  -- Conversation 2 messages (commande)
  ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'd213783b-767c-4127-b751-f99544097513', 'Bonjour, je voudrais commander une pizza Margherita', 'text', now() - INTERVAL '1 day'),
  ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'Bonjour ! Bien sûr, c''est 8000 FCFA. Livraison ou à emporter ?', 'text', now() - INTERVAL '1 day' + INTERVAL '5 minutes'),
  ('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'd213783b-767c-4127-b751-f99544097513', 'Livraison s''il vous plaît !', 'text', now() - INTERVAL '30 minutes'),
  
  -- Conversation 3 messages (rendez-vous)
  ('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Disponible pour une coupe demain à 14h ?', 'text', now() - INTERVAL '3 hours'),
  ('650e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'Parfait ! RDV confirmé pour demain 14h', 'text', now() - INTERVAL '2 hours 30 minutes'),
  
  -- Conversation 4 messages (appel)
  ('650e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440004', 'd213783b-767c-4127-b751-f99544097513', 'Besoin d''aide technique pour mon compte', 'text', now() - INTERVAL '1 hour'),
  ('650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Pas de problème ! Je t''appelle dans 5 minutes', 'text', now() - INTERVAL '50 minutes')
ON CONFLICT (id) DO NOTHING;

-- Update last_activity for conversations to match latest messages
UPDATE conversations SET last_activity = (
  SELECT COALESCE(MAX(created_at), now()) FROM messages WHERE conversation_id = conversations.id
) WHERE id IN (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004'
);