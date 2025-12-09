-- ENSURE PERMISSIONS
-- Sometimes creating tables via SQL editor doesn't automatically grant access to the API roles.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant access to business_profiles
GRANT ALL ON TABLE public.business_profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_profiles TO anon, authenticated;

-- Grant access to business_image_likes
GRANT ALL ON TABLE public.business_image_likes TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.business_image_likes TO anon, authenticated;

-- Grant access to profile_image_likes
GRANT ALL ON TABLE public.profile_image_likes TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profile_image_likes TO anon, authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_unified_profiles_batch(UUID[]) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_nearest_businesses(double precision, double precision, int, int) TO anon, authenticated, service_role;
