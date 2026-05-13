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
  v_slug text := 'praia-de-vale-centeanes-lagoa';
  v_name text := 'Praia de Vale Centeanes';
  v_address text := 'Praia de Vale Centeanes, Carvoeiro, Lagoa, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes';
  v_latitude numeric := 37.091267;
  v_longitude numeric := -8.455396;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Vale Centeanes",
  "slug": "praia-de-vale-centeanes-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carvoeiro / Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Vale Centeanes is a popular cliff-framed beach near Carvoeiro, in the municipality of Lagoa. Known for its golden limestone cliffs, long staircase access and connection to the Seven Hanging Valleys Trail, it is a strong base for beach days and coastal walking.",
  "full_description": "Praia de Vale Centeanes is a scenic beach near Carvoeiro, in the municipality of Lagoa, set within one of the Algarve’s most recognisable limestone coastlines. VisitPortugal describes it as a sheltered cove between golden cliffs, with unusual eroded formations that can conceal small caves, and access by a long staircase.\n\nThe beach has a compact but dramatic setting: a sandy shore below high cliffs, clear Atlantic water and a coastline that continues east towards some of Lagoa’s most photographed natural landmarks. It is especially relevant for visitors who want to combine a beach stop with walking, as the official Seven Hanging Valleys Trail begins or ends here, linking Vale Centeanes with Praia da Marinha over 5.7 km.\n\nVale Centeanes is more practical than some of Lagoa’s smaller coves, with VisitPortugal listing Blue Flag, seasonal surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, surf and diving. These services may depend on the bathing season and concession operation, so visitors should check current conditions before travelling.\n\nBecause the beach is both a recognised bathing area and a key access point for one of Lagoa’s most famous coastal walks, it may feel busy in summer, particularly around the staircase and serviced areas. Visitors should keep away from cliff edges and cliff bases, use official paths, and follow local flags, signage and safety guidance.",
  "coordinates": {
    "latitude": 37.091267,
    "longitude": -8.455396,
    "label": "Praia de Vale Centeanes",
    "notes": "Coordinates were taken from the official ABAAE Vale Centeanes beach entry."
  },
  "beach_type": "Sandy maritime beach below limestone cliffs",
  "landscape": "A compact sandy cove enclosed by golden limestone cliffs, eroded rock formations and clear coastal water.",
  "access": "Access is by a long staircase from the cliff-top area, as described by VisitPortugal. This may be challenging for visitors with reduced mobility, pushchairs or heavy beach equipment.",
  "highlights": [
    "Golden limestone cliffs and sheltered cove scenery",
    "Long staircase access from the cliff-top area",
    "Official start or end point of the Seven Hanging Valleys Trail",
    "Seasonal beach support, restaurant, bar, showers and parking listed by VisitPortugal",
    "Surf and diving listed by official tourism source, subject to conditions",
    "Official 2026 Blue Flag listing for Vale Centeanes"
  ],
  "best_for": [
    "Coastal walks",
    "Seven Hanging Valleys Trail",
    "Photography",
    "Couples",
    "Nature lovers",
    "Short beach days",
    "Snorkelling or diving when conditions are suitable",
    "Visitors staying in Carvoeiro or Lagoa"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Surf activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Step-free access", "status": "Not verified" },
    { "name": "Accessible beach recognition", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Seasonal sunshade rental",
    "Light boat rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Surf context",
    "Diving context",
    "Seven Hanging Valleys Trail access"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and seasonal beach support. Spring, early summer and September are especially good for the Seven Hanging Valleys Trail and photography, with less peak-summer pressure than July and August.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Vale Centeanes as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Vale Centeanes as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nAccess to the sand involves a long staircase.\nThe beach is backed by cliffs; visitors should keep away from cliff bases and cliff edges.\nFacilities, surveillance and activity services may vary by season and concession operation.\nThe Seven Hanging Valleys Trail follows exposed cliff-top terrain, so suitable footwear, water and sun protection are recommended.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Vale Centeanes as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Vale Centeanes as 1 July 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Access to the sand involves a long staircase.",
      "The beach is backed by cliffs; visitors should keep away from cliff bases and cliff edges.",
      "Facilities, surveillance and activity services may vary by season and concession operation.",
      "The Seven Hanging Valleys Trail follows exposed cliff-top terrain, so suitable footwear, water and sun protection are recommended.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Vale Centeanes as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Vale Centeanes as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nAccess to the sand involves a long staircase.\nThe beach is backed by cliffs; visitors should keep away from cliff bases and cliff edges.\nFacilities, surveillance and activity services may vary by season and concession operation.\nThe Seven Hanging Valleys Trail follows exposed cliff-top terrain, so suitable footwear, water and sun protection are recommended.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and seasonal beach support. Spring, early summer and September are especially good for the Seven Hanging Valleys Trail and photography, with less peak-summer pressure than July and August.",
  "suitable_for": [
    "Visitors staying in Carvoeiro",
    "Coastal walkers",
    "Photographers",
    "Couples",
    "Visitors exploring the Lagoa cliff coast",
    "Beachgoers comfortable with stair access",
    "Trail users starting or finishing the Seven Hanging Valleys route"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free beach access",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Visitors carrying heavy beach equipment",
    "Those seeking a large open resort beach",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Seven Hanging Valleys Trail",
      "type": "Walking trail",
      "description": "An official 5.7 km nature trail linking Praia de Vale Centeanes to Praia da Marinha along Lagoa’s limestone cliff coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach and trail endpoint",
      "description": "An iconic Lagoa cliff beach and the opposite endpoint of the Seven Hanging Valleys Trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Algar Seco",
      "type": "Natural rock formation and coastal landmark",
      "description": "A nearby Carvoeiro coastal site known for limestone rock formations, sea views and boardwalk access.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro",
      "type": "Nearby coastal village",
      "description": "A lively village west of Vale Centeanes, useful for restaurants, services and wider exploration of the Lagoa coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach",
      "description": "A small fishing-village beach east of Vale Centeanes, associated with Lagoa’s cave and cliff coastline.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Carvoeiro",
    "Lagoa",
    "Benagil",
    "Ferragudo",
    "Porches"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "Câmara Municipal de Lagoa verifies this as a 5.7 km pedestrian nature trail connecting Praia de Vale Centeanes and Praia da Marinha through a landscape of cliffs, ravines and hanging valleys.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro to Algar Seco coastal walk",
      "description": "A nearby coastal route around Carvoeiro and Algar Seco, suitable for combining with Vale Centeanes as part of a wider Lagoa coastline visit.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient serviced areas.",
    "Travel light because beach access involves a long staircase.",
    "Wear proper footwear if combining the beach with the Seven Hanging Valleys Trail.",
    "Carry water and sun protection for the exposed cliff-top route.",
    "Use official paths only and avoid informal cliff-edge shortcuts.",
    "Check beach flags before swimming, surfing, diving or using small craft services.",
    "For photography, early morning and late afternoon usually bring softer light to the golden cliffs."
  ],
  "photography_notes": "Praia de Vale Centeanes photographs well from the cliff-top approach and from the sand below the limestone walls. The strongest compositions usually include the beach, golden cliffs and open sea, but visitors should avoid unsafe cliff edges and never stand close to cliff bases for photographs.",
  "family_notes": "The beach can suit families who are comfortable with stair access and want seasonal services close to Carvoeiro. Families with small children should take extra care on the staircase, near rocks and close to the waterline.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from beach surveillance where present. Keep away from cliff edges and cliff bases, and take care on the Seven Hanging Valleys Trail, which includes exposed cliff-top sections.",
  "accessibility_notes": "Step-free access and accessible-beach recognition were not verified. VisitPortugal describes access by a long staircase, so visitors with reduced mobility should confirm current access conditions before visiting.",
  "seo": {
    "meta_title": "Praia de Vale Centeanes, Lagoa | Beach Guide",
    "meta_description": "Praia de Vale Centeanes in Lagoa is a popular cliff beach near Carvoeiro with Seven Hanging Valleys Trail access and Blue Flag status.",
    "keywords": [
      "Praia de Vale Centeanes",
      "Vale Centeanes Beach",
      "Vale Centeanes Lagoa",
      "Carvoeiro beaches",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Seven Hanging Valleys Trail",
      "Sete Vales Suspensos",
      "cliff beach Algarve",
      "Blue Flag Vale Centeanes",
      "Praia da Marinha trail",
      "Carvoeiro coastal walks"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Vale Centeanes trip ideas",
      "links": [
        { "label": "Praia de Vale Centeanes" },
        { "label": "Vale Centeanes Beach" },
        { "label": "Seven Hanging Valleys Trail" },
        { "label": "Sete Vales Suspensos" },
        { "label": "Praia da Marinha trail" },
        { "label": "Carvoeiro coastal walks" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Carvoeiro" },
        { "label": "Lagoa" },
        { "label": "Benagil" },
        { "label": "Ferragudo" },
        { "label": "Porches" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Vale de Centeanes",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Carvoeiro, Lagoa",
        "Golden cliff setting",
        "Eroded rock formations and caves",
        "Sheltered cove character",
        "Long staircase access",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar and restaurant",
        "Activities listed including surf and diving",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official Seven Hanging Valleys Trail",
        "5.7 km pedestrian nature route",
        "Route linking Praia de Vale Centeanes to Praia da Marinha",
        "Lagoa cliff-coast landscape context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vale Centeanes",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/vale-centeanes/",
      "facts_verified": [
        "Official Vale Centeanes coastal beach entry",
        "Municipality of Lagoa",
        "Coordinates",
        "Beach code PTCT8D",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at the time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Vale Centeanes listed among Lagoa’s 2026 Blue Flag locations",
        "Lagoa listed with six awarded 2026 locations"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Hastear das Bandeiras Azul da Europa e Praia Acessível",
      "source_url": "https://www.cm-lagoa.pt/noticia/hastear-das-bandeiras-azul-da-europa-e-praia-acessivel-praia-para-todos-nas-praias-do-municipio-de-lagoa",
      "facts_verified": [
        "Vale Centeanes recognised with Blue Flag in 2025",
        "Lagoa municipal beach-quality and bathing-season context",
        "Praia Acessível recognition in the cited municipal article applied to Senhora da Rocha and Carvoeiro, not Vale Centeanes"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Limpeza das Praias",
      "source_url": "https://www.cm-lagoa.pt/viver/ambiente-e-urbanismo/ambiente/servicos-publicos-essenciais/limpeza-das-praias",
      "facts_verified": [
        "Vale Centeanes included among Lagoa coastline beach-cleaning locations",
        "Municipal description of Lagoa coastline with cliffs and small sandy beaches",
        "Seven Hanging Valleys route listed among maintained coastal routes"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, cliff setting, staircase access, facilities, coordinates, 2026 Blue Flag status and Seven Hanging Valleys connection were verified from official tourism, municipal and ABAAE sources.",
    "ABAAE verifies Vale Centeanes’ 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "The listing does not claim accessible-beach status because current official accessible-beach recognition was not verified for Vale Centeanes.",
    "Facilities are included only where listed by VisitPortugal and marked Seasonal where operation may depend on bathing season, concession activity or sea conditions.",
    "The beach’s popularity is expressed cautiously, based on its verified Blue Flag status, official facilities and role as an access point to the Seven Hanging Valleys Trail.",
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
