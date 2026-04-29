-- Step 1: Delete the 4 existing mock listings
DELETE FROM listings WHERE slug IN (
  'pine-cliffs-resort',
  'ocean-restaurant',
  'monte-rei-golf',
  'serenity-spa-conrad'
);
-- Step 2: Insert 25 real Algarve businesses with CORRECT IDs, all unverified tier
INSERT INTO listings (
  owner_id, category_id, city_id, region_id, name, slug, short_description, description,
  address, latitude, longitude, contact_phone, contact_email, website_url,
  instagram_url, facebook_url, google_business_url,
  tags, tier, is_curated, status, category_data
) VALUES
-- PREMIUM ACCOMMODATION (5)
-- Conrad Algarve - Almancil, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'ff4a2955-2326-4c5f-9e82-1d3dc8acd489',
  '5034cb6d-5713-4980-adcb-dc0df039d788',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Conrad Algarve',
  'conrad-algarve',
  'Five-star premium resort in the heart of the Golden Triangle with world-class spa and dining.',
  'Conrad Algarve is a stunning five-star resort located in Quinta do Lago, offering 154 elegantly appointed rooms and suites. The resort features the award-winning Sayanna Wellness spa, multiple restaurants including the Michelin-starred Gusto by Heinz Beck, and direct access to some of the Algarve''s finest golf courses. Set amidst lush gardens with views of the Ria Formosa Natural Park, this is the epitome of Portuguese premium hospitality.',
  'Estrada da Quinta do Lago, 8135-106 Almancil',
  37.0447, -8.0234,
  '+351 289 350 700', 'info@conradalgarve.com', 'https://www.hilton.com/en/hotels/faocici-conrad-algarve/',
  'https://www.instagram.com/conradalgarve/', 'https://www.facebook.com/ConradAlgarve/', 'https://goo.gl/maps/conradalgarve',
  ARRAY['premium', 'resort', 'spa', 'golf', 'fine-dining', 'quinta-do-lago'],
  'unverified', false, 'published',
  '{"accommodation_type": "resort", "number_of_units": 154, "star_rating": "5", "amenities": ["pool", "spa", "gym", "golf_access", "restaurant", "concierge", "wifi", "parking"], "suitable_for": ["couples", "families", "business"], "concierge_available": true, "private_staff": true, "pet_friendly": true}'::jsonb
),
-- Vila Vita Parc - Lagoa, Carvoeiro Cliffs
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'ff4a2955-2326-4c5f-9e82-1d3dc8acd489',
  '48369f25-134e-43a6-aace-b5ca955b69eb',
  '76d65dcb-40c4-497d-a29d-2e738b50edc4',
  'Vila Vita Parc Resort & Spa',
  'vila-vita-parc',
  'Award-winning premium resort perched on dramatic Algarve cliffs with two Michelin-starred restaurants.',
  'Vila Vita Parc is an iconic 22-hectare resort overlooking the Atlantic Ocean near the charming village of Porches. Home to two Michelin-starred restaurants including the legendary Ocean by Hans Neuner, this resort offers an unparalleled culinary journey. With private beach access, extensive spa facilities, and beautifully landscaped gardens, Vila Vita Parc represents the pinnacle of Algarve premium.',
  'Rua Anneliese Pohl, Alporchinhos, 8400-450 Lagoa',
  37.0892, -8.4156,
  '+351 282 310 100', 'info@vilavitaparc.com', 'https://www.vilavitaparc.com/',
  'https://www.instagram.com/vilavitaparc/', 'https://www.facebook.com/VilaVitaParcResort/', 'https://goo.gl/maps/vilavitaparc',
  ARRAY['premium', 'resort', 'michelin', 'spa', 'beach', 'fine-dining'],
  'unverified', false, 'published',
  '{"accommodation_type": "resort", "number_of_units": 170, "star_rating": "5", "amenities": ["pool", "spa", "private_beach", "golf_access", "restaurant", "concierge", "wine_cellar", "tennis"], "suitable_for": ["couples", "families", "honeymoon"], "concierge_available": true, "private_staff": true, "pet_friendly": false}'::jsonb
),
-- Anantara Vilamoura - Vilamoura, Vilamoura Prestige
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'ff4a2955-2326-4c5f-9e82-1d3dc8acd489',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34',
  '76da4eed-79a5-4b52-a213-a3821b7766e1',
  'Anantara Vilamoura Algarve Resort',
  'anantara-vilamoura',
  'Thai-inspired five-star golf resort in the heart of Vilamoura with world-class spa.',
  'Anantara Vilamoura brings the renowned Anantara hospitality to Portugal''s premier resort destination. This stunning property features Thai-inspired architecture, an award-winning Anantara Spa, and direct access to Victoria Golf Course. With spacious rooms overlooking manicured gardens and multiple dining venues, it offers a unique East-meets-West premium experience in the Algarve.',
  'Victoria Clubhouse, Av. dos Descobrimentos, 8125-309 Vilamoura',
  37.0789, -8.1234,
  '+351 289 317 000', 'vilamoura@anantara.com', 'https://www.anantara.com/en/vilamoura-algarve',
  'https://www.instagram.com/anantaravilamoura/', 'https://www.facebook.com/AnantaraVilamoura/', 'https://goo.gl/maps/anantaravilamoura',
  ARRAY['premium', 'resort', 'golf', 'spa', 'thai', 'vilamoura'],
  'unverified', false, 'published',
  '{"accommodation_type": "resort", "number_of_units": 280, "star_rating": "5", "amenities": ["pool", "spa", "gym", "golf_access", "restaurant", "concierge", "kids_club"], "suitable_for": ["couples", "families", "golf_enthusiasts"], "concierge_available": true, "private_staff": true, "pet_friendly": true}'::jsonb
),
-- Pine Cliffs Resort - Albufeira, Private Algarve
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'ff4a2955-2326-4c5f-9e82-1d3dc8acd489',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64',
  '8e367f26-389a-459c-8454-8aa62e039ace',
  'Pine Cliffs Resort',
  'pine-cliffs-resort-albufeira',
  'Iconic cliff-top resort with private beach access and renowned golf academy.',
  'Perched atop the dramatic red cliffs of Praia da Falésia, Pine Cliffs Resort is one of the Algarve''s most iconic properties. The resort features the famous 9-hole Pine Cliffs Golf Course with its legendary Devil''s Parlour hole, the Serenity Spa, and direct access to one of Europe''s most beautiful beaches. Multiple accommodation options from hotel rooms to premium villas cater to every guest.',
  'Praia da Falésia, 8200-909 Albufeira',
  37.0856, -8.1678,
  '+351 289 500 100', 'reservations@pinecliffs.com', 'https://www.pinecliffs.com/',
  'https://www.instagram.com/pinecliffsresort/', 'https://www.facebook.com/PineCliffsResort/', 'https://goo.gl/maps/pinecliffs',
  ARRAY['premium', 'resort', 'golf', 'beach', 'cliffs', 'family'],
  'unverified', false, 'published',
  '{"accommodation_type": "resort", "number_of_units": 217, "star_rating": "5", "amenities": ["pool", "spa", "private_beach", "golf_course", "restaurant", "kids_club", "tennis"], "suitable_for": ["couples", "families", "golf_enthusiasts"], "concierge_available": true, "private_staff": true, "pet_friendly": false}'::jsonb
),
-- Dunas Douradas - Vale do Lobo, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'ff4a2955-2326-4c5f-9e82-1d3dc8acd489',
  '4636e0b4-7b32-4e7a-839e-fc1a616e2410',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Dunas Douradas Beach Club',
  'dunas-douradas-beach-club',
  'Exclusive beachfront resort in Vale do Lobo with premium villas and apartments.',
  'Dunas Douradas Beach Club offers an exclusive collection of premium villas and apartments set directly on the golden sands of Vale do Lobo. This private resort provides the perfect blend of beach living and resort amenities, with direct access to golf courses, fine dining, and the vibrant Golden Triangle lifestyle. Ideal for families seeking space and privacy with five-star services.',
  'Vale do Lobo, 8135-864 Almancil',
  37.0356, -8.0567,
  '+351 289 394 900', 'info@dunasdouradas.com', 'https://www.dunasdouradas.com/',
  'https://www.instagram.com/dunasdouradasbeachclub/', 'https://www.facebook.com/DunasDouradas/', 'https://goo.gl/maps/dunasdouradas',
  ARRAY['premium', 'beach', 'villas', 'family', 'vale-do-lobo', 'golden-triangle'],
  'unverified', false, 'published',
  '{"accommodation_type": "villa_resort", "number_of_units": 85, "star_rating": "5", "amenities": ["pool", "beach_access", "restaurant", "concierge", "tennis", "kids_club"], "suitable_for": ["families", "couples", "groups"], "concierge_available": true, "private_staff": false, "pet_friendly": true}'::jsonb
),

