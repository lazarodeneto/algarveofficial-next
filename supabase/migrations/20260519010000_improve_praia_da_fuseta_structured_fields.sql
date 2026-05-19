begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Armona",
    "type": "Nearby beach",
    "distance": "~5.8 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing west of Fuseta by stored coordinates.",
    "href": "/listing/praia-da-armona-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Barril",
    "type": "Nearby beach",
    "distance": "~8.8 km",
    "description": "Published AlgarveOfficial Tavira barrier-island beach listing east of Fuseta by stored coordinates.",
    "href": "/listing/praia-do-barril-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Culatra",
    "type": "Nearby beach",
    "distance": "~10.8 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing west of Fuseta by stored coordinates.",
    "href": "/listing/praia-da-culatra-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Ilha de Tavira",
    "type": "Nearby beach",
    "distance": "~13.4 km",
    "description": "Published AlgarveOfficial Tavira island beach listing east of Fuseta by stored coordinates.",
    "href": "/listing/praia-da-ilha-de-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Ilha Deserta / Barreta",
    "type": "Nearby beach",
    "distance": "~14.3 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing west of Fuseta by stored coordinates.",
    "href": "/listing/praia-da-ilha-deserta-barreta-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "A Ver Tavira",
    "type": "Restaurant",
    "distance": "~12.4 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. It is not verified as beach-front or in Fuseta itself.",
    "href": "/listing/a-ver-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "À Mesa",
    "type": "Restaurant",
    "distance": "~12.5 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. It is not verified as beach-front or in Fuseta itself.",
    "href": "/listing/a-mesa-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Noélia",
    "type": "Restaurant",
    "distance": "~16.4 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. It is not verified as beach-front or in Fuseta itself.",
    "href": "/listing/noelia-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante Alameda",
    "type": "Restaurant",
    "distance": "~16.6 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. It is not verified as beach-front or in Fuseta itself.",
    "href": "/listing/restaurante-alameda-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alameda",
    "type": "Restaurant",
    "distance": "~16.8 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. It is not verified as beach-front or in Fuseta itself.",
    "href": "/listing/alameda-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Perfect Travel Algarve",
    "type": "Transportation",
    "distance": "~7.8 km",
    "description": "Published AlgarveOfficial transportation business listing near Fuseta by stored coordinates.",
    "href": "/listing/perfect-travel-algarve-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Tudo Bem - Loja de Cristais",
    "type": "Shopping",
    "distance": "~8.6 km",
    "description": "Published AlgarveOfficial shopping listing near Fuseta by stored coordinates.",
    "href": "/listing/tudo-bem-loja-de-cristais-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Get Your Ticket - Algarve Tours and Experiences",
    "type": "Experience",
    "distance": "~9.5 km",
    "description": "Published AlgarveOfficial experience listing near Fuseta by stored coordinates.",
    "href": "/listing/get-your-ticket-algarve-tours-and-experiences-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Parque Natural da Ria Formosa",
    "type": "Family attraction",
    "distance": "~16.7 km",
    "description": "Published AlgarveOfficial listing for the protected lagoon system that forms Fuseta's wider natural setting.",
    "href": "/listing/parque-natural-da-ria-formosa-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Islands 4 You",
    "type": "Experience",
    "distance": "~17.2 km",
    "description": "Published AlgarveOfficial Ria Formosa experience listing by stored coordinates.",
    "href": "/listing/islands-4-you-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Boat for a Day - Boat Tours Ria Formosa Faro - Olhão Algarve Portugal",
    "type": "Experience",
    "distance": "~17.5 km",
    "description": "Published AlgarveOfficial Ria Formosa boat-experience listing by stored coordinates.",
    "href": "/listing/boat-for-a-day-boat-tours-ria-formosa-faro-olhao-algarve-portugal-quinta-do-lago",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'ABAAE lists Fuseta-Mar and Fuseta-Ria among Olhão''s 2026 Blue Flag awarded locations.
