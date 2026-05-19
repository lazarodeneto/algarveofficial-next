begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Arrifana",
    "type": "Nearby beach",
    "distance": "~17.4 km",
    "description": "Published AlgarveOfficial Aljezur beach listing south of Odeceixe by stored coordinates.",
    "href": "/listing/praia-da-arrifana-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Bordeira / Carrapateira",
    "type": "Nearby beach",
    "distance": "~28.6 km",
    "description": "Published AlgarveOfficial west-coast beach listing south of Odeceixe by stored coordinates.",
    "href": "/listing/praia-da-bordeira-carrapateira-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Amado",
    "type": "Nearby beach",
    "distance": "~31.8 km",
    "description": "Published AlgarveOfficial west-coast beach listing south of Odeceixe by stored coordinates.",
    "href": "/listing/praia-do-amado-aljezur",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := '[]'::jsonb;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Vida Pura Portugal",
    "type": "Wellness",
    "distance": "~5.1 km",
    "description": "Published AlgarveOfficial wellness listing closest to Praia de Odeceixe by stored coordinates.",
    "href": "/listing/vida-pura-portugal-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Ritmo da Terra",
    "type": "Wellness",
    "distance": "~15.0 km",
    "description": "Published AlgarveOfficial wellness listing south of Odeceixe by stored coordinates.",
    "href": "/listing/ritmo-da-terra-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Bodywisdom Holistic Therapies",
    "type": "Wellness",
    "distance": "~15.2 km",
    "description": "Published AlgarveOfficial wellness listing south of Odeceixe by stored coordinates.",
    "href": "/listing/bodywisdom-holistic-therapies-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Quinta Alma",
    "type": "Accommodation",
    "distance": "~16.3 km",
    "description": "Published AlgarveOfficial accommodation listing near the Aljezur coast by stored coordinates.",
    "href": "/listing/quinta-alma-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Studio Bongard Ceramics",
    "type": "Nearby business",
    "distance": "~25.2 km",
    "description": "Published AlgarveOfficial shopping listing south of Odeceixe by stored coordinates.",
    "href": "/listing/studio-bongard-ceramics-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Carrapateira Extreme Tours",
    "type": "Experience",
    "distance": "~29.1 km",
    "description": "Published AlgarveOfficial experience listing near the west-coast beach corridor by stored coordinates.",
    "href": "/listing/carrapateira-extreme-tours-quarteira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Odeceixe is a river-mouth beach in Aljezur where the Ribeira de Seixe reaches the Atlantic. It combines broad sand, river-and-sea bathing context, surf, Costa Vicentina scenery and verified 2026 Blue Flag status for Odeceixe-Mar.';
  v_full_description text := $text$
Praia de Odeceixe sits at the mouth of the Ribeira de Seixe, close to Odeceixe village and the northern edge of the Algarve. VisitPortugal identifies it as a maritime beach in Aljezur where visitors can choose between sea bathing and river bathing, with small lagoon-like pools forming on the extensive sand at low tide.

The landscape is the main reason to come here. The beach opens between cliffs, river water and the Atlantic, giving it a wilder Costa Vicentina character than the south-coast resort beaches. It suits visitors looking for scenery, photography, coastal walking, surfing and a beach day with both river-mouth and ocean conditions.

Official sources confirm a useful level of support. VisitPortugal lists Blue Flag, safety or surveillance, parking, bar, restaurant and surf. Diário da República lists Odeceixe-Mar as a 2026 bathing beach in Aljezur from 1 June to 30 September, and the ABAAE 2026 awarded list verifies Odeceixe-Mar as a 2026 Blue Flag coastal beach. The individual ABAAE Odeceixe-Mar page still showed 2025 season text when checked on 19 May 2026, so exact 2026 Blue Flag display dates should be confirmed locally.

The west coast is exposed, and conditions can change with tide, wind, swell and river flow. Families may appreciate the low-tide pools noted by VisitPortugal, but swimming should still depend on local flags, signage and lifeguard guidance. Nearby Praia das Adegas is officially identified as a naturist beach by municipal and regional tourism sources, and walkers can connect the area with the Rota Vicentina and the Fishermen's Trail.
$text$;
  v_best_time text := 'June to September matches the verified 2026 bathing season for Odeceixe-Mar. Spring and autumn are especially useful for the Rota Vicentina, photography and cooler walking conditions. Tide state matters here: low tide can create shallow pools on the sand, while wind, swell and river flow can change the bathing experience.';
  v_important_notes text := 'Diário da República lists Odeceixe-Mar in Aljezur with bathing-water code PTCU9K and a 2026 bathing season from 1 June to 30 September.
