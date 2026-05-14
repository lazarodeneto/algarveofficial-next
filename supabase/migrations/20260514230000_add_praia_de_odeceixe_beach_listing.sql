begin;

insert into public.categories (name, slug, icon, display_order, is_active, is_featured)
values ('Beaches', 'beaches', 'Umbrella', 30, true, true)
on conflict (slug) do update set
  name = excluded.name,
  icon = coalesce(public.categories.icon, excluded.icon),
  is_active = true,
  updated_at = now();

insert into public.cities (name, slug, short_description, latitude, longitude, is_active, is_featured)
values (
  'Odeceixe',
  'odeceixe',
  'Northern Algarve village in Aljezur known for the Ribeira de Seixe, Costa Vicentina scenery and Atlantic beach access.',
  37.4332,
  -8.7708,
  true,
  false
)
on conflict (slug) do update set
  name = excluded.name,
  short_description = coalesce(public.cities.short_description, excluded.short_description),
  latitude = coalesce(public.cities.latitude, excluded.latitude),
  longitude = coalesce(public.cities.longitude, excluded.longitude),
  is_active = true,
  updated_at = now();

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_listing_id uuid;
  v_old_slug text;
  v_existing_tier public.listing_tier;
  v_existing_category_id uuid;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid := null;
  v_slug text := 'praia-de-odeceixe-aljezur';
  v_name text := 'Praia de Odeceixe';
  v_address text := 'Praia de Odeceixe, Odeceixe, Aljezur, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-de-odeceixe';
  v_latitude numeric := 37.441306;
  v_longitude numeric := -8.797775;
  v_alias_names text[] := array[
    'Odeceixe Beach',
    'Odeceixe-Mar',
    'Praia de Odeceixe-Mar'
  ];
  v_alias_slugs text[] := array[
    'praia-de-odeceixe',
    'odeceixe-mar'
  ];
  v_alias_slug text;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Odeceixe",
  "slug": "praia-de-odeceixe-aljezur",
  "aliases": [
    "Odeceixe Beach",
    "Odeceixe-Mar",
    "Praia de Odeceixe-Mar"
  ],
  "alias_slugs": [
    "praia-de-odeceixe",
    "odeceixe-mar"
  ],
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Odeceixe",
  "concelho": "Aljezur",
  "municipality": "Aljezur",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Odeceixe is a scenic maritime beach in Aljezur, set where the Ribeira de Seixe meets the Atlantic at the northern edge of the Algarve. It is known for its broad sandy setting, sea-and-river landscape, surf conditions and dramatic Costa Vicentina scenery.",
  "full_description": "Praia de Odeceixe sits at the mouth of the Ribeira de Seixe, close to the village of Odeceixe and the northern boundary of the Algarve. Official tourism sources describe it as a maritime beach where visitors can choose between the Atlantic side and the river side, with shallow lagoon-like areas forming across the wide sand at low tide.\n\nThe setting is one of the most distinctive on the Costa Vicentina. A broad tongue of sand curves between cliffs, river water and open ocean, creating a beach that feels both wild and accessible. VisitPortugal describes access from Odeceixe as very easy, while official beach listings verify parking, bar, restaurant, safety or surveillance, surf and Blue Flag recognition. The official 2026 bathing season for Odeceixe-Mar runs from 1 June to 30 September.\n\nPraia de Odeceixe is suitable for visitors who want more than a standard beach day: families may appreciate the low-tide sandy pools, surfers come for Atlantic conditions, and walkers can connect the area with the Rota Vicentina and the Fishermen’s Trail. However, the west coast is exposed and sea conditions can vary. Visitors should always follow beach flags, signage and lifeguard instructions during the bathing season.\n\nTo the south, Praia das Adegas is a verified official naturist beach, while inland Odeceixe village and Aljezur’s historic centre add cultural context to a visit. This is a strong AlgarveOfficial listing for travellers seeking natural scenery, coastal walking and a wilder expression of the Algarve.",
  "coordinates": {
    "latitude": 37.441306,
    "longitude": -8.797775,
    "label": "Praia de Odeceixe - Odeceixe-Mar",
    "notes": "Coordinates were verified from the official 2026 Blue Flag awarded list for Odeceixe-Mar.",
    "bathing_areas": [
      {
        "name": "Odeceixe-Mar",
        "latitude": 37.441306,
        "longitude": -8.797775,
        "type": "Atlantic river-mouth beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Maritime beach at a river mouth",
  "landscape": "A broad sandy beach set between the Atlantic Ocean and the Ribeira de Seixe, framed by cliffs and Costa Vicentina coastal scenery.",
  "access": "VisitPortugal describes access from the locality of Odeceixe as very easy and lists access by car or motorcycle and on foot. Step-free accessibility has not been verified.",
  "highlights": [
    "Beach at the mouth of the Ribeira de Seixe",
    "Choice of sea and river bathing areas, depending on conditions",
    "Wide sandy beach with small low-tide lagoons",
    "Blue Flag beach listed for 2026 as Odeceixe-Mar",
    "Surf listed by VisitPortugal",
    "Close to Praia das Adegas and the Rota Vicentina"
  ],
  "best_for": [
    "Scenic views",
    "Families",
    "Surfing",
    "Photography",
    "Coastal walks",
    "Nature lovers",
    "River and sea landscapes"
  ],
  "facilities": [
    { "name": "Blue Flag status for Odeceixe-Mar in 2026", "status": "Verified" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal" },
    { "name": "Parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified" },
    { "name": "Restaurant", "status": "Verified" },
    { "name": "Surf activity listed by VisitPortugal", "status": "Verified" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Sunbed or parasol rental", "status": "Not verified" },
    { "name": "Step-free access", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag status for Odeceixe-Mar in 2026",
    "Seasonal safety or surveillance",
    "Parking",
    "Bar and restaurant",
    "Surf activity",
    "River-mouth landscape",
    "Nearby Rota Vicentina walking context",
    "Nearby official naturist beach at Praia das Adegas"
  ],
  "important_information": {
    "best_time_to_visit": "June to September aligns with the official 2026 bathing season. Spring and autumn are especially suitable for coastal walks, photography and quieter visits, while summer mornings are best for easier parking and lower heat.",
    "know_before_you_go": "The official 2026 bathing season for Odeceixe-Mar is listed as 1 June to 30 September.\nSea conditions on the west coast can vary and may be exposed; check flags, signage and lifeguard instructions before entering the water.\nSmall lagoons can form on the sand at low tide, but conditions depend on tide, river flow and weather.\nThe beach is associated with the Costa Vicentina landscape and should be visited with care for dunes, cliffs and natural habitats.\nFacilities may operate seasonally; verify current services before planning a full beach day.\nPraia das Adegas, immediately to the south, is an official naturist beach.",
    "notes": [
      "The official 2026 bathing season for Odeceixe-Mar is listed as 1 June to 30 September.",
      "Sea conditions on the west coast can vary and may be exposed; check flags, signage and lifeguard instructions before entering the water.",
      "Small lagoons can form on the sand at low tide, but conditions depend on tide, river flow and weather.",
      "The beach is associated with the Costa Vicentina landscape and should be visited with care for dunes, cliffs and natural habitats.",
      "Facilities may operate seasonally; verify current services before planning a full beach day.",
      "Praia das Adegas, immediately to the south, is an official naturist beach."
    ]
  },
  "important_notes": "The official 2026 bathing season for Odeceixe-Mar is listed as 1 June to 30 September.\nSea conditions on the west coast can vary and may be exposed; check flags, signage and lifeguard instructions before entering the water.\nSmall lagoons can form on the sand at low tide, but conditions depend on tide, river flow and weather.\nThe beach is associated with the Costa Vicentina landscape and should be visited with care for dunes, cliffs and natural habitats.\nFacilities may operate seasonally; verify current services before planning a full beach day.\nPraia das Adegas, immediately to the south, is an official naturist beach.",
  "best_time_to_visit": "June to September aligns with the official 2026 bathing season. Spring and autumn are especially suitable for coastal walks, photography and quieter visits, while summer mornings are best for easier parking and lower heat.",
  "suitable_for": [
    "Families who check conditions and stay within supervised areas",
    "Surfers and bodyboarders",
    "Walkers using nearby Rota Vicentina routes",
    "Photographers",
    "Nature-focused visitors",
    "Travellers exploring the northern Algarve"
  ],
  "not_suitable_for": [
    "Visitors seeking a sheltered south-coast cove",
    "Visitors requiring fully verified step-free beach access",
    "Anyone ignoring sea-condition warnings or beach flags",
    "Visitors expecting guaranteed calm water",
    "Visitors who require verified year-round facilities"
  ],
  "nearby_attractions": [
    {
      "name": "Praia das Adegas",
      "type": "Beach / naturist beach",
      "description": "A small cove south of Praia de Odeceixe, verified by VisitAlgarve and Aljezur municipal sources as an official naturist beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Ribeira de Seixe",
      "type": "River / natural feature",
      "description": "The river that reaches the sea at Praia de Odeceixe, creating the beach’s distinctive river-and-ocean setting.",
      "verification_status": "Verified"
    },
    {
      "name": "Odeceixe village",
      "type": "Village",
      "description": "The nearby village that gives access to the beach and forms the northern gateway to the Algarve’s Costa Vicentina.",
      "verification_status": "Verified"
    },
    {
      "name": "Rota Vicentina - Fishermen’s Trail",
      "type": "Walking trail",
      "description": "A long-distance coastal walking route with an Odeceixe to Aljezur stage passing through the Algarve-side coastal landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "type": "Protected natural area",
      "description": "A protected coastal landscape of cliffs, beaches, dunes and Atlantic habitats along Portugal’s south-west coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Castelo de Aljezur",
      "type": "Historic monument",
      "description": "A hilltop castle in Aljezur with origins connected to the region’s medieval defensive history.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Odeceixe",
    "Aljezur",
    "Rogil",
    "Zambujeira do Mar"
  ],
  "walking_trails_nearby": [
    {
      "name": "Rota Vicentina - Fishermen’s Trail: Odeceixe to Aljezur",
      "description": "Official Rota Vicentina stage beginning from the Algarve-side Odeceixe coastal area and continuing towards Aljezur. The wider Fishermen’s Trail is a coastal walking route with sandy sections, cliffs and environmental sensitivity.",
      "verification_status": "Verified"
    },
    {
      "name": "Odeceixe to the Sea",
      "description": "Rota Vicentina circular walking route associated with Odeceixe and the coast. Exact route conditions should be checked before setting out.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check tide times if planning to enjoy the low-tide lagoons or river edge.",
    "Use beach flags and official signage to decide where to swim.",
    "Arrive early in summer, especially during the official bathing season.",
    "Bring wind protection, as the west coast can be breezier than the south Algarve.",
    "Keep to marked paths near cliffs and dunes.",
    "Be aware that Praia das Adegas nearby is an official naturist beach."
  ],
  "photography_notes": "Praia de Odeceixe is strong for wide landscape photography, especially from elevated viewpoints where the river, sandbank and Atlantic can be framed together. Low tide can reveal attractive patterns across the sand, but cliff-edge safety should always come first.",
  "family_notes": "VisitPortugal notes that small lagoons formed at low tide are appreciated by children. Families should still check tide, river and sea conditions, stay within supervised areas during the bathing season, and avoid relying on the river or sea being calm.",
  "safety_notes": "The Atlantic west coast can be exposed. Visitors should follow beach flags, official signage and lifeguard instructions during the bathing season. Do not swim if conditions are uncertain, and keep a safe distance from cliff edges and unstable slopes.",
  "accessibility_notes": "Step-free accessibility information was not fully verified. VisitPortugal describes access from Odeceixe as very easy, but visitors with reduced mobility should confirm current access, parking and beach-support conditions before visiting.",
  "seo": {
    "meta_title": "Praia de Odeceixe, Aljezur | Algarve Beach",
    "meta_description": "Discover Praia de Odeceixe in Aljezur: a Blue Flag Algarve beach with river, sea, surf, cliffs, Rota Vicentina walks and visitor tips.",
    "keywords": [
      "Praia de Odeceixe",
      "Odeceixe beach",
      "Odeceixe-Mar",
      "Aljezur beach",
      "Algarve beaches",
      "Portugal beaches",
      "Costa Vicentina beach",
      "Ribeira de Seixe",
      "Rota Vicentina Odeceixe",
      "surf beach Aljezur"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Odeceixe",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-odeceixe",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Aljezur",
        "Mouth of Ribeira de Seixe",
        "Sea and river bathing context",
        "Low-tide lagoons on the sand",
        "Easy access from Odeceixe",
        "Blue Flag listed",
        "Safety or surveillance listed",
        "Parking listed",
        "Bar listed",
        "Restaurant listed",
        "Surf listed",
        "Access by car or motorcycle and on foot listed",
        "Average summer water temperature listed as 17-18 ºC"
      ]
    },
    {
      "source_name": "Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Odeceixe-Mar listed as a 2026 Blue Flag coastal beach",
        "Concelho Aljezur",
        "Coordinates 37.441306, -8.797775"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://files.diariodarepublica.pt/1s/2026/04/08401/0000200039.pdf",
      "facts_verified": [
        "Odeceixe-Mar bathing water code PTCU9K",
        "Official 2026 bathing season from 1 June to 30 September",
        "Odeceixe-Mar listed in Aljezur, Algarve"
      ]
    },
    {
      "source_name": "Agência Portuguesa do Ambiente - Odeceixe-Mar bathing water profile",
      "source_url": "https://apambiente.pt/sites/default/files/_SNIAMB_A_APA/Comunicacao/Epoca_balnear/PerfisAB/ARH_Algarve/PerfisAguasBalnearesBilingues/ALJEZUR/OdeceixeMar_PTCU9K.pdf",
      "facts_verified": [
        "Odeceixe-Mar bathing water profile",
        "Beach length 330 m",
        "Tidal range 3.4-3.5 m",
        "Mean high wave 1 m",
        "Usual wind direction N/NW",
        "Pollution warning protocol for bathing water quality"
      ]
    },
    {
      "source_name": "VisitAlgarve - Praia de Odeceixe e Praia das Adegas",
      "source_url": "https://visitalgarve.pt/equipamento/8766/Praia%20de%20Odeceixe",
      "facts_verified": [
        "Praia de Odeceixe tourism listing",
        "Nearby Praia das Adegas south of Odeceixe",
        "Praia das Adegas as official naturist beach",
        "High-tide access to Praia das Adegas by a pedestrian path down the cliff"
      ]
    },
    {
      "source_name": "Município de Aljezur - Praia de Odeceixe",
      "source_url": "https://cm-aljezur.pt/pt/573/praia-de-odeceixe.aspx",
      "facts_verified": [
        "Municipal beach page for Praia de Odeceixe",
        "Praia de Odeceixe recognised as one of the 7 Maravilhas - Praias de Portugal",
        "Blue Flag reference",
        "Landscape and biodiversity context"
      ]
    },
    {
      "source_name": "Município de Aljezur - Praia das Adegas",
      "source_url": "https://cm-aljezur.pt/pt/860/praia-das-adegas.aspx",
      "facts_verified": [
        "Praia das Adegas located south of Praia de Odeceixe",
        "Praia das Adegas as official naturist beach",
        "Low-tide relationship with Praia de Odeceixe"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail total of 13 stages and 226.5 km",
        "Coastal single-track walking route",
        "Trail passes along cliffs and sandy sections",
        "Route is for walking only",
        "Environmental and cliff safety notes"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail: Odeceixe to Aljezur",
      "source_url": "https://rotavicentina.com/en/walking/fishermens-trail-odeceixe-aljezur/",
      "facts_verified": [
        "Odeceixe to Aljezur stage",
        "Reference to Praia de Odeceixe on the southern shore in Algarve territory"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina",
      "facts_verified": [
        "Protected natural area context",
        "South-west coastal landscape of cliffs and beaches",
        "Environmental sensitivity of the wider Costa Vicentina area"
      ]
    },
    {
      "source_name": "VisitPortugal - Castelo de Aljezur",
      "source_url": "https://www.visitportugal.com/pt-pt/content/castelo-de-aljezur",
      "facts_verified": [
        "Castelo de Aljezur as a nearby historic attraction",
        "Historical and defensive context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, maritime classification, river-mouth setting, Blue Flag 2026 status and coordinates were verified from official tourism, Blue Flag and Diário da República sources.",
    "VisitPortugal lists parking, bar, restaurant, safety or surveillance and surf; exact opening times and seasonal operation should be verified before publication.",
    "The 2026 official bathing season for Odeceixe-Mar is 1 June to 30 September.",
    "Step-free accessibility, public toilets, sunbed rental, dog rules and exact lifeguard staffing were not independently verified and have not been claimed.",
    "Praia das Adegas is nearby and verified as an official naturist beach; this is included as practical visitor context.",
    "Some information could not be verified from authoritative sources. I have left those fields blank or marked them as Not verified."
  ]
}
$json$;
begin
  v_tags := array(
    select jsonb_array_elements_text(v_category_data #> '{seo,keywords}')
  );

  select id into v_category_id
  from public.categories
  where slug = 'beaches';

  if v_category_id is null then
    raise exception 'Beaches category was not found';
  end if;

  select id into v_city_id
  from public.cities
  where slug = 'odeceixe';

  if v_city_id is null then
    raise exception 'Odeceixe city was not found';
  end if;

  select id, slug, tier, category_id
    into v_listing_id, v_old_slug, v_existing_tier, v_existing_category_id
  from public.listings
  where slug = v_slug
     or slug = any(v_alias_slugs)
     or lower(name) = lower(v_name)
     or lower(name) = any(array(
       select lower(alias_value)
       from unnest(v_alias_names) as alias_name(alias_value)
     ))
  order by case when slug = v_slug then 0 else 1 end, updated_at desc
  limit 1;

  if v_listing_id is not null and (
    v_existing_tier is distinct from 'verified'::public.listing_tier
    or v_existing_category_id is distinct from v_category_id
  ) then
    update public.listings
    set
      slug = v_slug || '-legacy-' || left(v_listing_id::text, 8),
      status = 'archived'::public.listing_status,
      updated_at = now()
    where id = v_listing_id;

    if to_regclass('public.listing_slugs') is not null then
      delete from public.listing_slugs
      where slug = v_slug;
    end if;

    v_listing_id := null;
    v_old_slug := null;
  end if;

  if v_listing_id is null then
    insert into public.listings (
      name,
      slug,
      description,
      short_description,
      owner_id,
      category_id,
      city_id,
      region_id,
      tier,
      status,
      is_curated,
      website_url,
      address,
      latitude,
      longitude,
      tags,
      category_data,
      meta_title,
      meta_description,
      published_at
    ) values (
      v_name,
      v_slug,
      btrim(v_category_data->>'full_description'),
      btrim(v_category_data->>'short_description'),
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      v_website_url,
      v_address,
      v_latitude,
      v_longitude,
      v_tags,
      v_category_data,
      v_category_data #>> '{seo,meta_title}',
      v_category_data #>> '{seo,meta_description}',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_category_data->>'full_description'),
      short_description = btrim(v_category_data->>'short_description'),
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = v_website_url,
      contact_phone = null,
      contact_email = null,
      whatsapp_number = null,
      instagram_url = null,
      facebook_url = null,
      linkedin_url = null,
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      telegram_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = v_address,
      latitude = v_latitude,
      longitude = v_longitude,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = v_tags,
      category_data = v_category_data,
      meta_title = v_category_data #>> '{seo,meta_title}',
      meta_description = v_category_data #>> '{seo,meta_description}',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id
      and slug <> v_slug;

    if v_old_slug is not null and v_old_slug <> v_slug then
      insert into public.listing_slugs (listing_id, slug, is_current)
      values (v_listing_id, v_old_slug, false)
      on conflict (slug) do update set
        listing_id = excluded.listing_id,
        is_current = false
      where public.listing_slugs.listing_id = excluded.listing_id;
    end if;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, v_slug, true)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = true
    where public.listing_slugs.listing_id = excluded.listing_id;

    foreach v_alias_slug in array v_alias_slugs loop
      if v_alias_slug <> v_slug then
        insert into public.listing_slugs (listing_id, slug, is_current)
        values (v_listing_id, v_alias_slug, false)
        on conflict (slug) do update set
          listing_id = excluded.listing_id,
          is_current = false
        where public.listing_slugs.listing_id = excluded.listing_id;
      end if;
    end loop;
  end if;
end $$;

commit;
