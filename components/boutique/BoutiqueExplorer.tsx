"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownUp, ChevronDown, SlidersHorizontal } from "lucide-react";
import { ProductFeatureLegend } from "@/components/product/ProductFeatureBadges";
import { ProductListing } from "@/components/product/ProductListing";
import { LISTING_PAGE_SIZE, decodeEntry, type CatalogueEntry, type ListedProduct } from "@/lib/catalogue-listing";
import { DEFAULT_SORT, SORTS, hasPrice, isSortKey, sortProducts, type SortKey } from "@/lib/boutique-sort";
import {
  COMBUSTIBLE_LABELS,
  CHAUFFAGE_LABELS,
  DIFFUSION_LABELS,
  COLOR_LABELS,
  POWER_TRANCHES,
  powerToTranche,
  type Combustible,
  type Diffusion,
  type ColorCategory,
} from "@/lib/products-demo";
import { cn } from "@/lib/utils";
import { effectivePriceTTC } from "@/lib/product-price";

/**
 * Exploration boutique : filtrage CÔTÉ NAVIGATEUR.
 *
 * Avant : la page lisait les filtres dans l'URL (searchParams) → Next.js la
 * rendait dynamiquement à chaque visite (cache MISS, ~1,8 s, 958 Ko rechargés).
 * Maintenant : la page est statique/ISR (cache HIT, ~150 ms), et le filtrage se
 * fait instantanément ici sans recharger. L'URL reste synchronisée (liens
 * partageables) via history.replaceState, sans aller-retour serveur.
 *
 * Chaque fiche a son lien dans le HTML servi : les 24 premières en cartes,
 * toutes les autres en lignes de texte (ProductListing.tsx), lisibles sans
 * JavaScript et suivies par les robots. Les fiches arrivent en entrées
 * compactes (lib/catalogue-listing.ts) : 246 cartes complètes faisaient
 * 1,4 Mo de HTML. Filtres, compteurs et tri portent sur toutes les fiches ;
 * « Voir plus » change les lignes suivantes en cartes.
 */

interface Filters {
  marque: string;
  combustible: string;
  chauffage: string;
  puissance: string;
  /** Budget pour le poêle seul, TVAC (prix affiché sur la carte). */
  budget: string;
  /** « affiche » : seulement les fiches dont le prix est affiché. */
  prix: string;
  diffusion: string;
  couleur: string;
}

const DEFAULT: Filters = {
  marque: "all",
  combustible: "all",
  chauffage: "all",
  puissance: "all",
  budget: "all",
  prix: "all",
  diffusion: "all",
  couleur: "all",
};

/** Tranches de budget, sur le prix du poêle seul affiché sur la carte (TVAC, hors pose). */
const BUDGETS = [
  { value: "0-3000", label: "Moins de 3 000 €", min: 0, max: 3000 },
  { value: "3000-4500", label: "3 000 à 4 500 €", min: 3000, max: 4500 },
  { value: "4500-6000", label: "4 500 à 6 000 €", min: 4500, max: 6000 },
  { value: "6000+", label: "6 000 € et plus", min: 6000, max: Infinity },
] as const;

/** La fiche passe-t-elle un filtre donné ? */
function passes(p: ListedProduct, key: keyof Filters, value: string): boolean {
  if (value === "all") return true;
  switch (key) {
    case "marque":
      return p.brand === value;
    case "combustible":
      return p.combustible === value;
    case "chauffage":
      return (p.isHydro ? "hydro" : "ventile") === value;
    case "puissance": {
      // Fiche regroupée multi-puissances : elle correspond au filtre si
      // l'UNE de ses puissances tombe dans la tranche choisie (sinon le
      // client cherchant 12/14 kW ne trouverait pas un modèle parent à 9 kW).
      const tranches = p.powers && p.powers.length > 0 ? p.powers.map((kw) => powerToTranche(kw)) : [powerToTranche(p.powerKw)];
      return tranches.includes(value);
    }
    case "budget": {
      const budget = BUDGETS.find((b) => b.value === value);
      const price = effectivePriceTTC(p) ?? 0;
      return Boolean(budget) && price > 0 && price >= budget!.min && price < budget!.max;
    }
    case "prix":
      return hasPrice(p);
    case "diffusion":
      return p.diffusion === value;
    case "couleur":
      return p.color === value;
  }
}

