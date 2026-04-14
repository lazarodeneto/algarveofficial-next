-- Update RLS policy to allow public access to regions visible on either Homepage OR Destinations
DROP POLICY IF EXISTS "Anyone can view active regions" ON public.regions;
CREATE POLICY "Anyone can view public regions" 
ON public.regions 
FOR SELECT 
USING (is_active = true OR is_visible_destinations = true);
