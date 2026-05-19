begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Camilo",
    "type": "Nearby beach",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Porto de Mós by stored coordinates.",
    "href": "/listing/praia-do-camilo-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Dona Ana",
    "type": "Nearby beach",
    "distance": "~1.8 km",
    "description": "Published AlgarveOfficial Lagos cliff beach listing east of Porto de Mós by stored coordinates.",
    "href": "/listing/praia-de-dona-ana-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Luz",
    "type": "Nearby beach",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial Lagos beach listing west of Porto de Mós by stored coordinates.",
    "href": "/listing/praia-da-luz-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Meia Praia",
    "type": "Nearby beach",
    "distance": "~4.6 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Porto de Mós by stored coordinates.",
    "href": "/listing/meia-praia-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~7.9 km",
    "description": "Published AlgarveOfficial west-Lagos coast beach listing by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Alvor",
    "type": "Nearby beach",
    "distance": "~9.1 km",
    "description": "Published AlgarveOfficial Portimão beach listing east of Lagos by stored coordinates.",
    "href": "/listing/praia-de-alvor-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Mirandus",
    "type": "Restaurant",
    "distance": "~0.5 km",
    "description": "Closest published AlgarveOfficial restaurant listing by stored coordinates; not verified as being on Porto de Mós beach.",
    "href": "/listing/mirandus-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante dos Artistas",
    "type": "Restaurant",
    "distance": "~2.2 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored coordinates.",
    "href": "/listing/restaurante-dos-artistas-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "DON GULL",
    "type": "Restaurant",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored coordinates.",
    "href": "/listing/don-gull-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Le Clubhouse Restaurant",
    "type": "Restaurant",
    "distance": "~2.6 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored coordinates.",
    "href": "/listing/le-clubhouse-restaurant-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida",
    "type": "Restaurant",
    "distance": "~2.6 km",
    "description": "Published AlgarveOfficial Lagos restaurant listing by stored coordinates.",
    "href": "/listing/avenida-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Belmar SPA & Beach Resort",
    "type": "Wellness",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial wellness listing near Porto de Mós by stored coordinates.",
    "href": "/listing/belmar-spa-beach-resort-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "LUX MARE Exclusive Luxury Villas Lagos",
    "type": "Accommodation",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial accommodation listing near Porto de Mós by stored coordinates.",
    "href": "/listing/lux-mare-exclusive-luxury-villas-lagos-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Soluna Space Lagos - Massage, Yoga, Event Space",
    "type": "Wellness",
    "distance": "~1.2 km",
    "description": "Published AlgarveOfficial wellness listing near Porto de Mós by stored coordinates.",
    "href": "/listing/soluna-space-lagos-massage-yoga-event-space-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Art Inspirada Art Gallery",
    "type": "Nearby business",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial shopping and gallery listing near Lagos by stored coordinates.",
    "href": "/listing/art-inspirada-art-gallery-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta de Lagos",
    "type": "Wellness",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial wellness listing near Porto de Mós by stored coordinates.",
    "href": "/listing/quinta-de-lagos-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Atalaia Wellness - Massage, Physiotherapy & Beauty",
    "type": "Wellness",
    "distance": "~1.6 km",
    "description": "Published AlgarveOfficial wellness listing near the Atalaia and Porto de Mós area by stored coordinates.",
    "href": "/listing/atalaia-wellness-massage-physiotherapy-beauty-quarteira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Porto de Mós is a large sandy beach west of Lagos, framed by high cliffs and known for easier access than the smaller Lagos coves. VisitPortugal lists parking, services and accessible-beach status, and ABAAE verifies 2026 Blue Flag status.';
  v_full_description text := $text$
Praia de Porto de Mós is one of Lagos' larger and more practical beaches, located west of the city below high cliffs. VisitPortugal describes a long tongue of golden sand, with blue-green sea tones and a cliff-top walking route west towards Miradouro da Atalaia.

