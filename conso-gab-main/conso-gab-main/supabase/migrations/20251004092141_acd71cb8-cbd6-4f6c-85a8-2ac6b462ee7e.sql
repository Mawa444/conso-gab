-- ============================================
-- CORRECTION DES FONCTIONS SQL SECURITY
-- ============================================
-- Ajout de SET search_path = public sur toutes les fonctions

-- 1. Corriger get_my_business_profiles
CREATE OR REPLACE FUNCTION public.get_my_business_profiles()
 RETURNS TABLE(id uuid, business_name text, logo_url text, is_primary boolean, role text, is_owner boolean)
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- 2. Corriger user_is_conversation_member
CREATE OR REPLACE FUNCTION public.user_is_conversation_member(conversation_id_param uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM conversation_members 
    WHERE conversation_id = conversation_id_param 
    AND user_id = auth.uid() 
    AND is_active = true
  );
END;
$function$;

-- 3. Corriger trigger_new_catalog_notification
CREATE OR REPLACE FUNCTION public.trigger_new_catalog_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  business_name TEXT;
BEGIN
  SELECT bp.business_name INTO business_name
  FROM business_profiles bp
  WHERE bp.id = NEW.business_id;
  
  IF NEW.is_public = true AND NEW.is_active = true THEN
    PERFORM public.notify_business_subscribers(
      NEW.business_id,
      'new_catalog',
      'Nouveau catalogue disponible',
      business_name || ' a publié un nouveau catalogue: ' || NEW.name,
      jsonb_build_object('catalog_id', NEW.id, 'catalog_name', NEW.name)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 4. Corriger trigger_new_comment_notification
CREATE OR REPLACE FUNCTION public.trigger_new_comment_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  business_id_var UUID;
  catalog_name TEXT;
  business_name TEXT;
BEGIN
  SELECT c.business_id, c.name INTO business_id_var, catalog_name
  FROM catalogs c
  WHERE c.id = NEW.catalog_id;
  
  SELECT bp.business_name INTO business_name
  FROM business_profiles bp
  WHERE bp.id = business_id_var;
  
  PERFORM public.notify_business_subscribers(
    business_id_var,
    'new_comment',
    'Nouveau commentaire',
    'Nouveau commentaire sur ' || catalog_name || ' de ' || business_name,
    jsonb_build_object('catalog_id', NEW.catalog_id, 'comment_id', NEW.id)
  );
  
  RETURN NEW;
END;
$function$;

-- 5. Corriger trigger_new_order_notification
CREATE OR REPLACE FUNCTION public.trigger_new_order_notification()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  business_name TEXT;
BEGIN
  SELECT bp.business_name INTO business_name
  FROM business_profiles bp
  WHERE bp.id = NEW.seller_id;
  
  PERFORM public.notify_business_subscribers(
    NEW.seller_id,
    'new_order',
    'Nouvelle commande',
    'Nouvelle commande chez ' || business_name,
    jsonb_build_object('order_id', NEW.id, 'order_number', NEW.order_number)
  );
  
  RETURN NEW;
END;
$function$;

-- 6. Corriger track_catalog_creation
CREATE OR REPLACE FUNCTION public.track_catalog_creation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
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
      NEW.business_id::uuid,
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
$function$;