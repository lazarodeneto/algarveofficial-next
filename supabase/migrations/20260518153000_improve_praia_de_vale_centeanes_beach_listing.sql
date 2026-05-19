begin;

do $$
declare
  v_listing_id uuid;
  v_patch jsonb := $json$
{
  "vertical": "beaches",
  "name": "Praia de Vale Centeanes",
  "slug": "praia-de-vale-centeanes-lagoa",
  "category": "beaches",
  "tier": "verified",
  "status": "published",
  "city": "Carvoeiro / Lagoa",
  "concelho": "Lagoa",
  "municipality": "Lagoa",
  "region": "Algarve",
  "country": "Portugal",
  "short_description": "Praia de Vale Centeanes is a cliff-framed beach near Carvoeiro in Lagoa, reached by a long staircase and listed by official sources with seasonal services, parking and 2026 Blue Flag status.",
  "full_description": "Praia de Vale Centeanes is a maritime beach near Carvoeiro, in the municipality of Lagoa. VisitPortugal describes it as a cove sheltered between golden cliffs, with eroded formations that can conceal small caves and access by a long staircase.\n\nThe beach combines a serviced bathing area with one of Lagoa's most important walking contexts. VisitPortugal lists Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, surf and diving. ABAAE verifies Vale Centeanes as a 2026 Blue Flag coastal beach, with the bathing season from 1 June to 30 September 2026 and the Blue Flag season from 1 July to 30 September 2026.\n\nVale Centeanes is also one endpoint of Lagoa's official Seven Hanging Valleys route. The municipality describes that pedestrian nature route as 5.7 km long, linking Praia de Vale Centeanes and Praia da Marinha along a line of cliffs and hanging valleys. This makes the beach useful for visitors combining a beach stop with a cliff-walk itinerary towards Carvalho, Benagil and Marinha.\n\nAccess and safety should still be planned carefully. The long staircase means step-free access was not verified, and current accessible-beach equipment was not confirmed for this review. The beach is backed by cliffs, so visitors should keep away from cliff bases and edges, follow marked routes and check local flags, signs and beach notices before swimming.",
  "highlights": [
    "Cliff-framed maritime beach near Carvoeiro, Lagoa",
    "Access by a long staircase verified by VisitPortugal",
    "Official endpoint of the Seven Hanging Valleys route",
    "Parking, showers, bar, restaurant and seasonal services listed by VisitPortugal",
    "Surf and diving activities listed by VisitPortugal",
    "2026 Blue Flag status verified by ABAAE"
  ],
  "best_time_to_visit": "June to September aligns with the official 2026 bathing season and seasonal beach-service period. Spring, early summer and early autumn are usually better for walking the Seven Hanging Valleys route with lower heat pressure. For summer visits, go earlier or later in the day where possible, and check sea conditions before swimming or using activity services.",
  "parking_info": "VisitPortugal lists parking for Praia de Vale Centeanes. Current capacity, payment conditions and peak-season restrictions were not independently verified for this review. Visitors should allow extra time in summer and remember that parking does not remove the need to use the stair access down to the sand.",
  "accessibility_info": "Step-free access and accessible-beach support were not verified. VisitPortugal describes access by a long staircase, so Praia de Vale Centeanes may be unsuitable for visitors who cannot manage steps unless current local assistance or alternative access is confirmed before travelling.",
  "lifeguard_info": "VisitPortugal lists safety or surveillance, and official 2026 sources list the bathing season from 1 June to 30 September. Exact daily lifeguard staffing was not independently verified; check local flags, signage and beach notices before swimming.",
  "blue_flag_info": "Blue Flag status: verified for 2026 via ABAAE. The official ABAAE page lists the Blue Flag season from 1 July to 30 September 2026 and showed the flag as not hoisted at the time checked on 18 May 2026.",
  "blue_flag_status": "verified_2026",
  "blue_flag_year": 2026,
  "lifeguard_season": {
    "year": 2026,
    "official_bathing_season": "1 June 2026 to 30 September 2026",
    "notes": "VisitPortugal lists safety or surveillance, but exact daily lifeguard staffing was not independently verified."
  },
  "google_maps_url": "https://www.google.com/maps/search/?api=1&query=37.091267%2C-8.455396",
  "coordinates": {
    "latitude": 37.091267,
    "longitude": -8.455396,
    "source": "ABAAE official Vale Centeanes beach entry."
  },
  "latitude": 37.091267,
  "longitude": -8.455396,
  "beach_type": "Maritime sandy beach below limestone cliffs",
  "landscape": "A sandy cove sheltered between golden limestone cliffs, with eroded formations and a cliff-coast route extending towards Marinha.",
  "access": "Access to the sand is by a long staircase according to VisitPortugal. Road access, walking access and parking are listed, but current local conditions should be checked before travelling.",
  "facilities": [
    { "name": "Blue Flag 2026", "status": "Verified / seasonal display" },
    { "name": "Official 2026 bathing season", "status": "1 June to 30 September 2026" },
    { "name": "Safety or surveillance listed by VisitPortugal", "status": "Seasonal / verify locally" },
    { "name": "Sunshade rental", "status": "Seasonal" },
    { "name": "Light boat rental", "status": "Seasonal / conditions dependent" },
    { "name": "Showers", "status": "Verified / seasonal operation should be checked" },
    { "name": "Parking", "status": "Verified by VisitPortugal" },
    { "name": "Bar", "status": "Verified / seasonal operation should be checked" },
    { "name": "Restaurant", "status": "Verified / seasonal operation should be checked" },
    { "name": "Surf", "status": "Listed by VisitPortugal / conditions dependent" },
    { "name": "Diving", "status": "Listed by VisitPortugal / conditions dependent" },
    { "name": "Accessible-beach support", "status": "Not verified" }
  ],
  "includes": [
    "Seasonal safety or surveillance listed by VisitPortugal",
    "Parking listed by VisitPortugal",
    "Showers",
    "Seasonal bar and restaurant",
    "Seasonal rentals and activity services",
    "Seven Hanging Valleys route access context"
  ],
  "important_information": [
    "ABAAE lists Vale Centeanes as a 2026 Blue Flag beach.",
    "The 2026 bathing season is listed as 1 June to 30 September.",
    "The 2026 Blue Flag season is listed as 1 July to 30 September.",
    "Access to the sand is by a long staircase according to VisitPortugal.",
    "Step-free access and accessible-beach support were not verified.",
    "Facilities and activity services may vary by season and sea conditions.",
    "The beach is backed by cliffs; keep away from cliff bases and cliff edges."
  ],
  "important_notes": "ABAAE verifies Vale Centeanes as a 2026 Blue Flag beach, with bathing season from 1 June to 30 September and Blue Flag season from 1 July to 30 September. VisitPortugal lists parking, showers, bar, restaurant, surveillance, rentals, surf and diving, but current operation should be checked locally. Access is by a long staircase, and step-free access was not verified.",
  "suitable_for": [
    "Visitors staying around Carvoeiro or Lagoa",
    "Beachgoers wanting a serviced cliff beach",
    "Walkers using the Seven Hanging Valleys route",
    "Couples and families comfortable with stair access",
    "Surf or diving users when conditions and services are suitable",
    "Photography and coastal scenery"
  ],
  "not_suitable_for": [
    "Visitors needing verified step-free beach access",
    "Visitors who cannot manage a long staircase",
    "Anyone unwilling to follow cliff-safety guidance",
    "Visitors expecting guaranteed year-round services or activity rentals"
  ],
  "best_for": [
    "Cliff scenery",
    "Beach services",
    "Seven Hanging Valleys route access",
    "Families comfortable with steps",
    "Couples",
    "Surf and diving when conditions allow"
  ],
  "nearby_beaches": [
    {
      "name": "Praia do Carvoeiro",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial beach listing in the nearby Carvoeiro village area west of Vale Centeanes.",
      "href": "/listing/praia-do-carvoeiro-lagoa",
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
      "type": "Nearby beach and route endpoint",
      "description": "A published AlgarveOfficial Lagoa beach listing at the opposite end of the official Seven Hanging Valleys route.",
      "href": "/listing/praia-da-marinha-lagoa",
      "verification_status": "Verified internal listing"
    },
    {
      "name": "Praia da Albandeira",
      "type": "Nearby beach",
      "description": "A published AlgarveOfficial cliff-cove listing east of Marinha on the same central Algarve coastline.",
      "href": "/listing/praia-da-albandeira-lagoa",
      "verification_status": "Verified internal listing"
    }
  ],
  "nearby_restaurants": [],
  "nearby_attractions": [],
  "walking_trails_nearby": [
    {
      "name": "Seven Hanging Valleys route",
      "description": "Official Lagoa pedestrian nature route of 5.7 km linking Praia de Vale Centeanes and Praia da Marinha along cliffs and hanging valleys.",
      "verification_status": "Verified"
    },
    {
      "name": "Vale Centeanes to Marinha coastal walk",
      "description": "A practical use of the official Seven Hanging Valleys route between Vale Centeanes and Praia da Marinha. Walkers should use marked paths, carry water and avoid cliff edges.",
      "verification_status": "Verified with caution"
    }
  ],
  "visitor_tips": [
    "Allow for stair access between the beach and the parking / arrival area.",
    "Check local flags and signage before swimming, surfing or diving.",
    "Use the beach as a practical endpoint or start point for the Seven Hanging Valleys route.",
    "Bring water and suitable footwear if combining the beach with a cliff walk.",
    "Keep away from cliff bases and cliff edges.",
    "Treat rentals, restaurant service and activity options as seasonal unless confirmed locally."
  ],
  "photography_notes": "Vale Centeanes photographs well from the cliff-top approach and from the sand below the limestone walls. Keep compositions to safe viewpoints and open beach areas, avoiding cliff edges and cliff bases.",
  "family_notes": "Praia de Vale Centeanes can suit families who are comfortable with stair access because VisitPortugal lists parking, showers, bar, restaurant and seasonal surveillance. Families should still check sea conditions and keep children away from cliffs and rocks.",
  "safety_notes": "Sea conditions can vary. Follow beach flags, local signage and lifeguard instructions where present. Keep away from cliff bases and edges, and use marked routes on the Seven Hanging Valleys section.",
  "accessibility_notes": "VisitPortugal describes access by a long staircase. Step-free access and accessible-beach support were not verified, so visitors with reduced mobility should confirm current access and assistance before travelling.",
  "faq_items": [
    {
      "question": "Where is Praia de Vale Centeanes?",
      "answer": "Praia de Vale Centeanes is near Carvoeiro in the municipality of Lagoa, on the central Algarve coast."
    },
    {
      "question": "Is Praia de Vale Centeanes a Blue Flag beach?",
      "answer": "Yes. ABAAE verifies Vale Centeanes as a 2026 Blue Flag beach, with the Blue Flag season listed from 1 July to 30 September 2026."
    },
    {
      "question": "Are there lifeguards at Praia de Vale Centeanes?",
      "answer": "VisitPortugal lists safety or surveillance, and official 2026 sources list the bathing season from 1 June to 30 September. Exact daily lifeguard staffing was not independently verified."
    },
    {
      "question": "Is there parking at Praia de Vale Centeanes?",
      "answer": "VisitPortugal lists parking for Praia de Vale Centeanes. Current capacity, payment conditions and peak-season restrictions were not independently verified."
    },
    {
      "question": "Is Praia de Vale Centeanes accessible for visitors with reduced mobility?",
      "answer": "Step-free access was not verified. VisitPortugal describes access by a long staircase, so visitors with reduced mobility should confirm current conditions before travelling."
    },
    {
      "question": "What facilities are listed at Praia de Vale Centeanes?",
      "answer": "VisitPortugal lists safety or surveillance, sunshade rental, light boat rental, showers, parking, bar, restaurant, surf and diving. Seasonal operation should be checked locally."
    },
    {
      "question": "Is Praia de Vale Centeanes on the Seven Hanging Valleys route?",
      "answer": "Yes. Lagoa municipality verifies the Seven Hanging Valleys route as a 5.7 km pedestrian nature route linking Praia de Vale Centeanes and Praia da Marinha."
    },
    {
      "question": "What are the nearest AlgarveOfficial beach listings?",
      "answer": "Nearby published AlgarveOfficial beach listings include Praia do Carvoeiro, Praia do Carvalho, Praia de Benagil, Praia da Marinha and Praia da Albandeira."
    }
  ],
  "image_gallery_notes": {
    "status": "Existing AlgarveOfficial/Supabase gallery retained; no duplicate image files found during the 18 May 2026 review. Alt text updated from visual inspection.",
    "duplicate_check": "No duplicate canonical image filenames found in listing_images for this listing."
  },
  "sources_used": [
    {
      "source_name": "VisitPortugal - Praia do Vale de Centeanes",
      "source_url": "https://www.visitportugal.com/pt-pt/content/praia-do-vale-de-centeanes",
      "facts_verified": [
        "Beach name and maritime beach classification",
        "Location at Carvoeiro - Lagoa",
        "Sheltered cove between golden cliffs",
        "Eroded formations and occasional caves",
        "Access by long staircase",
        "Facilities including Blue Flag, safety or surveillance, sunshade rental, light boat rental, showers, parking, bar and restaurant",
        "Surf and diving listed",
        "Summer water temperature range listed as 20-22 C"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Vale Centeanes",
      "source_url": "https://bandeiraazul.abaae.pt/local-galardoado/vale-centeanes/",
      "facts_verified": [
        "Official Vale Centeanes Blue Flag beach entry",
        "Coastal beach classification",
        "Municipality of Lagoa (Algarve)",
        "Coordinates 37.091267, -8.455396",
        "Beach code PTCT8D",
        "2026 bathing season from 1 June to 30 September",
        "2026 Blue Flag season from 1 July to 30 September",
        "Flag shown as not hoisted at time of check"
      ]
    },
    {
      "source_name": "ABAAE Bandeira Azul - Galardoados 2026",
      "source_url": "https://bandeiraazul.abaae.pt/galardoados/galardoados-2026/",
      "facts_verified": [
        "Vale Centeanes listed among Lagoa (Algarve) 2026 Blue Flag awarded locations",
        "Lagoa listed with six 2026 awarded locations"
      ]
    },
    {
      "source_name": "Diario da Republica - Portaria 204-A/2026/1",
      "source_url": "https://diariodarepublica.pt/dr/detalhe/portaria/204-a-2026-1102518728",
      "facts_verified": [
        "Vale Centeanes bathing water code PTCT8D",
        "Official 2026 bathing season from 1 June to 30 September",
        "Lagoa municipality and Algarve region listing"
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
    }
  ],
  "verification_notes": [
    "Beach name, location, staircase access, facilities and activities were verified from VisitPortugal.",
    "Blue Flag 2026 status, coordinates, beach code and 2026 Blue Flag season were verified from ABAAE.",
    "The 2026 bathing season was cross-checked against Diario da Republica.",
    "Step-free access and accessible-beach support were not verified, so the listing avoids an accessibility claim and notes the long staircase.",
    "Nearby beach links use only already published AlgarveOfficial internal listings.",
    "Nearby restaurant and attraction arrays are intentionally empty until a nearby internally published listing can be verified for that specific section; dynamic nearby business cards may appear from published internal listings based on location.",
    "No external competitor website URL is used for the public listing CTA.",
    "No new images were added; existing gallery images were retained after duplicate checking and alt-text improvement."
  ],
  "last_verified_at": "2026-05-18T00:00:00+01:00",
  "seo": {
    "meta_title": "Praia de Vale Centeanes, Lagoa | Beach Guide",
    "meta_description": "Praia de Vale Centeanes in Lagoa is a Blue Flag cliff beach near Carvoeiro with parking, services, stair access and Seven Hanging Valleys route context.",
    "keywords": [
      "Praia de Vale Centeanes",
      "Vale Centeanes Beach",
      "Praia do Vale de Centeanes",
      "Lagoa beaches",
      "Carvoeiro beaches",
      "Algarve beaches",
      "Portugal beaches",
      "Blue Flag Vale Centeanes",
      "Seven Hanging Valleys route",
      "cliff beach Lagoa"
    ]
  },
  "seo_link_groups": [
    {
      "title": "Nearby published beach listings",
      "links": [
        { "label": "Praia do Carvoeiro", "href": "/listing/praia-do-carvoeiro-lagoa" },
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
   where slug = 'praia-de-vale-centeanes-lagoa';

  if v_listing_id is null then
    raise exception 'Listing praia-de-vale-centeanes-lagoa not found';
  end if;

  update public.listings
     set website_url = null,
         latitude = 37.091267,
         longitude = -8.455396,
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
     set alt_text = 'Small sandy cove at Praia de Vale Centeanes below limestone cliffs and blue sea'
   where id = 'fb6f7fee-6261-4854-bf18-d882d0f6cdd8'
     and listing_id = v_listing_id;

  update public.listing_images
     set alt_text = 'Clifftop view over Praia de Vale Centeanes with beachgoers, boats and limestone cliffs'
   where id = 'e554f282-7159-4756-9916-99aad04d9489'
     and listing_id = v_listing_id;
end $$;

commit;
