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
  'Alvor',
  'alvor',
  'Coastal village in Portimao beside the Ria de Alvor, resort beaches and boardwalk routes.',
  37.12278,
  -8.59605,
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
  v_slug text := 'praia-de-alvor-portimao';
  v_name text := 'Praia de Alvor';
  v_short_description text := $short$
Praia de Alvor is a large resort beach in Portimao, set beside the Ria de Alvor and close to the village of Alvor. With a wide sandy shore, strong support infrastructure and nearby walkways, it is well suited to families and summer beach days.
$short$;
  v_description text := $description$
Praia de Alvor is one of the main beach destinations in the Portimao area, located beside the village of Alvor and the ecologically important Ria de Alvor. Official tourism sources describe its sand as stretching over the horizon and note its hotel surroundings, beach-support infrastructure and suitability for sailing, water skiing and windsurfing.

The beach has a broad, open character, making it a practical choice for visitors who want space, services and easy resort access rather than a small cove. It sits close to Alvor's hotels and holiday areas while also connecting with the estuary landscape, where lagoons, marshes, dunes and tidal channels support resident and migratory birdlife.

Praia de Alvor is especially useful for families because of its vast sand, listed facilities and nearby nature routes. Portimao municipal information describes the beach as a place of regional importance and notes that its position facing the ria makes it interesting for children to observe local species. The dune system has conservation work and a network of walkways and paths that help organise beach access while protecting sensitive habitats.

