"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import { LISTING_PAGE_SIZE, decodeEntry, lineParts, type CatalogueEntry } from "@/lib/catalogue-listing";
import { cn } from "@/lib/utils";

/**
 * Liste de fiches du catalogue : boutique, pages catégorie, pages marque.
 *
 * Les `visible` premières fiches sont des cartes (photo, pastilles, prix).
 * Toutes les autres sont des lignes compactes dans un <details> natif : un
 * vrai lien par fiche dans le HTML servi, lisible sans JavaScript et suivi par
 * les robots, sans image ni pictogramme. « Voir plus » change les lignes
 * suivantes en cartes. Le calcul des poids est dans lib/catalogue-listing.ts.
 */

const GRID = "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Tout le style des lignes est porté par la liste : une ligne n'a aucune
 * classe, pour rester autour de 150 octets (246 fiches sur la boutique).
 * 44 px de haut au moins, le nom passe à la ligne, puissance et prix restent
 * entiers à droite.
 */
const LINES = cn(
  "mt-2 grid grid-cols-1 gap-x-8 text-left text-sm sm:grid-cols-2 lg:grid-cols-3",
  "[&>li]:min-w-0 [&>li]:border-b [&>li]:border-mp-sand/40",
  "[&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:gap-x-3 [&_a]:py-2 [&_a]:font-semibold [&_a]:leading-snug [&_a]:text-mp-green-deep [&_a:hover]:text-mp-orange-ink",
  "[&_span]:shrink-0 [&_span]:whitespace-nowrap [&_span]:font-normal [&_span]:tabular-nums [&_span]:text-mp-ink-soft",
  "[&_span:first-of-type]:ml-auto [&_span:last-of-type]:font-semibold [&_span:last-of-type]:text-mp-ink",
);

const subscribeNothing = () => () => {};

/** Lignes compactes : `<li><a href>Nom <span>puissance</span> <span>prix</span></a></li>`. */
export function ProductLines({ products, className }: { products: readonly ProductCardData[]; className?: string }) {
  return (
    <ul className={cn(LINES, className)}>
      {products.map((product) => {
        const { name, power, price } = lineParts(product);
        return (
          <li key={product.slug}>
            {/* Pas de préchargement : une liste dépliée en lancerait des dizaines. */}
            <Link href={`/produit/${product.slug}`} prefetch={false}>
              {/* Les espaces séparent les trois textes dans le nom du lien. */}
              {`${name} `}
              {power ? <span>{power}</span> : null}
              {power ? " " : null}
              <span>{price}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

interface ProductListingProps {
  /** Fiches dans l'ordre d'affichage. */
  products: readonly ProductCardData[];
  /** Nombre de fiches montrées en cartes. */
  visible: number;
  /** « Voir plus » : le parent augmente `visible`. */
  onShowMore: () => void;
  /** Première photo chargée en priorité : seulement si la liste ouvre la page. */
  priority?: boolean;
  className?: string;
}

export function ProductListing({ products, visible, onShowMore, priority = false, className }: ProductListingProps) {
  // Faux au rendu serveur et pendant l'hydratation : sans script, pas de bouton
  // qui ne ferait rien, la liste dépliable suffit.
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false);
  const gridRef = useRef<HTMLUListElement>(null);
  const focusFrom = useRef<number | null>(null);

  const cards = products.slice(0, visible);
  const lines = products.slice(visible);

  // « Voir plus » : le focus passe à la première carte ajoutée, là où était le
  // bouton, sinon le clavier repartirait du bas de la liste.
  function showMore() {
    focusFrom.current = visible;
    onShowMore();
  }
  useEffect(() => {
    if (focusFrom.current === null) return;
    const link = gridRef.current?.children[focusFrom.current]?.querySelector("a");
    focusFrom.current = null;
    link?.focus({ preventScroll: true });
  }, [visible]);

  return (
    <div className={className}>
      <ul ref={gridRef} className={GRID}>
        {cards.map((product, i) => (
          <li key={product.slug} className="min-w-0">
            <ProductCard product={product} priority={priority && i === 0} className="h-full" />
          </li>
        ))}
      </ul>
      {lines.length > 0 && (
        <>
          {hydrated && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={showMore}
                className="inline-flex h-12 items-center justify-center rounded-full bg-mp-green-deep px-7 text-sm font-semibold text-white transition-[background-color,scale] hover:bg-mp-green-mid active:scale-[0.98]"
              >
                Voir plus de modèles ({lines.length} restant{lines.length > 1 ? "s" : ""})
              </button>
            </div>
          )}
          <details className="group mt-6 text-center">
            <summary className="mx-auto flex min-h-11 w-fit cursor-pointer list-none items-center gap-2 text-sm font-semibold text-mp-green-deep underline decoration-mp-sand underline-offset-4 hover:text-mp-orange-ink [&::-webkit-details-marker]:hidden">
              {lines.length > 1 ? `Les ${lines.length} autres modèles en liste` : "Le dernier modèle en liste"}
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <ProductLines products={lines} />
          </details>
        </>
      )}
    </div>
  );
}

/**
 * Liste des pages marque et catégorie : les fiches dans l'ordre reçu du
 * serveur (components/product/ProductGrid.tsx), sans filtre ni tri.
 */
export function CatalogueListing({
  entries,
  priority = false,
  className,
}: {
  entries: CatalogueEntry[];
  priority?: boolean;
  className?: string;
}) {
  const products = useMemo(() => entries.map(decodeEntry), [entries]);
  const [visible, setVisible] = useState(LISTING_PAGE_SIZE);
  return (
    <ProductListing
      products={products}
      visible={visible}
      onShowMore={() => setVisible((v) => v + LISTING_PAGE_SIZE)}
      priority={priority}
      className={className}
    />
  );
}
