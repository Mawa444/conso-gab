-- Create follower_subscriptions table for users following businesses
CREATE TABLE IF NOT EXISTS public.follower_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscriber_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    notification_types JSONB DEFAULT '{
        "new_catalog": true,
        "new_comment": true,
        "new_message": true,
        "new_order": true,
        "business_update": true
    }'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subscriber_user_id, business_id)
);

-- Enable RLS
ALTER TABLE public.follower_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for follower_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.follower_subscriptions FOR SELECT 
USING (auth.uid() = subscriber_user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.follower_subscriptions FOR INSERT 
WITH CHECK (auth.uid() = subscriber_user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.follower_subscriptions FOR UPDATE 
USING (auth.uid() = subscriber_user_id);

CREATE POLICY "Users can delete their own subscriptions" 
ON public.follower_subscriptions FOR DELETE 
USING (auth.uid() = subscriber_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follower_subscriptions_subscriber 
ON public.follower_subscriptions(subscriber_user_id);

CREATE INDEX IF NOT EXISTS idx_follower_subscriptions_business 
ON public.follower_subscriptions(business_id);

CREATE INDEX IF NOT EXISTS idx_follower_subscriptions_active 
ON public.follower_subscriptions(business_id, is_active) WHERE is_active = true;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.follower_subscriptions TO authenticated;

-- Create updated_at trigger
CREATE TRIGGER update_follower_subscriptions_updated_at
    BEFORE UPDATE ON public.follower_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
