-- Tables pour le système de géolocalisation sécurisé

-- Table pour les demandes de position
CREATE TABLE public.location_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
    requester_id uuid NOT NULL,
    target_id uuid NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    share_mode text DEFAULT 'one_time' CHECK (share_mode IN ('one_time', 'live')),
    purpose text DEFAULT 'general' CHECK (purpose IN ('delivery', 'meeting', 'visit', 'general')),
    expires_at timestamp with time zone DEFAULT (now() + interval '30 minutes'),
    shared_location jsonb DEFAULT NULL, -- Position partagée (chiffrée)
    shared_at timestamp with time zone DEFAULT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table pour l'historique des partages de position (audit)
CREATE TABLE public.location_share_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    request_id uuid REFERENCES public.location_requests(id) ON DELETE CASCADE,
    shared_by uuid NOT NULL,
    shared_to uuid NOT NULL,
    share_mode text NOT NULL,
    purpose text DEFAULT 'general',
    location_data jsonb NOT NULL, -- Position partagée (chiffrée)
    shared_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone NOT NULL
);

-- Ajouter colonnes pour les positions sécurisées aux profils existants
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS home_location jsonb DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS home_location_type text DEFAULT 'private' CHECK (home_location_type IN ('private', 'shared_with_contacts'));
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS location_updated_at timestamp with time zone DEFAULT NULL;

ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS office_location jsonb DEFAULT NULL;
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS office_location_type text DEFAULT 'private' CHECK (office_location_type IN ('private', 'public', 'shared_with_contacts'));
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS office_location_updated_at timestamp with time zone DEFAULT NULL;

-- RLS pour location_requests
ALTER TABLE public.location_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create location requests" ON public.location_requests
FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can view their location requests" ON public.location_requests
FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = target_id);

CREATE POLICY "Target users can update request status" ON public.location_requests
FOR UPDATE USING (auth.uid() = target_id);

CREATE POLICY "Requester can view shared location" ON public.location_requests
FOR SELECT USING (auth.uid() = requester_id AND status = 'accepted');

-- RLS pour location_share_history
ALTER TABLE public.location_share_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their location share history" ON public.location_share_history
FOR SELECT USING (auth.uid() = shared_by OR auth.uid() = shared_to);

CREATE POLICY "Users can insert their location shares" ON public.location_share_history
FOR INSERT WITH CHECK (auth.uid() = shared_by);

-- Triggers pour updated_at
CREATE TRIGGER update_location_requests_updated_at
    BEFORE UPDATE ON public.location_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour les performances
CREATE INDEX idx_location_requests_conversation ON public.location_requests(conversation_id);
CREATE INDEX idx_location_requests_requester ON public.location_requests(requester_id);
CREATE INDEX idx_location_requests_target ON public.location_requests(target_id);
CREATE INDEX idx_location_requests_status ON public.location_requests(status);
CREATE INDEX idx_location_requests_expires ON public.location_requests(expires_at);

-- Fonction pour nettoyer les demandes expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_location_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.location_requests 
  SET status = 'expired'
  WHERE expires_at < now() 
  AND status = 'pending';
END;
$$;