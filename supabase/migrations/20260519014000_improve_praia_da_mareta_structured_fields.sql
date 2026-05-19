begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Tonel",
    "type": "Nearby beach",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial Vila do Bispo beach listing west of Mareta by stored coordinates.",
    "href": "/listing/praia-do-tonel-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Martinhal",
    "type": "Nearby beach",
    "distance": "~2.0 km",
    "description": "Published AlgarveOfficial Sagres-area beach listing east of Mareta by stored coordinates.",
    "href": "/listing/praia-do-martinhal",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Beliche",
    "type": "Nearby beach",
    "distance": "~3.1 km",
    "description": "Published AlgarveOfficial Vila do Bispo beach listing north-west of Mareta by stored coordinates.",
    "href": "/listing/praia-do-beliche-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Salema",
    "type": "Nearby beach",
    "distance": "~12.1 km",
    "description": "Published AlgarveOfficial west-Algarve village-beach listing east of Sagres by stored coordinates.",
    "href": "/listing/praia-da-salema-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Burgau",
    "type": "Nearby beach",
    "distance": "~16.3 km",
    "description": "Published AlgarveOfficial village-beach listing east of Sagres by stored coordinates.",
    "href": "/listing/praia-do-burgau-vila-do-bispo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia do Amado",
    "type": "Nearby beach",
    "distance": "~18.3 km",
    "description": "Published AlgarveOfficial west-coast beach listing north of Sagres by stored coordinates.",
    "href": "/listing/praia-do-amado-aljezur",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante Aquário",
    "type": "Restaurant",
    "distance": "~20.6 km",
    "description": "Closest published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Sagres or beside Mareta.",
    "href": "/listing/restaurante-aquario-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Le Clubhouse Restaurant",
    "type": "Restaurant",
    "distance": "~23.3 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Sagres or beside Mareta.",
    "href": "/listing/le-clubhouse-restaurant-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Mirandus",
    "type": "Restaurant",
    "distance": "~24.5 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Sagres or beside Mareta.",
    "href": "/listing/mirandus-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "DON GULL",
    "type": "Restaurant",
    "distance": "~25.7 km",
    "description": "Published AlgarveOfficial restaurant listing by stored coordinates; not verified as being in Sagres or beside Mareta.",
    "href": "/listing/don-gull-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida",
    "type": "Restaurant",
    "distance": "~25.8 km",
    "description": "Published AlgarveOfficial Lagos restaurant listing by stored coordinates.",
    "href": "/listing/avenida-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Martinhal Sagres Family Resort",
    "type": "Accommodation",
    "distance": "~2.2 km",
    "description": "Published AlgarveOfficial accommodation listing near Sagres by stored coordinates.",
    "href": "/listing/martinhal-sagres-family-resort-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Meka Yoga Retreat",
    "type": "Wellness spa",
    "distance": "~9.0 km",
    "description": "Published AlgarveOfficial wellness listing near Sagres by stored coordinates.",
    "href": "/listing/meka-yoga-retreat-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Wolfs YOGA - Yoga & Meditation Retreats Portugal Algarve",
    "type": "Wellness spa",
    "distance": "~9.0 km",
    "description": "Published AlgarveOfficial wellness listing near Sagres by stored coordinates.",
    "href": "/listing/wolfs-yoga-yoga-meditation-retreats-portugal-algarve-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Aqua Ventura",
    "type": "Experience",
    "distance": "~17.6 km",
    "description": "Published AlgarveOfficial experience listing by stored coordinates.",
    "href": "/listing/aqua-ventura-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Espiche Golf",
    "type": "Golf",
    "distance": "~20.6 km",
    "description": "Published AlgarveOfficial golf listing east of Sagres by stored coordinates.",
    "href": "/listing/espiche-golf",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_important_notes text := 'Diário da República lists Mareta as a Vila do Bispo bathing beach for the 2026 season from 1 June to 30 September.
