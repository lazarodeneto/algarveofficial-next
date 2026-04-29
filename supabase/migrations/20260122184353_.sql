-- Add Faro and Guia cities if they don't exist
INSERT INTO public.cities (name, slug, is_active, is_featured, display_order)
VALUES 
  ('Faro', 'faro', true, true, 5),
  ('Guia', 'guia', true, false, 25)
ON CONFLICT (slug) DO NOTHING;

-- Now seed 22 real Michelin restaurants
INSERT INTO public.listings (
  name, slug, category_id, city_id, region_id, owner_id,
  status, tier, is_curated,
  short_description, description, address,
  latitude, longitude,
  website_url, contact_phone,
  category_data, tags
) VALUES
-- 2-Star Michelin Restaurants
(
  'Ocean Restaurant',
  'ocean-restaurant-vila-vita',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '48369f25-134e-43a6-aace-b5ca955b69eb', -- Lagoa (Porches area)
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Two Michelin Star restaurant by Chef Hans Neuner at Vila Vita Parc',
  'Ocean is a culinary masterpiece set within the Vila Vita Parc resort in Porches. Under the masterful direction of Chef Hans Neuner, the restaurant has earned two Michelin stars for its innovative approach to Portuguese and international cuisine. The elegant oceanfront setting provides the perfect backdrop for an unforgettable gastronomic journey featuring the finest local ingredients transformed into works of art.',
  'Rua Anneliese Pohl, Alporchinhos, 8400-450 Porches',
  37.0972, -8.4003,
  'https://www.vilavitaparc.com/en/restaurants-and-bars/ocean',
  '+351 282 310 100',
  '{"cuisine_types": ["Contemporary", "Portuguese", "Seafood"], "price_range": "€€€€", "michelin_stars": 2, "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'oceanfront', 'chef-hans-neuner']
),
(
  'Vila Joya Restaurant',
  'vila-joya-restaurant',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64', -- Albufeira
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Two Michelin Star restaurant by Chef Dieter Koschina',
  'Vila Joya is one of Portugal''s most celebrated restaurants, holding two Michelin stars under the guidance of Austrian-born Chef Dieter Koschina. Located in a stunning clifftop boutique hotel in Albufeira, the restaurant offers an extraordinary tasting menu that showcases the best of Portuguese ingredients with refined European technique. The intimate setting and impeccable service create an atmosphere of pure premium.',
  'Praia da Galé, 8200-917 Albufeira',
  37.0756, -8.3183,
  'https://www.vilajoya.com/en/restaurants/restaurant',
  '+351 289 591 795',
  '{"cuisine_types": ["Contemporary European", "Portuguese"], "price_range": "€€€€", "michelin_stars": 2, "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'boutique-hotel', 'chef-dieter-koschina']
),

