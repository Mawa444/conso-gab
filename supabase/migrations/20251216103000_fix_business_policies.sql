-- Enable RLS (idempotent)
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Allow everyone (anon + authenticated) to view all business profiles
-- Drop existing policy if it exists to allow re-runnability
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.business_profiles;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.business_profiles
FOR SELECT 
USING (true);

-- Ensure permissions (redundant but safe)
GRANT SELECT ON TABLE public.business_profiles TO anon, authenticated;
