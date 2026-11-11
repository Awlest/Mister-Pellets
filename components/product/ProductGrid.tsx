import { ChevronDown } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: ProductCardData[];
  /** Cartes affichées d'emblée ; les suivantes se déplient sans JavaScript. */
  initial?: number;
  /** Libellé du bouton qui déplie la suite, sans le nombre. */
  moreLabel?: string;
  /** Première photo chargée en priorité : seulement si la grille ouvre la page. */
  priority?: boolean;
  className?: string;
}

const GRID = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Grille de fiches rendue par le serveur : chaque carte est un vrai lien dans
 * le HTML servi (pages marque et catégories). Au-delà de `initial`, les cartes
 * sont dans un <details> natif : présentes dans la page pour les moteurs et la
 * recherche du navigateur, dépliées d'un geste, sans script. Les photos des
 * cartes repliées ne sont pas téléchargées (`loading="lazy"`).
 */
export function ProductGrid({
  products,
  initial = 9,
  moreLabel = "Afficher les autres modèles",
  priority = false,
  className,
}: ProductGridProps) {
  const first = products.slice(0, initial);
  const rest = products.slice(initial);
  const item = (product: ProductCardData, eager: boolean) => (
    <li key={product.slug} className="min-w-0">
      <ProductCard product={product} priority={eager} className="h-full" />
    </li>
  );

  return (
    <div className={className}>
      <ul className={GRID}>{first.map((p, i) => item(p, priority && i === 0))}</ul>
      {rest.length > 0 && (
        <details className="group mt-8">
          <summary className="mx-auto flex min-h-12 w-fit cursor-pointer list-none items-center gap-2 rounded-full border-2 border-mp-green-deep px-7 text-sm font-semibold text-mp-green-deep transition-colors hover:bg-mp-green-deep hover:text-white group-open:mb-8 [&::-webkit-details-marker]:hidden">
            {moreLabel} ({rest.length})
            <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <ul className={cn(GRID)}>{rest.map((p) => item(p, false))}</ul>
        </details>
      )}
    </div>
  );
}

/**
 * Ordre d'une grille de marque ou de catégorie : best-sellers, fiches mises
 * en avant, fiches avec photo, puis ordre alphabétique (« Rise 7 » avant
 * « Rise 11 »).
 */
export function sortForGrid<
  T extends ProductCardData & { isFeatured?: boolean },
>(products: readonly T[]): T[] {
  const score = (p: T) => (p.isBestseller ? 4 : 0) + (p.isFeatured ? 2 : 0) + (p.image?.url || p.imageSrc ? 1 : 0);
  return [...products].sort(
    (a, b) => score(b) - score(a) || a.name.localeCompare(b.name, "fr", { numeric: true, sensitivity: "base" }),
  );
}
