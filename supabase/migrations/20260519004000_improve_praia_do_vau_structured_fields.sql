begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Alemão",
    "type": "Nearby beach",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial beach listing west of Praia do Vau, also known as Barranco das Canas.",
    "href": "/listing/praia-do-alemao-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Castelos",
    "type": "Nearby beach",
    "distance": "~1.2 km",
    "description": "Published AlgarveOfficial beach listing east of Praia do Vau on the cliff-backed Portimão coastline.",
    "href": "/listing/praia-dos-tres-castelos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Prainha",
    "type": "Nearby beach",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial cove-beach listing in the Alvor/Portimão coastal area.",
    "href": "/listing/praia-da-prainha-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Irmãos",
    "type": "Nearby beach",
    "distance": "~1.9 km",
    "description": "Published AlgarveOfficial beach listing west of Vau in the Alvor coastal area.",
    "href": "/listing/praia-dos-tres-irmaos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Rocha",
    "type": "Nearby beach",
    "distance": "~2.0 km",
    "description": "Published AlgarveOfficial resort-beach listing east of Vau in Portimão.",
    "href": "/listing/praia-da-rocha",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Alvor",
    "type": "Nearby beach",
    "distance": "~3.3 km",
    "description": "Published AlgarveOfficial beach listing in Alvor, west of the Vau and Três Irmãos coastline.",
    "href": "/listing/praia-de-alvor-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante F",
    "type": "Restaurant",
    "distance": "~1.4 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/restaurante-f-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "NUMA",
    "type": "Restaurant",
    "distance": "~1.4 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/numa-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Vista Restaurant",
    "type": "Restaurant",
    "distance": "~1.9 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/vista-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Allgarbe Restaurante",
    "type": "Restaurant",
    "distance": "~2.7 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/allgarbe-restaurante-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Club Nau - Beach Club & Restaurant",
    "type": "Restaurant",
    "distance": "~3.4 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/club-nau-beach-club-restaurant-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Alto Golf Course",
    "type": "Golf",
    "distance": "~0.9 km",
    "description": "Published AlgarveOfficial golf listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/alto-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Skydive Seven Algarve",
    "type": "Family attraction",
    "distance": "~3.6 km",
    "description": "Published AlgarveOfficial family-attraction listing near Portimão/Alvor by stored listing coordinates.",
    "href": "/listing/skydive-seven-algarve-alvor",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Boat Trips",
    "type": "Experience",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial experience listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/alvor-boat-trips-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Sailing Catamaran",
    "type": "Experience",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial experience listing near Praia do Vau by stored listing coordinates.",
    "href": "/listing/alvor-sailing-catamaran-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Aqua Portimão Shopping Centre",
    "type": "Shopping centre",
    "distance": "~3.3 km",
    "description": "Published AlgarveOfficial shopping listing near Portimão by stored listing coordinates.",
    "href": "/listing/aqua-portimao-shopping-centre-quinta-do-lago",
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
  where slug = 'praia-do-vau-portimao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-vau-portimao not found; skipping update.';
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
        'source_url', 'https://algarveofficial.com/listing/praia-do-vau-portimao',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia do Vau and the linked listings',
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
    'parking_info', 'VisitPortugal lists parking for Praia do Vau. Current capacity, payment conditions and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia do Vau as an accessible beach, and Visit Portimão lists accessible-beach support with an amphibious wheelchair. Current seasonal availability, adapted equipment, gradient and the best access point should be confirmed before visiting.',
    'lifeguard_info', 'Visit Portimão lists lifeguard support, and ABAAE verifies the 2026 bathing season for Vau as 1 June to 30 September 2026. Exact daily staffing was not independently verified; check flags, signage and local notices before swimming.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists both the 2026 bathing season and Blue Flag season from 1 June to 30 September 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'Visit Portimão lists lifeguard support, but exact daily staffing was not independently verified.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.120045%2C-8.559164',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia do Vau?', 'answer', 'Praia do Vau is in Portimão, west of Praia da Rocha, on the Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia do Vau?', 'answer', 'VisitPortugal lists parking for Praia do Vau. Current capacity, payment conditions and peak-season restrictions were not independently verified.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia do Vau?', 'answer', 'Visit Portimão lists lifeguard support, and ABAAE verifies the 2026 bathing season from 1 June to 30 September 2026. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia do Vau a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Vau as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 June to 30 September 2026.'),
      jsonb_build_object('question', 'Is Praia do Vau accessible?', 'answer', 'VisitPortugal lists Praia do Vau as an accessible beach, and Visit Portimão lists accessible-beach support with an amphibious wheelchair. Current seasonal support should be confirmed before visiting.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia do Vau?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Alemão, Praia dos Três Castelos, Praia da Prainha, Praia dos Três Irmãos, Praia da Rocha and Praia de Alvor.'),
      jsonb_build_object('question', 'Are there restaurants near Praia do Vau?', 'answer', 'Yes. AlgarveOfficial has internally published nearby restaurant listings including Restaurante F, NUMA, Vista Restaurant, Allgarbe Restaurante and Club Nau - Beach Club & Restaurant. Distances are approximate and calculated from stored listing coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia do Vau?', 'answer', 'June to September matches the verified 2026 bathing and Blue Flag season. May, June and September are often more comfortable for families, photography and coastal walks with less peak-summer pressure.')
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
