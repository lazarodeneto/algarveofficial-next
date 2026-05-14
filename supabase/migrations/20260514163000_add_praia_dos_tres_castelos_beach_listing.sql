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
  'Portimão',
  'portimao',
  'Western Algarve city known for Praia da Rocha, the Arade riverfront, beaches, restaurants and coastal access.',
  37.1394,
  -8.5369,
  true,
  true
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
  v_slug text := 'praia-dos-tres-castelos-portimao';
  v_name text := 'Praia dos Três Castelos';
  v_address text := 'Praia dos Três Castelos, Portimão, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-dos-tr%C3%AAs-castelos';
  v_latitude numeric := 37.117637;
  v_longitude numeric := -8.546286;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Três Castelos",
  "slug": "praia-dos-tres-castelos-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Portimão",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Três Castelos is a cliff-framed beach in Portimão, set beside Praia da Rocha and known for its golden sand, sculpted rock formations and viewpoint above the shore. Its central location means it can feel lively in peak season, especially around the main access points.",
  "full_description": "Praia dos Três Castelos is one of Portimão’s most visually distinctive urban beaches, positioned immediately beside Praia da Rocha on the Algarve’s southern coast. VisitPortugal describes it as a maritime beach with golden sand and calm blue sea, connected to Praia da Rocha by a passage cut through the rocks on its eastern side. To the west, it neighbours Praia dos Careanos, with the wider shoreline framed by high cliffs that can be appreciated from above on coastal walks.\n\nThe beach is especially valued for its carved cliff scenery. Visit Portimão notes access from the Miradouro dos Três Castelos, where visitors can look over rock formations, arches, caves and rocky platforms before descending to the sand by steps. The same official source also highlights coastal vegetation on softer cliff slopes and birdlife around the rock platforms, giving the beach a stronger natural character than its busy resort setting might suggest.\n\nPraia dos Três Castelos suits visitors who want dramatic coastal scenery without being far from the services of Praia da Rocha and Portimão. It is a good choice for photography, scenic beach time and short coastal walks towards Praia da Rocha, Praia dos Careanos and Praia do Vau. Because the beach sits below cliffs and access is officially described via steps from the viewpoint, visitors should take care with mobility, cliff edges and sea conditions. Facilities are officially listed, but some services may be seasonal and should be checked locally before visiting.",
  "coordinates": {
    "latitude": 37.117637,
    "longitude": -8.546286,
    "label": "Praia dos Três Castelos",
    "notes": "Primary listing coordinates use the official ABAAE Três Castelos beach entry.",
    "bathing_areas": [
      {
        "name": "Três Castelos",
        "latitude": 37.117637,
        "longitude": -8.546286,
        "type": "Cliff-framed sandy beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Maritime sandy beach",
  "landscape": "Golden sand below high Algarve cliffs, with sculpted rock formations, arches, caves, rocky platforms and a viewpoint above the shore.",
  "access": "Official access is described via the stairs descending from Miradouro dos Três Castelos. Visitors should confirm current access conditions locally, especially after poor weather or during cliff-safety interventions.",
  "highlights": [
    "Cliff-framed sandy beach beside Praia da Rocha",
    "Sculpted rock formations, arches, caves and rocky platforms",
    "Miradouro dos Três Castelos viewpoint above the beach",
    "Nearby access to Praia dos Careanos and the Portimão cliff coastline",
    "Officially listed facilities including beach support, WC, showers and lifeguard service",
    "Blue Flag listed by the official Blue Flag programme for the 2026 bathing season"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Coastal walks",
    "Beach facilities",
    "Swimming when sea conditions allow",
    "Visitors staying near Praia da Rocha"
  ],
  "facilities": [
    { "name": "Beach support", "status": "Verified" },
    { "name": "WC", "status": "Verified" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Lifeguard service", "status": "Seasonal" },
    { "name": "First-aid post", "status": "Seasonal" },
    { "name": "Nautical centre", "status": "Verified" },
    { "name": "Awning / shade-rental zone", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "Blue Flag", "status": "Seasonal" }
  ],
  "includes": [
    "Beach support",
    "WC",
    "Showers",
    "Seasonal lifeguard service",
    "Seasonal first-aid post",
    "Nautical centre",
    "Awning and shade-rental zone",
    "Accessible beach designation",
    "Seasonal Blue Flag",
    "Viewpoint access",
    "Rock formations and cliff scenery"
  ],
  "important_information": {
    "best_time_to_visit": "Late spring and early autumn are good for a more relaxed visit and coastal photography. Summer is best for seasonal beach services, but visitors should expect a livelier atmosphere and should verify facilities before visiting.",
    "know_before_you_go": "The beach is officially described as accessed by stairs from Miradouro dos Três Castelos.\nVisit Portimão lists the beach as Praia Acessível, but visitors with reduced mobility should confirm the current accessible route and seasonal assistance before travelling.\nThe official Blue Flag page lists the 2026 bathing and Blue Flag season as 01/06/2026 to 30/09/2026; before the season starts, flag status should be checked locally.\nThe beach is close to Praia da Rocha and may be busy during peak summer periods.\nSea conditions can vary; visitors should check beach flags, signage and lifeguard instructions before entering the water.\nThe cliffs and rock formations are part of the appeal, but visitors should avoid cliff edges, unstable areas and restricted zones.",
    "notes": [
      "The beach is officially described as accessed by stairs from Miradouro dos Três Castelos.",
      "Visit Portimão lists the beach as Praia Acessível, but visitors with reduced mobility should confirm the current accessible route and seasonal assistance before travelling.",
      "The official Blue Flag page lists the 2026 bathing and Blue Flag season as 01/06/2026 to 30/09/2026; before the season starts, flag status should be checked locally.",
      "The beach is close to Praia da Rocha and may be busy during peak summer periods.",
      "Sea conditions can vary; visitors should check beach flags, signage and lifeguard instructions before entering the water.",
      "The cliffs and rock formations are part of the appeal, but visitors should avoid cliff edges, unstable areas and restricted zones."
    ]
  },
  "important_notes": "The beach is officially described as accessed by stairs from Miradouro dos Três Castelos.\nVisit Portimão lists the beach as Praia Acessível, but visitors with reduced mobility should confirm the current accessible route and seasonal assistance before travelling.\nThe official Blue Flag page lists the 2026 bathing and Blue Flag season as 01/06/2026 to 30/09/2026; before the season starts, flag status should be checked locally.\nThe beach is close to Praia da Rocha and may be busy during peak summer periods.\nSea conditions can vary; visitors should check beach flags, signage and lifeguard instructions before entering the water.\nThe cliffs and rock formations are part of the appeal, but visitors should avoid cliff edges, unstable areas and restricted zones.",
  "best_time_to_visit": "Late spring and early autumn are good for a more relaxed visit and coastal photography. Summer is best for seasonal beach services, but visitors should expect a livelier atmosphere and should verify facilities before visiting.",
  "suitable_for": [
    "Visitors wanting a scenic beach close to Praia da Rocha",
    "Photography-focused travellers",
    "Couples",
    "Beachgoers comfortable with stair access",
    "Families who are comfortable managing steps, cliffs and a busier setting",
    "Coastal walkers"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or quiet beach in high season",
    "Visitors who cannot manage stairs unless current accessible access is confirmed",
    "Travellers wanting an undeveloped natural beach",
    "Visitors uncomfortable with cliff-backed beaches"
  ],
  "nearby_attractions": [
    {
      "name": "Praia da Rocha",
      "type": "Beach",
      "description": "A major neighbouring beach immediately to the east, officially described as one of Portimão’s most emblematic beaches and connected to Três Castelos by the rocky coastal setting.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Careanos",
      "type": "Beach",
      "description": "A smaller neighbouring beach to the west of Praia dos Três Castelos, identified by VisitPortugal as the next beach along this cliff-backed stretch.",
      "verification_status": "Verified"
    },
    {
      "name": "Miradouro dos Três Castelos",
      "type": "Viewpoint",
      "description": "The viewpoint above the beach, used for access and known for views over the sculpted rock formations and coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Fortaleza de Santa Catarina",
      "type": "Historic fort / viewpoint",
      "description": "A historic fort at Praia da Rocha, built to defend the Arade river bar and now a recognised Portimão viewpoint.",
      "verification_status": "Verified"
    },
    {
      "name": "Museu de Portimão",
      "type": "Museum",
      "description": "A cultural stop in Portimão, housed in the former Feu canning factory and focused on the city’s territory, identity and history.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Portimão",
    "Praia da Rocha",
    "Alvor",
    "Ferragudo"
  ],
  "walking_trails_nearby": [
    {
      "name": "Varandas Sobre o Mar",
      "description": "An official Visit Portimão coastal itinerary along the rocky Portimão coastline, described as following the top of Miocene limestone cliffs. Route access and signage should be checked before walking.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Rocha – Três Castelos – Careanos coastal walk",
      "description": "A practical nearby coastal walk idea using the neighbouring beaches and cliff viewpoints. The individual beaches and cliff setting are verified, but visitors should confirm safe passage, tide conditions and any cliff restrictions locally.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Arrive earlier in summer if you prefer easier access and a calmer spot on the sand.",
    "Use Miradouro dos Três Castelos for photographs before descending to the beach.",
    "Check sea flags and local signage before swimming.",
    "Wear suitable footwear for the stairs and nearby cliff paths.",
    "Combine the visit with Praia da Rocha, Praia dos Careanos or Fortaleza de Santa Catarina."
  ],
  "photography_notes": "Best angles are from Miradouro dos Três Castelos and the clifftop viewpoints above the beach. The most distinctive subjects are the rock formations, arches, cliff textures and the contrast between golden sand and the blue Atlantic.",
  "family_notes": "The beach has official facilities listed, including WC, showers, beach support and seasonal lifeguard service. Families should still take care with stair access, cliffs, rocks, waves and summer crowds.",
  "safety_notes": "Sea conditions can vary, and swimming should depend on beach flags, lifeguard guidance and local conditions. Keep away from cliff edges and unstable rock areas, especially after rain or strong winds.",
  "accessibility_notes": "Visit Portimão lists Praia dos Três Castelos as Praia Acessível, but the same official description says access is via stairs from Miradouro dos Três Castelos. Visitors with reduced mobility should confirm the current accessible route, equipment and seasonal assistance before visiting.",
  "seo": {
    "meta_title": "Praia dos Três Castelos, Portimão | Algarve Beach",
    "meta_description": "Explore Praia dos Três Castelos in Portimão, a cliff-framed Algarve beach beside Praia da Rocha with golden sand, viewpoints and visitor tips.",
    "keywords": [
      "Praia dos Três Castelos",
      "Praia dos Três Castelos Portimão",
      "Portimão beach",
      "Algarve beach",
      "Portugal beaches",
      "Praia da Rocha nearby beach",
      "Miradouro dos Três Castelos",
      "cliff beach Algarve",
      "beaches in Portimão"
    ]
  },
  "sources_used": [
    {
      "source_name": "Visit Portimão – Praia dos Três Castelos",
      "source_url": "https://visitportimao.com/praias/praia-dos-tres-castelos/",
      "facts_verified": [
        "Beach name and Portimão tourism listing",
        "Access via stairs from Miradouro dos Três Castelos",
        "Rock formations, arches, caves and rocky platforms",
        "Listed facilities: beach support, Blue Flag, nautical centre, showers, lifeguard, first-aid post, accessible beach, WC and awning zone",
        "Birdlife and coastal vegetation context"
      ]
    },
    {
      "source_name": "VisitPortugal – Praia dos Três Castelos",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-tr%C3%AAs-castelos",
      "facts_verified": [
        "Beach is in Portimão",
        "Praia marítima classification",
        "Golden sand and location beside Praia da Rocha",
        "Connection to Praia da Rocha through a passage in the rocks",
        "Neighbouring Praia dos Careanos to the west",
        "Blue Flag, surveillance, sunshade rental, parking, bar and restaurant listed as services"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Portimão – Praia dos Três Castelos",
      "source_url": "https://www.jf-portimao.pt/praia-dos-tres-castelos/",
      "facts_verified": [
        "Location beside Praia da Rocha",
        "Also known locally as Praia do Branquinho",
        "Flat sandy beach and clear waters",
        "Viewpoint at the top of the cliff"
      ]
    },
    {
      "source_name": "Bandeira Azul – Três Castelos",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/tres-castelos/",
      "facts_verified": [
        "Official Blue Flag programme listing",
        "Concelho: Portimão",
        "Coordinates: 37.117637, -8.546286",
        "2026 bathing season: 01/06/2026 to 30/09/2026",
        "2026 Blue Flag season: 01/06/2026 to 30/09/2026",
        "Flag not yet hoisted at time of source page"
      ]
    },
    {
      "source_name": "Bandeira Azul – Galardoados 2025",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2025/",
      "facts_verified": [
        "Três Castelos listed among Portimão Blue Flag award locations for 2025"
      ]
    },
    {
      "source_name": "Visit Portimão – Varandas Sobre o Mar",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/varandas-sobre-o-mar/",
      "facts_verified": [
        "Official Portimão coastal walking itinerary",
        "Rocky coast of Portimão",
        "Miocene limestone cliffs",
        "Coastal birdlife and vegetation context"
      ]
    },
    {
      "source_name": "Visit Portimão – Fortaleza de Santa Catarina",
      "source_url": "https://visitportimao.com/portimao-2/fortaleza-de-santa-catarina/",
      "facts_verified": [
        "Fortaleza de Santa Catarina location at Praia da Rocha",
        "Historic defensive purpose at the Arade river bar",
        "Nearby cultural attraction"
      ]
    },
    {
      "source_name": "Visit Portimão – Museu de Portimão",
      "source_url": "https://visitportimao.com/portimao-2/museu-de-portimao/",
      "facts_verified": [
        "Museum location in Portimão",
        "Former Feu canning factory setting",
        "Nearby cultural attraction"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, country, beach type, neighbouring beaches, access from Miradouro dos Três Castelos and major landscape features were verified from official tourism and local authority sources.",
    "Facilities are listed by official tourism sources, but several are likely seasonal; lifeguard, first-aid, shade rental and Blue Flag display should be checked locally during the intended visit period.",
    "Blue Flag information was verified from the official Blue Flag programme. The 2026 page lists the bathing and Blue Flag season from 01/06/2026 to 30/09/2026 and shows the flag as not yet hoisted before the season.",
    "Accessibility is marked with caution because Visit Portimão lists the beach as Praia Acessível while also describing access via stairs from the viewpoint.",
    "The description of the beach as busy or lively is treated cautiously as a peak-season visitor expectation due to its central location beside Praia da Rocha, not as a fixed official status.",
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
  where slug = 'portimao';

  if v_city_id is null then
    raise exception 'Portimão city was not found';
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
