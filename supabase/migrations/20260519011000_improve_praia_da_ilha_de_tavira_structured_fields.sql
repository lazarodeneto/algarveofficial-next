begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Barril",
    "type": "Nearby beach",
    "distance": "~4.7 km",
    "description": "Published AlgarveOfficial beach listing further west on Ilha de Tavira by stored coordinates.",
    "href": "/listing/praia-do-barril-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Cacela Velha / Praia da Fábrica-Mar",
    "type": "Nearby beach",
    "distance": "~7.7 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing east of Tavira by stored coordinates.",
    "href": "/listing/praia-de-cacela-velha-fabrica-mar",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Fuseta",
    "type": "Nearby beach",
    "distance": "~13.4 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing west of Tavira by stored coordinates.",
    "href": "/listing/praia-da-fuseta-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Armona",
    "type": "Nearby beach",
    "distance": "~19.2 km",
    "description": "Published AlgarveOfficial Olhão island beach listing west of Tavira by stored coordinates.",
    "href": "/listing/praia-da-armona-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Culatra",
    "type": "Nearby beach",
    "distance": "~24.3 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing west of Tavira by stored coordinates.",
    "href": "/listing/praia-da-culatra-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "À Mesa",
    "type": "Restaurant",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial Tavira-area restaurant listing by stored coordinates. Island access may still require a boat connection.",
    "href": "/listing/a-mesa-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Noélia",
    "type": "Restaurant",
    "distance": "~3.2 km",
    "description": "Published AlgarveOfficial Tavira-area restaurant listing by stored coordinates. Island access may still require a boat connection.",
    "href": "/listing/noelia-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "A Ver Tavira",
    "type": "Restaurant",
    "distance": "~3.2 km",
    "description": "Published AlgarveOfficial Tavira-area restaurant listing by stored coordinates. Island access may still require a boat connection.",
    "href": "/listing/a-ver-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante Vistas Monte Rei",
    "type": "Restaurant",
    "distance": "~12.5 km",
    "description": "Published AlgarveOfficial eastern-Algarve restaurant listing by stored coordinates.",
    "href": "/listing/restaurante-vistas-monte-rei-quinta-do-lago",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Fatia Transfers",
    "type": "Transportation",
    "distance": "~2.7 km",
    "description": "Published AlgarveOfficial transportation business listing near Tavira by stored coordinates.",
    "href": "/listing/fatia-transfers-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Tavira D’artes Art Gallery",
    "type": "Shopping",
    "distance": "~3.1 km",
    "description": "Published AlgarveOfficial Tavira gallery listing by stored coordinates.",
    "href": "/listing/tavira-dartes-art-gallery-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta da Ria Golf Course",
    "type": "Golf",
    "distance": "~6.9 km",
    "description": "Published AlgarveOfficial golf listing east of Tavira by stored coordinates.",
    "href": "/listing/quinta-da-ria-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Algarviptravel - Dmc Travel Design Private Tours Airport Transfers",
    "type": "Experience",
    "distance": "~13.1 km",
    "description": "Published AlgarveOfficial experience and transfer listing by stored coordinates.",
    "href": "/listing/algarviptravel-dmc-travel-design-private-tours-airport-transfers-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Octant Hotels Praia Verde",
    "type": "Family attraction",
    "distance": "~14.4 km",
    "description": "Published AlgarveOfficial eastern-Algarve business listing by stored coordinates.",
    "href": "/listing/octant-hotels-praia-verde-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Parque Natural da Ria Formosa",
    "type": "Family attraction",
    "distance": "~30.0 km",
    "description": "Published AlgarveOfficial listing for the protected lagoon system that forms Ilha de Tavira's wider natural setting.",
    "href": "/listing/parque-natural-da-ria-formosa-almancil",
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
  where slug = 'praia-da-ilha-de-tavira'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-ilha-de-tavira not found; skipping update.';
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
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Ilha de Tavira-Mar listed in Tavira with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies beaches of bathing where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-ilha-de-tavira',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Ilha de Tavira and the linked listings',
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
        to_jsonb('Restaurant cards use published internal AlgarveOfficial Tavira-area listings by stored coordinates; Ilha de Tavira itself is boat-access, so visitors should still plan around ferry or aquatáxi logistics.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('Restaurant cards use published internal AlgarveOfficial Tavira-area listings by stored coordinates; Ilha de Tavira itself is boat-access, so visitors should still plan around ferry or aquatáxi logistics.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'parking_info', 'Câmara Municipal de Tavira lists parking in Tavira city and at Quatro Águas, with free and paid options. Praia da Ilha de Tavira itself is reached by boat or aquatáxi, so there is no vehicle access or parking on the island beach. Current capacity, payment rules and seasonal pressure should be checked locally before travelling.',
    'accessibility_info', 'Câmara Municipal de Tavira states that Praia da Ilha de Tavira is not adapted for people with reduced mobility. Because access depends on boat or aquatáxi travel and movement on the island, visitors with accessibility needs should confirm current boarding arrangements, routes and beach support before travelling.',
    'lifeguard_info', 'Câmara Municipal de Tavira lists Praia da Ilha de Tavira as a watched beach, and Diário da República lists Ilha de Tavira-Mar as a 2026 bathing beach from 1 June to 30 September. Exact daily lifeguard staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE for Ilha de Tavira-Mar. ABAAE lists the 2026 Blue Flag season as 1 June to 30 September 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'Diário da República lists Ilha de Tavira-Mar as a 2026 bathing beach; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.111478%2C-7.619766',
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Ilha de Tavira?', 'answer', 'Praia da Ilha de Tavira is in the municipality of Tavira, at the eastern end of Ilha de Tavira within the Ria Formosa barrier-island system.'),
      jsonb_build_object('question', 'How do you get to Praia da Ilha de Tavira?', 'answer', 'Câmara Municipal de Tavira lists access from Tavira, from the Quatro Águas quay and by aquatáxi. Current boat schedules and return times should be checked before travelling.'),
      jsonb_build_object('question', 'Is there parking at Praia da Ilha de Tavira?', 'answer', 'Parking is available in Tavira city and at Quatro Águas according to the municipality, with free and paid options. There is no vehicle access or parking on the island beach itself.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Ilha de Tavira?', 'answer', 'The municipality lists the beach as watched, and Diário da República lists Ilha de Tavira-Mar as a 2026 bathing beach from 1 June to 30 September. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Ilha de Tavira a Blue Flag beach?', 'answer', 'Yes. ABAAE verifies Ilha de Tavira-Mar as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 June to 30 September 2026.'),
      jsonb_build_object('question', 'Is Praia da Ilha de Tavira accessible?', 'answer', 'The municipality states that Praia da Ilha de Tavira is not adapted for people with reduced mobility. Visitors with accessibility needs should confirm boat boarding and island access conditions before travelling.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Ilha de Tavira?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Barril, Praia de Cacela Velha / Praia da Fábrica-Mar, Praia da Fuseta, Praia da Armona and Praia da Culatra.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Ilha de Tavira?', 'answer', 'Câmara Municipal de Tavira lists restaurants and bars among the services at Praia da Ilha de Tavira. The nearby restaurant cards on AlgarveOfficial link only to published internal Tavira-area listings.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Ilha de Tavira?', 'answer', 'June to September matches the verified 2026 bathing and Blue Flag season. May, June and September are practical shoulder-month options for long walks, Ria Formosa scenery and slightly calmer visits.')
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