ABAAE lists Odeceixe-Mar among Aljezur''s 2026 Blue Flag awarded coastal beaches.
The individual ABAAE Odeceixe-Mar page checked on 19 May 2026 still showed 2025 bathing and Blue Flag season text, so exact 2026 Blue Flag display dates should be confirmed locally.
VisitPortugal lists safety or surveillance, parking, bar, restaurant and surf for Praia de Odeceixe.
Step-free access and adapted beach equipment were not verified for this review.
No suitably close published internal AlgarveOfficial restaurant listing was found, so no restaurant cards were added.
Sea, wind, swell, tide and river-flow conditions can vary; visitors should follow local flags, signage and lifeguard instructions.
Praia das Adegas to the south is an official naturist beach according to municipal and regional tourism sources.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-odeceixe-aljezur'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-odeceixe-aljezur not found; skipping update.';
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
        'VisitPortugal - Praia de Odeceixe',
        'Bandeira Azul - Galardoados 2026',
        'ABAAE Bandeira Azul - Odeceixe-Mar',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Odeceixe',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-de-odeceixe',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and maritime beach classification',
          'Location in Aljezur',
          'Mouth of Ribeira de Seixe',
          'Sea and river bathing context',
          'Low-tide lagoons on the extensive sand',
          'Easy access from Odeceixe',
          'Blue Flag listed',
          'Safety or surveillance, parking, bar, restaurant and surf listed'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Odeceixe-Mar listed among Aljezur 2026 Blue Flag awarded coastal beaches',
          'Aljezur 2026 awarded coastal beaches listed as Amoreira-Mar, Arrifana, Monte Clérigo and Odeceixe-Mar',
          'Coordinates 37.441306, -8.797775 listed for Odeceixe-Mar'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Odeceixe-Mar',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/odeceixe-mar/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official Odeceixe-Mar Blue Flag entry',
          'Municipality of Aljezur',
          'Coordinates 37.441306, -8.797775',
          'Beach code PTCU9K',
          'Individual page still showed 2025 bathing and Blue Flag season text when checked on 19 May 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Odeceixe-Mar listed in Aljezur',
          'Bathing-water code PTCU9K',
          '2026 bathing season from 1 June to 30 September',
          'The portaria identifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-odeceixe-aljezur',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, wellness, accommodation, shopping and experience cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Odeceixe and the linked listings',
          'No external restaurant, attraction, business or competitor website links were added',
          'No suitably close published internal restaurant listing was found, so nearby_restaurants is intentionally empty'
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
        to_jsonb('Nearby beach and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text),
        to_jsonb('No suitably close published internal AlgarveOfficial restaurant listing was found for Praia de Odeceixe, so no restaurant cards were added.'::text),
        to_jsonb('The individual ABAAE Odeceixe-Mar page still showed 2025 season text when checked on 19 May 2026; 2026 Blue Flag status is based on the ABAAE 2026 awarded list.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('No suitably close published internal AlgarveOfficial restaurant listing was found for Praia de Odeceixe, so no restaurant cards were added.'::text)
      union all
      select to_jsonb('The individual ABAAE Odeceixe-Mar page still showed 2025 season text when checked on 19 May 2026; 2026 Blue Flag status is based on the ABAAE 2026 awarded list.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'River-mouth beach where the Ribeira de Seixe reaches the Atlantic',
      'Sea and river bathing context verified by VisitPortugal',
      'Low-tide lagoons on the extensive sand noted by VisitPortugal',
      'Parking, bar, restaurant, surveillance and surf listed by VisitPortugal',
      'Odeceixe-Mar 2026 bathing season verified from Diário da República',
      'Blue Flag status verified for 2026 via ABAAE awarded list'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia de Odeceixe. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'Step-free access and adapted beach equipment were not verified. VisitPortugal describes access from Odeceixe as very easy, but visitors with reduced mobility should confirm current access, gradients, parking and beach-support conditions before travelling.',
    'lifeguard_info', 'Diário da República lists Odeceixe-Mar as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. VisitPortugal also lists safety or surveillance. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via the ABAAE awarded list, where Odeceixe-Mar is listed among Aljezur''s 2026 Blue Flag coastal beaches. The individual ABAAE Odeceixe-Mar page checked on 19 May 2026 still showed 2025 season text, so exact 2026 display dates should be confirmed locally.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Odeceixe-Mar',
      'notes', 'Diário da República lists Odeceixe-Mar with a 2026 bathing season from 1 June to 30 September; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.441306%2C-8.797775',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Odeceixe-Mar with a 2026 bathing season from 1 June to 30 September.',
        'ABAAE lists Odeceixe-Mar among Aljezur''s 2026 Blue Flag awarded coastal beaches.',
        'The individual ABAAE Odeceixe-Mar page still showed 2025 season text when checked on 19 May 2026.',
        'VisitPortugal lists parking, bar, restaurant, safety or surveillance and surf.',
        'Step-free access and adapted beach equipment were not verified.',
        'No suitably close published internal restaurant listing was found, so restaurant cards were intentionally left empty.',
        'Praia das Adegas nearby is an official naturist beach.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Odeceixe?', 'answer', 'Praia de Odeceixe is in the municipality of Aljezur, at the mouth of the Ribeira de Seixe on the northern Algarve and Costa Vicentina coast.'),
      jsonb_build_object('question', 'Is there parking at Praia de Odeceixe?', 'answer', 'VisitPortugal lists parking for Praia de Odeceixe. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia de Odeceixe accessible?', 'answer', 'Step-free access and adapted beach equipment were not verified. VisitPortugal describes access from Odeceixe as very easy, but visitors with reduced mobility should confirm current conditions before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Odeceixe?', 'answer', 'Diário da República lists Odeceixe-Mar as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Odeceixe a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Odeceixe-Mar among Aljezur''s 2026 Blue Flag awarded coastal beaches. The individual page still showed 2025 dates when checked, so exact 2026 display dates should be confirmed locally.'),
      jsonb_build_object('question', 'Can you swim in the river at Praia de Odeceixe?', 'answer', 'VisitPortugal states that Praia de Odeceixe allows a choice between sea and river bathing. Conditions still depend on tide, river flow, weather and local safety guidance.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Arrifana, Praia da Bordeira / Carrapateira and Praia do Amado.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Odeceixe?', 'answer', 'VisitPortugal lists a bar and restaurant for Praia de Odeceixe. No suitably close published internal AlgarveOfficial restaurant listing was found for this update, so no restaurant cards were added.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Odeceixe?', 'answer', 'June to September matches the verified 2026 bathing season. Spring and autumn are especially useful for walking, photography and cooler Costa Vicentina conditions.')
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
