-- Insert all 20 Algarve cities with proper data
INSERT INTO public.cities (name, slug, short_description, is_active, is_featured, display_order)
VALUES
  ('Almancil', 'almancil', 'Gateway to the Golden Triangle', true, true, 1),
  ('Quinta do Lago', 'quinta-do-lago', 'Premier premium resort destination', true, true, 2),
  ('Vale do Lobo', 'vale-do-lobo', 'Exclusive beachfront resort living', true, true, 3),
  ('Vilamoura', 'vilamoura', 'Marina lifestyle and golf paradise', true, true, 4),
  ('Quarteira', 'quarteira', 'Traditional charm meets coastal beauty', true, false, 5),
  ('Albufeira', 'albufeira', 'Vibrant beaches and nightlife', true, true, 6),
  ('Lagoa', 'lagoa', 'Wine country and dramatic coastline', true, false, 7),
  ('Carvoeiro', 'carvoeiro', 'Picturesque cliffs and golden coves', true, true, 8),
  ('Ferragudo', 'ferragudo', 'Authentic fishing village charm', true, false, 9),
  ('Portimão', 'portimao', 'Culinary capital and ocean adventures', true, true, 10),
  ('Praia da Rocha', 'praia-da-rocha', 'Iconic beach and vibrant promenade', true, false, 11),
  ('Alvor', 'alvor', 'Tranquil estuary and historic centre', true, false, 12),
  ('Lagos', 'lagos', 'Historic maritime city and stunning grottos', true, true, 13),
  ('Sagres', 'sagres', 'Edge of the world surfing destination', true, true, 14),
  ('Vila do Bispo', 'vila-do-bispo', 'Untouched natural beauty', true, false, 15),
  ('Tavira', 'tavira', 'Elegant heritage and island beaches', true, true, 16),
  ('Santa Luzia', 'santa-luzia', 'Octopus fishing village tradition', true, false, 17),
  ('Olhão', 'olhao', 'Cubist architecture and seafood markets', true, false, 18),
  ('Fuseta', 'fuseta', 'Hidden gem on Ria Formosa', true, false, 19),
  ('Monchique', 'monchique', 'Mountain retreat and thermal spas', true, true, 20)
ON CONFLICT (slug) DO NOTHING;
