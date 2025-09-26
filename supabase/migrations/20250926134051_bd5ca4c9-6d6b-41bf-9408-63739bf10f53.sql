-- Complete cleanup and create fresh test data
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE conversation_members CASCADE;  
TRUNCATE TABLE conversations CASCADE;

-- Create brand new test conversations with different IDs
INSERT INTO conversations (id, title, conversation_type, metadata, created_at) VALUES
  (gen_random_uuid(), 'Chat avec Khavap', 'private', '{}', now() - INTERVAL '2 days'),
  (gen_random_uuid(), 'Commande Pizza', 'commande', '{"order_type": "food"}', now() - INTERVAL '1 day'),
  (gen_random_uuid(), 'RDV Salon', 'rendez_vous', '{"service": "haircut"}', now() - INTERVAL '3 hours'),
  (gen_random_uuid(), 'Support Tech', 'appel', '{"call_type": "support"}', now() - INTERVAL '1 hour');

-- Get the generated conversation IDs and create members/messages
DO $$
DECLARE
  conv1_id uuid;
  conv2_id uuid;
  conv3_id uuid;
  conv4_id uuid;
BEGIN
  -- Get conversation IDs
  SELECT id INTO conv1_id FROM conversations WHERE title = 'Chat avec Khavap';
  SELECT id INTO conv2_id FROM conversations WHERE title = 'Commande Pizza';
  SELECT id INTO conv3_id FROM conversations WHERE title = 'RDV Salon';
  SELECT id INTO conv4_id FROM conversations WHERE title = 'Support Tech';
  
  -- Add conversation members
  INSERT INTO conversation_members (conversation_id, user_id, role, joined_at, last_read_at) VALUES
    -- Conversation 1: Dito + Khavap
    (conv1_id, 'd213783b-767c-4127-b751-f99544097513', 'owner', now() - INTERVAL '2 days', now() - INTERVAL '1 hour'),
    (conv1_id, 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'member', now() - INTERVAL '2 days', now() - INTERVAL '2 hours'),
    
    -- Conversation 2: Dito + Ndo (commande)
    (conv2_id, 'd213783b-767c-4127-b751-f99544097513', 'owner', now() - INTERVAL '1 day', now() - INTERVAL '30 minutes'),
    (conv2_id, '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'member', now() - INTERVAL '1 day', now() - INTERVAL '1 hour'),
    
    -- Conversation 3: Khavap + Ndo (rendez-vous)
    (conv3_id, 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'owner', now() - INTERVAL '3 hours', now() - INTERVAL '10 minutes'),
    (conv3_id, '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'member', now() - INTERVAL '3 hours', now() - INTERVAL '30 minutes'),
    
    -- Conversation 4: Dito + Khavap (appel)
    (conv4_id, 'd213783b-767c-4127-b751-f99544097513', 'owner', now() - INTERVAL '1 hour', now() - INTERVAL '5 minutes'),
    (conv4_id, 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'member', now() - INTERVAL '1 hour', now() - INTERVAL '10 minutes');

  -- Add test messages
  INSERT INTO messages (conversation_id, sender_id, content, message_type, created_at) VALUES
    -- Conversation 1 messages
    (conv1_id, 'd213783b-767c-4127-b751-f99544097513', 'Salut Khavap ! Comment ça va ?', 'text', now() - INTERVAL '2 days'),
    (conv1_id, 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Salut Dito ! Ça va bien et toi ?', 'text', now() - INTERVAL '2 days' + INTERVAL '10 minutes'),
    (conv1_id, 'd213783b-767c-4127-b751-f99544097513', 'Super ! On se voit bientôt ?', 'text', now() - INTERVAL '1 hour'),
    
    -- Conversation 2 messages (commande)
    (conv2_id, 'd213783b-767c-4127-b751-f99544097513', 'Bonjour, je voudrais commander une pizza Margherita', 'text', now() - INTERVAL '1 day'),
    (conv2_id, '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'Bonjour ! Bien sûr, c est 8000 FCFA. Livraison ou à emporter ?', 'text', now() - INTERVAL '1 day' + INTERVAL '5 minutes'),
    (conv2_id, 'd213783b-767c-4127-b751-f99544097513', 'Livraison s il vous plaît !', 'text', now() - INTERVAL '30 minutes'),
    
    -- Conversation 3 messages (rendez-vous)
    (conv3_id, 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Disponible pour une coupe demain à 14h ?', 'text', now() - INTERVAL '3 hours'),
    (conv3_id, '1a5e8114-054c-44c0-a74c-cc0e31e1dbd0', 'Parfait ! RDV confirmé pour demain 14h', 'text', now() - INTERVAL '2 hours 30 minutes'),
    
    -- Conversation 4 messages (appel)
    (conv4_id, 'd213783b-767c-4127-b751-f99544097513', 'Besoin d aide technique pour mon compte', 'text', now() - INTERVAL '1 hour'),
    (conv4_id, 'f09916e9-16e0-474a-bcf2-65c07a80f906', 'Pas de problème ! Je t appelle dans 5 minutes', 'text', now() - INTERVAL '50 minutes');

  -- Update last_activity for conversations
  UPDATE conversations SET last_activity = (
    SELECT MAX(created_at) FROM messages WHERE conversation_id = conversations.id
  );
END $$;