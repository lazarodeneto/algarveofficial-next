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
  'Vila Nova de Cacela',
  'vila-nova-de-cacela',
  'Eastern Algarve town near Cacela Velha, Manta Rota and Ria Formosa sandbank beaches.',
  37.1742,
  -7.5315,
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
  v_slug text := 'praia-de-cacela-velha-fabrica-mar';
  v_name text := 'Praia de Cacela Velha / Praia da Fábrica-Mar';
  v_address text := 'Praia de Cacela Velha / Praia da Fábrica-Mar, Vila Nova de Cacela, Vila Real de Santo António, Algarve, Portugal';
  v_website_url text := 'https://www.cm-vrsa.pt/pt/3151/praia-da-fabrica.aspx';
  v_latitude numeric := 37.1512639;
  v_longitude numeric := -7.549119444444444;
  v_alias_names text[] := array[
    'Praia de Cacela Velha',
    'Praia da Fábrica-Mar',
    'Praia da Fabrica-Mar',
    'Praia da Fábrica',
    'Praia da Fabrica',
    'Praia de Cacela Velha (Fábrica Mar)'
  ];
  v_alias_slugs text[] := array[
    'praia-de-cacela-velha',
    'praia-da-fabrica-mar',
    'praia-da-fabrica'
  ];
  v_alias_slug text;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Cacela Velha / Praia da Fábrica-Mar",
  "slug": "praia-de-cacela-velha-fabrica-mar",
  "aliases": [
    "Praia de Cacela Velha",
    "Praia da Fábrica-Mar",
    "Praia da Fabrica-Mar",
    "Praia da Fábrica",
    "Praia da Fabrica",
    "Praia de Cacela Velha (Fábrica Mar)"
  ],
  "alias_slugs": [
    "praia-de-cacela-velha",
    "praia-da-fabrica-mar",
    "praia-da-fabrica"
  ],
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Vila Nova de Cacela",
  "concelho": "Vila Real de Santo António",
  "municipality": "Vila Real de Santo António",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Cacela Velha, officially associated with Fábrica-Mar, is a tidal Ria Formosa beach near Vila Nova de Cacela in Vila Real de Santo António. It is best visited for its sandbank scenery, lagoon views and historic village backdrop, with careful attention to tides and official access advice.",
  "full_description": "Praia de Cacela Velha is one of the eastern Algarve’s most distinctive coastal settings, where the historic village of Cacela Velha overlooks the channels, dunes and sandbanks of the Ria Formosa. The beach is closely associated with Praia da Fábrica-Mar, with official references placing it near the Cacela bar and identifying boat access from Sítio da Fábrica. The landscape is shaped by tides, shifting sands and the protected lagoon environment, giving the area a quieter, more natural character than a conventional drive-up beach.\n\nFrom the village, visitors can enjoy wide views across the ria towards the barrier sands and Atlantic horizon, with the fort and whitewashed historic centre adding strong cultural context to the coastal experience. Practical planning is essential. Vila Real de Santo António municipality has advised against using the zone directly in front of Cacela Velha for bathing, due to risks linked to crossing the ria on foot, tidal currents, the protected environment and the absence of permanent assistance to bathers in that specific area.\n\nVisitors should use recognised access points, respect signage, avoid improvised crossings and check tide and sea conditions carefully. The 2026 bathing season lists Fábrica-Mar from 1 June to 30 September. Praia de Cacela Velha is therefore best approached as a scenic, nature-led Ria Formosa experience rather than a simple serviced beach day.",
  "coordinates": {
    "latitude": 37.1512639,
    "longitude": -7.549119444444444,
    "label": "Praia de Cacela Velha / Praia da Fábrica-Mar",
    "notes": "Coordinates were verified from the EuroVelo Portugal / VisitAlgarve reference for Praia de Cacela Velha (Fábrica Mar).",
    "bathing_areas": [
      {
        "name": "Fábrica-Mar",
        "latitude": 37.1512639,
        "longitude": -7.549119444444444,
        "type": "Barrier-sand / Ria Formosa coastal beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Barrier-sand / Ria Formosa coastal beach",
  "landscape": "A tidal lagoon and barrier-sand setting, with dunes, ria channels, sandbanks and Atlantic-facing sands viewed from the elevated historic village of Cacela Velha.",
  "access": "Official tourism references identify boat access from Sítio da Fábrica to Praia de Cacela Velha / Fábrica-Mar. The municipality has discouraged bathing and informal crossing in the zone directly in front of Cacela Velha because of tidal-current risk and lack of permanent assistance to bathers.",
  "highlights": [
    "Tidal sandbank and lagoon scenery within the Ria Formosa setting",
    "Views from the historic village of Cacela Velha towards the barrier sands",
    "Boat access from Sítio da Fábrica verified by official tourism references",
    "Close to the fort, church and whitewashed historic centre of Cacela Velha",
    "Fábrica-Mar listed as a 2026 bathing beach from 1 June to 30 September",
    "Excellent setting for landscape photography and nature-focused visits"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Nature lovers",
    "Birdwatching",
    "Quiet coastal scenery",
    "Heritage and coastal viewpoints"
  ],
  "facilities": [
    { "name": "Boat access from Sítio da Fábrica", "status": "Verified" },
    { "name": "Fábrica-Mar bathing season listed from 1 June to 30 September 2026", "status": "Seasonal" },
    { "name": "Permanent assistance to bathers in the direct front-of-Cacela Velha zone not provided according to municipal warning", "status": "Verified" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Beach bar or café on the sand", "status": "Not verified" },
    { "name": "Parking for beach access", "status": "Not verified" },
    { "name": "Sunbed or parasol rental", "status": "Not verified" },
    { "name": "Step-free access", "status": "Not verified" }
  ],
  "includes": [
    "Boat access from Sítio da Fábrica",
    "Fábrica-Mar 2026 bathing-season reference",
    "Ria Formosa lagoon and sandbank scenery",
    "Cacela Velha historic village backdrop",
    "Fort, church and viewpoint context",
    "Tide and municipal safety-warning guidance"
  ],
  "important_information": {
    "best_time_to_visit": "Late spring, early summer and early autumn are best for scenery, calmer visitor flow and comfortable walking conditions. For bathing, use the official Fábrica-Mar season dates and verify current supervision, access and tide conditions before visiting.",
    "know_before_you_go": "The spelling “Cancela Velha” was not verified from authoritative sources; official and tourism sources use “Cacela Velha” and “Fábrica-Mar”.\nDo not attempt to cross tidal channels on foot unless local authorities and on-site conditions clearly indicate it is safe.\nThe municipality has discouraged bathing in the zone directly in front of Cacela Velha due to tidal currents, safety risks and lack of permanent assistance to bathers.\nUse recognised access points, especially the Fábrica-Mar access context, and check local signage before entering the water.\nThis is a sensitive Ria Formosa environment; visitors should keep to permitted areas and avoid disturbing dunes, birds and lagoon habitats.\nFacilities and boat services may be seasonal; verify locally before travelling.",
    "notes": [
      "The spelling “Cancela Velha” was not verified from authoritative sources; official and tourism sources use “Cacela Velha” and “Fábrica-Mar”.",
      "Do not attempt to cross tidal channels on foot unless local authorities and on-site conditions clearly indicate it is safe.",
      "The municipality has discouraged bathing in the zone directly in front of Cacela Velha due to tidal currents, safety risks and lack of permanent assistance to bathers.",
      "Use recognised access points, especially the Fábrica-Mar access context, and check local signage before entering the water.",
      "This is a sensitive Ria Formosa environment; visitors should keep to permitted areas and avoid disturbing dunes, birds and lagoon habitats.",
      "Facilities and boat services may be seasonal; verify locally before travelling."
    ]
  },
  "important_notes": "The spelling “Cancela Velha” was not verified from authoritative sources; official and tourism sources use “Cacela Velha” and “Fábrica-Mar”.\nDo not attempt to cross tidal channels on foot unless local authorities and on-site conditions clearly indicate it is safe.\nThe municipality has discouraged bathing in the zone directly in front of Cacela Velha due to tidal currents, safety risks and lack of permanent assistance to bathers.\nUse recognised access points, especially the Fábrica-Mar access context, and check local signage before entering the water.\nThis is a sensitive Ria Formosa environment; visitors should keep to permitted areas and avoid disturbing dunes, birds and lagoon habitats.\nFacilities and boat services may be seasonal; verify locally before travelling.",
  "best_time_to_visit": "Late spring, early summer and early autumn are best for scenery, calmer visitor flow and comfortable walking conditions. For bathing, use the official Fábrica-Mar season dates and verify current supervision, access and tide conditions before visiting.",
  "suitable_for": [
    "Visitors seeking scenic Ria Formosa landscapes",
    "Photographers",
    "Nature-focused travellers",
    "Couples and adults comfortable with tidal beach access",
    "Visitors combining beach scenery with Cacela Velha historic village"
  ],
  "not_suitable_for": [
    "Visitors seeking a simple drive-up serviced beach",
    "Visitors planning to cross tidal channels on foot without verified safe conditions",
    "Visitors requiring fully verified step-free access",
    "Families seeking a straightforward beach day with clearly verified facilities",
    "Anyone unwilling to follow tide, access and local safety signage"
  ],
  "nearby_attractions": [
    {
      "name": "Cacela Velha Historic Village",
      "type": "Historic village",
      "description": "A small historic settlement above the Ria Formosa, known for its whitewashed houses, church, fort and panoramic lagoon views.",
      "verification_status": "Verified"
    },
    {
      "name": "Forte de Cacela Velha / Forte D. Paio Peres Correia",
      "type": "Fort / viewpoint",
      "description": "A prominent historic structure overlooking the Ria Formosa and the barrier sands, forming one of the area’s main viewpoints.",
      "verification_status": "Verified"
    },
    {
      "name": "Igreja de Nossa Senhora da Assunção",
      "type": "Church",
      "description": "The main church of Cacela Velha, built over earlier medieval remains and forming part of the historic village setting.",
      "verification_status": "Verified"
    },
    {
      "name": "Sítio da Fábrica",
      "type": "Coastal hamlet / access point",
      "description": "A small coastal place associated with boat access across the ria towards the beach and barrier sands.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Manta Rota",
      "type": "Beach",
      "description": "A nearby eastern Algarve beach listed as an alternative bathing area by municipal warnings concerning the Cacela Velha front zone.",
      "verification_status": "Verified"
    },
    {
      "name": "Parque Natural da Ria Formosa",
      "type": "Protected natural area",
      "description": "A protected lagoon system of dunes, channels, wetlands and barrier islands along the Algarve’s eastern coast.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Cacela Velha",
    "Vila Nova de Cacela",
    "Manta Rota",
    "Tavira",
    "Vila Real de Santo António"
  ],
  "walking_trails_nearby": [
    {
      "name": "PR2 Quintas de Cacela",
      "description": "A municipal walking route in the Vila Real de Santo António area, associated with the Cacela landscape. Exact linkage to the beach access point should be checked before planning a route.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho Português de Santiago - eastern route through Cacela Velha",
      "description": "VisitPortugal identifies Cacela Velha as part of the eastern route of the Portuguese Camino de Santiago, adding cultural-walking context to the village.",
      "verification_status": "Verified"
    },
    {
      "name": "Local lagoon-edge walking around Cacela Velha",
      "description": "Informal short walks around the village viewpoints and ria edge may be possible, but safe route status, tide exposure and official maintenance were not fully verified.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Use official or locally recognised access rather than attempting an informal crossing of the ria.",
    "Check tide times, warning signs and local authority advice before approaching the water.",
    "Visit the village viewpoint before or after the beach for one of the clearest perspectives over the Ria Formosa.",
    "Bring water, sun protection and footwear suitable for sand and uneven coastal paths.",
    "Avoid dunes and sensitive habitat areas; this is a protected lagoon environment.",
    "For a more straightforward beach day, consider nearby recognised bathing beaches such as Fábrica-Mar via proper access or Manta Rota."
  ],
  "photography_notes": "The strongest compositions are from Cacela Velha’s elevated village and fort area, looking across tidal channels, sandbanks and the Atlantic. Low tide can reveal striking sand patterns, but visitors should avoid unsafe crossings and protected dune areas.",
  "family_notes": "The scenery can be rewarding for families, especially from the village viewpoint, but the beach itself requires careful access planning. Families with children should avoid tidal crossings, confirm current conditions and consider nearby beaches with clearer verified facilities for a conventional beach day.",
  "safety_notes": "Tides and currents are a central safety concern at Cacela Velha. The municipality has discouraged bathing in the direct front-of-village zone, citing risk from crossings, currents and lack of permanent assistance. Visitors should follow local signage, use recognised access, and avoid entering the water where conditions are uncertain.",
  "accessibility_notes": "Accessibility information for Praia de Cacela Velha / Fábrica-Mar was not fully verified for this listing. Visitors with reduced mobility should confirm current access conditions, boat arrangements and beach support before visiting.",
  "seo": {
    "meta_title": "Praia de Cacela Velha, Algarve | Ria Formosa",
    "meta_description": "Discover Praia de Cacela Velha/Fábrica-Mar in VRSA: Ria Formosa sandbanks, lagoon views, boat access and essential tide safety tips.",
    "keywords": [
      "Praia de Cacela Velha",
      "Praia da Fábrica-Mar",
      "Cacela Velha beach",
      "Vila Real de Santo António beaches",
      "Vila Nova de Cacela",
      "Ria Formosa beach",
      "Algarve beaches",
      "Portugal beaches",
      "Fábrica beach Algarve",
      "Cacela Velha Algarve"
    ]
  },
  "sources_used": [
    {
      "source_name": "EuroVelo Portugal / VisitAlgarve reference - Praia de Cacela Velha (Fábrica Mar)",
      "source_url": "https://euroveloportugal.com/pt/poi/praia-de-cacela-velha-fabrica-mar",
      "facts_verified": [
        "Beach name Praia de Cacela Velha (Fábrica Mar)",
        "Beach category",
        "Location near Barra de Cacela and Ilha de Cabanas",
        "Boat access from Sítio da Fábrica",
        "Concelho Vila Real de Santo António",
        "Coordinates 37.1512639, -7.549119444444444",
        "Barrier-sand and dune landscape context"
      ]
    },
    {
      "source_name": "VisitPortugal - Cacela Velha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/cacela-velha",
      "facts_verified": [
        "Cacela Velha historic settlement",
        "Location above the Ria Formosa",
        "Fortress and church context",
        "Viewpoint over the sea and Ria Formosa islands",
        "Boats from Sítio da Fábrica connecting to the islands and extensive sandy beaches",
        "Cacela Velha as part of the eastern route of the Portuguese Camino de Santiago"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila Real de Santo António - Praia da Fábrica",
      "source_url": "https://www.cm-vrsa.pt/pt/3151/praia-da-fabrica.aspx",
      "facts_verified": [
        "Official municipal reference to Praia de Cacela Velha - Praia da Fábrica",
        "Location on the Cacela peninsula",
        "Ria Formosa setting"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Fábrica-Mar listed for Vila Real de Santo António",
        "Bathing water code PTCD2W",
        "2026 bathing season from 1 June to 30 September"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila Real de Santo António - 2025 bathing warning",
      "source_url": "https://www.cm-vrsa.pt/pt/noticias/37472/municipio-de-vrsa-volta-a-desaconselhar-utilizacao-da-zona-de-cacela-velha-para-a-pratica-de-atividade-balnear.aspx",
      "facts_verified": [
        "Municipality again discouraged use of the Cacela Velha zone for bathing activity in 2025",
        "Warning relates to risk from crossings and bathing in the Cacela Velha lagoon zone"
      ]
    },
    {
      "source_name": "Jornal de Notícias - Municipal warning on Cacela Velha bathing use",
      "source_url": "https://www.jn.pt/pais/artigo/autarquia-desaconselha-utilizacao-de-praia-em-frente-a-cacela-velha-no-algarve/17772562",
      "facts_verified": [
        "Municipal warning discouraging bathing in front of Cacela Velha",
        "Risks associated with crossing the Ria Formosa on foot",
        "Strong currents when the tide is ebbing",
        "No concession areas or permanent assistance to bathers in the direct front-of-village zone",
        "Recommendation to use nearby beaches such as Fábrica and Manta Rota"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural da Ria Formosa",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnriaformosa",
      "facts_verified": [
        "Ria Formosa protected area context",
        "Presence of sandy dune cordon and lagoon system",
        "Environmental sensitivity of the Ria Formosa landscape"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila Real de Santo António - Percursos Pedestres",
      "source_url": "https://www.cm-vrsa.pt/en/menu/1224/percursos-pedestres.aspx",
      "facts_verified": [
        "Municipal walking routes in Vila Real de Santo António",
        "Quintas de Cacela route listed among walking routes"
      ]
    }
  ],
  "verification_notes": [
    "The user-provided name “Praia da Cancela Velha” was not verified from authoritative sources. The verified spelling is “Cacela Velha”, and official beach references connect it with “Fábrica-Mar” or “Praia da Fábrica”.",
    "Beach name, municipality, coordinates, Ria Formosa context and boat access from Sítio da Fábrica were verified from official or authoritative tourism sources.",
    "The 2026 bathing season for Fábrica-Mar was verified from Diário da República.",
    "Municipal warnings indicate that the direct zone in front of Cacela Velha should not be promoted as a normal bathing area because of tide/current risk, environmental protection concerns and lack of permanent assistance to bathers.",
    "Facilities such as toilets, beach cafés, sunbed rental, parking and step-free access were not fully verified for this specific listing and have been marked accordingly.",
    "No unsupported claims about Blue Flag status, lifeguards, dog rules, permanent facilities or guaranteed swimming conditions were added.",
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
  where slug = 'vila-nova-de-cacela';

  if v_city_id is null then
    raise exception 'Vila Nova de Cacela city was not found';
  end if;

  select id, slug, tier, category_id
    into v_listing_id, v_old_slug, v_existing_tier, v_existing_category_id
  from public.listings
  where slug = v_slug
     or slug = any(v_alias_slugs)
     or lower(name) = lower(v_name)
     or lower(name) = any(array(
       select lower(alias_value)
       from unnest(v_alias_names) as alias_name(alias_value)
     ))
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

    foreach v_alias_slug in array v_alias_slugs loop
      if v_alias_slug <> v_slug then
        insert into public.listing_slugs (listing_id, slug, is_current)
        values (v_listing_id, v_alias_slug, false)
        on conflict (slug) do update set
          listing_id = excluded.listing_id,
          is_current = false
        where public.listing_slugs.listing_id = excluded.listing_id;
      end if;
    end loop;
  end if;
end $$;

commit;
