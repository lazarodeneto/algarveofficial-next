-- Create a secure view for public profile access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  avatar_url,
  bio
FROM public.profiles;
-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;
-- Comment for documentation
COMMENT ON VIEW public.public_profiles IS 'Publicly accessible view of user profiles with only safe fields exposed.';