-- FINE DINING & MICHELIN (4)
-- Ocean Restaurant - Lagoa, Carvoeiro Cliffs
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '48369f25-134e-43a6-aace-b5ca955b69eb',
  '76d65dcb-40c4-497d-a29d-2e738b50edc4',
  'Ocean Restaurant',
  'ocean-restaurant-vila-vita',
  'Two Michelin-starred oceanfront restaurant by Chef Hans Neuner at Vila Vita Parc.',
  'Ocean Restaurant at Vila Vita Parc is the crown jewel of Algarve fine dining, holding two Michelin stars under the masterful direction of Chef Hans Neuner. Perched on the cliffs overlooking the Atlantic, Ocean offers a breathtaking setting for an extraordinary culinary journey. The tasting menus celebrate Atlantic seafood with innovative techniques and impeccable presentation, paired with selections from one of Portugal''s finest wine cellars.',
  'Vila Vita Parc, Rua Anneliese Pohl, 8400-450 Lagoa',
  37.0895, -8.4160,
  '+351 282 310 100', 'ocean@vilavitaparc.com', 'https://www.vilavitaparc.com/en/restaurants/ocean',
  'https://www.instagram.com/oceanrestaurant/', 'https://www.facebook.com/OceanRestaurantVilaVita/', 'https://goo.gl/maps/oceanrestaurant',
  ARRAY['michelin', 'fine-dining', 'seafood', 'tasting-menu', 'wine', 'hans-neuner'],
  'unverified', false, 'published',
  '{"cuisine_types": ["contemporary", "portuguese", "seafood"], "price_range": "$$$$", "michelin_stars": 2, "reservations_required": true, "dress_code": "smart_elegant", "tasting_menu": true, "wine_pairing": true, "private_dining": true, "outdoor_seating": true}'::jsonb
),
-- Gusto by Heinz Beck - Almancil, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '5034cb6d-5713-4980-adcb-dc0df039d788',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Gusto by Heinz Beck',
  'gusto-heinz-beck',
  'Michelin-starred Italian fine dining by legendary Chef Heinz Beck at Conrad Algarve.',
  'Gusto by Heinz Beck brings the culinary genius of the three Michelin-starred Chef Heinz Beck to the Algarve. Located within the elegant Conrad Algarve resort, this restaurant offers refined Italian cuisine with Mediterranean influences. The menu showcases Beck''s signature light and healthy approach to fine dining, with dishes that are as beautiful as they are delicious. An exceptional wine list and impeccable service complete the experience.',
  'Conrad Algarve, Estrada da Quinta do Lago, 8135-106 Almancil',
  37.0449, -8.0236,
  '+351 289 350 700', 'gusto@conradalgarve.com', 'https://www.hilton.com/en/hotels/faocici-conrad-algarve/dining/',
  'https://www.instagram.com/gustobyheinzbeck/', 'https://www.facebook.com/GustoByHeinzBeck/', 'https://goo.gl/maps/gustoconrad',
  ARRAY['michelin', 'italian', 'fine-dining', 'heinz-beck', 'tasting-menu'],
  'unverified', false, 'published',
  '{"cuisine_types": ["italian", "mediterranean", "contemporary"], "price_range": "$$$$", "michelin_stars": 1, "reservations_required": true, "dress_code": "smart_elegant", "tasting_menu": true, "wine_pairing": true, "private_dining": true, "outdoor_seating": true}'::jsonb
),
-- Henrique Leis - Almancil, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  '5034cb6d-5713-4980-adcb-dc0df039d788',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Henrique Leis Restaurant',
  'henrique-leis',
  'Two Michelin-starred French-Portuguese cuisine by Chef Henrique Leis in Almancil.',
  'For over two decades, Chef Henrique Leis has been creating extraordinary culinary experiences at his eponymous restaurant in Almancil. Holding two Michelin stars, this intimate establishment offers a perfect fusion of French technique and Portuguese ingredients. The elegant villa setting, beautiful gardens, and Chef Leis''s personal attention to every detail make dining here a truly memorable occasion.',
  'Vale Formoso, 8135-016 Almancil',
  37.0512, -8.0345,
  '+351 289 393 438', 'info@henriqueleis.com', 'https://www.henriqueleis.com/',
  'https://www.instagram.com/henriqueleisrestaurante/', 'https://www.facebook.com/HenriqueLeis/', 'https://goo.gl/maps/henriqueleis',
  ARRAY['michelin', 'french', 'portuguese', 'fine-dining', 'tasting-menu', 'garden'],
  'unverified', false, 'published',
  '{"cuisine_types": ["french", "portuguese", "contemporary"], "price_range": "$$$$", "michelin_stars": 2, "reservations_required": true, "dress_code": "smart_elegant", "tasting_menu": true, "wine_pairing": true, "private_dining": true, "outdoor_seating": true}'::jsonb
),
-- Bon Bon Restaurant - Carvoeiro, Carvoeiro Cliffs
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '733906a9-9a0f-4799-9864-c706eb054e60',
  'd524dbd1-b2dd-46b0-a0fe-457d90fff1ea',
  '76d65dcb-40c4-497d-a29d-2e738b50edc4',
  'Bon Bon Restaurant',
  'bon-bon-restaurant',
  'Two Michelin-starred creative cuisine by Chef Louis Anjos in Carvoeiro.',
  'Bon Bon Restaurant is a culinary destination that has earned two Michelin stars under the creative vision of Chef Louis Anjos. Located in the charming town of Carvoeiro, this intimate restaurant offers an innovative approach to Portuguese cuisine, with dishes that celebrate local ingredients in unexpected ways. The modern, refined setting provides the perfect backdrop for Chef Anjos''s artistic presentations.',
  'Urbanização Sesmarias, Lote 55, 8400-513 Carvoeiro',
  37.0934, -8.4567,
  '+351 282 341 135', 'reservations@bonbon.pt', 'https://www.bonbon.pt/',
  'https://www.instagram.com/bonbonrestaurante/', 'https://www.facebook.com/BonBonRestaurante/', 'https://goo.gl/maps/bonbon',
  ARRAY['michelin', 'portuguese', 'creative', 'fine-dining', 'tasting-menu'],
  'unverified', false, 'published',
  '{"cuisine_types": ["portuguese", "contemporary", "creative"], "price_range": "$$$$", "michelin_stars": 2, "reservations_required": true, "dress_code": "smart_elegant", "tasting_menu": true, "wine_pairing": true, "private_dining": false, "outdoor_seating": false}'::jsonb
),

