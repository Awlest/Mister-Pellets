import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { JsonLd } from "@/components/seo/JsonLd";
import { BRANDS, TOP_TIER_BRANDS, type BrandData } from "@/lib/brands";
import { PROVINCES, getProvince } from "@/lib/local-seo";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ brand: string; province: string }>;
}

/** 3 marques top-tier × 5 provinces = 15 pages locales (brief §E.2). */
export function generateStaticParams() {
  return TOP_TIER_BRANDS.flatMap((b) =>
    PROVINCES.map((p) => ({ brand: b.slug, province: p.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand: brandSlug, province: provinceSlug } = await params;
  const brand = BRANDS[brandSlug as BrandData["slug"]];
  const province = getProvince(provinceSlug);
  if (!brand || !province) return { title: "Page introuvable", robots: { index: false } };
  return buildPageMetadata({
    // pas de suffixe " | Mister Pellets" ici : le template du layout racine l'ajoute déjà
    title: `Installation poêle ${brand.name} en ${province.name}`,
    description: `Pose de poêle à pellets ${brand.name} dans ${province.longName} par Mister Pellets : devis sous 48 h, prime Habitation Wallonie 2026 incluse, équipes basées à Fernelmont. ${province.cities.slice(0, 4).join(", ")} et environs.`,
    path: `/installation/${brandSlug}/${provinceSlug}`,
  });
}

export default async function InstallationLocalePage({ params }: Props) {
  const { brand: brandSlug, province: provinceSlug } = await params;
  const brand = BRANDS[brandSlug as BrandData["slug"]];
  const province = getProvince(provinceSlug);

  // Pages locales réservées aux marques top-tier (brief §E.2).
  if (!brand || brand.tier !== 1 || !province) notFound();

  const models = (brand.modelsTable ?? []).slice(0, 3);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: `Installation de poêle à pellets ${brand.name}`,
    provider: {
      "@type": "LocalBusiness",
      name: "Mister Pellets",
      areaServed: province.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fernelmont",
        addressRegion: "Namur",
        addressCountry: "BE",
      },
    },
    areaServed: {
      "@type": "AdministrativeArea",
      name: province.longName,
    },
    brand: { "@type": "Brand", name: brand.name },
  };

  return (
    <>
      <JsonLd data={serviceSchema} />

      <HeroSecondary
        eyebrow={`Installation en ${province.name}`}
        title={
          <>
            <span className="block">Poêle {brand.name}</span>
            <span className="block text-mp-orange-flame mt-1">
              posé dans {province.longName}
            </span>
          </>
        }
        description={`${brand.tagline}. On le livre, on le pose et on le règle dans ${province.longName}, avec la prime Habitation Wallonie 2026 déduite du devis.`}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Nos marques", href: "/nos-marques" },
          { label: brand.name, href: `/nos-marques/${brand.slug}` },
          { label: `Installation en ${province.name}` },
        ]}
      />

      {/* Pourquoi cette marque dans cette province */}
      <section className="bg-mp-cream py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-6">
            Un {brand.name} dans {province.longName}
          </h2>
          <div className="space-y-4 text-lg text-mp-ink leading-relaxed">
            <p>{province.localAngle}</p>
            <p>{brand.whyWeLove?.[0] ?? brand.intro}</p>
          </div>
        </div>
      </section>

      {/* Zone d'intervention : villes */}
      <section className="bg-mp-beige py-16 md:py-20">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-4">
            On vous installe votre {brand.name} partout en {province.name}
          </h2>
          <p className="text-lg text-mp-ink-soft leading-relaxed mb-8 max-w-3xl">
            {province.delivery}
          </p>
          <div className="flex flex-wrap gap-3">
            {province.cities.map((city) => (
              <Badge key={city} variant="default">
                <MapPin className="h-3.5 w-3.5" /> {city}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Modèles de la marque */}
      {models.length > 0 && (
        <section className="bg-mp-cream py-16 md:py-24">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-10">
              Modèles {brand.name} qu&apos;on pose le plus en {province.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {models.map((model) => (
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
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button asChild variant="primary" size="lg">
                <Link href="/demande-de-devis">Demander un devis</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/nos-marques/${brand.slug}`}>
                  Tout savoir sur {brand.name}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Ce qu'on fait sur place */}
      <section className="bg-mp-beige py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-mp-green-deep mb-8">
            Notre service en {province.name}
          </h2>
          <ul className="space-y-3 text-lg text-mp-ink leading-relaxed">
            {[
              "Visite technique pour valider le conduit, le tubage et l'emplacement.",
              "Devis chiffré sous 48 h, prime Habitation Wallonie 2026 déduite.",
              "Pose réalisée en une journée par nos équipes basées à Fernelmont.",
              "Service après-vente assuré localement, pièces courantes en stock.",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="h-5 w-5 text-mp-green-deep shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CTAFinal
        title={`Devis pour un ${brand.name} en ${province.name}`}
        description="Donnez-nous quelques infos sur votre maison, on chiffre la pose en 48h avec primes incluses."
      />
    </>
  );
}
