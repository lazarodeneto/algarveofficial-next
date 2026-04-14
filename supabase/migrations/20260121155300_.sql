-- Update footer links with new category names
UPDATE public.footer_links 
SET name = 'Fine Dining & Michelin' 
WHERE name = 'Fine Dining';

UPDATE public.footer_links 
SET name = 'Golf & Tournaments' 
WHERE name = 'Golf Experiences';

UPDATE public.footer_links 
SET name = 'Concierge Services' 
WHERE name = 'VIP Concierge';;
