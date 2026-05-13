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
  'Santa Luzia',
  'santa-luzia',
  'Fishing village in Tavira municipality with Ria Formosa access towards Praia do Barril and Ilha de Tavira.',
  37.101,
  -7.662,
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
  v_slug text := 'praia-do-barril-tavira';
  v_name text := 'Praia do Barril';
  v_short_description text := $short$
Praia do Barril is a distinctive island beach in Tavira, set on Ilha de Tavira within the Ria Formosa landscape. It is best known for its famous anchor cemetery, former tuna-fishing heritage and scenic access by foot or tourist train from Pedras d’El Rei.
$short$;
  v_description text := $description$
Praia do Barril is one of Tavira's most distinctive beach experiences, located around the middle of Ilha de Tavira, a long barrier island within the Ria Formosa coastal system. The beach combines a wide Atlantic-facing sandy shore with a memorable cultural landmark: the "cemitério das âncoras", a field of large iron anchors placed in the dunes as a reminder of the Algarve's former tuna-fishing industry.

Access is part of the character of Barril. From Santa Luzia, visitors cross a pedestrian bridge over the Ria Formosa near Pedras d’El Rei, then continue for around one kilometre on foot or by the small tourist train that runs towards the beach. The route passes through a protected wetland and dune landscape, making the arrival feel more gradual and nature-focused than a standard road-access beach.

The beach support area was adapted from an old tuna-fishing complex, and the original buildings now form part of the visitor setting, with restaurants, bars, WC facilities and other services verified by Tavira municipality. Praia do Barril is also officially recognised as an accessible beach, with adapted train access, ramps, adapted WC facilities and seasonal assisted bathing support listed by the municipality.

