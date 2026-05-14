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
  'Alvor',
  'alvor',
  'Coastal village in Portimão beside the Ria de Alvor, resort beaches and boardwalk routes.',
  37.123,
  -8.593,
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
  v_slug text := 'praia-da-prainha-portimao';
  v_name text := 'Praia da Prainha';
  v_address text := 'Praia da Prainha, Alvor, Portimão, Algarve, Portugal';
  v_website_url text := 'https://visitportimao.com/praias/prainha/';
  v_latitude numeric := null;
  v_longitude numeric := null;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Prainha",
  "slug": "praia-da-prainha-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Alvor",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Prainha is a scenic cove cluster in Alvor, Portimão, known for small shell-shaped sands divided by sculpted rock formations. It is one of the most distinctive cliff-and-cove settings on the Alvor coastline, but visitors should treat safety and access conditions with care.",
  "full_description": "Praia da Prainha sits near Alvor in the municipality of Portimão, close to the eastern end of Praia dos Três Irmãos. Rather than a single open stretch of sand, it is formed by small sandy coves separated by deeply sculpted rock formations. The setting includes arches, sea stacks, chasms and caves shaped by fresh and salt water, giving the beach a more intimate, enclosed character than the broader Alvor sands nearby.\n\nThis is a highly scenic place for photography, quiet beach time and exploring the dramatic Portimão cliff coastline. Visit Portimão describes Prainha as one of the region’s more intimate beaches, while also warning that rockfalls and falling stones are common. The beach is classified as limited-use because almost the whole sandy area lies within a rockfall-risk zone, so visitors should keep away from cliff faces and avoid unsafe corners or overhangs.\n\nAt low tide, Praia dos Três Irmãos gives access towards Prainha through rocky coves and chasms, but this should only be considered when tide and sea conditions are safe. The surrounding area connects naturally with the Alvor coastline, Praia dos Três Irmãos and the Varandas Sobre o Mar clifftop route, making it a strong choice for visitors who value coastal scenery over extensive beach infrastructure.\n\nFacilities are listed by Visit Portimão, but the municipality states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to bather safety and risk issues. For publication, all facilities, lifeguard presence, water-status and safe access should be manually confirmed before encouraging swimming or family beach use.",
  "coordinates": {
    "latitude": null,
    "longitude": null,
    "label": "Praia da Prainha",
    "notes": "Coordinates were not included because no authoritative current source was verified during this check.",
    "verification_status": "Not verified",
    "bathing_areas": []
  },
  "beach_type": "Limited-use maritime cove beach",
  "landscape": "A cluster of small shell-shaped sandy coves beneath cliffs, divided by eroded limestone rock formations, arches, sea stacks, chasms and caves.",
  "access": "Access is closely linked with the Alvor / Três Irmãos coastline. Visit Portimão notes that low tide gives access to Prainha from Praia dos Três Irmãos through coves and chasms, but this requires caution. Current access routes, tide conditions and safety restrictions should be checked locally before visiting.",
  "highlights": [
    "Small sandy coves separated by sculpted rock formations",
    "Arches, sea stacks, chasms and caves along the shore",
    "Close to Praia dos Três Irmãos and the Alvor coastline",
    "Scenic setting for photography and coastal viewpoints",
    "Nearby clifftop walking options towards Varandas Sobre o Mar",
    "Marine life noted around the rocky coves below the tide line"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Nature lovers",
    "Coastal walks",
    "Quiet beach scenery",
    "Rocky-cove landscapes"
  ],
  "facilities": [
    { "name": "Beach support", "status": "Seasonal / verify before visiting" },
    { "name": "Showers", "status": "Seasonal / verify before visiting" },
    { "name": "Lifeguard", "status": "Seasonal / verify before visiting" },
    { "name": "First-aid post", "status": "Seasonal / verify before visiting" },
    { "name": "WC", "status": "Seasonal / verify before visiting" },
    { "name": "Sunshade area", "status": "Seasonal / verify before visiting" },
    { "name": "Blue Flag", "status": "Not verified" },
    { "name": "Parking", "status": "Not verified" },
    { "name": "Accessible beach designation", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal beach support, subject to confirmation",
    "Seasonal showers, subject to confirmation",
    "Seasonal lifeguard, subject to confirmation",
    "Seasonal first-aid post, subject to confirmation",
    "Seasonal WC, subject to confirmation",
    "Seasonal sunshade area, subject to confirmation",
    "Limited-use cove beach setting",
    "Rock formations, arches, chasms and caves",
    "Nearby low-tide connection to Três Irmãos, conditions permitting"
  ],
  "important_information": {
    "best_time_to_visit": "Late spring and early autumn are best for photography and a quieter coastal experience. Summer may bring more visitors and seasonal services, but safety, access and bathing-water status should be checked locally before visiting.",
    "know_before_you_go": "Visit Portimão classifies Prainha as a limited-use beach because almost the whole sandy area is within a rockfall-risk zone.\nThe municipality states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.\nRockfalls and falling stones are specifically warned about by official Portimão tourism information.\nKeep a safe distance from cliffs, cave mouths, overhangs and unstable rock faces.\nLow-tide access from Praia dos Três Irmãos is described by official sources, but visitors should only attempt this with safe tide and sea conditions.\nFacilities listed by Visit Portimão should be treated as seasonal and manually verified before publication.\nSea conditions can vary; visitors should check local signage before entering the water.",
    "notes": [
      "Visit Portimão classifies Prainha as a limited-use beach because almost the whole sandy area is within a rockfall-risk zone.",
      "The municipality states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.",
      "Rockfalls and falling stones are specifically warned about by official Portimão tourism information.",
      "Keep a safe distance from cliffs, cave mouths, overhangs and unstable rock faces.",
      "Low-tide access from Praia dos Três Irmãos is described by official sources, but visitors should only attempt this with safe tide and sea conditions.",
      "Facilities listed by Visit Portimão should be treated as seasonal and manually verified before publication.",
      "Sea conditions can vary; visitors should check local signage before entering the water."
    ]
  },
  "important_notes": "Visit Portimão classifies Prainha as a limited-use beach because almost the whole sandy area is within a rockfall-risk zone.\nThe municipality states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.\nRockfalls and falling stones are specifically warned about by official Portimão tourism information.\nKeep a safe distance from cliffs, cave mouths, overhangs and unstable rock faces.\nLow-tide access from Praia dos Três Irmãos is described by official sources, but visitors should only attempt this with safe tide and sea conditions.\nFacilities listed by Visit Portimão should be treated as seasonal and manually verified before publication.\nSea conditions can vary; visitors should check local signage before entering the water.",
  "best_time_to_visit": "Late spring and early autumn are best for photography and a quieter coastal experience. Summer may bring more visitors and seasonal services, but safety, access and bathing-water status should be checked locally before visiting.",
  "suitable_for": [
    "Visitors seeking scenic coves near Alvor",
    "Photographers",
    "Couples",
    "Nature-focused travellers",
    "Coastal walkers",
    "Visitors comfortable with rocky, cliff-backed settings"
  ],
  "not_suitable_for": [
    "Visitors seeking a fully verified bathing beach",
    "Visitors needing accessible beach infrastructure",
    "Families wanting a simple, low-risk beach day",
    "Visitors uncomfortable with cliffs, caves, rocks or tide-dependent access",
    "Anyone seeking extensive confirmed year-round facilities"
  ],
  "nearby_attractions": [
    {
      "name": "Praia dos Três Irmãos",
      "type": "Beach",
      "description": "A neighbouring Alvor beach with a long sandy setting and sculpted cliffs on its eastern side. Official sources note that low tide can give access from Três Irmãos towards Prainha.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Alvor",
      "type": "Beach",
      "description": "The broad Alvor beach and sand-bar area west of Três Irmãos, close to the Ria de Alvor landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Ria de Alvor",
      "type": "Lagoon / nature area",
      "description": "A nearby lagoon and marshland system associated with dunes, birdlife and traditional fishing and shellfish-gathering communities.",
      "verification_status": "Verified"
    },
    {
      "name": "Alvor",
      "type": "Town",
      "description": "A historic coastal town near Portimão, known for its streets, fishing character, heritage and views towards the Ria de Alvor.",
      "verification_status": "Verified"
    },
    {
      "name": "Ponta de João d’Arens",
      "type": "Coastal headland / rock formation",
      "description": "A scenic rocky coastal area east of Prainha, associated with Portimão’s clifftop nature routes and sculpted limestone coastline.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Alvor",
    "Portimão",
    "Praia do Vau",
    "Praia da Rocha"
  ],
  "walking_trails_nearby": [
    {
      "name": "Varandas Sobre o Mar",
      "description": "An official Portimão route following the rocky coast along the top of Miocene limestone cliffs, with coastal vegetation, birds and viewpoints. It runs through the wider cliff landscape near Prainha and João d’Arens.",
      "verification_status": "Verified"
    },
    {
      "name": "Passeio Três Irmãos - Alvor",
      "description": "An official Portimão coastal walk between Praia dos Três Irmãos and Alvor, passing dune systems and seafront scenery. Visitors should use marked paths and avoid damaging fragile dunes.",
      "verification_status": "Verified"
    },
    {
      "name": "Ao Sabor da Maré",
      "description": "An official nature route around the Alvor and Meia Praia dune and lagoon environment, focused on dunes, marshland, wildlife and Ria de Alvor landscapes.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Check the tide before visiting, especially if approaching from Praia dos Três Irmãos.",
    "Do not explore beneath unstable cliffs, caves or overhangs.",
    "Use clifftop viewpoints and safe marked paths for photography where available.",
    "Verify local bathing status and safety signage before swimming.",
    "Bring suitable footwear for rocky or uneven approaches.",
    "Consider combining Prainha with Praia dos Três Irmãos, Alvor and the nearby nature routes."
  ],
  "photography_notes": "Prainha is especially strong for coastal photography: small coves, limestone arches, sea stacks, cliff textures and narrow views between rock formations. The safest images are usually taken from open sand areas or secure viewpoints rather than beneath cliffs or inside caves.",
  "family_notes": "This beach should be approached cautiously for families. Although scenic and close to Alvor, official sources warn of rockfall risk and limited-use classification. Families should consider nearby beaches with clearer bathing status and simpler access unless current safety conditions are confirmed.",
  "safety_notes": "Official Portimão sources warn that rockfalls and falling stones are common at Prainha. Keep away from cliff bases, unstable rock faces, cave interiors and cliff edges. The municipality also states that Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 for risk and bather-safety reasons.",
  "accessibility_notes": "Accessibility information is not fully verified. The beach has rocky coves, cliff surroundings and tide-sensitive access, so visitors with reduced mobility should confirm current access conditions before visiting.",
  "seo": {
    "meta_title": "Praia da Prainha, Portimão | Alvor Cove Beach",
    "meta_description": "Discover Praia da Prainha in Alvor, Portimão: a scenic Algarve cove beach with cliffs, arches, caves, safety notes and nearby walks.",
    "keywords": [
      "Praia da Prainha",
      "Prainha Alvor",
      "Praia da Prainha Portimão",
      "Alvor beach",
      "Portimão beach",
      "Algarve cove beach",
      "Portugal beaches",
      "Praia dos Três Irmãos",
      "Ria de Alvor",
      "Varandas Sobre o Mar"
    ]
  },
  "sources_used": [
    {
      "source_name": "Visit Portimão – Prainha",
      "source_url": "https://visitportimao.com/praias/prainha/",
      "facts_verified": [
        "Beach name and Portimão tourism listing",
        "Small shell-shaped sandy coves",
        "Rock formations shaped by fresh and salt water",
        "Arches, sea stacks, chasms and caves",
        "Rockfall warning and cliff-safety advice",
        "Limited-use beach classification due to rockfall risk",
        "Marine life around rocky coves",
        "Listed facilities: beach support, showers, lifeguard, first-aid post, WC and sunshade area"
      ]
    },
    {
      "source_name": "Visit Portimão – Prainha English page",
      "source_url": "https://visitportimao.com/en/beaches/prainha/",
      "facts_verified": [
        "English confirmation of beach character",
        "Cove cluster landscape",
        "Rockfall risk",
        "Limited-use classification",
        "Intimate and quieter Portimão beach context"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão – Praias do Concelho",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho",
      "facts_verified": [
        "Prainha listed among Portimão municipal beaches",
        "Cove and rock-formation description",
        "Marine life around rocks",
        "Municipal note that Prainha was not identified as bathing water nor qualified as a bathing beach in 2022 due to risk and bather safety"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão – Qualidade da Água Balnear das Praias de Portimão",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho/qualidade-da-agua-balnear-das-praias-de-portimao",
      "facts_verified": [
        "Municipal bathing-water table",
        "Prainha was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather safety",
        "Page last updated on 04 November 2025"
      ]
    },
    {
      "source_name": "Visit Portimão – Praia dos Três Irmãos",
      "source_url": "https://visitportimao.com/praias/praia-dos-tres-irmaos/",
      "facts_verified": [
        "Praia dos Três Irmãos location and nearby relationship",
        "Low-tide access to Prainha",
        "Caution needed when walking through coves and chasms"
      ]
    },
    {
      "source_name": "VisitPortugal – Praia dos Três Irmãos / Alvor Nascente",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-tres-irmaos",
      "facts_verified": [
        "Praia dos Três Irmãos / Alvor Nascente location in Alvor - Portimão",
        "Maritime beach classification for the neighbouring official bathing beach",
        "Rocky bay setting at the eastern end of the Alvor sands",
        "Nearby services listed for Três Irmãos / Alvor Nascente"
      ]
    },
    {
      "source_name": "Visit Portimão – Varandas Sobre o Mar",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/varandas-sobre-o-mar/",
      "facts_verified": [
        "Official Portimão clifftop walking route",
        "Rocky coast and Miocene limestone cliffs",
        "Coastal birdlife and Mediterranean scrub context"
      ]
    },
    {
      "source_name": "Visit Portimão – Passeio Três Irmãos - Alvor",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/passeio-tres-irmaos-alvor/",
      "facts_verified": [
        "Official coastal walk between Praia dos Três Irmãos and Alvor",
        "Dune systems and seafront scenery",
        "Advice to use paths and boardwalks to protect fragile dunes"
      ]
    },
    {
      "source_name": "Visit Portimão – Ao Sabor da Maré",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/ao-sabor-da-mare/",
      "facts_verified": [
        "Ria de Alvor and Meia Praia dune systems",
        "Dunes supporting marshland and Ria de Alvor",
        "Wildlife and nature-route context"
      ]
    },
    {
      "source_name": "Visit Portimão – Alvor",
      "source_url": "https://visitportimao.com/alvor/",
      "facts_verified": [
        "Alvor town context",
        "Proximity to Portimão",
        "Heritage and Ria de Alvor setting"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, Alvor context, cove landscape, rock formations and official safety warnings were verified from official Portimão sources.",
    "There is a significant safety note: official Portimão tourism states Prainha is a limited-use beach due to rockfall risk, and the municipality states it was not identified as bathing water nor qualified as a bathing beach in 2024 due to risk and bather-safety issues.",
    "Facilities are listed by Visit Portimão, but because of the bathing-water and safety-status issue, they should be manually checked before publication and treated as seasonal / verify before visiting.",
    "Blue Flag status, accessible beach status, parking and coordinates were not verified from authoritative current sources and have not been claimed.",
    "Nearby attractions and walking routes were selected only from official Portimão or VisitPortugal sources.",
    "No unsupported claims about safe swimming, permanent calm water, family suitability or awards were added.",
    "No third-party review, booking, map or social media platform names were used in the public listing text."
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
  where slug = 'alvor';

  if v_city_id is null then
    raise exception 'Alvor city was not found';
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
