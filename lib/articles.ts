/**
 * Articles éditoriaux du blog Mister Pellets, Phase 7.
 *
 * Stratégie GEO (Generative Engine Optimization) :
 * - Réponse directe en TL;DR (exploitable par les LLMs : ChatGPT, Perplexity, Claude, Gemini)
 * - Données chiffrées et sourcées (chiffres Wallonie 2026, normes EN, prix marché)
 * - Citations internes ("Selon les techniciens Mister Pellets, …")
 * - FAQ structurée → Schema FAQPage
 * - Sections H2 = questions naturelles ("Comment dimensionner…", "Pourquoi…")
 * - Maillage interne sémantique vers guides, marques, villes, produits
 * - Mention zone géographique (Wallonie / Belgique)
 *
 * Quand Payload Articles sera peuplé, ces données peuvent être migrées en CMS.
 * En attendant, on les expose en SSG pour garantir un build prévisible.
 */

export type ArticleCategory =
  | "guide-achat"
  | "installation"
  | "entretien"
  | "pellets"
  | "primes"
  | "marques"
  | "actualite";

export const CATEGORY_LABELS: Record<ArticleCategory, string> = {
  "guide-achat": "Guide d'achat",
  installation: "Installation",
  entretien: "Entretien",
  pellets: "Pellets & combustible",
  primes: "Primes & aides",
  marques: "Marques & modèles",
  actualite: "Actualité",
};

export interface ArticleSection {
  heading: string;          // H2
  paragraphs?: string[];
  list?: { ordered?: boolean; items: string[] };
  callout?: { variant: "info" | "warning" | "success"; text: string };
  table?: {
    headers: string[];
    rows: string[][];
    caption?: string;
  };
}

export interface ArticleData {
  slug: string;
  title: string;            // H1
  metaTitle: string;        // <title>
  metaDescription: string;  // <meta description>
  excerpt: string;          // résumé éditorial pour la card
  tldr: string;             // réponse directe LLM (3-4 phrases)
  category: ArticleCategory;
  tags: string[];
  readingTimeMinutes: number;
  publishedAt: string;      // ISO
  modifiedAt?: string;      // ISO
  authorName: string;
  authorRole: string;
  coverImageAlt: string;
  sections: ArticleSection[];
  faqs: { question: string; answer: string }[];
  related: {
    articles?: string[];    // slugs d'articles
    guides?: string[];      // slugs de guides (lib/guides.ts)
    cities?: string[];      // slugs de villes (lib/cities.ts)
    brands?: string[];      // slugs de marques (lib/brands.ts)
  };
}

// =====================================================================
// 5 ARTICLES PILIERS GEO, chacun ~1500-2000 mots, format réponse directe
// =====================================================================

