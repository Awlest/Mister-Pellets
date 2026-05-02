import type { Metadata } from "next";
import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { ProductCard } from "@/components/product/ProductCard";
import {
  PRODUCTS_DEMO,
  POWER_TRANCHES,
  DIFFUSION_LABELS,
  COLOR_LABELS,
  powerToTranche,
  type Diffusion,
  type Color,
} from "@/lib/products-demo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Boutique poêles à pellets, 61 modèles en Wallonie | Mister Pellets",
  description:
    "Catalogue Mister Pellets : 61 modèles Edilkamin, EK63, Dielle, Ferlux. Filtres marque, puissance, type de diffusion, couleur. Devis avec pose et prime Wallonie 2026 incluse.",
};

interface Props {
  searchParams: Promise<{
    marque?: string;
    type?: string;
    puissance?: string;
    diffusion?: string;
    couleur?: string;
  }>;
}

const BRAND_FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "Edilkamin", label: "Edilkamin" },
  { value: "EK63", label: "EK63" },
  { value: "Dielle", label: "Dielle" },
  { value: "Ferlux", label: "Ferlux" },
];

const TYPE_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "air", label: "Air pulsé" },
  { value: "canalisable", label: "Canalisable" },
  { value: "hydro", label: "Hydro" },
];

const DIFFUSION_FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "ventilation-forcee", label: DIFFUSION_LABELS["ventilation-forcee"] },
  { value: "canalisable", label: DIFFUSION_LABELS.canalisable },
  { value: "convection-naturelle", label: DIFFUSION_LABELS["convection-naturelle"] },
  { value: "hydro", label: DIFFUSION_LABELS.hydro },
];

const POWER_FILTERS = [
  { value: "all", label: "Toutes" },
  ...POWER_TRANCHES.map((t) => ({ value: t.value, label: t.label })),
];

const COLOR_FILTERS = [
  { value: "all", label: "Toutes" },
  ...(Object.entries(COLOR_LABELS) as [Color, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

// Construit l'URL en préservant les autres filtres
function buildHref(
  current: { marque: string; type: string; puissance: string; diffusion: string; couleur: string },
  override: Partial<typeof current>,
) {
  const merged = { ...current, ...override };
  const params = new URLSearchParams();
  if (merged.marque !== "all") params.set("marque", merged.marque);
  if (merged.type !== "all") params.set("type", merged.type);
  if (merged.puissance !== "all") params.set("puissance", merged.puissance);
  if (merged.diffusion !== "all") params.set("diffusion", merged.diffusion);
  if (merged.couleur !== "all") params.set("couleur", merged.couleur);
  const qs = params.toString();
  return qs ? `/boutique?${qs}` : "/boutique";
}

// Pill bouton de filtre, contraste WCAG AA garanti
function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "bg-mp-orange-flame text-white shadow-sm"
          : "bg-mp-cream border border-mp-sand text-mp-green-deep hover:bg-mp-orange-light hover:text-mp-ink"
      )}
    >
      {children}
    </Link>
  );
}

