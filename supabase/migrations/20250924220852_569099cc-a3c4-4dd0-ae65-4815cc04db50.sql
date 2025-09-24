-- Fix security issues from previous migration

-- 1. Fix Security Definer View issue - Drop the problematic view and use RLS policies instead
DROP VIEW IF EXISTS public.business_profiles_public;

-- Remove the grant that's no longer needed
-- (The view no longer exists so grants are automatically removed)

-- 2. Fix remaining functions without SET search_path
-- Update handle_new_user_profile function
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update create_business_owner_collaborator function
CREATE OR REPLACE FUNCTION public.create_business_owner_collaborator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Créer automatiquement le propriétaire comme collaborateur
  INSERT INTO public.business_collaborators (
    business_id,
    user_id,
    role,
    status,
    accepted_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'owner',
    'accepted',
    now()
  );
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function (if exists)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, account_type)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::account_type, 'individual')
  );
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_catalog_comments function
CREATE OR REPLACE FUNCTION public.update_updated_at_catalog_comments()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;