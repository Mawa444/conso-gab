-- Ajouter les colonnes nécessaires pour les nouvelles fonctionnalités de catalogue
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS catalog_type text DEFAULT 'products' CHECK (catalog_type IN ('products', 'services'));
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS has_limited_quantity boolean DEFAULT false;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS on_sale boolean DEFAULT false;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS sale_percentage integer DEFAULT 0;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS delivery_available boolean DEFAULT false;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS delivery_zones text[] DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS delivery_cost numeric DEFAULT 0;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS contact_whatsapp text;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS contact_phone text;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS business_hours jsonb DEFAULT '{}';
ALTER TABLE catalogs ADD COLUMN IF NOT EXISTS cover_image_url text;

-- Créer table pour les commentaires sur les catalogues
CREATE TABLE IF NOT EXISTS catalog_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id uuid NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer table pour les likes sur les catalogues
CREATE TABLE IF NOT EXISTS catalog_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id uuid NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(catalog_id, user_id)
);

-- Créer table pour les commentaires sur les images de catalogue
CREATE TABLE IF NOT EXISTS catalog_image_comments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id uuid NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Créer table pour les likes sur les images de catalogue
CREATE TABLE IF NOT EXISTS catalog_image_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  catalog_id uuid NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(catalog_id, image_url, user_id)
);

-- RLS policies pour catalog_comments
ALTER TABLE catalog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view catalog comments" ON catalog_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create catalog comments" ON catalog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own catalog comments" ON catalog_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own catalog comments" ON catalog_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies pour catalog_likes
ALTER TABLE catalog_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view catalog likes" ON catalog_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their catalog likes" ON catalog_likes
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies pour catalog_image_comments
ALTER TABLE catalog_image_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view image comments" ON catalog_image_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create image comments" ON catalog_image_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image comments" ON catalog_image_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image comments" ON catalog_image_comments
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies pour catalog_image_likes
ALTER TABLE catalog_image_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view image likes" ON catalog_image_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their image likes" ON catalog_image_likes
  FOR ALL USING (auth.uid() = user_id);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_catalog_comments()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_catalog_comments_updated_at
    BEFORE UPDATE ON catalog_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_catalog_comments();

CREATE TRIGGER update_catalog_image_comments_updated_at
    BEFORE UPDATE ON catalog_image_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_catalog_comments();