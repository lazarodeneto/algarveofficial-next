begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Garrão",
    "type": "Nearby beach",
    "distance": "~1.3 km",
    "description": "Published AlgarveOfficial neighbouring Loulé beach listing west of Praia do Ancão by stored coordinates.",
    "href": "/listing/praia-do-garrao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Quinta do Lago",
    "type": "Nearby beach",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial Loulé beach listing east of Praia do Ancão by stored coordinates.",
    "href": "/listing/praia-de-quinta-do-lago-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vale do Lobo",
    "type": "Nearby beach",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of the Ancão and Garrão coastal area by stored coordinates.",
    "href": "/listing/praia-de-vale-do-lobo-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Faro / Ilha de Faro",
    "type": "Nearby beach",
    "distance": "~4.9 km",
    "description": "Published AlgarveOfficial Faro island-beach listing east of Ancão by stored coordinates.",
    "href": "/listing/praia-de-faro-ilha-de-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Quarteira",
    "type": "Nearby beach",
    "distance": "~7.0 km",
    "description": "Published AlgarveOfficial urban beach listing west of Praia do Ancão by stored coordinates.",
    "href": "/listing/praia-de-quarteira-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vilamoura",
    "type": "Nearby beach",
    "distance": "~8.1 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of the Ancão coastal area by stored coordinates.",
    "href": "/listing/praia-de-vilamoura-loule",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "The Bold Octopus",
    "type": "Restaurant",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial restaurant listing close to Praia do Ancão by stored coordinates.",
    "href": "/listing/the-bold-octopus-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Shack",
    "type": "Restaurant",
    "distance": "~1.2 km",
    "description": "Published AlgarveOfficial restaurant listing near the Ancão and Quinta do Lago area by stored coordinates.",
    "href": "/listing/the-shack-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Dunes Beach Bar & Restaurant",
    "type": "Restaurant",
    "distance": "~1.2 km",
    "description": "Published AlgarveOfficial restaurant listing near the Ancão and Garrão coast by stored coordinates.",
    "href": "/listing/dunes-beach-bar-restaurant-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "António Tá Certo - Almancil",
    "type": "Restaurant",
    "distance": "~1.2 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Ancão by stored coordinates.",
    "href": "/listing/antonio-ta-certo-almancil-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Casa do Lago",
    "type": "Restaurant",
    "distance": "~1.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Quinta do Lago and Praia do Ancão by stored coordinates.",
    "href": "/listing/casa-do-lago-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Izzy's Beach Restaurant",
    "type": "Restaurant",
    "distance": "~1.3 km",
    "description": "Published AlgarveOfficial restaurant listing near the Ancão and Garrão beach area by stored coordinates.",
    "href": "/listing/izzy-s-beach-restaurant-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Ancão Beach Club",
    "type": "Beach club",
    "distance": "~0.6 km",
    "description": "Published AlgarveOfficial beach-club listing near Praia do Ancão by stored coordinates.",
    "href": "/listing/ancao-beach-club-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Reserva Quinta do Lago",
    "type": "Beach club",
    "distance": "~1.4 km",
    "description": "Published AlgarveOfficial beach-club listing near the Quinta do Lago and Ancão area by stored coordinates.",
    "href": "/listing/reserva-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Campus",
    "type": "Sports and wellness",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial nearby leisure listing in the Quinta do Lago area by stored coordinates.",
    "href": "/listing/the-campus-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "San Lorenzo Golf Course",
    "type": "Golf",
    "distance": "~2.3 km",
    "description": "Published AlgarveOfficial golf listing near Quinta do Lago by stored coordinates.",
    "href": "/listing/san-lorenzo-golf-course",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb := $json$
