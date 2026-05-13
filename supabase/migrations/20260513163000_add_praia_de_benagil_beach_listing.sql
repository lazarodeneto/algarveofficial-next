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
  'Benagil',
  'benagil',
  'Small coastal village in Lagoa known for Praia de Benagil, fishing boats and the nearby regulated Benagil cave area.',
  37.087775,
  -8.426675,
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
  v_slug text := 'praia-de-benagil-lagoa';
  v_name text := 'Praia de Benagil';
  v_short_description text := $short$
Praia de Benagil is a small cliff-framed maritime beach in Benagil, Lagoa, known for its fishing boats, limestone scenery, and close connection to the regulated Benagil cave-tour area.
$short$;
  v_description text := $description$
Praia de Benagil sits below the village of Benagil in the municipality of Lagoa, on a distinctive stretch of the central Algarve coast shaped by limestone cliffs, grottoes, and sea caves. The beach itself is relatively small, with fishing boats and maritime-tour activity forming part of its identity, so visitors should expect a working coastal setting rather than a wide, open resort beach.

Its main appeal is the surrounding geology and its proximity to the famous Algar de Benagil, the sea cave just off this section of coast. Demand for cave tours is very high, particularly in summer, and access to the cave area is now regulated by the Portuguese Maritime Authority. Visitors should not attempt to swim to the cave or use unguided flotation craft to enter it, and landing on the sand inside the cave is prohibited under the relevant navigation rules.

