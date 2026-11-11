import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ArrowRight, Check, Flame, Award, Wifi, Wind, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductVariantPanel } from "@/components/product/ProductVariantPanel";
import { ProductAccessories } from "@/components/product/ProductAccessories";
import { ProductActionBar, YIELDS_TO_ACTION_BAR } from "@/components/product/ProductActionBar";
import { ProductColorProvider } from "@/components/product/ProductColorContext";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { GoogleRatingNote } from "@/components/sections/GoogleReviews";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getAllProducts,
  getAllProductSlugs,
  getOffCatalogueRedirect,
  getProductBySlug,
} from "@/lib/products";
import { isHybrid, misterBoisCanonical } from "@/lib/catalog-scope";
import { REDIRECTED_PRODUCT_SLUGS } from "@/config/redirects";
import { BRANDS, TOP_TIER_BRANDS } from "@/lib/brands";
import { formatPrice, formatPriceHT } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";
import { BONUS, bonusLabelFor } from "@/lib/bonus";
import { typo } from "@/lib/typo";
import { productFamily, productNeighbours } from "@/lib/product-neighbours";
import { guaranteeLine, priceBadge, reducedVatPrice, shownPriceTTC, struckPriceTTC } from "@/lib/product-price";
import { formatKw } from "@/lib/power";
import { categoriesOf } from "@/lib/categories";
import { ACTION_LABELS, ROUTES } from "@/config/navigation";
import {
  productDescription,
  productImages,
  productJsonLd,
  productSpecs,
  productTitle,
} from "@/lib/product-seo";
import type { ProductDemo, ProductType } from "@/lib/products-demo";
import { productPrimaryAction } from "@/lib/price-request";

interface Props {
  params: Promise<{ slug: string }>;
}

const MORE_LINK =
  "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mp-green-deep underline underline-offset-4 decoration-mp-sand hover:text-mp-orange-ink";

/**
 * ISR : régénération max toutes les 60s pour que les modifications admin
 * Payload remontent rapidement même sans hook revalidatePath manuel.
 * Combiné au hook afterChange dans collections/Products.ts qui force la
 * revalidation instantanée à chaque save.
 */
export const revalidate = 60;

/**
 * Catalogue fermé au build : toutes les fiches, masquées comprises, sont
 * construites par generateStaticParams, et un slug hors liste reçoit la page
 * 404 du site (app/global-not-found.tsx), rendue par le serveur avec l'habillage et
 * l'amorce du consentement dans le <head>. Le notFound() de la page ne donne
 * qu'un HTML vide, la coquille d'erreur de Next (voir la page installation).
 *
 * Contrepartie : un produit créé, supprimé ou dont le slug change dans l'admin
 * ne change la liste des pages qu'au build suivant, que collections/Products.ts
 * relance par le Deploy Hook Vercel (lib/deploy-hook.ts).
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  // Query Payload au build : tous les produits, masqués compris, sauf ceux
  // dont l'adresse est déjà redirigée par config/redirects.ts (fiches bois
  // parties sur mister-bois.be, anciennes fiches Girolami) : la redirection
  // passe avant la page, qui ne serait jamais servie.
  const slugs = await getAllProductSlugs();
  return slugs.filter((slug) => !REDIRECTED_PRODUCT_SLUGS.has(slug)).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  // Seul cas restant : un produit supprimé ou renommé dans l'admin, dont la
  // page construite est revalidée avant la fin du build relancé par le hook.
  // La page répond alors 404 (notFound() plus bas), en noindex.
  if (!product)
    return { title: "Produit introuvable", robots: { index: false, follow: false } };
  // Hybride bois + pellets : la fiche de référence est celle de mister-bois.be
  // (décision du 11/11/2026). La page reste affichée ici, avec un canonical
  // vers l'autre site ; sans fiche équivalente connue, elle sort de l'index.
  const hybrid = isHybrid(product);
  const referenceUrl = hybrid ? misterBoisCanonical(product.slug) : undefined;
  // Titre et description bâtis sur les données de la fiche (lib/product-seo.ts).
  // Les champs metaTitle et metaDescription de l'admin ne sont pas repris :
  // une partie promet encore une prime ou une livraison qui n'existent plus.
  return buildPageMetadata({
    title: productTitle(product),
    description: productDescription(product, priceSentence(product)),
    // Photo de la fiche à la place de l'image générique du site.
    image: productImages(product)[0],
    type: "product",
    path: `/produit/${product.slug}`,
    canonical: referenceUrl,
    // Fiche masquée de la boutique : joignable par son URL (liens, favoris)
    // mais hors de Google, comme elle l'est déjà du sitemap et du flux.
    noindex: product.hiddenFromBoutique || (hybrid && !referenceUrl),
  });
}

/** « Dès 2 856 € TVAC, hors pose. » ou « Prix sur devis. » : fin de la description. */
function priceSentence(product: ProductDemo): string {
  const shown = shownPriceTTC(product);
  if (!product.priceTTC || !shown) return "Prix sur devis.";
  const from = product.hasVariants && product.variants?.length ? "Dès " : "";
  return `${from}${formatPrice(shown)} TVAC, hors pose.`;
}

