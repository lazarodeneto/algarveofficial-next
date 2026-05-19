begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_beaches jsonb := $json$
[
  {
    "name": "Praia do Vau",
    "type": "Nearby beach",
    "distance": "~0.4 km",
    "description": "Published AlgarveOfficial beach listing immediately east of Praia do Alemão by stored coordinates.",
    "href": "/listing/praia-do-vau-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Prainha",
    "type": "Nearby beach",
    "distance": "~1.3 km",
    "description": "Published AlgarveOfficial cove-beach listing west of Praia do Alemão by stored coordinates.",
    "href": "/listing/praia-da-prainha-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Irmãos",
    "type": "Nearby beach",
    "distance": "~1.5 km",
    "description": "Published AlgarveOfficial Alvor beach listing west of Praia do Alemão by stored coordinates.",
    "href": "/listing/praia-dos-tres-irmaos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia dos Três Castelos",
    "type": "Nearby beach",
    "distance": "~1.6 km",
    "description": "Published AlgarveOfficial cliff-backed Portimão beach listing east of Praia do Alemão by stored coordinates.",
    "href": "/listing/praia-dos-tres-castelos-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia da Rocha",
    "type": "Nearby beach",
    "distance": "~2.4 km",
    "description": "Published AlgarveOfficial Portimão resort-beach listing east of Praia do Alemão by stored coordinates.",
    "href": "/listing/praia-da-rocha",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Praia de Alvor",
    "type": "Nearby beach",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial Alvor beach listing west of Praia do Alemão by stored coordinates.",
    "href": "/listing/praia-de-alvor-portimao",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Restaurante F",
    "type": "Restaurant",
    "distance": "~1.8 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/restaurante-f-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "NUMA",
    "type": "Restaurant",
    "distance": "~1.8 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/numa-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Vista Restaurant",
    "type": "Restaurant",
    "distance": "~2.3 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/vista-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Allgarbe Restaurante",
    "type": "Restaurant",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/allgarbe-restaurante-portimao",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Club Nau - Beach Club & Restaurant",
    "type": "Restaurant",
    "distance": "~3.8 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/club-nau-beach-club-restaurant-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Alto Golf Course",
    "type": "Golf",
    "distance": "~0.8 km",
    "description": "Published AlgarveOfficial golf listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/alto-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Pestana Alvor Praia",
    "type": "Accommodation",
    "distance": "~1.4 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/pestana-alvor-praia-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Bela Vista Hotel & SPA",
    "type": "Wellness and accommodation",
    "distance": "~2.3 km",
    "description": "Published AlgarveOfficial wellness and accommodation listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/bela-vista-hotel-spa-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Jupiter Algarve Hotel",
    "type": "Accommodation",
    "distance": "~2.4 km",
    "description": "Published AlgarveOfficial accommodation listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/jupiter-algarve-hotel-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Alvor Golf Shop",
    "type": "Shopping",
    "distance": "~2.6 km",
    "description": "Published AlgarveOfficial shopping listing near Praia do Alemão by stored coordinates.",
    "href": "/listing/alvor-golf-shop",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_short_description text := 'Praia do Alemão is a cliff-backed Portimão beach west of Praia do Vau, officially associated with the Barranco das Canas bathing water. It has a natural pine-and-cliff setting, seasonal beach support and a verified 2026 bathing season.';
  v_full_description text := $text$
Praia do Alemão is a small, cliff-backed beach on the Portimão coast, immediately west of Praia do Vau and east of the Ponta de João d'Arens rock formation. Official local sources also identify the beach as Praia Barranco das Canas, and the 2026 national bathing-season list uses the bathing-water name Barranco das Canas.

The beach has a more natural feel than the larger urban beaches further east. Visit Portimão describes a pine grove on the clifftop, a natural surrounding landscape and a setting bounded by Praia do Vau to the east and Ponta de João d'Arens to the west. From the beach area, visitors can also connect with the Varandas sobre o Mar clifftop route towards Prainha.

Facilities should be treated as seasonal. Visit Portimão lists beach support, lifeguard, first-aid station, WC and sunshade area. The parish page describes more limited infrastructure, specifically a bar and concession area, and also notes beach surveillance. Diário da República lists Barranco das Canas in Portimão with a 2026 bathing season from 1 June to 30 September.

Parking and accessibility details were not verified from the official sources reviewed, so visitors should confirm current access before relying on either. Blue Flag status was also not verified for 2026: Praia do Alemão / Barranco das Canas was not found in the official ABAAE 2026 awarded list checked for this update. As with other cliff-backed Portimão beaches, visitors should keep away from cliff edges, cliff bases and unstable rock areas, and should follow local flags and signage before swimming.
$text$;
  v_best_time text := 'June to September matches the official 2026 bathing season for Barranco das Canas. Late spring and early autumn are practical for clifftop walks and photography when heat is usually lower, while any shoreline walking should be planned around tide, sea state and local signage.';
  v_important_notes text := 'Praia do Alemão is also identified by official/local sources as Praia Barranco das Canas.
Diário da República lists Barranco das Canas in Portimão with a 2026 bathing season from 1 June to 30 September.
Visit Portimão lists beach support, lifeguard, first-aid station, WC and sunshade area.
The parish page describes limited infrastructure, with a bar and concession area, and notes beach surveillance.
Parking information was not verified from the official sources reviewed.
Accessible-beach status, step-free access and adapted bathing equipment were not verified for this review.
Blue Flag status was not verified for 2026; Alemão/Barranco das Canas was not found in the ABAAE 2026 awarded list checked on 19 May 2026.
The beach is cliff-backed; visitors should keep away from cliff edges, cliff bases and unstable rock areas.';
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-do-alemao-portimao'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-alemao-portimao not found; skipping update.';
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
        'Visit Portimão - Praia do Alemão',
        'Visit Portimão – Praia do Alemão',
        'Visit Portimão – Praia do Alemão English page',
        'Junta de Freguesia de Portimão - Praia Barranco das Canas (Alemão)',
        'Junta de Freguesia de Portimão – Praia Barranco das Canas (Alemão)',
        'Diário da República - Portaria n.º 204-A/2026/1',
        'Agência Portuguesa do Ambiente - Perfil da Água Balnear Barranco das Canas',
        'Câmara Municipal de Portimão - Qualidade da Água Balnear das Praias de Portimão',
        'Câmara Municipal de Portimão – Qualidade da Água Balnear das Praias de Portimão',
        'ABAAE Bandeira Azul - Galardoados 2026',
        'AlgarveOfficial internal published nearby listings'
      )
      union all
      select jsonb_build_object(
        'source_name', 'Visit Portimão - Praia do Alemão',
        'source_url', 'https://visitportimao.com/en/beaches/praia-do-alemao/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Beach name and Portimão tourism listing',
          'Beach support, lifeguard, first-aid station, WC and sunshade area listed',
          'Pine grove on the clifftop',
          'Praia do Vau boundary to the east',
          'Ponta de João d''Arens boundary to the west',
          'Natural cliff-backed surroundings',
          'Connection with the Varandas sobre o Mar clifftop route towards Prainha'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Junta de Freguesia de Portimão - Praia Barranco das Canas (Alemão)',
        'source_url', 'https://www.jf-portimao.pt/praia-barranco-das-canas-alemao/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Alternative/local official page name Praia Barranco das Canas (Alemão)',
          'Location beside Praia do Vau',
          'Limited infrastructure noted',
          'Bar and concession area listed',
          'Beach surveillance noted'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Diário da República - Portaria n.º 204-A/2026/1',
        'source_url', 'https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Barranco das Canas listed in Portimão',
          'Bathing-water code PTCX2T',
          '2026 bathing season from 1 June to 30 September',
          'The portaria qualifies bathing beaches where assistance to bathers is assured during the respective season'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Agência Portuguesa do Ambiente - Perfil da Água Balnear Barranco das Canas',
        'source_url', 'https://apambiente.pt/sites/default/files/_SNIAMB_A_APA/Comunicacao/Epoca_balnear/PerfisAB/ARH_Algarve/PerfisAguasBalneares/PORTIMAO/BarrancodasCanas_PTCX2T.pdf',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Bathing-water name Barranco das Canas',
          'Bathing-water code PTCX2T',
          'Location in Portimão, Faro district',
          'Monitoring point coordinates latitude 37.11938 and longitude -8.56381',
          'Coastal bathing-water profile context'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'Câmara Municipal de Portimão - Qualidade da Água Balnear das Praias de Portimão',
        'source_url', 'https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho/qualidade-da-agua-balnear-das-praias-de-portimao',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Municipal table lists Alemão - Barranco Canas',
          'Bathing-water code Barranco das Canas PTCX2T',
          '2023 water-quality classification shown as Excelente',
          'Page last updated on 4 November 2025'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'ABAAE Bandeira Azul - Galardoados 2026',
        'source_url', 'https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Praia do Alemão / Barranco das Canas was not found in the official ABAAE 2026 awarded list during this review',
          'Blue Flag status therefore remains not verified for 2026'
        )
      )
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published nearby listings',
        'source_url', 'https://algarveofficial.com/listing/praia-do-alemao-portimao',
        'checked_at', '2026-05-19',
        'facts_verified', jsonb_build_array(
          'Nearby beach, restaurant, accommodation, golf, shopping and wellness cards link only to internally published AlgarveOfficial listing slugs checked on 19 May 2026',
          'Approximate nearby distances calculated from stored coordinates for Praia do Alemão and the linked listings',
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
        to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text),
        to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text),
        to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text),
        to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text),
        to_jsonb('Blue Flag status for Praia do Alemão / Barranco das Canas was not verified for 2026 from ABAAE; no Blue Flag claim has been added.'::text)
      )
      union all
      select to_jsonb('Nearby beach, restaurant and business cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, business or competitor website links were added.'::text)
      union all
      select to_jsonb('The closest published internal restaurant and business listings are coordinate-based nearby cards, not editorial recommendations.'::text)
      union all
      select to_jsonb('No licensed or AlgarveOfficial-owned gallery images were verified for this update, so no image gallery items were added.'::text)
      union all
      select to_jsonb('Blue Flag status for Praia do Alemão / Barranco das Canas was not verified for 2026 from ABAAE; no Blue Flag claim has been added.'::text)
    ) as notes
  );

  v_patch := jsonb_build_object(
    'short_description', v_short_description,
    'full_description', v_full_description,
    'highlights', jsonb_build_array(
      'Cliff-backed Portimão beach also associated with Barranco das Canas',
      'Bounded by Praia do Vau to the east and Ponta de João d''Arens to the west',
      'Pine grove and natural clifftop setting verified by Visit Portimão',
      'Beach support, lifeguard, first-aid station, WC and sunshade area listed by Visit Portimão',
      '2026 bathing season for Barranco das Canas verified from Diário da República',
      'Nearby cards link only to published internal AlgarveOfficial listings'
    ),
    'best_time_to_visit', v_best_time,
    'parking_info', 'Parking information was not verified from the official sources reviewed for this update. Visitors should confirm current parking and access conditions locally before relying on nearby parking.',
    'accessibility_info', 'Accessible-beach status, step-free access, adapted bathing equipment and assisted bathing support were not verified for Praia do Alemão / Barranco das Canas. The beach is cliff-backed, so visitors with reduced mobility should confirm the current access route before travelling.',
    'lifeguard_info', 'Visit Portimão lists lifeguard support, and Diário da República lists Barranco das Canas as a 2026 bathing beach from 1 June to 30 September. Exact daily staffing should still be checked locally through flags, signage and beach notices.',
    'blue_flag_info', 'Blue Flag status: not verified for 2026. Praia do Alemão / Barranco das Canas was not found in the official ABAAE 2026 awarded list checked on 19 May 2026.',
    'blue_flag_status', 'not_verified',
    'blue_flag_year', 2026,
    'lifeguard_season', jsonb_build_object(
      'year', 2026,
      'official_bathing_season', '1 June 2026 to 30 September 2026',
      'bathing_water', 'Barranco das Canas',
      'bathing_water_code', 'PTCX2T',
      'notes', 'Visit Portimão lists lifeguard support; exact daily staffing should be checked locally.'
    ),
    'google_maps_url', 'https://www.google.com/maps/search/?api=1&query=37.11938%2C-8.56381',
    'coordinates', jsonb_build_object(
      'latitude', 37.11938,
      'longitude', -8.56381,
      'label', 'Barranco das Canas / Praia do Alemão',
      'notes', 'Coordinates are APA bathing-water monitoring-point coordinates, not a surveyed beach-centre point.',
      'verification_status', 'Verified from APA bathing-water profile',
      'bathing_areas', jsonb_build_array()
    ),
    'facilities', jsonb_build_array(
      jsonb_build_object('name', 'Beach support', 'status', 'Seasonal / verified by Visit Portimão'),
      jsonb_build_object('name', 'Lifeguard', 'status', 'Seasonal / 2026 bathing season verified'),
      jsonb_build_object('name', 'First-aid station', 'status', 'Seasonal / verified by Visit Portimão'),
      jsonb_build_object('name', 'WC', 'status', 'Seasonal / verified by Visit Portimão'),
      jsonb_build_object('name', 'Sunshade area', 'status', 'Seasonal / verified by Visit Portimão'),
      jsonb_build_object('name', 'Bar', 'status', 'Seasonal / verified by parish source'),
      jsonb_build_object('name', 'Concession area', 'status', 'Seasonal / verified by parish source'),
      jsonb_build_object('name', 'Parking', 'status', 'Not verified'),
      jsonb_build_object('name', 'Accessible beach designation', 'status', 'Not verified'),
      jsonb_build_object('name', 'Blue Flag', 'status', 'Not verified for 2026')
    ),
    'important_notes', v_important_notes,
    'important_information', jsonb_build_object(
      'best_time_to_visit', v_best_time,
      'know_before_you_go', v_important_notes,
      'notes', jsonb_build_array(
        'Praia do Alemão is also identified as Praia Barranco das Canas in official/local sources.',
        'Diário da República lists Barranco das Canas with a 2026 bathing season from 1 June to 30 September.',
        'Visit Portimão lists beach support, lifeguard, first-aid station, WC and sunshade area.',
        'Parking and accessible-beach support were not verified from official sources reviewed.',
        'Blue Flag status was not verified for 2026 from the official ABAAE awarded list.',
        'The beach is cliff-backed; visitors should avoid cliff edges, cliff bases and unstable rock areas.'
      )
    ),
    'nearby_beaches', v_nearby_beaches,
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'faq_items', jsonb_build_array(
      jsonb_build_object('question', 'Where is Praia do Alemão?', 'answer', 'Praia do Alemão is on the Portimão coast, west of Praia do Vau and east of the Ponta de João d''Arens rock formation.'),
      jsonb_build_object('question', 'Is Praia do Alemão the same as Barranco das Canas?', 'answer', 'Official and local sources associate Praia do Alemão with Praia Barranco das Canas, and the 2026 bathing-season list uses the bathing-water name Barranco das Canas.'),
      jsonb_build_object('question', 'Is there parking at Praia do Alemão?', 'answer', 'Parking information was not verified from the official sources reviewed for this update. Confirm current parking and access conditions locally before travelling.'),
      jsonb_build_object('question', 'Is Praia do Alemão accessible?', 'answer', 'Accessible-beach status, step-free access and adapted bathing support were not verified. The beach is cliff-backed, so visitors with reduced mobility should confirm the current access route before travelling.'),
      jsonb_build_object('question', 'Are there lifeguards at Praia do Alemão?', 'answer', 'Visit Portimão lists lifeguard support, and Diário da República lists Barranco das Canas as a 2026 bathing beach from 1 June to 30 September. Exact daily staffing should be checked locally.'),
      jsonb_build_object('question', 'Is Praia do Alemão a Blue Flag beach?', 'answer', 'Blue Flag status was not verified for 2026. Praia do Alemão / Barranco das Canas was not found in the official ABAAE 2026 awarded list checked on 19 May 2026.'),
      jsonb_build_object('question', 'What are the nearest AlgarveOfficial beach listings?', 'answer', 'Nearby published AlgarveOfficial beach listings include Praia do Vau, Praia da Prainha, Praia dos Três Irmãos, Praia dos Três Castelos, Praia da Rocha and Praia de Alvor.'),
      jsonb_build_object('question', 'Are there restaurants near Praia do Alemão?', 'answer', 'Nearby restaurant cards on AlgarveOfficial link only to published internal listings and are based on stored coordinates. They include Restaurante F, NUMA, Vista Restaurant, Allgarbe Restaurante and Club Nau - Beach Club & Restaurant.'),
      jsonb_build_object('question', 'What is the best time to visit Praia do Alemão?', 'answer', 'June to September matches the official 2026 bathing season for Barranco das Canas. Late spring and early autumn are practical for clifftop walks and photography when heat is usually lower.')
    ),
    'sources_used', coalesce(v_sources, '[]'::jsonb),
    'verification_notes', coalesce(v_notes, '[]'::jsonb)
  );

  update public.listings
     set short_description = v_short_description,
         description = v_full_description,
         website_url = null,
         latitude = 37.11938,
         longitude = -8.56381,
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
