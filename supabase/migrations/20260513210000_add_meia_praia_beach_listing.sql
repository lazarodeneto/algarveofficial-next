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
  'Lagos',
  'lagos',
  'Historic western Algarve city with broad urban beaches, cliff coves, marina access and coastal routes.',
  37.11497,
  -8.65139,
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
  v_slug text := 'meia-praia-lagos';
  v_name text := 'Meia Praia';
  v_short_description text := $short$
Meia Praia is a large urban beach in Lagos, known for its broad sandy shoreline, easy city access and strong summer capacity. Stretching for several kilometres along the Bay of Lagos, it is one of the most practical beaches for long beach days near the city.
$short$;
  v_description text := $description$
Meia Praia is the largest and most spacious beach in the Lagos area, running east from the city and marina towards the Ria de Alvor. Official tourism sources describe it as an extensive sandy beach of around five kilometres, while Lagos municipality describes more than four kilometres of sand following the curve of the bay to the River Alvor.

Unlike the smaller cliff-backed coves west of Lagos, Meia Praia is open, broad and urban in character, with a long dune system behind the sand and wide views across the bay. Its scale makes it especially useful in summer, when the beach can accommodate far more visitors than the compact postcard coves around Dona Ana and Camilo. The western sections are closest to Lagos Marina, the railway station and the city, while the longer eastern sections feel more open and spacious.

Meia Praia suits visitors who want convenience, easy access, beach facilities and room for walking. Official sources list Blue Flag recognition, surveillance, sunshade rental, showers, parking, bars, restaurants, accessible-beach support and nautical activities such as surf, bodyboard, windsurf and sailing. These services may be seasonal and should be verified before visiting outside the main bathing season.

