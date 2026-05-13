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
  v_slug text := 'praia-do-ancao-loule';
  v_name text := 'Praia do Ancão';
  v_address text := 'Praia do Ancão, Vale do Ancão, Almancil, Loulé, Algarve, Portugal';
  v_website_url text := 'https://www.visitportugal.com/pt-pt/content/praia-do-anc%C3%A3o';
  v_latitude numeric := 37.033083;
  v_longitude numeric := -8.039095;
  v_tags text[];
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Ancão",
  "slug": "praia-do-ancao-loule",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Vale do Ancão / Almancil",
  "concelho": "Loulé",
  "municipality": "Loulé",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Ancão is a spacious dune-backed beach in Loulé, set within the Ria Formosa Natural Park between the Quinta do Lago and Vale do Lobo coastal area. Known for its wide sand, protected landscape and strong beach support, it offers a refined yet natural Algarve beach setting.",
  "full_description": "Praia do Ancão is one of Loulé’s most distinctive beaches, positioned at the western edge of the Ria Formosa lagoon system and within the protected natural-park landscape. Set close to the Quinta do Lago and Vale do Lobo area, it combines the practical comfort expected from this part of the Algarve coast with a quieter natural setting of dunes, pine woodland and broad sand.\n\nOfficial tourism sources describe Ancão as a large sandy beach surrounded by dunes and pines, with strong beach-support infrastructure. The setting feels more natural than the busier urban beaches of Quarteira and Vilamoura, yet it remains closely connected to some of Loulé’s most established resort and residential areas. This makes it especially suitable for families, couples, beach walkers and visitors staying around Almancil, Quinta do Lago, Vale do Lobo or the wider Golden Triangle area.\n\nThe beach is listed by VisitPortugal with Blue Flag, seasonal surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible-beach status. These services may depend on the bathing season and local concession operation, so visitors should confirm current availability before travelling.\n\nABAAE verifies Ancão as a 2026 Blue Flag beach, with the bathing season from 1 June to 30 September 2026 and the Blue Flag season from 1 July to 30 September 2026. Visitors should protect the dunes, use marked access routes and follow local flags, signage and safety guidance.",
  "coordinates": {
    "latitude": 37.033083,
    "longitude": -8.039095,
    "label": "Praia do Ancão",
    "notes": "Primary listing coordinates use the official ABAAE Ancão beach entry.",
    "bathing_areas": [
      {
        "name": "Ancão",
        "latitude": 37.033083,
        "longitude": -8.039095,
        "type": "Dune-backed maritime beach",
        "verification_status": "Verified"
      }
    ]
  },
  "beach_type": "Large sandy maritime beach with dunes and Ria Formosa natural-park setting",
  "landscape": "A wide sandy beach backed by dune cordons, pine woodland and the western edge of the Ria Formosa lagoon system.",
  "access": "Official tourism sources list access by car, motorcycle and on foot. The beach sits in the Vale do Ancão area of Loulé, close to the Quinta do Lago and Vale do Lobo coastal zone. Visitors should confirm current parking and access conditions before travelling in peak summer.",
  "highlights": [
    "Dune-backed beach within the Ria Formosa Natural Park",
    "Located in the Quinta do Lago / Vale do Lobo coastal area of Loulé",
    "Large sandy beach with pine and wetland surroundings",
    "Strong beach-support infrastructure listed by official tourism sources",
    "Accessible-beach status listed by VisitPortugal",
    "Official 2026 Blue Flag listing for Ancão"
  ],
  "best_for": [
    "Families",
    "Couples",
    "Resort beach days",
    "Accessible beach access, subject to current confirmation",
    "Long beach walks",
    "Nature lovers",
    "Ria Formosa scenery",
    "Water sports when conditions are suitable",
    "Visitors staying in Quinta do Lago, Vale do Lobo or Almancil"
  ],
  "facilities": [
    { "name": "Blue Flag 2026 listing", "status": "Seasonal" },
    { "name": "Safety or surveillance listed by official tourism source", "status": "Seasonal" },
    { "name": "Accessible beach recognition", "status": "Verified / Seasonal support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / Seasonal" },
    { "name": "Car parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified / Seasonal" },
    { "name": "Restaurant", "status": "Verified / Seasonal" },
    { "name": "Windsurfing", "status": "Seasonal / conditions dependent" },
    { "name": "Sailing", "status": "Seasonal / conditions dependent" },
    { "name": "Amphibious chair and assisted bathing support listed by Visit Algarve accessible-beach information", "status": "Seasonal / verify before visiting" }
  ],
  "includes": [
    "Blue Flag 2026 listing",
    "Seasonal beach surveillance",
    "Accessible beach recognition",
    "Sunshade rental",
    "Light boat rental",
    "Showers",
    "Car parking",
    "Bar and restaurant",
    "Windsurfing and sailing",
    "Ria Formosa Natural Park setting"
  ],
  "important_information": {
    "best_time_to_visit": "June to September for the official bathing season and full beach-support period. May, June and September are usually more comfortable for long walks, nature scenery and fewer peak-summer crowds.",
    "know_before_you_go": "ABAAE lists the 2026 bathing season for Ancão as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Ancão as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.\nThe beach is within the Ria Formosa Natural Park; visitors should protect dunes, wetland areas and marked access paths.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nPeak summer can be busy around the main access points and serviced beach areas.",
    "notes": [
      "ABAAE lists the 2026 bathing season for Ancão as 1 June 2026 to 30 September 2026.",
      "ABAAE lists the 2026 Blue Flag season for Ancão as 1 July 2026 to 30 September 2026.",
      "At the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.",
      "Facilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.",
      "The beach is within the Ria Formosa Natural Park; visitors should protect dunes, wetland areas and marked access paths.",
      "Sea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.",
      "Peak summer can be busy around the main access points and serviced beach areas."
    ]
  },
  "important_notes": "ABAAE lists the 2026 bathing season for Ancão as 1 June 2026 to 30 September 2026.\nABAAE lists the 2026 Blue Flag season for Ancão as 1 July 2026 to 30 September 2026.\nAt the time of verification, ABAAE showed the Blue Flag as not yet hoisted, consistent with the season not having started.\nFacilities, surveillance, accessible-beach support and water-sports services may vary by season and concession operation.\nThe beach is within the Ria Formosa Natural Park; visitors should protect dunes, wetland areas and marked access paths.\nSea and wind conditions can vary; visitors should follow local flags, signage and official safety guidance.\nPeak summer can be busy around the main access points and serviced beach areas.",
  "best_time_to_visit": "June to September for the official bathing season and full beach-support period. May, June and September are usually more comfortable for long walks, nature scenery and fewer peak-summer crowds.",
  "suitable_for": [
    "Visitors staying in Quinta do Lago, Vale do Lobo or Almancil",
    "Families wanting a serviced beach with space",
    "Couples looking for a refined but natural beach setting",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Beach walkers",
    "Nature-focused travellers",
    "Water-sports users when conditions are suitable"
  ],
  "not_suitable_for": [
    "Visitors seeking an urban promenade beach",
    "Visitors who want a remote wild beach with no services",
    "Those wishing to avoid resort-area beaches in peak summer",
    "Visitors requiring accessibility support without confirming current seasonal arrangements",
    "Anyone intending to walk across protected dunes or wetland areas"
  ],
  "nearby_attractions": [
    {
      "name": "Ria Formosa Natural Park",
      "type": "Protected natural park",
      "description": "A protected lagoon and wetland system extending along the eastern Algarve, forming the natural setting around Ancão and Quinta do Lago.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Quinta do Lago",
      "type": "Nearby beach",
      "description": "A neighbouring Loulé beach east of Ancão, also connected with the Ria Formosa and Quinta do Lago coastal area.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Garrão Poente",
      "type": "Nearby beach",
      "description": "A neighbouring beach west of Ancão, part of the Loulé coast between Vale do Lobo and Quinta do Lago.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale do Lobo",
      "type": "Nearby resort and coastal area",
      "description": "A nearby coastal resort area west of Ancão, useful for restaurants, accommodation and access to the wider Loulé beach sequence.",
      "verification_status": "Verified"
    },
    {
      "name": "Quinta do Lago",
      "type": "Nearby resort and nature area",
      "description": "A nearby resort and Ria Formosa access area east of Ancão, associated with beach access, walking routes and lagoon scenery.",
      "verification_status": "Verified"
    },
    {
      "name": "Almancil",
      "type": "Nearby town",
      "description": "The inland parish and service town linked with the Quinta do Lago, Ancão and Vale do Lobo coastal area.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Almancil",
    "Quinta do Lago",
    "Vale do Lobo",
    "Quarteira",
    "Loulé",
    "Faro"
  ],
  "walking_trails_nearby": [
    {
      "name": "Garrão, Ancão and Quinta do Lago boardwalks",
      "description": "Visit Algarve references wooden trails linking the beaches of Garrão and Ancão with Faro and Quinta do Lago over nearly five kilometres of boardwalks. Visitors should follow marked routes and respect dune protection.",
      "verification_status": "Verified"
    },
    {
      "name": "Ancão to Quinta do Lago shoreline walk",
      "description": "A sandy beach walk towards Quinta do Lago, best planned according to tide, heat, wind and marked access routes.",
      "verification_status": "Verified"
    },
    {
      "name": "Ancão to Garrão shoreline walk",
      "description": "A practical beach walk west towards Garrão and the Vale do Lobo area, suitable when tide and weather conditions allow.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Arrive early in July and August for easier access to parking and serviced beach areas.",
    "Confirm accessible-beach support before travelling if an amphibious chair or assisted bathing is required.",
    "Use boardwalks and marked paths to protect dunes and wetland habitats.",
    "Check beach flags before swimming or using water-sports services.",
    "Bring sun protection and water if planning a longer walk towards Garrão or Quinta do Lago.",
    "Treat Blue Flag, surveillance and water-sports services as seasonal rather than permanent."
  ],
  "photography_notes": "Praia do Ancão photographs well for its dune-backed sand, Ria Formosa light and refined resort-coast atmosphere. Early morning and late afternoon are usually best for softer light, quieter boardwalks and wider beach views.",
  "family_notes": "Praia do Ancão can suit families because of its wide sand, official beach services and accessible-beach recognition. Families should still choose supervised seasonal areas where available, check flags and keep children off protected dunes.",
  "safety_notes": "Sea and wind conditions can vary. Follow beach flags, local signage and instructions from surveillance teams where present. Use marked access routes and avoid walking through protected dune or wetland areas.",
  "accessibility_notes": "VisitPortugal lists Praia do Ancão as an accessible beach, and Visit Algarve’s accessible-beach information lists Ancão with an amphibious chair and assisted bathing support. Current seasonal availability, adapted equipment and the most suitable access point should be confirmed before visiting.",
  "seo": {
    "meta_title": "Praia do Ancão, Loulé | Algarve Beach Guide",
    "meta_description": "Praia do Ancão in Loulé is a dune-backed Ria Formosa beach near Quinta do Lago and Vale do Lobo, with Blue Flag status and services.",
    "keywords": [
      "Praia do Ancão",
      "Ancão Beach",
      "Praia do Ancão Loulé",
      "Loulé beaches",
      "Quinta do Lago beach area",
      "Vale do Lobo beaches",
      "Almancil beaches",
      "Ria Formosa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Blue Flag Ancão",
      "accessible beach Loulé",
      "family beach Algarve"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Ancão",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-anc%C3%A3o",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location in Loulé",
        "Integration in the Ria Formosa Natural Park",
        "Large sandy beach",
        "Dunes and pine surroundings",
        "Beach-support infrastructure",
        "Facilities including Blue Flag, surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, windsurf, sailing and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Ancão",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/ancao/",
      "facts_verified": [
        "Official Ancão beach entry",
        "Coastal beach classification",
        "Municipality of Loulé",
        "Coordinates",
        "Beach code PTCW2C",
        "Address at Vale do Ancão",
        "2026 bathing season",
        "2026 Blue Flag season",
        "Blue Flag shown as not hoisted at time of verification"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/wp-content/uploads/sites/2/2026/04/BA_listas-regioes_2026.pdf",
      "facts_verified": [
        "Ancão listed among Loulé’s 2026 Blue Flag coastal beach locations",
        "Nearby Loulé 2026 Blue Flag beaches including Quinta do Lago, Garrão Nascente, Garrão Poente and Vale do Lobo"
      ]
    },
    {
      "source_name": "Visit Algarve - Praia do Ancão",
      "source_url": "https://visitalgarve.pt/equipamento/8779/praia-do-anco",
      "facts_verified": [
        "Praia do Ancão at the western end of the Ria Formosa lagoon system",
        "Natural Park setting",
        "Wetland and dune landscape context from official regional tourism summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - Praia do Ancão",
      "source_url": "https://www.cm-loule.pt/pt/menu/647/praia-do-ancao.aspx",
      "facts_verified": [
        "Municipal beach page located",
        "Natural and serene setting",
        "Most isolated beach in Loulé municipality",
        "Extensive dune cordon",
        "Association with a wetland area with marsh characteristics, based on official search-result summary"
      ]
    },
    {
      "source_name": "Câmara Municipal de Loulé - 2026 Blue Flag news",
      "source_url": "https://www.cm-loule.pt/pt/noticias/54026/litoral-do-concelho-de-loule-distinguido-com-bandeiras-azuis.aspx",
      "facts_verified": [
        "Ancão listed among Loulé beaches distinguished with Blue Flag in 2026",
        "Nearby Loulé coastal context including Quinta do Lago, Garrão Nascente, Garrão Poente and Vale do Lobo"
      ]
    },
    {
      "source_name": "Visit Algarve - Accessible Beaches",
      "source_url": "https://visitalgarve.pt/3276/praias-acessiveis.aspx",
      "facts_verified": [
        "Ancão listed with amphibious chair and assisted bathing support in 2025 accessible-beach information",
        "Accessible-beach support treated as requiring current seasonal confirmation"
      ]
    },
    {
      "source_name": "Visit Algarve - Pelos passadiços",
      "source_url": "https://visitalgarve.pt/29300/pelos-passadic-os",
      "facts_verified": [
        "Boardwalk route context",
        "Wooden trails linking Garrão and Ancão to Faro and Quinta do Lago over almost five kilometres, based on official regional tourism summary"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Loulé municipality, Vale do Ancão address, Ria Formosa Natural Park context, facilities, coordinates and 2026 Blue Flag season were verified from VisitPortugal and ABAAE.",
    "The Quinta do Lago / Vale do Lobo area positioning is supported by Loulé’s official coastal sequence and by nearby 2026 Blue Flag listings for Quinta do Lago, Garrão and Vale do Lobo.",
    "ABAAE verifies Ancão’s 2026 bathing season as 1 June 2026 to 30 September 2026 and Blue Flag season as 1 July 2026 to 30 September 2026.",
    "At the time of verification, ABAAE showed the Blue Flag as not hoisted, so Blue Flag status is treated as seasonal rather than permanently active.",
    "Facilities are included only where listed by official tourism sources and marked Seasonal where operation may depend on bathing season, concession activity or sea conditions.",
    "Accessibility is verified at recognition level by VisitPortugal, with additional 2025 accessible-beach support information from Visit Algarve; current support should be checked before visiting.",
    "Some municipal and regional pages returned limited accessible text or temporary fetch errors, so those facts are used cautiously from official search-result summaries and supported by VisitPortugal and ABAAE.",
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
