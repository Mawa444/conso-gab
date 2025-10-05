-- Corriger les erreurs de récursion infinie dans business_profiles

-- D'abord, supprimer la politique problématique
DROP POLICY IF EXISTS "Authenticated users can view business contact details" ON public.business_profiles;

-- Créer une fonction security definer pour éviter la récursion
CREATE OR REPLACE FUNCTION public.user_can_view_business_contacts(business_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM conversations WHERE business_id = business_id_param AND customer_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM catalog_bookings WHERE business_id = business_id_param AND customer_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM orders WHERE business_id = business_id_param AND customer_id = auth.uid()
  );
$$;

-- Recréer la politique sans récursion
CREATE POLICY "Authenticated users can view business contact details" 
ON public.business_profiles
FOR SELECT 
USING (
  (is_active = true) 
  AND (is_sleeping = false) 
  AND (is_deactivated = false) 
  AND (auth.uid() IS NOT NULL) 
  AND (
    (user_id = auth.uid()) 
    OR public.user_can_view_business_contacts(id)
  )
);