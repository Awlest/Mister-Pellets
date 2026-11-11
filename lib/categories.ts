import type { ProductDemo } from "./products-demo";
import { isHybrid } from "./catalog-scope";
import { TARIFS } from "./pose/tarifs";
import { formatEur } from "./pose/moteur";

/**
 * Pages catégories du catalogue : une vraie page par famille de poêles, avec
 * sa grille de fiches rendue par le serveur. Elles remplacent les liens de
 * menu vers la boutique filtrée (`/boutique?chauffage=hydro`), qui servaient
 * la page de la boutique sans titre ni adresse propres.
 *
 * Chaque page vit dans app/(frontend)/<slug>/page.tsx et rend
 * components/sections/CategoryLanding.tsx. Le texte long (`sections`) est
 * prévu pour un second temps : la page l'affiche dès qu'il est rempli.
 *
 * Les hybrides bois + pellets ne figurent dans aucune catégorie : leur fiche
 * de référence est sur mister-bois.be (lib/catalog-scope.ts).
 */
export interface CategoryData {
  /** Clé de la catégorie, aussi son adresse sans la barre. */
  slug:
    | "poeles-a-pellets-canalisables"
    | "poeles-a-pellets-hydro"
    | "inserts-a-pellets"
    | "poeles-a-pellets-etanches";
  path: string;
  /** Libellé du menu et du fil d'Ariane. */
  label: string;
  /** Libellé court du volet mobile. */
  short: string;
  /** Sous-titre du menu. */
  navDesc: string;
  /** H1 : début, puis mots en accent. */
  h1: { lead: string; accent: string };
  metaTitle: string;
  metaDescription: string;
  /** Chapô de 80 à 120 mots, faits tirés du site (guides, tarifs de pose). */
  intro: string;
  /** Guide ou article qui détaille le sujet. */
  guide?: { href: string; label: string };
  /** Texte long à venir : sections affichées sous la grille quand elles existent. */
  sections?: { heading: string; paragraphs: string[] }[];
  /** La fiche appartient à la catégorie. */
  matches: (p: ProductDemo) => boolean;
}

const isInsert = (p: ProductDemo): boolean =>
  p.type === "insert" || p.appliance === "insert" || p.appliance === "foyer";
const isHydro = (p: ProductDemo): boolean => Boolean(p.isHydro) || p.type === "hydro";

