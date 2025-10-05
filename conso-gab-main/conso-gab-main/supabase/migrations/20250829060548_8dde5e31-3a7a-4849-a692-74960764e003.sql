-- Table pour gérer les collaborateurs sur les profils business
CREATE TABLE public.business_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  permissions JSONB DEFAULT '{}',
  invited_by UUID,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(business_id, user_id)
);

-- Activer RLS
ALTER TABLE public.business_collaborators ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour business_collaborators
CREATE POLICY "Business owners can manage collaborators"
ON public.business_collaborators
FOR ALL
USING (
  business_id IN (
    SELECT id FROM business_profiles 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Collaborators can view their assignments"
ON public.business_collaborators
FOR SELECT
USING (user_id = auth.uid());

-- Ajouter une colonne pour indiquer si un business_profile est le principal
ALTER TABLE public.business_profiles 
ADD COLUMN is_primary BOOLEAN DEFAULT false;

-- Table pour stocker le mode actuel de l'utilisateur (business ou consumer)
CREATE TABLE public.user_current_mode (
  user_id UUID NOT NULL PRIMARY KEY,
  current_mode TEXT NOT NULL DEFAULT 'consumer' CHECK (current_mode IN ('consumer', 'business')),
  current_business_id UUID NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS pour user_current_mode
ALTER TABLE public.user_current_mode ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_current_mode
CREATE POLICY "Users can manage their own mode"
ON public.user_current_mode
FOR ALL
USING (user_id = auth.uid());

-- Fonction pour créer automatiquement un business_collaborator quand un business_profile est créé
CREATE OR REPLACE FUNCTION public.create_business_owner_collaborator()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer automatiquement le propriétaire comme collaborateur
  INSERT INTO public.business_collaborators (
    business_id,
    user_id,
    role,
    status,
    accepted_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'owner',
    'accepted',
    now()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le collaborateur propriétaire
CREATE TRIGGER create_owner_collaborator_trigger
  AFTER INSERT ON public.business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_business_owner_collaborator();

-- Fonction pour changer le mode utilisateur
CREATE OR REPLACE FUNCTION public.switch_user_mode(
  new_mode TEXT,
  business_id_param UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger pour mettre à jour updated_at sur business_collaborators
CREATE TRIGGER update_business_collaborators_updated_at
  BEFORE UPDATE ON public.business_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();