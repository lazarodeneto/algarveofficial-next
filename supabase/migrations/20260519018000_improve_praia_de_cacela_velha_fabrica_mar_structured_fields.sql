begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Ilha de Tavira",
    "type": "Nearby beach",
    "distance": "~7.7 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing west of Cacela by stored coordinates.",
    "href": "/listing/praia-da-ilha-de-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Barril",
    "type": "Nearby beach",
    "distance": "~12.4 km",
    "description": "Published AlgarveOfficial Tavira beach listing west of Cacela by stored coordinates.",
    "href": "/listing/praia-do-barril-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Fuseta",
    "type": "Nearby beach",
    "distance": "~21.1 km",
    "description": "Published AlgarveOfficial Ria Formosa beach listing west of Cacela by stored coordinates.",
    "href": "/listing/praia-da-fuseta-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Armona",
    "type": "Nearby beach",
    "distance": "~26.9 km",
    "description": "Published AlgarveOfficial island beach listing west of Cacela by stored coordinates.",
    "href": "/listing/praia-da-armona-olhao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Culatra",
    "type": "Nearby beach",
    "distance": "~31.9 km",
    "description": "Published AlgarveOfficial Ria Formosa island beach listing west of Cacela by stored coordinates.",
    "href": "/listing/praia-da-culatra-faro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Ilha Deserta / Barreta",
    "type": "Nearby beach",
    "distance": "~35.4 km",
    "description": "Published AlgarveOfficial barrier-island beach listing west of Cacela by stored coordinates.",
    "href": "/listing/praia-da-ilha-deserta-barreta-faro",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Noélia",
    "type": "Restaurant",
    "distance": "~4.9 km",
    "description": "Closest published AlgarveOfficial restaurant listing by stored coordinates; not verified as being on the Fábrica-Mar sandbank.",
    "href": "/listing/noelia-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Restaurante Vistas Monte Rei",
    "type": "Restaurant",
    "distance": "~6.4 km",
    "description": "Published AlgarveOfficial restaurant listing near Cacela by stored coordinates; not verified as beachside.",
    "href": "/listing/restaurante-vistas-monte-rei-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "À Mesa",
    "type": "Restaurant",
    "distance": "~9.3 km",
    "description": "Published AlgarveOfficial Tavira restaurant listing by stored coordinates.",
    "href": "/listing/a-mesa-tavira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "A Ver Tavira",
    "type": "Restaurant",
    "distance": "~9.5 km",
    "description": "Published AlgarveOfficial Tavira restaurant listing by stored coordinates.",
    "href": "/listing/a-ver-tavira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Casas da Quinta de Cima",
    "type": "Nearby business",
    "distance": "~1.6 km",
    "description": "Published AlgarveOfficial nearby business listing by stored coordinates.",
    "href": "/listing/casas-da-quinta-de-cima-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta da Ria Golf Course",
    "type": "Golf",
    "distance": "~1.7 km",
    "description": "Published AlgarveOfficial golf listing near Cacela by stored coordinates.",
    "href": "/listing/quinta-da-ria-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Algarve House Hunter",
    "type": "Nearby business",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial business listing near Cacela by stored coordinates.",
    "href": "/listing/algarve-house-hunter-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Algarviptravel - Dmc Travel Design Private Tours Airport Transfers",
    "type": "Experience",
    "distance": "~5.4 km",
    "description": "Published AlgarveOfficial experience listing near Cacela by stored coordinates.",
    "href": "/listing/algarviptravel-dmc-travel-design-private-tours-airport-transfers-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Monte Rei Golf & Country Club",
    "type": "Golf",
    "distance": "~5.9 km",
    "description": "Published AlgarveOfficial golf listing near Cacela by stored coordinates.",
    "href": "/listing/monte-rei-golf-country-club-tavira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Cacela Velha / Praia da Fábrica-Mar is a tidal Ria Formosa beach near Vila Nova de Cacela, in Vila Real de Santo António. It is best approached as a scenic lagoon-and-sandbank visit with recognised access, tide awareness and caution around the direct front-of-village bathing zone.';
  v_full_description text := 'Praia de Cacela Velha / Praia da Fábrica-Mar is one of the eastern Algarve''s most distinctive Ria Formosa settings, below the historic village of Cacela Velha in the municipality of Vila Real de Santo António. VisitPortugal describes Cacela Velha as a historic settlement overlooking the Ria Formosa, with boats from Sítio da Fábrica connecting to the islands and extensive sandy beaches.

