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
  'Sagres',
  'sagres',
  'South-west Algarve village known for Atlantic beaches, surf, cliffs and the Cabo de São Vicente headland.',
  37.009,
  -8.943,
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
  v_slug text := 'praia-da-mareta-vila-do-bispo';
  v_name text := 'Praia da Mareta';
  v_address text := 'Praia da Mareta, Sagres, Vila do Bispo, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/node/141502';
  v_latitude numeric := 37.0057;
  v_longitude numeric := -8.9393;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Mareta",
  "slug": "praia-da-mareta-vila-do-bispo",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Sagres",
  "concelho": "Vila do Bispo",
  "municipality": "Vila do Bispo",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Mareta is a central Sagres beach in Vila do Bispo, known for its large sandy bay, easy village access and sheltered position beside Ponta de Sagres. It is one of the most popular summer beaches in the Sagres area.",
  "full_description": "Praia da Mareta is the main central beach of Sagres, set in a broad sandy bay close to the village centre and the historic Ponta de Sagres. Official tourism sources describe it as having a large sandy extent and good access from Sagres, making it one of the most popular summer beaches in this part of Vila do Bispo.\n\nThe beach is framed by high cliffs to the east and by Ponta de Sagres to the west, which gives the bay a more sheltered character than many of the exposed Atlantic beaches around the south-western Algarve. This makes Mareta especially practical for visitors staying in Sagres who want a beach within easy reach of restaurants, accommodation and the wider headland area.\n\nMareta also has a nautical side. VisitPortugal lists surfing, bodyboarding and diving, and describes the beach as appreciated for diving conditions. These activities remain dependent on sea state, wind, local rules and seasonal services, so visitors should always check flags and conditions before entering the water.\n\nABAAE lists Praia da Mareta as a 2026 Blue Flag beach, with official bathing and Blue Flag seasons. The beach can become busy in summer because of its central location and easier access, particularly around the main entries and serviced areas. Visitors seeking a calmer experience may prefer early morning, late afternoon or shoulder-season visits.",
  "coordinates": {
    "latitude": 37.0057,
    "longitude": -8.9393,
    "label": "Praia da Mareta",
    "notes": "Coordinates were taken from the official ABAAE Mareta beach entry."
  },
  "beach_type": "Large sandy maritime beach in a sheltered bay",
  "landscape": "A broad sandy bay in central Sagres, enclosed by high cliffs to the east and protected to the west by Ponta de Sagres, with Atlantic views and a village-backed setting.",
  "access": "VisitPortugal verifies good access from Sagres and lists access by car, motorcycle and on foot. Visitors should confirm current parking and access conditions during peak summer.",
  "highlights": [
    "Central Sagres beach with easy village access",
    "Large sandy bay framed by cliffs and Ponta de Sagres",
    "One of the most popular summer beaches in the Sagres area",
    "Diving, surfing and bodyboarding listed by official tourism sources",
    "Close to Fortaleza de Sagres and Cabo de São Vicente routes",
    "Official 2026 Blue Flag listing for Mareta"
  ],
  "best_for": [
    "Central beach days",
    "Families using serviced sections",
    "Couples",
    "Diving when conditions are suitable",
    "Surfing when conditions are suitable",
    "Bodyboarding when conditions are suitable",
    "Sagres village visitors",
    "Photography",
    "Coastal walks"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Surfing activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Bodyboard activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Sunshade rental",
    "Small craft hire",
    "Outdoor parking",
    "Bar and restaurant",
    "Surfing, bodyboard and diving activity",
    "Central Sagres village access"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full summer beach atmosphere. May, June and September are often better for easier access, photography and a more comfortable central Sagres beach visit.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Mareta as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Mareta as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Mareta is central and popular, so it can become busy during the main summer season.\nThe bay is described by VisitPortugal as protected by Ponta de Sagres from stronger winds, but sea and wind conditions can still vary.\nFacilities, surveillance and nautical activity may vary by season and local conditions.\nVisitors should follow local flags, signage and official safety guidance before swimming, diving or using small craft.\nCliff-backed areas require care; visitors should avoid cliff edges and cliff bases.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Mareta as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Mareta as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia da Mareta is central and popular, so it can become busy during the main summer season.",
      "The bay is described by VisitPortugal as protected by Ponta de Sagres from stronger winds, but sea and wind conditions can still vary.",
      "Facilities, surveillance and nautical activity may vary by season and local conditions.",
      "Visitors should follow local flags, signage and official safety guidance before swimming, diving or using small craft.",
      "Cliff-backed areas require care; visitors should avoid cliff edges and cliff bases."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Mareta as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Mareta as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Mareta is central and popular, so it can become busy during the main summer season.\nThe bay is described by VisitPortugal as protected by Ponta de Sagres from stronger winds, but sea and wind conditions can still vary.\nFacilities, surveillance and nautical activity may vary by season and local conditions.\nVisitors should follow local flags, signage and official safety guidance before swimming, diving or using small craft.\nCliff-backed areas require care; visitors should avoid cliff edges and cliff bases.",
  "best_time_to_visit": "June to September for the official bathing season and full summer beach atmosphere. May, June and September are often better for easier access, photography and a more comfortable central Sagres beach visit.",
  "suitable_for": [
    "Visitors staying in Sagres",
    "Families who want a central beach with services nearby",
    "Couples",
    "Visitors combining beach time with Fortaleza de Sagres",
    "Diving users when conditions are suitable",
    "Surf and bodyboard users when conditions are suitable",
    "Short-stay visitors exploring Vila do Bispo"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Those wishing to avoid popular central beaches in summer",
    "Visitors requiring verified accessible-beach support",
    "Visitors expecting guaranteed calm sea conditions",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Fortaleza de Sagres",
      "type": "Historic fortress",
      "description": "A major historic monument on Ponta de Sagres, associated with Infante D. Henrique, Portuguese maritime history and broad sea views.",
      "verification_status": "Verified"
    },
    {
      "name": "Ponta de Sagres",
      "type": "Headland",
      "description": "The rocky headland west of Mareta, forming part of the bay’s shelter and carrying the historic fortress complex.",
      "verification_status": "Verified"
    },
    {
      "name": "Cabo de São Vicente",
      "type": "Headland and lighthouse area",
      "description": "A symbolic south-western headland near Sagres, described by VisitPortugal as the extreme south-west of continental Europe.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Tonel",
      "type": "Nearby beach",
      "description": "A nearby Sagres surf beach west of the village, useful for visitors comparing wind and wave conditions around the headland.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Martinhal",
      "type": "Nearby beach",
      "description": "A beach around 2 km from Sagres, listed by VisitPortugal for its large sandy area and surf and windsurf use.",
      "verification_status": "Verified"
    },
    {
      "name": "Sagres village centre",
      "type": "Village centre",
      "description": "The village centre sits close to Mareta and provides restaurants, accommodation, local services and access to Sagres coastal landmarks.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Sagres",
    "Vila do Bispo",
    "Raposeira",
    "Budens",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Mareta to Fortaleza de Sagres local walk",
      "description": "A short local coastal walk from the central Sagres area towards the fortress and Ponta de Sagres. Visitors should use safe paths and avoid cliff edges.",
      "verification_status": "Not verified"
    },
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Sagres area",
      "description": "The wider Rota Vicentina coastal walking network passes through the Sagres and south-west Algarve area, with exposed coastal terrain, cliffs and Atlantic views.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho Histórico: Vila do Bispo - Cabo de São Vicente",
      "description": "A 14 km Rota Vicentina section listed by Portuguese Trails, ending near Cabo de São Vicente and relevant for visitors exploring the wider Sagres and Vila do Bispo coastline.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August, as Mareta is central and popular.",
    "Check local flags and sea conditions before swimming, diving, surfing or bodyboarding.",
    "Use Mareta as a practical beach stop before or after visiting Fortaleza de Sagres.",
    "Bring a light layer outside summer, as Sagres can be windy even on sunny days.",
    "Confirm seasonal services before relying on sunshade rental, small craft hire or beach support.",
    "Avoid cliff bases and cliff edges, especially when taking photographs."
  ],
  "photography_notes": "Praia da Mareta photographs well from the beach, the surrounding cliff-safe viewpoints and the approach towards Ponta de Sagres. The bay, cliffs and fortress-side headland are strongest in early morning or late-afternoon light.",
  "family_notes": "Praia da Mareta can suit families because of its central Sagres location, large sandy area and verified seasonal beach services. Families should still check flags, supervise children closely and avoid cliff-backed areas.",
  "safety_notes": "Sea and wind conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take care near cliffs, rocky sections and any nautical activity areas.",
  "accessibility_notes": "Accessible beach support was not verified from authoritative current sources. Visitors with reduced mobility should confirm current access, parking, beach-entry surface and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia da Mareta, Vila do Bispo | Sagres Beach Guide",
    "meta_description": "Praia da Mareta in Sagres is a central Vila do Bispo beach with a large sandy bay, easy access, diving appeal and Blue Flag status.",
    "keywords": [
      "Praia da Mareta",
      "Mareta Beach",
      "Praia da Mareta Sagres",
      "Vila do Bispo beaches",
      "Sagres beaches",
      "Algarve beaches",
      "Portugal beaches",
      "central Sagres beach",
      "Blue Flag Mareta",
      "Fortaleza de Sagres",
      "Ponta de Sagres",
      "Cabo de São Vicente",
      "diving beach Sagres"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Mareta",
      "source_url": "https://www.visitportugal.com/en/node/141502",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Sagres, Vila do Bispo",
        "Large sandy extent",
        "Good access from Sagres",
        "Popularity during summer",
        "High cliffs to the east",
        "Ponta de Sagres to the west",
        "Bay-like beach character",
        "Diving relevance",
        "Facilities including Blue Flag, security or surveillance, sunshade rental, small craft hire, outdoor parking, bar and restaurant",
        "Activities listed including surfing, bodyboard and diving",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Mareta",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/mareta/",
      "facts_verified": [
        "Official Mareta beach entry",
        "Coastal beach classification",
        "Municipality of Vila do Bispo",
        "Coordinates",
        "Beach code PTCX2C",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Mareta listed among 2026 Blue Flag coastal beaches",
        "Mareta coordinates and Vila do Bispo municipality cross-checked"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - Mareta",
      "source_url": "https://www.cm-viladobispo.pt/visitar/o-que-visitar/praias/mareta",
      "facts_verified": [
        "Municipal beach page for Mareta",
        "Urban beach in Sagres",
        "Bay of Mareta setting",
        "Easy access and sheltered character, based on official search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/sagres-1",
      "facts_verified": [
        "Sagres village context",
        "Ponta de Sagres historical context",
        "Cabo de São Vicente nearby",
        "South-western continental location context"
      ]
    },
    {
      "source_name": "VisitPortugal - Fortaleza de Sagres",
      "source_url": "https://www.visitportugal.com/en/content/fortaleza-de-sagres",
      "facts_verified": [
        "Fortaleza de Sagres as nearby monument",
        "Ponta de Sagres and Promontorium Sacrum context",
        "Infante D. Henrique and Portuguese maritime-history context",
        "Panorama over the sea and Cabo de São Vicente"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Martinhal",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-martinhal",
      "facts_verified": [
        "Nearby Praia do Martinhal",
        "Location 2 km from Sagres",
        "Large sandy beach",
        "Surf and windsurf relevance"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail coastal walking network",
        "Route follows coastal paths and cliffs",
        "Walking-only and fragile-ecosystem context"
      ]
    },
    {
      "source_name": "Portuguese Trails - Caminho Histórico / Vila do Bispo - Cabo de São Vicente",
      "source_url": "https://www.portuguesetrails.com/pt-pt/routes/rota-vicentina-algarve-walking/caminho-historico-vila-do-bispo-cabo-de-s-vicente",
      "facts_verified": [
        "Vila do Bispo to Cabo de São Vicente walking section",
        "14 km distance",
        "South-west Algarve walking-route context",
        "Coastal panoramas and cliff landscape"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, central Sagres setting, large sandy bay, access, facilities, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The phrase “central Sagres beach” is supported by official descriptions of Mareta as easily accessed from Sagres and by municipal search-result wording describing it as an urban beach in the village.",
    "ABAAE verifies Mareta’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where verified by VisitPortugal or ABAAE and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessible-beach support, toilets and showers were not verified from authoritative current sources and are marked Not verified.",
    "The municipal page returned limited accessible text when opened, so municipal facts are used cautiously from the official search-result summary and supported by VisitPortugal and ABAAE where possible.",
    "Sea conditions are naturally variable, so diving, surfing and bodyboarding suitability is described as conditions-dependent.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
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
  where slug = 'sagres';

  if v_city_id is null then
    raise exception 'Sagres city was not found';
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
  end if;
end $$;

commit;
