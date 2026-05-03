import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, Calendar, MapPin } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRANDS, BRAND_LIST, brandFoundedLabel, type BrandData } from "@/lib/brands";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BRAND_LIST.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = BRANDS[slug as BrandData["slug"]];
  if (!brand) return { title: "Marque introuvable" };
  return {
    title: brand.metaTitle,
    description: brand.metaDescription,
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = BRANDS[slug as BrandData["slug"]];
  if (!brand) notFound();

  // Schema.org Brand mis à jour (cf. doc V1.2 §H7.10) avec sameAs pointant
  // vers le site officiel de la marque, et foundingDate uniquement si l'année
  // est officiellement connue.
  const brandSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `https://mister-pellets.be/nos-marques/${brand.slug}/#brand`,
    name: brand.name,
    description: brand.intro,
    countryOfOrigin: brand.country,
    sameAs: [brand.officialUrl],
  };
  if (brand.founded) {
    brandSchema.foundingDate = String(brand.founded);
  }

  const foundedDisplay = brandFoundedLabel(brand);

  return (
    <>
      <JsonLd data={brandSchema} />

      <HeroSecondary
        eyebrow={[brand.country, foundedDisplay].filter(Boolean).join(" · ")}
        title={
          <>
            <span className="block">{brand.name}</span>
            <span className="block text-mp-orange-flame mt-1">
              {brand.tagline}
            </span>
          </>
        }
        description={brand.intro}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Nos marques", href: "/nos-marques" },
          { label: brand.name },
        ]}
      />

      {/* Stats badges */}
      <section className="bg-mp-cream pb-8 -mt-4">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary"><Award className="h-3.5 w-3.5" /> {brand.positioning}</Badge>
            <Badge variant="default"><MapPin className="h-3.5 w-3.5" /> {brand.country}</Badge>
            {foundedDisplay && (
              <Badge variant="default"><Calendar className="h-3.5 w-3.5" /> {foundedDisplay}</Badge>
            )}
            {brand.tags.slice(2).map((tag) => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="bg-mp-cream py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
            L'histoire de {brand.name}
          </h2>
          <div className="space-y-4 text-lg text-mp-ink leading-relaxed">
            {brand.history.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Spécialités techniques */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-12 max-w-3xl">
            Spécialités techniques
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brand.specialties.map((spec, i) => (
              <Card key={i} className="p-5 flex items-start gap-3">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-mp-orange-light text-mp-orange-flame font-bold text-sm shrink-0">
                  {i + 1}
                </span>
                <p className="text-mp-ink leading-relaxed pt-1">{spec}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Modèles phares */}
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
              Modèles phares de {brand.name}
            </h2>
            <p className="text-lg text-mp-ink-soft leading-relaxed">
              Une sélection des modèles qu'on installe le plus souvent en Wallonie. Le catalogue
              complet sera disponible dès l'ouverture de la boutique.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brand.modelHighlights.map((model) => (
              <Card key={model.name} className="p-6 flex flex-col">
                <Badge variant="primary" className="self-start mb-3">{model.power}</Badge>
                <h3
                  className="text-2xl font-semibold text-mp-green-deep mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {brand.name} {model.name}
                </h3>
                <p className="text-mp-ink-soft leading-relaxed flex-1">{model.usp}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href={`/boutique?marque=${brand.slug}`}>
                Voir tous les modèles {brand.name}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Garantie */}
      <section className="bg-mp-green-deep text-white py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-semibold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Garantie sur les {brand.name}
          </h2>
          <p className="text-mp-cream/90 text-lg leading-relaxed">
            {brand.warranty}
          </p>
        </div>
      </section>

      <CTAFinal
        title={`Devis sur un modèle ${brand.name} ?`}
        description="Donne-nous quelques infos sur ta maison, on chiffre la pose en 48h avec primes incluses."
      />
    </>
  );
}
