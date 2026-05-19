begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Garrão",
    "type": "Nearby beach",
    "distance": "~1.6 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Vale do Lobo by stored coordinates.",
    "href": "/listing/praia-do-garrao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Ancão",
    "type": "Nearby beach",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Vale do Lobo by stored coordinates.",
    "href": "/listing/praia-do-ancao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Quarteira",
    "type": "Nearby beach",
    "distance": "~4.1 km",
    "description": "Published AlgarveOfficial Loulé town-front beach listing west of Vale do Lobo by stored coordinates.",
    "href": "/listing/praia-de-quarteira-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Quinta do Lago",
    "type": "Nearby beach",
    "distance": "~4.4 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing east of Vale do Lobo by stored coordinates.",
    "href": "/listing/praia-de-quinta-do-lago-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vilamoura",
    "type": "Nearby beach",
    "distance": "~5.2 km",
    "description": "Published AlgarveOfficial Loulé resort beach listing west of Vale do Lobo by stored coordinates.",
    "href": "/listing/praia-de-vilamoura-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Faro / Ilha de Faro",
    "type": "Nearby beach",
    "distance": "~7.9 km",
    "description": "Published AlgarveOfficial Faro island beach listing east of Vale do Lobo by stored coordinates.",
    "href": "/listing/praia-de-faro-ilha-de-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Sandbanks Beach Restaurant",
    "type": "Restaurant",
    "distance": "~0.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/sandbanks-beach-restaurant-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Well Vale do Lobo",
    "type": "Restaurant",
    "distance": "~0.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/well-vale-do-lobo-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Roof",
    "type": "Restaurant",
    "distance": "~0.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/the-roof-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "El Ta'koy",
    "type": "Restaurant",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/el-takoy-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Tinto",
    "type": "Restaurant",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/tinto-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "The Beach Bar Vale do Lobo",
    "type": "Beach club",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial beach-club listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/the-beach-bar-vale-do-lobo-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praça Vale do Lobo",
    "type": "Nearby business",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial nearby business listing at Vale do Lobo by stored coordinates.",
    "href": "/listing/praca-vale-do-lobo-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Partee Mini Golf Vale do Lobo",
    "type": "Experience",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial experience listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/partee-mini-golf-vale-do-lobo-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Dona Filipa Hotel",
    "type": "Accommodation",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/dona-filipa-hotel-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Vale do Lobo Golf (Royal & Ocean Courses)",
    "type": "Golf",
    "distance": "~0.7 km",
    "description": "Published AlgarveOfficial golf listing near Praia de Vale do Lobo by stored coordinates.",
    "href": "/listing/vale-do-lobo-golf-royal-ocean-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Dunas Douradas Beach Club",
    "type": "Accommodation",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial accommodation listing east of Vale do Lobo by stored coordinates.",
    "href": "/listing/dunas-douradas-beach-club-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Vale do Lobo is a resort-area beach in Loulé, set beside the Vale do Lobo coastal area near Almancil. It is known for reddish cliffs, a long sandy shoreline, nearby restaurants and verified 2026 Blue Flag status.';
  v_full_description text := $text$
Praia de Vale do Lobo is a resort-area beach in the municipality of Loulé, beside the Vale do Lobo coastal development near Almancil. VisitPortugal describes the beach as sitting below a reddish cliff, next to the tourist resort of the same name, with golf, tennis, pine woodland and gardens forming part of the wider setting.

The beach has a broad sandy shoreline that continues for kilometres before merging into neighbouring beaches. It is therefore useful for visitors who want a serviced beach day as well as longer shoreline walks. Its character is developed and resort-oriented rather than remote: restaurants, bars, parking, showers, sunshade rental, small craft hire and accessible-beach status are listed by VisitPortugal.

Vale do Lobo's main visual feature is the red and ochre cliff backdrop. The cliffs make the beach distinctive, but visitors should avoid sitting directly below cliff faces, using informal cliff paths or approaching cliff edges. Sea and wind conditions can also vary, so swimming and water sports should depend on local flags, signage and lifeguard guidance.

For 2026, Diário da República lists Vale do Lobo as a Loulé bathing beach from 1 June to 30 September, and ABAAE lists Vale de Lobo among Loulé's 2026 Blue Flag awarded coastal beaches. The individual ABAAE page checked on 19 May 2026 still showed 2025 season context, so exact 2026 Blue Flag display dates should be confirmed locally.
$text$;
  v_best_time text := 'June to September matches the official 2026 bathing season for Vale do Lobo. May, June and September are usually more comfortable for beach walks, restaurants and photography, while July and August bring the strongest resort-area beach atmosphere and highest demand.';
  v_important_notes text := 'Diário da República lists Vale do Lobo with bathing-water code PTCT7J and a 2026 bathing season from 1 June to 30 September.
