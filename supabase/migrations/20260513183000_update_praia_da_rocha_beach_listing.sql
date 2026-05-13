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
  'Praia da Rocha / Portimão',
  'praia-da-rocha-portimao',
  'Portimão resort-beach area around Praia da Rocha, the seafront avenue, Santa Catarina Fortress and the marina side of the Arade coast.',
  37.11773,
  -8.53642,
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
  v_slug text := 'praia-da-rocha-portimao';
  v_name text := 'Praia da Rocha';
  v_short_description text := $short$
Praia da Rocha is a landmark resort beach in Portimão, known for its broad sandy shore, ochre cliffs and lively seafront setting. It is one of the Algarve's busiest and best-known beach resorts, especially during the summer season.
$short$;
  v_description text := $description$
Praia da Rocha is one of Portimão's defining coastal places and among the Algarve's most established resort beaches. Set near the mouth of the River Arade, it combines a wide stretch of golden sand with warm-coloured cliffs, sculpted rock formations and a long seafront avenue lined with hotels, restaurants, bars and visitor services.

The beach is especially suited to visitors who want convenience, space and atmosphere rather than seclusion. Official tourism sources describe Praia da Rocha as one of the Algarve's most emblematic beaches and one of southern Portugal's most popular seaside resorts. During the day, the broad sand, wooden walkways and beach-support infrastructure make it practical for long beach days, while the surrounding resort area becomes especially lively in the evening.

Praia da Rocha also has strong visual appeal. The Santa Catarina Fortress and the Três Castelos viewpoint offer elevated views over the beach, cliffs, marina area and coastline towards the west. On the sand, visitors can expect an active beach environment with seasonal support services and designated sports areas.

