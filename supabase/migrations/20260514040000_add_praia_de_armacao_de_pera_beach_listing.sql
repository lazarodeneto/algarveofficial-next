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
  'Armação de Pêra',
  'armacao-de-pera',
  'Seaside resort town in Silves with a broad bay beach, fishing heritage and links to Praia Grande de Pêra.',
  37.1025,
  -8.3556,
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
  v_slug text := 'praia-de-armacao-de-pera-silves';
  v_name text := 'Praia de Armação de Pêra';
  v_address text := 'Praia de Armação de Pêra, Armação de Pêra, Silves, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-de-armacao-de-pera';
  v_latitude numeric := 37.100591;
  v_longitude numeric := -8.356549;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Armação de Pêra",
  "slug": "praia-de-armacao-de-pera-silves",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Armação de Pêra",
  "concelho": "Silves",
  "municipality": "Silves",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Armação de Pêra is a large urban resort beach in Silves, set directly in front of one of the Algarve’s busiest summer coastal towns. It is known for its extensive sand, dense seafront development, fishing heritage and high summer use.",
  "full_description": "Praia de Armação de Pêra is the main beach of Armação de Pêra, the only major seaside resort in the municipality of Silves. Official tourism sources describe the town as a former fishing village that is now one of the Algarve’s busiest summer localities, with an extensive sandy beach much sought after by holidaymakers.\n\nThe beach sits in a broad bay, with the urban seafront, hotels, apartment blocks, restaurants and visitor services immediately behind the sand. This gives it a very practical but highly developed character: it is convenient, lively and well served, but not secluded. In July and August, the central sections can become very busy, especially near the promenade, concession areas and main town access points.\n\nThe eastern section of the sand is traditionally known as Praia dos Pescadores, reflecting Armação de Pêra’s fishing heritage. Colourful fishing boats and working maritime activity remain part of the beach identity, even though the town is now strongly shaped by tourism.\n\nPraia de Armação de Pêra is also well connected for longer coastal outings. To the east, Praia Grande de Pêra and the Salgados wetland landscape offer a more open dune-and-lagoon setting. To the west, Vale do Olival begins the transition towards the rockier Lagoa coastline. Visitors should expect seasonal services, follow local flags and signage, and plan ahead during peak summer.",
  "coordinates": {
    "latitude": 37.100591,
    "longitude": -8.356549,
    "label": "Praia de Armação de Pêra",
    "notes": "Coordinates were taken from the official ABAAE Armação de Pêra beach entry."
  },
  "beach_type": "Large sandy urban maritime beach",
  "landscape": "A broad sandy beach in a wide bay, backed by a dense urban resort seafront, promenade areas, beach facilities and the traditional fishing section at the eastern end.",
  "access": "Official sources verify access by car, motorcycle and on foot through the resort of Armação de Pêra. Visit Algarve notes organised parking throughout the resort and informal parking in surrounding areas. Visitors should confirm current access and parking conditions before travelling in peak summer.",
  "highlights": [
    "Large sandy urban beach in the main seaside resort of Silves",
    "Dense resort zone with restaurants, bars, accommodation and promenade areas nearby",
    "One of the Algarve’s busiest summer localities according to official tourism wording",
    "Eastern fishing section known as Praia dos Pescadores",
    "Accessible-beach recognition listed by official tourism and accessibility sources",
    "Official 2026 Blue Flag listing for Armação de Pêra"
  ],
  "best_for": [
    "Resort beach days",
    "Families using serviced sections",
    "Summer atmosphere",
    "Restaurants nearby",
    "Accessible beach access",
    "Long beach walks",
    "Fishing heritage",
    "Visitors staying in Armação de Pêra",
    "High-capacity beach days"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious chair and assisted bathing support listed for Barcos / Armação de Pêra-Nascente by Visit Algarve accessible-beach information", "status": "Seasonal / verify before visiting" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "WC", "status": "Verified / Seasonal" },
    { "name": "Beach and recreational support facilities", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Amphibious chair and assisted bathing context",
    "Seasonal sunshade rental",
    "Light boat rental",
    "Car parking",
    "Bar and restaurant",
    "WC",
    "Beach and recreational support facilities"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full summer resort atmosphere. May, June and September are usually more comfortable for visitors who want services with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Armação de Pêra as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Armação de Pêra as 1 June 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia de Armação de Pêra is a dense urban resort beach and can become very busy in July and August.\nFacilities, surveillance and accessible-beach support may vary by season and beach section.\nThe eastern area is associated with fishing activity, so visitors should respect working boats, equipment and designated areas.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nFor more space and a more natural setting, visitors can consider walking east towards Praia Grande de Pêra when conditions allow.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Armação de Pêra as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Armação de Pêra as 1 June 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia de Armação de Pêra is a dense urban resort beach and can become very busy in July and August.",
      "Facilities, surveillance and accessible-beach support may vary by season and beach section.",
      "The eastern area is associated with fishing activity, so visitors should respect working boats, equipment and designated areas.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "For more space and a more natural setting, visitors can consider walking east towards Praia Grande de Pêra when conditions allow."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Armação de Pêra as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Armação de Pêra as 1 June 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia de Armação de Pêra is a dense urban resort beach and can become very busy in July and August.\nFacilities, surveillance and accessible-beach support may vary by season and beach section.\nThe eastern area is associated with fishing activity, so visitors should respect working boats, equipment and designated areas.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nFor more space and a more natural setting, visitors can consider walking east towards Praia Grande de Pêra when conditions allow.",
  "best_time_to_visit": "June to September for the official bathing season and full summer resort atmosphere. May, June and September are usually more comfortable for visitors who want services with less peak-summer pressure.",
  "suitable_for": [
    "Visitors staying in Armação de Pêra",
    "Families wanting a large serviced beach",
    "Visitors seeking a lively resort beach",
    "Accessible-beach users, subject to current seasonal confirmation",
    "Beach walkers",
    "Visitors who value restaurants and town services nearby",
    "Travellers interested in Algarve fishing heritage"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting dramatic cliff-cove scenery directly on the main beach",
    "Those wishing to avoid dense resort areas in summer",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Visitors looking for guaranteed quiet in July and August"
  ],
  "nearby_attractions": [
    {
      "name": "Praia dos Pescadores",
      "type": "Fishing beach section",
      "description": "The eastern section of the Armação de Pêra sands, associated with fishing activity and traditional boats.",
      "verification_status": "Verified"
    },
    {
      "name": "Fortaleza de Armação de Pêra",
      "type": "Historic fort",
      "description": "A classified historic fort in central Armação de Pêra, linked to the town’s coastal defence and maritime history.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia Grande de Pêra",
      "type": "Nearby beach",
      "description": "A wider and less urban beach east of Armação de Pêra, between the Ribeira de Alcantarilha and the Salgados Lagoon.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagoa dos Salgados",
      "type": "Wetland and lagoon area",
      "description": "A nearby lagoon and wetland landscape east of Praia Grande de Pêra, noted by official tourism sources for protected bird species.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Vale do Olival",
      "type": "Nearby beach",
      "description": "A neighbouring beach at the western end of the Armação de Pêra sands, where the coast begins to become rockier towards Lagoa.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Senhora da Rocha",
      "type": "Nearby beach and viewpoint",
      "description": "A cliff-framed beach in nearby Porches, Lagoa, with a chapel and viewpoint on the rocky promontory.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Armação de Pêra",
    "Pêra",
    "Alcantarilha",
    "Porches",
    "Silves",
    "Lagoa"
  ],
  "walking_trails_nearby": [
    {
      "name": "Armação de Pêra beachfront promenade",
      "description": "A town-front walking route along the seafront, supported by Visit Algarve’s reference to a pedestrian promenade overlooking the central beach sector.",
      "verification_status": "Verified"
    },
    {
      "name": "Armação de Pêra to Praia Grande / Salgados shoreline walk",
      "description": "A long beach and dune-side walk east towards Praia Grande de Pêra and the Salgados Lagoon area, best planned according to tide, heat, wind and current access conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale do Olival cliff-side trail",
      "description": "VisitPortugal notes a trail around the cliffs at Vale do Olival with sea views and a pedestrian link to Praia dos Beijinhos.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient beach and parking areas.",
    "Use the promenade for a simple beach-and-town route with restaurants and services close by.",
    "Choose the central sections for convenience, or walk east towards Praia Grande for a more open setting when conditions allow.",
    "Respect fishing boats and working maritime areas at Praia dos Pescadores.",
    "Confirm accessible-beach support before travelling if adapted equipment or assisted bathing is required.",
    "Check beach flags before swimming or using seasonal nautical services."
  ],
  "photography_notes": "Praia de Armação de Pêra is best photographed for its broad bay, colourful fishing boats, urban resort skyline and long summer beach scene. Early morning usually offers calmer light and fewer crowds around the fishing section and promenade.",
  "family_notes": "The beach can suit families because of its large sand area, town services and official beach support. Families should still choose supervised seasonal sections, check flags and plan around high summer crowding.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and surveillance guidance where present. Take care around fishing boats, nautical activity areas and crowded summer sections.",
  "accessibility_notes": "VisitPortugal lists Praia de Armação de Pêra as an accessible beach, and Visit Algarve accessible-beach information lists Barcos / Armação de Pêra-Nascente with amphibious chair and assisted bathing support. Current seasonal support and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia de Armação de Pêra, Silves | Beach Guide",
    "meta_description": "Praia de Armação de Pêra in Silves is a large resort beach with extensive sand, fishing heritage, facilities and high summer use.",
    "keywords": [
      "Praia de Armação de Pêra",
      "Armacao de Pera Beach",
      "Armação de Pêra Silves",
      "Silves beaches",
      "Algarve beaches",
      "Portugal beaches",
      "resort beach Algarve",
      "family beach Armação de Pêra",
      "accessible beach Silves",
      "Praia dos Pescadores Armação de Pêra",
      "Praia Grande de Pêra",
      "Lagoa dos Salgados"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Armação de Pêra trip ideas",
      "links": [
        { "label": "Praia de Armação de Pêra" },
        { "label": "Armacao de Pera Beach" },
        { "label": "Praia dos Pescadores Armação de Pêra" },
        { "label": "Fortaleza de Armação de Pêra" },
        { "label": "Praia Grande de Pêra" },
        { "label": "Lagoa dos Salgados" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Armação de Pêra" },
        { "label": "Pêra" },
        { "label": "Alcantarilha" },
        { "label": "Porches" },
        { "label": "Silves" },
        { "label": "Lagoa" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Armação de Pêra",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-armacao-de-pera",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Armação de Pêra, Silves",
        "Former fishing-village origin",
        "Armação de Pêra as one of the Algarve’s busiest localities",
        "Extensive sandy beach popular with summer visitors",
        "Eastern section known as Praia dos Pescadores",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Câmara Municipal de Silves - Praia de Armação de Pêra",
      "source_url": "https://www.cm-silves.pt/pt/960/praia-de-armacao-de-pera.aspx",
      "facts_verified": [
        "Municipal beach page for Praia de Armação de Pêra",
        "Wide bay setting",
        "Approximate 3 km sandy stretch bounded by the Alcantarilha and Espiche streams",
        "Fishing boats on the eastern section from official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Armação de Pêra",
      "source_url": "https://visitalgarve.pt/equipamento/8759/praia-de-armao-de-pra",
      "facts_verified": [
        "Pedestrian promenade overlooking the central beach sector",
        "Gardened areas and sea views from the promenade",
        "Facilities including restaurants, WC, beach support, recreational support and surveillance during the bathing season",
        "Accessible beach reference",
        "Access on foot and by car through Armação de Pêra",
        "Organised and informal parking references from English regional tourism result"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Armação de Pêra",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/armacao-de-pera/",
      "facts_verified": [
        "Official Armação de Pêra coastal beach entry",
        "Municipality of Silves",
        "Coordinates",
        "Beach code PTCN7V",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Armação de Pêra listed among Silves’ 2026 Blue Flag locations",
        "Praia Grande Poente also listed among Silves’ 2026 Blue Flag locations"
      ]
    },
    {
      "source_name": "Visit Algarve - Praias Acessíveis",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Barcos / Armação de Pêra-Nascente listed with amphibious chair and assisted bathing support",
        "Accessible-beach support context for Silves beaches"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia Grande - Pêra",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-grande-pera",
      "facts_verified": [
        "Praia Grande de Pêra as nearby beach east of Armação de Pêra",
        "Boundary between Ribeira de Alcantarilha and Lagoa dos Salgados",
        "Salgados Lagoon as ecological area sought by protected bird species",
        "Dune and golden-sand landscape"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Vale do Olival - Alporchinhos",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-do-olival-alporchinhos",
      "facts_verified": [
        "Praia do Vale do Olival at the western end of Praia de Armação de Pêra",
        "Rock formations shaped by erosion",
        "Cliff-side trail with sea views",
        "Pedestrian link to Praia dos Beijinhos"
      ]
    },
    {
      "source_name": "Património Cultural - Fortaleza de Armação de Pêra",
      "source_url": "https://imovel.patrimoniocultural.gov.pt/detalhes.php?code=72822",
      "facts_verified": [
        "Fortaleza de Armação de Pêra location in Armação de Pêra, Silves",
        "Military architecture classification",
        "Imóvel de Interesse Público protection status"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Senhora da Rocha",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/8F33EF00-2ED5-43F5-A2DC-B571C9AC6AE1",
      "facts_verified": [
        "Nearby Senhora da Rocha beach in Porches, Lagoa",
        "Small beach between high cliffs",
        "Chapel viewpoint and coastal scenery context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, extensive sandy character, urban resort setting, fishing heritage, facilities, coordinates and 2026 Blue Flag season were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “dense resort zone, high summer use” is supported by VisitPortugal’s description of Armação de Pêra as one of the Algarve’s busiest localities and by official references to its extensive tourist services and urban beach setting.",
    "ABAAE verifies Armação de Pêra’s 2026 bathing season and Blue Flag season as 1 June 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season, concessions or accessible-beach support schedules.",
    "Showers were not included as verified because the official sources checked for this beach did not clearly confirm them.",
    "Accessibility is verified at recognition level, with specific seasonal support listed for Barcos / Armação de Pêra-Nascente; current support should be manually confirmed before publication.",
    "Some Câmara Municipal de Silves pages returned fetch errors when opened, so municipal details from those pages are used cautiously and supported by official search-result summaries plus VisitPortugal, Visit Algarve and ABAAE data.",
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
  where slug = 'armacao-de-pera';

  if v_city_id is null then
    raise exception 'Armação de Pêra city was not found';
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
