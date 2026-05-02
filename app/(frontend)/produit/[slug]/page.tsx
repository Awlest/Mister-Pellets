import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Flame, Award, Wifi, Wind, Droplet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product/ProductCard";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { Breadcrumb } from "@/components/seo/Breadcrumb";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import { PRODUCTS_DEMO, getProductBySlug } from "@/lib/products-demo";
import { BRANDS } from "@/lib/brands";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PRODUCTS_DEMO.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produit introuvable" };
  return {
    title: `${product.name}, Poêle à pellets ${product.power}`,
    description: `${product.name} : ${product.power} pour ${product.surface}. Prix indicatif ${product.priceTTC ? formatPrice(product.priceTTC) : "sur devis"}. Pose Mister Pellets, primes incluses.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const brandSlug = product.brand.toLowerCase() as keyof typeof BRANDS;
  const brand = BRANDS[brandSlug];

  // Modèles similaires (même marque, autres modèles)
  const related = PRODUCTS_DEMO
    .filter((p) => p.brand === product.brand && p.slug !== product.slug)
    .slice(0, 3);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: `${product.name} : poêle à pellets ${product.type} ${product.power} pour ${product.surface}.`,
    brand: { "@type": "Brand", name: product.brand },
    offers: product.priceTTC
      ? {
          "@type": "Offer",
          url: `https://mister-pellets.be/produit/${product.slug}`,
          priceCurrency: "EUR",
          price: product.priceTTC,
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        }
      : undefined,
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Galerie placeholder */}
            <div>
              <div className="aspect-square rounded-3xl bg-mp-beige-warm border border-mp-sand/40 overflow-hidden flex items-center justify-center">
                <div className="text-center p-10">
                  <Flame className="h-16 w-16 mx-auto text-mp-orange-flame mb-4" />
                  <p className="text-mp-ink-soft text-sm">
                    Photos produit disponibles en Phase 5
                    <br />
                    (import depuis Wix + upload Payload)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-mp-beige border border-mp-sand/40"
                  />
                ))}
              </div>
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

              <p className="text-lg text-mp-ink-soft mb-6 leading-relaxed">
                {brand?.tagline}. {product.power} pour {product.surface}. Pose Mister Pellets en 1
                jour, primes Wallonie incluses, garantie 5 ans.
              </p>

              {/* Tags techniques */}
              <div className="flex flex-wrap gap-2 mb-8">
                <Badge variant="default"><Flame className="h-3.5 w-3.5" /> {product.power}</Badge>
                <Badge variant="default">{product.surface}</Badge>
                <Badge variant="default" className="capitalize">{product.type}</Badge>
                {product.isAirtight && <Badge variant="default"><Wind className="h-3.5 w-3.5" /> Étanche</Badge>}
                {product.isConnected && <Badge variant="default"><Wifi className="h-3.5 w-3.5" /> WiFi</Badge>}
              </div>

              {/* Prix */}
              {product.priceTTC ? (
                <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6 mb-6">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-xs text-mp-ink-soft block">Prix TTC indicatif (poêle seul)</span>
                      <span
                        className="text-4xl font-semibold text-mp-green-deep"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {formatPrice(product.priceTTC)}
                      </span>
                    </div>
                    <span className="text-xs text-mp-ink-soft text-right max-w-[180px]">
                      Pose en sus, primes Wallonie déduites du devis final
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-mp-beige border border-mp-sand/40 p-6 mb-6">
                  <span className="text-xl font-semibold text-mp-green-deep">Sur devis</span>
                  <p className="text-sm text-mp-ink-soft mt-1">
                    Prix dépendant de la configuration de pose (tubage, ventouse, etc.)
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {product.priceTTC ? (
                  <AddToCartButton
                    productId={product.slug}
                    productName={product.name}
                    productBrand={product.brand}
                    productPriceTTC={product.priceTTC}
                    className="w-full"
                  />
                ) : null}
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/demande-de-devis">Demander un devis avec pose</Link>
                </Button>
              </div>

              <p className="text-xs text-mp-ink-soft mt-4 text-center">
                🚧 Phase 5, le panier et le paiement Stripe arrivent prochainement. Pour commander aujourd'hui, passe par le formulaire de devis.
              </p>
            </div>
          </div>
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
              <h3 className="text-lg font-semibold text-mp-green-deep">Marque {product.brand}</h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">{brand?.tagline}. Distribué officiellement par Mister Pellets en Wallonie.</p>
            </Card>

            <Card className="p-6 flex flex-col gap-3">
              <Flame className="h-8 w-8 text-mp-orange-flame" />
              <h3 className="text-lg font-semibold text-mp-green-deep">Adapté à ta surface</h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">{product.power} sont taillés pour chauffer {product.surface}, en mode principal ou en complément.</p>
            </Card>

            <Card className="p-6 flex flex-col gap-3">
              {product.type === "hydro" ? <Droplet className="h-8 w-8 text-mp-orange-flame" /> : product.type === "canalisable" ? <Wind className="h-8 w-8 text-mp-orange-flame" /> : <Flame className="h-8 w-8 text-mp-orange-flame" />}
              <h3 className="text-lg font-semibold text-mp-green-deep">Type {product.type}</h3>
              <p className="text-sm text-mp-ink-soft leading-relaxed">
                {product.type === "hydro" && "Chauffe un circuit d'eau, idéal pour remplacer une chaudière mazout."}
                {product.type === "canalisable" && "Diffuse l'air chaud dans plusieurs pièces via un réseau de gaines."}
                {product.type === "air" && "Diffusion d'air chaud par convection, simple à installer."}
                {product.type === "insert" && "S'encastre dans une cheminée existante."}
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
              Autres modèles {product.brand}
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
        description="On chiffre le poêle + la pose + les primes en 48h. Pas d'engagement avant signature."
      />
    </>
  );
}
