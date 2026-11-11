/**
 * 5 guides éditoriaux pour la phase 4.
 * Phase 7 : migrés vers la collection Payload `Guides` ou `Articles` pour
 * permettre l'édition et l'ajout de nouveaux guides par le client.
 *
 * Voix : vouvoiement (charte juin 2026), installateur wallon, zéro tiret long.
 * 6 marques mises en avant : MCZ, Edilkamin, EK63, Girolami, Austroflamm, Cadel.
 */

import { INSTALL_TYPES, ISO, POWER_WINDOW, VAT, evacuationPrice, formatEur, recommendedKw, withVat, type InstallType, type IsoKey } from "./pose/moteur";
import { REMISES, TARIFS } from "./pose/tarifs";
import { POSE_DURATIONS } from "./services";
import { POWER_RULE } from "./power";
import { PRICE_RANGES, rangeText } from "./price-ranges";

/**
 * Surcoût d'une évacuation par rapport au simple raccordement d'un conduit
 * déjà tubé, TVAC à 6 %, arrondi à la dizaine : mêmes tarifs et mêmes remises
 * que /estimation (lib/pose/tarifs.ts).
 */
function surcoutEvacuation(type: InstallType, hauteurM: number): string {
  const ht =
    evacuationPrice(type, hauteurM, TARIFS, REMISES).amountHT +
    INSTALL_TYPES[type].percements * TARIFS.percementRenforceHT -
    TARIFS.raccordementHT;
  return formatEur(Math.round(withVat(ht, VAT.reduced).total / 10) * 10);
}

/** Puissance en kW à la française : 7.5 → « 7,5 ». */
const kwFr = (kw: number): string => String(kw).replace(".", ",");

/** Grille de besoin de l'estimation en ligne (lib/pose/moteur.ts), de la maison la mieux isolée à la moins isolée. */
const ISO_ORDER: IsoKey[] = ["recent", "bonne", "moyenne", "ancienne"];
const ISO_HEADERS = ISO_ORDER.map((k) => `${ISO[k].desc} (${ISO[k].wattsPerM2} W/m²)`);
/** Surface (m², arrondie à 5) couverte par une puissance donnée. */
const surfaceFor = (kw: number, iso: IsoKey): number => Math.round((kw * 1000) / ISO[iso].wattsPerM2 / 5) * 5;
const POWER_BY_SURFACE: string[][] = [60, 80, 100, 120, 150, 180, 200].map((m2) => [
  `${m2} m²`,
  ...ISO_ORDER.map((k) => `${kwFr(recommendedKw(m2, k))} kW`),
]);
const SURFACE_BY_POWER: string[][] = [6, 8, 10, 12, 15, 18, 24].map((kw) => [
  `${kw} kW`,
  ...ISO_ORDER.map((k) => `${surfaceFor(kw, k)} m²`),
]);
/** Fenêtre « bien dimensionné » de l'estimation en ligne, en % du besoin. */
const WIN_MIN = Math.round(POWER_WINDOW.min * 100);
const WIN_MAX = Math.round(POWER_WINDOW.max * 100);

/** Canalisation d'une pièce, HTVA et TVAC à 6 %. */
const CANAL_PIECE = `${formatEur(TARIFS.canalisationParPieceHT)} HTVA (${formatEur(withVat(TARIFS.canalisationParPieceHT, VAT.reduced).total)} TVAC à 6 %)`;

export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Tableau HTML, après les paragraphes ; cellules avec liens [texte](adresse) permis. */
  table?: { headers: string[]; rows: string[][]; caption?: string };
}

export interface GuideData {
  slug: string;
  title: string;
  description: string;
  category: "Choix" | "Technique" | "Entretien" | "Aide";
  /** Temps de lecture, calculé sur le texte du guide (200 mots par minute) : « 3 min ». */
  readingTime: string;
  /**
   * Première mise en ligne et dernière modification du texte (AAAA-MM-JJ),
   * relevées dans l'historique git de ce fichier. À mettre à jour quand le
   * contenu du guide change : la date s'affiche sur la page et part dans le
   * JSON-LD et le sitemap.
   */
  publishedAt: string;
  modifiedAt: string;
  excerpt: string;
  /** Réponse directe de 40 à 60 mots, sous le titre (et description du JSON-LD). */
  directAnswer?: string;
  sections: GuideSection[];
  /** Sources lues : notices, textes officiels, pages de fabricant, avec date de lecture. */
  sources?: { label: string; href?: string }[];
  faq?: { question: string; answer: string }[];
  metaTitle: string;
  metaDescription: string;
}