const FILTER_KEYS: (keyof Filters)[] = ["marque", "combustible", "chauffage", "puissance", "budget", "prix", "diffusion", "couleur"];

/** La fiche passe tous les filtres, sauf éventuellement celui du groupe qu'on est en train de compter. */
function passesAll(p: ListedProduct, filters: Filters, except?: keyof Filters): boolean {
  return FILTER_KEYS.every((key) => key === except || passes(p, key, filters[key]));
}

const CHAUFFAGE_FILTERS = [{ value: "all", label: "Tous" }, ...Object.entries(CHAUFFAGE_LABELS).map(([value, label]) => ({ value, label }))];
const DIFFUSION_FILTERS = [{ value: "all", label: "Toutes" }, ...(Object.entries(DIFFUSION_LABELS) as [Diffusion, string][]).map(([value, label]) => ({ value, label }))];
const COLOR_FILTERS = [{ value: "all", label: "Toutes" }, ...(Object.entries(COLOR_LABELS) as [ColorCategory, string][]).map(([value, label]) => ({ value, label }))];
const POWER_FILTERS = [{ value: "all", label: "Toutes" }, ...POWER_TRANCHES.map((t) => ({ value: t.value, label: t.label }))];
const BUDGET_FILTERS = [{ value: "all", label: "Tous" }, ...BUDGETS.map((b) => ({ value: b.value, label: b.label }))];
const PRICE_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "affiche", label: "Avec prix affiché" },
];

/**
 * 44 px de haut sur écran tactile (30 px avant, sous la cible minimale), format
 * compact d'origine à la souris (`pointer-fine`).
 */
function FilterPill({
  active,
  disabled = false,
  onClick,
  children,
}: {
  active: boolean;
  /** Option sans aucun résultat avec les autres filtres choisis. */
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      disabled={disabled}
      className={cn(
        "disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-mp-cream disabled:hover:text-mp-green-deep",
        "inline-flex min-h-11 items-center gap-1 rounded-full px-4 text-sm font-semibold transition-colors",
        "pointer-fine:min-h-8 pointer-fine:px-3.5 pointer-fine:text-xs",
        active
          ? "bg-mp-orange-flame text-mp-green-darkest"
          : "bg-mp-cream border border-mp-sand text-mp-green-deep hover:bg-mp-orange-light hover:text-mp-ink",
      )}
    >
      {children}
    </button>
  );
}