The beach feels more open than the compact coves around Dona Ana and Camilo. Its broad sand and vehicle access make it useful for families, beach walkers and visitors who want a serviced Lagos beach without the staircase constraints found at some neighbouring cliff beaches. Official tourism sources list access by car, motorcycle and on foot, with parking, bars, restaurants, showers, sunshade rental, surveillance and accessible-beach status.

Porto de Mós also works well as a starting point for coastal walking. VisitPortugal references the cliff route towards Atalaia, with views towards Praia da Luz and the coastline in the direction of Sagres. The wider area also links naturally with the Lagos coast towards Canavial and Ponta da Piedade, although visitors should use official paths and keep away from cliff edges and cliff bases.

ABAAE verifies Porto de Mós as a 2026 Blue Flag awarded coastal beach. The official ABAAE page lists the 2026 bathing season from 1 June to 30 September and the 2026 Blue Flag season from 1 July to 30 September. Services and accessible-beach support should still be treated as seasonal, and swimmers should follow local flags, signage and lifeguard guidance.
$text$;
  v_best_time text := 'June to September matches the verified 2026 bathing season for Porto de Mós. The verified 2026 Blue Flag season runs from 1 July to 30 September. May, June and September are often more comfortable for longer beach walks, Atalaia views and easier access outside peak summer pressure.';
  v_important_notes text := 'ABAAE lists Porto de Mós as a 2026 Blue Flag awarded coastal beach in Lagos.
