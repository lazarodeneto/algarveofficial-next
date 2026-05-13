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
  'Tavira',
  'tavira',
  'Historic eastern Algarve city with Ria Formosa island beaches, river scenery and boat access to Ilha de Tavira.',
  37.125,
  -7.648,
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
  v_slug text := 'praia-da-ilha-de-tavira';
  v_name text := 'Praia da Ilha de Tavira';
  v_short_description text := $short$
Praia da Ilha de Tavira is a major Ria Formosa island beach in Tavira, set on an extensive sandy barrier island facing the Atlantic. Reached by boat from Tavira, Quatro Águas or aquatáxi, it is one of the municipality's most emblematic beach destinations.
$short$;
  v_description text := $description$
Praia da Ilha de Tavira is one of the defining beach experiences of the eastern Algarve, located at the eastern end of Ilha de Tavira, close to Barra do Cochico and directly opposite the city of Tavira. Set within the wider Ria Formosa landscape, it combines a long sandy Atlantic-facing shore with the protected lagoon, saltmarsh and saltpan scenery that gives this part of the Algarve its distinctive character.

Access is part of the experience. Official municipal information lists access from Tavira, from the Quatro Águas quay and by aquatáxi, meaning visitors should plan around boat schedules, seasonal demand and return times. The journey towards Quatro Águas also passes through a strong local landscape of the River Gilão, traditional fishing activity and saltpans used by wading birds.

Unlike smaller coves or road-access beaches, Ilha de Tavira feels spacious and open, yet it is also one of Tavira's best-equipped beach areas. Official sources verify restaurants and bars, first aid, WC, ATM, camping facilities, a recreation area, concessioned areas and maritime-tourism activities. These services may vary by season.

