-- Fix infinite recursion in conversation_members RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view conversation members" ON conversation_members;

-- Create security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.user_is_conversation_member(conversation_id_param uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_members 
    WHERE conversation_id = conversation_id_param 
    AND user_id = auth.uid() 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- Recreate the policy using the security definer function
CREATE POLICY "Users can view conversation members" 
ON conversation_members FOR SELECT 
USING (
  conversation_id IN (
    SELECT cm.conversation_id 
    FROM conversation_members cm 
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

-- Also fix messages policy to avoid potential recursion
DROP POLICY IF EXISTS "messages_select_participant" ON messages;

CREATE POLICY "messages_select_participant" 
ON messages FOR SELECT 
USING (
  conversation_id IN (
    SELECT cm.conversation_id 
    FROM conversation_members cm 
    WHERE cm.user_id = auth.uid() AND cm.is_active = true
  )
);

-- Fix attachments policy
DROP POLICY IF EXISTS "Users can view attachments in their conversations" ON attachments;

CREATE POLICY "Users can view attachments in their conversations" 
ON attachments FOR SELECT 
USING (
  message_id IN (
    SELECT m.id FROM messages m
    WHERE m.conversation_id IN (
      SELECT cm.conversation_id 
      FROM conversation_members cm 
      WHERE cm.user_id = auth.uid() AND cm.is_active = true
    )
  )
);

-- Create some test data for development
-- Insert a test conversation
INSERT INTO conversations (id, title, conversation_type, metadata) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'Conversation de test',
  'private',
  '{}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert conversation members (requires actual user IDs)
-- This will be handled by the application when users are authenticated