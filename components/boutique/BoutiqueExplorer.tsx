"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/product/ProductCard";
import {
  COMBUSTIBLE_LABELS,
  CHAUFFAGE_LABELS,
  DIFFUSION_LABELS,
  COLOR_LABELS,
  POWER_TRANCHES,
  powerToTranche,
  type Combustible,
  type ProductType,
  type Diffusion,
  type ColorCategory,
} from "@/lib/products-demo";
import { cn } from "@/lib/utils";

/**
 * Shape allégé envoyé au navigateur pour la boutique : juste ce qu'il faut pour
 * la carte + les filtres (pas de variantes/galerie/features → payload réduit).
 */
export interface BoutiqueProduct extends ProductCardData {
  type: ProductType;
  combustible?: Combustible;
  /** Raccordé à l'eau (thermo) → pilote le filtre « Chauffage ». */
  isHydro?: boolean;
  powerKw: number;
  diffusion: Diffusion;
  color: ColorCategory;
}

/**
 * Exploration boutique — filtrage 100% CÔTÉ NAVIGATEUR.
 *
 * Avant : la page lisait les filtres dans l'URL (searchParams) → Next.js la
 * rendait dynamiquement à chaque visite (cache MISS, ~1,8 s, 958 Ko rechargés).
 * Maintenant : la page est statique/ISR (cache HIT, ~150 ms), et le filtrage se
 * fait instantanément ici sans recharger. L'URL reste synchronisée (liens
 * partageables) via history.replaceState, sans aller-retour serveur.
 */

interface Filters {
  marque: string;
  combustible: string;
  chauffage: string;
  puissance: string;
  diffusion: string;
  couleur: string;
}

const DEFAULT: Filters = { marque: "all", combustible: "all", chauffage: "all", puissance: "all", diffusion: "all", couleur: "all" };
const PAGE_SIZE = 24;

const COMBUSTIBLE_FILTERS = [{ value: "all", label: "Tous" }, ...(Object.entries(COMBUSTIBLE_LABELS) as [Combustible, string][]).map(([value, label]) => ({ value, label }))];
const CHAUFFAGE_FILTERS = [{ value: "all", label: "Tous" }, ...Object.entries(CHAUFFAGE_LABELS).map(([value, label]) => ({ value, label }))];
const DIFFUSION_FILTERS = [{ value: "all", label: "Toutes" }, ...(Object.entries(DIFFUSION_LABELS) as [Diffusion, string][]).map(([value, label]) => ({ value, label }))];
const COLOR_FILTERS = [{ value: "all", label: "Toutes" }, ...(Object.entries(COLOR_LABELS) as [ColorCategory, string][]).map(([value, label]) => ({ value, label }))];
const POWER_FILTERS = [{ value: "all", label: "Toutes" }, ...POWER_TRANCHES.map((t) => ({ value: t.value, label: t.label }))];

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-mp-orange-flame text-white shadow-sm"
          : "bg-mp-cream border border-mp-sand text-mp-green-deep hover:bg-mp-orange-light hover:text-mp-ink",
      )}
    >
      {children}
    </button>
  );
}