Although Barril has a spacious natural setting, it is well known and can be busy in summer, especially around the train stop, restaurants and main serviced area. Visitors should respect dune-protection signage, use authorised paths and check local beach flags before entering the water.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Barril",
  "slug": "praia-do-barril-tavira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Santa Luzia / Tavira",
  "concelho": "Tavira",
  "municipality": "Tavira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Barril is a distinctive island beach in Tavira, set on Ilha de Tavira within the Ria Formosa landscape. It is best known for its famous anchor cemetery, former tuna-fishing heritage and scenic access by foot or tourist train from Pedras d’El Rei.",
  "full_description": "Praia do Barril is one of Tavira's most distinctive beach experiences, located around the middle of Ilha de Tavira, a long barrier island within the Ria Formosa coastal system. The beach combines a wide Atlantic-facing sandy shore with a memorable cultural landmark: the \"cemitério das âncoras\", a field of large iron anchors placed in the dunes as a reminder of the Algarve's former tuna-fishing industry.\n\nAccess is part of the character of Barril. From Santa Luzia, visitors cross a pedestrian bridge over the Ria Formosa near Pedras d’El Rei, then continue for around one kilometre on foot or by the small tourist train that runs towards the beach. The route passes through a protected wetland and dune landscape, making the arrival feel more gradual and nature-focused than a standard road-access beach.\n\nThe beach support area was adapted from an old tuna-fishing complex, and the original buildings now form part of the visitor setting, with restaurants, bars, WC facilities and other services verified by Tavira municipality. Praia do Barril is also officially recognised as an accessible beach, with adapted train access, ramps, adapted WC facilities and seasonal assisted bathing support listed by the municipality.\n\nAlthough Barril has a spacious natural setting, it is well known and can be busy in summer, especially around the train stop, restaurants and main serviced area. Visitors should respect dune-protection signage, use authorised paths and check local beach flags before entering the water.",
  "coordinates": {
    "latitude": 37.08613,
    "longitude": -7.66215,
    "label": "Praia do Barril",
    "notes": "Coordinates are taken from official ABAAE and municipal sources."
  },
  "beach_type": "Long sandy barrier-island beach",
  "landscape": "A broad sandy Atlantic-facing beach on Ilha de Tavira, backed by dunes, Ria Formosa wetland scenery and the historic former tuna-fishing complex.",
  "access": "Access is from Santa Luzia near Pedras d’El Rei via a pedestrian bridge over the Ria Formosa, followed by approximately one kilometre on foot or by tourist train to the beach. Visitors should confirm current train operation and seasonal arrangements before travelling.",
  "highlights": [
    "Famous anchor cemetery set among the dunes",
    "Former tuna-fishing complex adapted into beach-support facilities",
    "Island-beach setting on Ilha de Tavira within the Ria Formosa landscape",
    "Access by pedestrian bridge and either walking route or tourist train from Pedras d’El Rei",
    "Official accessible-beach support verified by Tavira municipality",
    "Official 2026 Blue Flag listing for Barril"
  ],
  "best_for": [
    "Island beach days",
    "Families",
    "Photography",
    "Cultural heritage",
    "Ria Formosa scenery",
    "Long beach walks",
    "Accessible beach access",
    "Nature lovers",
    "Tavira visitors"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach surveillance", "status": "Seasonal" },
    { "name": "Concessioned beach area", "status": "Verified" },
    { "name": "Restaurants and bars", "status": "Verified / Seasonal" },
    { "name": "Medical post / first-aid support", "status": "Verified / Seasonal" },
    { "name": "WC", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental / maritime-tourism activities", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" },
    { "name": "Parking at Pedras d’El Rei area", "status": "Verified" },
    { "name": "Reserved parking for reduced-mobility users", "status": "Verified" },
    { "name": "Adapted tourist train", "status": "Verified / Seasonal" },
    { "name": "Adapted WC facilities", "status": "Verified" },
    { "name": "Amphibious chair / assisted sea access", "status": "Seasonal / verify before visiting" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Concessioned beach area",
    "Seasonal restaurants and bars",
    "Medical post / first-aid support",
    "WC and showers",
    "Seasonal sunshade rental",
    "Seasonal maritime-tourism activities",
    "Accessible beach support",
    "Adapted tourist train and WC facilities"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach support. May, June and September are often better for photography, walking through the Ria Formosa landscape and a calmer experience around the anchor cemetery.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Barril as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Barril as 1 June 2026 to 30 September 2026.\nAccess requires crossing the Ria Formosa by pedestrian bridge and then walking or using the tourist train.\nTourist-train operation and assisted-bathing support may be seasonal and should be checked before visiting.\nThe anchor cemetery and old tuna-fishing buildings are heritage features, not playground structures; visitors should treat them respectfully.\nThe beach sits in a sensitive dune and Ria Formosa environment; visitors should stay on authorised paths and avoid trampling dunes.\nPraia do Barril can become busy in summer, particularly near the train stop and service area.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Barril as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Barril as 1 June 2026 to 30 September 2026.",
      "Access requires crossing the Ria Formosa by pedestrian bridge and then walking or using the tourist train.",
      "Tourist-train operation and assisted-bathing support may be seasonal and should be checked before visiting.",
      "The anchor cemetery and old tuna-fishing buildings are heritage features, not playground structures; visitors should treat them respectfully.",
      "The beach sits in a sensitive dune and Ria Formosa environment; visitors should stay on authorised paths and avoid trampling dunes.",
      "Praia do Barril can become busy in summer, particularly near the train stop and service area.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Barril as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Barril as 1 June 2026 to 30 September 2026.\nAccess requires crossing the Ria Formosa by pedestrian bridge and then walking or using the tourist train.\nTourist-train operation and assisted-bathing support may be seasonal and should be checked before visiting.\nThe anchor cemetery and old tuna-fishing buildings are heritage features, not playground structures; visitors should treat them respectfully.\nThe beach sits in a sensitive dune and Ria Formosa environment; visitors should stay on authorised paths and avoid trampling dunes.\nPraia do Barril can become busy in summer, particularly near the train stop and service area.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full beach support. May, June and September are often better for photography, walking through the Ria Formosa landscape and a calmer experience around the anchor cemetery.",
  "suitable_for": [
    "Families planning a full beach day",
    "Visitors interested in Algarve maritime heritage",
    "Photographers",
    "Beach walkers",
    "Nature-focused travellers",
    "Visitors staying in Tavira or Santa Luzia",
    "Visitors needing officially recognised accessible-beach support, subject to current confirmation"
  ],
  "not_suitable_for": [
    "Visitors who prefer direct road access to the sand",
    "Visitors who do not want to walk or use the tourist train",
    "Those seeking a completely remote beach with no services",
    "Visitors expecting guaranteed quiet in peak summer",
    "Visitors who need accessibility support without confirming seasonal arrangements in advance"
  ],
  "nearby_attractions": [
    {
      "name": "Cemitério das Âncoras",
      "type": "Cultural landmark",
      "description": "A striking open-air arrangement of large anchors in the dunes, preserving the memory of Tavira's former tuna-fishing activity.",
      "verification_status": "Verified"
    },
    {
      "name": "Pedras d’El Rei",
      "type": "Access area and tourist complex",
      "description": "The main mainland access point for Barril, with the pedestrian bridge and tourist-train route towards the beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Santa Luzia",
      "type": "Fishing village",
      "description": "A nearby coastal village closely associated with fishing traditions and Ria Formosa access.",
      "verification_status": "Verified"
    },
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon system of channels, marshes, sandbanks and barrier islands forming the natural setting around Praia do Barril.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Terra Estreita",
      "type": "Nearby island beach",
      "description": "A quieter beach east of Barril on Ilha de Tavira, accessed separately from Santa Luzia by boat.",
      "verification_status": "Verified"
    },
    {
      "name": "Tavira Historic Centre",
      "type": "Historic town centre",
      "description": "A nearby historic Algarve town with the River Gilão, castle, churches, traditional streets and restaurants.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Santa Luzia",
    "Tavira",
    "Luz de Tavira",
    "Cabanas de Tavira",
    "Conceição de Tavira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Pedras d’El Rei to Praia do Barril walking route",
      "description": "A signed pedestrian route across the Ria Formosa access area towards Praia do Barril, with observation points and wetland scenery noted in Tavira municipal nature-tourism material.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha de Tavira shoreline walk",
      "description": "A long sandy shoreline walk along Ilha de Tavira, best planned according to tide, heat, wind and return access arrangements.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check tourist-train operation before travelling, especially outside peak summer.",
    "Arrive early in July and August to reduce waiting times and avoid the busiest service areas.",
    "Walk the route at least one way if conditions are comfortable, as the Ria Formosa approach is part of the experience.",
    "Use authorised paths and boardwalks to protect the dunes.",
    "Allow time to see the anchor cemetery before or after the beach.",
    "Carry water and sun protection, particularly if walking from Pedras d’El Rei.",
    "Confirm assisted bathing and accessibility support before travelling if needed."
  ],
  "photography_notes": "Praia do Barril is especially strong for photography around the anchor cemetery, dune landscape and old tuna-fishing buildings. Early morning or late afternoon gives softer light and fewer people around the main landmark.",
  "family_notes": "Praia do Barril can suit families because of its wide sand, verified services and tourist-train access. Families should still plan around heat, summer queues, train operation, water conditions and the need to keep children on authorised dune paths.",
  "safety_notes": "Sea and wind conditions can vary. Follow local flags, signage and instructions from beach surveillance where present. The Ria Formosa and dune systems are sensitive environments, so visitors should avoid unauthorised paths and protect dune vegetation.",
  "accessibility_notes": "Tavira municipality lists Praia do Barril as adapted for people with reduced mobility, with reserved parking near Pedras d’El Rei, adapted tourist-train places, ramp access to services, adapted WC facilities and seasonal amphibious-chair support. Visitors should confirm current operation and assistance before travelling.",
  "seo": {
    "meta_title": "Praia do Barril, Tavira | Algarve Beach Guide",
    "meta_description": "Praia do Barril in Tavira is an island beach known for its anchor cemetery, Ria Formosa access, tourist train and Blue Flag status.",
    "keywords": [
      "Praia do Barril",
      "Praia do Barril Tavira",
      "Barril Beach",
      "Tavira beaches",
      "Ilha de Tavira",
      "Algarve beaches",
      "Portugal beaches",
      "anchor cemetery Tavira",
      "Cemitério das Âncoras",
      "Ria Formosa beaches",
      "Pedras d'El Rei",
      "Santa Luzia beach",
      "accessible beach Tavira"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Barril trip ideas",
      "links": [
        { "label": "Praia do Barril" },
        { "label": "Barril Beach" },
        { "label": "anchor cemetery Tavira" },
        { "label": "Cemitério das Âncoras" },
        { "label": "Ria Formosa beaches" },
        { "label": "accessible beach Tavira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Pedras d’El Rei" },
        { "label": "Santa Luzia" },
        { "label": "Ria Formosa Natural Park" },
        { "label": "Praia da Terra Estreita" },
        { "label": "Tavira Historic Centre" },
        { "label": "Ilha de Tavira" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "Câmara Municipal de Tavira - Praia do Barril / Praia Acessível",
      "source_url": "https://cm-tavira.pt/site/descobrir/praias/praia-do-barril-praia-acessivel/",
      "facts_verified": [
        "Beach name",
        "Location on Ilha de Tavira",
        "Fine white sand and natural setting",
        "Anchor cemetery",
        "Former tuna-fishing complex",
        "Access from Santa Luzia via pedestrian bridge near Pedras d’El Rei",
        "Walking or tourist-train route of around 1 km",
        "Coordinates",
        "Parking, restaurants, bars, medical post and WC",
        "Beach surveillance",
        "Concessioned beach area",
        "Blue Flag, Gold Quality and Accessible Beach references",
        "Maritime-tourism activities",
        "Adapted beach support including reserved parking, adapted tourist train, ramps, adapted WC and amphibious chair",
        "Dune protection guidance"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Barril",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-barril",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Ria Formosa - Tavira location",
        "Integration in the Ria Formosa Natural Park",
        "Large sandy beach",
        "Access by floating bridge and tourist train from near Pedras d’El Rei",
        "Summer boat-access reference",
        "Nearby naturist area approximately 1.5 km from the train terminal",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Barril",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/barril/",
      "facts_verified": [
        "Official Barril beach entry",
        "Coastal beach classification",
        "Municipality of Tavira",
        "Coordinates",
        "Beach code PTCN3D",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Barril listed among Tavira's 2026 Blue Flag locations",
        "Tavira listed with four 2026 awarded locations: Barril, Cabanas-Mar, Ilha de Tavira-Mar and Terra Estreita"
      ]
    },
    {
      "source_name": "Câmara Municipal de Tavira - Nature Tourism Guide",
      "source_url": "https://cm-tavira.pt/site/wp-content/uploads/2021/08/Roteiro-Turistico-Natureza_PT-ENG_low.pdf",
      "facts_verified": [
        "Barril located roughly in the middle of Ilha de Tavira",
        "Pedestrian route with observation stations on the access to the beach",
        "Ria Formosa environmental richness",
        "Former tuna-fishing equipment adapted for tourism use",
        "Original houses, fishing objects and large anchors arranged near the beach"
      ]
    },
    {
      "source_name": "Câmara Municipal de Tavira - Discovering Tavira Guide",
      "source_url": "https://cm-tavira.pt/site/wp-content/uploads/2022/05/roteiro-percursos-tavira-en.pdf",
      "facts_verified": [
        "Barril access on foot or by mini-train",
        "Anchor cemetery",
        "Old tuna trap dating from 1842",
        "Conversion of historic structures into a shopping/service area"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural da Ria Formosa",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-da-ria-formosa",
      "facts_verified": [
        "Ria Formosa protected natural-park context",
        "Channels, islands, marshes and sandbanks",
        "Wider environmental setting for Tavira barrier-island beaches"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Tavira municipality, Ilha de Tavira location, access, anchor cemetery, former tuna-fishing heritage, facilities and accessibility support were verified from official municipal, tourism and ABAAE sources.",
    "ABAAE verifies Barril's 2026 bathing season and Blue Flag season as 1 June 2026 to 30 September 2026.",
    "Coordinates are taken from official ABAAE and municipal sources.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on bathing season, concession activity or tourist-train operation.",
    "Accessibility is verified by Tavira municipality, but seasonal assistance, adapted train availability and assisted sea access should be confirmed before visiting.",
    "The nearby naturist area mentioned by VisitPortugal is not presented as part of the main beach facilities and should be handled separately if needed.",
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
  where slug = 'santa-luzia'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city santa-luzia was not found';
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
      'https://cm-tavira.pt/site/descobrir/praias/praia-do-barril-praia-acessivel/',
      'Praia do Barril, Santa Luzia, Tavira, Algarve, Portugal',
      37.08613,
      -7.66215,
      array[
        'Praia do Barril',
        'Praia do Barril Tavira',
        'Barril Beach',
        'Tavira beaches',
        'Ilha de Tavira',
        'Algarve beaches',
        'Portugal beaches',
        'anchor cemetery Tavira',
        'Cemitério das Âncoras',
        'Ria Formosa beaches',
        'Pedras d''El Rei',
        'Santa Luzia beach',
        'accessible beach Tavira'
      ],
      v_category_data,
      'Praia do Barril, Tavira | Algarve Beach Guide',
      'Praia do Barril in Tavira is an island beach known for its anchor cemetery, Ria Formosa access, tourist train and Blue Flag status.',
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
      website_url = 'https://cm-tavira.pt/site/descobrir/praias/praia-do-barril-praia-acessivel/',
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
      address = 'Praia do Barril, Santa Luzia, Tavira, Algarve, Portugal',
      latitude = 37.08613,
      longitude = -7.66215,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia do Barril',
        'Praia do Barril Tavira',
        'Barril Beach',
        'Tavira beaches',
        'Ilha de Tavira',
        'Algarve beaches',
        'Portugal beaches',
        'anchor cemetery Tavira',
        'Cemitério das Âncoras',
        'Ria Formosa beaches',
        'Pedras d''El Rei',
        'Santa Luzia beach',
        'accessible beach Tavira'
      ],
      category_data = v_category_data,
      meta_title = 'Praia do Barril, Tavira | Algarve Beach Guide',
      meta_description = 'Praia do Barril in Tavira is an island beach known for its anchor cemetery, Ria Formosa access, tourist train and Blue Flag status.',
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
