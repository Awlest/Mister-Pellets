import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Truck, Star, Clock } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { PrimesBlock } from "@/components/sections/PrimesBlock";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { ProductCard } from "@/components/product/ProductCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { CITIES, getCityBySlug } from "@/lib/cities";
import { getAllProducts } from "@/lib/products";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  // Pattern : /poeles-pellets-[ville]/, Next.js capture le segment après le préfixe.
  params: Promise<{ ville: string }>;
}

export async function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const city = getCityBySlug(ville);
  if (!city) return { title: "Ville introuvable", robots: { index: false } };
  return buildPageMetadata({
    title: city.metaTitle,
    description: city.metaDescription,
    // URL externe avec tiret (rewrite next.config : /poeles-pellets-{ville} -> /poeles-pellets/{ville})
    path: `/poeles-pellets-${ville}`,
  });
}

export default async function CityPage({ params }: Props) {
  const { ville } = await params;
  const city = getCityBySlug(ville);
  if (!city) notFound();

  const free = city.distanceFromFernelmont <= 50;

  // Produits recommandés pour cette ville (Phase 5 : query Payload)
  const allProducts = await getAllProducts();
  const products = allProducts.filter((p) => city.recommendedModels.includes(p.slug));

  // Schema LocalBusiness ciblé sur la ville
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Installation de poêle à pellets",
    name: `Installation de poêle à pellets à ${city.name}`,
    description: city.metaDescription,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      "@id": "https://mister-pellets.be/#business",
      name: "Mister Pellets",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rue des Fagotis 3A",
        postalCode: "5380",
        addressLocality: "Fernelmont",
        addressCountry: "BE",
      },
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: { "@type": "AdministrativeArea", name: city.province },
    },
  };

  return (
    <>
      <JsonLd data={localBusinessSchema} />

      <HeroSecondary
        eyebrow={`Province de ${city.province} · ${city.distanceFromFernelmont} km de Fernelmont`}
        title={
          <>
            Poêle à pellets à <span className="mp-italic">{city.name}</span>
          </>
        }
        description={city.intro}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Zones d'intervention", href: "/zones-d-intervention" },
          { label: city.name },
        ]}
      />

      {/* Stats locales */}
      <section className="bg-mp-cream pb-8 -mt-4">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">
              <MapPin className="h-3.5 w-3.5" /> {city.distanceFromFernelmont} km de Fernelmont
            </Badge>
            {free && (
              <Badge variant="success">
                <Truck className="h-3.5 w-3.5" /> Livraison gratuite
              </Badge>
            )}
            <Badge variant="default">
              <Clock className="h-3.5 w-3.5" /> Pose 2-3 semaines
            </Badge>
            <Badge variant="default">CP : {city.postalCodes.join(", ")}</Badge>
          </div>
        </div>
      </section>

      {/* Contexte local */}
      <section className="bg-mp-cream py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-6">
            Ce qu'on installe à {city.name}
          </h2>
          <p className="text-lg text-mp-ink leading-relaxed">{city.context}</p>
        </div>
      </section>

      {/* Témoignage local */}
      {city.testimonial && (
        <section className="bg-mp-beige py-16 md:py-20">
          <div className="container mx-auto max-w-3xl px-4 md:px-6">
            <Card className="p-8 md:p-12">
              <div className="flex gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-5 w-5 text-mp-orange-warm fill-mp-orange-warm" />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl text-mp-ink leading-relaxed italic mb-4">
                « {city.testimonial.quote} »
              </blockquote>
              <div className="text-sm font-semibold text-mp-green-deep">
                {city.testimonial.name}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Modèles recommandés */}
      {products.length > 0 && (
        <section className="bg-mp-cream py-16 md:py-20">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <div className="max-w-3xl mb-10">
              <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
                Nos modèles recommandés à {city.name}
              </h2>
              <p className="text-lg text-mp-ink-soft leading-relaxed">
                Sélection éditoriale en fonction de l'habitat typique de la zone. Catalogue complet
                sur la <Link href="/boutique" className="text-mp-orange-flame underline hover:no-underline">boutique</Link>.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      <ProcessSteps
        title={`Comment on installe à ${city.name}`}
        steps={[
          {
            title: "Diagnostic gratuit",
            description: `Visite à domicile à ${city.name} ou visio si vous préférez. On regarde la pièce, le conduit, l'isolation. Aucune obligation.`,
          },
          {
            title: "Devis avec primes",
            description: "Chiffrage transparent sous 48h, primes Wallonie déjà déduites. Vous voyez exactement combien vous payez net.",
          },
          {
            title: "Pose en 1 journée",
            description: `Équipe Mister Pellets qui se déplace à ${city.name}. On laisse l'endroit propre, le poêle réglé, prêt à l'emploi.`,
          },
          {
            title: "Mise en route + SAV",
            description: "Premier feu avec vous, formation à l'usage, garantie 5 ans pièces et main d'œuvre, intervention SAV sous 48-72h.",
          },
        ]}
      />

      <PrimesBlock />

      <CTAFinal
        title={`Devis pour ${city.name}, gratuit, en 60 secondes`}
        description={
          city.distanceFromFernelmont <= 50
            ? "Livraison incluse, pose en 2-3 semaines après signature du devis."
            : "Pas dans la zone gratuite mais on couvre, forfait livraison transparent dans le devis."
        }
      />
    </>
  );
}