export const ARTICLES: ArticleData[] = [
  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : comparatif des 3 marques top-tier (pilier maillage)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "edilkamin-ek63-girolami-quelle-marque-choisir",
    title: "Edilkamin, EK63, Girolami : quelle marque italienne choisir en 2026 ?",
    metaTitle: "Edilkamin, EK63 ou Girolami : quelle marque choisir ? (2026)",
    metaDescription:
      "Trois marques italiennes, trois usages. Edilkamin pour la durée, EK63 pour le connecté accessible, Girolami pour l'auto-nettoyage. Le comparatif Mister Pellets.",
    excerpt:
      "Les trois marques qu'on met en avant sont toutes italiennes, mais elles ne visent pas le même besoin. Voici comment trancher selon ta maison et ton budget.",
    tldr:
      "Edilkamin, EK63 et Girolami sont nos trois marques premium, toutes italiennes. Edilkamin, c'est la valeur sûre, celle qui tient 15 à 20 ans. EK63 vise le même sérieux en version connectée et étanche, mais autour de 15 à 25 % moins cher à puissance égale. Girolami fait autre chose : il brûle le pellet comme le bois, et son brasier se nettoie seul.",
    category: "marques",
    tags: ["Edilkamin", "EK63", "Girolami", "comparatif", "marques italiennes"],
    readingTimeMinutes: 8,
    publishedAt: "2026-05-15",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Comparatif des poêles à pellets Edilkamin, EK63 et Girolami distribués par Mister Pellets",
    sections: [
      {
        heading: "Trois marques italiennes, trois philosophies",
        paragraphs: [
          "On distribue cinq marques, mais on en met trois en avant : Edilkamin, EK63 et Girolami. Le point commun, c'est l'Italie. Toutes les trois conçoivent et fabriquent leurs poêles dans des ateliers italiens, avec le savoir-faire biomasse qui va avec.",
          "Le reste change. Edilkamin, c'est la référence historique, fondée à Milan en 1963. EK63 est sa marque sœur, lancée pour proposer du connecté moderne à un prix plus doux. Girolami est une marque familiale fondée près de Rome en 1970, avec un brevet maison d'alimentation par le bas qui change le quotidien d'entretien.",
          "Aucune n'est meilleure dans l'absolu. La bonne, c'est celle qui colle à ta maison et à ton budget.",
        ],
      },
      {
        heading: "Edilkamin : la valeur sûre qui dure 20 ans",
        paragraphs: [
          "Edilkamin a 60 ans, six sites de production et une fonderie interne. Tout est fabriqué en Italie, principalement à Lainate près de Milan. C'est la marque qu'on recommande quand le critère numéro un, c'est la longévité.",
          "Sa technologie Leonardo ajuste en permanence l'air et le débit de pellets grâce à des sondes. La combustion reste stable même quand tu changes de marque de sacs ou quand l'humidité varie. Sur le terrain, les Edilkamin qu'on a posés tiennent couramment 15 à 20 ans.",
          "Le revers, c'est le prix catalogue : Edilkamin est dans le haut de la fourchette. Mais ramené à la durée de vie réelle, le coût annuel reste bas, et le SAV pièces reste disponible longtemps après l'arrêt d'un modèle.",
        ],
      },
      {
        heading: "EK63 : le connecté accessible",
        paragraphs: [
          "EK63 est la marque sœur d'Edilkamin. Elle reprend la plateforme industrielle et le SAV du groupe, mais sous une marque pensée pour un prix d'attaque plus doux. À puissance équivalente, on est typiquement 15 à 25 % en dessous d'un Edilkamin.",
          "Deux atouts concrets. D'abord le Wi-Fi Smart, intégré de série sur la majorité des modèles, sans abonnement : tu programmes et tu allumes ton poêle depuis ton smartphone. Ensuite l'étanchéité : la plupart des EK63 prennent l'air comburant à l'extérieur, ce qui les rend compatibles avec les maisons à VMC double flux, BBC et passives.",
          "C'est le bon choix quand tu veux un poêle moderne et connecté sans viser le ticket premium.",
        ],
      },
      {
        heading: "Girolami : le polycombustible qui se nettoie tout seul",
        paragraphs: [
          "Girolami est une marque familiale italienne, fabriquée à Sant'Oreste près de Rome depuis 1970. Sa signature, c'est le brevet Source Feeding : le pellet est poussé par le bas du brasier au lieu de tomber dessus, et les cendres sont chassées dans un bac sous le foyer.",
          "Concrètement, le brasier reste propre seul. Tu ne grattes plus tous les jours, tu vides le cendrier une fois par semaine. Pour les utilisateurs qui en ont assez du nettoyage quotidien, ça change vraiment le quotidien.",
          "L'autre force de Girolami, c'est l'hybride bois-pellet sur la gamme Soft. Une sonde reconnaît le combustible chargé et bascule seule entre pellet et bûche. Tu allumes au pellet le matin, tu finis la soirée à la bûche, sans toucher au menu.",
        ],
      },
      {
        heading: "Le comparatif en un coup d'oeil",
        paragraphs: [
          "Voici les trois marques côte à côte sur les critères qui font la décision.",
        ],
        table: {
          headers: ["Critère", "Edilkamin", "EK63", "Girolami"],
          rows: [
            ["Positionnement", "Référence premium", "Connecté accessible", "Polycombustible breveté"],
            ["Techno phare", "Leonardo (autorégulation)", "Wi-Fi Smart de série", "Source Feeding (auto-nettoyage)"],
            ["Combustible", "Pellet", "Pellet", "Pellet, bois, hybride"],
            ["Hybride bois-pellet", "Non", "Non", "Oui"],
            ["Wi-Fi de série", "Selon modèle", "Oui sur la majorité", "Oui sur gamme moderne"],
            ["Étanchéité", "Sur gamme étanche", "Quasi toute la gamme", "Selon modèle"],
            ["Hydro (chauffage central)", "Oui", "Oui", "Oui"],
          ],
          caption: "Comparatif des trois marques premium distribuées par Mister Pellets en Wallonie.",
        },
      },
      {
        heading: "Comment choisir selon ton profil",
        paragraphs: [
          "En pratique, tout se joue sur ton besoin principal.",
        ],
        list: {
          items: [
            "Tu veux une marque qui a fait ses preuves et qui dure : Edilkamin, 60 ans d'historique et une durée de vie observée de 15 à 20 ans.",
            "Tu veux un poêle connecté sans payer le surcoût premium : EK63, Wi-Fi de série, étanche, 15 à 25 % moins cher qu'un Edilkamin équivalent.",
            "Tu veux pellet et bois dans la même machine, sans nettoyage quotidien : Girolami, brevet auto-nettoyant et bascule automatique des combustibles.",
          ],
        },
        callout: {
          variant: "info",
          text: "Le plus simple reste le diagnostic à domicile. On regarde ta maison, ta PEB, ton conduit et ton usage, et on te dit franchement quelle marque et quelle puissance sont les bonnes. C'est gratuit et sans engagement.",
        },
      },
    ],
    faqs: [
      {
        question: "Ces trois marques sont-elles vraiment toutes italiennes ?",
        answer:
          "Oui. Edilkamin est fabriquée près de Milan depuis 1963, Girolami près de Rome depuis 1970, et EK63 est la marque sœur d'Edilkamin, produite sur la plateforme industrielle du groupe.",
      },
      {
        question: "EK63 est-il moins bien qu'Edilkamin ?",
        answer:
          "Non, c'est différent. EK63 reprend l'industrie et le SAV d'Edilkamin, mais cible un prix plus accessible et le connecté de série. Edilkamin garde la gamme la plus large et des technologies comme Leonardo. EK63 n'est pas un sous-Edilkamin, c'est une marque pensée pour un autre budget.",
      },
      {
        question: "Girolami est-il bien suivi en Belgique ?",
        answer:
          "On distribue et on pose Girolami en Wallonie avec le même service que pour Edilkamin et EK63 : visite technique, devis sous 48 h, pose en une journée et SAV pièces assuré localement.",
      },
      {
        question: "Quelle marque pour une maison passive ou BBC ?",
        answer:
          "EK63 est le choix le plus naturel : la majorité de ses modèles sont étanches et prennent l'air comburant à l'extérieur, donc compatibles avec les VMC double flux. Edilkamin propose aussi une gamme étanche dédiée.",
      },
      {
        question: "Quelle marque pour remplacer une chaudière mazout ?",
        answer:
          "Vise un modèle hydro, qui se raccorde au circuit de chauffage central. Les trois marques en proposent : Edilkamin (Cherie H, Blade H), EK63 et Girolami (gamme Soft hydro, chaudière Biotec).",
      },
    ],
    related: {
      articles: ["dimensionner-poele-pellets-surface-wallonie"],
      brands: ["edilkamin", "ek63", "girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Leonardo (Edilkamin)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "technologie-leonardo-edilkamin-combustion",
    title: "Technologie Leonardo : comment Edilkamin auto-règle la combustion",
    metaTitle: "Technologie Leonardo Edilkamin : la combustion auto-réglée",
    metaDescription:
      "Leonardo, le système d'autorégulation d'Edilkamin : sondes lambda, correction continue de l'air et des pellets. Ce que ça change vraiment au quotidien.",
    excerpt:
      "Leonardo, c'est le système qui règle la combustion à ta place. On explique comment il marche et ce qu'il change concrètement chez toi.",
    tldr:
      "Leonardo est le système d'autorégulation de combustion d'Edilkamin. Des sondes lambda et des capteurs de pression mesurent en continu la combustion, et le poêle corrige seul le débit de pellets et d'air. Résultat : la flamme reste optimale même si tu changes de marque de pellets, même quand l'humidité ou la température varient. Tu n'as rien à régler dans le menu. Leonardo est intégré aux modèles Edilkamin qui en sont équipés, ce n'est pas une option payante.",
    category: "marques",
    tags: ["Edilkamin", "Leonardo", "combustion", "autorégulation"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-15",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Schéma de la technologie Leonardo d'autorégulation de combustion sur un poêle Edilkamin",
    sections: [
      {
        heading: "Leonardo, la combustion qui se règle toute seule",
        paragraphs: [
          "Leonardo est le système d'autorégulation d'Edilkamin. Plutôt que de te demander d'ajuster des paramètres dans un menu, le poêle ajuste lui-même la combustion, en continu, pendant qu'il tourne.",
          "C'est une des raisons pour lesquelles on recommande Edilkamin quand un client cherche un poêle qu'on installe et qu'on oublie. Tu allumes, et le poêle se débrouille pour garder une combustion propre.",
        ],
      },
      {
        heading: "Des sondes qui mesurent, un poêle qui corrige",
        paragraphs: [
          "Leonardo s'appuie sur des sondes lambda, qui mesurent l'oxygène présent dans les fumées, et sur des capteurs de pression. Le poêle lit en permanence comment la combustion se déroule.",
          "À partir de ces mesures, il corrige deux choses : le débit de pellets envoyé par la vis sans fin, et le débit d'air du ventilateur. La flamme reste dans sa zone idéale, sans intervention de ta part.",
        ],
      },
      {
        heading: "Ce que ça change concrètement",
        paragraphs: [
          "Concrètement, Leonardo travaille pour toi dans plusieurs situations courantes.",
        ],
        list: {
          items: [
            "Tu changes de marque de pellets : longueur, taux de cendres et densité varient d'un sac à l'autre, le poêle se recale seul.",
            "L'humidité de la pièce change au fil de la saison : la combustion reste stable.",
            "Il fait très froid dehors et le tirage du conduit se modifie : Leonardo compense.",
          ],
        },
        callout: {
          variant: "info",
          text: "Tu n'as rien à toucher dans le menu. C'est tout l'intérêt : la combustion reste optimale sans que tu deviennes technicien de ton propre poêle.",
        },
      },
      {
        heading: "Leonardo et la qualité des pellets",
        paragraphs: [
          "Tous les sacs de pellets ne se valent pas. Sur un poêle classique, un lot un peu différent peut décaler la combustion et encrasser plus vite. Avec Leonardo, le poêle absorbe une bonne partie de cet écart.",
          "Ça ne dispense pas d'acheter des pellets certifiés ENplus A1, c'est la base. Mais le système pardonne les variations normales d'un lot à l'autre.",
        ],
      },
      {
        heading: "Est-ce que ça vaut le surcoût Edilkamin ?",
        paragraphs: [
          "Leonardo n'est pas une option à cocher : il est intégré aux modèles Edilkamin qui en sont équipés. Le tarif Edilkamin est premium, et l'autorégulation fait partie de ce que tu paies.",
          "Concrètement, une combustion bien réglée en permanence, c'est moins d'imbrûlés, moins d'encrassement de l'échangeur, et un poêle qui vieillit mieux. C'est un des arguments durée de vie de la marque.",
        ],
      },
    ],
    faqs: [
      {
        question: "Leonardo, c'est une option payante ?",
        answer:
          "Non. Leonardo est intégré d'usine aux modèles Edilkamin qui en sont équipés. Il n'y a pas de module à acheter ni d'abonnement.",
      },
      {
        question: "Avec Leonardo, je n'ai plus besoin d'entretenir mon poêle ?",
        answer:
          "Si. Le ramonage et l'entretien annuel restent obligatoires et indispensables. Leonardo optimise la combustion, il ne remplace pas l'entretien mécanique.",
      },
      {
        question: "Leonardo fonctionne avec n'importe quels pellets ?",
        answer:
          "Il encaisse bien les variations entre lots, mais on conseille toujours des pellets certifiés ENplus A1. Un bon combustible reste la base d'une combustion saine.",
      },
      {
        question: "EK63 a-t-il aussi la technologie Leonardo ?",
        answer:
          "Non, Leonardo reste une technologie propre à Edilkamin. EK63, la marque sœur, mise plutôt sur le Wi-Fi Smart intégré de série.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Wi-Fi de série (EK63)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "ek63-wifi-serie-poele-pellets-connecte",
    title: "EK63 : pourquoi le Wi-Fi de série change la vie au quotidien",
    metaTitle: "EK63 Wi-Fi de série : poêle à pellets connecté sans abonnement",
    metaDescription:
      "Le Wi-Fi Smart est intégré de série sur la majorité des EK63, sans abonnement. Allumage à distance, programmation, suivi conso. Ce que ça change vraiment.",
    excerpt:
      "Sur EK63, le Wi-Fi n'est ni une option ni un abonnement. Voici ce que ça change concrètement quand tu pilotes ton poêle depuis ton smartphone.",
    tldr:
      "La majorité des poêles EK63 intègrent le Wi-Fi Smart d'usine, sans abonnement. Tu pilotes l'allumage, la programmation horaire, la puissance et le suivi de consommation depuis ton smartphone. Le mot important, c'est de série : pas de module à acheter, pas de gamme haute à viser. Combiné à l'étanchéité de la plupart des modèles EK63, c'est le profil idéal d'une maison wallonne récente.",
    category: "marques",
    tags: ["EK63", "Wi-Fi", "connecté", "smartphone"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-15",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Pilotage d'un poêle à pellets EK63 connecté en Wi-Fi depuis un smartphone",
    sections: [
      {
        heading: "Le Wi-Fi de série, et sans abonnement",
        paragraphs: [
          "Sur la majorité des modèles EK63, le module Wi-Fi Smart est intégré dès l'usine. Ce n'est pas un accessoire à acheter en plus, et il n'y a aucun abonnement mensuel pour l'utiliser.",
          "C'est un des vrais arguments de la marque. Chez beaucoup de fabricants, la connectivité est en option payante ou réservée aux gammes les plus chères. EK63 la met d'office.",
        ],
      },
      {
        heading: "Ce que tu pilotes depuis ton smartphone",
        paragraphs: [
          "L'application couvre l'essentiel des usages quotidiens.",
        ],
        list: {
          items: [
            "Allumer et éteindre le poêle à distance.",
            "Programmer des plages horaires, jour par jour, sur la semaine.",
            "Régler la puissance et passer en mode économique.",
            "Suivre la consommation de pellets.",
            "Recevoir les alertes : réservoir bas, entretien nécessaire.",
          ],
        },
      },
      {
        heading: "Pourquoi de série change le quotidien",
        paragraphs: [
          "Le dimanche soir, tu programmes ta semaine en deux minutes. Tu lances le poêle depuis le bureau pour rentrer dans un séjour déjà chaud. Et quand tu pars en week-end, un coup d'oeil sur l'app suffit pour vérifier que tout est bien coupé.",
          "Ces usages ne sont utiles que s'ils sont disponibles tout le temps, sans surcoût. C'est exactement ce que veut dire de série.",
        ],
        callout: {
          variant: "success",
          text: "Pas d'abonnement, c'est important sur la durée : le pilotage reste gratuit pendant toute la vie du poêle, pas seulement la première année.",
        },
      },
      {
        heading: "Wi-Fi et étanchéité : le vrai combo EK63",
        paragraphs: [
          "Le Wi-Fi n'est pas le seul atout d'EK63. La plupart des modèles sont étanches : ils prennent l'air comburant directement à l'extérieur et n'aspirent pas l'air chaud de ta pièce.",
          "Connecté plus étanche, c'est le profil idéal des maisons récentes wallonnes, à VMC double flux, BBC ou passives. Tu pilotes facilement, et le poêle respecte l'équilibre d'air de la maison.",
        ],
      },
      {
        heading: "Les modèles EK63 connectés",
        paragraphs: [
          "Le Wi-Fi équipe les best-sellers de la gamme : le Tweed 90+ canalisable étanche, le Spy 110+, le Daily 130++, et l'Entity 90+ ultra-fin de 31 cm de profondeur. Tous se pilotent depuis l'application.",
        ],
      },
    ],
    faqs: [
      {
        question: "Le Wi-Fi EK63 a-t-il un abonnement ?",
        answer:
          "Non. Le Wi-Fi Smart est intégré de série et son utilisation est gratuite, sans abonnement, pendant toute la vie du poêle.",
      },
      {
        question: "Que se passe-t-il si je n'ai pas de Wi-Fi chez moi ?",
        answer:
          "Le poêle fonctionne normalement en local, avec son écran et sa programmation intégrée. Le Wi-Fi est un confort en plus, pas une condition de fonctionnement.",
      },
      {
        question: "Le Wi-Fi remplace-t-il un thermostat ?",
        answer:
          "L'application gère la programmation horaire et la puissance. Selon le modèle, un thermostat d'ambiance peut aussi être ajouté. On en parle lors du devis selon ta configuration.",
      },
      {
        question: "Tous les EK63 sont-ils connectés ?",
        answer:
          "La grande majorité des modèles EK63 intègrent le Wi-Fi Smart. On confirme toujours le détail modèle par modèle au moment du devis.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["ek63"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Source Feeding (Girolami)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "source-feeding-girolami-brasier-auto-nettoyant",
    title: "Source Feeding Girolami : pourquoi le brasier reste propre tout seul",
    metaTitle: "Source Feeding Girolami : le brasier de poêle qui se nettoie seul",
    metaDescription:
      "Le brevet Source Feeding de Girolami pousse le pellet par le bas et chasse les cendres dans un bac. Fini le nettoyage quotidien du brasier. Explications.",
    excerpt:
      "Le brevet Source Feeding de Girolami change la corvée la plus détestée des poêles à pellets : le nettoyage quotidien du brasier.",
    tldr:
      "Source Feeding est le brevet d'alimentation par le bas de Girolami. Au lieu de tomber sur le brasier, le pellet est poussé sous le brasier, et les cendres sont chassées vers un bac de collecte sous le foyer. Concrètement, le brasier reste propre tout seul : tu ne grattes plus tous les jours, tu vides le cendrier environ une fois par semaine. L'entretien annuel, lui, reste nécessaire.",
    category: "marques",
    tags: ["Girolami", "Source Feeding", "entretien", "brasier"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-15",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Schéma du système Source Feeding de Girolami, alimentation du pellet par le bas du brasier",
    sections: [
      {
        heading: "Le vrai sujet : le nettoyage quotidien du brasier",
        paragraphs: [
          "Sur un poêle à pellets classique, le pellet tombe par le haut sur le brasier. La combustion laisse un dépôt de cendres et d'imbrûlés, et il faut gratter le brasier régulièrement, souvent tous les jours en pleine saison de chauffe.",
          "C'est la corvée que personne n'aime. Girolami a construit son brevet maison autour de ce problème précis.",
        ],
      },
      {
        heading: "Source Feeding : l'alimentation par le bas",
        paragraphs: [
          "Avec Source Feeding, le pellet n'est pas lâché sur le brasier : il est poussé par en dessous. Au fur et à mesure que le combustible neuf arrive, les cendres et les imbrûlés sont chassés vers un bac de collecte placé sous le foyer.",
          "Le brasier reste donc dégagé en permanence. C'est mécanique, intégré au fonctionnement du poêle : il n'y a aucun mode à activer.",
        ],
      },
      {
        heading: "Ce que ça change : du quotidien à l'hebdomadaire",
        paragraphs: [
          "Le résultat se mesure très simplement. Tu ne grattes plus le brasier chaque jour. Tu vides le bac à cendres environ une fois par semaine, selon ton utilisation.",
        ],
        callout: {
          variant: "success",
          text: "Pour les clients qui en ont assez du nettoyage quotidien d'un poêle classique, c'est l'argument qui fait basculer le choix vers Girolami.",
        },
      },
      {
        heading: "Source Feeding et tolérance aux pellets",
        paragraphs: [
          "Comme le brasier ne s'encrasse pas de la même manière, le système encaisse mieux les pellets de qualité variable. La combustion reste régulière même si un lot est un peu différent.",
          "On conseille quand même des pellets certifiés ENplus A1 : un bon combustible reste le meilleur allié de ton poêle, quel que soit le système d'alimentation.",
        ],
      },
      {
        heading: "Quels modèles Girolami profitent du Source Feeding",
        paragraphs: [
          "Le Source Feeding est la signature de Girolami, présente sur la gamme. La Soft, hybride bois-pellet hydro, est le best-seller, primée Good Design Award 2022. Les modèles Vert, Flow et Curvy l'embarquent aussi, chacun avec son style.",
          "Sur la gamme hybride, Source Feeding se combine au Fuel Convert System, qui bascule automatiquement entre pellet et bois selon le combustible chargé.",
        ],
      },
    ],
    faqs: [
      {
        question: "Le brasier ne se nettoie vraiment jamais à la main ?",
        answer:
          "Le brasier reste propre seul au quotidien grâce au Source Feeding. Tu vides le bac à cendres environ une fois par semaine, et l'entretien annuel complet par un professionnel reste nécessaire.",
      },
      {
        question: "Source Feeding consomme-t-il plus de pellets ?",
        answer:
          "Non. C'est un mode d'alimentation du brasier, pas une surconsommation. Le rendement des poêles Girolami reste élevé.",
      },
      {
        question: "Tous les Girolami ont-ils le Source Feeding ?",
        answer:
          "C'est la signature de la marque, présente sur sa gamme de poêles. On confirme le détail modèle par modèle au moment du devis.",
      },
      {
        question: "Et l'hybride bois-pellet, comment ça marche avec ?",
        answer:
          "Sur la gamme Soft, Source Feeding se combine au Fuel Convert System : une sonde reconnaît le combustible chargé et le poêle bascule seul entre pellet et bois, sans réglage manuel.",
      },
    ],
    related: {
      articles: ["edilkamin-ek63-girolami-quelle-marque-choisir"],
      brands: ["girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : hybride bois-pellet (Girolami)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "girolami-hybride-bois-pellet-fuel-convert",
    title: "Pellet ou bûche ? Avec un Girolami hybride, tu prends les deux",
    metaTitle: "Girolami hybride bois-pellet : le Fuel Convert System",
    metaDescription:
      "Le Girolami hybride bascule seul entre pellet et bûche grâce au Fuel Convert System. Plus de choix à faire entre les deux combustibles. Explications.",
    excerpt:
      "Choisir entre le pellet et la bûche, c'est un faux dilemme avec un Girolami hybride. Le poêle reconnaît le combustible et s'adapte tout seul.",
    tldr:
      "Les Girolami hybrides (gamme Soft et Vert) fonctionnent au pellet comme à la bûche. Le Fuel Convert System utilise une sonde qui reconnaît le combustible chargé et bascule automatiquement entre les modes, sans aucun réglage manuel. Tu allumes au pellet le matin pour la programmation, tu finis la soirée à la bûche pour l'ambiance. Le système accepte aussi des combustibles broyés naturels comme les coques ou les noyaux.",
    category: "marques",
    tags: ["Girolami", "hybride", "bois", "pellet", "Fuel Convert System"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-16",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Poêle Girolami hybride bois-pellet équipé du Fuel Convert System",
    sections: [
      {
        heading: "Le faux dilemme du pellet contre la bûche",
        paragraphs: [
          "Quand on choisit un poêle, on tranche en général entre deux mondes. Le pellet, c'est l'autonomie et la programmation : tu remplis le réservoir, tu programmes, le poêle gère. La bûche, c'est l'ambiance, le geste, et un combustible parfois moins cher si tu as une source de bois.",
          "Le Girolami hybride supprime ce choix. Tu n'as pas à décider une fois pour toutes : tu utilises l'un ou l'autre selon le moment, dans la même machine.",
        ],
      },
      {
        heading: "Le Fuel Convert System reconnaît le combustible",
        paragraphs: [
          "Le coeur de l'hybride Girolami, c'est le Fuel Convert System. Une sonde détecte ce que tu as chargé dans le poêle : du pellet, des bûches, ou des combustibles broyés.",
          "À partir de cette lecture, le poêle bascule seul vers le bon mode de combustion. Tu n'ouvres aucun menu, tu ne changes aucun paramètre. Le poêle s'adapte, point.",
        ],
      },
      {
        heading: "Une journée type avec un Girolami hybride",
        paragraphs: [
          "Le matin, le poêle s'allume tout seul en mode pellet, à l'heure que tu as programmée. La maison est déjà chaude quand tu te lèves.",
          "Le soir, tu as envie d'une vraie flambée. Tu charges des bûches, le poêle passe en mode bois, et tu profites de la flamme. Le lendemain, retour au pellet pour la programmation. Sans rien régler entre les deux.",
        ],
        callout: {
          variant: "info",
          text: "Un hybride peut aussi fonctionner uniquement au pellet si tu le souhaites. Le bois reste une possibilité, pas une obligation.",
        },
      },
      {
        heading: "Au-delà du bois : les combustibles broyés",
        paragraphs: [
          "Le Fuel Convert System ne se limite pas au pellet et à la bûche. Il accepte aussi des combustibles broyés naturels, comme des coques de fruits, des noyaux ou du marc.",
          "C'est un atout si tu as accès à ce type de ressource. Le poêle adapte sa combustion à ce que tu lui donnes, dans la limite des combustibles prévus par le constructeur.",
        ],
      },
      {
        heading: "Quels modèles Girolami sont hybrides",
        paragraphs: [
          "L'hybride se trouve principalement sur la gamme Soft, le best-seller de Girolami, primé Good Design Award 2022. La Soft existe en version hydro, pour alimenter un chauffage central.",
          "La gamme Vert propose aussi de l'hybride en version canalisable, pour diffuser la chaleur vers plusieurs pièces. On dimensionne le bon modèle ensemble lors du diagnostic à domicile.",
        ],
      },
    ],
    faqs: [
      {
        question: "Dois-je régler le poêle quand je change de combustible ?",
        answer:
          "Non. Le Fuel Convert System reconnaît seul le combustible chargé et bascule automatiquement entre les modes. Aucun réglage manuel n'est nécessaire.",
      },
      {
        question: "Peut-on mettre du pellet et du bois en même temps ?",
        answer:
          "On utilise l'un puis l'autre, pas les deux simultanément. Le poêle fonctionne avec le combustible que tu as chargé et bascule au chargement suivant.",
      },
      {
        question: "Un poêle hybride est-il plus cher qu'un poêle pellet simple ?",
        answer:
          "Un hybride embarque plus de technologie qu'un poêle pellet classique, ce qui se ressent au tarif. En contrepartie, tu n'es jamais bloqué sur un seul combustible. On chiffre le modèle adapté à ton besoin lors du devis.",
      },
      {
        question: "L'hybride fonctionne-t-il si je n'utilise que du pellet ?",
        answer:
          "Oui. Tu peux très bien n'utiliser que le pellet et garder le bois comme option pour les soirées où tu en as envie.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "source-feeding-girolami-brasier-auto-nettoyant",
      ],
      brands: ["girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : EK63 étanche maison passive / BBC
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "ek63-etanche-maison-passive-bbc",
    title: "Maison passive ou BBC : quel poêle EK63 étanche choisir",
    metaTitle: "Poêle EK63 étanche pour maison passive ou BBC : lequel choisir",
    metaDescription:
      "En maison passive ou BBC, le poêle doit être étanche. Quel modèle EK63 selon la surface : Like 80, Zone 80, Tweed 90+, Spy 110+, Daily 130++, Entity 90+.",
    excerpt:
      "En maison basse consommation, un poêle étanche n'est pas une option. Voici comment choisir le bon modèle EK63 selon ta maison.",
    tldr:
      "Dans une maison passive, BBC ou à VMC double flux, le poêle doit être étanche : il prélève l'air comburant directement à l'extérieur et n'aspire pas l'air chaud de la pièce. La majorité des modèles EK63 sont étanches. Pour les petites pièces, vise un Like 80 ou Zone 80 (environ 7,6 kW). Pour des volumes moyens à grands, le Tweed 90+, le Spy 110+ ou le Daily 130++. Pour un couloir, l'Entity 90+ ultra-fin.",
    category: "marques",
    tags: ["EK63", "étanche", "maison passive", "BBC", "VMC double flux"],
    readingTimeMinutes: 7,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle à pellets EK63 étanche installé dans une maison basse consommation",
    sections: [
      {
        heading: "Pourquoi un poêle étanche est obligatoire en maison BBC",
        paragraphs: [
          "Une maison passive ou BBC est conçue pour être très étanche à l'air, avec une ventilation mécanique contrôlée, souvent en double flux. L'air entre et sort par un circuit maîtrisé.",
          "Un poêle classique, lui, aspire l'air de la pièce pour sa combustion. Dans une maison étanche, ça déséquilibre la ventilation et ça peut créer une dépression. C'est pour ça qu'un poêle étanche est nécessaire : il ne touche pas à l'air intérieur.",
        ],
      },
      {
        heading: "Comment fonctionne un poêle étanche EK63",
        paragraphs: [
          "Un EK63 étanche prélève l'air comburant directement à l'extérieur, via une prise d'air dédiée. La combustion se fait en circuit fermé : l'air entre du dehors, les fumées repartent dehors.",
          "Conséquence concrète : le poêle ne consomme pas l'air chaud que tu as payé pour chauffer, et il ne perturbe pas la VMC. C'est ce qui le rend compatible avec les maisons à VMC double flux, BBC et passives.",
        ],
      },
      {
        heading: "Quel EK63 selon la taille de ta maison",
        paragraphs: [
          "La gamme EK63 couvre du petit appartement à la maison à étage. Voici les repères.",
        ],
        table: {
          headers: ["Modèle EK63", "Puissance", "Pour quel espace"],
          rows: [
            ["Like 80", "7,6 kW", "Appartements et petites pièces"],
            ["Zone 80", "7,6 kW", "Pièces compactes, jusqu'à 74 m²"],
            ["Tweed 90+", "9,2 kW", "Volume moyen, canalisable, best-seller"],
            ["Spy 110+", "10,5 kW", "Volume polyvalent, canalisable"],
            ["Daily 130++", "12,5 kW", "Grandes surfaces, environ 120 m²"],
            ["Entity 90+", "8,7 kW", "Couloirs et petits espaces, 31 cm de profondeur"],
          ],
          caption: "Repères indicatifs. La puissance exacte se valide au diagnostic selon la PEB et le volume réel.",
        },
      },
      {
        heading: "Le bonus : le Wi-Fi de série",
        paragraphs: [
          "En plus de l'étanchéité, la majorité des EK63 intègrent le Wi-Fi Smart de série, sans abonnement. Tu programmes et tu pilotes le poêle depuis ton smartphone.",
          "Dans une maison récente, bien isolée, où le poêle tourne souvent en douceur, cette programmation fine est un vrai confort au quotidien.",
        ],
      },
      {
        heading: "Ce qu'on vérifie à la visite technique",
        paragraphs: [
          "Avant de poser un EK63 étanche, on contrôle le tracé de la prise d'air et de l'évacuation des fumées, souvent en ventouse pour ce type de maison. On valide aussi l'emplacement et la compatibilité avec ta VMC.",
          "C'est l'étape qui garantit une installation propre et conforme. Le devis chiffré arrive sous 48 h après cette visite.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tous les poêles EK63 sont-ils étanches ?",
        answer:
          "La grande majorité des modèles EK63 sont étanches. On confirme toujours le détail modèle par modèle au moment du devis, selon la maison.",
      },
      {
        question: "Un poêle étanche peut-il être canalisable ?",
        answer:
          "Oui. Plusieurs EK63 sont à la fois étanches et canalisables, comme le Tweed 90+, le Spy 110+, le Daily 130++ et l'Entity 90+. Tu chauffes une pièce voisine tout en respectant l'étanchéité.",
      },
      {
        question: "Faut-il une sortie en toiture ou une ventouse ?",
        answer:
          "Les deux sont possibles selon ta maison. En maison BBC ou passive, la ventouse est fréquente. On valide le tracé à la visite technique.",
      },
      {
        question: "L'étanchéité change-t-elle l'entretien du poêle ?",
        answer:
          "Non. L'entretien annuel et le ramonage restent identiques et obligatoires, qu'un poêle soit étanche ou non.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "ek63-wifi-serie-poele-pellets-connecte",
      ],
      brands: ["ek63"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : remplacer une chaudière mazout (Edilkamin hydro)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "remplacer-chaudiere-mazout-edilkamin-hydro",
    title: "Remplacer une chaudière mazout par un poêle Edilkamin hydro",
    metaTitle: "Remplacer une chaudière mazout par un Edilkamin hydro",
    metaDescription:
      "Un poêle Edilkamin hydro se raccorde à tes radiateurs comme une chaudière. Principe, modèles, ballon tampon, eau chaude sanitaire et primes Wallonie 2026.",
    excerpt:
      "Un poêle hydro chauffe toute la maison via tes radiateurs existants. Voici comment il remplace une vieille chaudière mazout.",
    tldr:
      "Un poêle Edilkamin hydro se raccorde au circuit de chauffage central et alimente tes radiateurs ou ton plancher chauffant, exactement comme une chaudière. Couplé à un ballon tampon, il peut aussi produire l'eau chaude sanitaire. Les modèles comme la gamme Cherie H ou Blade H sont conçus pour ça. C'est une solution adaptée pour remplacer une chaudière mazout vieillissante, et la prime Habitation Wallonie 2026 réduit la facture.",
    category: "marques",
    tags: ["Edilkamin", "hydro", "chaudière mazout", "chauffage central"],
    readingTimeMinutes: 7,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle à pellets hydro Edilkamin raccordé au chauffage central en remplacement d'une chaudière mazout",
    sections: [
      {
        heading: "Pourquoi remplacer le mazout maintenant",
        paragraphs: [
          "Le mazout coûte cher et son prix reste volatil. Les vieilles chaudières au fioul perdent en rendement avec les années, et leur entretien devient un poste régulier.",
          "Beaucoup de maisons wallonnes en sont encore équipées. Passer au pellet, c'est un combustible local, un coût plus stable, et l'accès à la prime Habitation Wallonie 2026 pour le remplacement d'un système de chauffage.",
        ],
      },
      {
        heading: "Le principe du poêle hydro",
        paragraphs: [
          "Un poêle hydro n'est pas qu'un poêle qui chauffe une pièce. Il chauffe l'eau d'un circuit, et cette eau circule dans tes radiateurs ou ton plancher chauffant. Côté résultat, c'est le même rôle qu'une chaudière.",
          "La différence avec un poêle classique, c'est qu'une grande partie de la chaleur produite part dans le circuit d'eau plutôt que dans la pièce. Toute la maison est chauffée, pas seulement le séjour.",
        ],
      },
      {
        heading: "Les modèles Edilkamin hydro",
        paragraphs: [
          "Edilkamin a une gamme hydro dédiée, reconnaissable au suffixe H. Les modèles comme la Cherie H ou la Blade H se raccordent au chauffage central.",
          "La puissance se choisit selon la surface à chauffer et le nombre de radiateurs. C'est un point qu'on dimensionne précisément, parce qu'un hydro mal calibré chauffe mal ou s'encrasse.",
        ],
      },
      {
        heading: "Ballon tampon et eau chaude sanitaire",
        paragraphs: [
          "Pour bien fonctionner, un poêle hydro est souvent couplé à un ballon tampon. Ce ballon stocke la chaleur et lisse le fonctionnement du poêle, ce qui le fait durer plus longtemps.",
          "Avec un ballon adapté, l'installation peut aussi produire l'eau chaude sanitaire. Tu remplaces alors le chauffage et l'eau chaude de l'ancienne chaudière en une seule solution.",
        ],
        callout: {
          variant: "success",
          text: "Le remplacement d'un système de chauffage par un appareil biomasse est visé par la prime Habitation Wallonie 2026. On déduit la prime estimée directement du devis.",
        },
      },
      {
        heading: "Ce que comprend le remplacement",
        paragraphs: [
          "Un remplacement de chaudière mazout par un hydro, ce n'est pas juste poser un poêle. Il y a la dépose de l'ancienne chaudière, le raccordement au circuit existant, le ballon tampon, et le conduit d'évacuation.",
          "On chiffre tout ça lors du diagnostic à domicile. Le devis détaille chaque poste pour que tu saches exactement ce que tu paies, primes déduites.",
        ],
      },
    ],
    faqs: [
      {
        question: "Un poêle hydro peut-il remplacer complètement ma chaudière mazout ?",
        answer:
          "Oui, c'est son rôle : il alimente les radiateurs ou le plancher chauffant. Couplé à un ballon, il gère aussi l'eau chaude sanitaire. Le dimensionnement se valide au diagnostic.",
      },
      {
        question: "Faut-il garder mes radiateurs existants ?",
        answer:
          "Dans la majorité des cas oui, on se raccorde au circuit existant. On vérifie l'état et le dimensionnement des radiateurs lors de la visite technique.",
      },
      {
        question: "Un poêle hydro chauffe-t-il aussi la pièce où il est installé ?",
        answer:
          "Oui, une partie de la chaleur reste dans la pièce d'installation, le reste part dans le circuit d'eau. C'est un point qu'on prend en compte au dimensionnement.",
      },
      {
        question: "Le remplacement donne-t-il droit à une prime ?",
        answer:
          "Le remplacement d'un système de chauffage par un appareil biomasse est visé par la prime Habitation Wallonie 2026. On estime le montant et on le déduit du devis.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "technologie-leonardo-edilkamin-combustion",
      ],
      brands: ["edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : canalisable intelligent (Girolami)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "girolami-canalisable-intelligent-trois-ventilateurs",
    title: "Trois ventilateurs, trois pièces : le canalisable intelligent Girolami",
    metaTitle: "Girolami canalisable : trois ventilateurs indépendants par pièce",
    metaDescription:
      "Le canalisable Girolami pilote trois ventilateurs indépendants, un par pièce, chacun ajusté à sa température. Thermostats sans fil TriKey. Explications.",
    excerpt:
      "Un canalisable classique souffle pareil partout. Le Girolami, lui, ajuste chaque pièce indépendamment. Voici comment.",
    tldr:
      "Les Girolami canalisables (gamme Vert) embarquent trois ventilateurs indépendants. Chacun dessert une pièce et ajuste son débit selon la température réellement mesurée dans cette pièce. Avec les thermostats sans fil TriKey en option, chaque pièce atteint sa propre consigne. Fini la pièce proche du poêle qui surchauffe pendant que la chambre à l'étage reste fraîche.",
    category: "marques",
    tags: ["Girolami", "canalisable", "ventilateurs", "TriKey"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle Girolami canalisable diffusant la chaleur dans trois pièces via des ventilateurs indépendants",
    sections: [
      {
        heading: "Le problème du canalisable classique",
        paragraphs: [
          "Un poêle canalisable diffuse l'air chaud vers plusieurs pièces via des gaines. Sur beaucoup de modèles, un seul ventilateur pousse l'air, et le débit est le même partout.",
          "Résultat courant : la pièce où se trouve le poêle surchauffe, pendant que la chambre la plus éloignée reste trop fraîche. Tu te retrouves à ouvrir une fenêtre d'un côté et à mettre un pull de l'autre.",
        ],
      },
      {
        heading: "Trois ventilateurs indépendants",
        paragraphs: [
          "Sur les versions canalisables de Girolami, il y a trois ventilateurs distincts. Chacun dessert sa pièce et règle son propre débit.",
          "Le poêle ne pousse plus un air identique partout. Il envoie plus d'air là où il en faut, moins là où la pièce est déjà à température. Chaque pièce est traitée pour elle-même.",
        ],
      },
      {
        heading: "Les thermostats sans fil TriKey",
        paragraphs: [
          "Pour que le système soit vraiment intelligent, Girolami propose les thermostats sans fil TriKey en option. Tu en places un dans chaque pièce desservie.",
          "Chaque thermostat mesure la température réelle de sa pièce et communique avec le poêle. Le ventilateur correspondant ajuste son débit pour atteindre la consigne de cette pièce, pas une moyenne approximative.",
        ],
        callout: {
          variant: "info",
          text: "Concrètement, tu peux viser 21 °C dans le séjour et 19 °C dans une chambre, et le poêle gère les deux en même temps.",
        },
      },
      {
        heading: "Quelle maison pour un Girolami canalisable",
        paragraphs: [
          "Le canalisable intelligent prend tout son sens dans une maison ouverte où le poêle est dans le séjour, avec une ou deux pièces à chauffer en plus, par exemple une chambre à l'étage ou un bureau.",
          "La gamme Vert de Girolami couvre ce besoin, en hybride canalisable. On valide le tracé des gaines et la puissance utile lors du diagnostic.",
        ],
      },
      {
        heading: "La pose : ce qui se passe sur le terrain",
        paragraphs: [
          "Canaliser, ça veut dire faire passer des gaines isolées du poêle vers les pièces à chauffer, avec une grille de sortie dans chaque pièce. Le tracé doit être le plus court et le plus direct possible.",
          "On étudie ça à la visite technique : longueur des gaines, passages disponibles, position des grilles. C'est ce qui garantit que l'air arrive vraiment chaud au bout du parcours.",
        ],
      },
    ],
    faqs: [
      {
        question: "Combien de pièces peut chauffer un Girolami canalisable ?",
        answer:
          "Les versions canalisables pilotent trois ventilateurs, donc la pièce d'installation plus des pièces canalisées. Le nombre exact dépend du tracé des gaines, qu'on valide à la visite technique.",
      },
      {
        question: "Les thermostats TriKey sont-ils inclus ?",
        answer:
          "Les thermostats sans fil TriKey sont proposés en option. On en discute au devis selon le confort recherché pièce par pièce.",
      },
      {
        question: "Peut-on couper la canalisation vers une pièce ?",
        answer:
          "Oui. Comme les ventilateurs sont indépendants, tu peux moduler ou arrêter la diffusion vers une pièce qui n'a pas besoin d'être chauffée à un moment donné.",
      },
      {
        question: "Le canalisable Girolami est-il aussi hybride ?",
        answer:
          "La gamme Vert combine le canalisable et l'hybride bois-pellet. Tu profites des trois ventilateurs indépendants et du Fuel Convert System sur le même appareil.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "girolami-hybride-bois-pellet-fuel-convert",
      ],
      brands: ["girolami"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : durée de vie (Edilkamin)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "duree-de-vie-poele-edilkamin",
    title: "Combien de temps dure vraiment un poêle Edilkamin",
    metaTitle: "Durée de vie d'un poêle Edilkamin : 15 à 20 ans, et pourquoi",
    metaDescription:
      "Un poêle Edilkamin bien entretenu dure couramment 15 à 20 ans. Fabrication, pièces d'usure, entretien annuel et coût ramené à l'année. Le point honnête.",
    excerpt:
      "Un Edilkamin coûte cher à l'achat, mais combien d'années tient-il vraiment ? Ce qu'on observe sur le terrain, sans enjoliver.",
    tldr:
      "Un poêle Edilkamin entretenu correctement dure couramment 15 à 20 ans, ce qu'on observe sur le parc qu'on suit en Wallonie. La longévité tient à la fabrication italienne (fonderie interne, fonte épaisse) et surtout à l'entretien annuel : aucun poêle ne dure sans ramonage et révision. Les pièces d'usure restent disponibles longtemps grâce au réseau Edilkamin. Ramené à l'année, le tarif premium devient raisonnable.",
    category: "marques",
    tags: ["Edilkamin", "durée de vie", "entretien", "fiabilité"],
    readingTimeMinutes: 7,
    publishedAt: "2026-05-16",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt:
      "Poêle à pellets Edilkamin après plusieurs années d'utilisation, entretenu par Mister Pellets",
    sections: [
      {
        heading: "15 à 20 ans, ce qu'on observe sur le terrain",
        paragraphs: [
          "On installe et on suit des Edilkamin depuis le début de l'atelier. Sur ce parc, un poêle entretenu correctement tient couramment 15 à 20 ans.",
          "Ce n'est pas un argument marketing, c'est ce qu'on constate en SAV. Et la condition est toujours la même : l'entretien a été fait régulièrement. Un poêle négligé, quelle que soit la marque, ne tiendra pas cette durée.",
        ],
      },
      {
        heading: "Pourquoi un Edilkamin dure : la fabrication",
        paragraphs: [
          "Edilkamin fabrique en Italie, dans six sites de production, avec une fonderie interne. Les pièces de structure sont en fonte épaisse, conçues pour encaisser les cycles de chauffe pendant des années.",
          "Une fabrication maîtrisée, sans sous-traitance opaque, ça se voit dans le temps : moins de jeu mécanique, des assemblages qui tiennent, une structure qui ne fatigue pas prématurément.",
        ],
      },
      {
        heading: "Le rôle décisif de l'entretien annuel",
        paragraphs: [
          "La durée de vie d'un poêle se joue surtout sur l'entretien. Le ramonage du conduit et la révision annuelle de l'appareil ne sont pas optionnels, ils sont la condition de la longévité.",
          "Un entretien annuel, c'est le nettoyage de l'échangeur, le contrôle des joints, la vérification de la combustion et des organes mécaniques. C'est ce qui évite qu'une petite usure devienne une panne lourde.",
        ],
      },
      {
        heading: "Les pièces d'usure et leur disponibilité",
        paragraphs: [
          "Comme tout appareil, un poêle a des pièces d'usure. Voici les plus courantes et leur logique de remplacement.",
        ],
        table: {
          headers: ["Pièce", "Rôle", "Logique de remplacement"],
          rows: [
            ["Bougie d'allumage", "Allume les pellets", "Pièce d'usure, remplacée selon l'usage"],
            ["Joints de porte et de trappe", "Assurent l'étanchéité", "Contrôlés chaque année, remplacés si fatigués"],
            ["Ventilateurs", "Air de combustion et diffusion", "Longue durée, surveillés en entretien"],
            ["Motoréducteur de vis sans fin", "Achemine les pellets", "Longue durée, contrôlé en révision"],
          ],
          caption: "Edilkamin garde un stock de pièces disponible longtemps après l'arrêt d'un modèle, via son réseau de centres d'assistance.",
        },
      },
      {
        heading: "Le coût ramené à l'année",
        paragraphs: [
          "Edilkamin est dans le haut de la fourchette à l'achat. Mais le bon calcul, c'est le coût ramené à la durée de vie réelle.",
          "Un poêle premium qui dure 18 ans revient, à l'année, moins cher qu'un poêle d'entrée de gamme qu'il faut remplacer après 8 ans. Sans compter le confort d'un appareil qui ne te lâche pas en plein hiver.",
        ],
        callout: {
          variant: "info",
          text: "Selon les techniciens Mister Pellets, la première cause de fin de vie prématurée d'un poêle n'est pas la marque, c'est l'entretien sauté pendant plusieurs années.",
        },
      },
    ],
    faqs: [
      {
        question: "Un Edilkamin dure-t-il vraiment 20 ans ?",
        answer:
          "Sur le parc qu'on suit, 15 à 20 ans est courant pour un poêle entretenu chaque année. Sans entretien régulier, aucune marque ne tient cette durée.",
      },
      {
        question: "Que se passe-t-il si je saute un entretien annuel ?",
        answer:
          "Une année sautée se rattrape, mais sauter plusieurs entretiens use l'appareil bien plus vite et peut faire passer une simple révision à une réparation lourde. L'entretien annuel reste la base.",
      },
      {
        question: "Trouve-t-on encore des pièces pour un vieux modèle Edilkamin ?",
        answer:
          "Edilkamin maintient un stock de pièces longtemps après l'arrêt d'un modèle, via son réseau de centres d'assistance. En Belgique, les pièces courantes sont disponibles rapidement.",
      },
      {
        question: "L'achat d'un Edilkamin est-il rentable malgré le prix ?",
        answer:
          "Ramené à la durée de vie, oui. Un poêle qui dure deux fois plus longtemps qu'un modèle d'entrée de gamme revient moins cher à l'année, en plus du confort et de la fiabilité.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "technologie-leonardo-edilkamin-combustion",
      ],
      brands: ["edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // MARQUES 2026 : Entity 90+ ultra-fin (EK63)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "ek63-entity-90-poele-31-cm-couloir",
    title: "Entity 90+ d'EK63 : le poêle qui passe partout (31 cm de profondeur)",
    metaTitle: "EK63 Entity 90+ : le poêle à pellets de 31 cm de profondeur",
    metaDescription:
      "L'EK63 Entity 90+ ne fait que 31 cm de profondeur : il passe là où un poêle classique ne rentre pas. 8,7 kW, canalisable, étanche, Wi-Fi de série.",
    excerpt:
      "Un couloir, un hall, un mur étroit : l'Entity 90+ d'EK63 passe là où les autres poêles ne rentrent pas. Et il chauffe vraiment.",
    tldr:
      "L'EK63 Entity 90+ est un poêle à pellets canalisable et étanche de seulement 31 cm de profondeur, contre 50 à 60 cm pour un poêle classique. Il s'installe dans un couloir, un hall ou un petit espace où aucun poêle standard ne rentrerait. Malgré son format, il développe 8,7 kW et peut canaliser l'air chaud vers une pièce voisine. Le seul vrai prérequis est un emplacement avec un passage de fumée correct.",
    category: "marques",
    tags: ["EK63", "Entity 90+", "couloir", "poêle compact", "canalisable"],
    readingTimeMinutes: 6,
    publishedAt: "2026-05-16",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt:
      "Poêle à pellets EK63 Entity 90+ ultra-fin installé dans un couloir étroit",
    sections: [
      {
        heading: "31 cm de profondeur : ce que ça veut dire concrètement",
        paragraphs: [
          "Un poêle à pellets classique fait en général 50 à 60 cm de profondeur. C'est encombrant, et ça suffit à exclure pas mal d'emplacements.",
          "L'EK63 Entity 90+ ne fait que 31 cm de profondeur. Il se plaque contre un mur sans manger la pièce, et il ouvre des emplacements qui étaient impossibles avec un poêle standard.",
        ],
      },
      {
        heading: "Où l'Entity 90+ change la donne",
        paragraphs: [
          "Ce format ultra-fin a été pensé pour les espaces contraints. Quelques cas qu'on rencontre souvent en Wallonie.",
        ],
        list: {
          items: [
            "Un couloir étroit où un poêle classique bloquerait le passage.",
            "Un hall d'entrée qu'on veut chauffer sans encombrer.",
            "Un petit séjour où chaque centimètre compte.",
            "Un mur de refend peu profond où poser un poêle paraissait impossible.",
          ],
        },
      },
      {
        heading: "Compact ne veut pas dire faible : 8,7 kW canalisable",
        paragraphs: [
          "On pourrait croire qu'un poêle aussi fin ne chauffe pas grand-chose. C'est faux. L'Entity 90+ développe 8,7 kW, de quoi chauffer sérieusement.",
          "Mieux : il est canalisable. Il peut envoyer une partie de l'air chaud vers une pièce adjacente. Posé dans un couloir, il chauffe le couloir et une chambre voisine.",
        ],
      },
      {
        heading: "Étanche et connecté, comme la gamme EK63",
        paragraphs: [
          "L'Entity 90+ n'est pas un modèle au rabais. Il reprend les atouts de la gamme EK63 : il est étanche, donc compatible avec les maisons à VMC double flux et BBC, et il intègre le Wi-Fi Smart de série.",
          "Tu profites donc du format ultra-fin sans renoncer au pilotage smartphone ni à la compatibilité maison récente.",
        ],
      },
      {
        heading: "Le prérequis : un passage de fumée correct",
        paragraphs: [
          "Le seul vrai point à valider, c'est l'évacuation des fumées. Comme pour tout poêle, il faut un conduit ou une ventouse correctement dimensionné à l'emplacement choisi.",
          "On vérifie ça à la visite technique. Sur le terrain, on a posé l'Entity 90+ dans plusieurs couloirs et halls wallons : quand le passage de fumée est bon, ça fonctionne très bien.",
        ],
      },
    ],
    faqs: [
      {
        question: "Un poêle de 31 cm chauffe-t-il vraiment ?",
        answer:
          "Oui. L'Entity 90+ développe 8,7 kW malgré sa faible profondeur, et il est canalisable vers une pièce voisine. La performance est au rendez-vous.",
      },
      {
        question: "L'Entity 90+ peut-il s'installer dans un couloir ?",
        answer:
          "C'est exactement son terrain. Ses 31 cm de profondeur lui permettent de tenir dans un couloir sans bloquer le passage. Le point à valider est l'évacuation des fumées.",
      },
      {
        question: "L'Entity 90+ est-il étanche ?",
        answer:
          "Oui, il est étanche, comme la majorité de la gamme EK63. Il est donc compatible avec les maisons à VMC double flux, BBC et passives.",
      },
      {
        question: "Peut-on le piloter depuis le smartphone ?",
        answer:
          "Oui. L'Entity 90+ intègre le Wi-Fi Smart de série, sans abonnement, comme les autres modèles EK63.",
      },
    ],
    related: {
      articles: [
        "edilkamin-ek63-girolami-quelle-marque-choisir",
        "ek63-etanche-maison-passive-bbc",
      ],
      brands: ["ek63"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 1. DIMENSIONNEMENT (intent : "quelle puissance poêle pellets ?")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "dimensionner-poele-pellets-surface-wallonie",
    title: "Comment dimensionner son poêle à pellets selon la surface en Wallonie",
    metaTitle: "Quelle puissance de poêle à pellets selon la surface ? (2026)",
    metaDescription:
      "1 kW pour 10 m² PEB B, 1 kW pour 15 m² PEB A, 1 kW pour 7 m² PEB E. Méthode complète, exemples chiffrés, erreurs à éviter en Wallonie.",
    excerpt:
      "La règle simple, 1 kW pour 10 m², ne suffit pas. Voici le calcul exact selon ta PEB, ton plafond et ta zone climatique en Wallonie.",
    tldr:
      "Pour une maison wallonne PEB B de 100 m² avec hauteur sous plafond standard (2,50 m), un poêle de 8 à 10 kW suffit. Multiplie la surface par 0,10 si la PEB est bonne (A-B), par 0,12 si moyenne (C-D), et par 0,15 si faible (E-G). Ajoute 10 % par mètre au-dessus de 2,50 m de plafond. Sous-dimensionner brûle le matériel ; sur-dimensionner provoque encrassement et inconfort.",
    category: "guide-achat",
    tags: ["dimensionnement", "puissance", "PEB", "kW", "surface"],
    readingTimeMinutes: 9,
    publishedAt: "2026-04-15",
    modifiedAt: "2026-04-29",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens certifiés Wallonie",
    coverImageAlt: "Schéma de dimensionnement d'un poêle à pellets selon la surface et la PEB",
    sections: [
      {
        heading: "La méthode rapide : 3 multiplicateurs selon la PEB",
        paragraphs: [
          "Le calcul de base part de la surface chauffée et d'un coefficient lié à l'isolation thermique de la maison (PEB en Belgique). Plus la PEB est mauvaise, plus la maison perd des calories par les murs et la toiture, et plus le poêle doit avoir de réserve de puissance.",
          "Multiplie la surface en m² par le coefficient correspondant à ta PEB pour obtenir la puissance cible en kW. C'est volontairement simplifié : sur du résidentiel wallon classique, cette méthode donne un résultat à ±15 % de la charge thermique réelle.",
        ],
        table: {
          headers: ["PEB du logement", "Coefficient", "Exemple 100 m²", "Exemple 150 m²"],
          rows: [
            ["A, passif / quasi-passif", "0,07-0,08 kW/m²", "7-8 kW", "10-12 kW"],
            ["B, performant", "0,10 kW/m²", "10 kW", "15 kW"],
            ["C, D, standard", "0,12 kW/m²", "12 kW", "18 kW"],
            ["E, F, moyen", "0,13-0,14 kW/m²", "13-14 kW", "20-21 kW"],
            ["G, ancien non rénové", "0,15-0,18 kW/m²", "15-18 kW", "22-27 kW"],
          ],
          caption: "Coefficients indicatifs pour la Wallonie (climat tempéré, 2 500 DJU). Hauteur sous plafond 2,50 m.",
        },
      },
      {
        heading: "Pourquoi sur-dimensionner est aussi grave que sous-dimensionner",
        paragraphs: [
          "Beaucoup de clients arrivent avec l'idée qu'un poêle plus puissant chauffera mieux. C'est faux. Un poêle dimensionné trop large tourne en permanence en cycle bas, rejette plus d'imbrûlés, encrasse l'échangeur, et inconforte la pièce (chaud-froid, ronflement de ventilateur).",
          "À l'inverse, un poêle sous-dimensionné tourne à plein régime en continu pour suivre la demande. Résultat : la résistance d'allumage, le motoréducteur de vis sans fin et le ventilateur fument 20 à 30 % plus vite que prévu. Au bout de 4-5 ans, c'est une révision lourde au lieu d'un entretien annuel.",
        ],
        callout: {
          variant: "warning",
          text: "Selon les techniciens Mister Pellets, sur le terrain, environ 1 poêle sur 4 vu en SAV est mal dimensionné, le plus souvent surdimensionné parce que vendu sur surface brute sans tenir compte de la PEB.",
        },
      },
      {
        heading: "Hauteur sous plafond : la correction qu'on oublie tout le temps",
        paragraphs: [
          "Le calcul standard suppose 2,50 m sous plafond. Si tu as 3 m (rénovations dans des fermettes, lofts, vieux corps de logis namurois), tu dois ajouter 10 % de puissance par 25 cm supplémentaires. Un volume plus grand, c'est plus d'air à brasser et à maintenir en température.",
          "Cas classique : une maison de 90 m² PEB C avec mezzanine ouverte sous toit à 4,50 m. Sur le papier, 11 kW suffisent. En réalité, il faut 13-14 kW pour stabiliser la température sans bruit excessif. C'est typiquement le genre de cas où on conseille un canalisable plutôt qu'un air pulsé.",
        ],
      },
      {
        heading: "Air pulsé, canalisable ou hydro : à quelle puissance ça change quoi ?",
        paragraphs: [
          "Sous 12 kW, l'air pulsé classique chauffe une pièce de vie ouverte sans souci. Au-dessus, mieux vaut un canalisable qui répartit la chaleur dans 1 ou 2 pièces supplémentaires via des gaines isolées en plénum.",
          "À partir de 16-18 kW, on passe en hydro : le poêle chauffe un ballon tampon ou directement le circuit de radiateurs. C'est aussi le seuil typique pour remplacer une chaudière mazout sur une maison rénovée 4 façades en Wallonie.",
        ],
        list: {
          ordered: false,
          items: [
            "Pièce de vie unique 60-100 m² → air pulsé 6 à 10 kW",
            "Maison à étage 100-150 m² → canalisable 10 à 14 kW",
            "Maison 4 façades 150-220 m² avec radiateurs → hydro 18 à 24 kW",
            "Lofts hauts plafonds → ajouter 10 % par 25 cm au-delà de 2,50 m",
          ],
        },
      },
      {
        heading: "Exemple chiffré : maison à Namur, PEB D, 130 m²",
        paragraphs: [
          "Cas réel d'un client à Bouge (Namur) en 2026 : maison 4 façades 1985, PEB D, surface chauffée 130 m², plafond 2,55 m, conduit existant tubé.",
          "Calcul : 130 × 0,12 = 15,6 kW. Avec correction plafond négligeable, on cible 14-16 kW. Verdict atelier : un canalisable 14 kW (Edilkamin Cherie Up ou EK63 Tweed 140) avec gaines vers 2 chambres. Coût installé tout compris : 6 800 € avant primes, 5 050 € après prime R2.",
        ],
        callout: {
          variant: "info",
          text: "Avant tout devis, Mister Pellets fait un diagnostic gratuit à domicile dans les 50 km autour de Fernelmont. Mesure des volumes, vérification du conduit, contrôle de l'arrivée d'air comburant, sans engagement.",
        },
      },
    ],
    faqs: [
      {
        question: "Quelle puissance de poêle à pellets pour 100 m² ?",
        answer:
          "Pour 100 m² en Wallonie, vise 7-8 kW si la maison est très bien isolée (PEB A), 10 kW pour une PEB B, 12 kW pour une PEB C-D, et 13-15 kW pour une PEB E-F. Ajoute 10 % par 25 cm de plafond au-dessus de 2,50 m.",
      },
      {
        question: "Peut-on chauffer toute une maison avec un seul poêle à pellets ?",
        answer:
          "Oui, à condition de choisir un canalisable (gaines vers 2-3 pièces) ou un hydro (raccordé aux radiateurs). En air pulsé classique, la chaleur reste dans la pièce d'installation et au mieux dans les pièces communicantes ouvertes.",
      },
      {
        question: "Vaut-il mieux surdimensionner pour avoir une marge ?",
        answer:
          "Non. Un poêle surdimensionné tourne en permanence à bas régime, encrasse l'échangeur 30 % plus vite, rejette plus d'imbrûlés et inconforte la pièce. Mieux vaut viser juste avec une marge de 10-15 % maximum.",
      },
      {
        question: "Faut-il refaire le calcul si je rénove après l'installation ?",
        answer:
          "Si la PEB s'améliore significativement (passage de F à C par exemple), oui, le poêle deviendra trop puissant. Une révision technique permet d'adapter la programmation et le débit de pellets, mais au-delà d'une marge de 25 %, il faut envisager le remplacement.",
      },
    ],
    related: {
      articles: ["pellets-enplus-a1-vs-dinplus", "remplacer-chaudiere-mazout-poele-hydro"],
      guides: ["quelle-puissance-poele-pellets", "guide-achat-poele-pellets-wallonie"],
      cities: ["namur", "charleroi", "liege"],
      brands: ["edilkamin", "ek63"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 2. PELLETS ENPlus A1 vs DINplus (intent : "quels pellets choisir")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "pellets-enplus-a1-vs-dinplus",
    title: "Pellets ENplus A1 vs DINplus : que choisir en Belgique en 2026 ?",
    metaTitle: "Pellets ENplus A1 ou DINplus ? Comparatif 2026 (Belgique)",
    metaDescription:
      "ENplus A1 = 4,8 kWh/kg, ≤ 0,7 % cendres, traçabilité totale. DINplus reste équivalent. Voici comment choisir et où acheter en Wallonie.",
    excerpt:
      "ENplus A1 et DINplus sont les deux certifications sérieuses. Voici la différence concrète, le bon prix au sac, et les marques qu'on recommande pour la Belgique.",
    tldr:
      "ENplus A1 et DINplus garantissent toutes deux ≥ 4,6 kWh/kg, ≤ 0,7 % de cendres et un taux d'humidité < 10 %. ENplus est aujourd'hui le standard dominant en Belgique avec une traçabilité du sac jusqu'à la scierie. Refuse tout sac sans certification visible : un pellet douteux peut faire 3,5 kWh/kg avec 2 % de cendres et casse l'échangeur en 2 saisons.",
    category: "pellets",
    tags: ["pellets", "ENplus", "DINplus", "qualité", "combustible"],
    readingTimeMinutes: 8,
    publishedAt: "2026-03-22",
    modifiedAt: "2026-04-29",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers combustible",
    coverImageAlt: "Sac de pellets certifiés ENplus A1 à côté d'un sac DINplus",
    sections: [
      {
        heading: "Les deux certifications qui comptent vraiment",
        paragraphs: [
          "Sur le marché belge, deux normes garantissent la qualité d'un sac de pellets : ENplus (norme européenne EN ISO 17225-2, gérée par le bioenergyEurope) et DINplus (norme allemande historique, gérée par DIN CERTCO). Toutes deux contrôlent diamètre, longueur, densité, taux de cendres, humidité et pouvoir calorifique.",
          "Concrètement, un pellet ENplus A1 ou DINplus livre ≥ 4,6 kWh/kg (souvent 4,8), avec ≤ 0,7 % de cendres et < 10 % d'humidité. La classe ENplus A2 existe (≤ 1,2 % cendres) mais elle est plutôt destinée aux chaudières industrielles, pas aux poêles domestiques.",
        ],
        table: {
          headers: ["Critère", "ENplus A1", "DINplus", "Pellet non certifié"],
          rows: [
            ["PCI minimum", "≥ 4,6 kWh/kg", "≥ 4,9 kWh/kg", "3,5-4,2 kWh/kg"],
            ["Cendres", "≤ 0,7 %", "≤ 0,5 %", "1,5-3 %"],
            ["Humidité", "≤ 10 %", "≤ 10 %", "12-18 %"],
            ["Diamètre", "6 mm ± 0,5", "6 mm ± 0,5", "Variable"],
            ["Traçabilité", "Oui (n° lot)", "Oui (n° lot)", "Aucune"],
          ],
          caption: "Comparatif des seuils de certification pour pellets domestiques.",
        },
      },
      {
        heading: "Pourquoi un pellet bas de gamme te coûte plus cher",
        paragraphs: [
          "Un sac à 4,50 € contre un ENplus A1 à 6,50 €, ça paraît avantageux. En réalité, le bas de gamme tape souvent à 3,8 kWh/kg réels au lieu de 4,8 : tu brûles 26 % de pellets en plus pour la même chaleur. À 800 kg/an de consommation moyenne, l'économie disparaît.",
          "Pire, le taux de cendres élevé (2 %) sature le creuset 3 fois plus vite, encrasse l'échangeur de chaleur et finit par bloquer la sonde de fumée. Sur le terrain, on a vu des poêles 3 ans tomber en panne pour cause de pellets bon marché, la garantie ne couvre pas ce type de sinistre.",
        ],
        callout: {
          variant: "warning",
          text: "Si le sac n'affiche ni logo ENplus A1 (avec ID type BE001), ni logo DINplus (avec n° de lot), ne l'achète pas. Tous les distributeurs sérieux en Belgique sont certifiés.",
        },
      },
      {
        heading: "Combien coûte un sac en 2026 et comment stocker",
        paragraphs: [
          "Prix indicatifs Wallonie au 29 avril 2026 : 6,20 à 7,00 € le sac de 15 kg en grande surface bricolage, 5,50 à 6,30 € en achat groupé palette (66 sacs = 990 kg). En vrac livré (pour ceux qui ont un silo), compte 360 à 410 € la tonne TTC.",
          "Stockage : sec, ventilé, à l'abri du gel intense (< -10 °C les fragilise). Pour 800 kg/an, prévoir 4 m² de palette dans un garage ou un abri. Évite les sous-sols humides : le pellet absorbe vite l'humidité et perd en pouvoir calorifique dès 12 %.",
        ],
        list: {
          ordered: true,
          items: [
            "Achète en hiver pour de la combustion immédiate, en été pour profiter de stocks bas saison (-10 à -15 %).",
            "Vérifie la date d'ensachage : un pellet de plus de 18 mois a souvent perdu en cohésion.",
            "Préfère les marques avec scieries traçables en Belgique, France ou Autriche, pas les pellets d'origine inconnue.",
          ],
        },
      },
      {
        heading: "Les marques qu'on recommande à nos clients en Wallonie",
        paragraphs: [
          "Sans contrat exclusif ni rétro-commission : Badger Pellets, Crown, Stelia, Brites et Energiebois sortent leurs lots avec une régularité de pouvoir calorifique qu'on a mesurée saison après saison. Mister Pellets ne vend pas de pellets, ce conseil est purement technique.",
          "Concrètement : on a fait tourner sur banc les principaux pellets disponibles à Fernelmont, Namur, Charleroi et Liège. Sur 12 marques testées en 2025-2026, 9 tenaient la promesse de la fiche, 3 décrochaient sur les cendres ou l'humidité au sortir de palette stockée.",
        ],
      },
      {
        heading: "La règle simple à retenir",
        paragraphs: [
          "Logo ENplus A1 ou DINplus visible, n° de lot lisible, prix entre 5,50 et 7 € le sac de 15 kg, achat chez un revendeur établi : tu es à l'abri d'une mauvaise surprise. Tout le reste, c'est de la roulette russe avec ton matériel.",
        ],
      },
    ],
    faqs: [
      {
        question: "Faut-il choisir ENplus A1 plutôt que DINplus ?",
        answer:
          "Les deux certifications sont équivalentes pour un usage domestique en Belgique. ENplus est plus répandue (et plus faciles à trouver dans les enseignes wallonnes), DINplus impose un seuil de cendres légèrement plus strict. Choisis selon disponibilité et prix.",
      },
      {
        question: "Combien de pellets faut-il par an pour chauffer une maison wallonne ?",
        answer:
          "Pour une maison PEB B-C de 120 m² avec un poêle 10 kW en chauffage principal, compte 1,5 à 2 tonnes par saison de chauffe (octobre à avril). En appoint sur 3 mois d'hiver, plutôt 600 à 900 kg.",
      },
      {
        question: "Peut-on stocker des pellets dans un garage non chauffé ?",
        answer:
          "Oui, à condition que le garage soit sec et ventilé. Évite le contact direct avec un sol béton humide en posant les sacs sur palette bois. Le pellet supporte le froid jusqu'à -10 °C sans dégradation.",
      },
      {
        question: "Que faire d'un sac de pellets éventré qui a pris l'humidité ?",
        answer:
          "S'il est légèrement gondolé sans odeur de moisi, étale-le 48 h dans un endroit sec, il peut récupérer. S'il sent l'humide ou se transforme en bouillie au toucher, jette-le : il bloquerait la vis sans fin.",
      },
    ],
    related: {
      articles: ["entretien-poele-pellets-saison", "poele-pellets-eteint-tout-seul-causes"],
      guides: ["comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "tournai"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 3. PRIMES WALLONIE 2026, RECTIFICATION FACTUELLE COMPLÈTE
  //    Régime temporaire 14/02/2025 → 30/09/2026 (numéro démarche 3920)
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "primes-wallonie-2026-poele-pellets-combien-recuperer",
    title: "Prime poêle à pellets en Wallonie 2026 : combien pouvez-vous vraiment récupérer ?",
    metaTitle: "Prime poêle à pellets Wallonie 2026 (160 à 960 €), montants et conditions",
    metaDescription:
      "Régime Prime Habitation 14/02/2025 au 30/09/2026 : 160 € de base × coefficient selon revenus. R1 = 960 €, R2 = 640 €, R3 = 320 €, R4 = 160 €. Conditions, audit, procédure SPW.",
    excerpt:
      "Quatre catégories de revenus, quatre montants. Audit logement obligatoire et liste officielle de poêles éligibles. Voici exactement combien tu touches et comment ne pas se planter sur le dossier.",
    tldr:
      "Depuis le 14 février 2025, la Région wallonne applique un régime temporaire jusqu'au 30 septembre 2026. La prime poêle à pellets vaut 160 € de base, multipliée par 6 pour la catégorie R1 (revenus de référence ≤ 24 600 €) soit 960 €, par 4 pour R2 (640 €), par 2 pour R3 (320 €), par 1 pour R4 (160 €). Les ménages R5 (au-delà de 122 800 €) ne sont plus éligibles. Plafond complémentaire : 70 % de la facture pour R1-R2, 50 % pour R3-R4. Conditions cumulatives : audit logement préalable obligatoire, logement de plus de 15 ans, poêle dans la liste officielle SPW, pose par un entrepreneur inscrit à la BCE.",
    category: "primes",
    tags: ["primes", "Wallonie", "2026", "Prime Habitation", "SPW Logement"],
    readingTimeMinutes: 11,
    publishedAt: "2026-02-10",
    modifiedAt: "2026-05-02",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers primes énergie",
    coverImageAlt: "Tableau récapitulatif de la Prime Habitation Wallonie 2026 pour poêle à pellets",
    sections: [
      {
        heading: "Les 4 montants exacts 2026 selon tes revenus de référence",
        paragraphs: [
          "Depuis le 14 février 2025, la Région wallonne a remplacé les anciennes \"primes Chauffage et Eau Chaude\" par la Prime Habitation, dans un régime temporaire valable jusqu'au 30 septembre 2026. La méthode est la même pour la plupart des travaux subventionnés : un montant de base, multiplié par un coefficient lié à ta catégorie de revenus.",
          "Pour un poêle à pellets, la base est de 160 €. Le coefficient va de 1 (R4) à 6 (R1). Au-delà de 122 800 € de revenus de référence (catégorie R5), tu n'es tout simplement plus éligible aux primes Habitation depuis le 14 février 2025.",
        ],
        table: {
          headers: ["Catégorie", "Revenus de référence", "Coefficient", "Prime poêle à pellets"],
          rows: [
            ["R1", "≤ 24 600 €", "× 6", "960 €"],
            ["R2", "24 601 à 39 300 €", "× 4", "640 €"],
            ["R3", "39 301 à 58 900 €", "× 2", "320 €"],
            ["R4", "> 58 900 €", "× 1", "160 €"],
            ["R5", "> 122 800 €", "non éligible", "0 €"],
          ],
          caption: "Montants Prime Habitation Wallonie 2026, régime temporaire 14/02/2025 au 30/09/2026 (numéro démarche 3920).",
        },
      },
      {
        heading: "Le plafond en pourcentage qu'il faut bien comprendre",
        paragraphs: [
          "La prime calculée ne peut jamais dépasser un certain pourcentage du coût total TVAC de l'opération. Pour les catégories R1 et R2, ce plafond est de 70 %. Pour R3 et R4, c'est 50 %. Le montant réellement versé est le plus bas entre la prime théorique et ce plafond.",
          "Concrètement, si tu es en R1 (théorie 960 €) et que ta facture totale TVAC est de 1 200 €, le plafond 70 % vaut 840 € : tu reçois 840 € au lieu de 960 €. Sur une facture de 4 200 € TVAC, le plafond 70 % vaut 2 940 € : tu reçois bien tes 960 €.",
        ],
        callout: {
          variant: "success",
          text: "Sur la quasi-totalité des poses pellets en maison (4 000 € à 8 000 € TVAC), le plafond 70 % ou 50 % ne mord pas et tu reçois le montant nominal de ta catégorie.",
        },
      },
      {
        heading: "L'audit logement préalable obligatoire (le truc qui surprend tout le monde)",
        paragraphs: [
          "Depuis le 14 février 2025, un audit logement préalable est obligatoire pour la quasi-totalité des primes Habitation, y compris pour un poêle à pellets isolé. Tu ne peux plus décider lundi de poser un poêle et déposer la prime vendredi : il faut un audit enregistré avant le démarrage des travaux.",
          "Le coût de l'audit est de 800 à 1 200 € TVAC selon la taille du logement et la complexité. Une prime audit séparée couvre une partie de ce coût (montant variable selon catégorie de revenus). L'audit est réalisé par un auditeur agréé en Région wallonne et reste valide 5 ans, donc un audit fait pour d'autres travaux récents reste utilisable.",
        ],
        callout: {
          variant: "warning",
          text: "Pas d'audit avant travaux = pas de prime. C'est le piège n°1 sur lequel les ménages tombent depuis le 14 février 2025. Mister Pellets ne signe pas un devis pellets seul sans avoir vérifié que tu as ton audit en cours ou planifié.",
        },
      },
      {
        heading: "Les conditions techniques à respecter strictement",
        paragraphs: [
          "En plus de l'audit, trois conditions cumulatives doivent être réunies sur le projet pellets lui-même. Sans cela, la prime est refusée à l'instruction du dossier.",
        ],
        list: {
          ordered: true,
          items: [
            "Logement situé en Région wallonne (hors Communauté germanophone), construit depuis plus de 15 ans, à usage principal d'habitation.",
            "Poêle figurant dans la liste officielle des appareils éligibles publiée par le SPW Logement (mise à jour régulièrement). Tous les modèles que distribue Mister Pellets y figurent, mais on vérifie le numéro de modèle exact avant chaque devis.",
            "Pose réalisée par un entrepreneur inscrit à la Banque-Carrefour des Entreprises (BCE) avec accès à la profession requis. Awlest SRL (la société qui porte Mister Pellets) est inscrite à la BCE sous le numéro BE 0656.514.212.",
          ],
        },
      },
      {
        heading: "Le dossier : pièces à réunir et délais à tenir",
        paragraphs: [
          "Le dossier se dépose sur Mon Espace Wallonie (mon.wallonie.be) avec connexion eID ou itsme. Alternative : envoi postal à la Direction des Aides aux Particuliers, Rue des Brigades d'Irlande 1, 5100 Jambes. Tu as 8 mois après la dernière facture pour déposer un dossier complet, ensuite c'est forclos.",
        ],
        list: {
          ordered: true,
          items: [
            "Rapport d'audit logement enregistré avant travaux (PDF officiel)",
            "Devis détaillé daté et signé avant le démarrage des travaux",
            "Facture finale acquittée TVAC, avec mention du modèle exact",
            "Annexe 6 \"Chauffage et Eau Chaude Sanitaire\" complétée par l'installateur",
            "Attestation de conformité de l'installation",
            "Justificatifs des revenus de référence (avertissement-extrait de rôle)",
            "Récépissé de l'inscription BCE de l'entrepreneur (le cas échéant)",
          ],
        },
      },
      {
        heading: "Le délai de traitement : sois patient",
        paragraphs: [
          "Honnêtement, c'est le point le plus difficile à expliquer aux clients. Le délai actuel d'instruction par le SPW Logement est de 1 à 2 ans à compter du dépôt du dossier complet. Le gouvernement wallon s'est engagé à raccourcir ce délai, mais on reste prudent dans nos annonces.",
          "Pendant ces 12 à 24 mois, tu as déjà avancé la facture totale chez Mister Pellets. La prime arrive ensuite directement sur ton compte. Si tu as besoin d'étaler la dépense, le prêt à taux 0 % Renopack ou Rénoprêt (via la Société wallonne du Crédit social ou le Fonds du Logement) peut financer jusqu'à 60 000 € de travaux.",
        ],
      },
      {
        heading: "Les cumuls qu'il faut connaître",
        paragraphs: [
          "Quatre éléments se cumulent avec la prime poêle à pellets sans la réduire. La TVA à 6 % au lieu de 21 % s'applique d'office si ton logement a plus de 10 ans : c'est appliqué directement sur ta facture par l'installateur, pas une prime à demander. Les primes isolation et châssis se cumulent sous un plafond global de 50 000 € par logement individuel, toutes primes confondues sur la durée. Le prêt 0 % Renopack se cumule librement. Et certaines communes wallonnes ajoutent leur propre prime communale (montants variables, à vérifier au cas par cas).",
        ],
        callout: {
          variant: "info",
          text: "Mister Pellets prépare le pack dossier complet pour ses clients : récapitulatif technique, attestation de conformité, annexe 6, facture détaillée. Tu uploades sur Mon Espace, pas besoin de gérer l'administratif côté SPW. Service inclus dans le devis, pas de frais additionnels.",
        },
      },
      {
        heading: "Exemples chiffrés à jour (mai 2026)",
        paragraphs: [
          "Cas A. Ménage R2 (revenus de référence 36 000 €), maison à Andenne construite en 1985, audit récent valide. Pose d'un Ferlux 8 kW à 4 600 € TVAC. Prime calculée : 640 €. Plafond 70 % = 3 220 €, donc tu reçois bien 640 €. Coût net après prime : 3 960 €.",
          "Cas B. Ménage R1 (revenus de référence 22 000 €), maison à Charleroi de 1962, audit en cours. Pose d'un canalisable EK63 12 kW à 7 100 € TVAC. Prime calculée : 960 €. Plafond 70 % = 4 970 €, donc tu reçois bien 960 €. Coût net : 6 140 €.",
          "Cas C. Ménage R3 (revenus 50 000 €), maison à Wavre construite en 2002. Audit obligatoire à organiser avant pose. Hydro Dielle Iride 22 kW à 11 800 € TVAC. Prime calculée : 320 €. Plafond 50 % = 5 900 €, donc tu reçois bien 320 €. Coût net : 11 480 €. Ici, c'est le remplacement de la chaudière mazout existante qui rentabilise sur la durée, pas la prime.",
          "Cas D. Ménage R5 (revenus 140 000 €). Non éligible aux primes Habitation depuis le 14 février 2025, quel que soit le projet. Pas de prime Wallonie sur le poêle à pellets, mais TVA 6 % et prêt 0 % restent accessibles.",
        ],
      },
      {
        heading: "Et après le 30 septembre 2026 ?",
        paragraphs: [
          "Le régime actuel est temporaire. À partir du 1er octobre 2026, un nouveau régime global devrait entrer en vigueur, avec des montants et conditions à confirmer (rien n'est publié au moment de la rédaction, mai 2026). Si ton projet n'est pas urgent, il peut être pertinent d'attendre les annonces officielles. Si l'hiver 2026-2027 te concerne, mieux vaut sécuriser maintenant sous le régime connu.",
          "Mister Pellets met cette page à jour dès la publication officielle du nouveau régime. Tu peux aussi appeler le numéro gratuit 1718 (SPW) pour obtenir l'info la plus à jour, ou consulter un Guichet Énergie Wallonie de ta zone.",
        ],
      },
    ],
    faqs: [
      {
        question: "Quel est le montant maximal de la prime poêle à pellets en Wallonie en 2026 ?",
        answer:
          "960 €, pour un ménage en catégorie R1 (revenus de référence inférieurs ou égaux à 24 600 €). C'est la prime de base de 160 € multipliée par le coefficient 6. Au-delà, le plafond en pourcentage de la facture peut s'appliquer (70 % pour R1 et R2).",
      },
      {
        question: "L'audit logement préalable est-il vraiment obligatoire pour un simple poêle à pellets ?",
        answer:
          "Oui, depuis le 14 février 2025. C'est un changement majeur par rapport à l'ancien régime. L'audit doit être enregistré avant le démarrage des travaux, dure 5 ans, et coûte 800 à 1 200 € TVAC, partiellement couvert par une prime audit séparée. Sans audit, le dossier prime est rejeté.",
      },
      {
        question: "Faut-il déposer le dossier avant ou après les travaux ?",
        answer:
          "L'audit logement et le devis doivent être réalisés avant les travaux. Le dépôt du dossier prime se fait après la pose, dans un délai maximum de 8 mois après la facture finale acquittée.",
      },
      {
        question: "Combien de temps pour recevoir la prime sur mon compte ?",
        answer:
          "Le délai actuel d'instruction par le SPW Logement est de 1 à 2 ans à compter du dépôt complet. Le gouvernement wallon s'est engagé à raccourcir ce délai. En attendant, tu paies normalement Mister Pellets et tu reçois la prime ensuite, directement sur ton compte.",
      },
      {
        question: "Peut-on cumuler avec la prime de la commune ?",
        answer:
          "Oui dans la plupart des cas. Plusieurs communes wallonnes ajoutent leur propre prime communale (Namur, Charleroi, Liège, certaines communes du Brabant wallon notamment), de 100 à 500 € selon les règlements locaux. Le cumul est possible avec la Prime Habitation régionale, sous le plafond global de 50 000 € par logement.",
      },
      {
        question: "Et si mes revenus dépassent 122 800 € ?",
        answer:
          "Tu es en catégorie R5 et tu n'es plus éligible aux primes Habitation depuis le 14 février 2025. Tu peux toutefois bénéficier de la TVA réduite à 6 % (logement de plus de 10 ans) et du prêt à taux 0 % Renopack ou Rénoprêt.",
      },
    ],
    related: {
      articles: ["remplacer-chaudiere-mazout-poele-hydro", "dimensionner-poele-pellets-surface-wallonie"],
      guides: ["guide-achat-poele-pellets-wallonie"],
      cities: ["namur", "charleroi", "liege", "wavre", "andenne"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 4. REMPLACER CHAUDIÈRE MAZOUT (intent : "remplacer mazout pellets")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "remplacer-chaudiere-mazout-poele-hydro",
    title: "Remplacer sa chaudière mazout par un poêle hydro à pellets : ce qu'il faut savoir",
    metaTitle: "Remplacer mazout par poêle pellets hydro, guide 2026",
    metaDescription:
      "Coût total, primes cumulées, délai de retour, raccordement aux radiateurs : la transition mazout → pellets hydro expliquée par Mister Pellets.",
    excerpt:
      "Avec le mazout à 1,15 €/litre et la fin programmée des chaudières mazout d'ici 2035, le pellet hydro devient l'alternative la plus simple en Wallonie.",
    tldr:
      "Remplacer une chaudière mazout par un poêle hydro à pellets coûte 8 000 à 14 000 € posé selon la puissance (16 à 24 kW) et la complexité du raccordement aux radiateurs existants. Avec la Prime Habitation Wallonie 2026 (160 à 960 € selon catégorie de revenus), le démantèlement cuve mazout (250 à 1 000 € selon la commune) et les économies de combustible, le retour sur investissement se situe entre 5 et 9 ans pour une maison consommant 2 000 litres de mazout par an.",
    category: "installation",
    tags: ["hydro", "mazout", "remplacement", "chaudière", "transition"],
    readingTimeMinutes: 11,
    publishedAt: "2026-01-28",
    modifiedAt: "2026-04-29",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Spécialistes hydro et chauffage central",
    coverImageAlt: "Comparaison entre chaudière mazout ancienne et poêle hydro à pellets moderne",
    sections: [
      {
        heading: "Pourquoi le pellet hydro remplace bien le mazout",
        paragraphs: [
          "Une chaudière mazout chauffe un circuit d'eau qui alimente les radiateurs et l'eau chaude sanitaire. Un poêle hydro à pellets fait exactement la même chose : il chauffe le même circuit, branché de la même manière. La transition technique est plus simple qu'on ne l'imagine.",
          "L'apport pellet par rapport au mazout : combustible local (Wallonie, Ardennes, Allemagne), prix plus stable (350-410 €/T contre 1 050-1 200 €/m³ équivalent), émissions CO2 considérées neutres. Et surtout : la fin annoncée des chaudières mazout en Wallonie d'ici 2035 (interdiction des nouvelles installations dès 2026 dans les nouvelles constructions).",
        ],
      },
      {
        heading: "Quelle puissance hydro pour quelle maison",
        paragraphs: [
          "Le calcul est différent du poêle d'air : ici, la puissance doit suivre le besoin total de chauffage de la maison + l'eau chaude sanitaire si tu choisis cette option. Compte généralement 0,15 à 0,18 kW par m² pour une maison wallonne 4 façades non passive.",
        ],
        table: {
          headers: ["Surface chauffée", "PEB", "Puissance hydro", "Ballon tampon recommandé"],
          rows: [
            ["100-130 m²", "C-D", "16-18 kW", "200-300 L"],
            ["130-180 m²", "C-E", "20-22 kW", "300-500 L"],
            ["180-250 m²", "D-G", "24-28 kW", "500-800 L"],
          ],
          caption: "Dimensionnement hydro indicatif Wallonie. Ajouter +10 % si production ECS intégrée.",
        },
        callout: {
          variant: "info",
          text: "Pour les maisons > 200 m² ou très mal isolées, on ajoute parfois un appoint électrique sur le ballon ECS pour les pics extrêmes (-15 °C, week-ends prolongés). Coût marginal : 200 € matériel.",
        },
      },
      {
        heading: "Le raccordement aux radiateurs existants",
        paragraphs: [
          "Bonne nouvelle : tes radiateurs existants restent en place. Le poêle hydro se raccorde au circuit primaire via un ballon tampon (200 à 800 litres selon la puissance) qui sert de volume d'inertie. Ce ballon est obligatoire : il évite les cycles courts qui usent prématurément le poêle.",
          "Le circuit doit être désembouée (rinçage du tartre et boues accumulés en 20-30 ans de mazout) avant raccordement. Coût du désemboueage : 350 à 600 € selon la longueur du circuit et le nombre de radiateurs. C'est non négociable : un circuit emboué pollue le nouveau matériel en quelques mois.",
        ],
      },
      {
        heading: "Coût total, primes incluses",
        paragraphs: [
          "Voici un cas réel de mars 2026 à Sombreffe : maison 4 façades 1978, 175 m², PEB E, chaudière mazout Junkers de 28 kW en fin de vie, cuve mazout 3 000 L à démanteler.",
          "Devis Mister Pellets : Dielle Iride 22 hydro 22 kW (5 200 € matériel) + ballon tampon 500 L (1 100 €) + désembouage circuit (480 €) + raccordement et mise en service (1 600 €) + démantèlement et nettoyage cuve mazout (850 €) = 9 230 € TVAC tout compris (TVA 6 %).",
          "Primes obtenues : Prime Habitation Wallonie 2026 catégorie R2 (640 €, soit base 160 € × coefficient 4) + prime communale Sombreffe pour démantèlement cuve (300 €) + prime communale rénovation chauffage (200 €) = 1 140 € total. Coût net pour le client : 8 090 €.",
        ],
        callout: {
          variant: "success",
          text: "Économie annuelle estimée : 2 100 litres mazout/an × 1,15 € = 2 415 € contre 2,2 tonnes pellet × 380 € = 836 €. Soit ~1 580 € d'économie/an. Retour sur investissement : ~5 ans.",
        },
      },
      {
        heading: "Le démantèlement de la cuve mazout : étape souvent oubliée",
        paragraphs: [
          "Tu ne peux pas laisser une cuve mazout vide sur place : la réglementation wallonne impose le dégazage et soit le retrait soit la neutralisation par remplissage à la mousse polyuréthane. Coût : 600 à 1 200 € selon volume (1 500, 3 000, 5 000 litres) et accessibilité (extérieure ou enterrée).",
          "Plusieurs communes wallonnes (Namur, Charleroi, Wavre, Andenne, Sombreffe) accordent une prime communale spécifique de 100 à 500 € pour ce démantèlement. À cumuler avec la prime régionale poêle pellets. Mister Pellets coordonne avec un opérateur agréé pour l'évacuation conforme.",
        ],
      },
      {
        heading: "Les 3 erreurs à éviter dans une transition mazout → pellets hydro",
        paragraphs: [
          "Erreur 1 : ne pas désembouer le circuit. Tu importes 25 ans de boues dans un échangeur neuf, résultat, l'échangeur s'encrasse en 18 mois.",
          "Erreur 2 : sous-dimensionner pour économiser. Un hydro 18 kW sur 200 m² PEB E, ça tourne à plein 24/7 en janvier et tu finis par allumer un appoint électrique. La marge utile est de 15-20 % au-dessus du calcul théorique.",
          "Erreur 3 : oublier le ballon tampon. Sans ballon, le poêle fait des cycles courts (allumage-extinction toutes les 30 min), use sa résistance d'allumage en une saison, et bruite la maison. Le ballon n'est pas une option, c'est un élément central.",
        ],
      },
    ],
    faqs: [
      {
        question: "Combien coûte le passage du mazout au poêle hydro à pellets ?",
        answer:
          "Compte 8 000 à 14 000 € TVAC tout compris en Wallonie : matériel (poêle + ballon tampon), désembouage du circuit, raccordement, démantèlement de la cuve mazout. Avec la Prime Habitation 2026 (160 à 960 € selon catégorie de revenus) et d'éventuelles primes communales (cuve mazout, rénovation chauffage), on tombe souvent à 6 500-12 500 € net.",
      },
      {
        question: "Faut-il garder une chaudière d'appoint en plus du poêle hydro ?",
        answer:
          "Non, dans 90 % des cas le poêle hydro couvre 100 % du besoin de chauffage et d'eau chaude. Seules les très grandes maisons (>250 m²) très mal isolées peuvent nécessiter un appoint électrique sur ballon ECS pour les pics de froid extrêmes.",
      },
      {
        question: "Combien de temps pour rentabiliser l'investissement ?",
        answer:
          "Pour une maison consommant 2 000 litres de mazout par an, le retour sur investissement (ROI) se situe entre 5 et 9 ans selon le coût total des travaux et les primes obtenues. Au-delà de 9 ans, c'est de la pure économie.",
      },
      {
        question: "Que faire de l'ancienne cuve mazout vide ?",
        answer:
          "Réglementairement, elle doit être dégazée puis soit retirée (cuves extérieures, ~600 €) soit neutralisée par remplissage mousse PU si enterrée et inaccessible (~900-1 200 €). Une prime communale couvre souvent une partie. Mister Pellets coordonne l'opération avec un opérateur agréé.",
      },
    ],
    related: {
      articles: ["dimensionner-poele-pellets-surface-wallonie", "primes-wallonie-2026-poele-pellets-combien-recuperer"],
      guides: ["poele-pellets-hydro", "guide-achat-poele-pellets-wallonie"],
      cities: ["namur", "charleroi", "wavre", "andenne"],
      brands: ["dielle", "edilkamin"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 5. POÊLE QUI S'ÉTEINT (intent : "pourquoi mon poêle s'éteint")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "poele-pellets-eteint-tout-seul-causes",
    title: "Pourquoi mon poêle à pellets s'éteint tout seul ? 7 causes courantes",
    metaTitle: "Poêle pellets qui s'éteint seul, 7 causes et solutions (2026)",
    metaDescription:
      "Creuset bouché, pellets humides, sonde encrassée, conduit obstrué… Voici comment diagnostiquer un poêle pellets qui s'arrête tout seul.",
    excerpt:
      "Un poêle qui s'éteint sans qu'on lui demande, c'est rarement un défaut de fabrication. 7 causes couvrent 95 % des cas, la plupart se règlent en 30 minutes sans technicien.",
    tldr:
      "Un poêle à pellets qui s'éteint tout seul a presque toujours une de ces 7 causes : creuset encrassé, pellets de mauvaise qualité ou humides, sonde de fumée encrassée, échangeur bouché, vis sans fin bloquée, prise d'air comburant obstruée, ou conduit non ramoné. Avant d'appeler un technicien, vérifie ces 7 points dans l'ordre, la cause est dans 80 % des cas un défaut d'entretien plutôt qu'une panne matérielle.",
    category: "entretien",
    tags: ["panne", "diagnostic", "entretien", "extinction", "creuset"],
    readingTimeMinutes: 9,
    publishedAt: "2026-04-02",
    modifiedAt: "2026-04-29",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens SAV",
    coverImageAlt: "Creuset de poêle à pellets encrassé avec mâchefer accumulé",
    sections: [
      {
        heading: "Cause n°1 : creuset encrassé (40 % des cas)",
        paragraphs: [
          "C'est la cause la plus fréquente. Le creuset (la coupelle où brûlent les pellets) accumule du mâchefer, résidu vitrifié de cendres et de minéraux, qui finit par boucher les trous d'admission d'air primaire. Sans air, la flamme s'étouffe et le poêle déclenche son extinction de sécurité.",
          "Diagnostic : à froid, sors le creuset. Si tu vois des amas durs et brillants comme du verre, c'est du mâchefer. Solution : frappe le creuset à l'envers sur une surface dure pour décoller, brosse les trous avec une brosse métallique, vérifie qu'aucun trou n'est obstrué.",
        ],
        callout: {
          variant: "info",
          text: "Vide les cendres tous les 2-3 jours en pleine saison, brosse le creuset toutes les semaines. C'est l'entretien le plus important d'un poêle à pellets.",
        },
      },
      {
        heading: "Cause n°2 : pellets humides ou de mauvaise qualité (20 %)",
        paragraphs: [
          "Un pellet à 12 % d'humidité (au lieu de < 10 %) brûle moins bien, fait plus de cendres, encrasse l'échangeur. À partir de 14 %, le poêle peut s'éteindre faute de combustion stable.",
          "Diagnostic : prends une poignée de pellets, frotte-les. Ils doivent être durs, lisses, sans poussière. Cassés, friables, ou poussiéreux = mauvais lot ou stockage humide. Solution : passe à un sac neuf certifié ENplus A1 ou DINplus, vide entièrement le réservoir et la vis sans fin avant.",
        ],
      },
      {
        heading: "Cause n°3 : sonde de fumée encrassée (15 %)",
        paragraphs: [
          "La sonde thermocouple mesure la température des fumées en sortie d'échangeur. Si elle est couverte de suie, elle envoie une fausse lecture : le poêle croit qu'il fait trop froid et déclenche une extinction par sécurité.",
          "Diagnostic : le code erreur affiché est souvent E101, E110 ou « température fumée basse » selon la marque. Solution : à froid, retire la sonde (1 vis) et essuie-la avec un chiffon sec. Pas de produit chimique. Remonte. 80 % des cas se résolvent en 5 minutes.",
        ],
      },
      {
        heading: "Cause n°4 : échangeur bouché (10 %)",
        paragraphs: [
          "L'échangeur (les conduits internes par où passent les fumées avant la sortie) accumule de la suie. Quand le passage rétrécit trop, le tirage chute, la combustion devient mauvaise, le poêle s'éteint.",
          "Diagnostic : ouvre la porte du foyer. Si les parois sont noires de suie épaisse, l'échangeur l'est aussi probablement. Solution : ramonage interne avec la canne fournie (action sur le levier en façade pour les Edilkamin/EK63) toutes les 2-3 semaines en saison. Ramonage technique annuel par un professionnel obligatoire.",
        ],
      },
      {
        heading: "Cause n°5 : vis sans fin bloquée (8 %)",
        paragraphs: [
          "La vis sans fin descend les pellets du réservoir vers le creuset. Si un pellet trop long, un débris (vis, bois, plastique) ou un amas humide se coince, la vis force, le moteur déclenche sa sécurité thermique et le poêle s'arrête.",
          "Diagnostic : tu entends le moteur grogner au démarrage sans pellets qui descendent dans le creuset. Solution : vide le réservoir, démonte la vis (1-2 vis selon modèle), retire l'obstacle. Profite-en pour vérifier qu'aucun élément étranger n'est présent.",
        ],
      },
      {
        heading: "Cause n°6 : prise d'air comburant obstruée (5 %)",
        paragraphs: [
          "Les modèles étanches prennent leur air de combustion à l'extérieur via un tuyau en façade. Une feuille morte, un nid, ou une grille obstruée bloque l'arrivée d'air. Le poêle ne peut plus brûler correctement et s'éteint.",
          "Diagnostic : passe à l'extérieur, vérifie la grille de prise d'air. Solution : nettoie à la brosse. Sur les non-étanches, vérifie la grille de ventilation de la pièce, un meuble qui obstrue est aussi un classique.",
        ],
      },
      {
        heading: "Cause n°7 : conduit non ramoné ou refoulement (2 %)",
        paragraphs: [
          "En Wallonie, le ramonage du conduit de fumée est obligatoire 1 fois par an pour un poêle à pellets. Sans ramonage, la suie accumulée réduit le tirage. Par grand vent, un refoulement temporaire peut aussi déclencher l'extinction.",
          "Diagnostic : si le poêle s'éteint surtout par temps venteux ou si tu sens une odeur de fumée intermittente, c'est probablement le conduit. Solution : appel d'un ramoneur certifié (50 à 90 € en Wallonie). Vérifie aussi le chapeau du conduit : nid d'oiseau, mousse, c'est fréquent.",
        ],
        callout: {
          variant: "warning",
          text: "Sans certificat de ramonage annuel, ton assurance habitation peut refuser de couvrir un sinistre lié au poêle. Garde toujours la facture du ramoneur.",
        },
      },
      {
        heading: "Si rien ne fonctionne : appelle ton SAV",
        paragraphs: [
          "Si tu as vérifié les 7 points ci-dessus sans succès, c'est probablement une panne matérielle : résistance d'allumage HS (durée de vie typique 4-7 ans), motoréducteur de vis sans fin, carte électronique. Ces réparations dépassent les compétences classiques d'un utilisateur, appelle ton installateur.",
          "Mister Pellets intervient en SAV dans les 50 km autour de Fernelmont. Pour les clients hors zone, on conseille toujours un installateur certifié local. Les pièces détachées Edilkamin, EK63, Dielle et Ferlux sont disponibles en stock chez nous sous 48 h.",
        ],
      },
    ],
    faqs: [
      {
        question: "Mon poêle à pellets s'éteint au bout de 30 minutes, que faire ?",
        answer:
          "C'est typique d'un creuset encrassé qui ne laisse plus passer l'air primaire. Vide le creuset à froid, brosse les trous avec une brosse métallique, et vérifie que les pellets sont certifiés ENplus A1. Si le problème persiste après 2-3 cycles, contrôle la sonde de fumée.",
      },
      {
        question: "Combien coûte une intervention SAV en Wallonie ?",
        answer:
          "Comptez 90 à 140 € de déplacement + main d'œuvre (1 à 2 h en moyenne) pour un diagnostic. Pièces en sus : sonde fumée 35-60 €, résistance d'allumage 45-90 €, motoréducteur 180-280 €. Mister Pellets facture le déplacement à partir du retour atelier.",
      },
      {
        question: "Est-ce normal que mon poêle s'éteigne quand le réservoir est vide ?",
        answer:
          "Oui, c'est une sécurité normale. Le poêle détecte l'absence de pellets via la chute de température et déclenche une extinction propre. Remplis le réservoir, attends 5 minutes que la vis se réamorce, redémarre.",
      },
      {
        question: "Mon poêle s'éteint surtout par temps de vent, pourquoi ?",
        answer:
          "Le vent peut provoquer un refoulement dans le conduit de fumée, surtout si le chapeau est mal adapté ou obstrué. Solution : faire vérifier le chapeau par un ramoneur, et si nécessaire installer un chapeau anti-refoulement type rotatif.",
      },
    ],
    related: {
      articles: ["pellets-enplus-a1-vs-dinplus", "entretien-poele-pellets-saison"],
      guides: ["comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "fernelmont"],
      brands: ["edilkamin", "ek63", "dielle", "ferlux"],
    },
  },
];

// =====================================================================
// HELPERS
// =====================================================================

export function getArticleBySlug(slug: string): ArticleData | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(category: ArticleCategory): ArticleData[] {
  return ARTICLES.filter((a) => a.category === category);
}

export function getRelatedArticles(slug: string, limit = 3): ArticleData[] {
  const current = getArticleBySlug(slug);
  if (!current) return [];

  const explicit = (current.related.articles ?? [])
    .map((s) => getArticleBySlug(s))
    .filter((a): a is ArticleData => Boolean(a));

  if (explicit.length >= limit) return explicit.slice(0, limit);

  // Fallback : autres articles de la même catégorie, puis tout le reste
  const sameCategory = ARTICLES.filter(
    (a) => a.slug !== slug && a.category === current.category && !explicit.includes(a),
  );
  const others = ARTICLES.filter(
    (a) =>
      a.slug !== slug &&
      a.category !== current.category &&
      !explicit.includes(a) &&
      !sameCategory.includes(a),
  );

  return [...explicit, ...sameCategory, ...others].slice(0, limit);
}

export function getLatestArticles(limit = 6): ArticleData[] {
  return [...ARTICLES]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export const ARTICLE_CATEGORIES: { value: ArticleCategory; label: string }[] = (
  Object.entries(CATEGORY_LABELS) as [ArticleCategory, string][]
).map(([value, label]) => ({ value, label }));
