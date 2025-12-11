-- Correction des search_path pour les fonctions
CREATE OR REPLACE FUNCTION public.inherit_business_location_for_story()
RETURNS TRIGGER AS $$
BEGIN
  SELECT 
    latitude, longitude, city, quartier, location
  INTO 
    NEW.latitude, NEW.longitude, NEW.geo_city, NEW.geo_district, NEW.location
  FROM public.business_profiles 
  WHERE id = NEW.business_id;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.cleanup_expired_stories()
RETURNS void AS $$
BEGIN
  DELETE FROM public.business_stories WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;