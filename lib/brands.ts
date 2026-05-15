/**
 * Source de vérité pour les marques distribuées par Mister Pellets.
 *
 * Hotfix V1.2 §H7 : rectification factuelle des positionnements.
 * Brief marques top-tier (2026-05) : ajout de Girolami, mise à niveau des
 * contenus Edilkamin et EK63, structure de page enrichie (repères, blocs
 * "ce qui distingue", FAQ, maillage). Sources : edilkamin.com, ek-63.com,
 * girolami.eu, diellespa.it, ferlux.es.
 *
 * Hiérarchie : 3 marques "top tier" (tier 1, traitement éditorial complet)
 * et 2 marques secondaires (tier 2, contenu hérité). Les champs enrichis
 * (whyWeLove, milestones, distinctions, modelsTable, faq) sont OPTIONNELS :
 * le composant BrandPage n'affiche un bloc que si la donnée existe, donc les
 * marques tier 2 dégradent proprement sans page cassée.
 */

export interface BrandMilestone {
  /** Repère mis en gras : année ou courte étiquette. */
  marker: string;
  label: string;
}

export interface BrandDistinction {
  /** Emoji décoratif optionnel (cohérent avec le brief). */
  emoji?: string;
  title: string;
  description: string;
}

export interface BrandModelRow {
  name: string;
  power: string;
  type?: string;
  forWhom: string;
}

export interface BrandFaqItem {
  question: string;
  answer: string;
}

export interface BrandData {
  slug: "edilkamin" | "ek63" | "girolami" | "dielle" | "ferlux";
  name: string;
  country: string;
  /** 1 = marque top tier (page complète), 2 = marque secondaire. */
  tier?: 1 | 2;
  /** Année de création vérifiée. undefined si non sourçable officiellement. */
  founded?: number;
  /** Année de création approximative (texte) si pas de date exacte. */
  foundedLabel?: string;
  positioning: string;
  tagline: string;
  intro: string;

  // ----- Hero enrichi (tier 1) -----
  /** Badge affiché dans le hero. */
  badge?: string;
  /** Sous-titre du hero (sinon on retombe sur `intro`). */
  heroSubtitle?: string;

  // ----- Blocs enrichis (tier 1) — tous optionnels -----
  /** "Pourquoi on aime travailler avec X" — 2 à 3 paragraphes. */
  whyWeLove?: string[];
  /** "X en quelques repères" — timeline. */
  milestones?: BrandMilestone[];
  /** "Ce qui distingue X" — 6 cartes. */
  distinctions?: BrandDistinction[];
  /** "Modèles disponibles" — tableau enrichi. */
  modelsTable?: BrandModelRow[];
  /** FAQ "Ce qu'on nous demande souvent". */
  faq?: BrandFaqItem[];

  // ----- Contenu hérité (tier 2 : Dielle, Ferlux) -----
  history?: string[];
  specialties?: string[];
  modelHighlights?: { name: string; power: string; usp: string }[];

  warranty: string;
  tags: string[];
  /** URL officielle du fabricant (pour Schema.org sameAs). */
  officialUrl: string;
  metaTitle: string;
  metaDescription: string;
}

