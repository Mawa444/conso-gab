-- Create user profiles table with proper structure for the Gaboma app
CREATE TABLE public.user_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role text NOT NULL CHECK (role IN ('consumer', 'merchant')),
  pseudo text NOT NULL UNIQUE,
  phone text,
  profile_picture_url text,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'restricted', 'private')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public profiles" 
ON public.user_profiles 
FOR SELECT 
USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add trigger for updated_at
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create profile if metadata contains role and pseudo
  IF NEW.raw_user_meta_data ? 'role' AND NEW.raw_user_meta_data ? 'pseudo' THEN
    INSERT INTO public.user_profiles (
      user_id, 
      role, 
      pseudo, 
      phone, 
      profile_picture_url, 
      visibility
    )
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'role',
      NEW.raw_user_meta_data ->> 'pseudo',
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'profile_picture_url',
      COALESCE(NEW.raw_user_meta_data ->> 'visibility', 'public')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_profile();