export default async function BoutiquePage({ searchParams }: Props) {
  const sp = await searchParams;
  const current = {
    marque: sp.marque ?? "all",
    type: sp.type ?? "all",
    puissance: sp.puissance ?? "all",
    diffusion: sp.diffusion ?? "all",
    couleur: sp.couleur ?? "all",
  };

  const filtered = PRODUCTS_DEMO.filter((p) => {
    if (current.marque !== "all" && p.brand !== current.marque) return false;
    if (current.type !== "all" && p.type !== current.type) return false;
    if (current.puissance !== "all" && powerToTranche(p.powerKw) !== current.puissance)
      return false;
    if (current.diffusion !== "all" && p.diffusion !== (current.diffusion as Diffusion))
      return false;
    if (current.couleur !== "all" && p.color !== (current.couleur as Color)) return false;
    return true;
  });

  const activeFilterCount = Object.values(current).filter((v) => v !== "all").length;

  return (
    <>
      <HeroSecondary
        eyebrow={`${PRODUCTS_DEMO.length} modèles · 4 marques · pellets uniquement`}
        title={
          <>
            Tous les <span className="mp-italic">poêles à pellets</span>
          </>
        }
        description="Le catalogue complet, filtrable par marque, puissance, type de diffusion et couleur. Tous nos modèles sont conformes écodesign 2022 et figurent dans la liste officielle SPW Logement éligible à la Prime Habitation Wallonie 2026."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Boutique" },
        ]}
      />

      <section className="bg-mp-cream py-10 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          {/* Disclaimer Phase 5 */}
          <div className="mb-8 rounded-xl bg-mp-orange-light/50 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink">
            <strong>Catalogue en construction.</strong> La boutique complète avec 61 modèles, panier
            et paiement Stripe sera enrichie progressivement. En attendant, voici un échantillon
            représentatif. Pour un devis sur n'importe quel modèle (même non listé), utilise le{" "}
            <Link href="/demande-de-devis" className="text-mp-orange-flame underline hover:no-underline font-semibold">
              formulaire de devis
            </Link>
            .
          </div>

          {/* Filtres, 5 axes */}
          <div className="mb-8 space-y-5">
            {/* Marque */}
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">
                Marque
              </span>
              <div className="flex flex-wrap gap-2">
                {BRAND_FILTERS.map((f) => (
                  <FilterPill
                    key={f.value}
                    href={buildHref(current, { marque: f.value })}
                    active={current.marque === f.value}
                  >
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">
                Type
              </span>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((f) => (
                  <FilterPill
                    key={f.value}
                    href={buildHref(current, { type: f.value })}
                    active={current.type === f.value}
                  >
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Puissance, nouveau filtre #5a */}
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">
                Puissance
              </span>
              <div className="flex flex-wrap gap-2">
                {POWER_FILTERS.map((f) => (
                  <FilterPill
                    key={f.value}
                    href={buildHref(current, { puissance: f.value })}
                    active={current.puissance === f.value}
                  >
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Diffusion, nouveau filtre #5b */}
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">
                Diffusion de chaleur
              </span>
              <div className="flex flex-wrap gap-2">
                {DIFFUSION_FILTERS.map((f) => (
                  <FilterPill
                    key={f.value}
                    href={buildHref(current, { diffusion: f.value })}
                    active={current.diffusion === f.value}
                  >
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Couleur, nouveau filtre #5c */}
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-2 block">
                Couleur
              </span>
              <div className="flex flex-wrap gap-2">
                {COLOR_FILTERS.map((f) => (
                  <FilterPill
                    key={f.value}
                    href={buildHref(current, { couleur: f.value })}
                    active={current.couleur === f.value}
                  >
                    {f.label}
                  </FilterPill>
                ))}
              </div>
            </div>

            {/* Reset si au moins un filtre actif */}
            {activeFilterCount > 0 && (
              <div>
                <Link
                  href="/boutique"
                  className="inline-flex items-center text-xs font-semibold text-mp-orange-flame underline hover:no-underline"
                >
                  Réinitialiser les filtres ({activeFilterCount} actif{activeFilterCount > 1 ? "s" : ""})
                </Link>
              </div>
            )}
          </div>

          {/* Résultats */}
          <div className="mb-6 text-sm text-mp-ink-soft">
            <strong className="text-mp-green-deep">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "modèle" : "modèles"}
            {activeFilterCount > 0 && ` correspondant à ta sélection`}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-10 text-center">
              <p className="text-lg text-mp-ink mb-4">
                Aucun modèle ne correspond à cette combinaison de filtres dans le catalogue actuel.
              </p>
              <p className="text-sm text-mp-ink-soft">
                Notre catalogue complet couvre 61 modèles. En attendant l'import complet,{" "}
                <Link href="/demande-de-devis" className="text-mp-orange-flame underline hover:no-underline">
                  demande un devis personnalisé
                </Link>{" "}
               , on couvre toute la gamme Edilkamin, EK63, Dielle, Ferlux.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTAFinal
        title="Pas trouvé le modèle qu'il te faut ?"
        description="Notre catalogue complet couvre 61 modèles. Décris ton projet, on te propose 2 ou 3 options pertinentes, prime Wallonie déjà calculée."
      />
    </>
  );
}
