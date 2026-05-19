begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia dos Três Irmãos",
    "type": "Nearby beach",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial beach listing immediately west of Prainha by stored coordinates.",
    "href": "/listing/praia-dos-tres-irmaos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Alemão",
    "type": "Nearby beach",
    "distance": "~1.3 km",
    "description": "Published AlgarveOfficial cliff-backed Portimão beach listing east of Prainha by stored coordinates.",
    "href": "/listing/praia-do-alemao-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Alvor",
    "type": "Nearby beach",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial Alvor beach listing west of Prainha by stored coordinates.",
    "href": "/listing/praia-de-alvor-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Vau",
    "type": "Nearby beach",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial family beach listing east of Prainha by stored coordinates.",
    "href": "/listing/praia-do-vau-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Castelos",
    "type": "Nearby beach",
    "distance": "~2.8 km",
    "description": "Published AlgarveOfficial cliff-backed Portimão beach listing east of Prainha by stored coordinates.",
    "href": "/listing/praia-dos-tres-castelos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Rocha",
    "type": "Nearby beach",
    "distance": "~3.7 km",
    "description": "Published AlgarveOfficial Portimão resort beach listing east of Prainha by stored coordinates.",
    "href": "/listing/praia-da-rocha",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante F",
    "type": "Restaurant",
    "distance": "~3.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Portimão by stored coordinates.",
    "href": "/listing/restaurante-f-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "NUMA",
    "type": "Restaurant",
    "distance": "~3.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Portimão by stored coordinates.",
    "href": "/listing/numa-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Boys - Bistrô",
    "type": "Restaurant",
    "distance": "~3.6 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates.",
    "href": "/listing/the-boys-bistro-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Vista Restaurant",
    "type": "Restaurant",
    "distance": "~3.6 km",
    "description": "Published AlgarveOfficial restaurant listing near Portimão by stored coordinates.",
    "href": "/listing/vista-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Allgarbe Restaurante",
    "type": "Restaurant",
    "distance": "~4.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Portimão by stored coordinates.",
    "href": "/listing/allgarbe-restaurante-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Pestana Alvor Praia",
    "type": "Accommodation",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial accommodation listing near Prainha by stored coordinates.",
    "href": "/listing/pestana-alvor-praia-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Swan Day SPA",
    "type": "Wellness spa",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial wellness listing near Prainha by stored coordinates.",
    "href": "/listing/swan-day-spa-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alto Golf Course",
    "type": "Golf",
    "distance": "~1.4 km",
    "description": "Published AlgarveOfficial golf listing near Prainha by stored coordinates.",
    "href": "/listing/alto-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Boat Trips",
    "type": "Experience",
    "distance": "~2.1 km",
    "description": "Published AlgarveOfficial experience listing near Alvor by stored coordinates.",
    "href": "/listing/alvor-boat-trips-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Skydive Seven Algarve",
    "type": "Family attraction",
    "distance": "~3.3 km",
    "description": "Published AlgarveOfficial attraction listing near Alvor by stored coordinates.",
    "href": "/listing/skydive-seven-algarve-alvor",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'Visit Portimão classifies Prainha as a limited-use beach because almost the whole sandy area is within a rockfall-risk zone.
