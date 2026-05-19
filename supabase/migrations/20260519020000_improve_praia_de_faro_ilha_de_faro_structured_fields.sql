begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia de Quinta do Lago",
    "type": "Nearby beach",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing west of Praia de Faro by stored coordinates.",
    "href": "/listing/praia-de-quinta-do-lago-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Ancão",
    "type": "Nearby beach",
    "distance": "~4.9 km",
    "description": "Published AlgarveOfficial beach listing west of Praia de Faro by stored coordinates.",
    "href": "/listing/praia-do-ancao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Garrão",
    "type": "Nearby beach",
    "distance": "~6.3 km",
    "description": "Published AlgarveOfficial Golden Triangle beach listing west of Praia de Faro by stored coordinates.",
    "href": "/listing/praia-do-garrao-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Vale do Lobo",
    "type": "Nearby beach",
    "distance": "~7.9 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of Praia de Faro by stored coordinates.",
    "href": "/listing/praia-de-vale-do-lobo-loule",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Ilha Deserta / Barreta",
    "type": "Nearby beach",
    "distance": "~11.7 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing east of Praia de Faro by stored coordinates.",
    "href": "/listing/praia-da-ilha-deserta-barreta-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Culatra",
    "type": "Nearby beach",
    "distance": "~13.6 km",
    "description": "Published AlgarveOfficial Faro island beach listing east of Praia de Faro by stored coordinates.",
    "href": "/listing/praia-da-culatra-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Casa Velha",
    "type": "Restaurant",
    "distance": "~3.8 km",
    "description": "Closest published AlgarveOfficial restaurant listing by stored coordinates; not verified as being on Praia de Faro.",
    "href": "/listing/restaurante-casa-velha-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "2 Passos",
    "type": "Restaurant",
    "distance": "~4.0 km",
    "description": "Published AlgarveOfficial restaurant listing near the Ria Formosa coast by stored coordinates.",
    "href": "/listing/2-passos-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Umami",
    "type": "Restaurant",
    "distance": "~4.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Faro by stored coordinates; not verified as beachside.",
    "href": "/listing/umami-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Casa do Lago",
    "type": "Restaurant",
    "distance": "~4.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Quinta do Lago by stored coordinates.",
    "href": "/listing/casa-do-lago-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "The Shack",
    "type": "Restaurant",
    "distance": "~4.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Quinta do Lago by stored coordinates.",
    "href": "/listing/the-shack-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Yes Car Hire",
    "type": "Nearby business",
    "distance": "~2.6 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Faro by stored coordinates.",
    "href": "/listing/yes-car-hire-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "San Lorenzo Golf Course",
    "type": "Golf",
    "distance": "~2.8 km",
    "description": "Published AlgarveOfficial golf listing near Praia de Faro by stored coordinates.",
    "href": "/listing/san-lorenzo-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "EPI",
    "type": "Nearby business",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Faro by stored coordinates.",
    "href": "/listing/epi-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Seven's Car Rental",
    "type": "Nearby business",
    "distance": "~3.3 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Faro by stored coordinates.",
    "href": "/listing/seven-s-car-rental-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Faro Airport Transfers",
    "type": "Nearby business",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Faro by stored coordinates.",
    "href": "/listing/faro-airport-transfers-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Hotel Quinta do Lago",
    "type": "Accommodation",
    "distance": "~3.7 km",
    "description": "Published AlgarveOfficial accommodation listing near the Ria Formosa coast by stored coordinates.",
    "href": "/listing/hotel-quinta-do-lago-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Faro, often called Ilha de Faro, is Faro city''s road-access beach on the Ria Formosa barrier coast. It combines a long Atlantic-facing sandy shore, lagoon scenery, seasonal beach services and verified 2026 Blue Flag status for Faro-Mar.';
  v_full_description text := $text$
Praia de Faro is the main beach associated with Faro city, set on the barrier sand formation commonly known as Ilha de Faro and officially listed as Faro-Mar for bathing and Blue Flag purposes. VisitPortugal describes Ilha de Faro as the first barrier island when arriving from the west, separating the Atlantic from the Ria Formosa estuary and marking the beginning of the Natural Park.

