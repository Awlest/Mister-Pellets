/**
 * 10 villes wallonnes pour les pages locales SEO.
 * Phase 4 : data en dur. Phase 5+ : migration vers collection Payload `Cities`
 * pour permettre l'édition par le client.
 */

export interface CityData {
  slug: string;
  name: string;
  province: string;
  postalCodes: string[];
  distanceFromFernelmont: number; // km
  population: number;
  intro: string;
  context: string;
  recommendedModels: string[]; // slugs depuis products-demo
  localPrime?: string;
  testimonial?: { name: string; quote: string };
  metaTitle: string;
  metaDescription: string;
}

export const CITIES: CityData[] = [
  {
    slug: "namur",
    name: "Namur",
    province: "Namur",
    postalCodes: ["5000", "5001", "5002", "5003", "5004", "5024"],
    distanceFromFernelmont: 17,
    population: 110000,
    intro:
      "Capitale wallonne, Namur regroupe un mix de logements anciens en pierre dans le centre historique et de quartiers résidentiels modernes en périphérie (Jambes, Belgrade, Bouge, Saint-Servais). On y intervient quasi quotidiennement depuis Fernelmont, 17 km, 20 minutes de route.",
    context:
      "Sur les maisons mitoyennes anciennes du centre, le tubage du conduit existant est souvent nécessaire, on a l'habitude. Sur les nouvelles constructions de Bouge ou Belgrade, c'est la pose d'un étanche en façade qui domine. La province de Namur est aussi la plus généreuse côté primes, avec une majoration possible sur certaines communes.",
    recommendedModels: ["edilkamin-blade-9kw", "ek63-tweed-90", "edilkamin-lena-11kw"],
    testimonial: {
      name: "Sophie L., Namur centre",
      quote:
        "Maison de 1920 dans Bomel, conduit historique. L'équipe a tubé en moins d'une journée et l'installation est nickel.",
    },
    metaTitle: "Poêle à pellets à Namur, Vente & pose",
    metaDescription:
      "Poêle à pellets à Namur : conseil, vente et pose en 1 jour. 10+ modèles, primes Wallonie incluses, à 17 km de Fernelmont. Devis gratuit en 60 sec.",
  },
  {
    slug: "charleroi",
    name: "Charleroi",
    province: "Hainaut",
    postalCodes: ["6000", "6001", "6010", "6020", "6030", "6040", "6041", "6042", "6043", "6044"],
    distanceFromFernelmont: 65,
    population: 200000,
    intro:
      "Plus grande ville de Wallonie, Charleroi présente un parc de logements très varié : maisons ouvrières mitoyennes typiques du Pays Noir, immeubles de la métropole, lotissements pavillonnaires en périphérie (Jumet, Marchienne, Gilly). À 65 km de Fernelmont, on y est en 50 minutes.",
    context:
      "Beaucoup de remplacement de chaudières mazout par des hydros Girolami dans les maisons ouvrières des années 50-70. Sur les maisons modernes de Mont-sur-Marchienne ou Gilly, c'est le canalisable EK63 qui domine pour gérer plusieurs pièces sans gros chantier.",
    recommendedModels: ["edilkamin-mood-plus-11kw", "ek63-tweed-90", "edilkamin-lena-11kw"],
    testimonial: {
      name: "Jean-Marc D., Marcinelle",
      quote:
        "Remplacement de la vieille chaudière mazout par un Girolami Soft hydro. Économies dès le premier hiver, et plus de cuves à recharger.",
    },
    metaTitle: "Poêle à pellets à Charleroi, Vente & pose",
    metaDescription:
      "Poêle à pellets à Charleroi : pose en 1 jour, hydro pour remplacer mazout, étanche pour BBC. 10+ modèles. Pose Mister Pellets, primes Wallonie incluses.",
  },
  {
    slug: "liege",
    name: "Liège",
    province: "Liège",
    postalCodes: ["4000", "4020", "4030", "4031", "4032"],
    distanceFromFernelmont: 60,
    population: 200000,
    intro:
      "Cité ardente, Liège est un mix dense de logements anciens (Outremeuse, Saint-Léonard, Sclessin) et de quartiers résidentiels modernes (Cointe, Sart-Tilman). On y intervient régulièrement, 60 km de Fernelmont, 50 minutes.",
    context:
      "Liège a une particularité : beaucoup de copropriétés dans les anciennes maisons mosanes divisées en appartements. Les modèles étanches EK63 (ventouse façade) sont parfaits dans ce cas, sous réserve d'avoir l'accord du syndic. Pour les maisons individuelles, mix entre canalisable et hydro selon la surface.",
    recommendedModels: ["ek63-like-80", "edilkamin-blade-9kw", "edilkamin-mood-plus-11kw"],
    testimonial: {
      name: "Claire V., Sart-Tilman",
      quote:
        "Maison BBC de 2018, étanche EK63 Like 80 en façade. Diagnostic clair, devis transparent, pose impeccable.",
    },
    metaTitle: "Poêle à pellets à Liège, Vente & pose",
    metaDescription:
      "Poêle à pellets à Liège : étanche pour copros et BBC, hydro pour grandes maisons. Pose en 1 jour, primes Wallonie incluses, conseil expert Mister Pellets.",
  },
  {
    slug: "wavre",
    name: "Wavre",
    province: "Brabant wallon",
    postalCodes: ["1300", "1301"],
    distanceFromFernelmont: 50,
    population: 35000,
    intro:
      "Wavre est le centre du Brabant wallon, à 50 km au nord-ouest de Fernelmont. Tissu résidentiel haut de gamme, beaucoup de villas modernes BBC, et quelques maisons anciennes en centre-ville.",
    context:
      "Le Brabant wallon est marqué par des maisons modernes très bien isolées (PEB A ou B). Le poêle à pellets est souvent secondaire au système de chauffage principal (PAC ou gaz condensation). On installe surtout des étanches d'appoint dans les pièces de vie, Edilkamin Blade, EK63 Like.",
    recommendedModels: ["edilkamin-blade-9kw", "ek63-like-80", "edilkamin-lena-11kw"],
    metaTitle: "Poêle à pellets à Wavre, Vente & pose",
    metaDescription:
      "Poêle à pellets à Wavre : étanche pour villas BBC, design contemporain. 10+ modèles, pose Mister Pellets. À 50 km de notre atelier de Fernelmont.",
  },
  {
    slug: "mons",
    name: "Mons",
    province: "Hainaut",
    postalCodes: ["7000", "7011", "7012", "7020", "7022", "7030"],
    distanceFromFernelmont: 90,
    population: 95000,
    intro:
      "Capitale culturelle du Hainaut, Mons est à 90 km de Fernelmont (1h15). On y intervient sur les communes du grand Mons (Cuesmes, Hyon, Jemappes) et la périphérie hennuyère.",
    context:
      "Mons a un patrimoine ancien marqué : centre historique (Grand-Place classée Unesco), maisons anciennes à toiture pentue. Les conduits existants sont fréquents et on les tube régulièrement. En périphérie, plus de modernisme avec étanches BBC.",
    recommendedModels: ["edilkamin-lena-11kw", "ek63-spy-110", "edilkamin-blade-9kw"],
    metaTitle: "Poêle à pellets à Mons, Vente & pose",
    metaDescription:
      "Poêle à pellets à Mons : tubage, étanche, hydro selon votre maison. 10+ modèles, pose Mister Pellets, primes Wallonie incluses. À 90 km de Fernelmont.",
  },
  {
    slug: "arlon",
    name: "Arlon",
    province: "Luxembourg",
    postalCodes: ["6700", "6704", "6706"],
    distanceFromFernelmont: 130,
    population: 30000,
    intro:
      "Arlon est notre commune la plus éloignée à 130 km (1h30). On regroupe les interventions luxembourgeoises sur 1-2 journées pour optimiser. Maisons rurales en pierre, chalets, fermettes rénovées : la province de Luxembourg appelle des poêles puissants.",
    context:
      "Hivers rudes en province de Luxembourg : -10°C n'est pas rare. Les maisons sont souvent grandes et anciennes, avec des hauteurs sous plafond importantes. Les hydros 22-30 kW dominent en remplacement des chaudières mazout. Stocks de pellets à anticiper en hiver.",
    recommendedModels: ["edilkamin-mood-plus-11kw", "ek63-spy-110", "edilkamin-lena-11kw"],
    metaTitle: "Poêle à pellets à Arlon, Vente & pose",
    metaDescription:
      "Poêle à pellets à Arlon : hydro Girolami pour grandes maisons, hivers luxembourgeois. Pose Mister Pellets sur RDV. Primes Wallonie + Luxembourg incluses.",
  },
  {
    slug: "tournai",
    name: "Tournai",
    province: "Hainaut",
    postalCodes: ["7500", "7501", "7502", "7503", "7504", "7520", "7521"],
    distanceFromFernelmont: 110,
    population: 70000,
    intro:
      "Tournai, à la frontière française, est à 110 km de Fernelmont. La ville est connue pour son patrimoine médiéval (cathédrale Notre-Dame Unesco). On intervient régulièrement dans le grand Tournaisis.",
    context:
      "Tournai a beaucoup d'habitat ancien (maisons mitoyennes en briques rouges, centre historique). Le tubage est fréquent. En périphérie, des fermettes rénovées préfèrent souvent l'hydro pour remplacer le mazout. Le climat océanique adoucit l'usage : pellets de qualité ENplus A1 recommandés contre l'humidité.",
    recommendedModels: ["edilkamin-mood-plus-11kw", "edilkamin-lena-11kw", "ek63-spy-110"],
    metaTitle: "Poêle à pellets à Tournai, Vente & pose",
    metaDescription:
      "Poêle à pellets à Tournai : tubage et pose en 1-2 jours. Hydro pour fermettes rénovées, étanche pour modernes. Mister Pellets intervient en Tournaisis.",
  },
  {
    slug: "verviers",
    name: "Verviers",
    province: "Liège",
    postalCodes: ["4800", "4801", "4802"],
    distanceFromFernelmont: 80,
    population: 55000,
    intro:
      "Verviers, ville lainière historique, est nichée dans la vallée de la Vesdre à 80 km de Fernelmont. Centre dense, banlieues sur les hauteurs (Heusy, Stembert, Mangombroux). Climat un peu plus froid que la moyenne wallonne.",
    context:
      "Habitat ancien avec beaucoup de maisons à étages serrées dans la vallée. Le canalisable Edilkamin Mood Plus ou EK63 Spy est très demandé pour gérer 3-4 pièces avec un seul appareil. Sur les hauteurs, plus de villas individuelles, mix entre étanche et hydro.",
    recommendedModels: ["edilkamin-mood-plus-11kw", "ek63-spy-110", "edilkamin-lena-11kw"],
    metaTitle: "Poêle à pellets à Verviers, Vente & pose",
    metaDescription:
      "Poêle à pellets à Verviers : canalisable pour maisons à étages, hydro pour grandes villas. 10+ modèles, pose Mister Pellets. Devis sous 48h.",
  },
  {
    slug: "gembloux",
    name: "Gembloux",
    province: "Namur",
    postalCodes: ["5030", "5031", "5032"],
    distanceFromFernelmont: 22,
    population: 26000,
    intro:
      "Gembloux est notre voisin direct à 22 km à l'ouest de Fernelmont (25 minutes). Ville étudiante (Faculté agronomique), centre médiéval mignon, grande couronne agricole. On y intervient très régulièrement, parfois deux fois par semaine.",
    context:
      "Gembloux mixe centre dense (immeubles d'étudiants, maisons mitoyennes) et campagne (fermes rénovées, lotissements modernes). La proximité avec Fernelmont nous permet de dépanner rapidement et de proposer des poses en 1-2 jours d'avance.",
    recommendedModels: ["ek63-tweed-90", "edilkamin-blade-9kw", "ek63-like-80"],
    metaTitle: "Poêle à pellets à Gembloux, Vente & pose",
    metaDescription:
      "Poêle à pellets à Gembloux : à 22 km de Fernelmont, intervention rapide, dépannage prioritaire. Étanche, canalisable, hydro selon votre maison.",
  },
  {
    slug: "dinant",
    name: "Dinant",
    province: "Namur",
    postalCodes: ["5500", "5501", "5502"],
    distanceFromFernelmont: 45,
    population: 13000,
    intro:
      "Dinant, ville mosane touristique adossée à sa falaise, est à 45 km au sud de Fernelmont (45 min). Habitat ancien dense en bord de Meuse, et villas plus modernes sur les hauteurs (Bouvignes, Foy-Notre-Dame).",
    context:
      "Climat plus froid en bord de Meuse, surtout en hiver avec les remontées d'humidité. Les hydros sont fréquents en remplacement des vieilles chaudières mazout des maisons mosanes. Les nouvelles constructions des hauteurs penchent plutôt vers l'étanche compact.",
    recommendedModels: ["edilkamin-mood-plus-11kw", "edilkamin-lena-11kw", "ek63-like-80"],
    metaTitle: "Poêle à pellets à Dinant, Vente & pose",
    metaDescription:
      "Poêle à pellets à Dinant : hydro pour maisons mosanes, étanche pour modernes. 10+ modèles, pose Mister Pellets, primes Wallonie incluses. Devis sous 48h.",
  },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find((c) => c.slug === slug);
}
