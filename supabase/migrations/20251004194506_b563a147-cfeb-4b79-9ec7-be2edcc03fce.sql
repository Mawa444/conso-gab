-- Add SELECT policy for messages table
-- Users can read messages from conversations they are participants of
CREATE POLICY "messages_select_if_participant" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM participants p
    WHERE p.conversation_id = messages.conversation_id
    AND p.user_id = auth.uid()
  )
);