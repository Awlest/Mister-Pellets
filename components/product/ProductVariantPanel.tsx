"use client";

import * as React from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import type {
  VariantOptionAxis,
  VariantOptionValueData,
  ProductVariantData,
  VariantStockStatus,
} from "@/lib/products-demo";

interface Props {
  productSlug: string;
  productName: string;
  productBrand: string;
  productImageSrc?: string;
  basePriceTTC?: number;
  variantOptions: VariantOptionAxis[];
  variants: ProductVariantData[];
}

const STOCK_LABELS: Record<VariantStockStatus, string> = {
  in_stock: "En stock",
  on_order: "Sur commande",
  out_of_stock: "Rupture temporaire",
};

/** Prix effectif d'une variante : prix promo s'il existe, sinon prix normal. */
function effectivePrice(v: ProductVariantData): number {
  return typeof v.salePrice === "number" && v.salePrice > 0 ? v.salePrice : v.price;
}

/**
 * Panneau de sélection des variantes, page produit (§4 du brief).
 *
 * Affiché à la place du bloc prix + bouton d'achat statiques quand le produit
 * a `hasVariants`. Gère :
 *  - un sélecteur par axe (boutons texte / pastilles couleur / icônes)
 *  - le grisage des combinaisons indisponibles
 *  - la résolution de la variante exacte une fois tous les axes choisis
 *  - le prix / SKU / stock / image dynamiques + l'ajout au panier
 */