[
  {
    "source_name": "VisitPortugal - Praia do Ancão",
    "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-anc%C3%A3o",
    "checked_at": "2026-05-19",
    "facts_verified": [
      "Beach name and location in Loulé",
      "Maritime beach classification",
      "Integration in the Ria Formosa Natural Park",
      "Large sandy beach surrounded by dunes and pines",
      "Beach support infrastructure context",
      "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach",
      "Access by car, motorcycle and on foot"
    ]
  },
  {
    "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
    "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
    "checked_at": "2026-05-19",
    "facts_verified": [
      "Ancão listed among 2026 Blue Flag coastal beach locations",
      "Municipality of Loulé",
      "Coordinates 37.033083, -8.039095",
      "Loulé listed with 12 awarded locations in 2026",
      "Nearby Loulé awarded locations include Garrão Poente, Garrão Nascente, Quinta do Lago, Vale de Lobo, Quarteira and Vilamoura"
    ]
  },
  {
    "source_name": "ABAAE Bandeira Azul - Ancão",
    "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/ancao/",
    "checked_at": "2026-05-19",
    "facts_verified": [
      "Official Ancão beach entry",
      "Coastal beach classification",
      "Municipality of Loulé",
      "Coordinates 37.033083, -8.039095",
      "Beach code PTCW2C",
      "Address at Vale do Ancão",
      "Individual page still showed 2025 bathing-season and Blue Flag-season dates at the time of review"
    ]
  },
  {
    "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
    "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
    "checked_at": "2026-05-19",
    "facts_verified": [
      "Ancão listed in Loulé for 2026",
      "Bathing-water code PTCW2C",
      "2026 bathing season from 1 June to 30 September"
    ]
  },
  {
    "source_name": "AlgarveOfficial internal published nearby listings",
    "source_url": "https://algarveofficial.com/listing/praia-do-ancao-loule",
    "checked_at": "2026-05-19",
    "facts_verified": [
      "Nearby beach, restaurant, beach-club, sports and golf cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026",
      "Approximate nearby distances calculated from stored coordinates for Praia do Ancão and the linked listings",
      "No external restaurant, attraction, business or competitor website links were added"
    ]
  }
]
$json$;
  v_notes jsonb := $json$
[
  "Blue Flag status is verified for 2026 from the ABAAE awarded list. The individual ABAAE Ancão page checked on 19 May 2026 still showed 2025 bathing-season and Blue Flag-season dates, so exact 2026 display dates should be checked locally.",
  "The official 2026 bathing season for Ancão is verified from Diário da República as 1 June to 30 September.",
  "VisitPortugal lists beach surveillance, parking, bar, restaurant, showers, water-sports activities and accessible-beach recognition; exact daily operation, capacity and practical support should be checked locally.",
  "Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.",
  "No external restaurant, attraction, business or competitor website links were added.",
  "No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no new image gallery items were added."
]
$json$;
  v_short_description text := 'Praia do Ancão is a dune-backed Loulé beach at the western edge of the Ria Formosa, close to Quinta do Lago, Garrão and Vale do Lobo. It has wide sand, pine and dune scenery, verified 2026 Blue Flag listing and official facilities, with seasonal support to confirm locally.';
  v_full_description text := $text$
Praia do Ancão is a wide sandy beach in the municipality of Loulé, in the Vale do Ancão / Almancil coastal area between Quinta do Lago, Garrão and Vale do Lobo. VisitPortugal describes it as integrated in the Ria Formosa Natural Park, with a large sandy beach surrounded by dunes and pines.

The setting combines resort-area access with a more natural coastal character than the urban beaches further west. Visitors can expect an open dune-backed shoreline, Ria Formosa context and practical beach services, while still needing to respect marked routes, dune protection and local safety signage.

Official tourism information lists Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurfing, sailing and accessible-beach recognition for Praia do Ancão. These services should be treated as seasonal or concession-dependent unless confirmed locally before travelling.

For 2026, Ancão is listed in the official ABAAE Blue Flag awarded list, and Diário da República lists the bathing season from 1 June to 30 September under bathing-water code PTCW2C. The individual ABAAE Ancão page checked on 19 May 2026 still showed 2025 season dates, so the page documents that conflict and avoids claiming exact 2026 Blue Flag display dates from the individual page.
$text$;
  v_best_time text := 'June to September aligns with the official 2026 bathing season for Ancão. May, June and September are practical months for beach walks and Ria Formosa scenery with less heat than mid-summer. In July and August, arrive earlier in the day if parking, serviced areas or restaurant access are important.';
  v_important_notes text := 'ABAAE lists Ancão among Loulé''s 2026 Blue Flag coastal beach locations.