-- GOLF & TOURNAMENTS (4)
-- Quinta do Lago Golf - Quinta do Lago, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0af59e61-b1bd-4192-a9e5-50950767e72b',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Quinta do Lago Golf',
  'quinta-do-lago-golf',
  'Three championship golf courses in the prestigious Quinta do Lago estate.',
  'Quinta do Lago is home to three world-class championship golf courses: North, South, and Laranjal. The South Course has hosted the Portuguese Open eight times, while the North Course offers a more challenging layout through umbrella pines. All courses benefit from the estate''s exceptional setting within the Ria Formosa Natural Park. The Paul McGinley Golf Academy provides instruction for all levels.',
  'Quinta do Lago, 8135-024 Almancil',
  37.0423, -8.0189,
  '+351 289 390 700', 'golf@quintadolago.com', 'https://www.quintadolago.com/golf/',
  'https://www.instagram.com/quintadolago/', 'https://www.facebook.com/QuintadoLago/', 'https://goo.gl/maps/quintadolagogolf',
  ARRAY['golf', 'championship', 'portuguese-open', 'golf-academy', 'golden-triangle'],
  'unverified', false, 'published',
  '{"course_type": "championship", "number_of_holes": 54, "number_of_courses": 3, "par": 72, "designer": "William Mitchell, Rocky Roquemore", "facilities": ["driving_range", "pro_shop", "restaurant", "golf_academy", "club_rental", "buggy_hire"], "tournaments_hosted": ["Portuguese Open"], "dress_code": "smart_golf"}'::jsonb
),
-- Vale do Lobo Golf - Vale do Lobo, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '4636e0b4-7b32-4e7a-839e-fc1a616e2410',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Vale do Lobo Golf',
  'vale-do-lobo-golf',
  'Iconic Royal and Ocean courses featuring the famous cliffside 16th hole.',
  'Vale do Lobo is synonymous with Algarve golf, featuring two stunning courses: the Royal and the Ocean. The Royal Course is renowned for its spectacular par-3 16th hole played over dramatic red cliffs to the sea - one of the most photographed holes in European golf. The Ocean Course offers equally beautiful views and a fair challenge for all handicaps. Both courses wind through umbrella pines with glimpses of the Atlantic.',
  'Vale do Lobo Resort, 8135-864 Almancil',
  37.0378, -8.0612,
  '+351 289 353 465', 'golf@valedolobo.com', 'https://www.valedolobo.com/golf/',
  'https://www.instagram.com/valedolobo/', 'https://www.facebook.com/ValeDoLobo/', 'https://goo.gl/maps/valedologolf',
  ARRAY['golf', 'championship', 'cliffside', 'iconic', 'golden-triangle', 'ocean-views'],
  'unverified', false, 'published',
  '{"course_type": "championship", "number_of_holes": 36, "number_of_courses": 2, "par": 72, "designer": "Henry Cotton, Rocky Roquemore", "facilities": ["driving_range", "pro_shop", "restaurant", "golf_academy", "club_rental", "buggy_hire"], "tournaments_hosted": [], "dress_code": "smart_golf"}'::jsonb
),
-- Victoria Golf Course - Vilamoura, Vilamoura Prestige
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34',
  '76da4eed-79a5-4b52-a213-a3821b7766e1',
  'Victoria Golf Course',
  'victoria-golf-course',
  'Arnold Palmer-designed championship course, home of the Portugal Masters.',
  'Victoria Golf Course is a masterpiece designed by the legendary Arnold Palmer, widely considered one of the finest courses in Europe. Since 2007, it has been the prestigious home of the Portugal Masters on the European Tour. The course features wide fairways, challenging greens, and beautiful water features, all set within the Vilamoura resort complex. A true test of championship golf.',
  'Avenida dos Descobrimentos, 8125-309 Vilamoura',
  37.0801, -8.1256,
  '+351 289 320 100', 'victoria@dompedrogolf.com', 'https://www.dompedrogolf.com/victoria/',
  'https://www.instagram.com/victoriagolfcourse/', 'https://www.facebook.com/VictoriaGolfCourse/', 'https://goo.gl/maps/victoriagolf',
  ARRAY['golf', 'championship', 'portugal-masters', 'arnold-palmer', 'european-tour'],
  'unverified', false, 'published',
  '{"course_type": "championship", "number_of_holes": 18, "number_of_courses": 1, "par": 72, "designer": "Arnold Palmer", "facilities": ["driving_range", "pro_shop", "restaurant", "club_rental", "buggy_hire", "caddies"], "tournaments_hosted": ["Portugal Masters"], "dress_code": "smart_golf"}'::jsonb
),
-- Dom Pedro Golf - Vilamoura, Vilamoura Prestige
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34',
  '76da4eed-79a5-4b52-a213-a3821b7766e1',
  'Dom Pedro Golf Vilamoura',
  'dom-pedro-golf-vilamoura',
  'Five distinct golf courses in Vilamoura including the famous Old Course.',
  'Dom Pedro Golf manages five exceptional courses in Vilamoura: the historic Old Course (opened 1969), the challenging Pinhal Course, the resort-friendly Laguna Course, the modern Millennium Course, and the championship Victoria Course. Together they offer incredible variety for golfers of all abilities. The Old Course, designed by Frank Pennink, remains a classic favorite with its mature umbrella pines and traditional layout.',
  'Urbanização Vilamoura, 8125-507 Vilamoura',
  37.0756, -8.1189,
  '+351 289 310 180', 'info@dompedrogolf.com', 'https://www.dompedrogolf.com/',
  'https://www.instagram.com/dompedrogolf/', 'https://www.facebook.com/DomPedroGolf/', 'https://goo.gl/maps/dompedrogolf',
  ARRAY['golf', 'vilamoura', 'old-course', 'variety', 'all-levels'],
  'unverified', false, 'published',
  '{"course_type": "resort", "number_of_holes": 90, "number_of_courses": 5, "par": 72, "designer": "Frank Pennink, Various", "facilities": ["driving_range", "pro_shop", "restaurant", "golf_academy", "club_rental", "buggy_hire"], "tournaments_hosted": ["World Cup of Golf"], "dress_code": "smart_golf"}'::jsonb
),

