begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia dos Três Irmãos",
    "type": "Nearby beach",
    "distance": "~1.4 km",
    "description": "Published AlgarveOfficial beach listing east of Praia de Alvor by stored coordinates.",
    "href": "/listing/praia-dos-tres-irmaos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Prainha",
    "type": "Nearby beach",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial Alvor cove listing east of Praia de Alvor by stored coordinates.",
    "href": "/listing/praia-da-prainha-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Alemão",
    "type": "Nearby beach",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial Portimão beach listing east of Alvor by stored coordinates.",
    "href": "/listing/praia-do-alemao-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Vau",
    "type": "Nearby beach",
    "distance": "~3.3 km",
    "description": "Published AlgarveOfficial Portimão beach listing east of Alvor by stored coordinates.",
    "href": "/listing/praia-do-vau-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Castelos",
    "type": "Nearby beach",
    "distance": "~4.4 km",
    "description": "Published AlgarveOfficial cliff-backed Portimão beach listing by stored coordinates.",
    "href": "/listing/praia-dos-tres-castelos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Meia Praia",
    "type": "Nearby beach",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial Lagos beach listing west of the Alvor estuary by stored coordinates.",
    "href": "/listing/meia-praia-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Al Sud Palmares",
    "type": "Restaurant",
    "distance": "~4.0 km",
    "description": "Closest published AlgarveOfficial restaurant listing by stored coordinates; not verified as being on Praia de Alvor.",
    "href": "/listing/al-sud-palmares-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "White Leaf - Catering Algarve",
    "type": "Restaurant",
    "distance": "~4.6 km",
    "description": "Published AlgarveOfficial restaurant listing near Alvor by stored coordinates; not verified as beachside.",
    "href": "/listing/white-leaf-catering-algarve-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante F",
    "type": "Restaurant",
    "distance": "~4.7 km",
    "description": "Published AlgarveOfficial restaurant listing near Alvor by stored coordinates; not verified as beachside.",
    "href": "/listing/restaurante-f-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "NUMA",
    "type": "Restaurant",
    "distance": "~4.7 km",
    "description": "Published AlgarveOfficial Portimão restaurant listing by stored coordinates.",
    "href": "/listing/numa-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Boys - Bistrô",
    "type": "Restaurant",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Alvor by stored coordinates.",
    "href": "/listing/the-boys-bistro-vilamoura",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Alvor Boat Trips",
    "type": "Experience",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial experience listing close to Alvor by stored coordinates.",
    "href": "/listing/alvor-boat-trips-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Sailing Catamaran",
    "type": "Experience",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial sailing experience listing close to Alvor by stored coordinates.",
    "href": "/listing/alvor-sailing-catamaran-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Golf Shop",
    "type": "Nearby business",
    "distance": "~0.7 km",
    "description": "Published AlgarveOfficial shopping listing close to Alvor by stored coordinates.",
    "href": "/listing/alvor-golf-shop",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alto Golf Course",
    "type": "Golf",
    "distance": "~2.7 km",
    "description": "Published AlgarveOfficial golf listing east of Alvor by stored coordinates.",
    "href": "/listing/alto-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Skydive Seven Algarve",
    "type": "Family attraction",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial attraction listing near Alvor by stored coordinates.",
    "href": "/listing/skydive-seven-algarve-alvor",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'Diário da República lists Alvor-Poente and Alvor-Nascente as Portimão bathing beaches for the 2026 season from 1 June to 30 September.
ABAAE lists Alvor Poente and Alvor Nascente among Portimão''s 2026 Blue Flag awarded coastal beaches.
The individual ABAAE Alvor Poente page lists the 2026 bathing and Blue Flag seasons from 1 June to 30 September.
The individual ABAAE Alvor Nascente page lists the 2026 bathing season from 1 June to 30 September, but its Blue Flag season field showed an inconsistent single-day date when checked on 19 May 2026; exact display dates should be confirmed locally.
VisitPortugal lists outdoor parking, surveillance, showers, bar, restaurant, sunshade rental, small craft hire and accessible-beach status for Praia de Alvor.
Visit Portimão lists beach support, Blue Flag, nautical centre, showers, lifeguard, first-aid station, accessible beach, WC and sunshade area.
The Ria de Alvor and dune areas are environmentally sensitive; visitors should use marked walkways and avoid crossing protected dunes.
Facilities, surveillance, water-sports services and accessible-beach support may vary by section and season.';
  v_full_description text := 'Praia de Alvor is a large sandy beach in the municipality of Portimão, set beside Alvor village and the Ria de Alvor. Official tourism sources describe it as a broad maritime beach with strong visitor infrastructure, hotel surroundings and support for activities such as sailing and windsurfing.

