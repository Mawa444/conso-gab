-- Table pour les likes des images de profil business (logo et couverture)
CREATE TABLE IF NOT EXISTS public.business_image_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('logo', 'cover')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id, image_type)
);

-- Enable RLS
ALTER TABLE public.business_image_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view business image likes"
  ON public.business_image_likes
  FOR SELECT
  USING (true);

-- Users can create their own likes
CREATE POLICY "Users can like business images"
  ON public.business_image_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can unlike business images"
  ON public.business_image_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_business_image_likes_business ON public.business_image_likes(business_id, image_type);
CREATE INDEX idx_business_image_likes_user ON public.business_image_likes(user_id);