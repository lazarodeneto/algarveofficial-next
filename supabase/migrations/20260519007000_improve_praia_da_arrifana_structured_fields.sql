begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Bordeira / Carrapateira",
    "type": "Nearby beach",
    "distance": "~11.2 km",
    "description": "Published AlgarveOfficial west-coast beach listing south of Arrifana by stored coordinates.",
    "href": "/listing/praia-da-bordeira-carrapateira-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Amado",
    "type": "Nearby beach",
    "distance": "~14.5 km",
    "description": "Published AlgarveOfficial surf-beach listing near Carrapateira by stored coordinates.",
    "href": "/listing/praia-do-amado-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Odeceixe",
    "type": "Nearby beach",
    "distance": "~17.4 km",
    "description": "Published AlgarveOfficial Aljezur beach listing north of Arrifana by stored coordinates.",
    "href": "/listing/praia-de-odeceixe-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Salema",
    "type": "Nearby beach",
    "distance": "~25.7 km",
    "description": "Published AlgarveOfficial village-beach listing in Vila do Bispo by stored coordinates.",
    "href": "/listing/praia-da-salema-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~26.0 km",
    "description": "Published AlgarveOfficial village-beach listing between Salema and Praia da Luz by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Luz",
    "type": "Nearby beach",
    "distance": "~26.1 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Arrifana by stored coordinates.",
    "href": "/listing/praia-da-luz-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Carrapateira Extreme Tours",
    "type": "Experience",
    "distance": "~11.8 km",
    "description": "Published AlgarveOfficial experience listing near the Carrapateira coast by stored coordinates.",
    "href": "/listing/carrapateira-extreme-tours-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Monte Velho Retreat Centre",
    "type": "Wellness",
    "distance": "~13.8 km",
    "description": "Published AlgarveOfficial wellness listing in the Costa Vicentina area by stored coordinates.",
    "href": "/listing/monte-velho-retreat-centre-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Zoo de Lagos",
    "type": "Experience",
    "distance": "~18.8 km",
    "description": "Published AlgarveOfficial family experience listing in the western Algarve by stored coordinates.",
    "href": "/listing/zoo-de-lagos-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Espiche Golf",
    "type": "Golf",
    "distance": "~21.7 km",
    "description": "Published AlgarveOfficial golf listing near Lagos by stored coordinates.",
    "href": "/listing/espiche-golf",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Platinum AMG Course - Autódromo Internacional do Algarve",
    "type": "Experience",
    "distance": "~22.5 km",
    "description": "Published AlgarveOfficial driving-experience listing by stored coordinates.",
    "href": "/listing/platinum-amg-course-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-arrifana-aljezur'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-arrifana-aljezur not found; skipping update.';
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
      where source_item->>'source_name' <> 'AlgarveOfficial internal published nearby listings'
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-arrifana-aljezur',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Arrifana and the linked listings',
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
        to_jsonb('Nearby beach and attraction/business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text),
        to_jsonb('No close internally published restaurant listing was verified for Praia da Arrifana during this update, so no nearby restaurant cards were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach and attraction/business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('No close internally published restaurant listing was verified for Praia da Arrifana during this update, so no nearby restaurant cards were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'parking_info', 'VisitPortugal lists outdoor parking for Praia da Arrifana. Visit Algarve beach-guide information notes organised medium-sized parking around 400 metres from the beach and conditioned vehicle access or parking near the sand. Current capacity, payment conditions and seasonal restrictions were not independently verified.',
    'accessibility_info', 'Accessible-beach support was not verified from authoritative current sources. The beach sits below cliffs and official/regional information notes conditioned vehicle access near the sand, so visitors with reduced mobility should confirm current access, gradients and any assistance before travelling.',
    'lifeguard_info', 'VisitPortugal lists safety or surveillance for Praia da Arrifana, and ABAAE verifies the 2026 bathing season as 1 June to 30 September 2026. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the 2026 Blue Flag season for Arrifana as 1 July to 30 September 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'VisitPortugal lists safety or surveillance, but exact daily staffing was not independently verified.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.29442%2C-8.86601',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', '[]'::jsonb,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Arrifana?', 'answer', 'Praia da Arrifana is in the municipality of Aljezur, on the Algarve’s west coast within the Costa Vicentina landscape.'),
      jsonb_build_object('question', 'Is there parking at Praia da Arrifana?', 'answer', 'VisitPortugal lists outdoor parking. Visit Algarve beach-guide information notes organised medium-sized parking around 400 metres from the beach and conditioned vehicle access or parking near the sand. Current capacity and payment conditions should be checked locally.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Arrifana?', 'answer', 'VisitPortugal lists safety or surveillance, and ABAAE verifies the 2026 bathing season from 1 June to 30 September 2026. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Arrifana a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Arrifana as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026.'),
      jsonb_build_object('question', 'Is Praia da Arrifana accessible?', 'answer', 'Accessible-beach support was not verified from authoritative current sources. Because the beach sits below cliffs and access near the sand can be conditioned, visitors with reduced mobility should confirm current arrangements before travelling.'),
      jsonb_build_object('question', 'Is Praia da Arrifana good for surfing?', 'answer', 'VisitPortugal describes Arrifana as popular year-round with surfers and bodyboarders. Conditions still vary, so surf and swimming decisions should follow local flags, signage and safety guidance.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Arrifana?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Bordeira / Carrapateira, Praia do Amado, Praia de Odeceixe, Praia da Salema, Praia do Burgau and Praia da Luz.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Arrifana?', 'answer', 'VisitPortugal lists bar and restaurant services for Praia da Arrifana, but no close internally published AlgarveOfficial restaurant listing was verified during this update, so no restaurant cards were added.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Arrifana?', 'answer', 'June to September matches the verified 2026 bathing season. Spring and autumn can suit coastal walks and surf-focused visits, but sea state, wind and safety guidance should always be checked before entering the water.')
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