The individual ABAAE Ancão page checked on 19 May 2026 still showed 2025 season dates, so exact 2026 Blue Flag display dates should be checked locally.
Diário da República lists Ancão, bathing-water code PTCW2C, with a 2026 bathing season from 1 June to 30 September.
VisitPortugal lists safety or surveillance, parking, bar, restaurant, showers, water-sports activities and accessible-beach recognition.
Parking is listed by VisitPortugal, but capacity, payment rules and current restrictions were not independently verified for this review.
Accessible-beach recognition is listed by VisitPortugal, but current adapted equipment, assisted bathing, mats and the best access point should be confirmed before visiting.
Praia do Ancão is in a sensitive dune and Ria Formosa setting; use marked access routes and avoid walking across protected dunes.
Sea and wind conditions can vary; follow local flags, signage and instructions from beach teams where present.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-do-ancao-loule'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-ancao-loule not found; skipping update.';
    return;
  end if;

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Dune-backed beach within the Ria Formosa Natural Park',
      'Large sandy beach close to Quinta do Lago, Garrão and Vale do Lobo',
      'Parking, showers, bar, restaurant and surveillance listed by VisitPortugal',
      'Accessible-beach recognition listed by VisitPortugal; current support should be confirmed',
      '2026 Blue Flag listing verified via ABAAE awarded list',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia do Ancão. Current capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'VisitPortugal lists Praia do Ancão as an accessible beach. Step-free beach access, adapted equipment, mats, accessible toilets and assisted bathing were not independently verified from current sources for this review, so visitors with reduced mobility should confirm conditions before travelling.',
    'lifeguard_info', 'VisitPortugal lists safety or surveillance for Praia do Ancão, and Diário da República lists Ancão as a 2026 bathing beach from 1 June to 30 September. Exact daily lifeguard staffing should still be checked locally through beach flags, signage and notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via the ABAAE awarded list. The individual ABAAE Ancão page checked on 19 May 2026 still showed 2025 season dates, so exact 2026 Blue Flag display dates should be confirmed locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Ancão',
      'bathing_water_code', 'PTCW2C',
      'notes', 'VisitPortugal lists safety or surveillance; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.033083%2C-8.039095',
    'coordinates', jsonb_build_object(
      'latitude', 37.033083,
      'longitude', -8.039095,
      'label', 'Praia do Ancão',
      'notes', 'Coordinates verified from ABAAE.',
      'verification_status', 'Verified from ABAAE',
      'bathing_areas', jsonb_build_array(
        jsonb_build_object(
          'name', 'Ancão',
          'latitude', 37.033083,
          'longitude', -8.039095,
          'type', 'Coastal beach',
          'verification_status', 'Verified from ABAAE'
        )
      )
    ),
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists Ancão among Loulé''s 2026 Blue Flag coastal beach locations.',
        'The individual ABAAE Ancão page checked on 19 May 2026 still showed 2025 season dates.',
        'Diário da República lists Ancão with a 2026 bathing season from 1 June to 30 September.',
        'VisitPortugal lists parking, safety or surveillance, bar, restaurant, showers, water sports and accessible-beach recognition.',
        'Parking capacity, payment rules, practical accessibility support and exact daily lifeguard staffing were not independently verified.',
        'Use marked access routes and avoid protected dunes and wetland habitats.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia do Ancão?', 'answer', 'Praia do Ancão is in the municipality of Loulé, in the Vale do Ancão / Almancil coastal area between Quinta do Lago, Garrão and Vale do Lobo.'),
      jsonb_build_object('question', 'Is there parking at Praia do Ancão?', 'answer', 'VisitPortugal lists parking for Praia do Ancão. Current capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia do Ancão accessible?', 'answer', 'VisitPortugal lists Praia do Ancão as an accessible beach. Practical details such as step-free access, mats, adapted equipment and assisted bathing should be confirmed locally before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia do Ancão?', 'answer', 'VisitPortugal lists safety or surveillance, and Diário da República lists Ancão as a 2026 bathing beach from 1 June to 30 September. Exact daily lifeguard staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia do Ancão a Blue Flag beach?', 'answer', 'Yes. Ancão is listed in the official ABAAE 2026 Blue Flag awarded list. The individual ABAAE Ancão page checked on 19 May 2026 still showed 2025 season dates, so exact 2026 display dates should be confirmed locally.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Garrão, Praia de Quinta do Lago, Praia de Vale do Lobo, Praia de Faro / Ilha de Faro, Praia de Quarteira and Praia de Vilamoura.'),
      jsonb_build_object('question', 'Are there restaurants near Praia do Ancão?', 'answer', 'Published AlgarveOfficial restaurant listings near Praia do Ancão include The Bold Octopus, The Shack, Dunes Beach Bar & Restaurant, António Tá Certo - Almancil, Casa do Lago and Izzy''s Beach Restaurant, based on stored listing coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia do Ancão?', 'answer', 'June to September aligns with the official 2026 bathing season. May, June and September are practical for walks and Ria Formosa scenery, while July and August are better approached with earlier arrival if parking and serviced areas matter.')
    ),
    'sources_used', v_sources,
    'verification_notes', v_notes,
    'last_verified_at', '2026-05-19'
  );

  update public.listings
     set short_description = v_short_description,
         description = v_full_description,
         website_url = null,
         latitude = 37.033083,
         longitude = -8.039095,
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
