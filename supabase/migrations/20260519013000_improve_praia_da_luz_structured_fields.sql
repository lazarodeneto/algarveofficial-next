begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia de Porto de Mós",
    "type": "Nearby beach",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Praia da Luz by stored coordinates.",
    "href": "/listing/praia-de-porto-de-mos-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~4.6 km",
    "description": "Published AlgarveOfficial village-beach listing west of Praia da Luz by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Dona Ana",
    "type": "Nearby beach",
    "distance": "~5.1 km",
    "description": "Published AlgarveOfficial Lagos cliff-cove beach listing east of Praia da Luz by stored coordinates.",
    "href": "/listing/praia-de-dona-ana-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Camilo",
    "type": "Nearby beach",
    "distance": "~5.2 km",
    "description": "Published AlgarveOfficial Lagos cove beach listing east of Praia da Luz by stored coordinates.",
    "href": "/listing/praia-do-camilo-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Meia Praia",
    "type": "Nearby beach",
    "distance": "~7.4 km",
    "description": "Published AlgarveOfficial long sandy Lagos beach listing east of Praia da Luz by stored coordinates.",
    "href": "/listing/meia-praia-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Salema",
    "type": "Nearby beach",
    "distance": "~9.0 km",
    "description": "Published AlgarveOfficial west-Algarve village-beach listing west of Praia da Luz by stored coordinates.",
    "href": "/listing/praia-da-salema-vila-do-bispo",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Aquário",
    "type": "Restaurant",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia da Luz by stored coordinates.",
    "href": "/listing/restaurante-aquario-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Le Clubhouse Restaurant",
    "type": "Restaurant",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia da Luz by stored coordinates.",
    "href": "/listing/le-clubhouse-restaurant-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Mirandus",
    "type": "Restaurant",
    "distance": "~4.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia da Luz by stored coordinates.",
    "href": "/listing/mirandus-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "DON GULL",
    "type": "Restaurant",
    "distance": "~4.8 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia da Luz by stored coordinates.",
    "href": "/listing/don-gull-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida",
    "type": "Restaurant",
    "distance": "~4.9 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored coordinates.",
    "href": "/listing/avenida-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "SAL SPA",
    "type": "Wellness spa",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial wellness listing near Praia da Luz by stored coordinates.",
    "href": "/listing/sal-spa-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Vida Boa Lodge",
    "type": "Experience",
    "distance": "~1.8 km",
    "description": "Published AlgarveOfficial experience listing near Praia da Luz by stored coordinates.",
    "href": "/listing/vida-boa-lodge-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta Bonita Country House & Gardens",
    "type": "Concierge service",
    "distance": "~2.7 km",
    "description": "Published AlgarveOfficial business listing near Praia da Luz by stored coordinates.",
    "href": "/listing/quinta-bonita-country-house-gardens-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Transform to Bliss Yoga, Ayurveda & Event Space",
    "type": "Wellness spa",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial wellness listing near Praia da Luz by stored coordinates.",
    "href": "/listing/transform-to-bliss-yoga-ayurveda-event-space-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Espiche Golf",
    "type": "Golf",
    "distance": "~4.5 km",
    "description": "Published AlgarveOfficial golf listing near Praia da Luz by stored coordinates.",
    "href": "/listing/espiche-golf",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'ABAAE lists the 2026 bathing season for Luz as 1 June 2026 to 30 September 2026.