export const BRANDS: Record<BrandData["slug"], BrandData> = {
  // ───────────────────────────────────────────────────────────────────
  // EDILKAMIN — tier 1, référence italienne historique
  // ───────────────────────────────────────────────────────────────────
  edilkamin: {
    slug: "edilkamin",
    name: "Edilkamin",
    country: "Italie",
    tier: 1,
    founded: 1963,
    positioning: "Référence premium italienne",
    tagline: "Le poêle italien qui ne fait pas de bruit",
    badge: "Marque premium italienne",
    intro:
      "Edilkamin est une référence italienne du chauffage biomasse depuis 1963, basée à Lainate dans la région de Milan. La marque couvre toute la gamme : poêles air, canalisables, étanches, hydro, inserts et poêles à bois. Le pilotage Wi-Fi est intégré sur la plupart des modèles récents.",
    heroSubtitle:
      "Fondée à Milan en 1963 par Francesco Borsatti, Edilkamin est la référence du chauffage biomasse italien. On la pose depuis le début de l'atelier. C'est notre choix par défaut quand on cherche un poêle qui dure 20 ans sans broncher.",
    whyWeLove: [
      "Edilkamin, c'est la référence du poêle italien fiable. La marque a 60 ans, six sites de production et tout est encore fabriqué en Italie, principalement dans les ateliers de Lainate près de Milan. La fonderie et le bureau R&D sont internes. Résultat concret : des poêles qui chauffent vraiment, qui se règlent finement et qui supportent les hivers wallons sans broncher.",
      "On en pose depuis le début de l'atelier, et on a vu passer toutes les configurations possibles. Insert encastré dans une vieille cheminée, poêle d'angle dans un séjour ouvert, hydro pour chauffage central avec ballon tampon. Les retours après 5 à 10 ans d'utilisation sont systématiquement bons. Le SAV pièces est rapide en Belgique, c'est un point qui compte énormément quand on choisit pour 20 ans.",
      "C'est la marque qu'on recommande quand on veut un poêle qui sera encore là dans deux décennies, sans avoir à y penser tous les hivers.",
    ],
    milestones: [
      { marker: "1963", label: "Fondation à Milan par Francesco Borsatti, fabrication de cheminées décoratives." },
      { marker: "1982", label: "Transfert du siège opérationnel à Lainate, dans la banlieue nord de Milan." },
      { marker: "1985", label: "Premier insert à bois automatique de la marque." },
      { marker: "2002", label: "Lancement de la gamme pellets, axée sur la combustion étanche." },
      { marker: "2015", label: "Déploiement de la technologie Leonardo, autorégulation de la combustion par sondes lambda." },
      { marker: "2024", label: "Présence dans plus de 30 pays, deuxième génération Borsatti aux commandes, plus de 250 collaborateurs." },
    ],
    distinctions: [
      { emoji: "🇮🇹", title: "Fonderie italienne", description: "Production dans 6 sites maison, principalement à Lainate (Milan). Fonderie interne, bureau R&D interne. Pas de sous-traitance opaque, pas de pièces venues d'ailleurs." },
      { emoji: "🧠", title: "Combustion Leonardo", description: "Sondes lambda et capteurs de pression qui ajustent en permanence l'air et le débit de pellets. La combustion reste stable même si tu changes de marque de sacs, même quand l'humidité ambiante varie." },
      { emoji: "🔇", title: "Silence de fonctionnement", description: "Ventilateurs montés sur amortisseurs, fonte épaisse qui amortit les bruits de combustion. On en met dans un séjour ouvert sur les chambres sans souci." },
      { emoji: "🌬", title: "Technologie airKare", description: "Ionisation et ozonisation actives qui améliorent la qualité de l'air ambiant. Disponible sur certaines gammes. Une fonction qui agit même quand le poêle est éteint." },
      { emoji: "💧", title: "Gamme hydro complète", description: "Les modèles Cherie H et Blade H se raccordent au chauffage central comme une chaudière. Production d'eau chaude sanitaire avec ballon dédié. Adaptée au remplacement d'une vieille chaudière mazout." },
      { emoji: "🛡", title: "SAV pièces Europe", description: "Réseau de 450+ centres d'assistance dans le monde. Stock pièces rapide via le réseau belge. Joints, bougies, sondes, ventilateurs courants disponibles sous 48 à 72 h." },
    ],
    modelsTable: [
      { name: "Cherie 9+ Evo", power: "9 kW", type: "Canalisable", forWhom: "80 à 100 m², best-seller de la gamme." },
      { name: "Blade 12++ Evo", power: "12 kW", type: "Ventilé", forWhom: "Ventilation puissante pour grands volumes." },
      { name: "Cherie H 14 Evo", power: "14 kW", type: "Hydro", forWhom: "Chauffage central et eau chaude sanitaire." },
      { name: "Lena 9+ Evo", power: "9 kW", type: "Compact", forWhom: "Pièces moyennes, format discret." },
      { name: "Kira2 Evo", power: "13 kW", type: "Canalisable double flux", forWhom: "Jusqu'à 12 m de gaines, deux pièces." },
      { name: "Dania AT C Plus", power: "8 kW", type: "Étanche", forWhom: "Classe A+, ventouse possible, maisons BBC." },
    ],
    faq: [
      { question: "Edilkamin, c'est cher par rapport aux autres marques ?", answer: "Sur le tarif catalogue oui, c'est dans le haut de la fourchette. Mais quand on intègre la durée de vie réelle (15 à 20 ans courants chez nos clients), le coût ramené à l'année est plus bas qu'un poêle d'entrée de gamme qu'il faut remplacer après 8 ans. Et le SAV pièces reste dispo 15 ans après l'arrêt du modèle." },
      { question: "Les pièces détachées, c'est facile à trouver ?", answer: "Edilkamin a un réseau de 450+ centres d'assistance dans le monde. En Belgique, les consommables courants (joints, bougies, sondes, ventilateurs) sont chez nous en stock. Les pièces spécifiques arrivent en 48 à 72 h." },
      { question: "Quelle différence entre la gamme Cherie et la gamme Blade ?", answer: "Cherie est le format compact à poser contre un mur, design céramique chaleureux. Blade est plus large, plus puissant, avec une face vitrée imposante. Cherie convient à une pièce, Blade à un grand volume ouvert." },
      { question: "La technologie Leonardo, c'est utile en pratique ?", answer: "Très utile. Concrètement, le poêle s'auto-règle quand tu changes de marque de pellets, quand l'humidité ambiante varie, quand il fait très froid dehors. Tu n'as rien à toucher dans le menu, la combustion reste optimale." },
      { question: "Edilkamin est compatible avec une cheminée ancienne ?", answer: "Oui dans la majorité des cas, avec un tubage inox flexible ou rigide. On vérifie la géométrie du conduit à la visite technique pour valider le diamètre minimum (80 mm pour la plupart des modèles, 100 mm pour les hydro)." },
      { question: "Est-ce qu'Edilkamin propose des modèles canalisables ?", answer: "Oui, la majorité de la gamme l'est. Le Kira2 Evo distribue même l'air chaud sur deux gaines indépendantes. Pratique pour chauffer une chambre à l'étage en plus du salon." },
    ],
    warranty:
      "Garantie constructeur Edilkamin. Mister Pellets assure le SAV pièces localement : intervention sous 48 à 72 h et stock des consommables courants en atelier.",
    tags: ["Italie", "Depuis 1963", "Gamme très large", "Technologie Leonardo"],
    officialUrl: "https://www.edilkamin.com/",
    metaTitle: "Edilkamin en Wallonie, revendeur officiel poêles italiens | Mister Pellets",
    metaDescription:
      "Edilkamin, marque italienne fondée en 1963 à Milan. Poêles à pellets premium, technologie Leonardo, fonderie interne. Pose en 1 jour par Mister Pellets, prime Habitation Wallonie 2026 incluse.",
  },

  // ───────────────────────────────────────────────────────────────────
  // EK63 — tier 1, marque connectée du groupe Edilkamin
  // ───────────────────────────────────────────────────────────────────
  ek63: {
    slug: "ek63",
    name: "EK63",
    country: "Italie",
    tier: 1,
    foundedLabel: "Marque du groupe Edilkamin",
    positioning: "Connecté accessible",
    tagline: "Le connecté italien qui coche les cases sans gonfler le budget",
    badge: "Marque connectée du groupe Edilkamin",
    intro:
      "EK63 est la marque sœur d'Edilkamin, pensée pour des poêles modernes, étanches, Wi-Fi de série, à un prix qui passe en Wallonie. La gamme couvre l'air, le canalisable, l'étanche et l'hydro.",
    heroSubtitle:
      "EK63, c'est la marque sœur d'Edilkamin. Pensée pour des poêles modernes, étanches, Wi-Fi de série, à un prix qui passe en Wallonie. On l'installe partout, du studio jusqu'à la maison à étage qui veut canaliser deux pièces.",
    whyWeLove: [
      "EK63 a été lancée par Edilkamin pour une raison simple : tout le monde veut un Edilkamin, mais tout le monde n'a pas le budget Edilkamin. La marque sœur reprend l'industrie, les méthodes, le service après-vente du groupe, et livre des poêles modernes à un tarif plus accessible. Le Wi-Fi Smart est intégré de série sur la majorité des modèles, donc tu pilotes depuis ton smartphone sans abonnement et sans option payante.",
      "L'autre point qui fait la différence en Wallonie, c'est l'étanchéité. La plupart des EK63 sont des poêles étanches. Concrètement, ils prennent l'air comburant directement à l'extérieur et n'aspirent pas l'air chaud de ta pièce. C'est ce qui les rend compatibles avec les maisons à VMC double flux, les BBC et les passives.",
      "Sur le canalisable, EK63 a sorti un modèle qui nous sort souvent du pétrin chez les clients à couloir étroit : l'Entity 90+, seulement 31 cm de profondeur, qu'on glisse là où on ne pourrait pas faire entrer un poêle classique.",
    ],
    milestones: [
      { marker: "Création", label: "Marque lancée par le groupe Edilkamin, axée sur les usages connectés." },
      { marker: "Plateforme", label: "Industrie héritée d'Edilkamin, 60+ ans d'expérience à Milan." },
      { marker: "Wi-Fi", label: "Wi-Fi Smart intégré de série sur la majorité des modèles." },
      { marker: "Étanche", label: "Gamme étanche complète, compatible maisons passives et BBC." },
      { marker: "Certifié", label: "Certifications Ecodesign 2022 et classe environnementale 5 étoiles D.M. 186." },
    ],
    distinctions: [
      { emoji: "📱", title: "Wi-Fi Smart intégré", description: "Pilotage depuis le smartphone de série sur la majorité des modèles. Programmation hebdomadaire, allumage à distance, mode économique. Pas d'abonnement, pas d'option payante." },
      { emoji: "💨", title: "Étanche compatible maison passive", description: "Air comburant prélevé directement à l'extérieur. Aucun air chaud de la pièce n'est consommé par la combustion. Compatible VMC double flux, BBC et passives." },
      { emoji: "📐", title: "Format ultra-fin Entity 90+", description: "31 cm de profondeur seulement. Conçu pour les couloirs ou les petits espaces. Canalisable malgré son format compact." },
      { emoji: "🔥", title: "Focolare en vermiculite", description: "Chambre de combustion en vermiculite haute résistance. Bougie céramique pour allumage rapide. Conçue pour durer dans le temps." },
      { emoji: "🌍", title: "Plateforme Edilkamin", description: "EK63 hérite des méthodes industrielles d'Edilkamin. Même rigueur de fabrication, même filière SAV, mais sous une marque pensée pour un prix d'attaque plus doux." },
      { emoji: "✅", title: "Certifications complètes", description: "CE, EN 14785, Ecodesign 2022, classe environnementale 5 étoiles D.M. 186. Éligible aux primes belges." },
    ],
    modelsTable: [
      { name: "Tweed 90+", power: "9,2 kW", type: "Canalisable étanche", forWhom: "Best-seller Wallonie, 240 m³, rendement 90,9 %." },
      { name: "Like 80", power: "7,6 kW", type: "Étanche air", forWhom: "Appartements et petites pièces." },
      { name: "Zone 80", power: "7,6 kW", type: "Étanche air", forWhom: "Pièces compactes, 74 m² maxi." },
      { name: "Spy 110+", power: "10,5 kW", type: "Canalisable étanche", forWhom: "Volume polyvalent, design moderne." },
      { name: "Daily 130++", power: "12,5 kW", type: "Canalisable étanche", forWhom: "120 m², jusqu'à classe A+." },
      { name: "Entity 90+", power: "8,7 kW", type: "Canalisable ultra-fin", forWhom: "Couloirs et petits espaces, 31 cm de profondeur." },
    ],
    faq: [
      { question: "EK63 et Edilkamin, c'est la même chose ?", answer: "Pas tout à fait. EK63 est une marque distincte du groupe Edilkamin, créée pour proposer des poêles modernes connectés à un prix plus accessible. La plateforme industrielle et le SAV sont communs. Le design et certaines technologies (Leonardo notamment) restent l'apanage d'Edilkamin." },
      { question: "Pourquoi choisir un EK63 plutôt qu'un Edilkamin ?", answer: "Pour deux raisons concrètes. D'abord le prix : à puissance équivalente, on est typiquement 15 à 25 % en dessous d'un Edilkamin. Ensuite la connectivité : le Wi-Fi est de série sur EK63, alors que c'est parfois en option ou sur les gammes supérieures chez Edilkamin." },
      { question: "Le Wi-Fi de série, c'est vraiment utile ?", answer: "Très. Tu programmes ton poêle à distance le dimanche soir pour le lendemain, tu l'allumes depuis le bureau pour rentrer dans un séjour chaud, tu surveilles la consommation de pellets. Et tu reçois les alertes (réservoir bas, entretien nécessaire) en direct." },
      { question: "EK63 fonctionne dans une maison BBC ou passive ?", answer: "Oui, c'est même là que la marque excelle. La majorité des modèles sont étanches : ils prennent l'air comburant à l'extérieur via une prise d'air dédiée. Ils sont donc compatibles avec les VMC double flux et n'aspirent pas l'air chaud de ta maison." },
      { question: "Quelle est la garantie sur un EK63 ?", answer: "Garantie constructeur officielle EK63 : 2 ans. Mister Pellets ajoute son service local : intervention sous 48 à 72 h, stock pièces courantes en atelier." },
      { question: "L'Entity 90+ à 31 cm, ça chauffe vraiment ?", answer: "Oui, 8,7 kW pour une chambre 31 cm de profondeur. On l'a posé dans plusieurs couloirs et halls en Wallonie. La performance est là, la canalisation distribue l'air chaud vers une pièce adjacente. Le seul vrai prérequis est un emplacement avec passage de fumée correct." },
    ],
    warranty:
      "Garantie constructeur EK63 : 2 ans. Mister Pellets ajoute son service local : intervention sous 48 à 72 h et stock des pièces courantes en atelier.",
    tags: ["Italie", "Groupe Edilkamin", "Wi-Fi Smart", "Étanche"],
    officialUrl: "https://www.ek-63.com/",
    metaTitle: "EK63 en Wallonie, poêles à pellets Wi-Fi du groupe Edilkamin | Mister Pellets",
    metaDescription:
      "EK63, marque connectée du groupe Edilkamin. Poêles à pellets étanches, Wi-Fi Smart de série, design moderne, prix accessible. Pose en Wallonie par Mister Pellets, prime 2026 incluse.",
  },

  // ───────────────────────────────────────────────────────────────────
  // GIROLAMI — tier 1, polycombustible breveté (intégration neuve)
  // ───────────────────────────────────────────────────────────────────
  girolami: {
    slug: "girolami",
    name: "Girolami",
    country: "Italie",
    tier: 1,
    founded: 1970,
    positioning: "Polycombustible breveté",
    tagline: "Le poêle italien qui se nettoie tout seul",
    badge: "Marque italienne polycombustible brevetée",
    intro:
      "Girolami est un fabricant familial italien établi à Sant'Oreste, près de Rome, depuis 1970. Sa signature : un brevet d'alimentation par le bas qui pousse les cendres dans un bac sous le brasier, et une gamme hybride bois-pellet.",
    heroSubtitle:
      "Famille Girolami, atelier près de Rome, depuis 1970. Brevet maison : l'alimentation par le bas qui pousse les cendres dans un bac sous le brasier. Plus de nettoyage quotidien. On l'installe en Wallonie avec le même service que pour Edilkamin et EK63.",
    whyWeLove: [
      "Girolami, c'est une histoire de famille italienne. Fondée en 1970 par la famille Girolami à Sant'Oreste, à 50 km au nord de Rome. Plus de 50 ans plus tard, l'usine reste le seul lieu où sont conçus, fabriqués, assemblés et testés tous les appareils. Pas de marque blanche, pas de pièces venues d'ailleurs. Tout sort de la même usine du Latium.",
      "Ce qui nous a convaincus chez Mister Pellets, c'est leur brevet maison : le Source Feeding. Le pellet est poussé sous le brasier au lieu de tomber dessus, et les cendres sont chassées dans un bac sous le foyer. Concrètement, le brasier reste propre seul. Le client ne gratte plus tous les jours, il vide le cendrier une fois par semaine. Sur le terrain, ça change la vie des utilisateurs qui en ont marre du nettoyage quotidien d'un poêle classique.",
      "L'autre point fort, c'est l'hybride bois-pellet sur la gamme Soft. Une sonde reconnaît seule le combustible chargé et bascule automatiquement entre pellet, bûche et combustibles broyés naturels. On allume au pellet le matin, on finit la soirée à la bûche, sans toucher au menu.",
    ],
    milestones: [
      { marker: "1970", label: "Fondation à Sant'Oreste (Rome) par la famille Girolami." },
      { marker: "Années 2000", label: "Développement du brevet Source Feeding, alimentation par le bas auto-nettoyante." },
      { marker: "Années 2010", label: "Lancement du Fuel Convert System pour les hybrides bois-pellet." },
      { marker: "2022", label: "Good Design Award pour le modèle Soft." },
      { marker: "2024", label: "Environ 65 % de part de marché Italie sur le segment multicombustible domestique, distribution dans plusieurs pays européens." },
    ],
    distinctions: [
      { emoji: "🔄", title: "Source Feeding breveté", description: "Le pellet est poussé par le bas au lieu de tomber sur le brasier. Les cendres sont chassées dans un bac sous le foyer. Le brasier reste propre seul. Plus de nettoyage quotidien à la main." },
      { emoji: "🪵", title: "Fuel Convert System", description: "Une sonde reconnaît si tu as chargé du pellet, des bûches ou des broyés (coques, noyaux, marc). Le poêle bascule seul entre les modes. Aucun réglage manuel." },
      { emoji: "🌑", title: "Vitre Crystal Magic", description: "La vitre devient totalement opaque quand la flamme est éteinte. Plus de fond noir visible. Le poêle s'efface dans le mobilier quand il ne tourne pas." },
      { emoji: "🔇", title: "Mode SuperSilent", description: "Les ventilateurs s'arrêtent à la demande. La chaleur diffuse par convection naturelle, sans souffle audible. Idéal le soir dans un séjour ouvert sur les chambres." },
      { emoji: "🎛", title: "Canalisable intelligent", description: "Trois ventilateurs indépendants sur les versions canalisables. Chacun ajuste son débit selon la température mesurée dans la pièce qu'il dessert. Thermostats sans fil TriKey en option." },
      { emoji: "🇮🇹", title: "100 % fabriqué en interne", description: "Toutes les phases (idée, conception, fonderie, assemblage, tests) se déroulent dans l'usine de Sant'Oreste, près de Rome. Tradition familiale, deux générations, Good Design Award 2022." },
    ],
    modelsTable: [
      { name: "Soft", power: "14 à 26 kW", type: "Hybride bois-pellet hydro", forWhom: "Best-seller, Good Design Award 2022, remplacement chaudière." },
      { name: "Vert", power: "9 à 15 kW", type: "Hybride canalisable", forWhom: "Maison ouverte qui veut canaliser deux pièces." },
      { name: "Flow", power: "9 à 15 kW", type: "Pellet design moderne", forWhom: "Intérieur contemporain, lignes droites." },
      { name: "Curvy", power: "9 à 14 kW", type: "Pellet maïolique galbée", forWhom: "Intérieur classique ou bohème." },
      { name: "Split", power: "3 puissances", type: "Pellet céramique", forWhom: "Rendement 94,1 %, chambre céramique haut rendement." },
      { name: "Biotec", power: "26 à 34 kW", type: "Chaudière pellet ou hybride", forWhom: "Grandes maisons, ECS, remplacement chaudière fioul." },
    ],
    faq: [
      { question: "Girolami, c'est qui ?", answer: "Une famille italienne qui fabrique des poêles à Sant'Oreste, près de Rome, depuis 1970. Deux générations. Tout est fait dans la même usine. La marque a environ 65 % de part de marché en Italie sur le segment des poêles multicombustibles." },
      { question: "C'est quoi exactement le Source Feeding ?", answer: "C'est leur brevet d'alimentation par le bas. Au lieu de tomber sur le brasier, le pellet est poussé sous le brasier. Les cendres sont chassées dans un bac de collecte. Concrètement, tu ne nettoies plus le brasier tous les jours, tu vides le cendrier une fois par semaine." },
      { question: "Un Girolami peut-il fonctionner au pellet et au bois ?", answer: "Oui, sur la gamme hybride (Soft notamment). Le Fuel Convert System détecte automatiquement le combustible chargé. Tu mets du pellet, ça fonctionne au pellet. Tu mets des bûches, ça bascule en mode bois. Sans toucher au menu." },
      { question: "C'est silencieux ?", answer: "La fonction SuperSilent coupe les ventilateurs et fait diffuser la chaleur par convection naturelle, sans aucun souffle audible. Utile le soir, dans un séjour ouvert sur les chambres." },
      { question: "On peut piloter un Girolami depuis le smartphone ?", answer: "Oui. Wi-Fi de série sur les modèles modernes (Vert, Flow, Curvy). Application smartphone, programmation horaire, commande vocale via Alexa." },
      { question: "Quel modèle pour une maison de 150 m² ?", answer: "Pour un chauffage à air, un Vert 12 ou Vert 15 canalisable couvre confortablement, avec deux pièces canalisées. Pour un raccordement aux radiateurs, le Soft hydro 14 ou 18 kW est mieux adapté. On dimensionne ça gratuitement lors du diagnostic à domicile." },
    ],
    warranty:
      "Garantie constructeur Girolami. Mister Pellets assure le SAV pièces localement : intervention sous 48 à 72 h et stock des consommables courants en atelier.",
    tags: ["Italie", "Depuis 1970", "Source Feeding breveté", "Hybride bois-pellet"],
    officialUrl: "https://www.girolami.eu/",
    metaTitle: "Girolami en Wallonie, poêles italiens auto-nettoyants | Mister Pellets",
    metaDescription:
      "Girolami, fabricant italien familial depuis 1970, brevet Source Feeding auto-nettoyant. Hybrides bois-pellet, canalisables, hydro. Pose en Wallonie par Mister Pellets, prime 2026 incluse.",
  },

  // ───────────────────────────────────────────────────────────────────
  // DIELLE — tier 2, combustion brevetée par alimentation par le bas
  // ───────────────────────────────────────────────────────────────────
  dielle: {
    slug: "dielle",
    name: "Dielle",
    country: "Italie",
    tier: 2,
    foundedLabel: "Fabricant italien établi",
    positioning: "Combustion brevetée par alimentation par le bas, gamme complète",
    tagline: "Une flamme plus naturelle, un brasero qui se nettoie tout seul",
    intro:
      "Dielle se distingue par un système de combustion qu'elle a breveté : les pellets sont alimentés par le bas du brasero, et non par le haut comme la majorité des poêles. Concrètement, ça donne une flamme plus naturelle et plus calme (proche d'un poêle à bois traditionnel), un auto-nettoyage du brasero (donc moins d'entretien), et une tolérance aux pellets de qualité variable. Le fonctionnement est aussi plus silencieux. La gamme est complète : poêles air, canalisables, hydro pour le chauffage central, inserts, et même un modèle hybride qui fonctionne au pellets ET au bois.",
    history: [
      "Fabricant italien établi de poêles à pellets, basé en Italie.",
      "Système de combustion par alimentation par le bas développé en interne (vis sans fin en inox depuis le bas du brasero), breveté par la marque.",
      "Distribution européenne via revendeurs spécialisés dans le chauffage biomasse.",
    ],
    specialties: [
      "Système breveté de combustion par alimentation par le bas (vs par le haut sur la majorité des marques)",
      "Auto-nettoyage du brasero, moins d'entretien requis",
      "Tolérance accrue aux pellets de qualité variable",
      "Préchauffage et séchage des pellets avant combustion (rendement optimisé)",
      "Fonctionnement plus silencieux que les systèmes par alimentation par le haut",
      "Gamme : air, canalisable, hydro, inserts, hybride bois et pellets",
    ],
    modelHighlights: [
      { name: "Round", power: "Air", usp: "Gamme air au design rond, pour une pièce de vie" },
      { name: "Grecale", power: "Air", usp: "Compact et polyvalent, gamme air" },
      { name: "Bump Idro", power: "20 à 35 kW", usp: "Gamme hydro pour chauffage central via radiateurs ou plancher" },
      { name: "Ghibli Hybrid Idro", power: "Hydro hybride", usp: "Modèle qui fonctionne au pellets ET au bois, hydro" },
    ],
    warranty: "Garantie constructeur sur le corps de chauffe et la combustion (durée à vérifier au modèle).",
    tags: ["Italie", "Combustion par le bas", "Gamme complète", "Hybride bois pellets"],
    officialUrl: "https://www.diellespa.it/",
    metaTitle: "Dielle en Belgique, combustion brevetée par alimentation par le bas",
    metaDescription:
      "Dielle, fabricant italien de poêles à pellets avec système breveté de combustion par alimentation par le bas. Air, canalisable, hydro, hybride bois pellets. Pose en Wallonie.",
  },

  // ───────────────────────────────────────────────────────────────────
  // FERLUX — tier 2, fabricant espagnol, rapport qualité-prix
  // ───────────────────────────────────────────────────────────────────
  ferlux: {
    slug: "ferlux",
    name: "Ferlux",
    country: "Espagne",
    tier: 2,
    founded: 1996,
    positioning: "Fabricant espagnol historique, gamme complète, excellent rapport qualité-prix",
    tagline: "Plus de 28 ans d'activité, distribué dans plus de 30 pays",
    intro:
      "Ferlux est un fabricant espagnol qui produit des poêles à pellets, des cheminées et des barbecues depuis plus de 28 ans, basé en Andalousie (Polígono El Polear). La marque est présente dans plus de 30 pays. La gamme est complète : modèles à air avec ou sans ventilation, canalisables jusqu'à 12 à 15 kW, et hydro (gamme Agua) pour alimenter le chauffage central. Les rendements affichés sont parmi les meilleurs du marché (jusqu'à 94 %). Plusieurs couleurs sont disponibles, télécommande fournie de série, et un module domotique optionnel (4 HEAT) permet de piloter le poêle depuis un smartphone.",
    history: [
      "Création vers 1996 en Andalousie (Espagne).",
      "Spécialisation initiale : cheminées et barbecues, puis extension aux poêles à pellets.",
      "Aujourd'hui : distribution dans plus de 30 pays, présent en Belgique via le réseau de revendeurs spécialisés.",
    ],
    specialties: [
      "Gamme complète : air (convection naturelle ou ventilation forcée), canalisable, hydro, inserts",
      "Rendement annoncé jusqu'à 94 %",
      "Émissions CO faibles (0,02 % à 13 % O2 sur certains modèles)",
      "Télécommande fournie en standard",
      "Module domotique optionnel 4 HEAT pour pilotage smartphone",
      "Made in Spain, certifications CE, EN 13240",
    ],
    modelHighlights: [
      { name: "Helen", power: "Air", usp: "Modèle air pour pièce de vie, design contemporain" },
      { name: "Lyra", power: "12 kW", usp: "Canalisable jusqu'à 12 kW, plusieurs pièces" },
      { name: "Agua", power: "Hydro", usp: "Gamme hydro pour chauffage central et eau chaude sanitaire" },
    ],
    warranty: "Garantie légale 2 ans (Belgique) + garantie commerciale Mister Pellets 5 ans sur la pose.",
    tags: ["Espagne", "Andalousie", "Gamme complète", "Rendement jusqu'à 94 %"],
    officialUrl: "https://ferlux.es/",
    metaTitle: "Ferlux en Belgique, gamme complète poêles à pellets",
    metaDescription:
      "Ferlux, fabricant espagnol depuis plus de 28 ans, distribué dans 30+ pays. Air, canalisable, hydro. Rendement jusqu'à 94 %. Pose en Wallonie par Mister Pellets.",
  },
};

/** Ordre d'affichage : top tier d'abord, puis secondaires. */
export const BRAND_LIST: BrandData[] = [
  BRANDS.edilkamin,
  BRANDS.ek63,
  BRANDS.girolami,
  BRANDS.dielle,
  BRANDS.ferlux,
];

/** Les 3 marques mises en avant (traitement éditorial complet). */
export const TOP_TIER_BRANDS: BrandData[] = BRAND_LIST.filter((b) => b.tier === 1);

/**
 * Helper pour le label d'année à afficher (founded ou foundedLabel).
 */
export function brandFoundedLabel(b: BrandData): string {
  if (b.founded) return `Depuis ${b.founded}`;
  if (b.foundedLabel) return b.foundedLabel;
  return "";
}
