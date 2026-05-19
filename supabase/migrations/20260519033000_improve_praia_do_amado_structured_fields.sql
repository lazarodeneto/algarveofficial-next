begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia da Bordeira / Carrapateira",
    "type": "Nearby beach",
    "distance": "~3.4 km",
    "description": "Published AlgarveOfficial west-coast beach listing north of Praia do Amado by stored coordinates.",
    "href": "/listing/praia-da-bordeira-carrapateira-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Salema",
    "type": "Nearby beach",
    "distance": "~13.3 km",
    "description": "Published AlgarveOfficial village-beach listing in Vila do Bispo by stored coordinates.",
    "href": "/listing/praia-da-salema-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Arrifana",
    "type": "Nearby beach",
    "distance": "~14.5 km",
    "description": "Published AlgarveOfficial Aljezur surf-bay listing north of Praia do Amado by stored coordinates.",
    "href": "/listing/praia-da-arrifana-aljezur",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~15.5 km",
    "description": "Published AlgarveOfficial village-beach listing east of the west-coast beach area by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Martinhal",
    "type": "Nearby beach",
    "distance": "~16.5 km",
    "description": "Published AlgarveOfficial beach listing near Sagres by stored coordinates.",
    "href": "/listing/praia-do-martinhal",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Beliche",
    "type": "Nearby beach",
    "distance": "~16.7 km",
    "description": "Published AlgarveOfficial Vila do Bispo beach listing by stored coordinates.",
    "href": "/listing/praia-do-beliche-vila-do-bispo",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Monte Velho Retreat Centre",
    "type": "Wellness",
    "distance": "~2.5 km",
    "description": "Published AlgarveOfficial wellness listing near Praia do Amado by stored coordinates.",
    "href": "/listing/monte-velho-retreat-centre-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Carrapateira Extreme Tours",
    "type": "Experience",
    "distance": "~2.7 km",
    "description": "Published AlgarveOfficial experience listing near Carrapateira by stored coordinates.",
    "href": "/listing/carrapateira-extreme-tours-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Monte da Vilarinha Hotel",
    "type": "Accommodation",
    "distance": "~3.9 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia do Amado by stored coordinates.",
    "href": "/listing/monte-da-vilarinha-hotel-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Aqua Ventura",
    "type": "Experience",
    "distance": "~4.5 km",
    "description": "Published AlgarveOfficial experience listing near the west-coast Algarve by stored coordinates.",
    "href": "/listing/aqua-ventura-quarteira",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia do Amado is an exposed Atlantic surf beach near Carrapateira in Aljezur, with verified 2026 bathing-season status, surf-school context and Costa Vicentina scenery. Blue Flag status was not verified for 2026.';
  v_full_description text := $text$
Praia do Amado is a west-coast beach near Carrapateira, in the municipality of Aljezur. It sits within the Costa Vicentina coastal landscape and is strongly associated with surfing, bodyboarding and surf schools rather than calm resort-style bathing.

VisitPortugal describes Amado as one of the most popular beaches in Portugal for surfing, with surf schools and a setting used for national and international competitions. The beach is broad, open to Atlantic swell and supported by beach infrastructure listed by official tourism sources, including surveillance, parking, bar, restaurant, surf and bodyboard activity.

The landscape is part of the appeal. Regional tourism material describes a wide sandy beach extending along three valleys, with red and ochre cliff tones to the north and darker rock walls to the south. The nearby Pontal da Carrapateira area and Rota Vicentina routes add coastal-walking context, but visitors should stay on marked paths and avoid cliff edges, dune trampling and unstable rock areas.

For 2026, Diário da República and APA list Amado as a bathing beach from 1 June to 30 September. Exact daily lifeguard staffing, parking capacity and practical accessibility support should still be checked locally. Blue Flag status was not verified for 2026, because Amado was not found in the official ABAAE 2026 awarded list checked for this update.
$text$;
  v_best_time text := 'June to September matches the official 2026 bathing season for Amado. Spring and autumn can be useful for surf-focused visits and coastal walking, but west-coast swell, wind and currents should always be checked before entering the water.';
  v_important_notes text := 'Diário da República and APA list Amado with a 2026 bathing season from 1 June to 30 September.
