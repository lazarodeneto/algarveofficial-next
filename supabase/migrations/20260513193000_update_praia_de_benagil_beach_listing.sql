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
  'Benagil / Lagoa',
  'benagil-lagoa',
  'Small Lagoa fishing-village beach area associated with Praia de Benagil, sea-cave trips and the Benagil caves coastline.',
  37.087775,
  -8.426675,
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
  v_slug text := 'praia-de-benagil-lagoa';
  v_name text := 'Praia de Benagil';
  v_short_description text := $short$
Praia de Benagil is a small fishing-village beach in Lagoa, set below limestone cliffs and closely associated with boat trips to the Benagil caves. It is one of the Algarve's highest-demand cave-tour departure points, especially in peak season.
$short$;
  v_description text := $description$
Praia de Benagil sits in the small coastal village of Benagil, in the municipality of Lagoa. Official tourism sources describe it as a maritime beach with a small sandy area, fishing boats and a dramatic cliff setting where grottoes and caverns shape the coastline.

The beach is best understood as both a bathing spot and a working departure point for sea-cave tours. Fishing boats and tourism vessels are part of the character of Benagil, and Visit Algarve notes that access to the beach is through the area reserved for fishing boats, which also take visitors to nearby sea caves and beaches that cannot be reached by land. This gives Benagil a distinctive atmosphere, but also means the beach can feel busy, practical and movement-heavy rather than quiet or spacious.

Demand for cave tours is very high, particularly because of the nearby Algar de Benagil. The Portuguese Maritime Authority has introduced navigation rules for the Benagil caves area, including limits, guided-access requirements for non-motorised platforms and restrictions on swimming or using flotation devices to access the cave. Visitors should not assume they can simply swim, paddle independently or land inside the cave; current official rules and operator permissions must be checked before any visit.