Official Portimão tourism warns that rockfalls and falling stones are common at Prainha.
Câmara Municipal de Portimão states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.
Prainha was not found in the 2026 Diário da República bathing-water list for Portimão checked on 18 May 2026.
Blue Flag status was not verified for 2026; Prainha was not found in the ABAAE 2026 awarded list checked on 18 May 2026.
Visit Portimão lists facilities such as beach support, showers, lifeguard, first-aid post, WC and sunshade area, but current operation should be checked locally because of the bathing-status and safety caveats.
Parking, accessible-beach designation and step-free access were not verified from current authoritative sources.
Visitors should keep away from cliffs, caves, overhangs and unstable rock faces, and should only consider low-tide access from Três Irmãos when local conditions are safe.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-prainha-portimao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-prainha-portimao not found; skipping update.';
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
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Portimão 2026 bathing waters checked',
          'Prainha was not found among Portimão bathing beaches in the 2026 portaria checked on 18 May 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Portimão 2026 awarded coastal beaches checked',
          'Prainha was not found in the ABAAE 2026 awarded list checked on 18 May 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-prainha-portimao',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Prainha and the linked listings',
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
        to_jsonb('Prainha is intentionally not described as a standard bathing beach because official Portimão and 2026 bathing-water sources raise safety/status caveats.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('Prainha is intentionally not described as a standard bathing beach because official Portimão and 2026 bathing-water sources raise safety/status caveats.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', 'Praia da Prainha is a scenic cove cluster near Alvor in Portimão, known for small sandy pockets, arches, sea stacks and sculpted limestone rock. Official sources warn of rockfall risk, so access, bathing status and safety conditions should be checked carefully.',
    'full_description', 'Praia da Prainha sits near Alvor in the municipality of Portimão, close to the eastern end of Praia dos Três Irmãos. Rather than one open beach, it is formed by small sandy coves separated by sculpted limestone formations, including arches, sea stacks, chasms and caves.\n\nThe landscape is highly photogenic, but this is not a simple serviced bathing beach listing. Visit Portimão classifies Prainha as a limited-use beach because almost the whole sandy area lies within a rockfall-risk zone, and the same official source warns that rockfalls and falling stones are common. Câmara Municipal de Portimão also states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.\n\nAt low tide, Visit Portimão notes that Praia dos Três Irmãos can give access towards Prainha through coves and chasms, but this should be approached only when tide, sea state and local safety conditions allow. Visitors should avoid cliff bases, cave interiors, overhangs and unstable rock faces.\n\nFor AlgarveOfficial, Prainha should be presented as a scenic coastal cove and viewpoint-oriented stop rather than a recommended conventional swim beach. Facilities listed by Visit Portimão are treated as seasonal and requiring local confirmation, while Blue Flag status and current official bathing-season status were not verified for 2026.',
    'highlights', jsonb_build_array(
      'Small sandy coves near Praia dos Três Irmãos',
      'Arches, sea stacks, chasms and limestone caves',
      'Official limited-use classification due to rockfall risk',
      'Municipal bathing-water qualification not verified for 2026',
      'Low-tide access from Três Irmãos requires caution',
      'Close to Alvor and Portimão coastal walking routes'
    ),
    'best_time_to_visit', 'Late spring and early autumn are best for photography and coastal viewpoints with less heat. Summer may bring more visitors to the Alvor and Três Irmãos coastline, but Prainha should still be approached cautiously because official sources identify rockfall and bathing-status concerns.',
    'parking_info', 'Parking information was not verified from current authoritative sources for Prainha. Visitors should confirm current access and parking locally, or use nearby verified access points at larger neighbouring beaches where appropriate.',
    'accessibility_info', 'Accessible-beach designation and step-free access were not verified for Prainha. The official description of small coves, chasms, caves, rockfall risk and tide-dependent access means visitors with reduced mobility should not rely on Prainha without confirming current local access conditions.',
    'lifeguard_info', 'Official current lifeguard dates were not verified for Prainha. Visit Portimão lists a lifeguard facility, but Prainha was not found in the 2026 Diário da República bathing-water list for Portimão checked on 18 May 2026, and municipal information notes previous bathing-status concerns. Check local signage before approaching the water.',
    'blue_flag_info', 'Blue Flag status: not verified for 2026. Prainha was not found in the ABAAE 2026 awarded list checked on 18 May 2026.',
    'blue_flag_status', 'not_verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', null,
      'notes', 'Prainha was not found in the 2026 Diário da República bathing-water list for Portimão checked on 18 May 2026; exact lifeguard support was not verified.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.118242%2C-8.578220',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'Late spring and early autumn are best for photography and coastal viewpoints with less heat. Summer may bring more visitors to the Alvor and Três Irmãos coastline, but Prainha should still be approached cautiously because official sources identify rockfall and bathing-status concerns.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Visit Portimão classifies Prainha as limited-use because almost the whole sand lies within a rockfall-risk zone.',
        'Câmara Municipal de Portimão states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.',
        'Prainha was not found in the 2026 Diário da República bathing-water list for Portimão checked on 18 May 2026.',
        'Blue Flag status was not verified for 2026.',
        'Parking, accessibility and step-free access were not verified.',
        'Low-tide access from Três Irmãos should only be considered when local conditions are safe.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Prainha?', 'answer', 'Praia da Prainha is near Alvor in the municipality of Portimão, close to Praia dos Três Irmãos on the western Algarve coast.'),
      jsonb_build_object('question', 'Is Praia da Prainha a regular bathing beach?', 'answer', 'Prainha should be treated with caution. Portimão municipal information states that it was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues, and it was not found in the 2026 Diário da República Portimão bathing-water list checked on 18 May 2026.'),
      jsonb_build_object('question', 'Is there parking at Praia da Prainha?', 'answer', 'Parking information was not verified from current authoritative sources for Prainha. Confirm current access and parking locally before visiting.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Prainha?', 'answer', 'Current official lifeguard dates were not verified. Visit Portimão lists a lifeguard facility, but Prainha was not found in the 2026 Diário da República bathing-water list for Portimão.'),
      jsonb_build_object('question', 'Is Praia da Prainha a Blue Flag beach?', 'answer', 'Blue Flag status was not verified for 2026. Prainha was not found in the ABAAE 2026 awarded list checked on 18 May 2026.'),
      jsonb_build_object('question', 'Is Praia da Prainha accessible?', 'answer', 'Accessible-beach designation and step-free access were not verified. The cove, cliff and tide-dependent setting is likely unsuitable without current local access confirmation.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Prainha?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia dos Três Irmãos, Praia do Alemão, Praia de Alvor, Praia do Vau, Praia dos Três Castelos and Praia da Rocha.'),
      jsonb_build_object('question', 'Can you reach Prainha from Praia dos Três Irmãos?', 'answer', 'Visit Portimão notes that low tide can give access from Praia dos Três Irmãos towards Prainha through coves and chasms, but this should only be considered when tide, sea and safety conditions allow.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Prainha?', 'answer', 'Late spring and early autumn are practical for photography and viewpoints, but the beach should always be approached cautiously because official sources identify rockfall and bathing-status concerns.')
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
