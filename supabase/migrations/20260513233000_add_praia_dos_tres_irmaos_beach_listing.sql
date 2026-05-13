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
  v_slug text := 'praia-dos-tres-irmaos-portimao';
  v_name text := 'Praia dos Três Irmãos';
  v_short_description text := $short$
Praia dos Três Irmãos is a popular cliff-and-cove beach near Alvor, in the municipality of Portimão. Set at the eastern end of Alvor's long sandy shoreline, it is known for sculpted rock formations, sheltered coves and resort-area access.
$short$;
  v_description text := $description$
Praia dos Três Irmãos, also officially associated with Alvor Nascente, sits at the eastern end of the long Alvor beach system in Portimão. It is one of the most distinctive beaches near Alvor, combining a broad sandy setting with sculpted limestone cliffs, offshore rock stacks, small coves and natural openings shaped by the sea.

Official tourism sources describe the beach as a sheltered bay between rocks, positioned where Alvor's extensive sandy shoreline gives way to a more dramatic cliff-and-cove landscape. This makes it particularly attractive for visitors who want the space of a larger beach but also the visual character of the western Algarve's rock formations. The surrounding resort and hotel area gives the beach strong summer appeal, while nearby Alvor offers restaurants, services and a village atmosphere.

Praia dos Três Irmãos is especially enjoyable for photography, coastal walks and family beach time in suitable conditions. Visit Portimão notes that the eastern side has heavily sculpted cliffs and offshore rocks, and that low tide can allow cautious access towards Prainha and nearby coves. This low-tide exploration should be treated carefully, as tide, rockfall and sea conditions can change.

