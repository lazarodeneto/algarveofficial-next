begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Ancão",
    "type": "Nearby beach",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of Quinta do Lago by stored coordinates.",
    "href": "/listing/praia-do-ancao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Garrão",
    "type": "Nearby beach",
    "distance": "~2.8 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of Quinta do Lago by stored coordinates.",
    "href": "/listing/praia-do-garrao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Faro / Ilha de Faro",
    "type": "Nearby beach",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial Faro island beach listing east of Quinta do Lago by stored coordinates.",
    "href": "/listing/praia-de-faro-ilha-de-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vale do Lobo",
    "type": "Nearby beach",
    "distance": "~4.4 km",
    "description": "Published AlgarveOfficial Loulé resort-area beach listing west of Quinta do Lago by stored coordinates.",
    "href": "/listing/praia-de-vale-do-lobo-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Quarteira",
    "type": "Nearby beach",
    "distance": "~8.5 km",
    "description": "Published AlgarveOfficial Loulé town-front beach listing west of Quinta do Lago by stored coordinates.",
    "href": "/listing/praia-de-quarteira-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vilamoura",
    "type": "Nearby beach",
    "distance": "~9.6 km",
    "description": "Published AlgarveOfficial Loulé resort beach listing west of Quinta do Lago by stored coordinates.",
    "href": "/listing/praia-de-vilamoura-loule",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Casa Velha",
    "type": "Restaurant",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/restaurante-casa-velha-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Umami",
    "type": "Restaurant",
    "distance": "~1.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/umami-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Casa do Lago",
    "type": "Restaurant",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/casa-do-lago-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Shack",
    "type": "Restaurant",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/the-shack-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "2 Passos",
    "type": "Restaurant",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/2-passos-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Hotel Quinta do Lago",
    "type": "Accommodation",
    "distance": "~0.7 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/hotel-quinta-do-lago-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta do Lago Country Club",
    "type": "Accommodation",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/quinta-do-lago-country-club-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Reserva Quinta do Lago",
    "type": "Accommodation",
    "distance": "~1.0 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/reserva-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "San Lorenzo Golf Course",
    "type": "Golf",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial golf listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/san-lorenzo-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Victory Village Club - Quinta do Lago",
    "type": "Accommodation",
    "distance": "~1.0 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/victory-village-club-quinta-do-lago-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Encosta do Lago Resort Club",
    "type": "Accommodation",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Quinta do Lago by stored coordinates.",
    "href": "/listing/encosta-do-lago-resort-club-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Quinta do Lago is a Ria Formosa beach in Loulé, reached from the Quinta do Lago side by a long wooden pedestrian bridge across the lagoon. It combines Atlantic sand, protected wetland scenery, resort-area services and verified 2026 Blue Flag status.';
  v_full_description text := $text$
Praia de Quinta do Lago is a distinctive Loulé beach on the edge of the Ria Formosa, close to Almancil and the Quinta do Lago resort area. VisitPortugal places the beach inside the Ria Formosa Natural Park and describes a sandy shoreline of about 3.5 km, separated from the resort side by the ria.

Access is part of the experience. The sand is reached on foot by a wooden pedestrian bridge of about 320 metres, crossing lagoon habitat before the beach opens to the Atlantic. This gives Quinta do Lago a more nature-led feel than the urban beaches farther west, while still keeping bars, restaurants, a water-sports centre, parking and other seasonal services close to the access area.

VisitPortugal lists Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible-beach status. These services should be treated as seasonal, and accessible support should be checked before travelling because the bridge, boardwalks, sand conditions and adapted equipment can affect the practical route to the beach.

For 2026, Diário da República lists Quinta do Lago as a Loulé bathing beach from 1 June to 30 September, and ABAAE lists Quinta do Lago among Loulé's 2026 Blue Flag awarded coastal beaches. The individual ABAAE page checked on 19 May 2026 still showed 2025 season dates, so exact 2026 Blue Flag display dates should be confirmed locally. Visitors should stay on marked routes, protect dunes and wetland habitats, and follow beach flags and lifeguard instructions.
$text$;
  v_best_time text := 'June to September matches the official 2026 bathing season for Quinta do Lago. May, June and September are usually more comfortable for the bridge walk, Ria Formosa scenery and quieter beach time, while July and August bring the strongest seasonal service atmosphere.';
  v_important_notes text := 'Diário da República lists Quinta do Lago with bathing-water code PTCV9L and a 2026 bathing season from 1 June to 30 September.
