-- Ajouter les colonnes pour la suppression avec délai de grâce et le mode sommeil
ALTER TABLE public.business_profiles ADD COLUMN deactivation_scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.business_profiles ADD COLUMN is_deactivated BOOLEAN DEFAULT FALSE;
ALTER TABLE public.business_profiles ADD COLUMN is_sleeping BOOLEAN DEFAULT FALSE;

-- Créer une table pour les réponses aux avis
CREATE TABLE public.review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  reply_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur la table review_replies
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour review_replies
CREATE POLICY "Anyone can view review replies" 
ON public.review_replies 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can create replies to their reviews" 
ON public.review_replies 
FOR INSERT 
WITH CHECK (business_id IN (
  SELECT id FROM public.business_profiles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Business owners can update their replies" 
ON public.review_replies 
FOR UPDATE 
USING (business_id IN (
  SELECT id FROM public.business_profiles 
  WHERE user_id = auth.uid()
));

-- Créer une table pour le journal de bord (activity log)
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Activer RLS sur activity_log
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour activity_log
CREATE POLICY "Users can view their own activity log" 
ON public.activity_log 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own activity log" 
ON public.activity_log 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Créer un trigger pour update_updated_at sur review_replies
CREATE TRIGGER update_review_replies_updated_at
BEFORE UPDATE ON public.review_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Créer une fonction pour programmer la suppression d'entreprise
CREATE OR REPLACE FUNCTION public.schedule_business_deletion(
  business_profile_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.business_profiles 
  SET deactivation_scheduled_at = now() + INTERVAL '72 hours',
      is_active = false
  WHERE id = business_profile_id 
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une fonction pour annuler la suppression d'entreprise
CREATE OR REPLACE FUNCTION public.cancel_business_deletion(
  business_profile_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.business_profiles 
  SET deactivation_scheduled_at = NULL,
      is_active = true
  WHERE id = business_profile_id 
  AND user_id = auth.uid()
  AND deactivation_scheduled_at > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une fonction pour activer/désactiver le mode sommeil
CREATE OR REPLACE FUNCTION public.toggle_business_sleep_mode(
  business_profile_id UUID,
  sleep_mode BOOLEAN
) RETURNS VOID AS $$
BEGIN
  UPDATE public.business_profiles 
  SET is_sleeping = sleep_mode
  WHERE id = business_profile_id 
  AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer une fonction pour logger les activités
CREATE OR REPLACE FUNCTION public.log_user_activity(
  action_type_param TEXT,
  action_description_param TEXT,
  business_id_param UUID DEFAULT NULL,
  metadata_param JSONB DEFAULT NULL
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mettre à jour la politique RLS pour masquer les entreprises en sommeil
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.business_profiles;
CREATE POLICY "Anyone can view active and awake businesses" 
ON public.business_profiles 
FOR SELECT 
USING (is_active = true AND is_sleeping = false AND is_deactivated = false);

-- Politique pour que les propriétaires voient toujours leur entreprise
CREATE POLICY "Business owners can always view their business" 
ON public.business_profiles 
FOR SELECT 
USING (user_id = auth.uid());