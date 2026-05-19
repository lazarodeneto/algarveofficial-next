begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Camilo",
    "type": "Nearby beach",
    "distance": "~0.5 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of Praia de Dona Ana by stored coordinates.",
    "href": "/listing/praia-do-camilo-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Porto de Mós",
    "type": "Nearby beach",
    "distance": "~1.8 km",
    "description": "Published AlgarveOfficial Lagos beach listing west of Praia de Dona Ana by stored coordinates.",
    "href": "/listing/praia-de-porto-de-mos-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Meia Praia",
    "type": "Nearby beach",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial Lagos beach listing east of the city by stored coordinates.",
    "href": "/listing/meia-praia-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Luz",
    "type": "Nearby beach",
    "distance": "~5.1 km",
    "description": "Published AlgarveOfficial Lagos beach listing west of Dona Ana by stored coordinates.",
    "href": "/listing/praia-da-luz-lagos",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Alvor",
    "type": "Nearby beach",
    "distance": "~7.4 km",
    "description": "Published AlgarveOfficial Portimão beach listing east of Lagos by stored coordinates.",
    "href": "/listing/praia-de-alvor-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Irmãos",
    "type": "Nearby beach",
    "distance": "~8.5 km",
    "description": "Published AlgarveOfficial Alvor and Portimão beach listing by stored coordinates.",
    "href": "/listing/praia-dos-tres-irmaos-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante dos Artistas",
    "type": "Restaurant",
    "distance": "~1.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Dona Ana by stored coordinates; not verified as beachside.",
    "href": "/listing/restaurante-dos-artistas-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Mirandus",
    "type": "Restaurant",
    "distance": "~1.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia de Dona Ana by stored coordinates; not verified as beachside.",
    "href": "/listing/mirandus-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida Restaurante",
    "type": "Restaurant",
    "distance": "~1.8 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored coordinates.",
    "href": "/listing/avenida-restaurante-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "DON GULL",
    "type": "Restaurant",
    "distance": "~1.9 km",
    "description": "Published AlgarveOfficial restaurant listing near Lagos by stored coordinates.",
    "href": "/listing/don-gull-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Avenida",
    "type": "Restaurant",
    "distance": "~1.9 km",
    "description": "Published AlgarveOfficial Lagos restaurant listing by stored coordinates.",
    "href": "/listing/avenida-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Art Inspirada Art Gallery",
    "type": "Nearby business",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial shopping and gallery listing near Praia de Dona Ana by stored coordinates.",
    "href": "/listing/art-inspirada-art-gallery-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Exclusive Soul Tours Algarve",
    "type": "Experience",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial experience listing near Praia de Dona Ana by stored coordinates.",
    "href": "/listing/exclusive-soul-tours-algarve-vale-do-lobo",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Soluna Space Lagos - Massage, Yoga, Event Space",
    "type": "Wellness",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial wellness listing near Praia de Dona Ana by stored coordinates.",
    "href": "/listing/soluna-space-lagos-massage-yoga-event-space-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Inlight Yoga & Holistic Treatment Studio",
    "type": "Wellness",
    "distance": "~0.9 km",
    "description": "Published AlgarveOfficial wellness listing near Lagos by stored coordinates.",
    "href": "/listing/inlight-yoga-holistic-treatment-studio-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Lagos Tours & Transfers",
    "type": "Transportation",
    "distance": "~0.9 km",
    "description": "Published AlgarveOfficial transport listing near Praia de Dona Ana by stored coordinates.",
    "href": "/listing/lagos-tours-transfers-lagos",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia de Dona Ana is a cliff-sheltered Lagos beach on the Costa d''Oiro, known for golden sand, sculpted limestone rocks and views that VisitPortugal describes as among the Algarve beach images most widely circulated. Access is by staircase, so practical planning matters.';
  v_full_description text := $text$
Praia de Dona Ana is one of the most recognisable beaches in Lagos, set below the warm-toned limestone cliffs of the Costa d'Oiro. VisitPortugal identifies it as a maritime beach in Lagos and describes clear water, carved rocks emerging from the sea and scenery that has become one of the Algarve's most widely circulated beach images.

The beach is compact, scenic and close to the city rather than remote. VisitPortugal notes that Lagos can be reached on foot in about 25 minutes, and the wider coast links naturally with Praia do Camilo, Praia do Pinhão, Praia da Batata and the Ponta da Piedade landscape. This makes Dona Ana useful for a short beach visit, photography and coastal walking as well as for a conventional summer beach day.

