begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~4.5 km",
    "description": "Published AlgarveOfficial village-beach listing east of Salema by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Luz",
    "type": "Nearby beach",
    "distance": "~9.0 km",
    "description": "Published AlgarveOfficial Lagos village beach listing east of Salema by stored coordinates.",
    "href": "/listing/praia-da-luz-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Martinhal",
    "type": "Nearby beach",
    "distance": "~10.2 km",
    "description": "Published AlgarveOfficial Sagres-area beach listing west of Salema by stored coordinates.",
    "href": "/listing/praia-do-martinhal",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Mareta",
    "type": "Nearby beach",
    "distance": "~12.1 km",
    "description": "Published AlgarveOfficial central Sagres beach listing west of Salema by stored coordinates.",
    "href": "/listing/praia-da-mareta-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Porto de Mós",
    "type": "Nearby beach",
    "distance": "~12.4 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Salema by stored coordinates.",
    "href": "/listing/praia-de-porto-de-mos-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Tonel",
    "type": "Nearby beach",
    "distance": "~12.8 km",
    "description": "Published AlgarveOfficial Sagres beach listing west of Salema by stored coordinates.",
    "href": "/listing/praia-do-tonel-vila-do-bispo",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Aquário",
    "type": "Restaurant",
    "distance": "~8.7 km",
    "description": "Closest published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Salema or beside the beach.",
    "href": "/listing/restaurante-aquario-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Le Clubhouse Restaurant",
    "type": "Restaurant",
    "distance": "~11.2 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Salema or beside the beach.",
    "href": "/listing/le-clubhouse-restaurant-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Mirandus",
    "type": "Restaurant",
    "distance": "~12.8 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Salema or beside the beach.",
    "href": "/listing/mirandus-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "DON GULL",
    "type": "Restaurant",
    "distance": "~13.8 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Salema or beside the beach.",
    "href": "/listing/don-gull-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida",
    "type": "Restaurant",
    "distance": "~13.9 km",
    "description": "Published AlgarveOfficial Lagos restaurant listing by stored coordinates.",
    "href": "/listing/avenida-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Wildnaturesoul Yoga Retreat & Massage Studio",
    "type": "Wellness spa",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial wellness listing near Salema by stored coordinates.",
    "href": "/listing/wildnaturesoul-yoga-retreat-massage-studio-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta da Encosta Velha",
    "type": "Accommodation",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial accommodation listing near Salema by stored coordinates.",
    "href": "/listing/quinta-da-encosta-velha-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Beach Bar Burgau",
    "type": "Beach club",
    "distance": "~4.4 km",
    "description": "Published AlgarveOfficial nearby business listing by stored coordinates.",
    "href": "/listing/beach-bar-burgau-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Vida Boa Lodge",
    "type": "Experience",
    "distance": "~7.4 km",
    "description": "Published AlgarveOfficial experience listing near Salema by stored coordinates.",
    "href": "/listing/vida-boa-lodge-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Espiche Golf",
    "type": "Golf",
    "distance": "~8.6 km",
    "description": "Published AlgarveOfficial golf listing east of Salema by stored coordinates.",
    "href": "/listing/espiche-golf",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'Diário da República lists Salema as a Vila do Bispo bathing beach for the 2026 season from 1 June to 30 September.
