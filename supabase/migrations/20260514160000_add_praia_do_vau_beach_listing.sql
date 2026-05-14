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
  'Portimão',
  'portimao',
  'Western Algarve city known for Praia da Rocha, the Arade riverfront, beaches, restaurants and coastal access.',
  37.1394,
  -8.5369,
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
  v_slug text := 'praia-do-vau-portimao';
  v_name text := 'Praia do Vau';
  v_address text := 'Praia do Vau, Vau, Portimão, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-vau';
  v_latitude numeric := 37.120045;
  v_longitude numeric := -8.559164;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Vau",
  "slug": "praia-do-vau-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Vau / Portimão",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Vau is a popular family beach in Portimão, set between ochre cliffs west of Praia da Rocha. Known for its golden sand, easy pedestrian access, seasonal services and sheltered-feeling scenery, it is one of the city’s most practical beaches for relaxed summer days.",
  "full_description": "Praia do Vau is one of Portimão’s best-known family beaches, located west of Praia da Rocha and close to the Vau resort area. Official tourism sources describe the beach as sheltered between copper and ochre-toned cliffs, with an attractive sandy setting and a lively nearby settlement with restaurants during summer.\n\nCompared with the larger and busier Praia da Rocha, Vau feels more intimate and scenic, with sculpted rock formations, small corners created by erosion and a softer resort atmosphere. Visit Portimão describes it as a favourite for families with children, noting easy pedestrian access and low-tide conditions that make the beach especially appealing for younger visitors. Natural conditions can still vary, so families should always follow beach flags and seasonal safety guidance.\n\nThe beach has strong verified infrastructure. Official sources list Blue Flag recognition, beach support, lifeguard, first-aid station, WC, showers, sunshade area, nautical centre and accessible-beach support with amphibious wheelchair. VisitPortugal also lists parking, bar, restaurant, sunshade rental, light boat rental, windsurfing and accessible-beach status. These services should be treated as seasonal unless confirmed before visiting.\n\nPraia do Vau also works well as part of a Portimão coastal walk. Nearby Careanos, Alemão and the Rocha–Alemão walking route reveal the same colourful cliff landscape, sea views and eroded limestone scenery. In July and August, Vau can become busy, especially around the main access and serviced areas.",
  "coordinates": {
    "latitude": 37.120045,
    "longitude": -8.559164,
    "label": "Praia do Vau",
    "notes": "Primary listing coordinates use the official ABAAE Vau beach entry.",
    "bathing_areas": [
      {
        "name": "Vau",
        "latitude": 37.120045,
        "longitude": -8.559164,
        "type": "Family beach below ochre cliffs",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Sandy maritime beach below ochre cliffs",
  "landscape": "A compact golden-sand beach framed by copper, ochre and red-toned cliffs, sculpted rock formations and resort-area surroundings.",
  "access": "Official sources list access by car, motorcycle and on foot, while Visit Portimão describes easy pedestrian access. Visitors with reduced mobility should still confirm the most suitable access point and current seasonal support before visiting.",
  "highlights": [
    "Popular family beach in Portimão",
    "Ochre and copper-toned cliffs around the sand",
    "Easy pedestrian access verified by Visit Portimão",
    "Beach support, lifeguard, WC, showers and first aid listed by official local tourism",
    "Accessible-beach support with amphibious wheelchair listed by Visit Portimão",
    "Official 2026 Blue Flag listing for Vau"
  ],
  "best_for": [
    "Families",
    "Couples",
    "Resort beach days",
    "Accessible beach access, subject to current confirmation",
    "Photography",
    "Short beach visits",
    "Restaurants nearby",
    "Coastal walks",
    "Windsurfing when conditions are suitable"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Beach support", "status": "Verified / Seasonal" },
    { "name": "Lifeguard / beach surveillance", "status": "Seasonal" },
    { "name": "First-aid station", "status": "Seasonal" },
    { "name": "Accessible beach with amphibious wheelchair", "status": "Verified / Seasonal support should be checked" },
    { "name": "WC", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Sunshade area / sunshade rental", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Nautical centre", "status": "Verified / Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Beach support",
    "First-aid station",
    "Accessible beach with amphibious wheelchair",
    "WC and showers",
    "Sunshade area and rental",
    "Car parking",
    "Bar and restaurant",
    "Nautical centre",
    "Light boat rental",
    "Windsurfing",
    "Ochre cliff setting"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach-support period. May, June and September are often more comfortable for families, photography and coastal walks with less peak-summer pressure.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Vau as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Vau as 1 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia do Vau is popular in summer and can become busy around the main access points and serviced beach areas.\nFacilities, surveillance, accessible-beach support and nautical services may vary by season and concession operation.\nThe beach is backed by cliffs and eroded rock formations; visitors should keep away from cliff bases and edges.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nLow tide may provide more usable sand and easier family beach play, but visitors should still check local conditions.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Vau as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Vau as 1 June 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia do Vau is popular in summer and can become busy around the main access points and serviced beach areas.",
      "Facilities, surveillance, accessible-beach support and nautical services may vary by season and concession operation.",
      "The beach is backed by cliffs and eroded rock formations; visitors should keep away from cliff bases and edges.",
      "Sea conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Low tide may provide more usable sand and easier family beach play, but visitors should still check local conditions."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Vau as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Vau as 1 June 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia do Vau is popular in summer and can become busy around the main access points and serviced beach areas.\nFacilities, surveillance, accessible-beach support and nautical services may vary by season and concession operation.\nThe beach is backed by cliffs and eroded rock formations; visitors should keep away from cliff bases and edges.\nSea conditions can vary; visitors should follow local flags, signage and official safety guidance.\nLow tide may provide more usable sand and easier family beach play, but visitors should still check local conditions.",
  "best_time_to_visit": "June to September for the official bathing season and full beach-support period. May, June and September are often more comfortable for families, photography and coastal walks with less peak-summer pressure.",
  "suitable_for": [
    "Families wanting a serviced beach",
    "Visitors staying in Vau or Portimão",
    "Couples looking for a scenic but practical beach",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Beachgoers who prefer a smaller alternative to Praia da Rocha",
    "Coastal walkers exploring the cliffs between Rocha and Alemão"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Those wishing to avoid popular beaches in July and August",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to sit close to cliff bases",
    "Visitors expecting guaranteed calm sea conditions"
  ],
  "nearby_attractions": [
    {
      "name": "Praia do Alemão",
      "type": "Nearby beach",
      "description": "A neighbouring beach west of Vau, bordered by Ponta de João d’Arens and linked with cliff-top walking routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Careanos",
      "type": "Nearby beach",
      "description": "A neighbouring beach east of Vau, part of the cliff-backed coastal stretch before Praia da Rocha.",
      "verification_status": "Verified"
    },
    {
      "name": "Ponta de João d’Arens",
      "type": "Headland and coastal viewpoint area",
      "description": "A rocky coastal formation west of Praia do Alemão, visible from the Vau and Alemão cliff landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Rocha",
      "type": "Nearby resort beach",
      "description": "Portimão’s major resort beach east of Vau, connected by the wider coastal route towards Alemão.",
      "verification_status": "Verified"
    },
    {
      "name": "Portimão",
      "type": "City",
      "description": "The municipal city behind the beach area, with restaurants, services, historic streets and the River Arade waterfront.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Portimão",
    "Praia da Rocha",
    "Alvor",
    "Ferragudo",
    "Lagoa"
  ],
  "walking_trails_nearby": [
    {
      "name": "Passeio Rocha - Alemão",
      "description": "A Visit Portimão coastal walk between Praia da Rocha and Praia do Alemão, with Miocene cliffs, arches, caves, fossils and beach access along the route.",
      "verification_status": "Verified"
    },
    {
      "name": "Varandas sobre o Mar",
      "description": "A cliff-top walking route referenced by Visit Portimão from Praia do Alemão towards the Prainha area, passing coastal vegetation, pine woodland and sea views.",
      "verification_status": "Verified"
    },
    {
      "name": "Vau to Careanos shoreline walk",
      "description": "A short beach walk east towards Praia dos Careanos when tide and sea conditions allow. Visitors should keep away from cliff bases.",
      "verification_status": "Partially verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August for easier access to the most convenient beach and parking areas.",
    "Use the beach as a family-friendly alternative to larger Praia da Rocha, while still checking flags and sea conditions.",
    "Confirm accessible-beach support before travelling if an amphibious wheelchair or assistance is required.",
    "Visit at low tide for more sand and better access between beach sections, where conditions allow.",
    "Use official paths and avoid informal cliff-edge routes.",
    "For photography, late afternoon light brings out the copper and ochre tones of the cliffs."
  ],
  "photography_notes": "Praia do Vau photographs well from the sand, safe cliff-top viewpoints and neighbouring coastal routes. The ochre cliffs, sculpted rock formations and softer resort setting are strongest in morning or late-afternoon light.",
  "family_notes": "Praia do Vau is a strong family option because official local tourism identifies it as popular with families and lists lifeguard, first-aid, WC, showers and accessible-beach support. Families should still choose supervised seasonal areas, check flags and keep children away from cliffs and rocks.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from surveillance teams where present. Keep away from cliff bases and cliff edges, and take care near rocks and eroded formations.",
  "accessibility_notes": "VisitPortugal lists Praia do Vau as an accessible beach, and Visit Portimão lists accessible-beach support with an amphibious wheelchair. Current seasonal availability, adapted equipment, gradient and the best access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia do Vau, Portimão | Algarve Beach Guide",
    "meta_description": "Praia do Vau in Portimão is a popular family beach with ochre cliffs, easy access, Blue Flag status, facilities and accessible support.",
    "keywords": [
      "Praia do Vau",
      "Vau Beach",
      "Praia do Vau Portimão",
      "Portimão beaches",
      "Algarve beaches",
      "Portugal beaches",
      "family beach Portimão",
      "accessible beach Portimão",
      "Blue Flag Vau",
      "Praia do Alemão nearby",
      "Praia dos Careanos",
      "Praia da Rocha nearby",
      "Passeio Rocha Alemão"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Vau",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vau",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Portimão",
        "Copper-toned cliff setting",
        "Small attractive sandy beach",
        "Summer popularity",
        "Nearby settlement with restaurants",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Portimão - Praia do Vau",
      "source_url": "https://visitportimao.com/en/beaches/praia-do-vau/",
      "facts_verified": [
        "Praia do Vau as a Portimão beach",
        "Family appeal",
        "Easy pedestrian access",
        "Ochre cliffs, golden sand and clear water",
        "Eroded rock formations and small scenic corners",
        "Beach support, Blue Flag, nautical centre, showers, lifeguard, accessible beach with amphibious wheelchair, first-aid station, WC and sunshade area"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vau",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/vau/",
      "facts_verified": [
        "Official Vau coastal beach entry",
        "Municipality of Portimão",
        "Coordinates",
        "Beach code PTCF9H",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão - Qualidade da Água Balnear das Praias de Portimão",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho/qualidade-da-agua-balnear-das-praias-de-portimao",
      "facts_verified": [
        "Vau listed as a Portimão bathing water",
        "Beach code PTCF9H",
        "Water-quality classification shown as Excelente in the municipal table checked",
        "Municipal bathing-water context for Portimão beaches"
      ]
    },
    {
      "source_name": "Visit Portimão - Passeio Rocha - Alemão",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/passeio-rocha-alemao/",
      "facts_verified": [
        "Walking route between Praia da Rocha and Praia do Alemão",
        "Miocene cliff landscape",
        "Arches, caves and fossil-bearing limestone formations",
        "Possibility of walking along the sand at low tide",
        "Nearby beaches listed on the route"
      ]
    },
    {
      "source_name": "Visit Portimão - Praia do Alemão",
      "source_url": "https://visitportimao.com/praias/praia-do-alemao/",
      "facts_verified": [
        "Praia do Alemão as neighbouring beach west of Vau",
        "Ponta de João d’Arens boundary",
        "Natural cliff and pine setting",
        "Varandas sobre o Mar route reference"
      ]
    },
    {
      "source_name": "Visit Portimão - Praia dos Careanos",
      "source_url": "https://visitportimao.com/praias/praia-dos-careanos/",
      "facts_verified": [
        "Praia dos Careanos adjoining Vau",
        "Coastal stretch before Praia da Rocha",
        "Red, ochre and vivid cliff tones",
        "Rock formations and marine-fossil context",
        "Stair access at Careanos"
      ]
    },
    {
      "source_name": "EuroVelo Portugal - Praia do Vau",
      "source_url": "https://euroveloportugal.com/pt/poi/praia-do-vau-3",
      "facts_verified": [
        "Ochre and red cliff landscape around Vau",
        "Tourist equipment and Vau urbanisations behind the beach",
        "Cliff vulnerability to rain and sea contact",
        "Views towards Ponta João d’Arens",
        "Coordinates cross-reference"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, family appeal, cliff landscape, facilities, accessibility support, Blue Flag 2026 status and coordinates were verified from official tourism and ABAAE sources.",
    "The phrase “popular family beach” is supported by Visit Portimão’s description of Praia do Vau as a family favourite and VisitPortugal’s statement that it is very busy during summer.",
    "ABAAE verifies Vau’s 2026 bathing season and Blue Flag season as 1 June 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by VisitPortugal or Visit Portimão and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is verified at recognition level through VisitPortugal and supported by Visit Portimão’s amphibious-wheelchair listing, but current adapted equipment and assistance should be checked before visiting.",
    "Safety wording is cautious because cliff-backed beaches can be affected by erosion, and EuroVelo / regional material notes vulnerability in the surrounding cliffs.",
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
  where slug = 'portimao';

  if v_city_id is null then
    raise exception 'Portimão city was not found';
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
