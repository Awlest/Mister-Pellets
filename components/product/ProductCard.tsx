import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buildSrcSet, pickImageSrc, type ProductImage } from "@/lib/product-image";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatPriceHT } from "@/lib/utils";
import { priceBadge, shownPriceTTC, struckPriceTTC } from "@/lib/product-price";

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
   * @deprecated remplacé par `heatedVolume` (m³ max au lieu de m² min-max).
   * Conservé pour compatibilité ascendante avec l'ancien shape demo.
   */
  surface?: string;
  /** Volume de chauffe maximal en m³, ex: "200 m³" */
  heatedVolume?: string;
  /**
   * Toutes les puissances (kW) disponibles quand le modèle regroupe plusieurs
   * puissances en variantes (ex: [9, 12, 14]). Permet d'afficher l'éventail
   * complet dans les pastilles et de filtrer sur chaque puissance.
   */
  powers?: number[];
  /**
   * Volumes de chauffe (m³) correspondant à chaque puissance ci-dessus, triés.
   * Affiché en fourchette dans les pastilles (ex: 276–373 m³).
   */
  heatedVolumes?: number[];
  priceTTC?: number;
  /**
   * Prix TTC après bonus de saison, calculé côté serveur pendant la période
   * (lib/products.ts). Absent hors période : la carte affiche le prix catalogue.
   */
  bonusPriceTTC?: number;
  /**
   * Prix promo TTC saisi dans l'admin, seulement s'il est inférieur au prix
   * catalogue. Affiché avec le prix catalogue barré, et le bonus de saison se
   * calcule dessus.
   */
  promoPriceTTC?: number;
  imageSrc?: string;
  imageAlt?: string;
  /** Point focal de l'image (0-100 %) défini dans l'admin Media Payload. */
  imageFocalX?: number;
  imageFocalY?: number;
  /**
   * Image principale avec ses déclinaisons pré-calculées par Payload (srcset,
   * cf. lib/product-image.ts). Absente sur les données de démo : la carte
   * retombe alors sur `imageSrc` seul.
   */
  image?: ProductImage;
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
    promoPriceTTC,
    bonusPriceTTC,
    imageSrc,
    imageAlt,
    imageFocalX,
    imageFocalY,
    image,
    isBestseller,
    isNew,
    colorVariants,
    powers,
    heatedVolumes,
  } = product;

  // Photo servie depuis les tailles pré-générées par Payload (srcset), jamais
  // via /_next/image : l'optimiseur Vercel est plafonné sur le plan Hobby et
  // renvoyait 402 sur toutes les photos le 17/09/2026 (cf. lib/product-image.ts).
  const cardImage: ProductImage | undefined =
    image ?? (imageSrc ? { url: imageSrc, focalX: imageFocalX, focalY: imageFocalY } : undefined);

  // Fiche regroupée multi-puissances : on affiche l'éventail complet
  // (ex: "9 · 12 · 14 kW" + "276–373 m³") au lieu de la seule valeur du parent.
  const multiPower = powers && powers.length > 1;
  const multiVolume = heatedVolumes && heatedVolumes.length > 1;
  const powerLabel = multiPower ? `${powers!.join(" · ")} kW` : power;
  const volumeLabel = multiVolume
    ? `${heatedVolumes![0]}–${heatedVolumes![heatedVolumes!.length - 1]} m³`
    : heatedVolume;

  // CSS object-position depuis le focal point Payload (défaut centre).
  const objectPosition = `${imageFocalX ?? 50}% ${imageFocalY ?? 50}%`;

  // Filtre + dédup des pastilles par hex pour éviter doublons (ex: deux variantes
  // qui partagent la même couleur de pastille). Limite à 6 pastilles affichées
  // pour rester lisible, avec compteur "+N" si plus.
  const swatches = (colorVariants ?? [])
    .filter((v) => v.colorHex)
    .filter((v, i, arr) => arr.findIndex((x) => x.colorHex === v.colorHex) === i);
  const visibleSwatches = swatches.slice(0, 6);
  const extraCount = swatches.length - visibleSwatches.length;

  // Prix de la carte : bonus de saison, sinon promo admin, sinon catalogue, avec
  // le prix précédent barré (lib/product-price.ts).
  const prices = { priceTTC, promoPriceTTC, bonusPriceTTC };
  const shown = shownPriceTTC(prices);
  const struck = struckPriceTTC(prices);
  const badge = priceBadge(prices);

  return (
    <Link
      href={`/produit/${slug}`}
      className={`group block rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame focus-visible:ring-offset-2 focus-visible:ring-offset-mp-cream ${className ?? ""}`}
      aria-label={`Voir ${name}`}
    >
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-square bg-mp-beige-warm overflow-hidden">
          {cardImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pickImageSrc(cardImage, 800)}
              srcSet={buildSrcSet(cardImage)}
              sizes="(max-width: 768px) 100vw, 33vw"
              alt={imageAlt ?? name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition }}
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

          {(powerLabel || volumeLabel) && (
            <div className="flex flex-wrap gap-2 mt-1">
              {powerLabel && <Badge variant="default">{powerLabel}</Badge>}
              {volumeLabel && <Badge variant="default">{volumeLabel}</Badge>}
            </div>
          )}

          {/* Pastilles de couleur : laissent voir d'un coup d'œil les
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
            {shown ? (
              <div>
                <span className="text-xs text-mp-ink-soft block">
                  À partir de
                  {badge ? (
                    <span className="ml-2 rounded-full bg-mp-orange-flame px-2 py-0.5 text-[10px] font-semibold text-white">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span
                  className="text-xl font-semibold text-mp-green-deep"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {formatPriceHT(shown)}
                </span>
                <span className="text-xs text-mp-ink-soft ml-1">HTVA</span>
                {struck ? (
                  <span className="ml-2 text-sm text-mp-ink-soft line-through">
                    {formatPriceHT(struck)}
                  </span>
                ) : null}
                <span className="block text-[11px] text-mp-ink-soft">
                  soit {formatPrice(shown)} TVAC
                  {struck ? ` au lieu de ${formatPrice(struck)}` : ""}
                </span>
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
