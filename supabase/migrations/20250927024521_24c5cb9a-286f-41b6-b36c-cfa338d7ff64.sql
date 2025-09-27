-- Ajouter une colonne pour les réseaux sociaux
ALTER TABLE public.business_profiles 
ADD COLUMN social_media jsonb DEFAULT '{}'::jsonb;