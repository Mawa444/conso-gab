-- Rename old catalog table to backup if it exists (to clear the name 'catalog' if we ever need it, though we use 'catalogs' now)
-- This is just for safety to indicate it's deprecated
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'catalog') THEN
        ALTER TABLE public.catalog RENAME TO catalog_backup;
    END IF;
END $$;

-- Drop new tables if they exist to ensure clean slate (in case of partial previous run)
DROP TABLE IF EXISTS public.catalogs CASCADE;
DROP TABLE IF EXISTS public.business_subscriptions CASCADE;
DROP TABLE IF EXISTS public.business_image_likes CASCADE;

-- Create catalogs table (Plural)
CREATE TABLE public.catalogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    price_currency TEXT DEFAULT 'XAF',
    category TEXT,
    subcategory TEXT,
    catalog_type TEXT CHECK (catalog_type IN ('products', 'services')) DEFAULT 'products',
    cover_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    keywords TEXT[] DEFAULT '{}',
    
    is_public BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    visibility TEXT DEFAULT 'published', -- 'draft', 'published', 'archived'
    
    seo_score INTEGER DEFAULT 0,
    
    delivery_available BOOLEAN DEFAULT false,
    delivery_cost NUMERIC,
    delivery_zones TEXT[] DEFAULT '{}',
    
    on_sale BOOLEAN DEFAULT false,
    sale_percentage NUMERIC,
    
    contact_whatsapp TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    
    geo_city TEXT,
    geo_district TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;

-- Create policies for catalogs
CREATE POLICY "Public catalogs are viewable by everyone" 
ON public.catalogs FOR SELECT 
USING (is_public = true AND is_active = true);

CREATE POLICY "Business owners can view their own catalogs" 
ON public.catalogs FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = catalogs.business_id
));

CREATE POLICY "Business owners can insert their own catalogs" 
ON public.catalogs FOR INSERT 
WITH CHECK (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = catalogs.business_id
));

CREATE POLICY "Business owners can update their own catalogs" 
ON public.catalogs FOR UPDATE 
USING (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = catalogs.business_id
));

CREATE POLICY "Business owners can delete their own catalogs" 
ON public.catalogs FOR DELETE 
USING (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = catalogs.business_id
));

-- Create business_subscriptions table
CREATE TABLE public.business_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    auto_renew BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
CREATE POLICY "Business owners can view their own subscriptions" 
ON public.business_subscriptions FOR SELECT 
USING (auth.uid() IN (
    SELECT user_id FROM public.business_profiles WHERE id = business_subscriptions.business_id
));

-- Create business_image_likes table
CREATE TABLE public.business_image_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    image_type TEXT NOT NULL, -- 'cover' or 'logo'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(business_id, user_id, image_type)
);

-- Enable RLS
ALTER TABLE public.business_image_likes ENABLE ROW LEVEL SECURITY;

-- Policies for image likes
CREATE POLICY "Public can view image likes" 
ON public.business_image_likes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can like images" 
ON public.business_image_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their likes" 
ON public.business_image_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Grant permissions for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalogs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_image_likes TO authenticated;

-- Grant permissions for anon (fixed typo)
GRANT SELECT ON public.catalogs TO anon;
GRANT SELECT ON public.business_image_likes TO anon;
