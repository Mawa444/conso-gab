-- Créer les buckets de stockage pour les catalogues
INSERT INTO storage.buckets (id, name, public) VALUES ('catalog-covers', 'catalog-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Politiques de stockage pour les couvertures de catalogues
CREATE POLICY "Anyone can view catalog covers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'catalog-covers');

CREATE POLICY "Business owners can upload catalog covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'catalog-covers' AND auth.uid() IS NOT NULL);

CREATE POLICY "Business owners can update their catalog covers" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'catalog-covers' AND auth.uid() IS NOT NULL);

-- Politiques de stockage pour les images de produits
CREATE POLICY "Anyone can view product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Business owners can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Business owners can update their product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Modifier la table catalogs pour correspondre aux nouvelles spécifications
ALTER TABLE catalogs DROP COLUMN IF EXISTS description;
ALTER TABLE catalogs ADD COLUMN cover_url TEXT NOT NULL DEFAULT '';
ALTER TABLE catalogs ADD COLUMN cover_blurhash TEXT;
ALTER TABLE catalogs ADD COLUMN category TEXT;
ALTER TABLE catalogs ADD COLUMN subcategory TEXT;
ALTER TABLE catalogs ADD COLUMN geo_city TEXT;
ALTER TABLE catalogs ADD COLUMN geo_district TEXT;
ALTER TABLE catalogs ADD COLUMN language TEXT DEFAULT 'fr';
ALTER TABLE catalogs ADD COLUMN visibility TEXT CHECK (visibility IN ('draft','private','public')) DEFAULT 'draft';
ALTER TABLE catalogs ADD COLUMN seo_score INT DEFAULT 0;
ALTER TABLE catalogs ADD COLUMN keywords TEXT[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN synonyms TEXT[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN phonetics TEXT[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN availability_zone TEXT DEFAULT 'city';

-- Créer une table pour les produits
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID REFERENCES catalogs(id) ON DELETE CASCADE,
  business_id UUID NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT,
  subcategory TEXT,
  price_cents INT NOT NULL,
  currency CHAR(3) DEFAULT 'XAF',
  stock INT DEFAULT 0,
  sku TEXT,
  attributes JSONB DEFAULT '{}',
  geo_city TEXT,
  geo_district TEXT,
  keywords TEXT[] DEFAULT '{}',
  synonyms TEXT[] DEFAULT '{}',
  phonetics TEXT[] DEFAULT '{}',
  seo_score INT DEFAULT 0,
  status TEXT CHECK (status IN ('draft','published','archived')) DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer une table pour les images de produits (strict 1300x1300)
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  blurhash TEXT,
  width INT CHECK (width = 1300),
  height INT CHECK (height = 1300),
  size_bytes INT CHECK (size_bytes <= 2097152),
  format TEXT CHECK (format IN ('avif','webp','jpeg')),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour la recherche de produits
CREATE INDEX IF NOT EXISTS idx_product_search ON products USING GIN ((to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(array_to_string(keywords,' '),''))));

-- RLS pour la table products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published products" 
ON products 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Business owners can manage their products" 
ON products 
FOR ALL 
USING (business_id IN (SELECT business_profiles.id FROM business_profiles WHERE business_profiles.user_id = auth.uid()));

-- RLS pour la table product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product images" 
ON product_images 
FOR SELECT 
USING (true);

CREATE POLICY "Business owners can manage their product images" 
ON product_images 
FOR ALL 
USING (product_id IN (SELECT products.id FROM products WHERE products.business_id IN (SELECT business_profiles.id FROM business_profiles WHERE business_profiles.user_id = auth.uid())));

-- Trigger pour mettre à jour updated_at sur products
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le score SEO
CREATE OR REPLACE FUNCTION calculate_seo_score(
  p_title TEXT,
  p_category TEXT,
  p_price_cents INT,
  p_keywords TEXT[],
  p_synonyms TEXT[],
  p_geo_city TEXT,
  p_attributes JSONB,
  p_image_count INT DEFAULT 0
) RETURNS INT AS $$
DECLARE
  score INT := 0;
BEGIN
  -- Titre (10 points)
  IF p_title IS NOT NULL AND LENGTH(p_title) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Catégorie (10 points)
  IF p_category IS NOT NULL AND LENGTH(p_category) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Prix (10 points)
  IF p_price_cents IS NOT NULL AND p_price_cents > 0 THEN
    score := score + 10;
  END IF;
  
  -- Au moins une photo (15 points)
  IF p_image_count > 0 THEN
    score := score + 15;
  END IF;
  
  -- Attributs clés (20 points)
  IF p_attributes IS NOT NULL AND jsonb_object_keys(p_attributes) IS NOT NULL THEN
    score := score + 20;
  END IF;
  
  -- Mots-clés (10 points)
  IF p_keywords IS NOT NULL AND array_length(p_keywords, 1) >= 3 THEN
    score := score + 10;
  END IF;
  
  -- Synonymes (10 points)
  IF p_synonyms IS NOT NULL AND array_length(p_synonyms, 1) > 0 THEN
    score := score + 10;
  END IF;
  
  -- Zone géo (10 points)
  IF p_geo_city IS NOT NULL AND LENGTH(p_geo_city) > 0 THEN
    score := score + 10;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;