/**
 * 5 guides éditoriaux pour la phase 4.
 * Phase 7 : migrés vers la collection Payload `Guides` ou `Articles` pour
 * permettre l'édition et l'ajout de nouveaux guides par le client.
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
  {
    slug: "guide-achat-poele-pellets-wallonie",
    title: "Le guide d'achat 2026 du poêle à pellets en Wallonie",
    description: "Tout savoir avant d'acheter : technologies, marques, primes, pose, entretien. Le guide complet par les techniciens Mister Pellets.",
    category: "Choix",
    readingTime: "12 min",
    excerpt:
      "Acheter un poêle à pellets représente un investissement de 4 000 à 8 000 € pose comprise. Voici comment ne pas se tromper, marque par marque, étape par étape.",
    sections: [
      {
        heading: "1. Comprendre les 4 grandes familles",
        paragraphs: [
          "Le marché belge propose 4 grandes familles : air pulsé (le plus simple, l'air chaud sort par convection), canalisable (l'air est distribué dans plusieurs pièces via des gaines), hydro (chauffe un circuit d'eau, remplace une chaudière), et insert encastrable (s'intègre dans une cheminée existante).",
          "Notre conseil par défaut : un air pulsé étanche pour une pièce de vie de moins de 100 m² bien isolée. Un canalisable pour une maison à étage. Un hydro pour remplacer une chaudière mazout. Un insert si tu veux préserver une cheminée d'origine.",
        ],
      },
      {
        heading: "2. Dimensionner la puissance",
        paragraphs: [
          "La règle empirique : 1 kW pour 10 m² bien isolés (PEB B ou mieux). 1 kW pour 15 m² si la maison est très bien isolée (PEB A). 1 kW pour 7 m² si l'isolation est faible (PEB E à G).",
          "Donc pour une maison de 100 m² PEB B, vise 10 kW. Pour 150 m² PEB D, vise 18-20 kW (et là tu passes plutôt sur un hydro). Sous-dimensionner, c'est devoir tourner à plein régime tout le temps : usure prématurée et surconsommation.",
        ],
      },
      {
        heading: "3. Choisir la marque",
        paragraphs: [
          "Edilkamin (Italie, depuis 1963) est la référence italienne du chauffage biomasse, avec une gamme très large (air, canalisable, étanche, hydro, inserts) et le Wi-Fi de série sur la plupart des modèles récents. EK63 (Italie) est la marque sœur du groupe Edilkamin, lancée pour proposer du connecté à un prix plus accessible, gamme complète air/canalisable/étanche/hydro. Dielle (Italie) se distingue par un système breveté de combustion par alimentation par le bas du brasero (flamme plus naturelle, auto-nettoyage, gamme complète air/canalisable/hydro/inserts/hybride bois-pellets). Ferlux (Espagne, plus de 28 ans d'activité) couvre toute la gamme à un excellent rapport qualité-prix, avec des rendements annoncés jusqu'à 94 %.",
          "À Mister Pellets, on a sélectionné ces 4 marques après avoir testé une vingtaine de fabricants. Chacune a son créneau, on dirige selon le projet, pas selon la marge.",
        ],
      },
      {
        heading: "4. Conduit existant ou pas ?",
        paragraphs: [
          "Si tu as un conduit existant et conforme : la pose est plus simple et moins chère (4 000 à 5 500 € tout compris). Si le conduit est trop ancien (avant 1980, ou non chemisé), il faudra le tuber : prévoir 800 à 1 500 € de plus selon la hauteur.",
          "Si tu n'as pas de conduit, deux options : ventouse en façade (modèles étanches uniquement, le plus simple) ou conduit en toiture (plus cher, ~1 200 à 2 500 € selon la complexité). Dans tous les cas, le diagnostic à domicile précise le devis.",
        ],
      },
      {
        heading: "5. Calculer les primes",
        paragraphs: [
          "Wallonie 2026 (régime temporaire 14/02/2025 au 30/09/2026) : prime de base 160 € multipliée par un coefficient selon revenus de référence. R1 (≤ 24 600 €) : 960 €. R2 (24 601-39 300 €) : 640 €. R3 (39 301-58 900 €) : 320 €. R4 (> 58 900 €) : 160 €. R5 (> 122 800 €) non éligible. Audit logement préalable obligatoire. Détails et procédure sur la page primes.",
          "Vérifie aussi les primes communales (certaines communes namuroises et hennuyères en ont) et la déductibilité fiscale éventuelle. Mister Pellets monte le dossier complet pour toi.",
        ],
      },
    ],
    faq: [
      {
        question: "Combien coûte un poêle à pellets installé en 2026 ?",
        answer:
          "Compte 4 000 à 8 000 € tout compris pour une maison standard avec conduit existant. Hydro complet : 7 000 à 12 000 €. La Prime Habitation Wallonie 2026 ramène 160 à 960 € selon ta catégorie de revenus.",
      },
      {
        question: "Quelle marque est la plus fiable ?",
        answer:
          "Edilkamin pour la durabilité long terme (15-20 ans). EK63 pour la connectivité moderne. Dielle pour l'hydro. Ferlux pour la simplicité budget. Aucune n'est mauvaise, c'est le choix selon ton usage.",
      },
      {
        question: "Faut-il un audit énergétique ?",
        answer:
          "Non, pas pour un poêle seul. L'audit n'est obligatoire que pour les bouquets de travaux ou pour les primes plus élevées sur l'isolation.",
      },
    ],
    metaTitle: "Guide d'achat poêle à pellets en Wallonie 2026, Mister Pellets",
    metaDescription:
      "Le guide complet pour choisir ton poêle à pellets en Wallonie : technologies, marques, primes, pose, entretien. Conseils des techniciens Mister Pellets.",
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
          "Le canalisable est la solution naturelle pour les maisons à étage de 100-180 m². Modèles typiques : Edilkamin Mood Plus 11 kW, EK63 Tweed 90+ 9 kW, EK63 Spy 110+ 11 kW.",
          "Pour les très grandes maisons (180+ m²) ou pour vraiment chauffer toutes les pièces, on passe plutôt sur un hydro avec radiateurs ou plancher chauffant. Le canalisable a ses limites : 2-3 pièces secondaires max, à 5-8m de distance.",
        ],
      },
      {
        heading: "Pose et travaux",
        paragraphs: [
          "Les gaines isolées sont passées dans les murs, faux-plafonds ou combles. Sur une maison existante, c'est parfois plus invasif : on doit ouvrir un passage. Sur une maison récente avec gaines techniques prévues, c'est presque transparent.",
          "Un canalisable typique avec 2 gaines vers chambres : compter 1.5 jours de pose au lieu de 1 jour pour un air classique. Et 800 à 1 500 € de plus en main d'œuvre + matériel gaines.",
        ],
      },
    ],
    faq: [
      {
        question: "Le canalisable est-il bruyant ?",
        answer:
          "Légèrement plus que l'air classique (le ventilateur force davantage). Sur les modèles modernes (EK63, Edilkamin), c'est minimal, entre 35 et 45 dB en fonctionnement, soit moins qu'une conversation normale.",
      },
      {
        question: "Peut-on canaliser à l'étage ?",
        answer:
          "Oui, c'est la configuration la plus fréquente. La gaine monte verticalement dans une cloison ou dans un coffrage, puis se distribue à l'étage. Compte 5-8m max de longueur de gaine pour conserver une bonne température en sortie.",
      },
    ],
    metaTitle: "Poêle à pellets canalisable, Le guide complet",
    metaDescription:
      "Tout sur les poêles à pellets canalisables : fonctionnement, puissances, exemples wallons. Edilkamin Mood Plus, EK63 Tweed et Spy. Conseil Mister Pellets.",
  },
  {
    slug: "poele-pellets-hydro",
    title: "Poêle hydro : remplacer une chaudière mazout par des pellets",
    description: "Le hydro chauffe un circuit d'eau et peut remplacer une chaudière classique. Cas d'usage, marques, dimensionnement.",
    category: "Technique",
    readingTime: "10 min",
    excerpt:
      "Si tu as une chaudière mazout vieillissante et un système radiateur ou plancher chauffant, l'hydro pellets est la solution la plus rentable pour passer aux énergies renouvelables, souvent rentabilisé en 4-7 ans.",
    sections: [
      {
        heading: "Le principe",
        paragraphs: [
          "Un poêle hydro a un échangeur de chaleur interne qui chauffe l'eau d'un circuit. Cette eau alimente ensuite tes radiateurs, ton plancher chauffant, et éventuellement le ballon d'eau chaude sanitaire (ECS).",
          "Concrètement : tu débranches ta vieille chaudière mazout, tu poses le hydro dans une pièce de vie ou en cave, tu le raccordes au circuit existant via un kit hydraulique. Compter 1 à 2 jours de pose selon l'existant.",
        ],
      },
      {
        heading: "Marques et modèles",
        paragraphs: [
          "Dielle (Italie) propose une gamme hydro complète (série Bump Idro de 20 à 35 kW notamment) avec son système breveté de combustion par alimentation par le bas (flamme plus calme, auto-nettoyage du brasero, fonctionnement silencieux). Edilkamin (Italie, depuis 1963) propose aussi des modèles hydro (suffixe H, types Kira H, Vyda H) compatibles radiateurs, plancher chauffant et panneaux solaires thermiques. Ferlux (Espagne) couvre le segment hydro avec sa gamme Agua. À chaque marque sa logique technique, on oriente selon le projet.",
          "Edilkamin propose aussi des hydros (gamme Aqua Tiny, Acquatondo). Plus chères mais avec une finition premium et la fiabilité Edilkamin. EK63 ne fait pas d'hydro à l'heure actuelle.",
        ],
      },
      {
        heading: "Coûts et primes",
        paragraphs: [
          "Un hydro complet (poêle + kit hydraulique + raccordement + main d'œuvre) coûte 7 000 à 12 000 € selon la puissance et la complexité. La Prime Habitation Wallonie 2026 s'applique normalement (160 à 960 € selon catégorie de revenus, audit logement préalable obligatoire).",
          "Le retour sur investissement vs mazout : entre 4 et 7 ans selon la consommation actuelle et l'évolution des prix. Au-delà, c'est de l'économie nette tous les hivers.",
        ],
      },
    ],
    faq: [
      {
        question: "Faut-il garder une chaudière en backup ?",
        answer:
          "Pas obligatoire. Les hydros modernes sont fiables. Mais beaucoup gardent une vieille chaudière fioul ou gaz comme secours pour les très grands froids ou les pannes, utile mais pas indispensable. À discuter avec nous selon ton cas.",
      },
      {
        question: "Combien d'autonomie en pellets ?",
        answer:
          "Réservoir typique : 30-60 kg sur les hydros, soit 1.5 à 4 jours d'autonomie selon la puissance. Pour ne pas être contraint, beaucoup ajoutent un silo externe à pellets relié par aspiration : 500-2000 kg de stock, plusieurs semaines d'autonomie.",
      },
    ],
    metaTitle: "Poêle hydro pour remplacer chaudière mazout, Guide",
    metaDescription:
      "Le guide complet du poêle hydro pour remplacer une chaudière mazout : marques (Dielle, Edilkamin), dimensionnement, coûts, primes. Conseil Mister Pellets.",
  },
  {
    slug: "comment-entretenir-poele-pellets",
    title: "L'entretien d'un poêle à pellets : la check-list complète",
    description: "Que faire au quotidien, chaque semaine, chaque saison, et quand appeler un pro. Le guide pour faire durer ton poêle 15+ ans.",
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
          "L'entretien annuel par un installateur certifié est obligatoire en Belgique pour les poêles à pellets. C'est aussi requis pour valider la garantie constructeur.",
          "On démonte tout : foyer, échangeur, brûleur, ventilateur d'extraction, conduit. On nettoie en profondeur, on remplace les joints fatigués, on vérifie les capteurs et la combustion. Une visite annuelle coûte typiquement 150 à 250 € chez Mister Pellets selon le modèle.",
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
          "Causes courantes : réservoir vide, brûleur encrassé, capteur de tirage défaillant, fusible thermique qui a sauté à cause d'une surchauffe. Vérifier dans cet ordre. Si ça persiste, appelle-nous, c'est rarement grave mais ça nécessite un diagnostic.",
      },
    ],
    metaTitle: "Entretien d'un poêle à pellets, Check-list complète | Mister Pellets",
    metaDescription:
      "Comment entretenir ton poêle à pellets jour, semaine, saison, année. Check-list complète des techniciens Mister Pellets pour faire durer ton appareil.",
  },
  {
    slug: "quelle-puissance-poele-pellets",
    title: "Quelle puissance de poêle à pellets pour ma maison ?",
    description: "Calcul rapide selon la surface et le PEB. Tableau de correspondance pour une vingtaine de cas typiques wallons.",
    category: "Choix",
    readingTime: "6 min",
    excerpt:
      "Sous-dimensionner ton poêle, c'est devoir tourner à plein régime en permanence. Sur-dimensionner, c'est de l'argent gaspillé. Voici comment caler la puissance correctement.",
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
          "Maison 80 m² PEB C : 8-9 kW (Like 80, Pyl-7, Blade 9).",
          "Maison 100 m² PEB B : 9-10 kW (Blade 9, Tweed 90+).",
          "Maison 130 m² PEB D : 13-15 kW (Lena 11, Spy 110+, Pyl-10).",
          "Maison 160 m² PEB C : 14-16 kW (Mood Plus 11 canalisable, Iride 15 hydro).",
          "Maison 200 m² PEB D : 18-22 kW (passer sur hydro Iride 22).",
          "Maison 280 m² PEB D-E : 25-30 kW (hydro Iride 30, ou poêle + chaudière en complément).",
        ],
      },
      {
        heading: "Cas particuliers",
        paragraphs: [
          "Maison à étage avec escalier ouvert : la chaleur monte naturellement, donc un poêle puissant en bas peut chauffer le haut. Mais attention au tirage : si l'étage est juste réchauffé partiellement, c'est inconfortable. Préférer le canalisable.",
          "Pièce ouverte avec mezzanine ou grand volume : appliquer la règle de la hauteur sous plafond (+15-20%) et envisager une ventilation horizontale plus puissante.",
          "Plusieurs pièces fermées (chambres, bureau) : canalisable obligatoire. Un poêle classique ne chauffera que la pièce où il est installé, peu importe sa puissance.",
        ],
      },
    ],
    faq: [
      {
        question: "Que se passe-t-il si je sous-dimensionne ?",
        answer:
          "Le poêle tourne à plein régime tout le temps. Conséquences : usure accélérée du brûleur et de la vis sans fin, surconsommation de pellets, vitre qui noircit vite, et confort insuffisant lors des grands froids. Tu remplaces ton poêle au bout de 5-7 ans au lieu de 15-20.",
      },
      {
        question: "Et si je sur-dimensionne ?",
        answer:
          "Tu paies plus cher à l'achat (différence ~500-1500 €), et le poêle tourne presque toujours en mode mini. Pas idéal pour la combustion (rendement moindre, plus de cendres). Mais moins grave que le sous-dimensionnement.",
      },
    ],
    metaTitle: "Quelle puissance de poêle à pellets pour ma maison ?",
    metaDescription:
      "Calculer la puissance de poêle à pellets selon ta surface et ton PEB. Tableau de correspondance pour 20 cas typiques wallons. Conseil Mister Pellets.",
  },
];

export function getGuideBySlug(slug: string): GuideData | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
