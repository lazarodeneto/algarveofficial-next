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
  'Faro',
  'faro',
  'Algarve capital city with historic centre access, Ria Formosa boat departures and nearby island beaches.',
  37.0194,
  -7.9322,
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
  v_slug text := 'praia-da-ilha-deserta-barreta-faro';
  v_name text := 'Praia da Ilha Deserta / Barreta';
  v_address text := 'Praia da Ilha Deserta / Barreta, Ilha da Barreta, Faro, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-barreta-ilha-deserta';
  v_latitude numeric := 36.96577;
  v_longitude numeric := -7.87291;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Ilha Deserta / Barreta",
  "slug": "praia-da-ilha-deserta-barreta-faro",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Ilha Deserta / Faro",
  "concelho": "Faro",
  "municipality": "Faro",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Ilha Deserta, also known as Praia da Barreta, is an iconic remote island beach in Faro, set within the Ria Formosa Natural Park. Reached by boat from Faro, it is known for its vast sand, protected barrier-island landscape and quiet Atlantic setting.",
  "full_description": "Praia da Ilha Deserta / Barreta is one of Faro’s most distinctive beach experiences, located on Ilha da Barreta within the Ria Formosa Natural Park. Official tourism sources describe the island as one of the barrier islands separating the marshland and lagoon from the sea, with access by boat from Faro and a journey of around 20 minutes.\n\nThis is a very different beach from Faro’s urban and road-access beaches. The setting is open, low, sandy and natural, with the Atlantic Ocean on one side and the Ria Formosa’s channels, marshes and birdlife on the other. VisitPortugal notes that the island has a vast sandy beach and no other construction apart from beach-support infrastructure, giving it the remote character behind its popular name, Ilha Deserta.\n\nBarreta is especially suited to visitors who want a quieter island beach day, long walks, photography, Ria Formosa scenery and a sense of distance from the city while remaining accessible from Faro by boat. The area is also associated with Cabo de Santa Maria, identified by regional tourism as the southernmost point of mainland Portugal.\n\nABAAE lists Barreta among Faro’s 2026 Blue Flag locations and provides official coordinates. However, the individual ABAAE page checked displayed inconsistent season-date text, so exact bathing-season and Blue Flag-display dates should be manually confirmed before publication updates. Facilities and services should be treated as seasonal, and visitors should plan around boat times, heat, wind and tide conditions.",
  "coordinates": {
    "latitude": 36.96577,
    "longitude": -7.87291,
    "label": "Praia da Ilha Deserta / Barreta",
    "notes": "Primary listing coordinates use the official ABAAE Barreta beach entry.",
    "bathing_areas": [
      {
        "name": "Barreta / Ilha Deserta",
        "latitude": 36.96577,
        "longitude": -7.87291,
        "type": "Atlantic island beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Long sandy barrier-island beach",
  "landscape": "A low sandy barrier island between the Atlantic Ocean and the Ria Formosa lagoon, with dunes, saltmarsh views, birdlife, open sand and minimal built infrastructure beyond beach support.",
  "access": "Access is by boat from Faro. VisitPortugal describes the crossing as taking around 20 minutes and notes seasonal boat access during June to September; visitors should confirm current boat schedules, seasonal frequency and return times before travelling.",
  "highlights": [
    "Remote barrier-island beach within the Ria Formosa Natural Park",
    "Boat access from Faro, with an official tourism source giving a crossing of around 20 minutes",
    "Vast sandy Atlantic-facing beach with Ria Formosa lagoon scenery nearby",
    "Associated with Cabo de Santa Maria, the southernmost point of mainland Portugal",
    "Beach support, restaurant, bar, showers, sunshade rental and nautical activities listed by VisitPortugal",
    "Listed among Faro’s 2026 Blue Flag locations by ABAAE"
  ],
  "best_for": [
    "Remote island beach days",
    "Ria Formosa scenery",
    "Long beach walks",
    "Photography",
    "Couples",
    "Nature lovers",
    "Birdwatching nearby",
    "Boat-access beaches",
    "Quiet beach escapes"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal / exact display dates should be confirmed" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" },
    { "name": "Car parking on the island", "status": "Not verified" },
    { "name": "Accessible beach support", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Sunshade rental",
    "Light boat rental",
    "Showers",
    "Bar and restaurant",
    "Windsurfing and sailing",
    "Boat access from Faro",
    "Ria Formosa Natural Park context"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the main seasonal boat-and-beach period indicated by official tourism sources. May, June and September are often more comfortable for walking, photography and a quieter island atmosphere.",
    "know_before_you_go": "ABAAE lists Barreta among Faro’s 2026 Blue Flag locations.\nThe individual ABAAE Barreta page checked during research showed inconsistent season-date text, so exact 2026 bathing-season and Blue Flag-display dates should be manually confirmed before publication updates.\nAccess depends on boat services from Faro; visitors should confirm departure times and last return before travelling.\nThe island is part of the Ria Formosa Natural Park, so visitors should protect dunes, marshland, birdlife and marked paths.\nFacilities and surveillance may be seasonal and should be checked before visiting outside the main summer period.\nThe beach is remote by Algarve standards; bring water, sun protection and essentials.\nSea, wind and tide conditions can vary; visitors should follow local signage, flags and official safety guidance.\nDo not walk across protected dunes or disturb birds and other wildlife.",
    "notes": [
      "ABAAE lists Barreta among Faro’s 2026 Blue Flag locations.",
      "The individual ABAAE Barreta page checked during research showed inconsistent season-date text, so exact 2026 bathing-season and Blue Flag-display dates should be manually confirmed before publication updates.",
      "Access depends on boat services from Faro; visitors should confirm departure times and last return before travelling.",
      "The island is part of the Ria Formosa Natural Park, so visitors should protect dunes, marshland, birdlife and marked paths.",
      "Facilities and surveillance may be seasonal and should be checked before visiting outside the main summer period.",
      "The beach is remote by Algarve standards; bring water, sun protection and essentials.",
      "Sea, wind and tide conditions can vary; visitors should follow local signage, flags and official safety guidance.",
      "Do not walk across protected dunes or disturb birds and other wildlife."
    ]
  },
  "important_notes": "ABAAE lists Barreta among Faro’s 2026 Blue Flag locations.\nThe individual ABAAE Barreta page checked during research showed inconsistent season-date text, so exact 2026 bathing-season and Blue Flag-display dates should be manually confirmed before publication updates.\nAccess depends on boat services from Faro; visitors should confirm departure times and last return before travelling.\nThe island is part of the Ria Formosa Natural Park, so visitors should protect dunes, marshland, birdlife and marked paths.\nFacilities and surveillance may be seasonal and should be checked before visiting outside the main summer period.\nThe beach is remote by Algarve standards; bring water, sun protection and essentials.\nSea, wind and tide conditions can vary; visitors should follow local signage, flags and official safety guidance.\nDo not walk across protected dunes or disturb birds and other wildlife.",
  "best_time_to_visit": "June to September for the main seasonal boat-and-beach period indicated by official tourism sources. May, June and September are often more comfortable for walking, photography and a quieter island atmosphere.",
  "suitable_for": [
    "Visitors staying in Faro",
    "Travellers seeking a quieter island beach",
    "Couples",
    "Photographers",
    "Nature-focused visitors",
    "Birdwatching visitors",
    "Beach walkers",
    "Visitors comfortable with boat access and a less urban setting"
  ],
  "not_suitable_for": [
    "Visitors who need direct road access to the beach",
    "Visitors who do not want to depend on boat schedules",
    "Visitors requiring fully verified accessible-beach support",
    "Visitors expecting extensive resort infrastructure",
    "Those unprepared for sun exposure, wind or walking on sand"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon system of channels, islands, saltmarshes and sandbanks forming the natural setting around Ilha da Barreta.",
      "verification_status": "Verified"
    },
    {
      "name": "Cabo de Santa Maria",
      "type": "Geographical landmark",
      "description": "A landmark on Ilha da Barreta identified by regional tourism as the southernmost point of mainland Portugal.",
      "verification_status": "Verified"
    },
    {
      "name": "Faro waterfront",
      "type": "Boat departure area",
      "description": "The mainland departure area for boat connections towards Ilha Deserta / Barreta and other Ria Formosa island experiences.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha do Farol",
      "type": "Nearby island beach",
      "description": "A neighbouring Ria Formosa island beach area, listed by ABAAE among Faro’s 2026 Blue Flag locations.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha da Culatra",
      "type": "Nearby barrier island",
      "description": "A nearby Ria Formosa island with a fishing community and Atlantic-facing beach, also listed among Faro’s 2026 Blue Flag coastal locations.",
      "verification_status": "Verified"
    },
    {
      "name": "Faro Historic Centre",
      "type": "Historic town centre",
      "description": "Faro’s old town and waterfront are practical cultural stops before or after a boat trip to Ilha Deserta.",
      "verification_status": "Partially verified"
    }
  ],
  "nearby_towns": [
    "Faro",
    "Montenegro",
    "Olhão",
    "Ilha do Farol",
    "Ilha da Culatra"
  ],
  "walking_trails_nearby": [
    {
      "name": "Ilha Deserta / Barreta island walk",
      "description": "A low-impact island walk from the boat arrival area through the sandy barrier-island landscape towards the beach and Cabo de Santa Maria. Visitors should use marked paths and avoid protected dunes.",
      "verification_status": "Partially verified"
    },
    {
      "name": "Ilha Deserta shoreline walk",
      "description": "A long beach walk along the Atlantic-facing sand, best planned according to tide, wind, heat and boat return times.",
      "verification_status": "Verified"
    },
    {
      "name": "Ria Formosa boat-and-walk itinerary",
      "description": "A combined boat and walking outing through Faro’s Ria Formosa island landscape, suitable for visitors interested in birds, dunes and lagoon scenery.",
      "verification_status": "Partially verified"
    }
  ],
  "visitor_tips": [
    "Check boat schedules before travelling and confirm the last return to Faro.",
    "Carry water, sun protection and essentials, especially outside the most serviced summer periods.",
    "Use marked paths and avoid walking over dune vegetation.",
    "Allow time to walk beyond the main arrival area if you want a quieter stretch of sand.",
    "Check wind and sea conditions before swimming or using nautical activities.",
    "Visit early or later in the day for softer light and a quieter Ria Formosa atmosphere.",
    "Do not rely on current Blue Flag season dates without checking the latest official ABAAE or municipal update."
  ],
  "photography_notes": "Praia da Ilha Deserta / Barreta is especially strong for minimalist beach photography: open sand, low dunes, Ria Formosa light, Atlantic horizon and boat-arrival views. Early morning and late afternoon usually offer the best light.",
  "family_notes": "Families can enjoy Ilha Deserta as a quieter island beach day, but should plan carefully around boat times, heat, shade, water, walking distances and seasonal surveillance. Choose supervised seasonal areas where available and keep children away from tidal channels and dune zones.",
  "safety_notes": "Sea, wind and tide conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take extra care around boat traffic, tidal channels and exposed sun conditions.",
  "accessibility_notes": "Accessible-beach support was not verified from authoritative current sources. Because access requires boat travel and walking on a sandy island, visitors with reduced mobility should confirm boat boarding, paths, beach-entry conditions and any seasonal assistance before visiting.",
  "seo": {
    "meta_title": "Praia da Ilha Deserta / Barreta, Faro | Beach Guide",
    "meta_description": "Praia da Ilha Deserta / Barreta in Faro is a remote Ria Formosa island beach with vast sand, boat access, dunes and Blue Flag listing.",
    "keywords": [
      "Praia da Ilha Deserta",
      "Praia da Barreta",
      "Ilha Deserta Faro",
      "Ilha da Barreta",
      "Faro beaches",
      "Ria Formosa beaches",
      "Algarve island beach",
      "Portugal beaches",
      "Barreta Blue Flag",
      "Cabo de Santa Maria",
      "boat access beach Faro",
      "remote beach Algarve",
      "Ria Formosa Natural Park"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Ilha da Barreta / Ilha Deserta",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-barreta-ilha-deserta",
      "facts_verified": [
        "Beach name",
        "Ria Formosa - Faro location",
        "Barrier-island setting",
        "Ria Formosa Natural Park context",
        "Boat access from Faro",
        "Approximate 20-minute crossing",
        "Vast sandy beach",
        "No construction beyond beach-support infrastructure",
        "Protected birdlife context",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, bar and restaurant",
        "Activities including windsurfing and sailing"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Barreta",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/barreta/",
      "facts_verified": [
        "Official Barreta beach entry",
        "Coastal beach classification",
        "Municipality of Faro",
        "Coordinates",
        "Beach code PTCK9T",
        "Address as Ilha Deserta - Barreta",
        "Blue Flag page checked and found to show inconsistent season-date text"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Barreta listed among Faro’s 2026 Blue Flag coastal beach locations",
        "Faro 2026 Blue Flag locations checked: Barreta, Culatra-Mar, Faro-Mar and Ilha do Farol-Mar"
      ]
    },
    {
      "source_name": "Câmara Municipal de Faro - Praia da Ilha Deserta",
      "source_url": "https://www.cm-faro.pt/pt/1533/praia-da-ilha-deserta.aspx",
      "facts_verified": [
        "Official municipal beach page located",
        "Search-result verification that Praia da Barreta is among the best preserved and least frequented beaches in the Algarve",
        "Search-result verification of approximately 11 km of sand and quiet island character",
        "Full page returned a temporary fetch error, so facts are used cautiously"
      ]
    },
    {
      "source_name": "Visit Algarve - Ilha Deserta",
      "source_url": "https://visitalgarve.pt/equipamento/7621/Ilha%20Deserta",
      "facts_verified": [
        "Regional tourism listing for Ilha Deserta / Barreta",
        "Approximately 10 km of beach landscape",
        "Cabo de Santa Maria as the southernmost point of mainland Portugal",
        "Current near the bar noted in regional tourism summary",
        "Page required JavaScript when opened, so facts are used from official search-result text"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural da Ria Formosa",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnriaformosa",
      "facts_verified": [
        "Official protected-area context for the Ria Formosa Natural Park"
      ]
    },
    {
      "source_name": "Natural.pt - Ilhas Barreira da Ria Formosa",
      "source_url": "https://natural.pt/protected-areas/parque-natural-ria-formosa/points-of-interest/ilhas-barreira-da-ria-formosa-culatra",
      "facts_verified": [
        "Ria Formosa barrier-island system context",
        "Barreta / Deserta as part of the island sequence, based on official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Conhecer a Ria Formosa brochure",
      "source_url": "https://api.visitalgarve.pt/uploads/1/1/BrochurasPT/RIA-FORMOSA-PT_FINAL_WEB.pdf",
      "facts_verified": [
        "Ilha Deserta walking-route reference",
        "Starting and ending point at the Ilha Deserta pontoon",
        "Circular pedestrian route context",
        "The PDF fetch failed during research, so this is used cautiously from the official search-result summary"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Faro municipality, barrier-island setting, Ria Formosa Natural Park context, boat access, main facilities, coordinates and 2026 Blue Flag listing were verified from official tourism and ABAAE sources.",
    "The phrase “iconic remote Faro island beach” is supported by its verified island setting, boat-only access, minimal construction beyond beach support and official descriptions of the beach’s quiet preserved character.",
    "ABAAE’s 2026 list verifies Barreta among Faro’s 2026 Blue Flag locations. The individual ABAAE Barreta page showed inconsistent season-date text, so exact bathing-season and Blue Flag-display dates should be manually checked before publication updates.",
    "Facilities are included only where listed by VisitPortugal and marked Seasonal where operation may depend on the bathing season, boat services or concession activity.",
    "Accessible-beach support, island parking and detailed current ferry schedules were not verified from authoritative current sources and are therefore not claimed.",
    "Câmara Municipal de Faro and Visit Algarve pages were identified but returned limited text or fetch errors when opened, so their facts are used cautiously and supported primarily by VisitPortugal and ABAAE.",
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
  where slug = 'faro';

  if v_city_id is null then
    raise exception 'Faro city was not found';
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