Because it is a major island beach with Blue Flag recognition, extensive sand and boat access from the city, it can become busy in summer, especially near the landing points and serviced zones. Visitors should respect dune-protection signage, avoid walking outside authorised paths and follow local beach flags and safety guidance.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Ilha de Tavira",
  "slug": "praia-da-ilha-de-tavira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Tavira",
  "concelho": "Tavira",
  "municipality": "Tavira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Ilha de Tavira is a major Ria Formosa island beach in Tavira, set on an extensive sandy barrier island facing the Atlantic. Reached by boat from Tavira, Quatro Águas or aquatáxi, it is one of the municipality's most emblematic beach destinations.",
  "full_description": "Praia da Ilha de Tavira is one of the defining beach experiences of the eastern Algarve, located at the eastern end of Ilha de Tavira, close to Barra do Cochico and directly opposite the city of Tavira. Set within the wider Ria Formosa landscape, it combines a long sandy Atlantic-facing shore with the protected lagoon, saltmarsh and saltpan scenery that gives this part of the Algarve its distinctive character.\n\nAccess is part of the experience. Official municipal information lists access from Tavira, from the Quatro Águas quay and by aquatáxi, meaning visitors should plan around boat schedules, seasonal demand and return times. The journey towards Quatro Águas also passes through a strong local landscape of the River Gilão, traditional fishing activity and saltpans used by wading birds.\n\nUnlike smaller coves or road-access beaches, Ilha de Tavira feels spacious and open, yet it is also one of Tavira's best-equipped beach areas. Official sources verify restaurants and bars, first aid, WC, ATM, camping facilities, a recreation area, concessioned areas and maritime-tourism activities. These services may vary by season.\n\nBecause it is a major island beach with Blue Flag recognition, extensive sand and boat access from the city, it can become busy in summer, especially near the landing points and serviced zones. Visitors should respect dune-protection signage, avoid walking outside authorised paths and follow local beach flags and safety guidance.",
  "coordinates": {
    "latitude": 37.111478,
    "longitude": -7.619766,
    "label": "Praia da Ilha de Tavira / Ilha de Tavira-Mar",
    "notes": "Coordinates were verified from Câmara Municipal de Tavira beach information."
  },
  "beach_type": "Long sandy barrier-island beach",
  "landscape": "An extensive sandy beach on Ilha de Tavira, with Atlantic shoreline on one side and the Ria Formosa lagoon, saltpans, channels and dunes nearby.",
  "access": "Access is by boat from Tavira, from the Quatro Águas quay, or by aquatáxi. Visitors should confirm current boat schedules, seasonal frequency and return times before travelling.",
  "highlights": [
    "Major Ria Formosa island beach in Tavira",
    "Extensive sandy beach facing the Atlantic Ocean",
    "Access by boat from Tavira, Quatro Águas or aquatáxi",
    "Located at the eastern end of Ilha de Tavira, opposite the city",
    "Restaurants, bars, WC, first aid and concessioned services verified by the municipality",
    "Official 2026 Blue Flag listing for Ilha de Tavira-Mar"
  ],
  "best_for": [
    "Island beach days",
    "Families",
    "Long beach walks",
    "Ria Formosa scenery",
    "Nature lovers",
    "Birdwatching nearby",
    "Boat-access beaches",
    "Tavira city visitors",
    "Summer beach days"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Ilha de Tavira-Mar", "status": "Seasonal" },
    { "name": "Beach surveillance", "status": "Seasonal" },
    { "name": "Concessioned beach area", "status": "Verified" },
    { "name": "Restaurants and bars", "status": "Verified / Seasonal" },
    { "name": "First-aid post", "status": "Verified / Seasonal" },
    { "name": "WC", "status": "Verified / Seasonal" },
    { "name": "ATM", "status": "Verified" },
    { "name": "Camping facilities", "status": "Verified / Seasonal" },
    { "name": "Recreation area", "status": "Verified" },
    { "name": "Maritime-tourism activities", "status": "Seasonal" },
    { "name": "Parking in Tavira city or Quatro Águas", "status": "Verified" },
    { "name": "Adapted access for people with reduced mobility", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing for Ilha de Tavira-Mar",
    "Seasonal beach surveillance",
    "Concessioned beach area",
    "Seasonal restaurants and bars",
    "First-aid post",
    "WC",
    "ATM",
    "Camping facilities",
    "Recreation area",
    "Seasonal maritime-tourism activities"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season, Blue Flag period and full summer services. May, June and September are often more comfortable for long walks, Ria Formosa scenery and slightly calmer visits.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Ilha de Tavira-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Ilha de Tavira-Mar as 1 June 2026 to 30 September 2026.\nAccess depends on boat services, so visitors should confirm current departures and return times before travelling.\nThe municipality states that the beach is not adapted for people with reduced mobility.\nParking is available in Tavira city or at Quatro Águas, with both free and paid options listed by the municipality.\nThe beach sits in a sensitive Ria Formosa dune and lagoon environment; visitors should use authorised paths and avoid walking on dunes.\nFacilities and maritime-tourism activities may be seasonal.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Ilha de Tavira-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Ilha de Tavira-Mar as 1 June 2026 to 30 September 2026.",
      "Access depends on boat services, so visitors should confirm current departures and return times before travelling.",
      "The municipality states that the beach is not adapted for people with reduced mobility.",
      "Parking is available in Tavira city or at Quatro Águas, with both free and paid options listed by the municipality.",
      "The beach sits in a sensitive Ria Formosa dune and lagoon environment; visitors should use authorised paths and avoid walking on dunes.",
      "Facilities and maritime-tourism activities may be seasonal.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Ilha de Tavira-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Ilha de Tavira-Mar as 1 June 2026 to 30 September 2026.\nAccess depends on boat services, so visitors should confirm current departures and return times before travelling.\nThe municipality states that the beach is not adapted for people with reduced mobility.\nParking is available in Tavira city or at Quatro Águas, with both free and paid options listed by the municipality.\nThe beach sits in a sensitive Ria Formosa dune and lagoon environment; visitors should use authorised paths and avoid walking on dunes.\nFacilities and maritime-tourism activities may be seasonal.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season, Blue Flag period and full summer services. May, June and September are often more comfortable for long walks, Ria Formosa scenery and slightly calmer visits.",
  "suitable_for": [
    "Visitors staying in Tavira",
    "Families planning a full beach day",
    "Visitors who enjoy boat-access beaches",
    "Beach walkers",
    "Nature-focused travellers",
    "Visitors interested in the Ria Formosa landscape",
    "Travellers wanting an island beach with services"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free or fully adapted beach access",
    "Visitors who prefer road-access beaches",
    "Visitors who do not want to depend on ferry or aquatáxi schedules",
    "Those seeking a remote beach without services or summer footfall",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon system of channels, islands, marshes and sandbanks extending along the Algarve coast, forming the natural setting around Tavira's island beaches.",
      "verification_status": "Verified"
    },
    {
      "name": "Quatro Águas",
      "type": "Boat departure area",
      "description": "A key access point for boat services to Ilha de Tavira, set among saltpans, lagoon channels and fishing activity east of Tavira.",
      "verification_status": "Verified"
    },
    {
      "name": "Tavira Historic Centre",
      "type": "Historic town centre",
      "description": "A charming Algarve town centre with the River Gilão, castle, churches, historic streets and ferry access towards the island beach.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Barril",
      "type": "Nearby island beach",
      "description": "Another beach on Ilha de Tavira, known for its island setting and distinctive local heritage, located further west along the same barrier island.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Terra Estreita",
      "type": "Nearby island beach",
      "description": "A neighbouring Tavira island beach connected with Santa Luzia and the Ria Formosa barrier-island system.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Tavira",
    "Santa Luzia",
    "Cabanas de Tavira",
    "Luz de Tavira",
    "Conceição de Tavira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Ilha de Tavira shoreline walk",
      "description": "A long sandy beach walk along the island shoreline, best planned according to tide, weather, heat and boat return times.",
      "verification_status": "Verified"
    },
    {
      "name": "Tavira to Quatro Águas approach",
      "description": "A scenic route towards the Quatro Águas quay, passing the River Gilão, fishing activity and saltpan landscapes noted by the municipality.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check ferry or aquatáxi schedules before setting out, especially outside peak season.",
    "Arrive early in July and August to reduce waiting times and secure easier access to serviced beach areas.",
    "Use authorised paths and boardwalks where available to protect dunes.",
    "Carry water, sun protection and anything needed for the return boat journey.",
    "Stay aware of the last return service from the island.",
    "For a fuller Tavira day, combine the beach with the historic centre or Quatro Águas."
  ],
  "photography_notes": "Praia da Ilha de Tavira is best photographed for its long open sand, island light, dune landscape and Ria Formosa approach. Early morning and late afternoon usually offer softer light and a quieter atmosphere.",
  "family_notes": "The beach can suit families because of its wide sand and verified services, but families should plan around boat access, summer queues, heat, shade and return times. Children should be supervised near the water and around busy landing areas.",
  "safety_notes": "The beach has municipal information listing surveillance, but this may depend on the bathing season. Sea and wind conditions can vary, so visitors should follow flags, signage and instructions from beach staff where present. Dunes should not be crossed outside authorised routes.",
  "accessibility_notes": "The municipality states that Praia da Ilha de Tavira is not adapted for people with reduced mobility. Visitors with accessibility needs should confirm current access conditions, boat boarding arrangements and beach support before travelling.",
  "seo": {
    "meta_title": "Praia da Ilha de Tavira | Algarve Beach Guide",
    "meta_description": "Praia da Ilha de Tavira is a major Ria Formosa island beach with long sand, boat access, Blue Flag status and Tavira city connections.",
    "keywords": [
      "Praia da Ilha de Tavira",
      "Ilha de Tavira beach",
      "Tavira beaches",
      "Ria Formosa beaches",
      "Algarve island beach",
      "Portugal beaches",
      "Ilha de Tavira-Mar",
      "Quatro Águas Tavira",
      "boat access beach Algarve",
      "Tavira Blue Flag beach"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Ilha de Tavira trip ideas",
      "links": [
        { "label": "Praia da Ilha de Tavira" },
        { "label": "Ilha de Tavira beach" },
        { "label": "Ria Formosa beaches" },
        { "label": "Algarve island beach" },
        { "label": "Ilha de Tavira-Mar" },
        { "label": "boat access beach Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Ria Formosa Natural Park" },
        { "label": "Quatro Águas" },
        { "label": "Tavira Historic Centre" },
        { "label": "Praia do Barril" },
        { "label": "Praia da Terra Estreita" },
        { "label": "Santa Luzia" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "Câmara Municipal de Tavira - Praia da Ilha de Tavira",
      "source_url": "https://cm-tavira.pt/site/descobrir/praias/praia-da-ilha-de-tavira/",
      "facts_verified": [
        "Beach name",
        "Location at the eastern end of Ilha de Tavira",
        "Position near Barra do Cochico and opposite Tavira",
        "Access from Tavira, Quatro Águas and aquatáxi",
        "Coordinates",
        "Parking in Tavira city and Quatro Águas",
        "Restaurants and bars",
        "First aid, WC, ATM, campsite, recreation area and public phone",
        "Beach surveillance",
        "Concessioned beach area",
        "Blue Flag and quality references",
        "Not adapted for people with reduced mobility",
        "Dune protection guidance"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Ilha de Tavira-Mar",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-ilha-de-tavira-mar",
      "facts_verified": [
        "Official beach name Ilha de Tavira-Mar",
        "Ria Formosa - Tavira location",
        "Large sandy beach setting",
        "Boat access from Tavira",
        "Beach positioned on the eastern tip of a large sandy area"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Ilha de Tavira-Mar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/ilha-de-tavira-mar/",
      "facts_verified": [
        "Official Ilha de Tavira-Mar beach entry",
        "Municipality of Tavira",
        "Beach code PTCF3M",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Ilha de Tavira-Mar listed among Tavira's 2026 Blue Flag locations",
        "Tavira listed with four awarded 2026 locations: Barril, Cabanas-Mar, Ilha de Tavira-Mar and Terra Estreita"
      ]
    },
    {
      "source_name": "Visit Algarve - Ilha de Tavira",
      "source_url": "https://visitalgarve.pt/equipamento/7619/ilha-de-tavira",
      "facts_verified": [
        "Regional tourism listing for Ilha de Tavira",
        "Humanised beach section context",
        "Summer houses, camping and tourist equipment context",
        "Restaurants and support equipment context"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural da Ria Formosa",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-da-ria-formosa",
      "facts_verified": [
        "Ria Formosa as a protected wetland landscape",
        "Channels, islands, marshes and sandbanks",
        "Approximate 60 km extent along the Algarve coast",
        "Ilha de Tavira as part of the Ria Formosa island sequence"
      ]
    },
    {
      "source_name": "VisitPortugal - Um passeio por Tavira",
      "source_url": "https://www.visitportugal.com/pt-pt/destinos/algarve/73804",
      "facts_verified": [
        "Tavira town visitor context",
        "Castle viewpoint and historic streets",
        "Recommendation to walk beside the sea on the long sandy beach of Ilha de Tavira",
        "Nearby Praia do Barril anchor cemetery reference"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, island location, boat access, facilities, coordinates, Blue Flag 2026 status and accessibility limitation were verified from official municipal, tourism and ABAAE sources.",
    "The phrase major Ria Formosa island beach is supported by its official municipal description as one of Tavira's most emblematic destinations, its service level, boat access and 2026 Blue Flag listing.",
    "ABAAE verifies Ilha de Tavira-Mar's 2026 bathing season and Blue Flag season as 1 June 2026 to 30 September 2026.",
    "Facilities are included only where listed by the municipality or official tourism sources and marked Seasonal where operation may depend on bathing season, concession activity or island service schedules.",
    "Accessibility is not marked as adapted because the municipality states that the beach is not adapted to people with reduced mobility.",
    "Parking is verified only for Tavira city and Quatro Águas, not on the island itself.",
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
  where slug = 'tavira'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city tavira was not found';
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
      'https://cm-tavira.pt/site/descobrir/praias/praia-da-ilha-de-tavira/',
      'Praia da Ilha de Tavira, Tavira, Algarve, Portugal',
      37.111478,
      -7.619766,
      array[
        'Praia da Ilha de Tavira',
        'Ilha de Tavira beach',
        'Tavira beaches',
        'Ria Formosa beaches',
        'Algarve island beach',
        'Portugal beaches',
        'Ilha de Tavira-Mar',
        'Quatro Águas Tavira',
        'boat access beach Algarve',
        'Tavira Blue Flag beach'
      ],
      v_category_data,
      'Praia da Ilha de Tavira | Algarve Beach Guide',
      'Praia da Ilha de Tavira is a major Ria Formosa island beach with long sand, boat access, Blue Flag status and Tavira city connections.',
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
      website_url = 'https://cm-tavira.pt/site/descobrir/praias/praia-da-ilha-de-tavira/',
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
      address = 'Praia da Ilha de Tavira, Tavira, Algarve, Portugal',
      latitude = 37.111478,
      longitude = -7.619766,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Ilha de Tavira',
        'Ilha de Tavira beach',
        'Tavira beaches',
        'Ria Formosa beaches',
        'Algarve island beach',
        'Portugal beaches',
        'Ilha de Tavira-Mar',
        'Quatro Águas Tavira',
        'boat access beach Algarve',
        'Tavira Blue Flag beach'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Ilha de Tavira | Algarve Beach Guide',
      meta_description = 'Praia da Ilha de Tavira is a major Ria Formosa island beach with long sand, boat access, Blue Flag status and Tavira city connections.',
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
