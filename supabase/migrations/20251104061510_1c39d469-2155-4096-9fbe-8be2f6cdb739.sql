-- Add carousel images field to business_profiles for ad customization
ALTER TABLE public.business_profiles 
ADD COLUMN IF NOT EXISTS carousel_images jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.business_profiles.carousel_images IS 'Array of image URLs for business card carousel ads';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_business_profiles_carousel_images ON public.business_profiles USING GIN (carousel_images);