begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia de Quarteira",
    "type": "Nearby beach",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial Loulé town-front beach listing east of Vilamoura by stored coordinates.",
    "href": "/listing/praia-de-quarteira-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Falésia",
    "type": "Nearby beach",
    "distance": "~4.9 km",
    "description": "Published AlgarveOfficial beach listing west of Vilamoura by stored coordinates.",
    "href": "/listing/praia-da-falesia",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vale do Lobo",
    "type": "Nearby beach",
    "distance": "~5.2 km",
    "description": "Published AlgarveOfficial Loulé resort-area beach listing east of Vilamoura by stored coordinates.",
    "href": "/listing/praia-de-vale-do-lobo-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Garrão",
    "type": "Nearby beach",
    "distance": "~6.7 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Vilamoura by stored coordinates.",
    "href": "/listing/praia-do-garrao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Olhos de Água",
    "type": "Nearby beach",
    "distance": "~6.8 km",
    "description": "Published AlgarveOfficial Albufeira beach listing west of Vilamoura by stored coordinates.",
    "href": "/listing/praia-dos-olhos-de-agua-albufeira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Ancão",
    "type": "Nearby beach",
    "distance": "~8.1 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Vilamoura by stored coordinates.",
    "href": "/listing/praia-do-ancao-loule",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Água Qlub",
    "type": "Restaurant",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/agua-qlub-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Rafael",
    "type": "Restaurant",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/rafael-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Pepper's Steakhouse",
    "type": "Restaurant",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/peppers-steakhouse-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Rare Steakhouse",
    "type": "Restaurant",
    "distance": "~0.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/rare-steakhouse-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante Elcristo Vilamoura",
    "type": "Restaurant",
    "distance": "~0.5 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/restaurante-elcristo-vilamoura-quarteira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Hotel Vila Galé Ampalius",
    "type": "Accommodation",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/hotel-vila-gale-ampalius-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Dom Pedro Residences",
    "type": "Accommodation",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/dom-pedro-residences-vilamoura",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Dom Pedro Golf, SA - Vilamoura Head Office",
    "type": "Golf",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial golf-related listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/dom-pedro-golf-sa-vilamoura-head-office-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Dom Pedro Portobelo - Hotel & Apartments",
    "type": "Accommodation",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/dom-pedro-portobelo-hotel-apartments-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Tivoli Marina Vilamoura Algarve Resort",
    "type": "Wellness and accommodation",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial wellness and resort listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/tivoli-marina-vilamoura-algarve-resort-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Marina Plaza",
    "type": "Shopping",
    "distance": "~0.5 km",
    "description": "Published AlgarveOfficial shopping listing near Praia de Vilamoura by stored coordinates.",
    "href": "/listing/marina-plaza-vilamoura",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Vilamoura is a major resort beach in Loulé, set beside Vilamoura Marina and extending towards Quarteira. It is known for easy access, broad sand, strong beach infrastructure and verified 2026 Blue Flag status.';
  v_full_description text := $text$
Praia de Vilamoura is the main resort beach beside Vilamoura Marina, in the municipality of Loulé. VisitPortugal describes Vilamoura as a large planned tourism development with marina, casino, golf courses, hotels and resort accommodation, and the beach reflects that setting: accessible, serviced and closely tied to the marina area.

The beach has an extensive sandy shoreline that continues east towards Quarteira. VisitPortugal describes urban-beach characteristics, very easy road access along the beach and strong support infrastructure. To the west, the sand is bounded by the marina breakwater; to the east, it links naturally with the Quarteira seafront.

This is not a remote beach. It suits visitors who want convenience, beach services, nearby restaurants, marina walks, boat departures and a resort atmosphere. VisitPortugal lists Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible-beach status.

ABAAE verifies Vilamoura's 2026 bathing season from 1 June to 30 September and its 2026 Blue Flag season from 1 July to 30 September. Services should still be treated as seasonal, and visitors should follow local flags, signage and lifeguard instructions, especially around the marina breakwater and any nautical activity zones.
$text$;
  v_best_time text := 'June to September matches the official 2026 bathing season for Vilamoura. The verified 2026 Blue Flag season runs from 1 July to 30 September. May, June and September are often more comfortable for beach walks, marina visits and restaurant plans with less peak-summer pressure.';
  v_important_notes text := 'ABAAE lists the 2026 bathing season for Vilamoura from 1 June 2026 to 30 September 2026.
