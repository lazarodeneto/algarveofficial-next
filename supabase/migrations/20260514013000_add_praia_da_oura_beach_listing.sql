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
  'Central Algarve resort city with historic centre beaches, nightlife resort areas and beaches including Oura.',
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
  v_slug text := 'praia-da-oura-albufeira';
  v_name text := 'Praia da Oura';
  v_address text := 'Praia da Oura, Oura / Areias de São João, Albufeira, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-da-oura';
  v_latitude numeric := 37.086046;
  v_longitude numeric := -8.226635;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Oura",
  "slug": "praia-da-oura-albufeira",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Oura / Areias de São João, Albufeira",
  "concelho": "Albufeira",
  "municipality": "Albufeira",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Oura is a lively resort beach in Albufeira, set below low cliffs in the Areias de São João area. Known for its hotels, restaurants, bars and nearby nightlife district, it is one of the city’s busiest beach settings during the summer season.",
  "full_description": "Praia da Oura is one of Albufeira’s most active resort beaches, located east of the historic centre in the Areias de São João and Oura area. Official tourism sources describe it as a lively beach with a wide sandy shore, low cliffs and close links to hotels, restaurants, bars and the surrounding nightlife district.\n\nThis is not a quiet hideaway. Praia da Oura is best suited to visitors who want a beach with strong services, an energetic atmosphere and easy access to the surrounding resort area. During the day, it works well for sunbathing, swimming when conditions allow, water-sports activity and relaxed beach time close to food and drink options. In the afternoon and evening, the beach naturally connects with the Oura nightlife area, making it particularly popular with groups and visitors staying nearby.\n\nThe beach also has a more scenic side. Low cliffs frame the sand, and the eastern Oura-Leste section is described by local tourism as calmer and more natural, with rocky formations creating smaller cove-like areas. Visitors who want a gentler experience may prefer mornings or the shoulder season, before the busiest beach and nightlife rhythm builds.\n\nABAAE lists Oura as a 2026 Blue Flag beach, with the bathing season running from 15 May to 15 October 2026 and the Blue Flag season from 1 July to 30 September 2026. Services and surveillance should still be treated as seasonal, and visitors should follow local flags, signage and safety guidance.",
  "coordinates": {
    "latitude": 37.086046,
    "longitude": -8.226635,
    "label": "Praia da Oura",
    "notes": "Coordinates were taken from the official ABAAE Oura beach entry."
  },
  "beach_type": "Sandy urban resort beach",
  "landscape": "A broad sandy beach below low cliffs, with resort development, beach services and rocky formations towards the eastern section.",
  "access": "Official and municipal sources verify road access through Areias de São João / Oura. Municipal information states that access to the sand is by stairs and a wooden ramp, while regional tourism information refers to pedestrian and paved road access and parking near the central section.",
  "highlights": [
    "Very lively resort beach in the Oura and Areias de São João area",
    "Close to Albufeira’s main nightlife, restaurant and bar district",
    "Wide sandy beach framed by low cliffs",
    "Strong support infrastructure verified by official local tourism",
    "Nearby Oura-Leste section with rock formations and smaller coves",
    "Official 2026 Blue Flag listing for Oura"
  ],
  "best_for": [
    "Resort beach days",
    "Groups",
    "Nightlife nearby",
    "Restaurants nearby",
    "Water sports",
    "Couples",
    "Families using serviced sections",
    "Visitors staying in Oura or Areias de São João",
    "Lively summer atmosphere"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach surveillance / lifeguards", "status": "Seasonal" },
    { "name": "Restaurants", "status": "Verified / Seasonal" },
    { "name": "Beach bars", "status": "Verified / Seasonal" },
    { "name": "Water-sports activities", "status": "Seasonal / conditions dependent" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Diving activity listed by official tourism source", "status": "Seasonal / conditions dependent" },
    { "name": "Equipment rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Reduced-mobility parking listed by municipal source", "status": "Verified / verify before visiting" },
    { "name": "Accessible beach recognition", "status": "Seasonal / verify before visiting" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Restaurants and beach bars",
    "Seasonal water-sports activities",
    "Windsurfing and diving context",
    "Equipment rental",
    "Showers",
    "Car parking",
    "Reduced-mobility parking reference",
    "Accessible beach recognition requiring current confirmation"
  ],
  "important_information": {
    "best_time_to_visit": "May to October for the official bathing season and full resort atmosphere. Mornings, June and September are usually more comfortable for visitors who want the beach before the busiest afternoon and nightlife-linked footfall.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Oura as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Oura as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Oura is a very busy resort beach, especially during July, August and evenings linked with the nearby nightlife district.\nFacilities, surveillance and water-sports services may vary by season and concession operation.\nAccess involves stairs and a wooden ramp according to municipal information; current mobility suitability should be checked before visiting.\nVisitors should take care near low cliffs and rocky sections, especially around the eastern end and at low tide.\nSea conditions can vary; follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Oura as 15 May 2026 to 15 October 2026.",
      "ABAAE lists the 2026 Blue Flag season for Oura as 1 July 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia da Oura is a very busy resort beach, especially during July, August and evenings linked with the nearby nightlife district.",
      "Facilities, surveillance and water-sports services may vary by season and concession operation.",
      "Access involves stairs and a wooden ramp according to municipal information; current mobility suitability should be checked before visiting.",
      "Visitors should take care near low cliffs and rocky sections, especially around the eastern end and at low tide.",
      "Sea conditions can vary; follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Oura as 15 May 2026 to 15 October 2026.\nABAAE lists the 2026 Blue Flag season for Oura as 1 July 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Oura is a very busy resort beach, especially during July, August and evenings linked with the nearby nightlife district.\nFacilities, surveillance and water-sports services may vary by season and concession operation.\nAccess involves stairs and a wooden ramp according to municipal information; current mobility suitability should be checked before visiting.\nVisitors should take care near low cliffs and rocky sections, especially around the eastern end and at low tide.\nSea conditions can vary; follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "May to October for the official bathing season and full resort atmosphere. Mornings, June and September are usually more comfortable for visitors who want the beach before the busiest afternoon and nightlife-linked footfall.",
  "suitable_for": [
    "Visitors staying in Oura or Areias de São João",
    "Groups wanting a lively beach close to nightlife",
    "Couples looking for a resort beach with restaurants nearby",
    "Families who prefer serviced beach areas",
    "Visitors interested in water sports when conditions are suitable",
    "Beachgoers who want a central resort atmosphere"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or remote beach",
    "Visitors who want to avoid nightlife areas",
    "Those looking for an undeveloped natural setting",
    "Visitors requiring fully verified step-free beach access",
    "Visitors who prefer very calm surroundings in peak summer"
  ],
  "nearby_attractions": [
    {
      "name": "Oura nightlife district",
      "type": "Resort and nightlife area",
      "description": "The lively Oura and Areias de São João area above the beach, known for restaurants, bars, accommodation and evening entertainment.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Oura-Leste",
      "type": "Neighbouring beach section",
      "description": "The eastern section of Oura, described by local tourism as calmer and more natural, with rocky formations and smaller cove-like areas.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Aveiros",
      "type": "Nearby beach",
      "description": "A neighbouring beach west of Oura, useful for visitors exploring the coastline between Oura and central Albufeira.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Santa Eulália",
      "type": "Nearby beach",
      "description": "A nearby beach east of Oura, part of the same developed eastern Albufeira coastal area.",
      "verification_status": "Verified"
    },
    {
      "name": "Albufeira Historic Centre",
      "type": "Historic town centre",
      "description": "The old town of Albufeira lies west of Oura and offers historic streets, viewpoints, restaurants and central beaches.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Albufeira",
    "Areias de São João",
    "Oura",
    "Santa Eulália",
    "Olhos de Água",
    "Ferreiras"
  ],
  "walking_trails_nearby": [
    {
      "name": "Albufeira - Oura urban walk",
      "description": "Visit Albufeira lists Albufeira - Oura among its walks and tours, connecting the beach with the wider resort, restaurant and nightlife area.",
      "verification_status": "Verified"
    },
    {
      "name": "Oura to Santa Eulália coastal walk",
      "description": "A short coastal-resort walk linking Oura with the neighbouring Santa Eulália area by streets, beach-access routes and local paths. Route condition should be checked locally.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient beach areas.",
    "Visit in the morning for a calmer beach experience before the resort area becomes livelier.",
    "Expect more activity in the afternoon and evening because of the nearby nightlife district.",
    "Use official access points and take care on stairs, ramps and rocky sections.",
    "Check beach flags before swimming or using water-sports services.",
    "For a quieter feel, compare conditions with the Oura-Leste section or nearby Santa Eulália."
  ],
  "photography_notes": "Praia da Oura is best photographed for its resort-beach energy, low cliffs, broad sand and lively Albufeira setting. Early morning gives quieter beach scenes, while late afternoon can work well for views across the sand and surrounding cliffs.",
  "family_notes": "The beach can suit families using the serviced sections, with restaurants, showers and lifeguard presence listed by official local tourism. Families should still plan around summer crowds, nightlife-linked footfall and changing sea conditions.",
  "safety_notes": "Sea conditions can vary, even on beaches described by tourism sources as generally calm. Visitors should follow flags, signage and lifeguard instructions where present, and take care near rocks, low cliffs and water-sports zones.",
  "accessibility_notes": "Accessibility information is partly verified but should be checked before visiting. Municipal and 2025 accessible-beach information reference Oura, and municipal information lists reduced-mobility parking plus stairs and a wooden ramp; current seasonal support and the most suitable access point should be confirmed locally.",
  "seo": {
    "meta_title": "Praia da Oura, Albufeira | Algarve Beach Guide",
    "meta_description": "Praia da Oura in Albufeira is a lively resort beach with wide sand, low cliffs, bars, restaurants, nightlife nearby and Blue Flag status.",
    "keywords": [
      "Praia da Oura",
      "Oura Beach",
      "Praia da Oura Albufeira",
      "Albufeira beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Oura nightlife beach",
      "Areias de São João",
      "resort beach Albufeira",
      "Blue Flag beach Albufeira",
      "Praia da Oura-Leste",
      "Santa Eulália nearby beach"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Oura trip ideas",
      "links": [
        { "label": "Praia da Oura" },
        { "label": "Oura Beach" },
        { "label": "Praia da Oura Albufeira" },
        { "label": "Oura nightlife beach" },
        { "label": "resort beach Albufeira" },
        { "label": "Blue Flag beach Albufeira" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Areias de São João" },
        { "label": "Praia da Oura-Leste" },
        { "label": "Praia dos Aveiros" },
        { "label": "Praia de Santa Eulália" },
        { "label": "Albufeira Historic Centre" },
        { "label": "Olhos de Água" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Oura",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-oura",
      "facts_verified": [
        "Beach name",
        "Location in Albufeira",
        "Water-sports context including windsurfing and diving",
        "Nearby bars, restaurants and nightlife venues"
      ]
    },
    {
      "source_name": "Visit Albufeira - Oura Beach",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-oura",
      "facts_verified": [
        "Oura as one of Albufeira’s liveliest beaches",
        "Proximity to the nightlife district",
        "Wide selection of hotels, restaurants and bars",
        "Historic role in Albufeira’s international tourism development",
        "Wide sandy beach framed by low cliffs",
        "Facilities including lifeguards, restaurants, beach bars, water-sports activities, equipment rentals, showers and easy access",
        "Youthful and energetic atmosphere in the afternoon and early evening"
      ]
    },
    {
      "source_name": "Visit Albufeira - Albufeira - Oura",
      "source_url": "https://visitalbufeira.pt/experiencias/albufeira-oura/",
      "facts_verified": [
        "Oura as one of Albufeira’s liveliest areas",
        "Active nightlife",
        "Location east of the historic centre",
        "Accommodation, restaurants and entertainment options",
        "Praia da Oura framed by characteristic cliffs",
        "Rua da Oura nightlife-area context"
      ]
    },
    {
      "source_name": "Visit Albufeira - Oura Beach East",
      "source_url": "https://visitalbufeira.pt/praia/praia-da-oura-leste",
      "facts_verified": [
        "Oura-Leste as a quieter and more natural section of Oura",
        "Rock formations creating small sheltered coves",
        "Access via pathways and stairways from hotels and elevated boardwalks",
        "Sand divided by rocks"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia da Oura",
      "source_url": "https://visitalgarve.pt/equipamento/8748/praia-da-oura",
      "facts_verified": [
        "Almost 1 km seafront reference from search result",
        "Western section dominated by tourist equipment",
        "Pedestrian and paved road access through Areias de São João from search result",
        "Parking around 100 m from the central section from search result"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Oura",
      "source_url": "https://www.cm-albufeira.pt/praias/oura",
      "facts_verified": [
        "Municipal beach page for Oura",
        "Paved road access through Areias de São João from search result",
        "Access to the sand by stairs and wooden ramp from search result",
        "Car parking and reduced-mobility parking from search result"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Oura",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/oura/",
      "facts_verified": [
        "Official Oura coastal beach entry",
        "Municipality of Albufeira",
        "Coordinates",
        "Beach code PTCH9F",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at the time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Oura listed among Albufeira’s 2026 Blue Flag locations",
        "Oura-Leste listed among Albufeira’s 2026 Blue Flag locations",
        "Albufeira listed with 25 awarded locations in 2026"
      ]
    },
    {
      "source_name": "Câmara Municipal de Albufeira - Praia Acessível 2025 table",
      "source_url": "https://www.cm-albufeira.pt/sites/default/files/inline-files/Tabela%20Praias%20Acess%C3%ADveis_2025.pdf",
      "facts_verified": [
        "Oura listed among Albufeira accessible beaches in 2025",
        "Accessible-beach status treated as needing current confirmation for future publication updates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, resort context, nightlife-area proximity, low-cliff landscape, facilities, coordinates and 2026 Blue Flag season were verified from official tourism, municipal and ABAAE sources.",
    "The phrase “very busy nightlife/resort area” is supported by official Visit Albufeira and VisitPortugal descriptions of Oura as lively, nightlife-oriented and surrounded by hotels, restaurants and bars.",
    "ABAAE verifies the 2026 bathing season for Oura as 15 May 2026 to 15 October 2026 and the 2026 Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, the ABAAE page showed the Blue Flag as not hoisted, so public wording treats Blue Flag status as seasonal rather than permanently active.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season, concession activity or sea conditions.",
    "Accessibility is treated cautiously: Oura appears in official accessible-beach material for 2025, and municipal search-result text references reduced-mobility parking, stairs and a wooden ramp. Current 2026 accessible support should be manually confirmed before publication.",
    "The Câmara Municipal de Albufeira page returned an internal error when opened, so municipal access details are based on the official search-result summary and supported cautiously.",
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
  where slug = 'albufeira';

  if v_city_id is null then
    raise exception 'Albufeira city was not found';
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
