import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export interface ProductColorPreview {
  colorName: string;
  colorHex?: string;
}

export interface ProductCardData {
  slug: string;
  name: string;
  brand: string;
  power?: string;
  /**
   * @deprecated — remplacé par `heatedVolume` (m³ max au lieu de m² min-max).
   * Conservé pour compatibilité ascendante avec l'ancien shape demo.
   */
  surface?: string;
  /** Volume de chauffe maximal en m³, ex: "200 m³" */
  heatedVolume?: string;
  priceTTC?: number;
  imageSrc?: string;
  imageAlt?: string;
  isBestseller?: boolean;
  isNew?: boolean;
  /** Variantes de couleur disponibles (pour les pastilles sur la vignette). */
  colorVariants?: ProductColorPreview[];
}

interface ProductCardProps {
  product: ProductCardData;
  className?: string;
}

/**
 * Carte produit pour la boutique, l'accueil et les listings.
 * Cf. brief §4.3.
 */
export function ProductCard({ product, className }: ProductCardProps) {
  const {
    slug,
    name,
    brand,
    power,
    heatedVolume,
    priceTTC,
    imageSrc,
    imageAlt,
    isBestseller,
    isNew,
    colorVariants,
  } = product;

  // Filtre + dédup des pastilles par hex pour éviter doublons (ex: deux variantes
  // qui partagent la même couleur de pastille). Limite à 6 pastilles affichées
  // pour rester lisible, avec compteur "+N" si plus.
  const swatches = (colorVariants ?? [])
    .filter((v) => v.colorHex)
    .filter((v, i, arr) => arr.findIndex((x) => x.colorHex === v.colorHex) === i);
  const visibleSwatches = swatches.slice(0, 6);
  const extraCount = swatches.length - visibleSwatches.length;

  return (
    <Link
      href={`/produit/${slug}`}
      className={`group block ${className ?? ""}`}
      aria-label={`Voir ${name}`}
    >
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-square bg-mp-beige-warm overflow-hidden">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt ?? name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-mp-sand">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-16 w-16"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
          )}

          {/* Badges flottants */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isBestseller && <Badge variant="primary">Best-seller</Badge>}
            {isNew && <Badge variant="success">Nouveau</Badge>}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex flex-col gap-2 p-5 flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mp-orange-flame">
            {brand}
          </span>

          <h3
            className="text-lg font-semibold text-mp-green-deep leading-tight line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h3>

          {(power || heatedVolume) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {power && <Badge variant="default">{power}</Badge>}
              {heatedVolume && <Badge variant="default">{heatedVolume}</Badge>}
            </div>
          )}

          {/* Pastilles de couleur — laissent voir d'un coup d'œil les
              finitions disponibles. Cliquer mène à la page produit où
              le picker complet est dispo. */}
          {visibleSwatches.length > 0 && (
            <div
              className="flex items-center gap-1.5 mt-1"
              aria-label={`${swatches.length} couleur${swatches.length > 1 ? "s" : ""} disponible${swatches.length > 1 ? "s" : ""}`}
            >
              {visibleSwatches.map((v, i) => (
                <span
                  key={i}
                  title={v.colorName}
                  className="inline-block h-3.5 w-3.5 rounded-full border border-mp-sand/60 shadow-sm"
                  style={{ backgroundColor: v.colorHex }}
                  aria-hidden="true"
                />
              ))}
              {extraCount > 0 && (
                <span className="text-[10px] font-semibold text-mp-ink-soft ml-0.5">
                  +{extraCount}
                </span>
              )}
            </div>
          )}

          <div className="mt-auto pt-3 flex items-end justify-between">
            {priceTTC ? (
              <div>
                <span className="text-xs text-mp-ink-soft block">À partir de</span>
                <span
                  className="text-xl font-semibold text-mp-green-deep"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatPrice(priceTTC)}
                </span>
                <span className="text-xs text-mp-ink-soft ml-1">TTC</span>
              </div>
            ) : (
              <span className="text-sm text-mp-ink-soft italic">Sur devis</span>
            )}
            <span className="text-xs font-semibold text-mp-orange-flame opacity-0 group-hover:opacity-100 transition-opacity">
              Voir →
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
