begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Carvalho",
  "slug": "praia-do-carvalho-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carvoeiro / Benagil",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Carvalho is a small natural cove in Lagoa, set between Benagil and the Marinha coastline. It is known for tunnel access through the rock, limestone cliffs, compact golden sand and limited verified facilities.",
  "full_description": "Praia do Carvalho is a compact natural beach in the municipality of Lagoa, on the cliff-lined coast between Benagil, Carvoeiro and Praia da Marinha. Official Lagoa tourism material classifies it as a natural beach and gives GPS coordinates for the cove.\n\nThe setting is small, enclosed and strongly shaped by limestone. The municipal beach brochure describes a golden sandy beach in an angular cut of the coast, framed by cliffs sculpted by erosion and with a rocky islet visible offshore. The most distinctive access feature is the tunnel carved into the rock, which leads down towards the sand.\n\nThis access is part of Carvalho's character, but it is also a practical limitation. Lagoa's brochure describes access as difficult, and the same source advises visitors to keep a safe distance from the high cliff faces because of the unstable character of the rocky mass. Step-free access, accessible-beach equipment and a verified lifeguard season were not confirmed for this review.\n\nParking is supported by an official municipal reference to the Praia do Carvalho car park, but current capacity, payment rules and summer restrictions were not independently verified. The beach works best for visitors who are comfortable with uneven access, cliff-backed scenery and a more self-sufficient beach visit rather than a fully serviced resort beach.\n\nFor a wider Lagoa coastal itinerary, Carvalho sits close to Praia de Benagil, Praia da Marinha and Praia de Vale Centeanes, with the Seven Hanging Valleys route running through the same cliff-coast landscape. Visitors should use marked routes, follow local signage and avoid cliff edges, cliff bases and informal shortcuts.",
  "highlights": [
    "Small natural cove in the municipality of Lagoa",
    "Access through a tunnel carved into the rock",
    "Golden sand framed by limestone cliffs and an offshore rocky islet",
    "Difficult access noted by official Lagoa tourism material",
    "Praia do Carvalho car park referenced by Lagoa municipality",
    "Close to the Benagil, Marinha and Seven Hanging Valleys coastal area"
  ],
  "best_time_to_visit": "Spring, early summer and early autumn are practical for coastal walking, photography and a less heat-intensive visit. In summer, plan around the small scale of the cove, difficult access and strong midday sun; mornings or later afternoon are usually more comfortable. Sea conditions and local signage should guide any swimming decision.",
  "parking_info": "Parking is verified at reference level: Lagoa municipality identifies the Praia do Carvalho car park as the endpoint of a pedestrian route from Rocha Brava. Current capacity, payment conditions, road restrictions and walking distance from the parking area to the sand were not independently verified for this review.",
  "accessibility_info": "Step-free access and accessible-beach support were not verified. Official Lagoa tourism material describes access through a tunnel carved into the rock and notes difficult access, so Praia do Carvalho is likely unsuitable for visitors who cannot manage uneven or constrained access unless current local arrangements are confirmed before travelling.",
  "lifeguard_info": "Official lifeguard dates were not verified. Praia do Carvalho was not found in the 2026 official bathing-water list section for Lagoa checked on 18 May 2026. Visitors should check local signage, flags and any posted notices before swimming.",
  "blue_flag_info": "Blue Flag status: not verified for 2026. Praia do Carvalho was not listed among the six Lagoa (Algarve) 2026 Blue Flag awarded locations on the ABAAE page checked on 18 May 2026.",
  "blue_flag_status": "not_verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "Not verified",
    "notes": "Praia do Carvalho was not found in the official 2026 Lagoa bathing-water list section checked on 18 May 2026."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.087334%2C-8.432683",
  "coordinates": {
    "latitude": 37.087334,
    "longitude": -8.432683,
    "source": "Lagoa municipal tourism beach brochure GPS coordinates."
  },
  "latitude": 37.087334,
  "longitude": -8.432683,
  "beach_type": "Small natural maritime cove",
  "landscape": "A compact golden-sand cove in an angular cut of the Lagoa coast, framed by eroded limestone cliffs and a rocky islet offshore.",
  "access": "Access is through a tunnel carved into the rock. Official Lagoa tourism material describes access as difficult, and visitors should check current local conditions before visiting.",
  "facilities": [
    { "name": "Tunnel access through the rock", "status": "Verified" },
    { "name": "Praia do Carvalho car park reference", "status": "Verified at municipal-reference level" },
    { "name": "Blue Flag 2026", "status": "Not verified" },
    { "name": "Lifeguard / beach surveillance", "status": "Not verified" },
    { "name": "Accessible beach support", "status": "Not verified" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Beach bar or restaurant on the sand", "status": "Not verified" }
  ],
  "includes": [
    "Natural cove setting",
    "Tunnel access",
    "Nearby car park reference",
    "Cliff and islet scenery"
  ],
  "important_information": [
    "Access is through a tunnel carved into the rock and is described as difficult by official Lagoa tourism material.",
    "Step-free access and accessible-beach support were not verified.",
    "Official lifeguard dates were not verified for this review.",
    "Blue Flag status was not verified for 2026.",
    "Keep a safe distance from cliff faces and cliff edges.",
    "Use marked routes and avoid informal cliff shortcuts."
  ],
  "important_notes": "Access is through a tunnel carved into the rock and is described as difficult by official Lagoa tourism material. Step-free access, accessible-beach support, public toilets, a beach bar and lifeguard dates were not verified for this review. Keep a safe distance from cliff faces and cliff edges, and follow local signage before swimming.",
  "suitable_for": [
    "Visitors comfortable with uneven or constrained beach access",
    "Photography and scenic coastal visits",
    "Couples and adults seeking a small natural cove",
    "Walkers exploring the Lagoa cliff coast",
    "Beachgoers who bring essentials and do not rely on verified services"
  ],
  "not_suitable_for": [
    "Visitors needing verified step-free access",
    "Visitors requiring a fully serviced beach with confirmed facilities",
    "Anyone unwilling to use cautious cliff-safety behaviour",
    "Visitors expecting verified Blue Flag or lifeguard information for 2026"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Couples",
    "Natural coves",
    "Coastal walks",
    "Self-sufficient beach visits"
  ],
  "nearby_beaches": [
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial beach listing east of Carvalho, linked with Benagil village and the Lagoa cave coastline.",
      "href": "/listing/praia-de-benagil-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial Lagoa beach listing east of Benagil and associated with the Seven Hanging Valleys coastal route.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach and trail endpoint",
      "description": "A published AlgarveOfficial beach listing near Carvoeiro and an official endpoint of the Seven Hanging Valleys route.",
      "href": "/listing/praia-de-vale-centeanes-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia do Carvoeiro",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial beach listing in Carvoeiro, west of the Carvalho and Benagil coastal area.",
      "href": "/listing/praia-do-carvoeiro-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial Lagoa beach listing east of Marinha on the same central Algarve cliff coastline.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [],
  "nearby_attractions": [],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys route area",
      "description": "Lagoa municipality verifies the Seven Hanging Valleys route as a 5.7 km pedestrian nature route linking Praia de Vale Centeanes and Praia da Marinha along the cliff coast. Praia do Carvalho is nearby rather than treated here as a confirmed official trailhead.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Rocha Brava to Praia do Carvalho pedestrian route",
      "description": "Lagoa municipality announced a 1.4 km pedestrian route ending at the Praia do Carvalho car park, with completion planned for November 2025. Current on-the-ground status should be checked locally.",
      "verification_status": "Official municipal project reference"
    }
  ],
  "visitor_tips": [
    "Confirm current access and parking conditions before relying on a full beach day.",
    "Bring water and essentials because facilities were not fully verified.",
    "Use the tunnel and marked access only; avoid informal cliff routes.",
    "Keep away from cliff bases, cliff edges and unstable rock faces.",
    "Check sea conditions, flags and local signage before swimming.",
    "Combine the visit with nearby internal AlgarveOfficial listings such as Benagil, Marinha or Vale Centeanes."
  ],
  "photography_notes": "Praia do Carvalho is strongest for factual coastal photography from the tunnel approach, the sand and safe viewpoints. The verified visual elements are the small golden cove, limestone cliffs and offshore rocky islet. Do not climb rocks or approach cliff edges for photographs.",
  "family_notes": "Families should treat Praia do Carvalho cautiously. The beach is small, cliff-backed and reached by difficult tunnel access, while lifeguard dates and accessible support were not verified. Families wanting simpler logistics may prefer a fully serviced beach with confirmed supervision.",
  "safety_notes": "Lagoa municipal tourism material advises keeping a safe distance from the high cliff faces because of the unstable character of the rocky mass. Follow local signage, avoid cliff edges and bases, and do not swim unless conditions and local notices indicate it is safe.",
  "accessibility_notes": "Accessible-beach infrastructure was not verified. The official access description involves a tunnel carved into the rock and difficult access, so visitors with reduced mobility should confirm conditions before travelling.",
  "faq_items": [
    {
      "question": "Where is Praia do Carvalho?",
      "answer": "Praia do Carvalho is in the municipality of Lagoa, on the central Algarve coast between the Benagil, Carvoeiro and Marinha coastal area."
    },
    {
      "question": "How do you access Praia do Carvalho?",
      "answer": "Official Lagoa tourism material describes access to Praia do Carvalho through a tunnel carved into the rock and notes that access is difficult."
    },
    {
      "question": "Is there parking at Praia do Carvalho?",
      "answer": "Parking is verified at reference level because Lagoa municipality identifies the Praia do Carvalho car park. Current capacity, payment rules and restrictions were not independently verified."
    },
    {
      "question": "Are there lifeguards at Praia do Carvalho?",
      "answer": "Official lifeguard dates were not verified. Praia do Carvalho was not found in the official 2026 Lagoa bathing-water list section checked on 18 May 2026, so visitors should rely on local signage and posted notices."
    },
    {
      "question": "Is Praia do Carvalho a Blue Flag beach?",
      "answer": "Blue Flag status was not verified for 2026. Praia do Carvalho was not listed among the six Lagoa (Algarve) locations on the ABAAE 2026 awarded list checked on 18 May 2026."
    },
    {
      "question": "Is Praia do Carvalho accessible for visitors with reduced mobility?",
      "answer": "Step-free access and accessible-beach support were not verified. Because official material describes difficult tunnel access, visitors with reduced mobility should confirm current conditions before travelling."
    },
    {
      "question": "What are the nearest beaches to Praia do Carvalho?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia de Benagil, Praia da Marinha, Praia de Vale Centeanes, Praia do Carvoeiro and Praia da Albandeira."
    },
    {
      "question": "Are there restaurants near Praia do Carvalho?",
      "answer": "A specific beach restaurant on the sand was not verified for this review. AlgarveOfficial may show internally published nearby business listings based on location where available."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained; no duplicate image files found during the 18 May 2026 review. Alt text updated from visual inspection.",
    "duplicate_check": "No duplicate canonical image filenames found in listing_images for this listing."
  },
  "sources_used": [
    {
      "source_name": "Lagoa Municipal Tourism Brochure - Our Beaches",
      "source_url": "https://portal.oa.pt/media/124556/folheto-turistico-da-regiao-de-lagoa_algarve-i.pdf",
      "facts_verified": [
        "Praia do Carvalho natural beach classification",
        "GPS coordinates 37.087334, -8.432683",
        "Small golden sandy beach",
        "Cliffs sculpted by erosion",
        "Rocky islet offshore",
        "Tunnel access carved into the rock",
        "Difficult access",
        "Popularity with locals and visitors",
        "Safety advice to keep distance from cliff faces"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagoa - Rocha Brava to Praia do Carvalho pedestrian route",
      "source_url": "https://www.cm-lagoa.pt/noticia/municipio-de-lagoa-investe-na-mobilidade-pedonal-com-novo-percurso-entre-a-rocha-brava-e-a-praia-do-carvalho",
      "facts_verified": [
        "Praia do Carvalho car park referenced by the municipality",
        "1.4 km pedestrian route project between Rocha Brava and Praia do Carvalho",
        "Route endpoint at Parque de Estacionamento da Praia do Carvalho",
        "Completion was planned for 3 November 2025, so current status should be checked locally"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official Seven Hanging Valleys pedestrian nature route",
        "5.7 km distance",
        "Route links Praia de Vale Centeanes and Praia da Marinha",
        "Cliff and hanging-valley landscape context"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Lagoa (Algarve) listed with six 2026 Blue Flag awarded locations",
        "Listed Lagoa locations checked: Caneiros, Carvoeiro, Ferragudo, Senhora da Rocha, Vale Centeanes and Vale do Olival",
        "Praia do Carvalho not found among Lagoa 2026 awarded locations"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Official 2026 bathing-water list checked for Lagoa section",
        "Nearby Lagoa bathing waters listed, including Benagil, Marinha, Albandeira and Vale Centeanes",
        "Praia do Carvalho not found in the checked Lagoa section"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Lagoa municipality, natural-beach classification, GPS coordinates, tunnel access, difficult access and cliff-safety cautions were verified from the official Lagoa tourism beach brochure.",
    "The listing avoids claiming Blue Flag status because Praia do Carvalho was not found among Lagoa (Algarve) 2026 Blue Flag awarded locations on ABAAE.",
    "The listing avoids claiming a lifeguard season because Praia do Carvalho was not found in the official 2026 Lagoa bathing-water list section checked on 18 May 2026.",
    "Parking is included only at reference level because the municipality names Parque de Estacionamento da Praia do Carvalho; capacity, payment and current restrictions were not verified.",
    "Nearby beach links use only already published AlgarveOfficial internal listings.",
    "Nearby restaurant and attraction arrays are intentionally empty until a nearby internally published listing can be verified for that specific section; dynamic nearby business cards may appear from published internal listings based on location.",
    "No external competitor website URL is used for the public listing CTA.",
    "No new images were added; existing gallery images were retained after duplicate checking and alt-text improvement."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00",
  "seo": {
    "meta_title": "Praia do Carvalho, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia do Carvalho in Lagoa is a small natural cove with tunnel access, limestone cliffs, practical parking notes and verified safety guidance.",
    "keywords": [
      "Praia do Carvalho",
      "Praia do Carvalho Lagoa",
      "Carvalho beach",
      "Lagoa beaches",
      "Benagil nearby beach",
      "Algarve beach",
      "Portugal beaches",
      "natural cove Lagoa",
      "Seven Hanging Valleys nearby"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Nearby published beach listings",
      "links": [
        { "label": "Praia de Benagil", "href": "/listing/praia-de-benagil-lagoa" },
        { "label": "Praia da Marinha", "href": "/listing/praia-da-marinha-lagoa" },
        { "label": "Praia de Vale Centeanes", "href": "/listing/praia-de-vale-centeanes-lagoa" },
        { "label": "Praia do Carvoeiro", "href": "/listing/praia-do-carvoeiro-lagoa" },
        { "label": "Praia da Albandeira", "href": "/listing/praia-da-albandeira-lagoa" }
      ]
    }
  ]
}
$json$;
begin
  select id
    into v_listing_id
    from public.listings
   where slug = 'praia-do-carvalho-lagoa';

  if v_listing_id is null then
    raise exception 'Listing praia-do-carvalho-lagoa not found';
  end if;

  update public.listings
     set website_url = null,
         latitude = 37.087334,
         longitude = -8.432683,
         short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         meta_title = v_patch #>> '{seo,meta_title}',
         meta_description = v_patch #>> '{seo,meta_description}',
         category_data = coalesce(category_data, '{}'::jsonb)
           || v_patch
           || jsonb_build_object(
             'localized_content',
             coalesce(category_data->'localized_content', '{}'::jsonb)
               || jsonb_build_object('en', v_patch)
           ),
         updated_at = now()
   where id = v_listing_id;

  update public.listing_images
     set alt_text = 'View from the rock tunnel entrance at Praia do Carvalho towards the sand and offshore islet'
   where id = 'ffca6695-9e1d-4e0f-8fcb-ce4f8c352e55'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Clifftop view over Praia do Carvalho cove with limestone cliffs and turquoise water'
   where id = 'c1c195a3-3568-4e88-a9b0-be0f2cfa8337'
     and listing_id = v_listing_id;
end $$;

commit;
