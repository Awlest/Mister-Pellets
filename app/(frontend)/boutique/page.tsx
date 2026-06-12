import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { getAllProducts } from "@/lib/products";
import { TOP_TIER_BRANDS } from "@/lib/brands";
import { buildPageMetadata } from "@/lib/seo";
import { BoutiqueExplorer, type BoutiqueProduct } from "@/components/boutique/BoutiqueExplorer";

export const metadata = buildPageMetadata({
  title: "Boutique poêles à pellets en Wallonie",
  description:
    "Catalogue Mister Pellets : Edilkamin, EK63, Girolami. Filtres marque, type (standard, canalisable, hydro, hybride, insert), puissance, diffusion, couleur. Pose en Wallonie, prime 2026 incluse.",
  path: "/boutique",
});

/**
 * ISR : la page est STATIQUE (plus de lecture de searchParams) donc servie
 * depuis le cache CDN (~150 ms au lieu de ~1,8 s en rendu dynamique). Le
 * filtrage se fait côté navigateur dans BoutiqueExplorer. Régénération 60 s
 * pour refléter les ajouts/modifs produits de l'admin Payload.
 */
export const revalidate = 60;

const BRAND_FILTERS = [
  { value: "all", label: "Toutes" },
  ...TOP_TIER_BRANDS.map((b) => ({ value: b.name, label: b.name })),
];

export default async function BoutiquePage() {
  const products = await getAllProducts();

  // Shape allégé (carte + filtres uniquement) pour réduire le payload envoyé
  // au navigateur — on ne sérialise pas variantes/galerie/features.
  const lean: BoutiqueProduct[] = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    power: p.power,
    heatedVolume: p.heatedVolume,
    priceTTC: p.priceTTC,
    imageSrc: p.imageSrc,
    imageAlt: p.imageAlt,
    imageFocalX: p.imageFocalX,
    imageFocalY: p.imageFocalY,
    isBestseller: p.isBestseller,
    isNew: p.isNew,
    colorVariants: p.colorVariants?.map((c) => ({ colorName: c.colorName, colorHex: c.colorHex })),
    type: p.type,
    powerKw: p.powerKw,
    diffusion: p.diffusion,
    color: p.color,
  }));

  return (
    <>
      <HeroSecondary
        eyebrow={`${products.length} modèles · ${TOP_TIER_BRANDS.length} marques · pellets uniquement`}
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
          {/* Note devis : on couvre toute la gamme, même les références non listées. */}
          <div className="mb-8 rounded-xl bg-mp-orange-light/50 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink">
            <strong>Besoin d&apos;un modèle précis ?</strong> On distribue toute la gamme Edilkamin, EK63
            et Girolami, même les références qui ne sont pas encore listées ici. Pour un chiffrage
            complet (poêle + pose + prime Wallonie), passez par le{" "}
            <Link href="/demande-de-devis" className="text-mp-orange-flame underline hover:no-underline font-semibold">
              formulaire de devis
            </Link>
            .
          </div>

          <BoutiqueExplorer products={lean} brandFilters={BRAND_FILTERS} />
        </div>
      </section>

      <CTAFinal
        title="Pas trouvé le modèle qu'il vous faut ?"
        description="Décrivez votre projet, on vous propose 2 ou 3 options pertinentes, prime Wallonie déjà calculée."
      />
    </>
  );
}
