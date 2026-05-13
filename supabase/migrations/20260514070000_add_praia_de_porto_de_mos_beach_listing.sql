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
  'Historic western Algarve city with broad beaches, cliff coves, marina access and coastal walking routes.',
  37.102,
  -8.6742,
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
  v_slug text := 'praia-de-porto-de-mos-lagos';
  v_name text := 'Praia de Porto de Mós';
  v_address text := 'Praia de Porto de Mós, Porto de Mós / Lagos, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-de-porto-de-m%C3%B3s-0';
  v_latitude numeric := 37.085635;
  v_longitude numeric := -8.68802;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Porto de Mós",
  "slug": "praia-de-porto-de-mos-lagos",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Porto de Mós / Lagos",
  "concelho": "Lagos",
  "municipality": "Lagos",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Porto de Mós is a large, easy-access beach in Lagos, set west of the city below high cliffs. With broad golden sand, parking, beach services and accessible-beach recognition, it is one of Lagos’ most practical beach choices.",
  "full_description": "Praia de Porto de Mós is one of the largest and most accessible beaches in Lagos, located west of the city and framed by high cliffs at both ends. VisitPortugal describes it as a long tongue of golden sand, with blue-green sea tones and a cliff-top walking route west towards the Atalaia viewpoint.\n\nUnlike the smaller coves around Dona Ana and Camilo, Porto de Mós offers a broader and more open beach experience. Its generous sand area makes it useful for families, couples, beach walkers and visitors who want more space without travelling far from Lagos. Lagos municipal photo archive material describes the beach as generously sized, away from the main settlements, and one of the most frequented beaches in the municipality because the extensive sand still allows a degree of privacy.\n\nAccess is a key strength. Official tourism information lists arrival by car, motorcycle and on foot, with parking, bars, restaurants, showers, sunshade rental, surveillance and accessible-beach status. Regional tourism information also references asphalted road access from Lagos and directions towards the accessible beach.\n\nPorto de Mós is also a good base for coastal walking. To the west, the Atalaia viewpoint gives wide views towards Praia da Luz and the coastline in the direction of Sagres. To the east, Lagos’ dramatic cliff coast continues towards Canavial and Ponta da Piedade. Visitors should still take care near cliff edges and cliff bases, and should follow beach flags, signage and seasonal safety guidance.",
  "coordinates": {
    "latitude": 37.085635,
    "longitude": -8.68802,
    "label": "Praia de Porto de Mós",
    "notes": "Coordinates were taken from the official ABAAE Porto de Mós beach entry."
  },
  "beach_type": "Large sandy maritime beach below cliffs",
  "landscape": "A broad golden-sand beach in an open valley, framed at both ends by high cliffs and backed by a developed but less central Lagos beach setting.",
  "access": "Access is verified by official tourism sources by car, motorcycle and on foot. Visit Algarve references asphalted road access from Lagos and directions towards the accessible beach, while VisitPortugal lists parking and accessible-beach status.",
  "highlights": [
    "Large golden-sand beach west of Lagos",
    "Easy access with official parking and accessible-beach listing",
    "High cliffs framing both ends of the beach",
    "One of Lagos municipality’s most frequented beaches according to municipal source material",
    "Cliff walk towards Miradouro da Atalaia",
    "Official 2026 Blue Flag listing for Porto de Mós"
  ],
  "best_for": [
    "Families",
    "Accessible beach access",
    "Long beach walks",
    "Couples",
    "Scenic views",
    "Restaurants nearby",
    "Visitors staying in Lagos",
    "Coastal walks",
    "Large beach days"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "First-aid post", "status": "Seasonal / verify before visiting" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Seasonal sunshade rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Possible seasonal first-aid post",
    "Cliff walk towards Atalaia"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach-support period. May, June and September are often more comfortable for long walks, photography and easier access with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Porto de Mós as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Porto de Mós as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities and accessible-beach support may vary by season and should be checked before visiting.\nThe beach is backed by high cliffs; visitors should keep away from cliff bases and cliff edges.\nSea conditions can vary, especially on an open beach; visitors should follow beach flags, signage and official safety guidance.\nThe beach is popular in summer, but its large sand area can offer more space than smaller Lagos coves.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Porto de Mós as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Porto de Mós as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Facilities and accessible-beach support may vary by season and should be checked before visiting.",
      "The beach is backed by high cliffs; visitors should keep away from cliff bases and cliff edges.",
      "Sea conditions can vary, especially on an open beach; visitors should follow beach flags, signage and official safety guidance.",
      "The beach is popular in summer, but its large sand area can offer more space than smaller Lagos coves."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Porto de Mós as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Porto de Mós as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities and accessible-beach support may vary by season and should be checked before visiting.\nThe beach is backed by high cliffs; visitors should keep away from cliff bases and cliff edges.\nSea conditions can vary, especially on an open beach; visitors should follow beach flags, signage and official safety guidance.\nThe beach is popular in summer, but its large sand area can offer more space than smaller Lagos coves.",
  "best_time_to_visit": "June to September for the official bathing season and full beach-support period. May, June and September are often more comfortable for long walks, photography and easier access with less peak-summer pressure.",
  "suitable_for": [
    "Families wanting a large beach with services",
    "Visitors staying in Lagos",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Beach walkers",
    "Couples",
    "Photographers",
    "Visitors who prefer easier access than the smaller stair-access Lagos coves"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting a very small sheltered cove",
    "Anyone intending to sit close to cliff bases",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "nearby_attractions": [
    {
      "name": "Miradouro da Atalaia",
      "type": "Viewpoint",
      "description": "A viewpoint reached by a cliff-top route west of Porto de Mós, with views towards Praia da Luz and the coastline in the direction of Sagres.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Canavial",
      "type": "Nearby beach",
      "description": "A nearby Lagos beach between Porto de Mós and the Ponta da Piedade coastal area, useful for visitors exploring the western side of Lagos.",
      "verification_status": "Verified"
    },
    {
      "name": "Ponta da Piedade",
      "type": "Headland and coastal landmark",
      "description": "A major Lagos coastal landmark with carved rock formations and sea caves, located east of Porto de Mós along the wider cliff coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Luz",
      "type": "Nearby resort beach",
      "description": "A major west-Algarve resort beach west of Porto de Mós, visible from the Atalaia viewpoint area.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagos Historic Centre",
      "type": "Historic town centre",
      "description": "The nearby historic centre of Lagos offers restaurants, cultural sights, marina access and a wider city base for beach visitors.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Lagos",
    "Praia da Luz",
    "Porto de Mós",
    "Espiche",
    "Burgau"
  ],
  "walking_trails_nearby": [
    {
      "name": "Porto de Mós to Miradouro da Atalaia",
      "description": "VisitPortugal describes a cliff-top walking route west of Porto de Mós towards the Atalaia viewpoint, with views over the coastline towards Sagres and Praia da Luz.",
      "verification_status": "Verified"
    },
    {
      "name": "Luz to Lagos - Fishermen’s Trail / Rota Vicentina",
      "description": "Rota Vicentina lists the Luz to Lagos section and describes the Fishermen’s Trail as a coastal walking route along cliffs and sandy paths. Walkers should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Porto de Mós to Ponta da Piedade coastal route",
      "description": "A scenic Lagos coastal walk linking Porto de Mós with the wider Ponta da Piedade area. Route condition and cliff safety should be checked locally before setting out.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August for easier access to convenient parking and serviced beach areas.",
    "Use Porto de Mós if you want a larger Lagos beach with easier access than the smaller cliff coves.",
    "Confirm accessible-beach support before travelling if adapted equipment or assistance is required.",
    "Use official paths for cliff walks and keep away from cliff edges.",
    "Check beach flags before swimming, as conditions can vary.",
    "Walk west towards Atalaia for elevated coastal views when weather and path conditions are suitable."
  ],
  "photography_notes": "Praia de Porto de Mós is best photographed from the sand, from safe cliff-top viewpoints and from the western route towards Atalaia. The long beach, high cliffs and open Atlantic view work especially well in early morning or late-afternoon light.",
  "family_notes": "Porto de Mós is a strong family option because of its large sand area, easier access and official facilities. Families should still check flags, choose supervised seasonal areas and keep children away from cliff bases and rocky sections.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Stay away from cliff bases and cliff edges, and use care on any cliff-top walking route.",
  "accessibility_notes": "VisitPortugal lists Praia de Porto de Mós as an accessible beach, and Lagos municipal source material describes it as accessible to people with reduced mobility. Current seasonal support, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia de Porto de Mós, Lagos | Beach Guide",
    "meta_description": "Praia de Porto de Mós in Lagos is a large, easy-access Algarve beach with golden sand, cliffs, facilities and Blue Flag status.",
    "keywords": [
      "Praia de Porto de Mós",
      "Porto de Mos Beach",
      "Praia de Porto de Mos Lagos",
      "Lagos beaches",
      "Algarve beaches",
      "Portugal beaches",
      "large beach Lagos",
      "easy access beach Lagos",
      "accessible beach Lagos",
      "Blue Flag Porto de Mós",
      "Miradouro da Atalaia",
      "Praia da Luz nearby",
      "Ponta da Piedade"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Porto de Mós trip ideas",
      "links": [
        { "label": "Praia de Porto de Mós" },
        { "label": "Porto de Mos Beach" },
        { "label": "Praia de Porto de Mos Lagos" },
        { "label": "Blue Flag Porto de Mós" },
        { "label": "Miradouro da Atalaia" },
        { "label": "Ponta da Piedade" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Lagos" },
        { "label": "Praia da Luz" },
        { "label": "Porto de Mós" },
        { "label": "Espiche" },
        { "label": "Burgau" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Porto de Mós",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-porto-de-m%C3%B3s-0",
      "facts_verified": [
        "Beach name",
        "Location in Lagos",
        "Long golden-sand beach",
        "High cliff setting",
        "Cliff-top route west to Miradouro da Atalaia",
        "Views towards Praia da Luz and Sagres coastline",
        "Facilities including Blue Flag, surveillance, sunshade rental, showers, parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Porto de Mós",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/porto-de-mos/",
      "facts_verified": [
        "Official Porto de Mós beach entry",
        "Coastal beach classification",
        "Municipality of Lagos",
        "Coordinates",
        "Beach code PTCP2X",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Porto de Mós listed among Lagos’ 2026 Blue Flag locations",
        "Lagos listed with four awarded 2026 locations: Luz, Meia Praia, Porto de Mós and Marina de Lagos"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Porto de Mós",
      "source_url": "https://visitalgarve.pt/equipamento/8808/praia-do-porto-de-ms",
      "facts_verified": [
        "Large beach in an ample open valley",
        "High cliffs at either end",
        "Atalaia viewpoint at the western cliff",
        "Asphalted road access from Lagos",
        "Directions towards accessible beach",
        "Parking reference from official search-result summary"
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Porto de Mós",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/porto-de-mos-5",
      "facts_verified": [
        "Beach of generous size",
        "One of the most frequented beaches in Lagos municipality",
        "Extensive sand allowing some privacy",
        "Accessible to people with reduced mobility",
        "Beach support and surveillance"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Praia Acessível, Praia para Todos",
      "source_url": "https://www.cm-lagos.pt/areas-de-atuacao/ambiente/epoca-balnear/152-praia-acessivel-praia-para-todos",
      "facts_verified": [
        "Accessible-beach criteria in Lagos municipality",
        "Accessible pedestrian access and reserved parking criteria",
        "Ramp access to bathing area criteria",
        "Adapted sanitary and first-aid access criteria"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Posto de Enfermagem da Praia da Luz",
      "source_url": "https://www.cm-lagos.pt/municipio/noticias/14224-posto-de-enfermagem-da-praia-da-luz-ja-esta-em-funcionamento",
      "facts_verified": [
        "2025 municipal reference to a first-aid post at Praia de Porto de Mós",
        "Operation by Lagos firefighters during the bathing season from 10:00 to 19:00 in that year",
        "Seasonal first-aid context requiring current confirmation"
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73799",
      "facts_verified": [
        "Lagos coastal context",
        "Ponta da Piedade as a major nearby rock formation with caves",
        "Canavial, Porto de Mós and Praia da Luz included in Lagos beach offer",
        "Urban bus routes linking Lagos points and beaches",
        "Lagos historic centre, marina and nearby attractions"
      ]
    },
    {
      "source_name": "Rota Vicentina - Luz to Lagos",
      "source_url": "https://rotavicentina.com/walking/luz-lagos/",
      "facts_verified": [
        "Luz to Lagos walking section listed by Rota Vicentina"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail coastal walking route context",
        "Cliff and sandy-path route character",
        "Walking-only guidance",
        "Cliff-edge and erosion safety guidance"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Lagos municipality, large sandy character, cliff setting, services, access, coordinates and 2026 Blue Flag season were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “large Lagos beach with easy access” is supported by VisitPortugal’s access and facility listing, Visit Algarve’s asphalted-road access reference, and Lagos municipal source material describing the beach as generously sized and accessible to people with reduced mobility.",
    "ABAAE verifies Porto de Mós’ 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where verified from official sources and marked Seasonal where operation may depend on bathing season, concessions or current beach support.",
    "First-aid information is included cautiously because the municipal source referenced 2025 seasonal operation; it should be checked before future publication updates.",
    "Accessibility is verified at recognition level, but current seasonal support, adapted equipment and best access point should be confirmed before visiting.",
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
  where slug = 'lagos';

  if v_city_id is null then
    raise exception 'Lagos city was not found';
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
