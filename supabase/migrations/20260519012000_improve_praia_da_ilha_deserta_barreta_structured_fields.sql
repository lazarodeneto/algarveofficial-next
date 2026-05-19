begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Culatra",
    "type": "Nearby beach",
    "distance": "~3.4 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing east of Barreta by stored coordinates.",
    "href": "/listing/praia-da-culatra-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Armona",
    "type": "Nearby beach",
    "distance": "~8.5 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing east of Barreta by stored coordinates.",
    "href": "/listing/praia-da-armona-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Faro / Ilha de Faro",
    "type": "Nearby beach",
    "distance": "~11.7 km",
    "description": "Published AlgarveOfficial Faro barrier-island beach listing west of Barreta by stored coordinates.",
    "href": "/listing/praia-de-faro-ilha-de-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Fuseta",
    "type": "Nearby beach",
    "distance": "~14.3 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing east of Barreta by stored coordinates.",
    "href": "/listing/praia-da-fuseta-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Quinta do Lago",
    "type": "Nearby beach",
    "distance": "~15.1 km",
    "description": "Published AlgarveOfficial Loulé beach listing west of Barreta by stored coordinates.",
    "href": "/listing/praia-de-quinta-do-lago-loule",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Alameda",
    "type": "Restaurant",
    "distance": "~7.4 km",
    "description": "Published AlgarveOfficial mainland Faro-area restaurant listing by stored coordinates. Barreta itself remains boat-access.",
    "href": "/listing/restaurante-alameda-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Checkin Faro by Leonel Pereira",
    "type": "Restaurant",
    "distance": "~7.5 km",
    "description": "Published AlgarveOfficial mainland Faro-area restaurant listing by stored coordinates. Barreta itself remains boat-access.",
    "href": "/listing/checkin-faro-by-leonel-pereira-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alameda",
    "type": "Restaurant",
    "distance": "~7.6 km",
    "description": "Published AlgarveOfficial mainland Faro-area restaurant listing by stored coordinates. Barreta itself remains boat-access.",
    "href": "/listing/alameda-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "CHECKin by Leonel Pereira",
    "type": "Restaurant",
    "distance": "~7.8 km",
    "description": "Published AlgarveOfficial mainland Faro-area restaurant listing by stored coordinates. Barreta itself remains boat-access.",
    "href": "/listing/checkin-by-leonel-pereira-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Parque Natural da Ria Formosa",
    "type": "Family attraction",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial listing for the protected lagoon system that forms Barreta's wider natural setting.",
    "href": "/listing/parque-natural-da-ria-formosa-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Get Your Ticket - Algarve Tours and Experiences",
    "type": "Experience",
    "distance": "~6.7 km",
    "description": "Published AlgarveOfficial experience listing near Faro by stored coordinates.",
    "href": "/listing/get-your-ticket-algarve-tours-and-experiences-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Ecomarine Algarve",
    "type": "Transportation",
    "distance": "~7.6 km",
    "description": "Published AlgarveOfficial transportation listing near Faro by stored coordinates.",
    "href": "/listing/ecomarine-algarve-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Islands 4 You",
    "type": "Experience",
    "distance": "~7.9 km",
    "description": "Published AlgarveOfficial Ria Formosa experience listing by stored coordinates.",
    "href": "/listing/islands-4-you-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Boat for a Day - Boat Tours Ria Formosa Faro - Olhão Algarve Portugal",
    "type": "Experience",
    "distance": "~8.1 km",
    "description": "Published AlgarveOfficial Ria Formosa boat-experience listing by stored coordinates.",
    "href": "/listing/boat-for-a-day-boat-tours-ria-formosa-faro-olhao-algarve-portugal-quinta-do-lago",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'ABAAE lists Barreta among Faro''s 2026 Blue Flag awarded locations.
