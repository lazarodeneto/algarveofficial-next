begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Culatra",
    "type": "Nearby beach",
    "distance": "~5.1 km",
    "description": "Published AlgarveOfficial Ria Formosa barrier-island beach listing west of Armona by stored coordinates.",
    "href": "/listing/praia-da-culatra-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Fuseta",
    "type": "Nearby beach",
    "distance": "~5.8 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing east of Armona in Olhão.",
    "href": "/listing/praia-da-fuseta-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Ilha Deserta / Barreta",
    "type": "Nearby beach",
    "distance": "~8.5 km",
    "description": "Published AlgarveOfficial island-beach listing in the Ria Formosa system near Faro.",
    "href": "/listing/praia-da-ilha-deserta-barreta-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Barril",
    "type": "Nearby beach",
    "distance": "~14.5 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing on Ilha de Tavira by stored coordinates.",
    "href": "/listing/praia-do-barril-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Faro / Ilha de Faro",
    "type": "Nearby beach",
    "distance": "~17.4 km",
    "description": "Published AlgarveOfficial barrier-island beach listing west of Armona by stored coordinates.",
    "href": "/listing/praia-de-faro-ilha-de-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Alameda",
    "type": "Restaurant",
    "distance": "~11.6 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. Travel from Armona may require a boat connection first.",
    "href": "/listing/restaurante-alameda-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alameda",
    "type": "Restaurant",
    "distance": "~11.8 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. Travel from Armona may require a boat connection first.",
    "href": "/listing/alameda-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Bottle . Wine and Food",
    "type": "Restaurant",
    "distance": "~11.8 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. Travel from Armona may require a boat connection first.",
    "href": "/listing/bottle-wine-and-food-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Epicur Wine Boutique & Food",
    "type": "Restaurant",
    "distance": "~11.9 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. Travel from Armona may require a boat connection first.",
    "href": "/listing/epicur-wine-boutique-food-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Checkin Faro by Leonel Pereira",
    "type": "Restaurant",
    "distance": "~12.1 km",
    "description": "Published AlgarveOfficial mainland restaurant listing by stored coordinates. Travel from Armona may require a boat connection first.",
    "href": "/listing/checkin-faro-by-leonel-pereira-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Get Your Ticket - Algarve Tours and Experiences",
    "type": "Experience",
    "distance": "~4.5 km",
    "description": "Published AlgarveOfficial experience listing near the Olhão waterfront area by stored coordinates.",
    "href": "/listing/get-your-ticket-algarve-tours-and-experiences-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Parque Natural da Ria Formosa",
    "type": "Family attraction",
    "distance": "~11.2 km",
    "description": "Published AlgarveOfficial listing for the protected lagoon system that forms Armona’s wider natural setting.",
    "href": "/listing/parque-natural-da-ria-formosa-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Islands 4 You",
    "type": "Experience",
    "distance": "~12.2 km",
    "description": "Published AlgarveOfficial Ria Formosa experience listing by stored coordinates.",
    "href": "/listing/islands-4-you-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Boat for a Day - Boat Tours Ria Formosa Faro - Olhão Algarve Portugal",
    "type": "Experience",
    "distance": "~12.5 km",
    "description": "Published AlgarveOfficial Ria Formosa boat-experience listing by stored coordinates.",
    "href": "/listing/boat-for-a-day-boat-tours-ria-formosa-faro-olhao-algarve-portugal-quinta-do-lago",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-armona-olhao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-armona-olhao not found; skipping update.';
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
      where source_item->>'source_name' <> 'AlgarveOfficial internal published nearby listings'
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-armona-olhao',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Armona and the linked listings',
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
        to_jsonb('No internally published restaurant listing on Ilha da Armona itself was verified during this update; mainland restaurant cards are labelled cautiously because travel may require a boat connection.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('No internally published restaurant listing on Ilha da Armona itself was verified during this update; mainland restaurant cards are labelled cautiously because travel may require a boat connection.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'parking_info', 'VisitPortugal describes Ilha da Armona as car-free, so beach-level parking on the island is not available. Mainland parking for the Olhão boat departure area was not independently verified for this review.',
    'accessibility_info', 'Accessible-beach support was not verified from authoritative current sources. Access requires boat travel from Olhão and movement on the island, so visitors with reduced mobility should confirm boat boarding, island paths, beach-entry conditions and any seasonal assistance before travelling.',
    'lifeguard_info', 'VisitPortugal lists safety or surveillance for Praia da Armona, and ABAAE verifies the 2026 bathing season for Armona-Mar and Armona-Ria as 1 June to 30 September 2026. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE for both Armona-Mar and Armona-Ria. ABAAE lists the 2026 Blue Flag season for both sections as 1 June to 30 September 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'ABAAE verifies the bathing season for Armona-Mar and Armona-Ria; exact daily staffing was not independently verified.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.013793%2C-7.798405',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Armona?', 'answer', 'Praia da Armona is on Ilha da Armona in the municipality of Olhão, within the Ria Formosa Natural Park.'),
      jsonb_build_object('question', 'How do you get to Praia da Armona?', 'answer', 'VisitPortugal verifies boat access from Olhão and describes the crossing as taking around 15 minutes. Visitors should check current boat schedules and return times before travelling.'),
      jsonb_build_object('question', 'Is there parking at Praia da Armona?', 'answer', 'The island is car-free according to VisitPortugal, so there is no beach-level parking on Armona. Mainland parking for the Olhão departure area was not independently verified.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Armona?', 'answer', 'VisitPortugal lists safety or surveillance, and ABAAE verifies the 2026 bathing season for Armona-Mar and Armona-Ria from 1 June to 30 September 2026. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Armona a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies both Armona-Mar and Armona-Ria as 2026 Blue Flag locations, with the Blue Flag season listed from 1 June to 30 September 2026.'),
      jsonb_build_object('question', 'Is Praia da Armona accessible?', 'answer', 'Accessible-beach support was not verified from authoritative current sources. Because access requires a boat transfer and movement on the island, visitors with reduced mobility should confirm current arrangements before travelling.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Armona?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Culatra, Praia da Fuseta, Praia da Ilha Deserta / Barreta, Praia do Barril and Praia de Faro / Ilha de Faro.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Armona?', 'answer', 'VisitPortugal lists restaurants on the island, but no internally published AlgarveOfficial restaurant listing on Ilha da Armona itself was verified during this update. Nearby internal restaurant cards are mainland listings by stored coordinates and may require a boat connection first.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Armona?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are practical shoulder-month options for walking, photography and quieter Ria Formosa visits.')
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
