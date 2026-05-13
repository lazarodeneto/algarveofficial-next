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
  'Faro',
  'faro',
  'Algarve capital city with historic centre access, Ria Formosa boat departures and nearby island beaches.',
  37.0194,
  -7.9322,
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
  v_slug text := 'praia-da-culatra-faro';
  v_name text := 'Praia da Culatra';
  v_address text := 'Praia da Culatra, Ilha da Culatra, Faro, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-culatra';
  v_latitude numeric := 36.985894;
  v_longitude numeric := -7.843595;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Culatra",
  "slug": "praia-da-culatra-faro",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Ilha da Culatra / Olhão access",
  "concelho": "Faro",
  "municipality": "Faro",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Culatra is an important barrier-island beach in Faro, reached by boat from Olhão and set within the Ria Formosa Natural Park. Known for its fishing community, spacious sand and island atmosphere, it is one of the eastern Algarve’s most distinctive beach escapes.",
  "full_description": "Praia da Culatra is one of the key barrier-island beaches of the Ria Formosa, officially located in Faro but most commonly accessed by boat from Olhão. The beach sits on Ilha da Culatra, one of the sandy islands that separate the Atlantic Ocean from the protected lagoon, giving visitors a strong sense of crossing from the mainland into a quieter maritime landscape.\n\nVisitPortugal describes Culatra as part of the Ria Formosa Natural Park and notes that the island is accessible only by boat from Olhão, with no motorised vehicles on the island. This creates a slower, more pedestrian beach experience, where visitors walk between the ferry landing, the fishing settlement, boardwalks, dunes and the Atlantic-facing beach.\n\nCulatra is not just a beach destination; it is also an active island community with deep fishing roots. Official tourism sources describe it as an old fishing settlement, with restaurants associated with local seafood dishes. This community identity makes the beach different from purely seasonal island beaches and should be respected by visitors.\n\nABAAE lists Culatra-Mar as a 2026 Blue Flag coastal beach in Faro, with a bathing season from 1 June to 30 September 2026 and Blue Flag season from 19 June to 30 September 2026. Services and surveillance should still be treated as seasonal, and visitors should confirm boat times before travelling.",
  "coordinates": {
    "latitude": 36.985894,
    "longitude": -7.843595,
    "label": "Praia da Culatra - Culatra-Mar",
    "notes": "Primary listing coordinates use the official Culatra-Mar beach entry.",
    "bathing_areas": [
      {
        "name": "Culatra-Mar",
        "latitude": 36.985894,
        "longitude": -7.843595,
        "type": "Atlantic island beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Long sandy barrier-island beach",
  "landscape": "A sandy Atlantic-facing beach on Ilha da Culatra, backed by dunes, Ria Formosa lagoon scenery and a traditional fishing community.",
  "access": "Access is by boat from Olhão according to VisitPortugal. Visitors should confirm ferry or boat schedules, return times and seasonal frequency before travelling.",
  "highlights": [
    "Important Ria Formosa barrier-island beach",
    "Officially listed as Culatra-Mar in Faro",
    "Boat access from Olhão verified by VisitPortugal",
    "Traditional fishing community on Ilha da Culatra",
    "Spacious Atlantic-facing sandy beach with dune scenery",
    "Official 2026 Blue Flag listing for Culatra-Mar"
  ],
  "best_for": [
    "Island beach days",
    "Ria Formosa scenery",
    "Fishing-community atmosphere",
    "Long beach walks",
    "Nature lovers",
    "Couples",
    "Families planning a full island day",
    "Photography",
    "Diving when conditions are suitable"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Culatra-Mar", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurfing activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Motorised vehicle access on the island", "status": "Not verified / VisitPortugal states there are no motorised vehicles" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listing for Culatra-Mar",
    "Seasonal beach surveillance",
    "Bar and restaurant",
    "Windsurfing activity",
    "Diving activity",
    "Boat access from Olhão",
    "Fishing-community setting",
    "Ria Formosa Natural Park context"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach atmosphere. May, June and September are often better for quieter walks, photography and Ria Formosa scenery with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Culatra-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Culatra-Mar as 19 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nThe beach is officially in the municipality of Faro, while VisitPortugal verifies boat access from Olhão.\nAccess depends on boat services, so visitors should confirm schedules and last return times before travelling.\nThe island is part of the Ria Formosa Natural Park; visitors should respect dunes, lagoon habitats and marked paths.\nCulatra is an inhabited fishing community, not only a visitor beach area; local residents, working boats and community spaces should be respected.\nFacilities and surveillance may vary by season.\nSea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Culatra-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Culatra-Mar as 19 June 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "The beach is officially in the municipality of Faro, while VisitPortugal verifies boat access from Olhão.",
      "Access depends on boat services, so visitors should confirm schedules and last return times before travelling.",
      "The island is part of the Ria Formosa Natural Park; visitors should respect dunes, lagoon habitats and marked paths.",
      "Culatra is an inhabited fishing community, not only a visitor beach area; local residents, working boats and community spaces should be respected.",
      "Facilities and surveillance may vary by season.",
      "Sea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Culatra-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Culatra-Mar as 19 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nThe beach is officially in the municipality of Faro, while VisitPortugal verifies boat access from Olhão.\nAccess depends on boat services, so visitors should confirm schedules and last return times before travelling.\nThe island is part of the Ria Formosa Natural Park; visitors should respect dunes, lagoon habitats and marked paths.\nCulatra is an inhabited fishing community, not only a visitor beach area; local residents, working boats and community spaces should be respected.\nFacilities and surveillance may vary by season.\nSea, wind and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full beach atmosphere. May, June and September are often better for quieter walks, photography and Ria Formosa scenery with less peak-summer pressure.",
  "suitable_for": [
    "Visitors staying in Olhão or Faro",
    "Travellers who enjoy boat-access beaches",
    "Families planning a full island day",
    "Beach walkers",
    "Nature-focused visitors",
    "Visitors interested in Ria Formosa communities",
    "Photographers",
    "Couples seeking a quieter island setting"
  ],
  "not_suitable_for": [
    "Visitors who need direct road access to the beach",
    "Visitors who do not want to depend on boat schedules",
    "Visitors requiring fully verified accessible-beach support",
    "Those expecting a mainland resort beach with extensive facilities",
    "Visitors not prepared to walk between the boat landing, settlement and beach"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon system of islands, channels, saltmarshes and sandbanks extending along the Algarve coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Culatra fishing community",
      "type": "Island community",
      "description": "A traditional fishing settlement on Ilha da Culatra, with local restaurants and a strong maritime identity.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha do Farol-Mar",
      "type": "Nearby island beach",
      "description": "A nearby Faro beach area on the western side of Ilha da Culatra, listed by ABAAE among Faro’s 2026 Blue Flag locations.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha da Barreta",
      "type": "Nearby barrier-island beach",
      "description": "A nearby Ria Formosa barrier-island beach in Faro, also listed among Faro’s 2026 Blue Flag locations.",
      "verification_status": "Verified"
    },
    {
      "name": "Olhão waterfront",
      "type": "Town waterfront and boat departure area",
      "description": "The main verified mainland access point for boats to Culatra according to VisitPortugal.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Olhão",
    "Faro",
    "Ilha do Farol",
    "Fuseta",
    "Quelfes"
  ],
  "walking_trails_nearby": [
    {
      "name": "Ilha da Culatra Trail",
      "description": "Visit Algarve lists an Ilha da Culatra walking trail as a linear route of 5.6 km return, with an average duration of around two hours.",
      "verification_status": "Verified"
    },
    {
      "name": "Culatra settlement to Atlantic beach walk",
      "description": "A practical island walk between the boat landing, fishing settlement, dune area and Atlantic-facing beach. Visitors should follow marked paths and avoid protected dunes.",
      "verification_status": "Verified"
    },
    {
      "name": "Culatra shoreline walk",
      "description": "A long beach walk along the Atlantic-facing sand, best planned according to tide, heat, wind and boat return times.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check ferry or boat schedules before travelling, especially outside the main summer season.",
    "Allow time to walk from the boat landing through the settlement and dune area to the beach.",
    "Carry water, sun protection and essentials, as services may be seasonal or limited away from the settlement.",
    "Respect local homes, fishing activity and community spaces.",
    "Use marked paths and boardwalks where available to protect dunes and lagoon habitats.",
    "Plan the last return boat before settling in for a long beach day.",
    "Choose early morning or late afternoon for softer light and a calmer island atmosphere."
  ],
  "photography_notes": "Praia da Culatra is best photographed for its Ria Formosa crossing, fishing-community details, dune paths, long sandy beach and low island light. Visitors should avoid entering private community areas or walking across protected dunes for photographs.",
  "family_notes": "Culatra can suit families who enjoy boat-access beaches and a slower island day. Families should plan carefully around boat times, walking distances, sun exposure, tides and seasonal surveillance.",
  "safety_notes": "Sea, wind and tide conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take extra care around boat traffic, tidal channels and dune areas.",
  "accessibility_notes": "Accessible beach support was not verified from authoritative current sources. Because access requires boat travel and walking on the island, visitors with reduced mobility should confirm boat boarding, pathways, beach-entry conditions and any seasonal assistance before visiting.",
  "seo": {
    "meta_title": "Praia da Culatra, Faro | Algarve Island Beach Guide",
    "meta_description": "Praia da Culatra is a Faro barrier-island beach reached from Olhão, with fishing-community character, Ria Formosa scenery and Blue Flag status.",
    "keywords": [
      "Praia da Culatra",
      "Ilha da Culatra",
      "Culatra-Mar",
      "Faro beaches",
      "Olhão beach access",
      "Ria Formosa beaches",
      "Algarve island beach",
      "Portugal beaches",
      "Blue Flag Culatra",
      "barrier island Algarve",
      "fishing community Algarve",
      "boat access beach Algarve"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Ilha da Culatra",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-culatra",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Ria Formosa - Faro",
        "Integration in the Ria Formosa Natural Park",
        "Barrier-island setting separating the sea from the Ria",
        "Boat access from Olhão",
        "No motorised vehicles on the island",
        "Spacious sandy beach",
        "Clear water and diving visibility reference",
        "Old fishing settlement",
        "Restaurants and local seafood dishes",
        "Blue Flag, surveillance, bar and restaurant references",
        "Windsurf and diving references"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Culatra-Mar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/culatra-mar/",
      "facts_verified": [
        "Official Culatra-Mar beach entry",
        "Coastal beach classification",
        "Municipality of Faro",
        "Coordinates",
        "Beach code PTCD2V",
        "Address as Ilha Culatra - Núcleo da Culatra",
        "Blue Flag status page checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Algarve page 8 / Culatra-Mar",
      "source_url": "https://bandeiraazul.abaae.pt/regiao/algarve/page/8/",
      "facts_verified": [
        "Culatra-Mar listed as a 2026 Blue Flag beach",
        "2026 bathing season from 1 June 2026 to 30 September 2026",
        "2026 Blue Flag season from 19 June 2026 to 30 September 2026",
        "Coordinates and Faro municipality cross-checked"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Culatra-Mar listed among 2026 awarded coastal beaches",
        "Faro municipality and coordinates cross-checked",
        "Nearby Faro 2026 Blue Flag beach context including Ilha do Farol-Mar and Barreta"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural da Ria Formosa",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-da-ria-formosa",
      "facts_verified": [
        "Ria Formosa as an internationally important wetland",
        "Landscape of channels, islands, saltmarshes and sandbanks",
        "Approximate 60 km extent along the Algarve coast",
        "Ilha da Culatra included among the Ria Formosa island sequence",
        "Traditional fishing, salt and shellfish activities in the Ria Formosa",
        "Island beaches described as long sandy beaches"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Culatra",
      "source_url": "https://visitalgarve.pt/equipamento/8732/Praia%20da%20Culatra",
      "facts_verified": [
        "Regional tourism listing for Praia da Culatra",
        "Beach located on the eastern end of Ilha da Culatra",
        "Association with an old fishing settlement, based on official search-result summary",
        "Ria Formosa barrier-island context"
      ]
    },
    {
      "source_name": "Visit Algarve - Ilha da Culatra Trail",
      "source_url": "https://visitalgarve.pt/en/3597/ilha-da-culatra-trail",
      "facts_verified": [
        "Ilha da Culatra walking trail",
        "Linear trail",
        "5.6 km return distance",
        "Average duration of around two hours"
      ]
    },
    {
      "source_name": "Visit Faro - Ilha da Culatra",
      "source_url": "https://faro.pt/69045/ilha-da-culatra",
      "facts_verified": [
        "Municipal tourism page for Ilha da Culatra located",
        "Official search-result summary describing Culatra as one of the barrier islands delimiting the Ria Formosa to the south"
      ]
    },
    {
      "source_name": "Câmara Municipal de Faro - Praia da Ilha da Culatra",
      "source_url": "https://www.cm-faro.pt/pt/1535/praia-da-ilha-da-culatra.aspx",
      "facts_verified": [
        "Municipal beach page located",
        "Official search-result summary describing Praia da Ilha da Culatra as a fishing-culture place inhabited mainly by fishermen and families"
      ]
    },
    {
      "source_name": "Câmara Municipal de Faro - Barcos para as ilhas",
      "source_url": "https://www.cm-faro.pt/421/barcos-para-as-ilhas.aspx",
      "facts_verified": [
        "Official municipal page for island boat services located",
        "Official search-result summary confirming regular maritime connections from Faro to island beaches, but detailed current Culatra timetable was not fully verified"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, barrier-island setting, Ria Formosa Natural Park context, boat access from Olhão, fishing-community character, coordinates and 2026 Blue Flag season were verified from official tourism and ABAAE sources.",
    "Official beach and Blue Flag records place Culatra-Mar in the municipality of Faro. Olhão is retained in the listing as the verified main boat-access point from VisitPortugal.",
    "ABAAE verifies Culatra-Mar’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 19 June 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by VisitPortugal or official Blue Flag sources and marked Seasonal where operation may depend on the bathing season or local services.",
    "Accessible-beach support, toilets, showers and sunshade rental were not verified from authoritative current sources and are marked Not verified.",
    "Detailed current ferry schedules were not verified from an official page during this research; visitors should check boat times before travelling.",
    "Some Faro and Visit Algarve pages returned limited accessible text or fetch errors when opened, so those facts are used cautiously from official search-result summaries and supported by VisitPortugal and ABAAE where possible.",
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
  where slug = 'faro';

  if v_city_id is null then
    raise exception 'Faro city was not found';
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
