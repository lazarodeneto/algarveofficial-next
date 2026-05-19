begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Kulinarium",
    "type": "Restaurant",
    "distance": "~0.1 km",
    "description": "Published AlgarveOfficial restaurant listing near Praia do Carvoeiro; approximate distance calculated from stored listing coordinates.",
    "href": "/listing/kulinarium-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Mar d'Fora - Restaurante Carvoeiro",
    "type": "Restaurant",
    "distance": "~0.2 km",
    "description": "Published AlgarveOfficial restaurant listing in Carvoeiro; approximate distance from Praia do Carvoeiro calculated from stored listing coordinates.",
    "href": "/listing/mar-dfora-carvoeiro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Taste Restaurante Carvoeiro",
    "type": "Restaurant",
    "distance": "~0.7 km",
    "description": "Published AlgarveOfficial restaurant listing near Carvoeiro; approximate distance from Praia do Carvoeiro calculated from stored listing coordinates.",
    "href": "/listing/taste-restaurante-carvoeiro-quinta-do-lago",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Bon Bon",
    "type": "Restaurant",
    "distance": "~3.0 km",
    "description": "Published AlgarveOfficial restaurant listing in Lagoa; approximate distance from Praia do Carvoeiro calculated from stored listing coordinates.",
    "href": "/listing/bon-bon-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Benagil Beach Club",
    "type": "Beach club and restaurant",
    "distance": "~4.1 km",
    "description": "Published AlgarveOfficial beach-club listing in Benagil; approximate distance from Praia do Carvoeiro calculated from stored listing coordinates.",
    "href": "/listing/benagil-beach-club-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "O Leão de Porches",
    "type": "Restaurant",
    "distance": "~7.2 km",
    "description": "Published AlgarveOfficial restaurant listing in the Porches/Lagoa area; approximate distance from Praia do Carvoeiro calculated from stored listing coordinates.",
    "href": "/listing/o-leao-de-porches-lagoa",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Gramacho Golf Course",
    "type": "Golf",
    "distance": "~3.5 km",
    "description": "Published AlgarveOfficial golf listing near Carvoeiro/Lagoa by stored listing coordinates.",
    "href": "/listing/gramacho-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Blue Xperiences SUP Benagil Caves",
    "type": "Experience",
    "distance": "~4.2 km",
    "description": "Published AlgarveOfficial experience listing near Benagil by stored coordinates; any cave activity should follow current Maritime Authority rules.",
    "href": "/listing/blue-xperiences-sup-benagil-caves-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Jump2adventure - Kayak&sup - Benagil",
    "type": "Experience",
    "distance": "~4.2 km",
    "description": "Published AlgarveOfficial experience listing near Benagil by stored coordinates; any cave activity should follow current Maritime Authority rules.",
    "href": "/listing/jump2adventure-kayaksup-benagil-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Slide & Splash",
    "type": "Family attraction",
    "distance": "~4.9 km",
    "description": "Published AlgarveOfficial family-attraction listing in Lagoa by stored listing coordinates.",
    "href": "/listing/slide-and-splash-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Sand City",
    "type": "Family attraction",
    "distance": "~5.5 km",
    "description": "Published AlgarveOfficial family-attraction listing near Praia do Carvoeiro by stored listing coordinates.",
    "href": "/listing/sand-city-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Algarviews",
    "type": "Experience",
    "distance": "~6.4 km",
    "description": "Published AlgarveOfficial experience listing near the Benagil and Albandeira coast by stored listing coordinates.",
    "href": "/listing/algarviews-almancil",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_sources jsonb;
  v_notes jsonb;
  v_faq jsonb;
  v_patch jsonb;
begin
  select id
    into v_listing_id
  from public.listings
  where slug = 'praia-do-carvoeiro-lagoa'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-carvoeiro-lagoa not found; skipping update.';
    return;
  end if;

  select coalesce(category_data->'sources_used', '[]'::jsonb)
    into v_sources
  from public.listings
  where id = v_listing_id;

  v_sources := (
    select jsonb_agg(source_item)
    from (
      select source_item
      from jsonb_array_elements(v_sources) as source(source_item)
      where source_item->>'source_name' <> 'AlgarveOfficial internal published restaurant, experience and attraction listings'
      union all
      select jsonb_build_object(
        'source_name', 'AlgarveOfficial internal published restaurant, experience and attraction listings',
        'source_url', 'https://algarveofficial.com/listing/praia-do-carvoeiro-lagoa',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby restaurant, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from internal listing coordinates for Praia do Carvoeiro and the linked listings',
          'No external restaurant, attraction, experience or competitor website links were added'
        )
      )
    ) as sources
  );

  select coalesce(category_data->'verification_notes', '[]'::jsonb)
    into v_notes
  from public.listings
  where id = v_listing_id;

  v_notes := (
    select jsonb_agg(note_item)
    from (
      select note_item
      from jsonb_array_elements(v_notes) as note(note_item)
      where note_item <> to_jsonb('Nearby restaurant and attraction arrays are intentionally empty until a nearby internally published listing can be verified for that specific section; dynamic nearby business cards may appear from published internal listings based on location.'::text)
      union all
      select to_jsonb('Nearby restaurant, experience and attraction cards were added only where a published internal AlgarveOfficial listing exists; approximate distances are calculated from stored listing coordinates.'::text)
      union all
      select to_jsonb('No external restaurant, attraction, experience or competitor website links were added.'::text)
    ) as notes
  );

  select coalesce(category_data->'faq_items', '[]'::jsonb)
    into v_faq
  from public.listings
  where id = v_listing_id;

  v_faq := (
    select jsonb_agg(faq_item)
    from (
      select faq_item
      from jsonb_array_elements(v_faq) as faq(faq_item)
      where faq_item->>'question' not in (
        'Are there restaurants near Praia do Carvoeiro?',
        'What attractions are near Praia do Carvoeiro?',
        'What attractions or experiences are near Praia do Carvoeiro?'
      )
      union all
      select jsonb_build_object(
        'question', 'Are there restaurants near Praia do Carvoeiro?',
        'answer', 'Yes. VisitPortugal verifies restaurants, bars and terraces beside Praia do Carvoeiro. AlgarveOfficial also has internally published nearby restaurant and beach-club listings including Kulinarium, Mar d''Fora - Restaurante Carvoeiro, Taste Restaurante Carvoeiro, Bon Bon, Benagil Beach Club and O Leão de Porches. Distances are approximate and calculated from stored listing coordinates.'
      )
      union all
      select jsonb_build_object(
        'question', 'What attractions or experiences are near Praia do Carvoeiro?',
        'answer', 'Nearby internally published AlgarveOfficial listings include Gramacho Golf Course, Blue Xperiences SUP Benagil Caves, Jump2adventure - Kayak&sup - Benagil, Slide & Splash, Sand City and Algarviews. Any cave or sea activity should follow current Maritime Authority rules.'
      )
    ) as faqs
  );

  v_patch := jsonb_build_object(
    'nearby_restaurants', v_nearby_restaurants,
    'nearby_attractions', v_nearby_attractions,
    'sources_used', coalesce(v_sources, '[]'::jsonb),
    'verification_notes', coalesce(v_notes, '[]'::jsonb),
    'faq_items', coalesce(v_faq, '[]'::jsonb)
  );

  update public.listings
     set category_data = jsonb_set(
           coalesce(category_data, '{}'::jsonb) || v_patch,
           '{localized_content,en}',
           (coalesce(category_data, '{}'::jsonb) || v_patch) - 'localized_content',
           true
         ),
         updated_at = now()
   where id = v_listing_id;
end $$;

commit;
