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
  'Central Algarve resort city with historic centre beaches, marina access and scenic western coves including São Rafael.',
  37.0891,
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
  v_slug text := 'praia-de-sao-rafael-albufeira';
  v_name text := 'Praia de São Rafael';
  v_short_description text := $short$
Praia de São Rafael is a well-known scenic beach near Albufeira, framed by limestone cliffs, golden rock formations and small coves. It is a strong choice for visitors looking for dramatic coastal scenery close to the city.
$short$;
  v_description text := $description$
Praia de São Rafael is one of Albufeira's most recognisable scenic beaches, located west of the city in the Sesmarias area. Official tourism sources describe it as a maritime beach set between cliffs, with isolated rocks scattered across the sand and rising from the sea, giving the beach a distinctive Algarve character.

The setting is compact but visually rich. Golden and ochre limestone formations surround the sand, while natural rock outcrops divide parts of the beach into smaller corners and cove-like areas. This makes São Rafael especially appealing for photography, couples, visitors exploring the Albufeira coastline and anyone wanting a beach with more geological interest than a simple open shoreline.

The beach is close enough to Albufeira for an easy coastal outing, yet it feels more natural and intimate than the central urban beaches. Visit Albufeira verifies strong infrastructure, including a beach restaurant, surveillance, sunbed rental and stairway access from the cliff-top area. These services may depend on the bathing season or concession operation, so visitors should confirm current arrangements before travelling.

