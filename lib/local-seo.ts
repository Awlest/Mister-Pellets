/**
 * Données SEO local Wallonie — brief marques §E.2.
 *
 * Sert les pages /installation/[brand]/[province] : une landing page par
 * couple marque top-tier × province (3 × 5 = 15 pages). Le contenu de chaque
 * page combine les données réelles de la marque (lib/brands.ts) et les
 * données réelles de la province ci-dessous — donc chaque page porte une
 * info locale + marque genuine, pas du remplissage.
 */

export interface Province {
  slug: string;
  /** Nom court : "Namur". */
  name: string;
  /** Forme longue : "la province de Namur". */
  longName: string;
  /** Villes principales desservies (brief §E.2). */
  cities: string[];
  /** Paragraphe d'angle local, propre à la province. */
  localAngle: string;
  /** Info livraison spécifique. */
  delivery: string;
}

export const PROVINCES: Province[] = [
  {
    slug: "namur",
    name: "Namur",
    longName: "la province de Namur",
    cities: ["Namur", "Dinant", "Andenne", "Gembloux", "Ciney", "Fernelmont"],
    localAngle:
      "La province de Namur, c'est chez nous. Notre atelier est à Fernelmont, à deux pas de Namur, Andenne et Gembloux. On y intervient tous les jours, on connaît les conduits des vieilles maisons mosanes comme des constructions neuves, et le SAV est au coin de la rue.",
    delivery:
      "Livraison gratuite sur toute la province de Namur, on est à domicile dans la journée.",
  },
  {
    slug: "brabant-wallon",
    name: "Brabant wallon",
    longName: "le Brabant wallon",
    cities: ["Wavre", "Ottignies", "Louvain-la-Neuve", "Nivelles", "Jodoigne", "Tubize"],
    localAngle:
      "Le Brabant wallon est à moins d'une heure de notre atelier de Fernelmont. Wavre, Nivelles, Ottignies, Louvain-la-Neuve : on y pose régulièrement, dans des maisons souvent récentes et bien isolées où l'étanchéité du poêle compte vraiment.",
    delivery:
      "Livraison gratuite dans un rayon de 50 km autour de Fernelmont, ce qui couvre une bonne partie du Brabant wallon. Au-delà, forfait unique de 50 €.",
  },
  {
    slug: "hainaut",
    name: "Hainaut",
    longName: "la province de Hainaut",
    cities: ["Charleroi", "Mons", "Tournai", "La Louvière", "Mouscron", "Soignies"],
    localAngle:
      "Charleroi, Mons, La Louvière, Tournai : on couvre tout le Hainaut depuis Fernelmont. Beaucoup de maisons y ont encore un chauffage central au mazout ou au gaz, et c'est là qu'un poêle hydro ou un bon canalisable fait la vraie différence sur la facture.",
    delivery:
      "Pour les communes du Hainaut au-delà de 50 km de Fernelmont, un forfait de livraison unique de 50 € s'applique, et c'est tout.",
  },
  {
    slug: "liege",
    name: "Liège",
    longName: "la province de Liège",
    cities: ["Liège", "Verviers", "Seraing", "Huy", "Waremme", "Spa", "Eupen"],
    localAngle:
      "La province de Liège, de Liège à Verviers en passant par Huy, Waremme et Spa, fait partie de nos zones d'intervention régulières. Hivers plus rudes vers les hauteurs : on dimensionne la puissance en conséquence et on gère le tubage, la ventouse et le raccordement hydro selon votre maison.",
    delivery:
      "Livraison assurée sur toute la province de Liège. Forfait unique de 50 € au-delà de 50 km de Fernelmont.",
  },
  {
    slug: "luxembourg",
    name: "Luxembourg",
    longName: "la province de Luxembourg",
    cities: ["Arlon", "Marche-en-Famenne", "Bastogne", "Libramont", "Neufchâteau"],
    localAngle:
      "La province de Luxembourg, d'Arlon à Marche-en-Famenne en passant par Bastogne et Libramont, c'est la zone la plus au sud qu'on dessert. Grandes maisons, hivers ardennais sérieux : le bon dimensionnement et un poêle qui tient la distance, c'est non négociable.",
    delivery:
      "On se déplace dans toute la province de Luxembourg. Forfait de livraison unique de 50 € au-delà de 50 km de Fernelmont.",
  },
];

export function getProvince(slug: string): Province | undefined {
  return PROVINCES.find((p) => p.slug === slug);
}