-- 1-Star Michelin Restaurants
(
  'Vista Restaurant',
  'vista-restaurant-portimao',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '50c742cc-34ce-485f-bee9-db9f0d4c916b', -- Portimão
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'One Michelin Star restaurant by Chef João Oliveira at Bela Vista Hotel',
  'Vista at the historic Bela Vista Hotel offers an exceptional dining experience with panoramic views over Praia da Rocha. Chef João Oliveira has earned one Michelin star for his creative interpretation of Algarve cuisine, using locally sourced ingredients to create dishes that are both innovative and deeply rooted in regional traditions.',
  'Avenida Tomás Cabreira, 8500-802 Praia da Rocha',
  37.1167, -8.5333,
  'https://www.hotelbelavista.net/en/restaurants/vista',
  '+351 282 460 280',
  '{"cuisine_types": ["Contemporary Portuguese", "Seafood"], "price_range": "€€€€", "michelin_stars": 1, "dress_code": "Smart Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'ocean-view', 'chef-joao-oliveira']
),
(
  'Gusto by Heinz Beck',
  'gusto-heinz-beck-almancil',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '5034cb6d-5713-4980-adcb-dc0df039d788', -- Almancil
  'a3723c89-5605-4abc-88c8-90a001d0bdfd', -- Golden Triangle
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'One Michelin Star Italian restaurant at Conrad Algarve',
  'Gusto by Heinz Beck at the Conrad Algarve brings the culinary vision of the three-Michelin-starred German-Italian chef to the Algarve. This sophisticated restaurant offers contemporary Italian cuisine with a focus on healthy, balanced dishes that never compromise on flavor. The elegant setting and world-class wine list complete an exceptional dining experience.',
  'Estrada da Quinta do Lago, 8135-106 Almancil',
  37.0489, -8.0456,
  'https://www.conradalgarve.com/dining/gusto',
  '+351 289 350 700',
  '{"cuisine_types": ["Italian", "Contemporary"], "price_range": "€€€€", "michelin_stars": 1, "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": false}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'italian', 'chef-heinz-beck', 'conrad-algarve']
),
(
  'Al Sud Restaurant',
  'al-sud-lagos',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '41683f77-47ef-4a97-8321-174e77364009', -- Lagos
  '06dfff95-268b-437f-bac0-cfbd2d227311', -- Lagos Signature
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'One Michelin Star restaurant by Chef Louis Anjos at Palmares Resort',
  'Al Sud at Palmares Beach House Hotel brings Michelin-starred dining to Lagos. Chef Louis Anjos creates innovative dishes that celebrate the rich culinary heritage of the Algarve while embracing modern techniques. The restaurant''s stunning location overlooking Meia Praia beach provides an unforgettable setting for a world-class gastronomic experience.',
  'Meia Praia, 8600-315 Lagos',
  37.1000, -8.6667,
  'https://www.palmaresbeachhouse.com/al-sud',
  '+351 282 770 990',
  '{"cuisine_types": ["Contemporary Portuguese", "Mediterranean"], "price_range": "€€€€", "michelin_stars": 1, "dress_code": "Smart Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'beach-view', 'chef-louis-anjos']
),
(
  'A Ver Tavira',
  'a-ver-tavira',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'One Michelin Star restaurant by Chef Luís Brito in historic Tavira',
  'A Ver Tavira has established itself as the gastronomic jewel of eastern Algarve. Chef Luís Brito earned the restaurant''s Michelin star by showcasing the exceptional seafood and produce of the Ria Formosa region through refined contemporary cuisine. The rooftop terrace offers stunning views over Tavira''s historic center.',
  'Calçada da Galeria 13, 8800-306 Tavira',
  37.1272, -7.6506,
  'https://www.avertavira.com',
  '+351 281 381 363',
  '{"cuisine_types": ["Contemporary Portuguese", "Seafood"], "price_range": "€€€", "michelin_stars": 1, "dress_code": "Smart Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'rooftop', 'chef-luis-brito', 'tavira']
),
(
  'Bon Bon Restaurant',
  'bon-bon-carvoeiro',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  'd524dbd1-b2dd-46b0-a0fe-457d90fff1ea', -- Carvoeiro
  '76d65dcb-40c4-497d-a29d-2e738b50edc4', -- Carvoeiro Cliffs
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'One Michelin Star restaurant by Chef José Lopes',
  'Bon Bon in Carvoeiro is a culinary gem that has earned one Michelin star for Chef José Lopes'' creative and personal approach to contemporary Portuguese cuisine. The intimate restaurant offers tasting menus that tell the story of the Algarve through innovative dishes that surprise and delight with every course.',
  'Urbanização Cabeço de Pias, Lote 8, 8400-512 Carvoeiro',
  37.0942, -8.4686,
  'https://www.bonbon.pt',
  '+351 282 341 500',
  '{"cuisine_types": ["Contemporary Portuguese", "Creative"], "price_range": "€€€", "michelin_stars": 1, "dress_code": "Smart Casual", "accepts_reservations": true, "outdoor_seating": false}'::jsonb,
  ARRAY['michelin-star', 'fine-dining', 'tasting-menu', 'chef-jose-lopes']
),