Because São Rafael is scenic, accessible from the resort area and officially recognised with Blue Flag status for the 2026 season, it can become busy during summer. Visitors should arrive early in peak months, keep away from cliff edges and cliff bases, and follow local flags, signage and safety guidance before swimming or exploring around the rocks.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de São Rafael",
  "slug": "praia-de-sao-rafael-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "São Rafael / Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de São Rafael is a well-known scenic beach near Albufeira, framed by limestone cliffs, golden rock formations and small coves. It is a strong choice for visitors looking for dramatic coastal scenery close to the city.",
  "full_description": "Praia de São Rafael is one of Albufeira's most recognisable scenic beaches, located west of the city in the Sesmarias area. Official tourism sources describe it as a maritime beach set between cliffs, with isolated rocks scattered across the sand and rising from the sea, giving the beach a distinctive Algarve character.\n\nThe setting is compact but visually rich. Golden and ochre limestone formations surround the sand, while natural rock outcrops divide parts of the beach into smaller corners and cove-like areas. This makes São Rafael especially appealing for photography, couples, visitors exploring the Albufeira coastline and anyone wanting a beach with more geological interest than a simple open shoreline.\n\nThe beach is close enough to Albufeira for an easy coastal outing, yet it feels more natural and intimate than the central urban beaches. Visit Albufeira verifies strong infrastructure, including a beach restaurant, surveillance, sunbed rental and stairway access from the cliff-top area. These services may depend on the bathing season or concession operation, so visitors should confirm current arrangements before travelling.\n\nBecause São Rafael is scenic, accessible from the resort area and officially recognised with Blue Flag status for the 2026 season, it can become busy during summer. Visitors should arrive early in peak months, keep away from cliff edges and cliff bases, and follow local flags, signage and safety guidance before swimming or exploring around the rocks.",
  "coordinates": {
    "latitude": 37.074868,
    "longitude": -8.280752,
    "label": "Praia de São Rafael / S. Rafael",
    "notes": "Coordinates were taken from the official ABAAE S. Rafael beach entry."
  },
  "beach_type": "Small to medium sandy maritime beach below limestone cliffs",
  "landscape": "A sandy beach framed by warm-toned limestone cliffs, isolated rock stacks, fissured formations and small cove-like sections.",
  "access": "Access is verified by official local tourism as being by stairways from the cliff-top area. Visitors should expect steps and should confirm the most suitable current access point before travelling.",
  "highlights": [
    "Well-known scenic beach west of Albufeira",
    "Golden and ochre limestone cliffs shaped by erosion",
    "Natural rock formations on the sand and in the sea",
    "Small coves and sheltered-looking corners created by rock outcrops",
    "Beach restaurant, surveillance, sunbed rental and stair access verified by official local tourism",
    "Official 2026 Blue Flag listing for S. Rafael"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Nature lovers",
    "Short beach days",
    "Coastal scenery",
    "Visitors staying near Albufeira",
    "Snorkelling when conditions are suitable"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach surveillance / lifeguard supervision listed by official local tourism", "status": "Seasonal" },
    { "name": "Beach restaurant", "status": "Verified / Seasonal" },
    { "name": "Sunbed rental", "status": "Seasonal" },
    { "name": "Stairway access", "status": "Verified" },
    { "name": "Parking", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Step-free access", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Beach restaurant",
    "Seasonal sunbed rental",
    "Stairway access",
    "Scenic limestone cliffs",
    "Rock formations and cove-like sections"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing season. June and September are often more comfortable for photography and coastal scenery with fewer peak-summer crowds than July and August.",
    "know_before_you_go": "ABAAE lists S. Rafael among Albufeira's 2026 Blue Flag locations.\nABAAE lists the 2026 bathing season for S. Rafael as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for S. Rafael as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nAccess involves stairways from the cliff-top area, which may be difficult for visitors with reduced mobility or heavy beach equipment.\nThe beach is backed by cliffs and rock formations; visitors should keep away from cliff bases and cliff edges.\nFacilities and surveillance may be seasonal and should be confirmed before visiting.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists S. Rafael among Albufeira's 2026 Blue Flag locations.",
      "ABAAE lists the 2026 bathing season for S. Rafael as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for S. Rafael as 1 July 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Access involves stairways from the cliff-top area, which may be difficult for visitors with reduced mobility or heavy beach equipment.",
      "The beach is backed by cliffs and rock formations; visitors should keep away from cliff bases and cliff edges.",
      "Facilities and surveillance may be seasonal and should be confirmed before visiting.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists S. Rafael among Albufeira's 2026 Blue Flag locations.\nABAAE lists the 2026 bathing season for S. Rafael as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for S. Rafael as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nAccess involves stairways from the cliff-top area, which may be difficult for visitors with reduced mobility or heavy beach equipment.\nThe beach is backed by cliffs and rock formations; visitors should keep away from cliff bases and cliff edges.\nFacilities and surveillance may be seasonal and should be confirmed before visiting.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "May to October for the official bathing season. June and September are often more comfortable for photography and coastal scenery with fewer peak-summer crowds than July and August.",
  "suitable_for": [
    "Visitors staying in Albufeira or Sesmarias",
    "Couples",
    "Photographers",
    "Visitors looking for scenic rock formations",
    "Beachgoers comfortable with stair access",
    "Nature-focused travellers",
    "Short beach visits close to Albufeira"
  ],
  "not_suitable_for": [
    "Visitors requiring verified step-free access",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Visitors seeking a large open resort beach",
    "Those wishing to avoid popular beaches in summer",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Praia dos Arrifes",
      "type": "Nearby beach",
      "description": "A small cove west of Albufeira, known for low sculpted cliffs, rock formations and three prominent sea stacks.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Coelha",
      "type": "Nearby beach",
      "description": "A small beach about 5 km west of Albufeira, set between golden cliffs and popular during summer.",
      "verification_status": "Verified"
    },
    {
      "name": "Marina de Albufeira",
      "type": "Marina",
      "description": "A modern marina near Albufeira with nautical facilities and visitor services, useful before or after a São Rafael beach visit.",
      "verification_status": "Verified"
    },
    {
      "name": "Albufeira Historic Centre",
      "type": "Historic town centre",
      "description": "The central old-town area of Albufeira, suitable for dining, viewpoints and exploring the city's coastal identity.",
      "verification_status": "Verified"
    },
    {
      "name": "Ermida de Nossa Senhora da Orada",
      "type": "Chapel",
      "description": "A chapel near Albufeira Marina, referenced by VisitPortugal as part of the wider Albufeira coastal and maritime setting.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Sesmarias",
    "Galé",
    "Guia",
    "Armação de Pêra"
  ],
  "walking_trails_nearby": [
    {
      "name": "São Rafael and Arrifes coastal walk",
      "description": "An informal short coastal walk between neighbouring scenic beaches west of Albufeira. Route condition, cliff safety and access should be checked locally before setting out.",
      "verification_status": "Not verified"
    },
    {
      "name": "Albufeira western beaches coastal route",
      "description": "A flexible coastal outing linking beaches such as Arrifes, São Rafael, Coelha and Castelo by road, paths and short beach-access walks. Not verified as an official signed trail.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August, as the beach is scenic and can become busy.",
    "Travel light because access involves stairs.",
    "Use official paths and avoid informal cliff-edge routes.",
    "For photography, visit early or late in the day when the warm tones of the rocks are softer.",
    "Check local flags before swimming or snorkelling.",
    "Combine São Rafael with Arrifes, Coelha or Albufeira Marina for a wider coastal itinerary."
  ],
  "photography_notes": "Praia de São Rafael is especially photogenic for its golden limestone cliffs, isolated sea rocks and cove-like beach sections. The best compositions are usually from safe beach-level positions or official access areas; visitors should not approach cliff edges or unstable rock faces for photographs.",
  "family_notes": "The beach may suit families who want a scenic serviced beach close to Albufeira, but the stair access, rock formations and summer crowds require planning. Children should be supervised closely near rocks, steps and the waterline.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from surveillance teams where present. Keep away from cliff bases and cliff edges because rockfall risk can exist on cliff-backed Algarve beaches.",
  "accessibility_notes": "Step-free access was not verified. Official local tourism confirms stairway access from the cliff tops, so visitors with reduced mobility should confirm current conditions before visiting.",
  "seo": {
    "meta_title": "Praia de São Rafael, Albufeira | Beach Guide",
    "meta_description": "Praia de São Rafael near Albufeira is a scenic Algarve beach with limestone cliffs, rock formations, coves, stair access and Blue Flag status.",
    "keywords": [
      "Praia de São Rafael",
      "Praia de Sao Rafael",
      "São Rafael Beach",
      "Albufeira beaches",
      "Algarve beaches",
      "Portugal beaches",
      "scenic beach Albufeira",
      "limestone cliffs Algarve",
      "rock formations Albufeira",
      "Praia dos Arrifes nearby",
      "Praia da Coelha nearby",
      "Sesmarias Albufeira"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de São Rafael trip ideas",
      "links": [
        { "label": "Praia de São Rafael" },
        { "label": "Praia de Sao Rafael" },
        { "label": "São Rafael Beach" },
        { "label": "scenic beach Albufeira" },
        { "label": "limestone cliffs Algarve" },
        { "label": "rock formations Albufeira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia dos Arrifes" },
        { "label": "Praia da Coelha" },
        { "label": "Marina de Albufeira" },
        { "label": "Albufeira Historic Centre" },
        { "label": "Sesmarias" },
        { "label": "Ermida de Nossa Senhora da Orada" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de São Rafael",
      "source_url": "https://www.visitportugal.com/pt-pt/node/141573",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Albufeira",
        "Beach set between cliffs",
        "Isolated rocks on the sand and in the sea",
        "Good support infrastructure"
      ]
    },
    {
      "source_name": "Visit Albufeira - Praia de São Rafael",
      "source_url": "https://visitalbufeira.pt/praia/praia-de-sao-rafael",
      "facts_verified": [
        "São Rafael as a well-known Albufeira coastal destination",
        "Limestone cliffs shaped by natural erosion",
        "Golden and ochre rock formations",
        "Rock outcrops forming small coves and sheltered corners",
        "Beach restaurant",
        "Lifeguard supervision",
        "Sunbed rental",
        "Stairway access from the cliff tops"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de São Rafael",
      "source_url": "https://visitalgarve.pt/en/equipamento/8770/praia-de-so-rafael",
      "facts_verified": [
        "Regional tourism listing for Praia de São Rafael",
        "Warmly coloured, craggy and fissured limestone cliffs",
        "Variety of rock formations including arches",
        "Scenic geological character"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - S. Rafael",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/s-rafael/",
      "facts_verified": [
        "Official S. Rafael coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates",
        "Beach code PTCU7F",
        "Address at Estrada das Sesmarias",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at the time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "S. Rafael listed among Albufeira's 2026 Blue Flag locations",
        "Albufeira listed with 25 awarded locations in 2026"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia dos Arrifes",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-arrifes",
      "facts_verified": [
        "Praia dos Arrifes as a nearby beach west of Albufeira",
        "Small cove character",
        "Low sculpted cliffs",
        "Three prominent rock formations"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Coelha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-coelha",
      "facts_verified": [
        "Praia da Coelha as a nearby beach west of Albufeira",
        "Golden cliff setting",
        "Approximate distance of 5 km west of Albufeira",
        "Summer popularity"
      ]
    },
    {
      "source_name": "VisitPortugal - Marina de Albufeira",
      "source_url": "https://www.visitportugal.com/pt-pt/content/marina-de-albufeira",
      "facts_verified": [
        "Marina de Albufeira as a nearby marina",
        "Location in Várzea da Orada",
        "Nautical and visitor-service context"
      ]
    },
    {
      "source_name": "VisitPortugal - Albufeira e as praias",
      "source_url": "https://www.visitportugal.com/pt-pt/node/73802",
      "facts_verified": [
        "Albufeira coastal context",
        "Modern Marina de Albufeira nearby",
        "Ermida de Nossa Senhora da Orada nearby",
        "Albufeira beach-destination context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, cliff setting, rock formations, support infrastructure, stair access, Blue Flag season and coordinates were verified from official tourism and ABAAE sources.",
    "The phrase well-known scenic beach near Albufeira is supported by official local tourism wording and the verified limestone-cliff and rock-formation landscape.",
    "ABAAE verifies the 2026 bathing season for S. Rafael as 15 May 2026 to 15 October 2026 and the 2026 Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, the ABAAE page showed the Blue Flag as not hoisted, so public wording treats Blue Flag status as seasonal rather than permanently active.",
    "Parking, toilets, showers and step-free access were not fully verified from authoritative current sources and are marked Not verified.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on bathing season or concession activity.",
    "Walking route suggestions are geographically sensible but not verified as official signed trails, so they are marked Not verified.",
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
  where slug = 'albufeira'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city albufeira was not found';
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
      'https://www.visitportugal.com/pt-pt/node/141573',
      'Praia de São Rafael, São Rafael / Albufeira, Algarve, Portugal',
      37.074868,
      -8.280752,
      array[
        'Praia de São Rafael',
        'Praia de Sao Rafael',
        'São Rafael Beach',
        'Albufeira beaches',
        'Algarve beaches',
        'Portugal beaches',
        'scenic beach Albufeira',
        'limestone cliffs Algarve',
        'rock formations Albufeira',
        'Praia dos Arrifes nearby',
        'Praia da Coelha nearby',
        'Sesmarias Albufeira'
      ],
      v_category_data,
      'Praia de São Rafael, Albufeira | Beach Guide',
      'Praia de São Rafael near Albufeira is a scenic Algarve beach with limestone cliffs, rock formations, coves, stair access and Blue Flag status.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/node/141573',
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
      address = 'Praia de São Rafael, São Rafael / Albufeira, Algarve, Portugal',
      latitude = 37.074868,
      longitude = -8.280752,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de São Rafael',
        'Praia de Sao Rafael',
        'São Rafael Beach',
        'Albufeira beaches',
        'Algarve beaches',
        'Portugal beaches',
        'scenic beach Albufeira',
        'limestone cliffs Algarve',
        'rock formations Albufeira',
        'Praia dos Arrifes nearby',
        'Praia da Coelha nearby',
        'Sesmarias Albufeira'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de São Rafael, Albufeira | Beach Guide',
      meta_description = 'Praia de São Rafael near Albufeira is a scenic Algarve beach with limestone cliffs, rock formations, coves, stair access and Blue Flag status.',
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