The beach has verified support infrastructure, including Blue Flag listing through Alvor Nascente, seasonal surveillance, accessible-beach facilities and beach services. In peak summer, the main access and serviced areas can become busy, so early arrival is recommended.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia dos Três Irmãos",
  "slug": "praia-dos-tres-irmaos-portimao",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Alvor",
  "concelho": "Portimão",
  "municipality": "Portimão",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia dos Três Irmãos is a popular cliff-and-cove beach near Alvor, in the municipality of Portimão. Set at the eastern end of Alvor's long sandy shoreline, it is known for sculpted rock formations, sheltered coves and resort-area access.",
  "full_description": "Praia dos Três Irmãos, also officially associated with Alvor Nascente, sits at the eastern end of the long Alvor beach system in Portimão. It is one of the most distinctive beaches near Alvor, combining a broad sandy setting with sculpted limestone cliffs, offshore rock stacks, small coves and natural openings shaped by the sea.\n\nOfficial tourism sources describe the beach as a sheltered bay between rocks, positioned where Alvor's extensive sandy shoreline gives way to a more dramatic cliff-and-cove landscape. This makes it particularly attractive for visitors who want the space of a larger beach but also the visual character of the western Algarve's rock formations. The surrounding resort and hotel area gives the beach strong summer appeal, while nearby Alvor offers restaurants, services and a village atmosphere.\n\nPraia dos Três Irmãos is especially enjoyable for photography, coastal walks and family beach time in suitable conditions. Visit Portimão notes that the eastern side has heavily sculpted cliffs and offshore rocks, and that low tide can allow cautious access towards Prainha and nearby coves. This low-tide exploration should be treated carefully, as tide, rockfall and sea conditions can change.\n\nThe beach has verified support infrastructure, including Blue Flag listing through Alvor Nascente, seasonal surveillance, accessible-beach facilities and beach services. In peak summer, the main access and serviced areas can become busy, so early arrival is recommended.",
  "coordinates": {
    "latitude": 37.119964,
    "longitude": -8.58085,
    "label": "Alvor Nascente / Praia dos Três Irmãos",
    "notes": "Coordinates are taken from the official ABAAE Alvor Nascente page."
  },
  "beach_type": "Sandy maritime beach with cliffs, coves and rock formations",
  "landscape": "A sandy beach at the eastern end of Alvor's long shoreline, shaped by dunes, sculpted limestone cliffs, offshore rocks and small coves.",
  "access": "Access is supported by resort-area infrastructure and official beach facilities. Visitors should confirm the most suitable access point before travelling, especially if mobility support is required or if planning to explore the coves at low tide.",
  "highlights": [
    "Popular beach near Alvor with cliffs, coves and rock formations",
    "Officially associated with Alvor Nascente",
    "Set at the eastern end of Alvor's long sandy beach system",
    "Sculpted limestone cliffs and offshore rock stacks",
    "Low-tide connection towards Prainha and nearby coves, requiring caution",
    "Official 2026 Blue Flag listing for Alvor Nascente"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Families",
    "Couples",
    "Coastal walks",
    "Resort beach days",
    "Cove exploration at low tide",
    "Visitors staying in Alvor"
  ],
  "facilities": [
    { "name": "Beach support", "status": "Verified / Seasonal" },
    { "name": "Blue Flag 2026 listing for Alvor Nascente", "status": "Seasonal" },
    { "name": "Lifeguard / beach surveillance", "status": "Seasonal" },
    { "name": "First-aid station", "status": "Seasonal" },
    { "name": "Accessible beach designation", "status": "Verified" },
    { "name": "WC", "status": "Verified / Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Sunshade area / sunshade rental", "status": "Seasonal" },
    { "name": "Nautical centre / small craft hire", "status": "Seasonal" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Surf activity listed by official tourism source", "status": "Seasonal / conditions dependent" }
  ],
  "includes": [
    "Beach support",
    "Blue Flag 2026 listing for Alvor Nascente",
    "Seasonal lifeguard / beach surveillance",
    "First-aid station",
    "Accessible beach designation",
    "WC and showers",
    "Seasonal sunshade area / rental",
    "Seasonal bars and restaurants",
    "Seasonal nautical centre / small craft hire"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach-support atmosphere. Spring, early summer and early autumn are better for photography, walking and a calmer experience.",
    "know_before_you_go": "ABAAE lists Alvor Nascente among Portimão's 2026 Blue Flag locations.\nABAAE lists the 2026 bathing season for Alvor Nascente as 1 June 2026 to 30 September 2026.\nThe individual ABAAE page checked showed an unclear Blue Flag-season date range for Alvor Nascente, so exact display dates should be manually confirmed before publication updates.\nThe beach can become busy in summer because of its resort setting, scenic cliffs and proximity to Alvor.\nLow-tide access towards Prainha and nearby coves should be approached cautiously and only when conditions allow.\nPrainha was not identified as bathing water or qualified as a bathing beach in the municipal information checked for 2024, due to risk and bather-safety issues.\nVisitors should avoid cliff bases and cliff edges because rockfall risk can exist on cliff-backed beaches.\nSea and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.",
    "notes": [
      "ABAAE lists Alvor Nascente among Portimão's 2026 Blue Flag locations.",
      "ABAAE lists the 2026 bathing season for Alvor Nascente as 1 June 2026 to 30 September 2026.",
      "The individual ABAAE page checked showed an unclear Blue Flag-season date range for Alvor Nascente, so exact display dates should be manually confirmed before publication updates.",
      "The beach can become busy in summer because of its resort setting, scenic cliffs and proximity to Alvor.",
      "Low-tide access towards Prainha and nearby coves should be approached cautiously and only when conditions allow.",
      "Prainha was not identified as bathing water or qualified as a bathing beach in the municipal information checked for 2024, due to risk and bather-safety issues.",
      "Visitors should avoid cliff bases and cliff edges because rockfall risk can exist on cliff-backed beaches.",
      "Sea and tide conditions can vary; visitors should follow local flags, signage and official safety guidance."
    ]
  },
  "important_notes": "ABAAE lists Alvor Nascente among Portimão's 2026 Blue Flag locations.\nABAAE lists the 2026 bathing season for Alvor Nascente as 1 June 2026 to 30 September 2026.\nThe individual ABAAE page checked showed an unclear Blue Flag-season date range for Alvor Nascente, so exact display dates should be manually confirmed before publication updates.\nThe beach can become busy in summer because of its resort setting, scenic cliffs and proximity to Alvor.\nLow-tide access towards Prainha and nearby coves should be approached cautiously and only when conditions allow.\nPrainha was not identified as bathing water or qualified as a bathing beach in the municipal information checked for 2024, due to risk and bather-safety issues.\nVisitors should avoid cliff bases and cliff edges because rockfall risk can exist on cliff-backed beaches.\nSea and tide conditions can vary; visitors should follow local flags, signage and official safety guidance.",
  "best_time_to_visit": "June to September for the official bathing season and full beach-support atmosphere. Spring, early summer and early autumn are better for photography, walking and a calmer experience.",
  "suitable_for": [
    "Families using serviced beach areas",
    "Visitors staying in Alvor resorts or hotels",
    "Photographers",
    "Couples",
    "Beach walkers",
    "Visitors wanting cliffs and coves near a larger sandy beach",
    "Visitors needing officially recognised accessible-beach support, subject to current access confirmation"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors wanting guaranteed quiet in peak summer",
    "Visitors with reduced mobility unless the most suitable access point is confirmed in advance",
    "Anyone planning to explore coves without checking tide and sea conditions",
    "Visitors who intend to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Alvor",
      "type": "Village",
      "description": "A traditional coastal village close to the beach, useful for restaurants, services and evening walks after beach time.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Alvor",
      "type": "Nearby beach",
      "description": "The wider Alvor beach system extends west from Três Irmãos, offering a large sandy shoreline and connection with the Ria de Alvor landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Prainha",
      "type": "Nearby cove area",
      "description": "A neighbouring rocky cove area that may be reachable from Três Irmãos at low tide, but should be treated cautiously because official municipal information has flagged bathing-safety concerns for Prainha.",
      "verification_status": "Verified"
    },
    {
      "name": "Ria de Alvor",
      "type": "Estuary and natural landscape",
      "description": "An estuarine environment near Alvor with dunes, marshes and birdlife, best explored through marked routes and boardwalks.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Torralta",
      "type": "Nearby beach section",
      "description": "A nearby Alvor beach area with a broad sandy setting and resort-area access.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Alvor",
    "Portimão",
    "Praia da Rocha",
    "Lagos",
    "Mexilhoeira Grande"
  ],
  "walking_trails_nearby": [
    {
      "name": "Passeio Três Irmãos - Alvor",
      "description": "A nature-focused coastal walk between Praia dos Três Irmãos and Alvor, with views of the sea and the dune systems that define the local beach landscape.",
      "verification_status": "Verified"
    },
    {
      "name": "Alvor shoreline and low-tide cove walk",
      "description": "A shoreline walk that can include the sandy beach and, only when conditions allow, cautious low-tide exploration towards nearby coves and Prainha.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August if you want easier access to the most convenient serviced areas.",
    "Check the tide before walking towards coves or Prainha.",
    "Keep well away from cliff bases and unstable-looking rock formations.",
    "Use marked paths and walkways where available to protect dunes and avoid unsafe ground.",
    "Bring suitable footwear if you plan to explore rocky sections at low tide.",
    "For photography, late afternoon can bring warm light to the cliffs and rock formations."
  ],
  "photography_notes": "Praia dos Três Irmãos is highly photogenic for its sculpted cliffs, sea stacks, sandy coves and low-tide reflections. The best photographs are usually taken from safe beach-level positions or designated access areas; visitors should not climb rocks or approach cliff edges for images.",
  "family_notes": "The beach can suit families because of its sandy setting, seasonal support services and nearby resort infrastructure. Families should supervise children closely near rocks, coves, changing tides and cliff-backed areas.",
  "safety_notes": "Sea, tide and cliff conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Avoid cliff bases, cliff edges and low-tide cove exploration when the sea is rising or conditions are unclear.",
  "accessibility_notes": "Official tourism sources list Praia dos Três Irmãos / Alvor Nascente as an accessible beach. Visitors with reduced mobility should still confirm the most suitable current access point and seasonal support before visiting.",
  "seo": {
    "meta_title": "Praia dos Três Irmãos, Portimão | Beach Guide",
    "meta_description": "Praia dos Três Irmãos near Alvor is a popular Algarve beach with cliffs, coves, rock formations, facilities and resort access.",
    "keywords": [
      "Praia dos Três Irmãos",
      "Praia dos Tres Irmaos",
      "Alvor Nascente",
      "Portimão beaches",
      "Alvor beaches",
      "Algarve beaches",
      "Portugal beaches",
      "cliff beach Algarve",
      "coves near Alvor",
      "Praia de Alvor",
      "Prainha Portimão",
      "family beach Alvor"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia dos Três Irmãos trip ideas",
      "links": [
        { "label": "Praia dos Três Irmãos" },
        { "label": "Praia dos Tres Irmaos" },
        { "label": "Alvor Nascente" },
        { "label": "cliff beach Algarve" },
        { "label": "coves near Alvor" },
        { "label": "family beach Alvor" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Alvor" },
        { "label": "Praia de Alvor" },
        { "label": "Prainha" },
        { "label": "Ria de Alvor" },
        { "label": "Praia da Torralta" },
        { "label": "Passeio Três Irmãos - Alvor" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia dos Três Irmãos / Alvor Nascente",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-dos-tres-irmaos",
      "facts_verified": [
        "Beach name",
        "Alternative official name Alvor Nascente",
        "Maritime beach classification",
        "Location in Alvor, Portimão",
        "Sheltered bay between rocks",
        "Position at the eastern end of Alvor's long sandy beach",
        "Support infrastructure and hotel surroundings",
        "Facilities including Blue Flag, surveillance, sunshade rental, small craft hire, showers, parking, bar, restaurant, surf and accessible beach"
      ]
    },
    {
      "source_name": "Visit Portimão - Praia dos Três Irmãos",
      "source_url": "https://visitportimao.com/praias/praia-dos-tres-irmaos/",
      "facts_verified": [
        "Praia dos Três Irmãos in Portimão",
        "Long sandy barrier setting",
        "Dune habitat",
        "Sculpted cliffs on the eastern side",
        "Offshore rock formations",
        "Low-tide access to Prainha and nearby coves",
        "Facilities including beach support, Blue Flag, nautical centre, showers, lifeguard, first aid, accessible beach, WC and sunshade area"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão - Praias do Concelho / Ambiente page",
      "source_url": "https://www.cm-portimao.pt/rodape/ficha-tecnica?id=33&view=category",
      "facts_verified": [
        "Praia dos 3 Irmãos municipal beach description",
        "Dune species and coastal vegetation context",
        "Low-tide access to Prainha",
        "Prainha not identified as bathing water or qualified as a bathing beach in 2024 due to risk and bather-safety issues"
      ]
    },
    {
      "source_name": "Câmara Municipal de Portimão - Qualidade da Água Balnear das Praias de Portimão",
      "source_url": "https://www.cm-portimao.pt/menus/servicos/ambiente/praias-do-concelho/qualidade-da-agua-balnear-das-praias-de-portimao",
      "facts_verified": [
        "Três Irmãos listed under Alvor Nascente bathing water",
        "Bathing water code PTCW7C",
        "Water-quality table entry checked",
        "Municipal update context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Alvor Nascente listed among Portimão's 2026 Blue Flag locations",
        "Portimão listed with 9 awarded locations in 2026"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Alvor Nascente",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/alvor-nascente/",
      "facts_verified": [
        "Alvor Nascente official beach entry",
        "Coastal beach classification",
        "Municipality of Portimão",
        "Coordinates",
        "2026 bathing season",
        "Beach code PTCW7C",
        "Individual Blue Flag-season date checked and flagged for manual review"
      ]
    },
    {
      "source_name": "Visit Portimão - Passeio Três Irmãos - Alvor",
      "source_url": "https://visitportimao.com/o-que-fazer/natureza/passeio-tres-irmaos-alvor/",
      "facts_verified": [
        "Nearby walking route between Praia dos Três Irmãos and Alvor",
        "Dune-system landscape",
        "Guidance to use paths and walkways and avoid trampling dunes",
        "Wildlife observation context"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Alvor Nascente (Três Irmãos)",
      "source_url": "https://visitalgarve.pt/equipamento/8778/praia-do-alvor-nascente-trs-irmos",
      "facts_verified": [
        "Official regional tourism page for Alvor Nascente / Três Irmãos",
        "Proximity to Alvor",
        "Open bay and dune-system landscape context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, alternative official name Alvor Nascente, municipality, landscape, resort context, facilities and nearby walk were verified from official tourism, municipal and ABAAE sources.",
    "The popular cliffs/coves positioning is supported by official descriptions of sculpted cliffs, offshore rocks, low-tide coves and resort-area beach support.",
    "ABAAE's 2026 list verifies Alvor Nascente as a Blue Flag location in Portimão. The individual Alvor Nascente page showed an unclear Blue Flag-season date range, so exact Blue Flag display dates should be manually checked before publication updates.",
    "Coordinates are taken from the official ABAAE Alvor Nascente page.",
    "Facilities are included only where listed by official sources and marked Seasonal where operation may depend on the bathing season or concession activity.",
    "Accessibility is listed by official tourism sources, but visitors with reduced mobility should confirm the best current access point before travelling.",
    "Prainha is mentioned only with caution because municipal information states it was not identified as bathing water or qualified as a bathing beach in 2024 due to risk and bather-safety concerns.",
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
  where slug = 'alvor'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city alvor was not found';
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
      'https://www.visitportugal.com/pt-pt/content/praia-dos-tres-irmaos',
      'Praia dos Três Irmãos, Alvor, Portimão, Algarve, Portugal',
      37.119964,
      -8.58085,
      array[
        'Praia dos Três Irmãos',
        'Praia dos Tres Irmaos',
        'Alvor Nascente',
        'Portimão beaches',
        'Alvor beaches',
        'Algarve beaches',
        'Portugal beaches',
        'cliff beach Algarve',
        'coves near Alvor',
        'Praia de Alvor',
        'Prainha Portimão',
        'family beach Alvor'
      ],
      v_category_data,
      'Praia dos Três Irmãos, Portimão | Beach Guide',
      'Praia dos Três Irmãos near Alvor is a popular Algarve beach with cliffs, coves, rock formations, facilities and resort access.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-dos-tres-irmaos',
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
      address = 'Praia dos Três Irmãos, Alvor, Portimão, Algarve, Portugal',
      latitude = 37.119964,
      longitude = -8.58085,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia dos Três Irmãos',
        'Praia dos Tres Irmaos',
        'Alvor Nascente',
        'Portimão beaches',
        'Alvor beaches',
        'Algarve beaches',
        'Portugal beaches',
        'cliff beach Algarve',
        'coves near Alvor',
        'Praia de Alvor',
        'Prainha Portimão',
        'family beach Alvor'
      ],
      category_data = v_category_data,
      meta_title = 'Praia dos Três Irmãos, Portimão | Beach Guide',
      meta_description = 'Praia dos Três Irmãos near Alvor is a popular Algarve beach with cliffs, coves, rock formations, facilities and resort access.',
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
