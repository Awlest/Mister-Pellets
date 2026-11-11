import type { ListedProduct } from "./catalogue-listing";
import { shownPriceTTC } from "./product-price";

/**
 * Tri de la boutique (paramètre d'URL `tri`). Module sans « use client » : le
 * serveur trie avec la même fonction pour savoir quelles fiches ouvrent la
 * page (app/(frontend)/boutique/page.tsx), le navigateur pour les filtres.
 *
 * « Mis en avant » est l'ordre par défaut. Il ne prétend rien recommander : il
 * remonte les fiches cochées « Best-seller » puis « Mis en avant » dans l'admin,
 * fait passer les fiches avec photo avant celles qui n'en ont pas encore, et
 * départage le reste par date d'ajout. L'équipe pilote donc le haut de la
 * boutique depuis ces deux cases.
 */
export const SORTS = [
  { value: "mis-en-avant", label: "Mis en avant" },
  { value: "recent", label: "Derniers ajouts" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "puissance-asc", label: "Puissance croissante" },
  { value: "puissance-desc", label: "Puissance décroissante" },
  { value: "nom", label: "Nom, de A à Z" },
] as const;

export type SortKey = (typeof SORTS)[number]["value"];
export const DEFAULT_SORT: SortKey = "mis-en-avant";
export const isSortKey = (v: string | null): v is SortKey => SORTS.some((s) => s.value === v);

/**
 * Prix de tri et de filtre : celui que la carte affiche (bonus de saison, sinon
 * promo admin, sinon catalogue), jamais le prix barré. Le bonus varie selon la
 * marque : trié sur le prix d'avant bonus, « Prix croissant » affichait
 * 2 102 € avant 2 006 € (recette du 11/11/2026). 0 : fiche « Sur devis ».
 */
export const listedPrice = (p: ListedProduct): number => shownPriceTTC(p) ?? 0;
export const hasPrice = (p: ListedProduct): boolean => listedPrice(p) > 0;
// Fiche regroupée multi-puissances : la plus petite sert au tri croissant, la
// plus grande au tri décroissant (sinon un 9-26 kW se classerait comme un 9 kW).
const minPower = (p: ListedProduct): number => (p.powers && p.powers.length > 0 ? Math.min(...p.powers) : p.powerKw);
const maxPower = (p: ListedProduct): number => (p.powers && p.powers.length > 0 ? Math.max(...p.powers) : p.powerKw);
const featuredScore = (p: ListedProduct): number =>
  (p.isBestseller ? 4 : 0) + (p.isFeatured ? 2 : 0) + (p.image?.url || p.imageSrc ? 1 : 0);
// Le rang d'ajout remplace la date dans la page : un entier au lieu de 24 caractères.
const byRecent = (a: ListedProduct, b: ListedProduct): number => (a.recency ?? 0) - (b.recency ?? 0);

/**
 * Rang d'ajout de chaque fiche, 0 pour la plus récente. À date égale, l'ordre
 * reçu départage : chaque fiche a son rang, le tri par défaut ne dépend donc
 * pas de l'ordre dans lequel les fiches arrivent.
 */
export function withRecency<T extends { createdAt?: string }>(products: readonly T[]): (T & { recency: number })[] {
  const time = (p: T): number => (p.createdAt ? Date.parse(p.createdAt) || 0 : 0);
  const order = products.map((_, index) => index).sort((a, b) => time(products[b]!) - time(products[a]!));
  const rank = new Map(order.map((index, r) => [index, r]));
  return products.map((p, index) => ({ ...p, recency: rank.get(index)! }));
}

export function sortProducts<T extends ListedProduct>(list: readonly T[], sort: SortKey): T[] {
  const sorted = [...list]; // Array.prototype.sort est stable : à égalité, l'ordre reçu est conservé.
  switch (sort) {
    case "recent":
      return sorted.sort(byRecent);
    case "prix-asc":
    case "prix-desc": {
      const dir = sort === "prix-asc" ? 1 : -1;
      // Le prix trié est celui de la carte (« à partir de »). Les fiches « sur
      // devis » n'ont pas de prix : elles restent en fin de liste dans les deux sens.
      return sorted.sort((a, b) => {
        const pa = hasPrice(a);
        const pb = hasPrice(b);
        if (pa !== pb) return pa ? -1 : 1;
        if (!pa) return 0;
        return dir * (listedPrice(a) - listedPrice(b));
      });
    }
    case "puissance-asc":
      return sorted.sort((a, b) => minPower(a) - minPower(b));
    case "puissance-desc":
      return sorted.sort((a, b) => maxPower(b) - maxPower(a));
    case "nom":
      // numeric : « Rise 7 » se classe avant « Rise 11 ».
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "fr", { numeric: true, sensitivity: "base" }));
    default:
      return pricedFirstWithinBrand(sorted.sort((a, b) => featuredScore(b) - featuredScore(a) || byRecent(a, b)));
  }
}

/**
 * À marque égale, les fiches dont le prix est affiché passent devant. L'ordre
 * des marques ne bouge pas (MCZ reste en tête) : chaque marque garde ses
 * places dans la liste, elle y range d'abord ses fiches chiffrées. Sans cela,
 * les cartes « Sur devis » occupaient les dix premiers écrans de la boutique.
 */
function pricedFirstWithinBrand<T extends ListedProduct>(list: T[]): T[] {
  const queues = new Map<string, T[]>();
  for (const p of list) queues.set(p.brand, [...(queues.get(p.brand) ?? []), p]);
  for (const [brand, items] of queues) {
    queues.set(brand, [...items.filter(hasPrice), ...items.filter((p) => !hasPrice(p))]);
  }
  return list.map((p) => queues.get(p.brand)!.shift()!);
}
