-- Fix RLS to allow catalog creation by business owners
-- Drop existing policy if it exists and recreate with correct name
DROP POLICY IF EXISTS "Business owners can create catalogs" ON public.catalogs;

-- Create a specific INSERT policy for catalogs that allows business owners to create catalogs
CREATE POLICY "business_owners_can_create_catalogs"
ON public.catalogs
FOR INSERT
TO authenticated
WITH CHECK (
  business_id IN (
    SELECT bp.id FROM public.business_profiles bp
    WHERE bp.user_id = auth.uid()
  )
);