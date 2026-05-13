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
  'Sagres',
  'sagres',
  'South-west Algarve village known for Atlantic beaches, surf, cliffs and the Cabo de São Vicente headland.',
  37.009,
  -8.943,
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
  v_slug text := 'praia-do-beliche-vila-do-bispo';
  v_name text := 'Praia do Beliche';
  v_address text := 'Praia do Beliche, Sagres, Vila do Bispo, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-beliche';
  v_latitude numeric := 37.025631;
  v_longitude numeric := -8.964093;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Beliche",
  "slug": "praia-do-beliche-vila-do-bispo",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Sagres",
  "concelho": "Vila do Bispo",
  "municipality": "Vila do Bispo",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Beliche is a famous Sagres-area beach in Vila do Bispo, set below high cliffs between Sagres and Cabo de São Vicente. Known for its dramatic bay, surf conditions and Costa Vicentina scenery, it is one of the Algarve’s most recognisable south-western beaches.",
  "full_description": "Praia do Beliche is one of the landmark beaches of the Sagres area, located in the municipality of Vila do Bispo on the dramatic south-western edge of the Algarve. Set within the Costa Vicentina and the wider Parque Natural do Sudoeste Alentejano e Costa Vicentina, the beach is enclosed by high cliffs and sits close to the route between Sagres and Cabo de São Vicente.\n\nThe beach has a strong visual identity: a sandy bay below layered limestone cliffs, Atlantic water, a sense of shelter from the surrounding rock walls, and a west-facing coastal setting close to one of Portugal’s most symbolic headlands. VisitPortugal describes Beliche as well known among surfers and bodyboarders, with excellent waves and competition activity. This makes it particularly relevant for surf-focused visitors, photographers and travellers exploring the Sagres coastline.\n\nAccess is an important consideration. Regional tourism information identifies Beliche as a restricted-use beach because much of it lies in an area where landslide risk exists, and other official route descriptions refer to a long staircase descending through the cliff. Visitors should treat the cliff environment seriously, stay away from cliff bases and edges, and follow all warning signs.\n\nPraia do Beliche is scenic and memorable, but not a simple resort beach. Facilities are limited to those verified by official tourism sources, and current Blue Flag status should not be claimed. It is best visited with preparation, respect for the protected coastal setting, and close attention to sea and cliff safety.",
  "coordinates": {
    "latitude": 37.025631,
    "longitude": -8.964093,
    "label": "Praia do Beliche",
    "notes": "Coordinates were taken from the ABAAE Beliche beach entry; current Blue Flag status was not verified."
  },
  "beach_type": "Sandy maritime beach below high cliffs",
  "landscape": "A sandy bay enclosed by high, layered cliffs, with Atlantic waves, rocky edges and a protected Costa Vicentina setting close to Cabo de São Vicente.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Regional tourism and route descriptions indicate that access to the sand involves a long staircase through the cliff area. Visitors should confirm current access conditions before travelling, especially after storms or cliff-safety warnings.",
  "highlights": [
    "Famous Sagres-area beach between Sagres and Cabo de São Vicente",
    "High cliff-framed sandy bay in the Costa Vicentina landscape",
    "Well known for surf and bodyboard conditions",
    "Part of the Parque Natural do Sudoeste Alentejano e Costa Vicentina setting",
    "Close to Fortaleza de Beliche and Cabo de São Vicente",
    "Dramatic cliff and Atlantic scenery for photography"
  ],
  "best_for": [
    "Surfing",
    "Bodyboarding",
    "Photography",
    "Scenic views",
    "Nature lovers",
    "Couples",
    "Coastal walks",
    "Sagres day trips",
    "West Algarve exploration"
  ],
  "facilities": [
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Surf activity", "status": "Verified / conditions dependent" },
    { "name": "Bodyboard activity", "status": "Verified / conditions dependent" },
    { "name": "Long staircase access", "status": "Verified" },
    { "name": "Blue Flag 2026 status", "status": "Not verified" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Toilets", "status": "Not verified" },
    { "name": "Showers", "status": "Not verified" },
    { "name": "Sunshade rental", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal beach surveillance",
    "Car parking",
    "Bar and restaurant",
    "Surf and bodyboard activity",
    "Long staircase access",
    "Restricted-use cliff-risk context",
    "Costa Vicentina protected landscape",
    "Nearby Cabo de São Vicente"
  ],
  "important_information": {
    "best_time_to_visit": "Spring, early summer and early autumn are good for scenery, photography and quieter Sagres-area visits. Surf conditions vary throughout the year and should be checked carefully before entering the water.",
    "know_before_you_go": "Praia do Beliche is identified by Visit Algarve as a restricted-use beach because a large part lies within an area where there is landslide risk.\nABAAE’s Vila do Bispo page shows Beliche with legacy 2022 bathing-season and Blue Flag-season data, not current 2026 Blue Flag-season data.\nCurrent 2026 Blue Flag status was not verified and should not be claimed.\nAccess involves a long cliff staircase and may be challenging for visitors with reduced mobility or heavy equipment.\nThe beach is backed by high cliffs; visitors should avoid cliff bases and cliff edges.\nSurf and bodyboard conditions are naturally variable and can be unsuitable for inexperienced users on some days.\nFacilities and surveillance may be seasonal.\nVisitors should follow local signage, beach flags and official safety guidance.",
    "notes": [
      "Praia do Beliche is identified by Visit Algarve as a restricted-use beach because a large part lies within an area where there is landslide risk.",
      "ABAAE’s Vila do Bispo page shows Beliche with legacy 2022 bathing-season and Blue Flag-season data, not current 2026 Blue Flag-season data.",
      "Current 2026 Blue Flag status was not verified and should not be claimed.",
      "Access involves a long cliff staircase and may be challenging for visitors with reduced mobility or heavy equipment.",
      "The beach is backed by high cliffs; visitors should avoid cliff bases and cliff edges.",
      "Surf and bodyboard conditions are naturally variable and can be unsuitable for inexperienced users on some days.",
      "Facilities and surveillance may be seasonal.",
      "Visitors should follow local signage, beach flags and official safety guidance."
    ]
  },
  "important_notes": "Praia do Beliche is identified by Visit Algarve as a restricted-use beach because a large part lies within an area where there is landslide risk.\nABAAE’s Vila do Bispo page shows Beliche with legacy 2022 bathing-season and Blue Flag-season data, not current 2026 Blue Flag-season data.\nCurrent 2026 Blue Flag status was not verified and should not be claimed.\nAccess involves a long cliff staircase and may be challenging for visitors with reduced mobility or heavy equipment.\nThe beach is backed by high cliffs; visitors should avoid cliff bases and cliff edges.\nSurf and bodyboard conditions are naturally variable and can be unsuitable for inexperienced users on some days.\nFacilities and surveillance may be seasonal.\nVisitors should follow local signage, beach flags and official safety guidance.",
  "best_time_to_visit": "Spring, early summer and early autumn are good for scenery, photography and quieter Sagres-area visits. Surf conditions vary throughout the year and should be checked carefully before entering the water.",
  "suitable_for": [
    "Surfers",
    "Bodyboarders",
    "Photographers",
    "Visitors exploring Sagres and Cabo de São Vicente",
    "Couples",
    "Nature-focused travellers",
    "Coastal walkers",
    "Visitors comfortable with stair access and cliff environments"
  ],
  "not_suitable_for": [
    "Visitors requiring step-free access",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Families carrying heavy beach equipment",
    "Visitors seeking a fully serviced resort beach",
    "Visitors expecting guaranteed calm swimming conditions",
    "Anyone intending to sit close to cliff bases"
  ],
  "nearby_attractions": [
    {
      "name": "Cabo de São Vicente",
      "type": "Headland and lighthouse area",
      "description": "A major south-western headland near Sagres, known for its open Atlantic horizon and symbolic position at the edge of mainland Portugal.",
      "verification_status": "Verified"
    },
    {
      "name": "Fortaleza de Beliche",
      "type": "Historic fortress and viewpoint",
      "description": "A historic fort above the Beliche area, with official tourism sources describing the Beliche inlet as the transition between Portugal’s southern and western coastal faces.",
      "verification_status": "Verified"
    },
    {
      "name": "Fortaleza de Sagres",
      "type": "Historic fortress",
      "description": "A major Sagres monument associated with the Promontorium Sacrum and Portuguese maritime history.",
      "verification_status": "Verified"
    },
    {
      "name": "Sagres",
      "type": "Nearby village",
      "description": "A west Algarve village and surf-oriented coastal base close to Beliche, Tonel, Mareta and Cabo de São Vicente.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Tonel",
      "type": "Nearby beach",
      "description": "A neighbouring Sagres beach within the Vila do Bispo coastal area, also associated with surf and dramatic Atlantic scenery.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Sagres",
    "Vila do Bispo",
    "Raposeira",
    "Budens",
    "Lagos"
  ],
  "walking_trails_nearby": [
    {
      "name": "Rota Vicentina / Fishermen’s Trail - Sagres and Cabo de São Vicente area",
      "description": "The wider Rota Vicentina coastal walking network reaches the Sagres and Cabo de São Vicente area, with exposed cliff-top terrain, Atlantic views and protected landscape context. Visitors should follow official markings and avoid cliff edges.",
      "verification_status": "Verified"
    },
    {
      "name": "Caminho Histórico: Vila do Bispo - Cabo de São Vicente",
      "description": "Portuguese Trails lists this 14 km Rota Vicentina section towards Cabo de São Vicente, with monumental cliffs and coastal panoramas in the south-western Algarve.",
      "verification_status": "Verified"
    },
    {
      "name": "Sagres to Cabo de São Vicente coastal route",
      "description": "A coastal walking option in the Sagres area that can include views towards Beliche and the Cabo de São Vicente landscape. Route condition and cliff safety should be checked locally before setting out.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Check surf, wind and tide conditions before entering the water.",
    "Use the official staircase and avoid informal cliff routes.",
    "Stay well away from cliff bases and cliff edges because landslide risk is specifically noted by regional tourism information.",
    "Arrive early during peak summer or good surf conditions, as parking and access can become busier.",
    "Bring water, sun protection and suitable footwear for the stairs and cliff-top areas.",
    "Do not claim or rely on current Blue Flag status unless fresh official confirmation is checked.",
    "Combine Beliche with Cabo de São Vicente, Fortaleza de Beliche and Sagres for a wider south-west Algarve itinerary."
  ],
  "photography_notes": "Praia do Beliche is particularly strong for cliff, wave and sunset-oriented photography from safe viewpoints above the bay and from the sand when conditions allow. Visitors should not step beyond safe areas or approach cliff edges for photographs.",
  "family_notes": "Families may enjoy the scenery, but the long staircase, surf conditions and cliff-risk setting require care. It is not the most practical choice for pushchairs, heavy beach equipment or visitors seeking calm, fully serviced beach conditions.",
  "safety_notes": "Visit Algarve identifies Praia do Beliche as restricted use because of landslide risk across a large part of the beach. Sea conditions can also vary, especially for surf and bodyboard activity. Follow flags, signage and any lifeguard or official instructions where present.",
  "accessibility_notes": "Accessible beach support was not verified. Access involves a long staircase through a cliff area, so visitors with reduced mobility should confirm current access conditions before visiting.",
  "seo": {
    "meta_title": "Praia do Beliche, Vila do Bispo | Beach Guide",
    "meta_description": "Praia do Beliche near Sagres is a famous Vila do Bispo beach with cliffs, surf, staircase access and dramatic Costa Vicentina scenery.",
    "keywords": [
      "Praia do Beliche",
      "Beliche Beach",
      "Praia do Beliche Sagres",
      "Vila do Bispo beaches",
      "Sagres beaches",
      "Algarve beaches",
      "Portugal beaches",
      "surf beach Sagres",
      "bodyboard Beliche",
      "Cabo de São Vicente",
      "Fortaleza de Beliche",
      "Costa Vicentina beach",
      "Parque Natural do Sudoeste Alentejano e Costa Vicentina"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia do Beliche trip ideas",
      "links": [
        { "label": "Praia do Beliche" },
        { "label": "Beliche Beach" },
        { "label": "Praia do Beliche Sagres" },
        { "label": "surf beach Sagres" },
        { "label": "Cabo de São Vicente" },
        { "label": "Fortaleza de Beliche" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Sagres" },
        { "label": "Vila do Bispo" },
        { "label": "Raposeira" },
        { "label": "Budens" },
        { "label": "Lagos" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Beliche",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-beliche",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Sagres, Vila do Bispo",
        "Costa Vicentina and Natural Park context",
        "High cliff setting",
        "Cabo de São Vicente to the west",
        "Surf and bodyboard relevance",
        "Competition activity reference",
        "Facilities including safety or surveillance, parking, bar, restaurant, surf and bodyboard",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Beliche",
      "source_url": "https://www.visitalgarve.pt/en/equipamento/8784/praia-do-beliche",
      "facts_verified": [
        "Regional tourism listing for Praia do Beliche",
        "Restricted-use beach classification",
        "Landslide-risk warning for a large part of the beach"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Beliche Portuguese listing",
      "source_url": "https://visitalgarve.pt/equipamento/8784/praia-do-beliche",
      "facts_verified": [
        "Beliche as a sheltered beach in the wide inlet between Ponta de Sagres and Cabo de São Vicente",
        "Beach carved into high warm-toned cliffs",
        "Long staircase access referenced in the official regional tourism result"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vila do Bispo municipality page",
      "source_url": "https://bandeiraazul.abaae.pt/municipio/vila-do-bispo/",
      "facts_verified": [
        "Beliche official beach entry",
        "Municipality of Vila do Bispo",
        "Coordinates",
        "Beach code PTCT2X",
        "Legacy 2022 bathing-season information",
        "Legacy 2022 Blue Flag-season information",
        "Current page wording showing the flag not hoisted definitively"
      ]
    },
    {
      "source_name": "Câmara Municipal de Vila do Bispo - Beliche",
      "source_url": "https://www.cm-viladobispo.pt/visitar/o-que-visitar/praias/beliche",
      "facts_verified": [
        "Official municipal beach page located for Beliche",
        "Official search-result summary describing the beach on the south coast of Sagres",
        "Bay and limestone-cliff setting"
      ]
    },
    {
      "source_name": "Agência Portuguesa do Ambiente - Beliche cliff-risk map",
      "source_url": "https://apambiente.pt/sites/default/files/_SNIAMB_Prevencao_gestao_riscos/Faixas_risco_arribas/Vila%20Bispo/VBispo_Beliche.pdf",
      "facts_verified": [
        "Official cliff-risk document located for Beliche",
        "Fetch restricted during research, so used only as a supporting source for cliff-risk context already confirmed by Visit Algarve"
      ]
    },
    {
      "source_name": "VisitPortugal - Fortaleza de Beliche",
      "source_url": "https://www.visitportugal.com/pt-pt/NR/exeres/1AB7C3F8-E4E8-4416-850F-02CF3855013C",
      "facts_verified": [
        "Fortaleza de Beliche as nearby monument",
        "Beliche inlet as transition between the southern and western faces of Portugal",
        "Chapel of Santa Catarina beside the fort on the cliff"
      ]
    },
    {
      "source_name": "VisitPortugal - Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/sagres-1",
      "facts_verified": [
        "Sagres visitor context",
        "Cabo de São Vicente nearby",
        "South-western continental location and sea-horizon context"
      ]
    },
    {
      "source_name": "VisitPortugal - Fortaleza de Sagres",
      "source_url": "https://www.visitportugal.com/pt-pt/content/fortaleza-de-sagres",
      "facts_verified": [
        "Fortaleza de Sagres as nearby monument",
        "Sagres historical and maritime context"
      ]
    },
    {
      "source_name": "ICNF - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.icnf.pt/conservacao/rnapareasprotegidas/parquesnaturais/pnsudoestealentejanoecostavicentina",
      "facts_verified": [
        "Official protected-area context for the Sudoeste Alentejano e Costa Vicentina Natural Park"
      ]
    },
    {
      "source_name": "VisitPortugal - Parque Natural do Sudoeste Alentejano e Costa Vicentina",
      "source_url": "https://www.visitportugal.com/pt-pt/content/parque-natural-do-sudoeste-alentejano-e-costa-vicentina",
      "facts_verified": [
        "Protected coastline from Porto Covo to Burgau",
        "Cliff-dominated landscape",
        "Conservation and biodiversity context"
      ]
    },
    {
      "source_name": "Rota Vicentina - Fishermen’s Trail",
      "source_url": "https://rotavicentina.com/trilho-dos-pescadores/",
      "facts_verified": [
        "Fishermen’s Trail coastal walking network",
        "Cliff, sand and exposed coastal terrain context",
        "Guidance that the route should be followed on foot"
      ]
    },
    {
      "source_name": "Portuguese Trails - Caminho Histórico / Vila do Bispo - Cabo de S. Vicente",
      "source_url": "https://www.portuguesetrails.com/pt-pt/routes/rota-vicentina-algarve-walking/caminho-historico-vila-do-bispo-cabo-de-s-vicente",
      "facts_verified": [
        "Rota Vicentina walking section from Vila do Bispo to Cabo de São Vicente",
        "14 km route distance",
        "Coastal panorama and cliff landscape context"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, Sagres location, cliff setting, surf/bodyboard relevance, protected-area context and basic facilities were verified from official tourism sources.",
    "The phrase “famous Sagres-area beach” is expressed through verified Sagres location, surf/bodyboard recognition, Costa Vicentina context and proximity to Cabo de São Vicente rather than unsupported rankings or review-platform claims.",
    "Current 2026 Blue Flag status was not verified. ABAAE’s Vila do Bispo page shows Beliche with legacy 2022 bathing-season and Blue Flag-season data, so the listing does not claim current Blue Flag status.",
    "Coordinates were taken from the ABAAE Beliche entry, but the Blue Flag season shown there is historic and should not be treated as current status.",
    "Facilities are included only where listed by VisitPortugal and marked Seasonal where likely dependent on the bathing season or concession operation.",
    "Visit Algarve identifies Beliche as restricted use because a large part of the beach lies in a landslide-risk area; this warning is included prominently in the listing.",
    "Accessible-beach support, toilets, showers and sunshade rental were not verified from authoritative current sources and are marked Not verified.",
    "Some municipal and APA pages returned limited text or fetch restrictions during verification, so those facts are used cautiously and supported by VisitPortugal, Visit Algarve and ABAAE where possible.",
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
  where slug = 'sagres';

  if v_city_id is null then
    raise exception 'Sagres city was not found';
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