The appeal here is the lagoon landscape rather than a conventional drive-up beach. From Cacela Velha, visitors look across tidal channels, sandbanks, dunes and Atlantic-facing barrier sands, with the village, church and fort adding a strong cultural backdrop. The beach is closely associated with Fábrica-Mar, which Diário da República lists as a 2026 bathing beach from 1 June to 30 September.

Planning matters more here than on a typical serviced beach. Vila Real de Santo António municipality has warned against using the direct zone in front of Cacela Velha for bathing because of risks linked to crossing the ria on foot, tidal currents, environmental sensitivity and lack of permanent assistance to bathers in that specific front-of-village area. Visitors should use recognised access, check local signage and tide conditions, and avoid improvised crossings.

Blue Flag status was not verified for Fábrica-Mar in 2026: ABAAE''s Vila Real de Santo António awarded list includes Lota, Manta Rota, Monte Gordo and Santo António, but not Fábrica-Mar. For AlgarveOfficial, this listing therefore treats the beach as a scenic, tide-sensitive Ria Formosa experience with a verified bathing season, not as a Blue Flag or fully serviced beach claim.';
  v_best_time text := 'June to September matches the verified 2026 bathing season for Fábrica-Mar. Late spring and early autumn are often better for views, photography and walking around Cacela Velha with less heat pressure. Tide state is essential for any beach plan, so visitors should check local tide, boat and safety information before travelling.';
  v_important_notes text := 'Diário da República lists Fábrica-Mar in Vila Real de Santo António with a 2026 bathing season from 1 June to 30 September.
