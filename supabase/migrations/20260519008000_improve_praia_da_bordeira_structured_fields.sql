begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Amado",
    "type": "Nearby beach",
    "distance": "~3.4 km",
    "description": "Published AlgarveOfficial surf-beach listing south of Carrapateira by stored coordinates.",
    "href": "/listing/praia-do-amado-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Arrifana",
    "type": "Nearby beach",
    "distance": "~11.2 km",
    "description": "Published AlgarveOfficial cliff-bay and surf beach listing north of Bordeira by stored coordinates.",
    "href": "/listing/praia-da-arrifana-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Salema",
    "type": "Nearby beach",
    "distance": "~16.2 km",
    "description": "Published AlgarveOfficial village-beach listing in Vila do Bispo by stored coordinates.",
    "href": "/listing/praia-da-salema-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~17.9 km",
    "description": "Published AlgarveOfficial village-beach listing between Salema and Praia da Luz by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Luz",
    "type": "Nearby beach",
    "distance": "~19.8 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Bordeira by stored coordinates.",
    "href": "/listing/praia-da-luz-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Martinhal",
    "type": "Nearby beach",
    "distance": "~19.9 km",
    "description": "Published AlgarveOfficial beach listing near Sagres by stored coordinates.",
    "href": "/listing/praia-do-martinhal",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Carrapateira Extreme Tours",
    "type": "Experience",
    "distance": "~0.9 km",
    "description": "Published AlgarveOfficial experience listing near Carrapateira by stored coordinates.",
    "href": "/listing/carrapateira-extreme-tours-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Monte Velho Retreat Centre",
    "type": "Wellness",
    "distance": "~3.9 km",
    "description": "Published AlgarveOfficial wellness listing in the Costa Vicentina area by stored coordinates.",
    "href": "/listing/monte-velho-retreat-centre-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Aqua Ventura",
    "type": "Experience",
    "distance": "~6.7 km",
    "description": "Published AlgarveOfficial experience listing near the west-coast Algarve by stored coordinates.",
    "href": "/listing/aqua-ventura-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Zoo de Lagos",
    "type": "Experience",
    "distance": "~13.3 km",
    "description": "Published AlgarveOfficial family experience listing in the western Algarve by stored coordinates.",
    "href": "/listing/zoo-de-lagos-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Espiche Golf",
    "type": "Golf",
    "distance": "~15.5 km",
    "description": "Published AlgarveOfficial golf listing near Lagos by stored coordinates.",
    "href": "/listing/espiche-golf",
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
  where slug = 'praia-da-bordeira-carrapateira-aljezur'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-bordeira-carrapateira-aljezur not found; skipping update.';
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
        'AlgarveOfficial internal published nearby listings',
        'Diário da República - Portaria n.º 204-A/2026/1'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Bordeira listed as an Aljezur bathing water with code PTCL2H',
          'Official 2026 bathing season for Bordeira listed as 1 June to 30 September'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-bordeira-carrapateira-aljezur',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Bordeira and the linked listings',
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
        to_jsonb('No close internally published restaurant listing was verified for Praia da Bordeira during this update, so no nearby restaurant cards were added.'::text),
        to_jsonb('Diário da República verifies Bordeira as a 2026 bathing water from 1 June to 30 September 2026; ABAAE 2026 Blue Flag status was still not verified for Bordeira.'::text)
      )
      union all
      select to_jsonb('Nearby beach and attraction/business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('No close internally published restaurant listing was verified for Praia da Bordeira during this update, so no nearby restaurant cards were added.'::text)
      union all
      select to_jsonb('Diário da República verifies Bordeira as a 2026 bathing water from 1 June to 30 September 2026; ABAAE 2026 Blue Flag status was still not verified for Bordeira.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'parking_info', 'VisitPortugal lists parking for Praia da Bordeira, and the Freguesia da Bordeira page lists parking near the beach. Current capacity, payment conditions and peak-season restrictions were not independently verified.',
    'accessibility_info', 'Accessible-beach support was not verified from authoritative current sources. Local parish information describes wooden boardwalk access and notes that some access routes may require crossing the shallow river on foot, so visitors with reduced mobility should confirm current conditions before travelling.',
    'lifeguard_info', 'VisitPortugal and the Freguesia da Bordeira list safety or beach surveillance, and Diário da República verifies the 2026 bathing season for Bordeira as 1 June to 30 September 2026. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.',
    'blue_flag_info', 'Blue Flag status: not verified for 2026. ABAAE’s 2026 Aljezur awarded list checked during research lists Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia da Bordeira was not found among those 2026 Blue Flag locations.',
    'blue_flag_status', 'not_verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'VisitPortugal and the local parish list surveillance, but exact daily staffing was not independently verified.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.198012%2C-8.901136',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', '[]'::jsonb,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Bordeira / Carrapateira?', 'answer', 'Praia da Bordeira, also known as Praia da Carrapateira, is just north of Carrapateira in the municipality of Aljezur, on the Algarve’s west coast.'),
      jsonb_build_object('question', 'Is there parking at Praia da Bordeira?', 'answer', 'VisitPortugal lists parking for Praia da Bordeira, and local parish information also lists parking near the beach. Current capacity, payment conditions and peak-season restrictions should be checked locally.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Bordeira?', 'answer', 'VisitPortugal and the Freguesia da Bordeira list safety or beach surveillance, and Diário da República verifies the 2026 bathing season from 1 June to 30 September 2026. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Bordeira a Blue Flag beach?', 'answer', 'Blue Flag status was not verified for 2026. ABAAE’s 2026 Aljezur awarded list checked during research did not include Praia da Bordeira.'),
      jsonb_build_object('question', 'Is Praia da Bordeira accessible?', 'answer', 'Accessible-beach support was not verified. Local parish information describes wooden boardwalk access and notes that some access routes may require crossing the shallow river on foot, so reduced-mobility access should be confirmed before travelling.'),
      jsonb_build_object('question', 'Is Praia da Bordeira good for surfing?', 'answer', 'VisitPortugal lists surf and bodyboard activity, and local parish information notes demand for nautical sports due to wind and waves. Conditions vary, so visitors should follow local safety guidance.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Bordeira?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Amado, Praia da Arrifana, Praia da Salema, Praia do Burgau, Praia da Luz and Praia do Martinhal.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Bordeira?', 'answer', 'VisitPortugal and local parish information list restaurant or beach-support context, but no close internally published AlgarveOfficial restaurant listing was verified during this update, so no restaurant cards were added.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Bordeira?', 'answer', 'Spring, early summer and early autumn are useful for walking, photography and nature tourism. Summer aligns with the verified 2026 bathing season, while surf conditions depend on swell, wind and tide.')
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
