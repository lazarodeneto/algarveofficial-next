begin;

insert into public.cities (name, slug, latitude, longitude, is_active, is_featured)
values ('Carvoeiro', 'carvoeiro', 37.096196, -8.472004, true, false)
on conflict (slug) do update set
  name = excluded.name,
  latitude = coalesce(public.cities.latitude, excluded.latitude),
  longitude = coalesce(public.cities.longitude, excluded.longitude),
  is_active = true,
  updated_at = now();

insert into public.regions (name, slug, short_description, description, display_order, is_active, is_featured)
values (
  'Carvoeiro Cliffs',
  'carvoeiro-cliffs',
  'Dramatic coastline and hidden coves',
  'Breathtaking cliff formations, secluded beaches, and charming village atmosphere. Where natural beauty meets refined coastal living.',
  3,
  true,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  is_active = true,
  updated_at = now();

do $$
declare
  v_owner_id uuid := '280be9b4-c0fe-48f3-b371-f490d8cccfd5'::uuid;
  v_category_id uuid;
  v_city_id uuid;
  v_region_id uuid;
  v_listing_id uuid;
  v_slug text := 'casa-do-mar-luxury-t3-villa-infinity-pool-sea-view-vale-centeanes-carvoeiro';
  v_name text := 'Casa do Mar | Luxury T3 Villa | Infinity Pool and Sea View | Walk to Vale de Centeanes Beach';
  v_source_url text := 'https://www.kwportugal.pt/pt/Imovel/Venda/Moradia/Faro/Lagoa-(Algarve)/Lagoa-e-Carvoeiro/67195';
  v_featured_image_url text := 'https://imgs.soukwportugal.pt/39142/properties/45964105-69ac-415d-96d6-1233077d98b3.jpg';
  v_description text := 'Casa do Mar is a luxury T3 villa under construction in Vale Centeanes, Carvoeiro, designed for refined coastal living within walking distance of Vale de Centeanes Beach.' || E'\n\n' ||
    'The south-facing home is planned around panoramic sea views, generous natural light, contemporary architecture, and high-end finishes. Its layout includes three private suites, spacious leisure areas, and a direct connection to the outdoor living spaces.' || E'\n\n' ||
    'Outside, an infinity pool frames the Atlantic outlook, with terraces and balconies arranged for relaxed entertaining and everyday comfort. The property is close to the beach, local services, restaurants, and golf courses, making it suitable as a private residence or premium Algarve retreat.';
  v_short_description text := 'Luxury T3 villa under construction in Vale Centeanes, Carvoeiro, with an infinity pool, panoramic sea views, and a 700 m2 plot.';
  v_gallery text[] := array[
    'https://imgs.soukwportugal.pt/39142/properties/45964105-69ac-415d-96d6-1233077d98b3.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/88c87684-12e4-44ae-9088-c8d8b67bf8e8.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/6a5dc7f4-323b-4600-82ce-6e8f3437572e.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/14efe57a-c4c5-412d-8a8e-9735ace352fc.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/d2251c87-17ef-4394-8a88-3421a89898e4.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/c27058ce-756d-4d58-b475-eb164e976073.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/0a1c1f08-86a2-4043-9d97-9a1fb0791872.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/61ab39d1-7429-4748-8b6a-7e6a099098de.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/31a69d4b-3b85-4546-81fb-018aac616c39.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/b437df0c-7d10-4250-a495-004f79f0e03b.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/867d6c2d-8fe7-464a-9cd4-6af76d44a6a1.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/9c68e6c9-3381-4800-b0b0-068253469c8c.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/406f57b1-7f91-4f9d-b5a4-f65f67df6e52.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/c54b5bab-c911-4984-a875-1b1fb881606c.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/a3175b0b-cf02-461d-a137-6c3d760d59bf.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/49d4e02a-d9f3-4615-8c70-1fe20e4684f9.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/e0921b93-7be6-41d1-9c63-42021c342930.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/d078fe84-f759-4183-877f-ed2120c58e56.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/3f643a6f-d8d7-4e6c-9b04-e072032d9fd7.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/fa9b6241-de42-42ce-aa45-c6f4e039ad6a.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/9f715d24-07c4-47cf-b5f3-33f04eca16fc.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/ecf0a187-7913-4a4f-8c3b-9e7a39250885.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/4fc5ef49-4b92-44b0-8647-ecb0b547d7b3.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/f5e93202-add0-4a68-8728-82f4f1201a20.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/5011a236-435d-4660-9220-0a04df2bf505.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/26ece524-8e3e-47f8-ba50-51155328c4aa.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/685a9b61-6a91-4e63-866d-72b08f16f90f.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/5a02efc3-57b8-415e-a5e4-78718c13957d.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/98e364ad-1ec0-471a-a266-a54e94426a19.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/08dd3f1b-a7fd-41d8-9aaf-48651bf92d63.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/19962c14-9501-424a-8deb-c88e3314deed.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/4238cfb7-faa6-4c87-97ef-b907845db52e.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/93d6cb18-8f18-4258-a67f-0f86ecbe4bd4.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/83c91ded-8b4e-4ec7-89f1-5996fb848053.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/08701ab9-0049-44d1-9938-74d65deaa6aa.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/e2b9ad2a-8535-4a29-964d-f3723ae35bbf.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/4e2d837e-e9a1-4f98-88b9-e0cc10e4c242.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/0e8e8e25-2cd9-4a83-9b60-65131799366a.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/af1f64a7-b0f1-4100-9cea-a8bdc1c7c064.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/21ecc738-542f-4175-afe5-b87d887742d7.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/41eaf150-6895-4df6-8f9c-a9085305c02b.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/d7b425df-4dc6-47be-9e2c-b1e6adbc4cf4.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/153be1c6-fcac-4885-962a-fac7749e3278.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/8f149ffa-389b-44e8-91fb-1ef27680f2ce.jpg',
    'https://imgs.soukwportugal.pt/39142/properties/78a8559d-63cc-438d-af88-3519ac533b3f.jpg'
  ];
  v_category_data jsonb;
begin
  select id into v_category_id
  from public.categories
  where slug = 'real-estate'
  limit 1;

  select id into v_city_id
  from public.cities
  where slug = 'carvoeiro'
  limit 1;

  select id into v_region_id
  from public.regions
  where slug = 'carvoeiro-cliffs'
  limit 1;

  if v_category_id is null then
    raise exception 'Required category real-estate was not found';
  end if;

  if v_city_id is null then
    raise exception 'Required city carvoeiro was not found';
  end if;

  if v_region_id is null then
    raise exception 'Required region carvoeiro-cliffs was not found';
  end if;

  insert into public.city_region_mapping (city_id, region_id, is_primary)
  values (v_city_id, v_region_id, true)
  on conflict (city_id, region_id) do update set
    is_primary = true;

  v_category_data := $json$
  {
    "vertical": "property",
    "source": {
      "provider": "Keller Williams Portugal",
      "source_url": "https://www.kwportugal.pt/pt/Imovel/Venda/Moradia/Faro/Lagoa-(Algarve)/Lagoa-e-Carvoeiro/67195",
      "external_id": "67195",
      "reference": "KWPT-032090",
      "language": "pt",
      "scraped_at": "2026-05-12T14:58:57+01:00",
      "source_created_at": "2026-05-05T00:00:00",
      "source_updated_at": "2026-05-12T12:25:05"
    },
    "source_status": "Under construction",
    "source_business_type": "Sale",
    "source_category": "Residential",
    "source_type": "Villa",
    "source_subtype": "Detached villa",
    "source_area": "Vale Centeanes (Carvoeiro)",
    "source_region": {
      "district": "Faro",
      "municipality": "Lagoa (Algarve)",
      "parish": "Lagoa e Carvoeiro",
      "locality": "Carvoeiro"
    },
    "property": {
      "property_type": "villa",
      "transaction_type": "sale",
      "price": 3640000,
      "currency": "EUR",
      "bedrooms": 3,
      "bathrooms": 5,
      "built_area_m2": 430,
      "living_area_m2": 325,
      "plot_area_m2": 700,
      "property_size_m2": 325,
      "area_sqm": 325,
      "plot_size_m2": 700,
      "plot_sqm": 700,
      "year_built": 2026,
      "energy_certificate": "A+",
      "pool": true,
      "private_pool": true,
      "garden": true,
      "parking_spaces": 3,
      "sea_view": true,
      "heating": true,
      "air_conditioning": true,
      "elevator": true,
      "total_floors": 3,
      "agent_name": "KW Portugal",
      "agent_phone": "+351961822873",
      "agent_email": "dlopes@kwportugal.pt",
      "agency_name": "KW Flash Algarve Barlavento",
      "property_url": "https://www.kwportugal.pt/pt/Imovel/Venda/Moradia/Faro/Lagoa-(Algarve)/Lagoa-e-Carvoeiro/67195",
      "reference_code": "KWPT-032090",
      "availability_status": "under_construction"
    },
    "property_type": "villa",
    "transaction_type": "sale",
    "price": 3640000,
    "currency": "EUR",
    "bedrooms": 3,
    "bathrooms": 5,
    "built_area_m2": 430,
    "living_area_m2": 325,
    "plot_area_m2": 700,
    "property_size_m2": 325,
    "area_sqm": 325,
    "plot_size_m2": 700,
    "plot_sqm": 700,
    "year_built": 2026,
    "energy_certificate": "A+",
    "pool": true,
    "private_pool": true,
    "garden": true,
    "parking_spaces": 3,
    "sea_view": true,
    "heating": true,
    "air_conditioning": true,
    "elevator": true,
    "total_floors": 3,
    "agent_name": "KW Portugal",
    "agent_phone": "+351961822873",
    "agent_email": "dlopes@kwportugal.pt",
    "agent_image": "https://imgs.soukwportugal.pt//Agents/Images/b8f3cf36-7855-499f-a118-786b231434fb.png",
    "agency_name": "KW Flash Algarve Barlavento",
    "property_url": "https://www.kwportugal.pt/pt/Imovel/Venda/Moradia/Faro/Lagoa-(Algarve)/Lagoa-e-Carvoeiro/67195",
    "reference_code": "KWPT-032090",
    "availability_status": "under_construction",
    "measurements": {
      "living_area_m2": 325,
      "built_area_m2": 430,
      "plot_area_m2": 700,
      "deployment_area_m2": 198.9
    },
    "typology": "T3",
    "suites": 3,
    "living_rooms": 1,
    "exclusive": true,
    "reduced_mobility": true,
    "agency": {
      "name": "KW Flash Algarve Barlavento",
      "legal_name": "REALFLASH BARLAVENTO - MEDIACAO IMOBILIARIA LDA",
      "network": "KW Portugal",
      "source_agent_name": "Pedro Chaves",
      "source_agent_url": "https://www.kwportugal.pt/pt/agente/Pedro-Chaves/39142",
      "source_agent_phone": "+351282491059",
      "source_agent_mobile": "+351924181950",
      "source_agent_whatsapp": "+351924181950",
      "source_agent_email": "pedro.chaves@kwportugal.pt",
      "source_agent_image": "https://imgs.soukwportugal.pt//Agents/Images/b8f3cf36-7855-499f-a118-786b231434fb.png"
    },
    "media": {
      "featured_image": "https://imgs.soukwportugal.pt/39142/properties/45964105-69ac-415d-96d6-1233077d98b3.jpg",
      "default_image_url": "https://imgs.soukwportugal.pt/39142/properties/6a5dc7f4-323b-4600-82ce-6e8f3437572e_s.jpg",
      "gallery_count": 45,
      "video_url": "https://www.youtube.com/watch?v=uIAdGQQRbBc",
      "uploaded_video_url": "https://imgs.soukwportugal.pt/39142/properties/a71b1c36-c0a3-4ac8-a766-88d79c936477.mp4"
    },
    "features": {
      "highlights": [
        "infinity pool",
        "panoramic sea view",
        "walking distance to Vale de Centeanes Beach",
        "3 suites",
        "terrace",
        "balconies",
        "gardens",
        "automatic irrigation",
        "video intercom",
        "security door",
        "fiber optic internet",
        "reduced-mobility access",
        "EV charging"
      ],
      "main": [
        "Number of elevators: 1",
        "Gardens",
        "Outdoor pool",
        "Air conditioning",
        "Terrace",
        "Balcony"
      ],
      "groups": {
        "Proximity": ["Beaches"],
        "Views": ["Beach", "Sea"],
        "Climate control": ["Central heating", "Air conditioning"],
        "Outdoor spaces": ["Terrace", "Balcony", "Patio"],
        "Equipment": [
          "Video intercom",
          "Gardens",
          "Automatic irrigation",
          "Outdoor pool",
          "Solarium",
          "Mechanical ventilation",
          "Automated building",
          "Fiber optic internet",
          "Underfloor heating",
          "Security door",
          "Reduced-mobility access",
          "Fast EV charging point"
        ],
        "Solar exposure": ["South", "East", "West"]
      },
      "totals": {
        "balconies": 3,
        "terraces": 1,
        "basements": 1,
        "pools": 1,
        "frontages": 4,
        "floors": 3
      }
    },
    "nearby": [
      "Vale de Centeanes Beach",
      "restaurants",
      "services",
      "golf courses"
    ],
    "verification": {
      "confidence": "high",
      "notes": "Scraped from the public KW Portugal listing page and schema.org RealEstateListing data. Ownership and current availability were not independently verified beyond the source status."
    }
  }
  $json$::jsonb;

  select id into v_listing_id
  from public.listings
  where slug = v_slug
     or category_data #>> '{source,external_id}' = '67195'
     or category_data #>> '{source,reference}' = 'KWPT-032090'
  order by case when slug = v_slug then 0 else 1 end, updated_at desc
  limit 1;

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
      contact_phone,
      contact_email,
      whatsapp_number,
      address,
      latitude,
      longitude,
      featured_image_url,
      price_from,
      price_currency,
      tags,
      category_data,
      meta_title,
      meta_description,
      published_at
    ) values (
      v_name,
      v_slug,
      v_description,
      v_short_description,
      v_owner_id,
      v_category_id,
      v_city_id,
      v_region_id,
      'unverified'::public.listing_tier,
      'published'::public.listing_status,
      false,
      v_source_url,
      '+351961822873',
      'dlopes@kwportugal.pt',
      '+351961822873',
      'Vale Centeanes (Carvoeiro), Carvoeiro, Lagoa e Carvoeiro, Lagoa, Faro, Portugal',
      37.09263,
      -8.45355,
      v_featured_image_url,
      3640000,
      'EUR',
      array[
        'luxury villa',
        'sea view',
        'infinity pool',
        'new build',
        'Vale Centeanes',
        'Carvoeiro',
        'walk to beach'
      ],
      v_category_data,
      v_name,
      'Luxury T3 villa for sale with 430 m2 of built area, under construction in Lagoa and Carvoeiro, Algarve.',
      now()
    )
    returning id into v_listing_id;
  else
    update public.listings
    set
      name = v_name,
      slug = v_slug,
      description = v_description,
      short_description = v_short_description,
      category_id = v_category_id,
      city_id = v_city_id,
      region_id = v_region_id,
      website_url = v_source_url,
      contact_phone = '+351961822873',
      contact_email = 'dlopes@kwportugal.pt',
      whatsapp_number = '+351961822873',
      address = 'Vale Centeanes (Carvoeiro), Carvoeiro, Lagoa e Carvoeiro, Lagoa, Faro, Portugal',
      latitude = 37.09263,
      longitude = -8.45355,
      featured_image_url = v_featured_image_url,
      price_from = 3640000,
      price_currency = 'EUR',
      tags = array[
        'luxury villa',
        'sea view',
        'infinity pool',
        'new build',
        'Vale Centeanes',
        'Carvoeiro',
        'walk to beach'
      ],
      category_data = v_category_data,
      meta_title = v_name,
      meta_description = 'Luxury T3 villa for sale with 430 m2 of built area, under construction in Lagoa and Carvoeiro, Algarve.',
      published_at = coalesce(published_at, now()),
      updated_at = now()
    where id = v_listing_id;
  end if;

  delete from public.listing_images
  where listing_id = v_listing_id;

  insert into public.listing_images (
    listing_id,
    image_url,
    alt_text,
    display_order,
    is_featured
  )
  select
    v_listing_id,
    gallery_image.image_url,
    v_name,
    (gallery_image.display_order - 1)::integer,
    gallery_image.display_order = 1
  from unnest(v_gallery) with ordinality as gallery_image(image_url, display_order);

  if to_regclass('public.listing_slugs') is not null then
    update public.listing_slugs
    set is_current = false
    where listing_id = v_listing_id
      and slug <> v_slug;

    insert into public.listing_slugs (listing_id, slug, is_current)
    values (v_listing_id, v_slug, true)
    on conflict (slug) do update set
      listing_id = excluded.listing_id,
      is_current = true;
  end if;
end $$;

commit;