VisitPortugal lists surveillance, parking, bar, restaurant, surf and bodyboard activity for Praia do Amado.
APA identifies Amado with bathing-water code PTCL3P and coordinates near 37.16698, -8.90345.
Blue Flag status was not verified for 2026; Amado was not found in the official ABAAE 2026 awarded list checked on 19 May 2026.
Parking is listed by VisitPortugal, but capacity, payment rules and peak-season restrictions were not independently verified.
Accessible-beach support and adapted equipment were not verified from current authoritative sources.
This is an exposed Atlantic surf beach; swimming and surf activity should follow flags, local signage and lifeguard or surf-school guidance.
The beach sits in a sensitive Costa Vicentina setting; stay on marked paths and avoid dunes, cliff edges and cliff bases.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-do-amado-aljezur'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-amado-aljezur not found; skipping update.';
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
        'VisitPortugal - Praia do Amado',
        'Agência Portuguesa do Ambiente - Praia do Amado',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia do Amado',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-do-amado',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Aljezur location',
          'Maritime beach classification',
          'Surf reputation and surf-school context',
          'National and international competition context',
          'High summer use',
          'Facilities including surveillance, parking, bar, restaurant, surf and bodyboard',
          'Access by car, motorcycle and on foot'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Agência Portuguesa do Ambiente - Praia do Amado',
        'source_url', 'https://rmsl.apambiente.pt/content/amado?language=pt-pt',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Official APA beach page for Amado',
          'Municipality of Aljezur',
          'Bathing-water code PTCL3P',
          'Coordinates 37.16698, -8.90345',
          '2026 bathing season from 1 June to 30 September',
          'Blue Flag status shown as no on APA page at time checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Amado listed in Aljezur',
          'Bathing-water code PTCL3P',
          '2026 bathing season from 1 June to 30 September',
          'The portaria qualifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Aljezur 2026 Blue Flag locations checked',
          'Aljezur 2026 awarded locations listed as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana',
          'Praia do Amado was not found among Aljezur 2026 Blue Flag locations during this review'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-do-amado-aljezur',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, wellness, accommodation and experience cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia do Amado and the linked listings',
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
        to_jsonb('Nearby beach and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text),
        to_jsonb('No close internally published restaurant listing was verified for Praia do Amado during this update, so no nearby restaurant cards were added.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text),
        to_jsonb('Blue Flag status for Praia do Amado was not verified for 2026 from ABAAE; no Blue Flag claim has been added.'::text)
      )
      union all
      select to_jsonb('Nearby beach and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('No close internally published restaurant listing was verified for Praia do Amado during this update, so no nearby restaurant cards were added.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      union all
      select to_jsonb('Blue Flag status for Praia do Amado was not verified for 2026 from ABAAE; no Blue Flag claim has been added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Exposed Atlantic surf beach near Carrapateira in Aljezur',
      'Surf schools and surf/bodyboard activity verified by VisitPortugal',
      'Parking, surveillance, bar and restaurant listed by VisitPortugal',
      '2026 bathing season verified by APA and Diário da República',
      'Blue Flag status not verified for 2026 from ABAAE',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia do Amado. Current capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'Accessible-beach support, step-free access and adapted bathing equipment were not verified from current authoritative sources reviewed for Praia do Amado. Visitors with reduced mobility should confirm current access and support before travelling.',
    'lifeguard_info', 'VisitPortugal lists surveillance, and APA / Diário da República list Amado as a 2026 bathing beach from 1 June to 30 September. Exact daily lifeguard staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: not verified for 2026. Praia do Amado was not found in the official ABAAE 2026 awarded list checked on 19 May 2026, and APA showed Blue Flag as no at the time checked.',
    'blue_flag_status', 'not_verified',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Amado',
      'bathing_water_code', 'PTCL3P',
      'notes', 'VisitPortugal lists surveillance; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.16698%2C-8.90345',
    'coordinates', jsonb_build_object(
      'latitude', 37.16698,
      'longitude', -8.90345,
      'label', 'Praia do Amado',
      'notes', 'Coordinates verified from APA beach information.',
      'verification_status', 'Verified from APA',
      'bathing_areas', jsonb_build_array()
    ),
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'APA and Diário da República list Amado with a 2026 bathing season from 1 June to 30 September.',
        'VisitPortugal lists surveillance, parking, bar, restaurant, surf and bodyboard activity.',
        'Blue Flag status was not verified for 2026 from ABAAE.',
        'Parking capacity, payment rules and practical accessibility support were not independently verified.',
        'This is an exposed Atlantic surf beach; check flags, swell, wind and local guidance before entering the water.',
        'The beach sits in a sensitive Costa Vicentina setting; avoid dunes, cliff edges and cliff bases.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', '[]'::jsonb,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia do Amado?', 'answer', 'Praia do Amado is near Carrapateira, in the municipality of Aljezur, on the Algarve west coast.'),
      jsonb_build_object('question', 'Is Praia do Amado good for surfing?', 'answer', 'Yes. VisitPortugal describes Praia do Amado as one of Portugal''s most popular beaches for surfing and lists surf and bodyboard activity, with surf schools present. Conditions still depend on swell, wind and local safety guidance.'),
      jsonb_build_object('question', 'Is there parking at Praia do Amado?', 'answer', 'VisitPortugal lists parking for Praia do Amado. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.'),
      jsonb_build_object('question', 'Is Praia do Amado accessible?', 'answer', 'Accessible-beach support, step-free access and adapted bathing equipment were not verified from current authoritative sources reviewed. Visitors with reduced mobility should confirm current access before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia do Amado?', 'answer', 'VisitPortugal lists surveillance, and APA / Diário da República list Amado as a 2026 bathing beach from 1 June to 30 September. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia do Amado a Blue Flag beach?', 'answer', 'Blue Flag status was not verified for 2026. Praia do Amado was not found in the official ABAAE 2026 awarded list checked on 19 May 2026, and APA showed Blue Flag as no at the time checked.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia da Bordeira / Carrapateira, Praia da Salema, Praia da Arrifana, Praia do Burgau, Praia do Martinhal and Praia do Beliche.'),
      jsonb_build_object('question', 'Are there restaurants near Praia do Amado?', 'answer', 'VisitPortugal lists bar and restaurant facilities for Praia do Amado, but no close internally published AlgarveOfficial restaurant listing was verified during this update, so no restaurant cards were added.'),
      jsonb_build_object('question', 'What is the best time to visit Praia do Amado?', 'answer', 'June to September matches the official 2026 bathing season. Spring and autumn can be useful for surf-focused visits and coastal walking, but conditions should always be checked before entering the water.')
    ),
    'sources_used', coalesce(v_sources, '[]'::jsonb),
    'verification_notes', coalesce(v_notes, '[]'::jsonb)
  );

  update public.listings
     set short_description = v_short_description,
         description = v_full_description,
         website_url = null,
         latitude = 37.16698,
         longitude = -8.90345,
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