export function BoutiqueExplorer({
  entries,
  brandFilters,
}: {
  /** Fiches dans l'ordre du tri par défaut (app/(frontend)/boutique/page.tsx). */
  entries: CatalogueEntry[];
  brandFilters: { value: string; label: string }[];
}) {
  const products = useMemo(() => entries.map(decodeEntry), [entries]);
  const [current, setCurrent] = useState<Filters>(DEFAULT);
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [visible, setVisible] = useState(LISTING_PAGE_SIZE);
  // Sur mobile, les six groupes de filtres occupaient deux écrans avant le
  // premier poêle (1er modèle à 1 750 px du haut à 375 px) : ils se replient
  // derrière un bouton « Filtres ». Toujours dépliés à partir de 768 px.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Une option de combustible n'existe que si une fiche affichée la porte,
  // comme les marques (brandFilters) : pas de filtre qui ne mène à rien.
  const combustibleFilters = useMemo(
    () => [
      { value: "all", label: "Tous" },
      ...(Object.entries(COMBUSTIBLE_LABELS) as [Combustible, string][])
        .filter(([value]) => products.some((p) => p.combustible === value))
        .map(([value, label]) => ({ value, label })),
    ],
    [products],
  );

  // Au montage : initialise les filtres depuis l'URL (liens partageables).
  // Évite le hook useSearchParams (qui forcerait la page en dynamique).
  //
  // Le setState est volontairement synchrone dans l'effet : l'URL n'existe
  // pas au rendu serveur, la lire dans un initialiseur d'état provoquerait
  // une divergence d'hydratation. Un seul rendu supplémentaire au montage,
  // uniquement quand la page est ouverte avec des filtres dans l'URL.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // Un ancien lien `?combustible=bois` (option retirée) ouvre toute la
    // boutique plutôt qu'une grille vide.
    const combustible = p.get("combustible");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent({
      marque: p.get("marque") ?? "all",
      combustible: combustible && combustibleFilters.some((f) => f.value === combustible) ? combustible : "all",
      chauffage: p.get("chauffage") ?? "all",
      puissance: p.get("puissance") ?? "all",
      budget: p.get("budget") ?? "all",
      prix: p.get("prix") ?? "all",
      diffusion: p.get("diffusion") ?? "all",
      couleur: p.get("couleur") ?? "all",
    });
    const tri = p.get("tri");
    if (isSortKey(tri)) setSort(tri);
    // Lecture de l'URL au montage seulement : la liste des options ne change pas ensuite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Filtres + tri dans l'URL (lien partageable), sans aller-retour serveur. */
  function syncUrl(filters: Filters, sortKey: SortKey) {
    const params = new URLSearchParams();
    (Object.keys(filters) as (keyof Filters)[]).forEach((k) => {
      if (filters[k] !== "all") params.set(k, filters[k]);
    });
    if (sortKey !== DEFAULT_SORT) params.set("tri", sortKey);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `/boutique?${qs}` : "/boutique");
  }

  function setFilter(key: keyof Filters, value: string) {
    const next = { ...current, [key]: value };
    setCurrent(next);
    setVisible(LISTING_PAGE_SIZE);
    syncUrl(next, sort);
  }

  function changeSort(value: string) {
    if (!isSortKey(value)) return;
    setSort(value);
    setVisible(LISTING_PAGE_SIZE);
    syncUrl(current, value);
  }

  // « Réinitialiser les filtres » ne touche pas au tri : ce n'est pas un filtre.
  function reset() {
    setCurrent(DEFAULT);
    setVisible(LISTING_PAGE_SIZE);
    syncUrl(DEFAULT, sort);
  }

  const filtered = useMemo(() => products.filter((p) => passesAll(p, current)), [products, current]);

  /**
   * Nombre de fiches qu'une option donnerait, les autres filtres restant
   * choisis : affiché sur chaque puce, et une option à zéro est désactivée
   * (plus de « Voir les 0 modèles »).
   */
  const optionCount = (key: keyof Filters, value: string): number =>
    products.filter((p) => passesAll(p, current, key) && passes(p, key, value)).length;

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const activeCount = Object.values(current).filter((v) => v !== "all").length;

  const GROUPS: { label: string; key: keyof Filters; options: { value: string; label: string }[] }[] = [
    { label: "Marque", key: "marque", options: brandFilters },
    { label: "Combustible", key: "combustible", options: combustibleFilters },
    { label: "Chauffage", key: "chauffage", options: CHAUFFAGE_FILTERS },
    { label: "Puissance", key: "puissance", options: POWER_FILTERS },
    { label: "Budget (poêle seul, TVAC)", key: "budget", options: BUDGET_FILTERS },
    { label: "Prix", key: "prix", options: PRICE_FILTERS },
    { label: "Diffusion de chaleur", key: "diffusion", options: DIFFUSION_FILTERS },
    { label: "Couleur", key: "couleur", options: COLOR_FILTERS },
  ];

  return (
    <>
      {/* Mobile : [Filtres] [Tri] sur une ligne, filtres repliés, total dessous.
          À partir de 768 px : filtres dépliés, puis total et tri sur une ligne.
          Une seule liste de contrôles, rangée par zones de grille. */}
      <div
        className={cn(
          "mb-6 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-4",
          "[grid-template-areas:'toggle_sort'_'panel_panel'_'count_count']",
          "md:grid-cols-[minmax(0,1fr)_auto] md:gap-y-6 md:[grid-template-areas:'panel_panel'_'count_sort']",
        )}
      >
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          aria-controls="boutique-filtres"
          className={cn(
            "[grid-area:toggle] inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-sm font-semibold transition-colors md:hidden",
            filtersOpen || activeCount > 0
              ? "border-mp-green-deep bg-mp-green-deep text-white"
              : "border-mp-green-deep text-mp-green-deep",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filtres
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-mp-orange-flame px-1 text-xs text-mp-green-darkest">
              {activeCount}
              <span className="sr-only"> actif{activeCount > 1 ? "s" : ""}</span>
            </span>
          )}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform motion-reduce:transition-none", filtersOpen && "rotate-180")}
            aria-hidden
          />
        </button>

        <div
          id="boutique-filtres"
          // Ordinateur : les groupes sur deux ou trois colonnes, pour que les
          // premiers poêles arrivent plus haut (six groupes empilés : 470 px).
          className={cn(
            "[grid-area:panel] space-y-5 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-5 md:space-y-0 xl:grid-cols-3",
            !filtersOpen && "hidden md:grid",
          )}
        >
          {GROUPS.map((g) => (
            <div key={g.key}>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">{g.label}</span>
              <div className="flex flex-wrap gap-2">
                {g.options.map((f) => {
                  const active = current[g.key] === f.value;
                  const count = optionCount(g.key, f.value);
                  return (
                    <FilterPill
                      key={f.value}
                      active={active}
                      disabled={count === 0 && !active}
                      onClick={() => setFilter(g.key, f.value)}
                    >
                      {f.label}
                      <span className={cn("text-xs tabular-nums", active ? "text-mp-green-darkest" : "text-mp-ink-soft")}>
                        {count}
                        <span className="sr-only">{count > 1 ? " modèles" : " modèle"}</span>
                      </span>
                    </FilterPill>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 md:col-span-full">
            {/* Mobile : refermer le volet et voir les résultats sans remonter. */}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-mp-green-deep px-6 text-sm font-semibold text-white transition-colors hover:bg-mp-green-mid md:hidden"
            >
              Voir {filtered.length === 1 ? "le modèle" : `les ${filtered.length} modèles`}
            </button>
            {activeCount > 0 && (
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-mp-orange-ink underline hover:no-underline pointer-fine:min-h-0 pointer-fine:text-xs"
              >
                Réinitialiser les filtres ({activeCount} actif{activeCount > 1 ? "s" : ""})
              </button>
            )}
          </div>
        </div>

        {/* aria-live : un lecteur d'écran annonce le nouveau total après un filtre. */}
        <p className="[grid-area:count] text-sm text-mp-ink-soft" aria-live="polite">
          <strong className="text-mp-green-deep">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "modèle" : "modèles"}
          {activeCount > 0 && " correspondant à votre sélection"}
        </p>

        {/* Select natif : clavier, lecteurs d'écran et sélecteur mobile gérés par
            le système. 44 px de haut (cible tactile), 16 px sur mobile pour
            éviter le zoom automatique d'iOS au focus. */}
        {filtered.length > 1 && (
          <div className="[grid-area:sort] flex min-w-0 items-center gap-3">
            <label htmlFor="boutique-tri" className="sr-only shrink-0 text-sm font-semibold text-mp-green-deep md:not-sr-only">
              Trier par
            </label>
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <select
                id="boutique-tri"
                value={sort}
                onChange={(e) => changeSort(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-full border border-mp-sand bg-mp-cream pl-10 pr-10 text-base md:pl-4 font-medium text-mp-green-deep transition-colors duration-200 hover:border-mp-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-ink focus-visible:ring-offset-2 focus-visible:ring-offset-mp-cream motion-reduce:transition-none sm:w-60 sm:text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {/* Sur mobile le libellé « Trier par » est réservé aux lecteurs
                  d'écran : la flèche signale le tri sans prendre de place. */}
              <ArrowDownUp
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mp-ink-soft md:hidden"
              />
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mp-ink-soft"
              />
            </div>
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-10 text-center">
          <p className="text-lg text-mp-ink mb-4">
            Aucun modèle ne correspond à cette combinaison de filtres.
          </p>
          <p className="text-sm text-mp-ink-soft">
            On couvre toute la gamme MCZ, Edilkamin, EK63, Girolami, Austroflamm et Cadel.{" "}
            <Link href="/demande-de-devis" className="text-mp-orange-ink underline hover:no-underline">
              Demandez un devis personnalisé
            </Link>
            , on vous propose 2 ou 3 options adaptées.
          </p>
        </div>
      ) : (
        <>
          {/* Légende des pastilles des photos, juste avant les premiers poêles. */}
          <ProductFeatureLegend className="mb-6" />
          {/* Titre de la grille pour les lecteurs d'écran : sans lui, les noms
              de poêles (h3) suivaient directement le h1. */}
          <h2 className="sr-only">Modèles</h2>
          <ProductListing
            products={sorted}
            visible={visible}
            onShowMore={() => setVisible((v) => v + LISTING_PAGE_SIZE)}
            priority
          />
        </>
      )}
    </>
  );
}
