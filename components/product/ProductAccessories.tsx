"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn, formatPrice, formatPriceHT, formatPriceReducedVat } from "@/lib/utils";
import type { AccessoryCategory, ProductAccessory } from "@/lib/products-demo";

/** Ordre et libellés des groupes de compléments sur la fiche. */
const CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  thermostat: "Thermostat et télécommande",
  connectivite: "Wi-Fi et pilotage à distance",
  canalisation: "Canalisation de l'air chaud",
  raccordement: "Raccordement",
  habillage: "Habillage et installation",
  fonctionnement: "Fonctionnement",
  autre: "Autres compléments",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as AccessoryCategory[];

/** Au-delà, la liste se replie derrière « Voir les autres compléments ». */
const VISIBLE_COUNT = 4;

interface Props {
  accessories: ProductAccessory[];
  /**
   * Prix TVAC du poêle dans la configuration affichée (bonus de saison
   * compris). null : configuration pas encore choisie ou sur devis.
   */
  basePriceTTC: number | null;
  /** Pourquoi le prix du poêle manque (affiché sous le total). */
  missingBaseHint?: string;
}

/**
 * Compléments en option d'une fiche produit : thermostat, Wi-Fi, kits…
 * Chaque complément se coche pour voir le total avec le poêle. Rien n'est
 * commandé ici (pas de paiement en ligne) : le total sert au chiffrage.
 * Prix TVAC à 21 %, sans bonus de saison (il ne porte que sur le poêle).
 */
export function ProductAccessories({ accessories, basePriceTTC, missingBaseHint }: Props) {
  const [checked, setChecked] = React.useState<Set<number>>(() => new Set());
  const [expanded, setExpanded] = React.useState(false);
  const headingId = React.useId();

  // Tri par groupe (ordre fixe), puis ordre de l'admin dans chaque groupe.
  const sorted = React.useMemo(
    () =>
      accessories
        .map((a, i) => ({ a, i }))
        .sort(
          (x, y) =>
            CATEGORY_ORDER.indexOf(x.a.category) - CATEGORY_ORDER.indexOf(y.a.category) ||
            x.i - y.i,
        )
        .map(({ a }) => a),
    [accessories],
  );
  const showGroups = new Set(sorted.map((a) => a.category)).size > 1;
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT);
  const hiddenCount = sorted.length - visible.length;

  const chosen = sorted.filter((a) => checked.has(a.id));
  const chosenTTC = chosen.reduce((sum, a) => sum + (a.priceTTC ?? 0), 0);
  const chosenOnRequest = chosen.filter((a) => a.priceTTC == null).length;
  const totalTTC = basePriceTTC != null ? basePriceTTC + chosenTTC : null;

  function toggle(id: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section aria-labelledby={headingId} className="rounded-2xl border border-mp-sand/40 bg-white p-5">
      <h2 id={headingId} className="text-base font-semibold text-mp-green-deep">
        Compléments en option
      </h2>
      <p className="mt-1 text-sm text-mp-ink-soft">
        Cochez ceux qui vous intéressent pour voir le total. Prix TVAC du complément seul.
      </p>

      <ul className="mt-4 space-y-2">
        {visible.map((a, i) => {
          const on = checked.has(a.id);
          const groupStart = showGroups && visible[i - 1]?.category !== a.category;
          return (
            <li key={a.id}>
              {groupStart ? (
                <span
                  className={cn(
                    "mb-2 block text-xs font-semibold uppercase tracking-wider text-mp-ink-soft",
                    i > 0 && "mt-4",
                  )}
                >
                  {CATEGORY_LABELS[a.category]}
                </span>
              ) : null}
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors",
                  "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mp-orange-ink",
                  on
                    ? "border-mp-orange-flame bg-mp-orange-light/40"
                    : "border-mp-sand/40 bg-white hover:border-mp-orange-flame/50 hover:bg-mp-cream",
                )}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggle(a.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition-colors",
                    on
                      ? "border-mp-orange-flame bg-mp-orange-flame text-mp-green-darkest"
                      : "border-mp-sand bg-white",
                  )}
                >
                  {on && <Check className="h-4 w-4" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-mp-green-deep">{a.name}</span>
                  {a.note ? (
                    <span className="block text-xs text-mp-ink-soft">{a.note}</span>
                  ) : null}
                  <span className="mt-1 block text-sm font-semibold tabular-nums text-mp-orange-ink">
                    {a.priceTTC != null ? `+ ${formatPrice(a.priceTTC)}` : "Prix sur demande"}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {hiddenCount > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-mp-orange-ink underline-offset-4 hover:underline"
        >
          {expanded
            ? "Afficher moins de compléments"
            : `Voir ${hiddenCount === 1 ? "l'autre complément" : `les ${hiddenCount} autres compléments`}`}
        </button>
      ) : null}

      {chosen.length > 0 ? (
        <div className="mt-4 rounded-2xl bg-mp-beige p-4" aria-live="polite">
          {totalTTC != null ? (
            <>
              <span className="block text-xs text-mp-ink-soft">
                Poêle et {chosen.length === 1 ? "complément" : `${chosen.length} compléments`}, TVA comprise
              </span>
              <span
                className="block text-2xl font-semibold tabular-nums text-mp-green-deep"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {formatPrice(totalTTC)}
              </span>
              <span className="block text-sm text-mp-ink-soft">soit {formatPriceHT(totalTTC)} HTVA</span>
              <p className="mt-2 text-sm text-mp-green-deep">
                <span className="font-semibold">{formatPriceReducedVat(totalTTC)} TVAC</span> si nous
                posons le tout sur une habitation de plus de 10 ans
                <span className="text-mp-ink-soft"> (TVA 6 % au lieu de 21 %)</span>.
              </p>
            </>
          ) : (
            <>
              <span className="block text-xs text-mp-ink-soft">
                {chosen.length === 1 ? "Complément choisi" : `${chosen.length} compléments choisis`}
                {chosenTTC > 0 ? ", TVA comprise" : ""}
              </span>
              {chosenTTC > 0 ? (
                <span
                  className="block text-2xl font-semibold tabular-nums text-mp-green-deep"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  + {formatPrice(chosenTTC)}
                </span>
              ) : null}
              {missingBaseHint ? (
                <span className="mt-1 block text-sm text-mp-ink-soft">{missingBaseHint}</span>
              ) : null}
            </>
          )}
          {chosenOnRequest > 0 ? (
            <span className="mt-2 block text-xs text-mp-ink-soft">
              {chosenOnRequest === 1
                ? "Un complément choisi est sur demande : il n'est pas compté."
                : `${chosenOnRequest} compléments choisis sont sur demande : ils ne sont pas comptés.`}
            </span>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