-- Bib Gourmand & Notable Restaurants
(
  'Check-In Faro',
  'check-in-faro',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  (SELECT id FROM cities WHERE slug = 'faro'),
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Bib Gourmand restaurant by Chef Leonel Pereira in Faro',
  'Check-In Faro has earned the prestigious Bib Gourmand distinction for offering exceptional quality at accessible prices. Chef Leonel Pereira crafts contemporary Portuguese dishes that showcase the best of Algarve''s seasonal produce. The modern, relaxed atmosphere makes it perfect for both special occasions and casual dining.',
  'Rua Filipe Alistão 38, 8000-077 Faro',
  37.0154, -7.9351,
  'https://www.checkinfaro.com',
  '+351 289 099 099',
  '{"cuisine_types": ["Contemporary Portuguese", "Mediterranean"], "price_range": "€€", "michelin_distinction": "Bib Gourmand", "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": false}'::jsonb,
  ARRAY['bib-gourmand', 'contemporary', 'faro', 'chef-leonel-pereira']
),
(
  'Noélia Restaurant',
  'noelia-cabanas-tavira',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Acclaimed seafood restaurant by Chef Noélia Jerónimo',
  'Noélia in Cabanas de Tavira has gained recognition as one of the Algarve''s finest seafood restaurants. Chef Noélia Jerónimo brings decades of experience to her simple yet exceptional approach: the freshest catch prepared with respect and skill. The charming waterfront location and authentic atmosphere make this a must-visit destination.',
  'Rua Formosa 38, Cabanas de Tavira, 8800-591 Tavira',
  37.1311, -7.5928,
  NULL,
  '+351 281 370 649',
  '{"cuisine_types": ["Seafood", "Traditional Portuguese"], "price_range": "€€€", "specialties": ["Fresh Fish", "Cataplana", "Grilled Seafood"], "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['seafood', 'traditional', 'cabanas', 'chef-noelia']
),
(
  'O Teodósio',
  'o-teodosio-guia',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  (SELECT id FROM cities WHERE slug = 'guia'),
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Legendary Piri-Piri chicken restaurant in Guia',
  'O Teodósio in Guia is an institution, famous throughout Portugal for serving what many consider the best piri-piri chicken in the country. This family-run establishment has been perfecting their recipe for generations, using locally sourced free-range chicken and their secret spice blend. The no-frills atmosphere keeps the focus on the food.',
  'EN 125, Guia, 8200-436 Albufeira',
  37.1267, -8.3053,
  NULL,
  '+351 289 561 256',
  '{"cuisine_types": ["Traditional Portuguese", "Grill"], "price_range": "€", "specialties": ["Piri-Piri Chicken", "Grilled Meats"], "dress_code": "Casual", "accepts_reservations": false, "outdoor_seating": true}'::jsonb,
  ARRAY['piri-piri', 'chicken', 'traditional', 'guia', 'local-favorite']
),
(
  'Avenida Restaurant',
  'avenida-lagos',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '41683f77-47ef-4a97-8321-174e77364009', -- Lagos
  '06dfff95-268b-437f-bac0-cfbd2d227311', -- Lagos Signature
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Contemporary cuisine in the heart of Lagos',
  'Avenida Restaurant brings sophisticated contemporary cuisine to Lagos'' vibrant dining scene. The menu celebrates local ingredients with creative presentations and bold flavor combinations. The stylish interior and attentive service create a refined yet relaxed atmosphere perfect for an elevated dining experience.',
  'Avenida dos Descobrimentos 59, 8600-645 Lagos',
  37.1022, -8.6736,
  'https://www.avenida-lagos.com',
  '+351 282 762 011',
  '{"cuisine_types": ["Contemporary", "Mediterranean"], "price_range": "€€", "dress_code": "Smart Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['contemporary', 'lagos', 'fine-dining']
),
(
  'Tasca do Kiko',
  'tasca-do-kiko-lagos',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '41683f77-47ef-4a97-8321-174e77364009', -- Lagos
  '06dfff95-268b-437f-bac0-cfbd2d227311', -- Lagos Signature
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Creative tapas and Mediterranean cuisine in Lagos',
  'Tasca do Kiko offers an innovative take on traditional Portuguese tapas in the heart of Lagos. Chef Kiko creates small plates that burst with flavor, using the finest local ingredients. The intimate, casual atmosphere and excellent wine selection make it perfect for a relaxed evening of sharing exceptional food.',
  'Rua da Oliveira 6, 8600-619 Lagos',
  37.1014, -8.6756,
  NULL,
  '+351 282 792 003',
  '{"cuisine_types": ["Tapas", "Mediterranean", "Portuguese"], "price_range": "€€", "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": false}'::jsonb,
  ARRAY['tapas', 'creative', 'lagos', 'wine-bar']
),

