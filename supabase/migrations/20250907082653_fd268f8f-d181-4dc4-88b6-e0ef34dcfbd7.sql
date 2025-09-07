-- Fix RLS to allow catalog creation by business owners
-- Ensure a specific INSERT policy exists for catalogs
CREATE POLICY IF NOT EXISTS "Business owners can create catalogs"
ON public.catalogs
FOR INSERT
WITH CHECK (
  business_id IN (
    SELECT bp.id FROM public.business_profiles bp
    WHERE bp.user_id = auth.uid()
  )
);