Diário da República lists the 2026 bathing season for Fuseta-Mar and Fuseta-Ria as 1 June to 30 September.
ABAAE''s Fuseta-Mar page lists the 2026 Blue Flag season as 1 June to 30 September.
At the time of this review, the ABAAE Fuseta-Ria individual page still showed older 2025 season text, so exact 2026 Blue Flag display dates for Fuseta-Ria should be checked locally.
Fuseta-Mar requires boat access; ferry and boat schedules should be checked before travelling.
Currents near the bar can be strong, according to local official beach information; visitors should follow local safety guidance.
The Ria Formosa is a protected natural environment. Visitors should use marked paths, avoid trampling dunes and avoid disturbing saltmarsh, shellfish areas or wildlife.
Facilities and beach support may vary between Fuseta-Ria and Fuseta-Mar and may be seasonal.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-fuseta-olhao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-fuseta-olhao not found; skipping update.';
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
        'ABAAE Bandeira Azul - Fuseta-Mar',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Fuseta-Mar listed in Olhão with 2026 bathing season from 1 June to 30 September',
          'Fuseta-Ria listed in Olhão with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies beaches of bathing where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Fuseta-Mar',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/fuseta-mar/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Fuseta-Mar official Blue Flag entry',
          'Municipality of Olhão',
          'Coordinates 37.043365, -7.745023',
          'Beach code PTCD3W',
          '2026 bathing season from 1 June to 30 September',
          '2026 Blue Flag season from 1 June to 30 September'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Fuseta-Mar listed among Olhão 2026 Blue Flag awarded coastal beaches',
          'Fuseta-Ria listed among Olhão 2026 Blue Flag awarded coastal beaches',
          'Olhão listed with five awarded locations in 2026 including Armona-Mar, Armona-Ria, Fuseta-Mar, Fuseta-Ria and Marina de Olhão'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-fuseta-olhao',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Fuseta and the linked listings',
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
        to_jsonb('ABAAE verifies both Fuseta-Mar and Fuseta-Ria with 2026 bathing seasons and Blue Flag seasons from 1 June 2026 to 30 September 2026.'::text),
        to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text),
        to_jsonb('No internally published restaurant listing in Fuseta village itself was verified during this update; restaurant cards use the nearest published internal AlgarveOfficial restaurant listings by stored coordinates.'::text),
        to_jsonb('ABAAE source conflict noted on 18 May 2026: the Fuseta-Ria individual page still showed 2025 season dates, while the ABAAE 2026 awarded list verifies Fuseta-Ria as a 2026 Blue Flag location and Diário da República verifies the 2026 bathing season. The public text therefore treats Fuseta-Ria Blue Flag status as verified for 2026 but keeps exact display dates cautious.'::text)
      )
      union all
      select to_jsonb('ABAAE verifies Fuseta-Mar with 2026 bathing and Blue Flag seasons from 1 June 2026 to 30 September 2026. Fuseta-Ria Blue Flag status is verified from the 2026 awarded list, while its exact 2026 Blue Flag display dates should be checked locally because the individual page still showed older 2025 season text during review.'::text)
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('No internally published restaurant listing in Fuseta village itself was verified during this update; restaurant cards use the nearest published internal AlgarveOfficial restaurant listings by stored coordinates.'::text)
      union all
      select to_jsonb('ABAAE source conflict noted on 18 May 2026: the Fuseta-Ria individual page still showed 2025 season dates, while the ABAAE 2026 awarded list verifies Fuseta-Ria as a 2026 Blue Flag location and Diário da República verifies the 2026 bathing season. The public text therefore treats Fuseta-Ria Blue Flag status as verified for 2026 but keeps exact display dates cautious.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'parking_info', 'Fuseta-Ria has village-side access and official Blue Flag profile information lists roads, parking, pedestrian routes and cycle paths around the bathing area. Porto Recreio de Olhão also describes broad, organised parking near Fuseta quay, except on market days. Fuseta-Mar is reached by boat, so there is no vehicle access to the island sand; current parking capacity and any payment rules should be checked locally.',
    'accessibility_info', 'VisitPortugal lists Praia da Ilha da Fuzeta as an accessible beach, and accessible-beach information is strongest for Fuseta-Ria, where official and regional sources reference accessible support. Fuseta-Mar depends on boat access and island/beach conditions, so visitors with reduced mobility should confirm boarding, ramps, adapted equipment and seasonal assistance before travelling.',
    'lifeguard_info', 'Diário da República lists both Fuseta-Mar and Fuseta-Ria as 2026 bathing beaches from 1 June to 30 September, and VisitPortugal lists safety or surveillance for Praia da Ilha da Fuzeta. Exact daily lifeguard staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE for Fuseta-Mar and Fuseta-Ria. ABAAE lists Fuseta-Mar with a 2026 Blue Flag season from 1 June to 30 September; the Fuseta-Ria individual page still showed older 2025 season text at review, so exact 2026 display dates for Fuseta-Ria should be checked locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'Diário da República lists Fuseta-Mar and Fuseta-Ria as 2026 bathing beaches; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.043365%2C-7.745023',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'June to September for the official bathing season and full summer beach support. May, June and September are usually more comfortable for walking, photography and Ria Formosa visits with less peak-summer pressure.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'ABAAE lists Fuseta-Mar and Fuseta-Ria among Olhão''s 2026 Blue Flag awarded locations.',
        'Diário da República lists the 2026 bathing season for Fuseta-Mar and Fuseta-Ria as 1 June to 30 September.',
        'ABAAE''s Fuseta-Mar page lists the 2026 Blue Flag season as 1 June to 30 September.',
        'At review, the ABAAE Fuseta-Ria individual page still showed older 2025 season text, so exact 2026 Blue Flag display dates for Fuseta-Ria should be checked locally.',
        'Fuseta-Mar requires boat access; ferry and boat schedules should be checked before travelling.',
        'Currents near the bar can be strong, according to local official beach information; visitors should follow local safety guidance.',
        'The Ria Formosa is a protected natural environment. Visitors should use marked paths, avoid trampling dunes and avoid disturbing saltmarsh, shellfish areas or wildlife.',
        'Facilities and beach support may vary between Fuseta-Ria and Fuseta-Mar and may be seasonal.'
      )
    ),
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Fuseta?', 'answer', 'Praia da Fuseta is in the municipality of Olhão, within the Ria Formosa setting. The listing covers Fuseta-Mar on Ilha da Armona and Fuseta-Ria beside the village waterfront.'),
      jsonb_build_object('question', 'How do you get to Praia da Fuseta?', 'answer', 'Fuseta-Mar is reached by boat from Fuseta or Olhão according to VisitPortugal. Fuseta-Ria is the village-side lagoon beach with road, pedestrian and cycle access around the bathing area.'),
      jsonb_build_object('question', 'Is there parking at Praia da Fuseta?', 'answer', 'Parking is verified around the Fuseta-Ria and Fuseta quay access area, with Porto Recreio de Olhão describing broad, organised parking near the quay except on market days. Fuseta-Mar itself has no vehicle access because it is reached by boat.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Fuseta?', 'answer', 'Diário da República lists Fuseta-Mar and Fuseta-Ria as 2026 bathing beaches from 1 June to 30 September, and VisitPortugal lists safety or surveillance. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Fuseta a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Fuseta-Mar and Fuseta-Ria as 2026 Blue Flag awarded locations. Exact Fuseta-Ria display dates should be checked locally because its individual ABAAE page still showed older season text during review.'),
      jsonb_build_object('question', 'Is Praia da Fuseta accessible?', 'answer', 'VisitPortugal lists Praia da Ilha da Fuzeta as an accessible beach, and accessible-beach information is strongest for Fuseta-Ria. Fuseta-Mar requires boat access, so visitors with reduced mobility should confirm current arrangements before travelling.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Fuseta?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Armona, Praia do Barril, Praia da Culatra, Praia da Ilha de Tavira and Praia da Ilha Deserta / Barreta.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Fuseta?', 'answer', 'Official tourism sources list restaurants or food support in the Fuseta beach context, but no internally published AlgarveOfficial restaurant listing in Fuseta village itself was verified during this update. The restaurant cards use the nearest published internal listings by stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Fuseta?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are practical shoulder-month options for walking, photography and Ria Formosa visits.')
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
