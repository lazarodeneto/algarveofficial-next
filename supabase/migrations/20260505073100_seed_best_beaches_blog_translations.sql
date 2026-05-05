WITH target_post AS (
  SELECT id
  FROM public.blog_posts
  WHERE slug = 'best-beaches-in-the-algarve'
  LIMIT 1
),
translations(locale, title, excerpt, content, seo_title, seo_description) AS (
  VALUES
    (
      'pt-pt',
      'As Melhores Praias do Algarve',
      'O Algarve alberga algumas das praias mais espetaculares da Europa, conhecidas pelas falésias douradas, águas turquesa, grutas escondidas e extensos areais perfeitos para relaxar ou explorar.',
      $pt$
        <p>O Algarve alberga algumas das praias mais espetaculares da Europa, conhecidas pelas falésias douradas, águas turquesa, grutas escondidas e extensos areais perfeitos para relaxar ou explorar. Da costa icónica de Lagoa às famosas praias de Lagos, dos areais amplos de Albufeira às ilhas-barreira protegidas perto de Tavira, a região oferece uma experiência de praia para todos os tipos de viajante.</p><p>Quer procure vistas de postal, praias ideais para famílias, enseadas escondidas ou locais de surf na costa oeste mais selvagem, este guia das melhores praias do Algarve ajuda-o a planear com confiança. Para mais recomendações locais, explore os nossos guias dedicados às praias de Lagoa, praias de Lagos, praias de Albufeira, praias de Tavira e praias de Portimão.</p>
      $pt$,
      'As Melhores Praias do Algarve',
      'Guia das melhores praias do Algarve, das falésias de Lagoa e Lagos às ilhas-barreira protegidas perto de Tavira.'
    ),
    (
      'fr',
      'Les Plus Belles Plages de l’Algarve',
      'L’Algarve abrite certaines des plages les plus spectaculaires d’Europe, réputées pour leurs falaises dorées, leurs eaux turquoise, leurs grottes cachées et leurs longues étendues de sable idéales pour se détendre ou explorer.',
      $fr$
        <p>L’Algarve abrite certaines des plages les plus spectaculaires d’Europe, réputées pour leurs falaises dorées, leurs eaux turquoise, leurs grottes cachées et leurs longues étendues de sable idéales pour se détendre ou explorer. De la côte emblématique de Lagoa aux célèbres rivages de Lagos, des vastes plages d’Albufeira aux îles-barrières protégées près de Tavira, la région offre une expérience balnéaire adaptée à chaque type de voyageur.</p><p>Que vous recherchiez des panoramas de carte postale, des plages familiales, des criques secrètes ou des spots de surf sur la côte ouest plus sauvage, ce guide des plus belles plages de l’Algarve vous aidera à planifier avec confiance. Pour davantage de recommandations locales, explorez nos guides dédiés aux plages de Lagoa, aux plages de Lagos, aux plages d’Albufeira, aux plages de Tavira et aux plages de Portimão.</p>
      $fr$,
      'Les Plus Belles Plages de l’Algarve',
      'Guide des plus belles plages de l’Algarve, des falaises de Lagoa et Lagos aux îles-barrières protégées près de Tavira.'
    ),
    (
      'de',
      'Die schönsten Strände der Algarve',
      'Die Algarve beherbergt einige der spektakulärsten Strände Europas, bekannt für goldene Felsklippen, türkisfarbenes Wasser, versteckte Grotten und lange Sandstrände, die ideal zum Entspannen oder Erkunden sind.',
      $de$
        <p>Die Algarve beherbergt einige der spektakulärsten Strände Europas, bekannt für dramatische goldene Felsklippen, türkisfarbenes Wasser, versteckte Grotten und lange Sandstrände, die ideal zum Entspannen oder Erkunden sind. Von der ikonischen Küste von Lagoa über die berühmten Strände von Lagos und die weiten Sandflächen von Albufeira bis zu den geschützten Barriereinseln bei Tavira bietet die Region ein Stranderlebnis für jeden Reisetyp.</p><p>Ob Sie Postkartenblicke, familienfreundliche Strände, versteckte Buchten oder Surfspots an der wilden Westküste suchen, dieser Guide zu den schönsten Stränden der Algarve hilft Ihnen, sicher zu planen. Für weitere lokale Empfehlungen entdecken Sie unsere eigenen Strandführer zu den Stränden von Lagoa, Lagos, Albufeira, Tavira und Portimão.</p>
      $de$,
      'Die schönsten Strände der Algarve',
      'Guide zu den schönsten Stränden der Algarve, von Lagoa und Lagos bis zu den geschützten Barriereinseln bei Tavira.'
    ),
    (
      'es',
      'Las Mejores Playas del Algarve',
      'El Algarve alberga algunas de las playas más espectaculares de Europa, conocidas por sus acantilados dorados, aguas turquesas, cuevas escondidas y largas extensiones de arena perfectas para relajarse o explorar.',
      $es$
        <p>El Algarve alberga algunas de las playas más espectaculares de Europa, conocidas por sus dramáticos acantilados dorados, aguas turquesas, cuevas escondidas y largas extensiones de arena perfectas para relajarse o explorar. Desde la costa icónica de Lagoa hasta las famosas playas de Lagos, los amplios arenales de Albufeira y las islas barrera protegidas cerca de Tavira, la región ofrece una experiencia de playa para cada tipo de viajero.</p><p>Tanto si buscas vistas de postal, playas familiares, calas escondidas o zonas de surf en la salvaje costa oeste, esta guía de las mejores playas del Algarve te ayudará a planificar con confianza. Para más recomendaciones locales, explora nuestras guías dedicadas a las playas de Lagoa, las playas de Lagos, las playas de Albufeira, las playas de Tavira y las playas de Portimão.</p>
      $es$,
      'Las Mejores Playas del Algarve',
      'Guía de las mejores playas del Algarve, desde los acantilados de Lagoa y Lagos hasta las islas barrera protegidas cerca de Tavira.'
    ),
    (
      'it',
      'Le Migliori Spiagge dell’Algarve',
      'L’Algarve ospita alcune delle spiagge più spettacolari d’Europa, note per le scogliere dorate, le acque turchesi, le grotte nascoste e le lunghe distese di sabbia perfette per rilassarsi o esplorare.',
      $it$
        <p>L’Algarve ospita alcune delle spiagge più spettacolari d’Europa, note per le scenografiche scogliere dorate, le acque turchesi, le grotte nascoste e le lunghe distese di sabbia perfette per rilassarsi o esplorare. Dalla costa iconica di Lagoa alle famose spiagge di Lagos, dagli ampi arenili di Albufeira alle isole barriera protette vicino a Tavira, la regione offre un’esperienza balneare per ogni tipo di viaggiatore.</p><p>Che tu stia cercando panorami da cartolina, spiagge adatte alle famiglie, calette nascoste o spot per il surf sulla selvaggia costa occidentale, questa guida alle migliori spiagge dell’Algarve ti aiuterà a pianificare con sicurezza. Per altri consigli locali, esplora le nostre guide dedicate alle spiagge di Lagoa, alle spiagge di Lagos, alle spiagge di Albufeira, alle spiagge di Tavira e alle spiagge di Portimão.</p>
      $it$,
      'Le Migliori Spiagge dell’Algarve',
      'Guida alle migliori spiagge dell’Algarve, dalle scogliere di Lagoa e Lagos alle isole barriera protette vicino a Tavira.'
    ),
    (
      'nl',
      'De Beste Stranden van de Algarve',
      'De Algarve heeft enkele van de meest spectaculaire stranden van Europa, bekend om gouden kliffen, turquoise water, verborgen grotten en lange zandstranden die perfect zijn om te ontspannen of te verkennen.',
      $nl$
        <p>De Algarve heeft enkele van de meest spectaculaire stranden van Europa, bekend om dramatische gouden kliffen, turquoise water, verborgen grotten en lange zandstranden die perfect zijn om te ontspannen of te verkennen. Van de iconische kustlijn van Lagoa tot de beroemde stranden van Lagos, de brede zandvlaktes van Albufeira en de beschermde barrière-eilanden bij Tavira: de regio biedt een strandervaring voor ieder type reiziger.</p><p>Of je nu zoekt naar uitzichten als op een ansichtkaart, gezinsvriendelijke stranden, verborgen baaien of surfspots aan de ruige westkust, deze gids voor de beste stranden van de Algarve helpt je met vertrouwen plannen. Voor meer lokale aanbevelingen kun je onze speciale strandgidsen voor de stranden van Lagoa, Lagos, Albufeira, Tavira en Portimão bekijken.</p>
      $nl$,
      'De Beste Stranden van de Algarve',
      'Gids voor de beste stranden van de Algarve, van Lagoa en Lagos tot de beschermde barrière-eilanden bij Tavira.'
    ),
    (
      'sv',
      'Algarves Bästa Stränder',
      'Algarve har några av Europas mest spektakulära stränder, kända för gyllene klippor, turkost vatten, dolda grottor och långa sandstränder som passar perfekt för avkoppling eller upptäcktsfärder.',
      $sv$
        <p>Algarve har några av Europas mest spektakulära stränder, kända för dramatiska gyllene klippor, turkost vatten, dolda grottor och långa sandstränder som passar perfekt för avkoppling eller upptäcktsfärder. Från Lagoas ikoniska kustlinje till Lagos välkända stränder, Albufeiras vidsträckta sanddyner och de skyddade barriäröarna nära Tavira erbjuder regionen en strandupplevelse för alla typer av resenärer.</p><p>Oavsett om du söker vykortsvyer, familjevänliga stränder, dolda vikar eller surfplatser på den vilda västkusten hjälper den här guiden till Algarves bästa stränder dig att planera tryggt. För fler lokala rekommendationer kan du utforska våra särskilda strandguider för Lagoas stränder, Lagos stränder, Albufeiras stränder, Taviras stränder och Portimãos stränder.</p>
      $sv$,
      'Algarves Bästa Stränder',
      'Guide till Algarves bästa stränder, från Lagoa och Lagos till skyddade barriäröar nära Tavira.'
    ),
    (
      'no',
      'Algarves Beste Strender',
      'Algarve har noen av Europas mest spektakulære strender, kjent for gylne klipper, turkist vann, skjulte grotter og lange sandstrender som passer perfekt for avslapning eller utforsking.',
      $no$
        <p>Algarve har noen av Europas mest spektakulære strender, kjent for dramatiske gylne klipper, turkist vann, skjulte grotter og lange sandstrender som passer perfekt for avslapning eller utforsking. Fra den ikoniske kystlinjen i Lagoa til de berømte strendene i Lagos, de brede sandflatene i Albufeira og de beskyttede barriereøyene nær Tavira, byr regionen på en strandopplevelse for alle typer reisende.</p><p>Enten du ser etter postkortutsikt, familievennlige strender, skjulte viker eller surfesteder på den ville vestkysten, hjelper denne guiden til Algarves beste strender deg med å planlegge trygt. For flere lokale anbefalinger kan du utforske våre egne strandguider for strendene i Lagoa, Lagos, Albufeira, Tavira og Portimão.</p>
      $no$,
      'Algarves Beste Strender',
      'Guide til Algarves beste strender, fra Lagoa og Lagos til beskyttede barriereøyer nær Tavira.'
    ),
    (
      'da',
      'Algarves Bedste Strande',
      'Algarve har nogle af Europas mest spektakulære strande, kendt for gyldne klipper, turkisblåt vand, skjulte grotter og lange sandstrande, der er perfekte til afslapning eller udforskning.',
      $da$
        <p>Algarve har nogle af Europas mest spektakulære strande, kendt for dramatiske gyldne klipper, turkisblåt vand, skjulte grotter og lange sandstrande, der er perfekte til afslapning eller udforskning. Fra Lagoas ikoniske kystlinje til Lagos’ berømte strande, Albufeiras brede sandstrækninger og de beskyttede barriereøer nær Tavira tilbyder regionen en strandoplevelse for enhver type rejsende.</p><p>Uanset om du leder efter postkortudsigter, familievenlige strande, skjulte vige eller surfsteder på den vilde vestkyst, hjælper denne guide til Algarves bedste strande dig med at planlægge trygt. For flere lokale anbefalinger kan du udforske vores dedikerede strandguider til strandene i Lagoa, Lagos, Albufeira, Tavira og Portimão.</p>
      $da$,
      'Algarves Bedste Strande',
      'Guide til Algarves bedste strande, fra Lagoa og Lagos til beskyttede barriereøer nær Tavira.'
    )
)
INSERT INTO public.blog_post_translations (
  post_id,
  locale,
  title,
  excerpt,
  content,
  seo_title,
  seo_description,
  status,
  translated_at,
  updated_at
)
SELECT
  target_post.id,
  translations.locale,
  translations.title,
  translations.excerpt,
  btrim(translations.content),
  translations.seo_title,
  translations.seo_description,
  'reviewed',
  now(),
  now()
FROM target_post
CROSS JOIN translations
ON CONFLICT (post_id, locale)
DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  status = 'reviewed',
  translated_at = now(),
  updated_at = now();