export const CATEGORIES: CategoryData[] = [
  {
    slug: "poeles-a-pellets-canalisables",
    path: "/poeles-a-pellets-canalisables",
    label: "Poêles canalisables",
    short: "Canalisables",
    navDesc: "Chauffer une ou deux pièces de plus",
    h1: { lead: "Poêles à pellets", accent: "canalisables" },
    metaTitle: "Poêles à pellets canalisables en Wallonie",
    metaDescription:
      "Poêles à pellets canalisables posés en Wallonie : un seul poêle chauffe la pièce de vie et une ou deux pièces voisines par gaines. Modèles et prix.",
    intro: `Un poêle à pellets canalisable chauffe la pièce où il est posé et envoie une partie de l'air chaud vers une ou deux pièces voisines, par des gaines isolées passées dans un mur, un faux plafond ou les combles. C'est ce qu'on pose le plus souvent dans une maison à étage de 100 à 180 m² : un seul appareil et un seul conduit de fumées. La canalisation se chiffre à part de la pose, ${formatEur(TARIFS.canalisationParPieceHT)} HTVA par pièce desservie, ${TARIFS.canalisationPiecesMax} pièces au plus. Pour chauffer toute la maison, on regarde plutôt un poêle hydro raccordé aux radiateurs.`,
    guide: { href: "/guides/poele-pellets-canalisable", label: "Le guide du poêle canalisable" },
    matches: (p) => (Boolean(p.isCanalizable) || p.type === "canalisable") && !isInsert(p),
  },
  {
    slug: "poeles-a-pellets-hydro",
    path: "/poeles-a-pellets-hydro",
    label: "Poêles hydro",
    short: "Hydro",
    navDesc: "Raccordés aux radiateurs",
    h1: { lead: "Poêles à pellets", accent: "hydro" },
    metaTitle: "Poêles à pellets hydro en Wallonie",
    metaDescription:
      "Poêles à pellets hydro raccordés aux radiateurs ou au plancher chauffant, pour remplacer une chaudière au mazout. Modèles et puissances, pose en Wallonie.",
    intro:
      "Un poêle à pellets hydro chauffe l'eau d'un circuit : il alimente vos radiateurs ou votre plancher chauffant, comme une chaudière, tout en chauffant la pièce où il se trouve. C'est le choix quand on remplace une chaudière au mazout ou au gaz et qu'on garde le chauffage central. La pose ajoute un raccordement hydraulique au conduit de fumées : comptez un à deux jours de chantier selon l'installation en place. Raccordé au chauffage central, l'appareil se contrôle chaque année, comme le prévoit l'arrêté wallon du 29 janvier 2009.",
    guide: { href: "/guides/poele-pellets-hydro", label: "Le guide du poêle hydro" },
    matches: (p) => isHydro(p) && !isInsert(p),
  },
  {
    slug: "inserts-a-pellets",
    path: "/inserts-a-pellets",
    label: "Inserts à pellets",
    short: "Inserts",
    navDesc: "Dans une cheminée existante",
    h1: { lead: "Inserts et foyers", accent: "à pellets" },
    metaTitle: "Inserts à pellets pour cheminée existante",
    metaDescription:
      "Inserts et foyers à pellets à encastrer dans une cheminée existante : modèles à air, canalisables et hydro, posés en Wallonie par Mister Pellets.",
    intro:
      "Un insert à pellets s'encastre dans une cheminée existante, à la place du foyer ouvert ou d'un ancien insert. Vous gardez la cheminée et son habillage, et vous gagnez un chauffage qui se programme et s'alimente seul depuis son réservoir. Le conduit en place doit convenir au pellet : on contrôle son état et son diamètre à la visite technique, avant de chiffrer. Certains inserts sont canalisables et envoient de l'air chaud vers une pièce voisine. Les foyers hydro, eux, se raccordent au chauffage central et alimentent les radiateurs.",
    guide: { href: "/blog/insert-pellets-cheminee-existante", label: "Poser un insert à pellets dans une cheminée" },
    matches: (p) => isInsert(p),
  },
  {
    slug: "poeles-a-pellets-etanches",
    path: "/poeles-a-pellets-etanches",
    label: "Poêles étanches",
    short: "Étanches",
    navDesc: "Maison isolée, ventilation double flux",
    h1: { lead: "Poêles à pellets", accent: "étanches" },
    metaTitle: "Poêles à pellets étanches en Wallonie",
    metaDescription:
      "Poêles à pellets étanches pour maison bien isolée ou ventilation double flux : l'air de combustion vient de l'extérieur. Modèles posés en Wallonie.",
    intro:
      "Un poêle à pellets étanche prend l'air de sa combustion à l'extérieur, par une arrivée dédiée, et pas dans la pièce. Il ne perturbe donc pas une ventilation double flux et convient aux maisons récentes ou rénovées, bien isolées. Selon la marque, les fumées sortent par une ventouse concentrique en façade ou par un conduit qui monte au-dessus du toit : avec Edilkamin et EK63, c'est toujours le conduit vertical. La puissance se choisit avec la surface et l'isolation, et le configurateur la calcule en deux minutes.",
    guide: { href: "/blog/evacuation-fumees-poele-pellets", label: "Tubage, conduit ou ventouse : l'évacuation des fumées" },
    matches: (p) => Boolean(p.isAirtight) && !isInsert(p),
  },
];

/** Fiches d'une catégorie parmi les fiches visibles, hybrides exclus. */
export function productsInCategory<T extends ProductDemo>(category: CategoryData, products: readonly T[]): T[] {
  return products.filter((p) => !isHybrid(p) && category.matches(p));
}

/** Catégories auxquelles appartient une fiche (liens depuis la fiche produit). */
export function categoriesOf(product: ProductDemo): CategoryData[] {
  if (isHybrid(product)) return [];
  return CATEGORIES.filter((c) => c.matches(product));
}

export function getCategory(slug: CategoryData["slug"]): CategoryData {
  return CATEGORIES.find((c) => c.slug === slug)!;
}
