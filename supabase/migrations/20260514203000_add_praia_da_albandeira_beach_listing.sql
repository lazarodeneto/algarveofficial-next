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
  'Porches',
  'porches',
  'Quiet Lagoa coastal parish known for cliffs, small beaches, heritage viewpoints and traditional pottery.',
  37.126,
  -8.392,
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
  v_slug text := 'praia-da-albandeira-lagoa';
  v_name text := 'Praia da Albandeira';
  v_alt_name text := 'Praia de Albandeira';
  v_address text := 'Praia da Albandeira, Porches, Lagoa, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/en/NR/exeres/23553692-F8A3-46D0-9D03-435E520875F1';
  v_latitude numeric := 37.091355;
  v_longitude numeric := -8.400453;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Albandeira",
  "slug": "praia-da-albandeira-lagoa",
  "aliases": [
    "Praia de Albandeira"
  ],
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Porches",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Albandeira is a small natural beach in Lagoa, set within a cliff-lined cove near Porches and the Benagil coastline. It is best visited for its intimate scale, limestone scenery and quiet coastal character, with practical planning needed in summer.",
  "full_description": "Praia da Albandeira is a compact natural beach on the Lagoa coast, close to Porches and the Benagil area. Official tourism sources describe it as a small maritime beach surrounded by cut limestone cliffs and unusual rock formations, while municipal tourism material classifies it as a natural beach and notes the narrow local road leading towards it.\n\nThe setting is one of the beach’s main appeals. A small rocky promontory divides the sand into two modest sections, creating a sheltered, intimate feel rather than the scale of a large resort beach. The approach passes through a rural coastal landscape of Mediterranean scrub and older dryland orchard areas, adding to the sense of arriving at a quieter corner of the central Algarve.\n\nVisitors should plan realistically. VisitPortugal lists outdoor parking and a bar, but opening, services and seasonal operation should be checked before travelling. Lagoa municipality has reported pressure along the Albandeira–Benagil coastal zone during busy periods, including circulation difficulties, disordered parking and overcrowding, so early arrival and off-peak timing are strongly recommended in summer.\n\nPraia da Albandeira works well as part of a scenic Lagoa coastal day, especially when combined with nearby Praia da Marinha, Benagil or the official Seven Hanging Valleys route. As with all cliff beaches in this part of the Algarve, visitors should keep a safe distance from cliff edges and follow local signage, sea-condition warnings and any instructions displayed on site.",
  "coordinates": {
    "latitude": 37.091355,
    "longitude": -8.400453,
    "label": "Praia da Albandeira",
    "notes": "Coordinates were verified from the Lagoa municipal tourism brochure.",
    "bathing_areas": [
      {
        "name": "Praia da Albandeira",
        "latitude": 37.091355,
        "longitude": -8.400453,
        "type": "Small natural cliff cove",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Small natural maritime beach / cliff cove",
  "landscape": "A compact sandy cove framed by limestone cliffs, with a small rocky promontory dividing the beach into two sandy areas. The approach is rural, passing Mediterranean scrub and older dryland orchard landscapes.",
  "access": "VisitPortugal lists access by car or motorcycle and on foot. Municipal tourism material describes the approach as a narrow road through rural coastal scenery. Final step, path and access conditions should be checked locally before visiting.",
  "highlights": [
    "Small natural beach set below limestone cliffs",
    "Two sandy sections divided by a rocky promontory",
    "Rural coastal approach through Mediterranean scrubland",
    "Close to Praia da Marinha and the Benagil coastal area",
    "Outdoor parking and bar listed by VisitPortugal",
    "Good base for scenic coastal photography when conditions are suitable"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Nature lovers",
    "Coastal walks",
    "Surfing and windsurfing where conditions permit"
  ],
  "facilities": [
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Lifeguard service", "status": "Not verified" },
    { "name": "Sunbeds or parasol rental", "status": "Not verified" },
    { "name": "Step-free accessibility", "status": "Not verified" }
  ],
  "includes": [
    "Outdoor parking",
    "Bar",
    "Small natural cove setting",
    "Limestone cliffs and rock formations",
    "Two sandy sections divided by a promontory",
    "Nearby Lagoa coastal walking context",
    "Surfing and windsurfing listed by VisitPortugal where conditions permit"
  ],
  "important_information": {
    "best_time_to_visit": "Spring and autumn are especially suitable for nearby coastal walking. In summer, early morning or late afternoon is preferable to reduce heat, parking pressure and peak visitor demand.",
    "know_before_you_go": "Parking and access pressure can occur in the wider Albandeira–Benagil coastal area during busy periods.\nFacilities may be seasonal; verify current operation before travelling.\nSea conditions can vary and visitors should check local signage before entering the water.\nKeep a safe distance from cliff edges and cliff bases due to natural instability risks along this type of coastline.\nNo current official Blue Flag status, dog rules, sunbed rental or season-specific lifeguard information was verified for this listing.",
    "notes": [
      "Parking and access pressure can occur in the wider Albandeira–Benagil coastal area during busy periods.",
      "Facilities may be seasonal; verify current operation before travelling.",
      "Sea conditions can vary and visitors should check local signage before entering the water.",
      "Keep a safe distance from cliff edges and cliff bases due to natural instability risks along this type of coastline.",
      "No current official Blue Flag status, dog rules, sunbed rental or season-specific lifeguard information was verified for this listing."
    ]
  },
  "important_notes": "Parking and access pressure can occur in the wider Albandeira–Benagil coastal area during busy periods.\nFacilities may be seasonal; verify current operation before travelling.\nSea conditions can vary and visitors should check local signage before entering the water.\nKeep a safe distance from cliff edges and cliff bases due to natural instability risks along this type of coastline.\nNo current official Blue Flag status, dog rules, sunbed rental or season-specific lifeguard information was verified for this listing.",
  "best_time_to_visit": "Spring and autumn are especially suitable for nearby coastal walking. In summer, early morning or late afternoon is preferable to reduce heat, parking pressure and peak visitor demand.",
  "suitable_for": [
    "Visitors looking for a small natural beach",
    "Photographers and coastal scenery seekers",
    "Couples and adults comfortable with compact coves",
    "Nature-focused visitors exploring the Lagoa coast",
    "Walkers combining the beach with nearby official routes"
  ],
  "not_suitable_for": [
    "Visitors needing fully verified step-free access",
    "Visitors seeking a large, fully serviced resort beach",
    "Visitors who require confirmed year-round facilities",
    "Anyone unwilling to follow cliff, sea and local safety signage"
  ],
  "nearby_attractions": [
    {
      "name": "Praia da Marinha",
      "type": "Beach",
      "description": "A well-known natural beach in Lagoa, close to the Seven Hanging Valleys route and part of the same dramatic limestone coastline.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Benagil",
      "type": "Beach / coastal village",
      "description": "A small maritime beach in Lagoa associated with fishing boats, cliffs, caves and boat trips along the coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Percurso dos Sete Vales Suspensos",
      "type": "Walking trail",
      "description": "Official Lagoa walking route linking Praia de Vale Centeanes and Praia da Marinha along cliff scenery and hanging valleys.",
      "verification_status": "Verified"
    },
    {
      "name": "Capela da Nossa Senhora da Rocha",
      "type": "Chapel / viewpoint area",
      "description": "A recognised Porches point of interest on the nearby coastline, often combined with visits to beaches around Senhora da Rocha.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Senhora da Rocha",
      "type": "Beach",
      "description": "Nearby Porches beach listed by the local parish authority among places to visit in the area.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Porches",
    "Lagoa",
    "Carvoeiro",
    "Armação de Pêra",
    "Benagil"
  ],
  "walking_trails_nearby": [
    {
      "name": "Percurso dos Sete Vales Suspensos",
      "description": "Official Lagoa nature walking route of 5.7 km linking Praia de Vale Centeanes to Praia da Marinha, with limestone cliffs, hanging valleys and coastal habitats. Praia da Albandeira is nearby rather than listed as one of the main official trailheads.",
      "verification_status": "Verified"
    },
    {
      "name": "Local coastal paths around Albandeira",
      "description": "Informal coastal walking options may exist around Albandeira and neighbouring coves, but route status, safety and official maintenance were not fully verified.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in summer to reduce parking and access pressure.",
    "Bring water, sun protection and suitable footwear for uneven coastal terrain.",
    "Check local signs, flags and sea conditions before swimming.",
    "Do not stand close to cliff edges or directly beneath cliff faces.",
    "Verify seasonal facilities before planning a full beach day."
  ],
  "photography_notes": "Praia da Albandeira is strong for cliff, cove and natural rock photography, especially in softer morning or late-afternoon light. Use authorised viewpoints and keep well back from cliff edges.",
  "family_notes": "The beach’s small scale may appeal to families seeking a quieter cove, but suitability depends on sea conditions, access, seasonal crowding and verified facilities. Children should be closely supervised near rocks, cliffs and the water.",
  "safety_notes": "Sea conditions can vary. Visitors should follow local signage, keep distance from cliff edges and cliff bases, avoid risky rock scrambling, and confirm whether any lifeguard service is operating during the visit.",
  "accessibility_notes": "Accessibility information is not fully verified. Visitors with reduced mobility should confirm current access conditions before visiting, especially because this is a small cliff cove reached by a narrow local road.",
  "seo": {
    "meta_title": "Praia da Albandeira, Lagoa | Algarve Beach",
    "meta_description": "Discover Praia da Albandeira in Lagoa: a small natural Algarve cove with cliffs, blue water, nearby coastal walks and practical visitor tips.",
    "keywords": [
      "Praia da Albandeira",
      "Praia de Albandeira",
      "Albandeira beach",
      "Lagoa beaches",
      "Porches beach",
      "Algarve beaches",
      "Portugal beaches",
      "natural beach Lagoa",
      "Seven Hanging Valleys nearby",
      "Praia da Marinha nearby"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Albandeira",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/23553692-F8A3-46D0-9D03-435E520875F1",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location listed as Benagil - Lagoa",
        "Small sandy beach surrounded by cliffs and unusual formations",
        "Outdoor parking listed",
        "Bar listed",
        "Surfing and windsurfing listed",
        "Access by car or motorcycle and on foot listed",
        "Average summer seawater temperature listed as 20-22 ºC"
      ]
    },
    {
      "source_name": "Lagoa Municipal Tourism Brochure - Our Beaches",
      "source_url": "https://portal.oa.pt/media/124556/folheto-turistico-da-regiao-de-lagoa_algarve-i.pdf",
      "facts_verified": [
        "Natural beach classification",
        "GPS coordinates 37.091355, -8.400453",
        "Narrow access road",
        "Mediterranean scrub and rural coastal approach",
        "Small promontory dividing the beach into two sandy areas",
        "Cliff-framed landscape",
        "General coastal safety recommendations"
      ]
    },
    {
      "source_name": "Município de Lagoa - Coastal management between Albandeira and Benagil",
      "source_url": "https://www.cm-lagoa.pt/noticia/municipio-de-lagoa-reune-com-varias-entidades-para-ordenar-zona-costeira-entre-albandeira-e-benagil",
      "facts_verified": [
        "Albandeira-Benagil coastal zone identified by municipality",
        "Reported concerns over circulation, disordered parking, sensitive areas, small accidents and overcrowding",
        "Need for sustainable and safe coastal management"
      ]
    },
    {
      "source_name": "Município de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official walking route in Lagoa",
        "5.7 km route between Praia de Vale Centeanes and Praia da Marinha",
        "Cliff and hanging valley landscape",
        "Geological, landscape and habitat value of the route"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Porches - Pontos de Interesse",
      "source_url": "https://www.jf-porches.pt/freguesia/locais-a-visitar",
      "facts_verified": [
        "Praia de Albandeira listed among Porches places to visit",
        "Nearby Praia da Senhora da Rocha listed",
        "Capela da Nossa Senhora da Rocha listed"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Porches - Percurso dos 7 Vales Suspensos",
      "source_url": "https://www.jf-porches.pt/freguesia/trilhos/1-percurso_dos_7_vales_suspensos",
      "facts_verified": [
        "Seven Hanging Valleys route data",
        "Linear route type",
        "11.20 km return distance",
        "Medium difficulty",
        "Spring and autumn recommended for the trail",
        "Advice to avoid very hot, rainy or windy days"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, maritime/natural beach classification, landscape and coordinates were verified from official tourism and municipal sources.",
    "VisitPortugal verifies outdoor parking and a bar, but current opening, capacity and seasonality were not verified.",
    "Current lifeguard service, toilets, dog rules, sunbed rental, Blue Flag status and step-free accessibility were not verified from official current sources.",
    "Lagoa municipality reported 2025 pressure in the Albandeira-Benagil coastal area, including traffic, disordered parking and overcrowding; peak-season caution has therefore been included.",
    "Official sources refer to the beach in both Benagil-Lagoa and Porches contexts. Porches is used as the local city/area, with Lagoa as the concelho; exact parish boundary may be manually confirmed if required for database taxonomy.",
    "Some information could not be verified from authoritative sources. I have left those fields blank or marked them as Not verified."
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
  where slug = 'porches';

  if v_city_id is null then
    raise exception 'Porches city was not found';
  end if;

  select id, slug, tier, category_id
    into v_listing_id, v_old_slug, v_existing_tier, v_existing_category_id
  from public.listings
  where slug = v_slug
     or lower(name) = lower(v_name)
     or lower(name) = lower(v_alt_name)
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
