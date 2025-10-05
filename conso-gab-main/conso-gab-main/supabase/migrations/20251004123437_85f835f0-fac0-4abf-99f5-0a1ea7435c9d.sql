-- Table pour les likes des images de profil/couverture
CREATE TABLE IF NOT EXISTS public.profile_image_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_type TEXT NOT NULL CHECK (image_type IN ('avatar', 'cover')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, profile_user_id, image_type)
);

-- Enable RLS
ALTER TABLE public.profile_image_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes
CREATE POLICY "Anyone can view profile image likes"
  ON public.profile_image_likes
  FOR SELECT
  USING (true);

-- Users can create their own likes
CREATE POLICY "Users can like profile images"
  ON public.profile_image_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can unlike profile images"
  ON public.profile_image_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_profile_image_likes_profile_user ON public.profile_image_likes(profile_user_id, image_type);
CREATE INDEX idx_profile_image_likes_user ON public.profile_image_likes(user_id);