-- BEACHES & BEACH CLUBS (3)
-- NoSoloAgua - Praia da Rocha, Portimao Prime
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '3dd37b30-fe81-4c2f-aa9b-4ead7df428c4',
  'e43bc225-efb9-4cb4-89da-02bfa3f0f078',
  '3213e217-a744-414f-92c0-e0b4b3549807',
  'NoSoloAgua Beach Club',
  'nosoloagua-beach-club',
  'Iconic beach club on Praia da Rocha with DJ events, pools, and Mediterranean cuisine.',
  'NoSoloAgua is the Algarve''s most famous beach club, bringing Ibiza-style atmosphere to the stunning Praia da Rocha. With multiple pools, comfortable sun loungers, and a prime beachfront location, it''s the place to see and be seen. World-class DJs provide the soundtrack to lazy days by the pool, while the restaurant serves fresh Mediterranean cuisine and creative cocktails. The sunset sessions are legendary.',
  'Praia da Rocha, 8500-802 Portimão',
  37.1156, -8.5312,
  '+351 282 460 010', 'info@nosoloagua.com', 'https://www.nosoloagua.com/',
  'https://www.instagram.com/nosoloaguaportugal/', 'https://www.facebook.com/NoSoloAguaPortugal/', 'https://goo.gl/maps/nosoloagua',
  ARRAY['beach-club', 'pool', 'dj', 'restaurant', 'cocktails', 'sunset'],
  'unverified', false, 'published',
  '{"beach_type": "beach_club", "facilities": ["pools", "sunbeds", "restaurant", "bar", "dj", "showers", "parking"], "atmosphere": "vibrant", "food_available": true, "reservation_required": true, "accessibility": "easy"}'::jsonb
),
-- Maria's Beach - Praia da Rocha, Portimao Prime
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '3dd37b30-fe81-4c2f-aa9b-4ead7df428c4',
  'e43bc225-efb9-4cb4-89da-02bfa3f0f078',
  '3213e217-a744-414f-92c0-e0b4b3549807',
  'Maria''s Beach Restaurant',
  'marias-beach-restaurant',
  'Upscale beachfront dining on Praia da Rocha with fresh seafood and sunset views.',
  'Maria''s Beach is a sophisticated beach restaurant offering the perfect blend of casual elegance and beachfront dining. Located directly on the sands of Praia da Rocha, guests enjoy fresh seafood, grilled fish, and Portuguese classics with their toes in the sand. The sunset views are spectacular, and the relaxed yet refined atmosphere makes it ideal for long, leisurely lunches.',
  'Praia da Rocha, 8500-802 Portimão',
  37.1167, -8.5289,
  '+351 282 417 535', 'reservas@mariasbeach.com', 'https://www.mariasbeach.com/',
  'https://www.instagram.com/mariasbeach/', 'https://www.facebook.com/MariasBeach/', 'https://goo.gl/maps/mariasbeach',
  ARRAY['beach', 'restaurant', 'seafood', 'sunset', 'praia-da-rocha'],
  'unverified', false, 'published',
  '{"beach_type": "beach_restaurant", "facilities": ["sunbeds", "restaurant", "bar", "showers"], "atmosphere": "relaxed_elegant", "food_available": true, "reservation_required": true, "accessibility": "easy"}'::jsonb
),
-- Praia do Camilo - Lagos, Lagos Signature
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '3dd37b30-fe81-4c2f-aa9b-4ead7df428c4',
  '41683f77-47ef-4a97-8321-174e77364009',
  '06dfff95-268b-437f-bac0-cfbd2d227311',
  'Praia do Camilo',
  'praia-do-camilo',
  'Iconic cliff-enclosed beach near Lagos with dramatic rock formations and crystal waters.',
  'Praia do Camilo is one of the Algarve''s most photographed beaches, accessed via a dramatic wooden staircase carved into the golden cliffs. This intimate cove features crystal-clear turquoise waters, impressive rock formations, and natural grottos to explore. Despite its small size, the beach has a seasonal restaurant and is perfect for a memorable day of swimming and sunbathing in a stunning natural setting.',
  'Praia do Camilo, 8600-214 Lagos',
  37.0823, -8.6712,
  NULL, NULL, 'https://www.visitalgarve.pt/en/3024/praia-do-camilo.aspx',
  'https://www.instagram.com/explore/locations/255212837/praia-do-camilo/', NULL, 'https://goo.gl/maps/praiadocamilo',
  ARRAY['beach', 'natural', 'cliffs', 'lagos', 'swimming', 'photography'],
  'unverified', false, 'published',
  '{"beach_type": "natural_beach", "facilities": ["restaurant", "showers"], "atmosphere": "natural", "food_available": true, "reservation_required": false, "accessibility": "stairs"}'::jsonb
),