ABAAE lists Vale de Lobo among Loulé''s 2026 Blue Flag awarded locations.
The individual ABAAE Vale de Lobo page checked on 19 May 2026 still showed 2025 season context, so exact 2026 Blue Flag display dates should be confirmed locally.
VisitPortugal lists surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard, windsurfing, sailing and accessible-beach status.
Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified for this review.
The beach is backed by cliffs; visitors should avoid cliff bases, cliff edges and informal cliff paths.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-vale-do-lobo-loule'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-vale-do-lobo-loule not found; skipping update.';
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
        'VisitPortugal - Praia de Vale de Lobo',
        'ABAAE Bandeira Azul - Vale de Lobo',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Vale de Lobo',
        'source_url', 'https://www.visitportugal.com/en/NR/exeres/4CD6CEFB-026A-4C00-9737-CEC537B13FE0',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Almancil - Loulé location',
          'Reddish cliff setting',
          'Beach beside the Vale de Lobo tourist resort',
          'Large sandy beach stretching for kilometres and merging with neighbouring beaches',
          'Golf, tennis, pine woodland and gardens in the wider setting',
          'Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, outdoor parking, bar, restaurant, bodyboard, windsurfing, sailing and accessible beach',
          'Access by car, motorcycle and on foot'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Vale de Lobo',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/vale-de-lobo/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Vale de Lobo Blue Flag entry',
          'Municipality of Loulé',
          'Coordinates 37.048601, -8.065467',
          'Beach code PTCT7J',
          'Individual page checked and treated cautiously because season context did not clearly update to 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Vale de Lobo listed among 2026 Blue Flag awarded coastal beaches',
          'Concelho Loulé',
          'Coordinates 37.048601, -8.065467',
          'Loulé listed with 12 awarded locations in 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Vale do Lobo listed in Loulé',
          'Bathing-water code PTCT7J',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-vale-do-lobo-loule',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, beach-club, accommodation, experience and golf cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Vale do Lobo and the linked listings',
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
        to_jsonb('The individual ABAAE Vale de Lobo page checked on 19 May 2026 did not provide clear current 2026 display-season dates; 2026 Blue Flag status is therefore supported by the ABAAE 2026 awarded list.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text)
      union all
      select to_jsonb('The individual ABAAE Vale de Lobo page checked on 19 May 2026 did not provide clear current 2026 display-season dates; 2026 Blue Flag status is therefore supported by the ABAAE 2026 awarded list.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Resort-area beach below red and ochre cliffs in Loulé',
      'Long sandy shoreline merging with neighbouring beaches',
      'Outdoor parking, showers, surveillance, bar, restaurant and accessible-beach status listed by VisitPortugal',
      'Vale do Lobo 2026 bathing season verified from Diário da República',
      'Blue Flag status verified for 2026 via ABAAE awarded list',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists outdoor parking for Praia de Vale do Lobo. Exact parking capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia de Vale do Lobo as an accessible beach. Current adapted equipment, assistance, reserved parking availability and the best access point should still be confirmed locally before travelling.',
    'lifeguard_info', 'Diário da República lists Vale do Lobo as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. VisitPortugal also lists surveillance. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE awarded list. The individual ABAAE Vale de Lobo page checked on 19 May 2026 did not clearly provide current 2026 display-season dates, so exact Blue Flag display dates should be confirmed locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Vale do Lobo',
      'notes', 'Diário da República lists Vale do Lobo with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.048601%2C-8.065467',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Vale do Lobo with a 2026 bathing season from 1 June to 30 September.',
        'ABAAE lists Vale de Lobo among Loulé''s 2026 Blue Flag awarded locations.',
        'VisitPortugal lists outdoor parking, surveillance, showers, bar, restaurant and accessible-beach status.',
        'Exact parking capacity, payment rules, adapted equipment and daily lifeguard staffing were not independently verified.',
        'The beach is backed by cliffs; visitors should avoid cliff bases, cliff edges and informal cliff paths.',
        'Visitors should follow local flags, signage and lifeguard instructions.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Vale do Lobo?', 'answer', 'Praia de Vale do Lobo is beside the Vale do Lobo resort area near Almancil, in the municipality of Loulé on the central Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia de Vale do Lobo?', 'answer', 'VisitPortugal lists outdoor parking for Praia de Vale do Lobo. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia de Vale do Lobo accessible?', 'answer', 'VisitPortugal lists Praia de Vale do Lobo as an accessible beach. Current adapted equipment, assistance and the best access point should still be confirmed locally before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Vale do Lobo?', 'answer', 'Diário da República lists Vale do Lobo as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Vale do Lobo a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Vale de Lobo among the 2026 Blue Flag awarded beaches. The individual ABAAE page checked on 19 May 2026 did not clearly provide current 2026 display-season dates, so exact display dates should be confirmed locally.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Garrão, Praia do Ancão, Praia de Quarteira, Praia de Quinta do Lago, Praia de Vilamoura and Praia de Faro / Ilha de Faro.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Vale do Lobo?', 'answer', 'VisitPortugal lists bar and restaurant facilities for Praia de Vale do Lobo. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Vale do Lobo?', 'answer', 'June to September matches the official 2026 bathing season. May, June and September are usually more comfortable for beach walks, restaurants and photography.'),
      jsonb_build_object('question', 'What should visitors know about the cliffs at Vale do Lobo?', 'answer', 'VisitPortugal verifies the reddish cliff setting. Visitors should avoid cliff bases, cliff edges and informal cliff paths, and should follow any local safety signage.')
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