ABAAE lists Mareta among Vila do Bispo''s 2026 Blue Flag awarded locations and the municipality page summary lists the 2026 Blue Flag season as 1 July to 30 September.
At the time of this review, the individual ABAAE Mareta page still showed 2025 season dates, so the 2026 season dates are cross-checked from the Vila do Bispo Blue Flag municipality page and Diário da República.
VisitPortugal lists outdoor parking, bar, restaurant, surveillance, sunshade rental, small craft hire, surfing, bodyboarding and diving for Praia da Mareta.
Accessible-beach support, toilets and showers were not verified from current authoritative sources for this review.
Sea, wind and surf conditions can vary; visitors should follow flags, signage and instructions from lifeguards before swimming, diving or using small craft.
Facilities, surveillance and nautical services may vary by season and concession operation.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-mareta-vila-do-bispo'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-mareta-vila-do-bispo not found; skipping update.';
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
        'ABAAE Bandeira Azul - Mareta',
        'ABAAE Bandeira Azul - Vila do Bispo',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Mareta listed in Vila do Bispo with 2026 bathing season from 1 June to 30 September',
          'The portaria identifies beaches of bathing where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Mareta',
        'source_url', 'https://bandeiraazul.abaae.pt/local-galardoado/mareta/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Official Mareta Blue Flag entry',
          'Municipality of Vila do Bispo',
          'Coordinates 37.0057, -8.9393',
          'Beach code PTCX2C',
          'Individual page checked on 18 May 2026 and found still showing 2025 season dates'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Vila do Bispo',
        'source_url', 'https://bandeiraazul.abaae.pt/municipio/vila-do-bispo/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Mareta listed on the Vila do Bispo Blue Flag municipality page',
          '2026 bathing season shown as 1 June to 30 September',
          '2026 Blue Flag season shown as 1 July to 30 September',
          'Blue Flag shown as not yet hoisted at time checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Mareta listed among 2026 Blue Flag awarded coastal beaches',
          'Mareta coordinates and Vila do Bispo municipality cross-checked'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-da-mareta-vila-do-bispo',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia da Mareta and the linked listings',
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
        to_jsonb('The closest published internal restaurant listings are not in Sagres; distance labels and descriptions make this limitation explicit.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant listings are not in Sagres; distance labels and descriptions make this limitation explicit.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', 'Praia da Mareta is a central Sagres beach in Vila do Bispo, set in a broad sandy bay between high cliffs and Ponta de Sagres. It has easy village access, verified seasonal beach support and 2026 Blue Flag status.',
    'full_description', 'Praia da Mareta is a central beach in Sagres, in the municipality of Vila do Bispo. VisitPortugal describes it as a maritime beach with a large sandy area and good access from Sagres, set between high cliffs to the east and Ponta de Sagres to the west.\n\nIts bay setting gives Mareta a more sheltered feel than many of the exposed west-coast beaches around Sagres, although sea and wind conditions still need to be checked locally. The beach is practical for visitors staying in Sagres because it sits close to the village, restaurants, accommodation and the historic headland area.\n\nVisitPortugal lists outdoor parking, bar, restaurant, surveillance, sunshade rental, small craft hire, surfing, bodyboarding and diving. These services and activities should be treated as seasonal or conditions-dependent, especially outside the main bathing season.\n\nDiário da República lists Mareta as a 2026 bathing beach from 1 June to 30 September, and ABAAE lists Mareta among 2026 Blue Flag awarded coastal beaches. The individual ABAAE page checked on 18 May 2026 still showed 2025 season dates, so the 2026 dates are cross-checked from the Vila do Bispo Blue Flag municipality page and Diário da República.',
    'highlights', jsonb_build_array(
      'Central Sagres beach in Vila do Bispo',
      'Large sandy bay between high cliffs and Ponta de Sagres',
      'Outdoor parking, bar and restaurant listed by VisitPortugal',
      'Surfing, bodyboarding and diving listed by VisitPortugal',
      'Official 2026 bathing season verified from Diário da República',
      'Blue Flag status verified for 2026 by ABAAE'
    ),
    'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Mareta. July and August offer the strongest seasonal beach-service atmosphere, while May, June and September are usually more practical for Sagres walks, photography and lower peak-summer pressure.',
    'parking_info', 'VisitPortugal lists outdoor parking for Praia da Mareta. Exact capacity, payment rules and peak-season restrictions were not independently verified for this review.',
    'accessibility_info', 'Accessible-beach support was not verified from current authoritative sources for this review. Visitors with reduced mobility should confirm the current access route, surface conditions and any seasonal assistance before travelling.',
    'lifeguard_info', 'Diário da República lists Mareta as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: verified for 2026 via ABAAE''s awarded list for Mareta. The Vila do Bispo Blue Flag municipality page lists the 2026 Blue Flag season as 1 July to 30 September, while the individual Mareta page still showed 2025 dates when checked on 18 May 2026.',
    'blue_flag_status', 'verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'notes', 'Diário da República lists Mareta as a 2026 bathing beach; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.0057%2C-8.9393',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', 'June to September aligns with the verified 2026 bathing season for Mareta. July and August offer the strongest seasonal beach-service atmosphere, while May, June and September are usually more practical for Sagres walks, photography and lower peak-summer pressure.',
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists Mareta as a Vila do Bispo bathing beach for the 2026 season from 1 June to 30 September.',
        'ABAAE verifies Mareta as a 2026 Blue Flag awarded beach; the municipality page lists the 2026 Blue Flag season as 1 July to 30 September.',
        'VisitPortugal lists outdoor parking, bar, restaurant, surveillance, sunshade rental and small craft hire.',
        'Accessible-beach support, toilets and showers were not verified from current authoritative sources.',
        'Surfing, bodyboarding and diving are conditions-dependent.',
        'Visitors should keep away from cliff edges and follow local flags and signage.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia da Mareta?', 'answer', 'Praia da Mareta is in Sagres, in the municipality of Vila do Bispo, on the south-western Algarve coast.'),
      jsonb_build_object('question', 'Is there parking at Praia da Mareta?', 'answer', 'VisitPortugal lists outdoor parking for Praia da Mareta. Current capacity, payment rules and seasonal restrictions should be checked locally.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia da Mareta?', 'answer', 'Diário da República lists Mareta as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia da Mareta a Blue Flag beach?', 'answer', 'Yes. ABAAE lists Mareta among the 2026 Blue Flag awarded coastal beaches. The Vila do Bispo Blue Flag municipality page lists the 2026 Blue Flag season from 1 July to 30 September.'),
      jsonb_build_object('question', 'Is Praia da Mareta accessible?', 'answer', 'Accessible-beach support was not verified from current authoritative sources for this review. Visitors with reduced mobility should confirm current access conditions before travelling.'),
      jsonb_build_object('question', 'What are the nearest beaches to Praia da Mareta?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Tonel, Praia do Martinhal, Praia do Beliche, Praia da Salema, Praia do Burgau and Praia do Amado.'),
      jsonb_build_object('question', 'Are there restaurants near Praia da Mareta?', 'answer', 'VisitPortugal lists a bar and restaurant at Praia da Mareta. The nearby restaurant cards on AlgarveOfficial link only to published internal listings; the closest internal restaurant listings are not verified as being in Sagres.'),
      jsonb_build_object('question', 'Is Praia da Mareta good for water sports?', 'answer', 'VisitPortugal lists surfing, bodyboarding, diving and small craft hire for Praia da Mareta. These activities depend on sea, wind, flags and local operating conditions.'),
      jsonb_build_object('question', 'What is the best time to visit Praia da Mareta?', 'answer', 'June to September matches the verified 2026 bathing season. May, June and September are useful for Sagres walks, photography and a slightly calmer pace.')
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