/** Libellé lisible du type, à la place de la valeur technique (« standard », « hybride-hydro »). */
const TYPE_TITLES: Record<ProductType, string> = {
  standard: "Poêle à air",
  canalisable: "Poêle canalisable",
  hydro: "Poêle hydro",
  hybride: "Hybride bois + pellets",
  "hybride-hydro": "Hybride raccordé au chauffage central",
  insert: "Insert encastrable",
};

/** Guide ou article qui détaille le type de l'appareil, quand il existe. */
function typeGuide(p: ProductDemo): { href: string; label: string } | undefined {
  switch (productFamily(p)) {
    case "canalisable":
      return { href: "/guides/poele-pellets-canalisable", label: "Guide du poêle canalisable" };
    case "hydro":
      return { href: "/guides/poele-pellets-hydro", label: "Guide du poêle hydro" };
    case "insert":
      return { href: "/blog/insert-pellets-cheminee-existante", label: "Poser un insert à pellets" };
    default:
      return undefined;
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    // Fiche à bois bûche : hors catalogue (lib/catalog-scope.ts). Elle n'est
    // jamais affichée ici, le visiteur part sur mister-bois.be.
    const elsewhere = await getOffCatalogueRedirect(slug);
    if (elsewhere) permanentRedirect(elsewhere);
    notFound();
  }

  const brandSlug = product.brand.toLowerCase() as keyof typeof BRANDS;
  const brand = BRANDS[brandSlug];
  // Page de la marque, si elle est affichée (Dielle et Ferlux n'en ont plus).
  const brandHref = TOP_TIER_BRANDS.some((b) => b.slug === brandSlug)
    ? `${ROUTES.brands}/${brandSlug}`
    : ROUTES.brands;

  // Modèles voisins : 3 de la même marque, puis 3 d'autres marques, de même
  // famille (air, canalisable, hydro, insert) et de puissance proche
  // (lib/product-neighbours.ts).
  const { sameBrand, otherBrands } = productNeighbours(product, await getAllProducts());

  // Prix de la fiche : bonus de saison, sinon promo admin, sinon catalogue, avec
  // le prix précédent barré (lib/product-price.ts).
  const shownTTC = shownPriceTTC(product);
  const struckTTC = struckPriceTTC(product);
  const badge = priceBadge(product);

  // Données structurées (lib/product-seo.ts) : Product avec ses seules offres
  // chiffrées, ou WebPage quand la fiche est « Sur devis ».
  const productSchema = productJsonLd(product, productDescription(product, priceSentence(product)));
  const specs = productSpecs(product);
  const guide = typeGuide(product);
  const categories = categoriesOf(product);
  // Bouton principal : fiche chiffrée, le configurateur s'ouvre sur ce modèle
  // (EstimateConfigurator lit `modele`) ; fiche sur devis, ce modèle n'est pas
  // dans l'estimation, le bouton demande son prix (lib/price-request.ts).
  const primary = productPrimaryAction(product, { estimate: ACTION_LABELS.estimate });

  return (
    <>
      <JsonLd data={productSchema} />
      {/* og:type « product » : absent de l'API Metadata de Next, posé ici (React le remonte dans le <head>). */}
      <meta property="og:type" content="product" />

      {/* Breadcrumb + content */}
      <section className="bg-mp-cream pt-8 pb-12 md:pb-16 border-b border-mp-sand/30">
        <div className="mp-shell">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Boutique", href: "/boutique" },
              { label: product.brand, href: brandHref },
              { label: product.name },
            ]}
            className="mb-8"
          />

          {/* Provider couleur : partage la variante sélectionnée entre la
              galerie (gauche) et le bloc d'achat (droite). */}
          <ProductColorProvider>
          {/* Trois blocs : en-tête (marque + nom), galerie, informations. Sur
              mobile ils s'empilent dans cet ordre, pour que le nom du poêle
              apparaisse dans le premier écran : sous la galerie et les
              pastilles de finition, il tombait vers 950 px. À partir de
              1 024 px, la galerie occupe la colonne de gauche sur toute la
              hauteur et l'en-tête reprend le haut de la colonne de droite. */}
          <div className="grid grid-cols-1 gap-y-6 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-0">
            <div className="lg:col-start-2 lg:row-start-1">
              <div className="flex flex-wrap items-center gap-2 mb-2 lg:mb-3">
                <Link
                  href={brandHref}
                  className="-my-3 inline-flex min-h-11 min-w-11 items-center text-xs font-semibold uppercase tracking-wider text-mp-orange-ink hover:underline"
                >
                  {product.brand}
                </Link>
                {product.isBestseller && <Badge variant="primary">Best-seller</Badge>}
                {product.isNew && <Badge variant="success">Nouveau</Badge>}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-mp-green-deep lg:mb-4 leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Galerie interactive : clic vignette = image principale change,
                clic image principale = lightbox plein écran. Composant client. */}
            <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
              <ProductGallery
                productName={product.name}
                mainImage={
                  product.image ??
                  (product.imageSrc
                    ? { url: product.imageSrc, alt: product.imageAlt ?? product.name }
                    : undefined)
                }
                galleryImages={product.galleryImages}
                colorVariants={product.colorVariants}
              />

              {/* Lien fiche technique PDF si attachée au produit */}
              {product.technicalSheetUrl && (
                <a
                  href={product.technicalSheetUrl}
                  target="_blank"
                  rel="noopener"
                  className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mp-orange-ink hover:text-mp-green-deep transition-colors underline-offset-4 hover:underline"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  Télécharger la fiche technique (PDF)
                </a>
              )}
            </div>

            {/* Info produit */}
            <div className="mt-4 lg:col-start-2 lg:row-start-2 lg:mt-0">
              {/* Description : priorité au shortDescription saisi dans l'admin.
                  Fallback sur le template marketing seulement si vide ET que les
                  données minimales (surface) sont présentes pour éviter "pour ." */}
              {product.shortDescription ? (
                <p className="text-lg text-mp-ink-soft mb-6 leading-relaxed">
                  {product.shortDescription}
                </p>
              ) : product.heatedVolume ? (
                <p className="text-lg text-mp-ink-soft mb-6 leading-relaxed">
                  {brand?.tagline}. {product.power} pour chauffer {product.heatedVolume}. Pose par
                  Mister Pellets en une journée, TVA à 6 % en rénovation et garantie légale de 2 ans, pose comprise.
                </p>
              ) : (
                <p className="text-lg text-mp-ink-soft mb-6 leading-relaxed">
                  {brand?.tagline}. Pose par Mister Pellets en une journée, TVA à 6 % en rénovation
                  et garantie légale de 2 ans, pose comprise.
                </p>
              )}

              {/* Tags techniques : chaque badge n'apparaît que si la donnée existe.
                  Pour une fiche regroupée multi-puissances, on liste toutes les
                  puissances (ex: "8,3 · 10,8 · 13 kW") et la fourchette de surface. */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.powers && product.powers.length > 1 ? (
                  <Badge variant="default">
                    <Flame className="h-3.5 w-3.5" /> {product.powers.map(formatKw).join(" · ")} kW
                  </Badge>
                ) : (
                  product.power && (
                    <Badge variant="default">
                      <Flame className="h-3.5 w-3.5" /> {product.power}
                    </Badge>
                  )
                )}
                {product.heatedVolumes && product.heatedVolumes.length > 1 ? (
                  <Badge variant="default">
                    {product.heatedVolumes[0]}–
                    {product.heatedVolumes[product.heatedVolumes.length - 1]} m³
                  </Badge>
                ) : (
                  product.heatedVolume && <Badge variant="default">{product.heatedVolume}</Badge>
                )}
                {product.type && <Badge variant="default">{TYPE_TITLES[product.type]}</Badge>}
                {product.isAirtight && (
                  <Badge variant="default">
                    <Wind className="h-3.5 w-3.5" /> Étanche
                  </Badge>
                )}
                {product.isConnected && (
                  <Badge variant="default">
                    <Wifi className="h-3.5 w-3.5" /> WiFi
                  </Badge>
                )}
              </div>

              {/* Mode variantes : panneau de sélection interactif (client).
                  Sinon : bloc prix + ajout panier statiques (comportement
                  historique inchangé). */}
              {product.hasVariants &&
              product.variants &&
              product.variants.length > 0 ? (
                <>
                  <ProductVariantPanel
                    productSlug={product.slug}
                    productName={product.name}
                    productBrand={product.brand}
                    productImageSrc={product.imageSrc}
                    basePriceTTC={shownTTC}
                    variantOptions={product.variantOptions ?? []}
                    variants={product.variants}
                    accessories={product.accessories}
                    guarantee={guaranteeLine(product)}
                  />
                  <div className="mt-3 flex flex-col gap-3">
                    <Button asChild variant="primary" size="lg" className={`w-full ${YIELDS_TO_ACTION_BAR}`}>
                      <Link href={primary.href} rel="nofollow">
                        {primary.label}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link href="/prendre-rendez-vous#reserver">{ACTION_LABELS.booking}</Link>
                    </Button>
                  </div>
                  <GoogleRatingNote className="mt-4" />
                </>
              ) : (
                <>
              {/* Prix */}
              {product.priceTTC ? (
                <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6 mb-6">
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="text-xs text-mp-ink-soft block">
                        Prix du poêle seul, TVA comprise
                        {badge ? (
                          <Badge variant="primary" className="ml-2">
                            {badge}
                          </Badge>
                        ) : null}
                      </span>
                      <span
                        className="text-4xl font-semibold text-mp-green-deep"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {formatPrice(shownTTC ?? product.priceTTC)}
                        <span className="text-base font-medium text-mp-ink-soft ml-1">
                          TVAC
                        </span>
                        {struckTTC ? (
                          <span className="ml-3 text-xl font-normal text-mp-ink-soft line-through">
                            {formatPrice(struckTTC)}
                          </span>
                        ) : null}
                      </span>
                      <span className="block text-sm text-mp-ink-soft mt-1">
                        soit {formatPriceHT(shownTTC ?? product.priceTTC)} HTVA
                      </span>
                      <p className="mt-3 text-sm text-mp-green-deep">
                        <span className="font-semibold">
                          {formatPrice(reducedVatPrice(shownTTC ?? product.priceTTC))} TVAC
                        </span>{" "}
                        si nous le posons sur une habitation de plus de 10 ans
                        <span className="text-mp-ink-soft"> (TVA 6 % au lieu de 21 %)</span>.
                      </p>
                      {product.bonusPriceTTC ? (
                        <p className="mt-2 text-sm text-mp-ink-soft">
                          {typo(bonusLabelFor(product.brand))} déduit. {BONUS.conditions}
                        </p>
                      ) : null}
                      <p className="mt-2 text-sm text-mp-ink-soft">{typo(guaranteeLine(product))}</p>
                    </div>
                    <ul className="text-sm text-mp-ink-soft space-y-1 leading-relaxed">
                      <li>
                        <span className="font-semibold">Pose non incluse</span> : devis chiffré
                        sous 48 h.
                      </li>
                      <li>
                        <span className="font-semibold">Livraison gratuite</span> dans un rayon
                        de 20 km autour de Fernelmont. Au-delà : 50 € en Wallonie, 100 € à
                        Bruxelles, 100 € en Flandre.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6 mb-6">
                  <span className="text-xl font-semibold text-mp-green-deep">Sur devis</span>
                  <p className="text-sm text-mp-ink-soft mt-1">
                    Prix dépendant de la configuration de pose (tubage, ventouse, raccordement
                    hydro, etc.).
                  </p>
                  <p className="text-sm text-mp-ink-soft mt-2">{typo(guaranteeLine(product))}</p>
                </div>
              )}

              {product.accessories && product.accessories.length > 0 ? (
                <div className="mb-6">
                  <ProductAccessories
                    accessories={product.accessories}
                    basePriceTTC={product.priceTTC ? (shownTTC ?? product.priceTTC) : null}
                    missingBaseHint="Le poêle se chiffre sur devis."
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-3">
                <Button asChild variant="primary" size="lg" className={`w-full ${YIELDS_TO_ACTION_BAR}`}>
                  <Link href={primary.href} rel="nofollow">
                        {primary.label}
                      </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/prendre-rendez-vous#reserver">{ACTION_LABELS.booking}</Link>
                </Button>
              </div>

              <GoogleRatingNote className="mt-4" />

              {/*
                Le paiement en ligne a été retiré (04/09/2026). Un poêle ne se
                vend pas sans avoir vu le conduit : le parcours passe par le
                chiffrage, puis la visite qui confirme la pose, puis la facture
                d'acompte. Ne PAS réintroduire de bouton « acheter » ni de
                mention de paiement tant que ce n'est pas redevenu vrai.
              */}
              <p className="text-sm text-mp-ink-soft mt-4 text-center">
                Prix du matériel seul. La pose se chiffre après une visite sur
                place : c'est là qu'on valide le conduit, l'évacuation et
                l'accès. La TVA à 6 % (logement de plus de 10 ans) est calculée dans le devis.
              </p>
                </>
              )}
            </div>
          </div>
          </ProductColorProvider>

          {/* Points forts saisis dans Payload : grille 2 colonnes desktop */}
          {product.features && product.features.length > 0 && (
            <div className="mt-12 lg:mt-16">
              <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6 text-center">
                Points forts du modèle {product.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features.map((f, i) => (
                  <Card key={i} className="p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-mp-green-deep flex-shrink-0" />
                      <h3 className="text-base font-semibold text-mp-green-deep leading-tight">
                        {f.title}
                      </h3>
                    </div>
                    <p className="text-sm text-mp-ink-soft leading-relaxed">{f.description}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Caractéristiques : mêmes lignes que additionalProperty dans le JSON-LD */}
      {specs.length > 0 && (
        <section className="bg-mp-beige mp-band" id="caracteristiques">
          <div className="mp-shell">
            <div className="mp-measure">
              <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6 text-center">
                Caractéristiques techniques
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-mp-sand/40 bg-mp-cream">
                <table className="w-full text-left text-sm md:text-base">
                  <caption className="caption-bottom px-4 py-3 text-left text-xs text-mp-ink-soft">
                    Caractéristiques du modèle {product.name}, publiées par {product.brand}. Elles peuvent
                    évoluer : la fiche technique du fabricant fait foi.
                  </caption>
                  <tbody>
                    {specs.map((row) => (
                      <tr key={row.label} className="border-b border-mp-sand/40 last:border-b-0 even:bg-mp-beige/40">
                        <th scope="row" className="w-1/2 px-4 py-3 font-medium text-mp-ink-soft align-top">
                          {row.label}
                        </th>
                        <td className="px-4 py-3 text-mp-ink">{row.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pour aller plus loin : prix posé, catégorie, guide du type */}
              <ul className="mt-6 flex flex-col gap-x-6 sm:flex-row sm:flex-wrap sm:justify-center">
                <li>
                  <Link href={ROUTES.prices} className={MORE_LINK}>
                    Prix d&apos;un poêle à pellets posé
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
                <li>
                  <Link href={ROUTES.installation} className={MORE_LINK}>
                    Installation et pose
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={c.path} className={MORE_LINK}>
                      {c.label}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
                {guide && (
                  <li>
                    <Link href={guide.href} className={MORE_LINK}>
                      {guide.label}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Pourquoi ce modèle */}
      <section className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-10 mp-measure text-center">
            Pourquoi choisir le modèle {product.name}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 flex flex-col gap-3">
              <Award className="h-8 w-8 text-mp-orange-flame" />
              <h3 className="text-lg font-semibold text-mp-green-deep">
                Marque {product.brand}
              </h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                {brand?.tagline}. Distribuée par Mister Pellets en Wallonie.
              </p>
            </Card>

            <Card className="p-6 flex flex-col gap-3">
              <Flame className="h-8 w-8 text-mp-orange-flame" />
              <h3 className="text-lg font-semibold text-mp-green-deep">Adapté à votre surface</h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                {product.powers && product.powers.length > 1
                  ? `Disponible de ${formatKw(product.powers[0]!)} à ${formatKw(product.powers[product.powers.length - 1]!)} kW${
                      product.heatedVolumes && product.heatedVolumes.length > 1
                        ? `, pour chauffer de ${product.heatedVolumes[0]} à ${product.heatedVolumes[product.heatedVolumes.length - 1]} m³`
                        : ""
                    }. On choisit la puissance selon votre surface lors du devis gratuit Mister Pellets.`
                  : product.heatedVolume
                    ? `Une puissance de ${product.power} idéale pour chauffer ${product.heatedVolume}, en chauffage principal ou en complément.`
                    : `Une puissance de ${product.power}, à dimensionner sur mesure selon votre surface lors du devis gratuit Mister Pellets.`}
              </p>
            </Card>

            <Card className="p-6 flex flex-col gap-3">
              {product.type === "hydro" || product.type === "hybride-hydro" ? (
                <Droplet className="h-8 w-8 text-mp-orange-flame" />
              ) : product.type === "canalisable" ? (
                <Wind className="h-8 w-8 text-mp-orange-flame" />
              ) : (
                <Flame className="h-8 w-8 text-mp-orange-flame" />
              )}
              <h3 className="text-lg font-semibold text-mp-green-deep">{TYPE_TITLES[product.type]}</h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                {product.type === "hydro" &&
                  "Raccordé au circuit de chauffage central. Idéal pour remplacer une chaudière au mazout ou au gaz."}
                {product.type === "canalisable" &&
                  "Diffuse l'air chaud dans plusieurs pièces via un réseau de gaines isolées."}
                {product.type === "standard" &&
                  "Poêle classique qui chauffe la pièce d'installation, sans réseau de gaines ni circuit hydraulique."}
                {product.type === "hybride" &&
                  "Fonctionne aussi bien au pellet qu'au bois bûche. La polyvalence maximale."}
                {product.type === "hybride-hydro" &&
                  "Fonctionne au pellet comme au bois bûche et se raccorde au chauffage central, radiateurs ou plancher chauffant."}
                {product.type === "insert" &&
                  "S'encastre dans une cheminée existante pour valoriser un foyer ouvert."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Modèles voisins : même marque, puis autres marques */}
      {(sameBrand.length > 0 || otherBrands.length > 0) && (
        <section className="bg-mp-beige mp-band">
          <div className="mp-shell">
            {sameBrand.length > 0 && (
              <>
                <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-10 text-center">
                  Autres modèles de la marque {product.brand}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sameBrand.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </>
            )}
            {otherBrands.length > 0 && (
              <>
                <h2
                  className={`text-3xl md:text-4xl font-semibold text-mp-green-deep mb-10 text-center ${sameBrand.length > 0 ? "mt-16" : ""}`}
                >
                  Modèles comparables d&apos;autres marques
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherBrands.map((p) => (
                    <ProductCard key={p.slug} product={p} />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      <CTAFinal
        tone="cream"
        title={`Devis avec pose pour le modèle ${product.name}`}
        description="On chiffre le poêle et la pose en 48 heures. Sans engagement avant signature."
        primaryClassName={YIELDS_TO_ACTION_BAR}
        // Fiche sur devis : la demande de prix du modèle, pas une estimation
        // où il ne figure pas.
        primaryCta={primary.kind === "price-request" ? { label: primary.label, href: primary.href, rel: "nofollow" } : undefined}
      />

      {/* Barre d'action du téléphone (sous 1 024 px), dernier élément de la
          page : elle remplace la barre de navigation du bas et porte le seul
          aplat orange de l'écran (les boutons « Estimer mon projet »
          de la page passent au vert, YIELDS_TO_ACTION_BAR). */}
      <ProductActionBar
        name={product.name}
        price={
          product.priceTTC && shownTTC
            ? `${product.hasVariants && product.variants?.length ? "Dès " : ""}${formatPrice(shownTTC)} TVAC`
            : "Prix sur devis"
        }
        href={primary.href}
        action={primary.kind}
      />
    </>
  );
}
