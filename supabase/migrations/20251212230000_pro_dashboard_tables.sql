-- Migration pour le Dashboard Professionnel (Analytics & Tools)
-- Date: 12 Dec 2025

-- 1. Table de tracking des visites (Analytics)
CREATE TABLE IF NOT EXISTS public.business_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Peut être NULL (visiteur anonyme)
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    source TEXT, -- 'qr_code', 'search', 'direct', 'share_link'
    user_agent TEXT,
    device_type TEXT, -- 'mobile', 'desktop', 'tablet'
    ip_hash TEXT -- Anonymized IP hash pour dédoublonnage basique
);

-- Index pour performance des graphiques
CREATE INDEX IF NOT EXISTS idx_business_visits_business_date ON public.business_visits(business_id, visited_at);
CREATE INDEX IF NOT EXISTS idx_business_visits_visitor ON public.business_visits(visitor_id);

-- RLS: Les visites sont insérables par tous (public), mais visibles seulement par le propriétaire du business
ALTER TABLE public.business_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert visits" 
ON public.business_visits FOR INSERT 
TO public 
WITH CHECK (true);

CREATE POLICY "Owners can view their visits" 
ON public.business_visits FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = business_id
));


-- 2. Table de configuration des outils (Tools)
CREATE TABLE IF NOT EXISTS public.business_tool_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL, -- 'catalog', 'appointments', 'reviews', etc.
    is_active BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb, -- Configuration spécifique de l'outil
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(business_id, tool_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_tool_states_business ON public.business_tool_states(business_id);

-- RLS: Seul le propriétaire peut gérer ses outils. Le public peut LIRE (pour savoir si l'onglet doit s'afficher sur la page publique)
ALTER TABLE public.business_tool_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active tools" 
ON public.business_tool_states FOR SELECT 
USING (true);

CREATE POLICY "Owners can manage tools" 
ON public.business_tool_states FOR ALL 
USING (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = business_id
));


-- 3. Table des Likes de Catalogues (Engagement)
CREATE TABLE IF NOT EXISTS public.catalog_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catalog_id UUID NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(catalog_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_catalog_likes_user ON public.catalog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_catalog_likes_catalog ON public.catalog_likes(catalog_id);

ALTER TABLE public.catalog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can like catalogs" 
ON public.catalog_likes FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike catalogs" 
ON public.catalog_likes FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Public can view likes" 
ON public.catalog_likes FOR SELECT 
USING (true);


-- 4. Ajout de la colonne Settings au Profil (Configuration globale)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_profiles' AND column_name = 'settings') THEN
        ALTER TABLE public.business_profiles ADD COLUMN settings JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;


-- 5. Trigger pour mise à jour automatique des statistiques (Optionnel mais recommandé pour perf)
-- Création d'une vue matérialisée simplifiée ou Trigger pour compter les likes sur les catalogues
-- Pour l'instant on reste simple, on fera des COUNT().
