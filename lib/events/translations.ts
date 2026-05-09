import type { Locale } from "@/lib/i18n/config";

export type EventTranslation = {
  title?: string;
  short_description?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  venue?: string;
};

type EventTranslationMap = Partial<Record<Locale, EventTranslation>>;

export const EVENT_TRANSLATIONS: Record<string, EventTranslationMap> = {
  "the-6-hours-of-portimo": {
    "pt-pt": {
      title: "As 6 Horas de Portimão",
      short_description: "As 6 Horas de Portimão chegam ao Autódromo Internacional do Algarve nos dias 7 e 8 de fevereiro de 2026.",
      description: `As 6 Horas de Portimão chegam ao Autódromo Internacional do Algarve nos dias 7 e 8 de fevereiro de 2026, reunindo GTs e protótipos elegíveis numa intensa corrida de resistência marcada por estratégia, consistência e ritmo elevado.

É uma oportunidade única para ver algumas das máquinas mais competitivas em ação durante o inverno.`,
    },
    fr: {
      title: "Les 6 Heures de Portimão",
      short_description: "Les 6 Heures de Portimão arrivent sur l'Autódromo Internacional do Algarve les 7 et 8 février 2026.",
      description: `Les 6 Heures de Portimão arrivent sur l'Autódromo Internacional do Algarve les 7 et 8 février 2026, réunissant des GT et prototypes éligibles pour une course d'endurance intense, rythmée par la stratégie, la régularité et une cadence élevée.

C'est une occasion unique de voir certaines des machines les plus compétitives en action pendant l'hiver.`,
    },
    de: {
      title: "Die 6 Stunden von Portimão",
      short_description: "Die 6 Stunden von Portimão kommen am 7. und 8. Februar 2026 auf den Autódromo Internacional do Algarve.",
      description: `Die 6 Stunden von Portimão kommen am 7. und 8. Februar 2026 auf den Autódromo Internacional do Algarve und bringen zugelassene GT-Fahrzeuge und Prototypen zu einem intensiven Langstreckenrennen zusammen, das von Strategie, Konstanz und hohem Tempo geprägt ist.

Eine besondere Gelegenheit, einige der wettbewerbsstärksten Maschinen im Winter in Aktion zu erleben.`,
    },
    es: {
      title: "Las 6 Horas de Portimão",
      short_description: "Las 6 Horas de Portimão llegan al Autódromo Internacional do Algarve los días 7 y 8 de febrero de 2026.",
      description: `Las 6 Horas de Portimão llegan al Autódromo Internacional do Algarve los días 7 y 8 de febrero de 2026, reuniendo GT y prototipos elegibles en una intensa carrera de resistencia marcada por la estrategia, la regularidad y un ritmo elevado.

Una oportunidad única para ver algunas de las máquinas más competitivas en acción durante el invierno.`,
    },
    it: {
      title: "Le 6 Ore di Portimão",
      short_description: "Le 6 Ore di Portimão arrivano all'Autódromo Internacional do Algarve il 7 e 8 febbraio 2026.",
      description: `Le 6 Ore di Portimão arrivano all'Autódromo Internacional do Algarve il 7 e 8 febbraio 2026, riunendo GT e prototipi idonei per un'intensa gara endurance definita da strategia, costanza e ritmo elevato.

Un'occasione unica per vedere alcune delle macchine più competitive in azione durante l'inverno.`,
    },
    nl: {
      title: "De 6 uur van Portimão",
      short_description: "De 6 uur van Portimão komt op 7 en 8 februari 2026 naar het Autódromo Internacional do Algarve.",
      description: `De 6 uur van Portimão komt op 7 en 8 februari 2026 naar het Autódromo Internacional do Algarve en brengt toegelaten GT's en prototypes samen voor een intense endurancewedstrijd waarin strategie, constantheid en hoog tempo centraal staan.

Een unieke kans om enkele van de meest competitieve machines in de winter in actie te zien.`,
    },
    sv: {
      title: "6-timmarsloppet i Portimão",
      short_description: "6-timmarsloppet i Portimão kommer till Autódromo Internacional do Algarve den 7 och 8 februari 2026.",
      description: `6-timmarsloppet i Portimão kommer till Autódromo Internacional do Algarve den 7 och 8 februari 2026 och samlar godkända GT-bilar och prototyper för ett intensivt uthållighetsrace präglat av strategi, jämnhet och högt tempo.

Det är ett unikt tillfälle att se några av de mest konkurrenskraftiga maskinerna i aktion under vintern.`,
    },
    no: {
      title: "6-timersløpet i Portimão",
      short_description: "6-timersløpet i Portimão kommer til Autódromo Internacional do Algarve 7. og 8. februar 2026.",
      description: `6-timersløpet i Portimão kommer til Autódromo Internacional do Algarve 7. og 8. februar 2026 og samler godkjente GT-biler og prototyper til et intenst langdistanseløp preget av strategi, jevnhet og høyt tempo.

Det er en unik mulighet til å se noen av de mest konkurransedyktige maskinene i aksjon om vinteren.`,
    },
    da: {
      title: "6-timersløbet i Portimão",
      short_description: "6-timersløbet i Portimão kommer til Autódromo Internacional do Algarve den 7. og 8. februar 2026.",
      description: `6-timersløbet i Portimão kommer til Autódromo Internacional do Algarve den 7. og 8. februar 2026 og samler godkendte GT-biler og prototyper til et intenst langdistanceløb præget af strategi, stabilitet og højt tempo.

Det er en unik mulighed for at se nogle af de mest konkurrencedygtige maskiner i aktion om vinteren.`,
    },
  },
  "superbike-world-championship-2026-algarve-round": {
    "pt-pt": {
      title: "Campeonato do Mundo de Superbike 2026 - Ronda do Algarve",
      short_description: "A ronda algarvia do WSBK 2026 regressa ao Autódromo Internacional do Algarve, um dos circuitos mais espetaculares da Europa.",
      description: `A ronda algarvia do WSBK 2026 regressa ao icónico Autódromo Internacional do Algarve, um dos circuitos de competição mais espetaculares da Europa. Conhecido pelas mudanças de elevação, curvas cegas e secções rápidas, o traçado de Portimão oferece uma das corridas mais técnicas e visualmente emocionantes do calendário.

Ao longo de um fim de semana cheio de adrenalina, os fãs podem esperar corridas de superbikes de classe mundial a mais de 300 km/h, várias categorias de apoio, oportunidades de acesso ao paddock, hospitalidade VIP, zonas para fãs, merchandising e entretenimento ao vivo.

Com o Atlântico como pano de fundo, o evento combina desporto motorizado de elite com uma atmosfera premium de lifestyle, atraindo pilotos, equipas, patrocinadores e fãs internacionais.`,
      venue: "Algarve Motorsports Park",
    },
    fr: {
      title: "Championnat du monde Superbike 2026 - Manche de l'Algarve",
      short_description: "La manche WSBK 2026 de l'Algarve revient sur l'Autódromo Internacional do Algarve, l'un des circuits les plus spectaculaires d'Europe.",
      description: `La manche WSBK 2026 de l'Algarve revient sur l'emblématique Autódromo Internacional do Algarve, l'un des circuits de course les plus spectaculaires d'Europe. Réputée pour ses dénivelés, ses crêtes aveugles et ses virages rapides, la piste de Portimão offre l'une des courses les plus techniques et visuellement impressionnantes du calendrier.

Pendant tout un week-end d'adrénaline, les fans pourront vivre des courses de superbike de niveau mondial à plus de 300 km/h, plusieurs catégories de soutien, des possibilités d'accès au paddock, des salons d'hospitalité VIP, des zones fans, du merchandising et des animations en direct.

Avec l'Atlantique en toile de fond, l'événement associe sport mécanique d'élite et atmosphère lifestyle haut de gamme, attirant pilotes, équipes, sponsors et passionnés internationaux.`,
      venue: "Algarve Motorsports Park",
    },
    de: {
      title: "Superbike-Weltmeisterschaft 2026 - Algarve-Runde",
      short_description: "Die WSBK-Algarve-Runde 2026 kehrt auf den Autódromo Internacional do Algarve zurück, eine der spektakulärsten Rennstrecken Europas.",
      description: `Die WSBK-Algarve-Runde 2026 kehrt auf den ikonischen Autódromo Internacional do Algarve zurück, eine der spektakulärsten Rennstrecken Europas. Bekannt für starke Höhenunterschiede, blinde Kuppen und schnelle Kurven, liefert die Strecke von Portimão eines der technisch anspruchsvollsten und visuell packendsten Rennen des Kalenders.

Über ein adrenalingeladenes Wochenende erleben Fans Superbike-Rennen auf Weltklasseniveau mit über 300 km/h, mehrere Rennkategorien und Rahmenveranstaltungen, Möglichkeiten für Paddock-Zugang, VIP-Hospitality, Fan-Zonen, Merchandise und Live-Unterhaltung.

Vor der Atlantikkulisse der Algarve verbindet das Event Spitzen-Motorsport mit einer hochwertigen Lifestyle-Atmosphäre und zieht internationale Fahrer, Teams, Sponsoren und Motorsportfans an.`,
      venue: "Algarve Motorsports Park",
    },
    es: {
      title: "Campeonato Mundial de Superbike 2026 - Ronda del Algarve",
      short_description: "La ronda del Algarve del WSBK 2026 vuelve al Autódromo Internacional do Algarve, uno de los circuitos más espectaculares de Europa.",
      description: `La ronda del Algarve del WSBK 2026 vuelve al icónico Autódromo Internacional do Algarve, uno de los circuitos de carreras más espectaculares de Europa. Conocido por sus cambios de elevación, rasantes ciegas y curvas de alta velocidad, el trazado de Portimão ofrece una de las carreras más técnicas y emocionantes del calendario.

Durante un fin de semana lleno de adrenalina, los aficionados podrán disfrutar de superbikes de clase mundial a más de 300 km/h, varias categorías de apoyo, oportunidades de acceso al paddock, hospitalidad VIP, zonas para fans, merchandising y entretenimiento en directo.

Con el Atlántico como telón de fondo, el evento combina automovilismo de élite con una atmósfera premium de estilo de vida, atrayendo a pilotos, equipos, patrocinadores y aficionados internacionales.`,
      venue: "Algarve Motorsports Park",
    },
    it: {
      title: "Campionato mondiale Superbike 2026 - Tappa dell'Algarve",
      short_description: "La tappa WSBK 2026 dell'Algarve torna all'Autódromo Internacional do Algarve, uno dei circuiti più spettacolari d'Europa.",
      description: `La tappa WSBK 2026 dell'Algarve torna all'iconico Autódromo Internacional do Algarve, uno dei circuiti più spettacolari d'Europa. Conosciuta per i forti dislivelli, i dossi ciechi e le curve veloci, la pista di Portimão offre una delle gare più tecniche e visivamente emozionanti del calendario.

In un intero weekend di adrenalina, i fan potranno vivere gare Superbike di livello mondiale a oltre 300 km/h, diverse categorie di supporto, opportunità di accesso al paddock, hospitality VIP, fan zone, merchandising e intrattenimento dal vivo.

Con l'Atlantico sullo sfondo, l'evento combina motorsport d'élite e atmosfera lifestyle premium, attirando piloti, team, sponsor e appassionati internazionali.`,
      venue: "Algarve Motorsports Park",
    },
    nl: {
      title: "Superbike Wereldkampioenschap 2026 - Algarve-ronde",
      short_description: "De WSBK Algarve-ronde van 2026 keert terug naar het Autódromo Internacional do Algarve, een van Europa's meest spectaculaire circuits.",
      description: `De WSBK Algarve-ronde van 2026 keert terug naar het iconische Autódromo Internacional do Algarve, een van Europa's meest spectaculaire racecircuits. Het circuit van Portimão staat bekend om zijn hoogteverschillen, blinde toppen en snelle bochten en levert een van de technisch meest veeleisende en visueel spannendste races van de kalender.

Tijdens een weekend vol adrenaline beleven fans superbikeraces van wereldniveau met snelheden boven 300 km/u, meerdere raceklassen en supportevenementen, mogelijkheden voor paddocktoegang, VIP-hospitality, fanzones, merchandise en live-entertainment.

Tegen de Atlantische achtergrond van de Algarve combineert dit evenement topsport in de motorsport met een premium lifestyle-sfeer en trekt het internationale rijders, teams, sponsors en motorsportliefhebbers aan.`,
      venue: "Algarve Motorsports Park",
    },
    sv: {
      title: "Superbike-VM 2026 - Algarve-rundan",
      short_description: "WSBK:s Algarve-runda 2026 återvänder till Autódromo Internacional do Algarve, en av Europas mest spektakulära racingbanor.",
      description: `WSBK:s Algarve-runda 2026 återvänder till ikoniska Autódromo Internacional do Algarve, en av Europas mest spektakulära racingbanor. Portimão-banan är känd för dramatiska höjdskillnader, blinda krön och snabba kurvor och bjuder på ett av kalenderns mest tekniskt krävande och visuellt spännande race.

Under en hel helg fylld av adrenalin får fans uppleva superbikeracing i världsklass i över 300 km/h, flera supportklasser, möjligheter till paddocktillträde, VIP-hospitality, fan zones, merchandise och liveunderhållning.

Med Atlanten som bakgrund förenar evenemanget elitmotorsport med en premium livsstilsatmosfär och lockar internationella förare, team, sponsorer och motorsportentusiaster.`,
      venue: "Algarve Motorsports Park",
    },
    no: {
      title: "Superbike-VM 2026 - Algarve-runden",
      short_description: "WSBK-runden i Algarve 2026 vender tilbake til Autódromo Internacional do Algarve, en av Europas mest spektakulære racingbaner.",
      description: `WSBK-runden i Algarve 2026 vender tilbake til ikoniske Autódromo Internacional do Algarve, en av Europas mest spektakulære racingbaner. Portimão-banen er kjent for dramatiske høydeforskjeller, blinde bakketopper og raske svinger, og byr på et av kalenderens mest teknisk krevende og visuelt spennende løp.

Gjennom en hel helg med adrenalin får fans oppleve superbikeracing i verdensklasse i over 300 km/t, flere støtteklasser, muligheter for paddocktilgang, VIP-hospitality, fanzoner, merchandise og liveunderholdning.

Med Atlanterhavet som bakteppe kombinerer arrangementet elite-motorsport med en premium livsstilsatmosfære og tiltrekker internasjonale førere, team, sponsorer og motorsportentusiaster.`,
      venue: "Algarve Motorsports Park",
    },
    da: {
      title: "Superbike-VM 2026 - Algarve-runden",
      short_description: "WSBK-runden i Algarve 2026 vender tilbage til Autódromo Internacional do Algarve, en af Europas mest spektakulære racerbaner.",
      description: `WSBK-runden i Algarve 2026 vender tilbage til ikoniske Autódromo Internacional do Algarve, en af Europas mest spektakulære racerbaner. Portimão-banen er kendt for dramatiske højdeforskelle, blinde bakketoppe og hurtige sving og leverer et af kalenderens mest teknisk krævende og visuelt spændende løb.

Gennem en hel weekend fuld af adrenalin kan fans opleve superbikeracing i verdensklasse med over 300 km/t, flere supportklasser, muligheder for paddockadgang, VIP-hospitality, fanområder, merchandise og liveunderholdning.

Med Atlanterhavet som baggrund kombinerer arrangementet elite-motorsport med en premium livsstilsatmosfære og tiltrækker internationale kørere, teams, sponsorer og motorsportentusiaster.`,
      venue: "Algarve Motorsports Park",
    },
  },
  "algarve-smooth-jazz-festival": {
    "pt-pt": {
      title: "Algarve Smooth Jazz Festival",
      short_description: "O Algarve Smooth Jazz Festival decorre de 12 a 17 de maio de 2026 no Pine Cliffs Resort, em Albufeira.",
      description: `O Algarve Smooth Jazz Festival está marcado para 12 a 17 de maio de 2026 no Pine Cliffs Resort, em Albufeira, com a página oficial a descrevê-lo como a 9.ª edição do festival.

A programação oficial apresenta seis dias, três áreas, mais de 20 artistas, 17 concertos e festas, com bilhetes e pacotes de alojamento disponíveis na loja online do evento.`,
    },
    fr: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "L'Algarve Smooth Jazz Festival se déroule du 12 au 17 mai 2026 au Pine Cliffs Resort à Albufeira.",
      description: `L'Algarve Smooth Jazz Festival est prévu du 12 au 17 mai 2026 au Pine Cliffs Resort à Albufeira, la page officielle le présentant comme la 9e édition du festival.

Le programme officiel annonce six jours, trois espaces, plus de 20 artistes, 17 concerts et soirées, avec des billets et forfaits hébergement disponibles via la boutique en ligne de l'événement.`,
    },
    de: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "Das Algarve Smooth Jazz Festival findet vom 12. bis 17. Mai 2026 im Pine Cliffs Resort in Albufeira statt.",
      description: `Das Algarve Smooth Jazz Festival ist vom 12. bis 17. Mai 2026 im Pine Cliffs Resort in Albufeira geplant; die offizielle Seite beschreibt es als 9. Ausgabe des Festivals.

Das offizielle Programm umfasst sechs Tage, drei Bereiche, mehr als 20 Künstler sowie 17 Shows und Partys. Tickets und Unterkunftspakete sind über den Online-Shop des Events erhältlich.`,
    },
    es: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "El Algarve Smooth Jazz Festival se celebra del 12 al 17 de mayo de 2026 en Pine Cliffs Resort, Albufeira.",
      description: `El Algarve Smooth Jazz Festival está previsto del 12 al 17 de mayo de 2026 en Pine Cliffs Resort, en Albufeira, y la página oficial lo describe como la 9.ª edición del festival.

La programación oficial incluye seis días, tres zonas, más de 20 artistas, 17 conciertos y fiestas, con entradas y paquetes de alojamiento disponibles en la tienda online del evento.`,
    },
    it: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "L'Algarve Smooth Jazz Festival si svolge dal 12 al 17 maggio 2026 al Pine Cliffs Resort di Albufeira.",
      description: `L'Algarve Smooth Jazz Festival è in programma dal 12 al 17 maggio 2026 al Pine Cliffs Resort di Albufeira, con la pagina ufficiale che lo presenta come la 9ª edizione del festival.

Il programma ufficiale prevede sei giorni, tre aree, oltre 20 artisti, 17 concerti e feste, con biglietti e pacchetti soggiorno disponibili nello shop online dell'evento.`,
    },
    nl: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "Het Algarve Smooth Jazz Festival vindt van 12 tot 17 mei 2026 plaats in Pine Cliffs Resort in Albufeira.",
      description: `Het Algarve Smooth Jazz Festival staat gepland van 12 tot 17 mei 2026 in Pine Cliffs Resort in Albufeira; de officiële pagina beschrijft het als de 9e editie van het festival.

Volgens het officiële programma zijn er zes dagen, drie zones, meer dan 20 artiesten en 17 shows en feesten, met tickets en accommodatiepakketten via de online shop van het evenement.`,
    },
    sv: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "Algarve Smooth Jazz Festival hålls den 12-17 maj 2026 på Pine Cliffs Resort i Albufeira.",
      description: `Algarve Smooth Jazz Festival är planerat till den 12-17 maj 2026 på Pine Cliffs Resort i Albufeira, och den officiella sidan beskriver det som festivalens 9:e upplaga.

Det officiella programmet listar sex dagar, tre områden, fler än 20 artister, 17 konserter och fester, med biljetter och boendepaket via evenemangets webbshop.`,
    },
    no: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "Algarve Smooth Jazz Festival arrangeres 12.-17. mai 2026 på Pine Cliffs Resort i Albufeira.",
      description: `Algarve Smooth Jazz Festival er planlagt 12.-17. mai 2026 på Pine Cliffs Resort i Albufeira, og den offisielle siden beskriver det som festivalens 9. utgave.

Det offisielle programmet viser seks dager, tre områder, over 20 artister, 17 konserter og fester, med billetter og overnattingspakker tilgjengelig i arrangementets nettbutikk.`,
    },
    da: {
      title: "Algarve Smooth Jazz Festival",
      short_description: "Algarve Smooth Jazz Festival afholdes den 12.-17. maj 2026 på Pine Cliffs Resort i Albufeira.",
      description: `Algarve Smooth Jazz Festival er planlagt til den 12.-17. maj 2026 på Pine Cliffs Resort i Albufeira, og den officielle side beskriver det som festivalens 9. udgave.

Det officielle program omfatter seks dage, tre områder, mere end 20 kunstnere, 17 koncerter og fester, med billetter og overnatningspakker via eventets webshop.`,
    },
  },
  "iberian-racing-festival": {
    "pt-pt": {
      title: "Iberian Racing Festival",
      short_description: "Um festival de desporto motorizado de três dias no Autódromo Internacional do Algarve, em Portimão, de 15 a 17 de maio de 2026.",
      description: `O Iberian Racing Festival regressa ao Autódromo Internacional do Algarve, em Portimão, de 15 a 17 de maio de 2026. A página oficial descreve um fim de semana de corridas com várias grelhas competitivas, incluindo protótipos desportivos, carros GT e monolugares.

O evento realiza-se no Algarve Motorsports Park, no Sítio do Escampadinho, Mexilhoeira Grande, com acesso ao paddock de fim de semana indicado pelo recinto a €10.`,
    },
    fr: {
      title: "Iberian Racing Festival",
      short_description: "Un festival de sport automobile de trois jours à l'Autódromo Internacional do Algarve à Portimão, du 15 au 17 mai 2026.",
      description: `L'Iberian Racing Festival revient à l'Autódromo Internacional do Algarve à Portimão du 15 au 17 mai 2026. La page officielle décrit un week-end de courses automobiles avec plusieurs plateaux compétitifs, dont des prototypes sportifs, des GT et des monoplaces.

L'événement se déroule à l'Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, avec un accès paddock week-end indiqué par le circuit à 10 €.`,
    },
    de: {
      title: "Iberian Racing Festival",
      short_description: "Ein dreitägiges Motorsportfestival am Autódromo Internacional do Algarve in Portimão vom 15. bis 17. Mai 2026.",
      description: `Das Iberian Racing Festival kehrt vom 15. bis 17. Mai 2026 auf den Autódromo Internacional do Algarve in Portimão zurück. Die offizielle Eventseite beschreibt ein Rennwochenende mit mehreren Wettbewerbsfeldern, darunter Sportprototypen, GT-Fahrzeuge und Monoposti.

Das Event findet im Algarve Motorsports Park in Sítio do Escampadinho, Mexilhoeira Grande, statt. Der Wochenendzugang zum Paddock wird vom Veranstaltungsort mit 10 € angegeben.`,
    },
    es: {
      title: "Iberian Racing Festival",
      short_description: "Un festival de automovilismo de tres días en el Autódromo Internacional do Algarve, en Portimão, del 15 al 17 de mayo de 2026.",
      description: `El Iberian Racing Festival vuelve al Autódromo Internacional do Algarve, en Portimão, del 15 al 17 de mayo de 2026. La página oficial describe un fin de semana de carreras con varias parrillas competitivas, incluidos prototipos deportivos, GT y monoplazas.

El evento se celebra en Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, con acceso al paddock de fin de semana indicado por el recinto a 10 €.`,
    },
    it: {
      title: "Iberian Racing Festival",
      short_description: "Un festival di motorsport di tre giorni all'Autódromo Internacional do Algarve di Portimão, dal 15 al 17 maggio 2026.",
      description: `L'Iberian Racing Festival torna all'Autódromo Internacional do Algarve di Portimão dal 15 al 17 maggio 2026. La pagina ufficiale descrive un weekend di gare con più griglie competitive, tra cui prototipi sportivi, vetture GT e monoposto.

L'evento si svolge all'Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, con accesso paddock per il weekend indicato dalla sede a 10 €.`,
    },
    nl: {
      title: "Iberian Racing Festival",
      short_description: "Een driedaags motorsportfestival op het Autódromo Internacional do Algarve in Portimão van 15 tot 17 mei 2026.",
      description: `Het Iberian Racing Festival keert van 15 tot 17 mei 2026 terug naar het Autódromo Internacional do Algarve in Portimão. De officiële evenementpagina beschrijft een raceweekend met meerdere competitieve startvelden, waaronder sportprototypes, GT-auto's en formulewagens.

Het evenement vindt plaats in Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, met weekendtoegang tot de paddock volgens de locatie voor €10.`,
    },
    sv: {
      title: "Iberian Racing Festival",
      short_description: "En tredagars motorsportfestival på Autódromo Internacional do Algarve i Portimão den 15-17 maj 2026.",
      description: `Iberian Racing Festival återvänder till Autódromo Internacional do Algarve i Portimão den 15-17 maj 2026. Den officiella evenemangssidan beskriver en racinghelg med flera tävlingsfält, inklusive sportprototyper, GT-bilar och formelbilar.

Evenemanget hålls på Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, med helgtillträde till paddocken angivet av arenan till 10 €.`,
    },
    no: {
      title: "Iberian Racing Festival",
      short_description: "En tredagers motorsportfestival på Autódromo Internacional do Algarve i Portimão fra 15. til 17. mai 2026.",
      description: `Iberian Racing Festival vender tilbake til Autódromo Internacional do Algarve i Portimão fra 15. til 17. mai 2026. Den offisielle arrangementssiden beskriver en racinghelg med flere konkurransefelt, inkludert sportsprototyper, GT-biler og formelbiler.

Arrangementet holdes på Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, med helgetilgang til paddocken oppgitt av arenaen til 10 €.`,
    },
    da: {
      title: "Iberian Racing Festival",
      short_description: "En tredages motorsportsfestival på Autódromo Internacional do Algarve i Portimão fra 15. til 17. maj 2026.",
      description: `Iberian Racing Festival vender tilbage til Autódromo Internacional do Algarve i Portimão fra 15. til 17. maj 2026. Den officielle eventside beskriver en racingweekend med flere konkurrencefelter, herunder sportsprototyper, GT-biler og formelbiler.

Arrangementet afholdes på Algarve Motorsports Park, Sítio do Escampadinho, Mexilhoeira Grande, med weekendadgang til paddocken angivet af stedet til 10 €.`,
    },
  },
  "carvoeiro-noite-black-white": {
    "pt-pt": {
      title: "Carvoeiro Noite Black & White",
      short_description: "A Carvoeiro Noite Black & White é uma festa de rua de abertura do verão na Praia do Carvoeiro, a 20 de junho de 2026.",
      description: `A Carvoeiro Noite Black & White realiza-se na Praia do Carvoeiro, em Lagoa, Algarve, com a edição de 2026 confirmada pelos perfis sociais oficiais do evento para 20 de junho de 2026.

A informação oficial do Município de Lagoa descreve o evento como uma celebração de junho com música, animação de rua, performances e várias zonas de entretenimento no centro da vila e na Praia do Carvoeiro.`,
    },
    fr: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White est une fête de rue d'ouverture de l'été à Praia do Carvoeiro le 20 juin 2026.",
      description: `Carvoeiro Noite Black & White se déroule à Praia do Carvoeiro, à Lagoa en Algarve, l'édition 2026 étant confirmée par les profils sociaux officiels de l'événement pour le 20 juin 2026.

Les informations officielles de la municipalité de Lagoa décrivent l'événement comme une célébration de juin avec musique, animation de rue, performances et plusieurs zones de divertissement dans le centre-ville et sur la Praia do Carvoeiro.`,
    },
    de: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White ist eine Straßenparty zum Sommerauftakt an der Praia do Carvoeiro am 20. Juni 2026.",
      description: `Carvoeiro Noite Black & White findet an der Praia do Carvoeiro in Lagoa, Algarve, statt; die Ausgabe 2026 wurde von den offiziellen Social-Media-Profilen des Events für den 20. Juni 2026 bestätigt.

Offizielle Informationen der Gemeinde Lagoa beschreiben das Event als Juni-Feier mit Musik, Straßenunterhaltung, Performances und mehreren Unterhaltungsbereichen im Ortszentrum und an der Praia do Carvoeiro.`,
    },
    es: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White es una fiesta callejera de apertura del verano en Praia do Carvoeiro el 20 de junio de 2026.",
      description: `Carvoeiro Noite Black & White se celebra en Praia do Carvoeiro, en Lagoa, Algarve, con la edición de 2026 confirmada por los perfiles sociales oficiales del evento para el 20 de junio de 2026.

La información oficial del Município de Lagoa describe el evento como una celebración de junio con música, animación callejera, actuaciones y varias zonas de entretenimiento en el centro de la localidad y en Praia do Carvoeiro.`,
    },
    it: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White è una festa di strada di apertura dell'estate a Praia do Carvoeiro il 20 giugno 2026.",
      description: `Carvoeiro Noite Black & White si svolge a Praia do Carvoeiro, a Lagoa, Algarve, con l'edizione 2026 confermata dai profili social ufficiali dell'evento per il 20 giugno 2026.

Le informazioni ufficiali del Município de Lagoa descrivono l'evento come una celebrazione di giugno con musica, intrattenimento di strada, performance e diverse aree di spettacolo nel centro e sulla Praia do Carvoeiro.`,
    },
    nl: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White is een straatfeest voor de opening van de zomer bij Praia do Carvoeiro op 20 juni 2026.",
      description: `Carvoeiro Noite Black & White vindt plaats bij Praia do Carvoeiro in Lagoa, Algarve, met de editie van 2026 bevestigd door de officiële sociale profielen van het evenement voor 20 juni 2026.

Officiële informatie van de gemeente Lagoa beschrijft het evenement als een juniviering met muziek, straatentertainment, optredens en meerdere entertainmentzones in het centrum en bij Praia do Carvoeiro.`,
    },
    sv: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White är en gatufest som öppnar sommaren vid Praia do Carvoeiro den 20 juni 2026.",
      description: `Carvoeiro Noite Black & White äger rum vid Praia do Carvoeiro i Lagoa, Algarve, och 2026 års upplaga har bekräftats av evenemangets officiella sociala profiler till den 20 juni 2026.

Officiell information från kommunen Lagoa beskriver evenemanget som ett junifirande med musik, gatuunderhållning, framträdanden och flera nöjesområden i stadskärnan och vid Praia do Carvoeiro.`,
    },
    no: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White er en gatefest som åpner sommeren ved Praia do Carvoeiro 20. juni 2026.",
      description: `Carvoeiro Noite Black & White finner sted ved Praia do Carvoeiro i Lagoa, Algarve, og 2026-utgaven er bekreftet av arrangementets offisielle sosiale profiler til 20. juni 2026.

Offisiell informasjon fra Lagoa kommune beskriver arrangementet som en junifeiring med musikk, gateunderholdning, opptredener og flere underholdningsområder i sentrum og ved Praia do Carvoeiro.`,
    },
    da: {
      title: "Carvoeiro Noite Black & White",
      short_description: "Carvoeiro Noite Black & White er en gadefest, der åbner sommeren ved Praia do Carvoeiro den 20. juni 2026.",
      description: `Carvoeiro Noite Black & White finder sted ved Praia do Carvoeiro i Lagoa, Algarve, og 2026-udgaven er bekræftet af eventets officielle sociale profiler til den 20. juni 2026.

Officiel information fra Lagoa kommune beskriver arrangementet som en junifejring med musik, gadeunderholdning, optrædener og flere underholdningsområder i bymidten og ved Praia do Carvoeiro.`,
    },
  },
  "festival-med": {
    "pt-pt": {
      title: "Festival MED",
      short_description: "O Festival MED é um festival de músicas do mundo e cultura no centro histórico de Loulé, de 25 a 28 de junho de 2026.",
      description: `O Festival MED realiza-se no centro histórico de Loulé de 25 a 28 de junho de 2026, com a programação oficial centrada nas músicas do mundo e na diversidade cultural.

A página oficial do evento descreve música, gastronomia, artes visuais, animação de rua, artesanato, dança, cinema, poesia, conferências e outras propostas culturais.`,
      venue: "Centro histórico de Loulé",
    },
    fr: {
      title: "Festival MED",
      short_description: "Festival MED est un festival de musiques du monde et de culture dans le centre historique de Loulé du 25 au 28 juin 2026.",
      description: `Festival MED se déroule dans le centre historique de Loulé du 25 au 28 juin 2026, avec une programmation officielle centrée sur les musiques du monde et la diversité culturelle.

La page officielle de l'événement présente de la musique, de la gastronomie, des arts visuels, des animations de rue, de l'artisanat, de la danse, du cinéma, de la poésie, des conférences et d'autres propositions culturelles.`,
      venue: "Centre historique de Loulé",
    },
    de: {
      title: "Festival MED",
      short_description: "Festival MED ist ein Weltmusik- und Kulturfestival im historischen Zentrum von Loulé vom 25. bis 28. Juni 2026.",
      description: `Festival MED findet vom 25. bis 28. Juni 2026 im historischen Zentrum von Loulé statt. Das offizielle Programm konzentriert sich auf Weltmusik und kulturelle Vielfalt.

Die offizielle Eventseite beschreibt Musik, Gastronomie, bildende Kunst, Straßenunterhaltung, Kunsthandwerk, Tanz, Kino, Poesie, Konferenzen und weitere Kulturangebote.`,
      venue: "Historisches Zentrum von Loulé",
    },
    es: {
      title: "Festival MED",
      short_description: "Festival MED es un festival de músicas del mundo y cultura en el centro histórico de Loulé del 25 al 28 de junio de 2026.",
      description: `Festival MED se celebra en el centro histórico de Loulé del 25 al 28 de junio de 2026, con la programación oficial centrada en las músicas del mundo y la diversidad cultural.

La página oficial del evento describe música, gastronomía, artes visuales, animación callejera, artesanía, danza, cine, poesía, conferencias y otras propuestas culturales.`,
      venue: "Centro histórico de Loulé",
    },
    it: {
      title: "Festival MED",
      short_description: "Festival MED è un festival di world music e cultura nel centro storico di Loulé dal 25 al 28 giugno 2026.",
      description: `Festival MED si svolge nel centro storico di Loulé dal 25 al 28 giugno 2026, con il programma ufficiale incentrato sulla world music e sulla diversità culturale.

La pagina ufficiale dell'evento descrive musica, gastronomia, arti visive, spettacoli di strada, artigianato, danza, cinema, poesia, conferenze e altre proposte culturali.`,
      venue: "Centro storico di Loulé",
    },
    nl: {
      title: "Festival MED",
      short_description: "Festival MED is een wereldmuziek- en cultuurfestival in het historische centrum van Loulé van 25 tot 28 juni 2026.",
      description: `Festival MED vindt van 25 tot 28 juni 2026 plaats in het historische centrum van Loulé, met een officieel programma rond wereldmuziek en culturele diversiteit.

De officiële evenementpagina beschrijft muziek, gastronomie, beeldende kunst, straatentertainment, ambachten, dans, film, poëzie, conferenties en andere culturele programmering.`,
      venue: "Historisch centrum van Loulé",
    },
    sv: {
      title: "Festival MED",
      short_description: "Festival MED är en festival för världsmusik och kultur i Loulés historiska centrum den 25-28 juni 2026.",
      description: `Festival MED äger rum i Loulés historiska centrum den 25-28 juni 2026, med det officiella programmet fokuserat på världsmusik och kulturell mångfald.

Den officiella evenemangssidan beskriver musik tillsammans med gastronomi, bildkonst, gatuunderhållning, hantverk, dans, film, poesi, konferenser och annan kulturprogrammering.`,
      venue: "Loulés historiska centrum",
    },
    no: {
      title: "Festival MED",
      short_description: "Festival MED er en festival for verdensmusikk og kultur i Loulés historiske sentrum fra 25. til 28. juni 2026.",
      description: `Festival MED finner sted i Loulés historiske sentrum fra 25. til 28. juni 2026, med det offisielle programmet sentrert rundt verdensmusikk og kulturelt mangfold.

Den offisielle arrangementssiden beskriver musikk sammen med gastronomi, visuell kunst, gateunderholdning, håndverk, dans, film, poesi, konferanser og annen kulturprogrammering.`,
      venue: "Loulés historiske sentrum",
    },
    da: {
      title: "Festival MED",
      short_description: "Festival MED er en festival for verdensmusik og kultur i Loulés historiske centrum fra 25. til 28. juni 2026.",
      description: `Festival MED finder sted i Loulés historiske centrum fra 25. til 28. juni 2026, med det officielle program centreret om verdensmusik og kulturel mangfoldighed.

Den officielle eventside beskriver musik sammen med gastronomi, billedkunst, gadeunderholdning, kunsthåndværk, dans, film, poesi, konferencer og anden kulturprogrammering.`,
      venue: "Loulés historiske centrum",
    },
  },
  "afro-nation-portugal": {
    "pt-pt": {
      title: "Afro Nation Portugal",
      short_description: "O Afro Nation Portugal é um festival de música de praia de três dias na Praia da Rocha, em Portimão, de 3 a 5 de julho de 2026.",
      description: `O Afro Nation Portugal realiza-se de 3 a 5 de julho de 2026 na Praia da Rocha, em Portimão, Algarve. O site oficial descreve-o como uma celebração da cultura através da música, comida, arte e muito mais.

A FAQ oficial confirma que o festival decorre na praia e indica as 16:00 como hora diária de abertura. A bilheteira oficial está disponível apenas através do site do Afro Nation.`,
      venue: "Praia da Rocha",
    },
    fr: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal est un festival musical de plage de trois jours à Praia da Rocha, Portimão, du 3 au 5 juillet 2026.",
      description: `Afro Nation Portugal se déroule du 3 au 5 juillet 2026 sur la plage de Praia da Rocha à Portimão, en Algarve. Le site officiel le décrit comme une célébration de la culture à travers la musique, la cuisine, l'art et bien plus encore.

La FAQ officielle confirme que le festival a lieu sur la plage et indique 16 h comme heure d'ouverture quotidienne. La billetterie officielle est disponible uniquement via le site d'Afro Nation.`,
      venue: "Plage de Praia da Rocha",
    },
    de: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal ist ein dreitägiges Beach-Musikfestival an der Praia da Rocha in Portimão vom 3. bis 5. Juli 2026.",
      description: `Afro Nation Portugal findet vom 3. bis 5. Juli 2026 am Strand Praia da Rocha in Portimão, Algarve, statt. Die offizielle Festivalwebsite beschreibt es als Feier der Kultur durch Musik, Essen, Kunst und mehr.

Die offizielle FAQ bestätigt, dass das Festival am Strand stattfindet, und nennt 16:00 Uhr als tägliche Startzeit. Offizielle Tickets sind nur über die Website von Afro Nation erhältlich.`,
      venue: "Praia da Rocha",
    },
    es: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal es un festival de música de playa de tres días en Praia da Rocha, Portimão, del 3 al 5 de julio de 2026.",
      description: `Afro Nation Portugal se celebra del 3 al 5 de julio de 2026 en Praia da Rocha, en Portimão, Algarve. El sitio oficial del festival lo describe como una celebración de la cultura a través de la música, la comida, el arte y mucho más.

La FAQ oficial confirma que el festival se celebra en la playa e indica las 16:00 como hora diaria de inicio. La venta oficial de entradas está disponible solo a través del sitio de Afro Nation.`,
      venue: "Praia da Rocha",
    },
    it: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal è un festival musicale di tre giorni sulla spiaggia di Praia da Rocha, Portimão, dal 3 al 5 luglio 2026.",
      description: `Afro Nation Portugal si svolge dal 3 al 5 luglio 2026 sulla spiaggia di Praia da Rocha a Portimão, Algarve. Il sito ufficiale del festival lo descrive come una celebrazione della cultura attraverso musica, cibo, arte e molto altro.

La FAQ ufficiale conferma che il festival si tiene sulla spiaggia e indica le 16:00 come orario di apertura giornaliero. La biglietteria ufficiale è disponibile solo tramite il sito di Afro Nation.`,
      venue: "Praia da Rocha",
    },
    nl: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal is een driedaags strandmuziekfestival bij Praia da Rocha in Portimão van 3 tot 5 juli 2026.",
      description: `Afro Nation Portugal vindt van 3 tot 5 juli 2026 plaats op Praia da Rocha in Portimão, Algarve. De officiële festivalwebsite beschrijft het als een viering van cultuur via muziek, eten, kunst en meer.

De officiële FAQ bevestigt dat het festival op het strand plaatsvindt en noemt 16.00 uur als dagelijkse starttijd. Officiële tickets zijn alleen beschikbaar via de website van Afro Nation.`,
      venue: "Praia da Rocha",
    },
    sv: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal är en tredagars strandmusikfestival vid Praia da Rocha i Portimão den 3-5 juli 2026.",
      description: `Afro Nation Portugal äger rum den 3-5 juli 2026 på Praia da Rocha i Portimão, Algarve. Festivalens officiella webbplats beskriver den som en hyllning till kultur genom musik, mat, konst och mer.

Den officiella FAQ:n bekräftar att festivalen hålls på stranden och anger 16.00 som daglig starttid. Officiella biljetter finns endast via Afro Nations webbplats.`,
      venue: "Praia da Rocha",
    },
    no: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal er en tredagers strandmusikkfestival på Praia da Rocha i Portimão fra 3. til 5. juli 2026.",
      description: `Afro Nation Portugal finner sted fra 3. til 5. juli 2026 på Praia da Rocha i Portimão, Algarve. Festivalens offisielle nettsted beskriver den som en feiring av kultur gjennom musikk, mat, kunst og mer.

Den offisielle FAQ-en bekrefter at festivalen holdes på stranden og oppgir kl. 16.00 som daglig starttid. Offisielle billetter er bare tilgjengelige via Afro Nations nettsted.`,
      venue: "Praia da Rocha",
    },
    da: {
      title: "Afro Nation Portugal",
      short_description: "Afro Nation Portugal er en tredages strandmusikfestival ved Praia da Rocha i Portimão fra 3. til 5. juli 2026.",
      description: `Afro Nation Portugal finder sted fra 3. til 5. juli 2026 på Praia da Rocha i Portimão, Algarve. Festivalens officielle hjemmeside beskriver den som en fejring af kultur gennem musik, mad, kunst og mere.

Den officielle FAQ bekræfter, at festivalen afholdes på stranden, og angiver kl. 16.00 som daglig starttid. Officielle billetter er kun tilgængelige via Afro Nations hjemmeside.`,
      venue: "Praia da Rocha",
    },
  },
  "portugal-invitational": {
    "pt-pt": {
      title: "Portugal Invitational",
      short_description: "O Portugal Invitational é um torneio PGA TOUR Champions no The Els Club Vilamoura, de 31 de julho a 2 de agosto de 2026.",
      description: `O Portugal Invitational realiza-se de 31 de julho a 2 de agosto de 2026 no The Els Club Vilamoura, no Algarve. A informação oficial do torneio apresenta-o como uma competição PGA TOUR Champions com 78 jogadores, formato stroke play individual e uma bolsa de 3 milhões de dólares.

O recinto é o The Els Club Vilamoura, um clube de golfe privado no Algarve redesenhado a partir do antigo Victoria Course, com um campo de campeonato de 18 buracos assinado por Ernie Els.`,
    },
    fr: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational est un tournoi PGA TOUR Champions au The Els Club Vilamoura du 31 juillet au 2 août 2026.",
      description: `Portugal Invitational se déroule du 31 juillet au 2 août 2026 au The Els Club Vilamoura, en Algarve. Les informations officielles présentent l'événement comme une compétition PGA TOUR Champions avec un champ de 78 joueurs, un format stroke play individuel et une dotation de 3 millions de dollars.

Le site est The Els Club Vilamoura, un club de golf privé de l'Algarve redessiné à partir de l'ancien Victoria Course, avec un parcours de championnat de 18 trous signé Ernie Els.`,
    },
    de: {
      title: "Portugal Invitational",
      short_description: "Das Portugal Invitational ist ein PGA TOUR Champions-Golfturnier im The Els Club Vilamoura vom 31. Juli bis 2. August 2026.",
      description: `Das Portugal Invitational findet vom 31. Juli bis 2. August 2026 im The Els Club Vilamoura in der Algarve statt. Offizielle Turnierinformationen führen das Event als PGA TOUR Champions-Wettbewerb mit 78 Spielern, Einzel-Strokeplay-Format und einem Preisgeld von 3 Millionen US-Dollar.

Austragungsort ist The Els Club Vilamoura, ein privater Golfclub in der Algarve, der aus dem ehemaligen Victoria Course neu gestaltet wurde und über einen 18-Loch-Meisterschaftsplatz von Ernie Els verfügt.`,
    },
    es: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational es un torneo PGA TOUR Champions en The Els Club Vilamoura del 31 de julio al 2 de agosto de 2026.",
      description: `Portugal Invitational se celebra del 31 de julio al 2 de agosto de 2026 en The Els Club Vilamoura, en el Algarve. La información oficial del torneo lo presenta como una competición PGA TOUR Champions con 78 jugadores, formato stroke play individual y una bolsa de 3 millones de dólares.

La sede es The Els Club Vilamoura, un club de golf privado del Algarve rediseñado a partir del antiguo Victoria Course, con un campo de campeonato de 18 hoyos diseñado por Ernie Els.`,
    },
    it: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational è un torneo PGA TOUR Champions al The Els Club Vilamoura dal 31 luglio al 2 agosto 2026.",
      description: `Portugal Invitational si svolge dal 31 luglio al 2 agosto 2026 al The Els Club Vilamoura, in Algarve. Le informazioni ufficiali lo indicano come una competizione PGA TOUR Champions con 78 giocatori, formato stroke play individuale e un montepremi di 3 milioni di dollari.

La sede è The Els Club Vilamoura, un golf club privato dell'Algarve ridisegnato dal precedente Victoria Course, con un campo championship a 18 buche firmato da Ernie Els.`,
    },
    nl: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational is een PGA TOUR Champions-golftoernooi in The Els Club Vilamoura van 31 juli tot 2 augustus 2026.",
      description: `Portugal Invitational vindt van 31 juli tot 2 augustus 2026 plaats in The Els Club Vilamoura in de Algarve. Officiële toernooi-informatie vermeldt het evenement als een PGA TOUR Champions-competitie met 78 spelers, individueel strokeplay en een prijzenpot van 3 miljoen dollar.

De locatie is The Els Club Vilamoura, een privé golfclub in de Algarve die is herontworpen vanuit de voormalige Victoria Course, met een 18-holes kampioenschapsbaan van Ernie Els.`,
    },
    sv: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational är en PGA TOUR Champions-golftävling på The Els Club Vilamoura den 31 juli-2 augusti 2026.",
      description: `Portugal Invitational äger rum den 31 juli-2 augusti 2026 på The Els Club Vilamoura i Algarve. Officiell turneringsinformation listar evenemanget som en PGA TOUR Champions-tävling med 78 spelare, individuellt slagspel och en prissumma på 3 miljoner dollar.

Platsen är The Els Club Vilamoura, en privat golfklubb i Algarve som har omformats från den tidigare Victoria Course, med en 18-håls mästerskapsbana av Ernie Els.`,
    },
    no: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational er en PGA TOUR Champions-golfturnering på The Els Club Vilamoura fra 31. juli til 2. august 2026.",
      description: `Portugal Invitational finner sted fra 31. juli til 2. august 2026 på The Els Club Vilamoura i Algarve. Offisiell turneringsinformasjon beskriver arrangementet som en PGA TOUR Champions-konkurranse med 78 spillere, individuelt slagspill og en premiepott på 3 millioner dollar.

Arenaen er The Els Club Vilamoura, en privat golfklubb i Algarve som er redesignet fra den tidligere Victoria Course, med en 18-hulls mesterskapsbane av Ernie Els.`,
    },
    da: {
      title: "Portugal Invitational",
      short_description: "Portugal Invitational er en PGA TOUR Champions-golfturnering på The Els Club Vilamoura fra 31. juli til 2. august 2026.",
      description: `Portugal Invitational finder sted fra 31. juli til 2. august 2026 på The Els Club Vilamoura i Algarve. Officiel turneringsinformation beskriver eventet som en PGA TOUR Champions-konkurrence med 78 spillere, individuelt slagspil og en præmiesum på 3 millioner dollars.

Stedet er The Els Club Vilamoura, en privat golfklub i Algarve, der er redesignet fra den tidligere Victoria Course, med en 18-hullers mesterskabsbane af Ernie Els.`,
    },
  },
  "festival-da-sardinha": {
    "pt-pt": {
      title: "Festival da Sardinha",
      short_description: "O Festival da Sardinha é o festival ribeirinho de sardinha, música e gastronomia de Portimão, confirmado para regressar em 2026.",
      description: `O Festival da Sardinha realiza-se na zona ribeirinha de Portimão, com o site oficial do festival a confirmar o regresso em 2026 enquanto as datas exatas permanecem por confirmar.

A informação oficial descreve sardinhas assadas, música, animação, expositores, doces regionais e produtos agroalimentares, e refere 127.619 entradas na edição de 2025.`,
    },
    fr: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha est le festival de la sardine, de la musique et de la gastronomie sur le front de rivière de Portimão, confirmé pour 2026.",
      description: `Festival da Sardinha se tient sur le front de rivière de Portimão, le site officiel confirmant son retour en 2026 tandis que les dates exactes restent à confirmer.

Les informations officielles présentent des sardines grillées, de la musique, des animations, des exposants, des douceurs régionales et des produits agroalimentaires, et signalent 127 619 entrées lors de l'édition 2025.`,
    },
    de: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha ist Portimãos Festival für Sardinen, Musik und Gastronomie am Flussufer und für 2026 bestätigt.",
      description: `Festival da Sardinha findet an Portimãos Flussufer statt. Die offizielle Festivalwebsite bestätigt die Rückkehr im Jahr 2026, während genaue Termine noch ausstehen.

Offizielle Informationen beschreiben gegrillte Sardinen, Musik, Unterhaltung, Aussteller, regionale Süßwaren und agroalimentäre Produkte sowie 127.619 Eintritte bei der Ausgabe 2025.`,
    },
    es: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha es el festival ribereño de sardinas, música y gastronomía de Portimão, confirmado para regresar en 2026.",
      description: `Festival da Sardinha se celebra en la zona ribereña de Portimão, con el sitio oficial del festival confirmando su regreso en 2026 mientras las fechas exactas siguen pendientes.

La información oficial describe sardinas a la parrilla, música, entretenimiento, expositores, dulces regionales y productos agroalimentarios, e informa de 127.619 entradas en la edición de 2025.`,
    },
    it: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha è il festival sul lungofiume di Portimão dedicato a sardine, musica e gastronomia, confermato per il 2026.",
      description: `Festival da Sardinha si tiene nella zona lungo il fiume di Portimão, con il sito ufficiale del festival che conferma il ritorno nel 2026 mentre le date esatte restano da verificare.

Le informazioni ufficiali descrivono sardine alla griglia, musica, intrattenimento, espositori, dolci regionali e prodotti agroalimentari, e riportano 127.619 ingressi nell'edizione 2025.`,
    },
    nl: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha is Portimão's festival aan de rivier voor sardines, muziek en gastronomie, bevestigd voor een terugkeer in 2026.",
      description: `Festival da Sardinha wordt gehouden in de rivierzone van Portimão. De officiële festivalsite bevestigt een terugkeer in 2026, terwijl de exacte data nog niet zijn bevestigd.

Officiële informatie beschrijft gegrilde sardines, muziek, entertainment, exposanten, regionale zoetigheden en agrofoodproducten, en meldt 127.619 bezoeken tijdens de editie van 2025.`,
    },
    sv: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha är Portimãos festival vid floden för sardiner, musik och gastronomi, bekräftad att återvända 2026.",
      description: `Festival da Sardinha hålls i Portimãos flodområde, där festivalens officiella webbplats bekräftar en återkomst 2026 medan exakta datum ännu inte är verifierade.

Officiell information beskriver grillade sardiner, musik, underhållning, utställare, regionala sötsaker och jordbruksbaserade livsmedelsprodukter, och rapporterar 127 619 besök vid 2025 års upplaga.`,
    },
    no: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha er Portimãos festival ved elvebredden for sardiner, musikk og gastronomi, bekreftet å komme tilbake i 2026.",
      description: `Festival da Sardinha holdes i Portimãos elveområde, og festivalens offisielle nettsted bekrefter en retur i 2026 mens de eksakte datoene fortsatt ikke er bekreftet.

Offisiell informasjon beskriver grillede sardiner, musikk, underholdning, utstillere, regionale søtsaker og agro-matprodukter, og oppgir 127 619 besøk ved 2025-utgaven.`,
    },
    da: {
      title: "Festival da Sardinha",
      short_description: "Festival da Sardinha er Portimãos festival ved flodbredden for sardiner, musik og gastronomi, bekræftet til at vende tilbage i 2026.",
      description: `Festival da Sardinha afholdes i Portimãos område ved floden, og festivalens officielle hjemmeside bekræfter en tilbagevenden i 2026, mens de præcise datoer endnu ikke er bekræftet.

Officiel information beskriver grillede sardiner, musik, underholdning, udstillere, regionale søde sager og agro-fødevareprodukter og rapporterer 127.619 besøg ved 2025-udgaven.`,
    },
  },
  "feira-medieval-de-silves": {
    "pt-pt": {
      title: "Feira Medieval de Silves",
      short_description: "A Feira Medieval de Silves é uma feira medieval e cultural em Silves, de 7 a 15 de agosto de 2026.",
      description: `A Feira Medieval de Silves realiza-se em Silves de 7 a 15 de agosto de 2026. O Visit Portugal descreve o evento como uma recriação histórica da vida medieval na antiga capital do Algarve durante a ocupação árabe.

O programa centra-se no cenário histórico da cidade, com cortejos, torneios, arqueiros, artesãos, mercadores e artistas de rua indicados pelo Visit Portugal.`,
    },
    fr: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves est une foire médiévale et culturelle à Silves du 7 au 15 août 2026.",
      description: `Feira Medieval de Silves se déroule à Silves du 7 au 15 août 2026. Visit Portugal décrit l'événement comme une reconstitution historique de la vie médiévale dans l'ancienne capitale de l'Algarve pendant l'occupation arabe.

Le programme s'appuie sur le décor historique de la ville, avec des cortèges, tournois, archers, artisans, marchands et artistes de rue mentionnés par Visit Portugal.`,
    },
    de: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves ist ein mittelalterlicher Kulturmarkt in Silves vom 7. bis 15. August 2026.",
      description: `Feira Medieval de Silves findet vom 7. bis 15. August 2026 in Silves statt. Visit Portugal beschreibt das Event als historische Nachstellung des mittelalterlichen Lebens in der ehemaligen Hauptstadt der Algarve während der arabischen Besetzung.

Das Programm ist auf die historische Stadtkulisse ausgerichtet, mit Umzügen, Turnieren, Bogenschützen, Handwerkern, Händlern und Straßenkünstlern, die von Visit Portugal aufgeführt werden.`,
    },
    es: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves es una feria medieval y cultural en Silves del 7 al 15 de agosto de 2026.",
      description: `Feira Medieval de Silves se celebra en Silves del 7 al 15 de agosto de 2026. Visit Portugal describe el evento como una recreación histórica de la vida medieval en la antigua capital del Algarve durante la ocupación árabe.

El programa se centra en el escenario histórico de la ciudad, con desfiles, torneos, arqueros, artesanos, mercaderes y artistas callejeros indicados por Visit Portugal.`,
    },
    it: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves è una fiera medievale e culturale a Silves dal 7 al 15 agosto 2026.",
      description: `Feira Medieval de Silves si svolge a Silves dal 7 al 15 agosto 2026. Visit Portugal descrive l'evento come una rievocazione storica della vita medievale nell'antica capitale dell'Algarve durante l'occupazione araba.

Il programma è centrato sul contesto storico della città, con cortei, tornei, arcieri, artigiani, mercanti e artisti di strada indicati da Visit Portugal.`,
    },
    nl: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves is een middeleeuwse en culturele markt in Silves van 7 tot 15 augustus 2026.",
      description: `Feira Medieval de Silves vindt van 7 tot 15 augustus 2026 plaats in Silves. Visit Portugal beschrijft het evenement als een historische reconstructie van het middeleeuwse leven in de voormalige hoofdstad van de Algarve tijdens de Arabische bezetting.

Het programma speelt zich af in de historische stad, met optochten, toernooien, boogschutters, ambachtslieden, kooplieden en straatartiesten die door Visit Portugal worden genoemd.`,
    },
    sv: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves är en medeltida kulturmarknad i Silves den 7-15 augusti 2026.",
      description: `Feira Medieval de Silves äger rum i Silves den 7-15 augusti 2026. Visit Portugal beskriver evenemanget som en historisk återskapelse av medeltida liv i Algarves tidigare huvudstad under den arabiska ockupationen.

Programmet är centrerat kring den historiska stadsmiljön, med processioner, tornerspel, bågskyttar, hantverkare, köpmän och gatuartister som listas av Visit Portugal.`,
    },
    no: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves er en middelaldersk kulturmesse i Silves fra 7. til 15. august 2026.",
      description: `Feira Medieval de Silves finner sted i Silves fra 7. til 15. august 2026. Visit Portugal beskriver arrangementet som en historisk gjenskaping av middelalderlivet i Algarves tidligere hovedstad under den arabiske okkupasjonen.

Programmet er sentrert rundt den historiske byrammen, med prosesjoner, turneringer, bueskyttere, håndverkere, kjøpmenn og gateartister oppført av Visit Portugal.`,
    },
    da: {
      title: "Feira Medieval de Silves",
      short_description: "Feira Medieval de Silves er en middelalderlig kulturmesse i Silves fra 7. til 15. august 2026.",
      description: `Feira Medieval de Silves finder sted i Silves fra 7. til 15. august 2026. Visit Portugal beskriver arrangementet som en historisk genskabelse af middelalderlivet i Algarves tidligere hovedstad under den arabiske besættelse.

Programmet er centreret omkring byens historiske ramme med processioner, turneringer, bueskytter, håndværkere, købmænd og gadeartister nævnt af Visit Portugal.`,
    },
  },
  "festival-do-marisco": {
    "pt-pt": {
      title: "Festival do Marisco",
      short_description: "O Festival do Marisco é um evento de marisco, gastronomia e concertos em Olhão, de 10 a 15 de agosto de 2026.",
      description: `O Festival do Marisco realiza-se em Olhão de 10 a 15 de agosto de 2026. Fontes oficiais de turismo e municipais identificam o evento como organizado pela Fesnima e pelo Município de Olhão.

O festival decorre no Jardim Pescador Olhanense, com marisco, gastronomia e concertos ao vivo como núcleo da programação.`,
    },
    fr: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco est un événement de fruits de mer, gastronomie et concerts à Olhão du 10 au 15 août 2026.",
      description: `Festival do Marisco se déroule à Olhão du 10 au 15 août 2026. Les sources officielles touristiques et municipales indiquent que l'événement est organisé par Fesnima et la municipalité d'Olhão.

Le festival se tient au Jardim Pescador Olhanense, avec fruits de mer, gastronomie et concerts en direct au cœur du programme.`,
    },
    de: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco ist ein Festival für Meeresfrüchte, Gastronomie und Konzerte in Olhão vom 10. bis 15. August 2026.",
      description: `Festival do Marisco findet vom 10. bis 15. August 2026 in Olhão statt. Offizielle Tourismus- und Gemeindequellen nennen Fesnima und die Gemeinde Olhão als Organisatoren.

Das Festival findet im Jardim Pescador Olhanense statt, mit Meeresfrüchten, Gastronomie und Live-Konzerten als Kernprogramm.`,
    },
    es: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco es un evento de marisco, gastronomía y conciertos en Olhão del 10 al 15 de agosto de 2026.",
      description: `Festival do Marisco se celebra en Olhão del 10 al 15 de agosto de 2026. Fuentes oficiales turísticas y municipales identifican el evento como organizado por Fesnima y el Municipio de Olhão.

El festival se celebra en Jardim Pescador Olhanense, con marisco, gastronomía y conciertos en directo como núcleo del programa.`,
    },
    it: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco è un evento dedicato a frutti di mare, gastronomia e concerti a Olhão dal 10 al 15 agosto 2026.",
      description: `Festival do Marisco si svolge a Olhão dal 10 al 15 agosto 2026. Fonti ufficiali turistiche e municipali indicano l'evento come organizzato da Fesnima e dal Comune di Olhão.

Il festival si tiene al Jardim Pescador Olhanense, con frutti di mare, gastronomia e concerti dal vivo al centro del programma.`,
    },
    nl: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco is een festival voor zeevruchten, gastronomie en concerten in Olhão van 10 tot 15 augustus 2026.",
      description: `Festival do Marisco vindt van 10 tot 15 augustus 2026 plaats in Olhão. Officiële toeristische en gemeentelijke bronnen noemen Fesnima en de gemeente Olhão als organisatoren.

Het festival wordt gehouden in Jardim Pescador Olhanense, met zeevruchten, gastronomie en liveconcerten als kern van het programma.`,
    },
    sv: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco är ett evenemang för skaldjur, gastronomi och konserter i Olhão den 10-15 augusti 2026.",
      description: `Festival do Marisco äger rum i Olhão den 10-15 augusti 2026. Officiella turist- och kommunala källor anger att evenemanget arrangeras av Fesnima och Olhãos kommun.

Festivalen hålls i Jardim Pescador Olhanense, med skaldjur, gastronomi och livekonserter som programmets kärna.`,
    },
    no: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco er et arrangement for sjømat, gastronomi og konserter i Olhão fra 10. til 15. august 2026.",
      description: `Festival do Marisco finner sted i Olhão fra 10. til 15. august 2026. Offisielle turist- og kommunale kilder oppgir at arrangementet organiseres av Fesnima og Olhão kommune.

Festivalen holdes i Jardim Pescador Olhanense, med sjømat, gastronomi og livekonserter som kjernen i programmet.`,
    },
    da: {
      title: "Festival do Marisco",
      short_description: "Festival do Marisco er et event for skaldyr, gastronomi og koncerter i Olhão fra 10. til 15. august 2026.",
      description: `Festival do Marisco finder sted i Olhão fra 10. til 15. august 2026. Officielle turist- og kommunale kilder angiver, at eventet organiseres af Fesnima og Olhão kommune.

Festivalen afholdes i Jardim Pescador Olhanense med skaldyr, gastronomi og livekoncerter som kernen i programmet.`,
    },
  },
  "festival-mar-me-quer": {
    "pt-pt": {
      title: "Festival Mar Me Quer",
      short_description: "O Festival Mar Me Quer é um festival de música de verão na Zona Ribeirinha de Portimão, de 12 a 14 de agosto de 2026.",
      description: `O Festival Mar Me Quer regressa à Zona Ribeirinha de Portimão nos dias 12, 13 e 14 de agosto de 2026 para a sua quinta edição de verão.

Fontes oficiais e de bilheteira descrevem um festival centrado na música, com artistas anunciados como Maiara & Maraisa, Veigh e Orochi, e temas de música, sustentabilidade, inclusão e património local.`,
    },
    fr: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer est un festival de musique d'été sur la Zona Ribeirinha de Portimão du 12 au 14 août 2026.",
      description: `Festival Mar Me Quer revient sur la Zona Ribeirinha de Portimão les 12, 13 et 14 août 2026 pour sa cinquième édition estivale.

Les sources officielles et de billetterie décrivent un festival axé sur la musique, avec des artistes annoncés tels que Maiara & Maraisa, Veigh et Orochi, ainsi que des thèmes liés à la musique, la durabilité, l'inclusion et le patrimoine local.`,
    },
    de: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer ist ein Sommer-Musikfestival an der Zona Ribeirinha de Portimão vom 12. bis 14. August 2026.",
      description: `Festival Mar Me Quer kehrt am 12., 13. und 14. August 2026 für seine fünfte Sommerausgabe an die Zona Ribeirinha de Portimão zurück.

Offizielle und Ticketing-Quellen beschreiben ein musikfokussiertes Festival mit angekündigten Künstlern wie Maiara & Maraisa, Veigh und Orochi sowie Themen rund um Musik, Nachhaltigkeit, Inklusion und lokales Erbe.`,
    },
    es: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer es un festival de música de verano en la Zona Ribeirinha de Portimão del 12 al 14 de agosto de 2026.",
      description: `Festival Mar Me Quer vuelve a la Zona Ribeirinha de Portimão los días 12, 13 y 14 de agosto de 2026 para su quinta edición de verano.

Fuentes oficiales y de venta de entradas describen un festival centrado en la música, con artistas anunciados como Maiara & Maraisa, Veigh y Orochi, junto a temas de música, sostenibilidad, inclusión y patrimonio local.`,
    },
    it: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer è un festival musicale estivo nella Zona Ribeirinha de Portimão dal 12 al 14 agosto 2026.",
      description: `Festival Mar Me Quer torna nella Zona Ribeirinha de Portimão il 12, 13 e 14 agosto 2026 per la sua quinta edizione estiva.

Fonti ufficiali e di biglietteria descrivono un festival incentrato sulla musica, con artisti annunciati tra cui Maiara & Maraisa, Veigh e Orochi, insieme a temi di musica, sostenibilità, inclusione e patrimonio locale.`,
    },
    nl: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer is een zomers muziekfestival aan de Zona Ribeirinha de Portimão van 12 tot 14 augustus 2026.",
      description: `Festival Mar Me Quer keert op 12, 13 en 14 augustus 2026 terug naar de Zona Ribeirinha de Portimão voor de vijfde zomereditie.

Officiële en ticketbronnen beschrijven een muziekgericht festival met aangekondigde artiesten zoals Maiara & Maraisa, Veigh en Orochi, naast thema's als muziek, duurzaamheid, inclusie en lokaal erfgoed.`,
    },
    sv: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer är en sommarmusikfestival vid Zona Ribeirinha de Portimão den 12-14 augusti 2026.",
      description: `Festival Mar Me Quer återvänder till Zona Ribeirinha de Portimão den 12, 13 och 14 augusti 2026 för sin femte sommarupplaga.

Officiella källor och biljettkällor beskriver en musikfokuserad festival med annonserade artister som Maiara & Maraisa, Veigh och Orochi, tillsammans med teman som musik, hållbarhet, inkludering och lokalt kulturarv.`,
    },
    no: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer er en sommermusikkfestival ved Zona Ribeirinha de Portimão fra 12. til 14. august 2026.",
      description: `Festival Mar Me Quer vender tilbake til Zona Ribeirinha de Portimão 12., 13. og 14. august 2026 for sin femte sommerutgave.

Offisielle kilder og billettkilder beskriver en musikkfokusert festival med annonserte artister som Maiara & Maraisa, Veigh og Orochi, sammen med temaer som musikk, bærekraft, inkludering og lokal kulturarv.`,
    },
    da: {
      title: "Festival Mar Me Quer",
      short_description: "Festival Mar Me Quer er en sommermusikfestival ved Zona Ribeirinha de Portimão fra 12. til 14. august 2026.",
      description: `Festival Mar Me Quer vender tilbage til Zona Ribeirinha de Portimão den 12., 13. og 14. august 2026 til sin femte sommerudgave.

Officielle kilder og billetkilder beskriver en musikfokuseret festival med annoncerede kunstnere som Maiara & Maraisa, Veigh og Orochi samt temaer som musik, bæredygtighed, inklusion og lokal kulturarv.`,
    },
  },
  fatacil: {
    "pt-pt": {
      title: "FATACIL",
      short_description: "A FATACIL é uma feira de artesanato, turismo, agricultura, comércio, indústria e concertos em Lagoa, de 21 a 30 de agosto de 2026.",
      description: `A FATACIL realiza-se de 21 a 30 de agosto de 2026 no Parque Municipal de Feiras e Exposições de Lagoa. Fontes municipais oficiais identificam-na como a Feira de Artesanato, Turismo, Agricultura, Comércio e Indústria de Lagoa.

O programa de 2026 inclui concertos diários e áreas de expositores ligadas à agricultura, comércio, indústria, artesanato, participação institucional, restauração e sectores similares.`,
    },
    fr: {
      title: "FATACIL",
      short_description: "FATACIL est une foire d'artisanat, tourisme, agriculture, commerce, industrie et concerts à Lagoa du 21 au 30 août 2026.",
      description: `FATACIL se déroule du 21 au 30 août 2026 au Parque Municipal de Feiras e Exposições de Lagoa. Les sources municipales officielles l'identifient comme la foire de l'artisanat, du tourisme, de l'agriculture, du commerce et de l'industrie de Lagoa.

Le programme 2026 comprend des concerts quotidiens et des espaces exposants couvrant l'agriculture, le commerce, l'industrie, l'artisanat, la participation institutionnelle, la restauration et des secteurs similaires.`,
    },
    de: {
      title: "FATACIL",
      short_description: "FATACIL ist eine Messe für Handwerk, Tourismus, Landwirtschaft, Handel, Industrie und Konzerte in Lagoa vom 21. bis 30. August 2026.",
      description: `FATACIL findet vom 21. bis 30. August 2026 im Parque Municipal de Feiras e Exposições de Lagoa statt. Offizielle Gemeindequellen bezeichnen sie als Messe für Handwerk, Tourismus, Landwirtschaft, Handel und Industrie von Lagoa.

Das Programm 2026 umfasst tägliche Konzerte und Ausstellerbereiche zu Landwirtschaft, Handel, Industrie, Kunsthandwerk, institutioneller Beteiligung, Gastronomie und ähnlichen Sektoren.`,
    },
    es: {
      title: "FATACIL",
      short_description: "FATACIL es una feria de artesanía, turismo, agricultura, comercio, industria y conciertos en Lagoa del 21 al 30 de agosto de 2026.",
      description: `FATACIL se celebra del 21 al 30 de agosto de 2026 en el Parque Municipal de Feiras e Exposições de Lagoa. Fuentes municipales oficiales la identifican como la feria de artesanía, turismo, agricultura, comercio e industria de Lagoa.

El programa de 2026 incluye conciertos diarios y zonas de expositores dedicadas a agricultura, comercio, industria, artesanía, participación institucional, restauración y sectores similares.`,
    },
    it: {
      title: "FATACIL",
      short_description: "FATACIL è una fiera di artigianato, turismo, agricoltura, commercio, industria e concerti a Lagoa dal 21 al 30 agosto 2026.",
      description: `FATACIL si svolge dal 21 al 30 agosto 2026 al Parque Municipal de Feiras e Exposições de Lagoa. Fonti municipali ufficiali la identificano come la fiera dell'artigianato, turismo, agricoltura, commercio e industria di Lagoa.

Il programma 2026 include concerti quotidiani e aree espositive dedicate ad agricoltura, commercio, industria, artigianato, partecipazione istituzionale, ristorazione e settori simili.`,
    },
    nl: {
      title: "FATACIL",
      short_description: "FATACIL is een beurs voor ambacht, toerisme, landbouw, handel, industrie en concerten in Lagoa van 21 tot 30 augustus 2026.",
      description: `FATACIL vindt van 21 tot 30 augustus 2026 plaats in het Parque Municipal de Feiras e Exposições de Lagoa. Officiële gemeentelijke bronnen noemen het de beurs voor ambacht, toerisme, landbouw, handel en industrie van Lagoa.

Het programma van 2026 omvat dagelijkse concerten en exposantenzones voor landbouw, handel, industrie, ambachten, institutionele deelname, restaurants en vergelijkbare sectoren.`,
    },
    sv: {
      title: "FATACIL",
      short_description: "FATACIL är en mässa för hantverk, turism, jordbruk, handel, industri och konserter i Lagoa den 21-30 augusti 2026.",
      description: `FATACIL äger rum den 21-30 augusti 2026 på Parque Municipal de Feiras e Exposições de Lagoa. Officiella kommunala källor identifierar den som Lagoas mässa för hantverk, turism, jordbruk, handel och industri.

Programmet 2026 innehåller dagliga konserter och utställarområden för jordbruk, handel, industri, hantverk, institutionell medverkan, restauranger och liknande sektorer.`,
    },
    no: {
      title: "FATACIL",
      short_description: "FATACIL er en messe for håndverk, turisme, landbruk, handel, industri og konserter i Lagoa fra 21. til 30. august 2026.",
      description: `FATACIL finner sted fra 21. til 30. august 2026 på Parque Municipal de Feiras e Exposições de Lagoa. Offisielle kommunale kilder identifiserer den som Lagoas messe for håndverk, turisme, landbruk, handel og industri.

Programmet for 2026 inkluderer daglige konserter og utstillerområder for landbruk, handel, industri, håndverk, institusjonell deltakelse, restauranter og lignende sektorer.`,
    },
    da: {
      title: "FATACIL",
      short_description: "FATACIL er en messe for håndværk, turisme, landbrug, handel, industri og koncerter i Lagoa fra 21. til 30. august 2026.",
      description: `FATACIL finder sted fra 21. til 30. august 2026 på Parque Municipal de Feiras e Exposições de Lagoa. Officielle kommunale kilder identificerer den som Lagoas messe for håndværk, turisme, landbrug, handel og industri.

Programmet for 2026 omfatter daglige koncerter og udstillerområder for landbrug, handel, industri, kunsthåndværk, institutionel deltagelse, restauranter og lignende sektorer.`,
    },
  },
  "festival-f": {
    "pt-pt": {
      title: "Festival F",
      short_description: "O Festival F é um festival de três dias de música portuguesa e cultura em Faro, de 3 a 5 de setembro de 2026.",
      description: `O Festival F realiza-se em Faro de 3 a 5 de setembro de 2026, com fontes oficiais a confirmarem a 11.ª edição e a sua identidade como o "Último Grande Festival de Verão".

O festival decorre na zona histórica da Vila Adentro e é organizado pelo Município de Faro, Sons em Trânsito, Teatro das Figuras e AmbiFaro, com programação musical e cultural ligada à cultura portuguesa.`,
    },
    fr: {
      title: "Festival F",
      short_description: "Festival F est un festival de trois jours de musique portugaise et de culture à Faro du 3 au 5 septembre 2026.",
      description: `Festival F se déroule à Faro du 3 au 5 septembre 2026, les sources officielles confirmant la 11e édition et son identité comme le "Dernier Grand Festival de l'Été".

Le festival a lieu dans le quartier historique de Vila Adentro et est organisé par la municipalité de Faro, Sons em Trânsito, Teatro das Figuras et AmbiFaro, avec une programmation musicale et culturelle liée à la culture portugaise.`,
    },
    de: {
      title: "Festival F",
      short_description: "Festival F ist ein dreitägiges Festival für portugiesische Musik und Kultur in Faro vom 3. bis 5. September 2026.",
      description: `Festival F findet vom 3. bis 5. September 2026 in Faro statt. Offizielle Quellen bestätigen die 11. Ausgabe und seine Identität als "Letztes großes Festival des Sommers".

Das Festival findet im historischen Bereich Vila Adentro statt und wird von der Gemeinde Faro, Sons em Trânsito, Teatro das Figuras und AmbiFaro organisiert, mit Musik- und Kulturprogramm rund um portugiesische Kultur.`,
    },
    es: {
      title: "Festival F",
      short_description: "Festival F es un festival de tres días de música portuguesa y cultura en Faro del 3 al 5 de septiembre de 2026.",
      description: `Festival F se celebra en Faro del 3 al 5 de septiembre de 2026, con fuentes oficiales que confirman la 11.ª edición y su identidad como el "Último Gran Festival del Verano".

El festival se celebra en la zona histórica de Vila Adentro y está organizado por el Municipio de Faro, Sons em Trânsito, Teatro das Figuras y AmbiFaro, con programación musical y cultural vinculada a la cultura portuguesa.`,
    },
    it: {
      title: "Festival F",
      short_description: "Festival F è un festival di tre giorni di musica portoghese e cultura a Faro dal 3 al 5 settembre 2026.",
      description: `Festival F si svolge a Faro dal 3 al 5 settembre 2026, con fonti ufficiali che confermano l'11ª edizione e la sua identità come "Ultimo Grande Festival dell'Estate".

Il festival si tiene nell'area storica di Vila Adentro ed è organizzato dal Comune di Faro, Sons em Trânsito, Teatro das Figuras e AmbiFaro, con programmazione musicale e culturale legata alla cultura portoghese.`,
    },
    nl: {
      title: "Festival F",
      short_description: "Festival F is een driedaags festival voor Portugese muziek en cultuur in Faro van 3 tot 5 september 2026.",
      description: `Festival F vindt van 3 tot 5 september 2026 plaats in Faro, waarbij officiële bronnen de 11e editie en de identiteit als het "Laatste Grote Festival van de Zomer" bevestigen.

Het festival wordt gehouden in het historische gebied Vila Adentro en wordt georganiseerd door de gemeente Faro, Sons em Trânsito, Teatro das Figuras en AmbiFaro, met muziek- en cultuurprogrammering rond Portugese cultuur.`,
    },
    sv: {
      title: "Festival F",
      short_description: "Festival F är en tredagars festival för portugisisk musik och kultur i Faro den 3-5 september 2026.",
      description: `Festival F äger rum i Faro den 3-5 september 2026, med officiella källor som bekräftar den 11:e upplagan och dess identitet som "Sommarens sista stora festival".

Festivalen hålls i det historiska Vila Adentro-området och organiseras av Faros kommun, Sons em Trânsito, Teatro das Figuras och AmbiFaro, med musik- och kulturprogram kopplat till portugisisk kultur.`,
    },
    no: {
      title: "Festival F",
      short_description: "Festival F er en tredagers festival for portugisisk musikk og kultur i Faro fra 3. til 5. september 2026.",
      description: `Festival F finner sted i Faro fra 3. til 5. september 2026, med offisielle kilder som bekrefter den 11. utgaven og identiteten som "Sommerens siste store festival".

Festivalen holdes i det historiske Vila Adentro-området og organiseres av Faro kommune, Sons em Trânsito, Teatro das Figuras og AmbiFaro, med musikk- og kulturprogram knyttet til portugisisk kultur.`,
    },
    da: {
      title: "Festival F",
      short_description: "Festival F er en tredages festival for portugisisk musik og kultur i Faro fra 3. til 5. september 2026.",
      description: `Festival F finder sted i Faro fra 3. til 5. september 2026, hvor officielle kilder bekræfter den 11. udgave og dens identitet som "Sommerens sidste store festival".

Festivalen afholdes i det historiske Vila Adentro-område og organiseres af Faro kommune, Sons em Trânsito, Teatro das Figuras og AmbiFaro, med musik- og kulturprogram knyttet til portugisisk kultur.`,
    },
  },
  "motogp-grand-prix-of-portugal": {
    "pt-pt": {
      title: "Grande Prémio MotoGP de Portugal",
      short_description: "O Grande Prémio MotoGP de Portugal é um evento internacional de motociclismo em Portimão, de 20 a 22 de novembro de 2026.",
      description: `O Grande Prémio MotoGP de Portugal realiza-se no Autódromo Internacional do Algarve, em Portimão, de 20 a 22 de novembro de 2026. Fontes oficiais da MotoGP identificam o evento como o Repsol Grand Prix of Portugal no circuito algarvio.

A página oficial do recinto lista MotoGP, Moto2 e Moto3 como categorias presentes, enquanto a página oficial da MotoGP indica 4,59 km de extensão do circuito, com 9 curvas à direita e 6 à esquerda.`,
    },
    fr: {
      title: "Grand Prix MotoGP du Portugal",
      short_description: "Le Grand Prix MotoGP du Portugal est un événement international de moto à Portimão du 20 au 22 novembre 2026.",
      description: `Le Grand Prix MotoGP du Portugal se déroule à l'Autódromo Internacional do Algarve, à Portimão, du 20 au 22 novembre 2026. Les sources officielles MotoGP listent l'événement comme le Repsol Grand Prix of Portugal sur le circuit de l'Algarve.

La page officielle du site indique les catégories MotoGP, Moto2 et Moto3, tandis que la page officielle MotoGP donne une longueur de circuit de 4,59 km, avec 9 virages à droite et 6 à gauche.`,
    },
    de: {
      title: "MotoGP Grand Prix von Portugal",
      short_description: "Der MotoGP Grand Prix von Portugal ist ein internationales Motorradrennen in Portimão vom 20. bis 22. November 2026.",
      description: `Der MotoGP Grand Prix von Portugal findet vom 20. bis 22. November 2026 auf dem Autódromo Internacional do Algarve in Portimão statt. Offizielle MotoGP-Quellen führen das Event als Repsol Grand Prix of Portugal auf der Algarve-Strecke.

Die offizielle Seite des Veranstaltungsorts nennt MotoGP, Moto2 und Moto3 als vertretene Kategorien, während die offizielle MotoGP-Seite die Streckenlänge mit 4,59 km sowie 9 Rechts- und 6 Linkskurven angibt.`,
    },
    es: {
      title: "Gran Premio MotoGP de Portugal",
      short_description: "El Gran Premio MotoGP de Portugal es un evento internacional de motociclismo en Portimão del 20 al 22 de noviembre de 2026.",
      description: `El Gran Premio MotoGP de Portugal se celebra en el Autódromo Internacional do Algarve, en Portimão, del 20 al 22 de noviembre de 2026. Fuentes oficiales de MotoGP listan el evento como el Repsol Grand Prix of Portugal en el circuito del Algarve.

La página oficial del recinto incluye MotoGP, Moto2 y Moto3 como categorías presentes, mientras que la página oficial de MotoGP indica que el circuito mide 4,59 km, con 9 curvas a la derecha y 6 a la izquierda.`,
    },
    it: {
      title: "Gran Premio MotoGP del Portogallo",
      short_description: "Il Gran Premio MotoGP del Portogallo è un evento motociclistico internazionale a Portimão dal 20 al 22 novembre 2026.",
      description: `Il Gran Premio MotoGP del Portogallo si svolge all'Autódromo Internacional do Algarve di Portimão dal 20 al 22 novembre 2026. Fonti ufficiali MotoGP indicano l'evento come Repsol Grand Prix of Portugal sul circuito dell'Algarve.

La pagina ufficiale della sede elenca MotoGP, Moto2 e Moto3 tra le categorie presenti, mentre la pagina ufficiale MotoGP indica una lunghezza del circuito di 4,59 km, con 9 curve a destra e 6 a sinistra.`,
    },
    nl: {
      title: "MotoGP Grand Prix van Portugal",
      short_description: "De MotoGP Grand Prix van Portugal is een internationaal motorrace-evenement in Portimão van 20 tot 22 november 2026.",
      description: `De MotoGP Grand Prix van Portugal vindt van 20 tot 22 november 2026 plaats op het Autódromo Internacional do Algarve in Portimão. Officiële MotoGP-bronnen vermelden het evenement als de Repsol Grand Prix of Portugal op het Algarve-circuit.

De officiële locatiepagina vermeldt MotoGP, Moto2 en Moto3 als aanwezige categorieën, terwijl de officiële MotoGP-pagina de circuitlengte geeft als 4,59 km met 9 rechterbochten en 6 linkerbochten.`,
    },
    sv: {
      title: "MotoGP:s Portugals Grand Prix",
      short_description: "MotoGP:s Portugals Grand Prix är ett internationellt motorcykelevenemang i Portimão den 20-22 november 2026.",
      description: `MotoGP:s Portugals Grand Prix äger rum på Autódromo Internacional do Algarve i Portimão den 20-22 november 2026. Officiella MotoGP-källor listar evenemanget som Repsol Grand Prix of Portugal på Algarve-banan.

Den officiella arenans sida listar MotoGP, Moto2 och Moto3 som närvarande kategorier, medan MotoGP:s officiella sida anger banlängden till 4,59 km med 9 högerkurvor och 6 vänsterkurvor.`,
    },
    no: {
      title: "MotoGP Grand Prix i Portugal",
      short_description: "MotoGP Grand Prix i Portugal er et internasjonalt motorsykkelarrangement i Portimão fra 20. til 22. november 2026.",
      description: `MotoGP Grand Prix i Portugal finner sted på Autódromo Internacional do Algarve i Portimão fra 20. til 22. november 2026. Offisielle MotoGP-kilder lister arrangementet som Repsol Grand Prix of Portugal på Algarve-banen.

Den offisielle arenautsiden lister MotoGP, Moto2 og Moto3 som kategorier, mens MotoGPs offisielle side oppgir banelengden til 4,59 km med 9 høyresvinger og 6 venstresvinger.`,
    },
    da: {
      title: "MotoGP Grand Prix i Portugal",
      short_description: "MotoGP Grand Prix i Portugal er et internationalt motorcykelløb i Portimão fra 20. til 22. november 2026.",
      description: `MotoGP Grand Prix i Portugal finder sted på Autódromo Internacional do Algarve i Portimão fra 20. til 22. november 2026. Officielle MotoGP-kilder angiver eventet som Repsol Grand Prix of Portugal på Algarve-banen.

Den officielle side for stedet viser MotoGP, Moto2 og Moto3 som kategorier, mens MotoGP's officielle eventside angiver banens længde til 4,59 km med 9 højresving og 6 venstresving.`,
    },
  },
};
