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
  'Algarve capital city with historic centre access, Ria Formosa boat departures and Praia de Faro nearby.',
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
  v_slug text := 'praia-de-faro-ilha-de-faro';
  v_name text := 'Praia de Faro / Ilha de Faro';
  v_short_description text := $short$
Praia de Faro, commonly known as Ilha de Faro, is the main beach used by visitors staying in Faro city. Set on the Ancão barrier peninsula beside the Ria Formosa, it combines a long Atlantic-facing sandy shore with city access and seasonal beach services.
$short$;
  v_description text := $description$
Praia de Faro is the principal beach for Faro city visitors, located on the barrier sand formation commonly known as Ilha de Faro and officially associated with the Ancão Peninsula. It sits between the Atlantic Ocean and the Ria Formosa lagoon system, giving the beach a distinctive dual character: open sea on one side and protected estuary scenery on the other.

Official tourism sources describe Ilha de Faro as the first barrier island or sand formation separating the sea from the Ria Formosa when arriving from the west, and as part of the Natural Park setting. The beach is accessible by road over a narrow bridge connecting it with the Faro road network, and is also close to Faro Airport, making it one of the Algarve's most convenient beach stops for travellers based in or passing through the city.

Unlike the cliff beaches of the western Algarve, Praia de Faro is long, flat and sandy, with a more urban-island atmosphere around the central built-up area. VisitPortugal lists a full range of beach support, including Blue Flag, surveillance, sunshade rental, small craft hire, showers, bars, restaurants, windsurfing, sailing and accessible-beach status. These services may be seasonal and should be confirmed before visiting.

