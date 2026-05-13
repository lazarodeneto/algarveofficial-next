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
  'Historic western Algarve city close to Praia do Camilo, Costa d''Oiro beaches and Ponta da Piedade.',
  37.087253,
  -8.66858,
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
  v_slug text := 'praia-do-camilo-lagos';
  v_name text := 'Praia do Camilo';
  v_short_description text := $short$
Praia do Camilo is a small cliff-framed beach in Lagos, known for its golden rock formations, clear coastal scenery and dramatic staircase approach. Close to Ponta da Piedade, it is one of the most photogenic stops on the Lagos coastline.
$short$;
  v_description text := $description$
Praia do Camilo is a compact and highly photogenic beach on the Lagos coast, set between sculpted golden cliffs not far from Ponta da Piedade. Official tourism sources describe it as a small sandy beach sheltered between cut cliffs, reached by a staircase of around 200 steps. The descent is part of the experience, with wide views over the sea, rock stacks and the Costa d'Oiro coastline before reaching the sand.

This is not a large resort beach. Camilo is better suited to scenic visits, photography, short beach stops and coastal walks than to a spacious all-day beach setup. Its small scale means that space can feel limited during busy periods, especially in summer and around the staircase. Visitors who want a calmer experience should consider arriving early, visiting later in the day or choosing shoulder-season months.

The beach sits naturally within a classic Lagos route, with Praia de Dona Ana, Praia do Pinhão, Praia da Batata and Ponta da Piedade nearby. VisitPortugal highlights Ponta da Piedade as an impressive rock formation with jagged shapes and sea-carved caves, accessible from the same road area as Camilo.

