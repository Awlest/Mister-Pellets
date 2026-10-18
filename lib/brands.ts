/**
 * Source de vérité pour les marques distribuées par Mister Pellets.
 *
 * Hotfix V1.2 §H7 : rectification factuelle des positionnements.
 * Brief marques top-tier (2026-05) : ajout de Girolami, mise à niveau des
 * contenus Edilkamin et EK63, structure de page enrichie (repères, blocs
 * "ce qui distingue", FAQ, maillage). Sources : edilkamin.com, ek-63.com,
 * girolami.eu, diellespa.it, ferlux.es.
 *
 * Hiérarchie : 5 marques "top tier" (tier 1, traitement éditorial complet ;
 * Austroflamm et Cadel ajoutées le 18/10/2026)
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
  /** Fiche produit vers laquelle pointe la carte (maillage interne), si elle existe. */
  slug?: string;
}

export interface BrandFaqItem {
  question: string;
  answer: string;
}

export interface BrandData {
  slug: "edilkamin" | "ek63" | "girolami" | "dielle" | "ferlux" | "austroflamm" | "cadel";
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

  // ----- Blocs enrichis (tier 1), tous optionnels -----
  /** "Pourquoi on aime travailler avec X", 2 à 3 paragraphes. */
  whyWeLove?: string[];
  /** "X en quelques repères", timeline. */
  milestones?: BrandMilestone[];
  /** "Ce qui distingue X", 6 cartes. */
  distinctions?: BrandDistinction[];
  /** "Modèles disponibles", tableau enrichi. */
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
  // EDILKAMIN , tier1, référence italienne historique
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
      "Fondée en 1963 par Francesco Borsatti, Edilkamin est la référence du chauffage biomasse italien. On la pose depuis le début de l'atelier. C'est notre choix par défaut quand on cherche un poêle qui dure 20 ans sans broncher.",
    whyWeLove: [
      "Edilkamin, c'est la référence du poêle italien fiable. La marque a plus de 60 ans : siège à Lainate, près de Milan, usine historique à Gabbioneta Binanuova (province de Crémone), pôle technique et laboratoire de recherche à Lavagno, près de Vérone, et une seconde usine à Sárvár, en Hongrie. Résultat concret : des poêles qui chauffent vraiment, qui se règlent finement et qui supportent les hivers wallons sans broncher.",
      "On en pose depuis le début de l'atelier, et on a vu passer toutes les configurations possibles. Insert encastré dans une vieille cheminée, poêle d'angle dans un séjour ouvert, hydro pour chauffage central avec ballon tampon. Les retours après 5 à 10 ans d'utilisation sont systématiquement bons. Le SAV pièces est rapide en Belgique, c'est un point qui compte énormément quand on choisit pour 20 ans.",
      "C'est la marque qu'on recommande quand on veut un poêle qui sera encore là dans deux décennies, sans avoir à y penser tous les hivers.",
    ],
    milestones: [
      { marker: "1963", label: "Fondation de la marque par Francesco Borsatti." },
      { marker: "1982", label: "Transfert du siège opérationnel à Lainate, dans la banlieue nord de Milan." },
      { marker: "Usines", label: "Usine historique à Gabbioneta Binanuova (Crémone), seconde usine à Sárvár (Hongrie), recherche à Lavagno (Vérone)." },
      { marker: "Leonardo", label: "Le poêle règle seul sa combustion d'après la pression dans le foyer et la température des fumées." },
      { marker: "Aujourd'hui", label: "Plus de 250 collaborateurs et des poêles vendus dans plus de 30 pays." },
    ],
    distinctions: [
      { emoji: "🇮🇹", title: "Conçu en Italie", description: "Siège à Lainate (Milan), usine historique à Gabbioneta Binanuova (Crémone), laboratoire de recherche à Lavagno (Vérone), seconde usine à Sárvár (Hongrie)." },
      { emoji: "🧠", title: "Combustion Leonardo", description: "Un capteur de pression dans le foyer et une sonde de température des fumées : le poêle ajuste en permanence l'air et le débit de pellets. La combustion reste stable même si vous changez de marque de sacs, même quand l'humidité ambiante varie." },
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
      { question: "La technologie Leonardo, c'est utile en pratique ?", answer: "Très utile. Concrètement, le poêle s'auto-règle quand vous changez de marque de pellets, quand l'humidité ambiante varie, quand il fait très froid dehors. Vous n'avez rien à toucher dans le menu, la combustion reste optimale." },
      { question: "Edilkamin est compatible avec une cheminée ancienne ?", answer: "Oui dans la majorité des cas, avec un tubage inox flexible ou rigide. On vérifie la géométrie du conduit à la visite technique pour valider le diamètre minimum (80 mm pour la plupart des modèles, 100 mm pour les hydro)." },
      { question: "Est-ce qu'Edilkamin propose des modèles canalisables ?", answer: "Oui, la majorité de la gamme l'est. Le Kira2 Evo distribue même l'air chaud sur deux gaines indépendantes. Pratique pour chauffer une chambre à l'étage en plus du salon." },
    ],
    warranty:
      "Garantie constructeur Edilkamin. Mister Pellets assure le SAV pièces localement : intervention sous 48 à 72 h et stock des consommables courants en atelier.",
    tags: ["Italie", "Depuis 1963", "Gamme très large", "Technologie Leonardo"],
    officialUrl: "https://www.edilkamin.com/",
    metaTitle: "Edilkamin en Wallonie, revendeur officiel poêles italiens | Mister Pellets",
    metaDescription:
      "Edilkamin, marque italienne fondée en 1963, siège à Lainate près de Milan. Poêles à pellets premium, technologie Leonardo. Pose en 1 jour par Mister Pellets, TVA à 6 % en rénovation.",
  },

  // ───────────────────────────────────────────────────────────────────
  // EK63 , tier1, marque connectée du groupe Edilkamin
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
      "EK63 a été lancée par Edilkamin pour une raison simple : tout le monde veut un Edilkamin, mais tout le monde n'a pas le budget Edilkamin. La marque sœur reprend l'industrie, les méthodes, le service après-vente du groupe, et livre des poêles modernes à un tarif plus accessible. Le Wi-Fi Smart est intégré de série sur la majorité des modèles, donc vous pilotez depuis votre smartphone sans abonnement et sans option payante.",
      "L'autre point qui fait la différence en Wallonie, c'est l'étanchéité. La plupart des EK63 sont des poêles étanches. Concrètement, ils prennent l'air comburant directement à l'extérieur et n'aspirent pas l'air chaud de votre pièce. C'est ce qui les rend compatibles avec les maisons à VMC double flux, les BBC et les passives.",
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
      { emoji: "✅", title: "Certifications complètes", description: "CE, EN 14785, Ecodesign 2022, classe environnementale 5 étoiles D.M. 186." },
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
      { question: "Le Wi-Fi de série, c'est vraiment utile ?", answer: "Très. Vous programmez votre poêle à distance le dimanche soir pour le lendemain, vous l'allumez depuis le bureau pour rentrer dans un séjour chaud, vous surveillez la consommation de pellets. Et vous recevez les alertes (réservoir bas, entretien nécessaire) en direct." },
      { question: "EK63 fonctionne dans une maison BBC ou passive ?", answer: "Oui, c'est même là que la marque excelle. La majorité des modèles sont étanches : ils prennent l'air comburant à l'extérieur via une prise d'air dédiée. Ils sont donc compatibles avec les VMC double flux et n'aspirent pas l'air chaud de votre maison." },
      { question: "Quelle est la garantie sur un EK63 ?", answer: "Garantie constructeur officielle EK63 : 2 ans. Mister Pellets ajoute son service local : intervention sous 48 à 72 h, stock pièces courantes en atelier." },
      { question: "L'Entity 90+ à 31 cm, ça chauffe vraiment ?", answer: "Oui, 8,7 kW pour une chambre 31 cm de profondeur. On l'a posé dans plusieurs couloirs et halls en Wallonie. La performance est là, la canalisation distribue l'air chaud vers une pièce adjacente. Le seul vrai prérequis est un emplacement avec passage de fumée correct." },
    ],
    warranty:
      "Garantie constructeur EK63 : 2 ans. Mister Pellets ajoute son service local : intervention sous 48 à 72 h et stock des pièces courantes en atelier.",
    tags: ["Italie", "Groupe Edilkamin", "Wi-Fi Smart", "Étanche"],
    officialUrl: "https://www.ek-63.com/",
    metaTitle: "EK63 en Wallonie, poêles à pellets Wi-Fi du groupe Edilkamin | Mister Pellets",
    metaDescription:
      "EK63, marque connectée du groupe Edilkamin. Poêles à pellets étanches, Wi-Fi Smart de série, design moderne, prix accessible. Pose en Wallonie par Mister Pellets, TVA à 6 % en rénovation.",
  },

  // ───────────────────────────────────────────────────────────────────
  // GIROLAMI , tier1, polycombustible breveté (intégration neuve)
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
    ],
    distinctions: [
      { emoji: "🔄", title: "Source Feeding breveté", description: "Le pellet est poussé par le bas au lieu de tomber sur le brasier. Les cendres sont chassées dans un bac sous le foyer. Le brasier reste propre seul. Plus de nettoyage quotidien à la main." },
      { emoji: "🪵", title: "Fuel Convert System", description: "Une sonde reconnaît si vous avez chargé du pellet, des bûches ou des broyés certifiés (coques, noyaux, plaquettes, parfois avec un accessoire). Le poêle bascule seul entre les modes. Aucun réglage manuel." },
      { emoji: "🌑", title: "Vitre Crystal Magic", description: "La vitre devient totalement opaque quand la flamme est éteinte. Plus de fond noir visible. Le poêle s'efface dans le mobilier quand il ne tourne pas." },
      { emoji: "🔇", title: "Mode SuperSilent", description: "Les ventilateurs s'arrêtent à la demande. La chaleur diffuse par convection naturelle, sans souffle audible. Idéal le soir dans un séjour ouvert sur les chambres." },
      { emoji: "🎛", title: "Canalisable intelligent", description: "Trois ventilateurs indépendants sur les versions canalisables. Chacun ajuste son débit selon la température mesurée dans la pièce qu'il dessert. Thermostats sans fil TriKey en option." },
      { emoji: "🇮🇹", title: "100 % fabriqué en interne", description: "Toutes les phases (idée, conception, fonderie, assemblage, tests) se déroulent dans l'usine de Sant'Oreste, près de Rome. Tradition familiale, deux générations, Good Design Award 2022." },
    ],
    modelsTable: [
      { name: "Soft", power: "4 versions, jusqu'à 24,1 kW", type: "Hybride bois-pellet hydro", forWhom: "Best-seller, Good Design Award 2022, remplacement chaudière." },
      { name: "Vert", power: "8,3 à 13 kW", type: "Pellet canalisable", forWhom: "Maison ouverte qui veut canaliser deux pièces." },
      { name: "Flow", power: "8,3 à 13 kW", type: "Pellet design moderne", forWhom: "Intérieur contemporain, lignes droites." },
      { name: "Curvy", power: "8,3 à 13 kW", type: "Pellet maïolique galbée", forWhom: "Intérieur classique ou bohème." },
      { name: "Split", power: "3 puissances", type: "Pellet céramique", forWhom: "Rendement 94,1 %, chambre céramique haut rendement." },
      { name: "Biotec", power: "26 à 34 kW", type: "Chaudière pellet ou hybride", forWhom: "Grandes maisons, ECS, remplacement chaudière fioul." },
    ],
    faq: [
      { question: "Girolami, c'est qui ?", answer: "Une famille italienne qui fabrique des poêles à Sant'Oreste, près de Rome, depuis 1970. Deux générations. Tout est fait dans la même usine." },
      { question: "C'est quoi exactement le Source Feeding ?", answer: "C'est leur brevet d'alimentation par le bas. Au lieu de tomber sur le brasier, le pellet est poussé sous le brasier. Les cendres sont chassées dans un bac de collecte. Concrètement, vous ne nettoyez plus le brasier tous les jours, vous videz le cendrier une fois par semaine." },
      { question: "Un Girolami peut-il fonctionner au pellet et au bois ?", answer: "Oui, sur la gamme hybride (Soft notamment). Le Fuel Convert System détecte automatiquement le combustible chargé. Vous mettez du pellet, ça fonctionne au pellet. Vous mettez des bûches, ça bascule en mode bois. Sans toucher au menu." },
      { question: "C'est silencieux ?", answer: "La fonction SuperSilent coupe les ventilateurs et fait diffuser la chaleur par convection naturelle, sans aucun souffle audible. Utile le soir, dans un séjour ouvert sur les chambres." },
      { question: "On peut piloter un Girolami depuis le smartphone ?", answer: "Oui. Wi-Fi de série sur les modèles modernes (Vert, Flow, Curvy). Application smartphone, programmation horaire, commande vocale via Alexa." },
      { question: "Quel modèle pour une maison de 150 m² ?", answer: "Pour un chauffage à air, un Vert canalisable de 10,8 ou 13 kW couvre confortablement, avec deux pièces canalisées. Pour un raccordement aux radiateurs, un Soft hydro de 15 ou 18,1 kW est mieux adapté. On dimensionne ça gratuitement lors du diagnostic à domicile." },
    ],
    warranty:
      "Garantie constructeur Girolami. Mister Pellets assure le SAV pièces localement : intervention sous 48 à 72 h et stock des consommables courants en atelier.",
    tags: ["Italie", "Depuis 1970", "Source Feeding breveté", "Hybride bois-pellet"],
    officialUrl: "https://www.girolami.eu/",
    metaTitle: "Girolami en Wallonie, poêle hybride bois-pellet auto-nettoyant | Mister Pellets",
    metaDescription:
      "Girolami, fabricant italien familial depuis 1970, brevet Source Feeding auto-nettoyant. Hybrides bois-pellet, canalisables, hydro. Pose en Wallonie par Mister Pellets, TVA à 6 % en rénovation.",
  },

  // ───────────────────────────────────────────────────────────────────
  // DIELLE , tier2, combustion brevetée par alimentation par le bas
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
  // FERLUX , tier2, fabricant espagnol, rapport qualité-prix
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

  // ───────────────────────────────────────────────────────────────────
  // AUSTROFLAMM , tier1, haut de gamme autrichien (arrivée octobre 2026)
  // Sources : austroflamm.com (qui nous sommes, entités, technologies,
  // catalogues pellets 07/2026, notices Clou Pellet et Clou Duo), registre
  // autrichien via North Data et evi.gv.at, OÖ Nachrichten 25/11/2023, DIBt
  // (agrément Z-43.12-489). Relevé du 18/10/2026.
  // Écarté faute de preuve : « fabriqué en Autriche » (la marque parle de
  // plusieurs sites, en Autriche et en Allemagne), prix de design, garantie
  // de 6 ans en Belgique (valable en Autriche et en Allemagne seulement).
  // ───────────────────────────────────────────────────────────────────
  austroflamm: {
    slug: "austroflamm",
    name: "Austroflamm",
    country: "Autriche",
    tier: 1,
    founded: 1983,
    positioning: "Haut de gamme autrichien, poêles à pellets silencieux et mixtes bois-pellets",
    tagline: "Le poêle à pellets qu'on n'entend pas",
    badge: "Marque autrichienne haut de gamme",
    intro:
      "Austroflamm est une entreprise familiale autrichienne fondée en 1983 par Ferdinand Huemer, qui la dirige toujours, à Krenglbach en Haute-Autriche. Ses poêles à pellets chauffent sans ventilateur dans la pièce, et ses poêles mixtes Duo brûlent des bûches ou des pellets, puis repassent seuls aux pellets quand le bois a fini de brûler. Arrivée chez Mister Pellets en octobre 2026.",
    heroSubtitle:
      "Fondée en 1983 par Ferdinand Huemer en Haute-Autriche, toujours indépendante et dirigée par son fondateur. Des poêles dessinés par Cesare Monti, des portes en fonte massive, des pellets qui chauffent sans souffler d'air dans la pièce. C'est la marque haut de gamme qui rejoint notre sélection en octobre 2026.",
    whyWeLove: [
      "Austroflamm, c'est d'abord le silence. La plupart des poêles à pellets soufflent l'air chaud avec un ventilateur, et ce ronronnement finit par s'entendre dans un séjour calme. Les poêles à pellets Austroflamm n'en ont pas : la chaleur sort par convection naturelle, comme sur un poêle à bois. Il reste l'extracteur de fumées, indispensable sur tout poêle à pellets, mais plus de soufflerie dans la pièce. Le soir, devant la télé ou un livre, ça change tout.",
      "Ensuite, la finition. Austroflamm est une entreprise familiale, fondée en 1983 par Ferdinand Huemer, qui la dirige encore. Les poêles sont dessinés par Cesare Monti, un designer italien qui travaille exclusivement pour la marque. Portes en fonte massive, grande vitre ronde sur la série Clou, habillages en céramique ou en pierre naturelle selon les modèles. Le foyer est garni de Keramott, un matériau breveté développé et produit par Austroflamm. La marque ne vend que par des revendeurs agréés, qui posent et mettent en service.",
      "Enfin, les poêles mixtes Duo, et c'est souvent pour eux qu'on nous appelle. Vous allumez aux pellets le matin, vous chargez des bûches le soir pour le plaisir du feu de bois. Le poêle le détecte, règle l'air tout seul, et quand les bûches ont fini de brûler, il repart aux pellets sans que vous touchiez à rien. En cas de coupure de courant, le mode bois continue de chauffer.",
    ],
    milestones: [
      { marker: "1983", label: "Ferdinand Huemer fonde la marque en Haute-Autriche (date donnée par la marque)." },
      { marker: "1995", label: "Premier poêle à pellets Austroflamm." },
      { marker: "2001", label: "La société prend le nom d'Austroflamm GmbH, détenue par la holding de son fondateur." },
      { marker: "2023", label: "Agrément allemand DIBt des Clou Duo, Mo Duo et Scotty Duo pour le fonctionnement indépendant de l'air de la pièce, valable jusqu'en 2028." },
      { marker: "2023", label: "Environ 25 000 poêles vendus dans l'année, selon le quotidien régional OÖ Nachrichten." },
      { marker: "2026", label: "Arrivée chez Mister Pellets : poêles à pellets et mixtes Duo posés en Wallonie." },
    ],
    distinctions: [
      { emoji: "🔇", title: "Pas de ventilateur dans la pièce", description: "Les poêles à pellets Austroflamm chauffent par convection naturelle, sans ventilateur d'air ambiant. Aucun souffle, aucun bruit de soufflerie dans le séjour. Seul le kit de canalisation en option, sur certains modèles, est ventilé." },
      { emoji: "🔁", title: "Duo : du bois aux pellets tout seul", description: "Le poêle mixte détecte les bûches que vous chargez et règle l'air de lui-même. Quand le bois a brûlé, il redémarre aux pellets si vous ne l'avez pas éteint. Au bois, il chauffe aussi sans électricité." },
      { emoji: "🧱", title: "Foyer en Keramott", description: "Matériau de foyer breveté, développé et produit par Austroflamm, qui résiste jusqu'à environ 1 200 °C et retient moins la suie. Il équipe tous les appareils de la marque." },
      { emoji: "🌬️", title: "Air de combustion pris dehors", description: "Tous les poêles à pellets Austroflamm ont un raccord d'air extérieur de série. La combustion n'aspire pas l'air de la pièce : un vrai atout dans une maison bien isolée avec VMC." },
      { emoji: "🎨", title: "Design Cesare Monti", description: "Un designer italien qui dessine exclusivement pour Austroflamm. Portes en fonte massive, vitre ronde de la série Clou, habillages acier, céramique Bright White ou Dark Anthracite, pierre naturelle." },
      { emoji: "🎛", title: "Une molette, ou le smartphone", description: "Sur les Clou Pellet et l'Ella, on règle la chaleur avec une simple molette. Avec la box Wi-Fi WiRCU en option, l'appli PelletControl programme, allume et suit le poêle à distance." },
    ],
    modelsTable: [
      { name: "Clou Pellet 8", power: "8 kW", type: "Pellets, sans ventilateur", forWhom: "Vitre ronde, réservoir de 36 kg et jusqu'à 60 h d'autonomie. Rendement de 90 %, pour 98 à 255 m³.", slug: "austroflamm-clou-pellet-8" },
      { name: "Clou Pellet 10", power: "10 kW", type: "Pellets, sans ventilateur", forWhom: "La même carrosserie que le 8 kW, pour les maisons plus grandes : jusqu'à 350 m³.", slug: "austroflamm-clou-pellet-10" },
      { name: "Clou Compact Pellet", power: "6 kW", type: "Pellets, compact", forWhom: "52 cm de large pour 49,9 cm de profondeur : la place d'un petit meuble.", slug: "austroflamm-clou-compact-pellet" },
      { name: "Ruby 2.0", power: "8 kW", type: "Pellets, canalisable avec kit", forWhom: "Porte arrondie en fonte, poignée en bois, acier ou céramique. Rendement de 90 %.", slug: "austroflamm-ruby" },
      { name: "Ella", power: "7,7 kW", type: "Pellets, rond", forWhom: "Vitre bombée, habillage acier ou céramique blanche, grille basculante pour vider le brûleur.", slug: "austroflamm-ella" },
      { name: "Perry", power: "7,5 kW", type: "Pellets, lignes droites", forWhom: "Acier ou céramique, programmation hebdomadaire de série, 53,5 cm de large.", slug: "austroflamm-perry" },
      { name: "Clou Duo", power: "7 kW pellets, 6,8 kW bois", type: "Mixte bois-pellets", forWhom: "43 cm de profondeur pour 81 cm de large, bascule automatique du bois aux pellets.", slug: "austroflamm-clou-duo" },
      { name: "Mo Duo Cook", power: "9,4 kW", type: "Mixte bois-pellets, plaque de cuisson", forWhom: "On chauffe et on cuisine sur le dessus, aux pellets comme au bois.", slug: "austroflamm-mo-duo-cook" },
      { name: "Quadra Duo", power: "8,3 kW pellets, 6,3 kW bois", type: "Mixte bois-pellets", forWhom: "Lignes carrées, 41 cm de profondeur, habillage acier ou pierre naturelle.", slug: "austroflamm-quadra-duo" },
    ],
    faq: [
      { question: "Austroflamm, c'est qui ?", answer: "Une entreprise familiale autrichienne, fondée en 1983 par Ferdinand Huemer, qui la dirige toujours. Le siège est à Krenglbach, en Haute-Autriche. Elle fabrique des poêles à bois, à pellets et mixtes bois-pellets, vendus uniquement par des revendeurs agréés. Le premier poêle à pellets de la marque date de 1995." },
      { question: "Un poêle à pellets sans ventilateur, ça chauffe vraiment ?", answer: "Oui. La chaleur se diffuse par convection naturelle et par rayonnement, comme avec un poêle à bois. La pièce monte un peu moins vite en température qu'avec un poêle ventilé, mais la chaleur est plus douce et vous n'entendez plus de soufflerie. Pour une maison très ouverte ou plusieurs pièces à chauffer, on regarde ensemble s'il vaut mieux un modèle canalisable." },
      { question: "Comment fonctionne un poêle mixte Duo ?", answer: "Il brûle des pellets ou des bûches dans le même foyer. Vous chargez du bois, le poêle le détecte et règle l'air de combustion tout seul. Quand les bûches ont brûlé, il redémarre aux pellets si vous ne l'avez pas éteint, donc la maison reste chauffée même si vous êtes sortis. En cas de coupure de courant, le mode bois continue de fonctionner." },
      { question: "Un Austroflamm convient-il à une maison basse énergie ou passive ?", answer: "Les poêles à pellets Austroflamm ont tous un raccord d'air extérieur de série : l'air de combustion vient du dehors, pas de la pièce. Les Clou Duo, Mo Duo et Scotty Duo ont l'agrément allemand DIBt pour le fonctionnement indépendant de l'air ambiant, valable jusqu'en 2028. On vérifie toujours la compatibilité avec votre ventilation lors de la visite technique." },
      { question: "Peut-on piloter un Austroflamm depuis son téléphone ?", answer: "Oui, avec la box Wi-Fi WiRCU, en option, et l'appli gratuite PelletControl : programmation journalière ou hebdomadaire, mode Eco, statistiques, rappels d'entretien. Sans la box, les Clou Pellet et l'Ella se règlent avec une molette, les autres modèles avec leur écran." },
      { question: "Pourquoi un Austroflamm coûte-t-il plus cher qu'un poêle classique ?", answer: "Vous payez la finition et les choix techniques : portes en fonte massive, habillages en céramique ou en pierre, foyer en Keramott breveté, pas de ventilateur dans la pièce, et pour les Duo une régulation qui gère seule le passage du bois aux pellets. Les rendements vont de 87 à 90 % aux pellets, en classe A+." },
      { question: "Quelle garantie sur un Austroflamm en Belgique ?", answer: "Dans ses notices, Austroflamm garantit le corps de chauffe 6 ans et les autres pièces en acier et en fonte 2 ans, mais cette garantie commerciale vaut pour l'Autriche et l'Allemagne. En Belgique, ce sont les conditions de l'importateur qui s'appliquent : on vous les remet par écrit avec le devis. Dans tous les cas, la garantie suppose une pose par un professionnel et un entretien chaque année." },
    ],
    warranty:
      "Austroflamm garantit le corps de chauffe 6 ans et les autres pièces en acier et en fonte 2 ans en Autriche et en Allemagne ; en Belgique, les conditions de l'importateur s'appliquent et on vous les remet par écrit avec le devis. Elles supposent une pose par un professionnel et un entretien annuel : on s'occupe des deux, avec intervention sous 48 à 72 h.",
    tags: ["Autriche", "Depuis 1983", "Sans ventilateur", "Mixte bois-pellets"],
    officialUrl: "https://www.austroflamm.com/",
    metaTitle: "Austroflamm en Wallonie, poêles à pellets haut de gamme et mixtes Duo | Mister Pellets",
    metaDescription:
      "Austroflamm, marque autrichienne haut de gamme depuis 1983 : poêles à pellets sans ventilateur, mixtes bois-pellets Duo, design Cesare Monti. Pose en Wallonie par Mister Pellets, TVA à 6 % en rénovation.",
  },

  // ───────────────────────────────────────────────────────────────────
  // CADEL , tier1, connecté accessible du groupe MCZ (arrivée octobre 2026)
  // Sources : cadelsrl.com (entreprise, FAQ, communiqués inauguration 2023
  // et iF 2026, catalogue CADEL-CONSUMER-2026), certificat ISO 9001 Kiwa
  // Cermet n° 13202-A, QdP News, Il Nordest 15/04/2025, ENplus 27/01/2025,
  // Tecnoinstalación 12/03/2026. Relevé du 18/10/2026.
  // Écarté : effectif et chiffre d'affaires (sources divergentes), sens des
  // suffixes Up / Ps / Twin (jamais écrit par Cadel).
  // ───────────────────────────────────────────────────────────────────
  cadel: {
    slug: "cadel",
    name: "Cadel",
    country: "Italie",
    tier: 1,
    founded: 1949,
    positioning: "Connecté accessible, gamme pellets très large",
    tagline: "Le poêle connecté italien, pour chaque coin de la maison",
    badge: "Marque italienne du groupe MCZ",
    intro:
      "Cadel est un fabricant italien né en 1949 à Santa Lucia di Piave, près de Trévise, et membre du groupe MCZ depuis 2013. Tous ses poêles à pellets ont le Wi-Fi et le Bluetooth intégrés, et la gamme est l'une des plus larges qu'on pose : poêles plats de 27 cm, canalisables à une ou deux sorties, inserts et thermopoêles hydro. Arrivée chez Mister Pellets en octobre 2026.",
    heroSubtitle:
      "Fondée en 1949 par Umberto Cadel, entrée dans le groupe MCZ en 2013, usine neuve en 2023 près de Trévise. Wi-Fi et Bluetooth intégrés, brasero autonettoyant sur les modèles récents, des poêles plats qui tiennent dans un couloir, à un prix qui reste raisonnable. Cadel joue chez nous le même rôle qu'EK63.",
    whyWeLove: [
      "Cadel, c'est d'abord une histoire de famille, commencée en 1949 à Santa Lucia di Piave, près de Trévise, par Umberto Cadel, spécialiste des cuisinières et des poêles à bois, qui est ensuite passé au pellet. Depuis 2013, la marque fait partie du groupe MCZ, un des grands noms italiens du chauffage au bois et aux pellets. Le parallèle avec EK63 et Edilkamin est assez juste : Cadel profite du savoir-faire d'un grand groupe, avec des poêles plus simples et un prix plus doux.",
      "La fabrication se fait dans une usine inaugurée en mars 2023 : 15 000 m² de production, dix lignes d'assemblage, découpe et pliage de la tôle, soudure, peinture et montage sur place, 400 kW de panneaux photovoltaïques sur les toits. L'entreprise est certifiée ISO 9001 depuis 2006. En 2022, Cadel a vendu 45 000 poêles, et selon la presse économique italienne, la Belgique fait partie de ses premiers marchés à l'export.",
      "Sur le terrain, ce qu'on apprécie, c'est d'avoir une réponse pour presque chaque maison. Un couloir de 1 m de large : un Grace de 27 cm de profondeur. Deux chambres à chauffer en plus : un Vesta Plus ou un Mithos Plus à deux sorties d'air chaud. Une vieille cheminée ouverte : un insert Zefiro. Des radiateurs à alimenter : un River Idro. Et sur tous, le pilotage depuis le téléphone avec l'appli gratuite Easy Connect Plus, même sans Wi-Fi grâce au Bluetooth.",
    ],
    milestones: [
      { marker: "1949", label: "Umberto Cadel fonde l'entreprise à Santa Lucia di Piave, près de Trévise." },
      { marker: "2006", label: "Première certification ISO 9001, renouvelée depuis (Kiwa Cermet, valable jusqu'en 2027)." },
      { marker: "2013", label: "Cadel rejoint le groupe MCZ, de la famille Zanette." },
      { marker: "2023", label: "Nouvelle usine de 15 000 m², 10 lignes d'assemblage, 400 kW de photovoltaïque." },
      { marker: "2026", label: "iF Design Award pour le poêle à pellets Spin Plus 9, dessiné par Andrea Lazzari." },
      { marker: "2026", label: "Arrivée chez Mister Pellets : toute la gamme pellets posée en Wallonie." },
    ],
    distinctions: [
      { emoji: "📱", title: "Wi-Fi et Bluetooth intégrés", description: "Avec l'appli gratuite Easy Connect Plus, vous allumez, programmez, réglez et éteignez le poêle depuis votre téléphone, avec des alertes en cas d'anomalie ou d'entretien. En Bluetooth, ça marche même sans réseau Wi-Fi." },
      { emoji: "🧹", title: "Brasero autonettoyant Autoclean", description: "À chaque allumage, le brasero se débarrasse de ses résidus : il tourne sur les poêles à air, il bascule contre une surface dentelée sur les hydros. Le nettoyage passe de tous les jours à une fois par semaine, voire moins, selon Cadel." },
      { emoji: "📐", title: "Des poêles plats de 27 à 33 cm", description: "Grace (27 cm), Spirit (27,5 cm), Baggy (28 cm), Luce (28,7 cm), Elle (29,5 cm), Vesta (33 cm) : de quoi chauffer un couloir, un hall ou une petite pièce sans empiéter." },
      { emoji: "🌡", title: "Canalisable, une température par pièce", description: "La gamme Plus envoie l'air chaud vers une ou deux pièces voisines, avec un moteur par sortie. Le Zone Control, de série ou en option selon le modèle, règle une température différente dans chaque pièce." },
      { emoji: "🌬️", title: "Chambre de combustion étanche", description: "L'air de combustion vient directement de l'extérieur, pas de la pièce : moins d'émissions, plus de sécurité, et la compatibilité avec une maison bien isolée équipée d'une VMC." },
      { emoji: "🏭", title: "Fabriqué près de Trévise", description: "Usine neuve depuis 2023, tôlerie, soudure, peinture et assemblage sur place, ISO 9001 depuis 2006. Toute la gamme pellets est en classe A+ (A++ pour une partie des hydros) et 7 étoiles Flamme Verte." },
    ],
    modelsTable: [
      { name: "Cristal Plus 9", power: "8,5 kW", type: "Canalisable étanche", forWhom: "Grande porte bombée en fonte, une sortie d'air chaud vers une pièce voisine. Rendement de 90 %.", slug: "cadel-cristal-plus-9" },
      { name: "Spin Plus 9 Up-Twin Autoclean", power: "8,5 kW", type: "Canalisable, iF Design Award 2026", forWhom: "Brasero rotatif autonettoyant, sortie des fumées par le haut, design primé.", slug: "cadel-spin-plus-9-up-twin-autoclean" },
      { name: "Vesta Plus 11 Autoclean", power: "10,5 kW", type: "Plat, deux sorties d'air chaud", forWhom: "33 cm de profondeur pour 10,5 kW, deux pièces voisines chauffées en plus.", slug: "cadel-vesta-plus-11-autoclean" },
      { name: "Grace 7", power: "6,9 kW", type: "Plat, 27 cm", forWhom: "Pour un couloir ou un hall, au sol ou fixé au mur.", slug: "cadel-grace-7" },
      { name: "Mithos Plus 14 Ps", power: "13,7 kW", type: "Canalisable, deux sorties", forWhom: "Un des plus puissants de la gamme à air : jusqu'à 390 m³ et deux pièces canalisées.", slug: "cadel-mithos-plus-14-ps" },
      { name: "Sound 7 Up-Twin", power: "7 kW", type: "Rond, vitre Magic Glass", forWhom: "La vitre s'assombrit quand le poêle est éteint. Sortie des fumées par le haut.", slug: "cadel-sound-7-up-twin" },
      { name: "Zefiro 9", power: "9 kW", type: "Insert pour cheminée", forWhom: "Transforme une cheminée ouverte en chauffage aux pellets, canalisable avec kit.", slug: "cadel-zefiro-9" },
      { name: "River Idro 18 Autoclean", power: "18 kW", type: "Hydro, classe A++", forWhom: "13,2 kW pour les radiateurs ou le plancher chauffant, brasero autonettoyant.", slug: "cadel-river-idro-18-autoclean" },
      { name: "Saturno 24", power: "24,7 kW", type: "Insert hydro", forWhom: "Dans une cheminée existante, 19 kW cédés à l'eau, réservoir de 40 kg.", slug: "cadel-saturno-24" },
    ],
    faq: [
      { question: "Cadel, c'est qui ?", answer: "Un fabricant italien fondé en 1949 par Umberto Cadel à Santa Lucia di Piave, près de Trévise. Depuis 2013, Cadel fait partie du groupe MCZ, de la famille Zanette. Les poêles sont fabriqués dans une usine inaugurée en 2023 sur la même commune, certifiée ISO 9001 depuis 2006." },
      { question: "Cadel ou EK63 : quelle différence ?", answer: "Les deux jouent le même rôle : du connecté et de l'étanche à un prix plus doux que la marque phare de leur groupe (MCZ pour Cadel, Edilkamin pour EK63). Cadel a une gamme plus large en formats (poêles plats de 27 à 33 cm, inserts, hydros jusqu'à 24,7 kW) et le brasero autonettoyant Autoclean sur ses modèles récents. EK63 a l'Entity 90+ de 31 cm et le service du groupe Edilkamin. On compare les deux sur votre projet, modèle par modèle." },
      { question: "Le Wi-Fi est-il vraiment intégré ?", answer: "Oui : Cadel annonce le Wi-Fi et le Bluetooth intégrés sur ses poêles à pellets, avec l'appli gratuite Easy Connect Plus (iOS et Android). Vous réglez la puissance, la température, les canalisations, la programmation, et pour un hydro la température de l'eau. Sur quelques modèles d'entrée de gamme, la fiche parle de Wi-Fi à prévoir : on vous le confirme au devis." },
      { question: "Autoclean, ça veut dire plus aucun nettoyage ?", answer: "Non, mais beaucoup moins. Le brasero se vide de lui-même à chaque allumage, et le nettoyage passe de tous les jours à une fois par semaine, voire moins, selon Cadel. Il faut toujours vider le tiroir à cendres et faire l'entretien annuel par un technicien." },
      { question: "Quel Cadel pour un couloir ou une petite pièce ?", answer: "Un poêle plat : Grace 7 (27 cm de profondeur, fixation murale possible), Spirit 5 (27,5 cm), Baggy 7 (28 cm), Luce Plus 9 (28,7 cm) ou Elle Plus 9 (29,5 cm). Si vous voulez aussi chauffer la pièce d'à côté, le Vesta Plus 11, à 33 cm, a deux sorties d'air chaud." },
      { question: "Cadel fait-il des poêles pour les radiateurs ?", answer: "Oui : les thermopoêles Maya Idro et River Idro, de 18 et 24 kW, et les inserts hydro Saturno 16 et 24, qui s'installent dans une cheminée existante. Le kit hydraulique est compris. Les River Idro Autoclean et les Saturno sont en classe A++." },
      { question: "Quelle garantie sur un Cadel ?", answer: "Deux ans à partir de la date d'achat, facture faisant foi : pièces défectueuses remplacées ou réparées gratuitement, hors pièces d'usure (joints, vitre, pièces amovibles du foyer). Elle suppose une installation par un professionnel et des pellets certifiés. Cadel a un importateur exclusif pour le Benelux, basé à Audenarde, ce qui raccourcit les délais de pièces." },
    ],
    warranty:
      "Garantie constructeur Cadel : 2 ans à partir de la date d'achat, facture faisant foi, sur les pièces défectueuses d'origine (joints, vitre et pièces amovibles du foyer exclus). Elle suppose une installation par un professionnel : on pose, on met en service et on assure le SAV, avec intervention sous 48 à 72 h.",
    tags: ["Italie", "Depuis 1949", "Groupe MCZ", "Wi-Fi intégré", "Autoclean"],
    officialUrl: "https://cadelsrl.com/",
    metaTitle: "Cadel en Wallonie, poêles à pellets Wi-Fi du groupe MCZ | Mister Pellets",
    metaDescription:
      "Cadel, fabricant italien depuis 1949, groupe MCZ : poêles à pellets Wi-Fi et Bluetooth intégrés, brasero Autoclean, poêles plats, canalisables et hydro. Pose en Wallonie par Mister Pellets, TVA à 6 % en rénovation.",
  },
};

/** Ordre d'affichage : top tier d'abord, puis secondaires. */
export const BRAND_LIST: BrandData[] = [
  BRANDS.edilkamin,
  BRANDS.ek63,
  BRANDS.girolami,
  BRANDS.austroflamm,
  BRANDS.cadel,
  BRANDS.dielle,
  BRANDS.ferlux,
];

/** Les 5 marques mises en avant (traitement éditorial complet). */
export const TOP_TIER_BRANDS: BrandData[] = BRAND_LIST.filter((b) => b.tier === 1);

/**
 * Helper pour le label d'année à afficher (founded ou foundedLabel).
 */
export function brandFoundedLabel(b: BrandData): string {
  if (b.founded) return `Depuis ${b.founded}`;
  if (b.foundedLabel) return b.foundedLabel;
  return "";
}