The beach is best understood as a long resort-and-estuary shoreline rather than a small cove. To the west, the Alvor sandbar and estuary create a landscape of dunes, marshes, tidal channels and lagoon scenery; to the east, the wider coastline continues towards Praia dos Três Irmãos and the cliff-backed beaches of Portimão. Visit Portimão notes that conservation work has been carried out on the dune system and that walkways and footpaths help protect the area while giving access to the beaches and jetty.

For visitors, Alvor offers a practical beach day with space, seasonal services, restaurants nearby and nature walks close to the sand. VisitPortugal lists outdoor parking, showers, bar, restaurant, surveillance, sunshade rental, small craft hire and accessible-beach status. Visit Portimão also lists lifeguard service, first-aid station, WC, nautical centre and accessible beach.

Diário da República lists both Alvor-Poente and Alvor-Nascente as 2026 bathing beaches from 1 June to 30 September. ABAAE verifies both Alvor Poente and Alvor Nascente as 2026 Blue Flag awarded coastal beaches. Visitors should still check local flags, signage and section-specific access before swimming, and should keep to marked routes through the dune and estuary environment.';
  v_short_description text := 'Praia de Alvor is a large sandy beach in Portimão, set beside Alvor village and the Ria de Alvor. It combines resort-area services, dune and estuary scenery, walkways, accessible-beach recognition and verified 2026 Blue Flag status for Alvor Poente and Alvor Nascente.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-alvor-portimao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-alvor-portimao not found; skipping update.';
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
        'VisitPortugal - Praia de Alvor',
        'Visit Portimão - Praia de Alvor',
        'ABAAE Bandeira Azul - Alvor Poente',
        'ABAAE Bandeira Azul - Alvor Nascente',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Alvor',
        'source_url', 'https://www.visitportugal.com/en/node/141476',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and maritime beach classification',
          'Location in Alvor, Portimão',
          'Extensive sandy beach and resort surroundings',
          'Ria de Alvor ecological context',
          'Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, windsurfing, sailing and accessible beach'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Visit Portimão - Praia de Alvor',
        'source_url', 'https://visitportimao.com/en/beaches/praia-de-alvor/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Praia de Alvor as a major Portimão beach',
          'Vast sandy beach east of the Alvor Estuary',
          'Sand bars, lagoon, marshes and calm-water channels',
          'Habitat for resident and visiting water birds, fish and molluscs',
          'Dune conservation work and network of walkways and footpaths',
          'Accessible nature trail with stopping places and viewpoints',
          'Facilities including beach support, Blue Flag, nautical centre, showers, lifeguard, first-aid station, accessible beach, WC and sunshade area'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Alvor Poente',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/alvor-poente/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Alvor Poente Blue Flag entry',
          'Municipality of Portimão',
          'Coordinates 37.12278, -8.59605',
          'Beach code PTCF7T',
          '2026 bathing season from 1 June to 30 September',
          '2026 Blue Flag season from 1 June to 30 September'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Alvor Nascente',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/alvor-nascente/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Alvor Nascente Blue Flag entry',
          'Municipality of Portimão',
          'Coordinates 37.119964, -8.58085',
          'Beach code PTCW7C',
          '2026 bathing season from 1 June to 30 September',
          'Individual page showed an inconsistent 2026 Blue Flag display date when checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Alvor Poente listed among Portimão 2026 Blue Flag awarded coastal beaches',
          'Alvor Nascente listed among Portimão 2026 Blue Flag awarded coastal beaches'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Alvor-Poente listed in Portimão with 2026 bathing season from 1 June to 30 September',
          'Alvor-Nascente listed in Portimão with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-alvor-portimao',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, experience, golf, shopping and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Alvor and the linked listings',
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
        to_jsonb('The closest published internal restaurant listings are not verified as being on Praia de Alvor; distance labels and descriptions make this limitation explicit.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant listings are not verified as being on Praia de Alvor; distance labels and descriptions make this limitation explicit.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Large sandy beach beside Alvor village and the Ria de Alvor',
      'Outdoor parking, showers, bar and restaurant listed by VisitPortugal',
      'Beach support, lifeguard, first-aid station, WC and nautical centre listed by Visit Portimão',
      'Accessible-beach status listed by VisitPortugal and Visit Portimão',
      'Dune walkways and an accessible nature trail described by Visit Portimão',
      'Blue Flag status verified for 2026 for Alvor Poente and Alvor Nascente'
    ),
    'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Alvor Poente and Alvor Nascente. Spring, early summer and early autumn are often more comfortable for the Alvor boardwalk, birdwatching and longer beach walks; in summer, mornings and later afternoons are usually the most practical times for parking and heat.',
    'parking_info', 'VisitPortugal lists outdoor parking for Praia de Alvor. Exact car-park capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal and Visit Portimão list Praia de Alvor as an accessible beach. Visit Portimão also describes the nearby nature trail as an Accessible Trail with viewpoints. Current adapted equipment, the best beach section for reduced mobility and seasonal assistance should still be confirmed locally before travelling.',
    'lifeguard_info', 'Diário da República lists Alvor-Poente and Alvor-Nascente as 2026 bathing beaches from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE for both Alvor Poente and Alvor Nascente. The individual Alvor Poente page lists a 2026 Blue Flag season from 1 June to 30 September; the Alvor Nascente page checked on 19 May 2026 showed an inconsistent Blue Flag-season field, so exact display dates for that section should be confirmed locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'sections', jsonb_build_array('Alvor-Poente', 'Alvor-Nascente'),
      'notes', 'Diário da República lists both Alvor-Poente and Alvor-Nascente as 2026 bathing beaches; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.12278%2C-8.59605',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Alvor Poente and Alvor Nascente. Spring, early summer and early autumn are often more comfortable for the Alvor boardwalk, birdwatching and longer beach walks; in summer, mornings and later afternoons are usually the most practical times for parking and heat.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Alvor-Poente and Alvor-Nascente as Portimão bathing beaches for the 2026 season from 1 June to 30 September.',
        'ABAAE lists Alvor Poente and Alvor Nascente among Portimão''s 2026 Blue Flag awarded coastal beaches.',
        'VisitPortugal lists outdoor parking, surveillance, showers, bar, restaurant, sunshade rental, small craft hire and accessible-beach status.',
        'Visit Portimão lists lifeguard, first-aid station, WC, nautical centre, accessible beach and sunshade area.',
        'The Alvor Nascente individual ABAAE page showed an inconsistent Blue Flag-season field when checked on 19 May 2026.',
        'The Ria de Alvor and dune system are sensitive; visitors should keep to marked walkways and paths.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Alvor?', 'answer', 'Praia de Alvor is beside Alvor village in the municipality of Portimão, next to the Ria de Alvor on the western Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia de Alvor?', 'answer', 'VisitPortugal lists outdoor parking for Praia de Alvor. Current capacity, payment rules and seasonal restrictions should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Alvor accessible?', 'answer', 'VisitPortugal and Visit Portimão list Praia de Alvor as an accessible beach. Current adapted equipment, the best access point and seasonal support should still be confirmed before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Alvor?', 'answer', 'Diário da República lists Alvor-Poente and Alvor-Nascente as 2026 bathing beaches from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Alvor a Blue Flag beach?', 'answer', 'Yes. ABAAE lists both Alvor Poente and Alvor Nascente among the 2026 Blue Flag awarded coastal beaches in Portimão. Exact display dates should be checked locally, especially for Alvor Nascente.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia de Alvor?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia dos Três Irmãos, Praia da Prainha, Praia do Alemão, Praia do Vau, Praia dos Três Castelos and Meia Praia.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Alvor?', 'answer', 'VisitPortugal lists a bar and restaurant for Praia de Alvor. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Alvor?', 'answer', 'June to September matches the verified 2026 bathing season. Spring, early summer and early autumn are useful for boardwalk walks, birdwatching and a quieter pace.'),
      jsonb_build_object('question', 'Can you walk near the Ria de Alvor from the beach?', 'answer', 'Yes. Visit Portimão describes walkways and footpaths through the Alvor dune system, including an Accessible Trail with viewpoints over the estuary habitats.')
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