The beach has a different character from the cliff coves of the western Algarve. It is long, flat and sandy, with the ocean on one side and the lagoon environment behind it. Around the central access area there is an inhabited, urban-island feel, while the broader setting remains tied to the Ria Formosa's dunes, channels and wetland habitats.

Access is one of its practical advantages. VisitPortugal verifies car access over a narrow bridge connecting the beach with the main road to Faro, and the Faro accessible itinerary states that Praia de Faro-Mar can be reached by road or boat. This convenience means visitors should plan carefully in summer, especially around the bridge and central serviced sections.

Official sources list strong seasonal support. VisitPortugal lists Blue Flag, surveillance, sunshade rental, small craft hire, showers, bar, restaurant, windsurfing, sailing and accessible-beach status. ABAAE verifies Faro-Mar as a 2026 Blue Flag awarded beach, with the bathing season from 1 June to 30 September and the Blue Flag season from 19 June to 30 September. Parking details were not fully verified from authoritative current sources for this review, so visitors should confirm access and parking conditions before travelling by car.
$text$;
  v_best_time text := 'June to September matches the verified 2026 Faro-Mar bathing season. The Blue Flag display season verified by ABAAE runs from 19 June to 30 September 2026. May, June and September are often more comfortable for longer shoreline walks and Ria Formosa views, while summer mornings are usually the most practical time to approach the bridge and central beach area.';
  v_important_notes text := 'ABAAE lists Faro-Mar as a 2026 Blue Flag awarded coastal beach in Faro.