ABAAE lists Quinta do Lago among Loulé''s 2026 Blue Flag awarded locations.
The individual ABAAE Quinta do Lago page checked on 19 May 2026 still showed 2025 bathing and Blue Flag season dates, so exact 2026 Blue Flag display dates should be confirmed locally.
VisitPortugal lists the beach inside the Ria Formosa Natural Park and describes pedestrian access by a wooden bridge of about 320 metres.
VisitPortugal lists parking, surveillance, showers, bar, restaurant, water-sports centre and accessible-beach status.
Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified for this review.
Visitors should use marked routes and avoid disturbing dunes, saltmarsh and lagoon habitats.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-quinta-do-lago-loule'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-quinta-do-lago-loule not found; skipping update.';
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
        'VisitPortugal - Praia da Quinta do Lago',
        'VisitPortugal - Parque Natural da Ria Formosa',
        'ABAAE Bandeira Azul - Quinta do Lago',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia da Quinta do Lago',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-da-quinta-do-lago',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Almancil - Loulé location',
          'Beach integrated in the Ria Formosa Natural Park',
          'Sandy beach extending for about 3.5 km',
          'Pedestrian access by wooden bridge of about 320 metres',
          'Bars, restaurants and water-sports centre',
          'Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach',
          'Access by car, motorcycle and on foot'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Parque Natural da Ria Formosa',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/parque-natural-da-ria-formosa',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Ria Formosa protected-area context',
          'Wetland, channels, islands, saltmarshes and sandbank landscape',
          'Ria Formosa extends along about 60 km of Algarve coast between the Garrão area and Manta Rota',
          'Birdlife and habitat sensitivity context'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Quinta do Lago',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/quinta-do-lago/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Quinta do Lago Blue Flag entry',
          'Municipality of Loulé',
          'Coordinates 37.025341, -8.025405',
          'Beach code PTCV9L',
          'Individual page still showed 2025 bathing and Blue Flag season dates when checked on 19 May 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Quinta do Lago listed among 2026 Blue Flag awarded coastal beaches',
          'Concelho Loulé',
          'Coordinates 37.025341, -8.025405',
          'Loulé listed with 12 awarded locations in 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Quinta do Lago listed in Loulé',
          'Bathing-water code PTCV9L',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-quinta-do-lago-loule',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, accommodation and golf cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Quinta do Lago and the linked listings',
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
        to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text),
        to_jsonb('The individual ABAAE Quinta do Lago page still showed 2025 season dates when checked on 19 May 2026; 2026 Blue Flag status is therefore supported by the ABAAE 2026 awarded list.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text)
      union all
      select to_jsonb('The individual ABAAE Quinta do Lago page still showed 2025 season dates when checked on 19 May 2026; 2026 Blue Flag status is therefore supported by the ABAAE 2026 awarded list.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Ria Formosa beach reached by a wooden pedestrian bridge of about 320 metres',
      'Sandy shoreline of about 3.5 km according to VisitPortugal',
      'Bars, restaurants, water-sports centre, parking and accessible-beach status listed by VisitPortugal',
      'Quinta do Lago 2026 bathing season verified from Diário da República',
      'Blue Flag status verified for 2026 via ABAAE awarded list',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia de Quinta do Lago near the beach access area. Access to the sand itself is pedestrian via the wooden bridge, so parking does not mean direct vehicle access to the beach. Exact parking capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia de Quinta do Lago as an accessible beach. Current adapted equipment, assistance, bridge suitability, reserved parking availability and the best access point should still be confirmed locally before travelling.',
    'lifeguard_info', 'Diário da República lists Quinta do Lago as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. VisitPortugal also lists surveillance. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE awarded list. The individual ABAAE Quinta do Lago page checked on 19 May 2026 still showed 2025 bathing and Blue Flag season dates, so exact 2026 Blue Flag display dates should be confirmed locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Quinta do Lago',
      'notes', 'Diário da República lists Quinta do Lago with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.025341%2C-8.025405',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Quinta do Lago with a 2026 bathing season from 1 June to 30 September.',
        'ABAAE lists Quinta do Lago among Loulé''s 2026 Blue Flag awarded locations.',
        'VisitPortugal describes pedestrian access by a wooden bridge of about 320 metres.',
        'VisitPortugal lists parking, surveillance, showers, bar, restaurant, water-sports centre and accessible-beach status.',
        'Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified.',
        'Visitors should stay on marked routes and avoid disturbing dunes, saltmarsh and lagoon habitats.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Quinta do Lago?', 'answer', 'Praia de Quinta do Lago is in the municipality of Loulé, near Almancil and the Quinta do Lago resort area, on the western edge of the Ria Formosa setting.'),
      jsonb_build_object('question', 'How do you reach Praia de Quinta do Lago?', 'answer', 'VisitPortugal describes pedestrian access to the beach by a wooden bridge of about 320 metres across the Ria Formosa. There is no direct vehicle access to the sand.'),
      jsonb_build_object('question', 'Is there parking at Praia de Quinta do Lago?', 'answer', 'VisitPortugal lists parking for Praia de Quinta do Lago. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia de Quinta do Lago accessible?', 'answer', 'VisitPortugal lists Praia de Quinta do Lago as an accessible beach. Current adapted equipment, assistance, bridge suitability and the best access point should still be confirmed locally before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Quinta do Lago?', 'answer', 'Diário da República lists Quinta do Lago as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Quinta do Lago a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Quinta do Lago among the 2026 Blue Flag awarded beaches. The individual ABAAE page checked on 19 May 2026 still showed 2025 dates, so exact 2026 display dates should be confirmed locally.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Ancão, Praia do Garrão, Praia de Faro / Ilha de Faro, Praia de Vale do Lobo, Praia de Quarteira and Praia de Vilamoura.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Quinta do Lago?', 'answer', 'VisitPortugal lists bars and restaurants for Praia de Quinta do Lago. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Quinta do Lago?', 'answer', 'June to September matches the official 2026 bathing season. May, June and September are usually more comfortable for the bridge walk, Ria Formosa scenery and quieter beach time.')
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
