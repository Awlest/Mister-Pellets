import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { getAllProducts } from "@/lib/products";
import { BRAND_LIST } from "@/lib/brands";
import { buildPageMetadata } from "@/lib/seo";
import { BoutiqueExplorer, type BoutiqueProduct } from "@/components/boutique/BoutiqueExplorer";
import { BONUS, isBonusPeriod } from "@/lib/bonus";

export const metadata = buildPageMetadata({
  title: "Boutique poêles à pellets en Wallonie",
  description:
    "Catalogue Mister Pellets : poêles à pellets MCZ, Edilkamin, EK63, Girolami, Austroflamm et Cadel. Filtres par marque, type et puissance, pose en Wallonie.",
  path: "/boutique",
});

/**
 * ISR : la page est STATIQUE (plus de lecture de searchParams) donc servie
 * depuis le cache CDN (~150 ms au lieu de ~1,8 s en rendu dynamique). Le
 * filtrage se fait côté navigateur dans BoutiqueExplorer. Régénération 60 s
 * pour refléter les ajouts/modifs produits de l'admin Payload.
 */
export const revalidate = 60;

/** Retire les champs vides, `false` et les tableaux vides d'un objet à sérialiser. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, v]) => v !== undefined && v !== null && v !== false && !(Array.isArray(v) && v.length === 0),
    ),
  ) as T;
}

export default async function BoutiquePage() {
  const products = await getAllProducts();
  // Filtre par marque : seulement les marques qui ont au moins une fiche en
  // boutique, dans l'ordre de BRAND_LIST (top tier d'abord).
  const brandsInShop = BRAND_LIST.filter((b) => products.some((p) => p.brand === b.name));
  const brandFilters = [
    { value: "all", label: "Toutes" },
    ...brandsInShop.map((b) => ({ value: b.name, label: b.name })),
  ];
  const bonusActive = isBonusPeriod();

  // Shape allégé (carte + filtres uniquement) pour réduire le payload envoyé
  // au navigateur — on ne sérialise pas variantes/galerie/features. Toutes les
  // cartes sont rendues dans le HTML (BoutiqueExplorer) : ces données ne
  // servent qu'à l'hydratation, au filtrage et au tri. On n'envoie donc ni
  // champ vide (chaque `undefined` coûte une entrée dans la page), ni `false`,
  // ni doublon de la photo (l'URL, le texte alternatif et le point focal sont
  // lus une seule fois par ProductCard).
  const lean: BoutiqueProduct[] = products.map((p) =>
    compact({
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      power: p.power,
      heatedVolume: p.heatedVolume,
      powers: p.powers,
      heatedVolumes: p.heatedVolumes,
      priceTTC: p.priceTTC,
      promoPriceTTC: p.promoPriceTTC,
      bonusPriceTTC: p.bonusPriceTTC,
      imageSrc: p.image ? undefined : p.imageSrc,
      imageAlt: p.imageAlt && p.imageAlt !== p.name ? p.imageAlt : undefined,
      imageFocalX: p.imageFocalX,
      imageFocalY: p.imageFocalY,
      image: p.image
        ? compact({ url: p.image.url, width: p.image.width, sizes: p.image.sizes })
        : undefined,
      createdAt: p.createdAt,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller,
      isNew: p.isNew,
      colorVariants: p.colorVariants
        ?.filter((c) => c.colorHex)
        .map((c) => ({ colorName: c.colorName, colorHex: c.colorHex })),
      type: p.type,
      combustible: p.combustible,
      isHydro: p.isHydro,
      isCanalizable: p.isCanalizable,
      isAirtight: p.isAirtight,
      powerKw: p.powerKw,
      diffusion: p.diffusion,
      color: p.color,
    }),
  );

  return (
    <>
      <HeroSecondary
        eyebrow={`${products.length} modèles · ${brandsInShop.length} marques · pellets uniquement`}
        title={
          <>
            Tous les <span className="mp-italic">poêles à pellets</span>
          </>
        }
        description="Le catalogue complet, filtrable par marque, puissance, type de diffusion et couleur. Tous nos poêles respectent le règlement européen d'écoconception en vigueur depuis 2022."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Boutique" },
        ]}
        compact
      />

      {/* Mêmes valeurs que mp-band, haut resserré sur mobile après le héros compact. */}
      <section className="bg-mp-cream pt-6 pb-14 md:py-20">
        {/* flex-col + order : sur mobile, la note « modèle précis » passe sous
            la grille pour que les poêles arrivent plus haut. */}
        <div className="mp-shell flex flex-col">
          {bonusActive ? (
            <div className="mb-4 rounded-xl border border-mp-orange-flame/40 bg-mp-orange-light/50 p-4 text-sm text-mp-ink">
              <strong className="text-mp-green-deep">{BONUS.label}.</strong> {BONUS.conditions}{" "}
              Les prix ci-dessous sont déjà remisés, le prix catalogue reste indiqué à côté.
            </div>
          ) : null}

          {/* Note devis : on couvre toute la gamme, même les références non listées. */}
          <div className="order-last mt-10 rounded-xl bg-mp-orange-light/50 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink md:order-none md:mt-0 md:mb-8">
            <strong>Besoin d&apos;un modèle précis ?</strong> On pose toute la gamme pellets de MCZ,
            Edilkamin, EK63, Girolami, Austroflamm et Cadel, même les références qui ne sont pas encore
            listées ici. Pour un chiffrage complet (poêle, pose et TVA), passez par le{" "}
            <Link href="/demande-de-devis" className="text-mp-orange-ink underline hover:no-underline font-semibold">
              formulaire de devis
            </Link>
            . Les forfaits de pose par type de conduit sont sur la page{" "}
            <Link href="/prix-poele-pellets" className="text-mp-orange-ink underline hover:no-underline font-semibold">
              prix d&apos;un poêle à pellets posé
            </Link>
            .
          </div>

          <BoutiqueExplorer products={lean} brandFilters={brandFilters} />
        </div>
      </section>

      <CTAFinal
        title="Pas trouvé le modèle qu'il vous faut ?"
        description="Décrivez votre projet, on vous propose 2 ou 3 options pertinentes, pose et TVA comprises."
      />
    </>
  );
}