ABAAE lists the 2026 Blue Flag season for Luz as 1 July 2026 to 30 September 2026.
At the time of this review, ABAAE showed the Blue Flag as not yet hoisted, consistent with the Blue Flag season not yet having started.
Diário da República lists Luz as a Lagos bathing beach for the 2026 season from 1 June to 30 September.
VisitPortugal lists outdoor parking, showers, bar, restaurant, surveillance, sunshade rental, small craft hire, windsurfing and accessible-beach status for Praia da Luz.
Lagos municipality describes Praia da Luz as accessible for people with reduced mobility, with beach support and surveillance.
The 2022 Lagos municipal Blue Flag news item describes accessible-beach requirements at Luz, Meia Praia and Porto de Mós including reserved parking, pedestrian access, beach walkways and adapted toilets; current seasonal arrangements should still be checked before travelling.
Facilities, water-sports rental, surveillance and accessibility support may vary by season and should be confirmed locally.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-luz-lagos'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-luz-lagos not found; skipping update.';
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
        'Diário da República - Portaria n.º 204-A/2026/1',
        'ABAAE Bandeira Azul - Luz',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Luz listed in Lagos with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies beaches of bathing where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Luz',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/luz/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Official Luz Blue Flag entry',
          'Municipality of Lagos',
          'Coordinates 37.086975, -8.727023',
          'Beach code PTCE3N',
          '2026 bathing season from 1 June to 30 September',
          '2026 Blue Flag season from 1 July to 30 September',
          'Blue Flag shown as not yet hoisted at time checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Luz listed among Lagos 2026 Blue Flag awarded coastal beaches',
          'Lagos listed with Luz, Meia Praia, Porto de Mós and Marina de Lagos among 2026 awarded locations'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-luz-lagos',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Luz and the linked listings',
          'No external restaurant, attraction, experience or competitor website links were added'
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
        to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text),
        to_jsonb('Restaurant and business cards use published internal listings by stored coordinates; category labels and exact business details should be reviewed inside the linked listings if needed.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('Restaurant and business cards use published internal listings by stored coordinates; category labels and exact business details should be reviewed inside the linked listings if needed.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', 'Praia da Luz is a serviced village beach in Lagos, set beside the village of Luz and backed by the Rocha Negra cliff formation. It is known for broad sand, beach support, accessible-beach recognition and a 2026 Blue Flag listing.',
    'full_description', 'Praia da Luz is a serviced beach in the municipality of Lagos, set directly beside the village of Luz west of Lagos city. Official municipal information describes a generous bank of soft sand framed by the cliff with its geodesic marker and the white houses of the former fishing village.\n\nThe beach has a developed village-seafront character rather than a remote cove atmosphere. VisitPortugal lists strong beach support, including surveillance, showers, outdoor parking, bar, restaurant, sunshade rental, small craft hire, windsurfing and accessible-beach status. Lagos municipality also identifies Praia da Luz as accessible for people with reduced mobility and as a beach with support and surveillance.\n\nPraia da Luz is visually defined by Rocha Negra on the eastern side of the bay. Lagos municipal photo archive material describes Rocha Negra as a remnant of volcanic activity from more than 70 million years ago, giving the beach a distinctive geological backdrop. The same archive describes the beach as divided between sandy and rocky sections, so visitors should take care when moving away from the main sand.\n\nABAAE verifies Luz as one of Lagos'' 2026 Blue Flag awarded locations, with the bathing season listed from 1 June to 30 September and the Blue Flag season from 1 July to 30 September. Facilities and accessibility support should still be treated as seasonal, and visitors should follow beach flags, local signage and lifeguard guidance.',
    'highlights', jsonb_build_array(
      'Serviced village beach in Lagos beside the village of Luz',
      'Rocha Negra cliff and former fishing-village backdrop',
      'Outdoor parking, showers, bar and restaurant listed by VisitPortugal',
      'Accessible-beach status listed by VisitPortugal and Lagos municipality',
      'Water-sports equipment hire and windsurfing listed by VisitPortugal',
      'Blue Flag status verified for 2026 by ABAAE'
    ),
    'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Luz. July and August are best for the fullest beach-service atmosphere, while May, June and September are usually more practical for beach walks, village visits and a calmer pace.',
    'parking_info', 'VisitPortugal lists outdoor parking for Praia da Luz. Lagos municipal accessibility information from a Blue Flag news item also references reserved parking as part of accessible-beach requirements at Luz, Meia Praia and Porto de Mós. Current parking capacity, payment rules and seasonal restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia da Luz as an accessible beach, and Lagos municipality describes it as accessible for people with reduced mobility. A Lagos municipal Blue Flag news item says accessible-beach requirements include reserved parking, pedestrian access, beach walkways and adapted toilets. Current seasonal equipment, assistance and the best access point should still be confirmed before travelling.',
    'lifeguard_info', 'ABAAE and Diário da República list the 2026 bathing season for Luz as 1 June to 30 September. Diário da República identifies bathing beaches where assistance to bathers is assured during the respective season. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE for Luz. ABAAE lists the 2026 Blue Flag season as 1 July to 30 September 2026 and showed the flag as not yet hoisted at the time checked on 18 May 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'ABAAE and Diário da República list Luz with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.086975%2C-8.727023',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Luz. July and August are best for the fullest beach-service atmosphere, while May, June and September are usually more practical for beach walks, village visits and a calmer pace.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists the 2026 bathing season for Luz as 1 June 2026 to 30 September 2026.',
        'ABAAE lists the 2026 Blue Flag season for Luz as 1 July 2026 to 30 September 2026.',
        'VisitPortugal lists outdoor parking, surveillance, showers, bar, restaurant and accessible-beach status.',
        'Accessibility support should be confirmed locally before relying on specific equipment or assistance.',
        'Praia da Luz includes sandy and rocky sections; visitors should take care away from the main sand.',
        'Facilities and water-sports rental may vary by season.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Luz?', 'answer', 'Praia da Luz is in the village of Luz, in the municipality of Lagos, west of Lagos city.'),
      jsonb_build_object('question', 'Is there parking at Praia da Luz?', 'answer', 'VisitPortugal lists outdoor parking for Praia da Luz. Current capacity, payment rules and seasonal restrictions should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Luz accessible?', 'answer', 'Yes. VisitPortugal lists Praia da Luz as an accessible beach, and Lagos municipality describes it as accessible for people with reduced mobility. Current seasonal support and equipment should still be confirmed before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Luz?', 'answer', 'The official 2026 bathing season for Luz is listed as 1 June to 30 September. Exact daily lifeguard staffing should be checked locally through flags, signage and beach notices.'),
      jsonb_build_object('question', 'Is Praia da Luz a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Luz as a 2026 Blue Flag awarded beach, with the Blue Flag season listed from 1 July to 30 September 2026.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Luz?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia de Porto de Mós, Praia do Burgau, Praia de Dona Ana, Praia do Camilo, Meia Praia and Praia da Salema.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Luz?', 'answer', 'VisitPortugal lists a bar and restaurant at Praia da Luz. Nearby restaurant cards on AlgarveOfficial link only to published internal listings.'),
      jsonb_build_object('question', 'What is Rocha Negra at Praia da Luz?', 'answer', 'Rocha Negra is the dark cliff formation at Praia da Luz. Lagos municipal photo archive describes it as a remnant of volcanic activity from more than 70 million years ago.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Luz?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are useful for beach walks and village visits with a slightly calmer pace.')
    ),
    'sources_used', coalesce(v_sources, '[]'::jsonb),
    'verification_notes', coalesce(v_notes, '[]'::jsonb)
  );

  update public.listings
     set website_url = null,
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