export function ProductVariantPanel({
  productSlug,
  productName,
  productBrand,
  productImageSrc,
  basePriceTTC,
  variantOptions,
  variants,
}: Props) {
  // Axes triés par sortOrder (ordre d'affichage défini dans l'admin).
  const axes = React.useMemo(
    () => [...variantOptions].sort((a, b) => a.sortOrder - b.sortOrder),
    [variantOptions],
  );

  const [selected, setSelected] = React.useState<Record<number, number | null>>(
    () => Object.fromEntries(axes.map((a) => [a.optionTypeId, null])),
  );
  const [justAdded, setJustAdded] = React.useState(false);
  const addItem = useCart((s) => s.addItem);

  /** Une variante est compatible avec une sélection partielle donnée. */
  const matchesSelection = React.useCallback(
    (v: ProductVariantData, sel: Record<number, number | null>): boolean => {
      for (const axis of axes) {
        const chosen = sel[axis.optionTypeId];
        if (chosen == null) continue;
        if (!v.optionValueIds.includes(chosen)) return false;
      }
      return true;
    },
    [axes],
  );

  /** Une valeur est disponible si une variante existe avec cette valeur + les autres axes déjà choisis. */
  const isValueAvailable = React.useCallback(
    (axisId: number, valueId: number): boolean => {
      const trial = { ...selected, [axisId]: valueId };
      return variants.some((v) => matchesSelection(v, trial));
    },
    [selected, variants, matchesSelection],
  );

  const allChosen = axes.every((a) => selected[a.optionTypeId] != null);
  const activeVariant = React.useMemo(() => {
    if (!allChosen) return undefined;
    return variants.find((v) =>
      axes.every((a) => v.optionValueIds.includes(selected[a.optionTypeId] as number)),
    );
  }, [allChosen, variants, axes, selected]);

  // Une variante peut exister sans prix encodé (prix à compléter par l'équipe).
  // Dans ce cas on affiche « Sur devis » et l'ajout au panier est désactivé.
  const activePriced =
    activeVariant != null && effectivePrice(activeVariant) > 0;

  const minPrice = React.useMemo(
    () => Math.min(...variants.map(effectivePrice).filter((n) => n > 0)),
    [variants],
  );

  function toggleValue(axisId: number, valueId: number) {
    setSelected((prev) => ({
      ...prev,
      [axisId]: prev[axisId] === valueId ? null : valueId,
    }));
  }

  function valueLabel(
    axis: VariantOptionAxis,
    valueId: number | null | undefined,
  ): string {
    if (valueId == null) return "";
    return axis.values.find((v) => v.id === valueId)?.label ?? "";
  }

  function handleAddToCart() {
    if (!activeVariant || !activePriced) return;
    const config = axes
      .map((a) => valueLabel(a, selected[a.optionTypeId]))
      .filter(Boolean)
      .join(", ");
    addItem(
      {
        productId: `${productSlug}::${activeVariant.sku ?? activeVariant.id}`,
        name: config ? `${productName}, ${config}` : productName,
        brand: productBrand,
        priceTTC: effectivePrice(activeVariant),
        imageSrc: activeVariant.image?.url ?? productImageSrc,
      },
      1,
    );
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Sélecteurs par axe */}
      <div className="flex flex-col gap-5">
        {axes.map((axis) => {
          const chosen = selected[axis.optionTypeId];
          return (
            <div key={axis.optionTypeId}>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm font-semibold text-mp-green-deep">
                  {axis.label}
                </span>
                {chosen != null && (
                  <span className="text-xs text-mp-ink-soft">
                    {valueLabel(axis, chosen)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {axis.values.map((value) => (
                  <VariantValueButton
                    key={value.id}
                    axis={axis}
                    value={value}
                    selected={chosen === value.id}
                    available={isValueAvailable(axis.optionTypeId, value.id)}
                    onClick={() => toggleValue(axis.optionTypeId, value.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloc prix dynamique */}
      <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6">
        <span className="text-xs text-mp-ink-soft block">
          {activeVariant
            ? activePriced
              ? "Prix TTC de la configuration choisie"
              : "Configuration choisie"
            : "Prix TTC indicatif"}
        </span>
        <span
          className="text-4xl font-semibold text-mp-green-deep"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {activeVariant
            ? activePriced
              ? formatPrice(effectivePrice(activeVariant))
              : "Sur devis"
            : Number.isFinite(minPrice)
              ? `À partir de ${formatPrice(minPrice)}`
              : basePriceTTC
                ? `À partir de ${formatPrice(basePriceTTC)}`
                : "Sur devis"}
        </span>

        {activeVariant && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-mp-ink-soft">
            {activeVariant.sku && (
              <span>
                Référence&nbsp;: <span className="font-semibold">{activeVariant.sku}</span>
              </span>
            )}
            {activeVariant.stockStatus && (
              <span className="font-semibold text-mp-green-deep">
                {STOCK_LABELS[activeVariant.stockStatus]}
              </span>
            )}
            {typeof activeVariant.leadTimeDays === "number" && (
              <span>Livraison ~{activeVariant.leadTimeDays} j</span>
            )}
          </div>
        )}

        {activeVariant?.image?.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeVariant.image.url}
            alt={activeVariant.image.alt ?? productName}
            className="mt-4 h-24 w-24 rounded-xl object-cover border border-mp-sand/40"
          />
        )}
      </div>

      {/* Bouton d'achat */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={!activeVariant || !activePriced}
        onClick={handleAddToCart}
        aria-label={
          activeVariant
            ? activePriced
              ? `Ajouter ${productName} au panier`
              : "Configuration sur devis"
            : "Sélectionner une configuration"
        }
      >
        {justAdded ? (
          <>
            <Check className="h-5 w-5" />
            Ajouté au panier
          </>
        ) : activeVariant && activePriced ? (
          <>
            <ShoppingBag className="h-5 w-5" />
            Ajouter au panier
          </>
        ) : activeVariant ? (
          "Configuration sur devis"
        ) : (
          "Sélectionner une configuration"
        )}
      </Button>

      <p className="text-xs text-mp-ink-soft text-center">
        Pose non incluse : devis chiffré sous 48 h. Le paiement en ligne
        (Mollie / Bancontact) arrive prochainement.
      </p>
    </div>
  );
}

/** Bouton d'une valeur d'option, rendu selon le displayMode de l'axe. */
function VariantValueButton({
  axis,
  value,
  selected,
  available,
  onClick,
}: {
  axis: VariantOptionAxis;
  value: VariantOptionValueData;
  selected: boolean;
  available: boolean;
  onClick: () => void;
}) {
  const disabled = !available && !selected;
  const title = disabled ? "Combinaison non disponible" : value.label;

  // Mode pastille couleur
  if (axis.displayMode === "color" && value.colorHex) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-label={value.label}
        aria-pressed={selected}
        className={[
          "h-8 w-8 rounded-full border transition-all",
          selected
            ? "ring-2 ring-mp-green-deep ring-offset-2 border-mp-green-deep"
            : "border-mp-sand",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:scale-105",
        ].join(" ")}
        style={{ backgroundColor: value.colorHex }}
      />
    );
  }

  // Mode icône
  if (axis.displayMode === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        aria-pressed={selected}
        className={[
          "flex flex-col items-center justify-center gap-1 h-14 min-w-14 px-2 rounded-xl border bg-mp-cream transition-all",
          selected ? "border-mp-green-deep border-2" : "border-mp-sand",
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-mp-green-deep",
        ].join(" ")}
      >
        {/* Icône : champ Media `icon` si renseigné, sinon asset statique
            /icones-variantes/{slug}.svg. onError masque l'image si absente. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value.iconUrl ?? `/icones-variantes/${value.slug}.svg`}
          alt=""
          aria-hidden="true"
          className="h-7 w-7"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <span className="text-[10px] leading-tight text-mp-ink-soft text-center">
          {value.label}
        </span>
      </button>
    );
  }

  // Mode texte (défaut) : pill
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-pressed={selected}
      className={[
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
        selected
          ? "bg-mp-green-deep text-mp-cream border-mp-green-deep"
          : "bg-mp-cream text-mp-green-deep border-mp-sand",
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:border-mp-green-deep",
      ].join(" ")}
    >
      {value.label}
    </button>
  );
}