ABAAE''s 2026 Vila Real de Santo António awarded list includes Lota, Manta Rota, Monte Gordo and Santo António; Fábrica-Mar was not found in that Blue Flag list when checked on 19 May 2026.
VisitPortugal verifies Cacela Velha as a viewpoint over the Ria Formosa and states that boats from Sítio da Fábrica connect to the islands and extensive sandy beaches.
The municipality has warned against using the direct zone in front of Cacela Velha as a normal bathing area because of tidal-crossing risk, currents, environmental sensitivity and lack of permanent assistance to bathers in that specific area.
Parking information for the beach access point was not verified from official sources for this review.
Step-free access, adapted equipment and toilets were not verified for this listing.
Visitors should use recognised access, check tides and local signage, and avoid walking through dunes or protected lagoon habitats.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-cacela-velha-fabrica-mar'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-cacela-velha-fabrica-mar not found; skipping update.';
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
        'VisitPortugal - Cacela Velha',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Cacela Velha',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/cacela-velha',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Cacela Velha historic settlement above the Ria Formosa',
          'Fortress, church and viewpoint context',
          'Boats from Sítio da Fábrica connect to islands and extensive sandy beaches',
          'Cacela Velha address in Vila Nova de Cacela'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Fábrica-Mar listed for Vila Real de Santo António',
          'Bathing-water code PTCD2W',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Vila Real de Santo António 2026 awarded coastal beaches listed as Lota, Manta Rota, Monte Gordo and Santo António',
          'Fábrica-Mar was not found in the Vila Real de Santo António 2026 Blue Flag awarded list checked on 19 May 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-cacela-velha-fabrica-mar',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and golf cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Cacela Velha / Fábrica-Mar and the linked listings',
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
        to_jsonb('Blue Flag status was not verified for Fábrica-Mar in 2026; ABAAE lists other Vila Real de Santo António beaches but not Fábrica-Mar.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('Blue Flag status was not verified for Fábrica-Mar in 2026; ABAAE lists other Vila Real de Santo António beaches but not Fábrica-Mar.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Tidal Ria Formosa sandbank and lagoon setting near Cacela Velha',
      'Historic village viewpoint over the barrier sands and Atlantic horizon',
      'Boat connection from Sítio da Fábrica verified by VisitPortugal',
      'Fábrica-Mar 2026 bathing season verified from Diário da República',
      'Municipal warning requires caution around the direct front-of-village bathing zone',
      'Blue Flag status not verified for Fábrica-Mar in 2026'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'Parking information for Praia de Cacela Velha / Fábrica-Mar access was not verified from official sources for this review. Visitors should confirm current Sítio da Fábrica access, parking and boat arrangements locally before travelling.',
    'accessibility_info', 'Step-free beach access was not verified. The beach experience may involve boat arrangements, tide-sensitive routes, sand and uneven lagoon-edge conditions, so visitors with reduced mobility should confirm current access and assistance before travelling.',
    'lifeguard_info', 'Diário da República lists Fábrica-Mar as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. This should not be read as approval for informal bathing directly in front of Cacela Velha, where the municipality has issued warnings.',
    'blue_flag_info', 'Blue Flag status: not verified for Fábrica-Mar in 2026. ABAAE''s Vila Real de Santo António 2026 awarded list includes Lota, Manta Rota, Monte Gordo and Santo António; Fábrica-Mar was not found in that list when checked on 19 May 2026.',
    'blue_flag_status', 'not_verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Fábrica-Mar',
      'notes', 'Diário da República lists Fábrica-Mar as a 2026 bathing beach; visitors should use recognised access and local signage, not informal front-of-village crossings.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.1512639%2C-7.54911944',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Fábrica-Mar in Vila Real de Santo António with a 2026 bathing season from 1 June to 30 September.',
        'Blue Flag status was not verified for Fábrica-Mar in 2026.',
        'VisitPortugal verifies boats from Sítio da Fábrica to the islands and extensive sandy beaches.',
        'The municipality has warned against using the direct front-of-Cacela Velha zone as a normal bathing area.',
        'Parking, step-free access, toilets and adapted equipment were not verified for this listing.',
        'Visitors should check tides, boat arrangements, local signage and safety guidance before entering the water.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Cacela Velha / Praia da Fábrica-Mar?', 'answer', 'Praia de Cacela Velha / Praia da Fábrica-Mar is near Cacela Velha and Vila Nova de Cacela, in the municipality of Vila Real de Santo António, within the Ria Formosa coastal setting.'),
      jsonb_build_object('question', 'How do you reach Praia de Cacela Velha / Fábrica-Mar?', 'answer', 'VisitPortugal states that boats from Sítio da Fábrica connect to the islands and extensive sandy beaches. Visitors should use recognised access and confirm current boat and tide conditions locally.'),
      jsonb_build_object('question', 'Is there parking at Praia de Cacela Velha / Fábrica-Mar?', 'answer', 'Parking information for this beach access was not verified from official sources for this review. Confirm current parking and access arrangements before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Fábrica-Mar?', 'answer', 'Diário da República lists Fábrica-Mar as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Avoid informal bathing directly in front of Cacela Velha unless local conditions and signage clearly allow it.'),
      jsonb_build_object('question', 'Is Praia de Cacela Velha / Fábrica-Mar a Blue Flag beach?', 'answer', 'Blue Flag status was not verified for Fábrica-Mar in 2026. ABAAE lists other Vila Real de Santo António beaches for 2026, but Fábrica-Mar was not found in the awarded list checked on 19 May 2026.'),
      jsonb_build_object('question', 'Is Praia de Cacela Velha suitable for families?', 'answer', 'The viewpoint and village setting can be rewarding for families, but the beach itself requires careful tide, access and safety planning. Families wanting a simple serviced beach day should confirm current conditions or consider a more straightforward recognised bathing beach.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Ilha de Tavira, Praia do Barril, Praia da Fuseta, Praia da Armona, Praia da Culatra and Praia da Ilha Deserta / Barreta.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Cacela Velha / Fábrica-Mar?', 'answer', 'Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates. Restaurants directly on the Fábrica-Mar sandbank were not verified for this review.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Cacela Velha / Fábrica-Mar?', 'answer', 'June to September matches the verified 2026 bathing season. Late spring and early autumn are useful for views and photography, but tide and boat conditions should be checked before any beach visit.')
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
