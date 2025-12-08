
-- Fix the user profile trigger to handle duplicate pseudos
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  base_pseudo TEXT;
  final_pseudo TEXT;
  counter INT := 0;
BEGIN
  IF NEW.raw_user_meta_data ? 'role' AND NEW.raw_user_meta_data ? 'pseudo' THEN
    base_pseudo := NEW.raw_user_meta_data ->> 'pseudo';
    final_pseudo := base_pseudo;
    
    -- Check if pseudo already exists and generate unique one if needed
    WHILE EXISTS (SELECT 1 FROM public.user_profiles WHERE pseudo = final_pseudo) LOOP
      counter := counter + 1;
      final_pseudo := base_pseudo || '_' || counter;
    END LOOP;
    
    INSERT INTO public.user_profiles (
      user_id, role, pseudo, phone, profile_picture_url, visibility,
      country, province, department, arrondissement, quartier, address,
      latitude, longitude
    )
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'consumer'),
      final_pseudo,
      NEW.raw_user_meta_data ->> 'phone',
      NEW.raw_user_meta_data ->> 'profile_picture_url',
      COALESCE(NEW.raw_user_meta_data ->> 'visibility', 'public'),
      COALESCE(NEW.raw_user_meta_data ->> 'country', 'Gabon'),
      NEW.raw_user_meta_data ->> 'province',
      NEW.raw_user_meta_data ->> 'department',
      NEW.raw_user_meta_data ->> 'arrondissement',
      NEW.raw_user_meta_data ->> 'quartier',
      NEW.raw_user_meta_data ->> 'address',
      (NEW.raw_user_meta_data ->> 'latitude')::DOUBLE PRECISION,
      (NEW.raw_user_meta_data ->> 'longitude')::DOUBLE PRECISION
    )
    ON CONFLICT (user_id) DO UPDATE SET
      pseudo = EXCLUDED.pseudo,
      phone = COALESCE(EXCLUDED.phone, user_profiles.phone),
      country = COALESCE(EXCLUDED.country, user_profiles.country),
      province = COALESCE(EXCLUDED.province, user_profiles.province),
      department = COALESCE(EXCLUDED.department, user_profiles.department),
      arrondissement = COALESCE(EXCLUDED.arrondissement, user_profiles.arrondissement),
      quartier = COALESCE(EXCLUDED.quartier, user_profiles.quartier),
      address = COALESCE(EXCLUDED.address, user_profiles.address),
      latitude = COALESCE(EXCLUDED.latitude, user_profiles.latitude),
      longitude = COALESCE(EXCLUDED.longitude, user_profiles.longitude),
      updated_at = NOW();
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'Error creating user profile: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Create missing RPC function for conversations
CREATE OR REPLACE FUNCTION public.get_conversations_for_user(p_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
  id UUID,
  title TEXT,
  type TEXT,
  business_id UUID,
  business_name TEXT,
  last_message_content TEXT,
  last_message_at TIMESTAMPTZ,
  unread_count BIGINT,
  other_participant_name TEXT,
  other_participant_avatar TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.title,
    c.type::TEXT,
    c.business_id,
    bp.business_name,
    (SELECT m.content FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
    (SELECT m.created_at FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1),
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.sender_id != p_user_id AND m.status != 'read')::BIGINT,
    (SELECT up.pseudo FROM participants pa JOIN user_profiles up ON up.user_id = pa.user_id WHERE pa.conversation_id = c.id AND pa.user_id != p_user_id LIMIT 1),
    (SELECT up.profile_picture_url FROM participants pa JOIN user_profiles up ON up.user_id = pa.user_id WHERE pa.conversation_id = c.id AND pa.user_id != p_user_id LIMIT 1)
  FROM conversations c
  JOIN participants p ON p.conversation_id = c.id
  LEFT JOIN business_profiles bp ON bp.id = c.business_id
  WHERE p.user_id = p_user_id
  ORDER BY (SELECT MAX(created_at) FROM messages WHERE conversation_id = c.id) DESC NULLS LAST;
END;
$$;
