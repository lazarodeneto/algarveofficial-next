-- Create table for footer menu sections
CREATE TABLE public.footer_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Create table for footer menu links
CREATE TABLE public.footer_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES public.footer_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
-- Enable Row Level Security
ALTER TABLE public.footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links ENABLE ROW LEVEL SECURITY;
-- RLS Policies for footer_sections
CREATE POLICY "Anyone can view active footer sections" 
ON public.footer_sections 
FOR SELECT 
USING (is_active = true);
CREATE POLICY "Admins can manage footer sections" 
ON public.footer_sections 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));
-- RLS Policies for footer_links
CREATE POLICY "Anyone can view active footer links" 
ON public.footer_links 
FOR SELECT 
USING (is_active = true);
CREATE POLICY "Admins can manage footer links" 
ON public.footer_links 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));
-- Create trigger for automatic timestamp updates on footer_sections
CREATE TRIGGER update_footer_sections_updated_at
BEFORE UPDATE ON public.footer_sections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create trigger for automatic timestamp updates on footer_links
CREATE TRIGGER update_footer_links_updated_at
BEFORE UPDATE ON public.footer_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Insert default footer sections
INSERT INTO public.footer_sections (title, slug, display_order) VALUES
  ('Regions', 'regions', 1),
  ('Categories', 'categories', 2),
  ('Company', 'company', 3),
  ('Legal', 'legal', 4);
-- Insert default footer links for Regions
INSERT INTO public.footer_links (section_id, name, href, display_order)
SELECT id, 'Golden Triangle', '/destinations/golden-triangle', 1 FROM public.footer_sections WHERE slug = 'regions'
UNION ALL
SELECT id, 'Vilamoura Prestige', '/destinations/vilamoura-prestige', 2 FROM public.footer_sections WHERE slug = 'regions'
UNION ALL
SELECT id, 'Carvoeiro Cliffs', '/destinations/carvoeiro-cliffs', 3 FROM public.footer_sections WHERE slug = 'regions'
UNION ALL
SELECT id, 'Lagos Signature', '/destinations/lagos-signature', 4 FROM public.footer_sections WHERE slug = 'regions'
UNION ALL
SELECT id, 'Tavira Heritage', '/destinations/tavira-heritage', 5 FROM public.footer_sections WHERE slug = 'regions';
-- Insert default footer links for Categories
INSERT INTO public.footer_links (section_id, name, href, display_order)
SELECT id, 'Premium Accommodation', '/directory?category=1', 1 FROM public.footer_sections WHERE slug = 'categories'
UNION ALL
SELECT id, 'Fine Dining', '/directory?category=2', 2 FROM public.footer_sections WHERE slug = 'categories'
UNION ALL
SELECT id, 'Golf Experiences', '/directory?category=3', 3 FROM public.footer_sections WHERE slug = 'categories'
UNION ALL
SELECT id, 'Wellness & Spas', '/directory?category=6', 4 FROM public.footer_sections WHERE slug = 'categories'
UNION ALL
SELECT id, 'VIP Concierge', '/directory?category=8', 5 FROM public.footer_sections WHERE slug = 'categories';
-- Insert default footer links for Company
INSERT INTO public.footer_links (section_id, name, href, display_order)
SELECT id, 'About Us', '/about', 1 FROM public.footer_sections WHERE slug = 'company'
UNION ALL
SELECT id, 'Become a Partner', '/partner', 2 FROM public.footer_sections WHERE slug = 'company'
UNION ALL
SELECT id, 'Blog', '/blog', 3 FROM public.footer_sections WHERE slug = 'company'
UNION ALL
SELECT id, 'Events', '/events', 4 FROM public.footer_sections WHERE slug = 'company'
UNION ALL
SELECT id, 'Contact', '/contact', 5 FROM public.footer_sections WHERE slug = 'company';
-- Insert default footer links for Legal
INSERT INTO public.footer_links (section_id, name, href, display_order)
SELECT id, 'Privacy Policy', '/privacy', 1 FROM public.footer_sections WHERE slug = 'legal'
UNION ALL
SELECT id, 'Terms of Service', '/terms', 2 FROM public.footer_sections WHERE slug = 'legal'
UNION ALL
SELECT id, 'Cookie Policy', '/cookies', 3 FROM public.footer_sections WHERE slug = 'legal';
