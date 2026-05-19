begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia da Albandeira",
  "slug": "praia-da-albandeira-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Porches",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia da Albandeira is a small natural beach in Lagoa, set within a limestone cliff cove near Porches and the Benagil coastline. Official sources verify outdoor parking, a bar, rural access scenery and the 2026 bathing season, while several services remain unverified.",
  "full_description": "Praia da Albandeira is a compact natural beach on the Lagoa coast, close to Porches and the Benagil area. VisitPortugal describes it as a small maritime beach surrounded by cut cliff faces and unusual rock formations, while Lagoa municipal tourism material classifies it as a natural beach and verifies the GPS coordinates.\n\nThe beach is small and scenic rather than heavily serviced. A rocky promontory divides the sand into two modest sections, and the approach passes through a narrow rural road with Mediterranean scrub and former dryland orchard landscapes. VisitPortugal lists outdoor parking and a bar, plus surfing and windsurfing as activities, but current opening, supervision, toilets, sunbed rental and accessibility support were not independently verified for this review.\n\nThe official 2026 bathing-water list names Albandeira in Lagoa with a bathing season from 1 June to 30 September. Exact lifeguard staffing was not independently verified, so visitors should follow local flags, signage and any instructions displayed on site before swimming.\n\nPlanning matters here. Lagoa municipality reported pressure in the wider Albandeira-Benagil coastal zone in 2025, including traffic circulation issues, disordered parking, occupation of sensitive areas, small accidents and beach overcrowding. For a more comfortable visit, arrive early or outside peak hours, keep away from cliff edges and cliff bases, and use only authorised paths and parking areas.",
  "highlights": [
    "Small natural beach in the municipality of Lagoa",
    "Limestone cliff cove divided into two sandy sections by a rocky promontory",
    "Outdoor parking and bar listed by VisitPortugal",
    "Narrow rural access road and Mediterranean scrub approach verified by Lagoa municipal tourism material",
    "Official 2026 bathing season listed from 1 June to 30 September",
    "Close to published AlgarveOfficial beach listings for Praia da Marinha, Praia da Senhora da Rocha and Praia de Benagil"
  ],
  "best_time_to_visit": "Spring and autumn are practical for nearby coastal walking and cooler cliff-top conditions. In summer, use the official bathing-season context from 1 June to 30 September, but arrive early or later in the day where possible because Lagoa municipality has reported traffic, parking and crowding pressure in the Albandeira-Benagil coastal zone. Avoid cliff-top or informal coastal walking in very hot, rainy or windy conditions.",
  "parking_info": "VisitPortugal lists outdoor parking for Praia da Albandeira. Current capacity, payment conditions and exact walking distance to the sand were not independently verified. Lagoa municipality reported disordered parking and circulation pressure in the wider Albandeira-Benagil zone in 2025, so visitors should use authorised parking only and allow extra time in summer.",
  "accessibility_info": "Step-free beach access, adapted toilets, beach wheelchairs and assisted bathing were not verified for Praia da Albandeira. The beach is a small cliff cove reached by a narrow rural access road, so visitors with reduced mobility should confirm current access conditions locally before travelling.",
  "lifeguard_info": "The official 2026 bathing-water list includes Albandeira with a bathing season from 1 June to 30 September. Exact lifeguard supervision and daily staffing were not independently verified for this review; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: not verified for 2026. Praia da Albandeira was not found in the ABAAE 2026 awarded list checked on 18 May 2026.",
  "blue_flag_status": "not_verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "The bathing season is listed in the official 2026 bathing-water portaria. Exact lifeguard supervision was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.091355%2C-8.400453",
  "coordinates": {
    "latitude": 37.091355,
    "longitude": -8.400453,
    "source": "Lagoa municipal tourism brochure GPS coordinates."
  },
  "latitude": 37.091355,
  "longitude": -8.400453,
  "beach_type": "Small natural maritime beach / limestone cliff cove",
  "landscape": "A compact sandy cove framed by limestone cliffs, with a rocky promontory dividing the beach into two sandy sections and a rural Mediterranean-scrub approach.",
  "access": "VisitPortugal lists access by car, motorcycle and on foot. Lagoa municipal tourism material describes the approach as a narrow rural road through Mediterranean scrub and former dryland orchards. Current access restrictions and parking conditions should be checked locally in summer.",
  "facilities": [
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Outdoor parking", "status": "Verified by VisitPortugal / capacity not verified" },
    { "name": "Bar", "status": "Listed by VisitPortugal / current operation not verified" },
    { "name": "Surfing", "status": "Listed by VisitPortugal / conditions dependent" },
    { "name": "Windsurfing", "status": "Listed by VisitPortugal / conditions dependent" },
    { "name": "Lifeguard supervision", "status": "Exact supervision not verified" },
    { "name": "Blue Flag 2026", "status": "Not verified" },
    { "name": "Step-free accessibility", "status": "Not verified" },
    { "name": "Public toilets", "status": "Not verified" },
    { "name": "Sunbed or parasol rental", "status": "Not verified" }
  ],
  "includes": [
    "Small natural cliff-cove setting",
    "Outdoor parking listed by VisitPortugal",
    "Bar listed by VisitPortugal",
    "Two sandy sections divided by a rocky promontory",
    "Surfing and windsurfing listed by VisitPortugal where conditions allow",
    "Official 2026 bathing-season listing"
  ],
  "important_information": {
    "best_time_to_visit": "Spring and autumn are practical for nearby coastal walking and cooler cliff-top conditions. In summer, use the official bathing-season context from 1 June to 30 September, but arrive early or later in the day where possible because Lagoa municipality has reported traffic, parking and crowding pressure in the Albandeira-Benagil coastal zone. Avoid cliff-top or informal coastal walking in very hot, rainy or windy conditions.",
    "know_before_you_go": "Outdoor parking and a bar are listed by VisitPortugal, but current capacity, operation and additional services were not independently verified. The wider Albandeira-Benagil coastal zone has had reported traffic, parking and crowding pressure. Keep away from cliff edges and cliff bases, avoid sensitive areas, and check local signage before entering the water.",
    "notes": [
      "Official 2026 sources list Albandeira with a bathing season from 1 June to 30 September.",
      "Exact lifeguard supervision was not independently verified.",
      "Blue Flag status was not verified for 2026.",
      "Outdoor parking and a bar are listed by VisitPortugal, but current operation and capacity were not verified.",
      "Step-free access, adapted equipment, public toilets and sunbed rental were not verified.",
      "Lagoa municipality reported pressure in the Albandeira-Benagil coastal zone in 2025, including traffic, parking and overcrowding issues."
    ]
  },
  "important_notes": "Official 2026 sources list Albandeira with a bathing season from 1 June to 30 September. VisitPortugal lists outdoor parking, a bar, surfing and windsurfing, but current supervision, accessibility support, toilets, rental services, parking capacity and bar operation were not independently verified. Lagoa municipality has reported traffic, parking and overcrowding pressure in the wider Albandeira-Benagil coastal zone.",
  "suitable_for": [
    "Visitors looking for a small natural cliff-cove beach",
    "Photographers and coastal scenery seekers",
    "Couples and adults comfortable with compact coves",
    "Nature-focused visitors exploring the Lagoa coast",
    "Visitors combining Albandeira with nearby published AlgarveOfficial beach listings"
  ],
  "not_suitable_for": [
    "Visitors needing fully verified step-free beach access",
    "Visitors seeking a large serviced resort beach",
    "Visitors requiring confirmed toilets, sunbeds or assisted bathing",
    "Anyone unwilling to follow cliff, parking, sea and local safety signage"
  ],
  "best_for": [
    "Scenic views",
    "Photography",
    "Small natural coves",
    "Lagoa coast exploring",
    "Surfing and windsurfing when conditions are suitable"
  ],
  "nearby_beaches": [
    {
      "name": "Praia da Marinha",
      "type": "Nearby beach",
      "distance": "~1.1 km",
      "description": "A published AlgarveOfficial Lagoa beach listing west of Albandeira and an official endpoint of the Seven Hanging Valleys route.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Senhora da Rocha",
      "type": "Nearby beach",
      "distance": "~1.5 km",
      "description": "A published AlgarveOfficial beach listing east of Albandeira in the Porches coastal area.",
      "href": "/listing/praia-da-senhora-da-rocha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Benagil",
      "type": "Nearby beach",
      "distance": "~2.4 km",
      "description": "A published AlgarveOfficial beach listing west of Albandeira, linked with Benagil village and the central Lagoa cave coastline.",
      "href": "/listing/praia-de-benagil-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia do Carvalho",
      "type": "Nearby beach",
      "distance": "~2.9 km",
      "description": "A published AlgarveOfficial natural cove listing west of Benagil on the Lagoa cliff coast.",
      "href": "/listing/praia-do-carvalho-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia de Vale Centeanes",
      "type": "Nearby beach",
      "distance": "~4.9 km",
      "description": "A published AlgarveOfficial cliff beach listing and official Seven Hanging Valleys route endpoint.",
      "href": "/listing/praia-de-vale-centeanes-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia do Carvoeiro",
      "type": "Nearby beach",
      "distance": "~6.4 km",
      "description": "A published AlgarveOfficial central village beach listing in Carvoeiro, Lagoa.",
      "href": "/listing/praia-do-carvoeiro-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [],
  "nearby_attractions": [],
  "walking_trails_nearby": [
    {
      "name": "Percurso dos Sete Vales Suspensos",
      "description": "Official Lagoa walking route of 5.7 km between Praia de Vale Centeanes and Praia da Marinha. Albandeira is nearby but was not verified as one of the official trail endpoints for this listing.",
      "verification_status": "Verified with caution"
    },
    {
      "name": "Local coastal paths around Albandeira",
      "description": "Informal coastal walking may exist around Albandeira and nearby coves, but route status, maintenance and safe access were not fully verified.",
      "verification_status": "Not verified"
    }
  ],
  "visitor_tips": [
    "Use authorised parking only and allow extra time in summer.",
    "Bring water, sun protection and footwear suitable for uneven coastal access.",
    "Check local signs, flags and sea conditions before swimming.",
    "Keep away from cliff edges, cliff bases and informal paths through sensitive areas.",
    "Treat the bar, parking capacity and any beach services as current-conditions checks rather than guaranteed facilities.",
    "Use internal AlgarveOfficial nearby business cards rather than external competitor links."
  ],
  "photography_notes": "Praia da Albandeira photographs well for its compact sand, limestone cliffs and natural arch nearby. Use authorised viewpoints, keep well back from cliff edges and avoid standing beneath unstable rock faces.",
  "family_notes": "Praia da Albandeira can appeal to families who want a small scenic cove, but it should be approached with care because step-free access, toilets, lifeguard supervision and rental services were not independently verified. Children should be supervised closely around rocks, cliffs and the water.",
  "safety_notes": "Sea and wind conditions can vary. Follow local flags, signs and any official instructions before swimming. Keep a safe distance from cliff edges and cliff bases, avoid sensitive or restricted areas, and do not rely on unverified lifeguard or accessibility support.",
  "accessibility_notes": "Step-free access, beach wheelchairs, adapted toilets and assisted bathing were not verified. Visitors with reduced mobility should confirm current access conditions locally before travelling.",
  "faq_items": [
    {
      "question": "Where is Praia da Albandeira?",
      "answer": "Praia da Albandeira is in the municipality of Lagoa, close to Porches and the Benagil coastal area on the central Algarve coast."
    },
    {
      "question": "Is there parking at Praia da Albandeira?",
      "answer": "VisitPortugal lists outdoor parking for Praia da Albandeira. Current capacity, payment conditions and peak-season restrictions were not independently verified."
    },
    {
      "question": "Is Praia da Albandeira accessible for visitors with reduced mobility?",
      "answer": "Step-free access, adapted toilets, beach wheelchairs and assisted bathing were not verified. The beach is a small cliff cove reached by a narrow rural access road, so current access should be checked locally."
    },
    {
      "question": "Are there lifeguards at Praia da Albandeira?",
      "answer": "The official 2026 bathing-water list includes Albandeira with a bathing season from 1 June to 30 September. Exact lifeguard supervision and daily staffing were not independently verified."
    },
    {
      "question": "Is Praia da Albandeira a Blue Flag beach?",
      "answer": "Blue Flag status was not verified for 2026. Praia da Albandeira was not found in the ABAAE 2026 awarded list checked on 18 May 2026."
    },
    {
      "question": "Are there restaurants near Praia da Albandeira?",
      "answer": "VisitPortugal lists a bar at Praia da Albandeira, but current operation was not independently verified. AlgarveOfficial may show internally published nearby business cards based on location."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia da Marinha, Praia da Senhora da Rocha, Praia de Benagil, Praia do Carvalho, Praia de Vale Centeanes and Praia do Carvoeiro."
    },
    {
      "question": "What is the best time to visit Praia da Albandeira?",
      "answer": "Spring and autumn are practical for nearby coastal walking. In summer, arrive early or later in the day where possible because Lagoa municipality has reported traffic, parking and crowding pressure in the Albandeira-Benagil coastal zone."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained after visual inspection on 18 May 2026. Alt text updated from the two available images.",
    "duplicate_check": "No duplicate canonical image filenames or visually repeated gallery images were found during this review."
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia de Albandeira",
      "source_url": "https://www.visitportugal.com/en/NR/exeres/23553692-F8A3-46D0-9D03-435E520875F1",
      "facts_verified": [
        "Beach name and maritime beach classification",
        "Location listed as Benagil - Lagoa",
        "Small sandy beach surrounded by truncated cliff faces and unusual formations",
        "Outdoor parking listed",
        "Bar listed",
        "Surfing and windsurfing listed",
        "Access by car, motorcycle and on foot",
        "Average summer seawater temperature listed as 20-22 C"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria n.º 204-A/2026/1",
      "source_url": "https://files.diariodarepublica.pt/1s/2026/04/08401/0000200039.pdf",
      "facts_verified": [
        "Albandeira listed in Lagoa for the 2026 bathing-water season",
        "Official 2026 bathing season listed as 1 June to 30 September"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Praia da Albandeira was not found in the 2026 awarded list when checked on 18 May 2026"
      ]
    },
    {
      "source_name": "Lagoa Municipal Tourism Brochure - Praia de Albandeira",
      "source_url": "https://portal.oa.pt/media/124556/folheto-turistico-da-regiao-de-lagoa_algarve-i.pdf",
      "facts_verified": [
        "Natural beach classification",
        "GPS coordinates 37.091355, -8.400453",
        "Narrow access road",
        "Mediterranean scrub and rural coastal approach",
        "Small promontory dividing the beach into two sandy areas",
        "Cliff safety warning context"
      ]
    },
    {
      "source_name": "Municipio de Lagoa - Coastal management between Albandeira and Benagil",
      "source_url": "https://www.cm-lagoa.pt/noticia/municipio-de-lagoa-reune-com-varias-entidades-para-ordenar-zona-costeira-entre-albandeira-e-benagil",
      "facts_verified": [
        "Albandeira-Benagil coastal zone identified by municipality",
        "Reported traffic circulation issues, disordered parking, occupation of sensitive areas, small accidents and beach overcrowding in 2025",
        "Need for sustainable and safe coastal management"
      ]
    },
    {
      "source_name": "Municipio de Lagoa - Sete Vales Suspensos",
      "source_url": "https://www.cm-lagoa.pt/conhecer/percursos/sete-vales-suspensos",
      "facts_verified": [
        "Official Lagoa walking route",
        "5.7 km route between Praia de Vale Centeanes and Praia da Marinha",
        "Cliff, hanging valley, geological and habitat value context"
      ]
    },
    {
      "source_name": "AlgarveOfficial internal published listings",
      "source_url": "https://algarveofficial.com/listing/praia-da-albandeira-lagoa",
      "facts_verified": [
        "Nearby beach cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026",
        "Approximate nearby distances calculated from internal listing coordinates"
      ]
    }
  ],
  "verification_notes": [
    "Beach name, Lagoa municipality, maritime/natural beach classification, coordinates, parking/bar listing and landscape details were verified from official tourism and municipal sources.",
    "The official 2026 bathing-water list verifies Albandeira with a bathing season from 1 June to 30 September, but exact daily lifeguard staffing was not independently verified.",
    "Blue Flag status was not verified for 2026 because Albandeira was not found in the ABAAE 2026 awarded list checked on 18 May 2026.",
    "Current toilets, sunbed rental, step-free access, adapted equipment, beach-wheelchair support, exact parking capacity and bar operation were not verified.",
    "Nearby restaurants and attractions are intentionally left to internal published AlgarveOfficial business/attraction cards generated by the app; no external competitor website cards were added.",
    "No third-party review, booking, map or social media platform names were used in the public listing text."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00"
}
$json$;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-da-albandeira-lagoa'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-da-albandeira-lagoa not found; skipping update.';
    return;
  end if;

  update public.listings
     set short_description = v_patch->>'short_description',
         description = v_patch->>'full_description',
         website_url = null,
         google_business_url = null,
         latitude = 37.091355,
         longitude = -8.400453,
         meta_title = 'Praia da Albandeira, Lagoa | Algarve Beach Guide',
         meta_description = 'Praia da Albandeira in Lagoa is a small natural cliff-cove beach with verified parking, bar listing, 2026 bathing season and practical visitor notes.',
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
     set alt_text = 'Small sandy cove at Praia da Albandeira below limestone cliffs'
   where id = '6b60fb82-0def-4a0f-9841-626be390dcb4'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Natural sea arch and calm water near Praia da Albandeira'
   where id = '3a709a54-e908-47f1-998f-ca6271028f3e'
     and listing_id = v_listing_id;
end $$;

commit;