Diário da República lists the 2026 bathing season for Barreta as 1 June to 30 September.
VisitPortugal states that Ilha da Barreta / Ilha Deserta is accessible only by boat from Faro, with a crossing of about 20 minutes and seasonal access during June to September.
VisitPortugal lists beach support services including surveillance, sunshade rental, small craft hire, showers, bar, restaurant, windsurfing and sailing.
Vehicle access and island parking are not available for the beach itself; parking at mainland departure points was not independently verified in this review.
Accessible-beach support was not verified from authoritative current sources.
The beach is within the Ria Formosa Natural Park; visitors should use marked paths and avoid damaging dunes, saltmarsh or wildlife habitat.
Facilities, boat services and beach support should be treated as seasonal and checked before travelling.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-ilha-deserta-barreta-faro'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-ilha-deserta-barreta-faro not found; skipping update.';
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
        'ABAAE Bandeira Azul - Barreta',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Barreta listed in Faro with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies beaches of bathing where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Barreta',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/barreta/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Official Barreta Blue Flag entry',
          'Municipality of Faro',
          'Coordinates 36.96577, -7.87291',
          'Beach shown as not yet hoisted at time checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Barreta listed among Faro 2026 Blue Flag awarded coastal beaches',
          'Faro listed with four awarded locations in 2026: Barreta, Culatra-Mar, Faro-Mar and Ilha do Farol-Mar'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-ilha-deserta-barreta-faro',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Ilha Deserta / Barreta and the linked listings',
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
        to_jsonb('Restaurant and business cards use published internal mainland Faro-area listings by stored coordinates; Praia da Ilha Deserta / Barreta itself remains boat-access, so visitors should still plan around boat logistics.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('Restaurant and business cards use published internal mainland Faro-area listings by stored coordinates; Praia da Ilha Deserta / Barreta itself remains boat-access, so visitors should still plan around boat logistics.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', 'Praia da Ilha Deserta / Barreta is a boat-access barrier-island beach in Faro, set within the Ria Formosa Natural Park. It is known for broad sand, dunes, lagoon scenery and the Cabo de Santa Maria area, with practical planning needed around boat times and seasonal services.',
    'full_description', 'Praia da Ilha Deserta / Barreta is a barrier-island beach in the municipality of Faro, within the Ria Formosa Natural Park. VisitPortugal identifies Ilha da Barreta, also called Ilha Deserta, as one of the islands separating the marshland and lagoon from the sea, with access only by boat from Faro and a crossing of around 20 minutes.\n\nThe beach experience is defined by distance from the mainland rather than resort infrastructure. The Atlantic-facing sand is broad and open, while the Ria Formosa side brings lagoon channels, saltmarsh scenery and birdlife context. Official tourism information says there are no constructions beyond beach-support infrastructure, so visitors should expect a simple island setting with seasonal services rather than an urban beach.\n\nPraia da Ilha Deserta / Barreta suits visitors who want a quieter Ria Formosa beach day, long walks, photography and a boat-access coastline close to Faro. The island is also associated with Cabo de Santa Maria, the southernmost point of mainland Portugal, and with protected dune and saltmarsh habitats.\n\nPlanning matters here. Boat times, return schedules, wind, heat and tide conditions can shape the visit. Diário da República lists Barreta as a 2026 bathing beach from 1 June to 30 September, and ABAAE lists Barreta among Faro''s 2026 Blue Flag awarded locations. Facilities and beach support should still be treated as seasonal, and visitors should follow local flags, signage and protected-area guidance.',
    'highlights', jsonb_build_array(
      'Boat-access barrier-island beach in Faro',
      'Located within the Ria Formosa Natural Park',
      'VisitPortugal describes the Faro crossing as around 20 minutes',
      'Broad Atlantic-facing sand with lagoon and dune scenery nearby',
      'Associated with Cabo de Santa Maria on Ilha da Barreta',
      'Listed among Faro''s 2026 Blue Flag awarded beaches by ABAAE'
    ),
    'best_time_to_visit', 'June to September aligns with VisitPortugal''s stated seasonal boat access and the official 2026 bathing season for Barreta. In summer, plan around heat, wind and the last return boat. Outside the main season, verify boat availability and beach support before travelling.',
    'parking_info', 'There is no vehicle access or parking on Praia da Ilha Deserta / Barreta itself because the beach is reached by boat from Faro. Parking at mainland departure points was not independently verified in this review, so visitors should check current Faro parking options before travelling.',
    'accessibility_info', 'Accessible-beach support was not verified from authoritative current sources. Because access requires a boat crossing and movement on a sandy barrier island, visitors with reduced mobility should confirm boarding arrangements, walking routes, beach access and any seasonal assistance before travelling.',
    'lifeguard_info', 'Diário da República lists Barreta as a 2026 bathing beach from 1 June to 30 September, and the portaria identifies bathing beaches where assistance to bathers is assured during the respective season. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE''s awarded list for Barreta. The individual ABAAE Barreta page showed the flag as not yet hoisted at the time checked on 18 May 2026; exact display conditions should be checked locally during the season.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'Diário da República lists Barreta as a 2026 bathing beach; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=36.96577%2C-7.87291',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'June to September aligns with VisitPortugal''s stated seasonal boat access and the official 2026 bathing season for Barreta. In summer, plan around heat, wind and the last return boat. Outside the main season, verify boat availability and beach support before travelling.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists Barreta among Faro''s 2026 Blue Flag awarded locations.',
        'Diário da República lists the 2026 bathing season for Barreta as 1 June to 30 September.',
        'Access depends on boat services from Faro; visitors should confirm departure times and last return before travelling.',
        'Parking at mainland departure points was not independently verified in this review.',
        'Accessible-beach support was not verified from authoritative current sources.',
        'The island is part of the Ria Formosa Natural Park, so visitors should use marked paths and avoid disturbing dunes, saltmarsh and birdlife.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Ilha Deserta / Barreta?', 'answer', 'Praia da Ilha Deserta / Barreta is on Ilha da Barreta in the municipality of Faro, within the Ria Formosa Natural Park.'),
      jsonb_build_object('question', 'How do you get to Praia da Ilha Deserta / Barreta?', 'answer', 'VisitPortugal states that the beach is accessible only by boat from Faro, with a crossing of around 20 minutes. Current schedules and return times should be confirmed before travelling.'),
      jsonb_build_object('question', 'Is there parking at Praia da Ilha Deserta / Barreta?', 'answer', 'There is no vehicle access or parking on the island beach itself. Parking at mainland departure points was not independently verified for this review.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Ilha Deserta / Barreta?', 'answer', 'Diário da República lists Barreta as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Ilha Deserta / Barreta a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Barreta among Faro''s 2026 Blue Flag awarded coastal beaches. Local flag display should still be checked during the season.'),
      jsonb_build_object('question', 'Is Praia da Ilha Deserta / Barreta accessible?', 'answer', 'Accessible-beach support was not verified. Because access requires a boat crossing and movement on sand, visitors with reduced mobility should confirm current arrangements before travelling.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Ilha Deserta / Barreta?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Culatra, Praia da Armona, Praia de Faro / Ilha de Faro, Praia da Fuseta and Praia de Quinta do Lago.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Ilha Deserta / Barreta?', 'answer', 'VisitPortugal lists a bar and restaurant among the beach-support services. Nearby restaurant cards on AlgarveOfficial link only to published internal mainland Faro-area listings.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Ilha Deserta / Barreta?', 'answer', 'June to September aligns with VisitPortugal''s stated seasonal boat access and the official 2026 bathing season. Outside the main season, verify boat availability and beach support before travelling.')
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
