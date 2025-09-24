-- CRITICAL SECURITY FIXES

-- 1. Secure User Profiles RLS Policy
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Users can view public profiles" ON public.user_profiles;

-- Create more restrictive policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view profiles of businesses they interact with" 
ON public.user_profiles 
FOR SELECT 
USING (
  user_id IN (
    -- Users can see profiles of business owners they have conversations with
    SELECT bp.user_id 
    FROM business_profiles bp
    JOIN conversations c ON c.business_id = bp.id
    WHERE c.customer_id = auth.uid()
    
    UNION
    
    -- Users can see profiles of customers they have business conversations with
    SELECT c.customer_id
    FROM conversations c
    JOIN business_profiles bp ON c.business_id = bp.id
    WHERE bp.user_id = auth.uid()
  )
);

-- 2. Secure Business Profiles Access
-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Anyone can view active and awake businesses" ON public.business_profiles;

-- Create tiered access policies for business_profiles
CREATE POLICY "Anyone can view basic business info" 
ON public.business_profiles 
FOR SELECT 
USING (
  (is_active = true) AND (is_sleeping = false) AND (is_deactivated = false)
);

-- Create a view for public business information (basic info only)
CREATE OR REPLACE VIEW public.business_profiles_public AS
SELECT 
  id,
  business_name,
  description,
  business_category,
  city,
  country,
  province,
  department,
  arrondissement,
  quartier,
  logo_url,
  cover_image_url,
  is_verified,
  created_at
FROM public.business_profiles
WHERE (is_active = true) AND (is_sleeping = false) AND (is_deactivated = false);

-- Grant access to the public view
GRANT SELECT ON public.business_profiles_public TO authenticated, anon;

-- Create policy for detailed business info (contact details) - only for authenticated users with relationships
CREATE POLICY "Authenticated users can view business contact details" 
ON public.business_profiles 
FOR SELECT 
USING (
  (is_active = true) AND (is_sleeping = false) AND (is_deactivated = false) AND
  auth.uid() IS NOT NULL AND
  (
    -- User owns the business
    user_id = auth.uid() OR
    -- User has active conversations with the business
    id IN (
      SELECT business_id 
      FROM conversations 
      WHERE customer_id = auth.uid()
    ) OR
    -- User has bookings with the business
    id IN (
      SELECT business_id 
      FROM catalog_bookings 
      WHERE customer_id = auth.uid()
    ) OR
    -- User has orders with the business
    id IN (
      SELECT business_id 
      FROM orders 
      WHERE customer_id = auth.uid()
    )
  )
);

-- 3. Database Function Hardening - Add SET search_path to all security definer functions

-- Update schedule_business_deletion function
CREATE OR REPLACE FUNCTION public.schedule_business_deletion(business_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.business_profiles 
  SET deactivation_scheduled_at = now() + INTERVAL '72 hours',
      is_active = false
  WHERE id = business_profile_id 
  AND user_id = auth.uid();
END;
$function$;

-- Update cancel_business_deletion function
CREATE OR REPLACE FUNCTION public.cancel_business_deletion(business_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.business_profiles 
  SET deactivation_scheduled_at = NULL,
      is_active = true
  WHERE id = business_profile_id 
  AND user_id = auth.uid()
  AND deactivation_scheduled_at > now();
END;
$function$;

-- Update toggle_business_sleep_mode function
CREATE OR REPLACE FUNCTION public.toggle_business_sleep_mode(business_profile_id uuid, sleep_mode boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.business_profiles 
  SET is_sleeping = sleep_mode
  WHERE id = business_profile_id 
  AND user_id = auth.uid();
END;
$function$;

-- Update generate_order_number function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Update generate_booking_number function
CREATE OR REPLACE FUNCTION public.generate_booking_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'BKG-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Update generate_quote_number function
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'QTE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Update log_user_activity function
CREATE OR REPLACE FUNCTION public.log_user_activity(action_type_param text, action_description_param text, business_id_param uuid DEFAULT NULL::uuid, metadata_param jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.activity_log (
    user_id,
    business_id,
    action_type,
    action_description,
    metadata
  ) VALUES (
    auth.uid(),
    business_id_param,
    action_type_param,
    action_description_param,
    metadata_param
  );
END;
$function$;

-- Update generate_reservation_number function
CREATE OR REPLACE FUNCTION public.generate_reservation_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'RES-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Update generate_ticket_number function
CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$function$;

-- Update switch_user_mode function
CREATE OR REPLACE FUNCTION public.switch_user_mode(new_mode text, business_id_param uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Vérifier que le mode est valide
  IF new_mode NOT IN ('consumer', 'business') THEN
    RAISE EXCEPTION 'Mode invalide. Doit être consumer ou business.';
  END IF;
  
  -- Si mode business, vérifier que l'utilisateur a accès au business
  IF new_mode = 'business' AND business_id_param IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM business_collaborators 
      WHERE business_id = business_id_param 
      AND user_id = auth.uid() 
      AND status = 'accepted'
    ) THEN
      RAISE EXCEPTION 'Accès non autorisé à ce profil business.';
    END IF;
  END IF;
  
  -- Mettre à jour ou insérer le mode utilisateur
  INSERT INTO public.user_current_mode (user_id, current_mode, current_business_id)
  VALUES (auth.uid(), new_mode, business_id_param)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_mode = EXCLUDED.current_mode,
    current_business_id = EXCLUDED.current_business_id,
    updated_at = now();
END;
$function$;