Access is an important limitation. Lagos municipal regulation confirms that access to Praia do Camilo is exclusively by the existing staircases, which are extensive and winding. During the bathing season, there are restrictions on using the stairs with surf, SUP, windsurf, kitesurf, kayak, canoe and diving equipment between 09:00 and 19:00. Visitors should also keep away from cliff edges and cliff bases and follow all local signage.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Camilo",
  "slug": "praia-do-camilo-lagos",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Lagos",
  "concelho": "Lagos",
  "municipality": "Lagos",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Camilo is a small cliff-framed beach in Lagos, known for its golden rock formations, clear coastal scenery and dramatic staircase approach. Close to Ponta da Piedade, it is one of the most photogenic stops on the Lagos coastline.",
  "full_description": "Praia do Camilo is a compact and highly photogenic beach on the Lagos coast, set between sculpted golden cliffs not far from Ponta da Piedade. Official tourism sources describe it as a small sandy beach sheltered between cut cliffs, reached by a staircase of around 200 steps. The descent is part of the experience, with wide views over the sea, rock stacks and the Costa d'Oiro coastline before reaching the sand.\n\nThis is not a large resort beach. Camilo is better suited to scenic visits, photography, short beach stops and coastal walks than to a spacious all-day beach setup. Its small scale means that space can feel limited during busy periods, especially in summer and around the staircase. Visitors who want a calmer experience should consider arriving early, visiting later in the day or choosing shoulder-season months.\n\nThe beach sits naturally within a classic Lagos route, with Praia de Dona Ana, Praia do Pinhão, Praia da Batata and Ponta da Piedade nearby. VisitPortugal highlights Ponta da Piedade as an impressive rock formation with jagged shapes and sea-carved caves, accessible from the same road area as Camilo.\n\nAccess is an important limitation. Lagos municipal regulation confirms that access to Praia do Camilo is exclusively by the existing staircases, which are extensive and winding. During the bathing season, there are restrictions on using the stairs with surf, SUP, windsurf, kitesurf, kayak, canoe and diving equipment between 09:00 and 19:00. Visitors should also keep away from cliff edges and cliff bases and follow all local signage.",
  "coordinates": {
    "latitude": 37.087253,
    "longitude": -8.66858,
    "notes": "Coordinates were taken from the ABAAE Lagos municipality page for Camilo."
  },
  "beach_type": "Small sandy maritime beach below cliffs",
  "landscape": "A compact golden-sand cove framed by steep limestone cliffs, rock formations and clear blue-green coastal water.",
  "access": "Access is by a long staircase from the cliff-top area. VisitPortugal describes around 200 steps, and Lagos municipal regulation confirms that access to Praia do Camilo is exclusively through the existing staircases.",
  "highlights": [
    "Small sandy cove between sculpted golden cliffs",
    "Staircase access with around 200 steps",
    "Highly photogenic views over the Lagos coastline",
    "Close to Ponta da Piedade and its sea-carved rock formations",
    "Part of the Costa d'Oiro beach sequence",
    "Good for scenic coastal walks and short beach visits"
  ],
  "best_for": [
    "Photography",
    "Scenic views",
    "Couples",
    "Coastal walks",
    "Nature lovers",
    "Short beach stops",
    "Lagos city visitors",
    "Ponta da Piedade route"
  ],
  "facilities": [
    { "name": "Lifeguard / beach surveillance", "status": "Seasonal" },
    { "name": "Beach support", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" },
    { "name": "Step-free access", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal lifeguard / beach surveillance",
    "Beach support",
    "Restaurant",
    "Car parking"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and early autumn are best for photography and coastal walking. In July and August, early morning or late afternoon visits are usually more comfortable than peak midday periods.",
    "know_before_you_go": "Access involves around 200 steps and is not suitable for visitors seeking step-free beach access.\nLagos municipal regulation confirms that access is exclusively through the existing staircases.\nDuring the bathing season, the stairs cannot be used between 09:00 and 19:00 by people carrying surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment.\nThe beach is small and can become crowded during peak summer.\nVisitors should keep away from cliff edges and cliff bases.\nFacilities and surveillance may be seasonal and should be checked before visiting.\nSea conditions can vary; visitors should follow local flags, signs and official safety guidance.\nCurrent 2026 Blue Flag status was not verified during this research.",
    "notes": [
      "Access involves around 200 steps and is not suitable for visitors seeking step-free beach access.",
      "Lagos municipal regulation confirms that access is exclusively through the existing staircases.",
      "During the bathing season, the stairs cannot be used between 09:00 and 19:00 by people carrying surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment.",
      "The beach is small and can become crowded during peak summer.",
      "Visitors should keep away from cliff edges and cliff bases.",
      "Facilities and surveillance may be seasonal and should be checked before visiting.",
      "Sea conditions can vary; visitors should follow local flags, signs and official safety guidance.",
      "Current 2026 Blue Flag status was not verified during this research."
    ]
  },
  "important_notes": "Access involves around 200 steps and is not suitable for visitors seeking step-free beach access.\nLagos municipal regulation confirms that access is exclusively through the existing staircases.\nDuring the bathing season, the stairs cannot be used between 09:00 and 19:00 by people carrying surf, SUP, windsurf, kitesurf, kayak, canoe or diving equipment.\nThe beach is small and can become crowded during peak summer.\nVisitors should keep away from cliff edges and cliff bases.\nFacilities and surveillance may be seasonal and should be checked before visiting.\nSea conditions can vary; visitors should follow local flags, signs and official safety guidance.\nCurrent 2026 Blue Flag status was not verified during this research.",
  "best_time_to_visit": "Spring, early summer and early autumn are best for photography and coastal walking. In July and August, early morning or late afternoon visits are usually more comfortable than peak midday periods.",
  "suitable_for": [
    "Photographers",
    "Couples",
    "Visitors staying in Lagos",
    "Coastal walkers",
    "Travellers exploring Ponta da Piedade",
    "Visitors comfortable with staircase access"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free access",
    "Visitors with reduced mobility unless current conditions are confirmed in advance",
    "Families carrying heavy beach equipment",
    "Visitors seeking a large, quiet beach in peak summer",
    "Visitors carrying bulky nautical equipment during restricted bathing-season hours"
  ],
  "nearby_attractions": [
    {
      "name": "Ponta da Piedade",
      "type": "Headland and coastal landmark",
      "description": "A famous Lagos headland with jagged limestone formations, sea caves and boat-trip scenery, located very close to Praia do Camilo.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Dona Ana",
      "type": "Nearby beach",
      "description": "A well-known Lagos postcard beach west of Camilo, also framed by golden cliffs and reached by stair access.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Pinhão",
      "type": "Nearby beach",
      "description": "A small rocky bay between Lagos centre and the Costa d'Oiro beaches, useful as part of a coastal walking route.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Batata",
      "type": "Nearby beach",
      "description": "A city-adjacent Lagos beach near the historic centre and a practical starting point for exploring the smaller coves east of town.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagos Historic Centre",
      "type": "Historic town centre",
      "description": "The nearby historic centre of Lagos offers restaurants, cultural sights and services within easy reach of the coastline.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Lagos",
    "Meia Praia",
    "Praia da Luz",
    "Odiáxere",
    "Burgau"
  ],
  "walking_trails_nearby": [
    {
      "name": "Lagos coastal walk to Praia do Camilo and Ponta da Piedade",
      "description": "A scenic coastal route linking Lagos' smaller coves, including Batata, Pinhão, Dona Ana and Camilo, before continuing towards Ponta da Piedade.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in summer, as the beach is small and the staircase can become busy.",
    "Travel light because access is by a long staircase.",
    "Check current municipal restrictions before bringing boards, kayaks, canoes or diving equipment.",
    "Use official paths and stairways only.",
    "For photography, pause at the cliff-top viewpoint before descending.",
    "Combine Camilo with Ponta da Piedade and Praia de Dona Ana for a classic Lagos coastal route."
  ],
  "photography_notes": "Praia do Camilo is especially photogenic from the top of the staircase, where the cliffs, rock stacks and small sandy cove are visible from above. Softer morning or late-afternoon light usually works best, but visitors should stay on safe paths and avoid cliff edges.",
  "family_notes": "Families can enjoy the beach when conditions are suitable, but the small cove, steep staircase and summer crowding require planning. Families with young children should take extra care on the steps, near rocks and close to the water.",
  "safety_notes": "Keep away from cliff edges and cliff bases, follow local beach flags and signage, and take care on the staircase. During the bathing season, municipal rules restrict bulky nautical equipment on the stairs between 09:00 and 19:00.",
  "accessibility_notes": "Praia do Camilo is not verified as step-free. Official and municipal sources confirm staircase access, so visitors with reduced mobility should confirm current conditions before visiting.",
  "seo": {
    "meta_title": "Praia do Camilo, Lagos | Algarve Beach Guide",
    "meta_description": "Praia do Camilo in Lagos is a small cliff beach near Ponta da Piedade, known for golden rocks, staircase access and scenic views.",
    "keywords": [
      "Praia do Camilo",
      "Praia do Camilo Lagos",
      "Camilo Beach",
      "Lagos beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Ponta da Piedade",
      "Costa d'Oiro Lagos",
      "Praia de Dona Ana",
      "cliff beaches Algarve",
      "photogenic beaches Lagos"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Camilo trip ideas",
      "links": [
        { "label": "Praia do Camilo" },
        { "label": "Camilo Beach" },
        { "label": "Lagos beaches" },
        { "label": "Ponta da Piedade" },
        { "label": "Costa d'Oiro Lagos" },
        { "label": "photogenic beaches Lagos" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia de Dona Ana" },
        { "label": "Praia do Pinhão" },
        { "label": "Praia da Batata" },
        { "label": "Lagos Historic Centre" },
        { "label": "Meia Praia" },
        { "label": "Praia da Luz" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Camilo",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-camilo",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Lagos",
        "Small sandy beach between cliffs",
        "Access by staircase with around 200 steps",
        "Proximity to Ponta da Piedade",
        "Ponta da Piedade as a nearby rock formation with caves and boat-trip scenery"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Praias",
      "source_url": "https://www.cm-lagos.pt/descobrir-lagos/visitar/praias",
      "facts_verified": [
        "Praia do Camilo as a small beach between cliffs",
        "Rock formations",
        "Shell-like beach shape",
        "Beach surveillance reference",
        "Costa d'Oiro coastline context",
        "Nearby Ponta da Piedade"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Regulamento de Acesso às Praias da Dona Ana e do Camilo",
      "source_url": "https://www.cm-lagos.pt/balcao-virtual/documentos/regulamentos/download/24351/12650/104",
      "facts_verified": [
        "Access exclusively through existing staircases",
        "Staircases described as extensive and winding",
        "Safety rationale for access management",
        "Praia do Camilo classified as a bathing beach in the municipal regulation",
        "Bathing-season restrictions on surf, SUP, windsurf, kitesurf, kayak, canoe and diving equipment through the stairs between 09:00 and 19:00"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Access regulation news item",
      "source_url": "https://www.cm-lagos.pt/municipio/noticias/12752-acesso-as-praias-dona-ana-e-camilo-passou-a-estar-regulamentado",
      "facts_verified": [
        "2024 implementation of access rules",
        "Restriction on bulky nautical and diving equipment during bathing-season daytime hours",
        "Purpose of rules: coastal pressure management, environmental safeguarding and risk prevention"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Lagos municipality page",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/lagos/",
      "facts_verified": [
        "Official Camilo beach entry",
        "Municipality of Lagos",
        "Coordinates",
        "Historic Blue Flag page information checked but not treated as current 2026 status"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "2026 Lagos Blue Flag listings checked",
        "Lagos 2026 listed locations include Luz, Meia Praia, Porto de Mós and Marina de Lagos",
        "Praia do Camilo not found among the 2026 Lagos Blue Flag locations during verification"
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73799",
      "facts_verified": [
        "Lagos coastal context",
        "Nearby beaches including Batata, Pinhão, Dona Ana and Camilo",
        "Ponta da Piedade as a nearby landmark with jagged formations and sea caves",
        "Access from the city centre to the smaller beaches"
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Praia do Camilo",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/praia-do-camilo-8",
      "facts_verified": [
        "Municipal description of Praia do Camilo between cliffs",
        "Halfway position between Lagos and Ponta da Piedade",
        "Rock formations and shell-like setting",
        "Long staircase from the Ponta da Piedade road viewpoint",
        "Costa d'Oiro landscape context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, cliff landscape, small sandy character, staircase access and proximity to Ponta da Piedade were verified from official tourism and municipal sources.",
    "The highly photographed positioning is expressed cautiously as photogenic and scenic, based on the verified landscape, viewpoint and recognisable cliff setting rather than public review-platform claims.",
    "Coordinates were taken from the ABAAE Lagos municipality page for Camilo.",
    "Current 2026 Blue Flag status was not verified. The 2026 ABAAE listings checked for Lagos include Luz, Meia Praia, Porto de Mós and Marina de Lagos, but not Praia do Camilo.",
    "Facilities are limited to items verified by official sources. Surveillance is marked Seasonal because beach support depends on the bathing season.",
    "Accessibility is not marked as verified because access is via a long staircase.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
  ]
}
$json$::jsonb;
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
  where slug = 'lagos'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city lagos was not found';
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
      'https://www.visitportugal.com/pt-pt/content/praia-do-camilo',
      'Praia do Camilo, Lagos, Algarve, Portugal',
      37.087253,
      -8.66858,
      array[
        'Praia do Camilo',
        'Praia do Camilo Lagos',
        'Camilo Beach',
        'Lagos beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Ponta da Piedade',
        'Costa d''Oiro Lagos',
        'Praia de Dona Ana',
        'cliff beaches Algarve'
      ],
      v_category_data,
      'Praia do Camilo, Lagos | Algarve Beach Guide',
      'Praia do Camilo in Lagos is a small cliff beach near Ponta da Piedade, known for golden rocks, staircase access and scenic views.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-do-camilo',
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
      address = 'Praia do Camilo, Lagos, Algarve, Portugal',
      latitude = 37.087253,
      longitude = -8.66858,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia do Camilo',
        'Praia do Camilo Lagos',
        'Camilo Beach',
        'Lagos beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Ponta da Piedade',
        'Costa d''Oiro Lagos',
        'Praia de Dona Ana',
        'cliff beaches Algarve'
      ],
      category_data = v_category_data,
      meta_title = 'Praia do Camilo, Lagos | Algarve Beach Guide',
      meta_description = 'Praia do Camilo in Lagos is a small cliff beach near Ponta da Piedade, known for golden rocks, staircase access and scenic views.',
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