ABAAE lists the 2026 Faro-Mar bathing season from 1 June 2026 to 30 September 2026.
ABAAE lists the 2026 Blue Flag season for Faro-Mar from 19 June 2026 to 30 September 2026.
Diário da República lists Faro-Mar in Faro with bathing-water code PTCP9U and a 2026 season from 1 June to 30 September.
VisitPortugal lists surveillance, sunshade rental, small craft hire, showers, bar, restaurant, windsurfing, sailing and accessible-beach status.
VisitPortugal verifies access by car over a narrow bridge, while its Faro accessible itinerary states that Praia de Faro-Mar is accessible by road or boat and has amphibious wheelchairs.
Parking availability, capacity and payment rules were not fully verified from official current sources for this review.
The beach is part of the Ria Formosa protected coastal environment; visitors should use marked access and avoid disturbing dunes or lagoon habitats.
Facilities, surveillance, concession services and adapted equipment may vary by season and beach section.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-faro-ilha-de-faro'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-faro-ilha-de-faro not found; skipping update.';
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
        'VisitPortugal - Praia da Ilha de Faro',
        'VisitPortugal - Faro Accessible Itinerary',
        'ABAAE Bandeira Azul - Faro-Mar',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia da Ilha de Faro',
        'source_url', 'https://www.visitportugal.com/en/NR/exeres/26820022-6305-4A53-B7F8-C691184A60B1',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and maritime beach classification',
          'Ria Formosa - Faro location',
          'Barrier island separating the Atlantic from the Ria Formosa estuary',
          'Natural Park context',
          'Car access over a narrow bridge connecting with the main road to Faro',
          'Proximity to Faro Airport',
          'Large sandy beach and support infrastructure',
          'Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, bar, restaurant, windsurfing, sailing and accessible beach'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Faro Accessible Itinerary',
        'source_url', 'https://www.visitportugal.com/en/destinos/algarve/315833',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Praia de Faro-Mar accessible by car or boat',
          'Accessible Beach status',
          'Amphibious wheelchairs enabling access to the water',
          'Faro city and Ria Formosa accessible-tour context'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Faro-Mar',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/faro-mar/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Faro-Mar Blue Flag entry',
          'Municipality of Faro',
          'Coordinates 37.006974, -7.99399',
          'Beach code PTCP9U',
          'Address at Av. Nascente, Praia de Faro',
          '2026 bathing season from 1 June to 30 September',
          '2026 Blue Flag season from 19 June to 30 September'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Faro listed with four awarded 2026 locations',
          'Faro-Mar listed among Faro 2026 Blue Flag awarded coastal beaches',
          'Barreta, Culatra-Mar and Ilha do Farol-Mar also listed among Faro 2026 awarded locations'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Faro-Mar listed in Faro',
          'Bathing-water code PTCP9U',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-faro-ilha-de-faro',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, transport, golf and accommodation cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Faro / Ilha de Faro and the linked listings',
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
        to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text),
        to_jsonb('The closest published internal restaurant listings are not verified as being on Praia de Faro; distance labels and descriptions make this limitation explicit.'::text),
        to_jsonb('Parking availability, capacity and payment rules were not fully verified from official current sources for this review.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant listings are not verified as being on Praia de Faro; distance labels and descriptions make this limitation explicit.'::text)
      union all
      select to_jsonb('Parking availability, capacity and payment rules were not fully verified from official current sources for this review.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Road-access beach for Faro city on the Ria Formosa barrier coast',
      'Long sandy shore between the Atlantic and lagoon environment',
      'Access by car over a narrow bridge verified by VisitPortugal',
      'VisitPortugal lists surveillance, showers, bar, restaurant, windsurfing, sailing and accessible-beach status',
      'Accessible Beach status and amphibious wheelchairs referenced by VisitPortugal',
      'Faro-Mar Blue Flag status verified for 2026 via ABAAE'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'Parking availability, capacity and payment rules were not fully verified from official current sources for this review. VisitPortugal verifies access by car over a narrow bridge to Praia de Faro, so visitors driving in summer should confirm current parking and traffic arrangements before travelling.',
    'accessibility_info', 'VisitPortugal lists Praia da Ilha de Faro as an accessible beach. Its Faro accessible itinerary states that Praia de Faro-Mar is accessible by car or boat and has amphibious wheelchairs enabling access to the water. Current seasonal support, adapted equipment availability and the best entrance should still be confirmed locally before travelling.',
    'lifeguard_info', 'Diário da República lists Faro-Mar as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. ABAAE lists the same 2026 bathing season for Faro-Mar. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE. The official Faro-Mar page lists the 2026 bathing season from 1 June to 30 September and the 2026 Blue Flag season from 19 June to 30 September.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Faro-Mar',
      'notes', 'Diário da República and ABAAE list Faro-Mar with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.006974%2C-7.99399',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists Faro-Mar as a 2026 Blue Flag awarded coastal beach in Faro.',
        'The official 2026 Faro-Mar bathing season is 1 June to 30 September.',
        'The official 2026 Blue Flag season for Faro-Mar is 19 June to 30 September.',
        'VisitPortugal verifies car access over a narrow bridge and lists accessible-beach status.',
        'Parking availability, capacity and payment rules were not fully verified from official current sources.',
        'Praia de Faro is part of the Ria Formosa protected coastal environment; visitors should use marked access and protect dunes and lagoon habitats.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Faro / Ilha de Faro?', 'answer', 'Praia de Faro, often called Ilha de Faro, is in the municipality of Faro on the Ria Formosa barrier coast. The official bathing-water and Blue Flag listing is Faro-Mar.'),
      jsonb_build_object('question', 'How do you reach Praia de Faro?', 'answer', 'VisitPortugal states that Praia da Ilha de Faro is accessible by car over a narrow bridge connecting with the main road to Faro. Its accessible itinerary also states that Praia de Faro-Mar is accessible by road or boat.'),
      jsonb_build_object('question', 'Is there parking at Praia de Faro?', 'answer', 'Parking availability, capacity and payment rules were not fully verified from official current sources for this review. If travelling by car, confirm current parking and bridge-access conditions locally.'),
      jsonb_build_object('question', 'Is Praia de Faro accessible?', 'answer', 'VisitPortugal lists Praia da Ilha de Faro as an accessible beach and states that Praia de Faro-Mar has amphibious wheelchairs. Current seasonal support and the best entrance should still be confirmed before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Faro?', 'answer', 'Diário da República lists Faro-Mar as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Faro a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Faro-Mar as a 2026 Blue Flag awarded beach, with a Blue Flag season from 19 June to 30 September 2026.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia de Quinta do Lago, Praia do Ancão, Praia do Garrão, Praia de Vale do Lobo, Praia da Ilha Deserta / Barreta and Praia da Culatra.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Faro?', 'answer', 'VisitPortugal lists bar and restaurant facilities for Praia da Ilha de Faro. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Faro?', 'answer', 'June to September matches the verified 2026 bathing season. The verified 2026 Blue Flag season runs from 19 June to 30 September, while May, June and September are useful for shoreline walks and Ria Formosa views.')
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
