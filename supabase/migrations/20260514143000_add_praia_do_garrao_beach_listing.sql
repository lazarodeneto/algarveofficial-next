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
  'Almancil',
  'almancil',
  'Golden Triangle service town for Quinta do Lago, Vale do Lobo and the dune-backed Loulé coast.',
  37.0648,
  -8.0329,
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
  v_slug text := 'praia-do-garrao-loule';
  v_name text := 'Praia do Garrão';
  v_address text := 'Praia do Garrão, Vale do Garrão, Almancil, Loulé, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-garr%C3%A3o';
  v_latitude numeric := 37.040534;
  v_longitude numeric := -8.05108;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Garrão",
  "slug": "praia-do-garrao-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Vale do Garrão / Almancil",
  "concelho": "Loulé",
  "municipality": "Loulé",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Garrão is a Golden Triangle beach in Loulé, set between the Vale do Lobo, Dunas Douradas and Quinta do Lago coastal area. Known for its wide sand, dunes, beach restaurants and resort-area access, it is one of the most established beaches on this part of the Algarve coast.",
  "full_description": "Praia do Garrão is a spacious beach in the municipality of Loulé, positioned in the Golden Triangle coastal area between Vale do Lobo, Dunas Douradas and Quinta do Lago. Official sources treat the wider beach through two recognised sections, Garrão Poente and Garrão Nascente, both listed by ABAAE as 2026 Blue Flag locations.\n\nThe setting combines a broad sandy shore with a transition landscape: low cliffs and resort development to the west, then dune fields extending eastwards towards the Ria Formosa coastal environment. VisitPortugal describes Garrão as having a large sandy beach suitable for different visitor profiles, from those seeking a quieter beach to those looking for a more animated beach with water-sports options.\n\nGarrão is especially associated with refined beach days, restaurants by the sand and resort access from the surrounding Almancil, Vale do Lobo and Quinta do Lago area. It is not a remote wild beach, but it still has a more open and natural feel than Quarteira or Vilamoura. The dune system and nearby wetland areas are sensitive, so visitors should use boardwalks and marked access routes where available.\n\nFacilities listed by official tourism sources include Blue Flag, seasonal surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, bodyboard, windsurf, sailing and accessible-beach status. Services should be treated as seasonal and visitors should confirm current support before travelling, especially outside the main bathing season.",
  "coordinates": {
    "latitude": 37.040534,
    "longitude": -8.05108,
    "label": "Praia do Garrão - Garrão Nascente",
    "notes": "Primary listing coordinates use Garrão Nascente. Garrão Poente is preserved as a secondary official bathing area.",
    "bathing_areas": [
      {
        "name": "Garrão Nascente",
        "latitude": 37.040534,
        "longitude": -8.05108,
        "type": "Eastern beach section",
        "verification_status": "Verified"
      },
      {
        "name": "Garrão Poente",
        "latitude": 37.043874,
        "longitude": -8.056165,
        "type": "Western beach section",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Large sandy maritime beach with two recognised sections",
  "landscape": "A broad sandy beach where low cliffs and resort-backed sections give way to dune fields and nearby wetland scenery towards the Ria Formosa coastal system.",
  "access": "Official regional tourism information describes road access by tarmacked road from Almancil towards Garrão or Dunas Douradas, with organised parking at both Garrão sections. Visitors should confirm current access and parking conditions in peak summer.",
  "highlights": [
    "Golden Triangle beach between Vale do Lobo, Dunas Douradas and Quinta do Lago",
    "Two recognised sections: Garrão Poente and Garrão Nascente",
    "Large sandy beach with dune and low-cliff scenery",
    "Beach restaurants and resort-area access nearby",
    "Water-sports activities listed by official tourism sources",
    "Official 2026 Blue Flag listings for Garrão Nascente and Garrão Poente"
  ],
  "best_for": [
    "Resort beach days",
    "Restaurants nearby",
    "Families",
    "Couples",
    "Long beach walks",
    "Accessible beach access, subject to current confirmation",
    "Water sports when conditions are suitable",
    "Golden Triangle visitors",
    "Sunset walks"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Garrão Nascente", "status": "Seasonal" },
    { "name": "Blue Flag 2026 listing for Garrão Poente", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious chair and assisted bathing support listed for Garrão Poente by official accessibility information", "status": "Seasonal / verify before visiting" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Bodyboard", "status": "Seasonal / conditions dependent" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Blue Flag 2026 listings for Garrão Nascente and Garrão Poente",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Sunshade rental",
    "Light boat rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Bodyboard, windsurfing and sailing",
    "Golden Triangle beach setting"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach-service atmosphere. May, June and September are usually more comfortable for beach walks, restaurants and lower peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Garrão Nascente as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Garrão Nascente as 1 July 2026 to 30 September 2026.\nABAAE lists Garrão Poente among Loulé’s 2026 Blue Flag locations and provides official coordinates.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities, surveillance, water-sports services and accessible-beach support may vary by section and season.\nThe beach is close to dune and wetland environments; visitors should use boardwalks and marked routes where available.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nRestaurant and serviced beach areas can be busy during peak summer, especially around the main access points.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Garrão Nascente as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Garrão Nascente as 1 July 2026 to 30 September 2026.",
      "ABAAE lists Garrão Poente among Loulé’s 2026 Blue Flag locations and provides official coordinates.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Facilities, surveillance, water-sports services and accessible-beach support may vary by section and season.",
      "The beach is close to dune and wetland environments; visitors should use boardwalks and marked routes where available.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Restaurant and serviced beach areas can be busy during peak summer, especially around the main access points."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Garrão Nascente as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Garrão Nascente as 1 July 2026 to 30 September 2026.\nABAAE lists Garrão Poente among Loulé’s 2026 Blue Flag locations and provides official coordinates.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities, surveillance, water-sports services and accessible-beach support may vary by section and season.\nThe beach is close to dune and wetland environments; visitors should use boardwalks and marked routes where available.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nRestaurant and serviced beach areas can be busy during peak summer, especially around the main access points.",
  "best_time_to_visit": "June to September for the official bathing season and full beach-service atmosphere. May, June and September are usually more comfortable for beach walks, restaurants and lower peak-summer pressure.",
  "suitable_for": [
    "Visitors staying in Vale do Lobo, Quinta do Lago, Dunas Douradas or Almancil",
    "Families wanting a serviced beach",
    "Couples looking for restaurants by the beach",
    "Beach walkers",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Water-sports users when conditions are suitable",
    "Visitors seeking a refined resort-area beach with natural dune scenery"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote wild beach with no services",
    "Visitors who want an urban promenade beach",
    "Those wishing to avoid resort-area beaches in peak summer",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to walk across protected dunes or wetland areas"
  ],
  "nearby_attractions": [
    {
      "name": "Vale do Lobo",
      "type": "Resort and coastal area",
      "description": "A nearby established coastal resort area west of Garrão, useful for restaurants, accommodation and wider beach access.",
      "verification_status": "Verified"
    },
    {
      "name": "Dunas Douradas",
      "type": "Resort and dune area",
      "description": "A resort area associated with Garrão Poente, close to dunes and beach access routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Quinta do Lago",
      "type": "Resort and nature area",
      "description": "A nearby coastal and Ria Formosa access area east of Garrão, known for beach access, lagoon scenery and nature routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Ancão",
      "type": "Nearby beach",
      "description": "A neighbouring Loulé beach east of Garrão, also linked with the Ria Formosa coastal setting and resort-area access.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale do Lobo",
      "type": "Nearby beach",
      "description": "A neighbouring Loulé beach west of Garrão, known for resort access and red-cliff coastal scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Dunas Douradas Lagoon",
      "type": "Wetland area",
      "description": "A freshwater wetland close to Garrão Poente, noted in regional route information for birdlife interest. Visitors should keep to authorised paths.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Almancil",
    "Vale do Lobo",
    "Quinta do Lago",
    "Quarteira",
    "Loulé",
    "Faro"
  ],
  "walking_trails_nearby": [
    {
      "name": "Garrão to Ancão shoreline walk",
      "description": "A beach and dune-side walk east towards Ancão, best planned according to tide, wind, heat and marked access routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Garrão to Vale do Lobo shoreline walk",
      "description": "A practical beach walk west towards Vale do Lobo, passing the transition from dunes to lower cliff scenery where conditions allow.",
      "verification_status": "Verified"
    },
    {
      "name": "Garrão, Ancão and Quinta do Lago boardwalk area",
      "description": "Regional tourism references wooden trails linking Garrão and Ancão towards Faro and Quinta do Lago over several kilometres of boardwalks. Visitors should remain on marked routes to protect dunes.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Choose Garrão Poente for the Dunas Douradas side and Garrão Nascente for the eastern section towards Ancão.",
    "Arrive early in July and August for easier access to parking and restaurant areas.",
    "Confirm accessible-beach support before travelling if an amphibious chair or assisted bathing is required.",
    "Use boardwalks and marked paths to protect dunes and wetland habitats.",
    "Book restaurants or arrive outside peak lunch periods in high season.",
    "Check beach flags before swimming or using water-sports services.",
    "For a longer outing, walk towards Vale do Lobo or Ancão when tide and weather conditions allow."
  ],
  "photography_notes": "Praia do Garrão photographs well for its broad sand, dune fields, low cliffs, boardwalks and Golden Triangle beach atmosphere. Early morning and late afternoon usually provide softer light and quieter restaurant and beach-service areas.",
  "family_notes": "Praia do Garrão can suit families because of its broad sand, restaurants, seasonal surveillance and beach-service infrastructure. Families should still choose supervised seasonal areas, check beach flags and keep children off protected dunes.",
  "safety_notes": "Sea and wind conditions can vary. Follow local beach flags, signage and instructions from surveillance teams where present. Use marked access paths and avoid walking through dunes, wetland areas or unstable cliff sections.",
  "accessibility_notes": "VisitPortugal lists Praia do Garrão as an accessible beach, and official accessibility information identifies Garrão Poente with amphibious-chair and assisted bathing support. Current seasonal availability, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia do Garrão, Loulé | Algarve Beach Guide",
    "meta_description": "Praia do Garrão in Loulé is a Golden Triangle beach with wide sand, dunes, restaurants, resort access and Blue Flag status.",
    "keywords": [
      "Praia do Garrão",
      "Garrão Beach",
      "Garrão Nascente",
      "Garrão Poente",
      "Loulé beaches",
      "Golden Triangle Algarve",
      "Vale do Lobo beach area",
      "Quinta do Lago beach area",
      "Dunas Douradas beach",
      "Algarve beaches",
      "Portugal beaches",
      "Blue Flag Garrão",
      "accessible beach Loulé",
      "beach restaurants Algarve"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Garrão",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-garr%C3%A3o",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Loulé",
        "Large sandy beach",
        "Position near the limits of the Ria Formosa Natural Park but outside the protected area",
        "Beach suitable for both quieter and more animated visitor experiences",
        "Nautical activity context",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, bodyboard, windsurf, sailing and accessible beach"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Garrão Nascente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/garrao-nascente/",
      "facts_verified": [
        "Official Garrão Nascente beach entry",
        "Coastal beach classification",
        "Municipality of Loulé",
        "Coordinates",
        "Beach code PTCH7U",
        "Address at Vale do Garrão",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Garrão Poente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/garrao-poente/",
      "facts_verified": [
        "Official Garrão Poente beach entry",
        "Coastal beach classification",
        "Municipality of Loulé",
        "Coordinates",
        "Address at Dunas Douradas",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Garrão Nascente listed among Loulé’s 2026 Blue Flag locations",
        "Garrão Poente listed among Loulé’s 2026 Blue Flag locations",
        "Loulé listed with 12 awarded locations in 2026",
        "Nearby 2026 Blue Flag locations including Ancão, Vale de Lobo and Quinta do Lago"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Garrão Poente e Garrão Nascente",
      "source_url": "https://visitalgarve.pt/equipamento/8798/praia-do-garro-poente-e-garro-nascente",
      "facts_verified": [
        "Official regional tourism listing for Garrão Poente and Garrão Nascente",
        "Cliff line giving way to dune fields",
        "Road access from Almancil towards Garrão or Dunas Douradas for about 6 km",
        "Organised parking at both beach sections",
        "Coordinates for the wider beach listing"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - Praia do Garrão Poente",
      "source_url": "https://www.cm-loule.pt/pt/menu/645/praia-do-garrao-poente.aspx",
      "facts_verified": [
        "Official municipal page for Garrão Poente",
        "Location near Dunas Douradas",
        "Dune-recovery landscape",
        "Accessible-beach equipment including rigid and flexible mats, amphibious chair, shower and footwash from official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - Praia do Garrão Nascente",
      "source_url": "https://www.cm-loule.pt/pt/menu/646/praia-do-garrao-nascente.aspx",
      "facts_verified": [
        "Official municipal page for Garrão Nascente",
        "Beach located below an unstable cliff and associated with a large dune cordon extending eastwards, based on official search-result summary"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Accessible-beach information context",
        "Garrão Poente accessible-beach support referenced in official and official-linked accessible beach materials",
        "Seasonal accessibility support should be checked before visiting"
      ]
    },
    {
      "source_name": "EuroVelo Portugal - Praia do Garrão Poente e Garrão Nascente",
      "source_url": "https://euroveloportugal.com/pt/poi/praia-de-garrao-poente-e-garrao-nascente",
      "facts_verified": [
        "Landscape transition from cliffs to dune fields",
        "Dunas Douradas freshwater lagoon near Garrão Poente",
        "Smaller temporary Garrão lagoon near Garrão Nascente",
        "Wetland birdlife interest",
        "Relevance to coastal cycling and walking route context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Loulé municipality, Garrão Nascente and Garrão Poente distinction, facilities, coordinates and 2026 Blue Flag listing were verified from VisitPortugal, ABAAE and official regional/municipal sources.",
    "The Golden Triangle positioning is supported by verified nearby locations including Vale do Lobo, Dunas Douradas, Almancil, Ancão and Quinta do Lago. No private resort endorsement or partnership is implied.",
    "ABAAE verifies Garrão Nascente’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "ABAAE verifies Garrão Poente as a 2026 Blue Flag location and provides coordinates. The exact individual season text should be manually rechecked before future publication updates.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level, with stronger practical support information for Garrão Poente; current equipment and assistance should be checked before visiting.",
    "Some Câmara Municipal de Loulé pages returned internal errors when opened, so municipal details are used cautiously from official search-result summaries and supported by VisitPortugal, Visit Algarve and ABAAE where possible.",
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
  where slug = 'almancil';

  if v_city_id is null then
    raise exception 'Almancil city was not found';
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