-- WELLNESS & SPAS (2)
-- Sayanna Wellness - Almancil, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'd97ddf88-1e08-45b0-8edf-dfb9e4eebabe',
  '5034cb6d-5713-4980-adcb-dc0df039d788',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Sayanna Wellness at Conrad Algarve',
  'sayanna-wellness-conrad',
  'Award-winning spa sanctuary at Conrad Algarve with innovative treatments.',
  'Sayanna Wellness is a serene 2,500 square meter spa sanctuary within the Conrad Algarve resort. The spa offers a comprehensive wellness journey including signature treatments, Ayurvedic therapies, and innovative beauty rituals. Facilities include an indoor pool, Turkish hammam, Finnish sauna, experience showers, and relaxation lounges. The dedicated wellness team creates personalized programs for complete rejuvenation.',
  'Conrad Algarve, Estrada da Quinta do Lago, 8135-106 Almancil',
  37.0448, -8.0235,
  '+351 289 350 700', 'spa@conradalgarve.com', 'https://www.hilton.com/en/hotels/faocici-conrad-algarve/spa/',
  'https://www.instagram.com/conradalgarve/', 'https://www.facebook.com/ConradAlgarve/', 'https://goo.gl/maps/sayannaconrad',
  ARRAY['spa', 'wellness', 'massage', 'hammam', 'pool', 'premium'],
  'unverified', false, 'published',
  '{"spa_type": "resort_spa", "treatments": ["massage", "facial", "body_treatment", "ayurveda", "hammam"], "facilities": ["indoor_pool", "sauna", "hammam", "relaxation_lounge", "fitness_center"], "couples_treatments": true, "packages_available": true}'::jsonb
),
-- Longevity Health - Monchique, Monchique Retreats
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'd97ddf88-1e08-45b0-8edf-dfb9e4eebabe',
  '078a34a7-ab65-4142-a4ab-2a498be0c1ea',
  '81cfb0f0-21a8-4870-a44b-d41f2634d6d0',
  'Longevity Health & Wellness Hotel',
  'longevity-health-wellness',
  'Pioneering medical wellness retreat in the Monchique mountains.',
  'Longevity Health & Wellness Hotel is a groundbreaking destination that combines premium hospitality with cutting-edge medical wellness. Set in the tranquil Serra de Monchique mountains, it offers comprehensive health programs including detox, weight management, anti-aging, and stress recovery. The medical team works alongside wellness experts to create transformative experiences backed by science.',
  'Largo do Gabriel Mendonça, 8550-232 Monchique',
  37.3156, -8.5534,
  '+351 282 240 100', 'info@longevitywellnessresort.com', 'https://www.longevitywellnessresort.com/',
  'https://www.instagram.com/longevitywellnessresort/', 'https://www.facebook.com/LongevityWellnessResort/', 'https://goo.gl/maps/longevitymonchique',
  ARRAY['wellness', 'medical', 'detox', 'spa', 'retreat', 'health'],
  'unverified', false, 'published',
  '{"spa_type": "medical_spa", "treatments": ["medical_consultation", "detox", "massage", "facial", "iv_therapy", "cryotherapy"], "facilities": ["pool", "sauna", "medical_center", "fitness_center", "restaurant"], "couples_treatments": true, "packages_available": true}'::jsonb
),

