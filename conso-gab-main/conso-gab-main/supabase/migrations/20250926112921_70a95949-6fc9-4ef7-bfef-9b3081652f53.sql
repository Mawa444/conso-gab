-- Add PIN system columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS pin_blocked_until timestamptz,
ADD COLUMN IF NOT EXISTS pin_attempts_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS pin_last_attempt timestamptz;

-- Create interconnectivity table for tracking actions across the app
CREATE TABLE IF NOT EXISTS public.action_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  action_type text NOT NULL, -- 'create_catalog', 'create_order', 'send_message', etc.
  source_entity_type text, -- 'conversation', 'business', 'catalog'
  source_entity_id uuid,
  target_entity_type text, -- 'catalog', 'order', 'message'
  target_entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_action_tracking_user_id ON public.action_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_action_tracking_source ON public.action_tracking(source_entity_type, source_entity_id);
CREATE INDEX IF NOT EXISTS idx_action_tracking_target ON public.action_tracking(target_entity_type, target_entity_id);

-- Enable RLS
ALTER TABLE public.action_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policy for action tracking
CREATE POLICY "Users can view their own actions" ON public.action_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own action tracking" ON public.action_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Real-time subscription setup for conversations
ALTER publication supabase_realtime ADD TABLE public.conversations;
ALTER publication supabase_realtime ADD TABLE public.messages;
ALTER publication supabase_realtime ADD TABLE public.participants;

-- Create function to automatically track catalog creation from messaging
CREATE OR REPLACE FUNCTION public.track_catalog_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If catalog is created through messaging context, track the interconnection
  IF NEW.metadata::jsonb ? 'conversation_id' THEN
    INSERT INTO public.action_tracking (
      user_id,
      action_type,
      source_entity_type,
      source_entity_id,
      target_entity_type,
      target_entity_id,
      metadata
    ) VALUES (
      NEW.business_id::uuid, -- Will be resolved to actual user_id in app
      'create_catalog_from_messaging',
      'conversation',
      (NEW.metadata::jsonb->>'conversation_id')::uuid,
      'catalog',
      NEW.id,
      jsonb_build_object(
        'catalog_name', NEW.title,
        'business_id', NEW.business_id,
        'created_from', 'messaging'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for catalog tracking
DROP TRIGGER IF EXISTS trigger_track_catalog_creation ON public.catalogs;
CREATE TRIGGER trigger_track_catalog_creation
  AFTER INSERT ON public.catalogs
  FOR EACH ROW
  EXECUTE FUNCTION public.track_catalog_creation();