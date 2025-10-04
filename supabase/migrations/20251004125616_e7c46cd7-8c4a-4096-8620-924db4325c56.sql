-- Ajouter des colonnes pour tracker les dates de mise à jour des images de profil consommateur
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cover_updated_at TIMESTAMP WITH TIME ZONE;

-- Créer une fonction pour mettre à jour automatiquement ces dates
CREATE OR REPLACE FUNCTION public.update_profile_image_timestamps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Si l'avatar a changé, mettre à jour avatar_updated_at
  IF NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    NEW.avatar_updated_at = now();
  END IF;
  
  -- Si la couverture a changé, mettre à jour cover_updated_at
  IF NEW.cover_image_url IS DISTINCT FROM OLD.cover_image_url THEN
    NEW.cover_updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_profile_image_timestamps_trigger ON public.profiles;
CREATE TRIGGER update_profile_image_timestamps_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_image_timestamps();

-- Initialiser les dates pour les images existantes
UPDATE public.profiles 
SET avatar_updated_at = updated_at 
WHERE avatar_url IS NOT NULL AND avatar_updated_at IS NULL;

UPDATE public.profiles 
SET cover_updated_at = updated_at 
WHERE cover_image_url IS NOT NULL AND cover_updated_at IS NULL;