-- Ajouter une colonne pour tracker la date de mise à jour des images de profil
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS logo_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cover_updated_at TIMESTAMP WITH TIME ZONE;

-- Créer une fonction pour mettre à jour automatiquement ces dates
CREATE OR REPLACE FUNCTION public.update_business_image_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si le logo a changé, mettre à jour logo_updated_at
  IF NEW.logo_url IS DISTINCT FROM OLD.logo_url THEN
    NEW.logo_updated_at = now();
  END IF;
  
  -- Si la couverture a changé, mettre à jour cover_updated_at
  IF NEW.cover_image_url IS DISTINCT FROM OLD.cover_image_url THEN
    NEW.cover_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_business_image_timestamps_trigger ON public.business_profiles;
CREATE TRIGGER update_business_image_timestamps_trigger
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_business_image_timestamps();

-- Initialiser les dates pour les images existantes
UPDATE public.business_profiles 
SET logo_updated_at = updated_at 
WHERE logo_url IS NOT NULL AND logo_updated_at IS NULL;

UPDATE public.business_profiles 
SET cover_updated_at = updated_at 
WHERE cover_image_url IS NOT NULL AND cover_updated_at IS NULL;