For beachgoers, Benagil is best approached as a scenic stop, a launch point for compliant licensed tours, or part of a wider coastal day around Lagoa. The Seven Hanging Valleys Trail passes through this coastline between Praia da Marinha and Praia de Vale Centeanes, giving walkers excellent cliff-top views when conditions are suitable. Facilities are listed by VisitPortugal, but several services may be seasonal and should be checked before visiting. Cliff and cave areas require caution, and visitors should follow local signage, maritime-authority notices, and operator safety instructions.
$description$;
  v_category_data jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Benagil",
  "slug": "praia-de-benagil-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Benagil",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Benagil is a small cliff-framed maritime beach in Benagil, Lagoa, known for its fishing boats, limestone scenery, and close connection to the regulated Benagil cave-tour area.",
  "full_description": "Praia de Benagil sits below the village of Benagil in the municipality of Lagoa, on a distinctive stretch of the central Algarve coast shaped by limestone cliffs, grottoes, and sea caves. The beach itself is relatively small, with fishing boats and maritime-tour activity forming part of its identity, so visitors should expect a working coastal setting rather than a wide, open resort beach.\n\nIts main appeal is the surrounding geology and its proximity to the famous Algar de Benagil, the sea cave just off this section of coast. Demand for cave tours is very high, particularly in summer, and access to the cave area is now regulated by the Portuguese Maritime Authority. Visitors should not attempt to swim to the cave or use unguided flotation craft to enter it, and landing on the sand inside the cave is prohibited under the relevant navigation rules.\n\nFor beachgoers, Benagil is best approached as a scenic stop, a launch point for compliant licensed tours, or part of a wider coastal day around Lagoa. The Seven Hanging Valleys Trail passes through this coastline between Praia da Marinha and Praia de Vale Centeanes, giving walkers excellent cliff-top views when conditions are suitable. Facilities are listed by VisitPortugal, but several services may be seasonal and should be checked before visiting. Cliff and cave areas require caution, and visitors should follow local signage, maritime-authority notices, and operator safety instructions.",
  "coordinates": {
    "latitude": 37.087775,
    "longitude": -8.426675,
    "notes": "Coordinates were taken from a Lagoa tourism brochure. Manual GIS confirmation is recommended before map publication."
  },
  "beach_type": "Maritime natural beach / small sandy cliff cove",
  "landscape": "Small sandy beach framed by limestone cliffs, with fishing boats, coastal grottoes, and nearby sea-cave scenery.",
  "access": "Road access is listed by VisitAlgarve via tarmacked road from Lagoa or from the EN125, following signs to the beach. The beach is also close to the Seven Hanging Valleys coastal walking route. Access to the Benagil cave area is regulated and should only be undertaken through compliant, authorised operators and in suitable sea conditions.",
  "highlights": [
    "Small sandy maritime beach below the village of Benagil in Lagoa.",
    "Limestone cliff scenery with nearby grottoes and sea caves.",
    "Close to the regulated Algar de Benagil cave-tour area.",
    "Traditional fishing-boat character still visible on the beach.",
    "Near the Seven Hanging Valleys Trail between Praia da Marinha and Praia de Vale Centeanes.",
    "Strong photography appeal from the beach and surrounding cliff-top viewpoints, where access is permitted."
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Boat tours",
    "Cave tours",
    "Coastal walks",
    "Couples",
    "Nature lovers",
    "Short beach stop"
  ],
  "facilities": [
    { "name": "Security or surveillance listed by VisitPortugal", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified" },
    { "name": "Outdoor parking", "status": "Verified" },
    { "name": "Bar", "status": "Verified" },
    { "name": "Restaurant", "status": "Verified" },
    { "name": "Small craft hire / maritime-tour activity listed by VisitPortugal, subject to AMN cave-area rules", "status": "Seasonal" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Sunbed and parasol hire", "status": "Not verified" }
  ],
  "includes": [
    "Showers",
    "Outdoor parking",
    "Bar",
    "Restaurant",
    "Seasonal surveillance listed by VisitPortugal",
    "Seasonal small craft hire / maritime-tour activity"
  ],
  "important_information": {
    "best_time_to_visit": "For lower pressure than peak summer cave-tour periods, consider spring, early summer outside holiday peaks, or early autumn. Early morning or later afternoon may be more comfortable for photography and arrival logistics, but sea conditions, tour permissions, and local signage should always take priority. Spring and autumn are also more suitable for the nearby Seven Hanging Valleys walk.",
    "know_before_you_go": "Demand context: very high cave-tour demand, especially during the summer period. Advance planning is strongly recommended for licensed boat, kayak, or SUP experiences.\nThe Benagil cave area is regulated by the Autoridade Marítima Nacional / Capitania do Porto de Portimão. Visitors should check the latest official notices before booking or entering the water.\nSwimming to Algar de Benagil and accessing it with flotation aids are prohibited under the official navigation rules.\nDisembarking or using the sand inside Algar de Benagil is prohibited under the official navigation rules.\nUnguided non-motorised craft activity in the cave area is restricted; guided activity must follow the official safety and navigation requirements.\nSea and weather conditions can vary, and tours may be changed, delayed, or cancelled for safety reasons.\nThe cliff and cave coastline is subject to erosion and rockfall risk. Keep a safe distance from cliff bases, cliff edges, cave roofs, and fenced or signed areas.\nFacilities, surveillance, and tour availability may be seasonal. Verify current conditions before visiting."
  },
  "important_notes": "Demand context: very high cave-tour demand, especially during the summer period. Advance planning is strongly recommended for licensed boat, kayak, or SUP experiences.\nThe Benagil cave area is regulated by the Autoridade Marítima Nacional / Capitania do Porto de Portimão. Visitors should check the latest official notices before booking or entering the water.\nSwimming to Algar de Benagil and accessing it with flotation aids are prohibited under the official navigation rules.\nDisembarking or using the sand inside Algar de Benagil is prohibited under the official navigation rules.\nUnguided non-motorised craft activity in the cave area is restricted; guided activity must follow the official safety and navigation requirements.\nSea and weather conditions can vary, and tours may be changed, delayed, or cancelled for safety reasons.\nThe cliff and cave coastline is subject to erosion and rockfall risk. Keep a safe distance from cliff bases, cliff edges, cave roofs, and fenced or signed areas.\nFacilities, surveillance, and tour availability may be seasonal. Verify current conditions before visiting.",
  "best_time_to_visit": "For lower pressure than peak summer cave-tour periods, consider spring, early summer outside holiday peaks, or early autumn. Early morning or later afternoon may be more comfortable for photography and arrival logistics, but sea conditions, tour permissions, and local signage should always take priority. Spring and autumn are also more suitable for the nearby Seven Hanging Valleys walk.",
  "suitable_for": [
    "Visitors booking licensed cave tours",
    "Photographers",
    "Coastal walkers",
    "Couples",
    "Nature-focused visitors",
    "Travellers exploring Lagoa's cliff beaches"
  ],
  "not_suitable_for": [
    "Visitors seeking a quiet beach during peak summer demand",
    "Swimming to Benagil Cave",
    "Independent unguided kayak or SUP access to the cave area",
    "Visitors with reduced mobility unless current access conditions are confirmed",
    "Unsupervised children near boat activity, cliffs, or cave-access areas"
  ],
  "nearby_attractions": [
    {
      "name": "Algar de Benagil / Benagil Cave",
      "type": "Sea cave",
      "description": "The famous sea cave located off Praia de Benagil. Access is regulated by maritime-authority rules, with restrictions on swimming, landing inside the cave, and unguided access.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia da Marinha",
      "type": "Beach",
      "description": "A well-known cliff beach east of Benagil and one of the key coastal points connected by the Seven Hanging Valleys Trail.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia do Carvalho",
      "type": "Beach",
      "description": "A nearby cliff-framed beach west of Benagil, geographically sensible as part of a Lagoa coastal route.",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Beach / trail point",
      "description": "A western reference point of the Seven Hanging Valleys Trail, useful for walkers exploring this section of the Lagoa coast.",
      "verification_status": "Verified"
    },
    {
      "name": "Benagil village",
      "type": "Coastal village",
      "description": "The small coastal settlement above the beach, historically associated with fishing and now closely linked to maritime-tour activity.",
      "verification_status": "Verified"
    }
  ],
  "nearby_towns": [
    "Benagil",
    "Lagoa",
    "Carvoeiro"
  ],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys Trail",
      "description": "Official Algarve coastal walking route in the municipality of Lagoa, between Praia da Marinha and Praia de Vale Centeanes. Benagil sits along this cliff-and-valley coastline, making the beach a practical scenic stop for walkers.",
      "verification_status": "Verified"
    }
  ],
  "visitor_tips": [
    "Book cave tours only with compliant, authorised operators and check whether the operator is following the latest AMN rules.",
    "Do not swim to Benagil Cave or attempt to enter it with inflatables or other flotation aids.",
    "Allow extra time in peak season because beach space, parking, and tour departures can be under heavy pressure.",
    "Keep away from cliff bases and cliff edges, even for photographs.",
    "Bring water, sun protection, and suitable footwear if combining the beach with the Seven Hanging Valleys Trail.",
    "Use the coastal trail and viewpoints as an alternative if sea conditions prevent cave tours."
  ],
  "photography_notes": "Praia de Benagil is strong for photography of fishing boats, golden limestone cliffs, clear-water contrasts, and coastal cave-tour activity. For cave photography, visitors should use authorised tours only and respect time limits, navigation rules, safety equipment requirements, and any instructions from guides or maritime authorities.",
  "family_notes": "Families can visit Praia de Benagil as a scenic beach stop, but close supervision is important because of boat activity, cliff surroundings, variable sea conditions, and very high cave-tour demand. Verify current surveillance and beach conditions before relying on the beach for a family swimming day.",
  "safety_notes": "Sea conditions can vary and the cave area is subject to official navigation restrictions. Do not swim to the cave, do not enter with flotation aids, and do not disembark inside the cave. Keep a safe distance from cliffs, cave roofs, and fenced areas, and follow local signage, lifeguard or surveillance instructions where present, and maritime-authority notices.",
  "accessibility_notes": "Accessibility information is not fully verified. Outdoor parking is listed by VisitPortugal, but accessible beach access is not confirmed from the sources checked. Visitors with reduced mobility should confirm current access conditions before visiting, especially because Benagil is a small cliff-coast beach with high seasonal activity.",
  "seo": {
    "meta_title": "Praia de Benagil, Lagoa | Algarve Beach Guide",
    "meta_description": "Explore Praia de Benagil in Lagoa, a small cliff-framed Algarve beach known for fishing boats, cave tours and the Seven Hanging Valleys Trail.",
    "keywords": [
      "Praia de Benagil",
      "Benagil beach",
      "Lagoa Algarve",
      "Benagil Cave",
      "Algar de Benagil",
      "Algarve beaches",
      "Portugal beaches",
      "Seven Hanging Valleys Trail",
      "cave tours Algarve",
      "Lagoa Portugal"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Praia de Benagil trip ideas",
      "links": [
        { "label": "Praia de Benagil" },
        { "label": "Benagil beach guide" },
        { "label": "Benagil Cave tours" },
        { "label": "Seven Hanging Valleys Trail" },
        { "label": "Lagoa cliff beaches" },
        { "label": "Cave tours Algarve" }
      ]
    },
    {
      "title": "Nearby places",
      "links": [
        { "label": "Algar de Benagil" },
        { "label": "Praia da Marinha" },
        { "label": "Praia do Carvalho" },
        { "label": "Praia de Vale Centeanes" },
        { "label": "Benagil village" },
        { "label": "Carvoeiro" }
      ]
    }
  ],
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Benagil",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514",
      "facts_verified": [
        "Official beach name: Praia de Benagil.",
        "Beach category: maritime beach.",
        "Place: Benagil - Lagoa.",
        "Small sandy beach with fishing boats.",
        "Cliffs, grottoes, and caverns along this section of coast.",
        "Listed services include security or surveillance, small craft hire, showers, outdoor parking, bar, and restaurant."
      ]
    },
    {
      "source_name": "Visit Algarve / Região de Turismo do Algarve - Praia de Benagil",
      "source_url": "https://visitalgarve.pt/en/equipamento/8760/praia-de-benagil",
      "facts_verified": [
        "Road access by tarmacked road from Lagoa or from the EN125, following signs to the beach.",
        "Official regional tourism confirmation of Praia de Benagil in the Algarve context."
      ]
    },
    {
      "source_name": "Lagoa Tourism Brochure - Our Beaches",
      "source_url": "https://portal.oa.pt/media/124556/folheto-turistico-da-regiao-de-lagoa_algarve-i.pdf",
      "facts_verified": [
        "Praia de Benagil listed as a natural beach.",
        "GPS coordinates verified as 37.087775, -8.426675.",
        "Fishing heritage and cave-visit context associated with the beach."
      ]
    },
    {
      "source_name": "Visit Algarve - Seven Hanging Valleys Trail",
      "source_url": "https://visitalgarve.pt/en/3593/percurso-dos-sete-vales-suspensos.aspx",
      "facts_verified": [
        "Trail located in Lagoa.",
        "Trail follows the coastal strip between Praia da Marinha and Praia de Vale Centeanes.",
        "Trail type verified as walking."
      ]
    },
    {
      "source_name": "Junta de Freguesia de Porches - Percurso dos 7 Vales Suspensos",
      "source_url": "https://www.jf-porches.pt/freguesia/trilhos/1-percurso_dos_7_vales_suspensos",
      "facts_verified": [
        "Seven Hanging Valleys Trail location in the municipality of Lagoa.",
        "Route type, return distance, difficulty, and seasonal walking recommendation context."
      ]
    },
    {
      "source_name": "CCDR Algarve - Grupo de Trabalho Grutas de Benagil",
      "source_url": "https://www.ccdr-alg.pt/site/info/grupo-de-trabalho-grutas-de-benagil",
      "facts_verified": [
        "Benagil caves are located off Praia de Benagil in Lagoa.",
        "The caves are considered important natural heritage and a major Algarve tourism point.",
        "Visitor numbers by sea have grown significantly, especially in summer.",
        "Need for capacity and access regulation due to safety and protection concerns."
      ]
    },
    {
      "source_name": "Turismo de Portugal - Consulta pública para regras de acesso às grutas de Benagil",
      "source_url": "https://www.turismodeportugal.pt/pt/Noticias/Paginas/consulta-publica-grutas-benagil.aspx",
      "facts_verified": [
        "Consultation process for Benagil cave access rules.",
        "Safety objective for passengers, crews, maritime-tour vessels, and kayaks.",
        "Preservation objective for the natural heritage."
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional / Capitania do Porto de Portimão - Edital 019/2024",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Lists/Documentos_AMN/20240730%20Edital%20019-2024%20-%20Instru%C3%A7%C3%A3o%20Navega%C3%A7%C3%A3o%20Grutas%20de%20Benagil_signed.pdf",
      "facts_verified": [
        "Navigation rules for the Benagil cave maritime area.",
        "Area of application between Praia do Vale do Lapa and Praia de Albandeira in Lagoa.",
        "Rockfall-risk and conservation context for the cave area.",
        "Restrictions on disembarking or using the sand inside Algar de Benagil.",
        "Restrictions on swimming or entering with flotation aids.",
        "Requirement for regulated access, safety information, and operator compliance."
      ]
    },
    {
      "source_name": "Autoridade Marítima Nacional / Capitania do Porto de Portimão - Edital 009/2025 amendment",
      "source_url": "https://www.amn.pt/DGAM/Capitanias/Portimao/Lists/Documentos_AMN/20250702%20Eidtal%20009-2025%2C%20alt1%20ao%20Edital%20019-2024_signed.pdf",
      "facts_verified": [
        "First amendment to Edital 019/2024.",
        "Updated access, circulation, safety equipment, guided non-motorised craft, and visit-limit rules for Algar de Benagil."
      ]
    }
  ],
  "verification_notes": [
    "Beach name, municipality, region, country, beach category, landscape, facilities listed by VisitPortugal, trail context, and cave-access regulation were verified from official or authoritative sources.",
    "The user-provided context of very high cave-tour demand is consistent with CCDR Algarve and AMN documentation describing growing visitor numbers, intense maritime activity, and access-management requirements.",
    "Coordinates were taken from a Lagoa tourism brochure. Manual GIS confirmation is recommended before map publication.",
    "Facilities are included only where VisitPortugal lists them. Public toilets, sunbed or parasol hire, dog rules, exact parking capacity, and current Blue Flag status were not verified.",
    "Security or surveillance is listed by VisitPortugal, but exact lifeguard dates were not verified. Treat this as seasonal and confirm for the relevant bathing season.",
    "Cave-access rules are date-sensitive. The listing should be reviewed against current AMN / Capitania do Porto de Portimão notices before publication or seasonal updates.",
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
  where slug = 'benagil'
  limit 1;

  if v_city_id is null then
    raise exception 'Required city benagil was not found';
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
      'https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514',
      'Praia de Benagil, Benagil, Lagoa, Algarve, Portugal',
      37.087775,
      -8.426675,
      array[
        'Praia de Benagil',
        'Benagil beach',
        'Benagil Cave',
        'Algar de Benagil',
        'Lagoa Algarve',
        'Seven Hanging Valleys Trail',
        'cave tours Algarve',
        'Portugal beaches',
        'fishing boats',
        'small cliff beach'
      ],
      v_category_data,
      'Praia de Benagil, Lagoa | Algarve Beach Guide',
      'Explore Praia de Benagil in Lagoa, a small cliff-framed Algarve beach known for fishing boats, cave tours and the Seven Hanging Valleys Trail.',
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
      website_url = 'https://www.visitportugal.com/en/NR/exeres/980AF7E1-613C-426C-9B2F-E3A68794E514',
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
      address = 'Praia de Benagil, Benagil, Lagoa, Algarve, Portugal',
      latitude = 37.087775,
      longitude = -8.426675,
      price_from = null,
      price_to = null,
      price_currency = 'EUR',
      tags = array[
        'Praia de Benagil',
        'Benagil beach',
        'Benagil Cave',
        'Algar de Benagil',
        'Lagoa Algarve',
        'Seven Hanging Valleys Trail',
        'cave tours Algarve',
        'Portugal beaches',
        'fishing boats',
        'small cliff beach'
      ],
      category_data = v_category_data,
      meta_title = 'Praia de Benagil, Lagoa | Algarve Beach Guide',
      meta_description = 'Explore Praia de Benagil in Lagoa, a small cliff-framed Algarve beach known for fishing boats, cave tours and the Seven Hanging Valleys Trail.',
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