Access is the main practical constraint. Lagos municipality states that Dona Ana and Camilo have land access through winding staircases and has regulated access for safety and coastal-management reasons. During the bathing season, between 09:00 and 19:00, the municipal regulation restricts access by the staircases for people carrying boards, nautical-sports craft or underwater-diving equipment, and also restricts placing surf, SUP, windsurf, kitesurf, kayak or canoeing equipment on the sand.

Diário da República lists D. Ana as a 2026 bathing beach in Lagos from 1 June to 30 September. VisitPortugal lists surveillance, sunshade rental, showers, parking, bar and restaurant, but those services should be treated as seasonal. Blue Flag status is not verified for 2026: ABAAE's 2026 Lagos awarded list includes Luz, Meia Praia, Porto de Mós and Marina de Lagos, while D. Ana is not listed there. Visitors should check local flags, signage and cliff-safety notices before swimming or settling near rock faces.
$text$;
  v_best_time text := 'June to September matches the verified 2026 bathing season for D. Ana. Spring, early summer and early autumn are often more comfortable for photography and walking between Lagos, Dona Ana, Camilo and Ponta da Piedade. In high summer, mornings and later afternoons are usually the most practical times for stair access, heat and finding space on a compact beach.';
  v_important_notes text := 'Diário da República lists D. Ana in Lagos with a 2026 bathing season from 1 June to 30 September.
