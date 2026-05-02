/**
 * Articles éditoriaux du blog Mister Pellets — Phase 7.
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
// 5 ARTICLES PILIERS GEO — chacun ~1500-2000 mots, format réponse directe
// =====================================================================

export const ARTICLES: ArticleData[] = [
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
      "La règle simple — 1 kW pour 10 m² — ne suffit pas. Voici le calcul exact selon ta PEB, ton plafond et ta zone climatique en Wallonie.",
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
            ["A — passif / quasi-passif", "0,07-0,08 kW/m²", "7-8 kW", "10-12 kW"],
            ["B — performant", "0,10 kW/m²", "10 kW", "15 kW"],
            ["C — D — standard", "0,12 kW/m²", "12 kW", "18 kW"],
            ["E — F — moyen", "0,13-0,14 kW/m²", "13-14 kW", "20-21 kW"],
            ["G — ancien non rénové", "0,15-0,18 kW/m²", "15-18 kW", "22-27 kW"],
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
          text: "Selon les techniciens Mister Pellets, sur le terrain, environ 1 poêle sur 4 vu en SAV est mal dimensionné — le plus souvent surdimensionné parce que vendu sur surface brute sans tenir compte de la PEB.",
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
          text: "Avant tout devis, Mister Pellets fait un diagnostic gratuit à domicile dans les 50 km autour de Fernelmont. Mesure des volumes, vérification du conduit, contrôle de l'arrivée d'air comburant — sans engagement.",
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
          "Pire, le taux de cendres élevé (2 %) sature le creuset 3 fois plus vite, encrasse l'échangeur de chaleur et finit par bloquer la sonde de fumée. Sur le terrain, on a vu des poêles 3 ans tomber en panne pour cause de pellets bon marché — la garantie ne couvre pas ce type de sinistre.",
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
            "Préfère les marques avec scieries traçables en Belgique, France ou Autriche — pas les pellets d'origine inconnue.",
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
          "S'il est légèrement gondolé sans odeur de moisi, étale-le 48 h dans un endroit sec — il peut récupérer. S'il sent l'humide ou se transforme en bouillie au toucher, jette-le : il bloquerait la vis sans fin.",
      },
    ],
    related: {
      articles: ["entretien-poele-pellets-saison", "poele-pellets-eteint-tout-seul-causes"],
      guides: ["comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "tournai"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 3. PRIMES WALLONIE 2026 (intent : "primes poêle pellets Wallonie")
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "primes-wallonie-2026-poele-pellets-combien-recuperer",
    title: "Primes poêle à pellets en Wallonie 2026 : combien pouvez-vous récupérer ?",
    metaTitle: "Primes poêle à pellets Wallonie 2026 — montants et conditions",
    metaDescription:
      "1 500 € R1, 750 € R2, 375 € R3 + bonus PEB. Conditions techniques, dossier, délais. Le guide complet 2026 par Mister Pellets.",
    excerpt:
      "Trois catégories de revenus, trois montants. Plus un bonus si la maison est en PEB F ou G. Voici exactement combien tu touches et comment monter le dossier sans faire d'erreur.",
    tldr:
      "En Wallonie en 2026, l'installation d'un poêle à pellets ouvre droit à une prime de 375 €, 750 € ou 1 500 € selon ta catégorie de revenus (R3, R2, R1). Un bonus de 250 € s'ajoute si la PEB est F ou G. Conditions cumulatives : rendement ≥ 87 %, écodesign 2022 conforme, installateur certifié RGIE/Cerga, devis avant travaux. Délai moyen de versement : 4 à 8 mois après dépôt du dossier complet.",
    category: "primes",
    tags: ["primes", "Wallonie", "2026", "aide", "subvention"],
    readingTimeMinutes: 10,
    publishedAt: "2026-02-10",
    modifiedAt: "2026-04-29",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers primes énergie",
    coverImageAlt: "Tableau récapitulatif des primes Wallonie 2026 pour poêle à pellets",
    sections: [
      {
        heading: "Les 3 montants 2026 selon ton revenu",
        paragraphs: [
          "La Wallonie module la prime selon le revenu imposable globalement attesté du ménage (RIG) sur le dernier avertissement-extrait de rôle disponible. Trois catégories : R1 (revenus modestes), R2 (revenus moyens), R3 (revenus supérieurs).",
          "Pour 2026, les seuils RIG sont : R1 jusqu'à 26 700 € ; R2 entre 26 700,01 € et 60 000 € ; R3 au-delà. Ces seuils sont majorés de 3 700 € par personne à charge. Vérifie ta catégorie sur monespace.wallonie.be avant de déposer.",
        ],
        table: {
          headers: ["Catégorie", "Revenu RIG (couple)", "Prime 2026 poêle pellets"],
          rows: [
            ["R1 — Revenus modestes", "≤ 26 700 €", "1 500 €"],
            ["R2 — Revenus moyens", "26 701 à 60 000 €", "750 €"],
            ["R3 — Revenus supérieurs", "> 60 000 €", "375 €"],
          ],
          caption: "Montants Wallonie 2026 pour appareil pellets ≥ 87 % rendement (hors bonus PEB).",
        },
      },
      {
        heading: "Le bonus PEB qu'on oublie souvent",
        paragraphs: [
          "Si ton certificat PEB indique F ou G (label rouge), tu touches un bonus de 250 € en plus de la prime de base. C'est cumulatif. Concrètement, un ménage R1 dans une maison PEB G peut récupérer 1 750 € sur l'installation.",
          "Le bonus n'est pas automatique : il faut joindre le certificat PEB au dossier (date de validité 10 ans après émission). Si tu n'en as pas, fais-en faire un avant le dépôt — ça coûte 200 à 300 € pour une maison standard et c'est rentable d'office.",
        ],
        callout: {
          variant: "success",
          text: "Cumul exemple : ménage R1 + maison PEB G = 1 750 €. Sur un poêle Edilkamin 9 kW posé à 5 800 €, il reste 4 050 € à charge. Avec un canalisable de 12 kW à 7 200 €, il reste 5 450 €.",
        },
      },
      {
        heading: "Les conditions techniques à respecter strictement",
        paragraphs: [
          "Toutes les conditions ci-dessous doivent être réunies, sinon la prime est refusée à l'instruction du dossier. Pas de tolérance.",
        ],
        list: {
          ordered: true,
          items: [
            "Rendement énergétique saisonnier ≥ 87 % (figure sur la fiche technique constructeur).",
            "Conformité écodesign 2022 / Lot 20 — quasiment tous les modèles vendus aujourd'hui le respectent.",
            "Installation par un entrepreneur certifié RGIE et Cerga (ou équivalent reconnu en Wallonie).",
            "Devis daté et signé avant le démarrage des travaux. Pas de prime sur facture rétroactive.",
            "Logement situé en Wallonie, occupé en résidence principale ou destiné à la location.",
            "Le poêle doit être l'appareil principal de la pièce desservie (pas un appoint annexe).",
          ],
        },
      },
      {
        heading: "Le dossier : 7 pièces à réunir, 8 mois d'attente max",
        paragraphs: [
          "Le dossier se dépose en ligne sur monespace.wallonie.be (rubrique Primes Habitation) après réalisation des travaux. Tu as 4 mois après la date de la facture finale pour déposer, donc ne traîne pas.",
        ],
        list: {
          ordered: true,
          items: [
            "Devis détaillé daté et signé avant travaux",
            "Facture finale acquittée (avec mention « payée »)",
            "Fiche technique constructeur du poêle (rendement et écodesign)",
            "Certificat de conformité Cerga délivré par l'installateur",
            "Avertissement-extrait de rôle du ménage (revenus N-2)",
            "Certificat PEB du logement si bonus demandé",
            "Photos avant/après de l'installation (parfois demandées en complément)",
          ],
        },
      },
      {
        heading: "Les autres aides cumulables qu'on regarde rarement",
        paragraphs: [
          "Outre la prime régionale Wallonie, certaines communes ajoutent leur propre prime communale : Namur, Charleroi, Liège, Mons et plusieurs communes du Brabant wallon ont des dispositifs de 100 à 500 €. Vérifie sur le site de ta commune ou demande-nous, on tient une base à jour pour la zone Fernelmont.",
          "Côté fiscal, les intérêts d'un éventuel prêt à 0 % « Coup de pouce wallon » restent intéressants pour étaler l'investissement. La TVA réduite à 6 % s'applique d'office sur la pose si le logement a plus de 10 ans (cas le plus courant en Wallonie).",
        ],
      },
      {
        heading: "Combien tu paies vraiment, exemples chiffrés",
        paragraphs: [
          "Cas A : ménage R2, maison PEB D à Andenne, poêle Ferlux 8 kW posé à 4 600 € TTC. Prime base 750 €, pas de bonus PEB. Coût net : 3 850 €.",
          "Cas B : ménage R1, maison PEB G à Charleroi, canalisable EK63 12 kW posé à 7 100 € TTC. Prime base 1 500 € + bonus 250 € = 1 750 €. Coût net : 5 350 €.",
          "Cas C : ménage R3, maison PEB B à Wavre, hydro Dielle Iride 22 kW posé à 11 800 € TTC. Prime base 375 €, pas de bonus. Coût net : 11 425 €. Ici, c'est le remplacement de chaudière mazout qui rentabilise — pas la prime.",
        ],
        callout: {
          variant: "info",
          text: "Mister Pellets monte le dossier complet pour ses clients : on collecte les pièces, on rédige les justificatifs et on dépose à ta place. Service inclus dans le devis, pas de frais additionnels.",
        },
      },
    ],
    faqs: [
      {
        question: "Quelle est la prime maximale en Wallonie pour un poêle à pellets en 2026 ?",
        answer:
          "1 750 € : 1 500 € de prime de base R1 (revenus modestes) + 250 € de bonus PEB F ou G. Sans bonus PEB, le plafond est 1 500 € pour les ménages R1, 750 € pour les R2 et 375 € pour les R3.",
      },
      {
        question: "Faut-il déposer le dossier avant ou après les travaux ?",
        answer:
          "Le devis doit être daté et signé avant les travaux, mais le dépôt du dossier complet se fait après la pose, dans un délai maximum de 4 mois après la facture finale acquittée.",
      },
      {
        question: "Combien de temps pour recevoir la prime ?",
        answer:
          "En 2026, les délais d'instruction Wallonie sont de 4 à 8 mois en moyenne. Les dossiers complets et conformes du premier coup sont traités plus vite. Mister Pellets surveille l'état d'avancement et relance si besoin.",
      },
      {
        question: "Peut-on cumuler la prime Wallonie avec la prime de la commune ?",
        answer:
          "Oui, la plupart des communes wallonnes acceptent le cumul avec la prime régionale. Le montant communal vient en plus, sans réduire la prime régionale. Vérifie le règlement spécifique de ta commune.",
      },
      {
        question: "Et si je remplace une chaudière mazout par un poêle hydro ?",
        answer:
          "Tu cumules la prime « poêle pellets » et potentiellement la prime « démantèlement de cuve à mazout » (250 à 1 000 € selon la commune). Avec le bonus PEB, on monte facilement à 2 500 € de soutien total dans certaines communes.",
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
    metaTitle: "Remplacer mazout par poêle pellets hydro — guide 2026",
    metaDescription:
      "Coût total, primes cumulées, délai de retour, raccordement aux radiateurs : la transition mazout → pellets hydro expliquée par Mister Pellets.",
    excerpt:
      "Avec le mazout à 1,15 €/litre et la fin programmée des chaudières mazout d'ici 2035, le pellet hydro devient l'alternative la plus simple en Wallonie.",
    tldr:
      "Remplacer une chaudière mazout par un poêle hydro à pellets coûte 8 000 à 14 000 € posé selon la puissance (16 à 24 kW) et la complexité du raccordement aux radiateurs existants. Avec les primes cumulées Wallonie (jusqu'à 1 750 €) et le démantèlement cuve mazout (250-1 000 €), le retour sur investissement se situe entre 6 et 9 ans pour une maison consommant 2 000 litres de mazout par an.",
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
          "Devis Mister Pellets : Dielle Iride 22 hydro 22 kW (5 200 € matériel) + ballon tampon 500 L (1 100 €) + désembouage circuit (480 €) + raccordement et mise en service (1 600 €) + démantèlement et nettoyage cuve mazout (850 €) = 9 230 € TTC tout compris (TVA 6 %).",
          "Primes obtenues : prime Wallonie R2 (750 €) + bonus PEB E ne s'applique pas (seulement F-G) + prime communale Sombreffe pour démantèlement cuve (300 €) + prime communale rénovation chauffage (200 €) = 1 250 € total. Coût net pour le client : 7 980 €.",
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
          "Erreur 1 : ne pas désembouer le circuit. Tu importes 25 ans de boues dans un échangeur neuf — résultat, l'échangeur s'encrasse en 18 mois.",
          "Erreur 2 : sous-dimensionner pour économiser. Un hydro 18 kW sur 200 m² PEB E, ça tourne à plein 24/7 en janvier et tu finis par allumer un appoint électrique. La marge utile est de 15-20 % au-dessus du calcul théorique.",
          "Erreur 3 : oublier le ballon tampon. Sans ballon, le poêle fait des cycles courts (allumage-extinction toutes les 30 min), use sa résistance d'allumage en une saison, et bruite la maison. Le ballon n'est pas une option, c'est un élément central.",
        ],
      },
    ],
    faqs: [
      {
        question: "Combien coûte le passage du mazout au poêle hydro à pellets ?",
        answer:
          "Compte 8 000 à 14 000 € TTC tout compris en Wallonie : matériel (poêle + ballon tampon), désembouage du circuit, raccordement, démantèlement de la cuve mazout. Avec les primes Wallonie + communales, on tombe souvent à 6 500-12 000 € net.",
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
    metaTitle: "Poêle pellets qui s'éteint seul — 7 causes et solutions (2026)",
    metaDescription:
      "Creuset bouché, pellets humides, sonde encrassée, conduit obstrué… Voici comment diagnostiquer un poêle pellets qui s'arrête tout seul.",
    excerpt:
      "Un poêle qui s'éteint sans qu'on lui demande, c'est rarement un défaut de fabrication. 7 causes couvrent 95 % des cas — la plupart se règlent en 30 minutes sans technicien.",
    tldr:
      "Un poêle à pellets qui s'éteint tout seul a presque toujours une de ces 7 causes : creuset encrassé, pellets de mauvaise qualité ou humides, sonde de fumée encrassée, échangeur bouché, vis sans fin bloquée, prise d'air comburant obstruée, ou conduit non ramoné. Avant d'appeler un technicien, vérifie ces 7 points dans l'ordre — la cause est dans 80 % des cas un défaut d'entretien plutôt qu'une panne matérielle.",
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
          "C'est la cause la plus fréquente. Le creuset (la coupelle où brûlent les pellets) accumule du mâchefer — résidu vitrifié de cendres et de minéraux — qui finit par boucher les trous d'admission d'air primaire. Sans air, la flamme s'étouffe et le poêle déclenche son extinction de sécurité.",
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
          "Diagnostic : passe à l'extérieur, vérifie la grille de prise d'air. Solution : nettoie à la brosse. Sur les non-étanches, vérifie la grille de ventilation de la pièce — un meuble qui obstrue est aussi un classique.",
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
          "Si tu as vérifié les 7 points ci-dessus sans succès, c'est probablement une panne matérielle : résistance d'allumage HS (durée de vie typique 4-7 ans), motoréducteur de vis sans fin, carte électronique. Ces réparations dépassent les compétences classiques d'un utilisateur — appelle ton installateur.",
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
