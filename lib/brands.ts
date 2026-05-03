/**
 * Source de vérité pour les 4 marques distribuées par Mister Pellets.
 *
 * Hotfix V1.2 §H7 : rectification factuelle complète. Les anciens
 * positionnements ("Dielle = hydro uniquement", "Ferlux = budget mécanique
 * simple", "EK63 = marque indépendante", "Edilkamin = durabilité 15-20 ans")
 * étaient faux ou réducteurs. Sources officielles vérifiées : edilkamin.com,
 * ek-63.com, diellespa.it, ferlux.es.
 *
 * Phase 5+ : migration vers collection Payload `Brands` pour permettre
 * l'édition par le client.
 */

export interface BrandData {
  slug: "edilkamin" | "ek63" | "dielle" | "ferlux";
  name: string;
  country: string;
  /** Année de création vérifiée. undefined si non sourçable officiellement. */
  founded?: number;
  /** Année de création approximative (texte) si pas de date exacte. */
  foundedLabel?: string;
  positioning: string;
  tagline: string;
  intro: string;
  history: string[];
  specialties: string[];
  modelHighlights: { name: string; power: string; usp: string }[];
  warranty: string;
  tags: string[];
  /** URL officielle du fabricant (pour Schema.org sameAs). */
  officialUrl: string;
  metaTitle: string;
  metaDescription: string;
}

