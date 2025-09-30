-- Supprimer la contrainte d'unicité sur user_id pour permettre plusieurs profils business par utilisateur
-- Un utilisateur peut créer et gérer plusieurs entreprises

ALTER TABLE public.business_profiles 
DROP CONSTRAINT IF EXISTS business_profiles_user_id_key;

-- Optionnellement, créer un index pour améliorer les performances de recherche par user_id
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON public.business_profiles(user_id);

-- S'assurer que owner_id est aussi indexé
CREATE INDEX IF NOT EXISTS idx_business_profiles_owner_id ON public.business_profiles(owner_id);