For coastal walkers, Benagil also sits close to the Seven Hanging Valleys landscape, with Marinha, Carvalho and Vale de Centeanes all forming part of the wider Lagoa cliff-coast experience. The setting is memorable, but visitors should plan carefully, avoid cliff edges and cliff bases, and expect pressure on access, parking and tour availability during summer.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Benagil",
  "slug": "praia-de-benagil-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Benagil / Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Benagil is a small fishing-village beach in Lagoa, set below limestone cliffs and closely associated with boat trips to the Benagil caves. It is one of the Algarve's highest-demand cave-tour departure points, especially in peak season.",
  "full_description": "Praia de Benagil sits in the small coastal village of Benagil, in the municipality of Lagoa. Official tourism sources describe it as a maritime beach with a small sandy area, fishing boats and a dramatic cliff setting where grottoes and caverns shape the coastline.\n\nThe beach is best understood as both a bathing spot and a working departure point for sea-cave tours. Fishing boats and tourism vessels are part of the character of Benagil, and Visit Algarve notes that access to the beach is through the area reserved for fishing boats, which also take visitors to nearby sea caves and beaches that cannot be reached by land. This gives Benagil a distinctive atmosphere, but also means the beach can feel busy, practical and movement-heavy rather than quiet or spacious.\n\nDemand for cave tours is very high, particularly because of the nearby Algar de Benagil. The Portuguese Maritime Authority has introduced navigation rules for the Benagil caves area, including limits, guided-access requirements for non-motorised platforms and restrictions on swimming or using flotation devices to access the cave. Visitors should not assume they can simply swim, paddle independently or land inside the cave; current official rules and operator permissions must be checked before any visit.\n\nFor coastal walkers, Benagil also sits close to the Seven Hanging Valleys landscape, with Marinha, Carvalho and Vale de Centeanes all forming part of the wider Lagoa cliff-coast experience. The setting is memorable, but visitors should plan carefully, avoid cliff edges and cliff bases, and expect pressure on access, parking and tour availability during summer.",
  "coordinates": {
    "latitude": 37.087775,
    "longitude": -8.426675,
    "notes": "Map coordinates are retained from the existing verified Praia de Benagil listing data so the beach detail map remains available. The latest supplied research package did not add a new authoritative coordinate source."
  },
  "beach_type": "Small sandy maritime beach beside a fishing village",
  "landscape": "A compact sandy beach framed by limestone cliffs, with fishing boats, sea-cave scenery and nearby grottoes along the Lagoa coast.",
  "access": "Official tourism sources describe access through the fishing-boat area. Road access to Benagil is available, but beach and tour access can become congested in high season. Visitors should confirm current parking and tour-boarding arrangements before travelling.",
  "highlights": [
    "Small fishing-village beach in the municipality of Lagoa",
    "Limestone cliffs, grottoes and sea-cave scenery",
    "Major departure point for Benagil cave and coastal boat trips",
    "Close to the Seven Hanging Valleys coastal landscape",
    "Nearby to Praia da Marinha and Praia do Carvalho",
    "Strong visitor demand for cave tours, especially in high season"
  ],
  "best_for": [
    "Boat tours",
    "Sea-cave scenery",
    "Photography",
    "Coastal walks",
    "Nature lovers",
    "Couples",
    "Visitors staying in Lagoa or Carvoeiro",
    "Short scenic beach stops"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Small craft hire / boat activity", "status": "Seasonal / regulated" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Blue Flag status", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal safety or surveillance listed by official tourism source",
    "Seasonal / regulated small craft hire and boat activity",
    "Showers",
    "Outdoor parking",
    "Seasonal bar",
    "Seasonal restaurant"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and early autumn are better for calmer access and coastal walks. In July and August, visit early and book any legal guided cave activity in advance, as demand can be very high.",
    "know_before_you_go": "Benagil is a small beach and can become crowded quickly during peak summer and cave-tour departure times.\nCurrent official rules restrict access to the Benagil caves area; visitors should verify the latest Maritime Authority guidance before booking or attempting any nautical activity.\nSwimming or using flotation devices to access Algar de Benagil is prohibited under the official navigation rules checked during this research.\nUnguided rental or use of non-motorised nautical platforms in the regulated caves area is not permitted under the amended 2025 rules checked during this research.\nThe Maritime Authority identifies the Benagil caves area as a rockfall-risk zone with conservation status, so visitors should respect all safety and environmental guidance.\nFacilities and beach surveillance may be seasonal.\nSea conditions can vary; visitors should follow local flags, signage and official safety instructions.",
    "notes": [
      "Benagil is a small beach and can become crowded quickly during peak summer and cave-tour departure times.",
      "Current official rules restrict access to the Benagil caves area; visitors should verify the latest Maritime Authority guidance before booking or attempting any nautical activity.",
      "Swimming or using flotation devices to access Algar de Benagil is prohibited under the official navigation rules checked during this research.",
      "Unguided rental or use of non-motorised nautical platforms in the regulated caves area is not permitted under the amended 2025 rules checked during this research.",
      "The Maritime Authority identifies the Benagil caves area as a rockfall-risk zone with conservation status, so visitors should respect all safety and environmental guidance.",
      "Facilities and beach surveillance may be seasonal.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety instructions."
    ]
  },
  "important_notes": "Benagil is a small beach and can become crowded quickly during peak summer and cave-tour departure times.\nCurrent official rules restrict access to the Benagil caves area; visitors should verify the latest Maritime Authority guidance before booking or attempting any nautical activity.\nSwimming or using flotation devices to access Algar de Benagil is prohibited under the official navigation rules checked during this research.\nUnguided rental or use of non-motorised nautical platforms in the regulated caves area is not permitted under the amended 2025 rules checked during this research.\nThe Maritime Authority identifies the Benagil caves area as a rockfall-risk zone with conservation status, so visitors should respect all safety and environmental guidance.\nFacilities and beach surveillance may be seasonal.\nSea conditions can vary; visitors should follow local flags, signage and official safety instructions.",
  "best_time_to_visit": "Spring, early summer and early autumn are better for calmer access and coastal walks. In July and August, visit early and book any legal guided cave activity in advance, as demand can be very high.",
  "suitable_for": [
    "Visitors interested in guided cave tours",
    "Photographers",
    "Couples",
    "Coastal walkers",
    "Nature-focused visitors",
    "Visitors comfortable with a busy small-beach setting"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or spacious beach day in peak summer",
    "Visitors expecting unrestricted access to Benagil Cave",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Families with small children looking for a large, open resort beach",
    "Anyone planning to swim independently to the cave"
  ],
  "nearby_attractions": [
    {
      "name": "Algar de Benagil",
      "type": "Sea cave",
      "description": "The famous sea cave close to Praia de Benagil, accessible only under current regulated maritime conditions. Visitors should use legal, guided and authorised options only.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "description": "An iconic Lagoa cliff beach east of Benagil, known for limestone formations, sea stacks and Seven Hanging Valleys scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Carvalho",
      "type": "Nearby beach",
      "description": "A small cliff-framed beach west of Benagil, part of the wider Lagoa limestone coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach and walking-trail point",
      "description": "A cliff-backed beach near Carvoeiro and a key point on the Seven Hanging Valleys route.",
      "verification_status": "Verified"
    },
    {
      "name": "Carvoeiro",
      "type": "Nearby coastal town",
      "description": "A well-known Lagoa coastal town with restaurants, services and access to nearby cliff walks and beaches.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Benagil",
    "Carvoeiro",
    "Lagoa",
    "Porches",
    "Ferragudo"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "A well-known Lagoa cliff-coast route between Praia da Marinha and Praia de Vale Centeanes, passing close to Benagil and the surrounding limestone cave landscape.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Do not plan to swim to Benagil Cave; check official maritime rules and use legal authorised options only.",
    "Book regulated cave tours ahead in peak season, as demand can be very high.",
    "Arrive early if visiting in summer, particularly if travelling by car.",
    "Expect a working beach environment with fishing boats and tour activity.",
    "Wear suitable footwear if combining Benagil with cliff-top walking.",
    "Keep away from cliff bases, cave edges and informal cliff paths.",
    "Check weather and sea conditions before any boat, kayak or SUP activity."
  ],
  "photography_notes": "Benagil is highly photogenic from the beach, cliff-top areas and authorised sea approaches. For safe photography, use official paths and legal tour options; do not enter restricted areas, swim to the cave or stand near unstable cliff edges.",
  "family_notes": "Families may enjoy the village setting and scenery, but the beach is small, busy and linked to active boat movement. Families with children should take extra care near the waterline, boats, steps, roads and cliff areas.",
  "safety_notes": "The Benagil caves area is regulated because of maritime traffic, conservation requirements and rockfall risk. Visitors should follow official Maritime Authority rules, use life jackets where required, avoid cliff bases and never attempt unsafe independent access to caves.",
  "accessibility_notes": "Accessibility information is not fully verified. Visitors with reduced mobility should confirm current access, parking and beach-entry conditions before visiting.",
  "seo": {
    "meta_title": "Praia de Benagil, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia de Benagil in Lagoa is a small Algarve beach known for cave tours, fishing boats, limestone cliffs and high visitor demand.",
    "keywords": [
      "Praia de Benagil",
      "Benagil Beach",
      "Benagil Lagoa",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Benagil cave tours",
      "Algar de Benagil",
      "Seven Hanging Valleys",
      "Carvoeiro beaches",
      "Praia da Marinha nearby"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Benagil trip ideas",
      "links": [
        { "label": "Praia de Benagil" },
        { "label": "Benagil Beach" },
        { "label": "Benagil cave tours" },
        { "label": "Algar de Benagil" },
        { "label": "Seven Hanging Valleys" },
        { "label": "Lagoa beaches" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia da Marinha" },
        { "label": "Praia do Carvalho" },
        { "label": "Praia de Vale Centeanes" },
        { "label": "Carvoeiro" },
        { "label": "Porches" },
        { "label": "Ferragudo" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Benagil",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Benagil, Lagoa",
        "Small sandy beach character",
        "Fishing boats",
        "Cliffs, grottoes and caverns",
        "Boat-trip relevance",
        "Facilities including surveillance, small craft hire, showers, parking, bar and restaurant"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia de Benagil",
      "source_url": "https://visitalgarve.pt/en/equipamento/8760/praia-de-benagil",
      "facts_verified": [
        "Beach access through the fishing-boat area",
        "Fishing boats also taking visitors to sea caves and unspoiled beaches",
        "Benagil as a sea-cave departure point"
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional / Capitania do Porto de Portimão - Edital 019/2024",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Lists/Documentos_AMN/20240730%20Edital%20019-2024%20-%20Instru%C3%A7%C3%A3o%20Navega%C3%A7%C3%A3o%20Grutas%20de%20Benagil_signed.pdf",
      "facts_verified": [
        "Navigation rules for the Benagil caves maritime area",
        "Area between Vale do Lapa and Albandeira in Lagoa",
        "High maritime traffic and safety concerns",
        "Rockfall-risk zone",
        "Conservation status reference",
        "Prohibition on visitor access to Algar de Benagil by swimming or flotation aids",
        "Night navigation restriction",
        "Limits on boats and non-motorised platforms",
        "Time limits for cave visits"
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional / Capitania do Porto de Portimão - Edital 009/2025",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Lists/Documentos_AMN/20250702%20Eidtal%20009-2025%2C%20alt1%20ao%20Edital%20019-2024_signed.pdf",
      "facts_verified": [
        "2025 amendment to Benagil caves navigation rules",
        "Guided requirement for non-motorised nautical platforms",
        "Mandatory safety equipment references",
        "Revised simultaneous-access limits inside Algar de Benagil"
      ]
    },
    {
      "source_name": "AMAL - Novas Regras para as Grutas de Benagil",
      "source_url": "https://amal.pt/comunicacao/978-novas-regras-para-a-ca-lagoa",
      "facts_verified": [
        "Regional communication on the new Benagil cave rules",
        "Ban on kayak rental without guide in the Benagil caves area",
        "Ban on cave access by swimming or flotation aids",
        "Limits on vessels and kayaks inside the cave",
        "Maximum visit times and guided kayak ratio"
      ]
    },
    {
      "source_name": "Visit Algarve - Seven Hanging Valleys Trail",
      "source_url": "https://visitalgarve.pt/en/3593/percurso-dos-sete-vales-suspensos.aspx",
      "facts_verified": [
        "Seven Hanging Valleys Trail relevance to Lagoa's cliff coastline",
        "Hanging valley landscape context near Benagil"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, beach type, fishing-village setting, cliff and cave landscape, boat-trip relevance and basic facilities were verified from official tourism sources.",
    "The very high cave-tour demand is supported cautiously through official evidence of intense maritime traffic, regulated cave access and the beach's role as a departure point for sea-cave trips.",
    "Current cave-access rules are highly important and may change; the listing reflects the Maritime Authority documents checked during this research and should be reviewed before publication updates.",
    "Blue Flag status was not verified from an official current Blue Flag source and is therefore marked Not verified.",
    "The latest research package did not include a new authoritative coordinate source. Existing verified map coordinates from the current Praia de Benagil listing were retained for frontend map continuity.",
    "Accessibility information could not be fully verified from authoritative sources and is marked accordingly.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal or regulated where appropriate.",
    "No prohibited third-party platform names, review scores or unsupported ranking claims were included in the public listing text."
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
  where slug = 'benagil-lagoa'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city benagil-lagoa was not found';
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
      'https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514',
      'Praia de Benagil, Benagil, Lagoa, Algarve, Portugal',
      37.087775,
      -8.426675,
      array[
        'Praia de Benagil',
        'Benagil Beach',
        'Benagil Lagoa',
        'Lagoa beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Benagil cave tours',
        'Algar de Benagil',
        'Seven Hanging Valleys',
        'Carvoeiro beaches'
      ],
      v_category_data,
      'Praia de Benagil, Lagoa | Algarve Beach Guide',
      'Praia de Benagil in Lagoa is a small Algarve beach known for cave tours, fishing boats, limestone cliffs and high visitor demand.',
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
      website_url = 'https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514',
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
      address = 'Praia de Benagil, Benagil, Lagoa, Algarve, Portugal',
      latitude = 37.087775,
      longitude = -8.426675,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Benagil',
        'Benagil Beach',
        'Benagil Lagoa',
        'Lagoa beaches',
        'Algarve beaches',
        'Portugal beaches',
        'Benagil cave tours',
        'Algar de Benagil',
        'Seven Hanging Valleys',
        'Carvoeiro beaches'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Benagil, Lagoa | Algarve Beach Guide',
      meta_description = 'Praia de Benagil in Lagoa is a small Algarve beach known for cave tours, fishing boats, limestone cliffs and high visitor demand.',
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