export const BRANDS: Record<BrandData["slug"], BrandData> = {
  // ───────────────────────────────────────────────────────────────────
  // EDILKAMIN : pionnier italien, gamme très large, Wi-Fi de série
  // ───────────────────────────────────────────────────────────────────
  edilkamin: {
    slug: "edilkamin",
    name: "Edilkamin",
    country: "Italie",
    founded: 1963,
    positioning: "Référence italienne, gamme très large",
    tagline: "Le constructeur historique du chauffage biomasse italien",
    intro:
      "Edilkamin est une référence italienne du chauffage biomasse depuis 1963, basée à Lainate dans la région de Milan. La marque couvre toute la gamme : poêles à pellets pour chauffer une pièce, canalisables pour diffuser dans plusieurs pièces, étanches pour les maisons basse consommation, hydro pour alimenter un système de chauffage central avec radiateurs ou plancher chauffant, inserts encastrables, poêles à bois, et cuisinières (via les filiales Italiana Camini et Kitchen Kamin). Le pilotage Wi-Fi est intégré sur la plupart des modèles récents.",
    history: [
      "1963 : fondation à Lainate (province de Milan, Lombardie).",
      "Années 1990-2000 : développement progressif de la gamme pellets, parallèlement au bois traditionnel.",
      "Aujourd'hui : présence dans plus de 40 pays via un réseau de revendeurs spécialisés.",
    ],
    specialties: [
      "Gamme complète : air, canalisable, étanche, hydro, inserts, bois, cuisinières",
      "Pilotage Wi-Fi via app dédiée (sur la plupart des modèles récents)",
      "Modèles étanches certifiés pour les maisons à VMC double-flux et basse consommation",
      "Modèles hydro (suffixe H) compatibles radiateurs, plancher chauffant, panneaux solaires thermiques",
      "Certifications CE, EN 14785, écodesign 2022",
    ],
    modelHighlights: [
      { name: "Blade Plus", power: "9 kW", usp: "Étanche moderne pour maisons BBC, design vertical compact" },
      { name: "Cherie Up", power: "11 kW", usp: "Polyvalent pour pièces de vie 80 à 150 m², plusieurs finitions" },
      { name: "Kira H", power: "Hydro", usp: "Modèle hydro pour chauffage central via radiateurs ou plancher chauffant" },
    ],
    warranty: "Garantie constructeur 5 ans, prolongée par notre service entretien annuel.",
    tags: ["Italie", "1963", "Gamme très large", "Wi-Fi de série"],
    officialUrl: "https://www.edilkamin.com/",
    metaTitle: "Edilkamin en Belgique, gamme complète poêles à pellets | Mister Pellets",
    metaDescription:
      "Edilkamin, référence italienne du chauffage biomasse depuis 1963. Air, canalisable, étanche, hydro, inserts. Wi-Fi de série. Pose en Wallonie par Mister Pellets, prime 2026 incluse.",
  },

  // ───────────────────────────────────────────────────────────────────
  // EK63 : marque sœur du groupe Edilkamin, design moderne et connecté
  // ───────────────────────────────────────────────────────────────────
  ek63: {
    slug: "ek63",
    name: "EK63",
    country: "Italie",
    foundedLabel: "Marque du groupe Edilkamin",
    positioning: "Marque accessible du groupe Edilkamin, design moderne et connecté",
    tagline: "Smart Wi-Fi de série, rapport qualité-prix optimisé",
    intro:
      "EK63 est la marque sœur d'Edilkamin, lancée par le groupe pour proposer des poêles modernes et connectés à un prix plus accessible, sans renoncer à l'efficacité. La gamme couvre l'air, le canalisable, l'étanche et l'hydro. Le Wi-Fi Smart est intégré de série sur la plupart des modèles, donc le pilotage depuis un smartphone se fait sans surcoût ni abonnement. Plusieurs modèles sont étanches et donc compatibles avec les maisons basse consommation à VMC double-flux.",
    history: [
      "Marque créée par le groupe Edilkamin pour répondre à une demande de poêles modernes et accessibles.",
      "Développement axé sur la connectivité Smart Wi-Fi intégrée et un design contemporain.",
      "Distribution européenne via le réseau Edilkamin et des revendeurs spécialisés.",
    ],
    specialties: [
      "Wi-Fi Smart intégré de série, sans abonnement",
      "Gamme : air, étanche, canalisable, hydro",
      "Modèles étanches pour maisons passives, RT2012 ou BBC",
      "Modèle Entity 90+ ultra-fin (31 cm de profondeur, idéal couloirs)",
      "Certifications CE, EN 14785, écodesign 2022, classe environnementale 5 étoiles",
    ],
    modelHighlights: [
      { name: "Tweed 90+", power: "9 kW", usp: "Canalisable, étanche, format compact, best-seller en Wallonie" },
      { name: "Like 80", power: "8 kW", usp: "Compact pour pièces de 60 à 100 m², excellent pour appartements" },
      { name: "Spy 110+", power: "11 kW", usp: "Canalisable, design moderne et puissance polyvalente" },
    ],
    warranty: "Garantie constructeur 5 ans sur l'électronique et la mécanique principale.",
    tags: ["Italie", "Groupe Edilkamin", "Wi-Fi Smart", "Étanche"],
    officialUrl: "https://www.ek-63.com/",
    metaTitle: "EK63 en Belgique, marque du groupe Edilkamin Wi-Fi Smart | Mister Pellets",
    metaDescription:
      "EK63, marque accessible du groupe Edilkamin. Air, canalisable, étanche, hydro. Wi-Fi Smart de série. Pose en Wallonie par Mister Pellets, prime Habitation 2026 incluse.",
  },

  // ───────────────────────────────────────────────────────────────────
  // DIELLE : système de combustion par alimentation par le bas (breveté)
  // ───────────────────────────────────────────────────────────────────
  dielle: {
    slug: "dielle",
    name: "Dielle",
    country: "Italie",
    // Année non vérifiable à la source officielle, on l'omet (cf. doc V1.2 §H7.5)
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
    metaTitle: "Dielle en Belgique, combustion brevetée par alimentation par le bas | Mister Pellets",
    metaDescription:
      "Dielle, fabricant italien de poêles à pellets avec système breveté de combustion par alimentation par le bas. Air, canalisable, hydro, hybride bois pellets. Pose en Wallonie.",
  },

  // ───────────────────────────────────────────────────────────────────
  // FERLUX : fabricant espagnol, gamme complète, rapport qualité-prix
  // ───────────────────────────────────────────────────────────────────
  ferlux: {
    slug: "ferlux",
    name: "Ferlux",
    country: "Espagne",
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
    metaTitle: "Ferlux en Belgique, gamme complète poêles à pellets | Mister Pellets",
    metaDescription:
      "Ferlux, fabricant espagnol depuis plus de 28 ans, distribué dans 30+ pays. Air, canalisable, hydro. Rendement jusqu'à 94 %. Pose en Wallonie par Mister Pellets.",
  },
};

export const BRAND_LIST: BrandData[] = Object.values(BRANDS);

/**
 * Helper pour le label d'année à afficher (founded ou foundedLabel).
 */
export function brandFoundedLabel(b: BrandData): string {
  if (b.founded) return `Depuis ${b.founded}`;
  if (b.foundedLabel) return b.foundedLabel;
  return "";
}