ABAAE lists the 2026 Blue Flag season for Vilamoura from 1 July 2026 to 30 September 2026.
Diário da República lists Vilamoura with bathing-water code PTCE3P and a 2026 bathing season from 1 June to 30 September.
VisitPortugal lists surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible-beach status.
Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified for this review.
The beach is close to the marina breakwater and nautical activity; visitors should follow local signage and avoid restricted areas.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-vilamoura-loule'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-vilamoura-loule not found; skipping update.';
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
        'VisitPortugal - Praia de Vilamoura',
        'ABAAE Bandeira Azul - Vilamoura',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Vilamoura',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-de-vilamoura',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Vilamoura - Loulé location',
          'Extensive sandy beach towards Quarteira',
          'Urban-beach characteristics',
          'Very easy road access beside the beach',
          'Marina breakwater west of the beach and marina resort context',
          'Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach',
          'Access by car, motorcycle and on foot'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Vilamoura',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/vilamoura/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Vilamoura Blue Flag entry',
          'Municipality of Loulé',
          'Coordinates 37.071752, -8.116064',
          'Beach code PTCE3P',
          '2026 bathing season from 1 June to 30 September',
          '2026 Blue Flag season from 1 July to 30 September',
          'Flag shown as not hoisted before the display season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Vilamoura listed among 2026 Blue Flag awarded coastal beaches',
          'Concelho Loulé',
          'Coordinates 37.071752, -8.116064',
          'Loulé listed with 12 awarded locations in 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Vilamoura listed in Loulé',
          'Bathing-water code PTCE3P',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-vilamoura-loule',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, accommodation, golf, wellness and shopping cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Vilamoura and the linked listings',
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
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Major resort beach beside Vilamoura Marina',
      'Extensive sandy shoreline continuing towards Quarteira',
      'Parking, showers, surveillance, bar, restaurant and accessible-beach status listed by VisitPortugal',
      '2026 bathing and Blue Flag seasons verified from ABAAE',
      'Vilamoura 2026 bathing season also verified from Diário da República',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia de Vilamoura. Exact parking capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia de Vilamoura as an accessible beach. Current adapted equipment, assistance, reserved parking availability and the best access point should still be confirmed locally before travelling.',
    'lifeguard_info', 'ABAAE and Diário da República list Vilamoura as a 2026 bathing beach from 1 June to 30 September. VisitPortugal also lists surveillance. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE. The official Vilamoura page lists the 2026 bathing season from 1 June to 30 September and the 2026 Blue Flag season from 1 July to 30 September.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Vilamoura',
      'notes', 'ABAAE and Diário da República list Vilamoura with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.071752%2C-8.116064',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists the 2026 bathing season for Vilamoura from 1 June to 30 September.',
        'ABAAE lists the 2026 Blue Flag season for Vilamoura from 1 July to 30 September.',
        'Diário da República lists Vilamoura with bathing-water code PTCE3P and the same 2026 bathing season.',
        'VisitPortugal lists parking, surveillance, showers, bar, restaurant and accessible-beach status.',
        'Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified.',
        'Visitors should take care around the marina breakwater and any nautical activity zones.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Vilamoura?', 'answer', 'Praia de Vilamoura is beside Vilamoura Marina in the municipality of Loulé, with the sandy shoreline continuing east towards Quarteira.'),
      jsonb_build_object('question', 'Is there parking at Praia de Vilamoura?', 'answer', 'VisitPortugal lists parking for Praia de Vilamoura. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia de Vilamoura accessible?', 'answer', 'VisitPortugal lists Praia de Vilamoura as an accessible beach. Current adapted equipment, assistance and the best access point should still be confirmed locally before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Vilamoura?', 'answer', 'ABAAE and Diário da República list Vilamoura as a 2026 bathing beach from 1 June to 30 September. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Vilamoura a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Vilamoura as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia de Quarteira, Praia da Falésia, Praia de Vale do Lobo, Praia do Garrão, Praia dos Olhos de Água and Praia do Ancão.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Vilamoura?', 'answer', 'VisitPortugal lists bar and restaurant facilities for Praia de Vilamoura. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Vilamoura?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are often useful for beach walks, marina visits and restaurant plans with less peak-summer pressure.'),
      jsonb_build_object('question', 'Can you walk from Vilamoura beach to Quarteira?', 'answer', 'VisitPortugal describes the sandy beach continuing towards Quarteira. Route choice, tide and local access conditions should still be checked on the day.')
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
