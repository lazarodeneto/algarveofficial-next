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
  'Aljezur',
  'aljezur',
  'West Algarve town and municipality known for Costa Vicentina beaches, surf, cliffs and protected natural landscapes.',
  37.29442,
  -8.86601,
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
  v_slug text := 'praia-da-arrifana-aljezur';
  v_name text := 'Praia da Arrifana';
  v_address text := 'Praia da Arrifana, Arrifana / Aljezur, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/node/141536';
  v_latitude numeric := 37.29442;
  v_longitude numeric := -8.86601;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Arrifana",
  "slug": "praia-da-arrifana-aljezur",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Arrifana / Aljezur",
  "concelho": "Aljezur",
  "municipality": "Aljezur",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Arrifana is a major surf beach in Aljezur, set in a dramatic west-coast bay enclosed by tall cliffs. Known for its Atlantic waves, fishing-village setting and fortress viewpoint, it is one of the Costa Vicentina’s most recognisable beach icons.",
  "full_description": "Praia da Arrifana is one of the defining beaches of the Algarve’s west coast, located in the municipality of Aljezur within the Costa Vicentina landscape. Set in a steep, cliff-framed bay, the beach combines a long sweep of sand, Atlantic surf, whitewashed houses descending towards the water and the ruins of the old Arrifana fortress above the headland.\n\nOfficial tourism sources describe Arrifana as enclosed by tall cliffs and as a year-round favourite for surfers and bodyboarders. This gives the beach a very different character from the warmer, resort-heavy south coast: more exposed, more natural and strongly shaped by Atlantic conditions. It is a major surf destination, but sea conditions can vary considerably, so visitors should not assume the beach is suitable for swimming or surfing on every day.\n\nArrifana also has strong scenic and cultural appeal. The old fortress ruins provide a viewpoint over the bay, while the surrounding coastline forms part of the Parque Natural do Sudoeste Alentejano e Costa Vicentina, a protected landscape known for cliffs, wild beaches, coastal walking and biodiversity.\n\nThe beach has verified infrastructure, including Blue Flag recognition, seasonal surveillance, outdoor parking, bar and restaurant services, and surf/bodyboard activity. Access and parking close to the beach can be constrained in high season, and official beach-guide information notes parking around 400 metres from the beach with vehicle access near the sand subject to limitations. Visitors should plan carefully, respect cliff safety and follow local flags and signage.",
  "coordinates": {
    "latitude": 37.29442,
    "longitude": -8.86601,
    "label": "Praia da Arrifana",
    "notes": "Coordinates were taken from the official ABAAE Arrifana beach entry."
  },
  "beach_type": "Sandy Atlantic surf beach in a cliff-framed bay",
  "landscape": "A broad sandy beach enclosed by high cliffs, with Atlantic surf, whitewashed houses above the bay, fortress ruins on the headland and rugged Costa Vicentina scenery.",
  "access": "Access is by road and on foot through Arrifana. Official tourism sources list access by car, motorcycle and on foot, while official beach-guide information notes organised parking of medium size around 400 metres from the beach and conditioned vehicle access near the beach. Visitors should confirm current access and parking conditions before travelling in peak season.",
  "highlights": [
    "Major west-coast surf and bodyboard beach",
    "Dramatic bay enclosed by tall cliffs",
    "Old Arrifana fortress ruins with wide coastal views",
    "Fishing-village and cliffside settlement character",
    "Part of the Costa Vicentina protected coastal landscape",
    "Official 2026 Blue Flag listing for Arrifana"
  ],
  "best_for": [
    "Surfing",
    "Bodyboarding",
    "Scenic views",
    "Photography",
    "Nature lovers",
    "Coastal walks",
    "Couples",
    "Atlantic beach days",
    "West coast exploration"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Outdoor parking", "status": "Verified / may be limited in peak season" },
    { "name": "Sanitary installations", "status": "Verified / Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Surfing activity listed by official tourism source", "status": "Verified / conditions dependent" },
    { "name": "Bodyboard activity listed by official tourism source", "status": "Verified / conditions dependent" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Outdoor parking",
    "Sanitary installations",
    "Bar and restaurant",
    "Surfing and bodyboard activity",
    "Fortress viewpoint nearby",
    "Costa Vicentina protected landscape"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and seasonal support. Autumn and spring are often important for surf conditions, but sea state, wind and safety guidance should always be checked before entering the water.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Arrifana as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Arrifana as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nArrifana is a surf beach on the Atlantic west coast; waves, currents and sea conditions can vary significantly.\nVehicle access and parking near the beach may be conditioned, especially in peak season.\nThe beach is enclosed by cliffs; visitors should avoid cliff bases and cliff edges.\nFacilities and surveillance may vary by season.\nVisitors should respect protected-area rules and follow local flags, signs and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Arrifana as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Arrifana as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Arrifana is a surf beach on the Atlantic west coast; waves, currents and sea conditions can vary significantly.",
      "Vehicle access and parking near the beach may be conditioned, especially in peak season.",
      "The beach is enclosed by cliffs; visitors should avoid cliff bases and cliff edges.",
      "Facilities and surveillance may vary by season.",
      "Visitors should respect protected-area rules and follow local flags, signs and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Arrifana as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Arrifana as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nArrifana is a surf beach on the Atlantic west coast; waves, currents and sea conditions can vary significantly.\nVehicle access and parking near the beach may be conditioned, especially in peak season.\nThe beach is enclosed by cliffs; visitors should avoid cliff bases and cliff edges.\nFacilities and surveillance may vary by season.\nVisitors should respect protected-area rules and follow local flags, signs and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and seasonal support. Autumn and spring are often important for surf conditions, but sea state, wind and safety guidance should always be checked before entering the water.",
  "suitable_for": [
    "Surfers and bodyboarders",
    "Visitors exploring the Costa Vicentina",
    "Photographers",
    "Couples",
    "Coastal walkers",
    "Nature-focused travellers",
    "Visitors comfortable with exposed Atlantic beach conditions"
  ],
  "not_suitable_for": [
    "Visitors seeking a sheltered resort beach",
    "Visitors expecting calm swimming conditions",
    "Visitors requiring verified accessible-beach support",
    "Those wishing to avoid surf crowds in peak conditions",
    "Anyone intending to sit close to cliff bases or ignore surf-safety flags"
  ],
  "nearby_attractions": [
    {
      "name": "Fortaleza da Arrifana",
      "type": "Fortress ruins and viewpoint",
      "description": "Old fortress ruins above Arrifana, noted by VisitPortugal as an ideal viewpoint over the beach and surrounding coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "type": "Protected natural park",
      "description": "The protected west-coast landscape of cliffs, wild beaches, biodiversity and walking routes surrounding the Arrifana area.",
      "verification_status": "Verified"
    },
    {
      "name": "Ribat da Arrifana",
      "type": "Archaeological site",
      "description": "A classified National Monument in Aljezur, located in the Ponta da Atalaia / Vale da Telha area and linked to Islamic-period heritage.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Monte Clérigo",
      "type": "Nearby beach",
      "description": "A nearby Aljezur beach beside the fishing village of Monte Clérigo, reached by road from the Aljezur area.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Amoreira",
      "type": "Nearby beach and river-mouth landscape",
      "description": "A nearby Aljezur beach associated with the Ribeira de Aljezur and a distinctive dune and estuary landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Aljezur Historic Centre",
      "type": "Historic town",
      "description": "The inland town of Aljezur offers services, heritage, restaurants and access to the wider west-coast beach circuit.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Arrifana",
    "Aljezur",
    "Vale da Telha",
    "Monte Clérigo",
    "Bordeira",
    "Carrapateira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Rota Vicentina - Aljezur to Arrifana",
      "description": "Portuguese Trails lists the Aljezur to Arrifana Historical Way section as a 12 km walking route approaching the coast through valleys and small farms.",
      "verification_status": "Verified"
    },
    {
      "name": "Fishermen’s Trail - Arrifana to Carrapateira",
      "description": "Rota Vicentina lists a Fishermen’s Trail section from Arrifana to Carrapateira, connecting the beach with the wider west-coast walking network.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check surf, wind and tide conditions before entering the water.",
    "Arrive early in summer because access and parking near the beach may be constrained.",
    "Use official access routes and avoid informal cliff paths.",
    "Stay away from cliff bases and cliff edges.",
    "For photography, use the fortress viewpoint and safe cliff-top areas.",
    "Bring layers outside summer, as the west coast can feel windier and cooler than the south coast.",
    "Respect protected-area guidance and avoid disturbing cliff, dune or marine habitats."
  ],
  "photography_notes": "Praia da Arrifana is especially strong for wide coastal photography from the fortress area and cliff viewpoints, with the curved bay, surf lines, tall cliffs and offshore rock formations creating a powerful west-coast composition. Visitors should stay on safe, authorised viewpoints and avoid cliff edges.",
  "family_notes": "Families can enjoy the beach setting, but Arrifana is an Atlantic surf beach and conditions may be unsuitable for younger or less confident swimmers. Families should choose supervised seasonal periods, check flags carefully and keep children away from cliffs and rocks.",
  "safety_notes": "Arrifana is popular with surfers and bodyboarders, but Atlantic conditions can change quickly. Follow flags, lifeguard instructions where present, local signage and surf-safety guidance. Avoid cliff bases and cliff edges, and take care when moving between the beach, road and parking areas.",
  "accessibility_notes": "Accessible-beach support was not verified from authoritative current sources. Visitors with reduced mobility should confirm current access, parking and beach-entry conditions before visiting.",
  "seo": {
    "meta_title": "Praia da Arrifana, Aljezur | Algarve Beach Guide",
    "meta_description": "Praia da Arrifana in Aljezur is a major west-coast surf beach with cliffs, fortress views, Blue Flag status and Costa Vicentina scenery.",
    "keywords": [
      "Praia da Arrifana",
      "Arrifana Beach",
      "Arrifana Aljezur",
      "Aljezur beaches",
      "Costa Vicentina beaches",
      "Algarve surf beach",
      "Portugal surf beaches",
      "west coast Algarve",
      "Blue Flag Arrifana",
      "Rota Vicentina Arrifana",
      "Fortaleza da Arrifana",
      "Parque Natural do Sudoeste Alentejano e Costa Vicentina"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Arrifana trip ideas",
      "links": [
        { "label": "Praia da Arrifana" },
        { "label": "Arrifana Beach" },
        { "label": "Arrifana Aljezur" },
        { "label": "Blue Flag Arrifana" },
        { "label": "Rota Vicentina Arrifana" },
        { "label": "Fortaleza da Arrifana" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Arrifana" },
        { "label": "Aljezur" },
        { "label": "Vale da Telha" },
        { "label": "Monte Clérigo" },
        { "label": "Bordeira" },
        { "label": "Carrapateira" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Arrifana",
      "source_url": "https://www.visitportugal.com/en/node/141536",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Aljezur",
        "Bay enclosed by tall cliffs",
        "Local residences descending towards the water",
        "Old fortress ruins as viewpoint",
        "Year-round popularity with surfers and bodyboarders",
        "Facilities including Blue Flag, surveillance, outdoor parking, bar and restaurant",
        "Activities including surfing and bodyboard",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Arrifana",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/arrifana/",
      "facts_verified": [
        "Official Arrifana coastal beach entry",
        "Municipality of Aljezur",
        "Coordinates",
        "Beach code PTCX3C",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Arrifana listed among Aljezur’s 2026 Blue Flag locations",
        "Aljezur listed with four 2026 awarded beach locations: Amoreira-Mar, Arrifana, Monte Clérigo and Odeceixe-Mar"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Arrifana",
      "source_url": "https://visitalgarve.pt/equipamento/8722/Praia%20da%20Arrifana",
      "facts_verified": [
        "Arrifana bay described as shell-shaped",
        "Shelter from northerly wind and northern swell",
        "Association with a small fishing settlement",
        "Regional tourism context for the beach"
      ]
    },
    {
      "source_name": "Visit Algarve - Guia de Praias",
      "source_url": "https://api.visitalgarve.pt/uploads/1/1/BrochurasPT/guia_de_praias_pt_web.pdf",
      "facts_verified": [
        "Organised medium-sized parking around 400 metres from the beach",
        "Conditioned vehicle access and parking near the beach"
      ]
    },
    {
      "source_name": "Câmara Municipal de Aljezur - Praia da Arrifana",
      "source_url": "https://cm-aljezur.pt/en/344/praia-da-arrifana.aspx",
      "facts_verified": [
        "Municipal beach page for Praia da Arrifana",
        "Support services including sanitary installations, car park before descending to the beach, bar / restaurant, telephone and waste facilities, based on official search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-do-sudoeste-alentejano-e-costa-vicentina",
      "facts_verified": [
        "Protected-area context from Porto Covo to Burgau",
        "Cliff-dominated coastal landscape",
        "Arrifana listed among the beaches in the protected-area context",
        "Surfing relevance of the park’s beaches"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina",
      "facts_verified": [
        "Official ICNF protected-area page",
        "Parque Natural do Sudoeste Alentejano e Costa Vicentina protected-area context"
      ]
    },
    {
      "source_name": "Portuguese Trails - Caminho Histórico / Aljezur - Arrifana",
      "source_url": "https://www.portuguesetrails.com/pt-pt/routes/rota-vicentina-algarve-walking/caminho-historico-aljezur-arrifana",
      "facts_verified": [
        "Aljezur to Arrifana walking route",
        "12 km distance",
        "Rota Vicentina / Algarve walking context",
        "Route approaching the coast through valleys and small farms"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail Arrifana to Carrapateira",
      "source_url": "https://rotavicentina.com/walking/arrifana-carrapateira-trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail section from Arrifana to Carrapateira",
        "Route name and Rota Vicentina walking-network context"
      ]
    },
    {
      "source_name": "Património Cultural - Ribat da Arrifana",
      "source_url": "https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=13246353",
      "facts_verified": [
        "Ribat da Arrifana in Aljezur",
        "Classified status",
        "National Monument protection category"
      ]
    },
    {
      "source_name": "Câmara Municipal de Aljezur - Fortaleza da Arrifana",
      "source_url": "https://cm-aljezur.pt/pt/604/fortaleza-da-arrifana.aspx",
      "facts_verified": [
        "Municipal heritage page for Fortaleza da Arrifana",
        "Historic fortress context, based on official search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Monte Clérigo",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-monte-cl%C3%A9rigo",
      "facts_verified": [
        "Nearby Monte Clérigo beach in Aljezur",
        "Fishing-village setting",
        "Road access from Aljezur"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Amoreira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-amoreira",
      "facts_verified": [
        "Nearby Amoreira beach in Aljezur",
        "Road access from Aljezur",
        "Beach support infrastructure context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, surf/bodyboard relevance, cliff-bay setting, facilities, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The phrase “major surf beach, west coast icon” is supported by VisitPortugal’s year-round surf/bodyboard wording, the beach’s verified Blue Flag status, and its protected Costa Vicentina setting.",
    "ABAAE verifies Arrifana’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on bathing season or local concession activity.",
    "Accessible-beach support was not verified from authoritative current sources and is therefore marked Not verified.",
    "The Câmara Municipal de Aljezur beach and fortress pages returned fetch errors when opened, so their facts are used cautiously from official search-result summaries and supported by VisitPortugal, Visit Algarve and ABAAE where possible.",
    "Parking and vehicle-access details may change seasonally; visitors should confirm current arrangements before travelling in high season.",
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
  where slug = 'aljezur';

  if v_city_id is null then
    raise exception 'Aljezur city was not found';
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
