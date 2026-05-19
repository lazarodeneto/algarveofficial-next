begin;

do $$
declare
  v_listing_id uuid;
  v_nearby_restaurants jsonb := $json$
[
  {
    "name": "Benagil Beach Club",
    "type": "Beach club and restaurant",
    "distance": "~0.5 km",
    "description": "Published AlgarveOfficial beach-club listing in Benagil; approximate distance from Praia do Carvalho calculated from stored listing coordinates.",
    "href": "/listing/benagil-beach-club-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Bon Bon",
    "type": "Restaurant",
    "distance": "~2.3 km",
    "description": "Published AlgarveOfficial restaurant listing in Lagoa; approximate distance from Praia do Carvalho calculated from stored listing coordinates.",
    "href": "/listing/bon-bon-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Mar d'Fora - Restaurante Carvoeiro",
    "type": "Restaurant",
    "distance": "~3.9 km",
    "description": "Published AlgarveOfficial restaurant listing in Carvoeiro; approximate distance from Praia do Carvalho calculated from stored listing coordinates.",
    "href": "/listing/mar-dfora-carvoeiro",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Aladin Grill",
    "type": "Restaurant",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial restaurant listing in Lagoa; approximate distance from Praia do Carvalho calculated from stored listing coordinates.",
    "href": "/listing/aladin-grill-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Atlântico",
    "type": "Restaurant",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial restaurant listing in Lagoa; approximate distance from Praia do Carvalho calculated from stored listing coordinates.",
    "href": "/listing/atlantico-lagoa",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Ocean Restaurant",
    "type": "Restaurant",
    "distance": "~5.0 km",
    "description": "Published AlgarveOfficial restaurant listing in Lagoa; approximate distance from Praia do Carvalho calculated from stored listing coordinates.",
    "href": "/listing/ocean-lagoa",
    "verification_status": "Published internal listing"
  }
]
$json$;
  v_nearby_attractions jsonb := $json$
[
  {
    "name": "Blue Xperiences SUP Benagil Caves",
    "type": "Experience",
    "distance": "~0.6 km",
    "description": "Published AlgarveOfficial experience listing near Benagil by stored coordinates; any cave activity should follow current Maritime Authority rules.",
    "href": "/listing/blue-xperiences-sup-benagil-caves-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Jump2adventure - Kayak&sup - Benagil",
    "type": "Experience",
    "distance": "~0.7 km",
    "description": "Published AlgarveOfficial experience listing near Benagil by stored coordinates; any cave activity should follow current Maritime Authority rules.",
    "href": "/listing/jump2adventure-kayaksup-benagil-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Algarviews",
    "type": "Experience",
    "distance": "~2.9 km",
    "description": "Published AlgarveOfficial experience listing near the Benagil and Albandeira coast by stored listing coordinates.",
    "href": "/listing/algarviews-almancil",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Sand City",
    "type": "Family attraction",
    "distance": "~4.6 km",
    "description": "Published AlgarveOfficial family-attraction listing near Praia do Carvalho by stored listing coordinates.",
    "href": "/listing/sand-city-quarteira",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Gramacho Golf Course",
    "type": "Golf",
    "distance": "~6.4 km",
    "description": "Published AlgarveOfficial golf listing near Carvoeiro/Lagoa by stored listing coordinates.",
    "href": "/listing/gramacho-golf-course",
    "verification_status": "Published internal listing"
  },
  {
    "name": "Slide & Splash",
    "type": "Family attraction",
    "distance": "~6.9 km",
    "description": "Published AlgarveOfficial family-attraction listing in Lagoa by stored listing coordinates.",
    "href": "/listing/slide-and-splash-lagoa",
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
  where slug = 'praia-do-carvalho-lagoa'
    and status = 'published';

  if v_listing_id is null then
    raise notice 'Published listing praia-do-carvalho-lagoa not found; skipping update.';
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
        'source_url', 'https://algarveofficial.com/listing/praia-do-carvalho-lagoa',
        'checked_at', '2026-05-18',
        'facts_verified', jsonb_build_array(
          'Nearby restaurant, experience and attraction cards link only to internally published AlgarveOfficial listing slugs checked on 18 May 2026',
          'Approximate nearby distances calculated from internal listing coordinates for Praia do Carvalho and the linked listings',
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
        'Are there restaurants near Praia do Carvalho?',
        'What attractions are near Praia do Carvalho?',
        'What attractions or experiences are near Praia do Carvalho?'
      )
      union all
      select jsonb_build_object(
        'question', 'Are there restaurants near Praia do Carvalho?',
        'answer', 'Yes. AlgarveOfficial has internally published nearby restaurant and beach-club listings including Benagil Beach Club, Bon Bon, Mar d''Fora - Restaurante Carvoeiro, Aladin Grill, Atlântico and Ocean Restaurant. Distances are approximate and calculated from stored listing coordinates.'
      )
      union all
      select jsonb_build_object(
        'question', 'What attractions or experiences are near Praia do Carvalho?',
        'answer', 'Nearby internally published AlgarveOfficial listings include Blue Xperiences SUP Benagil Caves, Jump2adventure - Kayak&sup - Benagil, Algarviews, Sand City, Gramacho Golf Course and Slide & Splash. Any cave or sea activity should follow current Maritime Authority rules.'
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
