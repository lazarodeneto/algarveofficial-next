-- Seed the 10 premium regions for Algarve
INSERT INTO public.regions (name, slug, short_description, description, display_order, is_active, is_featured)
VALUES
  ('Golden Triangle', 'golden-triangle', 'The pinnacle of Algarve premium living', 'Home to Quinta do Lago, Vale do Lobo, and Almancil - the most exclusive addresses in Portugal. World-class golf, private beaches, and unmatched prestige.', 1, true, true),
  ('Vilamoura Prestige', 'vilamoura-prestige', 'Europe''s premier marina destination', 'Iconic marina, championship golf courses, and vibrant nightlife. The heart of Algarve''s premium tourism and international lifestyle.', 2, true, true),
  ('Carvoeiro Cliffs', 'carvoeiro-cliffs', 'Dramatic coastline and hidden coves', 'Breathtaking cliff formations, secluded beaches, and charming village atmosphere. Where natural beauty meets refined coastal living.', 3, true, true),
  ('Lagos Signature', 'lagos-signature', 'Historic charm meets modern premium', 'Ancient maritime heritage, stunning rock formations at Ponta da Piedade, and a thriving cultural scene. Authentic Algarve at its finest.', 4, true, true),
  ('Tavira Heritage', 'tavira-heritage', 'The Venice of the Algarve', 'Preserved Moorish architecture, traditional tile work, and island beaches. A refined escape for those seeking authentic Portuguese elegance.', 5, true, true),
  ('Ria Formosa Reserve', 'ria-formosa-reserve', 'Protected natural paradise', 'UNESCO-worthy lagoon system, pristine barrier islands, and world-renowned oysters. Where nature and gastronomy create unforgettable experiences.', 6, true, true),
  ('Monchique Retreats', 'monchique-retreats', 'Mountain wellness sanctuary', 'Thermal springs, eucalyptus forests, and panoramic views. The Algarve''s hidden gem for wellness, tranquility, and natural healing.', 7, true, true),
  ('Sagres Atlantic', 'sagres-atlantic', 'Where Europe meets the Atlantic', 'Raw, unspoiled coastline at the southwestern tip of Europe. Legendary surf, dramatic cliffs, and a spirit of adventure.', 8, true, true),
  ('Portimão Prime', 'portimao-prime', 'Dynamic coastal metropolis', 'Pristine Praia da Rocha, world-class motorsport, and vibrant dining scene. The Algarve''s most energetic premium destination.', 9, true, true),
  ('Private Algarve', 'private-algarve', 'Exclusive off-the-map experiences', 'Curated access to hidden estates, private experiences, and bespoke services. For those who seek the extraordinary.', 10, true, false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active,
  is_featured = EXCLUDED.is_featured,
  updated_at = now();
