import type { Metadata } from "next";
import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { ProductCard } from "@/components/product/ProductCard";
import { Badge } from "@/components/ui/badge";
import { PRODUCTS_DEMO } from "@/lib/products-demo";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Boutique — 61 poêles à pellets en Wallonie",
  description:
    "Catalogue Mister Pellets : 61 modèles Edilkamin, EK63, Dielle, Ferlux. Filtre par marque, type, puissance. Devis avec pose et primes incluses.",
};

interface Props {
  searchParams: Promise<{ marque?: string; type?: string }>;
}

const BRAND_FILTERS = [
  { value: "all", label: "Toutes marques" },
  { value: "Edilkamin", label: "Edilkamin" },
  { value: "EK63", label: "EK63" },
  { value: "Dielle", label: "Dielle" },
  { value: "Ferlux", label: "Ferlux" },
];

const TYPE_FILTERS = [
  { value: "all", label: "Tous types" },
  { value: "air", label: "Air pulsé" },
  { value: "canalisable", label: "Canalisable" },
  { value: "hydro", label: "Hydro" },
];

export default async function BoutiquePage({ searchParams }: Props) {
  const { marque = "all", type = "all" } = await searchParams;

  const filtered = PRODUCTS_DEMO.filter((p) => {
    if (marque !== "all" && p.brand !== marque) return false;
    if (type !== "all" && p.type !== type) return false;
    return true;
  });

  return (
    <>
      <HeroSecondary
        eyebrow={`${PRODUCTS_DEMO.length} modèles · 4 marques`}
        title={
          <>
            Tous les <span className="mp-italic">poêles à pellets</span>
          </>
        }
        description="Le catalogue complet, filtrable par marque et par type. Tous nos modèles sont écodesign 2022 et éligibles aux primes Wallonie 2026. Pose Mister Pellets en 1 jour, garantie 5 ans."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Boutique" },
        ]}
      />

      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          {/* Phase 3 disclaimer */}
          <div className="mb-8 rounded-xl bg-mp-orange-light/50 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink">
            <strong>🚧 Catalogue en construction</strong> · La boutique complète avec 61 modèles, panier et paiement Stripe arrive Phase 5. En attendant, voici un échantillon représentatif. Pour un devis sur n'importe quel modèle (même non listé), utilise le formulaire de devis.
          </div>

          {/* Filtres */}
          <div className="mb-10 space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-3 block">
                Marque
              </span>
              <div className="flex flex-wrap gap-2">
                {BRAND_FILTERS.map((f) => (
                  <Link
                    key={f.value}
                    href={`/boutique?marque=${f.value}${type !== "all" ? `&type=${type}` : ""}`}
                    scroll={false}
                  >
                    <Badge
                      variant={marque === f.value ? "primary" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all hover:bg-mp-orange-flame hover:text-white hover:border-mp-orange-flame",
                        marque === f.value && "shadow-md"
                      )}
                    >
                      {f.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-mp-ink-soft font-semibold mb-3 block">
                Type
              </span>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map((f) => (
                  <Link
                    key={f.value}
                    href={`/boutique?type=${f.value}${marque !== "all" ? `&marque=${marque}` : ""}`}
                    scroll={false}
                  >
                    <Badge
                      variant={type === f.value ? "primary" : "outline"}
                      className={cn(
                        "cursor-pointer transition-all hover:bg-mp-orange-flame hover:text-white hover:border-mp-orange-flame",
                        type === f.value && "shadow-md"
                      )}
                    >
                      {f.label}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="mb-6 text-sm text-mp-ink-soft">
            <strong className="text-mp-green-deep">{filtered.length}</strong>{" "}
            {filtered.length === 1 ? "modèle" : "modèles"} affiché{filtered.length === 1 ? "" : "s"}
            {marque !== "all" && ` · marque ${marque}`}
            {type !== "all" && ` · type ${TYPE_FILTERS.find((t) => t.value === type)?.label}`}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-10 text-center">
              <p className="text-lg text-mp-ink mb-4">
                Aucun modèle ne correspond à ces filtres dans notre catalogue de démo.
              </p>
              <p className="text-sm text-mp-ink-soft">
                Le catalogue complet (61 modèles) arrive en Phase 5. En attendant,{" "}
                <Link href="/demande-de-devis" className="text-mp-orange-flame underline hover:no-underline">
                  demande un devis
                </Link>{" "}
                — on couvre toute la gamme Edilkamin, EK63, Dielle, Ferlux.
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
        description="Notre catalogue complet couvre 61 modèles. Décris ton projet, on te propose 2-3 options pertinentes."
      />
    </>
  );
}
