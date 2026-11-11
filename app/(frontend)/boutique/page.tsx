import Link from "next/link";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { getAllProducts } from "@/lib/products";
import { BRAND_LIST } from "@/lib/brands";
import { buildPageMetadata } from "@/lib/seo";
import { BoutiqueExplorer } from "@/components/boutique/BoutiqueExplorer";
import { DEFAULT_SORT, sortProducts, withRecency } from "@/lib/boutique-sort";
import { encodeListing } from "@/lib/catalogue-listing";
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

  // Entrées compactes (lib/catalogue-listing.ts), dans l'ordre du tri par
  // défaut : les 24 premières, montrées en cartes d'emblée, gardent la photo
  // en srcset ; les autres partent en lignes de texte avec une seule adresse
  // de photo, pour les cartes de « Voir plus », des filtres et du tri.
  const entries = encodeListing(sortProducts(withRecency(products), DEFAULT_SORT), { shop: true });

  return (
    <>
      <HeroSecondary
        eyebrow={`${products.length} modèles · ${brandsInShop.length} marques · pellets uniquement`}
        title={
          <>
            Tous les <span className="mp-italic">poêles à pellets</span>
          </>
        }
        description="Le catalogue complet de nos poêles à pellets, ou à granulés, filtrable par marque, puissance, type de diffusion et couleur. Tous nos poêles respectent le règlement européen d'écoconception en vigueur depuis 2022."
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
            <details className="group mb-4 rounded-2xl border border-mp-orange-flame/40 bg-mp-orange-light/50 px-4 text-sm text-mp-ink">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
                <span>
                  <strong className="text-mp-green-deep">{BONUS.label}</strong> : prix déjà remisés.
                </span>
                <span className="shrink-0 text-xs font-semibold text-mp-orange-ink underline underline-offset-2">
                  Conditions
                </span>
              </summary>
              <p className="pb-3">
                {BONUS.conditions} Les prix ci-dessous sont déjà remisés, le prix catalogue reste indiqué à côté.
              </p>
            </details>
          ) : null}

          {/* Note devis : on couvre toute la gamme, même les références non listées. */}
          <div className="order-last mt-10 rounded-xl bg-mp-orange-light/50 border border-mp-orange-warm/40 p-4 text-sm text-mp-ink md:order-none md:mt-0 md:mb-8">
            <strong>Besoin d&apos;un modèle précis ?</strong> On pose toute la gamme pellets de MCZ,
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

          <BoutiqueExplorer entries={entries} brandFilters={brandFilters} />
        </div>
      </section>

      <CTAFinal
        title="Pas trouvé le modèle qu'il vous faut ?"
        description="Décrivez votre projet, on vous propose 2 ou 3 options pertinentes, pose et TVA comprises."
      />
    </>
  );
}
