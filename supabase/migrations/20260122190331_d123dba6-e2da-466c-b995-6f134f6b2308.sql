-- Add Silves city if not exists
INSERT INTO public.cities (name, slug, is_active, is_featured, display_order)
SELECT 'Silves', 'silves', true, false, 30
WHERE NOT EXISTS (SELECT 1 FROM public.cities WHERE slug = 'silves');
-- Seed 30+ real Algarve golf courses
INSERT INTO public.listings (
  name, slug, description, short_description, owner_id, category_id, city_id, region_id, tier, status, is_curated, category_data, tags, address
) VALUES
-- Championship Courses
(
  'Monte Rei Golf & Country Club (North Course)',
  'monte-rei-north-course',
  'Monte Rei''s North Course is a stunning Jack Nicklaus Signature Design that has been ranked as one of the best courses in continental Europe. Set against the backdrop of the Serra do Caldeirão mountains, this masterpiece features immaculate conditioning, dramatic elevation changes, and strategic bunkering. The course offers breathtaking views and challenging yet fair golf that rewards thoughtful play.',
  'Jack Nicklaus Signature Design ranked among Europe''s finest.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6592 meters", "designer": "Jack Nicklaus", "course_type": "Championship", "style": "Parkland", "rating": "5-star", "green_fees_from": 220, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Spa", "Accommodation"], "awards": ["Top 100 Golf Courses in Europe"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'jack nicklaus', 'premium', 'signature design', 'european ranking'],
  'Sítio do Pocinho, 8901-907 Vila Nova de Cacela'
),
(
  'Vilamoura Victoria Golf Course',
  'vilamoura-victoria',
  'Home to the Portugal Masters on the European Tour, Vilamoura Victoria is an Arnold Palmer designed championship course that has hosted golf''s elite since 2007. The course features wide fairways, strategic water hazards, and fast, undulating greens. Its five stunning lakes and parkland setting make it both a visual treat and a genuine test of golf.',
  'Arnold Palmer design hosting the European Tour''s Portugal Masters.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6560 meters", "designer": "Arnold Palmer", "course_type": "Championship", "style": "Parkland", "rating": "5-star", "green_fees_from": 165, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Bar"], "awards": ["Portugal Masters Venue", "European Tour Host"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'arnold palmer', 'european tour', 'portugal masters', 'tournament venue'],
  'Avenida dos Descobrimentos, 8125-507 Vilamoura'
),
(
  'Vilamoura Old Course',
  'vilamoura-old-course',
  'The iconic Vilamoura Old Course, designed by Frank Pennink in 1969, is considered one of the finest traditional layouts in Portugal. Winding through ancient umbrella pines, this classic championship course offers a genuine test with narrow fairways and well-protected greens. Recently upgraded by Martin Hawtree, it retains its timeless character.',
  'Classic Frank Pennink design through ancient pine forest.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 73, "course_length": "6254 meters", "designer": "Frank Pennink", "course_type": "Championship", "style": "Traditional Parkland", "rating": "4.5-star", "green_fees_from": 155, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": ["Classic Championship Course"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['classic', 'traditional', 'umbrella pines', 'championship', 'heritage'],
  'Urbanização de Vilamoura, 8125-507 Vilamoura'
),
(
  'Quinta do Lago South Course',
  'quinta-do-lago-south',
  'The South Course at Quinta do Lago has hosted the Portuguese Open eight times and remains one of the most prestigious layouts in Europe. Designed by William Mitchell, it winds through cork oaks, umbrella pines, and tranquil lakes within the Ria Formosa Natural Park. Championship quality with immaculate conditioning year-round.',
  'Multiple Portuguese Open host through Ria Formosa nature reserve.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0af59e61-b1bd-4192-a9e5-50950767e72b', -- Quinta do Lago
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6488 meters", "designer": "William Mitchell", "course_type": "Championship", "style": "Parkland", "rating": "5-star", "green_fees_from": 240, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Fine Dining", "Golf Academy"], "awards": ["8x Portuguese Open Host"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'portuguese open', 'ria formosa', 'premium', 'nature reserve'],
  'Quinta do Lago, 8135-024 Almancil'
),
(
  'Quinta do Lago North Course',
  'quinta-do-lago-north',
  'Redesigned by Beau Welling in consultation with Paul McGinley, the North Course offers a modern championship experience with strategic options from tee to green. The layout traverses stunning umbrella pines and indigenous vegetation, with excellent risk-reward opportunities on every hole.',
  'Recently redesigned by Beau Welling with Paul McGinley.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0af59e61-b1bd-4192-a9e5-50950767e72b', -- Quinta do Lago
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6180 meters", "designer": "Beau Welling / Paul McGinley", "course_type": "Championship", "style": "Modern Parkland", "rating": "4.5-star", "green_fees_from": 195, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Golf Academy"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'modern design', 'paul mcginley', 'pine forest', 'strategic'],
  'Quinta do Lago, 8135-024 Almancil'
),
(
  'Quinta do Lago Laranjal Course',
  'quinta-do-lago-laranjal',
  'The Laranjal Course is a Jorge Santana da Silva design that opened in 2009. Named after the orange groves that once occupied the site, it features dramatic water hazards, strategic bunkering, and excellent conditioning. A challenging yet fair test suitable for all skill levels.',
  'Jorge Santana da Silva design among orange groves and lakes.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '5034cb6d-5713-4980-adcb-dc0df039d788', -- Almancil
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6480 meters", "designer": "Jorge Santana da Silva", "course_type": "Championship", "style": "Parkland", "rating": "4-star", "green_fees_from": 155, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'lakes', 'orange groves', 'modern', 'strategic'],
  'Estrada do Ludo, 8135-024 Almancil'
),
(
  'Vale do Lobo Royal Course',
  'vale-do-lobo-royal',
  'The Royal Course at Vale do Lobo features the iconic cliff-top 16th hole, one of the most photographed par 3s in world golf. Redesigned by Rocky Roquemore, the course combines Sir Henry Cotton''s original design vision with modern playability. Dramatic ocean views and pristine conditioning throughout.',
  'Home to the famous cliff-top 16th hole overlooking the Atlantic.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '4636e0b4-7b32-4e7a-839e-fc1a616e2410', -- Vale do Lobo
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6060 meters", "designer": "Sir Henry Cotton / Rocky Roquemore", "course_type": "Championship", "style": "Links-Parkland", "rating": "4.5-star", "green_fees_from": 210, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Ocean View Terrace"], "awards": ["Iconic Cliff-top 16th"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'cliff-top', 'ocean views', 'iconic', 'henry cotton'],
  'Vale do Lobo Resort, 8135-864 Almancil'
),
(
  'Vale do Lobo Ocean Course',
  'vale-do-lobo-ocean',
  'The Ocean Course at Vale do Lobo offers another Sir Henry Cotton design with stunning Atlantic Ocean views. The layout features undulating fairways through umbrella pines with several holes offering glimpses of the sea. A challenging and scenic round of golf.',
  'Sir Henry Cotton design with Atlantic Ocean vistas.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '4636e0b4-7b32-4e7a-839e-fc1a616e2410', -- Vale do Lobo
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "5790 meters", "designer": "Sir Henry Cotton", "course_type": "Championship", "style": "Parkland", "rating": "3.5-star", "green_fees_from": 175, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['ocean views', 'pine forest', 'henry cotton', 'atlantic', 'scenic'],
  'Vale do Lobo Resort, 8135-864 Almancil'
),
(
  'Amendoeira Faldo Course',
  'amendoeira-faldo',
  'Designed by six-time Major winner Sir Nick Faldo, the Faldo Course at Amendoeira is a strategic masterpiece requiring accurate shot-making. The undulating terrain, clever bunkering, and challenging greens provide a true championship test. One of the Algarve''s most respected layouts.',
  'Sir Nick Faldo strategic championship design.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64', -- Albufeira (closest major city to Silves)
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6445 meters", "designer": "Sir Nick Faldo", "course_type": "Championship", "style": "Inland Links", "rating": "4.5-star", "green_fees_from": 125, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Accommodation"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'nick faldo', 'strategic', 'links style', 'major winner design'],
  'Morgado do Reguengo, 8365-023 Alcantarilha'
),
(
  'Amendoeira O''Connor Jnr Course',
  'amendoeira-oconnor',
  'The O''Connor Jnr Course at Amendoeira, designed by Christy O''Connor Junior, offers a more forgiving layout than its Faldo neighbor. Wide fairways and generous greens make it accessible to mid-handicappers while still providing challenges for low handicappers.',
  'Christy O''Connor Jr design - accessible yet challenging.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64', -- Albufeira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6371 meters", "designer": "Christy O''Connor Jr", "course_type": "Championship", "style": "Parkland", "rating": "4-star", "green_fees_from": 95, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Accommodation"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'christy oconnor', 'accessible', 'wide fairways', 'resort'],
  'Morgado do Reguengo, 8365-023 Alcantarilha'
),
(
  'Penina Championship Course',
  'penina-championship',
  'The Penina Championship Course, designed by Sir Henry Cotton in 1966, was the first 18-hole golf course in the Algarve and remains one of its finest. This parkland layout has hosted the Portuguese Open multiple times and features tree-lined fairways, strategic water hazards, and championship-quality conditioning.',
  'Historic Sir Henry Cotton design - Algarve''s first championship course.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '50c742cc-34ce-485f-bee9-db9f0d4c916b', -- Portimão
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 73, "course_length": "6348 meters", "designer": "Sir Henry Cotton", "course_type": "Championship", "style": "Parkland", "rating": "4-star", "green_fees_from": 120, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Hotel", "Restaurant", "Spa"], "awards": ["Portuguese Open Host", "First Algarve Course"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['historic', 'henry cotton', 'portuguese open', 'classic', 'championship'],
  'PGA Penina, 8500-016 Portimão'
),
(
  'San Lorenzo Golf Course',
  'san-lorenzo-golf',
  'San Lorenzo, designed by Joseph Lee, is set within the Ria Formosa Natural Park and is consistently ranked among Europe''s finest courses. The layout features six holes along the Ria Formosa estuary with stunning views of the Atlantic. A genuine links-parkland hybrid.',
  'Joseph Lee masterpiece within Ria Formosa Natural Park.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '5034cb6d-5713-4980-adcb-dc0df039d788', -- Almancil
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6238 meters", "designer": "Joseph Lee", "course_type": "Championship", "style": "Links-Parkland", "rating": "5-star", "green_fees_from": 225, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": ["Top 100 European Courses"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['ria formosa', 'nature reserve', 'estuary', 'european ranking', 'elite'],
  'Quinta do Lago, 8135-024 Almancil'
),
-- Vilamoura Cluster
(
  'Vilamoura Pinhal Course',
  'vilamoura-pinhal',
  'The Pinhal Course was redesigned by Robert Trent Jones Sr. and offers a classic parkland experience through umbrella pines. Technical and strategic, it rewards accuracy over length. A favorite among mid-handicappers.',
  'Robert Trent Jones Sr. design through umbrella pines.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "5992 meters", "designer": "Frank Pennink / Robert Trent Jones Sr.", "course_type": "Resort", "style": "Parkland", "rating": "3.5-star", "green_fees_from": 110, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['pine forest', 'traditional', 'trent jones', 'accuracy', 'parkland'],
  'Urbanização de Vilamoura, 8125-507 Vilamoura'
),
(
  'Vilamoura Millennium Course',
  'vilamoura-millennium',
  'Designed by Martin Hawtree to mark the new millennium, this course offers a modern parkland experience with strategic water features and well-protected greens. An excellent test for all levels.',
  'Martin Hawtree modern design with strategic water hazards.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6153 meters", "designer": "Martin Hawtree", "course_type": "Resort", "style": "Modern Parkland", "rating": "3-star", "green_fees_from": 95, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['modern', 'water hazards', 'hawtree', 'accessible', 'millennium'],
  'Urbanização de Vilamoura, 8125-507 Vilamoura'
),
(
  'Vilamoura Laguna Course',
  'vilamoura-laguna',
  'The Laguna Course, designed by Joseph Lee, features dramatic water hazards on most holes. Set within a saltwater lagoon system, it offers a unique coastal parkland experience with spectacular wildlife.',
  'Joseph Lee design with dramatic water features.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6115 meters", "designer": "Joseph Lee", "course_type": "Resort", "style": "Coastal Parkland", "rating": "3.5-star", "green_fees_from": 100, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['water hazards', 'lagoon', 'wildlife', 'coastal', 'joseph lee'],
  'Urbanização de Vilamoura, 8125-507 Vilamoura'
),
-- Pestana Group Courses
(
  'Pestana Vila Sol Golf Course',
  'pestana-vila-sol',
  'Vila Sol, designed by Donald Steel, is a 27-hole championship facility offering three distinct loops. The Prime and Challenge courses combine to create a demanding 18-hole routing through umbrella pines with strategic water hazards.',
  'Donald Steel 27-hole championship complex.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'e78664ac-bdde-4e8f-aa6d-8492e60f9b34', -- Vilamoura
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 27, "par": 72, "course_length": "6186 meters", "designer": "Donald Steel", "course_type": "Championship", "style": "Parkland", "rating": "4-star", "green_fees_from": 130, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Hotel", "Restaurant", "Spa"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['27 holes', 'championship', 'donald steel', 'resort', 'versatile'],
  'Alto do Semino, 8125-307 Vilamoura'
),
(
  'Pestana Vale da Pinta',
  'pestana-vale-da-pinta',
  'Vale da Pinta, designed by Ronald Fream, offers a unique experience with ancient olive and carob trees dotting the landscape. The course is known for its excellent conditioning and fair challenge to all skill levels.',
  'Ronald Fream design among ancient olive groves.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'd524dbd1-b2dd-46b0-a0fe-457d90fff1ea', -- Carvoeiro
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 71, "course_length": "5979 meters", "designer": "Ronald Fream", "course_type": "Resort", "style": "Parkland", "rating": "4-star", "green_fees_from": 85, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['olive trees', 'historic', 'fream design', 'accessible', 'scenic'],
  'Apartado 1011, 8401-908 Lagoa'
),
(
  'Pestana Gramacho',
  'pestana-gramacho',
  'Gramacho, redesigned by Nick Price, offers a fun and accessible layout suitable for all skill levels. Wide fairways and receptive greens make it perfect for high handicappers while strategic options challenge better players.',
  'Nick Price redesign - accessible and enjoyable for all.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'd524dbd1-b2dd-46b0-a0fe-457d90fff1ea', -- Carvoeiro
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 71, "course_length": "5609 meters", "designer": "Ronald Fream / Nick Price", "course_type": "Resort", "style": "Parkland", "rating": "3-star", "green_fees_from": 65, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['accessible', 'nick price', 'wide fairways', 'beginner friendly', 'value'],
  'Apartado 1011, 8401-908 Lagoa'
),
(
  'Morgado Golf Course',
  'morgado-golf',
  'Morgado Golf Course, designed by European Golf Design, is set within the rolling Algarve countryside offering panoramic mountain views. The layout is challenging yet fair with strategic bunkering and undulating greens.',
  'European Golf Design layout with mountain views.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '50c742cc-34ce-485f-bee9-db9f0d4c916b', -- Portimão
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 73, "course_length": "6351 meters", "designer": "European Golf Design", "course_type": "Resort", "style": "Parkland", "rating": "3.5-star", "green_fees_from": 75, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Hotel", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['mountain views', 'countryside', 'european golf design', 'resort', 'panoramic'],
  'Morgado do Reguengo, 8500-148 Portimão'
),
(
  'Álamos Golf Course',
  'alamos-golf',
  'Álamos Golf Course offers a challenging parkland layout with stunning views of the Monchique mountains. A sister course to Morgado, it provides excellent value while maintaining high conditioning standards.',
  'Scenic parkland with Monchique mountain views.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '50c742cc-34ce-485f-bee9-db9f0d4c916b', -- Portimão
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 71, "course_length": "5585 meters", "designer": "Unknown", "course_type": "Resort", "style": "Parkland", "rating": "3-star", "green_fees_from": 55, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['mountain views', 'monchique', 'value', 'scenic', 'parkland'],
  'Morgado do Reguengo, 8500-148 Portimão'
),
-- Western Algarve Courses
(
  'Palmares Golf Course',
  'palmares-golf',
  'Palmares, redesigned by Robert Trent Jones Jr., offers a unique links-parkland hybrid with stunning Lagos Bay views. The front nine winds through dunes along the beach while the back nine offers parkland challenges with spectacular ocean vistas.',
  'Robert Trent Jones Jr. links-style course overlooking Lagos Bay.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '41683f77-47ef-4a97-8321-174e77364009', -- Lagos
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 27, "par": 71, "course_length": "5961 meters", "designer": "Robert Trent Jones Jr.", "course_type": "Resort", "style": "Links-Parkland", "rating": "4-star", "green_fees_from": 130, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Ocean Views"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['links', 'ocean views', 'lagos bay', 'trent jones', 'beach dunes'],
  'Meia Praia, 8600-901 Lagos'
),
(
  'Boavista Golf & Spa Resort',
  'boavista-golf',
  'Boavista, designed by Howard Swan, is a scenic parkland course perched above Lagos Bay. The layout features dramatic elevation changes with panoramic Atlantic views from numerous holes.',
  'Howard Swan design with panoramic Lagos Bay views.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '41683f77-47ef-4a97-8321-174e77364009', -- Lagos
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 71, "course_length": "5777 meters", "designer": "Howard Swan", "course_type": "Resort", "style": "Parkland", "rating": "3.5-star", "green_fees_from": 90, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Hotel", "Restaurant", "Spa"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['ocean views', 'lagos', 'spa', 'resort', 'elevation'],
  'Praia da Luz, 8600-145 Lagos'
),
(
  'Espiche Golf Course',
  'espiche-golf',
  'Espiche Golf, designed by Peter Sauerman, is one of the Algarve''s most environmentally sustainable courses. The layout offers a genuine links experience with firm, fast surfaces and strategic bunkering amid stunning natural landscape.',
  'Sustainable Peter Sauerman design with links characteristics.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '41683f77-47ef-4a97-8321-174e77364009', -- Lagos
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "5968 meters", "designer": "Peter Sauerman", "course_type": "Resort", "style": "Inland Links", "rating": "4-star", "green_fees_from": 85, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": ["Sustainable Golf Course"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['sustainable', 'links style', 'eco-friendly', 'lagos', 'natural'],
  'Espiche, 8600-308 Lagos'
),
(
  'Parque da Floresta Golf & Leisure Resort',
  'parque-da-floresta',
  'Parque da Floresta, designed by Pepe Gancedo, is set on dramatic hillside terrain near Vila do Bispo. The course offers challenging elevation changes and stunning views toward the Atlantic.',
  'Pepe Gancedo design with dramatic hillside routing.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'b28e720d-9609-427e-9e07-2dc6d7c1c68a', -- Vila do Bispo
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "5469 meters", "designer": "Pepe Gancedo", "course_type": "Resort", "style": "Hillside", "rating": "3-star", "green_fees_from": 65, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Hotel", "Restaurant", "Spa"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['hillside', 'vila do bispo', 'elevation', 'atlantic views', 'resort'],
  'Vale do Poço, 8650-060 Budens'
),
-- Central/Eastern Algarve Courses
(
  'Ombria Golf Resort',
  'ombria-golf',
  'Ombria, designed by Jorge Santana da Silva, is one of the Algarve''s newest and most acclaimed courses. Set in the rolling hills near Loulé, it offers a unique experience amid cork oaks and natural terrain with stunning mountain views.',
  'Jorge Santana da Silva design amid cork oaks and hills.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  'dc716e25-5b1d-4f23-999f-aeb456652c1c', -- Loulé
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 71, "course_length": "6289 meters", "designer": "Jorge Santana da Silva", "course_type": "Resort", "style": "Mountain Parkland", "rating": "4-star", "green_fees_from": 120, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Hotel", "Restaurant", "Spa"], "awards": ["New Course of the Year"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['cork oaks', 'mountain', 'loule', 'new course', 'natural terrain'],
  'Estrada Nacional 124, 8100-328 Querença'
),
(
  'Oceanico Faldo Course',
  'oceanico-faldo-course',
  'Another Sir Nick Faldo creation at the Oceanico complex, this course demands precise shot-making and strategic course management. The layout tests all aspects of your game with well-defended greens and strategic bunkering.',
  'Sir Nick Faldo championship design demanding precision.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64', -- Albufeira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6445 meters", "designer": "Sir Nick Faldo", "course_type": "Championship", "style": "Inland Links", "rating": "4.5-star", "green_fees_from": 125, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Accommodation"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['championship', 'nick faldo', 'strategic', 'precision', 'oceanico'],
  'Morgado do Reguengo, 8365-023 Alcantarilha'
),
(
  'Salgados Golf Course',
  'salgados-golf',
  'Salgados is a unique parkland course set alongside the Salgados lagoon, a protected nature reserve teeming with birdlife. The layout offers an enjoyable round with water on several holes and flamingo sightings common.',
  'Scenic course alongside protected lagoon with flamingos.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64', -- Albufeira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6080 meters", "designer": "Unknown", "course_type": "Resort", "style": "Coastal Parkland", "rating": "3-star", "green_fees_from": 70, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['lagoon', 'flamingos', 'nature reserve', 'birdlife', 'coastal'],
  'Vale Rabelho, 8200-424 Albufeira'
),
(
  'Pine Cliffs Golf Course',
  'pine-cliffs-golf',
  'Pine Cliffs is a unique 9-hole layout (par 33) perched atop dramatic red cliffs overlooking the Atlantic. The Devil''s Parlour, a par 3 played over a cliff gorge, is one of golf''s most photographed holes.',
  'Spectacular cliff-top 9-hole with the famous Devil''s Parlour.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b40410e-cc87-4319-8a67-00eaa3ecda64', -- Albufeira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 9, "par": 33, "course_length": "1275 meters", "designer": "Martin Hawtree", "course_type": "Resort", "style": "Cliff-top", "rating": "3.5-star", "green_fees_from": 80, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Premium Resort", "Restaurant", "Spa"], "awards": ["Devils Parlour - Iconic Hole"], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['cliff-top', 'iconic', 'devils parlour', '9 holes', 'atlantic'],
  'Praia da Falésia, 8200-593 Albufeira'
),
(
  'Benamor Golf Course',
  'benamor-golf',
  'Benamor, near Tavira, is a charming 18-hole layout designed by Sir Henry Cotton. Set amid citrus groves and gentle hills, it offers a relaxing round with beautiful eastern Algarve scenery.',
  'Sir Henry Cotton design amid citrus groves near Tavira.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 71, "course_length": "5459 meters", "designer": "Sir Henry Cotton", "course_type": "Resort", "style": "Parkland", "rating": "3-star", "green_fees_from": 55, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['citrus groves', 'tavira', 'henry cotton', 'relaxing', 'eastern algarve'],
  'Sitio da Malhada, 8800-053 Tavira'
),
(
  'Castro Marim Golfe & Country Club',
  'castro-marim-golf',
  'Castro Marim is the easternmost course in the Algarve, set on rolling terrain with views toward Spain. The three 9-hole loops (Atlantic, Guadiana, Grouse) offer variety and excellent value.',
  'Eastern Algarve course with Spanish border views.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira (closest major city)
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 27, "par": 71, "course_length": "5988 meters", "designer": "Terry Murray", "course_type": "Resort", "style": "Parkland", "rating": "3-star", "green_fees_from": 60, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant", "Accommodation"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['27 holes', 'spanish border', 'eastern algarve', 'value', 'variety'],
  '8950-909 Castro Marim'
),
(
  'Quinta da Ria Golf Course',
  'quinta-da-ria',
  'Quinta da Ria, designed by Rocky Roquemore, is set within the Ria Formosa Natural Park near Tavira. The layout features stunning estuary views and challenging water hazards on several holes.',
  'Rocky Roquemore design within Ria Formosa Natural Park.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6080 meters", "designer": "Rocky Roquemore", "course_type": "Resort", "style": "Coastal Parkland", "rating": "3.5-star", "green_fees_from": 70, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['ria formosa', 'tavira', 'estuary', 'natural park', 'water hazards'],
  'Vila Nova de Cacela, 8901-907 Tavira'
),
(
  'Quinta de Cima Golf Course',
  'quinta-de-cima',
  'Quinta de Cima, sister course to Quinta da Ria, offers a more inland parkland experience with dramatic elevation changes and panoramic views of the eastern Algarve.',
  'Sister course to Quinta da Ria with panoramic views.',
  '280be9b4-c0fe-48f3-b371-f490d8cccfd5',
  '85559e3f-6fbb-40fa-a7d9-e2bb41ea41c9',
  '0b48a2c5-a221-41a1-9c82-677cf534861c', -- Tavira
  NULL,
  'unverified',
  'published',
  false,
  '{"holes": 18, "par": 72, "course_length": "6252 meters", "designer": "Rocky Roquemore", "course_type": "Resort", "style": "Inland Parkland", "rating": "4-star", "green_fees_from": 75, "facilities": ["Pro Shop", "Practice Range", "Clubhouse", "Restaurant"], "awards": [], "equipment_rental": true, "lessons_available": true, "buggy_included": false}'::jsonb,
  ARRAY['elevation', 'panoramic', 'tavira', 'inland', 'challenging'],
  'Vila Nova de Cacela, 8901-907 Tavira'
);