const GUIDE_SOURCES: Omit<GuideData, "readingTime">[] = [
  // Guide de saison (03/10/2026), placé en tête pendant la saison de chauffe :
  // la page /guides et le bloc « Continuer sur le sujet » suivent l'ordre du tableau.
  {
    slug: "remettre-en-route-poele-pellets-automne",
    publishedAt: "2026-10-03",
    modifiedAt: "2026-10-03",
    title: "Remettre son poêle à pellets en route à l'automne : le guide de début de saison",
    description:
      "Ce qu'on vérifie avant le premier feu, comment rallumer sans panne, régler le poêle pour l'hiver et faire son stock de pellets. Le guide de saison des techniciens Mister Pellets.",
    category: "Entretien",
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
    metaTitle: "Remettre son poêle à pellets en route à l'automne",
    metaDescription:
      "Vérifications avant le premier feu, premier allumage sans échec, réglages d'hiver, stock de pellets et signes d'alerte. Le guide de début de saison Mister Pellets.",
  },
  {
    slug: "guide-achat-poele-pellets-wallonie",
    publishedAt: "2026-05-02",
    modifiedAt: "2026-11-11",
    title: "Le guide d'achat 2026 du poêle à pellets en Wallonie",
    description: "Tout savoir avant d'acheter : technologies, marques, aides, pose, entretien. Le guide complet par les techniciens Mister Pellets.",
    category: "Choix",
    // Encadré repris sur /guides, les guides voisins et des articles : la
    // fourchette et son hypothèse viennent de lib/price-ranges.ts.
    excerpt: `Un poêle à air posé sur un conduit existant revient le plus souvent à ${rangeText(PRICE_RANGES.standard)} TVAC, pose comprise. Voici comment ne pas se tromper, marque par marque, étape par étape.`,
    sections: [
      {
        heading: "1. Comprendre les 4 grandes familles",
        paragraphs: [
          "Le marché belge propose 4 grandes familles : air pulsé (le plus simple, l'air chaud sort par convection), canalisable (l'air est distribué dans plusieurs pièces via des gaines), hydro (chauffe un circuit d'eau, remplace une chaudière), et insert encastrable (s'intègre dans une cheminée existante).",
          "Notre conseil par défaut : un air pulsé étanche pour une pièce de vie de moins de 100 m² bien isolée. Un canalisable pour une maison à étage. Un hydro pour remplacer une chaudière mazout. Un insert si vous voulez préserver une cheminée d'origine.",
          "Les quatre familles ont un point commun : elles ont besoin d'une prise 230 V pour la vis sans fin, l'allumage et l'extracteur de fumées. Ce qu'elles consomment et ce qui se passe quand le courant saute, marque par marque : [poêle à pellets sans électricité, ce qui existe vraiment](/blog/poele-pellets-sans-electricite-coupure-courant).",
        ],
      },
      {
        heading: "2. Dimensionner la puissance",
        paragraphs: [
          `La grille de notre estimation en ligne : ${POWER_RULE}. Le [guide de la puissance](/guides/quelle-puissance-poele-pellets) donne les tableaux surface par surface.`,
          `Donc pour une maison de 100 m² en PEB B, visez environ ${kwFr(recommendedKw(100, "recent"))} kW. Pour 150 m² en PEB D, environ ${kwFr(recommendedKw(150, "bonne"))} kW. Sous-dimensionner, c'est devoir tourner à plein régime tout le temps : usure prématurée et surconsommation.`,
          "Le combustible se budgète à part. Le prix du sac de 15 kg change chaque mois : voyez [notre relevé du prix des pellets en Wallonie](/blog/prix-pellets-belgique), avec ce que coûte une saison selon votre usage.",
        ],
      },
      {
        heading: "3. Choisir la marque",
        paragraphs: [
          "MCZ (Italie) est notre première marque depuis octobre 2026. Pionnier du poêle à pellets au début des années 2000, il a la gamme la plus complète qu'on pose : poêles à air de 6 à 14 kW, plats dès 27,5 cm de profondeur, canalisables Comfort Air jusqu'à 8 m de gaine, hydros de 18 et 24 kW, foyers et inserts. La combustion Core annonce 55 % d'émissions en moins que les limites Ecodesign, avec un brasero qui se nettoie seul, et le Wi-Fi Maestro+ est de série sur la plupart des modèles.",
          "Edilkamin (Italie, depuis 1963) est la référence italienne du chauffage biomasse, avec une gamme très large (air, canalisable, étanche, hydro, inserts) et le Wi-Fi de série sur la plupart des modèles récents. EK63 (Italie) est la marque sœur du groupe Edilkamin, lancée pour proposer du connecté à un prix plus accessible, gamme complète air/canalisable/étanche/hydro. Girolami (Italie, depuis 1970) est un fabricant familial au brevet Source Feeding : le pellet est poussé sous le brasier, qui reste propre tout seul, et la gamme va du poêle à air étanche au thermopoêle hydro, avec une particularité, l'hybride bois-pellet (la gamme Soft) qui accepte les deux combustibles.",
          "Deux autres marques complètent la sélection. Austroflamm (Autriche) est notre marque haut de gamme : poêles à pellets qui chauffent par convection naturelle, sans ventilateur qui souffle dans la pièce, et mixtes bois et pellets Duo qui repassent seuls aux pellets quand les bûches ont brûlé. Cadel (Italie, province de Trévise, groupe MCZ) joue le même rôle qu'EK63 : du connecté, Wi-Fi et Bluetooth intégrés, une gamme très large (poêles plats de 27 cm, canalisables à deux sorties, inserts, hydros) à prix accessible.",
          "À Mister Pellets, on a retenu ces six marques après avoir testé une vingtaine de fabricants. Chacune a son créneau, on oriente selon le projet, pas selon la marge.",
        ],
      },
      {
        heading: "4. Conduit existant ou pas ?",
        paragraphs: [
          `Si vous avez un conduit existant et conforme : la pose est plus simple et moins chère (4 000 à 5 500 € tout compris). Si le conduit est trop ancien (avant 1980, ou non chemisé), il faudra le tuber : au tarif du moment, comptez environ ${surcoutEvacuation("tubage", 6)} TVAC de plus pour 6 m et ${surcoutEvacuation("tubage", 10)} pour 10 m (TVA à 6 %).`,
          `Si vous n'avez pas de conduit, deux options. La ventouse concentrique, avec un poêle étanche : les fumées sortent par le tube central et l'air de combustion entre autour, pour environ ${surcoutEvacuation("ventouse-facade", 0)} TVAC de plus. Une sortie murale simple n'est pas admise, et Edilkamin et EK63 refusent la ventouse. L'autre option convient à tous les poêles : un conduit neuf double paroi qui monte au-dessus du toit, en façade ou par l'intérieur, environ ${surcoutEvacuation("conduit-exterieur", 6)} TVAC de plus pour 6 m en façade. Dans tous les cas, le diagnostic à domicile précise le devis.`,
        ],
      },
      {
        heading: "5. Compter les aides",
        paragraphs: [
          "La prime Habitation pour un poêle à pellets s'est arrêtée le 30 septembre 2026. Depuis le 1er octobre, la Wallonie aide la rénovation par deux prêts : le Rénopack, à 0 % avec 10 à 50 % effacés selon les revenus et les matériaux d'isolation, et le Rénoprêt. Ils sont réservés aux maisons classées E, F ou G qui gagnent le label exigé après un audit, et la demande de prêt passe avant tout devis signé ou acompte. Leur liste officielle de travaux ne nomme pas le poêle : il n'est financé que si l'audit le retient et que l'organisme prêteur l'accepte. Tout le détail est sur notre page consacrée aux aides.",
          "L'aide qui joue presque à chaque fois, c'est la TVA : 6 % au lieu de 21 % quand l'installateur fournit et pose le poêle dans un logement de plus de 10 ans. Pour les petits revenus, la subvention MEBAR (jusqu'à 2 000 €) passe par le CPAS, avant les travaux. Et demandez à votre commune : certaines gardent une prime énergie. Les forfaits de pose et des exemples chiffrés sont sur la page [prix d'un poêle à pellets posé](/prix-poele-pellets).",
        ],
      },
    ],
    faq: [
      {
        question: "Combien coûte un poêle à pellets installé en 2026 ?",
        answer: `Comptez ${rangeText(PRICE_RANGES.standard)} tout compris pour un poêle à air sur un conduit existant, tubé ou à tuber. Canalisable avec gaines : ${rangeText(PRICE_RANGES.canalisable)}. Hydro complet : ${rangeText(PRICE_RANGES.hydro)}. Dans un logement de plus de 10 ans, ces montants comprennent la TVA à 6 %. Le prix de départ du moment, calculé sur le poêle le moins cher du catalogue posé sur un conduit déjà tubé, est sur la page [prix d'un poêle à pellets posé](/prix-poele-pellets). Il n'y a plus de prime régionale pour un poêle depuis le 1er octobre 2026.`,
      },
      {
        question: "Quelle marque est la plus fiable ?",
        answer:
          "Edilkamin pour la durabilité long terme (15-20 ans). EK63 pour la connectivité moderne à prix doux. Girolami pour l'auto-nettoyage du brasier et l'hybride bois-pellet. Aucune n'est mauvaise, c'est le choix selon votre usage.",
      },
      {
        question: "Faut-il un audit énergétique ?",
        answer:
          "Pour un poêle seul, non : la prime qui l'exigeait s'est arrêtée le 30 septembre 2026. L'audit logement redevient indispensable si vous visez un Rénopack ou un Rénoprêt : il doit avoir été réalisé ou actualisé moins d'un an avant la demande de prêt, et c'est lui qui dit quels travaux font gagner le label exigé. La demande de prêt passe ensuite avant tout devis signé ou acompte.",
      },
    ],
    metaTitle: "Guide d'achat du poêle à pellets en Wallonie (2026)",
    metaDescription:
      "Le guide complet pour choisir votre poêle à pellets en Wallonie : technologies, marques, aides, pose, entretien. Conseils des techniciens Mister Pellets.",
  },
  {
    slug: "poele-pellets-canalisable",
    publishedAt: "2026-05-02",
    modifiedAt: "2026-11-11",
    title: "Poêle à pellets canalisable : fonctionnement, gaines, prix de pose",
    description:
      "Comment un poêle à pellets canalisable envoie l'air chaud dans une ou deux pièces, la longueur de gaine admise, la puissance à viser et le prix de la canalisation.",
    category: "Technique",
    excerpt:
      "Le canalisable est le poêle qu'on pose le plus dans les maisons à étage : un seul appareil, un seul conduit, et de l'air chaud qui part par des gaines vers une chambre ou un bureau. Voici ce qu'il fait bien, ses limites et ce qu'il coûte.",
    directAnswer: `Un poêle à pellets canalisable, ou à granulés, chauffe sa pièce et souffle une partie de son air chaud vers une ou deux autres pièces par des gaines isolées. MCZ annonce environ 8 m de gaine par sortie. Chez nous, la canalisation coûte ${formatEur(TARIFS.canalisationParPieceHT)} HTVA par pièce, ${TARIFS.canalisationPiecesMax} pièces au plus.`,
    sections: [
      {
        heading: "Comment fonctionne un poêle canalisable",
        paragraphs: [
          "Un poêle à air classique a une seule sortie d'air chaud, en façade. Le canalisable en ajoute une ou deux, à l'arrière ou sur le dessus, avec leur propre ventilateur. On y raccorde une gaine isolée qui passe dans une cloison, un faux plafond ou les combles et débouche par une bouche dans la pièce à chauffer.",
          "Vous réglez la répartition depuis la commande du poêle ou son application : plus de chaleur dans le séjour le soir, un peu dans la chambre avant le coucher. Selon le modèle, chaque sortie se règle à part ou suit le réglage général : la fiche et la notice le précisent.",
          "Le poêle reste un seul appareil, avec un seul conduit de fumées et un seul réservoir de pellets. C'est ce qui le rend intéressant face à deux poêles ou à un chauffage central complet.",
        ],
      },
      {
        heading: "Pour quelles maisons",
        paragraphs: [
          "Le canalisable convient bien à une maison à étage de 100 à 180 m², quand la pièce de vie est au rez-de-chaussée et qu'une ou deux chambres restent froides. Il convient aussi à un plain-pied en longueur, quand une pièce est trop loin du poêle pour profiter de sa chaleur.",
          "Il a ses limites. Au-delà de deux pièces desservies, l'air arrive tiède et le ventilateur force. Et une pièce fermée loin du poêle, au bout d'un long trajet, ne sera jamais aussi chaude que le séjour. Pour chauffer toutes les pièces, un [poêle à pellets hydro](/poeles-a-pellets-hydro) raccordé aux radiateurs fait mieux le travail.",
        ],
      },
      {
        heading: "La longueur de gaine : le point qui décide",
        paragraphs: [
          "Plus la gaine est longue, plus l'air perd de chaleur et de débit en route. MCZ annonce environ 8 m par sortie avec son kit Comfort Air, en précisant que la longueur réelle dépend du trajet, des coudes et de l'isolation de la gaine. Les autres fabricants fixent leur propre limite dans la notice de chaque modèle.",
          "Nous traçons le trajet à la visite technique, bouche par bouche : passage dans une cloison, dans un faux plafond ou par les combles, nombre de coudes, traversée d'un plancher. Un trajet court et droit vaut mieux qu'un poêle plus puissant.",
        ],
      },
      {
        heading: "Quelle puissance pour un canalisable",
        paragraphs: [
          "La puissance se calcule sur toute la surface chauffée, pièces desservies comprises. Notre [guide de la puissance](/guides/quelle-puissance-poele-pellets) donne le besoin selon la surface et l'isolation : une maison de 130 m² correctement isolée demande autour de 13 kW, une maison de 100 m² récente autour de 7 kW.",
          "Le tableau ci-dessous reprend quelques canalisables du catalogue avec leur puissance et le volume de chauffe annoncé par le fabricant. Toutes les fiches sont sur la page des [poêles à pellets canalisables](/poeles-a-pellets-canalisables), avec leurs prix.",
        ],
        table: {
          headers: ["Modèle", "Puissance", "Volume de chauffe", "Étanche"],
          rows: [
            ["[EK63 Tweed 90+ Evo](/produit/ek63-tweed-90)", "9,2 kW", "240 m³", "oui"],
            ["[Cadel Luce Plus 9 Up-Twin](/produit/cadel-luce-plus-9-up-twin)", "8,5 kW", "238 m³", "oui"],
            ["[EK63 Spy 110+ Evo](/produit/ek63-spy-110)", "10,5 kW", "275 m³", "oui"],
            ["[Edilkamin Cherie 11++ Evo](/produit/edilkamin-cherie-11-evo)", "11 kW", "285 m³", "non"],
            ["[EK63 Monday 130++ Evo](/produit/ek63-monday-130)", "12,6 kW", "330 m³", "oui"],
          ],
          caption: "Données des fiches du catalogue au 11/11/2026, reprises des fiches techniques des fabricants.",
        },
      },
      {
        heading: "La pose et ce qu'elle coûte",
        paragraphs: [
          `La canalisation se chiffre en plus de la pose du poêle et de son évacuation : ${CANAL_PIECE} par pièce desservie, matériel et main d'œuvre compris, ${TARIFS.canalisationPiecesMax} pièces au plus. La TVA à 6 % vaut pour un logement de plus de 10 ans.`,
          `Une pose avec des gaines vers d'autres pièces prend ${POSE_DURATIONS.canalisable}, contre ${POSE_DURATIONS.standard} pour un poêle à air sur un conduit existant. Sur une maison récente avec des gaines techniques prévues, le passage est presque invisible ; dans une maison ancienne, il faut parfois ouvrir un coffrage. Le déroulé complet est sur la page [installation d'un poêle à pellets](/installation-poele-a-pellets).`,
        ],
      },
      {
        heading: "Canalisable et maison bien isolée",
        paragraphs: [
          "La plupart des canalisables du catalogue sont aussi étanches : ils prennent leur air de combustion dehors et conviennent à une maison isolée équipée d'une ventilation double flux. Dans ce cas, l'évacuation se choisit avec le poêle : ventouse concentrique si sa notice la prévoit (jamais avec Edilkamin ni EK63), sinon conduit au-dessus du toit. Les règles sont détaillées dans notre article sur [l'évacuation des fumées](/blog/evacuation-fumees-poele-pellets).",
        ],
      },
      {
        heading: "Les erreurs qu'on voit le plus",
        list: [
          "Choisir la puissance sur le seul séjour, et oublier les pièces desservies.",
          "Prévoir une gaine trop longue ou pleine de coudes, qui livre un air tiède.",
          "Vouloir desservir trois ou quatre pièces : c'est le travail d'un poêle hydro.",
          "Poser la bouche haut dans une pièce à plafond haut, où l'air chaud reste sous le plafond.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien de pièces peut chauffer un poêle à pellets canalisable ?",
        answer: `La pièce où il est posé, plus une ou deux pièces voisines par des gaines. Nous canalisons ${TARIFS.canalisationPiecesMax} pièces au plus. Pour toute la maison, un [poêle hydro](/poeles-a-pellets-hydro) convient mieux.`,
      },
      {
        question: "Quelle longueur maximale pour une gaine de poêle canalisable ?",
        answer:
          "Celle de la notice du modèle. MCZ annonce environ 8 m par sortie avec son kit Comfort Air, selon le trajet, les coudes et l'isolation. Plus la gaine est courte, plus l'air arrive chaud.",
      },
      {
        question: "Peut-on canaliser à l'étage ?",
        answer:
          "Oui, c'est la configuration la plus fréquente. La gaine monte dans une cloison ou un coffrage, puis débouche dans une chambre ou un bureau de l'étage.",
      },
      {
        question: "Combien coûte la canalisation d'un poêle à pellets ?",
        answer: `${CANAL_PIECE} par pièce desservie chez nous, matériel et main d'œuvre compris, en plus de la pose du poêle. L'[estimation en ligne](/estimation) fait le total pour votre maison.`,
      },
    ],
    sources: [
      { label: "MCZ, foire aux questions belge : canalisation Comfort Air « jusqu'à environ 8 mètres », lue le 11/11/2026", href: "https://www.mcz.it/fr-be/service-support-poeles-cheminees/foire-aux-questions" },
      { label: "Fiches techniques des fabricants (puissance, volume de chauffe, étanchéité), reprises sur les fiches du catalogue au 11/11/2026" },
      { label: "Tarifs de pose de Mister Pellets (canalisation, durées de pose), relevés le 11/11/2026" },
    ],
    metaTitle: "Poêle à pellets canalisable : gaines et prix",
    metaDescription:
      "Poêle à pellets canalisable : comment il chauffe une ou deux pièces de plus, la longueur de gaine admise, la puissance à viser et le prix de la canalisation.",
  },
  {
    slug: "poele-pellets-hydro",
    publishedAt: "2026-05-02",
    modifiedAt: "2026-11-11",
    title: "Poêle à pellets hydro : fonctionnement, puissance et pose",
    description:
      "Comment un poêle à pellets hydro chauffe l'eau des radiateurs, la puissance à viser, le réservoir et le silo, le raccordement, l'entretien obligatoire et la TVA.",
    category: "Technique",
    excerpt:
      "Un poêle hydro chauffe la pièce où il est posé et l'eau de votre chauffage central. Bien choisi, il remplace une chaudière ; mal dimensionné, il déçoit. Voici comment il fonctionne et ce qu'on vérifie avant d'en poser un.",
    directAnswer:
      `Un poêle à pellets hydro, ou thermopoêle à granulés, chauffe l'eau du chauffage central en plus de la pièce où il est posé : il alimente radiateurs ou plancher chauffant, comme une chaudière. Il se choisit sur la puissance rendue à l'eau, se raccorde en ${POSE_DURATIONS.hydro} et se fait contrôler chaque année.`,
    sections: [
      {
        heading: "Le principe : l'eau d'abord, l'air ensuite",
        paragraphs: [
          "Un poêle hydro a un échangeur dans lequel circule l'eau du chauffage central. Une part de la chaleur des pellets passe dans cette eau, qui part vers les radiateurs, le plancher chauffant et, selon l'installation, le ballon d'eau chaude. Le reste chauffe la pièce où il est posé, par la vitre et le corps du poêle.",
          "Chaque fabricant donne les deux puissances sur la fiche technique : la puissance totale et la part rendue à l'eau. C'est la seconde qui compte pour chauffer la maison. Un poêle annoncé à 24 kW ne livre pas 24 kW aux radiateurs.",
        ],
      },
      {
        heading: "Quelle puissance pour un poêle hydro",
        paragraphs: [
          "On part du besoin de toute la maison, pas de la pièce du poêle. Notre [guide de la puissance](/guides/quelle-puissance-poele-pellets) donne l'ordre de grandeur selon la surface et l'isolation : une maison de 200 m² correctement isolée demande autour de 20 kW. La visite technique le recoupe avec l'installation en place et, si vous l'avez, avec votre consommation de mazout ou de gaz des derniers hivers.",
          "Le tableau ci-dessous reprend quelques hydros du catalogue. Toutes les fiches sont sur la page des [poêles à pellets hydro](/poeles-a-pellets-hydro).",
        ],
        table: {
          headers: ["Modèle", "Puissance", "Volume de chauffe", "Réservoir"],
          rows: [
            ["[EK63 Spot 100 H Evo](/produit/ek63-spot-100h)", "10,1 kW", "265 m³", "14 kg"],
            ["[MCZ Ego Hydro Matic 12 R](/produit/mcz-ego-hydro-matic-12-r)", "12,1 kW", "346 m³", "20 kg"],
            ["[MCZ Thea Hydro 18 R](/produit/mcz-thea-hydro-18-r)", "18 kW", "514 m³", "28 kg"],
            ["[EK63 Monday H 190 Evo](/produit/ek63-monday-190h)", "19,2 kW", "500 m³", "30 kg"],
            ["[EK63 Monday H 230 Evo](/produit/ek63-monday-230h)", "22,8 kW", "595 m³", "30 kg"],
          ],
          caption: "Données des fiches du catalogue au 11/11/2026, reprises des fiches techniques des fabricants. La part rendue à l'eau figure sur chaque fiche technique.",
        },
      },
      {
        heading: "Le raccordement au chauffage central",
        paragraphs: [
          "Le poêle se pose dans une pièce de vie et se raccorde au circuit existant : départ et retour vers les radiateurs ou le plancher chauffant, sécurités du circuit, et selon le cas un ballon pour l'eau chaude. Il garde aussi son évacuation de fumées, comme tout poêle à pellets : tubage d'une cheminée, conduit au-dessus du toit ou ventouse concentrique sur un modèle étanche qui la prévoit (jamais avec Edilkamin ni EK63).",
          `Le chantier dure ${POSE_DURATIONS.hydro}, désembouage du circuit compris. Avant de chiffrer, on relève à la visite l'état des radiateurs, la place du poêle et le trajet jusqu'au circuit. Le déroulé d'une pose est sur la page [installation d'un poêle à pellets](/installation-poele-a-pellets).`,
        ],
      },
      {
        heading: "Le réservoir et le silo",
        paragraphs: [
          "Les hydros du catalogue ont un réservoir de 14 à 30 kg de pellets selon le modèle : une grosse journée en régime doux, quelques heures à pleine puissance. En plein hiver, quand le poêle chauffe toute la maison, il faut donc remplir souvent.",
          "Un silo relié au poêle évite le remplissage quotidien. Il se prévoit dès le devis, parce qu'il demande de la place et un passage pour l'alimentation. Un sac de 15 kg reste la façon la plus simple de commencer, avec une [palette de pellets Comfo](/palette-pellets-comfo) retirée à Fernelmont.",
        ],
      },
      {
        heading: "L'entretien : annuel, et contrôlé",
        paragraphs: [
          "Raccordé au chauffage central, un poêle hydro entre dans la règle wallonne. L'arrêté du Gouvernement wallon du 29 janvier 2009 sur les installations de chauffage central impose à l'utilisateur une inspection périodique, annuelle quand le combustible est solide, ce qui est le cas des pellets (articles 10, 4°, et 13). Elle est faite par une personne qualifiée, agréée quand l'arrêté l'exige, qui remet une attestation de contrôle à conserver. Le texte est cité dans les sources en bas de page.",
          "L'entretien de l'appareil est une obligation d'un autre ordre, celle du fabricant : MCZ demande un entretien chaque année par un technicien agréé, normalement à la fin de l'hiver.",
          "Notre [entretien annuel](/entretien-poele-a-pellets) coûte 175 € TVAC, ramonage du conduit compris : c'est un nettoyage et un réglage de l'appareil, présenté sur sa page. Entre deux entretiens, vous videz le brasier et les cendres comme sur un poêle à air : le [guide de l'entretien](/guides/comment-entretenir-poele-pellets) donne la liste. Les modèles MCZ « Matic » ont un brasier qui se nettoie seul.",
        ],
      },
      {
        heading: "Budget, TVA et aides",
        paragraphs: [
          "Le prix d'un hydro posé dépend de la puissance, du raccordement et de l'évacuation. L'[estimation en ligne](/estimation) compose le total avec le poêle choisi, et la visite technique le rend ferme. Les fiches sans prix affiché sont sur devis.",
          "La prime Habitation s'est arrêtée le 30 septembre 2026. L'aide qui joue presque toujours est la TVA à 6 % au lieu de 21 %, quand nous fournissons et posons le poêle dans un logement privé de plus de 10 ans. Pour les petits revenus, la subvention MEBAR passe par le CPAS avant les travaux. Le détail est sur [notre page des aides](/aides-poele-a-pellets-wallonie).",
        ],
      },
      {
        heading: "Vous remplacez une chaudière au mazout ?",
        paragraphs: [
          "Le poêle hydro est une des solutions, pas la seule. Le calendrier wallon du mazout, le sort de la citerne et le budget d'un remplacement sont détaillés dans notre article [remplacer une chaudière au mazout par un poêle hydro](/blog/remplacer-chaudiere-mazout-poele-hydro). Pour un Edilkamin en particulier, voyez [le cas d'un Edilkamin hydro](/blog/remplacer-chaudiere-mazout-edilkamin-hydro).",
        ],
      },
    ],
    faq: [
      {
        question: "Un poêle à pellets hydro peut-il chauffer toute une maison ?",
        answer:
          "Oui, quand la puissance qu'il rend à l'eau couvre le besoin de la maison et que le circuit de radiateurs ou de plancher chauffant est en état. La visite technique le vérifie avant tout devis.",
      },
      {
        question: "Faut-il garder l'ancienne chaudière en secours ?",
        answer:
          "Ce n'est pas obligatoire. Certains clients la gardent pour les très grands froids ou une panne. Dites-le à la visite : le raccordement des deux appareils se prévoit dans le devis.",
      },
      {
        question: "Combien de temps tient le réservoir d'un poêle hydro ?",
        answer:
          "Les hydros du catalogue ont un réservoir de 14 à 30 kg : de quelques heures à pleine puissance à une grosse journée en régime doux. Un silo relié au poêle évite de remplir chaque jour.",
      },
      {
        question: "Un poêle hydro doit-il être entretenu chaque année ?",
        answer:
          "Deux règles s'ajoutent. Raccordé au chauffage central, il doit passer une inspection périodique annuelle, avec une attestation de contrôle (arrêté wallon du 29 janvier 2009, articles 10 et 13). Et MCZ demande un entretien annuel de l'appareil par un technicien agréé : chez nous, 175 € TVAC, ramonage compris.",
      },
    ],
    sources: [
      { label: "Arrêté du Gouvernement wallon du 29 janvier 2009 sur les installations de chauffage central, consolidation officieuse de Wallex en vigueur depuis le 24/02/2023, art. 10, 4°, et art. 13, lue le 11/11/2026", href: "https://wallex.wallonie.be/files/pdfs/19/6833_Arr%C3%AAt%C3%A9_du_Gouvernement_wallon_tendant_%C3%A0_pr%C3%A9venir_la_pollution_atmosph%C3%A9rique_provoqu%C3%A9e_par_les_installations_de_chauffage_central_destin%C3%A9es_au_chauffage_de_b%C3%A2timents_ou_%C3%A0_la_production_d'eau_chaud_24-02-2023-.pdf" },
      { label: "MCZ, foire aux questions belge : entretien annuel par un technicien agréé, brasier autonettoyant des modèles Matic, lue le 11/11/2026", href: "https://www.mcz.it/fr-be/service-support-poeles-cheminees/foire-aux-questions" },
      { label: "Fiches techniques des fabricants (puissance, volume de chauffe, réservoir), reprises sur les fiches du catalogue au 11/11/2026" },
    ],
    metaTitle: "Poêle à pellets hydro : fonctionnement et pose",
    metaDescription:
      "Poêle à pellets hydro : comment il chauffe les radiateurs, la puissance à viser, réservoir et silo, raccordement, entretien annuel et TVA à 6 %.",
  },
  {
    slug: "comment-entretenir-poele-pellets",
    publishedAt: "2026-05-02",
    modifiedAt: "2026-11-11",
    title: "L'entretien d'un poêle à pellets : ce que vous faites, ce que fait le technicien",
    description:
      "Au quotidien, chaque semaine, en début et fin de saison, puis une fois par an par un technicien : la liste des gestes, leur fréquence, ce qui est obligatoire et ce que ça coûte.",
    category: "Entretien",
    excerpt:
      "Un poêle à pellets s'encrasse vite s'il est négligé : vitre noire, allumages ratés, extinctions. Quelques minutes de votre part, un entretien par an par un technicien, et il tourne sans histoire. Voici qui fait quoi.",
    directAnswer:
      "Entretenir un poêle à pellets, ou poêle à granulés, tient en deux parts. Vous videz le brasier et les cendres, et vous nettoyez la vitre, de chaque jour à chaque semaine selon l'usage. Un technicien démonte et nettoie l'appareil une fois par an : MCZ l'impose, l'assurance demande le ramonage. Chez nous, 175 € TVAC, ramonage compris.",
    sections: [
      {
        heading: "Qui fait quoi, et quand",
        paragraphs: [
          "Le tableau résume la répartition. Les fréquences dépendent de l'usage et des pellets : un poêle qui chauffe la maison tout l'hiver s'encrasse plus vite qu'un appoint du soir. La notice de votre modèle fait foi.",
        ],
        table: {
          headers: ["Quand", "Qui", "Quoi"],
          rows: [
            ["Chaque jour ou tous les deux jours", "Vous", "Vider le brasier s'il s'encrasse, vérifier le niveau du réservoir, coup de brosse sèche sur la vitre"],
            ["Chaque semaine", "Vous", "Aspirer le foyer froid, vider le bac à cendres, vérifier qu'aucun corps étranger n'est tombé dans le réservoir"],
            ["Début et fin de saison", "Vous", "Contrôler les joints de porte, dégager la prise d'air et le terminal extérieur, vider le réservoir en fin d'hiver"],
            ["Une fois par an", "Technicien", "Démontage, échangeur, extracteur de fumées, capteurs, joints, combustion, ramonage du conduit et certificat"],
          ],
          caption: "Répartition courante des gestes d'entretien ; la notice du fabricant fixe les fréquences de votre modèle.",
        },
      },
      {
        heading: "Au quotidien : quelques minutes",
        list: [
          "Videz le brasier quand des résidus durcis bouchent ses trous : l'air de combustion passe mal et l'allumage rate. MCZ demande simplement de retirer les incrustations du brasero.",
          "Vérifiez le réservoir : un poêle qui manque de pellets s'arrête en alarme.",
          "Passez une brosse sèche sur la vitre : d'après MCZ, seule une fine couche de cendre s'y dépose quand la combustion est bonne. Un nettoyant pour vitre s'utilise avec modération, loin des parties peintes et du joint de porte.",
        ],
      },
      {
        heading: "Chaque semaine : le foyer et les cendres",
        list: [
          "Poêle éteint et froid, aspirez le foyer avec un aspirateur à cendres, jamais un aspirateur ménager.",
          "Videz le bac à cendres avant qu'il ne déborde.",
          "Regardez dans le réservoir : un caillou ou une agrafe venue d'un sac peut bloquer la vis sans fin.",
        ],
      },
      {
        heading: "En début et en fin de saison",
        paragraphs: [
          "À l'automne, avant le premier feu : réservoir, creuset, prise d'air et terminal extérieur, comme le détaille notre guide [remettre son poêle en route à l'automne](/guides/remettre-en-route-poele-pellets-automne). Au printemps : videz le réservoir, pour que les pellets ne reprennent pas l'humidité pendant l'été, et faites faire l'entretien annuel si ce n'est pas encore fait.",
        ],
      },
      {
        heading: "Une fois par an : l'entretien par un technicien",
        paragraphs: [
          "MCZ écrit qu'une fois par an, normalement à la fin de l'hiver, il faut s'adresser à un technicien agréé pour l'entretien ordinaire. Cadel demande, au moins une fois par an, de faire nettoyer la chambre de combustion, vérifier les joints, nettoyer moteurs et ventilateurs et contrôler la carte électronique, par son service technique agréé. Le technicien démonte le poêle, nettoie l'échangeur et l'extracteur de fumées, contrôle les capteurs et les joints, règle la combustion et ramone le conduit.",
          "Aucune loi wallonne n'impose le ramonage d'un poêle à air, mais la plupart des contrats d'assurance incendie l'exigent chaque année : gardez le certificat. Un poêle hydro raccordé au chauffage central est un cas à part : l'arrêté wallon du 29 janvier 2009 impose une inspection périodique annuelle des installations au combustible solide, avec une attestation de contrôle (articles 10 et 13).",
          "Cette inspection est distincte de l'entretien de l'appareil. Chez Mister Pellets, l'[entretien annuel](/entretien-poele-a-pellets) coûte 175 € TVAC, ramonage du conduit compris, et le [ramonage seul](/ramonage) 90 € TVAC, certificat compris.",
        ],
      },
      {
        heading: "Les pellets font la moitié de l'entretien",
        paragraphs: [
          "MCZ conseille de n'utiliser que des pellets certifiés (ENplus, DINplus et équivalents) et prévient que les dégâts dus à un pellet inadapté ne sont pas couverts par la garantie. Un pellet de faible qualité salit vite le poêle, qu'il faut alors nettoyer plus souvent. Stockez les sacs au sec : un pellet qui a pris l'humidité gonfle, s'effrite et encrasse le brasier.",
          "Notre article [ENplus A1 ou DINplus](/blog/pellets-enplus-a1-vs-dinplus) compare les deux certifications, et le relevé du [prix des pellets](/blog/prix-pellets-belgique) donne le prix du sac mois par mois.",
        ],
      },
      {
        heading: "Les poêles qui demandent moins d'entretien",
        paragraphs: [
          "Certains modèles nettoient leur brasier seuls. Chez MCZ, les modèles « Matic » ont un brasero autonettoyant, comme le [MCZ Ego Hydro Matic 8 R](/produit/mcz-ego-hydro-matic-8-r). Chez Cadel, les versions « Autoclean » ont la même fonction, comme le [Cadel Prince 11 Autoclean](/produit/cadel-prince-11-autoclean) ou le [Cadel Vesta Plus 11 Autoclean](/produit/cadel-vesta-plus-11-autoclean). Girolami pousse le pellet sous le brasier avec son système Source Feeding, qui le garde propre, sur des poêles comme le [Girolami Split](/produit/girolami-split).",
          "Ils ne dispensent pas de l'entretien annuel ni du bac à cendres, mais ils espacent les gestes du quotidien.",
        ],
      },
      {
        heading: "Quand appeler plutôt que nettoyer",
        list: [
          "Une odeur de fumée dans la pièce ou l'alarme du détecteur de monoxyde de carbone : éteignez, aérez, sortez et appelez.",
          "Une vitre qui noircit en quelques heures malgré un brasier propre et des pellets secs.",
          "Le même code d'erreur qui revient après un réarmement, ou deux allumages ratés de suite avec un réservoir plein.",
          "Un bruit nouveau : vis sans fin qui grince, ventilateur qui frotte.",
        ],
        paragraphs: [
          "Notre service de [dépannage](/depannage-poele-a-pellets) intervient sur toutes les marques, à 110 € TVAC la première heure, déplacement inclus.",
        ],
      },
    ],
    faq: [
      {
        question: "L'entretien annuel d'un poêle à pellets est-il obligatoire ?",
        answer:
          "Aucune loi wallonne ne l'impose pour un poêle à air, mais les fabricants le demandent pour la garantie (MCZ parle d'entretien annuel par un technicien agréé) et l'assurance incendie exige souvent le certificat de ramonage. Un poêle hydro raccordé au chauffage central doit en plus passer l'inspection périodique annuelle prévue par l'arrêté wallon du 29 janvier 2009, avec attestation de contrôle.",
      },
      {
        question: "Combien coûte l'entretien d'un poêle à pellets ?",
        answer:
          "Chez nous, 175 € TVAC, ramonage du conduit compris, déplacement inclus dans la zone d'intervention. Le ramonage seul coûte 90 € TVAC, certificat compris.",
      },
      {
        question: "À quelle fréquence nettoyer le brasier d'un poêle à pellets ?",
        answer:
          "Dès que des résidus durcis bouchent ses trous : chaque jour ou tous les deux jours en plein hiver, moins souvent avec de bons pellets ou un brasier autonettoyant. La notice de votre modèle donne la fréquence.",
      },
      {
        question: "Que faire si le poêle s'éteint tout seul ?",
        answer:
          "Vérifiez le réservoir, le brasier et la porte, laissez refroidir, puis relancez une fois. Si l'arrêt revient, appelez : notre article [poêle qui s'éteint tout seul](/blog/poele-pellets-eteint-tout-seul-causes) détaille les causes.",
      },
    ],
    sources: [
      { label: "MCZ, foire aux questions belge : nettoyage du brasero et de la vitre, entretien annuel par un technicien agréé, pellets certifiés et garantie, lue le 11/11/2026", href: "https://www.mcz.it/fr-be/service-support-poeles-cheminees/foire-aux-questions" },
      { label: "Arrêté du Gouvernement wallon du 29 janvier 2009 sur les installations de chauffage central, consolidation officieuse de Wallex en vigueur depuis le 24/02/2023, art. 10, 4°, et art. 13, lue le 11/11/2026", href: "https://wallex.wallonie.be/files/pdfs/19/6833_Arr%C3%AAt%C3%A9_du_Gouvernement_wallon_tendant_%C3%A0_pr%C3%A9venir_la_pollution_atmosph%C3%A9rique_provoqu%C3%A9e_par_les_installations_de_chauffage_central_destin%C3%A9es_au_chauffage_de_b%C3%A2timents_ou_%C3%A0_la_production_d'eau_chaud_24-02-2023-.pdf" },
      { label: "Cadel, manuel de l'utilisateur « Poêle à granulés », réf. 89023068A (©2025), § 13 (nettoyage), lu le 11/11/2026", href: "https://grp.cadelsrl.com/documents/89023068A.pdf" },
      { label: "Tarifs d'entretien, de ramonage et de dépannage de Mister Pellets au 11/11/2026" },
    ],
    metaTitle: "Entretien d'un poêle à pellets : qui fait quoi",
    metaDescription:
      "Entretien d'un poêle à pellets : gestes du quotidien, de la semaine et de la saison, entretien annuel par un technicien, obligations et tarifs en Wallonie.",
  },
  {
    slug: "quelle-puissance-poele-pellets",
    publishedAt: "2026-05-02",
    modifiedAt: "2026-11-11",
    title: "Quelle puissance de poêle à pellets pour votre maison ?",
    description:
      "Le besoin par m² selon l'isolation, les tableaux surface et puissance (6, 8, 10, 12 kW…), la correction des plafonds hauts et trois exemples chiffrés en Wallonie.",
    category: "Choix",
    excerpt:
      "Trop faible, le poêle tourne à fond tout l'hiver ; trop fort, il tourne au ralenti et s'encrasse. Le calcul tient en deux chiffres, la surface et l'isolation, puis se vérifie chez vous.",
    directAnswer: `La puissance d'un poêle à pellets se calcule sur la surface chauffée et l'isolation : environ ${ISO.recent.wattsPerM2} W par m² en PEB A ou B, ${ISO.bonne.wattsPerM2} W en PEB C ou D, ${ISO.moyenne.wattsPerM2} W en PEB E et ${ISO.ancienne.wattsPerM2} W en PEB F ou G. Pour 100 m² en PEB C : ${kwFr(recommendedKw(100, "bonne"))} kW.`,
    sections: [
      {
        heading: "La règle de calcul",
        paragraphs: [
          "Multipliez la surface à chauffer (en m²) par le besoin de votre maison (en W par m²), puis divisez par 1 000 : vous avez la puissance en kW. Le besoin dépend surtout de l'isolation, que le certificat PEB résume en une lettre. Ce sont les valeurs de notre [estimation en ligne](/estimation), qui propose ensuite les poêles du catalogue proches du besoin.",
          "Ces valeurs supposent une hauteur sous plafond courante, autour de 2,50 m, et une maison chauffée normalement, à 19 ou 20 °C. Ce sont des ordres de grandeur : la visite technique les affine avec l'orientation, les volumes ouverts et l'usage.",
        ],
        table: {
          headers: ["Surface chauffée", ...ISO_HEADERS],
          rows: POWER_BY_SURFACE,
          caption: "Puissance conseillée, arrondie à 0,1 kW, selon la grille de notre estimation en ligne. Hauteur sous plafond de 2,50 m environ.",
        },
      },
      {
        heading: "6, 8, 10, 12 kW : pour combien de m² ?",
        paragraphs: [
          "Vous avez repéré un modèle et vous voulez savoir s'il suffit ? Lisez le tableau dans l'autre sens : chaque puissance couvre une surface qui dépend de l'isolation.",
        ],
        table: {
          headers: ["Puissance du poêle", ...ISO_HEADERS],
          rows: SURFACE_BY_POWER,
          caption: "Surface couverte, arrondie à 5 m², même grille. Les poêles de 18 kW et plus sont des hydros raccordés aux radiateurs.",
        },
      },
      {
        heading: "Trop fort ou trop faible : la marge à respecter",
        paragraphs: [
          `Un poêle trop faible tourne à plein régime pour suivre la demande : il consomme plus, s'use plus vite et ne tient pas la température par grand froid. Un poêle trop fort tourne au ralenti, s'allume et s'éteint souvent, encrasse son brasier et sa vitre. Notre estimation en ligne retient comme bien dimensionné un poêle entre ${WIN_MIN} % et ${WIN_MAX} % du besoin calculé.`,
          "Entre deux puissances, prenez la plus proche du besoin plutôt que la plus forte. Une marge raisonnable suffit : les poêles à pellets modulent leur puissance, du ralenti au maximum.",
        ],
      },
      {
        heading: "Plafond haut, mezzanine, pièce ouverte",
        paragraphs: [
          "La grille suppose 2,50 m sous plafond. Avec une mezzanine, un plafond cathédrale ou une ancienne grange à 4 m, il y a plus d'air à chauffer pour la même surface. Raisonnez alors en volume : chaque fiche du catalogue donne le volume de chauffe annoncé par le fabricant, en m³. Comparez-le au volume de votre pièce (surface multipliée par la hauteur moyenne).",
          "Un escalier ouvert fait monter la chaleur à l'étage, mais sans la répartir : les chambres du fond restent fraîches. Dans ce cas, un [poêle canalisable](/poeles-a-pellets-canalisables) qui souffle dans une ou deux pièces vaut mieux qu'un poêle plus puissant.",
        ],
      },
      {
        heading: "Poêle à air, canalisable ou hydro selon la puissance",
        list: [
          "Une pièce de vie ouverte, bien isolée : un poêle à air de 6 à 10 kW suffit le plus souvent.",
          "Une maison à étage avec une ou deux chambres froides : un [canalisable](/poeles-a-pellets-canalisables), de 8 à 13 kW selon la surface.",
          "Toute la maison, avec des radiateurs ou un plancher chauffant : un [poêle hydro](/poeles-a-pellets-hydro), dont la puissance rendue à l'eau couvre le besoin de la maison.",
          "Une cheminée existante à reprendre : un [insert à pellets](/inserts-a-pellets), avec la même règle de puissance.",
        ],
      },
      {
        heading: "Trois exemples chiffrés",
        paragraphs: [
          `Maison récente de 100 m², PEB B : 100 × ${ISO.recent.wattsPerM2} W = ${kwFr(recommendedKw(100, "recent"))} kW. Un poêle à air de 7 kW environ convient, comme le [Cadel Perla 7](/produit/cadel-perla-7) ou l'[EK63 Zone 80 Evo](/produit/ek63-zone-80) (7,6 kW). Les deux sont étanches, utile si la maison a une ventilation double flux.`,
          `Maison à étage de 130 m², PEB D : 130 × ${ISO.bonne.wattsPerM2} W = ${kwFr(recommendedKw(130, "bonne"))} kW. Si le séjour s'ouvre sur l'escalier et que deux chambres restent froides, un canalisable de 12 à 13 kW fait le travail, comme l'[EK63 Monday 130++ Evo](/produit/ek63-monday-130) ou l'[Edilkamin Vyda 13++ Evo](/produit/edilkamin-vyda-13), tous deux à 12,6 kW.`,
          `Maison de 200 m² avec radiateurs, PEB C : 200 × ${ISO.bonne.wattsPerM2} W = ${kwFr(recommendedKw(200, "bonne"))} kW. C'est le domaine du poêle hydro, comme l'[EK63 Monday H 190 Evo](/produit/ek63-monday-190h) (19,2 kW). La part rendue à l'eau, indiquée par le fabricant, se compare au besoin des radiateurs à la visite.`,
        ],
      },
      {
        heading: "Après une rénovation, refaire le calcul",
        paragraphs: [
          "Isoler la toiture ou changer les châssis fait baisser le besoin. Si vous prévoyez ces travaux dans les deux ou trois ans, dimensionnez le poêle pour la maison rénovée, pas pour la maison d'aujourd'hui : il tournera un peu plus fort au début, puis à son régime normal. Dites-le à la visite technique, on en tient compte.",
        ],
      },
    ],
    faq: [
      {
        question: "Quelle puissance de poêle à pellets pour 100 m² ?",
        answer: `${kwFr(recommendedKw(100, "recent"))} kW si la maison est récente ou bien isolée (PEB A ou B), ${kwFr(recommendedKw(100, "bonne"))} kW en PEB C ou D, ${kwFr(recommendedKw(100, "moyenne"))} kW en PEB E et ${kwFr(recommendedKw(100, "ancienne"))} kW en PEB F ou G, pour 2,50 m sous plafond.`,
      },
      {
        question: "Un poêle à pellets de 8 kW chauffe combien de m² ?",
        answer: `Environ ${surfaceFor(8, "recent")} m² dans une maison récente, ${surfaceFor(8, "bonne")} m² en PEB C ou D, ${surfaceFor(8, "moyenne")} m² en PEB E et ${surfaceFor(8, "ancienne")} m² en PEB F ou G.`,
      },
      {
        question: "Peut-on chauffer toute une maison avec un seul poêle à pellets ?",
        answer:
          "Oui, avec un canalisable pour une ou deux pièces de plus, ou avec un poêle hydro raccordé aux radiateurs pour toutes les pièces. Un poêle à air chauffe la pièce où il est posé et les pièces ouvertes sur elle.",
      },
      {
        question: "Vaut-il mieux prendre un poêle plus puissant, par sécurité ?",
        answer:
          "Non. Un poêle trop fort tourne au ralenti, s'allume et s'éteint souvent et s'encrasse plus vite. Prenez la puissance la plus proche du besoin calculé.",
      },
      {
        question: "Et si je rénove après l'installation ?",
        answer:
          "Le besoin baisse et le poêle tournera plus bas. Si les travaux sont prévus, dimensionnez pour la maison rénovée et signalez-les à la visite technique.",
      },
    ],
    sources: [
      { label: "Grille de besoin de chauffe de l'estimation en ligne Mister Pellets (W par m² selon le PEB), état du 11/11/2026" },
      { label: "Fiches techniques des fabricants (puissance nominale, volume de chauffe), reprises sur les fiches du catalogue au 11/11/2026" },
    ],
    metaTitle: "Quelle puissance de poêle à pellets ? Tableaux",
    metaDescription:
      "Quelle puissance de poêle à pellets selon la surface et le PEB : tableaux 6, 8, 10, 12 kW, plafonds hauts, trois exemples chiffrés en Wallonie.",
  },
  // Codes d'erreur (11/11/2026). Seules les notices officielles lues ce jour-là
  // sont reprises : Cadel, manuel de l'utilisateur réf. 89023068A (©2025, Sweet,
  // Perla, Cristal, One, Beam, Accent, Sharp, Lee, Chrome, Round, Sound, Bold 7
  // Up Twin, Brio 7, Bi Flux), § 12 et 12.10-12.11, sur grp.cadelsrl.com ; FAQ
  // belge de MCZ (réarmement). Les tableaux MCZ, Edilkamin, EK63, Girolami et
  // Austroflamm restent à écrire, notice officielle en main.
  {
    slug: "codes-erreur-poele-pellets",
    publishedAt: "2026-11-11",
    modifiedAt: "2026-11-11",
    title: "Codes d'erreur et pannes d'un poêle à pellets : que faire ?",
    description:
      "Ce que veut dire une alarme de poêle à pellets, la table des codes Cadel d'après la notice officielle, comment réarmer, ce qu'il ne faut pas faire et quand appeler.",
    category: "Entretien",
    excerpt:
      "Un poêle à pellets qui s'arrête affiche presque toujours un code. Ce code dit quel organe de sécurité l'a arrêté. Voici comment le lire, les gestes permis, et la table complète des codes Cadel, tirée de la notice du fabricant.",
    directAnswer:
      "Un code d'erreur indique quelle sécurité a arrêté le poêle à pellets, ou poêle à granulés : allumage raté, flamme éteinte, surchauffe, dépression dans le conduit, sonde ou ventilateur en panne. Notez le code, laissez refroidir, videz le brasier, vérifiez le réservoir et la porte, puis réarmez une seule fois. Si l'alarme revient, appelez un technicien.",
    sections: [
      {
        heading: "Lire un code d'erreur",
        paragraphs: [
          "Quand le poêle détecte un fonctionnement anormal, il coupe l'arrivée de pellets, passe en phase de refroidissement et affiche un code sur son écran, sa télécommande ou son application. Chez Cadel, les codes commencent par « A » suivi de deux chiffres ; d'autres marques ont leur propre nomenclature. Le code ne dit pas toujours la cause exacte, mais il dit quelle sécurité a réagi : c'est ce qui oriente la vérification.",
          "Notez le code et la marque du poêle avant tout. Au téléphone, c'est la première chose qu'on vous demandera, et elle évite souvent un déplacement inutile.",
        ],
      },
      {
        heading: "Les familles d'alarmes, toutes marques",
        paragraphs: [
          "La notice Cadel décrit ces sécurités une à une. On retrouve les mêmes familles sur la plupart des poêles à pellets, sous d'autres codes.",
        ],
        table: {
          headers: ["Famille", "Ce qui se passe", "Vérification possible"],
          rows: [
            ["Allumage raté", "Aucune flamme ne se développe pendant la phase d'allumage", "Brasier propre et bien en place, pellets dans le réservoir, porte et couvercle fermés"],
            ["Extinction anormale", "La flamme s'éteint en cours de fonctionnement", "Niveau de pellets dans le réservoir"],
            ["Dépression, pressostat", "La pression dans le conduit sort des limites : conduit bouché, vent fort, porte ou réservoir ouvert, joints usés", "Porte, couvercle, joints ; le conduit, lui, se contrôle par un professionnel"],
            ["Surchauffe", "Les fumées, le réservoir ou l'eau dépassent leur seuil de sécurité", "Laisser refroidir, dégager les grilles d'aération"],
            ["Sonde ou ventilateur", "Sonde des fumées en panne, ventilateur des fumées à l'arrêt", "Aucune : appeler"],
            ["Coupure de courant", "Le poêle s'arrête et redémarre selon sa notice", "Attendre la fin du cycle de reprise"],
          ],
          caption: "D'après la notice Cadel réf. 89023068A, § 12 (dispositifs de sécurité et alarmes).",
        },
      },
      {
        heading: "Codes Cadel : la table de la notice",
        paragraphs: [
          "Cadel publie la table suivante dans le manuel de l'utilisateur de ses poêles Sweet, Perla, Cristal, One, Beam, Accent, Sharp, Lee, Chrome, Round, Sound, Bold, Brio et Bi Flux. D'autres gammes Cadel peuvent avoir une table légèrement différente : vérifiez dans la notice de votre modèle. Parmi les poêles du catalogue, le [Cadel Perla 7](/produit/cadel-perla-7) et le [Cadel Sweet 7](/produit/cadel-sweet-7) relèvent de ce manuel.",
        ],
        table: {
          headers: ["Code", "Ce que dit la notice", "Ce que la notice demande"],
          rows: [
            ["A01", "Défaut d'allumage du feu", "Contrôler la propreté et la position du brasier, le niveau de pellets, la fermeture du couvercle et de la porte. Causes possibles aussi : conduit bouché, résistance d'allumage endommagée"],
            ["A02", "Extinction anormale du feu", "Contrôler le niveau de pellets dans le réservoir"],
            ["A03", "Alarme thermostats : le réservoir de pellets ou l'eau dépasse le seuil de sécurité", "Attendre la fin du refroidissement, annuler l'alarme, rallumer avec le dosage de pellets au minimum, vérifier que la poussière ne bouche pas la grille d'aération arrière"],
            ["A04", "Surchauffe des fumées", "Réduire le chargement de pellets (dosage)"],
            ["A05", "Alarme pressostat : intervention du pressostat des fumées", "Vérifier conduit, porte, réservoir, joints, conduits latéraux des fumées ; causes possibles : cheminée trop longue, météo défavorable, poêle bouché"],
            ["A06", "Alarme de nettoyage : nettoyeur bloqué (brasier autonettoyant seulement)", "Nettoyer le brasier et retirer ce qui bloque la rotation"],
            ["A08", "Fonctionnement anormal du ventilateur des fumées", "Contacter le service après-vente si l'alarme persiste"],
            ["A09", "Panne de la sonde des fumées", "Contacter le service après-vente si l'alarme persiste"],
            ["SERVICE", "Avis de maintenance périodique, non bloquant", "Les heures de fonctionnement prévues avant l'entretien sont écoulées : appeler pour l'entretien"],
          ],
          caption: "Cadel, manuel de l'utilisateur réf. 89023068A, § 12.10, lu le 11/11/2026. Résumé ; la notice de votre modèle fait foi.",
        },
      },
      {
        heading: "Réarmer après une alarme",
        paragraphs: [
          "Chez Cadel, la notice demande d'appuyer quelques instants sur la touche 1 (ESC). Le poêle contrôle alors si la cause persiste : si oui, l'alarme revient ; sinon, il se met à l'arrêt et vous pouvez le rallumer. MCZ, dans sa foire aux questions belge, indique de maintenir enfoncé quelques secondes le bouton marche-arrêt, ou de suivre la notice.",
          "Avant de relancer, laissez le poêle finir son refroidissement et videz le brasier s'il est plein de pellets non brûlés. Rallumer sur un tas de pellets, c'est risquer un départ de flamme brutal dans le foyer.",
        ],
      },
      {
        heading: "Après une coupure de courant",
        paragraphs: [
          "La notice Cadel distingue deux cas. Une coupure de moins de 10 secondes : le poêle reprend où il en était. Plus longue, poêle allumé ou en phase d'allumage : au retour du courant, il fait un refroidissement complet, affiché « ON BLACK OUT », puis un nouvel allumage. Les autres marques ont leur propre comportement, décrit dans leur notice ; notre article [poêle à pellets et coupure de courant](/blog/poele-pellets-sans-electricite-coupure-courant) donne la consommation et les conseils des fabricants.",
        ],
      },
      {
        heading: "Ce qu'il ne faut jamais faire",
        list: [
          "Relancer en boucle : une alarme qui revient signale une cause qui persiste, et chaque allumage raté remplit le brasier.",
          "Allumer avec un allume-feu, du papier ou de l'alcool : la résistance d'allumage s'en charge.",
          "Ouvrir la porte ou le réservoir pendant le refroidissement.",
          "Démonter la vis sans fin, la carte électronique ou le ventilateur des fumées : c'est le travail d'un technicien, et la garantie du fabricant en dépend.",
        ],
      },
      {
        heading: "Quand appeler, et combien coûte un dépannage",
        paragraphs: [
          "Appelez quand la même alarme revient après un réarmement, quand une alarme de sonde ou de ventilateur s'affiche, ou à la moindre odeur de fumée dans la pièce. Notre [dépannage](/depannage-poele-a-pellets) intervient sur toutes les marques, à 110 € TVAC la première heure puis 60 € TVAC par heure, déplacement inclus, pièces en plus.",
          "Beaucoup d'alarmes viennent d'un poêle encrassé ou de pellets de mauvaise qualité. L'[entretien annuel](/entretien-poele-a-pellets), à 175 € TVAC ramonage compris, en évite une bonne part ; notre [guide de l'entretien](/guides/comment-entretenir-poele-pellets) donne les gestes du quotidien. Si votre poêle s'arrête sans afficher de code, lisez [pourquoi un poêle à pellets s'éteint tout seul](/blog/poele-pellets-eteint-tout-seul-causes).",
        ],
      },
      {
        heading: "Les autres marques que nous posons",
        paragraphs: [
          "MCZ, Edilkamin, EK63, Girolami et Austroflamm ont leur propre table de codes, propre à chaque gamme. Nous ne les reprenons ici qu'après lecture de la notice officielle de chaque fabricant : en attendant, la notice papier de votre poêle, ou son application, donne la signification du code. Donnez-nous le code au téléphone, nous vous dirons ce qu'il veut dire.",
        ],
      },
    ],
    faq: [
      {
        question: "Que veut dire A01 sur un poêle à pellets ?",
        answer:
          "Chez Cadel, A01 signale un défaut d'allumage : aucune flamme pendant la phase d'allumage. La notice demande de contrôler le brasier, le niveau de pellets et la fermeture de la porte et du couvercle ; un conduit bouché ou une résistance d'allumage usée peuvent aussi en être la cause. Sur une autre marque, le même code peut vouloir dire autre chose : lisez votre notice.",
      },
      {
        question: "Que veut dire A05 sur un poêle Cadel ?",
        answer:
          "L'intervention du pressostat des fumées : la pression dans le conduit sort des limites. La notice cite une cheminée obstruée, une porte ou un réservoir ouvert, des joints qui fuient, des conduits de fumées encrassés, un conduit trop long ou une météo défavorable.",
      },
      {
        question: "Comment réarmer un poêle à pellets en alarme ?",
        answer:
          "Chez Cadel, appui de quelques instants sur la touche 1 (ESC) ; chez MCZ, appui de quelques secondes sur le bouton marche-arrêt, d'après sa foire aux questions. Laissez d'abord le poêle refroidir et videz le brasier. Réarmez une fois : si l'alarme revient, appelez.",
      },
      {
        question: "Mon poêle à pellets se met en sécurité tout seul, que faire ?",
        answer:
          "Notez le code affiché, laissez refroidir, vérifiez le réservoir, le brasier, la porte et le couvercle, puis réarmez une fois. Si l'arrêt se répète, faites appel à un technicien : notre [dépannage](/depannage-poele-a-pellets) coûte 110 € TVAC la première heure.",
      },
      {
        question: "Le message SERVICE bloque-t-il le poêle ?",
        answer:
          "Non, chez Cadel c'est un avis de maintenance périodique, non bloquant : les heures de fonctionnement prévues avant l'entretien sont écoulées. Prenez rendez-vous pour l'[entretien annuel](/entretien-poele-a-pellets).",
      },
    ],
    sources: [
      { label: "Cadel, manuel de l'utilisateur « Poêle à granulés », réf. 89023068A (©2025), § 12, 12.9, 12.10 et 12.11, lu le 11/11/2026", href: "https://grp.cadelsrl.com/documents/89023068A.pdf" },
      { label: "MCZ, foire aux questions belge : réinitialiser une alarme, lue le 11/11/2026", href: "https://www.mcz.it/fr-be/service-support-poeles-cheminees/foire-aux-questions" },
      { label: "Tarifs de dépannage et d'entretien de Mister Pellets au 11/11/2026" },
    ],
    metaTitle: "Codes d'erreur d'un poêle à pellets : que faire ?",
    metaDescription:
      "Codes d'erreur d'un poêle à pellets : ce que dit l'alarme, les codes Cadel d'après la notice, comment réarmer, les gestes à éviter, quand appeler.",
  },
];

/** Mots du guide : chapô, intertitres, paragraphes, listes et FAQ. */
function wordCount(guide: Omit<GuideData, "readingTime">): number {
  const texts = [
    guide.excerpt,
    guide.directAnswer ?? "",
    ...guide.sections.flatMap((section) => [
      section.heading,
      ...(section.paragraphs ?? []),
      ...(section.list ?? []),
      ...(section.table ? [...section.table.headers, ...section.table.rows.flat()] : []),
    ]),
    ...(guide.faq ?? []).flatMap((q) => [q.question, q.answer]),
  ];
  return texts.join(" ").split(/\s+/).filter(Boolean).length;
}

export const GUIDES: GuideData[] = GUIDE_SOURCES.map((guide) => ({
  ...guide,
  readingTime: `${Math.max(1, Math.round(wordCount(guide) / 200))} min`,
}));

export function getGuideBySlug(slug: string): GuideData | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