export function BoutiqueExplorer({
  products,
  brandFilters,
}: {
  products: BoutiqueProduct[];
  brandFilters: { value: string; label: string }[];
}) {
  const [current, setCurrent] = useState<Filters>(DEFAULT);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Au montage : initialise les filtres depuis l'URL (liens partageables).
  // Évite le hook useSearchParams (qui forcerait la page en dynamique).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setCurrent({
      marque: p.get("marque") ?? "all",
      combustible: p.get("combustible") ?? "all",
      chauffage: p.get("chauffage") ?? "all",
      puissance: p.get("puissance") ?? "all",
      diffusion: p.get("diffusion") ?? "all",
      couleur: p.get("couleur") ?? "all",
    });
  }, []);

  function setFilter(key: keyof Filters, value: string) {
    const next = { ...current, [key]: value };
    setCurrent(next);
    setVisible(PAGE_SIZE);
    const params = new URLSearchParams();
    (Object.keys(next) as (keyof Filters)[]).forEach((k) => {
      if (next[k] !== "all") params.set(k, next[k]);
    });
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/boutique?${qs}` : "/boutique");
  }

  function reset() {
    setCurrent(DEFAULT);
    setVisible(PAGE_SIZE);
    window.history.replaceState(null, "", "/boutique");
  }

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (current.marque !== "all" && p.brand !== current.marque) return false;
        if (current.combustible !== "all" && p.combustible !== (current.combustible as Combustible)) return false;
        if (current.chauffage !== "all" && (p.isHydro ? "hydro" : "ventile") !== current.chauffage) return false;
        if (current.puissance !== "all") {
          // Fiche regroupée multi-puissances : elle correspond au filtre si
          // l'UNE de ses puissances tombe dans la tranche choisie (sinon le
          // client cherchant 12/14 kW ne trouverait pas un modèle parent à 9 kW).
          const tranches =
            p.powers && p.powers.length > 0
              ? p.powers.map((kw) => powerToTranche(kw))
              : [powerToTranche(p.powerKw)];
          if (!tranches.includes(current.puissance)) return false;
        }
        if (current.diffusion !== "all" && p.diffusion !== (current.diffusion as Diffusion)) return false;
        if (current.couleur !== "all" && p.color !== (current.couleur as ColorCategory)) return false;
        return true;
      }),
    [products, current],
  );

  const activeCount = Object.values(current).filter((v) => v !== "all").length;
  const shown = filtered.slice(0, visible);

  const GROUPS: { label: string; key: keyof Filters; options: { value: string; label: string }[] }[] = [
    { label: "Marque", key: "marque", options: brandFilters },
    { label: "Combustible", key: "combustible", options: COMBUSTIBLE_FILTERS },
    { label: "Chauffage", key: "chauffage", options: CHAUFFAGE_FILTERS },
    { label: "Puissance", key: "puissance", options: POWER_FILTERS },
    { label: "Diffusion de chaleur", key: "diffusion", options: DIFFUSION_FILTERS },
    { label: "Couleur", key: "couleur", options: COLOR_FILTERS },
  ];

  return (
    <>
      <div className="mb-8 space-y-5">
        {GROUPS.map((g) => (
          <div key={g.key}>
            <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">{g.label}</span>
            <div className="flex flex-wrap gap-2">
              {g.options.map((f) => (
                <FilterPill key={f.value} active={current[g.key] === f.value} onClick={() => setFilter(g.key, f.value)}>
                  {f.label}
                </FilterPill>
              ))}
            </div>
          </div>
        ))}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center text-xs font-semibold text-mp-orange-flame underline hover:no-underline"
          >
            Réinitialiser les filtres ({activeCount} actif{activeCount > 1 ? "s" : ""})
          </button>
        )}
      </div>

      <div className="mb-6 text-sm text-mp-ink-soft">
        <strong className="text-mp-green-deep">{filtered.length}</strong>{" "}
        {filtered.length === 1 ? "modèle" : "modèles"}
        {activeCount > 0 && " correspondant à votre sélection"}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-10 text-center">
          <p className="text-lg text-mp-ink mb-4">
            Aucun modèle ne correspond à cette combinaison de filtres.
          </p>
          <p className="text-sm text-mp-ink-soft">
            On couvre toute la gamme Edilkamin, EK63 et Girolami.{" "}
            <Link href="/demande-de-devis" className="text-mp-orange-flame underline hover:no-underline">
              Demandez un devis personnalisé
            </Link>
            , on vous propose 2 ou 3 options adaptées.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shown.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="inline-flex items-center justify-center rounded-full bg-mp-green-deep px-7 h-12 text-sm font-semibold text-white transition-all hover:bg-mp-green-mid active:scale-[0.98]"
              >
                Voir plus de modèles ({filtered.length - visible} restant{filtered.length - visible > 1 ? "s" : ""})
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
