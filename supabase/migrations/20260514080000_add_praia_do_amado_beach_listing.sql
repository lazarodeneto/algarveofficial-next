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
  v_slug text := 'praia-do-amado-aljezur';
  v_name text := 'Praia do Amado';
  v_address text := 'Praia do Amado, Carrapateira / Bordeira, Aljezur, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-amado';
  v_latitude numeric := 37.1672944;
  v_longitude numeric := -8.902422222222222;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Amado",
  "slug": "praia-do-amado-aljezur",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carrapateira / Bordeira, Aljezur",
  "concelho": "Aljezur",
  "municipality": "Aljezur",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Amado is a major surf beach near Carrapateira, in the municipality of Aljezur. Known for its Atlantic waves, surf schools and Costa Vicentina scenery, it is one of the Algarve’s key west-coast surf tourism beaches.",
  "full_description": "Praia do Amado is one of the Algarve’s best-known surf beaches, located near Carrapateira in the municipality of Aljezur, on the wild west coast of the Costa Vicentina. This is a broad Atlantic beach shaped by cliffs, open ocean conditions and a strong surf culture, with a markedly different atmosphere from the resort beaches of the south coast.\n\nOfficial tourism sources describe Amado as one of Portugal’s leading beaches for surfing, used by surfers from across Europe and often associated with surf competitions. It is not only for experienced surfers: VisitPortugal also confirms the presence of surf schools teaching the sport, making the beach a major centre for surf lessons, surf tourism and year-round wave-focused visits.\n\nThe landscape is part of its appeal. Visit Algarve describes Amado as a wide beach extending along three valleys, with warm red and ochre cliff tones to the north and darker rock walls to the south. The beach sits within the broader Parque Natural do Sudoeste Alentejano e Costa Vicentina context, where visitors should treat dunes, cliffs and coastal habitats with care.\n\nAmado can be very busy in summer and during good surf conditions, particularly around the main access and school areas. Official sources list parking, bar and restaurant support, surveillance, surf and bodyboard activity, but services may be seasonal. Visitors should check sea conditions, local flags and current surf-school arrangements before entering the water.",
  "coordinates": {
    "latitude": 37.1672944,
    "longitude": -8.902422222222222,
    "label": "Praia do Amado",
    "notes": "Coordinates were taken from the Visit Algarve Praia do Amado page."
  },
  "beach_type": "Large sandy Atlantic surf beach",
  "landscape": "A wide sandy beach backed by rugged Costa Vicentina cliffs, with warm red and ochre tones to the north, darker rock formations to the south and open Atlantic surf.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Visit Algarve describes paved road access from the southern entrance of Carrapateira towards Amado for about 2 km, with another possible approach from the Bordeira side. Visitors should confirm current road, parking and access conditions before travelling in peak surf or summer periods.",
  "highlights": [
    "Major surf and bodyboard beach on the Algarve’s west coast",
    "Surf schools verified by official tourism sources",
    "Broad sandy beach near Carrapateira and Bordeira",
    "Dramatic Costa Vicentina landscape with red, ochre and darker cliff formations",
    "Popular with surfers from across Europe",
    "Close to Pontal da Carrapateira and the Rota Vicentina walking network"
  ],
  "best_for": [
    "Surfing",
    "Surf lessons",
    "Bodyboarding",
    "Surf tourism",
    "Photography",
    "Nature lovers",
    "Coastal walks",
    "West coast exploration",
    "Visitors staying in Carrapateira or Aljezur"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Surf activity", "status": "Verified / conditions dependent" },
    { "name": "Bodyboard activity", "status": "Verified / conditions dependent" },
    { "name": "Surf schools", "status": "Verified / verify current operation before visiting" },
    { "name": "Accessible beach reference on Visit Algarve page", "status": "Verified / current seasonal support should be checked" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal beach surveillance",
    "Car parking",
    "Bar and restaurant",
    "Surf and bodyboard activity",
    "Surf schools",
    "Accessible beach reference needing current confirmation",
    "Costa Vicentina protected landscape",
    "Pontal da Carrapateira nearby"
  ],
  "important_information": {
    "best_time_to_visit": "Summer is best for full beach atmosphere and seasonal services. Spring and autumn are often important surf periods, but conditions should be checked carefully because Atlantic swell, wind and currents can change quickly.",
    "know_before_you_go": "Praia do Amado is a surf beach on the exposed Atlantic west coast; waves, wind, currents and sea state can vary significantly.\nVisitPortugal describes the beach as very busy during summer and as a major surf beach with support infrastructure.\nABAAE’s 2026 regional Blue Flag list checked during research lists Aljezur locations as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia do Amado was not found among the 2026 Aljezur Blue Flag locations.\nSurf schools are verified by official tourism sources, but visitors should confirm current lesson availability, licensing, conditions and supervision before booking.\nFacilities and surveillance may be seasonal.\nThe beach sits within the Costa Vicentina protected coastal landscape; visitors should respect dunes, cliffs, marked paths and protected habitats.\nCliffs and dune systems can be fragile; visitors should avoid cliff edges, cliff bases and unauthorised paths.\nSwimming should only be considered according to flags, sea state and local safety guidance.",
    "notes": [
      "Praia do Amado is a surf beach on the exposed Atlantic west coast; waves, wind, currents and sea state can vary significantly.",
      "VisitPortugal describes the beach as very busy during summer and as a major surf beach with support infrastructure.",
      "ABAAE’s 2026 regional Blue Flag list checked during research lists Aljezur locations as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia do Amado was not found among the 2026 Aljezur Blue Flag locations.",
      "Surf schools are verified by official tourism sources, but visitors should confirm current lesson availability, licensing, conditions and supervision before booking.",
      "Facilities and surveillance may be seasonal.",
      "The beach sits within the Costa Vicentina protected coastal landscape; visitors should respect dunes, cliffs, marked paths and protected habitats.",
      "Cliffs and dune systems can be fragile; visitors should avoid cliff edges, cliff bases and unauthorised paths.",
      "Swimming should only be considered according to flags, sea state and local safety guidance."
    ]
  },
  "important_notes": "Praia do Amado is a surf beach on the exposed Atlantic west coast; waves, wind, currents and sea state can vary significantly.\nVisitPortugal describes the beach as very busy during summer and as a major surf beach with support infrastructure.\nABAAE’s 2026 regional Blue Flag list checked during research lists Aljezur locations as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana; Praia do Amado was not found among the 2026 Aljezur Blue Flag locations.\nSurf schools are verified by official tourism sources, but visitors should confirm current lesson availability, licensing, conditions and supervision before booking.\nFacilities and surveillance may be seasonal.\nThe beach sits within the Costa Vicentina protected coastal landscape; visitors should respect dunes, cliffs, marked paths and protected habitats.\nCliffs and dune systems can be fragile; visitors should avoid cliff edges, cliff bases and unauthorised paths.\nSwimming should only be considered according to flags, sea state and local safety guidance.",
  "best_time_to_visit": "Summer is best for full beach atmosphere and seasonal services. Spring and autumn are often important surf periods, but conditions should be checked carefully because Atlantic swell, wind and currents can change quickly.",
  "suitable_for": [
    "Surfers",
    "Bodyboarders",
    "Visitors taking surf lessons",
    "Surf tourism travellers",
    "Photographers",
    "Nature-focused visitors",
    "Coastal walkers",
    "Visitors comfortable with exposed Atlantic conditions"
  ],
  "not_suitable_for": [
    "Visitors expecting a calm resort beach",
    "Visitors wanting guaranteed safe swimming conditions",
    "Visitors requiring fully verified accessible-beach support without confirming current arrangements",
    "Those wishing to avoid surf crowds during peak conditions",
    "Anyone intending to walk on dunes, sit close to cliff bases or ignore surf-safety flags"
  ],
  "nearby_attractions": [
    {
      "name": "Carrapateira",
      "type": "Village",
      "description": "A nearby west-coast village in the parish of Bordeira, useful for services, surf tourism and access between Praia do Amado and Praia da Bordeira.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Bordeira / Carrapateira",
      "type": "Nearby beach",
      "description": "A large sandy beach north of Carrapateira, described by VisitPortugal as spacious and popular with surfers and bodyboarders.",
      "verification_status": "Verified"
    },
    {
      "name": "Pontal da Carrapateira",
      "type": "Headland and walking area",
      "description": "A coastal headland between the Bordeira and Amado areas, associated with the Rota Vicentina walking network and views over cliffs, beaches and the Atlantic.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "type": "Protected natural park",
      "description": "The protected west-coast landscape surrounding Amado, known for cliffs, beaches, biodiversity and coastal walking.",
      "verification_status": "Verified"
    },
    {
      "name": "Aljezur Historic Centre",
      "type": "Historic town",
      "description": "The inland municipal town of Aljezur, useful for services, heritage and exploring the wider west-coast beach circuit.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Murração",
      "type": "Nearby wild beach",
      "description": "A more remote west-coast beach south of the Amado area, suitable only for visitors who confirm access and conditions in advance.",
      "verification_status": "Not verified"
    }
  ],
  "nearby_towns": [
    "Carrapateira",
    "Bordeira",
    "Aljezur",
    "Vila do Bispo",
    "Sagres",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Pontal da Carrapateira",
      "description": "A Rota Vicentina circular walking route associated with the Carrapateira headland, linking the coastal landscape between the Bordeira and Amado areas. Visitors should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Rota Vicentina - Fishermen’s Trail",
      "description": "A coastal walking network following paths used by local people to reach beaches and fishing grounds, with sections along cliffs, sand and exposed coastal terrain.",
      "verification_status": "Verified"
    },
    {
      "name": "Carrapateira to Praia do Amado approach",
      "description": "A local approach from Carrapateira towards Amado, supported by Visit Algarve’s road-access description. Pedestrians should confirm safe walking conditions locally.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check surf forecasts, wind, tide and local flags before entering the water.",
    "Use a licensed, locally operating surf school if learning to surf.",
    "Arrive early in summer or on good surf days, as parking and main access areas can become busy.",
    "Bring layers outside peak summer; the west coast can be cooler and windier than the south coast.",
    "Stay on marked paths and avoid trampling dunes.",
    "Keep away from cliff edges and cliff bases.",
    "Do not assume Blue Flag status for 2026, as Praia do Amado was not found in the 2026 Aljezur Blue Flag list checked during research.",
    "Confirm facilities before travelling outside the main summer period."
  ],
  "photography_notes": "Praia do Amado is highly photogenic from the access viewpoints and cliff-safe areas above the sand, with surf lines, boards, broad sand and red-toned cliffs giving a strong Costa Vicentina identity. Stay on safe paths and avoid cliff edges for photographs.",
  "family_notes": "Families may enjoy the beach atmosphere and surf-school setting, but Praia do Amado is an exposed Atlantic surf beach. Families with children should follow flags carefully, choose supervised periods where available and avoid entering the water unless conditions are clearly suitable.",
  "safety_notes": "Praia do Amado is known for surf and bodyboard activity, not guaranteed calm bathing. Atlantic swell, currents and wind can change quickly. Follow flags, lifeguard or surveillance instructions where present, and use surf-school guidance when learning. Avoid cliff bases, cliff edges and dune trampling.",
  "accessibility_notes": "Visit Algarve lists Praia do Amado under accessible beach categories, but current practical accessibility support, adapted equipment and the most suitable access point were not fully verified during this research. Visitors with reduced mobility should confirm current conditions before visiting.",
  "seo": {
    "meta_title": "Praia do Amado, Aljezur | Algarve Surf Beach Guide",
    "meta_description": "Praia do Amado near Carrapateira is a major Algarve surf beach with surf schools, Atlantic waves, cliffs and Costa Vicentina scenery.",
    "keywords": [
      "Praia do Amado",
      "Praia do Amado Aljezur",
      "Amado Beach",
      "Carrapateira surf beach",
      "Aljezur beaches",
      "Algarve surf beach",
      "Portugal surf beaches",
      "Costa Vicentina",
      "surf schools Algarve",
      "surf tourism Algarve",
      "Pontal da Carrapateira",
      "Rota Vicentina",
      "Parque Natural do Sudoeste Alentejano e Costa Vicentina"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Amado surf ideas",
      "links": [
        { "label": "Praia do Amado" },
        { "label": "Praia do Amado Aljezur" },
        { "label": "Amado Beach" },
        { "label": "Carrapateira surf beach" },
        { "label": "surf schools Algarve" },
        { "label": "Pontal da Carrapateira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Carrapateira" },
        { "label": "Bordeira" },
        { "label": "Aljezur" },
        { "label": "Vila do Bispo" },
        { "label": "Sagres" },
        { "label": "Lagos" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Amado",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-amado",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Aljezur",
        "Surf reputation",
        "Surf schools",
        "International competition context",
        "High summer use",
        "Support infrastructure",
        "Facilities including safety or surveillance, parking, bar, restaurant, surf and bodyboard",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "VisitPortugal - Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/costa-vicentina",
      "facts_verified": [
        "Costa Vicentina context",
        "Praia do Amado as preferred by surfers",
        "National and international surf competition setting",
        "Several surf and bodyboard schools"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Amado",
      "source_url": "https://visitalgarve.pt/equipamento/10368/praia-do-amado",
      "facts_verified": [
        "Regional tourism listing",
        "Beach described as wide and extending along three valleys",
        "Red and ochre cliffs to the north and darker rock walls to the south",
        "Paved road access from the southern entrance of Carrapateira towards Amado for about 2 km",
        "Possible access from the Bordeira side",
        "Coordinates",
        "Accessible beach category reference"
      ]
    },
    {
      "source_name": "Câmara Municipal de Aljezur - Praia do Amado",
      "source_url": "https://cm-aljezur.pt/pt/577/praia-do-amado.aspx",
      "facts_verified": [
        "Municipal beach page for Praia do Amado",
        "Praia do Amado as the southernmost beach of Aljezur municipality",
        "Location near Carrapateira",
        "Extensive sandy beach",
        "Official page located but fetch returned an error during research; facts based on official search-result summary"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Aljezur 2026 Blue Flag locations checked",
        "Aljezur 2026 locations listed as Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana",
        "Praia do Amado not found among Aljezur’s listed 2026 Blue Flag beaches during verification"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina",
      "facts_verified": [
        "Official protected-area context for the Sudoeste Alentejano e Costa Vicentina natural park"
      ]
    },
    {
      "source_name": "Natural.pt - Praia do Amado, geologia e surf",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/points-of-interest/praia-do-amado-geologia-e-surf",
      "facts_verified": [
        "Protected-area point-of-interest page for Praia do Amado",
        "Geology and surf context",
        "Natural.PT / ICNF-linked visitor context"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail coastal walking network",
        "Route follows paths by the sea along cliffs and sandy terrain",
        "Fragile ecosystem guidance",
        "Walking-only guidance and cliff-safety warnings"
      ]
    },
    {
      "source_name": "Rota Vicentina - Pontal da Carrapateira",
      "source_url": "https://rotavicentina.com/walking/20-pontal-da-carrapateira/",
      "facts_verified": [
        "Pontal da Carrapateira walking route page",
        "Nearby Rota Vicentina route context"
      ]
    },
    {
      "source_name": "Natural.pt - Percurso Pontal da Carrapateira",
      "source_url": "https://natural.pt/protected-areas/parque-natural-sudoeste-alentejano-costa-vicentina/pathways/percurso-pontal-carrapateira",
      "facts_verified": [
        "Pontal da Carrapateira pathway in the protected-area context",
        "Nearby coastal route context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Bordeira ou Carrapateira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-bordeira-ou-carrapateira",
      "facts_verified": [
        "Nearby Praia da Bordeira / Carrapateira",
        "Location near Carrapateira",
        "Road access from Carrapateira",
        "Large sandy beach",
        "Surf and bodyboard relevance"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Aljezur municipality, Carrapateira proximity, surf-school relevance, surf tourism role, facilities and west-coast landscape were verified from official tourism and municipal sources.",
    "The phrase “major surf school/surf tourism beach” is supported by VisitPortugal’s wording on surf, surf schools and competition history, and by VisitPortugal’s Costa Vicentina page stating that Praia do Amado is preferred by surfers and has several schools.",
    "Current 2026 Blue Flag status was not verified. ABAAE’s 2026 Aljezur list checked during research includes Odeceixe-Mar, Amoreira-Mar, Monte Clérigo and Arrifana, but not Praia do Amado.",
    "Visit Algarve’s page references accessible beach categories and provides coordinates, but current adapted equipment, assisted bathing and practical accessibility support were not fully verified.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on bathing season, concessions, sea state or surf-school operation.",
    "The Câmara Municipal de Aljezur page returned a fetch error when opened, so municipal details are used cautiously from the official search-result summary and supported by VisitPortugal and Visit Algarve.",
    "Toilets, showers and sunshade rental were not included as verified because they were not clearly verified from the primary official sources used.",
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
