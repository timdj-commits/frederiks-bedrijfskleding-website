/**
 * Lokale landingspagina's (/regio/[plaats]). Unieke, diepere content per plaats
 * voor lokale SEO en AEO. Geen em-dashes of clichéwoorden. Houd teksten uniek.
 */
export type Plaats = {
  slug: string;
  name: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  body: string[];
  gebieden: string[];
  populair: string[]; // branche-slugs
  faq: { q: string; a: string }[];
  afstand: string;
};

export const plaatsen: Plaats[] = [
  {
    slug: 'hengelo-gld',
    name: 'Hengelo (Gld)',
    metaTitle: 'Bedrijfskleding Hengelo (Gld)',
    metaDescription:
      'Bedrijfskleding en werkkleding in Hengelo (Gld). Showroom en bedrukkerij in de Brouwersmolen. Persoonlijk advies, passen op locatie en logo in eigen huis.',
    intro:
      'In Hengelo zijn we thuis. Onze showroom en bedrukkerij zitten in de Brouwersmolen aan de Kruisbergseweg, midden in de Achterhoek.',
    body: [
      'Hengelo Gld is een dorp waar ondernemen en aanpakken in de aard zitten, van bouw en techniek tot de horeca rond de Spalstraat. Wij kennen die bedrijven, en zij kennen ons. Je loopt op afspraak binnen in de molen of we komen bij je langs om te passen.',
      'Omdat we hier zelf zitten, zijn de lijnen kort. Een nieuwe medewerker die snel kleding nodig heeft, een spoedklus die bedrukt moet, of een extra jas die nog gepast wordt: het is allemaal zo geregeld. Het bedrukken en borduren doen we ter plekke, dus je ziet vooraf het resultaat.',
      'We leveren in heel Hengelo en de buurtschappen eromheen, van Keijenborg tot Veldhoek en Varssel. Van werkbroek en hi-vis tot een verzorgde representatieve lijn, afgestemd op het werk en de uitstraling van je bedrijf.',
    ],
    gebieden: ['Centrum en Spalstraat', 'Bedrijventerrein Winkelskamp', 'Keijenborg', 'Veldhoek', 'Varssel'],
    populair: ['bouw-en-infra', 'horeca-en-hospitality', 'agri-en-milieu'],
    faq: [
      { q: 'Kan ik langskomen in de showroom in Hengelo?', a: 'Ja, op afspraak. We zitten in de Brouwersmolen aan de Kruisbergseweg 9. Bel of vraag online een afspraak aan, dan zorgen we dat we de tijd voor je hebben.' },
      { q: 'Komen jullie ook bij mijn bedrijf in Hengelo langs?', a: 'Zeker. Passen op locatie is juist onze kracht, en in Hengelo zijn we zo bij je. Zo kost het je geen werktijd.' },
    ],
    afstand: 'Onze thuisbasis',
  },
  {
    slug: 'doetinchem',
    name: 'Doetinchem',
    metaTitle: 'Bedrijfskleding Doetinchem',
    metaDescription:
      'Werkkleding en bedrijfskleding in Doetinchem. Persoonlijk advies, passen op locatie en logo bedrukken of borduren door Frederiks Bedrijfskleding.',
    intro:
      'Doetinchem is de grootste stad van de Achterhoek en een belangrijke thuisbasis voor onze klanten in bouw, techniek, transport en horeca.',
    body: [
      'Rond Doetinchem zit veel bedrijvigheid, van de terreinen bij Wijnbergen en Verheulsweide tot het A18 Bedrijvenpark. Daar werken bedrijven die hun team herkenbaar en veilig willen kleden, zonder zelf een webshop uit te hoeven pluizen. Wij komen langs, passen en stellen samen een pakket samen.',
      'Voor werk langs de weg of op de bouw leveren we hi-vis in de juiste klasse en S3-schoenen. Voor de buitendienst en het klantcontact een verzorgde, representatieve lijn. En voor de horeca in het centrum koksbuizen, schorten en bediening die de hele dienst netjes blijven.',
      'We bedienen ook de kernen rondom, zoals Gaanderen, Wehl en Doetinchem-Wijnbergen. Het logo brengen we in eigen huis aan, en je kledinglijn leggen we vast zodat nabestellen voor een nieuwe kracht een belletje is.',
    ],
    gebieden: ['Wijnbergen', 'Verheulsweide', 'A18 Bedrijvenpark', 'Gaanderen', 'Wehl'],
    populair: ['bouw-en-infra', 'industrie-en-transport', 'horeca-en-hospitality'],
    faq: [
      { q: 'Leveren jullie ook hi-vis voor wegwerkzaamheden in Doetinchem?', a: 'Ja. Voor werk langs de weg leveren we zichtbaarheidskleding volgens EN ISO 20471 in de juiste klasse. We bepalen samen welke klasse bij je werk hoort.' },
      { q: 'Hoe snel kunnen jullie in Doetinchem leveren?', a: 'Doetinchem ligt op ongeveer een kwartier van onze showroom, dus we zijn snel bij je om te passen. Ligt je kledinglijn vast, dan regelen we nabestellingen meestal binnen een paar werkdagen.' },
    ],
    afstand: 'Ongeveer 15 minuten vanaf Hengelo',
  },
  {
    slug: 'zutphen',
    name: 'Zutphen',
    metaTitle: 'Bedrijfskleding Zutphen',
    metaDescription:
      'Bedrijfskleding en werkkleding in Zutphen. Maatwerk met persoonlijk advies, en bedrukken of borduren in eigen huis door Frederiks Bedrijfskleding.',
    intro:
      'Voor bedrijven in Zutphen en omgeving leveren we werkkleding met persoonlijke aandacht. Eén aanspreekpunt, advies op maat en snelle nalevering.',
    body: [
      'Zutphen combineert een sterke maakindustrie op De Mars met een levendige Hanzestad vol horeca en winkels. Die twee werelden vragen elk om andere kleding: stevig en veilig waar het moet, verzorgd en representatief waar dat telt. Wij stemmen het per bedrijf af.',
      'We komen naar je toe om te passen, ook in grotere maten, en kijken samen welke merken en modellen bij je werk passen. Het logo brengen we slijtvast aan, bedrukt of geborduurd, zodat je team er maanden later nog net zo verzorgd uitziet.',
      'Naast Zutphen zelf bedienen we de omliggende kernen zoals Warnsveld en Eefde. Van industrie en bouw tot zorg en horeca: we kleden uiteenlopende bedrijven en houden je lijn consistent.',
    ],
    gebieden: ['Industrieterrein De Mars', 'Binnenstad', 'Warnsveld', 'Eefde', 'Revelhorst'],
    populair: ['industrie-en-transport', 'bouw-en-infra', 'horeca-en-hospitality'],
    faq: [
      { q: 'Werken jullie ook voor bedrijven op De Mars?', a: 'Ja, veel van onze klanten in Zutphen zitten op of rond industrieterrein De Mars. We komen langs om te passen en leveren de juiste kleding en veiligheidsschoenen voor het werk.' },
      { q: 'Kunnen jullie zowel industrie- als horecakleding leveren?', a: 'Zeker. We leveren stevige werkkleding voor de industrie en bouw, en verzorgde koksbuizen, schorten en bediening voor de horeca in de binnenstad.' },
    ],
    afstand: 'Ongeveer 25 minuten vanaf Hengelo',
  },
  {
    slug: 'zelhem',
    name: 'Zelhem',
    metaTitle: 'Bedrijfskleding Zelhem',
    metaDescription:
      'Werkkleding en bedrijfskleding in Zelhem met persoonlijk advies. Maatwerk, bedrukken en borduren door Frederiks Bedrijfskleding.',
    intro:
      'Zelhem ligt bij ons om de hoek. Voor de bouw-, techniek- en agrarische bedrijven hier zijn we snel ter plaatse om te passen en te leveren.',
    body: [
      'Zelhem heeft een nuchtere, agrarische inslag met daarnaast bouw en techniek op het bedrijventerrein Wittebrink. De korte afstand tot onze showroom betekent korte lijnen: een nabestelling of een nieuwe medewerker regelen we zonder dat je hoeft te wachten op een anonieme webshop.',
      'Voor de boeren en loonbedrijven rond Zelhem leveren we weerbestendige, stevige kleding die tegen modder en machines kan, met de juiste schoenen of laarzen erbij. Voor bouw en techniek de bekende werkbroeken, jassen en hi-vis.',
      'We werken ook in de buurtschappen rondom, zoals Halle en Velswijk. Het bedrukken en borduren doen we in eigen huis, dus snel en met grip op de kwaliteit.',
    ],
    gebieden: ['Bedrijventerrein Wittebrink', 'Centrum', 'Halle', 'Velswijk'],
    populair: ['agri-en-milieu', 'bouw-en-infra', 'industrie-en-transport'],
    faq: [
      { q: 'Hebben jullie kleding die tegen het werk op het land kan?', a: 'Ja. Voor de agrarische sector leveren we overalls, tuinbroeken en weerbestendige jassen die tegen modder, machines en lange dagen kunnen, plus stevige schoenen of laarzen.' },
      { q: 'Hoe snel zijn jullie in Zelhem?', a: 'Zelhem ligt op ongeveer tien minuten van onze showroom. We zijn dus zo bij je om te passen en te leveren.' },
    ],
    afstand: 'Ongeveer 10 minuten vanaf Hengelo',
  },
  {
    slug: 'vorden',
    name: 'Vorden',
    metaTitle: 'Bedrijfskleding Vorden',
    metaDescription:
      'Bedrijfskleding en werkkleding in Vorden. Persoonlijk advies, passen op locatie en eigen bedrukkerij door Frederiks Bedrijfskleding.',
    intro:
      'Vorden ligt vlak bij onze showroom. Voor de ondernemers in dit kastelendorp zijn we zo langs om kleding te passen en advies te geven.',
    body: [
      'Vorden staat bekend om zijn acht kastelen en zijn toeristische trekkracht, maar er zit ook een gezonde mix van bouwbedrijven, hoveniers, horeca en zorg. Voor al die sectoren stellen we een passende kledinglijn samen, afgestemd op het werk en de uitstraling.',
      'Doordat we dichtbij zitten, kennen we de klanten en is meedenken vanzelfsprekend. We komen langs om te passen, kiezen samen merken, kleuren en logo-posities, en leggen alles vast voor een snelle nalevering.',
      'We bedienen ook de buurtschappen rond Vorden, zoals Wichmond en Kranenburg. Van een hovenier met weerbestendige kleding tot een restaurant met geborduurde koksbuizen.',
    ],
    gebieden: ['Centrum', 'Bedrijventerrein Werkveld', 'Wichmond', 'Kranenburg'],
    populair: ['agri-en-milieu', 'horeca-en-hospitality', 'representatief'],
    faq: [
      { q: 'Verzorgen jullie ook kleding voor de horeca in Vorden?', a: 'Ja. Voor restaurants en hotels leveren we koksbuizen, schorten en bediening, met je logo geborduurd voor een verzorgde uitstraling.' },
      { q: 'Komen jullie naar Vorden toe om te passen?', a: 'Zeker, Vorden ligt op een kleine tien minuten. We komen graag langs zodat iedereen goed past zonder werktijd te verliezen.' },
    ],
    afstand: 'Ongeveer 10 minuten vanaf Hengelo',
  },
  {
    slug: 'ruurlo',
    name: 'Ruurlo',
    metaTitle: 'Bedrijfskleding Ruurlo',
    metaDescription:
      'Werkkleding en bedrijfskleding in Ruurlo. Maatwerk, persoonlijk advies en bedrukken of borduren in eigen huis.',
    intro:
      'Voor bedrijven in Ruurlo en omgeving leveren we werkkleding, veiligheidsschoenen en maatwerk met persoonlijke aandacht.',
    body: [
      'Ruurlo heeft een stevige maakindustrie en veel bouw- en agrarische bedrijven, met bedrijvigheid op De Venterkamp. We kiezen kleding die past bij het werk: slijtvast en veilig waar dat nodig is, comfortabel voor de lange dagen die er gemaakt worden.',
      'Passen doen we bij je op de zaak. Het logo brengen we in eigen huis aan, dus snel en met controle op de kwaliteit. Verbleekte hi-vis of versleten schoenen vervangen we op tijd, zodat je team veilig en verzorgd blijft.',
      'We werken in heel Ruurlo en de omliggende kernen. Of het nu gaat om een loonbedrijf, een aannemer of een zaak met klantcontact, we stellen een lijn samen die klopt.',
    ],
    gebieden: ['Bedrijventerrein De Venterkamp', 'Centrum', 'Buitengebied'],
    populair: ['industrie-en-transport', 'bouw-en-infra', 'agri-en-milieu'],
    faq: [
      { q: 'Leveren jullie ook veiligheidsschoenen in Ruurlo?', a: 'Ja, we leveren veiligheidsschoenen van S1 tot S3 met persoonlijk pasadvies, afgestemd op het werk en het terrein waarop je werkt.' },
      { q: 'Kunnen jullie een vaste kledinglijn voor ons team opzetten?', a: 'Zeker. We leggen per functie vast wat iemand draagt, inclusief maten en logo-positie, zodat nabestellen voor nieuwe medewerkers snel gaat.' },
    ],
    afstand: 'Ongeveer 15 minuten vanaf Hengelo',
  },
  {
    slug: 'borculo',
    name: 'Borculo',
    metaTitle: 'Bedrijfskleding Borculo',
    metaDescription:
      'Bedrijfskleding en werkkleding in Borculo met persoonlijk advies. Logo bedrukken of borduren door Frederiks Bedrijfskleding.',
    intro:
      'Borculo en omgeving bedienen we met dezelfde persoonlijke aanpak: langskomen, passen en een pakket samenstellen dat klopt.',
    body: [
      'Borculo heeft een sterke industriële en agrarische basis, met bedrijvigheid op de terreinen rond de stad. Die bedrijven vragen om stevige, functionele kleding. We leveren werkbroeken, jassen, hi-vis en veiligheidsschoenen in de juiste normklasse, afgestemd op het werk.',
      'Doordat we de hele lijn vastleggen, blijft je team uniform en gaat nabestellen snel. Eén aanspreekpunt voor advies, bedrukken en levering, zonder dat je met meerdere partijen hoeft te schakelen.',
      'We werken ook in de kernen rondom, zoals Geesteren en Gelselaar. Het logo brengen we in eigen huis aan, dus je ziet vooraf het resultaat en we schakelen snel.',
    ],
    gebieden: ['Bedrijventerrein Overberkel', 'Centrum', 'Geesteren', 'Gelselaar'],
    populair: ['industrie-en-transport', 'bouw-en-infra', 'agri-en-milieu'],
    faq: [
      { q: 'Verzorgen jullie ook de bedrukking in Borculo?', a: 'Ja, we bedrukken en borduren in eigen huis. Je logo brengen we slijtvast aan en je ziet vooraf hoe het eruitkomt.' },
      { q: 'Hebben jullie ook grote maten?', a: 'Zeker. We hebben een ruim maatbereik en bestellen indien nodig een pasmaat, zodat iedereen op het team goed zit.' },
    ],
    afstand: 'Ongeveer 20 minuten vanaf Hengelo',
  },
  {
    slug: 'doesburg',
    name: 'Doesburg',
    metaTitle: 'Bedrijfskleding Doesburg',
    metaDescription:
      'Werkkleding en bedrijfskleding in Doesburg met persoonlijk advies. Logo bedrukken of borduren door Frederiks Bedrijfskleding.',
    intro:
      'Ondernemers in Doesburg en de Liemers helpen we aan praktische, verzorgde bedrijfskleding. Van advies tot bedrukken, alles op één plek.',
    body: [
      'Doesburg is een Hanzestad op de grens van de Achterhoek en de Liemers, met een historisch centrum vol horeca en winkels en daarbuiten bouw- en technische bedrijven. Voor beide werelden hebben we een passende lijn, van koksbuis en schort tot werkbroek en hi-vis.',
      'We komen langs om te passen en stemmen kleur en logo af op je huisstijl, zodat je merk binnen en buiten hetzelfde overkomt. Het bedrukken en borduren regelen we in eigen huis.',
      'Vanuit Doesburg bedienen we ook de omliggende plaatsen in de Liemers. Eén vast aanspreekpunt dat je bedrijf kent, met snelle nalevering als er iemand bij komt.',
    ],
    gebieden: ['Historisch centrum', 'Bedrijventerrein Beinum', 'Angerlo', 'De Liemers'],
    populair: ['horeca-en-hospitality', 'bouw-en-infra', 'representatief'],
    faq: [
      { q: 'Werken jullie ook in de Liemers?', a: 'Ja, vanuit Doesburg bedienen we ook de plaatsen in de Liemers. We komen langs om te passen en leveren kleding op maat.' },
      { q: 'Kunnen jullie kleding op onze huisstijl afstemmen?', a: 'Zeker. We kiezen kleur, model en logo-positie zo dat het past bij je huisstijl en consistent is over het hele team.' },
    ],
    afstand: 'Ongeveer 25 minuten vanaf Hengelo',
  },
  {
    slug: 'lichtenvoorde',
    name: 'Lichtenvoorde',
    metaTitle: 'Bedrijfskleding Lichtenvoorde',
    metaDescription:
      'Bedrijfskleding en werkkleding in Lichtenvoorde. Maatwerk, persoonlijk advies en bedrukken of borduren in eigen huis.',
    intro:
      'Voor de Oost-Achterhoek rond Lichtenvoorde leveren we werkkleding voor bouw, techniek, agri en horeca, inclusief bedrukken in eigen huis.',
    body: [
      'Lichtenvoorde heeft een actieve ondernemersgemeenschap en veel maakbedrijven, met bedrijvigheid op De Kamp. We kiezen kleding die lang meegaat en comfortabel blijft over een hele werkdag, met de veiligheidsnormen die bij het werk horen.',
      'Het logo brengen we slijtvast aan en we leggen de kledinglijn per bedrijf vast. Een nieuwe medewerker of nabestelling is daarna binnen een paar dagen geregeld, zonder gedoe.',
      'We werken in heel Lichtenvoorde en de kernen eromheen, zoals Vragender, Lievelde en Harreveld. Van bouw en techniek tot de horeca en het bloeiende verenigingsleven.',
    ],
    gebieden: ['Bedrijventerrein De Kamp', 'Centrum', 'Vragender', 'Lievelde', 'Harreveld'],
    populair: ['bouw-en-infra', 'agri-en-milieu', 'sport-en-promotie'],
    faq: [
      { q: 'Leveren jullie ook sport- en promotiekleding in Lichtenvoorde?', a: 'Ja. Naast bedrijfskleding verzorgen we sport- en promotiekleding voor clubs, teams en evenementen, bedrukt of geborduurd met logo of sponsor.' },
      { q: 'Hoe snel leveren jullie na een akkoord?', a: 'Zodra je lijn bij ons vastligt, regelen we nabestellingen meestal binnen een paar werkdagen, inclusief logo.' },
    ],
    afstand: 'Ongeveer 25 minuten vanaf Hengelo',
  },
  {
    slug: 'groenlo',
    name: 'Groenlo',
    metaTitle: 'Bedrijfskleding Groenlo',
    metaDescription:
      'Werkkleding en bedrijfskleding in Groenlo met persoonlijk advies. Maatwerk, bedrukken en borduren door Frederiks Bedrijfskleding.',
    intro:
      'In Groenlo en omgeving leveren we werkkleding met persoonlijke aandacht, van de bouw tot de horeca en de maakindustrie.',
    body: [
      'Groenlo is een vestingstad met een sterke industrie en een levendig verenigingsleven. Op het regionale bedrijvenpark Laarberg en daarbuiten zit veel maakindustrie en logistiek, die om functionele, slijtvaste kleding vraagt.',
      'Naast bedrijfskleding verzorgen we daarom ook sport- en promotiekleding voor de vele clubs en evenementen, bedrukt of geborduurd met logo of sponsor. Voor bedrijven stellen we een vaste lijn samen en passen we op locatie.',
      'Het bedrukken doen we zelf, dus je ziet vooraf het resultaat en we schakelen snel. We werken in heel Groenlo en de kernen eromheen, zoals Beltrum en Zwolle (Gld).',
    ],
    gebieden: ['Bedrijvenpark Laarberg', 'Centrum en vesting', 'Beltrum', 'Zwolle (Gld)'],
    populair: ['industrie-en-transport', 'sport-en-promotie', 'horeca-en-hospitality'],
    faq: [
      { q: 'Verzorgen jullie clubkleding voor verenigingen in Groenlo?', a: 'Ja. Voor clubs, teams en evenementen leveren we shirts, hoodies en accessoires met logo of sponsor, in kleine en grote oplagen.' },
      { q: 'Werken jullie ook voor bedrijven op Laarberg?', a: 'Zeker. Voor de maakindustrie en logistiek op en rond Laarberg leveren we functionele werkkleding, hi-vis en veiligheidsschoenen.' },
    ],
    afstand: 'Ongeveer 25 minuten vanaf Hengelo',
  },
  {
    slug: 'aalten',
    name: 'Aalten',
    metaTitle: 'Bedrijfskleding Aalten',
    metaDescription:
      'Bedrijfskleding en werkkleding in Aalten. Persoonlijk advies, passen op locatie en eigen bedrukkerij door Frederiks Bedrijfskleding.',
    intro:
      'Ook in Aalten en omgeving zijn we actief. We komen langs, passen op locatie en stellen een kledingpakket samen dat past bij je branche.',
    body: [
      'Aalten heeft een rijke textielhistorie en veel familiebedrijven in de bouw, techniek en agrarische sector. Die waarderen een leverancier die meedenkt en ze kent, niet een anonieme webshop. Daar zijn we op gebouwd.',
      'We leveren stevige, veilige werkkleding en schoenen in de juiste normklasse, brengen het logo in eigen huis aan en leggen de maten vast voor een snelle nalevering. Passen doen we bij je op de zaak.',
      'We bedienen heel Aalten en de kernen rondom, zoals Bredevoort, Dinxperlo en IJzerlo. Van een akkerbouwer tot een installatiebedrijf, we stemmen de kleding af op het werk.',
    ],
    gebieden: ["Bedrijventerrein 't Broek", 'Centrum', 'Bredevoort', 'Dinxperlo', 'IJzerlo'],
    populair: ['bouw-en-infra', 'agri-en-milieu', 'industrie-en-transport'],
    faq: [
      { q: 'Werken jullie ook voor familiebedrijven in Aalten?', a: 'Juist. Veel van onze klanten in Aalten zijn familiebedrijven die persoonlijk contact waarderen. Je krijgt bij ons één vast aanspreekpunt dat je bedrijf kent.' },
      { q: 'Komen jullie helemaal naar Aalten toe?', a: 'Ja. Ondanks de afstand houden we het persoonlijk: we komen langs om te passen en zorgen dat nabestellingen snel je kant op komen.' },
    ],
    afstand: 'Ongeveer 30 minuten vanaf Hengelo',
  },
  {
    slug: 'winterswijk',
    name: 'Winterswijk',
    metaTitle: 'Bedrijfskleding Winterswijk',
    metaDescription:
      'Werkkleding en bedrijfskleding in Winterswijk met persoonlijk advies. Maatwerk, bedrukken en borduren door Frederiks Bedrijfskleding.',
    intro:
      'Ook in Winterswijk en omgeving zijn we actief. We stellen samen een kledinglijn samen die past bij je branche en uitstraling, en we komen langs om te passen.',
    body: [
      'Winterswijk ligt in de oosthoek van de Achterhoek en heeft een eigen, sterke economie met industrie, bouw, zorg en toerisme. Op de bedrijventerreinen rond de stad zit veel maakindustrie, terwijl het centrum bruist van horeca en winkels.',
      'Voor al die sectoren leveren we passende kleding, van werkbroek en hi-vis tot tuniek, koksbuis en een verzorgde horeca-outfit. We kiezen merken en modellen die bij het werk passen en gaan voor kwaliteit die lang meegaat.',
      'Ondanks de afstand houden we het persoonlijk: we komen langs om te passen en zorgen dat nabestellingen snel je kant op komen. We werken ook in de kernen rondom, zoals Meddo, Kotten en Henxel.',
    ],
    gebieden: ['Bedrijventerrein Misterweg', 'Arrisveld', 'Centrum', 'Meddo', 'Kotten'],
    populair: ['industrie-en-transport', 'zorg-en-beauty', 'horeca-en-hospitality'],
    faq: [
      { q: 'Leveren jullie ook zorgkleding in Winterswijk?', a: 'Ja. Voor zorg, salons en beauty leveren we comfortabele, makkelijk wasbare tunieken, polo’s en jassen die er verzorgd uitzien.' },
      { q: 'Is Winterswijk niet te ver voor persoonlijk advies?', a: 'Nee. We komen ook naar Winterswijk toe om te passen en houden de lijnen kort, zodat je dezelfde persoonlijke service krijgt als dichterbij.' },
    ],
    afstand: 'Ongeveer 35 minuten vanaf Hengelo',
  },
];

export const plaatsenBySlug = Object.fromEntries(plaatsen.map((p) => [p.slug, p]));