ABAAE lists Salema among Vila do Bispo''s 2026 Blue Flag awarded coastal beaches.
The individual ABAAE Salema page checked on 18 May 2026 still showed 2025 season dates, so exact 2026 Blue Flag display dates were not treated as verified from that page.
VisitPortugal lists Blue Flag, surveillance, sunshade rental, showers, outdoor parking, bar, restaurant and accessible-beach status for Praia de Salema.
Accessibility is verified at recognition level by VisitPortugal, but current adapted equipment and seasonal support should be confirmed before travelling.
The dinosaur footprints on the western side are fragile natural heritage; visitors should not touch, climb on or damage them.
Fishing boats and equipment may be present on the beach, and visitors should respect working areas.
Facilities, surveillance and accessible-beach support may vary by season.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-salema-vila-do-bispo'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-salema-vila-do-bispo not found; skipping update.';
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
        'ABAAE Bandeira Azul - Salema',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Salema listed in Vila do Bispo with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies beaches of bathing where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Salema',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/salema/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Official Salema Blue Flag entry',
          'Municipality of Vila do Bispo',
          'Coordinates 37.0652, -8.8249',
          'Beach code PTCQ3J',
          'Individual page checked on 18 May 2026 and found still showing 2025 season dates'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Salema listed among 2026 Blue Flag awarded coastal beaches',
          'Salema coordinates and Vila do Bispo municipality cross-checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-salema-vila-do-bispo',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Salema and the linked listings',
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
        to_jsonb('The closest published internal restaurant listings are not verified as being in Salema; distance labels and descriptions make this limitation explicit.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant listings are not verified as being in Salema; distance labels and descriptions make this limitation explicit.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', 'Praia da Salema is a serviced village beach in Vila do Bispo, set below the fishing village of Salema between Sagres and Lagos. It combines a sandy bay, fishing heritage, dinosaur-footprint interest, parking, accessible-beach recognition and 2026 Blue Flag status.',
    'full_description', 'Praia da Salema is a village beach in the municipality of Vila do Bispo, on the western Algarve coast between Sagres and Lagos. VisitPortugal describes Salema as a maritime beach long used by fishermen, with fishing activity still part of the early-morning character of the beach.\n\nThe beach sits directly below Salema village, with restaurants and terraces close to the sand. VisitPortugal lists practical beach support including surveillance, sunshade rental, showers, outdoor parking, bar, restaurant and accessible-beach status. The setting is serviced and village-led rather than remote, with fishing boats and working areas that visitors should respect.\n\nSalema is also notable for dinosaur footprints in rock slabs beside the beach. This has been supported by municipal and scientific sources, and the feature should be treated as fragile natural heritage rather than a climbing or play area.\n\nDiário da República lists Salema as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the bathing season. ABAAE lists Salema among the 2026 Blue Flag awarded coastal beaches, although the individual ABAAE Salema page checked on 18 May 2026 still showed 2025 season dates, so exact 2026 Blue Flag display dates should be confirmed locally.',
    'highlights', jsonb_build_array(
      'Village beach in Vila do Bispo between Sagres and Lagos',
      'Fishing heritage and working beach character',
      'Outdoor parking, showers, bar and restaurant listed by VisitPortugal',
      'Accessible-beach status listed by VisitPortugal',
      'Dinosaur footprints verified from municipal and scientific sources',
      'Blue Flag status verified for 2026 by ABAAE'
    ),
    'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Salema. July and August provide the fullest beach-service atmosphere, while May, June and September are usually more practical for village walks, photography and lower peak-summer pressure.',
    'parking_info', 'VisitPortugal lists outdoor parking for Praia de Salema. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia de Salema as an accessible beach. Current adapted equipment, beach approach, parking arrangements and seasonal assistance should still be confirmed before travelling.',
    'lifeguard_info', 'Diário da República lists Salema as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE''s awarded list for Salema. The individual ABAAE Salema page checked on 18 May 2026 still showed 2025 season dates, so exact 2026 Blue Flag display dates were not treated as verified from that page.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'Diário da República lists Salema as a 2026 bathing beach; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.0652%2C-8.8249',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Salema. July and August provide the fullest beach-service atmosphere, while May, June and September are usually more practical for village walks, photography and lower peak-summer pressure.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Salema as a Vila do Bispo bathing beach for the 2026 season from 1 June to 30 September.',
        'ABAAE lists Salema among Vila do Bispo''s 2026 Blue Flag awarded coastal beaches.',
        'VisitPortugal lists outdoor parking, surveillance, showers, bar, restaurant and accessible-beach status.',
        'Current adapted equipment and accessibility support should be confirmed locally.',
        'Dinosaur footprints on the western side are fragile natural heritage and should not be damaged.',
        'Fishing boats and equipment may be present on the beach.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Salema?', 'answer', 'Praia da Salema is below Salema village in the municipality of Vila do Bispo, between Sagres and Lagos on the western Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia da Salema?', 'answer', 'VisitPortugal lists outdoor parking for Praia de Salema. Current capacity, payment rules and seasonal restrictions should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Salema accessible?', 'answer', 'VisitPortugal lists Praia de Salema as an accessible beach. Current adapted equipment, access route and seasonal assistance should still be confirmed before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Salema?', 'answer', 'Diário da República lists Salema as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Salema a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Salema among the 2026 Blue Flag awarded coastal beaches. The individual ABAAE Salema page checked on 18 May 2026 still showed 2025 dates, so exact 2026 display dates should be confirmed locally.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Salema?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Burgau, Praia da Luz, Praia do Martinhal, Praia da Mareta, Praia de Porto de Mós and Praia do Tonel.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Salema?', 'answer', 'VisitPortugal lists a bar and restaurant at Praia de Salema. Nearby restaurant cards on AlgarveOfficial link only to published internal listings; the closest internal restaurant listings are not verified as being in Salema.'),
      jsonb_build_object('question', 'Are there dinosaur footprints at Praia da Salema?', 'answer', 'Yes. Dinosaur-footprint information at Praia da Salema is supported by municipal and scientific sources. The rock slabs should be treated as fragile natural heritage.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Salema?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are useful for village walks, photography and a slightly calmer pace.')
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