Because this is a major resort beach, it can become very busy in high season, particularly near the main access points and seafront avenue. Visitors looking for a quieter experience may prefer early mornings, late afternoons or shoulder-season visits. Sea and beach conditions can vary, so local flags, signs and official guidance should always be followed.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Rocha",
  "slug": "praia-da-rocha-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Praia da Rocha / Portimão",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Rocha is a landmark resort beach in Portimão, known for its broad sandy shore, ochre cliffs and lively seafront setting. It is one of the Algarve's busiest and best-known beach resorts, especially during the summer season.",
  "full_description": "Praia da Rocha is one of Portimão's defining coastal places and among the Algarve's most established resort beaches. Set near the mouth of the River Arade, it combines a wide stretch of golden sand with warm-coloured cliffs, sculpted rock formations and a long seafront avenue lined with hotels, restaurants, bars and visitor services.\n\nThe beach is especially suited to visitors who want convenience, space and atmosphere rather than seclusion. Official tourism sources describe Praia da Rocha as one of the Algarve's most emblematic beaches and one of southern Portugal's most popular seaside resorts. During the day, the broad sand, wooden walkways and beach-support infrastructure make it practical for long beach days, while the surrounding resort area becomes especially lively in the evening.\n\nPraia da Rocha also has strong visual appeal. The Santa Catarina Fortress and the Três Castelos viewpoint offer elevated views over the beach, cliffs, marina area and coastline towards the west. On the sand, visitors can expect an active beach environment with seasonal support services and designated sports areas.\n\nBecause this is a major resort beach, it can become very busy in high season, particularly near the main access points and seafront avenue. Visitors looking for a quieter experience may prefer early mornings, late afternoons or shoulder-season visits. Sea and beach conditions can vary, so local flags, signs and official guidance should always be followed.",
  "coordinates": {
    "latitude": 37.11773,
    "longitude": -8.53642,
    "notes": "Coordinates are taken from the ABAAE Rocha beach profile and represent the official beach area point, not necessarily every access point along the sand."
  },
  "beach_type": "Large sandy maritime resort beach",
  "landscape": "A broad golden-sand beach beside the River Arade mouth, backed by ochre cliffs, sculpted rock formations, wooden walkways and a developed resort seafront.",
  "access": "Official sources describe Praia da Rocha as having beach-support infrastructure, wooden walkways across the sand and multiple connections from the seafront avenue and marina area. Visitors should expect easier access than at many cliff-backed Algarve beaches, but should still confirm the most suitable access point before visiting.",
  "highlights": [
    "One of Portimão's most emblematic and best-known beaches",
    "Wide sandy beach backed by warm ochre cliffs and rock formations",
    "Major resort setting with restaurants, bars, accommodation and nightlife nearby",
    "Long wooden walkways and beach-support infrastructure",
    "Nearby views from Santa Catarina Fortress and Três Castelos viewpoint",
    "Official 2026 Blue Flag season listed by ABAAE"
  ],
  "best_for": [
    "Resort beach days",
    "Families",
    "Couples",
    "Groups",
    "Long beach walks",
    "Photography",
    "Beach sports",
    "Nightlife nearby",
    "First-time Algarve visitors"
  ],
  "facilities": [
    { "name": "Beach support", "status": "Verified" },
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Lifeguard / surveillance", "status": "Seasonal" },
    { "name": "First aid station", "status": "Verified / Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "WC", "status": "Verified" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Sunshade area / sunshade rental", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bars and restaurants", "status": "Verified" },
    { "name": "Nautical centre / light boat rental", "status": "Seasonal" },
    { "name": "Beach sports area", "status": "Verified" }
  ],
  "includes": [
    "Beach support",
    "Seasonal Blue Flag 2026 listing",
    "Seasonal lifeguard / surveillance",
    "First aid station",
    "Accessible beach designation",
    "WC",
    "Showers",
    "Seasonal sunshade area / sunshade rental",
    "Car parking",
    "Bars and restaurants",
    "Seasonal nautical centre / light boat rental",
    "Beach sports area"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full resort atmosphere; spring, early summer and early autumn are usually better for a calmer beach walk or photography-focused visit.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Rocha as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Rocha as 1 June 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Rocha is a major resort beach and can become very busy during peak summer.\nFacilities and beach-support services may be seasonal and should be checked before visiting outside the main bathing season.\nVisitors should keep a safe distance from cliffs and rock formations.\nSea conditions can vary; always follow beach flags, local signage and official safety guidance.\nThe surrounding resort area is lively, especially in summer evenings.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Rocha as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Rocha as 1 June 2026 to 30 September 2026.",
      "At the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Praia da Rocha is a major resort beach and can become very busy during peak summer.",
      "Facilities and beach-support services may be seasonal and should be checked before visiting outside the main bathing season.",
      "Visitors should keep a safe distance from cliffs and rock formations.",
      "Sea conditions can vary; always follow beach flags, local signage and official safety guidance.",
      "The surrounding resort area is lively, especially in summer evenings."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Rocha as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Rocha as 1 June 2026 to 30 September 2026.\nAt the time of verification, the ABAAE page showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nPraia da Rocha is a major resort beach and can become very busy during peak summer.\nFacilities and beach-support services may be seasonal and should be checked before visiting outside the main bathing season.\nVisitors should keep a safe distance from cliffs and rock formations.\nSea conditions can vary; always follow beach flags, local signage and official safety guidance.\nThe surrounding resort area is lively, especially in summer evenings.",
  "best_time_to_visit": "June to September for the official bathing season and full resort atmosphere; spring, early summer and early autumn are usually better for a calmer beach walk or photography-focused visit.",
  "suitable_for": [
    "Visitors who want a lively resort beach",
    "Families using serviced beach areas",
    "Couples wanting a beach with restaurants and evening atmosphere nearby",
    "Groups",
    "Beach walkers",
    "Photographers",
    "Visitors staying in Portimão or Praia da Rocha"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet or undeveloped beach",
    "Visitors wanting a remote nature setting",
    "Those who prefer to avoid busy summer resort areas",
    "Visitors sensitive to nightlife and high-season crowds"
  ],
  "nearby_attractions": [
    {
      "name": "Fortaleza de Santa Catarina",
      "type": "Historic fort and viewpoint",
      "description": "A historic coastal fortress at the eastern side of Praia da Rocha, offering views over the beach, River Arade and marina area.",
      "verification_status": "Verified"
    },
    {
      "name": "Miradouro dos Três Castelos",
      "type": "Viewpoint",
      "description": "A western viewpoint above Praia da Rocha and Praia dos Três Castelos, useful for coastal views and photography.",
      "verification_status": "Verified"
    },
    {
      "name": "Marina de Portimão",
      "type": "Marina",
      "description": "A nearby marina area close to the eastern end of Praia da Rocha, linked with restaurants, marina walks and nautical activity.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia dos Três Castelos",
      "type": "Nearby beach",
      "description": "A neighbouring beach west of Praia da Rocha, known for golden sand, rock formations and access from the Três Castelos viewpoint area.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Marina de Portimão",
      "type": "Nearby beach",
      "description": "A smaller beach by the River Arade mouth and marina area, separated from Praia da Rocha by the western harbour breakwater.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Portimão",
    "Praia da Rocha",
    "Ferragudo",
    "Alvor"
  ],
  "walking_trails_nearby": [
    {
      "name": "Praia da Rocha seafront and beach walkway",
      "description": "Official municipal information describes a long walkway running across the beach area, connecting the sand with the seafront, marina-side facilities and resort avenue.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Rocha to Três Castelos coastal walk",
      "description": "A short coastal walk west towards Praia dos Três Castelos, with viewpoint scenery and cliff-backed beach sections nearby.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient beach areas.",
    "Use the wooden walkways where available to move across the wide sand more comfortably.",
    "For a quieter feel, visit in the morning, late afternoon or outside peak summer.",
    "Use Santa Catarina Fortress or Três Castelos viewpoint for elevated beach photographs.",
    "Check official beach flags before swimming.",
    "Expect a lively resort atmosphere rather than a secluded beach experience."
  ],
  "photography_notes": "Praia da Rocha photographs well from the sand, the Três Castelos viewpoint and the Santa Catarina Fortress area. Early morning and late afternoon light are especially useful for capturing the cliffs and beach scale.",
  "family_notes": "Praia da Rocha can suit families who want a serviced beach with easy resort facilities nearby. Families should still check local flags, seasonal supervision and sea conditions before entering the water.",
  "safety_notes": "Praia da Rocha is a busy resort beach with seasonal safety infrastructure listed by official sources. Visitors should follow local signage, respect beach flags, avoid cliff bases and take care near rock formations.",
  "accessibility_notes": "Official tourism sources list Praia da Rocha as an accessible beach. Visitors with reduced mobility should still confirm the most suitable access point and current seasonal support conditions before visiting.",
  "seo": {
    "meta_title": "Praia da Rocha, Portimão | Algarve Beach Guide",
    "meta_description": "Praia da Rocha in Portimão is a lively Algarve resort beach with wide sand, ochre cliffs, facilities, views and a famous seafront.",
    "keywords": [
      "Praia da Rocha",
      "Praia da Rocha Portimão",
      "Portimão beach",
      "Algarve resort beach",
      "Algarve beaches",
      "Portugal beaches",
      "Praia da Rocha beach guide",
      "Portimão Algarve",
      "Santa Catarina Fortress",
      "Três Castelos viewpoint"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Rocha trip ideas",
      "links": [
        { "label": "Praia da Rocha" },
        { "label": "Praia da Rocha Portimão" },
        { "label": "Portimão beach" },
        { "label": "Algarve resort beach" },
        { "label": "Praia da Rocha beach guide" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Santa Catarina Fortress" },
        { "label": "Três Castelos viewpoint" },
        { "label": "Marina de Portimão" },
        { "label": "Praia dos Três Castelos" },
        { "label": "Ferragudo" },
        { "label": "Alvor" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "Visit Portimão - Praia da Rocha",
      "source_url": "https://visitportimao.com/en/beaches/praia-da-rocha/",
      "facts_verified": [
        "Beach name and location",
        "Praia da Rocha as one of the Algarve's emblematic beaches",
        "Beach length over one kilometre",
        "Warm-coloured cliffs",
        "Wooden walkways",
        "Bars, restaurants and sports area",
        "Nearby Santa Catarina Fortress and Três Castelos viewpoint",
        "Beach facilities including Blue Flag, lifeguard, first aid, accessible beach, WC and sunshade area"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Rocha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-rocha",
      "facts_verified": [
        "Praia da Rocha in Portimão",
        "Maritime beach classification",
        "Approximate three-kilometre sandy shore",
        "Location near the River Arade mouth",
        "Popularity as one of southern Portugal's busiest seaside resorts",
        "Sports activities and services including parking, bar, restaurant, showers, sunshade rental and accessible beach"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Rocha",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/rocha/",
      "facts_verified": [
        "Official Rocha beach entry",
        "Municipality of Portimão",
        "Coastal beach classification",
        "Coordinates",
        "2026 bathing season",
        "2026 Blue Flag season"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão - Praias do Concelho",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho",
      "facts_verified": [
        "Praia da Rocha as one of Portimão's most emblematic beaches",
        "Beach requalification",
        "Walkway across the beach area",
        "Sports area",
        "Seafront avenue with hotels, bars, restaurants, nightlife and casino",
        "Public facilities listed by the municipality"
      ]
    },
    {
      "source_name": "Junta de Freguesia de Portimão - Praia da Rocha",
      "source_url": "https://www.jf-portimao.pt/praia-da-rocha/",
      "facts_verified": [
        "Praia da Rocha as a well-known and busy beach for national and international tourists",
        "Approximate three-kilometre sandy beach reference",
        "Restaurants, bars, casino and nightlife on the seafront"
      ]
    },
    {
      "source_name": "Visit Portimão - Rocha Beach Sports Area",
      "source_url": "https://visitportimao.com/en/what-to-do/fun-and-leisure/rocha-beach-sports-area/",
      "facts_verified": [
        "Sports area located on Praia da Rocha sand",
        "Beach football, volleyball, basketball and gymnastics activities",
        "Location close to the breakwater separating the beach from the marina"
      ]
    },
    {
      "source_name": "Visit Portimão - Fortaleza de Santa Catarina",
      "source_url": "https://visitportimao.com/portimao-2/fortaleza-de-santa-catarina/",
      "facts_verified": [
        "Fortaleza de Santa Catarina as a visitor point at Praia da Rocha",
        "Historic and viewpoint relevance"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia dos Três Castelos",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-tr%C3%AAs-castelos",
      "facts_verified": [
        "Praia dos Três Castelos as a neighbouring beach beside Praia da Rocha",
        "Connection between the two beaches"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia da Marina de Portimão",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marina-de-portim%C3%A3o",
      "facts_verified": [
        "Praia da Marina de Portimão near the River Arade mouth",
        "Separation from Praia da Rocha by the harbour breakwater",
        "Pedestrian and cycling route through the marina area"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, beach type, major resort character, cliff landscape, facilities and nearby attractions were verified from official tourism, municipal and ABAAE sources.",
    "The listing uses cautious wording for popularity, describing Praia da Rocha as one of the Algarve's busiest resort beaches based on VisitPortugal and local official descriptions.",
    "Blue Flag information is season-specific. ABAAE lists the 2026 bathing and Blue Flag season as 1 June 2026 to 30 September 2026; current status should be checked during publication updates.",
    "Facilities are included only where verified from official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is listed by official tourism sources, but visitors with reduced mobility should confirm the most suitable access point before visiting.",
    "No prohibited third-party platform names, public review scores or unsupported ranking claims were included in the public listing text."
  ]
}
$json$::jsonb;
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
  where slug = 'praia-da-rocha-portimao'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city praia-da-rocha-portimao was not found';
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
      'https://visitportimao.com/en/beaches/praia-da-rocha/',
      'Praia da Rocha, Portimão, Algarve, Portugal',
      37.11773,
      -8.53642,
      array[
        'Praia da Rocha',
        'Praia da Rocha Portimão',
        'Portimão beach',
        'Algarve resort beach',
        'Algarve beaches',
        'Portugal beaches',
        'Praia da Rocha beach guide',
        'Portimão Algarve',
        'Santa Catarina Fortress',
        'Três Castelos viewpoint'
      ],
      v_category_data,
      'Praia da Rocha, Portimão | Algarve Beach Guide',
      'Praia da Rocha in Portimão is a lively Algarve resort beach with wide sand, ochre cliffs, facilities, views and a famous seafront.',
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
      website_url = 'https://visitportimao.com/en/beaches/praia-da-rocha/',
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
      address = 'Praia da Rocha, Portimão, Algarve, Portugal',
      latitude = 37.11773,
      longitude = -8.53642,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Rocha',
        'Praia da Rocha Portimão',
        'Portimão beach',
        'Algarve resort beach',
        'Algarve beaches',
        'Portugal beaches',
        'Praia da Rocha beach guide',
        'Portimão Algarve',
        'Santa Catarina Fortress',
        'Três Castelos viewpoint'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Rocha, Portimão | Algarve Beach Guide',
      meta_description = 'Praia da Rocha in Portimão is a lively Algarve resort beach with wide sand, ochre cliffs, facilities, views and a famous seafront.',
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