Because it is Faro's most accessible beach by road, Praia de Faro can become busy in summer, especially near the bridge, main entrances and serviced areas. Visitors should respect dune and protected-area guidance, use marked access points and follow local beach flags and safety signage.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Faro / Ilha de Faro",
  "slug": "praia-de-faro-ilha-de-faro",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Praia de Faro / Faro",
  "concelho": "Faro",
  "municipality": "Faro",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Faro, commonly known as Ilha de Faro, is the main beach used by visitors staying in Faro city. Set on the Ancão barrier peninsula beside the Ria Formosa, it combines a long Atlantic-facing sandy shore with city access and seasonal beach services.",
  "full_description": "Praia de Faro is the principal beach for Faro city visitors, located on the barrier sand formation commonly known as Ilha de Faro and officially associated with the Ancão Peninsula. It sits between the Atlantic Ocean and the Ria Formosa lagoon system, giving the beach a distinctive dual character: open sea on one side and protected estuary scenery on the other.\n\nOfficial tourism sources describe Ilha de Faro as the first barrier island or sand formation separating the sea from the Ria Formosa when arriving from the west, and as part of the Natural Park setting. The beach is accessible by road over a narrow bridge connecting it with the Faro road network, and is also close to Faro Airport, making it one of the Algarve's most convenient beach stops for travellers based in or passing through the city.\n\nUnlike the cliff beaches of the western Algarve, Praia de Faro is long, flat and sandy, with a more urban-island atmosphere around the central built-up area. VisitPortugal lists a full range of beach support, including Blue Flag, surveillance, sunshade rental, small craft hire, showers, bars, restaurants, windsurfing, sailing and accessible-beach status. These services may be seasonal and should be confirmed before visiting.\n\nBecause it is Faro's most accessible beach by road, Praia de Faro can become busy in summer, especially near the bridge, main entrances and serviced areas. Visitors should respect dune and protected-area guidance, use marked access points and follow local beach flags and safety signage.",
  "coordinates": {
    "latitude": 37.006974,
    "longitude": -7.99399,
    "label": "Faro-Mar / Praia de Faro",
    "notes": "Coordinates were taken from the official ABAAE Faro-Mar beach entry."
  },
  "beach_type": "Long sandy maritime beach on a barrier peninsula",
  "landscape": "A flat, extensive sandy beach facing the Atlantic Ocean, with the Ria Formosa lagoon, channels, dunes and protected wetland scenery behind it.",
  "access": "Official sources verify road access over a narrow bridge from the Faro road network. VisitPortugal also lists Praia de Faro-Mar as accessible by road or boat in its accessible itinerary information. Access and traffic conditions can vary, especially in summer, so visitors should confirm current arrangements before travelling.",
  "highlights": [
    "Main beach for Faro city visitors",
    "Long sandy shore between the Atlantic and Ria Formosa",
    "Road access over a narrow bridge from the Faro side",
    "Part of the Ria Formosa Natural Park landscape",
    "Seasonal restaurants, beach support and nautical activities listed by official tourism sources",
    "Official 2026 Blue Flag listing for Faro-Mar"
  ],
  "best_for": [
    "Faro city visitors",
    "Families",
    "Long beach walks",
    "Urban beach days",
    "Accessible beach access",
    "Nature lovers",
    "Ria Formosa scenery",
    "Windsurfing when conditions are suitable",
    "Sailing when conditions are suitable"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Faro-Mar", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "Amphibious chair listed by VisitPortugal accessible itinerary", "status": "Seasonal / verify before visiting" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Small craft hire", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" },
    { "name": "Car parking", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing for Faro-Mar",
    "Seasonal surveillance",
    "Accessible beach designation",
    "Seasonal amphibious chair reference",
    "Seasonal sunshade rental",
    "Seasonal small craft hire",
    "Showers",
    "Seasonal bars and restaurants",
    "Windsurfing and sailing activity context"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full summer beach atmosphere. May, June and September are often more comfortable for beach walks, Ria Formosa views and less crowded city-beach visits.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Faro-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Faro-Mar as 19 June 2026 to 30 September 2026.\nThe beach is accessed by a narrow bridge, so vehicle access may be slower or more limited during peak summer periods.\nPraia de Faro is part of the Ria Formosa protected coastal environment; visitors should respect dunes, habitats and marked access points.\nFacilities and beach-support services may vary by season and beach section.\nSea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.\nParking conditions were not fully verified from authoritative current sources and should be manually checked before publication.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Faro-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Faro-Mar as 19 June 2026 to 30 September 2026.",
      "The beach is accessed by a narrow bridge, so vehicle access may be slower or more limited during peak summer periods.",
      "Praia de Faro is part of the Ria Formosa protected coastal environment; visitors should respect dunes, habitats and marked access points.",
      "Facilities and beach-support services may vary by season and beach section.",
      "Sea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Parking conditions were not fully verified from authoritative current sources and should be manually checked before publication."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Faro-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Faro-Mar as 19 June 2026 to 30 September 2026.\nThe beach is accessed by a narrow bridge, so vehicle access may be slower or more limited during peak summer periods.\nPraia de Faro is part of the Ria Formosa protected coastal environment; visitors should respect dunes, habitats and marked access points.\nFacilities and beach-support services may vary by season and beach section.\nSea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.\nParking conditions were not fully verified from authoritative current sources and should be manually checked before publication.",
  "best_time_to_visit": "June to September for the official bathing season and full summer beach atmosphere. May, June and September are often more comfortable for beach walks, Ria Formosa views and less crowded city-beach visits.",
  "suitable_for": [
    "Visitors staying in Faro",
    "Families using serviced beach sections",
    "Travellers arriving through Faro Airport",
    "Beach walkers",
    "Visitors wanting a beach with restaurants nearby",
    "Visitors interested in the Ria Formosa setting",
    "Visitors needing officially recognised accessible-beach support, subject to current confirmation"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped island beach",
    "Visitors looking for cliff scenery",
    "Those wishing to avoid busy city beaches in summer",
    "Visitors expecting guaranteed easy parking at peak times",
    "Visitors wanting completely sheltered sea conditions"
  ],
  "nearby_attractions": [
    {
      "name": "Parque Natural da Ria Formosa",
      "type": "Protected natural park",
      "description": "A protected lagoon and wetland system of channels, islands, sandbanks, marshes and barrier formations extending along the Algarve coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho do Ludo / Percursos do Ludo",
      "type": "Walking and cycling route",
      "description": "A nearby Faro and Loulé route through the Ria Formosa landscape, with lagoon margins, saltpans and birdwatching interest.",
      "verification_status": "Verified"
    },
    {
      "name": "Faro Historic Centre",
      "type": "Historic town centre",
      "description": "The old centre of Faro, with the cathedral area, city walls, museums, restaurants and access to Ria Formosa boat departures.",
      "verification_status": "Verified"
    },
    {
      "name": "Cais das Portas do Mar",
      "type": "Boat departure point",
      "description": "A Faro waterfront departure area for regular maritime links and Ria Formosa boat services to the barrier islands.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha da Barreta / Ilha Deserta",
      "type": "Barrier island beach",
      "description": "A nearby Ria Formosa island beach reached by boat services from Faro, suitable for visitors exploring the wider protected lagoon system.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha do Farol",
      "type": "Barrier island beach and village area",
      "description": "A Ria Formosa island beach area associated with Culatra and the lighthouse settlement, reached by maritime services.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Faro",
    "Montenegro",
    "Gambelas",
    "Olhão",
    "Almancil",
    "Quinta do Lago"
  ],
  "walking_trails_nearby": [
    {
      "name": "Percursos do Ludo",
      "description": "Visit Algarve lists the Ludo routes as pedestrian and cyclable routes in the Faro and Loulé area, following the boundary between land and the Ria Formosa lagoon system.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Faro shoreline walk",
      "description": "A long sandy shoreline walk along Praia de Faro, best planned according to tide, wind and weather conditions. Visitors should stay on marked access routes across dune areas.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if travelling by car, as the bridge and central access areas can become busy.",
    "Use marked access routes to protect dunes and Ria Formosa habitats.",
    "Check beach flags before swimming or practising water sports.",
    "Confirm current accessible-beach support before travelling if mobility assistance is needed.",
    "For a quieter feel, walk away from the most central serviced section when conditions and access allow.",
    "Combine the beach with Faro historic centre or a Ria Formosa boat trip for a fuller city-and-coast visit."
  ],
  "photography_notes": "Praia de Faro is best photographed for its long open sand, Atlantic horizon, low dunes and contrast between city access and Ria Formosa nature. Early morning and late afternoon are usually better for softer light and quieter beach scenes.",
  "family_notes": "Praia de Faro can suit families who want a practical beach close to Faro, with official tourism sources listing beach support and restaurants. Families should choose supervised sections during the bathing season, check sea conditions and plan carefully around summer access pressure.",
  "safety_notes": "Sea, wind and tide conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Respect protected dune and lagoon areas, and take care around nautical activity zones.",
  "accessibility_notes": "Official tourism sources list Praia de Faro as an accessible beach, and VisitPortugal's accessible itinerary references road or boat access to Praia de Faro-Mar and an amphibious chair. Visitors with reduced mobility should confirm current seasonal support, bridge access conditions and the most suitable beach entrance before visiting.",
  "seo": {
    "meta_title": "Praia de Faro / Ilha de Faro | Algarve Beach Guide",
    "meta_description": "Praia de Faro, or Ilha de Faro, is Faro city's main beach, with long sand, Ria Formosa scenery, bridge access and seasonal services.",
    "keywords": [
      "Praia de Faro",
      "Ilha de Faro",
      "Faro Beach",
      "Faro beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Ria Formosa",
      "Faro-Mar",
      "Praia de Faro Blue Flag",
      "accessible beach Faro",
      "main beach Faro city",
      "Ancão Peninsula"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Faro trip ideas",
      "links": [
        { "label": "Praia de Faro" },
        { "label": "Ilha de Faro" },
        { "label": "Faro Beach" },
        { "label": "Ria Formosa" },
        { "label": "Faro-Mar" },
        { "label": "accessible beach Faro" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Parque Natural da Ria Formosa" },
        { "label": "Percursos do Ludo" },
        { "label": "Faro Historic Centre" },
        { "label": "Cais das Portas do Mar" },
        { "label": "Ilha Deserta" },
        { "label": "Ilha do Farol" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Ilha de Faro",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/26820022-6305-4A53-B7F8-C691184A60B1",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Ria Formosa - Faro location",
        "Barrier-island setting separating sea from Ria Formosa",
        "Beginning of the Natural Park context",
        "Road access by narrow bridge",
        "Proximity to Faro Airport",
        "Large sandy beach and support infrastructure",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, bar, restaurant, windsurfing, sailing and accessible beach"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Faro (Península do Ancão)",
      "source_url": "https://visitalgarve.pt/equipamento/8763/praia-de-faro-pennsula-do-anco",
      "facts_verified": [
        "Praia de Faro official regional tourism listing",
        "Known as Ilha de Faro",
        "Geographical association with the Ancão Peninsula",
        "Blue Flag and accessible beach category references",
        "Faro-Mar and Faro-Ria distinction noted in the regional tourism result"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Faro-Mar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/faro-mar/",
      "facts_verified": [
        "Official Faro-Mar beach entry",
        "Municipality of Faro",
        "Coastal beach classification",
        "Coordinates",
        "Beach code PTCP9U",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Address at Av. Nascente, Praia de Faro"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Faro listed with four awarded 2026 locations",
        "Faro-Mar listed among Faro's 2026 Blue Flag locations",
        "Barreta, Culatra-Mar and Ilha do Farol-Mar also listed as Faro 2026 Blue Flag locations"
      ]
    },
    {
      "source_name": "Câmara Municipal de Faro - Praia de Faro",
      "source_url": "https://www.cm-faro.pt/1532/praia-de-faro.aspx",
      "facts_verified": [
        "Praia de Faro municipal beach page located",
        "Search-result verification that Praia de Faro is on the Ancão Peninsula",
        "Search-result verification that it is integrated in the Ria Formosa Natural Park",
        "Search-result verification of accessible-beach distinction"
      ]
    },
    {
      "source_name": "VisitPortugal - Faro Accessible Itinerary",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/315833",
      "facts_verified": [
        "Praia de Faro-Mar accessible by road or boat",
        "Accessible beach distinction",
        "Amphibious chair reference for access to the water"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural da Ria Formosa",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnriaformosa",
      "facts_verified": [
        "Ria Formosa Natural Park protected-area context",
        "Lagoon and wetland setting in the Algarve",
        "Natural-park relevance for Praia de Faro's surrounding environment"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural da Ria Formosa",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-da-ria-formosa",
      "facts_verified": [
        "Ria Formosa as an internationally important wetland",
        "Channels, islands, marshes and sandbank landscape",
        "Approximate 60 km extent along the Algarve coast"
      ]
    },
    {
      "source_name": "Visit Algarve - Percursos do Ludo",
      "source_url": "https://visitalgarve.pt/10098/percursos-do-ludo",
      "facts_verified": [
        "Ludo routes as pedestrian and cyclable",
        "Faro and Loulé location",
        "Ria Formosa lagoon-system context",
        "8.4 km route distance listed by regional tourism"
      ]
    },
    {
      "source_name": "Câmara Municipal de Faro - Barcos para as ilhas",
      "source_url": "https://www.cm-faro.pt/421/barcos-para-as-ilhas.aspx",
      "facts_verified": [
        "Regular maritime connections and boat services from Faro",
        "Cais das Portas do Mar departure context for Ria Formosa island access"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Faro municipality, Ria Formosa setting, road bridge access, accessible-beach status, facilities and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "The public name is commonly given as Praia de Faro or Ilha de Faro. Official sources also identify it with the Ancão Peninsula and the Faro-Mar beach section.",
    "The phrase main beach for Faro city is used editorially and cautiously, based on its verified city proximity, road bridge access and full support infrastructure.",
    "ABAAE verifies Faro-Mar's 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 19 June 2026 to 30 September 2026.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Parking conditions were not fully verified from authoritative current sources, so parking is marked Not verified and should be checked manually before publication.",
    "Accessibility is verified from official tourism sources, but visitors with reduced mobility should confirm current seasonal support and the best access point before travelling.",
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
  where slug = 'faro'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city faro was not found';
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
      'https://www.visitportugal.com/en/NR/exeres/26820022-6305-4A53-B7F8-C691184A60B1',
      'Praia de Faro / Ilha de Faro, Faro, Algarve, Portugal',
      37.006974,
      -7.99399,
      array[
        'Praia de Faro',
        'Ilha de Faro',
        'Faro Beach',
        'Faro beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Ria Formosa',
        'Faro-Mar',
        'Praia de Faro Blue Flag',
        'accessible beach Faro',
        'main beach Faro city',
        'Ancão Peninsula'
      ],
      v_category_data,
      'Praia de Faro / Ilha de Faro | Algarve Beach Guide',
      'Praia de Faro, or Ilha de Faro, is Faro city''s main beach, with long sand, Ria Formosa scenery, bridge access and seasonal services.',
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
      website_url = 'https://www.visitportugal.com/en/NR/exeres/26820022-6305-4A53-B7F8-C691184A60B1',
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
      address = 'Praia de Faro / Ilha de Faro, Faro, Algarve, Portugal',
      latitude = 37.006974,
      longitude = -7.99399,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Faro',
        'Ilha de Faro',
        'Faro Beach',
        'Faro beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Ria Formosa',
        'Faro-Mar',
        'Praia de Faro Blue Flag',
        'accessible beach Faro',
        'main beach Faro city',
        'Ancão Peninsula'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Faro / Ilha de Faro | Algarve Beach Guide',
      meta_description = 'Praia de Faro, or Ilha de Faro, is Faro city''s main beach, with long sand, Ria Formosa scenery, bridge access and seasonal services.',
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
