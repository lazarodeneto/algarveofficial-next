begin;

do $$
declare
  v_listing_id uuid;
  v_existing_category_data jsonb;
  v_patch jsonb := $json$
{
  "short_description": "Praia da Marinha is a cliff-framed beach in Lagoa, near Caramujeira, known for its limestone cliffs, sea stacks, long stair access and connection with the Seven Hanging Valleys Trail.",
  "full_description": "Praia da Marinha sits on the central Algarve coast in the municipality of Lagoa, close to Caramujeira. VisitPortugal classifies it as a maritime beach and describes a high, eroded cliff setting, with a viewpoint above the sand before visitors descend by a long staircase.\n\nThe beach itself is a compact sandy cove below limestone cliffs and rock formations. It is best approached as both a beach and a coastal-landscape stop: many visitors spend time at the cliff-top viewpoint before going down to the sand, while walkers use it as one end of Lagoa's official Seven Hanging Valleys Trail, a 5.7 km route linking Praia de Vale Centeanes and Praia da Marinha.\n\nAccess and safety need practical planning. Parking is listed by VisitPortugal, but the sand is reached by stairs, so step-free access was not verified. The official 2026 bathing-water list names Marinha with a bathing season from 1 June to 30 September and marks it as a limited-use beach. VisitPortugal lists beach surveillance, showers, parking, a bar, restaurant and seasonal rentals, but visitors should confirm current operation locally and always follow flags, signs and cliff-safety guidance.\n\nPraia da Marinha was not found in the ABAAE 2026 Blue Flag awarded list checked for this review, so Blue Flag status is not claimed for the current listing.",
  "highlights": [
    "Cliff-framed maritime beach in the municipality of Lagoa",
    "Long staircase access from the cliff-top area",
    "Limestone cliffs, sea stacks and elevated viewpoints",
    "One endpoint of the official Seven Hanging Valleys Trail",
    "Official 2026 bathing season listed from 1 June to 30 September",
    "Parking, showers, bar and restaurant listed by VisitPortugal"
  ],
  "best_time_to_visit": "June to September matches the official 2026 bathing season. Spring, early summer and early autumn are usually more comfortable for the Seven Hanging Valleys Trail, cliff viewpoints and photography. In warm weather, morning or late-afternoon visits are more practical for the long staircase and exposed cliff-top sections. Swimming should always depend on sea conditions, flags and local guidance.",
  "parking_info": "VisitPortugal lists parking for Praia da Marinha. Parking does not mean direct beach-level access: official tourism information describes a long staircase before reaching the sand. Current capacity, traffic restrictions and any payment conditions were not independently verified for this review.",
  "accessibility_info": "Step-free access to the sand was not verified. VisitPortugal describes access by a long staircase, so Praia da Marinha is likely unsuitable for visitors who cannot manage steps unless current local assistance or alternative arrangements are confirmed before travelling.",
  "lifeguard_info": "VisitPortugal lists safety or surveillance for Praia da Marinha, and the official 2026 bathing season is 1 June to 30 September. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: not verified for 2026. Praia da Marinha was not found in the ABAAE 2026 awarded list checked on 18 May 2026.",
  "blue_flag_status": "not_verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "VisitPortugal lists safety or surveillance, but exact daily lifeguard staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.090038%2C-8.412492",
  "coordinates": {
    "latitude": 37.090038,
    "longitude": -8.412492,
    "source": "Existing verified listing coordinates retained; Google Maps URL generated from stored coordinates."
  },
  "beach_type": "Small sandy maritime beach below limestone cliffs",
  "landscape": "A compact sandy cove below eroded limestone cliffs, with sea stacks, cliff-top viewpoints and Atlantic water.",
  "access": "Access is from the cliff-top area by a long staircase. Step-free access was not verified.",
  "facilities": [
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Sunshade or awning rental", "status": "Seasonal" },
    { "name": "Light craft rental", "status": "Seasonal" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Blue Flag 2026", "status": "Not verified" }
  ],
  "nearby_beaches": [
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach",
      "description": "A nearby Lagoa beach and coastal village area verified by VisitPortugal.",
      "href": "/listing/praia-de-benagil-lagoa",
      "verification_status": "Verified",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-benagil"
    },
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "description": "A small cliff-framed Lagoa beach listed by VisitPortugal.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/23553692-F8A3-46D0-9D03-435E520875F1"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach and trail endpoint",
      "description": "A Lagoa beach verified by VisitPortugal and linked with Praia da Marinha by the official Seven Hanging Valleys Trail.",
      "href": "/listing/praia-de-vale-centeanes-lagoa",
      "verification_status": "Verified",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes"
    }
  ],
  "nearby_restaurants": [
    {
      "name": "Restaurante O Rústico",
      "type": "Restaurant",
      "description": "Official website identifies Restaurante O Rústico at Sítio da Caramujeira, with menu, reservations and contact information.",
      "href": "https://orustico.pt/",
      "verification_status": "Verified from official restaurant website",
      "source_url": "https://orustico.pt/"
    },
    {
      "name": "O Pescador Benagil",
      "type": "Fish and seafood restaurant",
      "description": "Official website places O Pescador Benagil at Praia de Benagil and describes a fish and seafood-focused restaurant.",
      "href": "https://pescadorbenagil.com/",
      "verification_status": "Verified from official restaurant website",
      "source_url": "https://pescadorbenagil.com/"
    }
  ],
  "nearby_attractions": [
    {
      "name": "Seven Hanging Valleys Trail",
      "type": "Walking trail",
      "description": "Official Lagoa route of 5.7 km linking Praia de Vale Centeanes and Praia da Marinha along the cliff coast.",
      "href": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach and coastal village",
      "description": "Nearby Lagoa beach verified by VisitPortugal and often combined with Marinha in a central Lagoa coast itinerary.",
      "href": "/listing/praia-de-benagil-lagoa",
      "verification_status": "Verified"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Beach and trail endpoint",
      "description": "The western endpoint of the Seven Hanging Valleys Trail, verified by Lagoa municipality and VisitPortugal.",
      "href": "/listing/praia-de-vale-centeanes-lagoa",
      "verification_status": "Verified"
    }
  ],
  "important_information": {
    "best_time_to_visit": "June to September matches the official 2026 bathing season. Spring, early summer and early autumn are usually more comfortable for walking and photography.",
    "know_before_you_go": "Access to the sand involves a long staircase.\nStep-free access was not verified.\nThe official 2026 bathing season is 1 June to 30 September.\nThe beach is officially listed as limited-use for 2026.\nBlue Flag status was not verified for 2026.\nFacilities, surveillance and concessions may operate seasonally.\nKeep away from cliff edges and cliff bases, and follow local signs and beach flags.",
    "notes": [
      "Access to the sand involves a long staircase.",
      "Step-free access was not verified.",
      "The official 2026 bathing season is 1 June to 30 September.",
      "The beach is officially listed as limited-use for 2026.",
      "Blue Flag status was not verified for 2026.",
      "Facilities, surveillance and concessions may operate seasonally.",
      "Keep away from cliff edges and cliff bases, and follow local signs and beach flags."
    ]
  },
  "important_notes": "Access to the sand involves a long staircase.\nStep-free access was not verified.\nThe official 2026 bathing season is 1 June to 30 September.\nThe beach is officially listed as limited-use for 2026.\nBlue Flag status was not verified for 2026.\nFacilities, surveillance and concessions may operate seasonally.\nKeep away from cliff edges and cliff bases, and follow local signs and beach flags.",
  "suitable_for": [
    "Visitors comfortable with staircase access",
    "Coastal walkers",
    "Photography-focused visitors",
    "Couples",
    "Nature-focused travellers",
    "Visitors combining beach time with the Seven Hanging Valleys Trail"
  ],
  "not_suitable_for": [
    "Visitors requiring verified step-free beach access",
    "Visitors unable to manage long stairs",
    "Anyone intending to sit close to cliff bases or use informal cliff paths",
    "Visitors expecting confirmed Blue Flag status for 2026"
  ],
  "visitor_tips": [
    "Allow time for the staircase between the cliff-top area and the sand.",
    "Use the official cliff-top paths and keep well back from cliff edges.",
    "Check local flags and signs before swimming.",
    "Confirm seasonal facilities before planning a full beach day.",
    "For the Seven Hanging Valleys Trail, take water, sun protection and suitable footwear.",
    "Do not rely on Blue Flag status unless it is confirmed from the official Blue Flag programme for the relevant year."
  ],
  "photography_notes": "The strongest views are from authorised cliff-top viewpoints and from the sand looking back towards the limestone formations. Do not cross barriers or approach cliff edges for photographs.",
  "family_notes": "Families may enjoy the scenery and beach in suitable conditions, but the long staircase, cliff setting and variable sea conditions require close supervision and local safety checks.",
  "safety_notes": "Praia da Marinha is cliff-backed and officially listed as limited-use for the 2026 bathing season. Keep away from cliff bases and cliff edges, follow local signage, and only swim according to beach flags and local guidance.",
  "accessibility_notes": "Step-free access was not verified. VisitPortugal describes a long staircase to the beach.",
  "parking_notes": "Parking is listed by VisitPortugal, but current capacity, pricing and peak-period restrictions were not independently verified.",
  "restaurant_notes": "Two named nearby restaurants were added only where an official restaurant website could verify the business and location context.",
  "image_gallery_notes": "Existing Supabase-hosted AlgarveOfficial gallery retained. No new external images were added because source and licence metadata could not be independently verified during this review. Existing image alt text was updated from visual review of the stored images.",
  "faq_items": [
    {
      "question": "Where is Praia da Marinha?",
      "answer": "Praia da Marinha is in the municipality of Lagoa, near Caramujeira, on the central Algarve coast."
    },
    {
      "question": "Is there parking at Praia da Marinha?",
      "answer": "VisitPortugal lists parking for Praia da Marinha. The beach is still reached by a long staircase, so parking does not mean step-free access to the sand."
    },
    {
      "question": "Are there lifeguards at Praia da Marinha?",
      "answer": "VisitPortugal lists safety or surveillance, and the official 2026 bathing season is 1 June to 30 September. Exact daily lifeguard staffing was not independently verified, so check local flags and signage before swimming."
    },
    {
      "question": "Is Praia da Marinha a Blue Flag beach?",
      "answer": "Blue Flag status was not verified for 2026. Praia da Marinha was not found in the ABAAE 2026 awarded list checked on 18 May 2026."
    },
    {
      "question": "Is Praia da Marinha accessible for visitors with reduced mobility?",
      "answer": "Step-free access was not verified. VisitPortugal describes access by a long staircase, so visitors with reduced mobility should confirm current conditions before travelling."
    },
    {
      "question": "What are the nearest beaches to Praia da Marinha?",
      "answer": "Nearby verified Lagoa beaches include Praia de Benagil, Praia da Albandeira and Praia de Vale Centeanes."
    },
    {
      "question": "What is the best time to visit Praia da Marinha?",
      "answer": "June to September matches the official 2026 bathing season. Spring, early summer and early autumn are usually more comfortable for walking, viewpoints and photography."
    },
    {
      "question": "Are there restaurants near Praia da Marinha?",
      "answer": "VisitPortugal lists a bar and restaurant at Praia da Marinha. Nearby named restaurants verified from official restaurant websites include Restaurante O Rústico in Sítio da Caramujeira and O Pescador Benagil at Praia de Benagil."
    }
  ],
  "seo": {
    "meta_title": "Praia da Marinha, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia da Marinha in Lagoa: verified beach guide with cliffs, staircase access, parking, lifeguard season, Blue Flag check, nearby beaches, restaurants and FAQs.",
    "keywords": [
      "Praia da Marinha",
      "Praia da Marinha Lagoa",
      "Marinha Beach",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Seven Hanging Valleys Trail",
      "Sete Vales Suspensos",
      "Benagil nearby beaches",
      "Praia de Vale Centeanes"
    ]
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Beach name",
        "Maritime beach classification",
        "Location at Caramujeira, Lagoa",
        "High eroded cliff setting",
        "Viewpoint before descending to the beach",
        "Long staircase access",
        "Facilities including surveillance, sunshade or awning rental, light craft rental, showers, parking, bar and restaurant"
      ]
    },
    {
      "source_name": "Diário da República - Portaria n.º 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Marinha bathing water listed for Lagoa",
        "Bathing water code PTCV2P",
        "2026 bathing season from 1 June to 30 September",
        "Marinha listed as limited-use beach"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "2026 Blue Flag awarded list checked",
        "Praia da Marinha not found among the listed 2026 Lagoa Blue Flag beach entries during this review"
      ]
    },
    {
      "source_name": "Câmara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Seven Hanging Valleys Trail",
        "Official municipal route",
        "5.7 km route linking Praia de Vale Centeanes and Praia da Marinha",
        "Cliff and hanging-valley landscape context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Benagil",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-de-benagil",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Nearby beach name",
        "Lagoa location"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia de Albandeira",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/23553692-F8A3-46D0-9D03-435E520875F1",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Nearby beach name",
        "Lagoa location",
        "Small cliff-framed beach context"
      ]
    },
    {
      "source_name": "VisitPortugal - Praia do Vale de Centeanes",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Nearby beach name",
        "Lagoa location",
        "Cliff-backed beach context"
      ]
    },
    {
      "source_name": "Restaurante O Rústico official website",
      "source_url": "https://orustico.pt/",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Restaurant name",
        "Sítio da Caramujeira address context",
        "Official menu and reservation/contact site"
      ]
    },
    {
      "source_name": "O Pescador Benagil official website",
      "source_url": "https://pescadorbenagil.com/",
      "checked_at": "2026-05-18",
      "facts_verified": [
        "Restaurant name",
        "Praia de Benagil location",
        "Fish and seafood restaurant context"
      ]
    }
  ],
  "verification_sources": [
    {
      "field": "parking_info",
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha"
    },
    {
      "field": "accessibility_info",
      "source_name": "VisitPortugal - Praia da Marinha",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha"
    },
    {
      "field": "lifeguard_info",
      "source_name": "VisitPortugal and Diário da República",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728"
    },
    {
      "field": "blue_flag_info",
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/"
    },
    {
      "field": "nearby_restaurants",
      "source_name": "Official restaurant websites",
      "source_url": "https://orustico.pt/"
    },
    {
      "field": "faq_items",
      "source_name": "Visible FAQ derived from the same verified sources as the page content",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-da-marinha"
    }
  ],
  "verification_notes": [
    "The listing was updated as an existing published beach listing only; no new beach listing was created.",
    "Official 2026 bathing season and limited-use beach status were verified from Diário da República.",
    "VisitPortugal verifies parking and several beach services, but current capacity, concession operation and exact daily lifeguard staffing were not independently verified.",
    "Blue Flag status is not claimed because Praia da Marinha was not found in the ABAAE 2026 awarded list checked on 18 May 2026.",
    "Step-free access was not verified; official tourism information describes a long staircase.",
    "Nearby restaurant names were included only where official restaurant websites were found.",
    "No new external images were added because source and licence metadata could not be independently verified."
  ],
  "last_verified_at": "2026-05-18"
}
$json$::jsonb;
begin
  select id, coalesce(category_data, '{}'::jsonb)
    into v_listing_id, v_existing_category_data
  from public.listings
  where slug = 'praia-da-marinha-lagoa'
    and status = 'published'
  limit 1;

  if v_listing_id is null then
    raise exception 'Expected existing published listing praia-da-marinha-lagoa';
  end if;

  update public.listings
  set
    short_description = v_patch->>'short_description',
    description = v_patch->>'full_description',
    latitude = 37.090038,
    longitude = -8.412492,
    address = 'Praia da Marinha, Caramujeira, Lagoa, Algarve, Portugal',
    website_url = null,
    category_data = jsonb_set(
      v_existing_category_data || v_patch,
      '{localized_content,en}',
      coalesce(v_existing_category_data #> '{localized_content,en}', '{}'::jsonb) || v_patch,
      true
    ),
    meta_title = v_patch #>> '{seo,meta_title}',
    meta_description = v_patch #>> '{seo,meta_description}',
    tags = array(
      select jsonb_array_elements_text(v_patch #> '{seo,keywords}')
    ),
    updated_at = now()
  where id = v_listing_id;

  update public.listing_images
  set
    alt_text = case id::text
      when '4835eef4-1f29-42f5-a118-8428bc4ec12b' then 'Limestone arch and Atlantic water at Praia da Marinha'
      when 'cea7ef0d-b3d4-4e1c-9fd4-650f32823bb9' then 'Cliff-top view over Praia da Marinha and the Lagoa coast'
      when 'd07bcae6-6ba3-44b6-a207-f029acc89c20' then 'Praia da Marinha sand below limestone cliffs'
      when 'c6dcaf2e-0d6f-4049-a015-fb3d76f847f8' then 'Rock opening and sea view on the Praia da Marinha coastline'
      when 'd6d72a92-4f6a-4ca1-b0ec-b5cc31bcc6c2' then 'Praia da Marinha beach cove seen from above'
      when '990d5829-0410-4357-a411-dcc7b8aec48c' then 'Sea stacks and cliff-backed sand near Praia da Marinha'
      else alt_text
    end
  where listing_id = v_listing_id
    and id::text in (
      '4835eef4-1f29-42f5-a118-8428bc4ec12b',
      'cea7ef0d-b3d4-4e1c-9fd4-650f32823bb9',
      'd07bcae6-6ba3-44b6-a207-f029acc89c20',
      'c6dcaf2e-0d6f-4049-a015-fb3d76f847f8',
      'd6d72a92-4f6a-4ca1-b0ec-b5cc31bcc6c2',
      '990d5829-0410-4357-a411-dcc7b8aec48c'
    );

  delete from public.listing_images
  where listing_id = v_listing_id
    and id = 'd40f28c8-9bb2-4eec-814a-e3b28e4b1a3d'
    and image_url = 'https://niylxpvafywjonrphddp.supabase.co/storage/v1/object/public/listing-images/admin-listings/1778576467148-4b0f5e83-433b-4639-87a6-d66106cd3213.webp';
end $$;

commit;
