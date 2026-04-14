-- Create table for header menu items
CREATE TABLE public.header_menu_items (
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

-- Enable Row Level Security
ALTER TABLE public.header_menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for header_menu_items
CREATE POLICY "Anyone can view active header menu items" 
ON public.header_menu_items 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage header menu items" 
ON public.header_menu_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default navigation items
INSERT INTO public.header_menu_items (name, translation_key, href, icon, display_order) VALUES
('Home', 'nav.home', '/', 'Home', 1),
('Destinations', 'nav.destinations', '/destinations', 'MapPin', 2),
('Directory', 'nav.directory', '/directory', 'List', 3),
('Blog', 'nav.blog', '/blog', 'FileText', 4);;
