-- Fix the user_can_view_business_contacts function
-- The conversations table doesn't have business_id or customer_id columns
-- We need to check through participants instead

CREATE OR REPLACE FUNCTION public.user_can_view_business_contacts(business_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    -- Check if user participated in conversations related to this business
    -- We need to join through participants to get the user_id
    SELECT 1 
    FROM conversations c
    JOIN participants p ON c.id = p.conversation_id
    WHERE p.user_id = auth.uid()
    AND c.origin_type = 'business'
    AND c.origin_id = business_id_param
  ) OR EXISTS (
    SELECT 1 FROM catalog_bookings WHERE business_id = business_id_param AND customer_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM orders 
    WHERE seller_id = business_id_param 
    AND buyer_id = auth.uid()
  );
$function$;