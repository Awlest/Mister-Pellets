/**
 * 5 guides éditoriaux pour la phase 4.
 * Phase 7 : migrés vers la collection Payload `Guides` ou `Articles` pour
 * permettre l'édition et l'ajout de nouveaux guides par le client.
 *
 * Voix : vouvoiement (charte juin 2026), installateur wallon, zéro tiret long.
 * 3 marques mises en avant : Edilkamin, EK63, Girolami.
 */

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface GuideData {
  slug: string;
  title: string;
  description: string;
  category: "Choix" | "Technique" | "Entretien" | "Aide";
  readingTime: string; // "8 min"
  excerpt: string;
  sections: GuideSection[];
  faq?: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
}

export const GUIDES: GuideData[] = [
  // Guide de saison (03/10/2026), placé en tête pendant la saison de chauffe :
  // la page /guides et le bloc « Continuer sur le sujet » suivent l'ordre du tableau.
  {
    slug: "remettre-en-route-poele-pellets-automne",
    title: "Remettre son poêle à pellets en route à l'automne : le guide de début de saison",
    description:
      "Ce qu'on vérifie avant le premier feu, comment rallumer sans panne, régler le poêle pour l'hiver et faire son stock de pellets. Le guide de saison des techniciens Mister Pellets.",
    category: "Entretien",
    readingTime: "7 min",
    excerpt:
      "Après six mois d'arrêt, un poêle à pellets se rallume rarement du premier coup sans un peu de préparation. Voici l'ordre dans lequel on fait les choses, et les signes qui doivent vous faire appeler.",
    sections: [
      {
        heading: "1. Avant le premier feu : trois vérifications à froid",
        paragraphs: [
          "Poêle éteint et froid, prise débranchée dès que vous touchez à l'intérieur. Dix minutes suffisent.",
        ],
        list: [
          "Le réservoir. Les pellets restés dedans tout l'été ont pu reprendre de l'humidité : s'ils sont ternes, friables ou poussiéreux, videz-les. Un pellet qui gonfle peut bloquer la vis sans fin dès le premier allumage.",
          "Le creuset et le cendrier. Videz les cendres de la fin d'hiver, dégagez les trous du creuset à la brosse et vérifiez que rien n'est tombé dans le foyer pendant l'été.",
          "Le dehors. Sur un poêle étanche, la prise d'air et le terminal de la ventouse doivent être dégagés : feuilles, toiles d'araignée, nid de guêpes. Sur un conduit en toiture, un nid d'oiseau dans le chapeau suffit à provoquer des refoulements.",
        ],
      },
      {
        heading: "2. L'entretien et le ramonage, avant ou juste après",
        paragraphs: [
          "Si l'entretien de l'an dernier n'a pas été fait, faites-le avant les grands froids. Un échangeur resté encrassé depuis le printemps fait consommer plus dès le premier mois, et les créneaux se remplissent vite à partir d'octobre. Chez nous, l'entretien complet coûte 175 € TVAC, ramonage du conduit compris.",
          "Aucune loi wallonne n'impose le ramonage d'un poêle, mais la plupart des contrats d'assurance incendie l'exigent chaque année. Gardez le certificat avec les papiers de la maison : c'est le premier document qu'un assureur demande après un feu de cheminée.",
        ],
      },
      {
        heading: "3. Le premier allumage de la saison",
        paragraphs: [
          "La vis sans fin s'est vidée pendant l'été. Au premier allumage, elle met plusieurs minutes à amener les pellets jusqu'au creuset, et il arrive que le poêle affiche un échec d'allumage. Beaucoup de modèles proposent une fonction de chargement de la vis dans leur menu (voyez la notice) : lancez-la avant d'allumer, ou relancez simplement un second allumage.",
          "Avant tout nouvel essai, videz le creuset s'il est plein de pellets non brûlés. Les rallumer en tas, c'est risquer un départ de flamme brutal dans le foyer. Et jamais d'allume-feu, de papier ou d'alcool dans un poêle à pellets : la bougie s'en charge.",
          "Une odeur de chaud pendant la première heure est normale, c'est la poussière de l'été qui brûle sur l'échangeur. Aérez. Si l'odeur ressemble à de la fumée et ne passe pas, éteignez et appelez.",
        ],
      },
      {
        heading: "4. Régler le poêle pour l'hiver",
        paragraphs: [
          "Vérifiez l'heure du poêle : s'il a été débranché, il a pu la perdre, et le passage à l'heure d'hiver, le 25 octobre cette année, la décale d'une heure sur les modèles qui ne s'ajustent pas seuls. Vos plages horaires en dépendent.",
          "Visez 19 à 20 °C dans la pièce de vie. Un poêle bien dimensionné passe l'hiver à mi-régime. S'il s'allume et s'éteint à longueur de journée, il use sa bougie et consomme plus : mieux vaut une puissance basse en continu, ou des plages horaires plus longues.",
          "Sur un poêle hydro, contrôlez la pression du circuit à froid (souvent autour de 1 à 1,5 bar, la notice donne la bonne valeur) et purgez les radiateurs qui gargouillent. Un circulateur resté à l'arrêt tout l'été peut avoir du mal à redémarrer : si le circuit reste froid alors que le poêle chauffe, appelez-nous.",
        ],
      },
      {
        heading: "5. Faire son stock de pellets",
        paragraphs: [
          "Un poêle qui chauffe la maison tout l'hiver avale 1,5 à 2 tonnes de pellets, soit 100 à 135 sacs de 15 kg. En août 2026, ValBiom relevait 6,19 € en moyenne le sac en Wallonie, acheté par palette, et ne prévoit pas de baisse cet hiver. Notre article sur le budget d'un hiver au pellet détaille le calcul.",
          "Stockez au sec et sur palette, à distance du poêle. C'est l'humidité qui abîme les pellets, pas le froid. Prenez des sacs certifiés ENplus A1 ou DINplus : les deux imposent les mêmes seuils, et un sac sans logo ne garantit rien.",
        ],
      },
      {
        heading: "6. Les signes qui doivent vous faire appeler",
        paragraphs: [
          "Ceux-là ne se règlent pas avec une brosse. Notez la marque du poêle et le code affiché avant d'appeler le 081 13 83 09 : on gagne souvent un déplacement.",
        ],
        list: [
          "Une odeur de fumée dans la pièce, ou l'alarme du détecteur de monoxyde de carbone : éteignez, aérez, sortez et appelez. Le détecteur de CO n'est pas obligatoire en Wallonie, mais on le conseille dans la pièce du poêle ; les détecteurs de fumée, eux, sont obligatoires dans tous les logements.",
          "Une flamme longue, orange et molle, avec une vitre qui noircit en quelques heures : la combustion manque d'air, le conduit ou l'échangeur est probablement encrassé.",
          "Le même code d'erreur qui revient, ou un allumage qui échoue deux fois de suite alors que le réservoir est plein.",
          "Un bruit nouveau : vis sans fin qui grince, ventilateur qui frotte ou qui siffle.",
        ],
      },
    ],
    faq: [
      {
        question: "Faut-il faire l'entretien avant de rallumer le poêle ?",
        answer:
          "Idéalement oui, surtout s'il n'a pas été fait l'hiver dernier. Sinon, dans le premier mois de chauffe. Un poêle encrassé consomme plus et s'arrête plus souvent, et la garantie du fabricant demande un entretien annuel.",
      },
      {
        question: "Peut-on utiliser les pellets de l'an dernier ?",
        answer:
          "Oui, s'ils sont restés au sec : durs, brillants, sans poussière. S'ils sont ternes, friables ou s'ils sentent l'humidité, ne les mettez pas dans le poêle : ils encrassent et peuvent bloquer la vis.",
      },
      {
        question: "Mon poêle sent le brûlé au premier allumage, est-ce normal ?",
        answer:
          "Pendant la première heure, oui : c'est la poussière de l'été qui brûle. Aérez. Une odeur de fumée qui persiste, en revanche, se traite tout de suite : éteignez et appelez.",
      },
      {
        question: "À quelle température régler mon poêle ?",
        answer:
          "19 à 20 °C dans la pièce de vie. Au-delà, chaque degré se paie tout l'hiver. La nuit, une baisse programmée vaut souvent mieux qu'un arrêt complet, sauf si la maison garde bien la chaleur.",
      },
    ],
    metaTitle: "Remettre son poêle à pellets en route à l'automne, le guide de saison",
    metaDescription:
      "Vérifications avant le premier feu, premier allumage sans échec, réglages d'hiver, stock de pellets et signes d'alerte. Le guide de début de saison Mister Pellets.",
  },
  {
    slug: "guide-achat-poele-pellets-wallonie",
    title: "Le guide d'achat 2026 du poêle à pellets en Wallonie",
    description: "Tout savoir avant d'acheter : technologies, marques, aides, pose, entretien. Le guide complet par les techniciens Mister Pellets.",
    category: "Choix",
    readingTime: "12 min",
    excerpt:
      "Acheter un poêle à pellets représente un investissement de 4 000 à 8 000 € pose comprise. Voici comment ne pas se tromper, marque par marque, étape par étape.",
    sections: [
      {
        heading: "1. Comprendre les 4 grandes familles",
        paragraphs: [
          "Le marché belge propose 4 grandes familles : air pulsé (le plus simple, l'air chaud sort par convection), canalisable (l'air est distribué dans plusieurs pièces via des gaines), hydro (chauffe un circuit d'eau, remplace une chaudière), et insert encastrable (s'intègre dans une cheminée existante).",
          "Notre conseil par défaut : un air pulsé étanche pour une pièce de vie de moins de 100 m² bien isolée. Un canalisable pour une maison à étage. Un hydro pour remplacer une chaudière mazout. Un insert si vous voulez préserver une cheminée d'origine.",
        ],
      },
      {
        heading: "2. Dimensionner la puissance",
        paragraphs: [
          "La règle empirique : 1 kW pour 10 m² bien isolés (PEB B ou mieux). 1 kW pour 15 m² si la maison est très bien isolée (PEB A). 1 kW pour 7 m² si l'isolation est faible (PEB E à G).",
          "Donc pour une maison de 100 m² PEB B, visez 10 kW. Pour 150 m² PEB D, visez 18-20 kW (et là vous passez plutôt sur un hydro). Sous-dimensionner, c'est devoir tourner à plein régime tout le temps : usure prématurée et surconsommation.",
        ],
      },
      {
        heading: "3. Choisir la marque",
        paragraphs: [
          "Edilkamin (Italie, depuis 1963) est la référence italienne du chauffage biomasse, avec une gamme très large (air, canalisable, étanche, hydro, inserts) et le Wi-Fi de série sur la plupart des modèles récents. EK63 (Italie) est la marque sœur du groupe Edilkamin, lancée pour proposer du connecté à un prix plus accessible, gamme complète air/canalisable/étanche/hydro. Girolami (Italie, depuis 1970) est un fabricant familial au brevet Source Feeding : le pellet est poussé sous le brasier, qui reste propre tout seul, et la gamme va du poêle à air étanche au thermopoêle hydro, avec une particularité, l'hybride bois-pellet (la gamme Soft) qui accepte les deux combustibles.",
          "À Mister Pellets, on a retenu ces trois marques après avoir testé une vingtaine de fabricants. Chacune a son créneau, on oriente selon le projet, pas selon la marge.",
        ],
      },
      {
        heading: "4. Conduit existant ou pas ?",
        paragraphs: [
          "Si vous avez un conduit existant et conforme : la pose est plus simple et moins chère (4 000 à 5 500 € tout compris). Si le conduit est trop ancien (avant 1980, ou non chemisé), il faudra le tuber : prévoyez environ 700 à 1 400 € TVAC de plus selon la hauteur (TVA à 6 %).",
          "Si vous n'avez pas de conduit, deux options : ventouse en façade (modèles étanches uniquement, le plus simple) ou conduit neuf en façade ou par le toit (environ 1 800 à 2 200 € TVAC de plus pour 6 m de conduit). Dans tous les cas, le diagnostic à domicile précise le devis.",
        ],
      },
      {
        heading: "5. Compter les aides",
        paragraphs: [
          "La prime Habitation pour un poêle à pellets s'est arrêtée le 30 septembre 2026. Depuis le 1er octobre, la Wallonie aide la rénovation par deux prêts : le Rénopack, à 0 % avec 15 à 50 % effacés selon les revenus, et le Rénoprêt. Ils sont réservés aux maisons classées E, F ou G qui gagnent le label exigé après un audit. Un poêle seul y donne rarement accès. Tout le détail est sur notre page consacrée aux aides.",
          "L'aide qui joue presque à chaque fois, c'est la TVA : 6 % au lieu de 21 % quand l'installateur fournit et pose le poêle dans un logement de plus de 10 ans. Pour les petits revenus, la subvention MEBAR (jusqu'à 2 000 €) passe par le CPAS, avant les travaux. Et demandez à votre commune : certaines gardent une prime énergie.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien coûte un poêle à pellets installé en 2026 ?",
        answer:
          "Comptez 4 000 à 8 000 € tout compris pour une maison standard avec conduit existant. Hydro complet : 8 000 à 14 000 €. Dans un logement de plus de 10 ans, ces montants comprennent la TVA à 6 %. Il n'y a plus de prime régionale pour un poêle depuis le 1er octobre 2026.",
      },
      {
        question: "Quelle marque est la plus fiable ?",
        answer:
          "Edilkamin pour la durabilité long terme (15-20 ans). EK63 pour la connectivité moderne à prix doux. Girolami pour l'auto-nettoyage du brasier et l'hybride bois-pellet. Aucune n'est mauvaise, c'est le choix selon votre usage.",
      },
      {
        question: "Faut-il un audit énergétique ?",
        answer:
          "Pour un poêle seul, non : la prime qui l'exigeait s'est arrêtée le 30 septembre 2026. L'audit logement redevient indispensable si vous visez un Rénopack ou un Rénoprêt : il doit avoir été réalisé ou actualisé moins d'un an avant la demande de prêt, et c'est lui qui dit quels travaux font gagner le label exigé.",
      },
    ],
    metaTitle: "Guide d'achat poêle à pellets en Wallonie 2026, Mister Pellets",
    metaDescription:
      "Le guide complet pour choisir votre poêle à pellets en Wallonie : technologies, marques, aides, pose, entretien. Conseils des techniciens Mister Pellets.",
  },
  {
    slug: "poele-pellets-canalisable",
    title: "Poêle à pellets canalisable : le guide complet",
    description: "Comment un canalisable fonctionne, quelles puissances pour quelles surfaces, exemples d'installations en maisons wallonnes typiques.",
    category: "Technique",
    readingTime: "8 min",
    excerpt:
      "Le canalisable est la solution qu'on installe le plus en Wallonie après l'air pulsé classique. Elle permet de chauffer plusieurs pièces avec un seul appareil, sans casser tout le bâti.",
    sections: [
      {
        heading: "Comment ça marche",
        paragraphs: [
          "Un poêle canalisable a une sortie d'air principale (frontale) ET une ou plusieurs sorties latérales/arrière vers des gaines. Ces gaines transportent l'air chaud jusqu'à 5-8 mètres dans des pièces voisines (chambres, bureau, salle de bain).",
          "L'utilisateur règle la répartition via la commande du poêle : par exemple 60% dans la pièce principale, 40% à l'étage. Certains modèles ont un volet motorisé pour piloter cette répartition automatiquement.",
        ],
      },
      {
        heading: "Pour quelle surface et quelle config",
        paragraphs: [
          "Le canalisable est la solution naturelle pour les maisons à étage de 100-180 m². Modèles typiques : EK63 Tweed 90+ (9,2 kW) et Spy 110+ (10,5 kW), Edilkamin Cherie 11++ Evo (11 kW), Girolami Vert canalisable.",
          "Pour les très grandes maisons (180+ m²) ou pour vraiment chauffer toutes les pièces, on passe plutôt sur un hydro avec radiateurs ou plancher chauffant. Le canalisable a ses limites : 2-3 pièces secondaires max, à 5-8m de distance.",
        ],
      },
      {
        heading: "Pose et travaux",
        paragraphs: [
          "Les gaines isolées sont passées dans les murs, faux-plafonds ou combles. Sur une maison existante, c'est parfois plus invasif : on doit ouvrir un passage. Sur une maison récente avec gaines techniques prévues, c'est presque transparent.",
          "Un canalisable typique avec 2 gaines vers chambres : comptez 1.5 jours de pose au lieu de 1 jour pour un air classique. Et 800 à 1 500 € de plus en main d'œuvre + matériel gaines.",
        ],
      },
    ],
    faq: [
      {
        question: "Le canalisable est-il bruyant ?",
        answer:
          "Légèrement plus que l'air classique (le ventilateur force davantage). Sur les modèles modernes (EK63, Edilkamin, Girolami), c'est minimal, entre 35 et 45 dB en fonctionnement, soit moins qu'une conversation normale. Et le Girolami peut couper la soufflerie en mode silencieux.",
      },
      {
        question: "Peut-on canaliser à l'étage ?",
        answer:
          "Oui, c'est la configuration la plus fréquente. La gaine monte verticalement dans une cloison ou dans un coffrage, puis se distribue à l'étage. Comptez 5-8m max de longueur de gaine pour conserver une bonne température en sortie.",
      },
    ],
    metaTitle: "Poêle à pellets canalisable, Le guide complet",
    metaDescription:
      "Tout sur les poêles à pellets canalisables : fonctionnement, puissances, exemples wallons. EK63 Tweed et Spy, Edilkamin Cherie. Conseil Mister Pellets.",
  },
  {
    slug: "poele-pellets-hydro",
    title: "Poêle hydro : remplacer une chaudière mazout par des pellets",
    description: "Le hydro chauffe un circuit d'eau et peut remplacer une chaudière classique. Cas d'usage, marques, dimensionnement.",
    category: "Technique",
    readingTime: "10 min",
    excerpt:
      "Si vous avez une chaudière mazout vieillissante et un système radiateur ou plancher chauffant, l'hydro pellets est la solution la plus rentable pour passer aux énergies renouvelables, souvent rentabilisé en 5 à 9 ans.",
    sections: [
      {
        heading: "Le principe",
        paragraphs: [
          "Un poêle hydro a un échangeur de chaleur interne qui chauffe l'eau d'un circuit. Cette eau alimente ensuite vos radiateurs, votre plancher chauffant, et éventuellement le ballon d'eau chaude sanitaire (ECS).",
          "Concrètement : vous débranchez votre vieille chaudière mazout, on pose le hydro dans une pièce de vie ou en cave, on le raccorde au circuit existant via un kit hydraulique. Comptez 1 à 2 jours de pose selon l'existant.",
        ],
      },
      {
        heading: "Marques et modèles",
        paragraphs: [
          "Girolami (Italie, depuis 1970) a fait du raccordement hydro une vraie spécialité : la gamme Soft, des thermopoêles en quatre versions jusqu'à 24 kW, en hybride bois-pellet ou en pellet seul, chauffe le circuit d'eau de la maison (radiateurs ou plancher) et remplace une chaudière mazout. Son alimentation Source Feeding autonettoyante évite le nettoyage quotidien, et la version hybride accepte aussi les bûches. Edilkamin (Italie, depuis 1963) propose également des modèles hydro (suffixe H), compatibles radiateurs, plancher chauffant et solaire thermique, avec la finition et la fiabilité premium de la marque.",
          "EK63 a aussi ses hydros, du Spot 100 H (10 kW) aux Monday H 190 et 230 (19 et 23 kW). On choisit selon le budget et la maison : un Girolami Soft pour l'option bois et le brasier propre, un EK63 pour un prix plus doux, un Edilkamin hydro pour le haut de gamme.",
        ],
      },
      {
        heading: "Coûts et aides",
        paragraphs: [
          "Un hydro complet (poêle, kit hydraulique, ballon, raccordement et main d'œuvre) coûte 8 000 à 14 000 € TVAC selon la puissance et la complexité. Il n'y a plus de prime régionale depuis le 1er octobre 2026. Si la maison est classée E, F ou G et que vous la rénovez plus largement, le Rénopack peut financer l'hydro avec le reste des travaux ; sinon, l'aide qui reste est la TVA à 6 % dans un logement de plus de 10 ans.",
          "Face au mazout, le retour sur investissement tourne autour de 5 à 9 ans pour une maison qui en brûlait 2 000 litres par an, aux prix d'octobre 2026. Au-delà, c'est de l'économie nette tous les hivers.",
        ],
      },
    ],
    faq: [
      {
        question: "Faut-il garder une chaudière en backup ?",
        answer:
          "Pas obligatoire. Les hydros modernes sont fiables. Mais beaucoup gardent une vieille chaudière fioul ou gaz comme secours pour les très grands froids ou les pannes, utile mais pas indispensable. À discuter avec nous selon votre cas.",
      },
      {
        question: "Combien d'autonomie en pellets ?",
        answer:
          "Le réservoir des hydros que nous posons contient 14 à 30 kg : de quelques heures à pleine puissance à une grosse journée en régime doux. Pour ne pas remplir tous les jours en plein hiver, beaucoup ajoutent un silo externe relié par aspiration : 500 à 2 000 kg de stock, plusieurs semaines d'autonomie.",
      },
    ],
    metaTitle: "Poêle hydro pour remplacer chaudière mazout, Guide",
    metaDescription:
      "Le guide complet du poêle hydro pour remplacer une chaudière mazout : marques (Girolami, Edilkamin, EK63), dimensionnement, coûts, aides. Conseil Mister Pellets.",
  },
  {
    slug: "comment-entretenir-poele-pellets",
    title: "L'entretien d'un poêle à pellets : la check-list complète",
    description: "Que faire au quotidien, chaque semaine, chaque saison, et quand appeler un pro. Le guide pour faire durer votre poêle 15+ ans.",
    category: "Entretien",
    readingTime: "9 min",
    excerpt:
      "Un poêle à pellets bien entretenu dure 15-20 ans sans souci majeur. Mal entretenu, il commence à perdre du rendement après 2-3 ans, et tombe en panne après 5-7 ans. Voici ce qu'il faut vraiment faire.",
    sections: [
      {
        heading: "Au quotidien (3 minutes)",
        list: [
          "Vider le bac à cendres si plus d'1/3 plein",
          "Brosser légèrement la vitre avec un chiffon sec si elle commence à noircir",
          "Vérifier que le réservoir n'est pas vide ou trop bas (déclenchement raté à froid)",
        ],
      },
      {
        heading: "Chaque semaine (15 minutes)",
        list: [
          "Aspirer le foyer froid à l'aspirateur cendres",
          "Démonter et brosser le brûleur (l'orifice par où tombent les pellets)",
          "Vérifier qu'aucun pellet n'est resté coincé dans la vis sans fin",
          "Nettoyer la vitre avec un produit dédié ou du papier journal humide + cendres fines",
        ],
      },
      {
        heading: "En début et fin de saison (1 heure)",
        list: [
          "Aspirer l'échangeur thermique en démontant le déflecteur arrière",
          "Vérifier l'état des joints de porte et de visu",
          "Tester le fonctionnement à vide (allumage, ventilation, extraction)",
          "Faire le plein de pellets pour la saison à venir (en début de saison) ou vider et stocker (en fin)",
        ],
      },
      {
        heading: "Une fois par an, par un pro",
        paragraphs: [
          "Pour un poêle à air, aucune loi ne l'impose. Les fabricants l'exigent pour maintenir leur garantie, notre garantie de 5 ans en dépend, et votre assurance incendie vous demandera la preuve du ramonage. Un poêle hydro raccordé au chauffage central est un cas à part : l'arrêté wallon du 29 janvier 2009 sur le chauffage central prévoit un contrôle chaque année pour les générateurs au combustible solide.",
          "On démonte tout : foyer, échangeur, brûleur, ventilateur d'extraction, conduit. On nettoie en profondeur, on remplace les joints fatigués, on vérifie les capteurs et la combustion. Chez Mister Pellets, l'entretien complet coûte 175 € TVAC, ramonage du conduit compris.",
        ],
      },
    ],
    faq: [
      {
        question: "Quels pellets pour minimiser l'entretien ?",
        answer:
          "Toujours privilégier les pellets ENplus A1 ou DINplus, en sacs de 15 kg sous emballage propre. Les pellets bon marché ou humides encrassent beaucoup plus, génèrent plus de cendres, et peuvent même endommager le brûleur sur le long terme.",
      },
      {
        question: "Que faire si le poêle s'éteint tout seul ?",
        answer:
          "Causes courantes : réservoir vide, brûleur encrassé, capteur de tirage défaillant, fusible thermique qui a sauté à cause d'une surchauffe. Vérifiez dans cet ordre. Si ça persiste, appelez-nous, c'est rarement grave mais ça nécessite un diagnostic.",
      },
    ],
    metaTitle: "Entretien d'un poêle à pellets, Check-list complète | Mister Pellets",
    metaDescription:
      "Comment entretenir votre poêle à pellets jour, semaine, saison, année. Check-list complète des techniciens Mister Pellets pour faire durer votre appareil.",
  },
  {
    slug: "quelle-puissance-poele-pellets",
    title: "Quelle puissance de poêle à pellets pour ma maison ?",
    description: "Calcul rapide selon la surface et le PEB. Tableau de correspondance pour une vingtaine de cas typiques wallons.",
    category: "Choix",
    readingTime: "6 min",
    excerpt:
      "Sous-dimensionner votre poêle, c'est devoir tourner à plein régime en permanence. Sur-dimensionner, c'est de l'argent gaspillé. Voici comment caler la puissance correctement.",
    sections: [
      {
        heading: "La règle de calcul",
        paragraphs: [
          "Formule de base : 1 kW pour 10 m² bien isolés (PEB A-B) avec hauteur sous plafond standard (2.5m). On adapte ensuite selon 4 paramètres.",
          "Maison très bien isolée (PEB A) : 1 kW pour 12-15 m². Maison moyenne (PEB C-D) : 1 kW pour 8-10 m². Maison mal isolée (PEB E-G) : 1 kW pour 6-8 m². Hauteur sous plafond > 3m : ajouter 15-20% à la puissance calculée.",
        ],
      },
      {
        heading: "Tableau de correspondance",
        paragraphs: [
          "Studio 40 m² PEB B : 4-5 kW (rare, plutôt un poêle d'appoint).",
          "Maison 80 m² PEB C : 8-9 kW (EK63 Like 90+, Edilkamin Cherie 9+ Evo, Girolami Split).",
          "Maison 100 m² PEB B : 9-10 kW (EK63 Tweed 90+, Edilkamin Rise 9+, Girolami Vert 9).",
          "Maison 130 m² PEB D : 13-15 kW (EK63 Monday 130++, Edilkamin Vyda 13++ Evo, Girolami Vert 14).",
          "Maison 160 m² PEB C : 14-16 kW (en hydro : Girolami Soft 14 ou EK63 Monday H 190).",
          "Maison 200 m² PEB D : 18-22 kW (passer sur hydro : Girolami Soft 22 ou EK63 Monday H 230).",
          "Maison 280 m² PEB D-E : 25-30 kW (hydro Girolami Soft 26, ou poêle + chaudière en complément).",
        ],
      },
      {
        heading: "Cas particuliers",
        paragraphs: [
          "Maison à étage avec escalier ouvert : la chaleur monte naturellement, donc un poêle puissant en bas peut chauffer le haut. Mais attention au tirage : si l'étage est juste réchauffé partiellement, c'est inconfortable. Préférez le canalisable.",
          "Pièce ouverte avec mezzanine ou grand volume : appliquez la règle de la hauteur sous plafond (+15-20%) et envisagez une ventilation horizontale plus puissante.",
          "Plusieurs pièces fermées (chambres, bureau) : canalisable obligatoire. Un poêle classique ne chauffera que la pièce où il est installé, peu importe sa puissance.",
        ],
      },
    ],
    faq: [
      {
        question: "Que se passe-t-il si je sous-dimensionne ?",
        answer:
          "Le poêle tourne à plein régime tout le temps. Conséquences : usure accélérée du brûleur et de la vis sans fin, surconsommation de pellets, vitre qui noircit vite, et confort insuffisant lors des grands froids. Vous remplacez votre poêle au bout de 5-7 ans au lieu de 15-20.",
      },
      {
        question: "Et si je sur-dimensionne ?",
        answer:
          "Vous payez plus cher à l'achat (différence ~500-1500 €), et le poêle tourne presque toujours en mode mini. Pas idéal pour la combustion (rendement moindre, plus de cendres). Mais moins grave que le sous-dimensionnement.",
      },
    ],
    metaTitle: "Quelle puissance de poêle à pellets pour ma maison ?",
    metaDescription:
      "Calculer la puissance de poêle à pellets selon votre surface et votre PEB. Tableau de correspondance pour 20 cas typiques wallons. Conseil Mister Pellets.",
  },
];

export function getGuideBySlug(slug: string): GuideData | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
