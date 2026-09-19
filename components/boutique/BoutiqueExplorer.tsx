"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
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
  /** Date de création de la fiche (ISO) : tri « Derniers ajouts ». */
  createdAt?: string;
  /** Case « Mis en avant » de l'admin : pèse dans le tri par défaut. */
  isFeatured?: boolean;
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

/**
 * Tri de la grille, côté navigateur comme les filtres (paramètre d'URL `tri`).
 *
 * « Mis en avant » est l'ordre par défaut. Il ne prétend rien recommander : il
 * remonte les fiches cochées « Best-seller » puis « Mis en avant » dans l'admin,
 * fait passer les fiches avec photo avant celles qui n'en ont pas encore, et
 * départage le reste par date d'ajout. L'équipe pilote donc le haut de la
 * boutique depuis ces deux cases.
 */
const SORTS = [
  { value: "mis-en-avant", label: "Mis en avant" },
  { value: "recent", label: "Derniers ajouts" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "puissance-asc", label: "Puissance croissante" },
  { value: "puissance-desc", label: "Puissance décroissante" },
  { value: "nom", label: "Nom, de A à Z" },
] as const;

type SortKey = (typeof SORTS)[number]["value"];
const DEFAULT_SORT: SortKey = "mis-en-avant";
const isSortKey = (v: string | null): v is SortKey => SORTS.some((s) => s.value === v);

const createdTime = (p: BoutiqueProduct): number => (p.createdAt ? Date.parse(p.createdAt) || 0 : 0);
const hasPrice = (p: BoutiqueProduct): boolean => typeof p.priceTTC === "number" && p.priceTTC > 0;
// Fiche regroupée multi-puissances : la plus petite sert au tri croissant, la
// plus grande au tri décroissant (sinon un 9-26 kW se classerait comme un 9 kW).
const minPower = (p: BoutiqueProduct): number => (p.powers && p.powers.length > 0 ? Math.min(...p.powers) : p.powerKw);
const maxPower = (p: BoutiqueProduct): number => (p.powers && p.powers.length > 0 ? Math.max(...p.powers) : p.powerKw);
const featuredScore = (p: BoutiqueProduct): number =>
  (p.isBestseller ? 4 : 0) + (p.isFeatured ? 2 : 0) + (p.image?.url || p.imageSrc ? 1 : 0);

function sortProducts(list: BoutiqueProduct[], sort: SortKey): BoutiqueProduct[] {
  const byRecent = (a: BoutiqueProduct, b: BoutiqueProduct) => createdTime(b) - createdTime(a);
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
        return dir * ((a.priceTTC as number) - (b.priceTTC as number));
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
      return sorted.sort((a, b) => featuredScore(b) - featuredScore(a) || byRecent(a, b));
  }
}

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
  const [sort, setSort] = useState<SortKey>(DEFAULT_SORT);
  const [visible, setVisible] = useState(PAGE_SIZE);

  // Au montage : initialise les filtres depuis l'URL (liens partageables).
  // Évite le hook useSearchParams (qui forcerait la page en dynamique).
  //
  // Le setState est volontairement synchrone dans l'effet : l'URL n'existe
  // pas au rendu serveur, la lire dans un initialiseur d'état provoquerait
  // une divergence d'hydratation. Un seul rendu supplémentaire au montage,
  // uniquement quand la page est ouverte avec des filtres dans l'URL.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrent({
      marque: p.get("marque") ?? "all",
      combustible: p.get("combustible") ?? "all",
      chauffage: p.get("chauffage") ?? "all",
      puissance: p.get("puissance") ?? "all",
      diffusion: p.get("diffusion") ?? "all",
      couleur: p.get("couleur") ?? "all",
    });
    const tri = p.get("tri");
    if (isSortKey(tri)) setSort(tri);
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
    setVisible(PAGE_SIZE);
    syncUrl(next, sort);
  }

  function changeSort(value: string) {
    if (!isSortKey(value)) return;
    setSort(value);
    setVisible(PAGE_SIZE);
    syncUrl(current, value);
  }

  // « Réinitialiser les filtres » ne touche pas au tri : ce n'est pas un filtre.
  function reset() {
    setCurrent(DEFAULT);
    setVisible(PAGE_SIZE);
    syncUrl(DEFAULT, sort);
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

  const sorted = useMemo(() => sortProducts(filtered, sort), [filtered, sort]);

  const activeCount = Object.values(current).filter((v) => v !== "all").length;
  const shown = sorted.slice(0, visible);

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

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* aria-live : un lecteur d'écran annonce le nouveau total après un filtre. */}
        <p className="text-sm text-mp-ink-soft" aria-live="polite">
          <strong className="text-mp-green-deep">{filtered.length}</strong>{" "}
          {filtered.length === 1 ? "modèle" : "modèles"}
          {activeCount > 0 && " correspondant à votre sélection"}
        </p>

        {/* Select natif : clavier, lecteurs d'écran et sélecteur mobile gérés par
            le système. 44 px de haut (cible tactile), 16 px sur mobile pour
            éviter le zoom automatique d'iOS au focus. */}
        {filtered.length > 1 && (
          <div className="flex items-center gap-3">
            <label htmlFor="boutique-tri" className="shrink-0 text-sm font-semibold text-mp-green-deep">
              Trier par
            </label>
            <div className="relative flex-1 sm:flex-none">
              <select
                id="boutique-tri"
                value={sort}
                onChange={(e) => changeSort(e.target.value)}
                className="h-11 w-full cursor-pointer appearance-none rounded-full border border-mp-sand bg-mp-cream pl-4 pr-10 text-base font-medium text-mp-green-deep transition-colors duration-200 hover:border-mp-green-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mp-orange-flame focus-visible:ring-offset-2 focus-visible:ring-offset-mp-cream motion-reduce:transition-none sm:w-60 sm:text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
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
