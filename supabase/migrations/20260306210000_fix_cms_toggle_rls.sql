-- Fix FOR ALL USING-only RLS policies on regions, cities, categories.
-- Split into explicit operations with WITH CHECK so UPDATE/INSERT work
-- correctly in PostgREST (same pattern as homepage_settings fix in 20260207114859).

-- REGIONS
DROP POLICY IF EXISTS "Admins and editors can manage regions" ON public.regions;
CREATE POLICY "Admins can select all regions" ON public.regions
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert regions" ON public.regions
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update regions" ON public.regions
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete regions" ON public.regions
  FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- CITIES
DROP POLICY IF EXISTS "Admins and editors can manage cities" ON public.cities;
CREATE POLICY "Admins can select all cities" ON public.cities
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert cities" ON public.cities
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update cities" ON public.cities
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete cities" ON public.cities
  FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
-- CATEGORIES
DROP POLICY IF EXISTS "Admins and editors can manage categories" ON public.categories;
CREATE POLICY "Admins can select all categories" ON public.categories
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