This is a popular summer beach, so the most convenient access points and serviced sections can become busy in July and August. Visitors should follow local flags, respect dune-protection areas, and treat water-sports and beach-support services as seasonal unless confirmed before travelling.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Alvor",
  "slug": "praia-de-alvor-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Alvor",
  "concelho": "Portimao",
  "municipality": "Portimao",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Alvor is a large resort beach in Portimao, set beside the Ria de Alvor and close to the village of Alvor. With a wide sandy shore, strong support infrastructure and nearby walkways, it is well suited to families and summer beach days.",
  "full_description": "Praia de Alvor is one of the main beach destinations in the Portimao area, located beside the village of Alvor and the ecologically important Ria de Alvor. Official tourism sources describe its sand as stretching over the horizon and note its hotel surroundings, beach-support infrastructure and suitability for sailing, water skiing and windsurfing.\n\nThe beach has a broad, open character, making it a practical choice for visitors who want space, services and easy resort access rather than a small cove. It sits close to Alvor's hotels and holiday areas while also connecting with the estuary landscape, where lagoons, marshes, dunes and tidal channels support resident and migratory birdlife.\n\nPraia de Alvor is especially useful for families because of its vast sand, listed facilities and nearby nature routes. Portimao municipal information describes the beach as a place of regional importance and notes that its position facing the ria makes it interesting for children to observe local species. The dune system has conservation work and a network of walkways and paths that help organise beach access while protecting sensitive habitats.\n\nThis is a popular summer beach, so the most convenient access points and serviced sections can become busy in July and August. Visitors should follow local flags, respect dune-protection areas, and treat water-sports and beach-support services as seasonal unless confirmed before travelling.",
  "coordinates": {
    "primary": {
      "label": "Alvor Poente",
      "latitude": 37.12278,
      "longitude": -8.59605
    },
    "latitude": 37.12278,
    "longitude": -8.59605,
    "points": [
      {
        "label": "Alvor Poente",
        "latitude": 37.12278,
        "longitude": -8.59605
      },
      {
        "label": "Alvor Nascente",
        "latitude": 37.119964,
        "longitude": -8.58085
      }
    ],
    "notes": "Coordinates are provided as two official ABAAE points, Alvor Poente and Alvor Nascente, rather than inventing one central coordinate for the wider beach area."
  },
  "beach_type": "Large sandy maritime resort beach",
  "landscape": "A wide sandy beach beside the Ria de Alvor, backed by dunes, resort areas, walkways and estuary habitats.",
  "access": "Official sources describe strong beach infrastructure, outdoor parking and accessible-beach support. Visit Portimao also describes walkways and footpaths through the dune system that help provide access to the beaches and jetty. Visitors should confirm the most suitable current access point before travelling.",
  "highlights": [
    "Large sandy resort beach in Alvor, Portimao",
    "Strong beach-support infrastructure verified by official tourism sources",
    "Close to hotels, restaurants and the village of Alvor",
    "Direct connection with the Ria de Alvor dune, marsh and lagoon landscape",
    "Good for families, long beach days and shoreline walks",
    "Official 2026 Blue Flag listings verified for Alvor Poente and Alvor Nascente"
  ],
  "best_for": [
    "Families",
    "Resort beach days",
    "Long beach walks",
    "Nature lovers",
    "Birdwatching",
    "Accessible beach access",
    "Water sports",
    "Summer visitors",
    "Alvor village stays"
  ],
  "facilities": [
    { "name": "Beach support", "status": "Verified / Seasonal" },
    { "name": "Blue Flag 2026 listing for Alvor Poente and Alvor Nascente", "status": "Seasonal" },
    { "name": "Safety or surveillance", "status": "Seasonal" },
    { "name": "Lifeguard", "status": "Seasonal" },
    { "name": "First-aid station", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "WC", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Sunshade area / sunshade rental", "status": "Seasonal" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Nautical centre / small craft hire", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Beach support",
    "Blue Flag 2026 listing for Alvor Poente and Alvor Nascente",
    "Seasonal surveillance and lifeguard support",
    "Accessible beach designation",
    "WC and showers",
    "Outdoor parking",
    "Seasonal bars and restaurants",
    "Seasonal nautical centre / small craft hire"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full resort-beach atmosphere. Spring, early summer and early autumn are especially good for family walks, birdwatching and quieter beach time.",
    "know_before_you_go": "Praia de Alvor is a popular resort beach and can become busy during the main summer season.\nABAAE's 2026 regional list includes Alvor Poente and Alvor Nascente among Portimao's Blue Flag locations.\nABAAE lists the 2026 bathing season for Alvor Poente and Alvor Nascente as 1 June 2026 to 30 September 2026.\nThe individual ABAAE Alvor Poente page lists a 2026 Blue Flag season from 1 June to 30 September 2026.\nThe individual ABAAE Alvor Nascente page checked showed unclear or conflicting Blue Flag-season dates and should be manually confirmed before publication updates.\nFacilities and surveillance may vary by beach section and season.\nThe Ria de Alvor and dune areas are environmentally sensitive; visitors should stay on marked paths and walkways.\nSea, wind and tide conditions can vary; visitors should follow flags, local signage and official safety guidance.",
    "notes": [
      "Praia de Alvor is a popular resort beach and can become busy during the main summer season.",
      "ABAAE's 2026 regional list includes Alvor Poente and Alvor Nascente among Portimao's Blue Flag locations.",
      "ABAAE lists the 2026 bathing season for Alvor Poente and Alvor Nascente as 1 June 2026 to 30 September 2026.",
      "The individual ABAAE Alvor Poente page lists a 2026 Blue Flag season from 1 June to 30 September 2026.",
      "The individual ABAAE Alvor Nascente page checked showed unclear or conflicting Blue Flag-season dates and should be manually confirmed before publication updates.",
      "Facilities and surveillance may vary by beach section and season.",
      "The Ria de Alvor and dune areas are environmentally sensitive; visitors should stay on marked paths and walkways.",
      "Sea, wind and tide conditions can vary; visitors should follow flags, local signage and official safety guidance."
    ]
  },
  "important_notes": "Praia de Alvor is a popular resort beach and can become busy during the main summer season.\nABAAE's 2026 regional list includes Alvor Poente and Alvor Nascente among Portimao's Blue Flag locations.\nABAAE lists the 2026 bathing season for Alvor Poente and Alvor Nascente as 1 June 2026 to 30 September 2026.\nThe individual ABAAE Alvor Poente page lists a 2026 Blue Flag season from 1 June to 30 September 2026.\nThe individual ABAAE Alvor Nascente page checked showed unclear or conflicting Blue Flag-season dates and should be manually confirmed before publication updates.\nFacilities and surveillance may vary by beach section and season.\nThe Ria de Alvor and dune areas are environmentally sensitive; visitors should stay on marked paths and walkways.\nSea, wind and tide conditions can vary; visitors should follow flags, local signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full resort-beach atmosphere. Spring, early summer and early autumn are especially good for family walks, birdwatching and quieter beach time.",
  "suitable_for": [
    "Families wanting a large serviced beach",
    "Visitors staying in Alvor resorts or hotels",
    "Beach walkers",
    "Visitors interested in the Ria de Alvor landscape",
    "Birdwatchers",
    "Water-sports users when conditions are suitable",
    "Visitors needing officially recognised accessible-beach support"
  ],
  "not_suitable_for": [
    "Visitors seeking a secluded or undeveloped beach",
    "Visitors looking for dramatic cliff scenery directly on the main beach",
    "Those wishing to avoid busy summer resort areas",
    "Visitors expecting guaranteed calm sea or wind conditions"
  ],
  "nearby_attractions": [
    {
      "name": "Ria de Alvor",
      "type": "Estuary and lagoon landscape",
      "description": "An ecologically important estuary with lagoons, marshes, dunes and tidal channels used by resident and migratory birds.",
      "verification_status": "Verified"
    },
    {
      "name": "Passadicos de Alvor / Ao Sabor da Mare",
      "type": "Walking route",
      "description": "A roughly 6 km route of boardwalks and dirt paths across dunes and the Ria de Alvor landscape, officially listed by the parish of Alvor.",
      "verification_status": "Verified"
    },
    {
      "name": "Alvor Historic Centre",
      "type": "Village centre",
      "description": "The historic centre of Alvor is noted by VisitPortugal for its village character and Manueline-style Matrix Church entrance.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Tres Irmaos",
      "type": "Nearby beach",
      "description": "A neighbouring beach east of Alvor, associated with the same long sandy coastal stretch and dune system.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Torralta",
      "type": "Nearby beach area",
      "description": "A nearby Alvor beach section close to hotels and restaurants, described by Portimao municipality as having an extensive sandy area.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Alvor",
    "Portimao",
    "Praia da Rocha",
    "Lagos",
    "Mexilhoeira Grande"
  ],
  "walking_trails_nearby": [
    {
      "name": "Passadicos de Alvor / Ao Sabor da Mare",
      "description": "An official parish-listed route of about 6 km using boardwalks and dirt paths through dune systems between Praia do Alvor and Meia Praia, with views over the Ria de Alvor marshes and lagoon.",
      "verification_status": "Verified"
    },
    {
      "name": "Passeio Tres Irmaos - Alvor",
      "description": "A Visit Portimao nature walk between Praia dos Tres Irmaos and Alvor, highlighting the dune systems, sea views and fragile habitats along this coastal stretch.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose your beach section in advance, as the Alvor shoreline is long and access points vary.",
    "Arrive early in July and August if you want easier access to the most convenient serviced areas.",
    "Use the walkways and marked routes to protect the dune system.",
    "Bring binoculars if you plan to explore the Ria de Alvor birdlife.",
    "Check wind and sea conditions before planning sailing, windsurfing or small-craft activity.",
    "For a gentler family outing, combine beach time with a short section of the Alvor boardwalk."
  ],
  "photography_notes": "Praia de Alvor is best photographed for its scale, open sand, dune landscape and views across the Ria de Alvor. Early morning and late afternoon are especially useful for softer light and quieter boardwalk scenes.",
  "family_notes": "Praia de Alvor is a strong family option because of its large sandy area, listed facilities and nearby nature walks. Families should still check flags, seasonal supervision and tide or wind conditions before swimming or water-sports activity.",
  "safety_notes": "Sea, wind and tide conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Stay on marked walkways in the dune and estuary areas to protect habitats and avoid unsafe ground.",
  "accessibility_notes": "VisitPortugal and Visit Portimao list Praia de Alvor as an accessible beach, and the nearby Ao Sabor da Mare boardwalk route is described by the parish of Alvor as accessible for wheelchairs and pushchairs. Visitors with reduced mobility should still confirm the most suitable current access point and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia de Alvor, Portimao | Algarve Beach Guide",
    "meta_description": "Praia de Alvor in Portimao is a large family-friendly Algarve resort beach with wide sand, facilities, dunes and Ria de Alvor walks.",
    "keywords": [
      "Praia de Alvor",
      "Alvor Beach",
      "Praia de Alvor Portimao",
      "Portimao beaches",
      "Algarve beaches",
      "Portugal beaches",
      "family beach Alvor",
      "resort beach Algarve",
      "Ria de Alvor",
      "Passadicos de Alvor",
      "accessible beach Alvor",
      "Alvor Poente",
      "Alvor Nascente"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Alvor trip ideas",
      "links": [
        { "label": "Praia de Alvor" },
        { "label": "Alvor Beach" },
        { "label": "family beach Alvor" },
        { "label": "Ria de Alvor" },
        { "label": "Passadicos de Alvor" },
        { "label": "accessible beach Alvor" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Ria de Alvor" },
        { "label": "Passadicos de Alvor" },
        { "label": "Alvor Historic Centre" },
        { "label": "Praia dos Tres Irmaos" },
        { "label": "Praia da Torralta" },
        { "label": "Portimao" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Alvor",
      "source_url": "https://www.visitportugal.com/en/node/141476",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Alvor, Portimao",
        "Extensive sandy beach",
        "Hotel and resort surroundings",
        "Support infrastructure",
        "Sailing, water skiing and windsurfing context",
        "Ria de Alvor ecological importance",
        "Migratory bird stopover role",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, parking, bar, restaurant and accessible beach"
      ]
    },
    {
      "source_name": "Visit Portimao - Praia de Alvor",
      "source_url": "https://visitportimao.com/en/beaches/praia-de-alvor/",
      "facts_verified": [
        "Praia de Alvor as a hallmark beach of the Portimao region",
        "Blue Flag and Gold Quality reference",
        "Vast sandy beach east of the Alvor Estuary",
        "Sand bars, lagoon, marshes and calm-water channels",
        "Habitat for resident and visiting water birds, fish and molluscs",
        "Dune conservation work",
        "Walkways and footpaths providing beach and jetty access",
        "Accessible nature trail with stopping places and viewpoints",
        "Facilities including beach support, nautical centre, showers, lifeguard, first aid, accessible beach, WC and sunshade area"
      ]
    },
    {
      "source_name": "Camara Municipal de Portimao - Praias do Concelho",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho",
      "facts_verified": [
        "Praia de Alvor as one of the regional highlights",
        "Blue Flag and Gold Quality references",
        "Vast sandy beach",
        "Beach facing the Ria de Alvor",
        "Family suitability context for observing local species"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Alvor Poente listed among Portimao's 2026 Blue Flag beach locations",
        "Alvor Nascente listed among Portimao's 2026 Blue Flag beach locations"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Alvor Poente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/alvor-poente/",
      "facts_verified": [
        "Alvor Poente official beach entry",
        "Municipality of Portimao",
        "Coastal beach classification",
        "Coordinates",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Alvor Nascente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/alvor-nascente/",
      "facts_verified": [
        "Alvor Nascente official beach entry",
        "Municipality of Portimao",
        "Coastal beach classification",
        "Coordinates",
        "2026 bathing season",
        "Individual page season data checked and flagged for manual review"
      ]
    },
    {
      "source_name": "Camara Municipal de Portimao - Qualidade da Agua Balnear das Praias de Portimao",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho/qualidade-da-agua-balnear-das-praias-de-portimao",
      "facts_verified": [
        "Alvor Poente bathing-water classification listed as Excelente in the checked municipal table",
        "Alvor Nascente / Torralta bathing-water classification listed as Excelente in the checked municipal table",
        "Municipal bathing-water context for Portimao beaches"
      ]
    },
    {
      "source_name": "Freguesia de Alvor - Passadicos de Alvor e percurso Ao Sabor da Mare",
      "source_url": "https://www.freguesiadealvor.pt/publicacoes/percursos/329",
      "facts_verified": [
        "Ao Sabor da Mare / Passadicos de Alvor route",
        "Approximate 6 km distance",
        "Route using boardwalks and dirt paths",
        "Route crossing dune systems between Praia do Alvor and Meia Praia",
        "Wheelchair and pushchair accessibility reference for the route",
        "Environmental protection guidance for dunes and marshes",
        "Birdwatching and seasonal migration context"
      ]
    },
    {
      "source_name": "Visit Portimao - Passeio Tres Irmaos - Alvor",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/passeio-tres-irmaos-alvor/",
      "facts_verified": [
        "Nature walk between Praia dos Tres Irmaos and Alvor",
        "Dune systems delimiting the beaches",
        "Wildlife observation context",
        "Guidance to use walkways and avoid walking on dunes"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, large sandy character, resort surroundings, facilities and Ria de Alvor context were verified from official tourism and municipal sources.",
    "The phrase family-friendly is supported cautiously by the beach's large sandy area, official facilities, accessible-beach references and Portimao municipal wording about taking younger children to observe local species.",
    "ABAAE's 2026 list verifies Alvor Poente and Alvor Nascente as Blue Flag locations in Portimao. The individual Alvor Nascente page showed unclear Blue Flag-season dates, so exact current season details should be manually checked before publication updates.",
    "Coordinates are provided as two official ABAAE points, Alvor Poente and Alvor Nascente, rather than inventing one central coordinate for the wider beach area.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified from official tourism sources for the beach and from the parish source for the boardwalk route, but visitors should confirm current access and seasonal support before travelling.",
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
  where slug = 'alvor'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city alvor was not found';
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
      'https://www.visitportugal.com/en/node/141476',
      'Praia de Alvor, Alvor, Portimao, Algarve, Portugal',
      37.12278,
      -8.59605,
      array[
        'Praia de Alvor',
        'Alvor Beach',
        'Praia de Alvor Portimao',
        'Portimao beaches',
        'Algarve beaches',
        'Portugal beaches',
        'family beach Alvor',
        'resort beach Algarve',
        'Ria de Alvor',
        'Passadicos de Alvor',
        'accessible beach Alvor',
        'Alvor Poente',
        'Alvor Nascente'
      ],
      v_category_data,
      'Praia de Alvor, Portimao | Algarve Beach Guide',
      'Praia de Alvor in Portimao is a large family-friendly Algarve resort beach with wide sand, facilities, dunes and Ria de Alvor walks.',
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
      website_url = 'https://www.visitportugal.com/en/node/141476',
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
      address = 'Praia de Alvor, Alvor, Portimao, Algarve, Portugal',
      latitude = 37.12278,
      longitude = -8.59605,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Alvor',
        'Alvor Beach',
        'Praia de Alvor Portimao',
        'Portimao beaches',
        'Algarve beaches',
        'Portugal beaches',
        'family beach Alvor',
        'resort beach Algarve',
        'Ria de Alvor',
        'Passadicos de Alvor',
        'accessible beach Alvor',
        'Alvor Poente',
        'Alvor Nascente'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Alvor, Portimao | Algarve Beach Guide',
      meta_description = 'Praia de Alvor in Portimao is a large family-friendly Algarve resort beach with wide sand, facilities, dunes and Ria de Alvor walks.',
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
