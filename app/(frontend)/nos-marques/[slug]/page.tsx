import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Award, Calendar, MapPin } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  BRANDS,
  BRAND_LIST,
  TOP_TIER_BRANDS,
  brandFoundedLabel,
  type BrandData,
} from "@/lib/brands";

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
    // absolute : brand.metaTitle contient déjà " | Mister Pellets", on évite le double suffixe du template
    title: { absolute: brand.metaTitle },
    description: brand.metaDescription,
    alternates: { canonical: `https://mister-pellets.be/nos-marques/${slug}` },
  };
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = BRANDS[slug as BrandData["slug"]];
  if (!brand) notFound();

  // Schema.org Brand : sameAs vers le site officiel, foundingDate si connue.
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

  // Schema.org FAQPage si la marque a une FAQ.
  const faqSchema = brand.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: brand.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;

  const foundedDisplay = brandFoundedLabel(brand);

  // Maillage : autres marques top tier (uniquement pour les marques top tier).
  const otherTopTier =
    brand.tier === 1 ? TOP_TIER_BRANDS.filter((b) => b.slug !== brand.slug) : [];

  return (
    <>
      <JsonLd data={brandSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <HeroSecondary
        eyebrow={
          brand.badge ?? [brand.country, foundedDisplay].filter(Boolean).join(" · ")
        }
        title={
          <>
            <span className="block">{brand.name}</span>
            <span className="block text-mp-orange-flame mt-1">{brand.tagline}</span>
          </>
        }
        description={brand.heroSubtitle ?? brand.intro}
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
            <Badge variant="secondary">
              <Award className="h-3.5 w-3.5" /> {brand.positioning}
            </Badge>
            <Badge variant="default">
              <MapPin className="h-3.5 w-3.5" /> {brand.country}
            </Badge>
            {foundedDisplay && (
              <Badge variant="default">
                <Calendar className="h-3.5 w-3.5" /> {foundedDisplay}
              </Badge>
            )}
            {brand.tags.slice(2).map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi on aime travailler avec X (tier 1) — sinon Histoire (tier 2) */}
      {brand.whyWeLove ? (
        <section className="bg-mp-cream py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
              Pourquoi on aime travailler avec {brand.name}
            </h2>
            <div className="space-y-4 text-lg text-mp-ink leading-relaxed">
              {brand.whyWeLove.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : brand.history ? (
        <section className="bg-mp-cream py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-8">
              L&apos;histoire de {brand.name}
            </h2>
            <div className="space-y-4 text-lg text-mp-ink leading-relaxed">
              {brand.history.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* X en quelques repères — timeline */}
      {brand.milestones && brand.milestones.length > 0 && (
        <section className="bg-mp-beige py-16 md:py-24">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-12">
              {brand.name} en quelques repères
            </h2>
            <ol className="relative border-l-2 border-mp-sand space-y-8 pl-8">
              {brand.milestones.map((m, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[2.6rem] flex h-6 w-6 items-center justify-center rounded-full bg-mp-orange-flame ring-4 ring-mp-beige" />
                  <span
                    className="block text-lg font-semibold text-mp-green-deep"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {m.marker}
                  </span>
                  <p className="text-mp-ink leading-relaxed mt-1">{m.label}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Ce qui distingue X (tier 1) — sinon Spécialités techniques (tier 2) */}
      {brand.distinctions && brand.distinctions.length > 0 ? (
        <section className="bg-mp-cream py-16 md:py-24">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-12 max-w-3xl">
              Ce qui distingue {brand.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {brand.distinctions.map((d, i) => (
                <Card key={i} className="p-6 flex flex-col gap-3">
                  {d.emoji && (
                    <span className="text-2xl" aria-hidden="true">
                      {d.emoji}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-mp-green-deep leading-tight">
                    {d.title}
                  </h3>
                  <p className="text-mp-ink-soft leading-relaxed">{d.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : brand.specialties && brand.specialties.length > 0 ? (
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
      ) : null}

      {/* Modèles disponibles */}
      {brand.modelsTable && brand.modelsTable.length > 0 ? (
        <section className="bg-mp-beige py-16 md:py-24">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <div className="max-w-3xl mb-12">
              <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
                Modèles {brand.name} disponibles
              </h2>
              <p className="text-lg text-mp-ink-soft leading-relaxed">
                Une sélection des modèles qu&apos;on installe le plus souvent en
                Wallonie. On dimensionne le bon modèle ensemble lors du devis.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brand.modelsTable.map((model) => (
                <Card key={model.name} className="p-6 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="primary">{model.power}</Badge>
                    {model.type && <Badge variant="outline">{model.type}</Badge>}
                  </div>
                  <h3
                    className="text-xl font-semibold text-mp-green-deep mt-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {brand.name} {model.name}
                  </h3>
                  <p className="text-mp-ink-soft leading-relaxed flex-1">
                    {model.forWhom}
                  </p>
                </Card>
              ))}
            </div>
            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline" size="lg">
                <Link href={`/boutique?marque=${brand.name}`}>
                  Voir tous les modèles {brand.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : brand.modelHighlights && brand.modelHighlights.length > 0 ? (
        <section className="bg-mp-cream py-16 md:py-24">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <div className="max-w-3xl mb-12">
              <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
                Modèles phares de {brand.name}
              </h2>
              <p className="text-lg text-mp-ink-soft leading-relaxed">
                Une sélection des modèles qu&apos;on installe le plus souvent en
                Wallonie.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {brand.modelHighlights.map((model) => (
                <Card key={model.name} className="p-6 flex flex-col">
                  <Badge variant="primary" className="self-start mb-3">
                    {model.power}
                  </Badge>
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
                <Link href={`/boutique?marque=${brand.name}`}>
                  Voir tous les modèles {brand.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {brand.faq && brand.faq.length > 0 && (
        <FAQAccordion title="Ce qu'on nous demande souvent" items={brand.faq} />
      )}

      {/* Garantie */}
      <section className="bg-mp-green-deep text-white py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-semibold mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Garantie sur les {brand.name}
          </h2>
          <p className="text-mp-cream/90 text-lg leading-relaxed">{brand.warranty}</p>
        </div>
      </section>

      {/* Maillage : autres marques premium */}
      {otherTopTier.length > 0 && (
        <section className="bg-mp-beige py-16 md:py-20">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-8">
              Autres marques premium
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherTopTier.map((b) => (
                <Link key={b.slug} href={`/nos-marques/${b.slug}`} className="group">
                  <Card className="p-6 flex flex-col gap-2 h-full transition-colors group-hover:border-mp-green-deep">
                    <h3
                      className="text-2xl font-semibold text-mp-green-deep"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {b.name}
                    </h3>
                    <p className="text-sm font-medium text-mp-orange-flame">
                      {b.tagline}
                    </p>
                    <p className="text-mp-ink-soft leading-relaxed flex-1">
                      {b.positioning}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-mp-green-deep mt-2">
                      Découvrir {b.name}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTAFinal
        title={`Devis sur un modèle ${brand.name} ?`}
        description="Donne-nous quelques infos sur ta maison, on chiffre la pose en 48h avec primes incluses."
      />
    </>
  );
}
