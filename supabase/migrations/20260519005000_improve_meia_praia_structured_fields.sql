begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia de Dona Ana",
    "type": "Nearby beach",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial beach listing south of Lagos, on the same municipality coastline.",
    "href": "/listing/praia-de-dona-ana-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Camilo",
    "type": "Nearby beach",
    "distance": "~3.4 km",
    "description": "Published AlgarveOfficial cove-beach listing near Ponta da Piedade in Lagos.",
    "href": "/listing/praia-do-camilo-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Porto de Mós",
    "type": "Nearby beach",
    "distance": "~4.6 km",
    "description": "Published AlgarveOfficial beach listing on the western side of Lagos.",
    "href": "/listing/praia-de-porto-de-mos-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Alvor",
    "type": "Nearby beach",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial beach listing across the Alvor side of the bay.",
    "href": "/listing/praia-de-alvor-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Irmãos",
    "type": "Nearby beach",
    "distance": "~6.3 km",
    "description": "Published AlgarveOfficial beach listing on the Alvor and Portimão coastline.",
    "href": "/listing/praia-dos-tres-irmaos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Prainha",
    "type": "Nearby beach",
    "distance": "~6.5 km",
    "description": "Published AlgarveOfficial cove-beach listing near Alvor and Três Irmãos.",
    "href": "/listing/praia-da-prainha-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Palmares Beach Club",
    "type": "Beach club",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial business listing beside Meia Praia by stored listing coordinates.",
    "href": "/listing/palmares-beach-club-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Bahia Beach Bar",
    "type": "Beach club",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial beach-club listing near Meia Praia by stored listing coordinates.",
    "href": "/listing/bahia-beach-bar-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Al Sud",
    "type": "Restaurant",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Meia Praia by stored listing coordinates.",
    "href": "/listing/al-sud-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida",
    "type": "Restaurant",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial restaurant listing in Lagos by stored listing coordinates.",
    "href": "/listing/avenida-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante dos Artistas",
    "type": "Restaurant",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored listing coordinates.",
    "href": "/listing/restaurante-dos-artistas-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante Casa Chico Zé",
    "type": "Restaurant",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Meia Praia by stored listing coordinates.",
    "href": "/listing/restaurante-casa-chico-ze-quinta-do-lago",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Parque Aventura Lagos",
    "type": "Experience",
    "distance": "~0.5 km",
    "description": "Published AlgarveOfficial experience listing near Meia Praia by stored listing coordinates.",
    "href": "/listing/parque-aventura-lagos-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Palmares Ocean Living & Golf",
    "type": "Golf",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial golf listing near Meia Praia by stored listing coordinates.",
    "href": "/listing/palmares-ocean-living-golf",
    "verification_status": "Published internal listing"
  },
  {
    "name": "BlueFleet",
    "type": "Experience",
    "distance": "~1.9 km",
    "description": "Published AlgarveOfficial Lagos experience listing by stored listing coordinates.",
    "href": "/listing/bluefleet-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Southwest Boats - Charters, Rentals & Sales",
    "type": "Experience",
    "distance": "~2.2 km",
    "description": "Published AlgarveOfficial Lagos experience listing by stored listing coordinates.",
    "href": "/listing/southwest-boats-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Boat Trips",
    "type": "Experience",
    "distance": "~5.1 km",
    "description": "Published AlgarveOfficial boat-experience listing across the Alvor side of the bay.",
    "href": "/listing/alvor-boat-trips-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Skydive Seven Algarve",
    "type": "Family attraction",
    "distance": "~7.2 km",
    "description": "Published AlgarveOfficial family-attraction listing near Alvor by stored listing coordinates.",
    "href": "/listing/skydive-seven-algarve-alvor",
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
  where slug = 'meia-praia-lagos'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing meia-praia-lagos not found; skipping update.';
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
        'source_url', 'https://algarveofficial.com/listing/meia-praia-lagos',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Meia Praia and the linked listings',
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
        to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'parking_info', 'VisitPortugal lists parking for Meia Praia. Current capacity, payment conditions and section-specific restrictions were not independently verified; choose the intended access point before travelling because the beach is long.',
    'accessibility_info', 'VisitPortugal lists Meia Praia as an accessible beach. Lagos municipal accessible-beach information includes Meia Praia and references criteria such as pedestrian access, reserved parking, ramp access, adapted sanitary facilities and first-aid access. Current support, equipment and the best access point should be confirmed before visiting.',
    'lifeguard_info', 'VisitPortugal lists safety or surveillance for Meia Praia, and ABAAE verifies the 2026 bathing season as 1 June to 30 September 2026. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the 2026 Blue Flag season for Meia Praia as 1 July to 30 September 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'VisitPortugal lists safety or surveillance, but exact daily staffing was not independently verified.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.11497%2C-8.65139',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Meia Praia?', 'answer', 'Meia Praia is in Lagos, on the western Algarve coast, following the curve of the Bay of Lagos.'),
      jsonb_build_object('question', 'Is there parking at Meia Praia?', 'answer', 'VisitPortugal lists parking for Meia Praia. Current capacity, payment conditions and section-specific restrictions were not independently verified, so choose the intended access point before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Meia Praia?', 'answer', 'VisitPortugal lists safety or surveillance, and ABAAE verifies the 2026 bathing season from 1 June to 30 September 2026. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Meia Praia a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Meia Praia as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026.'),
      jsonb_build_object('question', 'Is Meia Praia accessible?', 'answer', 'VisitPortugal lists Meia Praia as an accessible beach, and Lagos municipal accessible-beach information includes Meia Praia. Current seasonal support, equipment and the best access point should be confirmed before visiting.'),
      jsonb_build_object('question', 'What are the nearest beaches to Meia Praia?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia de Dona Ana, Praia do Camilo, Praia de Porto de Mós, Praia de Alvor, Praia dos Três Irmãos and Praia da Prainha.'),
      jsonb_build_object('question', 'Are there restaurants or beach businesses near Meia Praia?', 'answer', 'Yes. AlgarveOfficial has internally published nearby business listings including Palmares Beach Club, Bahia Beach Bar, Al Sud, Avenida, Restaurante dos Artistas and Restaurante Casa Chico Zé. Distances are approximate and calculated from stored listing coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Meia Praia?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are practical shoulder-month options for long beach walks and lower heat than peak summer.')
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
