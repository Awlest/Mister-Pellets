import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Flame, Award, Wifi, Wind, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGallery } from "@/components/product/ProductGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductVariantPanel } from "@/components/product/ProductVariantPanel";
import { ColorVariantAddToCart } from "@/components/product/ColorVariantAddToCart";
import { ProductColorProvider } from "@/components/product/ProductColorContext";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getAllProducts,
  getAllProductSlugs,
  getProductBySlug,
} from "@/lib/products";
import { BRANDS } from "@/lib/brands";
import { formatPrice, formatPriceHT } from "@/lib/utils";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * ISR : régénération max toutes les 60s pour que les modifications admin
 * Payload remontent rapidement même sans hook revalidatePath manuel.
 * Combiné au hook afterChange dans collections/Products.ts qui force la
 * revalidation instantanée à chaque save.
 */
export const revalidate = 60;

export async function generateStaticParams() {
  // Phase 5 : query Payload au build pour générer les routes statiques.
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable", robots: { index: false } };
  return buildPageMetadata({
    title: `${product.name}, Poêle à pellets ${product.power}`,
    description: `${product.name} : ${product.power} pour ${product.heatedVolume}. Prix indicatif ${product.priceTTC ? `${formatPriceHT(product.priceTTC)} HTVA` : "sur devis"}. Pose Mister Pellets, primes incluses.`,
    path: `/produit/${product.slug}`,
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const brandSlug = product.brand.toLowerCase() as keyof typeof BRANDS;
  const brand = BRANDS[brandSlug];

  // Modèles similaires (même marque, autres modèles)
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter((p) => p.brand === product.brand && p.slug !== product.slug)
    .slice(0, 3);

  // Schema.org Product : si le produit a des déclinaisons de couleur avec
  // GTIN, on émet un AggregateOffer + un Offer par variante (chacune avec
  // son propre GTIN, son nom et son URL #couleur). Sinon, un seul Offer.
  const productPageUrl = `https://mister-pellets.be/produit/${product.slug}`;
  const variantsWithGtin = (product.colorVariants ?? []).filter((v) => Boolean(v.gtin));
  const genericVariants = product.hasVariants ? (product.variants ?? []) : [];

  let offers: object | undefined;
  if (genericVariants.length > 0) {
    // Mode variantes : un AggregateOffer + un Offer par combinaison réelle.
    const variantPrices = genericVariants
      .map((v) => (v.salePrice && v.salePrice > 0 ? v.salePrice : v.price))
      .filter((n) => n > 0);
    offers = {
      "@type": "AggregateOffer",
      priceCurrency: "EUR",
      lowPrice: variantPrices.length > 0 ? Math.min(...variantPrices) : undefined,
      highPrice: variantPrices.length > 0 ? Math.max(...variantPrices) : undefined,
      offerCount: genericVariants.length,
      offers: genericVariants.map((v) => ({
        "@type": "Offer",
        ...(v.sku ? { sku: v.sku } : {}),
        ...(v.gtin ? { gtin13: v.gtin } : {}),
        ...(v.mpn ? { mpn: v.mpn } : {}),
        url: productPageUrl,
        priceCurrency: "EUR",
        price: v.salePrice && v.salePrice > 0 ? v.salePrice : v.price,
        availability:
          v.stockStatus === "out_of_stock"
            ? "https://schema.org/OutOfStock"
            : "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      })),
    };
  } else if (product.priceTTC) {
    if (variantsWithGtin.length > 0) {
      offers = {
        "@type": "AggregateOffer",
        priceCurrency: "EUR",
        price: product.priceTTC,
        offerCount: variantsWithGtin.length,
        offers: variantsWithGtin.map((v) => ({
          "@type": "Offer",
          name: `${product.name}, ${v.colorName}`,
          gtin13: v.gtin,
          url: `${productPageUrl}#${encodeURIComponent(v.colorName.toLowerCase())}`,
          priceCurrency: "EUR",
          price: product.priceTTC,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        })),
      };
    } else {
      offers = {
        "@type": "Offer",
        url: productPageUrl,
        priceCurrency: "EUR",
        price: product.priceTTC,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      };
    }
  }

  // Images absolues : recommande pour Schema.org Product.image et PREREQUIS
  // Google Merchant (image_link). Les URLs produits sont stockees en relatif
  // (same-origin pour Next/Image), on les repasse en absolu ici.
  const schemaImages = [
    product.imageSrc,
    ...(product.galleryImages ?? []).map((g) => g.url),
  ]
    .filter((u): u is string => Boolean(u))
    .map((u) => (u.startsWith("http") ? u : `https://mister-pellets.be${u}`));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    ...(schemaImages.length > 0 ? { image: schemaImages } : {}),
    description: product.shortDescription
      ? product.shortDescription
      : product.heatedVolume
        ? `${product.name} : poêle à pellets ${product.type} de ${product.power} pour chauffer ${product.heatedVolume}.`
        : `${product.name} : poêle à pellets ${product.type} de ${product.power}.`,
    brand: { "@type": "Brand", name: product.brand },
    offers,
  };

  return (
    <>
      <JsonLd data={productSchema} />

      {/* Breadcrumb + content */}
      <section className="bg-mp-cream pt-8 pb-12 md:pb-16 border-b border-mp-sand/30">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <Breadcrumb
            items={[
              { label: "Accueil", href: "/" },
              { label: "Boutique", href: "/boutique" },
              { label: product.brand, href: `/boutique?marque=${product.brand}` },
              { label: product.name },
            ]}
            className="mb-8"
          />

          {/* Provider couleur : partage la variante sélectionnée entre la
              galerie (gauche) et le bloc d'achat (droite). */}
          <ProductColorProvider>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Galerie interactive : clic vignette = image principale change,
                clic image principale = lightbox plein écran. Composant client. */}
            <div>
              <ProductGallery
                productName={product.name}
                mainImage={
                  product.imageSrc
                    ? { url: product.imageSrc, alt: product.imageAlt ?? product.name }
                    : undefined
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
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-mp-orange-flame hover:text-mp-green-deep transition-colors underline-offset-4 hover:underline"
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
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link
                  href={`/nos-marques/${brandSlug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-mp-orange-flame hover:underline"
                >
                  {product.brand}
                </Link>
                {product.isBestseller && <Badge variant="primary">Best-seller</Badge>}
                {product.isNew && <Badge variant="success">Nouveau</Badge>}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-mp-green-deep mb-4 leading-tight">
                {product.name}
              </h1>

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
                  Mister Pellets en une journée, primes Wallonie 2026 déduites du devis et
                  garantie 5 ans.
                </p>
              ) : (
                <p className="text-lg text-mp-ink-soft mb-6 leading-relaxed">
                  {brand?.tagline}. Pose par Mister Pellets en une journée, primes Wallonie 2026
                  déduites du devis et garantie 5 ans.
                </p>
              )}

              {/* Tags techniques : chaque badge n'apparaît que si la donnée existe */}
              <div className="flex flex-wrap gap-2 mb-8">
                {product.power && (
                  <Badge variant="default">
                    <Flame className="h-3.5 w-3.5" /> {product.power}
                  </Badge>
                )}
                {product.heatedVolume && <Badge variant="default">{product.heatedVolume}</Badge>}
                {product.type && (
                  <Badge variant="default" className="capitalize">
                    {product.type}
                  </Badge>
                )}
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
                    basePriceTTC={product.priceTTC}
                    variantOptions={product.variantOptions ?? []}
                    variants={product.variants}
                  />
                  <div className="mt-3">
                    <Button asChild variant="outline" size="lg" className="w-full">
                      <Link href="/demande-de-devis">Demander un devis avec pose</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
              {/* Prix */}
              {product.priceTTC ? (
                <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6 mb-6">
                  <div className="flex flex-col gap-3">
                    <div>
                      <span className="text-xs text-mp-ink-soft block">
                        Prix HTVA indicatif (poêle seul)
                      </span>
                      <span
                        className="text-4xl font-semibold text-mp-green-deep"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {formatPriceHT(product.priceTTC)}
                        <span className="text-base font-medium text-mp-ink-soft ml-1">
                          HTVA
                        </span>
                      </span>
                      <span className="block text-sm text-mp-ink-soft mt-1">
                        soit {formatPrice(product.priceTTC)} TVAC (21 %)
                      </span>
                    </div>
                    <ul className="text-xs text-mp-ink-soft space-y-1 leading-relaxed">
                      <li>
                        <span className="font-semibold">Pose non incluse</span> : devis chiffré
                        sous 48 h.
                      </li>
                      <li>
                        <span className="font-semibold">Livraison gratuite</span> dans un rayon
                        de 50 km autour de Fernelmont. Au-delà, forfait unique de 50 € pour le
                        reste de la Belgique.
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
                </div>
              )}

              <div className="flex flex-col gap-3">
                {product.priceTTC ? (
                  product.colorVariants && product.colorVariants.length > 0 ? (
                    // Produit à déclinaisons de couleur : bouton conscient de
                    // la couleur sélectionnée dans la galerie (via le contexte).
                    <ColorVariantAddToCart
                      productSlug={product.slug}
                      productName={product.name}
                      productBrand={product.brand}
                      productPriceTTC={product.priceTTC}
                      productImageSrc={product.imageSrc}
                      colorVariants={product.colorVariants}
                    />
                  ) : (
                    <AddToCartButton
                      productId={product.slug}
                      productName={product.name}
                      productBrand={product.brand}
                      productPriceTTC={product.priceTTC}
                      className="w-full"
                    />
                  )
                ) : null}
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/demande-de-devis">Demander un devis avec pose</Link>
                </Button>
              </div>

              <p className="text-xs text-mp-ink-soft mt-4 text-center">
                Pour commander, utilise le formulaire de devis. Le paiement en
                ligne (Mollie / Bancontact) arrive prochainement.
              </p>
                </>
              )}
            </div>
          </div>
          </ProductColorProvider>

          {/* Points forts saisis dans Payload : grille 2 colonnes desktop */}
          {product.features && product.features.length > 0 && (
            <div className="mt-12 lg:mt-16">
              <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6">
                Les points forts du {product.name}
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

      {/* Pourquoi ce modèle */}
      <section className="bg-mp-beige py-16 md:py-20">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-10 max-w-3xl">
            Pourquoi choisir le {product.name}
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
                {product.heatedVolume
                  ? `Une puissance de ${product.power} idéale pour chauffer ${product.heatedVolume}, en chauffage principal ou en complément.`
                  : `Une puissance de ${product.power}, à dimensionner sur mesure selon votre surface lors du devis gratuit Mister Pellets.`}
              </p>
            </Card>

            <Card className="p-6 flex flex-col gap-3">
              {product.type === "hydro" ? (
                <Droplet className="h-8 w-8 text-mp-orange-flame" />
              ) : product.type === "canalisable" ? (
                <Wind className="h-8 w-8 text-mp-orange-flame" />
              ) : (
                <Flame className="h-8 w-8 text-mp-orange-flame" />
              )}
              <h3 className="text-lg font-semibold text-mp-green-deep capitalize">
                Modèle {product.type}
              </h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                {product.type === "hydro" &&
                  "Raccordé au circuit de chauffage central. Idéal pour remplacer une chaudière au mazout ou au gaz."}
                {product.type === "canalisable" &&
                  "Diffuse l'air chaud dans plusieurs pièces via un réseau de gaines isolées."}
                {product.type === "standard" &&
                  "Poêle classique qui chauffe la pièce d'installation, sans réseau de gaines ni circuit hydraulique."}
                {product.type === "hybride" &&
                  "Fonctionne aussi bien au pellet qu'au bois bûche. La polyvalence maximale."}
                {product.type === "insert" &&
                  "S'encastre dans une cheminée existante pour valoriser un foyer ouvert."}
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Modèles similaires */}
      {related.length > 0 && (
        <section className="bg-mp-cream py-16 md:py-20">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-10">
              Autres modèles de la marque {product.brand}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CTAFinal
        title={`Devis avec pose pour le ${product.name}`}
        description="On chiffre le poêle, la pose et les primes en 48 heures. Sans engagement avant signature."
      />
    </>
  );
}
