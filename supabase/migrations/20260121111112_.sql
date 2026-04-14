-- Update Architecture & Decoration category description
UPDATE public.categories 
SET short_description = 'Distinguished architects and Interior designers',
    description = 'Architecture & Decoration highlights distinguished architects and Interior designers shaping exceptional living spaces across the Algarve.'
WHERE slug = 'architecture-decoration';;
