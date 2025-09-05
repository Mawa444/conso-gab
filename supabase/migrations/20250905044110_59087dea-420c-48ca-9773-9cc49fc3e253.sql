-- Mise à jour de la table catalogs pour supporter les galeries d'images
ALTER TABLE public.catalogs 
ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;

-- Création du bucket pour les galeries d'images des catalogues
INSERT INTO storage.buckets (id, name, public) 
VALUES ('catalog-images', 'catalog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies pour le bucket catalog-images
CREATE POLICY "Anyone can view catalog images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'catalog-images');

CREATE POLICY "Business owners can upload catalog images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'catalog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Business owners can update their catalog images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'catalog-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Business owners can delete their catalog images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'catalog-images' AND auth.uid() IS NOT NULL);

-- Mise à jour de la table products pour supporter les galeries d'images aussi
-- (Les produits devraient aussi utiliser le format 16:9)