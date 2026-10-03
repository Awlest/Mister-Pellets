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
  // SAISON 2026-2027 : budget d'un hiver au pellet (ajouté le 03/10/2026)
  // Prix : ValBiom (pellets, août 2026) et SPF Économie (mazout, tarif
  // n° 2026/191 du 03/10/2026). À actualiser à chaque saison.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "budget-hiver-poele-pellets-consommation-2026",
    title: "Combien coûte un hiver au pellet ? Le calcul pour 2026-2027",
    metaTitle: "Consommation d'un poêle à pellets : combien de sacs pour l'hiver 2026-2027 ?",
    metaDescription:
      "Combien de pellets pour un hiver, ce que ça coûte en 2026 et comment le calculer chez vous à partir de votre ancienne facture. Prix ValBiom et SPF Économie.",
    excerpt:
      "Un sac de 15 kg coûte autour de 6 € en Wallonie. La vraie question, c'est combien de sacs votre maison va avaler entre octobre et avril. Voici comment le calculer sans vous tromper.",
    tldr:
      "Pour un poêle de 10 kW qui chauffe la maison tout l'hiver, comptez 1,5 à 2 tonnes de pellets, soit 100 à 135 sacs de 15 kg. Au prix moyen relevé par ValBiom en août 2026, 6,19 € le sac acheté par palette, la saison revient à 620 à 830 €. En appoint, plutôt 600 à 900 kg. Le calcul tient en un chiffre : un kilo de pellet certifié livre au moins 4,6 kWh, et votre poêle en restitue environ 90 %.",
    category: "pellets",
    tags: ["consommation", "prix des pellets", "budget chauffage", "mazout", "hiver 2026-2027"],
    readingTimeMinutes: 7,
    publishedAt: "2026-10-03",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers combustible",
    coverImageAlt: "Palette de sacs de pellets de 15 kg stockée au sec pour l'hiver",
    sections: [
      {
        heading: "Ce qu'un kilo de pellet vous donne vraiment",
        paragraphs: [
          "Un pellet certifié ENplus A1 ou DINplus contient au moins 4,6 kWh par kilo. Votre poêle n'en restitue pas tout : les modèles que nous posons annoncent entre 85 et 96 % de rendement. Pour un calcul simple sur une saison entière, avec les allumages et les régimes bas, on retient 90 %. Un kilo de pellet, c'est donc un peu plus de 4 kWh de chaleur dans la maison.",
          "À pleine puissance, un poêle de 8 kW brûle un peu moins de 2 kilos par heure : Edilkamin annonce de 0,7 à 1,9 kg/h pour son insert Pellkamin 8 Evo, du minimum au maximum. Mais un poêle bien dimensionné passe l'essentiel de l'hiver à mi-régime, et c'est là que se joue votre consommation.",
        ],
      },
      {
        heading: "Trois profils, trois budgets",
        paragraphs: [
          "Voici les fourchettes qu'on donne en rendez-vous, chiffrées au prix moyen relevé par ValBiom en août 2026.",
        ],
        table: {
          headers: ["Votre usage", "Pellets par saison", "Sacs de 15 kg", "Budget"],
          rows: [
            ["Appoint le soir et le week-end, poêle de 7 à 9 kW", "600 à 900 kg", "40 à 60", "250 à 370 €"],
            ["Chauffage principal, maison de 120 m² en PEB B ou C, poêle de 10 kW", "1,5 à 2 tonnes", "100 à 135", "620 à 830 €"],
            ["Poêle hydro qui remplace une chaudière, maison de 150 à 180 m²", "3 à 4 tonnes", "200 à 270", "1 240 à 1 650 €"],
          ],
          caption: "Prix moyen ValBiom d'août 2026 en Wallonie : 6,19 € le sac de 15 kg, pellets certifiés achetés par palette, livraison non comprise. Fourchettes indicatives : l'isolation et le thermostat font la différence.",
        },
      },
      {
        heading: "Faire le calcul chez vous, à partir de l'ancienne facture",
        paragraphs: [
          "Le plus fiable, c'est de partir de ce que la maison consommait déjà. Un litre de mazout contient environ 10 kWh. Si votre vieille chaudière en rendait 80 % sur la saison, chaque litre devenait 8 kWh de chaleur. Un kilo de pellet en donne un peu plus de 4 dans le poêle : un litre de mazout remplacé, c'est donc à peu près 1,9 kg de pellets.",
          "Une maison qui brûlait 1 500 litres par an demandera autour de 2,8 tonnes de pellets, à condition que le poêle chauffe toute la maison, ce qui suppose un hydro raccordé aux radiateurs. Un poêle à air dans le séjour n'en remplace qu'une partie : la chaudière continue de chauffer les chambres, et le calcul porte sur la part de chaleur que le poêle reprend.",
          "Au gaz ou à l'électricité, le principe ne change pas : partez des kWh de chauffage de votre facture annuelle, puis divisez par ce que livre un kilo de pellet.",
        ],
      },
      {
        heading: "Le kWh de pellet face au mazout, début octobre 2026",
        paragraphs: [
          "Au prix ValBiom d'août, 6,19 € le sac, un kilo de pellets coûte 41 centimes. À 4,6 kWh par kilo, le kWh revient à 9 centimes. Le mazout était à 1,53 € le litre au tarif maximum du SPF Économie du 3 octobre 2026, à partir de 2 000 litres commandés. À 10 kWh par litre, le kWh revient à 15 centimes.",
          "À chaleur égale, le pellet coûte donc un peu moins de 60 % du mazout. Pour le gaz et l'électricité, regardez le prix du kWh sur votre propre facture : les contrats varient trop d'un ménage à l'autre pour qu'un chiffre unique veuille dire quelque chose.",
        ],
        callout: {
          variant: "info",
          text: "Le SPF Économie publie chaque jour ouvrable le prix maximum du mazout, et ValBiom publie chaque mois le prix moyen des pellets en Wallonie. Deux sources gratuites pour refaire le calcul quand les prix bougent.",
        },
      },
      {
        heading: "Quand acheter, et comment ne pas gaspiller",
        paragraphs: [
          "Les prix suivent la saison. En 2025, ValBiom relevait 5,43 € le sac en juin et en juillet, puis 5,99 € en janvier 2026. Pour l'hiver qui vient, ValBiom n'attend pas de baisse. Si vous avez la place, une palette achetée maintenant reste un meilleur calcul que des sacs à l'unité en plein mois de janvier.",
          "Côté consommation, ce qui pèse le plus, c'est la consigne de température, puis la propreté du poêle. Un échangeur encrassé ou des pellets humides, et le poêle brûle plus pour chauffer moins. L'entretien annuel n'est pas qu'une affaire de garantie.",
        ],
        list: {
          items: [
            "Réglez la pièce de vie à 19 ou 20 °C : chaque degré au-dessus se paie tout l'hiver.",
            "Préférez un régime bas et continu à une série d'allumages : chaque démarrage sollicite la bougie et brûle des pellets avant de vraiment chauffer.",
            "Fermez les portes des pièces que le poêle n'est pas censé chauffer, sauf si c'est un canalisable.",
            "Stockez les sacs au sec : un pellet qui a pris l'humidité chauffe moins et encrasse plus.",
          ],
        },
      },
    ],
    faqs: [
      {
        question: "Combien de sacs de pellets faut-il pour un hiver ?",
        answer:
          "Pour un poêle qui chauffe la maison tout l'hiver, 100 à 135 sacs de 15 kg, soit 1,5 à 2 tonnes. En appoint le soir et le week-end, 40 à 60 sacs suffisent souvent. L'isolation et la consigne de température font varier ces chiffres du simple au double.",
      },
      {
        question: "Combien consomme un poêle à pellets par heure ?",
        answer:
          "Un poêle de 8 kW brûle un peu moins de 2 kg par heure à pleine puissance, et moins d'un kilo au ralenti. Edilkamin annonce par exemple de 0,7 à 1,9 kg/h pour son insert Pellkamin 8 Evo.",
      },
      {
        question: "Le pellet est-il moins cher que le mazout en 2026 ?",
        answer:
          "Oui. Début octobre 2026, le kWh de pellet revenait à environ 9 centimes (6,19 € le sac de 15 kg, prix moyen ValBiom d'août), contre 15 centimes pour le mazout (1,53 € le litre au tarif maximum du SPF Économie, à partir de 2 000 litres).",
      },
      {
        question: "Faut-il acheter ses pellets maintenant ?",
        answer:
          "Si vous avez un endroit sec pour les stocker, oui. Les prix montent d'habitude entre l'été et janvier : en 2025, le sac est passé de 5,43 € en juin à 5,99 € en janvier, et ValBiom ne prévoit pas de baisse pour l'hiver 2026-2027.",
      },
    ],
    related: {
      articles: [
        "pellets-enplus-a1-vs-dinplus",
        "remplacer-chaudiere-mazout-poele-hydro",
        "dimensionner-poele-pellets-surface-wallonie",
      ],
      guides: ["remettre-en-route-poele-pellets-automne", "quelle-puissance-poele-pellets"],
      cities: ["namur", "charleroi", "liege"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // INSTALLATION : insert à pellets dans une cheminée ouverte (03/10/2026)
  // Fiches : EK63 Pellek 80 et 110+, Edilkamin Pellkamin 8, 10+ et 12++,
  // Girolami Grid (catalogue). Autonomie et chargement : edilkamin.com, ek-63.com.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "insert-pellets-cheminee-existante",
    title: "Transformer une cheminée ouverte en insert à pellets : ce qu'on vérifie avant de poser",
    metaTitle: "Insert à pellets dans une cheminée existante : faisabilité, tubage, réservoir",
    metaDescription:
      "Votre feu ouvert chauffe surtout le conduit. Un insert à pellets récupère la cheminée : dimensions, tubage, électricité, réservoir, canalisation. Le point avant devis.",
    excerpt:
      "Un feu ouvert, c'est beau, et ça chauffe surtout le conduit. Un insert à pellets garde la cheminée et la rend utile tout l'hiver, à condition de vérifier quatre choses avant de commander.",
    tldr:
      "Un insert à pellets se glisse dans le foyer d'une cheminée ouverte et la transforme en chauffage programmable, avec 89 à 92 % de rendement sur les modèles que nous posons. Avant de commander, on vérifie quatre points : les dimensions du foyer, le conduit (un tubage de 80 ou 100 mm est presque toujours nécessaire), une prise électrique et la ventilation de la hotte. La contrepartie, c'est un petit réservoir, 11 kg sur les modèles compacts, qu'on remplit chaque jour en plein hiver.",
    category: "installation",
    tags: ["insert", "cheminée", "tubage", "Pellkamin", "Pellek"],
    readingTimeMinutes: 7,
    publishedAt: "2026-10-03",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Techniciens pose et conduits",
    coverImageAlt: "Insert à pellets encastré dans une ancienne cheminée ouverte",
    sections: [
      {
        heading: "Pourquoi un feu ouvert chauffe si peu",
        paragraphs: [
          "Une cheminée ouverte aspire l'air chaud de la pièce pour nourrir sa flamme et en renvoie la plus grande part dans le conduit. Vous avez chaud au visage, froid dans le dos, et la maison se refroidit pendant que le feu brûle. C'est le charme du feu de bois, pas un chauffage.",
          "Un insert à pellets ferme le foyer et règle sa combustion. Les modèles que nous posons annoncent entre 89 et 92 % de rendement, et ils se programment comme un poêle : allumage à 6 h, extinction à 23 h, consigne de température, souvent depuis le smartphone.",
        ],
      },
      {
        heading: "Les quatre vérifications avant de commander",
        paragraphs: [
          "C'est ce qu'on regarde à la visite technique, dans cet ordre.",
        ],
        list: {
          ordered: true,
          items: [
            "Les dimensions du foyer. Un insert compact comme l'EK63 Pellek 80 ou l'Edilkamin Pellkamin 8 Evo mesure 73,5 cm de large pour 49 cm de haut et 49 cm de profondeur : le foyer doit offrir un peu plus, pour le glisser et le raccorder. Le Pellkamin 12++ Evo, plus puissant, monte à 93 cm de large. On mesure le foyer et la hotte, pas seulement l'ouverture.",
            "Le conduit. Un insert à pellets pousse ses fumées avec un ventilateur : le conduit travaille en légère pression et doit être étanche. Le vieux conduit maçonné d'une cheminée ouverte ne l'est presque jamais, d'où un tubage inox de 80 mm, ou de 100 mm selon la hauteur et le modèle, jusqu'en haut de la souche.",
            "L'électricité. Comme tout appareil à pellets, l'insert a besoin d'une prise 230 V pour sa bougie d'allumage, sa vis sans fin et ses ventilateurs. Pendant une coupure de courant, il s'arrête en sécurité.",
            "La hotte et l'air. L'espace autour de l'insert doit être ventilé comme le prévoit la notice, avec des grilles d'entrée et de sortie, sinon la chaleur reste piégée dans la maçonnerie au lieu de chauffer la pièce. Et le foyer doit recevoir son air de combustion.",
          ],
        },
      },
      {
        heading: "Le vrai défaut : un petit réservoir",
        paragraphs: [
          "C'est le point qu'on explique toujours avant de vendre un insert. Pour tenir dans un foyer, le réservoir est petit : 11 kg sur le Pellek 80 et sur le Pellkamin 8 Evo. Edilkamin annonce de 6 à 16 heures d'autonomie pour ce dernier, selon la puissance. En plein hiver, vous remplissez donc chaque jour.",
          "Le remplissage dépend de l'option choisie. Le Pellkamin 8 Evo se sort sur ses glissières pour être rempli, ou reçoit en option un tiroir de chargement frontal ou une trappe. EK63 propose aussi un tiroir frontal pour ses Pellek, qui permet de recharger l'insert allumé. Ça se décide à la commande, et ça change le quotidien.",
        ],
      },
      {
        heading: "Chauffer une deuxième pièce, ou brûler du bois",
        paragraphs: [
          "Certains inserts envoient une partie de l'air chaud vers une pièce voisine par une gaine : c'est le cas des Edilkamin Pellkamin 10+ et 12++ et de l'EK63 Pellek 110+. Pratique quand la cheminée est dans le séjour et qu'une chambre ou un bureau reste froid derrière le mur.",
          "Si vous tenez au feu de bois de temps en temps, Girolami fait des foyers hybrides qui acceptent les bûches et les pellets, comme la gamme Grid. Ils sont plus encombrants qu'un insert compact : on regarde ensemble si votre cheminée peut les accueillir.",
        ],
      },
      {
        heading: "Ce que coûte la transformation",
        paragraphs: [
          "Le prix se joue sur l'insert et sur le conduit. Six mètres de tubage sont compris dans notre forfait de pose avec tubage, chaque mètre au-delà se paie. Dans un logement de plus de 10 ans, toute la facture est à 6 % de TVA quand nous fournissons et posons l'insert.",
          "Pour un chiffre précis, le configurateur en ligne compose l'ensemble en deux minutes : l'insert du catalogue, la pose, le tubage et la TVA. Le prix ferme vient après la visite technique, parce qu'on ne connaît vraiment un conduit qu'après l'avoir vu de près.",
        ],
        callout: {
          variant: "warning",
          text: "Un insert à bois et un insert à pellets ne se raccordent pas de la même façon. Si votre cheminée a déjà reçu un insert à bois, son conduit n'est pas forcément adapté au pellet : on le vérifie à la visite.",
        },
      },
    ],
    faqs: [
      {
        question: "Peut-on poser un insert à pellets dans n'importe quelle cheminée ?",
        answer:
          "Dans la plupart des cheminées ouvertes, oui, si le foyer est assez grand, si le conduit peut être tubé jusqu'en haut et si une prise électrique est accessible. Les cheminées très étroites ou au conduit dévoyé demandent plus de travail : la visite technique tranche.",
      },
      {
        question: "Faut-il obligatoirement tuber le conduit ?",
        answer:
          "Presque toujours. Un insert à pellets rejette ses fumées sous une légère pression, grâce à son ventilateur : le conduit doit être étanche. Un vieux conduit maçonné ne l'est pas, d'où le tubage inox de 80 ou 100 mm.",
      },
      {
        question: "Combien de temps tient le réservoir d'un insert ?",
        answer:
          "Sur les modèles compacts, 11 kg de pellets : de 6 heures à pleine puissance à 16 heures au ralenti, selon Edilkamin pour le Pellkamin 8 Evo. En plein hiver, on le remplit chaque jour.",
      },
      {
        question: "Un insert à pellets fonctionne-t-il sans électricité ?",
        answer:
          "Non. Bougie d'allumage, vis sans fin et ventilateurs ont besoin de courant. Pendant une coupure, l'insert s'éteint en sécurité et redémarre au retour du courant s'il était en mode automatique.",
      },
    ],
    related: {
      articles: ["dimensionner-poele-pellets-surface-wallonie", "budget-hiver-poele-pellets-consommation-2026"],
      guides: ["guide-achat-poele-pellets-wallonie", "poele-pellets-canalisable"],
      brands: ["edilkamin", "ek63", "girolami"],
    },
  },

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
      "Les trois marques qu'on met en avant sont toutes italiennes, mais elles ne visent pas le même besoin. Voici comment trancher selon votre maison et votre budget.",
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
          "On distribue cinq marques, mais on en met trois en avant : Edilkamin, EK63 et Girolami. Le point commun, c'est l'Italie. Toutes les trois conçoivent leurs poêles en Italie, avec le savoir-faire biomasse qui va avec.",
          "Le reste change. Edilkamin, c'est la référence historique, fondée en 1963 et installée à Lainate, près de Milan. EK63 est sa marque sœur, lancée pour proposer du connecté moderne à un prix plus doux. Girolami est une marque familiale fondée près de Rome en 1970, avec un brevet maison d'alimentation par le bas qui change le quotidien d'entretien.",
          "Aucune n'est meilleure dans l'absolu. La bonne, c'est celle qui colle à votre maison et à votre budget.",
        ],
      },
      {
        heading: "Edilkamin : la valeur sûre qui dure 20 ans",
        paragraphs: [
          "Edilkamin a plus de 60 ans. Son usine historique est à Gabbioneta Binanuova, près de Crémone, sa recherche à Lavagno, près de Vérone, et le groupe produit aussi en Hongrie, à Sárvár. C'est la marque qu'on recommande quand le critère numéro un, c'est la longévité.",
          "Sa technologie Leonardo ajuste en permanence l'air et le débit de pellets grâce à des sondes. La combustion reste stable même quand vous changez de marque de sacs ou quand l'humidité varie. Sur le terrain, les Edilkamin qu'on a posés tiennent couramment 15 à 20 ans.",
          "Le revers, c'est le prix catalogue : Edilkamin est dans le haut de la fourchette. Mais ramené à la durée de vie réelle, le coût annuel reste bas, et le SAV pièces reste disponible longtemps après l'arrêt d'un modèle.",
        ],
      },
      {
        heading: "EK63 : le connecté accessible",
        paragraphs: [
          "EK63 est la marque sœur d'Edilkamin. Elle reprend la plateforme industrielle et le SAV du groupe, mais sous une marque pensée pour un prix d'attaque plus doux. À puissance équivalente, on est typiquement 15 à 25 % en dessous d'un Edilkamin.",
          "Deux atouts concrets. D'abord le Wi-Fi Smart, intégré de série sur la majorité des modèles, sans abonnement : vous programmez et vous allumez votre poêle depuis votre smartphone. Ensuite l'étanchéité : la plupart des EK63 prennent l'air comburant à l'extérieur, ce qui les rend compatibles avec les maisons à VMC double flux, BBC et passives.",
          "C'est le bon choix quand vous voulez un poêle moderne et connecté sans viser le ticket premium.",
        ],
      },
      {
        heading: "Girolami : le polycombustible qui se nettoie tout seul",
        paragraphs: [
          "Girolami est une marque familiale italienne, fabriquée à Sant'Oreste près de Rome depuis 1970. Sa signature, c'est le brevet Source Feeding : le pellet est poussé par le bas du brasier au lieu de tomber dessus, et les cendres sont chassées dans un bac sous le foyer.",
          "Concrètement, le brasier reste propre seul. Vous ne grattez plus tous les jours, vous videz le cendrier une fois par semaine. Pour les utilisateurs qui en ont assez du nettoyage quotidien, ça change vraiment le quotidien.",
          "L'autre force de Girolami, c'est l'hybride bois-pellet sur la gamme Soft. Une sonde reconnaît le combustible chargé et bascule seule entre pellet et bûche. Vous allumez au pellet le matin, vous finissez la soirée à la bûche, sans toucher au menu.",
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
        heading: "Comment choisir selon votre profil",
        paragraphs: [
          "En pratique, tout se joue sur votre besoin principal.",
        ],
        list: {
          items: [
            "Vous voulez une marque qui a fait ses preuves et qui dure : Edilkamin, 60 ans d'historique et une durée de vie observée de 15 à 20 ans.",
            "Vous voulez un poêle connecté sans payer le surcoût premium : EK63, Wi-Fi de série, étanche, 15 à 25 % moins cher qu'un Edilkamin équivalent.",
            "Vous voulez pellet et bois dans la même machine, sans nettoyage quotidien : Girolami, brevet auto-nettoyant et bascule automatique des combustibles.",
          ],
        },
        callout: {
          variant: "info",
          text: "Le plus simple reste le diagnostic à domicile. On regarde votre maison, votre PEB, votre conduit et votre usage, et on vous dit franchement quelle marque et quelle puissance sont les bonnes. C'est gratuit et sans engagement.",
        },
      },
    ],
    faqs: [
      {
        question: "Ces trois marques sont-elles vraiment toutes italiennes ?",
        answer:
          "Oui. Edilkamin a son siège près de Milan depuis 1963, Girolami est installée à Sant'Oreste, près de Rome, depuis 1970, et EK63 est la marque sœur d'Edilkamin. Précision utile : Edilkamin produit aussi dans son usine de Sárvár, en Hongrie.",
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
          "Visez un modèle hydro, qui se raccorde au circuit de chauffage central. Les trois marques en proposent : Edilkamin (Cherie H, Blade H), EK63 (Spot 100 H, Monday H 190 et 230) et Girolami (gamme Soft hydro, chaudière Biotec).",
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
      "Leonardo, le système d'autorégulation d'Edilkamin : pression du foyer et température des fumées, correction continue de l'air et des pellets. Ce que ça change au quotidien.",
    excerpt:
      "Leonardo, c'est le système qui règle la combustion à votre place. On explique comment il marche et ce qu'il change concrètement chez vous.",
    tldr:
      "Leonardo est le système d'autorégulation de combustion d'Edilkamin. Un capteur mesure en continu la pression dans le foyer, une sonde la température des fumées, et le poêle corrige seul le débit de pellets et d'air. Résultat : la flamme reste optimale même si vous changez de marque de pellets, même quand l'humidité ou la température varient. Vous n'avez rien à régler dans le menu. Leonardo est intégré aux modèles Edilkamin qui en sont équipés, ce n'est pas une option payante.",
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
          "Leonardo est le système d'autorégulation d'Edilkamin. Plutôt que de vous demander d'ajuster des paramètres dans un menu, le poêle ajuste lui-même la combustion, en continu, pendant qu'il tourne.",
          "C'est une des raisons pour lesquelles on recommande Edilkamin quand un client cherche un poêle qu'on installe et qu'on oublie. Vous allumez, et le poêle se débrouille pour garder une combustion propre.",
        ],
      },
      {
        heading: "Des sondes qui mesurent, un poêle qui corrige",
        paragraphs: [
          "Leonardo s'appuie sur deux capteurs : l'un mesure la pression dans la chambre de combustion, l'autre la température des fumées. Le poêle lit en permanence comment la combustion se déroule, et Edilkamin précise qu'il reconnaît aussi le type de pellet pour ajuster le débit.",
          "À partir de ces mesures, il corrige deux choses : le débit de pellets envoyé par la vis sans fin, et le débit d'air du ventilateur. La flamme reste dans sa zone idéale, sans intervention de votre part.",
        ],
      },
      {
        heading: "Ce que ça change concrètement",
        paragraphs: [
          "Concrètement, Leonardo travaille pour vous dans plusieurs situations courantes.",
        ],
        list: {
          items: [
            "Vous changez de marque de pellets : longueur, taux de cendres et densité varient d'un sac à l'autre, le poêle se recale seul.",
            "L'humidité de la pièce change au fil de la saison : la combustion reste stable.",
            "Il fait très froid dehors et le tirage du conduit se modifie : Leonardo compense.",
          ],
        },
        callout: {
          variant: "info",
          text: "Vous n'avez rien à toucher dans le menu. C'est tout l'intérêt : la combustion reste optimale sans que vous deveniez technicien de votre propre poêle.",
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
          "Leonardo n'est pas une option à cocher : il est intégré aux modèles Edilkamin qui en sont équipés. Le tarif Edilkamin est premium, et l'autorégulation fait partie de ce que vous payez.",
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
          "Si. Le ramonage et l'entretien annuel restent indispensables. Leonardo optimise la combustion, il ne remplace pas l'entretien mécanique.",
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
      "Sur EK63, le Wi-Fi n'est ni une option ni un abonnement. Voici ce que ça change concrètement quand vous pilotez votre poêle depuis votre smartphone.",
    tldr:
      "La majorité des poêles EK63 intègrent le Wi-Fi Smart d'usine, sans abonnement. Vous pilotez l'allumage, la programmation horaire, la puissance et le suivi de consommation depuis votre smartphone. Le mot important, c'est de série : pas de module à acheter, pas de gamme haute à viser. Combiné à l'étanchéité de la plupart des modèles EK63, c'est le profil idéal d'une maison wallonne récente.",
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
        heading: "Ce que vous pilotez depuis votre smartphone",
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
          "Le dimanche soir, vous programmez votre semaine en deux minutes. Vous lancez le poêle depuis le bureau pour rentrer dans un séjour déjà chaud. Et quand vous partez en week-end, un coup d'oeil sur l'app suffit pour vérifier que tout est bien coupé.",
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
          "Le Wi-Fi n'est pas le seul atout d'EK63. La plupart des modèles sont étanches : ils prennent l'air comburant directement à l'extérieur et n'aspirent pas l'air chaud de votre pièce.",
          "Connecté plus étanche, c'est le profil idéal des maisons récentes wallonnes, à VMC double flux, BBC ou passives. Vous pilotez facilement, et le poêle respecte l'équilibre d'air de la maison.",
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
          "L'application gère la programmation horaire et la puissance. Selon le modèle, un thermostat d'ambiance peut aussi être ajouté. On en parle lors du devis selon votre configuration.",
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
      "Source Feeding est le brevet d'alimentation par le bas de Girolami. Au lieu de tomber sur le brasier, le pellet est poussé sous le brasier, et les cendres sont chassées vers un bac de collecte sous le foyer. Concrètement, le brasier reste propre tout seul : vous ne grattez plus tous les jours, vous videz le cendrier environ une fois par semaine. L'entretien annuel, lui, reste nécessaire.",
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
          "Le changement est net au quotidien : vous ne grattez plus le brasier chaque jour. Reste à vider le bac à cendres, environ une fois par semaine selon votre utilisation.",
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
          "On conseille quand même des pellets certifiés ENplus A1 : un bon combustible reste le meilleur allié de votre poêle, quel que soit le système d'alimentation.",
        ],
      },
      {
        heading: "Quels modèles Girolami profitent du Source Feeding",
        paragraphs: [
          "Le Source Feeding est la signature de Girolami, présente sur la gamme. La Soft, hybride bois-pellet hydro, primée au Good Design Award 2022, en est la vitrine. Les modèles Vert, Flow et Curvy l'embarquent aussi, chacun avec son style.",
          "Sur la gamme hybride, Source Feeding se combine au Fuel Convert System, qui bascule automatiquement entre pellet et bois selon le combustible chargé.",
        ],
      },
    ],
    faqs: [
      {
        question: "Le brasier ne se nettoie vraiment jamais à la main ?",
        answer:
          "Le brasier reste propre seul au quotidien grâce au Source Feeding. Vous videz le bac à cendres environ une fois par semaine, et l'entretien annuel complet par un professionnel reste nécessaire.",
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
    title: "Pellet ou bûche ? Avec un Girolami hybride, vous prenez les deux",
    metaTitle: "Girolami hybride bois-pellet : le Fuel Convert System",
    metaDescription:
      "Le Girolami hybride bascule seul entre pellet et bûche grâce au Fuel Convert System. Plus de choix à faire entre les deux combustibles. Explications.",
    excerpt:
      "Choisir entre le pellet et la bûche, c'est un faux dilemme avec un Girolami hybride. Le poêle reconnaît le combustible et s'adapte tout seul.",
    tldr:
      "Les Girolami hybrides, la Soft en tête, fonctionnent au pellet comme à la bûche. Le Fuel Convert System utilise une sonde qui reconnaît le combustible chargé et bascule automatiquement entre les modes, sans aucun réglage manuel. Vous allumez au pellet le matin pour la programmation, vous finissez la soirée à la bûche pour l'ambiance. Le système accepte aussi certains broyés certifiés, comme les coques ou les noyaux, parfois avec un accessoire.",
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
          "Quand on choisit un poêle, on tranche en général entre deux mondes. Le pellet, c'est l'autonomie et la programmation : vous remplissez le réservoir, vous programmez, le poêle gère. La bûche, c'est l'ambiance, le geste, et un combustible parfois moins cher si vous avez une source de bois.",
          "Le Girolami hybride supprime ce choix. Vous n'avez pas à décider une fois pour toutes : vous utilisez l'un ou l'autre selon le moment, dans la même machine.",
        ],
      },
      {
        heading: "Le Fuel Convert System reconnaît le combustible",
        paragraphs: [
          "Le coeur de l'hybride Girolami, c'est le Fuel Convert System. Une sonde détecte ce que vous avez chargé dans le poêle : du pellet, des bûches, ou des combustibles broyés.",
          "À partir de cette lecture, le poêle bascule seul vers le bon mode de combustion. Aucun menu à ouvrir, rien à régler : il s'occupe du reste.",
        ],
      },
      {
        heading: "Une journée type avec un Girolami hybride",
        paragraphs: [
          "Le matin, le poêle s'allume tout seul en mode pellet, à l'heure que vous avez programmée. La maison est déjà chaude quand vous vous levez.",
          "Le soir, vous avez envie d'une vraie flambée. Vous chargez des bûches, le poêle passe en mode bois, et vous profitez de la flamme. Le lendemain, retour au pellet pour la programmation. Sans rien régler entre les deux.",
        ],
        callout: {
          variant: "info",
          text: "Un hybride peut aussi fonctionner uniquement au pellet si vous le souhaitez. Le bois reste une possibilité, pas une obligation.",
        },
      },
      {
        heading: "Au-delà du bois : les combustibles broyés",
        paragraphs: [
          "Le Fuel Convert System ne se limite pas au pellet et à la bûche. Il accepte aussi des combustibles broyés certifiés, comme des coques, des noyaux ou des plaquettes, avec parfois un accessoire à ajouter.",
          "C'est un atout si vous avez accès à ce type de ressource. Le poêle adapte sa combustion à ce que vous lui donnez, dans la limite des combustibles prévus par le constructeur.",
        ],
      },
      {
        heading: "Quels modèles Girolami sont hybrides",
        paragraphs: [
          "L'hybride se trouve surtout sur la gamme Soft, primée au Good Design Award 2022, un thermopoêle qui alimente le chauffage central.",
          "Girolami décline aussi l'hybride en thermocheminées, en chaudières et en foyers. La Vert, elle, fonctionne au pellet seul : c'est le canalisable de la marque. On dimensionne le bon modèle ensemble lors du diagnostic à domicile.",
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
          "On utilise l'un puis l'autre, pas les deux simultanément. Le poêle fonctionne avec le combustible que vous avez chargé et bascule au chargement suivant.",
      },
      {
        question: "Un poêle hybride est-il plus cher qu'un poêle pellet simple ?",
        answer:
          "Un hybride embarque plus de technologie qu'un poêle pellet classique, ce qui se ressent au tarif. En contrepartie, vous n'êtes jamais bloqué sur un seul combustible. On chiffre le modèle adapté à votre besoin lors du devis.",
      },
      {
        question: "L'hybride fonctionne-t-il si je n'utilise que du pellet ?",
        answer:
          "Oui. Vous pouvez très bien n'utiliser que le pellet et garder le bois comme option pour les soirées où vous en avez envie.",
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
      "En maison basse consommation, un poêle étanche n'est pas une option. Voici comment choisir le bon modèle EK63 selon votre maison.",
    tldr:
      "Dans une maison passive, BBC ou à VMC double flux, le poêle doit être étanche : il prélève l'air comburant directement à l'extérieur et n'aspire pas l'air chaud de la pièce. La majorité des modèles EK63 sont étanches. Sur une petite pièce, un Like 80 ou un Zone 80 suffit (environ 7,6 kW) ; pour des volumes moyens à grands, on passe au Tweed 90+, au Spy 110+ ou au Daily 130++. L'Entity 90+ ultra-fin, lui, est pensé pour les couloirs.",
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
        heading: "Pourquoi un poêle étanche s'impose en maison BBC",
        paragraphs: [
          "Une maison passive ou BBC est conçue pour être très étanche à l'air, avec une ventilation mécanique contrôlée, souvent en double flux. L'air entre et sort par un circuit maîtrisé.",
          "Un poêle classique, lui, aspire l'air de la pièce pour sa combustion. Dans une maison étanche, ça déséquilibre la ventilation et ça peut créer une dépression. C'est pour ça qu'un poêle étanche est nécessaire : il ne touche pas à l'air intérieur.",
        ],
      },
      {
        heading: "Comment fonctionne un poêle étanche EK63",
        paragraphs: [
          "Un EK63 étanche prélève l'air comburant directement à l'extérieur, via une prise d'air dédiée. La combustion se fait en circuit fermé : l'air entre du dehors, les fumées repartent dehors.",
          "Conséquence concrète : le poêle ne consomme pas l'air chaud que vous avez payé pour chauffer, et il ne perturbe pas la VMC. C'est ce qui le rend compatible avec les maisons à VMC double flux, BBC et passives.",
        ],
      },
      {
        heading: "Quel EK63 selon la taille de votre maison",
        paragraphs: [
          "La gamme EK63 couvre du petit appartement à la maison à étage. Le tableau ci-dessous donne les repères de puissance modèle par modèle.",
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
          "En plus de l'étanchéité, la majorité des EK63 intègrent le Wi-Fi Smart de série, sans abonnement. Vous programmez et vous pilotez le poêle depuis votre smartphone.",
          "Dans une maison récente, bien isolée, où le poêle tourne souvent en douceur, cette programmation fine est un vrai confort au quotidien.",
        ],
      },
      {
        heading: "Ce qu'on vérifie à la visite technique",
        paragraphs: [
          "Avant de poser un EK63 étanche, on contrôle le tracé de la prise d'air et de l'évacuation des fumées, souvent en ventouse pour ce type de maison. On valide aussi l'emplacement et la compatibilité avec votre VMC.",
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
          "Oui. Plusieurs EK63 sont à la fois étanches et canalisables, comme le Tweed 90+, le Spy 110+, le Daily 130++ et l'Entity 90+. Vous chauffez une pièce voisine tout en respectant l'étanchéité.",
      },
      {
        question: "Faut-il une sortie en toiture ou une ventouse ?",
        answer:
          "Les deux sont possibles selon votre maison. En maison BBC ou passive, la ventouse est fréquente. On valide le tracé à la visite technique.",
      },
      {
        question: "L'étanchéité change-t-elle l'entretien du poêle ?",
        answer:
          "Non. L'entretien annuel et le ramonage restent les mêmes, qu'un poêle soit étanche ou non.",
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
      "Un poêle Edilkamin hydro se raccorde à vos radiateurs comme une chaudière. Principe, modèles, ballon tampon, eau chaude sanitaire et aides en 2026.",
    excerpt:
      "Un poêle hydro chauffe toute la maison via vos radiateurs existants. Voici comment il remplace une vieille chaudière mazout.",
    tldr:
      "Un poêle Edilkamin hydro se raccorde au circuit de chauffage central et alimente vos radiateurs ou votre plancher chauffant, exactement comme une chaudière. Couplé à un ballon tampon, il peut aussi produire l'eau chaude sanitaire. Les modèles comme la gamme Cherie H ou Blade H sont conçus pour ça. C'est une solution adaptée pour remplacer une chaudière mazout vieillissante. La prime Habitation a pris fin le 30 septembre 2026 ; restent la TVA à 6 % et, pour une maison classée E, F ou G rénovée plus largement, le Rénopack.",
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
          "Beaucoup de maisons wallonnes en sont encore équipées, et le calendrier se resserre : à partir du 1er janvier 2031, on ne pourra plus installer ni remplacer une chaudière au mazout dans une maison existante en Wallonie. Passer au pellet, c'est un combustible produit en Belgique, dont le prix ne suit pas celui du pétrole.",
        ],
      },
      {
        heading: "Le principe du poêle hydro",
        paragraphs: [
          "Un poêle hydro n'est pas qu'un poêle qui chauffe une pièce. Il chauffe l'eau d'un circuit, et cette eau circule dans vos radiateurs ou votre plancher chauffant. Côté résultat, c'est le même rôle qu'une chaudière.",
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
          "Avec un ballon adapté, l'installation peut aussi produire l'eau chaude sanitaire. Vous remplacez alors le chauffage et l'eau chaude de l'ancienne chaudière en une seule solution.",
        ],
        callout: {
          variant: "success",
          text: "La prime Habitation qui couvrait ce remplacement s'est arrêtée le 30 septembre 2026. Si votre maison est classée E, F ou G et que vous la rénovez plus largement, le Rénopack peut financer l'hydro avec le reste des travaux. Sinon, comptez sur la TVA à 6 %.",
        },
      },
      {
        heading: "Ce que comprend le remplacement",
        paragraphs: [
          "Un remplacement de chaudière mazout par un hydro, ce n'est pas juste poser un poêle. Il faut déposer l'ancienne chaudière, se raccorder au circuit existant, puis prévoir le ballon tampon et le conduit d'évacuation.",
          "On chiffre tout ça lors du diagnostic à domicile. Le devis détaille chaque poste pour que vous sachiez exactement ce que vous payez, TVA comprise.",
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
          "Plus de prime régionale depuis le 1er octobre 2026. Le Rénopack peut financer le remplacement si la maison est classée E, F ou G et que l'ensemble des travaux la fait monter de label, avec un audit préalable. Dans tous les cas, la TVA est à 6 % dans un logement de plus de 10 ans.",
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
          "Résultat courant : la pièce où se trouve le poêle surchauffe, pendant que la chambre la plus éloignée reste trop fraîche. Vous vous retrouvez à ouvrir une fenêtre d'un côté et à mettre un pull de l'autre.",
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
          "Pour que le système soit vraiment intelligent, Girolami propose les thermostats sans fil TriKey en option. Vous en placez un dans chaque pièce desservie.",
          "Chaque thermostat mesure la température réelle de sa pièce et communique avec le poêle. Le ventilateur correspondant ajuste son débit pour atteindre la consigne de cette pièce, pas une moyenne approximative.",
        ],
        callout: {
          variant: "info",
          text: "Concrètement, vous pouvez viser 21 °C dans le séjour et 19 °C dans une chambre, et le poêle gère les deux en même temps.",
        },
      },
      {
        heading: "Quelle maison pour un Girolami canalisable",
        paragraphs: [
          "Le canalisable intelligent prend tout son sens dans une maison ouverte où le poêle est dans le séjour, avec une ou deux pièces à chauffer en plus, par exemple une chambre à l'étage ou un bureau.",
          "La gamme Vert de Girolami couvre ce besoin, au pellet, en 9, 12 ou 14 kW. On valide le tracé des gaines et la puissance utile lors du diagnostic.",
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
          "Oui. Comme les ventilateurs sont indépendants, vous pouvez moduler ou arrêter la diffusion vers une pièce qui n'a pas besoin d'être chauffée à un moment donné.",
      },
      {
        question: "Le canalisable Girolami est-il aussi hybride ?",
        answer:
          "Non. La Vert fonctionne au pellet seul. Pour brûler du bois et des pellets dans la même machine, il faut passer sur un hybride de la marque, comme la Soft, qui alimente le chauffage central.",
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
      "Un poêle Edilkamin entretenu correctement dure couramment 15 à 20 ans, ce qu'on observe sur le parc qu'on suit en Wallonie. La longévité tient à la qualité de fabrication et surtout à l'entretien annuel : aucun poêle ne dure sans ramonage et révision. Les pièces d'usure restent disponibles longtemps grâce au réseau Edilkamin. Ramené à l'année, le tarif premium devient raisonnable.",
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
          "Edilkamin produit dans son usine historique de Gabbioneta Binanuova, près de Crémone, et dans son usine de Sárvár, en Hongrie, avec un laboratoire de recherche à Lavagno, près de Vérone. Les foyers sont conçus pour encaisser les cycles de chauffe pendant des années.",
          "Une fabrication maîtrisée, ça se voit dans le temps : moins de jeu mécanique, des assemblages qui tiennent, une structure qui ne fatigue pas prématurément.",
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
          "Comme tout appareil, un poêle a des pièces d'usure. Les plus courantes suivent chacune leur propre logique de remplacement.",
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
          "Un poêle premium qui dure 18 ans revient, à l'année, moins cher qu'un poêle d'entrée de gamme qu'il faut remplacer après 8 ans. Sans compter le confort d'un appareil qui ne vous lâche pas en plein hiver.",
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
          "Ce format ultra-fin a été pensé pour les espaces contraints, le genre d'emplacement qu'on rencontre souvent en Wallonie.",
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
          "Vous profitez donc du format ultra-fin sans renoncer au pilotage smartphone ni à la compatibilité maison récente.",
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
      "La règle simple, 1 kW pour 10 m², ne suffit pas. Voici le calcul exact selon votre PEB, votre plafond et votre zone climatique en Wallonie.",
    tldr:
      "Pour une maison wallonne PEB B de 100 m² avec hauteur sous plafond standard (2,50 m), un poêle de 8 à 10 kW suffit. Le calcul tient en un coefficient appliqué à la surface : 0,10 quand la PEB est bonne (A-B), 0,12 pour une isolation moyenne (C-D), jusqu'à 0,15 si elle est faible (E-G). Ajoutez 10 % par mètre au-dessus de 2,50 m de plafond. Sous-dimensionner brûle le matériel ; sur-dimensionner provoque encrassement et inconfort.",
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
          "Multipliez la surface en m² par le coefficient correspondant à votre PEB pour obtenir la puissance cible en kW. C'est volontairement simplifié : sur du résidentiel wallon classique, cette méthode donne un résultat à ±15 % de la charge thermique réelle.",
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
          "Le calcul standard suppose 2,50 m sous plafond. Si vous avez 3 m (rénovations dans des fermettes, lofts, vieux corps de logis namurois), vous devez ajouter 10 % de puissance par 25 cm supplémentaires. Un volume plus grand, c'est plus d'air à brasser et à maintenir en température.",
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
          "Prenons une maison 4 façades de 1985 à Bouge (Namur), classée D, avec 130 m² chauffés, 2,55 m sous plafond et un conduit déjà tubé.",
          "Calcul : 130 × 0,12 = 15,6 kW. La correction de plafond est négligeable, on cible 13 à 16 kW. Si le séjour s'ouvre sur l'escalier, un canalisable de 12 à 13 kW (EK63 Monday 130++ ou Edilkamin Vyda 13++ Evo) avec des gaines vers deux chambres fait le travail ; sinon, on regarde du côté d'un hydro raccordé aux radiateurs. Budget d'un canalisable posé sur conduit existant : 5 500 à 7 500 € TVAC, TVA à 6 % comprise.",
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
          "Pour 100 m² en Wallonie, visez 7-8 kW si la maison est très bien isolée (PEB A), 10 kW pour une PEB B, 12 kW pour une PEB C-D, et 13-15 kW pour une PEB E-F. Ajoutez 10 % par 25 cm de plafond au-dessus de 2,50 m.",
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
      articles: ["pellets-enplus-a1-vs-dinplus", "remplacer-chaudiere-mazout-poele-hydro", "budget-hiver-poele-pellets-consommation-2026"],
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
      "ENplus A1 et DINplus imposent les mêmes seuils : au moins 4,6 kWh/kg, 0,7 % de cendres au maximum. Comment lire un sac, le prix en Wallonie et le stockage.",
    excerpt:
      "ENplus A1 et DINplus sont les deux certifications sérieuses, et elles disent la même chose. Voici comment lire un sac, ce qu'il coûte en Wallonie et comment le stocker.",
    tldr:
      "ENplus A1 et DINplus imposent les mêmes seuils de qualité : au moins 4,6 kWh/kg, 0,7 % de cendres et 10 % d'humidité au maximum, 6 mm de diamètre à 1 mm près. ENplus est la plus répandue en Belgique. Refusez tout sac sans certification visible : un pellet douteux chauffe moins, encrasse plus vite, et personne ne vous dira ce qu'il contient. En août 2026, ValBiom relevait 6,19 € en moyenne le sac de 15 kg en Wallonie.",
    category: "pellets",
    tags: ["pellets", "ENplus", "DINplus", "qualité", "combustible"],
    readingTimeMinutes: 7,
    publishedAt: "2026-03-22",
    modifiedAt: "2026-10-03",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Conseillers combustible",
    coverImageAlt: "Sac de pellets certifiés ENplus A1 à côté d'un sac DINplus",
    sections: [
      {
        heading: "Les deux certifications qui comptent vraiment",
        paragraphs: [
          "Sur le marché belge, deux labels garantissent la qualité d'un sac de pellets : ENplus, géré depuis Bruxelles par Bioenergy Europe, et DINplus, le label allemand de DIN CERTCO. Tous deux reprennent la classe A1 de la norme ISO 17225-2 et contrôlent le diamètre, la longueur, la solidité, les cendres, l'humidité et le pouvoir calorifique.",
          "Leurs cahiers des charges fixent aujourd'hui les mêmes seuils : au moins 4,6 kWh par kilo, 0,7 % de cendres et 10 % d'humidité au maximum. ENplus a aussi une classe A2, jusqu'à 1,2 % de cendres, plutôt vendue pour les chaudières : pour un poêle, restez en A1.",
        ],
        table: {
          headers: ["Critère", "ENplus A1", "DINplus", "Sac non certifié"],
          rows: [
            ["Pouvoir calorifique", "≥ 4,6 kWh/kg", "≥ 4,6 kWh/kg", "Non garanti"],
            ["Cendres", "≤ 0,7 %", "≤ 0,7 %", "Non garanti"],
            ["Humidité", "≤ 10 %", "≤ 10 %", "Non garanti"],
            ["Diamètre", "6 ou 8 mm, ± 1 mm", "6 ou 8 mm, ± 1 mm", "Variable"],
            ["Longueur", "3,15 à 40 mm", "3,15 à 40 mm", "Variable"],
            ["Durabilité mécanique", "≥ 98 %", "≥ 98 %", "Non garantie"],
          ],
          caption: "Seuils des cahiers des charges ENplus A1 et DINplus (DIN CERTCO, édition 02-2025). Un sac non certifié n'offre aucune garantie.",
        },
      },
      {
        heading: "Pourquoi un pellet bon marché finit par coûter cher",
        paragraphs: [
          "Un sac à 4,50 € à côté d'un ENplus A1 à 6,20 €, la différence se voit sur le ticket. Elle fond dans le poêle : un pellet non certifié peut livrer nettement moins que les 4,6 kWh garantis par kilo, et vous en brûlez davantage pour la même chaleur.",
          "Le vrai coût est ailleurs. Plus de cendres, c'est un creuset qui se bouche plus vite, un échangeur qui s'encrasse et des extinctions en pleine chauffe. Et les fabricants demandent des pellets conformes : les dégâts causés par un combustible hors norme ne sont en général pas couverts par leur garantie.",
        ],
        callout: {
          variant: "warning",
          text: "Si le sac n'affiche ni le logo ENplus A1 avec son numéro d'identification, ni le logo DINplus avec son numéro de certificat, ne l'achetez pas. Le site enplus-pellets.eu liste les producteurs et distributeurs certifiés, pays par pays.",
        },
      },
      {
        heading: "Combien coûte un sac en 2026 et comment le stocker",
        paragraphs: [
          "En août 2026, ValBiom relevait en moyenne 6,19 € le sac de 15 kg en Wallonie, pour des pellets certifiés achetés par palette (66 sacs, 990 kg), livraison non comprise. C'est environ 413 € la tonne, et 13 % de plus qu'un an plus tôt. Le sac acheté à l'unité coûte plus cher.",
          "Pour le stockage, une seule règle : au sec. C'est l'humidité qui abîme les pellets, pas le froid. Une palette tient sur moins d'un mètre carré ; posez-la dans un garage ou un abri sain, jamais dans une cave humide, où le pellet reprend l'eau et perd son pouvoir calorifique.",
        ],
        list: {
          ordered: true,
          items: [
            "Achetez au printemps ou en été : en 2025, le sac valait 5,43 € en juin, contre 5,99 € en janvier suivant (relevés ValBiom).",
            "Fermez les sacs entamés, ou videz-les en entier dans le réservoir.",
            "Fiez-vous à la certification plutôt qu'au pays affiché : le numéro du sac remonte jusqu'au producteur.",
          ],
        },
      },
      {
        heading: "Quelle marque de pellets choisir ?",
        paragraphs: [
          "Mister Pellets ne vend pas de pellets et ne touche rien sur leur vente, alors on vous le dit simplement : prenez un sac certifié A1, chez un revendeur qui stocke à l'abri.",
          "Ensuite, si votre poêle tourne bien avec une marque, gardez-la. À chaque changement de lot, la combustion se recale. Les poêles autorégulés, comme les Edilkamin équipés de Leonardo, encaissent mieux ces écarts, mais un poêle qui brûle toujours le même pellet reste plus régulier.",
        ],
      },
      {
        heading: "La règle simple à retenir",
        paragraphs: [
          "Logo ENplus A1 ou DINplus visible avec son numéro, prix cohérent avec le marché (autour de 6 € le sac de 15 kg à la palette en 2026), revendeur établi : vous êtes à l'abri d'une mauvaise surprise. Le reste, c'est jouer avec votre matériel.",
        ],
      },
    ],
    faqs: [
      {
        question: "Faut-il choisir ENplus A1 plutôt que DINplus ?",
        answer:
          "Non, les deux se valent pour un poêle domestique : mêmes seuils de pouvoir calorifique, de cendres et d'humidité. ENplus est plus répandue dans les enseignes wallonnes. Choisissez selon la disponibilité et le prix.",
      },
      {
        question: "Combien de pellets faut-il par an pour chauffer une maison wallonne ?",
        answer:
          "Pour une maison PEB B-C de 120 m² avec un poêle de 10 kW en chauffage principal, comptez 1,5 à 2 tonnes par saison de chauffe (octobre à avril). En appoint sur les 3 mois d'hiver, plutôt 600 à 900 kg.",
      },
      {
        question: "Peut-on stocker des pellets dans un garage non chauffé ?",
        answer:
          "Oui, s'il est sec et ventilé. Posez les sacs sur une palette en bois plutôt que sur le béton. Le froid ne les abîme pas, l'humidité si.",
      },
      {
        question: "Que faire d'un sac de pellets éventré qui a pris l'humidité ?",
        answer:
          "Si les pellets restent durs et brillants, utilisez-les rapidement. S'ils sont gonflés, friables ou s'ils sentent le moisi, ne les mettez pas dans le poêle : ils bloqueraient la vis sans fin et encrasseraient le creuset.",
      },
    ],
    related: {
      articles: ["budget-hiver-poele-pellets-consommation-2026", "poele-pellets-eteint-tout-seul-causes"],
      guides: ["remettre-en-route-poele-pellets-automne", "comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "tournai"],
    },
  },

  // ───────────────────────────────────────────────────────────────────
  // 3. AIDES WALLONIE, réécrit le 03/10/2026 : la prime Habitation (régime
  //    temporaire 14/02/2025 → 30/09/2026) est terminée. Chiffres et liens :
  //    lib/aides.ts. Slug conservé pour les liens entrants et Google.
  // ───────────────────────────────────────────────────────────────────
  {
    slug: "primes-wallonie-2026-poele-pellets-combien-recuperer",
    title: "Prime poêle à pellets en Wallonie : ce qui reste après le 1er octobre 2026",
    metaTitle: "Prime poêle à pellets Wallonie : fin au 30/09/2026, ce qui reste",
    metaDescription:
      "La prime Habitation pour un poêle à pellets s'est arrêtée le 30 septembre 2026. Rénopack, Rénoprêt, TVA à 6 %, MEBAR : ce qui reste, et pour qui.",
    excerpt:
      "La prime a disparu le 30 septembre. Ce qui la remplace ne vise pas le même public : voici, sans détour, ce que vous pouvez encore obtenir pour un poêle.",
    tldr:
      "Il n'y a plus de prime régionale pour un poêle à pellets depuis le 1er octobre 2026. Le régime temporaire des primes Habitation s'est arrêté le 30 septembre, et la Wallonie aide désormais la rénovation par deux prêts : le Rénopack, à 0 % avec 15 à 50 % effacés selon les revenus, et le Rénoprêt. Ils sont réservés aux maisons classées E, F ou G qui gagnent au moins deux classes PEB après un audit. Pour un poêle posé seul, il reste la TVA à 6 % dans un logement de plus de 10 ans, et la subvention MEBAR pour les revenus modestes.",
    category: "primes",
    tags: ["aides", "Wallonie", "Rénopack", "Rénoprêt", "TVA 6 %", "MEBAR"],
    readingTimeMinutes: 8,
    publishedAt: "2026-02-10",
    modifiedAt: "2026-10-03",
    authorName: "Équipe Mister Pellets",
    authorRole: "Conseillers chauffage biomasse",
    coverImageAlt: "Récapitulatif des aides pour un poêle à pellets en Wallonie après la fin de la prime Habitation",
    sections: [
      {
        heading: "Ce qui s'est arrêté le 30 septembre 2026",
        paragraphs: [
          "Depuis le 14 février 2025, la Région wallonne appliquait un régime temporaire de primes Habitation, et le poêle à pellets en faisait partie. Ce régime s'est arrêté le 30 septembre 2026 à 23 h 59. Pour toucher la prime, les travaux devaient être terminés et la demande introduite avant cette heure-là.",
          "Une facture de septembre sans dossier déposé à temps ne donne donc plus rien. Si vous êtes dans ce cas, le 1718 vous dira si une exception vous concerne, mais il n'existe pas de rattrapage général.",
        ],
        callout: {
          variant: "info",
          text: "L'exception : les projets lancés avant le 14 février 2025, avec un devis daté et signé avant cette date. Le Gouvernement wallon a décidé le 24 septembre 2026 qu'ils pourraient encore demander la prime aux anciennes conditions jusqu'au 30 septembre 2027, sans l'acompte de 20 % exigé jusque-là. La mesure s'applique après sa publication au Moniteur belge.",
        },
      },
      {
        heading: "Ce qui la remplace : le Rénopack et le Rénoprêt",
        paragraphs: [
          "Depuis le 1er octobre 2026, la Wallonie ne verse plus de prime par poste de travaux. Elle finance des projets de rénovation par deux prêts, gérés par la Société wallonne du Crédit social (SWCS) et le Fonds du Logement de Wallonie.",
          "Le Rénopack est un prêt à 0 % dont une partie ne se rembourse pas. Il vise les catégories de revenus C1 à C3, propriétaires ou titulaires d'un autre droit réel, qui habiteront le logement au plus tard 24 mois après l'octroi. Le Rénoprêt, à taux zéro ou préférentiel, s'adresse à la catégorie C4, aux propriétaires bailleurs et aux copropriétés.",
        ],
        table: {
          headers: ["Catégorie", "Revenus du ménage", "Prêt", "Part non remboursée"],
          rows: [
            ["C1", "Jusqu'à 28 900 €", "Rénopack à 0 %", "50 %"],
            ["C2", "De 28 900 à 41 100 €", "Rénopack à 0 %", "40 %"],
            ["C3", "De 41 100 à 67 100 €", "Rénopack à 0 %", "15 %"],
            ["C4", "De 67 100 à 122 800 €", "Rénoprêt, taux zéro ou préférentiel", "Aucune"],
          ],
          caption: "Montants indexés au 1er janvier 2026, diminués de 5 000 € par personne à charge. Source : wallonie.be, mis à jour le 25 septembre 2026.",
        },
      },
      {
        heading: "Les conditions qui changent tout",
        paragraphs: [
          "Le prêt finance un projet complet. Voici ce qu'il exige.",
        ],
        list: {
          ordered: true,
          items: [
            "Une maison classée G ou F qui atteint au moins le label D après travaux, ou classée E qui atteint au moins le label C.",
            "Un audit logement réalisé ou actualisé moins d'un an avant la demande de prêt. C'est lui qui fixe le label de départ et la liste des travaux.",
            "Un emprunt sous 75 000 € pour une maison unifamiliale, 60 000 € par appartement.",
          ],
        },
        callout: {
          variant: "warning",
          text: "Une maison classée C ou D n'est pas visée, même si elle a besoin d'un nouveau chauffage. Des dérogations existent quand le label visé est impossible à atteindre pour des raisons techniques, fonctionnelles ou économiques.",
        },
      },
      {
        heading: "Le poêle à pellets peut-il entrer dans un Rénopack ?",
        paragraphs: [
          "Oui : la SWCS cite l'installation d'un poêle biomasse parmi les travaux qu'elle finance. Mais un poêle seul fait rarement gagner deux classes PEB à une maison. Le saut demande en général d'isoler le toit, les murs ou les châssis, et le chauffage vient compléter le projet.",
          "Si c'est votre cas, commencez par l'audit, puis la préinscription sur le site de la SWCS, qui ne vaut pas demande d'aide mais permet à leurs équipes de vous recontacter. Et parlez-nous de l'audit avant de choisir le poêle : une maison isolée perd moins de chaleur, la puissance doit correspondre à la maison après travaux. Un poêle calibré sur la maison d'avant tournerait au ralenti tout l'hiver.",
        ],
      },
      {
        heading: "La TVA à 6 %, l'aide de presque tous les chantiers",
        paragraphs: [
          "Elle est fédérale, et la réforme wallonne n'y change rien. Quand nous fournissons et posons le poêle dans un logement privé occupé depuis plus de 10 ans, toute la facture est à 6 % au lieu de 21 %, poêle compris. Sur 6 000 € hors TVA, l'écart fait 900 €.",
          "Il n'y a plus d'attestation à signer depuis le 1er juillet 2022 : la facture porte une mention légale, et vous avez un mois pour la contester par écrit si elle est fausse. Depuis le 29 juillet 2025, les appareils au gaz, au mazout ou au charbon sont repassés à 21 %. Les poêles qui brûlent uniquement du bois ou des pellets gardent le 6 %.",
        ],
      },
      {
        heading: "MEBAR et primes communales",
        paragraphs: [
          "Pour les revenus modestes, la subvention MEBAR reste ouverte. Elle vise les ménages dont les revenus ne dépassent pas le revenu d'intégration sociale majoré de 30 %, et finance jusqu'à 2 000 € de travaux qui font baisser la facture d'énergie, dont l'installation d'un poêle. La demande passe par le CPAS de la commune, avant tout achat.",
          "Certaines communes ont leur propre prime énergie. Beaucoup étaient calquées sur la prime régionale qui vient de disparaître : appelez votre commune avant d'en tenir compte dans votre budget.",
        ],
      },
      {
        heading: "Trois cas pour s'y retrouver",
        paragraphs: [
          "Prenons une maison de 1985 à Andenne, classée C, et un ménage en catégorie C2. Un canalisable EK63 posé sur conduit existant à 5 800 € hors TVA revient à 6 148 € TVAC avec la TVA à 6 %, au lieu de 7 018 € à 21 %. Pas de Rénopack : la maison n'est pas visée.",
          "Prenons une fermette de 1962 près de Ciney, classée F, et un ménage en catégorie C1. L'audit prévoit d'isoler la toiture et les murs, de changer les châssis et de remplacer la chaudière au mazout par un poêle hydro. Si l'ensemble fait passer la maison en D, le Rénopack peut financer tout le projet, poêle compris, et la moitié du prêt ne se rembourse pas.",
          "Prenons enfin une maison de 2002 à Wavre, classée D, avec des revenus au-delà de 122 800 €. Ni prime, ni Rénopack, ni Rénoprêt. Reste la TVA à 6 %, puisque la maison a plus de 10 ans.",
        ],
      },
      {
        heading: "Ce que Mister Pellets fait pour votre dossier",
        paragraphs: [
          "On vous remet un devis détaillé poste par poste, utile à l'auditeur comme à la SWCS, puis la facture et l'attestation de conformité de l'installation après la pose. La demande de prêt, elle, se fait chez la SWCS ou au Fonds du Logement.",
          "Pour une question sur votre situation, le 1718 répond gratuitement les jours ouvrables de 8 h 30 à 17 h, et les Guichets Énergie Wallonie conseillent sans frais près de chez vous. Notre page consacrée aux aides reprend tout le détail, avec les liens officiels.",
        ],
      },
    ],
    faqs: [
      {
        question: "Peut-on encore obtenir une prime pour un poêle à pellets en Wallonie ?",
        answer:
          "Non, plus depuis le 1er octobre 2026, sauf la subvention MEBAR pour les ménages à très petits revenus, via le CPAS. La prime Habitation s'est arrêtée le 30 septembre 2026. Les prêts qui la remplacent, Rénopack et Rénoprêt, visent les maisons classées E, F ou G qui gagnent le label exigé après travaux.",
      },
      {
        question: "Mon poêle a été posé en septembre : est-il trop tard ?",
        answer:
          "Oui, si la demande n'a pas été introduite au plus tard le 30 septembre 2026 à 23 h 59. Seuls les projets avec un devis daté et signé avant le 14 février 2025 peuvent encore passer par les anciennes conditions, jusqu'au 30 septembre 2027.",
      },
      {
        question: "Le Rénopack rembourse-t-il une partie du poêle ?",
        answer:
          "Le Rénopack ne rembourse pas un appareil : c'est un prêt à 0 % pour un projet complet, dont 15 à 50 % ne se remboursent pas selon vos revenus. Le poêle peut en faire partie si la maison, classée E, F ou G, gagne le label exigé après les travaux.",
      },
      {
        question: "Faut-il encore un audit logement ?",
        answer:
          "Pour un poêle seul, non. Pour un Rénopack ou un Rénoprêt, oui : l'audit doit avoir été réalisé ou actualisé moins d'un an avant la demande de prêt.",
      },
      {
        question: "La TVA à 6 % s'applique-t-elle toujours ?",
        answer:
          "Oui, dans un logement privé de plus de 10 ans, quand l'installateur fournit et pose le poêle. Les appareils au gaz, au mazout ou au charbon sont à 21 % depuis le 29 juillet 2025, pas les poêles à pellets.",
      },
    ],
    related: {
      articles: ["remplacer-chaudiere-mazout-poele-hydro", "budget-hiver-poele-pellets-consommation-2026"],
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
      "Coût total, aides, retour sur investissement, raccordement aux radiateurs, cuve à mettre hors service : passer du mazout au pellet hydro, expliqué par Mister Pellets.",
    excerpt:
      "Le mazout dépasse 1,50 € le litre, et la Wallonie interdira de remplacer une chaudière mazout à partir de 2031. Le pellet hydro est l'alternative la plus simple pour garder ses radiateurs.",
    tldr:
      "Remplacer une chaudière mazout par un poêle hydro à pellets coûte 8 000 à 14 000 € TVAC posé, selon la puissance (16 à 24 kW) et le raccordement aux radiateurs existants. Il n'y a plus de prime régionale depuis le 1er octobre 2026, mais la TVA est à 6 % dans un logement de plus de 10 ans. Pour une maison qui brûlait 2 000 litres de mazout par an, l'économie tourne autour de 1 500 € par an aux prix d'octobre 2026 : l'installation se rembourse en 5 à 9 ans.",
    category: "installation",
    tags: ["hydro", "mazout", "remplacement", "chaudière", "transition"],
    readingTimeMinutes: 10,
    publishedAt: "2026-01-28",
    modifiedAt: "2026-10-03",
    authorName: "Équipe technique Mister Pellets",
    authorRole: "Spécialistes hydro et chauffage central",
    coverImageAlt: "Comparaison entre chaudière mazout ancienne et poêle hydro à pellets moderne",
    sections: [
      {
        heading: "Pourquoi le pellet hydro remplace bien le mazout",
        paragraphs: [
          "Une chaudière mazout chauffe un circuit d'eau qui alimente les radiateurs et l'eau chaude sanitaire. Un poêle hydro à pellets fait exactement la même chose : il chauffe le même circuit, branché de la même manière. La transition technique est plus simple qu'on ne l'imagine.",
          "Côté combustible, le pellet se produit en Belgique, qui en fabrique plus qu'elle n'en consomme selon ValBiom. En août 2026, le sac de 15 kg valait 6,19 € en moyenne en Wallonie. Le mazout, lui, dépassait 1,50 € le litre au tarif maximum du SPF Économie début octobre 2026.",
          "Et la réglementation tourne. Depuis le 1er janvier 2026, une maison neuve ne peut plus recevoir de chaudière au mazout. À partir du 1er janvier 2031, on ne pourra plus en installer ni en remplacer dans une maison existante ; seul le remplacement du brûleur restera permis jusqu'à fin 2034.",
        ],
      },
      {
        heading: "Quelle puissance hydro pour quelle maison",
        paragraphs: [
          "Le calcul est différent du poêle d'air : ici, la puissance doit suivre le besoin total de chauffage de la maison, plus l'eau chaude sanitaire si vous choisissez cette option. Comptez généralement 0,15 à 0,18 kW par m² pour une maison wallonne 4 façades non passive.",
        ],
        table: {
          headers: ["Surface chauffée", "PEB", "Puissance hydro", "Ballon tampon recommandé"],
          rows: [
            ["100-130 m²", "C-D", "16-18 kW", "200-300 L"],
            ["130-180 m²", "C-E", "20-22 kW", "300-500 L"],
            ["180-250 m²", "D-G", "24-28 kW", "500-800 L"],
          ],
          caption: "Dimensionnement hydro indicatif Wallonie. Ajouter 10 % si la production d'eau chaude sanitaire est intégrée.",
        },
        callout: {
          variant: "info",
          text: "Pour les maisons de plus de 200 m² ou très mal isolées, on ajoute parfois un appoint électrique sur le ballon d'eau chaude pour les grands froids ou les week-ends prolongés.",
        },
      },
      {
        heading: "Le raccordement aux radiateurs existants",
        paragraphs: [
          "Bonne nouvelle : vos radiateurs restent en place. Le poêle hydro se raccorde au circuit via un ballon tampon (200 à 800 litres selon la puissance) qui sert de volume d'inertie. Ce ballon évite les cycles courts qui usent le poêle avant l'heure.",
          "Avant le raccordement, le circuit doit être désemboué : 20 ou 30 ans de chauffage au mazout laissent des boues dans les tuyaux et les radiateurs. Comptez 350 à 600 € selon la longueur du circuit et le nombre de radiateurs. On ne transige pas là-dessus : un circuit emboué encrasse le nouvel échangeur en quelques mois.",
        ],
      },
      {
        heading: "Combien ça coûte, et combien ça rapporte",
        paragraphs: [
          "Prenons une maison 4 façades de 1978 près de Sombreffe : 175 m², classée E, une chaudière mazout de 28 kW en fin de vie et une cuve de 3 000 litres. Le projet type comprend un Girolami Soft hydro, un ballon tampon de 500 litres, le désembouage du circuit, le raccordement, la mise en service et la mise hors service de la cuve. Avec la TVA à 6 %, il se situe dans le haut de notre fourchette hydro, entre 8 000 et 14 000 € TVAC selon l'état du circuit.",
          "Le calcul de l'économie. 2 000 litres de mazout contiennent environ 20 000 kWh ; une chaudière qui rend 80 % sur la saison en fait 16 000 kWh de chaleur. Pour produire la même chaleur, un hydro qui rend 90 % brûle environ 3,8 tonnes de pellets à 4,7 kWh par kilo.",
        ],
        callout: {
          variant: "success",
          text: "Aux prix d'octobre 2026 : 2 000 litres × 1,53 € = 3 070 € de mazout, contre 3,8 tonnes × 413 € = 1 560 € de pellets. Environ 1 500 € d'économie par an, soit un retour sur investissement de 5 à 9 ans.",
        },
      },
      {
        heading: "La cuve à mazout : une étape à ne pas oublier",
        paragraphs: [
          "À partir de 3 000 litres, la réglementation wallonne (arrêté du 17 juillet 2003) impose une mise hors service en règle : la citerne est vidée, nettoyée et dégazée, puis enlevée si elle est aérienne, enlevée ou remplie d'un matériau inerte si elle est enterrée. Les boues partent chez un collecteur agréé. Sous 3 000 litres, ces règles ne sont pas obligatoires, mais le SPW recommande de les suivre.",
          "Certaines communes accordent une aide pour la mise hors service d'une citerne : renseignez-vous avant les travaux. Mister Pellets coordonne l'opération avec une entreprise spécialisée.",
        ],
      },
      {
        heading: "Les 3 erreurs à éviter dans une transition mazout → pellets hydro",
        paragraphs: [
          "Erreur 1 : ne pas désembouer le circuit. Vous importez des années de boues dans un échangeur neuf, qui s'encrasse aussitôt.",
          "Erreur 2 : sous-dimensionner pour économiser. Un hydro de 18 kW sur 200 m² en PEB E tourne à plein en janvier, et vous finissez par allumer un appoint électrique. La marge utile est de 15 à 20 % au-dessus du calcul théorique.",
          "Erreur 3 : oublier le ballon tampon. Sans lui, le poêle enchaîne les cycles courts, allumage puis extinction toutes les demi-heures, use sa résistance d'allumage bien plus vite et fait du bruit dans la maison. Le ballon n'est pas une option.",
        ],
      },
    ],
    faqs: [
      {
        question: "Combien coûte le passage du mazout au poêle hydro à pellets ?",
        answer:
          "Comptez 8 000 à 14 000 € TVAC tout compris en Wallonie, avec la TVA à 6 % dans un logement de plus de 10 ans : poêle, ballon tampon, désembouage du circuit, raccordement et mise hors service de la cuve. Il n'y a plus de prime régionale depuis le 1er octobre 2026 ; si la maison est classée E, F ou G et que vous la rénovez plus largement, le Rénopack peut financer le projet.",
      },
      {
        question: "Faut-il garder une chaudière d'appoint en plus du poêle hydro ?",
        answer:
          "Non, dans la grande majorité des cas le poêle hydro couvre tout le chauffage et l'eau chaude. Seules les très grandes maisons mal isolées peuvent avoir besoin d'un appoint électrique sur le ballon d'eau chaude pour les grands froids.",
      },
      {
        question: "Combien de temps pour rentabiliser l'investissement ?",
        answer:
          "Pour une maison qui brûlait 2 000 litres de mazout par an, comptez 5 à 9 ans aux prix d'octobre 2026 : environ 3 070 € de mazout contre 1 560 € de pellets, soit 1 500 € d'économie par an pour un investissement de 8 000 à 14 000 €. Si le mazout continue de grimper, ça va plus vite.",
      },
      {
        question: "Que faire de l'ancienne cuve mazout vide ?",
        answer:
          "À partir de 3 000 litres, elle doit être vidée, nettoyée et dégazée, puis enlevée si elle est aérienne, enlevée ou remplie d'un matériau inerte si elle est enterrée. Sous 3 000 litres, ce n'est pas obligatoire mais recommandé. Mister Pellets coordonne l'opération avec une entreprise spécialisée.",
      },
    ],
    related: {
      articles: [
        "budget-hiver-poele-pellets-consommation-2026",
        "primes-wallonie-2026-poele-pellets-combien-recuperer",
        "dimensionner-poele-pellets-surface-wallonie",
      ],
      guides: ["poele-pellets-hydro", "guide-achat-poele-pellets-wallonie"],
      cities: ["namur", "charleroi", "wavre", "andenne"],
      brands: ["edilkamin", "girolami"],
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
      "Un poêle à pellets qui s'éteint tout seul a presque toujours une de ces 7 causes : creuset encrassé, pellets de mauvaise qualité ou humides, sonde de fumée encrassée, échangeur bouché, vis sans fin bloquée, prise d'air comburant obstruée, ou conduit non ramoné. Avant d'appeler un technicien, vérifiez ces 7 points dans l'ordre : la cause est le plus souvent un défaut d'entretien plutôt qu'une panne matérielle.",
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
          "Diagnostic : à froid, sortez le creuset. Si vous voyez des amas durs et brillants comme du verre, c'est du mâchefer. Solution : frappez le creuset à l'envers sur une surface dure pour décoller, brossez les trous avec une brosse métallique, vérifiez qu'aucun trou n'est obstrué.",
        ],
        callout: {
          variant: "info",
          text: "Videz les cendres tous les 2-3 jours en pleine saison, brossez le creuset toutes les semaines. C'est l'entretien le plus important d'un poêle à pellets.",
        },
      },
      {
        heading: "Cause n°2 : pellets humides ou de mauvaise qualité (20 %)",
        paragraphs: [
          "Un pellet à 12 % d'humidité (au lieu de < 10 %) brûle moins bien, fait plus de cendres, encrasse l'échangeur. À partir de 14 %, le poêle peut s'éteindre faute de combustion stable.",
          "Diagnostic : prenez une poignée de pellets, frottez-les. Ils doivent être durs, lisses, sans poussière. Cassés, friables, ou poussiéreux = mauvais lot ou stockage humide. Solution : passez à un sac neuf certifié ENplus A1 ou DINplus, videz entièrement le réservoir et la vis sans fin avant.",
        ],
      },
      {
        heading: "Cause n°3 : sonde de fumée encrassée (15 %)",
        paragraphs: [
          "La sonde thermocouple mesure la température des fumées en sortie d'échangeur. Si elle est couverte de suie, elle envoie une fausse lecture : le poêle croit qu'il fait trop froid et déclenche une extinction par sécurité.",
          "Diagnostic : le code erreur affiché est souvent E101, E110 ou « température fumée basse » selon la marque. Solution : à froid, retirez la sonde (1 vis) et essuyez-la avec un chiffon sec. Pas de produit chimique. Remontez. 80 % des cas se résolvent en 5 minutes.",
        ],
      },
      {
        heading: "Cause n°4 : échangeur bouché (10 %)",
        paragraphs: [
          "L'échangeur (les conduits internes par où passent les fumées avant la sortie) accumule de la suie. Quand le passage rétrécit trop, le tirage chute, la combustion devient mauvaise, le poêle s'éteint.",
          "Diagnostic : ouvrez la porte du foyer. Si les parois sont noires de suie épaisse, l'échangeur l'est aussi probablement. Solution : ramonage interne avec la canne fournie (action sur le levier en façade pour les Edilkamin/EK63) toutes les 2-3 semaines en saison. Faites aussi ramoner le conduit une fois par an.",
        ],
      },
      {
        heading: "Cause n°5 : vis sans fin bloquée (8 %)",
        paragraphs: [
          "La vis sans fin descend les pellets du réservoir vers le creuset. Si un pellet trop long, un débris (vis, bois, plastique) ou un amas humide se coince, la vis force, le moteur déclenche sa sécurité thermique et le poêle s'arrête.",
          "Diagnostic : vous entendez le moteur grogner au démarrage sans pellets qui descendent dans le creuset. Solution : videz le réservoir, démontez la vis (1-2 vis selon modèle), retirez l'obstacle. Profitez-en pour vérifier qu'aucun élément étranger n'est présent.",
        ],
      },
      {
        heading: "Cause n°6 : prise d'air comburant obstruée (5 %)",
        paragraphs: [
          "Les modèles étanches prennent leur air de combustion à l'extérieur via un tuyau en façade. Une feuille morte, un nid, ou une grille obstruée bloque l'arrivée d'air. Le poêle ne peut plus brûler correctement et s'éteint.",
          "Diagnostic : passez à l'extérieur, vérifiez la grille de prise d'air. Solution : nettoyez à la brosse. Sur les non-étanches, vérifiez la grille de ventilation de la pièce, un meuble qui obstrue est aussi un classique.",
        ],
      },
      {
        heading: "Cause n°7 : conduit non ramoné ou refoulement (2 %)",
        paragraphs: [
          "Aucune loi wallonne n'impose de ramoner un poêle, mais la plupart des contrats d'assurance incendie l'exigent chaque année, et pour une bonne raison : la suie accumulée réduit le tirage. Par grand vent, un refoulement temporaire peut aussi déclencher l'extinction.",
          "Diagnostic : si le poêle s'éteint surtout par temps venteux ou si vous sentez une odeur de fumée intermittente, c'est probablement le conduit. Solution : un ramonage (90 € TVAC chez nous, certificat compris). Vérifiez aussi le chapeau du conduit : nid d'oiseau, mousse, c'est fréquent.",
        ],
        callout: {
          variant: "warning",
          text: "Si votre contrat d'assurance impose un ramonage annuel, l'assureur peut réduire ou refuser son intervention après un feu de cheminée quand le défaut de ramonage a joué dans le sinistre. Gardez toujours le certificat.",
        },
      },
      {
        heading: "Si rien ne fonctionne : appelez votre SAV",
        paragraphs: [
          "Si vous avez vérifié les 7 points ci-dessus sans succès, c'est probablement une panne matérielle : résistance d'allumage HS (durée de vie typique 4-7 ans), motoréducteur de vis sans fin, carte électronique. Ces réparations dépassent les compétences classiques d'un utilisateur, appelez votre installateur.",
          "Mister Pellets intervient en SAV dans les 50 km autour de Fernelmont. Pour les clients hors zone, on conseille toujours un installateur certifié local. Les pièces détachées Edilkamin, EK63 et Girolami sont disponibles en stock chez nous sous 48 h.",
        ],
      },
    ],
    faqs: [
      {
        question: "Mon poêle à pellets s'éteint au bout de 30 minutes, que faire ?",
        answer:
          "C'est typique d'un creuset encrassé qui ne laisse plus passer l'air primaire. Videz le creuset à froid, brossez les trous avec une brosse métallique, et vérifiez que les pellets sont certifiés ENplus A1. Si le problème persiste après 2-3 cycles, contrôlez la sonde de fumée.",
      },
      {
        question: "Combien coûte une intervention SAV en Wallonie ?",
        answer:
          "Chez Mister Pellets, le dépannage coûte 110 € TVAC la première heure, puis 60 € TVAC par heure, déplacement inclus dans notre zone. Les pièces sont facturées en plus.",
      },
      {
        question: "Est-ce normal que mon poêle s'éteigne quand le réservoir est vide ?",
        answer:
          "Oui, c'est une sécurité normale. Le poêle détecte l'absence de pellets via la chute de température et déclenche une extinction propre. Remplissez le réservoir, attendez 5 minutes que la vis se réamorce, redémarrez.",
      },
      {
        question: "Mon poêle s'éteint surtout par temps de vent, pourquoi ?",
        answer:
          "Le vent peut provoquer un refoulement dans le conduit de fumée, surtout si le chapeau est mal adapté ou obstrué. Solution : faire vérifier le chapeau par un ramoneur, et si nécessaire installer un chapeau anti-refoulement type rotatif.",
      },
    ],
    related: {
      articles: ["pellets-enplus-a1-vs-dinplus", "budget-hiver-poele-pellets-consommation-2026"],
      guides: ["remettre-en-route-poele-pellets-automne", "comment-entretenir-poele-pellets"],
      cities: ["namur", "charleroi", "liege", "fernelmont"],
      brands: ["edilkamin", "ek63", "girolami"],
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
