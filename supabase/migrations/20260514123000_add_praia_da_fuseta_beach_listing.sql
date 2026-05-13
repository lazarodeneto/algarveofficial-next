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
  'Fuseta',
  'fuseta',
  'Ria Formosa fishing village in Olhão known for lagoon access, island boats and barrier-island beaches.',
  37.051,
  -7.746,
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
  v_slug text := 'praia-da-fuseta-olhao';
  v_name text := 'Praia da Fuseta';
  v_address text := 'Praia da Fuseta, Fuseta, Olhão, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-fuzeta';
  v_latitude numeric := 37.043365;
  v_longitude numeric := -7.745023;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Fuseta",
  "slug": "praia-da-fuseta-olhao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Fuseta / Ilha da Armona",
  "concelho": "Olhão",
  "municipality": "Olhão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Fuseta is a popular Ria Formosa beach destination in Olhão, with both lagoon-side access from the village and an Atlantic-facing island beach reached by boat. It is known for its barrier-island setting, family-friendly lagoon areas and 2026 Blue Flag listings for Fuseta-Mar and Fuseta-Ria.",
  "full_description": "Praia da Fuseta is one of Olhão’s most important Ria Formosa beach areas, offering two distinct experiences under one well-known local name. Fuseta-Ria sits beside the village waterfront, facing the calmer lagoon waters, while Fuseta-Mar is the Atlantic-facing beach on the eastern end of Ilha da Armona, opposite the fishing village of Fuseta.\n\nOfficial tourism sources describe Ilha da Fuzeta as separating the Atlantic Ocean from the Ria Formosa and forming part of the protected Natural Park. Access to the island beach is by boat from Fuseta or Olhão, while the lagoon-side Fuseta-Ria area benefits from direct village access, roads, parking, pedestrian routes and cycle paths. This makes Fuseta especially useful for visitors who want both easy lagoon bathing and a more classic barrier-island beach day.\n\nThe Atlantic side has a long sandy shoreline extending eastwards for several kilometres, suitable for long walks and seasonal activities such as canoeing, sailing and windsurfing when conditions allow. The lagoon side is more immediately connected with Fuseta village and is described by official Blue Flag material as one of the most sought-after bathing areas in Olhão during summer.\n\nBecause this is a sensitive Ria Formosa environment, visitors should respect dunes, tidal channels, saltmarshes and shellfish-working areas. Boat times, tides, seasonal services and beach support should be checked before travelling.",
  "coordinates": {
    "latitude": 37.043365,
    "longitude": -7.745023,
    "label": "Praia da Fuseta - Fuseta-Mar",
    "notes": "Primary listing coordinates use Fuseta-Mar. Fuseta-Ria is preserved as a secondary official bathing area.",
    "bathing_areas": [
      {
        "name": "Fuseta-Mar",
        "latitude": 37.043365,
        "longitude": -7.745023,
        "type": "Atlantic island beach",
        "verification_status": "Verified"
      },
      {
        "name": "Fuseta-Ria",
        "latitude": 37.050949,
        "longitude": -7.743675,
        "type": "Lagoon-side beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Barrier-island and lagoon beach with Atlantic and Ria Formosa bathing areas",
  "landscape": "A sandy barrier-island and lagoon landscape within the Ria Formosa Natural Park, with Atlantic shoreline, tidal channels, saltmarsh, sandbanks, dunes and the fishing village of Fuseta nearby.",
  "access": "Fuseta-Mar is accessed by boat from Fuseta or Olhão. Fuseta-Ria is accessed from the village waterfront, with official Blue Flag information noting roads, parking, pedestrian routes and cycle paths around the bathing area. Visitors should confirm boat schedules, tide conditions and current access before travelling.",
  "highlights": [
    "Important Ria Formosa beach area in Olhão",
    "Two recognised bathing areas: Fuseta-Mar and Fuseta-Ria",
    "Atlantic-facing island beach reached by boat from Fuseta or Olhão",
    "Lagoon-side village beach with easier mainland access",
    "Long sandy barrier-island shoreline extending eastwards",
    "Official 2026 Blue Flag listings for Fuseta-Mar and Fuseta-Ria"
  ],
  "best_for": [
    "Ria Formosa scenery",
    "Island beach days",
    "Families using serviced seasonal areas",
    "Lagoon bathing",
    "Long beach walks",
    "Nature lovers",
    "Boat-access beaches",
    "Accessible beach access, subject to current confirmation",
    "Water sports when conditions are suitable"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing for Fuseta-Mar", "status": "Seasonal" },
    { "name": "Blue Flag 2026 listing for Fuseta-Ria", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism and Blue Flag sources", "status": "Seasonal" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "WC / sanitary facilities", "status": "Verified / Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" },
    { "name": "Canoeing", "status": "Seasonal / conditions dependent" },
    { "name": "Accessible beach recognition for Fuseta-Ria", "status": "Verified / Seasonal support should be checked" },
    { "name": "Amphibious chair and assisted bathing support listed for Fuseta-Ria in 2025 accessible-beach information", "status": "Seasonal / verify before visiting" },
    { "name": "Parking near Fuseta quay / village access area", "status": "Verified" }
  ],
  "includes": [
    "Blue Flag 2026 listings for Fuseta-Mar and Fuseta-Ria",
    "Seasonal beach surveillance",
    "Sunshade rental",
    "Light boat rental",
    "Bar and restaurant",
    "WC / sanitary facilities",
    "Windsurfing, sailing and canoeing",
    "Accessible beach recognition for Fuseta-Ria",
    "Boat access to Fuseta-Mar"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full summer beach support. May, June and September are usually more comfortable for walking, photography and Ria Formosa visits with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Fuseta-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Fuseta-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 bathing season for Fuseta-Ria as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Fuseta-Ria as 1 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFuseta-Mar requires boat access; ferry and boat schedules should be checked before travelling.\nCurrents near the bar can be strong, according to local official beach information; visitors should follow local safety guidance.\nThe Ria Formosa is a protected natural environment. Visitors should use marked paths, avoid trampling dunes and avoid disturbing saltmarsh, shellfish areas or wildlife.\nFacilities and beach support may vary between Fuseta-Ria and Fuseta-Mar and may be seasonal.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Fuseta-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Fuseta-Mar as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 bathing season for Fuseta-Ria as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Fuseta-Ria as 1 June 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Fuseta-Mar requires boat access; ferry and boat schedules should be checked before travelling.",
      "Currents near the bar can be strong, according to local official beach information; visitors should follow local safety guidance.",
      "The Ria Formosa is a protected natural environment. Visitors should use marked paths, avoid trampling dunes and avoid disturbing saltmarsh, shellfish areas or wildlife.",
      "Facilities and beach support may vary between Fuseta-Ria and Fuseta-Mar and may be seasonal."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Fuseta-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Fuseta-Mar as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 bathing season for Fuseta-Ria as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Fuseta-Ria as 1 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFuseta-Mar requires boat access; ferry and boat schedules should be checked before travelling.\nCurrents near the bar can be strong, according to local official beach information; visitors should follow local safety guidance.\nThe Ria Formosa is a protected natural environment. Visitors should use marked paths, avoid trampling dunes and avoid disturbing saltmarsh, shellfish areas or wildlife.\nFacilities and beach support may vary between Fuseta-Ria and Fuseta-Mar and may be seasonal.",
  "best_time_to_visit": "June to September for the official bathing season and full summer beach support. May, June and September are usually more comfortable for walking, photography and Ria Formosa visits with less peak-summer pressure.",
  "suitable_for": [
    "Visitors staying in Fuseta or Olhão",
    "Families planning a lagoon-side or island beach day",
    "Visitors who enjoy boat-access beaches",
    "Beach walkers",
    "Nature-focused travellers",
    "Visitors interested in the Ria Formosa landscape",
    "Water-sports users when conditions are suitable",
    "Accessible-beach users at Fuseta-Ria, subject to current seasonal confirmation"
  ],
  "not_suitable_for": [
    "Visitors who prefer direct road access to all beach sections",
    "Visitors who do not want to depend on boat schedules for the island beach",
    "Visitors expecting a cliff-backed Algarve beach",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Anyone intending to walk across protected dunes or disturb lagoon habitats"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon system of islands, channels, saltmarshes, sandbanks and dunes forming the natural setting around Fuseta.",
      "verification_status": "Verified"
    },
    {
      "name": "Fuseta-Ria",
      "type": "Lagoon-side beach",
      "description": "The village-facing Ria Formosa bathing area, listed by ABAAE as a 2026 Blue Flag location and described as one of Olhão’s most sought-after summer bathing areas.",
      "verification_status": "Verified"
    },
    {
      "name": "Fuseta-Mar",
      "type": "Atlantic island beach",
      "description": "The Atlantic-facing beach on the eastern end of Ilha da Armona, reached by boat from Fuseta and listed by ABAAE as a 2026 Blue Flag location.",
      "verification_status": "Verified"
    },
    {
      "name": "Fuseta village",
      "type": "Fishing village",
      "description": "A Ria Formosa fishing village with waterfront access, boat departures, restaurants and a strong local maritime character.",
      "verification_status": "Verified"
    },
    {
      "name": "Torre da Fuseta",
      "type": "Viewpoint / monument",
      "description": "A viewpoint area noted by VisitPortugal for panoramic views over the Ria Formosa and its dune cordon.",
      "verification_status": "Verified"
    },
    {
      "name": "Ilha da Armona",
      "type": "Barrier island",
      "description": "The wider barrier island on which Fuseta-Mar sits at the eastern end, forming part of the Ria Formosa island system.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Fuseta",
    "Olhão",
    "Moncarapacho",
    "Tavira",
    "Santa Luzia"
  ],
  "walking_trails_nearby": [
    {
      "name": "Fuseta village and Ria waterfront walk",
      "description": "A local walk around the Fuseta waterfront, lagoon-side beach and quay area, suitable for observing the Ria Formosa setting while respecting working maritime and shellfish areas.",
      "verification_status": "Partially verified"
    },
    {
      "name": "Fuseta-Mar shoreline walk",
      "description": "A long sandy walk along the Atlantic-facing island beach, best planned according to tide, weather, heat and return boat times.",
      "verification_status": "Verified"
    },
    {
      "name": "Ecovia do Litoral - Olhão to Fuseta section",
      "description": "VisitPortugal describes the Coastal Ecovia stretch between Faro and Tavira as passing through Olhão and Fuzeta, with the Ria Formosa as the main attraction.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Decide in advance whether you want Fuseta-Ria for easier lagoon access or Fuseta-Mar for the island beach experience.",
    "Check ferry or boat times before travelling to the island beach.",
    "Arrive early in peak summer, especially if travelling by boat or using the main village access points.",
    "Use marked paths and boardwalks to protect the dune cordon.",
    "Take care near the bar and tidal channels, where currents can be strong.",
    "Bring water, sun protection and essentials if spending the day on the island beach.",
    "Confirm accessible-beach support before travelling if an amphibious chair or assisted bathing is required."
  ],
  "photography_notes": "Praia da Fuseta is especially photogenic from the lagoon side, boat approach and island shoreline, with sandbanks, tidal channels, boats, low dunes and Ria Formosa light creating strong eastern-Algarve compositions.",
  "family_notes": "Fuseta can suit families because of its lagoon-side access, seasonal support and long sandy island beach. Families should still check tides, currents, boat times and beach flags, and choose supervised seasonal areas where available.",
  "safety_notes": "Tide, wind, currents and lagoon conditions can vary. Local official information warns that currents near the bar are normally strong. Visitors should follow flags, signage, boat-operator guidance and beach surveillance instructions where present.",
  "accessibility_notes": "Fuseta-Ria is described by ABAAE as Olhão’s bathing area with the best access conditions, supported by roads, parking, pedestrian routes and cycle paths. Visit Algarve’s 2025 accessible-beach information also lists Fuseta-Ria with an amphibious chair and assisted bathing support. Current seasonal assistance, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia da Fuseta, Olhão | Algarve Beach Guide",
    "meta_description": "Praia da Fuseta in Olhão offers Ria Formosa lagoon access, a boat-reached island beach, Blue Flag status and barrier-island scenery.",
    "keywords": [
      "Praia da Fuseta",
      "Praia da Fuzeta",
      "Fuseta beach",
      "Fuseta-Mar",
      "Fuseta-Ria",
      "Olhão beaches",
      "Ria Formosa beaches",
      "Algarve island beach",
      "Portugal beaches",
      "Blue Flag Fuseta",
      "boat access beach Algarve",
      "Ilha da Armona",
      "accessible beach Olhão"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Ilha da Fuzeta",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-ilha-da-fuzeta",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Ria Formosa - Olhão location",
        "Barrier-island setting separating the Atlantic Ocean from the Ria Formosa",
        "Integration in the Natural Park",
        "Boat access from Fuzeta or Olhão",
        "Long sandy beach extending eastwards",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, bar, restaurant and accessible beach",
        "Activities including windsurfing and sailing",
        "Canoeing, sailing and windsurfing equipment reference",
        "Access by car, motorcycle and on foot listed in the service panel"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Município de Olhão",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/olhao/",
      "facts_verified": [
        "Fuseta-Ria listed as a 2026 Blue Flag beach in Olhão",
        "Fuseta-Mar listed as a 2026 Blue Flag beach in Olhão",
        "Official coordinates for Fuseta-Ria",
        "Official coordinates for Fuseta-Mar",
        "2026 bathing season for Fuseta-Ria",
        "2026 Blue Flag season for Fuseta-Ria",
        "2026 bathing season for Fuseta-Mar",
        "2026 Blue Flag season for Fuseta-Mar",
        "Beach codes PTCQ3X and PTCD3W"
      ]
    },
    {
      "source_name": "ABAAE - Praia Fuseta-Ria profile",
      "source_url": "https://bandeiraazul.abaae.pt/plataforma/index.php?id=151&p=beaches&s=beach",
      "facts_verified": [
        "Fuseta-Ria in the municipality of Olhão",
        "Ria Formosa Natural Park setting",
        "One of Olhão’s most sought-after summer bathing areas",
        "Sand strip protected by the Armona / Fuseta island area",
        "Best access conditions among Olhão bathing areas according to the profile",
        "Roads, parking, pedestrian routes and cycle paths around the beach",
        "Protected-area description and Ria Formosa habitat context"
      ]
    },
    {
      "source_name": "Porto Recreio de Olhão - Praias",
      "source_url": "https://portorecreioolhao.com/praias.html",
      "facts_verified": [
        "Olhão beach list including Fuseta-Ria and Fuseta-Mar",
        "Fuseta-Mar located at the eastern end of Ilha da Armona opposite Fuseta",
        "Regular boat connections from Fuseta quay to Praia da Fuseta",
        "Strong currents near the bar warning",
        "Need to cross dunes using boardwalks or designated pathways",
        "Beach support, restaurants, WC and surveillance during bathing season",
        "Fuseta-Ria classified as a bathing area with calmer Ria waters and beach support"
      ]
    },
    {
      "source_name": "Câmara Municipal de Olhão - 2026 Blue Flag announcement",
      "source_url": "https://cm-olhao.pt/38980/olhao-renova-bandeiras-azul-e-qualidade-de-ouro-nas-suas-praias-em-2026",
      "facts_verified": [
        "Municipal 2026 announcement that Armona-Mar, Armona-Ria, Fuseta-Mar and Fuseta-Ria renewed Blue Flag recognition",
        "Olhão municipal context for 2026 beach awards"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia dos Tesos / Fuseta-Ria",
      "source_url": "https://visitalgarve.pt/en/equipamento/8827/praia-dos-tesos-fuseta-ria",
      "facts_verified": [
        "Fuseta-Ria / Praia dos Tesos regional tourism listing",
        "Sandy bay beside Fuseta facing a Ria Formosa water channel",
        "Restaurant and WC support",
        "Summer lifeguard presence",
        "Accessible beach reference"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Fuseta-Ria listed with amphibious chair and assisted bathing support in 2025 accessible-beach information",
        "Accessible-beach support treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "Passeios Ria Formosa - Fuseta to Ilha da Fuseta ferry",
      "source_url": "https://www.passeios-ria-formosa.com/destinations/carreira-fuseta-ilha-da-fuseta/",
      "facts_verified": [
        "Fuseta to Ilha da Fuseta boat service",
        "Boat service for beach access",
        "Interest points including Barra da Fuseta, Ria Formosa, Ilha da Armona and water sports",
        "Operator statement that vessels allow boarding, travel and disembarkation for people with disabilities and reduced mobility",
        "2026 schedule section located, but specific timetable image not parsed"
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
      "source_name": "VisitPortugal - Torre da Fuseta",
      "source_url": "https://www.visitportugal.com/pt-pt/NR/exeres/A76B53B4-68EA-451A-A9F1-7AAAA2BD05EF",
      "facts_verified": [
        "Torre da Fuseta as a viewpoint over the Ria Formosa and dune cordon",
        "Views towards the islands of Tavira, Armona, Culatra and Farol"
      ]
    },
    {
      "source_name": "VisitPortugal - Coastal Ecovia",
      "source_url": "https://www.visitportugal.com/en/content/coastal-ecovia",
      "facts_verified": [
        "Coastal Ecovia section between Faro and Tavira passes through Olhão and Fuzeta",
        "Ria Formosa as the main attraction of that section"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, Ria Formosa setting, island/lagoon distinction, Blue Flag 2026 status and coordinates were verified from VisitPortugal, ABAAE and official Olhão sources.",
    "This listing treats Praia da Fuseta as the broader visitor destination covering Fuseta-Mar and Fuseta-Ria, because official sources use both names for recognised bathing areas.",
    "ABAAE verifies both Fuseta-Mar and Fuseta-Ria with 2026 bathing seasons and Blue Flag seasons from 1 June 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the flags as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities vary by section. Facilities are included only where listed by official or strong local sources and marked Seasonal where likely dependent on bathing season or concession operation.",
    "Accessible-beach information is strongest for Fuseta-Ria. Island-beach accessibility depends on current boat operation, boarding conditions and beach access, so visitors should verify before travelling.",
    "Boat timetable details were not fully parsed from the operator’s schedule image; visitors should check current ferry times before travelling.",
    "Because the Ria Formosa is tidal and protected, visitors should check tide, current and environmental guidance before walking across sandbanks or near channels.",
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
  where slug = 'fuseta';

  if v_city_id is null then
    raise exception 'Fuseta city was not found';
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
