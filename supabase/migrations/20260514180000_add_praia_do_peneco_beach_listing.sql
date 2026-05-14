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
  'Albufeira',
  'albufeira',
  'Central Algarve resort city with an old town, marina, urban beaches and lively visitor services.',
  37.0893,
  -8.2479,
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
  v_slug text := 'praia-do-peneco-albufeira';
  v_name text := 'Praia do Peneco';
  v_address text := 'Praia do Peneco / Praia do Túnel, Albufeira, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-t%C3%BAnel-ou-peneco';
  v_latitude numeric := 37.088991;
  v_longitude numeric := -8.252283;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Peneco",
  "slug": "praia-do-peneco-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Peneco is a central Albufeira beach, also known as Praia do Túnel, set directly below the old town. It is known for its rock tunnel access, golden sand, cliff backdrop and convenient location close to restaurants, viewpoints and historic streets.",
  "full_description": "Praia do Peneco is one of Albufeira’s most central beaches, positioned below the historic centre and forming part of the city’s urban seafront. VisitPortugal identifies it as Praia do Túnel ou Peneco and describes access from a tunnel in the centre of Albufeira, with the beach lying on the broad sandy strip between the city and the sea. Visit Albufeira also presents Peneco as the natural extension of Praia dos Pescadores, with a quieter and more spacious atmosphere due to fewer commercial areas.\n\nThe beach’s defining feature is its connection to the old town. The Rua 5 de Outubro Tunnel links the historic centre directly to the sand and is one of Albufeira’s recognised pedestrian landmarks. Above the beach, the Peneco Stairway and Elevador Viewpoint provide elevated views over the coastline, the town’s whitewashed buildings and the Atlantic.\n\nPraia do Peneco is well suited to visitors who want an easy beach day without leaving central Albufeira. Official tourism sources list facilities including lifeguards, showers, beach bar, restaurants, parking and accessible-beach status, although seasonal services should always be verified locally. The beach can feel lively during peak summer because of its central position, but it remains useful for short visits, sunset walks, photography and combining beach time with the old town.\n\nVisitors should follow local signage, check sea flags before swimming and take care around cliffs, steps and busy access points.",
  "coordinates": {
    "latitude": 37.088991,
    "longitude": -8.252283,
    "label": "Praia do Peneco",
    "notes": "Coordinates were verified from the official ABAAE Peneco beach entry.",
    "bathing_areas": [
      {
        "name": "Peneco",
        "latitude": 37.088991,
        "longitude": -8.252283,
        "type": "Central urban beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Maritime urban sandy beach",
  "landscape": "Wide golden sand below Albufeira’s old town, framed by cliffs and urban viewpoints, with the beach continuing towards Praia dos Pescadores.",
  "access": "Access is pedestrian from Albufeira’s historic centre, including the Rua 5 de Outubro tunnel. Visit Albufeira also identifies the Peneco Stairway and the Peneco Lift / Elevador area as part of the beach access and viewpoint setting. Visitors should confirm current lift and stair access locally before relying on them.",
  "highlights": [
    "Central Albufeira beach directly below the old town",
    "Also known as Praia do Túnel",
    "Pedestrian tunnel linking the historic centre to the sand",
    "Cliff-framed golden-sand setting beside Praia dos Pescadores",
    "Nearby Peneco Stairway and Elevador Viewpoint",
    "Officially listed Blue Flag beach for the 2026 season"
  ],
  "best_for": [
    "Central location",
    "Families",
    "Couples",
    "Photography",
    "Sunset walks",
    "Beach facilities",
    "Old town access",
    "Swimming when sea conditions allow"
  ],
  "facilities": [
    { "name": "Lifeguards / beach surveillance", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Beach bar", "status": "Verified" },
    { "name": "Restaurants nearby", "status": "Verified" },
    { "name": "Parking", "status": "Verified" },
    { "name": "Sunshade / awning rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "Blue Flag", "status": "Seasonal" }
  ],
  "includes": [
    "Seasonal lifeguards and beach surveillance",
    "Showers",
    "Beach bar",
    "Nearby restaurants",
    "Parking",
    "Seasonal sunshade and awning rental",
    "Seasonal light boat rental",
    "Accessible beach designation",
    "Seasonal Blue Flag",
    "Old-town tunnel access"
  ],
  "important_information": {
    "best_time_to_visit": "Late spring and early autumn are good for a central Albufeira beach visit with fewer crowds. Summer offers the fullest seasonal beach-service period, but visitors should expect a livelier atmosphere.",
    "know_before_you_go": "Praia do Peneco is also officially identified as Praia do Túnel ou Peneco.\nThe beach is in central Albufeira and can be busy during peak summer periods.\nThe official Blue Flag page lists the 2026 bathing season from 15/05/2026 to 15/10/2026 and the Blue Flag season from 01/07/2026 to 30/09/2026.\nAt the time checked, the official Blue Flag page listed the flag as not yet hoisted; visitors should confirm local flag status during the season.\nFacilities and lifeguard presence should be treated as seasonal unless confirmed locally.\nSea conditions can vary; visitors should check beach flags and local signage before entering the water.\nUse caution around cliffs, stairways, lift areas and busy pedestrian access points.",
    "notes": [
      "Praia do Peneco is also officially identified as Praia do Túnel ou Peneco.",
      "The beach is in central Albufeira and can be busy during peak summer periods.",
      "The official Blue Flag page lists the 2026 bathing season from 15/05/2026 to 15/10/2026 and the Blue Flag season from 01/07/2026 to 30/09/2026.",
      "At the time checked, the official Blue Flag page listed the flag as not yet hoisted; visitors should confirm local flag status during the season.",
      "Facilities and lifeguard presence should be treated as seasonal unless confirmed locally.",
      "Sea conditions can vary; visitors should check beach flags and local signage before entering the water.",
      "Use caution around cliffs, stairways, lift areas and busy pedestrian access points."
    ]
  },
  "important_notes": "Praia do Peneco is also officially identified as Praia do Túnel ou Peneco.\nThe beach is in central Albufeira and can be busy during peak summer periods.\nThe official Blue Flag page lists the 2026 bathing season from 15/05/2026 to 15/10/2026 and the Blue Flag season from 01/07/2026 to 30/09/2026.\nAt the time checked, the official Blue Flag page listed the flag as not yet hoisted; visitors should confirm local flag status during the season.\nFacilities and lifeguard presence should be treated as seasonal unless confirmed locally.\nSea conditions can vary; visitors should check beach flags and local signage before entering the water.\nUse caution around cliffs, stairways, lift areas and busy pedestrian access points.",
  "best_time_to_visit": "Late spring and early autumn are good for a central Albufeira beach visit with fewer crowds. Summer offers the fullest seasonal beach-service period, but visitors should expect a livelier atmosphere.",
  "suitable_for": [
    "Visitors staying in Albufeira old town",
    "Families wanting a central beach with nearby services",
    "Couples",
    "Photographers",
    "Short beach visits",
    "Sunset walks",
    "Travellers combining beach time with the historic centre"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or quiet beach in high season",
    "Travellers wanting a wild natural setting",
    "Visitors who need guaranteed year-round services",
    "Anyone relying on lift access without checking current operation locally"
  ],
  "nearby_attractions": [
    {
      "name": "Praia dos Pescadores",
      "type": "Beach",
      "description": "The neighbouring central beach in front of Albufeira’s historic centre, forming part of the same urban seafront.",
      "verification_status": "Verified"
    },
    {
      "name": "Rua 5 de Outubro Tunnel",
      "type": "Pedestrian landmark",
      "description": "A historic pedestrian tunnel connecting Albufeira’s old town directly to Praia do Peneco, also known as Tunnel Beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Peneco Stairway",
      "type": "Stairway / viewpoint access",
      "description": "A pedestrian connection between the historic centre and Praia do Peneco, integrated into the cliffside and offering seafront views.",
      "verification_status": "Verified"
    },
    {
      "name": "Elevador Viewpoint",
      "type": "Viewpoint",
      "description": "A central viewpoint beside the Peneco Lift, with views over the seafront, Praia dos Pescadores and Albufeira’s historic centre.",
      "verification_status": "Verified"
    },
    {
      "name": "Municipal Museum of Archaeology",
      "type": "Museum",
      "description": "A museum in Albufeira’s historic centre, beside Praça da República, dedicated to local archaeological heritage from prehistory to the modern era.",
      "verification_status": "Verified"
    },
    {
      "name": "Clock Tower",
      "type": "Historic landmark",
      "description": "One of Albufeira’s most recognisable old-town landmarks, set in a central elevated position above the urban landscape.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Olhos de Água",
    "Guia",
    "Ferreiras"
  ],
  "walking_trails_nearby": [
    {
      "name": "Urban Front Beaches",
      "description": "A Visit Albufeira walking-and-beach experience linking the central urban beaches, including Praia dos Pescadores, Praia do Peneco and Praia do Inatel.",
      "verification_status": "Verified"
    },
    {
      "name": "Albufeira Old Town seafront walk",
      "description": "A practical short walk linking Praia do Peneco, Praia dos Pescadores, the tunnel, old-town streets and nearby viewpoints. Individual landmarks are verified; route conditions should be checked locally.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Use the tunnel from Rua 5 de Outubro for the most distinctive old-town beach approach.",
    "Visit early or later in the day during summer to avoid the busiest central-beach periods.",
    "Check whether the Peneco Lift is operating before relying on it for access.",
    "Combine the beach with Praia dos Pescadores, the old town, the Clock Tower and the Municipal Museum of Archaeology.",
    "Stay alert to sea flags, beach signage and lifeguard instructions.",
    "Use the elevated viewpoints for sunset photographs over Albufeira’s seafront."
  ],
  "photography_notes": "Praia do Peneco is strong for old-town coastal photography, especially from the tunnel approach, Peneco Stairway and Elevador Viewpoint. The most recognisable compositions include the golden sand, cliffs, whitewashed buildings and the central Albufeira shoreline.",
  "family_notes": "Praia do Peneco is convenient for families because of its central location and listed facilities, but summer crowds, stairs, access points and changing sea conditions require normal supervision and local safety checks.",
  "safety_notes": "Sea conditions can vary, and swimming should depend on beach flags, local signage and lifeguard guidance. Visitors should also take care around cliffs, steps, lift areas and busy pedestrian routes.",
  "accessibility_notes": "VisitPortugal lists Praia do Peneco as an accessible beach. However, visitors with reduced mobility should confirm the current lift operation, accessible route, seasonal support and beach conditions before travelling.",
  "seo": {
    "meta_title": "Praia do Peneco, Albufeira | Central Algarve Beach",
    "meta_description": "Visit Praia do Peneco in Albufeira, a central Algarve beach by the old town with tunnel access, golden sand, viewpoints and visitor tips.",
    "keywords": [
      "Praia do Peneco",
      "Praia do Peneco Albufeira",
      "Praia do Túnel",
      "Albufeira beach",
      "central Albufeira beach",
      "Algarve beach",
      "Portugal beaches",
      "Praia dos Pescadores",
      "Albufeira old town beach",
      "Peneco Tunnel"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal – Praia do Túnel ou Peneco",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-t%C3%BAnel-ou-peneco",
      "facts_verified": [
        "Official name Praia do Túnel ou Peneco",
        "Beach located in Albufeira",
        "Maritime beach classification",
        "Access from a tunnel in the centre of Albufeira",
        "Broad sandy strip between city and sea",
        "Western pedestrian promenade and Gruta do Xorino reference",
        "Listed services: Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf and accessible beach"
      ]
    },
    {
      "source_name": "Visit Albufeira – Peneco Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-do-peneco",
      "facts_verified": [
        "Peneco Beach listed by official Albufeira tourism",
        "Natural extension of Praia dos Pescadores",
        "Rock tunnel connecting the old town to the sand",
        "High cliffs framing the beach",
        "Facilities including lifeguards, beach bar and showers",
        "Sunset-walk and central-location visitor context"
      ]
    },
    {
      "source_name": "Bandeira Azul – Peneco",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/peneco/",
      "facts_verified": [
        "Official Blue Flag programme listing for Peneco",
        "Concelho: Albufeira",
        "Coordinates: 37.088991, -8.252283",
        "Beach code: PTCL2Q",
        "Bathing season: 15/05/2026 to 15/10/2026",
        "Blue Flag season: 01/07/2026 to 30/09/2026",
        "Flag status shown as not yet hoisted at time checked"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira – Peneco",
      "source_url": "https://www.cm-albufeira.pt/praias/peneco",
      "facts_verified": [
        "Praia do Peneco official municipal beach listing",
        "Located in the old urban centre of Albufeira",
        "Pedestrian access from the old centre",
        "Elevator access from the Rossio area",
        "Parking listed by the municipality"
      ]
    },
    {
      "source_name": "Visit Algarve – Praia do Peneco",
      "source_url": "https://visitalgarve.pt/en/equipamento/8805/praia-do-peneco",
      "facts_verified": [
        "Beach is in the old centre of Albufeira",
        "Urban beach setting",
        "Rocky feature / peneco landscape context",
        "Relationship to Albufeira Marina side of the coastline"
      ]
    },
    {
      "source_name": "Visit Albufeira – Rua 5 de Outubro Tunnel",
      "source_url": "https://visitalbufeira.pt/visita/tunel-da-rua-5-de-outubro/",
      "facts_verified": [
        "Tunnel links the historic centre to Praia do Peneco",
        "Tunnel is an emblematic pedestrian access point",
        "Tunnel carved into the cliff and inaugurated in 1936",
        "Old-town location"
      ]
    },
    {
      "source_name": "Visit Albufeira – Peneco Stairway",
      "source_url": "https://visitalbufeira.pt/visita/escadaria-do-peneco/",
      "facts_verified": [
        "Peneco Stairway links the historic centre and Praia do Peneco",
        "Cliffside integration",
        "Seafront-view setting",
        "Rebuilt and upgraded in 2022"
      ]
    },
    {
      "source_name": "Visit Albufeira – Elevador Viewpoint",
      "source_url": "https://visitalbufeira.pt/visita/miradouro-do-elevador/",
      "facts_verified": [
        "Viewpoint beside the Peneco Lift",
        "Views over Praia dos Pescadores, the seafront and historic centre",
        "Central viewpoint context"
      ]
    },
    {
      "source_name": "Visit Albufeira – Urban Front Beaches",
      "source_url": "https://visitalbufeira.pt/experiencias/praias-da-frente-urbana/",
      "facts_verified": [
        "Urban Front Beaches include Praia dos Pescadores, Praia do Peneco and Praia do Inatel",
        "Central location near the historic centre",
        "Wide golden sand and urban-beach context"
      ]
    },
    {
      "source_name": "Visit Albufeira – Municipal Museum of Archaeology",
      "source_url": "https://visitalbufeira.pt/visita/museu-municipal-de-arqueologia/",
      "facts_verified": [
        "Museum located in the historic centre beside Praça da República",
        "Archaeological collection from prehistory to the modern era",
        "Nearby cultural attraction"
      ]
    },
    {
      "source_name": "Visit Albufeira – Clock Tower",
      "source_url": "https://visitalbufeira.pt/visita/torre-do-relogio/",
      "facts_verified": [
        "Clock Tower is a recognised landmark in Albufeira historic centre",
        "Central elevated old-town location",
        "Nearby historic attraction"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, alternative name Praia do Túnel, Albufeira location, central old-town access, tunnel access, neighbouring Praia dos Pescadores and key facilities were verified from official tourism sources.",
    "Blue Flag status, coordinates and 2026 bathing / Blue Flag season dates were verified from the official Blue Flag programme. The page showed the flag as not yet hoisted at the time checked, so the listing treats Blue Flag as seasonal.",
    "Accessible-beach status is listed by VisitPortugal, but current lift operation, accessible route and seasonal assistance should be manually checked before publication.",
    "Facilities such as lifeguards, sunshade rental and boat rental should be treated as seasonal / verify before visiting.",
    "The beach is described as central and potentially lively due to its location, not based on review-platform rankings or scores.",
    "No third-party review, booking, map or social media platform names were used in the public listing text."
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
  where slug = 'albufeira';

  if v_city_id is null then
    raise exception 'Albufeira city was not found';
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
