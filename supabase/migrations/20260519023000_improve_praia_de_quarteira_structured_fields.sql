begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia de Vilamoura",
    "type": "Nearby beach",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of Quarteira by stored coordinates.",
    "href": "/listing/praia-de-vilamoura-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vale do Lobo",
    "type": "Nearby beach",
    "distance": "~4.1 km",
    "description": "Published AlgarveOfficial Loulé resort-area beach listing east of Quarteira by stored coordinates.",
    "href": "/listing/praia-de-vale-do-lobo-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Garrão",
    "type": "Nearby beach",
    "distance": "~5.6 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Quarteira by stored coordinates.",
    "href": "/listing/praia-do-garrao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Falésia",
    "type": "Nearby beach",
    "distance": "~6.0 km",
    "description": "Published AlgarveOfficial beach listing west of Quarteira by stored coordinates.",
    "href": "/listing/praia-da-falesia",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Ancão",
    "type": "Nearby beach",
    "distance": "~7.0 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Quarteira by stored coordinates.",
    "href": "/listing/praia-do-ancao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Olhos de Água",
    "type": "Nearby beach",
    "distance": "~8.0 km",
    "description": "Published AlgarveOfficial Albufeira beach listing west of Quarteira by stored coordinates.",
    "href": "/listing/praia-dos-olhos-de-agua-albufeira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "TOP Table BBQ - Korean Restaurant",
    "type": "Restaurant",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/top-table-bbq-korean-restaurant-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Gusto'zza Quarteira",
    "type": "Restaurant",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/gustozza-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante Atlântico Quarteira",
    "type": "Restaurant",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/restaurante-atlantico-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "O Jacinto",
    "type": "Restaurant",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/o-jacinto-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Fernando's Hideaway",
    "type": "Restaurant",
    "distance": "~0.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/fernandos-hideaway-quarteira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Decathlon Connect Quarteira",
    "type": "Nearby business",
    "distance": "~0.0 km",
    "description": "Published AlgarveOfficial shopping listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/decathlon-connect-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Travel VIP - A. J. & Barros Lda. - Táxi, Tours, Transfers",
    "type": "Nearby business",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/travel-vip-a-j-barros-lda-taxi-tours-transfers-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Premium Training",
    "type": "Nearby business",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial fitness listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/the-premium-training-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Infinity Luxe Chauffeur",
    "type": "Nearby business",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/infinity-luxe-chauffeur-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quarteira Beach Hotel",
    "type": "Accommodation",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/quarteira-beach-hotel-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Champions Fitness Gym",
    "type": "Nearby business",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial fitness listing near Praia de Quarteira by stored coordinates.",
    "href": "/listing/champions-fitness-gym-quarteira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Quarteira is a town-front beach in Loulé, set beside Quarteira''s Avenida Marginal and seafront promenade. It is known for its long sand, concrete breakwaters, central access, seasonal beach services and busy summer use.';
  v_full_description text := $text$
Praia de Quarteira is an established urban beach in the municipality of Loulé, positioned directly beside the town of Quarteira and its Avenida Marginal seafront. VisitPortugal describes Quarteira as one of the Algarve's busiest localities during summer, and the beach reflects that town-front role: practical, serviced and closely connected to restaurants, cafés, shops and local life.

The beach has a very extensive sandy shoreline divided by concrete breakwaters. Its character is different from the Algarve's cliff coves and dune-island beaches: visitors come here for direct town access, a long promenade and a simple beach day with services nearby. VisitPortugal lists Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, bodyboard and accessible-beach status.

Praia de Quarteira is not a remote natural beach. It is best treated as a high-use urban seaside space, especially in the main bathing season. That makes it useful for families, residents, long-stay visitors and anyone who wants the beach, promenade and town facilities in the same place, but visitors seeking quiet scenery should consider timing their visit outside the busiest summer periods.

For 2026, Quarteira is listed in Diário da República with a bathing season from 1 June to 30 September, and ABAAE lists Quarteira among Loulé's 2026 Blue Flag awarded locations. The individual ABAAE Quarteira page checked on 19 May 2026 still showed non-current season context, so the listing treats Blue Flag display details as seasonal and advises checking local signage before relying on services.
$text$;
  v_best_time text := 'June to September matches the official 2026 bathing season for Quarteira. July and August bring the strongest town-front beach atmosphere, while May, June and September are usually more comfortable for promenade walks, restaurants and a less pressured beach visit.';
  v_important_notes text := 'Diário da República lists Quarteira with bathing-water code PTCF7K and a 2026 bathing season from 1 June to 30 September.
