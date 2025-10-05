-- Migration pour améliorer le système de basculement de profils

-- 1. Ajouter une colonne owner_id à business_profiles pour clarifier la propriété
ALTER TABLE business_profiles ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id);

-- 2. Mettre à jour owner_id avec les données existantes
UPDATE business_profiles SET owner_id = user_id WHERE owner_id IS NULL;

-- 3. Créer une table user_sessions pour l'état du switch (optionnelle mais pratique)
CREATE TABLE IF NOT EXISTS user_sessions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_profile UUID REFERENCES business_profiles(id) ON DELETE SET NULL,
  last_switched TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Activer RLS sur user_sessions
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Policies pour user_sessions
CREATE POLICY "Users can manage their own sessions" 
ON user_sessions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Améliorer les policies de business_profiles pour la sécurité
DROP POLICY IF EXISTS "Business owners can manage their profiles" ON business_profiles;
DROP POLICY IF EXISTS "Anyone can view active business profiles" ON business_profiles;

-- Seuls les propriétaires peuvent voir/modifier leurs profils
CREATE POLICY "business_read_own"
ON business_profiles
FOR SELECT
USING (owner_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "business_edit_own"
ON business_profiles
FOR UPDATE
USING (owner_id = auth.uid() OR user_id = auth.uid());

CREATE POLICY "business_insert_own"
ON business_profiles
FOR INSERT
WITH CHECK (owner_id = auth.uid() OR user_id = auth.uid());

-- Les autres peuvent voir les profils publics mais sans données sensibles
CREATE POLICY "public_business_profiles_read"
ON business_profiles
FOR SELECT
USING (is_active = true AND NOT is_sleeping);

-- 7. Fonction RPC pour basculer de profil de manière sécurisée
CREATE OR REPLACE FUNCTION public.switch_user_profile(profile_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSON;
BEGIN
  -- Vérifier que le profil appartient à l'utilisateur si fourni
  IF profile_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM business_profiles 
      WHERE id = profile_id 
      AND (owner_id = auth.uid() OR user_id = auth.uid())
    ) THEN
      RAISE EXCEPTION 'Profil business non autorisé';
    END IF;
  END IF;
  
  -- Mettre à jour user_current_mode
  INSERT INTO user_current_mode (user_id, current_mode, current_business_id)
  VALUES (
    auth.uid(),
    CASE WHEN profile_id IS NULL THEN 'consumer' ELSE 'business' END,
    profile_id
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_mode = CASE WHEN profile_id IS NULL THEN 'consumer' ELSE 'business' END,
    current_business_id = profile_id,
    updated_at = NOW();
  
  -- Mettre à jour user_sessions
  INSERT INTO user_sessions (user_id, active_profile, last_switched)
  VALUES (auth.uid(), profile_id, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET 
    active_profile = profile_id,
    last_switched = NOW();
  
  -- Retourner le résultat
  SELECT json_build_object(
    'success', true,
    'mode', CASE WHEN profile_id IS NULL THEN 'consumer' ELSE 'business' END,
    'profile_id', profile_id
  ) INTO result;
  
  RETURN result;
END;
$$;

-- 8. Fonction pour récupérer les profils business de l'utilisateur
CREATE OR REPLACE FUNCTION public.get_my_business_profiles()
RETURNS TABLE (
  id UUID,
  business_name TEXT,
  logo_url TEXT,
  is_primary BOOLEAN,
  role TEXT,
  is_owner BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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