The beach is also useful for families and groups because of its size and support infrastructure, but natural conditions can vary. Visitors should follow local flags and signage, respect dune areas, and plan ahead in high summer, especially around the busiest western access points.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Meia Praia",
  "slug": "meia-praia-lagos",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Meia Praia / Lagos",
  "concelho": "Lagos",
  "municipality": "Lagos",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Meia Praia is a large urban beach in Lagos, known for its broad sandy shoreline, easy city access and strong summer capacity. Stretching for several kilometres along the Bay of Lagos, it is one of the most practical beaches for long beach days near the city.",
  "full_description": "Meia Praia is the largest and most spacious beach in the Lagos area, running east from the city and marina towards the Ria de Alvor. Official tourism sources describe it as an extensive sandy beach of around five kilometres, while Lagos municipality describes more than four kilometres of sand following the curve of the bay to the River Alvor.\n\nUnlike the smaller cliff-backed coves west of Lagos, Meia Praia is open, broad and urban in character, with a long dune system behind the sand and wide views across the bay. Its scale makes it especially useful in summer, when the beach can accommodate far more visitors than the compact postcard coves around Dona Ana and Camilo. The western sections are closest to Lagos Marina, the railway station and the city, while the longer eastern sections feel more open and spacious.\n\nMeia Praia suits visitors who want convenience, easy access, beach facilities and room for walking. Official sources list Blue Flag recognition, surveillance, sunshade rental, showers, parking, bars, restaurants, accessible-beach support and nautical activities such as surf, bodyboard, windsurf and sailing. These services may be seasonal and should be verified before visiting outside the main bathing season.\n\nThe beach is also useful for families and groups because of its size and support infrastructure, but natural conditions can vary. Visitors should follow local flags and signage, respect dune areas, and plan ahead in high summer, especially around the busiest western access points.",
  "coordinates": {
    "latitude": 37.11497,
    "longitude": -8.65139,
    "notes": "Coordinates were taken from the ABAAE Meia Praia Blue Flag entry."
  },
  "beach_type": "Large sandy urban maritime beach",
  "landscape": "A long, open sandy beach following the Bay of Lagos, backed by a dune cordon and extending towards the Ria de Alvor.",
  "access": "Access is supported by its position close to Lagos Marina and the railway station, with road access, parking and accessible-beach support verified by official sources. Conditions and available services may vary by section and season.",
  "highlights": [
    "Largest and most spacious beach in the Lagos area",
    "Extensive sandy shoreline of around five kilometres according to VisitPortugal",
    "Urban beach setting close to Lagos Marina and the railway station",
    "Dune-backed landscape following the curve of the Bay of Lagos",
    "Strong summer capacity compared with smaller Lagos coves",
    "Official 2026 Blue Flag season listed by ABAAE"
  ],
  "best_for": [
    "Families",
    "Groups",
    "Long beach walks",
    "Urban beach days",
    "Accessible beach access",
    "Water sports",
    "Resort-stay visitors",
    "Summer capacity",
    "Lagos city visitors"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach support", "status": "Verified" },
    { "name": "Accessible parking, ramp access, adapted toilet facilities and first-aid access under the Praia Acessivel criteria", "status": "Verified" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Surf, bodyboard, windsurf and sailing activity listed by official tourism source", "status": "Seasonal" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal surveillance",
    "Accessible beach support",
    "Car parking",
    "Bars and restaurants",
    "Seasonal water sports"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full summer beach support. Spring, early summer and early autumn are especially pleasant for long walks, quieter beach time and photography across the Bay of Lagos.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Meia Praia as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Meia Praia as 1 July 2026 to 30 September 2026.\nMeia Praia is large and has strong summer capacity, but the busiest sections are usually those closest to Lagos, the marina and main access points.\nFacilities and beach-support services may vary by section and season.\nDune areas should be respected and protected; use marked paths where available.\nSea and wind conditions can vary, particularly on this open bay beach.\nVisitors should follow local flags, signage and official safety guidance before swimming or practising water sports.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Meia Praia as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Meia Praia as 1 July 2026 to 30 September 2026.",
      "Meia Praia is large and has strong summer capacity, but the busiest sections are usually those closest to Lagos, the marina and main access points.",
      "Facilities and beach-support services may vary by section and season.",
      "Dune areas should be respected and protected; use marked paths where available.",
      "Sea and wind conditions can vary, particularly on this open bay beach.",
      "Visitors should follow local flags, signage and official safety guidance before swimming or practising water sports."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Meia Praia as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Meia Praia as 1 July 2026 to 30 September 2026.\nMeia Praia is large and has strong summer capacity, but the busiest sections are usually those closest to Lagos, the marina and main access points.\nFacilities and beach-support services may vary by section and season.\nDune areas should be respected and protected; use marked paths where available.\nSea and wind conditions can vary, particularly on this open bay beach.\nVisitors should follow local flags, signage and official safety guidance before swimming or practising water sports.",
  "best_time_to_visit": "June to September for the official bathing season and full summer beach support. Spring, early summer and early autumn are especially pleasant for long walks, quieter beach time and photography across the Bay of Lagos.",
  "suitable_for": [
    "Families",
    "Groups of friends",
    "Visitors staying in Lagos",
    "Visitors seeking a large beach with more space",
    "Beach walkers",
    "Water-sports users when conditions are suitable",
    "Visitors needing officially recognised accessible-beach support"
  ],
  "not_suitable_for": [
    "Visitors looking for a small secluded cove",
    "Visitors seeking dramatic cliff scenery directly on the beach",
    "Visitors who prefer compact beach settings with less walking distance",
    "Visitors who want guaranteed calm sea conditions"
  ],
  "nearby_attractions": [
    {
      "name": "Marina de Lagos",
      "type": "Marina",
      "description": "A lively marina area close to the western end of Meia Praia, useful for walks, services and access between the city and beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagos Historic Centre",
      "type": "Historic town centre",
      "description": "The historic centre of Lagos sits across from the marina area and offers restaurants, streets, monuments and cultural stops before or after the beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Ria de Alvor",
      "type": "Estuary and natural area",
      "description": "The eastern end of Meia Praia reaches towards the Ria de Alvor, an estuarine landscape associated with dunes, beaches and wetland scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Forte da Ponta da Bandeira",
      "type": "Historic fort",
      "description": "A well-preserved maritime fort near central Lagos and the city beaches, useful for combining beach time with Lagos heritage.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Batata",
      "type": "Nearby beach",
      "description": "A city-adjacent beach near central Lagos, offering a more compact alternative on the western side of the city seafront.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Lagos",
    "Odiaxere",
    "Alvor",
    "Praia da Luz",
    "Portimao"
  ],
  "walking_trails_nearby": [
    {
      "name": "Meia Praia beach walk",
      "description": "A long shoreline walk following the broad sandy beach from the Lagos marina side towards the Ria de Alvor, best planned according to tide, weather and wind conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Ecovia do Litoral - Lagos section",
      "description": "The wider Algarve coastal route passes through the Lagos municipality, with the municipal section running between Burgau and the Ribeira de Odiaxere. Visitors should confirm the latest route markings before using it.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose your beach section before travelling, as Meia Praia is long and access points vary.",
    "Use the western sections for easier access from Lagos Marina and the railway station.",
    "Walk further east for a more open beach feel, while still checking access and return distance.",
    "Arrive early in peak summer if you want the most convenient parking or serviced beach areas.",
    "Respect dune protection areas and use marked paths where available.",
    "Check wind and sea conditions before planning windsurfing, sailing or other water sports."
  ],
  "photography_notes": "Meia Praia is best photographed for scale, open sand, bay views and dune-backed coastline rather than cliff drama. Early morning and late afternoon light work well for wide beach views towards Lagos and the eastern bay.",
  "family_notes": "Meia Praia is well suited to families who want space, urban access and serviced beach sections. Families should still choose a suitable supervised area, check local flags and plan for walking distances on the sand.",
  "safety_notes": "Sea and wind conditions can vary on this open bay beach. Follow beach flags, local signage and seasonal surveillance guidance, and take care when practising water sports.",
  "accessibility_notes": "Official municipal information includes Meia Praia among Lagos beaches with Praia Acessivel recognition, supported by criteria such as accessible parking, ramp access to the bathing area, adapted toilets and first-aid access. Visitors with reduced mobility should still confirm the most suitable access point and current seasonal support before visiting.",
  "seo": {
    "meta_title": "Meia Praia, Lagos | Algarve Beach Guide",
    "meta_description": "Meia Praia in Lagos is a large urban Algarve beach with long sand, dunes, Blue Flag status, facilities and strong summer capacity.",
    "keywords": [
      "Meia Praia",
      "Meia Praia Lagos",
      "Lagos beaches",
      "Algarve beaches",
      "Portugal beaches",
      "large beach Lagos",
      "urban beach Algarve",
      "family beach Lagos",
      "accessible beach Lagos",
      "Ria de Alvor",
      "Lagos Marina",
      "water sports Lagos"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Meia Praia trip ideas",
      "links": [
        { "label": "Meia Praia" },
        { "label": "Meia Praia Lagos" },
        { "label": "Lagos beaches" },
        { "label": "large beach Lagos" },
        { "label": "accessible beach Lagos" },
        { "label": "water sports Lagos" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Lagos Marina" },
        { "label": "Ria de Alvor" },
        { "label": "Lagos Historic Centre" },
        { "label": "Praia da Batata" },
        { "label": "Forte da Ponta da Bandeira" },
        { "label": "Ecovia do Litoral" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Meia Praia",
      "source_url": "https://www.visitportugal.com/pt-pt/content/meia-praia",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Lagos",
        "Extensive sandy beach of around 5 km",
        "Position between the Marina and the Ria de Alvor",
        "Proximity to the railway station",
        "Accessibility support for visitors with reduced mobility",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar and restaurant",
        "Listed activities including surf, bodyboard, windsurf and sailing"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagos - Praias",
      "source_url": "https://www.cm-lagos.pt/descobrir-lagos/visitar/praias",
      "facts_verified": [
        "Meia Praia in Lagos municipality",
        "Beach length of more than four kilometres",
        "Curving bay setting to the River Alvor",
        "Dune cordon landscape",
        "Municipal listing of Blue Flag, accessible beach and lifeguard icons for Meia Praia"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Meia Praia",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/meia-praia/",
      "facts_verified": [
        "Official Meia Praia Blue Flag entry",
        "Municipality of Lagos",
        "Coastal beach classification",
        "Coordinates",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagos - Praia Acessivel, Praia para Todos",
      "source_url": "https://www.cm-lagos.pt/areas-de-atuacao/ambiente/epoca-balnear/152-praia-acessivel-praia-para-todos",
      "facts_verified": [
        "Meia Praia included among Lagos beaches with Praia Acessivel recognition",
        "Accessible-beach criteria including pedestrian access, reserved parking, ramp access, adapted sanitary facilities and first-aid access"
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73799",
      "facts_verified": [
        "Meia Praia east of Lagos",
        "Approximate five-kilometre sandy beach ending at the Ria de Alvor",
        "Lagos Marina and railway-station context",
        "Nearby Lagos beaches and city context"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagos - Bandeiras hasteadas nas praias de Lagos",
      "source_url": "https://www.cm-lagos.pt/municipio/noticias/14196-bandeiras-hasteadas-nas-praias-de-lagos",
      "facts_verified": [
        "2025 municipal confirmation of Blue Flag at Meia Praia",
        "2025 municipal confirmation of Praia Acessivel distinction at Meia Praia",
        "Lagos bathing season from 1 June to 30 September in that year",
        "Classification of Meia Praia as a bathing beach in Lagos"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagos - Ecovia do Litoral Sul Algarvio",
      "source_url": "https://www.cm-lagos.pt/municipio/noticias/11701-ecovia-do-litoral-sul-algarvio-o-que-e-e-como-utilizar",
      "facts_verified": [
        "Lagos municipality section of the Ecovia do Litoral Sul Algarvio",
        "Route between Burgau and Ribeira de Odiaxere",
        "Nearby route relevance for walkers and cyclists"
      ]
    },
    {
      "source_name": "VisitPortugal - Forte da Ponta da Bandeira",
      "source_url": "https://www.visitportugal.com/pt-pt/NR/exeres/C411AAEA-06C3-48DE-AF94-F497E49D39D5",
      "facts_verified": [
        "Historic fort in Lagos",
        "Late 17th-century defensive heritage",
        "Nearby heritage attraction for Lagos beach visitors"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Lagos municipality, large sandy character, city proximity, marina and Ria de Alvor context were verified from official tourism and municipal sources.",
    "The phrase strong summer capacity is used editorially and cautiously, based on the verified beach scale of more than four kilometres to around five kilometres and its listed support infrastructure.",
    "ABAAE verifies Meia Praia's 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "Facilities are included only where listed by official tourism or municipal sources and are marked Seasonal where operation may depend on the bathing season or concessions.",
    "Accessibility is verified from official municipal accessible-beach information, but visitors should still confirm the most suitable access point before travelling.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
  ]
}
$json$;
begin
  select id into v_category_id
  from public.categories
  where slug = 'beaches'
  limit 1;

  if v_category_id is null then
    raise exception 'Required category beaches was not found';
  end if;

  select id into v_city_id
  from public.cities
  where slug = 'lagos'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city lagos was not found';
  end if;

  select id, slug, tier, category_id
    into v_listing_id, v_old_slug, v_existing_tier, v_existing_category_id
  from public.listings
  where slug = v_slug
     or lower(name) = lower(v_name)
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
      btrim(v_description),
      btrim(v_short_description),
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'verified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      'https://www.visitportugal.com/pt-pt/content/meia-praia',
      'Meia Praia, Lagos, Algarve, Portugal',
      37.11497,
      -8.65139,
      array[
        'Meia Praia',
        'Meia Praia Lagos',
        'Lagos beaches',
        'Algarve beaches',
        'Portugal beaches',
        'large beach Lagos',
        'urban beach Algarve',
        'family beach Lagos',
        'accessible beach Lagos',
        'Ria de Alvor',
        'Lagos Marina',
        'water sports Lagos'
      ],
      v_category_data,
      'Meia Praia, Lagos | Algarve Beach Guide',
      'Meia Praia in Lagos is a large urban Algarve beach with long sand, dunes, Blue Flag status, facilities and strong summer capacity.',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = btrim(v_description),
      short_description = btrim(v_short_description),
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      tier = 'verified'::public.listing_tier,
      status = 'published'::public.listing_status,
      website_url = 'https://www.visitportugal.com/pt-pt/content/meia-praia',
      contact_phone = null,
      contact_email = null,
      whatsapp_number = null,
      instagram_url = null,
      facebook_url = null,
      linkedin_url = null,
      twitter_url = null,
      youtube_url = null,
      tiktok_url = null,
      google_business_url = null,
      google_rating = null,
      google_review_count = null,
      address = 'Meia Praia, Lagos, Algarve, Portugal',
      latitude = 37.11497,
      longitude = -8.65139,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Meia Praia',
        'Meia Praia Lagos',
        'Lagos beaches',
        'Algarve beaches',
        'Portugal beaches',
        'large beach Lagos',
        'urban beach Algarve',
        'family beach Lagos',
        'accessible beach Lagos',
        'Ria de Alvor',
        'Lagos Marina',
        'water sports Lagos'
      ],
      category_data = v_category_data,
      meta_title = 'Meia Praia, Lagos | Algarve Beach Guide',
      meta_description = 'Meia Praia in Lagos is a large urban Algarve beach with long sand, dunes, Blue Flag status, facilities and strong summer capacity.',
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
  end if;
end $$;

commit;
