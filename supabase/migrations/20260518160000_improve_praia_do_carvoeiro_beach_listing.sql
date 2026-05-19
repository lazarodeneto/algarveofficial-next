begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia do Carvoeiro",
  "slug": "praia-do-carvoeiro-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carvoeiro",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia do Carvoeiro is the central village beach of Carvoeiro in Lagoa, set below cliffs and whitewashed houses. Official sources list parking, restaurants, seasonal services, accessible-beach recognition and 2026 Blue Flag status.",
  "full_description": "Praia do Carvoeiro is the central beach of Carvoeiro, in the municipality of Lagoa. VisitPortugal describes it as a picturesque bay beside the former fishing village, now a tourist centre that has kept its characteristic architectural setting.\n\nThe beach is compact and urban rather than remote. Its sandy cove sits directly below the village, with cliffs, whitewashed houses, terraces, restaurants, bars and fishing-boat heritage forming the visitor experience. VisitPortugal lists parking, restaurants, bar, showers, sunshade rental, light boat rental, safety or surveillance and accessible-beach recognition.\n\nABAAE verifies Carvoeiro as a 2026 Blue Flag coastal beach, with the bathing season from 1 June to 30 September 2026 and the Blue Flag season from 1 July to 30 September 2026. The official 2026 bathing-water list also names Carvoeiro for Lagoa with the same bathing-season dates.\n\nCarvoeiro is useful for visitors who want a serviced beach close to restaurants, boat-trip activity and village facilities. It is also a practical base for nearby Lagoa coastal landmarks such as Algar Seco, Praia de Vale Centeanes and the Seven Hanging Valleys route. Because the beach is central and small, visitors should plan around seasonal demand, parking availability and local beach flags before swimming.",
  "highlights": [
    "Central village beach in Carvoeiro, municipality of Lagoa",
    "Compact sandy bay below cliffs and whitewashed village buildings",
    "Restaurants, bars, terraces and parking listed by VisitPortugal",
    "Accessible-beach recognition listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE",
    "Close to Algar Seco and Praia de Vale Centeanes"
  ],
  "best_time_to_visit": "June to September aligns with the official 2026 bathing season and seasonal beach-service period. Spring, early summer and early autumn are practical for village walks, restaurants and nearby coastal viewpoints. In summer, arrive earlier or later in the day where possible because the beach is central and compact, and always check local flags before swimming.",
  "parking_info": "VisitPortugal lists parking for Praia do Carvoeiro. Current capacity, payment conditions and peak-season restrictions were not independently verified for this review. Because the beach is central to Carvoeiro village, visitors should allow extra time for parking in busy periods.",
  "accessibility_info": "VisitPortugal lists Praia do Carvoeiro as an accessible beach. Detailed step-free route conditions, adapted equipment and assisted-bathing availability were not independently verified for this review, so visitors with reduced mobility should confirm current support locally before travelling.",
  "lifeguard_info": "VisitPortugal lists safety or surveillance, and official 2026 sources list the bathing season from 1 June to 30 September. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "VisitPortugal lists safety or surveillance, but exact daily lifeguard staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.096196%2C-8.472004",
  "coordinates": {
    "latitude": 37.096196,
    "longitude": -8.472004,
    "source": "ABAAE official Carvoeiro beach entry."
  },
  "latitude": 37.096196,
  "longitude": -8.472004,
  "beach_type": "Urban village maritime beach",
  "landscape": "A compact sandy bay backed by Carvoeiro village, cliffs, whitewashed buildings, terraces and fishing-boat heritage.",
  "access": "Access is through Carvoeiro village. VisitPortugal lists access by car, motorcycle and on foot, with parking listed; current local traffic and parking conditions should be checked in busy periods.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Accessible beach recognition listed by VisitPortugal", "status": "Verified recognition / current support should be checked" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal / conditions dependent" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurants nearby", "status": "Verified by VisitPortugal" }
  ],
  "includes": [
    "Seasonal safety or surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Showers",
    "Restaurants and bar nearby",
    "Accessible-beach recognition listed by VisitPortugal",
    "Seasonal rental services"
  ],
  "important_information": [
    "ABAAE lists Carvoeiro as a 2026 Blue Flag beach.",
    "The 2026 bathing season is listed as 1 June to 30 September.",
    "The 2026 Blue Flag season is listed as 1 July to 30 September.",
    "VisitPortugal lists accessible-beach recognition, but current support should be checked locally.",
    "Parking is listed by VisitPortugal, but capacity and payment conditions were not verified.",
    "The beach is compact and central to Carvoeiro village, so busy-period planning is useful."
  ],
  "important_notes": "ABAAE verifies Carvoeiro as a 2026 Blue Flag beach, with bathing season from 1 June to 30 September and Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, showers, restaurants, bar, rentals, surveillance and accessible-beach recognition, but current operation and support should be checked locally.",
  "suitable_for": [
    "Visitors staying in Carvoeiro or Lagoa",
    "Families wanting a central beach with services nearby",
    "Couples combining beach time with restaurants",
    "Visitors needing accessible-beach recognition, subject to current confirmation",
    "Short beach visits and village walks",
    "Boat-trip users when conditions and operators are suitable"
  ],
  "not_suitable_for": [
    "Visitors seeking a remote or undeveloped beach",
    "Visitors who want a large, open sandy beach",
    "Visitors requiring accessibility support without confirming current arrangements",
    "Those wishing to avoid central village beaches in peak summer"
  ],
  "best_for": [
    "Village beach days",
    "Restaurants nearby",
    "Families",
    "Couples",
    "Accessible-beach recognition, subject to current confirmation",
    "Carvoeiro coastal exploring"
  ],
  "nearby_beaches": [
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial cliff beach listing east of Carvoeiro and an official endpoint of the Seven Hanging Valleys route.",
      "href": "/listing/praia-de-vale-centeanes-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia do Carvalho",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial natural cove listing east of Vale Centeanes on the Lagoa cliff coast.",
      "href": "/listing/praia-do-carvalho-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial beach listing east of Carvalho, linked with Benagil village and the cave coastline.",
      "href": "/listing/praia-de-benagil-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial Lagoa beach listing and official Seven Hanging Valleys route endpoint.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial cliff-cove listing east of Marinha on the central Algarve coastline.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [],
  "nearby_attractions": [],
  "walking_trails_nearby": [
    {
      "name": "Caminho do Algar Seco",
      "description": "Lagoa municipal tourism material describes a short coastal route between Carvoeiro and Algar Seco with sea views and limestone scenery. Current route conditions should be checked locally.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Seven Hanging Valleys route area",
      "description": "Official Lagoa pedestrian nature route of 5.7 km linking Praia de Vale Centeanes and Praia da Marinha. Carvoeiro is nearby rather than an official endpoint in this listing.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Arrive earlier in summer for easier parking and beach space.",
    "Confirm current accessible-beach support before relying on it.",
    "Use local flags and signage before swimming or using rental services.",
    "Combine a short beach visit with Carvoeiro village, Algar Seco or Vale Centeanes.",
    "Treat rentals and beach services as seasonal unless confirmed locally.",
    "Use internal AlgarveOfficial nearby business cards rather than external competitor links."
  ],
  "photography_notes": "Praia do Carvoeiro photographs well from the village frontage, the sand and nearby safe viewpoints, especially for the compact bay, fishing-boat heritage and whitewashed village backdrop. Nearby Algar Seco imagery should be labelled as Algar Seco rather than as the beach itself.",
  "family_notes": "Praia do Carvoeiro can suit families because it is central and VisitPortugal lists services, parking, restaurants, surveillance and accessible-beach recognition. Families should still check flags, supervise children closely and plan around busy summer periods.",
  "safety_notes": "Sea conditions can vary. Follow local flags, signage and instructions from surveillance teams where present. Take extra care around boats, rental activity, rocks and nearby cliff viewpoints.",
  "accessibility_notes": "VisitPortugal lists Praia do Carvoeiro as an accessible beach. Current adapted equipment, route details, assistance and toilets were not independently verified, so visitors with reduced mobility should confirm arrangements before travelling.",
  "faq_items": [
    {
      "question": "Where is Praia do Carvoeiro?",
      "answer": "Praia do Carvoeiro is the central beach of Carvoeiro village in the municipality of Lagoa, on the central Algarve coast."
    },
    {
      "question": "Is Praia do Carvoeiro a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Carvoeiro as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Are there lifeguards at Praia do Carvoeiro?",
      "answer": "VisitPortugal lists safety or surveillance, and official 2026 sources list the bathing season from 1 June to 30 September. Exact daily lifeguard staffing was not independently verified."
    },
    {
      "question": "Is there parking at Praia do Carvoeiro?",
      "answer": "VisitPortugal lists parking for Praia do Carvoeiro. Current capacity, payment conditions and peak-season restrictions were not independently verified."
    },
    {
      "question": "Is Praia do Carvoeiro accessible?",
      "answer": "VisitPortugal lists Praia do Carvoeiro as an accessible beach. Current equipment, route details and assisted-bathing support should be confirmed locally before travelling."
    },
    {
      "question": "Are there restaurants near Praia do Carvoeiro?",
      "answer": "Yes. VisitPortugal describes restaurants, bars and terraces beside the beach. AlgarveOfficial may also show internally published nearby business cards based on location."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia de Vale Centeanes, Praia do Carvalho, Praia de Benagil, Praia da Marinha and Praia da Albandeira."
    },
    {
      "question": "What is the best time to visit Praia do Carvoeiro?",
      "answer": "June to September matches the official bathing season. Spring, early summer and early autumn are practical for village walks, nearby viewpoints and a less intense visit."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained with one visually duplicate Algar Seco cave image removed during the 18 May 2026 review. Alt text updated from visual inspection.",
    "duplicate_check": "No duplicate canonical image filenames found; one near-duplicate visual row was removed from listing_images."
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Carvoeiro",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-carvoeiro",
      "facts_verified": [
        "Beach name and maritime beach classification",
        "Location in Lagoa",
        "Picturesque bay beside former fishing village and tourist centre",
        "Restaurants, bars and terraces beside the beach",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant and accessible beach",
        "Access by car, motorcycle and on foot"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Carvoeiro",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/carvoeiro/",
      "facts_verified": [
        "Official Carvoeiro Blue Flag beach entry",
        "Coastal beach classification",
        "Municipality of Lagoa (Algarve)",
        "Coordinates 37.096196, -8.472004",
        "Beach code PTCU9W",
        "2026 bathing season from 1 June to 30 September",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time of check"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Carvoeiro listed among Lagoa (Algarve) 2026 Blue Flag awarded locations",
        "Lagoa listed with six 2026 awarded locations"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Carvoeiro bathing water code PTCU9W",
        "Official 2026 bathing season from 1 June to 30 September",
        "Lagoa municipality and Algarve region listing"
      ]
    },
    {
      "source_name": "Camara Municipal de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official Seven Hanging Valleys pedestrian nature route",
        "5.7 km route linking Praia de Vale Centeanes and Praia da Marinha"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, location, village setting, facilities and accessible-beach recognition were verified from VisitPortugal.",
    "Blue Flag 2026 status, coordinates, beach code and 2026 Blue Flag season were verified from ABAAE.",
    "The 2026 bathing season was cross-checked against Diario da Republica.",
    "Accessible-beach recognition is listed, but practical support details were not independently verified.",
    "Nearby beach links use only already published AlgarveOfficial internal listings.",
    "Nearby restaurant and attraction arrays are intentionally empty until a nearby internally published listing can be verified for that specific section; dynamic nearby business cards may appear from published internal listings based on location.",
    "No external competitor website URL is used for the public listing CTA.",
    "One visually duplicate gallery image was removed; no new images were added."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00",
  "seo": {
    "meta_title": "Praia do Carvoeiro, Lagoa | Algarve Beach Guide",
    "meta_description": "Praia do Carvoeiro in Lagoa is a central Blue Flag village beach with restaurants, services, accessible-beach recognition and nearby coastal walks.",
    "keywords": [
      "Praia do Carvoeiro",
      "Carvoeiro Beach",
      "Carvoeiro beach Lagoa",
      "Lagoa beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Blue Flag Carvoeiro",
      "accessible beach Lagoa",
      "Algar Seco nearby",
      "Carvoeiro restaurants"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Nearby published beach listings",
      "links": [
        { "label": "Praia de Vale Centeanes", "href": "/listing/praia-de-vale-centeanes-lagoa" },
        { "label": "Praia do Carvalho", "href": "/listing/praia-do-carvalho-lagoa" },
        { "label": "Praia de Benagil", "href": "/listing/praia-de-benagil-lagoa" },
        { "label": "Praia da Marinha", "href": "/listing/praia-da-marinha-lagoa" },
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
   where slug = 'praia-do-carvoeiro-lagoa';

  if v_listing_id is null then
    raise exception 'Listing praia-do-carvoeiro-lagoa not found';
  end if;

  update public.listings
     set website_url = null,
         latitude = 37.096196,
         longitude = -8.472004,
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
     set alt_text = 'Algar Seco limestone rocks and ocean view near Carvoeiro'
   where id = '84cacd94-b617-4796-96d7-b53911ce059e'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Roped path beside eroded limestone rocks at Algar Seco near Carvoeiro'
   where id = '8356311c-cd94-459c-b79f-559fff41f047'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Fisherman statue beside Praia do Carvoeiro village street'
   where id = '03b1110e-64fb-456a-abd2-e4e12614a6ce'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Rocky Algar Seco viewpoint with Atlantic sea beside Carvoeiro'
   where id = 'caaa745f-b229-4cd3-84f1-cf1ebacd910f'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'View from an Algar Seco rock opening towards the Atlantic near Carvoeiro'
   where id = '6342f10f-81f9-441f-add3-a68e60b3afbb'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Algar Seco rock platform and open sea near Praia do Carvoeiro'
   where id = '23886477-5b37-4ad5-823a-61ddfbd61304'
     and listing_id = v_listing_id;

  delete from public.listing_images
   where id = '24dcd738-c98b-4a26-8d16-eb5ca7dce976'
     and listing_id = v_listing_id;
end $$;

commit;
