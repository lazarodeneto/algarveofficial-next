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
  'Praia da Luz / Luz',
  'praia-da-luz',
  'West Algarve village beach area in Lagos known for broad sand, Rocha Negra and accessible beach support.',
  37.086975,
  -8.727023,
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
  v_slug text := 'praia-da-luz-lagos';
  v_name text := 'Praia da Luz';
  v_address text := 'Praia da Luz, Luz, Lagos, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-luz-1';
  v_latitude numeric := 37.086975;
  v_longitude numeric := -8.727023;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Luz",
  "slug": "praia-da-luz-lagos",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Praia da Luz / Luz",
  "concelho": "Lagos",
  "municipality": "Lagos",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Luz is a major west Algarve resort beach in Lagos, set beside the village of Luz west of the city. Known for its broad sand, village seafront, accessible-beach support and Rocha Negra backdrop, it is one of the municipality’s most visited beach areas.",
  "full_description": "Praia da Luz is one of the main resort beaches of the western Algarve, located in the village of Luz, in the municipality of Lagos. It combines a broad sandy beach with a developed village seafront, whitewashed houses, beach support and the striking cliff backdrop of Rocha Negra at the eastern side of the bay.\n\nOfficial municipal information describes Praia da Luz as a generous beach of soft sand, framed by the cliff with its geodesic marker and by the white houses of the old fishing village. Lagos’ municipal photo archive also describes it as a large beach and one of the most frequented in the municipality, helped by the size of the sand and the space it offers compared with the smaller cliff coves nearer Lagos.\n\nThis is a resort beach rather than a remote natural cove. It is well suited to families, couples, long-stay visitors, accessible-beach users and travellers who want a beach with village services nearby. VisitPortugal confirms beach-support infrastructure, water-sports equipment rental and support for visitors with reduced mobility, while ABAAE lists Luz as a 2026 Blue Flag beach.\n\nPraia da Luz also works well as a base for exploring the west Lagos coast. Rocha Negra gives the beach a distinctive geological identity, the Roman baths sit close to the seafront, and the Luz to Lagos section of the Fishermen’s Trail connects the area with Porto de Mós and the wider Lagos coastline. In summer, visitors should expect high use and plan around the busiest central access points.",
  "coordinates": {
    "latitude": 37.086975,
    "longitude": -8.727023,
    "label": "Praia da Luz",
    "notes": "Coordinates were taken from the official ABAAE Luz beach entry."
  },
  "beach_type": "Large sandy village and resort beach",
  "landscape": "A wide sandy beach backed by the village of Luz, whitewashed buildings, a seafront promenade and the Rocha Negra cliff formation at the eastern side of the bay.",
  "access": "Access is directly from Praia da Luz village. Official sources list the beach as accessible and supported for visitors with reduced mobility, but current seasonal support and the most suitable access point should still be confirmed before visiting.",
  "highlights": [
    "Major west Algarve resort beach in the municipality of Lagos",
    "Broad sandy beach beside the village of Luz",
    "Whitewashed old fishing-village backdrop",
    "Rocha Negra cliff and geological landmark at the eastern side of the bay",
    "Accessible-beach support verified by official tourism sources",
    "Official 2026 Blue Flag listing for Luz"
  ],
  "best_for": [
    "Families",
    "Resort beach days",
    "Accessible beach access",
    "Long beach walks",
    "Village atmosphere",
    "Couples",
    "Photography",
    "Water sports when conditions are suitable",
    "Visitors staying in Luz or Lagos"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach support", "status": "Verified / Seasonal" },
    { "name": "Beach surveillance", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious wheelchair listed by VisitPortugal accessible itinerary", "status": "Verified / Seasonal support should be checked" },
    { "name": "Water-sports equipment rental", "status": "Seasonal / conditions dependent" },
    { "name": "Car parking", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Beach support",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Amphibious wheelchair reference",
    "Water-sports equipment rental",
    "Rocha Negra cliff backdrop",
    "Roman baths nearby",
    "Fishermen’s Trail access"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full resort-beach atmosphere. May, June and September are usually more comfortable for beach walks, photography and village stays with less peak-summer pressure than July and August.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Luz as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Luz as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Luz is one of the most frequented beaches in Lagos municipality according to municipal source material.\nFacilities, surveillance, water-sports rental and accessible-beach support may vary by season.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nRocha Negra and nearby cliff areas should be approached with care; visitors should remain on safe, authorised paths.\nThe beach has sandy and rocky sections, so footwear and care may be useful when exploring away from the main sand.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Luz as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Luz as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia da Luz is one of the most frequented beaches in Lagos municipality according to municipal source material.",
      "Facilities, surveillance, water-sports rental and accessible-beach support may vary by season.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Rocha Negra and nearby cliff areas should be approached with care; visitors should remain on safe, authorised paths.",
      "The beach has sandy and rocky sections, so footwear and care may be useful when exploring away from the main sand."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Luz as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Luz as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Luz is one of the most frequented beaches in Lagos municipality according to municipal source material.\nFacilities, surveillance, water-sports rental and accessible-beach support may vary by season.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nRocha Negra and nearby cliff areas should be approached with care; visitors should remain on safe, authorised paths.\nThe beach has sandy and rocky sections, so footwear and care may be useful when exploring away from the main sand.",
  "best_time_to_visit": "June to September for the official bathing season and full resort-beach atmosphere. May, June and September are usually more comfortable for beach walks, photography and village stays with less peak-summer pressure than July and August.",
  "suitable_for": [
    "Families wanting a resort beach with official support",
    "Visitors staying in Luz or Lagos",
    "Visitors needing accessible-beach support, subject to current confirmation",
    "Beach walkers",
    "Couples",
    "Water-sports users when conditions are suitable",
    "Visitors interested in village atmosphere and coastal history"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Those wishing to avoid popular resort beaches in summer",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Visitors expecting guaranteed calm sea conditions",
    "Anyone intending to climb or sit close to unstable cliff or rock areas"
  ],
  "nearby_attractions": [
    {
      "name": "Rocha Negra",
      "type": "Geological landmark",
      "description": "A dark volcanic rock formation at Praia da Luz, described by the Lagos municipal photo archive as a remnant of volcanic activity more than 70 million years old.",
      "verification_status": "Verified"
    },
    {
      "name": "Balneário Romano da Praia da Luz",
      "type": "Roman archaeological site",
      "description": "Roman bath remains and fish-salting structures on the seafront of Vila da Luz, discovered in the late 19th century.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Porto de Mós",
      "type": "Nearby beach",
      "description": "A large Lagos beach east of Luz, also listed by Lagos municipality among the main beaches of the concelho.",
      "verification_status": "Verified"
    },
    {
      "name": "Ponta da Piedade",
      "type": "Headland and coastal landmark",
      "description": "A major Lagos coastal landmark with rock formations, caves and boat-trip scenery, located further east along the coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Lagos Historic Centre",
      "type": "Historic town centre",
      "description": "The historic centre of Lagos offers restaurants, cultural sites, marina access and a wider city base for visitors staying in Praia da Luz.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Luz",
    "Lagos",
    "Burgau",
    "Praia do Porto de Mós",
    "Espiche",
    "Budens"
  ],
  "walking_trails_nearby": [
    {
      "name": "Luz to Lagos - Fishermen’s Trail / Rota Vicentina",
      "description": "Rota Vicentina lists a Luz to Lagos walking section. The wider Fishermen’s Trail follows coastal paths and cliff areas, and walkers should respect route markings, cliff safety and seasonal conditions.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Luz to Rocha Negra local walk",
      "description": "A short local coastal walk towards the Rocha Negra side of the beach. The geological landmark is verified, but visitors should confirm safe local access and avoid informal cliff-edge routes.",
      "verification_status": "Not verified"
    },
    {
      "name": "Luz to Porto de Mós coastal route",
      "description": "A coastal walking option between Luz and the Porto de Mós area, associated with the broader Luz to Lagos route. Conditions and route markings should be checked before setting out.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August, as Praia da Luz is one of the most frequented beaches in Lagos municipality.",
    "Confirm current accessible-beach support before travelling if an amphibious wheelchair or assistance is required.",
    "Check local flags before swimming or using water-sports equipment.",
    "Use authorised paths around Rocha Negra and avoid cliff edges.",
    "Visit the Roman bath site or take the seafront walk for a fuller Luz village experience.",
    "For a quieter atmosphere, choose early morning, late afternoon or shoulder-season dates."
  ],
  "photography_notes": "Praia da Luz photographs well from the sand and seafront, with the village, broad beach and Rocha Negra creating a strong west-Algarve composition. Early morning and late afternoon usually offer softer light across the cliffs and white village buildings.",
  "family_notes": "Praia da Luz is a strong family option because of its broad sand, resort setting, official support infrastructure and accessible-beach references. Families should still check beach flags, seasonal surveillance and sea conditions before swimming.",
  "safety_notes": "Sea conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Take care around rocky sections and Rocha Negra, and avoid cliff edges or informal paths.",
  "accessibility_notes": "Praia da Luz is verified by VisitPortugal and Lagos municipality as accessible for visitors with reduced mobility. VisitPortugal’s accessible Lagos itinerary also lists Luz among accessible beaches and notes an amphibious wheelchair for sea bathing. Current seasonal support, equipment and access routes should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia da Luz, Lagos | Algarve Beach Guide",
    "meta_description": "Praia da Luz in Lagos is a major west Algarve resort beach with broad sand, village atmosphere, Rocha Negra views and Blue Flag status.",
    "keywords": [
      "Praia da Luz",
      "Praia da Luz Lagos",
      "Luz Beach",
      "Lagos beaches",
      "West Algarve beaches",
      "Algarve resort beach",
      "Portugal beaches",
      "family beach Lagos",
      "accessible beach Lagos",
      "Blue Flag Praia da Luz",
      "Rocha Negra",
      "Roman Baths Praia da Luz",
      "Fishermen's Trail Luz Lagos"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Luz trip ideas",
      "links": [
        { "label": "Praia da Luz" },
        { "label": "Praia da Luz Lagos" },
        { "label": "Luz Beach" },
        { "label": "Blue Flag Praia da Luz" },
        { "label": "Rocha Negra" },
        { "label": "Roman Baths Praia da Luz" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Luz" },
        { "label": "Lagos" },
        { "label": "Burgau" },
        { "label": "Praia do Porto de Mós" },
        { "label": "Espiche" },
        { "label": "Budens" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Luz",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-luz-1",
      "facts_verified": [
        "Beach name",
        "Location in Lagos",
        "Beach support infrastructure",
        "Water-sports equipment rental",
        "Accessibility and support for citizens with reduced mobility"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Praias",
      "source_url": "https://www.cm-lagos.pt/descobrir-lagos/visitar/praias",
      "facts_verified": [
        "Praia da Luz municipal beach listing",
        "Generous soft-sand beach",
        "Cliff with geodesic marker",
        "White houses of the old fishing village",
        "Accessible-beach icon",
        "Blue Flag icon",
        "Beach surveillance icon",
        "Beach support and surveillance reference"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Luz",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/luz/",
      "facts_verified": [
        "Official Luz beach entry",
        "Coastal beach classification",
        "Municipality of Lagos",
        "Coordinates",
        "Beach code PTCE3N",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Luz listed among Lagos’ 2026 Blue Flag locations",
        "Lagos listed with Luz, Meia Praia, Porto de Mós and Marina de Lagos among 2026 awarded locations"
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Praia da Luz",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/praia-da-luz-6",
      "facts_verified": [
        "Large beach character",
        "One of the most frequented beaches in the municipality",
        "Beach divided into sandy and rocky sections",
        "Old fishing-village and cliff backdrop",
        "Accessible beach, support and surveillance reference"
      ]
    },
    {
      "source_name": "Fototeca Municipal de Lagos - Rocha Negra",
      "source_url": "https://fototeca.cm-lagos.pt/praias-e-costa/rocha-negra",
      "facts_verified": [
        "Rocha Negra at Praia da Luz",
        "Volcanic-origin geological landmark",
        "Reference to volcanic activity more than 70 million years ago"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagos - Freguesia da Luz",
      "source_url": "https://www.cm-lagos.pt/municipio/freguesias/luz",
      "facts_verified": [
        "Historic name Nossa Senhora da Luz",
        "Praia da Luz name associated with a major influx of bathers beginning in 1928",
        "Tourism development in the second half of the 20th century",
        "Old fishing-village context"
      ]
    },
    {
      "source_name": "Museu de Lagos - Balneário Romano da Praia da Luz",
      "source_url": "https://museu.cm-lagos.pt/polos/balneario-romano-da-praia-da-luz/",
      "facts_verified": [
        "Roman bath site located on the seafront of Vila da Luz",
        "Discovery in the late 19th century",
        "Bath complex and fish-salting tanks",
        "Roman heritage context"
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos Accessible Tour",
      "source_url": "https://www.visitportugal.com/en/content/lagos-%E2%80%93-accessible-tour",
      "facts_verified": [
        "Praia da Luz listed among accessible Lagos beaches",
        "Amphibious wheelchair reference for Praia da Luz, Porto de Mós and Meia Praia",
        "Accessible tourism context for Lagos"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Luz listed among accessible beaches",
        "Amphibious chair, amphibious walker and bathing-assistance support listed in 2025 accessible-beach information"
      ]
    },
    {
      "source_name": "Rota Vicentina - Luz to Lagos",
      "source_url": "https://rotavicentina.com/walking/luz-lagos/",
      "facts_verified": [
        "Luz to Lagos walking section listed by Rota Vicentina"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail route context",
        "Coastal single-track walking route",
        "Cliff and sandy-path safety guidance",
        "Route should be followed on foot and with marked trail guidance"
      ]
    },
    {
      "source_name": "VisitPortugal - Lagos",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73799",
      "facts_verified": [
        "Lagos coastal context",
        "Praia da Luz included among Lagos beach offer",
        "Ponta da Piedade and Lagos coastal attractions context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, resort-beach character, accessible-beach support, Blue Flag 2026 status, coordinates and bathing-season dates were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “major west Algarve resort beach” is supported by official references to Praia da Luz as a large, highly frequented Lagos beach with strong infrastructure and a long-standing tourism identity.",
    "ABAAE verifies Luz’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where verified from official sources. Items such as toilets, showers, sunshade rental and general parking were not clearly verified from current authoritative sources and are marked Not verified.",
    "Accessibility is verified at recognition level, with additional amphibious-wheelchair information from VisitPortugal and 2025 accessible-beach information from Visit Algarve. Current seasonal support should be confirmed before publication updates.",
    "Walking route information is verified through Rota Vicentina, but visitors should check current trail markings, weather, cliff safety and route conditions before setting out.",
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
  where slug = 'praia-da-luz';

  if v_city_id is null then
    raise exception 'Praia da Luz city was not found';
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
