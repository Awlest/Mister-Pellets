/**
 * Source de vérité pour les 4 marques distribuées par Mister Pellets.
 * Phase 3 : data en dur. Phase 5 : migration vers collection Payload `Brands`.
 */

export interface BrandData {
  slug: "edilkamin" | "ek63" | "dielle" | "ferlux";
  name: string;
  country: string;
  founded: number;
  positioning: string;
  tagline: string;
  intro: string;
  history: string[];
  specialties: string[];
  modelHighlights: { name: string; power: string; usp: string }[];
  warranty: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

export const BRANDS: Record<BrandData["slug"], BrandData> = {
  edilkamin: {
    slug: "edilkamin",
    name: "Edilkamin",
    country: "Italie",
    founded: 1963,
    positioning: "Premium",
    tagline: "La référence premium",
    intro:
      "Edilkamin est le constructeur italien historique des poêles à pellets. Fondé en 1963 à Lainate (Lombardie), il est devenu la marque de référence haut de gamme grâce à sa technologie Leonardo® de combustion intelligente et sa fonderie interne. C'est le choix par défaut quand tu veux un poêle qui tient sans drift sur 15-20 ans.",
    history: [
      "1963 : fondation à Lainate (Italie) par la famille Bertucci, autour de la fabrication de cheminées et inserts.",
      "Années 90 : entrée sur le marché des poêles à pellets, alors balbutiant en Italie.",
      "2010s : développement de la technologie Leonardo® qui ajuste automatiquement la combustion en fonction du tirage du conduit et du type de pellet.",
      "Aujourd'hui : leader européen sur le segment premium avec sa propre fonderie en Italie, présent dans plus de 40 pays.",
    ],
    specialties: [
      "Combustion adaptive Leonardo® — meilleur rendement avec n'importe quel pellet",
      "Fonderie interne — pièces détachées garanties 20 ans",
      "Designs italiens travaillés (gammes Lena, Tally, Blade, Mood)",
      "Modèles étanches RT2012 pour maisons basse consommation",
      "Pilotage app smartphone (gamme connectée)",
      "Garantie 5 ans pièces et main d'œuvre standard",
    ],
    modelHighlights: [
      { name: "Blade Plus", power: "9 kW", usp: "Étanche moderne pour maisons BBC, design vertical compact" },
      { name: "Lena", power: "11 kW", usp: "Best-seller pour pièces de vie 80-150 m², stéatite ou céramique" },
      { name: "Mood Plus", power: "11 kW", usp: "Canalisable jusqu'à 8 m, idéal maisons à étage" },
    ],
    warranty: "5 ans constructeur, prolongée par notre service entretien annuel.",
    tags: ["Premium", "Italie", "Fonderie interne", "Garantie 5 ans"],
    metaTitle: "Edilkamin en Belgique — Tous les modèles | Mister Pellets",
    metaDescription:
      "Découvrez la gamme Edilkamin en Wallonie : poêles à pellets premium italiens, technologie Leonardo®, durabilité 15-20 ans. Conseil expert, pose en 1 jour, garantie 5 ans.",
  },

  ek63: {
    slug: "ek63",
    name: "EK63",
    country: "Italie",
    founded: 2010,
    positioning: "Connecté · qualité-prix",
    tagline: "Smart Fire WiFi de série",
    intro:
      "EK63 est une marque italienne qui s'est imposée sur le segment qualité-prix grâce à sa connectivité Smart Fire WiFi de série. Sans surcoût pour l'app, sans abonnement caché. La gamme est compacte, étanche, souvent canalisable. Le bon compromis entre tech moderne et budget maîtrisé.",
    history: [
      "2010 : création de la marque en Italie du Nord, avec un positionnement disruptif (connectivité native, prix accessible).",
      "2015-2020 : développement de la suite Smart Fire (app iOS/Android, programmation hebdomadaire, alertes maintenance).",
      "Aujourd'hui : présent dans toute l'Europe, particulièrement apprécié dans les pays où le smart home est entré dans les habitudes (Belgique, Pays-Bas, Allemagne).",
    ],
    specialties: [
      "Smart Fire WiFi inclus sur tous les modèles, sans abonnement",
      "Modèles étanches compacts (parfaits pour PEB B/A)",
      "Canalisables sur la plupart des modèles principaux",
      "Bon rapport qualité-prix : entre 1 800 € et 3 200 € pour les modèles courants",
      "App qui marche vraiment (et c'est rare dans le secteur)",
    ],
    modelHighlights: [
      { name: "Tweed 90+", power: "9 kW", usp: "Canalisable, étanche, format compact, best-seller en Wallonie" },
      { name: "Like 80", power: "8 kW", usp: "Compact pour pièces de 60-90 m², excellent pour appartements" },
      { name: "Spy 110+", power: "11 kW", usp: "Canalisable jusqu'à 8 m, design moderne et puissance polyvalente" },
    ],
    warranty: "5 ans constructeur sur l'électronique et la mécanique principale.",
    tags: ["Connecté", "Italie", "Compact", "Étanche"],
    metaTitle: "EK63 en Belgique — Poêles connectés Smart Fire | Mister Pellets",
    metaDescription:
      "Découvrez la gamme EK63 en Wallonie : poêles à pellets connectés, Smart Fire WiFi inclus, étanches et canalisables. Conseil expert, pose en 1 jour, primes incluses.",
  },

  dielle: {
    slug: "dielle",
    name: "Dielle",
    country: "Italie",
    founded: 1989,
    positioning: "Spécialiste 100% hydro",
    tagline: "Remplace une chaudière mazout",
    intro:
      "Dielle est le spécialiste italien des poêles et chaudières à pellets hydro. Toute la gamme chauffe un circuit d'eau (radiateurs, plancher chauffant, ECS), donc c'est le choix naturel quand tu veux remplacer une chaudière mazout par un système pellets. La marque cible le segment résidentiel et petit tertiaire avec des puissances de 15 à 35 kW.",
    history: [
      "1989 : création en Italie autour d'une expertise hydraulique (radiateurs en fonte).",
      "Années 2000 : transition vers les chaudières à pellets, en plein essor avec la crise énergétique.",
      "Aujourd'hui : reconnu pour ses chaudières silencieuses (combustion descendante) et son intégration facile dans les installations existantes.",
    ],
    specialties: [
      "100% hydro — chauffage central via radiateurs ou plancher chauffant",
      "Production d'eau chaude sanitaire (ECS) en option",
      "Compatible avec ballon tampon, pompe à chaleur hybride, panneaux solaires thermiques",
      "Combustion descendante silencieuse (modèles haut de gamme)",
      "Puissances 15 à 35 kW pour villas et petits collectifs",
    ],
    modelHighlights: [
      { name: "Iride 15", power: "15 kW", usp: "Hydro compact pour maisons bien isolées 100-150 m²" },
      { name: "Iride 22", power: "22 kW", usp: "Best-seller en remplacement chaudière mazout pour maisons familiales 150-220 m²" },
      { name: "Iride 30", power: "30 kW", usp: "Grandes maisons et petites copropriétés, ECS intégrée" },
    ],
    warranty: "5 ans constructeur sur le corps de chauffe et la combustion.",
    tags: ["Hydro", "Italie", "Chauffage central", "Remplacement mazout"],
    metaTitle: "Dielle en Belgique — Poêles et chaudières hydro | Mister Pellets",
    metaDescription:
      "Découvrez la gamme Dielle en Wallonie : poêles et chaudières à pellets hydro pour remplacer une chaudière mazout. Pose certifiée, primes Wallonie incluses.",
  },

  ferlux: {
    slug: "ferlux",
    name: "Ferlux",
    country: "Espagne",
    founded: 1995,
    positioning: "Budget maîtrisé",
    tagline: "Mécanique simple, fiable",
    intro:
      "Ferlux est une marque espagnole qui propose des poêles à pellets simples, sans gadget, à des prix très accessibles (1 600 à 2 500 €). C'est le choix pertinent pour une résidence secondaire, une location, un primo-achat, ou tout cas où on veut chauffer efficacement sans payer le surcoût d'une marque premium. Ferlux n'est pas le plus joli, mais c'est fiable et la pièce détachée est facile à trouver.",
    history: [
      "1995 : création à Saragosse (Espagne).",
      "Présent dans toute l'Europe du Sud avec une gamme de poêles à bois et à pellets entrée et milieu de gamme.",
      "Aujourd'hui : un acteur établi du segment budget, particulièrement populaire en France et en Belgique sur le marché de la rénovation économique.",
    ],
    specialties: [
      "Prix d'entrée parmi les plus bas du marché",
      "Mécanique simple — moins de capteurs, moins de pannes électroniques",
      "Pièces détachées disponibles longtemps (la marque ne renouvelle pas trop vite)",
      "Modèles compacts pour petites surfaces 50-90 m²",
      "Idéal résidence secondaire, location, primo-achat",
    ],
    modelHighlights: [
      { name: "Pyl-7", power: "7 kW", usp: "Compact pour pièces de 50-80 m², le best-seller budget" },
      { name: "Pyl-10", power: "10 kW", usp: "Polyvalent pour 80-110 m², bon rapport qualité-prix" },
    ],
    warranty: "2 ans constructeur (garantie légale belge).",
    tags: ["Budget", "Espagne", "Simple", "Fiable"],
    metaTitle: "Ferlux en Belgique — Poêles à pellets accessibles | Mister Pellets",
    metaDescription:
      "Découvrez la gamme Ferlux en Wallonie : poêles à pellets fiables et abordables, mécanique simple, idéal résidence secondaire ou primo-achat. Pose Mister Pellets.",
  },
};

export const BRAND_LIST: BrandData[] = Object.values(BRANDS);