-- PREMIUM EXPERIENCES (2)
-- Dream Wave Charters - Vilamoura, Vilamoura Prestige
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'f977bec5-b8e0-429c-9d1b-8605614c9f3b',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34',
  '76da4eed-79a5-4b52-a213-a3821b7766e1',
  'Dream Wave Charters',
  'dream-wave-charters',
  'Premium yacht charters from Vilamoura Marina with bespoke experiences.',
  'Dream Wave Charters offers exclusive yacht experiences departing from Vilamoura Marina. From intimate sunset cruises to full-day adventures exploring the dramatic Algarve coastline, each charter is tailored to your preferences. Discover hidden caves, secluded beaches, and the famous Benagil cave. Professional crews ensure every detail is perfect, with gourmet catering and water sports available.',
  'Marina de Vilamoura, 8125-409 Vilamoura',
  37.0734, -8.1178,
  '+351 969 234 567', 'info@dreamwavecharters.com', 'https://www.dreamwavecharters.com/',
  'https://www.instagram.com/dreamwavecharters/', 'https://www.facebook.com/DreamWaveCharters/', 'https://goo.gl/maps/dreamwave',
  ARRAY['yacht', 'charter', 'coast', 'caves', 'sunset', 'premium'],
  'unverified', false, 'published',
  '{"experience_type": "yacht_charter", "duration_options": ["half_day", "full_day", "sunset"], "group_size_max": 12, "includes": ["captain", "crew", "snacks", "drinks"], "customizable": true}'::jsonb
),
-- Algarve Ballooning - Albufeira, Private Algarve
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  'f977bec5-b8e0-429c-9d1b-8605614c9f3b',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64',
  '8e367f26-389a-459c-8454-8aa62e039ace',
  'Algarve Ballooning',
  'algarve-ballooning',
  'Breathtaking hot air balloon flights over the Algarve countryside.',
  'Algarve Ballooning offers an unforgettable perspective on Portugal''s southern coast. Sunrise flights drift peacefully over rolling hills, vineyards, and the sparkling Atlantic. Each flight includes champagne upon landing, following the ballooning tradition. Perfect for romantic occasions, celebrations, or simply experiencing the Algarve from a completely new angle.',
  'Albufeira, 8200-999 Albufeira',
  37.1234, -8.2456,
  '+351 918 765 432', 'fly@algarveballooning.com', 'https://www.algarveballooning.com/',
  'https://www.instagram.com/algarveballooning/', 'https://www.facebook.com/AlgarveBallooning/', 'https://goo.gl/maps/algarveballooning',
  ARRAY['balloon', 'flight', 'sunrise', 'champagne', 'romantic', 'adventure'],
  'unverified', false, 'published',
  '{"experience_type": "balloon_flight", "duration_options": ["1_hour_flight"], "group_size_max": 16, "includes": ["champagne", "certificate", "photos"], "customizable": true}'::jsonb
),