VisitPortugal lists surveillance, sunshade rental, showers, parking, bar and restaurant for Praia de Dona Ana.
Lagos municipality states that land access to Dona Ana and Camilo is by winding staircases and regulates use of those stairs for safety and coastal-management reasons.
During the bathing season, between 09:00 and 19:00, municipal rules restrict staircase access for people carrying boards, nautical-sports craft or underwater-diving equipment, and restrict placing surf, SUP, windsurf, kitesurf, kayak or canoeing equipment on the sand.
Step-free access was not verified; the official access information points to stair access.
ABAAE''s 2026 Lagos awarded list includes Luz, Meia Praia, Porto de Mós and Marina de Lagos; D. Ana was not found in that Blue Flag awarded list when checked on 19 May 2026.
The individual ABAAE D. Ana page shows legacy season information and was not used as proof of current 2026 Blue Flag status.
Facilities, surveillance and concessions may vary by season.
Visitors should keep away from cliff edges, cliff bases and unstable rock areas, and should follow local flags, signage and lifeguard guidance.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-de-dona-ana-lagos'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-de-dona-ana-lagos not found; skipping update.';
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
        'VisitPortugal - Praia de Dona Ana',
        'Câmara Municipal de Lagos - Access regulation news item',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'ABAAE Bandeira Azul - Lagos municipality page',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'VisitPortugal - Praia de Dona Ana',
        'source_url', 'https://www.visitportugal.com/pt-pt/content/praia-de-dona-ana',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and maritime beach classification',
          'Location in Lagos',
          'Cliff-sheltered landscape and carved rock formations',
          'Praia de Dona Ana described as one of the Algarve beach images most widely circulated',
          'Lagos reachable in about 25 minutes on foot',
          'Facilities listed including surveillance, sunshade rental, showers, parking, bar and restaurant'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Câmara Municipal de Lagos - Access regulation news item',
        'source_url', 'https://www.cm-lagos.pt/index.php?Itemid=657&cid=17%3Anoticias&id=12752%3Aacesso-as-praias-dona-ana-e-camilo-passou-a-estar-regulamentado&lang=pt&option=com_flexicontent&view=item',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Municipal access regulation for Praia da Dona Ana and Praia do Camilo entered into force in August 2024',
          'Land access through winding staircases',
          'Bathing-season restrictions between 09:00 and 19:00 for boards, nautical-sports craft and underwater-diving equipment on the staircases',
          'Restriction on placing surf, SUP, windsurf, kitesurf, kayak and canoeing equipment on the sand during the regulated period',
          'Rules justified by safety, coastal pressure management, landscape protection and risk prevention'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'D. Ana listed in Lagos',
          'Bathing-water code PTCK2D',
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
          'Lagos 2026 awarded locations listed as Luz, Meia Praia, Porto de Mós and Marina de Lagos',
          'D. Ana was not found in the Lagos 2026 Blue Flag awarded list checked on 19 May 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Lagos municipality page',
        'source_url', 'https://bandeiraazul.abaae.pt/municipio/lagos/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'D. Ana page entry gives coordinates 37.091611, -8.669377',
          'D. Ana entry shows legacy 2021 season data and was not used as proof of 2026 Blue Flag status'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-de-dona-ana-lagos',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, business, wellness, experience and transport cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia de Dona Ana and the linked listings',
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
        to_jsonb('Blue Flag status was not verified for Praia de Dona Ana in 2026; ABAAE lists other Lagos locations but not D. Ana.'::text),
        to_jsonb('The closest published internal restaurant listings are not verified as being on Praia de Dona Ana; distance labels and descriptions make this limitation explicit.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
      union all
      select to_jsonb('Blue Flag status was not verified for Praia de Dona Ana in 2026; ABAAE lists other Lagos locations but not D. Ana.'::text)
      union all
      select to_jsonb('The closest published internal restaurant listings are not verified as being on Praia de Dona Ana; distance labels and descriptions make this limitation explicit.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Cliff-sheltered Lagos beach on the Costa d''Oiro',
      'Sculpted limestone rocks and clear-water scenery verified by VisitPortugal',
      'VisitPortugal lists parking, showers, surveillance, sunshade rental, bar and restaurant',
      'Official access is via staircases, with municipal equipment restrictions during the bathing season',
      'D. Ana 2026 bathing season verified from Diário da República',
      'Blue Flag status not verified for 2026'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'VisitPortugal lists parking for Praia de Dona Ana. Exact car-park capacity, payment rules and peak-season restrictions were not independently verified for this review. Parking does not mean step-free access to the sand, because municipal information points to staircase access.',
    'accessibility_info', 'Step-free beach access was not verified. Lagos municipality describes land access to Dona Ana and Camilo through winding staircases, so Praia de Dona Ana is likely unsuitable for visitors who cannot manage steps unless current local assistance or alternative arrangements are confirmed before travelling.',
    'lifeguard_info', 'Diário da República lists D. Ana as a 2026 bathing beach from 1 June to 30 September and identifies bathing beaches where assistance to bathers is assured during the respective season. VisitPortugal also lists surveillance. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: not verified for 2026. ABAAE''s 2026 Lagos awarded list includes Luz, Meia Praia, Porto de Mós and Marina de Lagos; D. Ana was not found in that list when checked on 19 May 2026. The individual ABAAE D. Ana entry shows legacy 2021 season data and was not used as proof of current Blue Flag status.',
    'blue_flag_status', 'not_verified_2026',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'D. Ana',
      'notes', 'Diário da República lists D. Ana as a 2026 bathing beach; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.091611%2C-8.669377',
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Diário da República lists D. Ana in Lagos with a 2026 bathing season from 1 June to 30 September.',
        'VisitPortugal lists surveillance, parking, showers, sunshade rental, bar and restaurant.',
        'Municipal information points to staircase access rather than step-free access.',
        'Municipal rules restrict bulky nautical and diving equipment on the access stairs during the bathing season between 09:00 and 19:00.',
        'Blue Flag status was not verified for 2026.',
        'Visitors should check local flags, signage, stair conditions and cliff-safety notices before using the beach.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia de Dona Ana?', 'answer', 'Praia de Dona Ana is in Lagos, on the Costa d''Oiro coastline in the western Algarve.'),
      jsonb_build_object('question', 'Is there parking at Praia de Dona Ana?', 'answer', 'VisitPortugal lists parking for Praia de Dona Ana. Exact capacity, payment rules and seasonal restrictions were not independently verified.'),
      jsonb_build_object('question', 'Is Praia de Dona Ana accessible?', 'answer', 'Step-free access was not verified. Lagos municipality describes land access through winding staircases, so visitors who cannot manage steps should confirm current local conditions before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia de Dona Ana?', 'answer', 'Diário da República lists D. Ana as a 2026 bathing beach from 1 June to 30 September, where assistance to bathers is assured during the season. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia de Dona Ana a Blue Flag beach?', 'answer', 'Blue Flag status was not verified for 2026. ABAAE''s 2026 Lagos awarded list includes Luz, Meia Praia, Porto de Mós and Marina de Lagos, but D. Ana was not found in that list when checked on 19 May 2026.'),
      jsonb_build_object('question', 'How do you access Praia de Dona Ana?', 'answer', 'Municipal information states that land access to Dona Ana and Camilo is through winding staircases. During the bathing season, equipment restrictions apply on the stairs between 09:00 and 19:00.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Camilo, Praia de Porto de Mós, Meia Praia, Praia da Luz, Praia de Alvor and Praia dos Três Irmãos.'),
      jsonb_build_object('question', 'Are there restaurants near Praia de Dona Ana?', 'answer', 'VisitPortugal lists a bar and restaurant for Praia de Dona Ana. Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates.'),
      jsonb_build_object('question', 'What is the best time to visit Praia de Dona Ana?', 'answer', 'June to September matches the verified 2026 bathing season. Spring, early summer and early autumn are useful for photography and coastal walks, while summer mornings and later afternoons are often more practical for a compact staircase-access beach.')
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
