-- =============================================
-- CONFIGURATION ET CORRECTIONS POUR LA PLATEFORME
-- =============================================

-- 1. Ajouter des commentaires pour documenter les fonctions RPC critiques
COMMENT ON FUNCTION public.get_or_create_direct_conversation(uuid, uuid) IS 
'Crée ou récupère une conversation directe entre deux utilisateurs. Style WhatsApp/Messenger - garantit une seule conversation par paire d''utilisateurs.';

COMMENT ON FUNCTION public.get_or_create_business_conversation(uuid, uuid) IS 
'Crée ou récupère une conversation entre un utilisateur et une entreprise. Garantit une seule conversation par paire utilisateur-entreprise.';

-- 2. Créer un index pour améliorer les performances des requêtes de carousel
CREATE INDEX IF NOT EXISTS idx_business_profiles_carousel_images ON business_profiles USING GIN (carousel_images);
CREATE INDEX IF NOT EXISTS idx_business_profiles_active_visible ON business_profiles (is_active, is_sleeping, is_deactivated) WHERE is_active = true AND is_sleeping = false AND is_deactivated = false;

-- 3. Créer une vue pour faciliter l'accès aux données business complètes
CREATE OR REPLACE VIEW public.business_cards_view AS
SELECT 
  bp.id,
  bp.user_id,
  bp.business_name,
  bp.business_category,
  bp.description,
  bp.logo_url,
  bp.cover_image_url,
  bp.carousel_images,
  bp.phone,
  bp.email,
  bp.address,
  bp.city,
  bp.province,
  bp.country,
  bp.latitude,
  bp.longitude,
  bp.is_verified,
  bp.is_active,
  bp.is_sleeping,
  bp.is_deactivated,
  bp.created_at,
  bp.updated_at
FROM business_profiles bp
WHERE bp.is_active = true 
  AND bp.is_sleeping = false 
  AND bp.is_deactivated = false;

-- Ajouter les politiques RLS pour la vue
ALTER VIEW public.business_cards_view SET (security_invoker = on);

COMMENT ON VIEW public.business_cards_view IS 
'Vue simplifiée des cartes d''entreprise actives avec toutes les données nécessaires pour l''affichage (carousel, images, etc.)';

-- 4. Fonction pour vérifier et nettoyer les conversations orphelines
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_conversations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Supprimer les conversations sans participants
  DELETE FROM conversations
  WHERE id NOT IN (
    SELECT DISTINCT conversation_id 
    FROM participants
  );
  
  -- Supprimer les messages orphelins
  DELETE FROM messages
  WHERE conversation_id NOT IN (
    SELECT id FROM conversations
  );
END;
$$;

COMMENT ON FUNCTION public.cleanup_orphaned_conversations IS 
'Nettoie les conversations et messages orphelins pour maintenir l''intégrité des données';

-- 5. Trigger pour synchroniser automatiquement les mises à jour de carousel
CREATE OR REPLACE FUNCTION public.notify_business_card_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Invalider le cache pour forcer le rechargement
  PERFORM pg_notify('business_card_updated', json_build_object(
    'business_id', NEW.id,
    'user_id', NEW.user_id,
    'updated_at', NEW.updated_at
  )::text);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_notify_business_card_update ON business_profiles;
CREATE TRIGGER trigger_notify_business_card_update
  AFTER UPDATE OF carousel_images, cover_image_url, logo_url, business_name, description
  ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_business_card_update();

COMMENT ON FUNCTION public.notify_business_card_update IS 
'Notifie les clients en temps réel des mises à jour de cartes d''entreprise pour synchronisation instantanée';

-- 6. Améliorer la fonction get_user_context pour inclure plus de données
CREATE OR REPLACE FUNCTION public.get_user_context()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_result jsonb;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'profile', null,
      'businesses', '[]'::jsonb,
      'current_mode', null
    );
  END IF;

  SELECT jsonb_build_object(
    'profile', (
      SELECT row_to_json(up)
      FROM user_profiles up
      WHERE up.user_id = v_user_id
      LIMIT 1
    ),
    'businesses', COALESCE((
      SELECT jsonb_agg(row_to_json(bp))
      FROM business_profiles bp
      WHERE bp.user_id = v_user_id
        AND bp.is_active = true
    ), '[]'::jsonb),
    'current_mode', (
      SELECT row_to_json(ucm)
      FROM user_current_mode ucm
      WHERE ucm.user_id = v_user_id
      LIMIT 1
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_user_context IS 
'Récupère le contexte complet de l''utilisateur en une seule requête optimisée';