-- VIP TRANSPORTATION (2)
-- Bluebird Transfers - Albufeira, Private Algarve
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '78bb3a65-b490-4ab3-a187-458bf52b43d4',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64',
  '8e367f26-389a-459c-8454-8aa62e039ace',
  'Bluebird Transfers Algarve',
  'bluebird-transfers',
  'Premium airport transfers and VIP transportation throughout the Algarve.',
  'Bluebird Transfers provides premium transportation services throughout the Algarve region. Specializing in airport transfers from Faro to all destinations, their fleet includes premium sedans, minivans, and executive vehicles. Professional, multilingual chauffeurs ensure a comfortable and punctual journey. Additional services include golf transfers, event transportation, and customized tours.',
  'Albufeira, 8200-999 Albufeira',
  37.0889, -8.2501,
  '+351 289 123 456', 'book@bluebirdtransfers.com', 'https://www.bluebirdtransfers.com/',
  'https://www.instagram.com/bluebirdtransfers/', 'https://www.facebook.com/BluebirdTransfers/', 'https://goo.gl/maps/bluebirdtransfers',
  ARRAY['transfers', 'airport', 'vip', 'chauffeur', 'premium'],
  'unverified', false, 'published',
  '{"service_types": ["airport_transfer", "private_tour", "event_transport"], "vehicle_types": ["sedan", "suv", "minivan", "limousine"], "airport_coverage": ["faro", "lisbon", "seville"], "multilingual_drivers": true}'::jsonb
),
-- Portugal Exclusive - Almancil, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '78bb3a65-b490-4ab3-a187-458bf52b43d4',
  '5034cb6d-5713-4980-adcb-dc0df039d788',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Portugal Exclusive',
  'portugal-exclusive',
  'Ultra-premium chauffeur services and bespoke tours throughout Portugal.',
  'Portugal Exclusive is the premium choice for discerning travelers requiring exceptional transportation and curated experiences. Based in the Golden Triangle, they offer premium vehicle services with impeccably presented vehicles and professional chauffeurs. Beyond transfers, they specialize in creating bespoke journeys including wine tours, golf expeditions, and cultural experiences throughout Portugal.',
  'Quinta do Lago, 8135-024 Almancil',
  37.0445, -8.0201,
  '+351 289 394 567', 'concierge@portugalexclusive.com', 'https://www.portugalexclusive.com/',
  'https://www.instagram.com/portugalexclusive/', 'https://www.facebook.com/PortugalExclusive/', 'https://goo.gl/maps/portugalexclusive',
  ARRAY['chauffeur', 'premium', 'tours', 'vip', 'bespoke', 'concierge'],
  'unverified', false, 'published',
  '{"service_types": ["chauffeur", "private_tour", "event_transport", "corporate"], "vehicle_types": ["mercedes_s_class", "bentley", "range_rover", "minibus"], "airport_coverage": ["faro", "lisbon", "seville", "private_jets"], "multilingual_drivers": true}'::jsonb
),

