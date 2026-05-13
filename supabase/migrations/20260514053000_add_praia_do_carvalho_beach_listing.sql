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
  'Carvoeiro',
  'carvoeiro',
  'Charming coastal village known for cliffs, whitewashed houses, fishing heritage and rock formations.',
  37.096196,
  -8.472004,
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
  v_slug text := 'praia-do-carvalho-lagoa';
  v_name text := 'Praia do Carvalho';
  v_address text := 'Praia do Carvalho, Carvoeiro / Benagil, Lagoa, Algarve, Portugal';
  v_website_url text := 'https://visitalgarve.pt/equipamento/8791/praia-do-carvalho';
  v_latitude numeric := null;
  v_longitude numeric := null;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Carvalho",
  "slug": "praia-do-carvalho-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carvoeiro / Benagil, Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Carvalho is a famous small cove in Lagoa, set between Benagil and the Marinha coastline. Known for its tunnel access, golden cliffs and offshore rock, it is one of the most distinctive natural beaches on this part of the Algarve coast.",
  "full_description": "Praia do Carvalho is a compact natural beach in the municipality of Lagoa, positioned within the celebrated limestone coastline between Carvoeiro, Benagil and Praia da Marinha. It is not a resort beach; its appeal comes from the way the cove is hidden into an angular cut of the coast, framed by high ochre cliffs and watched over by a rocky islet offshore.\n\nThe arrival is part of the experience. Official Lagoa tourism material describes access to the sand through a tunnel carved into the rock, and notes that access is difficult despite the beach’s popularity with locals and visitors. This makes Carvalho especially memorable, but also less suitable for anyone needing easy, step-free or fully supported access.\n\nThe beach is small and can feel crowded quickly in summer, especially because it is close to Benagil, Marinha and the Seven Hanging Valleys coastline. Visitors often combine it with a wider Lagoa coastal itinerary, but the cove itself requires care: the cliffs are described by municipal material as unstable in character, with advice to keep a safe distance from the rock faces.\n\nPraia do Carvalho is best for scenic visits, photography, couples, confident beachgoers and coastal walkers who are comfortable with uneven access. Facilities are limited or not fully verified from current authoritative sources, so visitors should bring essentials, check local signage and avoid relying on services being available.",
  "coordinates": {
    "latitude": null,
    "longitude": null,
    "label": "Praia do Carvalho",
    "notes": "Coordinates were left blank because current authoritative coordinates were not verified during research."
  },
  "beach_type": "Small natural sandy cove",
  "landscape": "A small golden-sand cove enclosed by high ochre limestone cliffs, with eroded rock faces, coastal vegetation and a rocky islet interrupting the sea horizon.",
  "access": "Access is through a tunnel carved into the rock, with difficult access noted by official Lagoa tourism material. A 2025 Lagoa municipal pedestrian project also identifies the Praia do Carvalho car park as the endpoint of a new route from Rocha Brava. Visitors should expect uneven or challenging access and confirm current conditions before visiting.",
  "highlights": [
    "Small natural cove between Benagil and the Marinha coastline",
    "Access through a tunnel carved into the rock",
    "Golden sandy beach framed by high eroded limestone cliffs",
    "Rocky islet visible offshore",
    "Popular with locals and visitors despite difficult access",
    "Close to the Seven Hanging Valleys coastal landscape"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Nature lovers",
    "Coastal walks",
    "Small-cove beach visits",
    "Visitors exploring Benagil and Marinha",
    "Confident beachgoers comfortable with difficult access"
  ],
  "facilities": [
    { "name": "Car park near Praia do Carvalho", "status": "Verified" },
    { "name": "Beach cleaning / municipal maintenance area", "status": "Verified" },
    { "name": "Mobile vending or non-sedentary food/drink licensing for 2025", "status": "Seasonal / verify before visiting" },
    { "name": "Lifeguard or beach surveillance", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Restaurant or fixed beach bar", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" }
  ],
  "includes": [
    "Car park near Praia do Carvalho",
    "Municipal beach-cleaning context",
    "Possible seasonal mobile vending context",
    "Tunnel access",
    "Small natural cove",
    "Nearby Seven Hanging Valleys coastal landscape"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and September are usually best for photography and a calmer visit. In July and August, arrive early or late in the day, as the cove is small and access can become busy.",
    "know_before_you_go": "Praia do Carvalho is not listed among Lagoa’s 2026 Blue Flag beaches in the ABAAE 2026 regional list checked during research.\nAccess is through a tunnel carved into the rock and is described as difficult by official Lagoa tourism material.\nThe beach is small and can become crowded quickly during peak summer.\nThe cliffs are unstable in character; visitors should keep a safe distance from cliff bases and edges.\nFacilities were not fully verified from current authoritative sources, so visitors should bring essentials.\nSeasonal mobile vending or food/drink licensing was verified for 2025, but current availability should be checked before visiting.\nSea conditions can vary; visitors should follow local signage, flags and official safety guidance where present.\nDo not use informal cliff-edge shortcuts or climb rock formations for photographs.",
    "notes": [
      "Praia do Carvalho is not listed among Lagoa’s 2026 Blue Flag beaches in the ABAAE 2026 regional list checked during research.",
      "Access is through a tunnel carved into the rock and is described as difficult by official Lagoa tourism material.",
      "The beach is small and can become crowded quickly during peak summer.",
      "The cliffs are unstable in character; visitors should keep a safe distance from cliff bases and edges.",
      "Facilities were not fully verified from current authoritative sources, so visitors should bring essentials.",
      "Seasonal mobile vending or food/drink licensing was verified for 2025, but current availability should be checked before visiting.",
      "Sea conditions can vary; visitors should follow local signage, flags and official safety guidance where present.",
      "Do not use informal cliff-edge shortcuts or climb rock formations for photographs."
    ]
  },
  "important_notes": "Praia do Carvalho is not listed among Lagoa’s 2026 Blue Flag beaches in the ABAAE 2026 regional list checked during research.\nAccess is through a tunnel carved into the rock and is described as difficult by official Lagoa tourism material.\nThe beach is small and can become crowded quickly during peak summer.\nThe cliffs are unstable in character; visitors should keep a safe distance from cliff bases and edges.\nFacilities were not fully verified from current authoritative sources, so visitors should bring essentials.\nSeasonal mobile vending or food/drink licensing was verified for 2025, but current availability should be checked before visiting.\nSea conditions can vary; visitors should follow local signage, flags and official safety guidance where present.\nDo not use informal cliff-edge shortcuts or climb rock formations for photographs.",
  "best_time_to_visit": "Spring, early summer and September are usually best for photography and a calmer visit. In July and August, arrive early or late in the day, as the cove is small and access can become busy.",
  "suitable_for": [
    "Photographers",
    "Couples",
    "Nature-focused travellers",
    "Visitors exploring the Lagoa cliff coast",
    "Beachgoers comfortable with tunnel access",
    "Coastal walkers",
    "Visitors staying in Carvoeiro, Benagil or Lagoa"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free access",
    "Visitors with reduced mobility unless current access is checked in advance",
    "Families carrying heavy beach equipment",
    "Visitors seeking extensive facilities",
    "Visitors looking for a large open beach",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach and fishing village",
      "description": "A small fishing-village beach east of Carvalho, known for boat activity and the surrounding cave coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "description": "An iconic cliff beach east of Benagil, widely recognised for limestone formations, sea stacks and coastal scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Seven Hanging Valleys Trail",
      "type": "Walking trail",
      "description": "An official 5.7 km nature trail linking Praia de Vale Centeanes and Praia da Marinha along the Lagoa cliff coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach and trail endpoint",
      "description": "A cliff-backed beach near Carvoeiro and the western endpoint of the Seven Hanging Valleys Trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro",
      "type": "Nearby coastal village",
      "description": "A well-known Lagoa village with restaurants, services, coastal walks and access to Algar Seco and nearby beaches.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Carvoeiro",
    "Benagil",
    "Lagoa",
    "Porches",
    "Ferragudo"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "Câmara Municipal de Lagoa verifies this as a 5.7 km pedestrian nature route between Praia de Vale Centeanes and Praia da Marinha. The wider route passes through the same cliff-coast landscape close to Carvalho, Benagil and Marinha.",
      "verification_status": "Verified"
    },
    {
      "name": "Rocha Brava to Praia do Carvalho pedestrian link",
      "description": "Lagoa municipality announced a new 1.4 km pedestrian route from Rocha Brava to the Praia do Carvalho car park, designed to improve soft mobility and coastal access.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Travel light, as access is through a rock tunnel and may be awkward with heavy equipment.",
    "Arrive early in high season because the cove is small and popular.",
    "Bring water, sun protection and essentials, as current facilities are not fully verified.",
    "Keep well away from cliff bases and cliff edges.",
    "Use official paths only and avoid informal cliff-top routes.",
    "Combine Carvalho with Benagil, Marinha or the Seven Hanging Valleys coast for a wider Lagoa itinerary.",
    "Check sea conditions before swimming or entering rocky areas."
  ],
  "photography_notes": "Praia do Carvalho is highly photogenic from the tunnel entrance, the sand and safe cliff-top viewpoints. The rock-framed approach, golden cliffs and offshore islet are the defining compositions. Do not climb unstable rocks or approach cliff edges for photographs.",
  "family_notes": "Families can visit if comfortable with the tunnel access and small cove setting, but this is not the most practical Lagoa beach for heavy equipment, pushchairs or visitors needing facilities. Children should be closely supervised near the tunnel, rocks, waterline and cliff-backed areas.",
  "safety_notes": "The municipal tourism brochure advises keeping a safe distance from the towering cliffs due to the unstable character of the rock mass. Sea conditions can vary, and visitors should follow local signage, flags and any official safety guidance available on the day.",
  "accessibility_notes": "Accessible beach support was not verified. Access is through a rock tunnel and described as difficult by official Lagoa tourism material, so visitors with reduced mobility should confirm current conditions before visiting.",
  "seo": {
    "meta_title": "Praia do Carvalho, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia do Carvalho in Lagoa is a famous cove near Benagil and Marinha, known for tunnel access, golden cliffs and dramatic scenery.",
    "keywords": [
      "Praia do Carvalho",
      "Praia do Carvalho Lagoa",
      "Carvalho Beach",
      "Lagoa beaches",
      "Carvoeiro beaches",
      "Benagil nearby beach",
      "Praia da Marinha nearby",
      "Algarve beaches",
      "Portugal beaches",
      "tunnel beach Algarve",
      "cliff cove Algarve",
      "Seven Hanging Valleys Trail"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Carvalho trip ideas",
      "links": [
        { "label": "Praia do Carvalho" },
        { "label": "Carvalho Beach" },
        { "label": "tunnel beach Algarve" },
        { "label": "Seven Hanging Valleys Trail" },
        { "label": "Benagil nearby beach" },
        { "label": "Praia da Marinha nearby" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Carvoeiro" },
        { "label": "Benagil" },
        { "label": "Lagoa" },
        { "label": "Porches" },
        { "label": "Ferragudo" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "Visit Algarve - Praia do Carvalho",
      "source_url": "https://visitalgarve.pt/equipamento/8791/praia-do-carvalho",
      "facts_verified": [
        "Beach name",
        "Lagoa coastal location",
        "Small sandy cove",
        "Ochre rock walls shaped by erosion",
        "Cliff landscape",
        "Access through a tunnel carved into the rock, based on the official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa / Welcome to Lagoa brochure - Our Beaches",
      "source_url": "https://portal.oa.pt/media/124556/folheto-turistico-da-regiao-de-lagoa_algarve-i.pdf",
      "facts_verified": [
        "Praia do Carvalho as a natural beach",
        "Small golden sandy beach",
        "Cliffs sculpted by erosion",
        "Rocky islet offshore",
        "Tunnel carved into the rock",
        "Difficult access",
        "Popularity with locals and visitors",
        "Need to keep a safe distance from cliffs",
        "Approximate historic GPS reference from the brochure, not used as current coordinates"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Limpeza das Praias",
      "source_url": "https://www.cm-lagoa.pt/viver/ambiente-e-urbanismo/ambiente/servicos-publicos-essenciais/limpeza-das-praias",
      "facts_verified": [
        "Praia do Carvalho included among Lagoa municipal beach-cleaning areas",
        "Lagoa coastline described as cliffs and small sandy beaches",
        "Municipal maintenance context",
        "Seven Hanging Valleys route maintained in the wider coastal area"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Pedestrian route between Rocha Brava and Praia do Carvalho",
      "source_url": "https://www.cm-lagoa.pt/comunicacao/noticias/noticia-13/municipio-de-lagoa-investe-na-mobilidade-pedonal-com-novo-percurso-entre-a-rocha-brava-e-a-praia-do-carvalho",
      "facts_verified": [
        "New 1.4 km pedestrian route from Rocha Brava to Praia do Carvalho",
        "Route ending at the Praia do Carvalho car park",
        "Pedestrian-access improvement context",
        "Project completion planned for November 2025"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Mobile vending and non-sedentary food/drink licensing for Praia do Carvalho 2025",
      "source_url": "https://www.cm-lagoa.pt/comunicacao/noticias/noticia-13/edital-n-165-2024-licenciamento-para-o-exercicio-de-atividades-de-venda-ambulante-e-restauracao-e-bebidas-nao-sedentaria-praia-do-carvalho-2025",
      "facts_verified": [
        "2025 licensing procedure for mobile vending and non-sedentary food and drink activity at Praia do Carvalho",
        "Seasonal or temporary service context only"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official Seven Hanging Valleys Trail",
        "5.7 km distance",
        "Route linking Praia de Vale Centeanes to Praia da Marinha",
        "Cliff, ravine and hanging-valley landscape context"
      ]
    },
    {
      "source_name": "Visit Algarve - Seven Hanging Valleys Trail",
      "source_url": "https://visitalgarve.pt/en/3593/percurso-dos-sete-vales-suspensos.aspx",
      "facts_verified": [
        "Praia do Carvalho referenced on the Seven Hanging Valleys route context",
        "Tunnel access to the beach from the trail context, based on official search-result summary"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Benagil",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-benagil",
      "facts_verified": [
        "Nearby Benagil beach",
        "Lagoa location",
        "Fishing-village beach character",
        "Caves and sea-algar coastline context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha",
      "facts_verified": [
        "Nearby Marinha beach",
        "Caramujeira, Lagoa location",
        "High eroded cliff landscape",
        "Long stair access and cliff-top viewpoint context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Lagoa 2026 Blue Flag locations checked",
        "Listed Lagoa 2026 locations: Caneiros, Carvoeiro, Ferragudo, Senhora da Rocha, Vale Centeanes and Vale do Olival",
        "Praia do Carvalho not found among Lagoa’s 2026 Blue Flag locations during verification"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, natural-beach character, tunnel access, cliff landscape, offshore islet and popularity with locals and visitors were verified from official or municipal tourism material.",
    "Praia do Carvalho is close to Benagil and Praia da Marinha, verified through official VisitPortugal pages for those nearby beaches and through Lagoa’s Seven Hanging Valleys route context.",
    "Current Blue Flag status was not verified. ABAAE’s 2026 list for Lagoa does not include Praia do Carvalho among the municipality’s listed 2026 Blue Flag beaches.",
    "Current facilities such as toilets, showers, fixed restaurants, sunshade rental, lifeguards and accessible-beach support could not be verified from authoritative current sources, so they are marked Not verified.",
    "A 2025 municipal licensing notice verifies possible temporary mobile vending / food and drink activity, but this should not be treated as a permanent facility.",
    "Coordinates were left blank because the only coordinate found was in an older municipal tourism brochure; current authoritative coordinates were not verified during this research.",
    "Access is described as difficult and through a rock tunnel, so accessibility is not claimed.",
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
  where slug = 'carvoeiro';

  if v_city_id is null then
    raise exception 'Carvoeiro city was not found';
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