-- Additional Notable Restaurants
(
  'Casa Velha',
  'casa-velha-quinta-do-lago',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '0af59e61-b1bd-4192-a9e5-50950767e72b', -- Quinta do Lago
  'a3723c89-5605-4abc-88c8-90a001d0bdfd', -- Golden Triangle
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Classic French-Portuguese cuisine in a historic 300-year-old farmhouse',
  'Casa Velha at Quinta do Lago offers a unique dining experience in a beautifully restored 300-year-old farmhouse. The restaurant combines classic French technique with Portuguese ingredients to create elegant dishes in a warm, romantic setting. The exceptional wine cellar and impeccable service complete an unforgettable evening.',
  'Quinta do Lago, 8135-024 Almancil',
  37.0417, -8.0253,
  'https://www.quintadolago.com/en/dining/casa-velha',
  '+351 289 394 983',
  '{"cuisine_types": ["French", "Portuguese"], "price_range": "€€€€", "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['french', 'historic', 'quinta-do-lago', 'romantic']
),
(
  'São Gabriel',
  'sao-gabriel-almancil',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '5034cb6d-5713-4980-adcb-dc0df039d788', -- Almancil
  'a3723c89-5605-4abc-88c8-90a001d0bdfd', -- Golden Triangle
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Acclaimed fine dining in the Golden Triangle',
  'São Gabriel is one of the Algarve''s most distinguished restaurants, offering refined European cuisine in an elegant country house setting. The seasonal menus showcase premium ingredients prepared with classical technique and contemporary flair. An extensive wine list and beautiful terrace dining complete the experience.',
  'Estrada Vale do Lobo, 8135-106 Almancil',
  37.0514, -8.0536,
  'https://www.saogabriel.pt',
  '+351 289 394 521',
  '{"cuisine_types": ["European", "Contemporary"], "price_range": "€€€€", "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['fine-dining', 'golden-triangle', 'european', 'wine-cellar']
),
(
  'Henrique Leis',
  'henrique-leis-almancil',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '5034cb6d-5713-4980-adcb-dc0df039d788', -- Almancil
  'a3723c89-5605-4abc-88c8-90a001d0bdfd', -- Golden Triangle
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Swiss-Brazilian chef offering creative Mediterranean cuisine',
  'Henrique Leis brings a unique perspective to Algarve fine dining, with Swiss-Brazilian Chef Henrique Leis creating innovative Mediterranean dishes in his namesake restaurant. The intimate setting and personal service make each visit special, with menus that change with the seasons to showcase the best available ingredients.',
  'Vale Formoso, 8135-107 Almancil',
  37.0569, -8.0406,
  'https://www.henriqueleis.com',
  '+351 289 393 438',
  '{"cuisine_types": ["Mediterranean", "Creative"], "price_range": "€€€€", "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['fine-dining', 'creative', 'almancil', 'chef-henrique-leis']
),
(
  'Duas Portas',
  'duas-portas-vilamoura',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Contemporary Portuguese cuisine at Vilamoura Marina',
  'Duas Portas at Vilamoura Marina offers contemporary Portuguese cuisine in a stylish waterfront setting. The menu celebrates local seafood and regional ingredients with modern presentations. The prime marina location and sophisticated atmosphere make it a favorite for both visitors and locals.',
  'Marina de Vilamoura, 8125-409 Vilamoura',
  37.0756, -8.1211,
  NULL,
  '+351 289 312 450',
  '{"cuisine_types": ["Contemporary Portuguese", "Seafood"], "price_range": "€€€", "dress_code": "Smart Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['marina', 'vilamoura', 'contemporary', 'seafood']
),
(
  'Willie''s Restaurant',
  'willies-restaurant-vilamoura',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Classic European fine dining in Vilamoura',
  'Willie''s has been a landmark of fine dining in Vilamoura for decades. The restaurant offers classic European cuisine with attention to detail in every dish. The elegant setting, professional service, and consistently excellent food have made it a trusted destination for special occasions.',
  'Rua do Brasil, Vilamoura, 8125-507 Quarteira',
  37.0797, -8.1139,
  'https://www.willies.pt',
  '+351 289 380 849',
  '{"cuisine_types": ["European", "Classic"], "price_range": "€€€", "dress_code": "Smart Elegant", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['classic', 'vilamoura', 'european', 'fine-dining']
),
(
  'Restaurante O Pátio',
  'o-patio-vilamoura',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Traditional Portuguese cuisine with charming courtyard dining',
  'O Pátio offers authentic Portuguese cuisine in a beautiful courtyard setting in Vilamoura. The menu features traditional dishes prepared with care and quality ingredients. The romantic atmosphere and excellent service make it a favorite for intimate dinners.',
  'Aldeamento da Falésia, 8200-592 Vilamoura',
  37.0744, -8.1267,
  NULL,
  '+351 289 302 816',
  '{"cuisine_types": ["Traditional Portuguese"], "price_range": "€€", "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['traditional', 'portuguese', 'vilamoura', 'courtyard']
),
(
  'Restaurante A Ria',
  'a-ria-fuseta',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '19cd1bdc-7a96-429d-b293-71aea71b3a01', -- Fuseta
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Fresh seafood from the Ria Formosa',
  'A Ria in Fuseta specializes in the exceptional seafood of the Ria Formosa Natural Park. The restaurant sources fish and shellfish directly from local fishermen, ensuring the freshest possible ingredients. Simple preparations let the quality of the seafood shine.',
  'Largo 1 de Maio, 8700-064 Fuseta',
  37.0503, -7.7450,
  NULL,
  '+351 289 793 374',
  '{"cuisine_types": ["Seafood", "Traditional Portuguese"], "price_range": "€€", "specialties": ["Fresh Fish", "Oysters", "Clams"], "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['seafood', 'ria-formosa', 'fuseta', 'fresh-fish']
),
(
  'Marisqueira Rui',
  'marisqueira-rui-silves',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '48369f25-134e-43a6-aace-b5ca955b69eb', -- Lagoa
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Renowned seafood restaurant specializing in fresh shellfish',
  'Marisqueira Rui in Silves is a destination for serious seafood lovers. The restaurant is famous for its exceptional shellfish, including oysters, percebes (gooseneck barnacles), and giant prawns. The simple, no-nonsense approach focuses entirely on the extraordinary quality of the seafood.',
  'Rua Comandante Vilarinho 29, 8300-128 Silves',
  37.1886, -8.4378,
  'https://www.marisqueirarui.com',
  '+351 282 442 682',
  '{"cuisine_types": ["Seafood", "Traditional Portuguese"], "price_range": "€€€", "specialties": ["Shellfish", "Percebes", "Oysters"], "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": false}'::jsonb,
  ARRAY['seafood', 'shellfish', 'silves', 'traditional']
),
(
  'Restaurante Floresta',
  'florante-monchique',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '078a34a7-ab65-4142-a4ab-2a498be0c1ea', -- Monchique
  NULL,
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'published', 'unverified', false,
  'Mountain cuisine featuring legendary Piri-Piri chicken in Monchique',
  'Restaurante Floresta in the mountains of Monchique is famous for its exceptional piri-piri chicken, prepared over an open wood fire. The rustic mountain setting and views over the Serra de Monchique provide the perfect backdrop for hearty, traditional cuisine.',
  'Largo São Sebastião, 8550-458 Monchique',
  37.3186, -8.5553,
  NULL,
  '+351 282 912 239',
  '{"cuisine_types": ["Traditional Portuguese", "Grill"], "price_range": "€", "specialties": ["Piri-Piri Chicken", "Grilled Meats"], "dress_code": "Casual", "accepts_reservations": true, "outdoor_seating": true}'::jsonb,
  ARRAY['piri-piri', 'mountain', 'monchique', 'traditional']
)
ON CONFLICT (slug) DO NOTHING;;
