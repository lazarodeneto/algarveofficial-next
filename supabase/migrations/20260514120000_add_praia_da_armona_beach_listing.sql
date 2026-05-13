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
  'Olhão',
  'olhao',
  'Ria Formosa waterfront city known for seafood, island boat connections and barrier-island beaches.',
  37.028,
  -7.841,
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
  v_slug text := 'praia-da-armona-olhao';
  v_name text := 'Praia da Armona';
  v_address text := 'Praia da Armona, Ilha da Armona, Olhão, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-armona';
  v_latitude numeric := 37.013793;
  v_longitude numeric := -7.798405;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Armona",
  "slug": "praia-da-armona-olhao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Ilha da Armona / Olhão",
  "concelho": "Olhão",
  "municipality": "Olhão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Armona is an important barrier-island beach in Olhão, set within the Ria Formosa Natural Park and reached by boat from the city. With Atlantic-facing sand, lagoon-side bathing areas and a car-free island setting, it is one of the eastern Algarve’s key island beach escapes.",
  "full_description": "Praia da Armona is one of Olhão’s most important barrier-island beaches, located on Ilha da Armona within the Ria Formosa Natural Park. Official tourism sources describe the island as part of the sandy island chain that separates the Ria Formosa lagoon from the sea, with boat access from Olhão taking around 15 minutes.\n\nThe beach experience has two distinct sides. Armona-Mar faces the Atlantic and forms part of a long sandy shoreline that extends eastwards for kilometres, while Armona-Ria faces the lagoon and offers a gentler Ria Formosa setting close to the island settlement. This dual character makes Armona especially attractive for visitors who want both open-ocean scenery and lagoon-side island atmosphere.\n\nUnlike many mainland resort beaches, Armona is car-free and reached by boat, so planning matters. Visitors should check ferry or maritime transport schedules before travelling, especially outside summer, and allow time to walk from the arrival area to the Atlantic-facing beach. The island has a small fishing settlement, restaurants and a camping area listed by official tourism sources, while VisitPortugal also lists seasonal beach support such as surveillance, showers, bar and restaurant services.\n\nABAAE lists both Armona-Mar and Armona-Ria as 2026 Blue Flag locations in Olhão. The beach is part of a sensitive protected lagoon and dune environment, so visitors should use marked paths, respect habitats and follow local flags, signage and official safety guidance.",
  "coordinates": {
    "latitude": 37.013793,
    "longitude": -7.798405,
    "label": "Praia da Armona - Armona-Mar",
    "notes": "Primary listing coordinates use Armona-Mar. Armona-Ria is preserved as a secondary official bathing area.",
    "bathing_areas": [
      {
        "name": "Armona-Mar",
        "latitude": 37.013793,
        "longitude": -7.798405,
        "type": "Atlantic beach section",
        "verification_status": "Verified"
      },
      {
        "name": "Armona-Ria",
        "latitude": 37.023319,
        "longitude": -7.805357,
        "type": "Lagoon-side bathing area",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Long sandy barrier-island beach with Atlantic and lagoon bathing areas",
  "landscape": "A low sandy barrier island between the Atlantic Ocean and the Ria Formosa lagoon, with dunes, long beaches, tidal channels, lagoon views and a small island settlement.",
  "access": "Access is by boat from Olhão. VisitPortugal describes the crossing as taking around 15 minutes. Visitors should check current ferry or boat schedules, seasonal frequency and return times before travelling.",
  "highlights": [
    "Important Ria Formosa barrier-island beach in Olhão",
    "Boat access from Olhão, with a crossing of around 15 minutes verified by VisitPortugal",
    "Two recognised bathing areas: Armona-Mar and Armona-Ria",
    "Long Atlantic-facing sandy shore extending eastwards along the island system",
    "Car-free island setting with a small fishing settlement",
    "Official 2026 Blue Flag listings for Armona-Mar and Armona-Ria"
  ],
  "best_for": [
    "Island beach days",
    "Families using serviced seasonal sections",
    "Ria Formosa scenery",
    "Long beach walks",
    "Nature lovers",
    "Boat-access beaches",
    "Couples",
    "Photography",
    "Water sports when conditions are suitable"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Armona-Mar", "status": "Seasonal" },
    { "name": "Blue Flag 2026 listing for Armona-Ria", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Camping area on the island", "status": "Verified" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" },
    { "name": "Canoeing", "status": "Seasonal / conditions dependent" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Car parking on the island", "status": "Not verified" },
    { "name": "Accessible beach support", "status": "Not verified" }
  ],
  "includes": [
    "Blue Flag 2026 listings for Armona-Mar and Armona-Ria",
    "Seasonal beach surveillance",
    "Boat access from Olhão",
    "Showers",
    "Bar and restaurant",
    "Camping area",
    "Windsurfing, sailing, canoeing and diving activity",
    "Car-free island setting",
    "Ria Formosa Natural Park"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full island-beach atmosphere. May, June and September are often more comfortable for walking, photography and quieter Ria Formosa visits.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Armona-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Armona-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 bathing season for Armona-Ria as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Armona-Ria as 1 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nAccess depends on boat services from Olhão, so visitors should confirm schedules and return times before travelling.\nThe island is car-free according to VisitPortugal, so visitors should be prepared to walk between arrival points, services and beach areas.\nThe beach sits within the Ria Formosa Natural Park; visitors should respect dunes, lagoon habitats and marked paths.\nSea, wind, tide and lagoon conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Armona-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Armona-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 bathing season for Armona-Ria as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Armona-Ria as 1 June 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Access depends on boat services from Olhão, so visitors should confirm schedules and return times before travelling.",
      "The island is car-free according to VisitPortugal, so visitors should be prepared to walk between arrival points, services and beach areas.",
      "The beach sits within the Ria Formosa Natural Park; visitors should respect dunes, lagoon habitats and marked paths.",
      "Sea, wind, tide and lagoon conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Armona-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Armona-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 bathing season for Armona-Ria as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Armona-Ria as 1 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nAccess depends on boat services from Olhão, so visitors should confirm schedules and return times before travelling.\nThe island is car-free according to VisitPortugal, so visitors should be prepared to walk between arrival points, services and beach areas.\nThe beach sits within the Ria Formosa Natural Park; visitors should respect dunes, lagoon habitats and marked paths.\nSea, wind, tide and lagoon conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full island-beach atmosphere. May, June and September are often more comfortable for walking, photography and quieter Ria Formosa visits.",
  "suitable_for": [
    "Visitors staying in Olhão",
    "Families planning a full island beach day",
    "Beach walkers",
    "Nature-focused travellers",
    "Visitors interested in the Ria Formosa",
    "Couples looking for a boat-access beach",
    "Water-sports users when conditions are suitable"
  ],
  "not_suitable_for": [
    "Visitors who prefer direct road access to the beach",
    "Visitors who do not want to depend on ferry or boat schedules",
    "Visitors requiring fully verified accessible-beach support",
    "Those expecting extensive mainland resort infrastructure",
    "Visitors who are not prepared for walking on the island"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon system of islands, sandbanks, marshes and tidal channels forming the natural setting around Ilha da Armona.",
      "verification_status": "Verified"
    },
    {
      "name": "Armona-Ria",
      "type": "Lagoon-side bathing area",
      "description": "The Ria Formosa-facing bathing area of Armona, listed by ABAAE as a 2026 Blue Flag location in Olhão.",
      "verification_status": "Verified"
    },
    {
      "name": "Armona-Mar",
      "type": "Atlantic beach section",
      "description": "The Atlantic-facing bathing area of Ilha da Armona, listed by ABAAE as a 2026 Blue Flag location in Olhão.",
      "verification_status": "Verified"
    },
    {
      "name": "Olhão waterfront",
      "type": "Town waterfront and boat departure area",
      "description": "The mainland access point for boat connections to Armona and other Ria Formosa islands, useful for restaurants, markets and island departures.",
      "verification_status": "Verified"
    },
    {
      "name": "Fuseta-Mar",
      "type": "Nearby barrier-island beach",
      "description": "A neighbouring Ria Formosa island beach area east of Armona, also listed by ABAAE among Olhão’s 2026 Blue Flag locations.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha da Culatra",
      "type": "Nearby barrier island",
      "description": "Another Ria Formosa island accessible by boat from the Olhão area, suitable for visitors exploring the wider barrier-island system.",
      "verification_status": "Partially verified"
    }
  ],
  "nearby_towns": [
    "Olhão",
    "Fuseta",
    "Moncarapacho",
    "Faro",
    "Tavira"
  ],
  "walking_trails_nearby": [
    {
      "name": "Armona island settlement to Atlantic beach walk",
      "description": "A practical island walk from the boat-arrival area through the settlement towards the Atlantic-facing beach. Visitors should follow local paths and signage and avoid walking on protected dunes.",
      "verification_status": "Partially verified"
    },
    {
      "name": "Armona shoreline walk",
      "description": "A long sandy shoreline walk along the island beach, best planned according to tide, heat, wind and return boat times.",
      "verification_status": "Verified"
    },
    {
      "name": "Olhão waterfront and island departure walk",
      "description": "A short town walk around the Olhão waterfront before or after the boat crossing to Armona, useful for markets, restaurants and ferry access.",
      "verification_status": "Partially verified"
    }
  ],
  "visitor_tips": [
    "Check ferry or boat schedules before travelling, especially outside July and August.",
    "Allow enough time to walk from the arrival point to the Atlantic-facing beach.",
    "Carry water, sun protection and anything needed for the return journey.",
    "Use marked paths and avoid crossing dunes outside authorised routes.",
    "Choose Armona-Ria for lagoon scenery and Armona-Mar for the open Atlantic beach experience.",
    "Confirm seasonal services before relying on restaurants, showers, surveillance or water-sports support.",
    "Plan the last return boat before settling in for the day."
  ],
  "photography_notes": "Praia da Armona photographs well from the ferry approach, the lagoon-side beach, the island settlement and the Atlantic dunes. Early morning and late afternoon are especially good for soft Ria Formosa light, tidal channels and long sandy shoreline views.",
  "family_notes": "Armona can suit families who enjoy boat-access beaches and island days, but planning is important. Families should check ferry times, choose supervised seasonal areas where available, bring essentials and take care around tides, boats and lagoon channels.",
  "safety_notes": "Sea, wind, tide and lagoon conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Take particular care around boat traffic, tidal channels and dune areas.",
  "accessibility_notes": "Accessible-beach support was not verified from authoritative current sources. Because access requires boat travel and walking on the island, visitors with reduced mobility should confirm current boat boarding, pathways, beach-entry conditions and any seasonal assistance before visiting.",
  "seo": {
    "meta_title": "Praia da Armona, Olhão | Algarve Beach Guide",
    "meta_description": "Praia da Armona in Olhão is a Ria Formosa barrier-island beach with Atlantic sand, lagoon areas, boat access and Blue Flag status.",
    "keywords": [
      "Praia da Armona",
      "Ilha da Armona",
      "Armona Beach",
      "Armona-Mar",
      "Armona-Ria",
      "Olhão beaches",
      "Ria Formosa beaches",
      "Algarve island beach",
      "Portugal beaches",
      "Blue Flag Armona",
      "boat access beach Algarve",
      "barrier island Algarve"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Ilha da Armona",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-armona",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Ria Formosa - Olhão location",
        "Boat access from Olhão",
        "Approximate 15-minute crossing",
        "Barrier-island role between Ria Formosa and the sea",
        "Integration in the Natural Park",
        "Long sandy beach extending eastwards",
        "Car-free island description",
        "Camping area",
        "Fishing settlement and restaurants",
        "Facilities including Blue Flag, surveillance, light boat rental, showers, bar and restaurant",
        "Activities including windsurfing, sailing and diving"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Armona-Mar",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/armona-mar/",
      "facts_verified": [
        "Official Armona-Mar beach entry",
        "Coastal beach classification",
        "Municipality of Olhão",
        "Coordinates",
        "Beach code PTCT3J",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Município de Olhão",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/olhao/",
      "facts_verified": [
        "Armona-Mar listed among Olhão’s 2026 Blue Flag locations",
        "Armona-Ria listed among Olhão’s 2026 Blue Flag locations",
        "Armona-Ria coordinates",
        "Armona-Ria beach code PTCW3N",
        "2026 bathing season for Armona-Ria",
        "2026 Blue Flag season for Armona-Ria",
        "Other Olhão 2026 Blue Flag locations including Fuseta-Mar and Fuseta-Ria"
      ]
    },
    {
      "source_name": "Câmara Municipal de Olhão - Olhão renews Blue Flag and Gold Quality flags in 2026",
      "source_url": "https://cm-olhao.pt/38980/olhao-renova-bandeiras-azul-e-qualidade-de-ouro-nas-suas-praias-em-2026",
      "facts_verified": [
        "Municipal 2026 announcement that Armona-Mar and Armona-Ria renewed Blue Flag recognition",
        "Municipal context for Olhão island beaches",
        "Gold Quality recognition context for Armona-Mar and Armona-Ria from search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Armona",
      "source_url": "https://visitalgarve.pt/equipamento/8721/Praia%20da%20Armona",
      "facts_verified": [
        "Regional tourism listing for Praia da Armona",
        "Armona-Mar position at the western end of Ilha da Armona near Barra do Lavajo, based on regional tourism summary",
        "Barrier-island and Ria Formosa landscape context"
      ]
    },
    {
      "source_name": "Visit Olhão - Ilha da Armona",
      "source_url": "https://www.visitolhao.pt/962/ilha-da-armona",
      "facts_verified": [
        "Armona-Ria classified as a bathing area",
        "Lagoon-side beach context from official search-result summary"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural da Ria Formosa",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnriaformosa",
      "facts_verified": [
        "Official protected-area context for the Ria Formosa Natural Park"
      ]
    },
    {
      "source_name": "Natural.pt - Ilhas Barreira da Ria Formosa / Armona",
      "source_url": "https://natural.pt/protected-areas/parque-natural-ria-formosa/points-of-interest/ilhas-barreira-da-ria-formosa-armona",
      "facts_verified": [
        "Armona barrier-island point-of-interest page in the Ria Formosa protected-area context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Olhão municipality, barrier-island setting, boat access, Natural Park context, car-free island character, facilities and coordinates were verified from official tourism and ABAAE sources.",
    "The listing treats Praia da Armona as the wider island beach destination and distinguishes the two official bathing areas: Armona-Mar and Armona-Ria.",
    "ABAAE verifies both Armona-Mar and Armona-Ria with 2026 bathing seasons and Blue Flag seasons from 1 June 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the flags as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by VisitPortugal or official sources and marked Seasonal where operation may depend on the bathing season or concessions.",
    "Accessible-beach support was not verified from authoritative current sources and is therefore marked Not verified.",
    "Parking on the island is not claimed because VisitPortugal describes Armona as car-free.",
    "Some municipal and Visit Olhão pages returned limited accessible text or fetch errors when opened, so those facts are used cautiously from official search-result summaries and supported by VisitPortugal and ABAAE where possible.",
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
  where slug = 'olhao';

  if v_city_id is null then
    raise exception 'Olhão city was not found';
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