ABAAE lists Quarteira among Loulé''s 2026 Blue Flag awarded locations.
The individual ABAAE Quarteira page checked on 19 May 2026 still showed non-current season context, so exact 2026 Blue Flag display dates should be confirmed locally.
VisitPortugal lists Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, bodyboard and accessible-beach status.
Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified for this review.
The beach is divided by concrete breakwaters; visitors should take care near structures and follow local signage and flags.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-quarteira-loule'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-quarteira-loule not found; skipping update.';
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
        'VisitPortugal - Praia de Quarteira',
        'ABAAE Bandeira Azul - Quarteira',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Quarteira',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-de-quarteira',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Quarteira - Loulé location',
          'Urban beach beside Quarteira, a busy Algarve summer locality',
          'Very extensive sandy beach divided by concrete breakwaters',
          'Avenida Marginal promenade behind the beach',
          'Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, bodyboard and accessible beach',
          'Access by car, motorcycle and on foot'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Quarteira',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/quarteira/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Quarteira Blue Flag entry',
          'Municipality of Loulé',
          'Coordinates 37.06778, -8.104391',
          'Beach code PTCF7K',
          'Flag shown as not hoisted at time checked',
          'Individual page checked and treated cautiously because season context did not clearly update to 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Quarteira listed among 2026 Blue Flag awarded coastal beaches',
          'Concelho Loulé',
          'Coordinates 37.06778, -8.104391',
          'Loulé listed with 12 awarded locations in 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Quarteira listed in Loulé',
          'Bathing-water code PTCF7K',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-quarteira-loule',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, accommodation, shopping, fitness and transport cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Quarteira and the linked listings',
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
        to_jsonb('The individual ABAAE Quarteira page checked on 19 May 2026 did not provide clear current 2026 display-season dates; 2026 Blue Flag status is therefore supported by the ABAAE 2026 awarded list.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text)
      union all
      select to_jsonb('The individual ABAAE Quarteira page checked on 19 May 2026 did not provide clear current 2026 display-season dates; 2026 Blue Flag status is therefore supported by the ABAAE 2026 awarded list.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Central town-front beach beside Quarteira''s Avenida Marginal',
      'Very extensive sandy shoreline divided by concrete breakwaters',
      'Parking, showers, surveillance, bar, restaurant and accessible-beach status listed by VisitPortugal',
      'Quarteira 2026 bathing season verified from Diário da República',
      'Blue Flag status verified for 2026 via ABAAE awarded list',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia de Quarteira. Exact parking capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia de Quarteira as an accessible beach. Current adapted equipment, assistance, reserved parking availability and the best access point should still be confirmed locally before travelling.',
    'lifeguard_info', 'Diário da República lists Quarteira as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. VisitPortugal also lists surveillance. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE awarded list. The individual ABAAE Quarteira page checked on 19 May 2026 did not clearly provide current 2026 display-season dates, so exact Blue Flag display dates should be confirmed locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Quarteira',
      'notes', 'Diário da República lists Quarteira with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.06778%2C-8.104391',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Quarteira with a 2026 bathing season from 1 June to 30 September.',
        'ABAAE lists Quarteira among Loulé''s 2026 Blue Flag awarded locations.',
        'VisitPortugal lists parking, surveillance, showers, bar, restaurant and accessible-beach status.',
        'Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified.',
        'The beach is divided by concrete breakwaters; visitors should take care near structures.',
        'Visitors should follow local flags, signage and lifeguard instructions.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Quarteira?', 'answer', 'Praia de Quarteira is beside the town of Quarteira in the municipality of Loulé, on the central Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia de Quarteira?', 'answer', 'VisitPortugal lists parking for Praia de Quarteira. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia de Quarteira accessible?', 'answer', 'VisitPortugal lists Praia de Quarteira as an accessible beach. Current adapted equipment, assistance and the best access point should still be confirmed locally before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Quarteira?', 'answer', 'Diário da República lists Quarteira as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Quarteira a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Quarteira among the 2026 Blue Flag awarded beaches. The individual ABAAE page checked on 19 May 2026 did not clearly provide current 2026 display-season dates, so exact display dates should be confirmed locally.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia de Vilamoura, Praia de Vale do Lobo, Praia do Garrão, Praia da Falésia, Praia do Ancão and Praia dos Olhos de Água.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Quarteira?', 'answer', 'VisitPortugal lists bar and restaurant facilities for Praia de Quarteira. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Quarteira?', 'answer', 'June to September matches the official 2026 bathing season. May, June and September are usually more comfortable for promenade walks and a less pressured beach visit.'),
      jsonb_build_object('question', 'Is Praia de Quarteira a quiet natural beach?', 'answer', 'No. Praia de Quarteira is a central urban beach beside the town promenade. It is better suited to visitors who want services, town access and a lively seaside setting.')
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
