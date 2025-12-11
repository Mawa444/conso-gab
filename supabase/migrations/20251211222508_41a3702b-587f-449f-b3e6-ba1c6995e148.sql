-- =====================================================
-- SYSTÈME D'ANNONCES ÉPHÉMÈRES (STORIES BUSINESS 24H)
-- =====================================================

-- Table des annonces éphémères (comme les statuts WhatsApp)
CREATE TABLE IF NOT EXISTS public.business_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  
  -- Contenu
  title TEXT,
  description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  cover_url TEXT,
  
  -- Type d'annonce
  story_type TEXT NOT NULL DEFAULT 'announcement' CHECK (story_type IN ('announcement', 'flash_sale', 'promo', 'new_arrival', 'event', 'discount')),
  
  -- Promotion/Vente flash
  original_price NUMERIC,
  promo_price NUMERIC,
  discount_percentage NUMERIC,
  promo_code TEXT,
  
  -- Géolocalisation (héritée du business)
  latitude NUMERIC,
  longitude NUMERIC,
  geo_city TEXT,
  geo_district TEXT,
  location GEOGRAPHY(POINT, 4326),
  
  -- Référence optionnelle à un catalogue/produit
  catalog_id UUID REFERENCES public.catalogs(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  
  -- Visibilité et statut
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours'),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_business_stories_business_id ON public.business_stories(business_id);
CREATE INDEX IF NOT EXISTS idx_business_stories_expires_at ON public.business_stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_business_stories_story_type ON public.business_stories(story_type);
CREATE INDEX IF NOT EXISTS idx_business_stories_active ON public.business_stories(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_business_stories_location ON public.business_stories USING GIST(location);

-- Enable RLS
ALTER TABLE public.business_stories ENABLE ROW LEVEL SECURITY;

-- Politique: Tout le monde peut voir les stories actives et non expirées
CREATE POLICY "Public can view active stories" 
ON public.business_stories 
FOR SELECT 
USING (is_active = true AND expires_at > now());

-- Politique: Les propriétaires peuvent créer des stories
CREATE POLICY "Business owners can create stories" 
ON public.business_stories 
FOR INSERT 
WITH CHECK (
  business_id IN (
    SELECT id FROM public.business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- Politique: Les propriétaires peuvent mettre à jour leurs stories
CREATE POLICY "Business owners can update their stories" 
ON public.business_stories 
FOR UPDATE 
USING (
  business_id IN (
    SELECT id FROM public.business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- Politique: Les propriétaires peuvent supprimer leurs stories
CREATE POLICY "Business owners can delete their stories" 
ON public.business_stories 
FOR DELETE 
USING (
  business_id IN (
    SELECT id FROM public.business_profiles 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- Fonction pour hériter automatiquement la géolocalisation du business
CREATE OR REPLACE FUNCTION public.inherit_business_location_for_story()
RETURNS TRIGGER AS $$
BEGIN
  -- Récupérer la localisation du business parent
  SELECT 
    latitude, longitude, city, quartier, location
  INTO 
    NEW.latitude, NEW.longitude, NEW.geo_city, NEW.geo_district, NEW.location
  FROM public.business_profiles 
  WHERE id = NEW.business_id;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour hériter la localisation
DROP TRIGGER IF EXISTS inherit_location_on_story_insert ON public.business_stories;
CREATE TRIGGER inherit_location_on_story_insert
  BEFORE INSERT ON public.business_stories
  FOR EACH ROW
  EXECUTE FUNCTION public.inherit_business_location_for_story();

-- Table pour les vues de stories (analytics)
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.business_stories(id) ON DELETE CASCADE,
  user_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);

ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert story views" 
ON public.story_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Story owners can view their story analytics" 
ON public.story_views 
FOR SELECT 
USING (
  story_id IN (
    SELECT s.id FROM public.business_stories s
    JOIN public.business_profiles bp ON s.business_id = bp.id
    WHERE bp.user_id = auth.uid() OR bp.owner_id = auth.uid()
  )
);

-- Fonction pour supprimer automatiquement les stories expirées (à appeler via cron job)
CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM public.business_stories WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;