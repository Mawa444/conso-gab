-- Créer les buckets de stockage pour les catalogues
INSERT INTO storage.buckets (id, name, public) VALUES ('catalog-covers', 'catalog-covers', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING;

-- Politiques de stockage pour les couvertures de catalogues
DROP POLICY IF EXISTS "Anyone can view catalog covers" ON storage.objects;
CREATE POLICY "Anyone can view catalog covers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'catalog-covers');

DROP POLICY IF EXISTS "Business owners can upload catalog covers" ON storage.objects;
CREATE POLICY "Business owners can upload catalog covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'catalog-covers' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Business owners can update their catalog covers" ON storage.objects;
CREATE POLICY "Business owners can update their catalog covers" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'catalog-covers' AND auth.uid() IS NOT NULL);

-- Politiques de stockage pour les images de produits
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Business owners can upload product images" ON storage.objects;
CREATE POLICY "Business owners can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Business owners can update their product images" ON storage.objects;
CREATE POLICY "Business owners can update their product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Modifier la table catalogs pour correspondre aux nouvelles spécifications
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_url TEXT DEFAULT '';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_blurhash TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS subcategory TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS geo_city TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS geo_district TEXT;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'fr';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'draft';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS synonyms TEXT[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS phonetics TEXT[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS availability_zone TEXT DEFAULT 'city';

-- Ajouter contrainte de vérification pour visibility
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'catalogs_visibility_check') THEN
        ALTER TABLE catalogs ADD CONSTRAINT catalogs_visibility_check CHECK (visibility IN ('draft','private','public'));
    END IF;
END $$;