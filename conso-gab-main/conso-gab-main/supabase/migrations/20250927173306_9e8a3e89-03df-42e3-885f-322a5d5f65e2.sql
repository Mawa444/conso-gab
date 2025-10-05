-- Fix the get_my_business_profiles function to correctly return business profiles
DROP FUNCTION IF EXISTS public.get_my_business_profiles();

CREATE OR REPLACE FUNCTION public.get_my_business_profiles()
 RETURNS TABLE(id uuid, business_name text, logo_url text, is_primary boolean, role text, is_owner boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bp.id,
    bp.business_name,
    bp.logo_url,
    bp.is_primary,
    COALESCE(bc.role, 'owner') as role,
    (bp.owner_id = auth.uid() OR bp.user_id = auth.uid()) as is_owner
  FROM business_profiles bp
  LEFT JOIN business_collaborators bc ON bp.id = bc.business_id AND bc.user_id = auth.uid()
  WHERE (bp.owner_id = auth.uid() OR bp.user_id = auth.uid() OR 
         (bc.user_id = auth.uid() AND bc.status = 'accepted'))
    AND bp.is_active = true;
END;
$$;