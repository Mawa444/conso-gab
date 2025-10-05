-- Enable Row Level Security on message_actions table
ALTER TABLE public.message_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for message_actions table
-- Users can view message actions for messages in their conversations
CREATE POLICY "Users can view message actions in their conversations" 
ON public.message_actions 
FOR SELECT 
USING (
  message_id IN (
    SELECT m.id
    FROM public.messages m
    JOIN public.conversation_members cm ON m.conversation_id = cm.conversation_id
    WHERE cm.user_id = auth.uid() 
    AND cm.is_active = true
  )
);

-- Users can create message actions for their own messages
CREATE POLICY "Users can create message actions for their messages" 
ON public.message_actions 
FOR INSERT 
WITH CHECK (
  message_id IN (
    SELECT m.id
    FROM public.messages m
    WHERE m.sender_id = auth.uid()
  )
);

-- Users can update message actions for their own messages
CREATE POLICY "Users can update message actions for their messages" 
ON public.message_actions 
FOR UPDATE 
USING (
  message_id IN (
    SELECT m.id
    FROM public.messages m
    WHERE m.sender_id = auth.uid()
  )
);

-- Users can delete message actions for their own messages
CREATE POLICY "Users can delete message actions for their messages" 
ON public.message_actions 
FOR DELETE 
USING (
  message_id IN (
    SELECT m.id
    FROM public.messages m
    WHERE m.sender_id = auth.uid()
  )
);