WITH seed_author AS (
  SELECT COALESCE(
    (
      SELECT user_id
      FROM public.user_roles
      WHERE role IN ('admin', 'editor')
      ORDER BY CASE role WHEN 'admin' THEN 0 ELSE 1 END, user_id
      LIMIT 1
    ),
    (
      SELECT id
      FROM public.public_profiles
      LIMIT 1
    ),
    '00000000-0000-0000-0000-000000000001'::uuid
  ) AS author_id
),
article AS (
  SELECT
    'Golf in the Algarve: Best Areas, Courses and Where to Stay'::text AS title,
    'golf-in-the-algarve-best-courses-areas-where-to-stay'::text AS slug,
    'Discover the best golf areas in the Algarve, Portugal, from Vilamoura and Quinta do Lago to Vale do Lobo, Palmares, Penina and Monte Rei.'::text AS excerpt,
    $article$
      <h2>Golf in the Algarve: Best Areas, Courses and Where to Stay</h2>

      <h2>The Algarve is one of Europe’s strongest golf destinations</h2>
      <p>Golf is one of the Algarve’s most valuable travel markets. The region combines year-round playability, coastal scenery, premium resorts, international flight access, and a dense concentration of courses across a relatively compact area.</p>
      <p>VisitPortugal describes the Algarve as a golf destination with a favourable climate for year-round play and 33 courses with 18 or 27 holes, many located in scenic natural settings. Visit Algarve also notes that much of the region’s golf is clustered less than 30 minutes from Faro Airport, especially around Quinta do Lago and Vilamoura Marina.</p>
      <p>Portugal was also named World’s Best Golf Destination 2025 at the World Golf Awards, with Turismo de Portugal stating that the country was again recognised as the world’s best and Europe’s best golf destination.</p>
      <p>For AlgarveOfficial, this makes golf a strategic content category: golf visitors often stay longer, spend more on accommodation and dining, book transfers, use concierge services, explore real estate, and return outside the peak beach season.</p>

      <h2>Quick guide: best Algarve golf areas</h2>
      <table>
        <thead>
          <tr><th>Golf area</th><th>Best for</th></tr>
        </thead>
        <tbody>
          <tr><td>Vilamoura</td><td>First-time golf holidays, marina lifestyle, groups, easy course access</td></tr>
          <tr><td>Quinta do Lago</td><td>Premium resorts, championship golf, luxury villas, refined stays</td></tr>
          <tr><td>Vale do Lobo</td><td>Ocean-view golf, resort lifestyle, families, premium leisure</td></tr>
          <tr><td>Carvoeiro / Lagoa</td><td>Scenic central base, couples, families, coastal exploring between rounds</td></tr>
          <tr><td>Portimão / Alvor</td><td>Historic golf, western Algarve access, value and beach stays</td></tr>
          <tr><td>Lagos / Palmares</td><td>Ocean views, boutique golf trips, scenery, couples</td></tr>
          <tr><td>Eastern Algarve / Monte Rei</td><td>High-end golf escapes, quiet luxury, serious golfers</td></tr>
          <tr><td>Loulé countryside</td><td>Inland resort feel, nature, privacy, slower premium travel</td></tr>
        </tbody>
      </table>

      <h2>1. Vilamoura — best all-round golf base</h2>
      <p><strong>Best for:</strong> first-time golf visitors, groups, marina restaurants, easy logistics<br><strong>Nearby:</strong> Vilamoura Marina, Quarteira, Praia da Falésia, Loulé, Quinta do Lago<br><strong>Golf style:</strong> organised, resort-based, convenient</p>
      <p>Vilamoura is probably the Algarve’s most practical golf base. It offers a strong combination of accommodation, restaurants, marina atmosphere, nightlife, beaches and multiple nearby courses. For golfers who want to play several rounds without constantly changing hotels, Vilamoura is one of the safest choices.</p>
      <p>The area is especially useful for groups because it is easy to organise tee times, transfers, restaurants and non-golf activities around one central base. It is polished rather than traditional, but that is exactly why it works: everything is designed around leisure.</p>
      <p>The Old Course Vilamoura has also received strong recent recognition. Vilamoura Golf states that The Old Course Vilamoura was awarded Portugal’s Best Golf Course 2025 at the World Golf Awards. Vilamoura Golf also presents courses such as Millennium as playable and suitable for different skill levels, with lush fairways, tree-lined holes and maintained greens.</p>
      <p><strong>Why stay here:</strong> Vilamoura is the easiest Algarve golf base for visitors who want convenience, nightlife, restaurants, beach access and several courses nearby.</p>

      <h2>2. Quinta do Lago — best for premium golf and resort living</h2>
      <p><strong>Best for:</strong> premium golf holidays, luxury villas, families, refined resort stays<br><strong>Nearby:</strong> Ria Formosa, Ancão, Garrão, Vale do Lobo, Almancil, Faro Airport<br><strong>Golf style:</strong> championship golf, immaculate resort environment, high-end service</p>
      <p>Quinta do Lago is one of the Algarve’s strongest premium golf destinations. It sits close to the Ria Formosa and combines golf, villas, restaurants, wellness, beach access and an established international community.</p>
      <p>Quinta do Lago’s official golf page promotes the resort as offering world-class golf in the Algarve, with its South Course presented through scenic fairways overlooking lakes and the Algarve coastline. The South Course has a particularly strong tournament identity: Quinta do Lago states that it has hosted the Portuguese Open eight times.</p>
      <p>This area works very well for golfers travelling with non-golfers. The setting is calmer than Vilamoura, more residential, and close to beaches, restaurants, nature walks and premium leisure facilities.</p>
      <p><strong>Why stay here:</strong> Quinta do Lago is ideal for golfers who want a polished, high-quality resort base with premium accommodation and strong non-golf appeal.</p>

      <h2>3. Vale do Lobo — best for resort golf and ocean-view lifestyle</h2>
      <p><strong>Best for:</strong> couples, families, premium resort stays, beach-and-golf holidays<br><strong>Nearby:</strong> Quinta do Lago, Garrão, Ancão, Almancil, Vilamoura<br><strong>Golf style:</strong> resort golf with coastal lifestyle appeal</p>
      <p>Vale do Lobo is another major part of the Algarve’s premium golf belt. It is especially attractive for travellers who want golf, beach restaurants, villas, resort facilities and a calmer environment than the busiest central towns.</p>
      <p>For many visitors, Vale do Lobo works best as part of the wider Golden Triangle travel zone: Quinta do Lago, Vale do Lobo, Almancil and Vilamoura. This is one of the Algarve’s strongest areas for premium accommodation, golf, restaurants, private transfers and property interest.</p>
      <p>It is not the best choice for budget travellers or visitors who want a historic town centre outside their door. It is better suited to travellers who value comfort, privacy, beach access and resort infrastructure.</p>
      <p><strong>Why stay here:</strong> Vale do Lobo is a strong choice for a premium golf-and-beach holiday with a residential resort feel.</p>

      <h2>4. Carvoeiro and Lagoa — best central base for golf plus cliffs</h2>
      <p><strong>Best for:</strong> couples, families, villa stays, scenic coastal exploration<br><strong>Nearby:</strong> Praia da Marinha, Benagil, Algar Seco, Ferragudo, Silves<br><strong>Golf style:</strong> relaxed central Algarve golf with excellent sightseeing nearby</p>
      <p>Carvoeiro and Lagoa are not as golf-branded as Vilamoura or Quinta do Lago, but they are very useful for visitors who want to combine golf with the Algarve’s most famous cliff scenery. This area places golfers close to beaches, coastal walks, restaurants, family attractions and several central Algarve courses.</p>
      <p>This is a strong base for mixed trips: one person plays golf, others visit beaches, caves, towns or restaurants. It also works well for villa holidays, because the region feels more relaxed than the largest resort hubs while still being central.</p>
      <p>Carvoeiro is particularly good for travellers who want a scenic base rather than a pure golf resort. It is close to the Seven Hanging Valleys Trail, Praia da Marinha, Benagil and Ferragudo, making it one of the Algarve’s best areas for golf plus sightseeing.</p>
      <p><strong>Why stay here:</strong> choose Carvoeiro or Lagoa if you want a balanced Algarve trip: golf, beaches, restaurants, cliffs and easy central access.</p>

      <h2>5. Portimão and Alvor — best for historic golf and western access</h2>
      <p><strong>Best for:</strong> golf history, beach stays, value, western Algarve exploring<br><strong>Nearby:</strong> Praia da Rocha, Alvor, Lagos, Ferragudo, Monchique<br><strong>Golf style:</strong> classic Algarve golf, resort access, practical location</p>
      <p>Portimão and Alvor are strong bases for golfers who want western Algarve access without staying as far west as Lagos or Sagres. The area offers beaches, restaurants, city services, resorts and road access to several golf courses.</p>
      <p>The most historically important name here is Penina. Penina Hotel & Golf Resort describes itself as the spiritual home of golf in the Algarve and states that it includes the Algarve’s first 18-hole championship course, designed by Sir Henry Cotton. Its Sir Henry Cotton Championship Course page also states that the course has hosted the Portuguese Open on ten occasions.</p>
      <p>This gives Portimão and Alvor strong relevance for golfers who appreciate the history of the game in the region, not just modern resort golf.</p>
      <p><strong>Why stay here:</strong> Portimão and Alvor are practical choices for golfers who want beaches, good access, and a connection to the Algarve’s golf heritage.</p>

      <h2>6. Lagos and Palmares — best for ocean views and boutique golf trips</h2>
      <p><strong>Best for:</strong> couples, scenic golf, western Algarve visitors, premium boutique stays<br><strong>Nearby:</strong> Lagos, Alvor, Meia Praia, Ponta da Piedade<br><strong>Golf style:</strong> ocean views, varied loops, elegant setting</p>
      <p>Lagos is already one of the Algarve’s strongest visitor bases, but it also works well for golf, especially because of Palmares. Palmares describes its course as a 27-hole golf destination designed by Robert Trent Jones Jr., set above the ocean with views over the Alvor Estuary and Lagos Bay.</p>
      <p>Palmares also presents its golf experience through three 9-hole loops — Alvor, Lagos and Praia — blending parkland and links-style elements. This makes it one of the Algarve’s most scenic options for golfers who want sea views and variety rather than only traditional resort layouts.</p>
      <p>Lagos itself adds restaurants, nightlife, beaches, boat trips, cliff walks and cultural atmosphere. For couples or smaller groups, this can feel more memorable than a purely golf-focused base.</p>
      <p><strong>Why stay here:</strong> Lagos and Palmares are ideal for golfers who want ocean scenery, a beautiful town base and a more boutique western Algarve experience.</p>

      <h2>7. Monte Rei and the Eastern Algarve — best for quiet luxury and serious golf</h2>
      <p><strong>Best for:</strong> high-end golf escapes, serious players, privacy, quiet resort stays<br><strong>Nearby:</strong> Vila Nova de Cacela, Tavira, Castro Marim, Spanish border<br><strong>Golf style:</strong> exclusive, strategic, destination-course experience</p>
      <p>Monte Rei is one of the Algarve’s most prestigious golf names. The resort describes itself as an exclusive Eastern Algarve golf and country club, set in 1,000 acres of countryside and overlooking an award-winning Jack Nicklaus Signature golf course.</p>
      <p>Monte Rei’s golf page states that the North Course is a Jack Nicklaus Signature course and that the resort is planning a future South Course as a second Jack Nicklaus Signature Course.</p>
      <p>The eastern Algarve is quieter than the central resort belt. That is part of the appeal. Monte Rei is not the best base for visitors who want nightlife or to walk to multiple restaurants every evening. It is better for golfers who want a serious, high-quality golf trip with privacy and calm.</p>
      <p><strong>Why stay here:</strong> Monte Rei is one of the Algarve’s strongest choices for a dedicated premium golf escape.</p>

      <h2>Algarve golf courses worth knowing</h2>
      <p>This is not a full ranking, but these courses are important reference points for golf visitors.</p>
      <table>
        <thead>
          <tr><th>Course / Area</th><th>Why it matters</th></tr>
        </thead>
        <tbody>
          <tr><td>The Old Course Vilamoura</td><td>One of the Algarve’s classic golf names and awarded Portugal’s Best Golf Course 2025 by the World Golf Awards, according to Vilamoura Golf.</td></tr>
          <tr><td>Quinta do Lago South</td><td>Championship identity and Portuguese Open history, with Quinta do Lago stating it hosted the event eight times.</td></tr>
          <tr><td>Monte Rei North Course</td><td>Jack Nicklaus Signature course in the Eastern Algarve, positioned by the resort as one of Portugal’s leading courses.</td></tr>
          <tr><td>Palmares</td><td>27-hole course designed by Robert Trent Jones Jr., with views over Lagos Bay and the Alvor Estuary.</td></tr>
          <tr><td>Penina Sir Henry Cotton Championship Course</td><td>The Algarve’s first 18-hole championship course and a major part of the region’s golf history.</td></tr>
          <tr><td>Millennium Vilamoura</td><td>A playable Vilamoura option promoted as suitable for different skill levels.</td></tr>
        </tbody>
      </table>

      <h2>Best time of year to play golf in the Algarve</h2>
      <p>The Algarve can be played year-round, but the best golf months are usually March to June and September to November. These periods tend to offer comfortable temperatures, good light, and strong course conditions without the peak summer heat.</p>
      <p>Winter can be excellent for visitors from colder countries, especially because the Algarve remains one of Europe’s most accessible winter golf destinations. VisitPortugal specifically highlights the region’s favourable climate for year-round golf.</p>
      <p>July and August are less ideal for serious golf because of heat, stronger tourism pressure, and higher family-holiday demand. Golf is still possible, but early tee times are much better.</p>

      <h2>Where to stay for an Algarve golf holiday</h2>
      <h3>For a first golf trip</h3>
      <p>Stay in Vilamoura. It is easy, central, organised and close to several courses.</p>
      <h3>For a premium resort trip</h3>
      <p>Choose Quinta do Lago or Vale do Lobo. These areas suit travellers who want golf, villas, restaurants, wellness and beach access.</p>
      <h3>For a scenic couples’ golf trip</h3>
      <p>Choose Lagos or Palmares. This gives you golf plus old-town atmosphere, beaches and coastal views.</p>
      <h3>For a serious destination-course escape</h3>
      <p>Choose Monte Rei or the Eastern Algarve. This is best for golfers who want privacy and a course-focused stay.</p>
      <h3>For golf plus family holiday</h3>
      <p>Choose Carvoeiro, Vilamoura, Quinta do Lago or Alvor. These areas work well for non-golfers because beaches, restaurants and attractions are nearby.</p>

      <h2>Golf and non-golf activities: why the Algarve works well for mixed groups</h2>
      <p>One of the Algarve’s biggest advantages is that golf visitors do not need to travel only with golfers. Non-golfers can enjoy beaches, boat trips, old towns, spas, shopping, restaurants, nature reserves and coastal walks while golfers play.</p>
      <p>Good combinations include:</p>
      <table>
        <thead>
          <tr><th>Golf base</th><th>Non-golf activities nearby</th></tr>
        </thead>
        <tbody>
          <tr><td>Vilamoura</td><td>Marina, beach, boat trips, restaurants, Loulé Market</td></tr>
          <tr><td>Quinta do Lago</td><td>Ria Formosa, beach restaurants, wellness, nature walks</td></tr>
          <tr><td>Carvoeiro</td><td>Benagil, Praia da Marinha, Algar Seco, Ferragudo</td></tr>
          <tr><td>Lagos</td><td>Ponta da Piedade, old town, boat trips, beaches</td></tr>
          <tr><td>Tavira / Eastern Algarve</td><td>Ria Formosa islands, Tavira old town, Praia do Barril</td></tr>
          <tr><td>Portimão / Alvor</td><td>Praia da Rocha, Alvor boardwalk, Ferragudo, Monchique</td></tr>
        </tbody>
      </table>
      <p>This mixed-trip appeal is commercially important. Golfers often need restaurants, transfers, hotels, villa rentals, spa services, beach clubs, car hire, concierge support and sometimes property advice.</p>

      <h2>Practical tips for planning a golf trip in the Algarve</h2>
      <p>Book tee times early for spring and autumn, especially in Vilamoura, Quinta do Lago and the premium resort courses. These are the strongest golf travel windows and can fill quickly.</p>
      <p>Stay close to the courses you most want to play. The Algarve is not huge, but transfers between the Eastern Algarve, Vilamoura, Carvoeiro and Lagos can add time, especially during busier periods.</p>
      <p>For groups, plan dinners and transfers in advance. Vilamoura is easiest for nightlife and marina dining, while Quinta do Lago and Vale do Lobo are better for refined resort evenings.</p>
      <p>For summer golf, choose early morning tee times and avoid the strongest heat. For winter golf, bring layers because mornings and evenings can feel cool even when afternoons are mild.</p>
      <p>Golfers interested in real estate should consider combining course visits with area research. Quinta do Lago, Vale do Lobo, Vilamoura, Carvoeiro, Lagos and parts of the Eastern Algarve all attract buyers who want lifestyle, rental potential and repeat travel access.</p>

      <h2>Suggested Algarve golf itineraries</h2>
      <h3>3-day first-time golf break</h3>
      <ul>
        <li><strong>Day 1:</strong> Arrive in Faro, stay in Vilamoura, marina dinner.</li>
        <li><strong>Day 2:</strong> Play Vilamoura golf, afternoon at Praia da Falésia.</li>
        <li><strong>Day 3:</strong> Play Quinta do Lago or Vale do Lobo, dinner in Quinta, Vale do Lobo or Vilamoura.</li>
      </ul>
      <h3>5-day premium golf escape</h3>
      <ul>
        <li><strong>Day 1:</strong> Arrive and stay in Quinta do Lago.</li>
        <li><strong>Day 2:</strong> Play Quinta do Lago South.</li>
        <li><strong>Day 3:</strong> Rest day: Ria Formosa, beach lunch, spa or Loulé.</li>
        <li><strong>Day 4:</strong> Play Vale do Lobo or Vilamoura.</li>
        <li><strong>Day 5:</strong> Final round, private transfer to Faro Airport.</li>
      </ul>
      <h3>7-day Algarve golf and discovery trip</h3>
      <ul>
        <li><strong>Day 1:</strong> Arrive in Vilamoura.</li>
        <li><strong>Day 2:</strong> Play Vilamoura.</li>
        <li><strong>Day 3:</strong> Play Quinta do Lago, visit Loulé.</li>
        <li><strong>Day 4:</strong> Move to Carvoeiro or Lagos, visit Praia da Marinha or Ponta da Piedade.</li>
        <li><strong>Day 5:</strong> Play Palmares or Penina.</li>
        <li><strong>Day 6:</strong> Explore Sagres, Tavira or Ria Formosa.</li>
        <li><strong>Day 7:</strong> Final round or relaxed beach day before departure.</li>
      </ul>

      <h2>Final recommendation</h2>
      <p>For the easiest Algarve golf holiday, choose Vilamoura. For premium resort golf, choose Quinta do Lago or Vale do Lobo. For coastal scenery and a more memorable town base, choose Lagos and Palmares. For golf history, include Penina. For a serious high-end golf escape, look to Monte Rei in the Eastern Algarve.</p>
      <p>The Algarve’s strength is not one single course. It is the complete golf ecosystem: airport access, year-round playability, premium resorts, scenic landscapes, beaches, restaurants, villas, transfers, and enough variety to suit both serious golfers and mixed groups. That is why golf remains one of the most important pillars of Algarve tourism — and one of the most commercially valuable themes for AlgarveOfficial.</p>
    $article$::text AS content,
    '/images/region-vilamoura-800w-Ck2-Nx2h.webp'::text AS featured_image,
    'golf'::public.blog_category AS category,
    ARRAY[
      'golf in the Algarve',
      'Algarve golf courses',
      'Vilamoura golf',
      'Quinta do Lago golf',
      'Monte Rei',
      'Palmares Golf',
      'Penina',
      'Portugal golf holidays'
    ]::text[] AS tags,
    15::integer AS reading_time,
    '2026-05-14T07:30:00Z'::timestamptz AS published_at,
    'Golf in the Algarve: Best Courses, Areas and Where to Stay'::text AS seo_title,
    'Discover the best golf areas in the Algarve, Portugal — from Vilamoura and Quinta do Lago to Vale do Lobo, Palmares, Penina and Monte Rei.'::text AS seo_description,
    'golf in the Algarve, Algarve golf courses, Vilamoura golf, Quinta do Lago golf, Monte Rei, Palmares Golf, Penina, Portugal golf holidays'::text AS focus_keywords,
    ARRAY[
      'dom-pedro-golf-vilamoura',
      'vilamoura-old-course',
      'vilamoura-millennium',
      'quinta-do-lago-golf',
      'quinta-do-lago-south-course',
      'vale-do-lobo-golf',
      'palmares-golf',
      'penina-championship',
      'monte-rei-north-course',
      'praia-da-falesia-albufeira',
      'praia-do-ancao-loule',
      'praia-do-garrao-loule',
      'praia-de-vale-do-lobo-loule',
      'praia-da-marinha-lagoa',
      'praia-da-rocha-portimao',
      'meia-praia-lagos',
      'praia-do-barril-tavira'
    ]::text[] AS related_slugs
),
related_listings AS (
  SELECT COALESCE(
    array_agg(l.id ORDER BY array_position(a.related_slugs, l.slug)),
    '{}'::uuid[]
  ) AS related_listing_ids
  FROM article a
  JOIN public.listings l
    ON l.slug = ANY(a.related_slugs)
   AND l.status = 'published'
)
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  author_id,
  category,
  tags,
  reading_time,
  related_listing_ids,
  status,
  published_at,
  seo_title,
  seo_description,
  focus_keywords
)
SELECT
  a.title,
  a.slug,
  a.excerpt,
  a.content,
  a.featured_image,
  sa.author_id,
  a.category,
  a.tags,
  a.reading_time,
  rl.related_listing_ids,
  'published'::public.blog_status,
  a.published_at,
  a.seo_title,
  a.seo_description,
  a.focus_keywords
FROM article a
CROSS JOIN seed_author sa
CROSS JOIN related_listings rl
ON CONFLICT (slug) DO UPDATE
SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  featured_image = EXCLUDED.featured_image,
  category = EXCLUDED.category,
  tags = EXCLUDED.tags,
  reading_time = EXCLUDED.reading_time,
  related_listing_ids = EXCLUDED.related_listing_ids,
  status = EXCLUDED.status,
  published_at = EXCLUDED.published_at,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  focus_keywords = EXCLUDED.focus_keywords,
  updated_at = now();
