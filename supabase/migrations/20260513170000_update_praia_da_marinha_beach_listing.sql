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
  'Caramujeira',
  'caramujeira',
  'Small Lagoa coastal locality close to Praia da Marinha and the central Algarve cliffs.',
  37.090038,
  -8.412492,
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
  v_slug text := 'praia-da-marinha-lagoa';
  v_name text := 'Praia da Marinha';
  v_short_description text := $short$
Praia da Marinha is a cliff-framed maritime beach near Caramujeira in Lagoa, known for its limestone formations, elevated viewpoints, and direct connection to the Seven Hanging Valleys Trail.
$short$;
  v_description text := $description$
Praia da Marinha is one of Lagoa's most recognisable coastal landscapes, set below high limestone cliffs near Caramujeira on the central Algarve coast. Official tourism sources describe it as a maritime beach surrounded by cliffs sculpted by erosion, with views from the cliff-top before the descent to the sand. This is the kind of Algarve image many visitors have in mind: ochre rock, natural arches, a compact sandy cove, and clear contrasts between cliff, sea, and sky.

The beach is reached from above, with VisitPortugal noting a long staircase down to the sand. That elevated access is part of the experience, but it also makes Praia da Marinha less practical for visitors who need step-free access or who prefer easy beach logistics. The setting is scenic rather than spacious, and peak-season demand can be high, particularly because the beach sits on the celebrated Seven Hanging Valleys coastline.