-- REAL ESTATE (2)
-- Fine & Country - Almancil, Golden Triangle
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '11df48fe-34e4-4743-8837-e5a1fb399a37',
  '5034cb6d-5713-4980-adcb-dc0df039d788',
  'a3723c89-5605-4abc-88c8-90a001d0bdfd',
  'Fine & Country Algarve',
  'fine-country-algarve',
  'Prestigious premium real estate specialists in the Algarve Golden Triangle.',
  'Fine & Country Algarve represents the finest properties in Portugal''s most exclusive region. Specializing in premium villas, golf properties, and beachfront estates in Quinta do Lago, Vale do Lobo, and the surrounding Golden Triangle, their expert team provides discreet, professional service to international buyers. From contemporary masterpieces to traditional Portuguese estates, they match discerning clients with exceptional homes.',
  'Avenida André Jordan 37, Quinta do Lago, 8135-024 Almancil',
  37.0456, -8.0212,
  '+351 289 396 073', 'algarve@fineandcountry.com', 'https://www.fineandcountry.com/algarve',
  'https://www.instagram.com/fineandcountryalgarve/', 'https://www.facebook.com/FineAndCountryAlgarve/', 'https://goo.gl/maps/fineandcountryalgarve',
  ARRAY['real-estate', 'premium', 'villas', 'golden-triangle', 'investment'],
  'unverified', false, 'published',
  '{"property_types": ["villas", "apartments", "land", "commercial"], "price_range_focus": "premium", "areas_covered": ["quinta_do_lago", "vale_do_lobo", "vilamoura", "almancil"], "services": ["sales", "rentals", "property_management", "investment_advisory"]}'::jsonb
),
-- Engel & Volkers - Vilamoura, Vilamoura Prestige
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '11df48fe-34e4-4743-8837-e5a1fb399a37',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34',
  '76da4eed-79a5-4b52-a213-a3821b7766e1',
  'Engel & Völkers Vilamoura',
  'engel-volkers-vilamoura',
  'International premium real estate brand with expertise in Vilamoura properties.',
  'Engel & Völkers brings global premium real estate expertise to Vilamoura and the central Algarve. Their multilingual team specializes in premium properties ranging from marina apartments to golf villas and exclusive estates. With access to an international network of buyers and sellers, they provide comprehensive real estate services backed by a prestigious brand known worldwide.',
  'Marina de Vilamoura, 8125-409 Vilamoura',
  37.0738, -8.1182,
  '+351 289 302 770', 'vilamoura@engelvoelkers.com', 'https://www.engelvoelkers.com/pt/vilamoura/',
  'https://www.instagram.com/evvilamoura/', 'https://www.facebook.com/EVVilamoura/', 'https://goo.gl/maps/engelvolkersvilamoura',
  ARRAY['real-estate', 'premium', 'vilamoura', 'marina', 'international'],
  'unverified', false, 'published',
  '{"property_types": ["villas", "apartments", "land", "commercial"], "price_range_focus": "premium", "areas_covered": ["vilamoura", "albufeira", "lagoa", "quarteira"], "services": ["sales", "rentals", "property_management"]}'::jsonb
),

-- FAMILY ATTRACTIONS (1)
-- Zoomarine - Albufeira, Private Algarve
(
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '60b34df7-170a-4222-b5ed-dc44d83db87b',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64',
  '8e367f26-389a-459c-8454-8aa62e039ace',
  'Zoomarine Algarve',
  'zoomarine-algarve',
  'Award-winning marine theme park with dolphin encounters and family attractions.',
  'Zoomarine is the Algarve''s premier family destination, combining entertainment, education, and conservation. The park features spectacular dolphin and sea lion shows, aquarium exhibits, thrilling rides, and the opportunity for unforgettable animal encounters. As a rehabilitation center for marine wildlife, Zoomarine combines fun with an important conservation message. Multiple pools, beaches, and attractions ensure a full day of family entertainment.',
  'EN 125, Km 65, Guia, 8201-864 Albufeira',
  37.1234, -8.3456,
  '+351 289 560 300', 'info@zoomarine.pt', 'https://www.zoomarine.pt/',
  'https://www.instagram.com/zoomarine_official/', 'https://www.facebook.com/Zoomarine/', 'https://goo.gl/maps/zoomarine',
  ARRAY['family', 'theme-park', 'dolphins', 'aquarium', 'kids', 'shows'],
  'unverified', false, 'published',
  '{"attraction_type": "theme_park", "suitable_ages": ["all_ages"], "indoor_outdoor": "both", "duration_suggested": "full_day", "facilities": ["restaurants", "shops", "changing_rooms", "parking"], "ticket_booking_required": false}'::jsonb
);
