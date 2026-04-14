-- Add icon support to footer links
ALTER TABLE public.footer_links
ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT 'Link';
-- Create table for left sidebar menu items
CREATE TABLE IF NOT EXISTS public.left_menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  translation_key TEXT,
  href TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Link',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.left_menu_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'left_menu_items' AND policyname = 'Anyone can view active left menu items'
  ) THEN
    CREATE POLICY "Anyone can view active left menu items"
    ON public.left_menu_items
    FOR SELECT
    USING (is_active = true);
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'left_menu_items' AND policyname = 'Admins can manage left menu items'
  ) THEN
    CREATE POLICY "Admins can manage left menu items"
    ON public.left_menu_items
    FOR ALL
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
DROP TRIGGER IF EXISTS update_left_menu_items_updated_at ON public.left_menu_items;
CREATE TRIGGER update_left_menu_items_updated_at
BEFORE UPDATE ON public.left_menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Seed defaults (idempotent by href+name)
INSERT INTO public.left_menu_items (name, translation_key, href, icon, display_order)
SELECT v.name, v.translation_key, v.href, v.icon, v.display_order
FROM (
  VALUES
    ('Home', 'nav.home', '/', 'Home', 1),
    ('Visit', 'nav.visit', '/directory', 'MapPin', 2),
    ('Live', 'nav.live', '/live', 'Home', 3),
    ('Invest', 'nav.invest', '/invest', 'TrendingUp', 4),
    ('Destinations', 'nav.destinations', '/destinations', 'Compass', 5),
    ('Blog', 'nav.blog', '/blog', 'BookOpen', 6),
    ('Events', NULL, '/events', 'Calendar', 7),
    ('Partner', NULL, '/partner', 'Users', 8),
    ('Contact', NULL, '/contact', 'Mail', 9)
) AS v(name, translation_key, href, icon, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM public.left_menu_items l
  WHERE l.href = v.href AND l.name = v.name
);