Praia da Marinha is also an important walking point. Lagoa Municipality confirms that the Seven Hanging Valleys Trail links Praia de Vale Centeanes to Praia da Marinha over 5.7 km, following an almost continuous line of cliffs shaped by suspended valleys, limestone formations, habitats, seabirds, and coastal vegetation. Visitors should treat the cliffs with care: Lagoa's own tourism material warns that the rocky cliffs can be unstable and that visitors should keep a safe distance. For a well-balanced visit, combine beach time with the cliff-top views, the trail, and nearby beaches such as Benagil, Carvalho, Albandeira, and Vale Centeanes.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Marinha",
  "slug": "praia-da-marinha-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Caramujeira",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Marinha is a cliff-framed maritime beach near Caramujeira in Lagoa, known for its limestone formations, elevated viewpoints, and direct connection to the Seven Hanging Valleys Trail.",
  "full_description": "Praia da Marinha is one of Lagoa's most recognisable coastal landscapes, set below high limestone cliffs near Caramujeira on the central Algarve coast. Official tourism sources describe it as a maritime beach surrounded by cliffs sculpted by erosion, with views from the cliff-top before the descent to the sand. This is the kind of Algarve image many visitors have in mind: ochre rock, natural arches, a compact sandy cove, and clear contrasts between cliff, sea, and sky.\n\nThe beach is reached from above, with VisitPortugal noting a long staircase down to the sand. That elevated access is part of the experience, but it also makes Praia da Marinha less practical for visitors who need step-free access or who prefer easy beach logistics. The setting is scenic rather than spacious, and peak-season demand can be high, particularly because the beach sits on the celebrated Seven Hanging Valleys coastline.\n\nPraia da Marinha is also an important walking point. Lagoa Municipality confirms that the Seven Hanging Valleys Trail links Praia de Vale Centeanes to Praia da Marinha over 5.7 km, following an almost continuous line of cliffs shaped by suspended valleys, limestone formations, habitats, seabirds, and coastal vegetation. Visitors should treat the cliffs with care: Lagoa's own tourism material warns that the rocky cliffs can be unstable and that visitors should keep a safe distance. For a well-balanced visit, combine beach time with the cliff-top views, the trail, and nearby beaches such as Benagil, Carvalho, Albandeira, and Vale Centeanes.",
  "coordinates": {
    "latitude": 37.090038,
    "longitude": -8.412492,
    "notes": "Coordinates were taken from Lagoa tourism material. Manual GIS confirmation is recommended before map publication."
  },
  "beach_type": "Maritime natural beach / cliff-framed sandy cove",
  "landscape": "A compact sandy beach below high limestone cliffs, with sculpted rock formations, natural arches, cliff-top viewpoints, and the distinctive coastal scenery of the Lagoa section of the Algarve.",
  "access": "Access is from the cliff-top, with VisitPortugal noting a long staircase down to the beach. VisitAlgarve lists road access by tarmacked road from Lagoa or from the EN125, following signs to the beach. Praia da Marinha is also the eastern reference point of the Seven Hanging Valleys Trail, which links it with Praia de Vale Centeanes.",
  "highlights": [
    "Iconic limestone cliff scenery associated with Lagoa's central Algarve coast.",
    "Elevated cliff-top viewpoints before the descent to the beach.",
    "Natural rock formations, arches, and sculpted coastal features.",
    "Eastern end point of the Seven Hanging Valleys Trail.",
    "Strong photography appeal from the beach, staircase approach, and nearby cliff route.",
    "Natural beach setting verified by Lagoa tourism material."
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Coastal walks",
    "Nature lovers",
    "Couples",
    "Snorkelling when conditions allow",
    "Short beach stop",
    "Seven Hanging Valleys Trail"
  ],
  "facilities": [
    { "name": "Security or surveillance listed by VisitPortugal", "status": "Seasonal" },
    { "name": "Sunshade / awning hire listed by VisitPortugal", "status": "Seasonal" },
    { "name": "Small craft hire listed by VisitPortugal", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Parking area", "status": "Verified" },
    { "name": "Bar", "status": "Seasonal" },
    { "name": "Restaurant", "status": "Seasonal" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Step-free beach access", "status": "Not verified" }
  ],
  "includes": [
    "Showers",
    "Parking area",
    "Seasonal surveillance listed by VisitPortugal",
    "Seasonal sunshade / awning hire",
    "Seasonal small craft hire",
    "Seasonal bar",
    "Seasonal restaurant"
  ],
  "important_information": {
    "best_time_to_visit": "Spring and early autumn are especially suitable for the Seven Hanging Valleys Trail and cliff-top photography. In summer, early morning or later afternoon can be more comfortable for arrival, photography, and heat, but beach use should always depend on sea conditions, local signage, and any seasonal surveillance.",
    "know_before_you_go": "Praia da Marinha is accessed by a long staircase, so it may be challenging for visitors with reduced mobility, pushchairs, or heavy beach equipment.\nThe surrounding cliffs are a major part of the landscape but require caution. Keep away from cliff edges, cliff bases, fenced areas, and any signed rockfall-risk zones.\nOfficial Lagoa tourism material warns that the rocky cliffs can collapse unexpectedly and advises visitors to keep a safe distance.\nVisitAlgarve beach-guide information describes Praia da Marinha as a limited-use bathing beach because the sand is within a cliff-collapse risk zone; visitors should check local signage on arrival.\nFacilities, surveillance, bar and restaurant operation, and small craft hire may be seasonal. Verify before visiting.\nSea conditions can vary. Enter the water only when conditions, signage, and any lifeguard or surveillance instructions allow.\nThe beach can be under strong visitor pressure in peak season because of its international image and trail location. Arrive early or consider visiting outside the busiest summer hours."
  },
  "important_notes": "Praia da Marinha is accessed by a long staircase, so it may be challenging for visitors with reduced mobility, pushchairs, or heavy beach equipment.\nThe surrounding cliffs are a major part of the landscape but require caution. Keep away from cliff edges, cliff bases, fenced areas, and any signed rockfall-risk zones.\nOfficial Lagoa tourism material warns that the rocky cliffs can collapse unexpectedly and advises visitors to keep a safe distance.\nVisitAlgarve beach-guide information describes Praia da Marinha as a limited-use bathing beach because the sand is within a cliff-collapse risk zone; visitors should check local signage on arrival.\nFacilities, surveillance, bar and restaurant operation, and small craft hire may be seasonal. Verify before visiting.\nSea conditions can vary. Enter the water only when conditions, signage, and any lifeguard or surveillance instructions allow.\nThe beach can be under strong visitor pressure in peak season because of its international image and trail location. Arrive early or consider visiting outside the busiest summer hours.",
  "best_time_to_visit": "Spring and early autumn are especially suitable for the Seven Hanging Valleys Trail and cliff-top photography. In summer, early morning or later afternoon can be more comfortable for arrival, photography, and heat, but beach use should always depend on sea conditions, local signage, and any seasonal surveillance.",
  "suitable_for": [
    "Photographers",
    "Coastal walkers",
    "Nature-focused visitors",
    "Couples",
    "Visitors exploring Lagoa's cliff beaches",
    "Families prepared for stairs and close supervision",
    "Swimmers when sea conditions and signage allow"
  ],
  "not_suitable_for": [
    "Visitors requiring verified step-free access",
    "Visitors who cannot manage a long staircase",
    "Anyone seeking a large, flat, easy-access beach",
    "Unsupervised children near cliffs or stair access",
    "Visitors wanting a quiet beach during peak summer periods"
  ],
  "nearby_attractions": [
    {
      "name": "Seven Hanging Valleys Trail",
      "type": "Walking trail",
      "description": "A 5.7 km coastal walking route in Lagoa linking Praia de Vale Centeanes with Praia da Marinha, following cliffs, suspended valleys, limestone formations, habitats, and coastal viewpoints.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Benagil",
      "type": "Beach",
      "description": "A nearby Lagoa beach west of Praia da Marinha, historically associated with fishing and now closely linked to coastal cave-visit activity.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Carvalho",
      "type": "Beach",
      "description": "A small cliff-framed sandy beach west of Marinha, reached through a tunnel carved into the rock according to Lagoa tourism material.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Albandeira",
      "type": "Beach",
      "description": "A smaller cliff beach east of Praia da Marinha, described in Lagoa tourism material as a compact beach set among small sculpted cliffs.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Beach / trail point",
      "description": "The western reference point of the Seven Hanging Valleys Trail, making it a natural paired destination for walkers starting or finishing at Praia da Marinha.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Caramujeira",
    "Lagoa",
    "Benagil",
    "Carvoeiro",
    "Porches"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "Official municipal coastal trail extending for 5.7 km between Praia de Vale Centeanes and Praia da Marinha, along a cliff landscape shaped by suspended valleys and limestone formations.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Pause at the cliff-top viewpoints before descending; many of the strongest views are above the beach.",
    "Wear suitable footwear if combining the beach with the Seven Hanging Valleys Trail.",
    "Travel light if descending to the sand, as the staircase makes bulky equipment less convenient.",
    "Avoid sitting directly below cliff faces or crossing barriers for photographs.",
    "Check seasonal operation of facilities before relying on bars, restaurants, rentals, or surveillance.",
    "For a fuller Lagoa coast itinerary, pair Praia da Marinha with Benagil, Carvalho, Albandeira, or the Vale Centeanes section of the trail."
  ],
  "photography_notes": "Praia da Marinha is a strong photography location because of its elevated viewpoints, sculpted limestone cliffs, arches, and compact cove composition. The most useful angles are often from the cliff-top approach and the Seven Hanging Valleys Trail. Visitors should not step beyond barriers, approach unstable cliff edges, or stand beneath rock faces for photographs.",
  "family_notes": "Families can visit Praia da Marinha, but the long staircase, cliff environment, seasonal crowds, and rockfall-risk context mean close supervision is important. It is better suited to families comfortable with steps and coastal safety awareness than to visitors needing easy flat access.",
  "safety_notes": "Keep a safe distance from cliffs, cliff bases, and marked risk zones. Lagoa tourism material warns that the rocky cliffs can be unstable and may collapse unexpectedly. Sea conditions can vary, so visitors should follow local signage and any seasonal surveillance instructions before swimming or using small craft.",
  "accessibility_notes": "Accessibility information is not fully verified. VisitPortugal confirms a long staircase to the beach, and no official step-free beach access was verified from the sources checked. Visitors with reduced mobility should confirm current access conditions before visiting.",
  "seo": {
    "meta_title": "Praia da Marinha, Lagoa | Algarve Beach Guide",
    "meta_description": "Discover Praia da Marinha in Lagoa, an iconic Algarve cliff beach linked to the Seven Hanging Valleys Trail, viewpoints and limestone scenery.",
    "keywords": [
      "Praia da Marinha",
      "Marinha beach",
      "Praia da Marinha Lagoa",
      "Lagoa Algarve",
      "Algarve beaches",
      "Portugal beaches",
      "Seven Hanging Valleys Trail",
      "Sete Vales Suspensos",
      "cliff beach Algarve",
      "Caramujeira beach",
      "Algarve photography beach"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia da Marinha trip ideas",
      "links": [
        { "label": "Praia da Marinha" },
        { "label": "Marinha beach guide" },
        { "label": "Seven Hanging Valleys Trail" },
        { "label": "Lagoa cliff beaches" },
        { "label": "Algarve photography beaches" },
        { "label": "Sete Vales Suspensos" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Praia de Benagil" },
        { "label": "Praia do Carvalho" },
        { "label": "Praia de Albandeira" },
        { "label": "Praia de Vale Centeanes" },
        { "label": "Carvoeiro" },
        { "label": "Porches" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha",
      "facts_verified": [
        "Official beach name: Praia da Marinha.",
        "Beach category: maritime beach.",
        "Locality: Caramujeira - Lagoa.",
        "High cliff sculpted by erosion.",
        "Cliff-top views before descending to the beach.",
        "Long staircase access.",
        "Listed services: security or surveillance, sunshade / awning hire, small craft hire, showers, parking, bar, and restaurant."
      ]
    },
    {
      "source_name": "VisitPortugal - As melhores praias",
      "source_url": "https://www.visitportugal.com/pt-pt/content/melhores-praias",
      "facts_verified": [
        "Praia da Marinha listed under Lagoa.",
        "Official tourism description of the beach as scenic, preserved, and framed by cliffs sculpted by wind and sea erosion.",
        "Official tourism reference to its inclusion among the hundred best beaches in the world."
      ]
    },
    {
      "source_name": "Visit Algarve / Região de Turismo do Algarve - Praia da Marinha",
      "source_url": "https://visitalgarve.pt/equipamento/8745/Praia%20da%20Marinha",
      "facts_verified": [
        "Road access by tarmacked road from Lagoa or from the EN125, following signs to the beach.",
        "Official regional tourism confirmation of Praia da Marinha within the Algarve beach context."
      ]
    },
    {
      "source_name": "Visit Algarve - Guia de Praias",
      "source_url": "https://api.visitalgarve.pt/uploads/1/1/BrochurasPT/guia_de_praias_pt_web.pdf",
      "facts_verified": [
        "Praia da Marinha described as a bathing beach but classified as limited-use due to cliff-collapse risk across the sand area.",
        "Safety context for cliff-risk warnings."
      ]
    },
    {
      "source_name": "Município de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Seven Hanging Valleys Trail is a pedestrian nature route.",
        "Trail length verified as 5.7 km.",
        "Route links Praia de Vale Centeanes to Praia da Marinha.",
        "Route follows an almost continuous line of cliffs interrupted by waterlines, forming suspended valleys.",
        "Limestone cliffs, habitats, juniper scrub, seabirds, and caves verified as part of the trail landscape."
      ]
    },
    {
      "source_name": "Lagoa Tourism Brochure - Our Beaches",
      "source_url": "https://portal.oa.pt/media/124556/folheto-turistico-da-regiao-de-lagoa_algarve-i.pdf",
      "facts_verified": [
        "Praia da Marinha listed as a natural beach.",
        "GPS coordinates verified as 37.090038, -8.412492.",
        "Limestone cliffs, suspended porticos / natural formations, sea-bird setting, and underwater nature-interest context.",
        "Cliff instability warning and advice to keep a safety distance.",
        "Nearby Lagoa beaches including Benagil, Carvalho, and Albandeira verified in the same municipal tourism material."
      ]
    },
    {
      "source_name": "Município de Lagoa - Limpeza das Praias",
      "source_url": "https://www.cm-lagoa.pt/viver/ambiente-e-urbanismo/ambiente/servicos-publicos-essenciais/limpeza-das-praias",
      "facts_verified": [
        "Praia da Marinha included in Lagoa municipal beach-cleaning areas.",
        "Seven Hanging Valleys route listed between Vale Centeanes and Marinha.",
        "Municipal confirmation of year-round beach-cleaning service framework and high-season definition for cleaning operations."
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, locality, beach type, cliff landscape, staircase access, facilities listed by VisitPortugal, Seven Hanging Valleys Trail connection, and coordinates were verified from official or authoritative sources.",
    "The user-provided context of Praia da Marinha as an iconic Algarve image is supported by VisitPortugal's official description of the beach as scenic, preserved, cliff-framed, and recognised internationally.",
    "The Seven Hanging Valleys Trail details were verified from Lagoa Municipality, including the 5.7 km length and the connection between Praia de Vale Centeanes and Praia da Marinha.",
    "Coordinates were taken from Lagoa tourism material. Manual GIS confirmation is recommended before map publication.",
    "Facilities are included only where VisitPortugal lists them. Public toilets, current Blue Flag status, exact lifeguard dates, dog rules, and step-free accessibility were not verified.",
    "The cliff-risk and limited-use beach context should be checked against current local signage and any updated coastal-authority notices before publication.",
    "Some information could not be verified from authoritative sources. I have left those fields blank or marked them as Not verified.",
    "Listing structure and quality-control approach follow the uploaded BEACH GPT brief."
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
  where slug = 'caramujeira'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city caramujeira was not found';
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
      'https://www.visitportugal.com/pt-pt/content/praia-da-marinha',
      'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
      37.090038,
      -8.412492,
      array[
        'Praia da Marinha',
        'Marinha beach',
        'Praia da Marinha Lagoa',
        'Lagoa Algarve',
        'Seven Hanging Valleys Trail',
        'Sete Vales Suspensos',
        'cliff beach Algarve',
        'Caramujeira beach',
        'Algarve photography beach',
        'Portugal beaches'
      ],
      v_category_data,
      'Praia da Marinha, Lagoa | Algarve Beach Guide',
      'Discover Praia da Marinha in Lagoa, an iconic Algarve cliff beach linked to the Seven Hanging Valleys Trail, viewpoints and limestone scenery.',
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
      website_url = 'https://www.visitportugal.com/pt-pt/content/praia-da-marinha',
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
      address = 'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
      latitude = 37.090038,
      longitude = -8.412492,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia da Marinha',
        'Marinha beach',
        'Praia da Marinha Lagoa',
        'Lagoa Algarve',
        'Seven Hanging Valleys Trail',
        'Sete Vales Suspensos',
        'cliff beach Algarve',
        'Caramujeira beach',
        'Algarve photography beach',
        'Portugal beaches'
      ],
      category_data = v_category_data,
      meta_title = 'Praia da Marinha, Lagoa | Algarve Beach Guide',
      meta_description = 'Discover Praia da Marinha in Lagoa, an iconic Algarve cliff beach linked to the Seven Hanging Valleys Trail, viewpoints and limestone scenery.',
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