ABAAE lists the 2026 bathing season for Porto de Mós from 1 June 2026 to 30 September 2026.
ABAAE lists the 2026 Blue Flag season for Porto de Mós from 1 July 2026 to 30 September 2026.
Diário da República lists Porto de Mós in Lagos with bathing-water code PTCP2X and a 2026 season from 1 June to 30 September.
VisitPortugal lists surveillance, sunshade rental, showers, parking, bar, restaurant and accessible-beach status.
Exact parking capacity, payment rules and daily lifeguard staffing were not independently verified for this review.
Accessible-beach recognition is verified, but current adapted equipment and seasonal assistance should be confirmed locally.
The beach is backed by cliffs; visitors should avoid cliff bases, cliff edges and informal paths.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-porto-de-mos-lagos'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-porto-de-mos-lagos not found; skipping update.';
    return;
  end if;

  select coalesce(category_data->'sources_used', '[]'::jsonb)
    into v_sources
  from public.listings
  where id = v_listing_id;

  v_sources := (
    select jsonb_agg(source_item)
    from (
      select source_item
      from jsonb_array_elements(v_sources) as source(source_item)
      where source_item->>'source_name' not in (
        'VisitPortugal - Praia de Porto de Mós',
        'ABAAE Bandeira Azul - Porto de Mós',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Porto de Mós',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-de-porto-de-m%C3%B3s-0',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Lagos location',
          'Long golden-sand beach below high cliffs',
          'Cliff-top route west to Miradouro da Atalaia',
          'Views towards Praia da Luz and the Sagres coastline',
          'Facilities including Blue Flag, surveillance, sunshade rental, showers, parking, bar, restaurant and accessible beach',
          'Access by car, motorcycle and on foot'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Porto de Mós',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/porto-de-mos/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Porto de Mós Blue Flag entry',
          'Municipality of Lagos',
          'Coordinates 37.085635, -8.68802',
          'Beach code PTCP2X',
          '2026 bathing season from 1 June to 30 September',
          '2026 Blue Flag season from 1 July to 30 September',
          'Blue Flag shown as not hoisted before the display season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Porto de Mós listed among Lagos 2026 Blue Flag awarded locations',
          'Lagos 2026 awarded locations listed as Luz, Meia Praia, Porto de Mós and Marina de Lagos'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Porto de Mós listed in Lagos',
          'Bathing-water code PTCP2X',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-porto-de-mos-lagos',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, wellness, accommodation, shopping and business cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Porto de Mós and the linked listings',
          'No external restaurant, attraction, business or competitor website links were added'
        )
      )
    ) as sources
  );

  select coalesce(category_data->'verification_notes', '[]'::jsonb)
    into v_notes
  from public.listings
  where id = v_listing_id;

  v_notes := (
    select jsonb_agg(note_item)
    from (
      select note_item
      from jsonb_array_elements(v_notes) as note(note_item)
      where note_item not in (
        to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text),
        to_jsonb('The closest published internal restaurant listings are not verified as being on Porto de Mós beach; distance labels and descriptions make this limitation explicit.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant listings are not verified as being on Porto de Mós beach; distance labels and descriptions make this limitation explicit.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Large sandy Lagos beach west of the city',
      'High cliffs framing the beach and route towards Miradouro da Atalaia',
      'Parking, showers, surveillance, bar, restaurant and accessible-beach status listed by VisitPortugal',
      'Access by car, motorcycle and on foot verified by VisitPortugal',
      'Porto de Mós 2026 bathing season verified from Diário da República and ABAAE',
      'Blue Flag status verified for 2026 via ABAAE'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia de Porto de Mós. Exact parking capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia de Porto de Mós as an accessible beach, and official local material describes accessible-beach support in Lagos. Current adapted equipment, assistance, reserved parking availability and the best access point should still be confirmed locally before travelling.',
    'lifeguard_info', 'Diário da República lists Porto de Mós as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. ABAAE lists the same 2026 bathing season. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE. The official Porto de Mós page lists the 2026 bathing season from 1 June to 30 September and the 2026 Blue Flag season from 1 July to 30 September.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Porto de Mós',
      'notes', 'Diário da República and ABAAE list Porto de Mós with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.085635%2C-8.68802',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists Porto de Mós as a 2026 Blue Flag awarded coastal beach in Lagos.',
        'The official 2026 Porto de Mós bathing season is 1 June to 30 September.',
        'The official 2026 Blue Flag season for Porto de Mós is 1 July to 30 September.',
        'VisitPortugal lists parking, surveillance, showers, bar, restaurant and accessible-beach status.',
        'Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified.',
        'Visitors should keep away from cliff bases and cliff edges.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Porto de Mós?', 'answer', 'Praia de Porto de Mós is west of Lagos city, in the municipality of Lagos on the western Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia de Porto de Mós?', 'answer', 'VisitPortugal lists parking for Praia de Porto de Mós. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia de Porto de Mós accessible?', 'answer', 'VisitPortugal lists Praia de Porto de Mós as an accessible beach. Current adapted equipment, assistance and the best access point should still be confirmed locally before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Porto de Mós?', 'answer', 'Diário da República lists Porto de Mós as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Porto de Mós a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Porto de Mós as a 2026 Blue Flag awarded beach, with a Blue Flag season from 1 July to 30 September 2026.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Camilo, Praia de Dona Ana, Praia da Luz, Meia Praia, Praia do Burgau and Praia de Alvor.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Porto de Mós?', 'answer', 'VisitPortugal lists bar and restaurant facilities for Praia de Porto de Mós. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'Can you walk from Porto de Mós towards Atalaia?', 'answer', 'Yes. VisitPortugal describes a cliff-top route west from Porto de Mós towards Miradouro da Atalaia, with views towards Praia da Luz and the Sagres coastline.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Porto de Mós?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are often useful for longer beach walks and Atalaia views with less peak-summer pressure.')
    ),
    'sources_used', coalesce(v_sources, '[]'::jsonb),
    'verification_notes', coalesce(v_notes, '[]'::jsonb)
  );

  update public.listings
     set short_description = v_short_description,
         description = v_full_description,
         website_url = null,
         category_data = jsonb_set(
           coalesce(category_data, '{}'::jsonb) || v_patch,
           '{localized_content,en}',
           (coalesce(category_data, '{}'::jsonb) || v_patch) - 'localized_content',
           true
         ),
         updated_at = now()
   where id = v_listing_id;
end $$;

commit;
