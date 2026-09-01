import Link from "next/link";
import { Phone, Check, MapPin, Clock, ArrowRight } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/seo";
import { PHONE_DISPLAY, PHONE_HREF, type Service } from "@/lib/services";

export interface ServiceLandingProps {
  service: Service;
  /** Titre H1, plus riche en mots clés que le nom court du service. */
  title: string;
  /** Chapô sous le H1. */
  intro: string;
  /** Ce que la prestation comprend, point par point. */
  included: string[];
  /** Bloc éditorial : pourquoi cette prestation, quand la demander. */
  sections: Array<{ heading: string; body: React.ReactNode }>;
  /** Questions fréquentes, reprises en FAQPage pour les résultats enrichis. */
  faq: Array<{ q: string; a: string }>;
}

/**
 * Page d'arrivée d'une prestation technique (entretien, dépannage, ramonage).
 *
 * Ces trois prestations se calent UNIQUEMENT par téléphone : la page ne propose
 * donc aucun formulaire de réservation, seulement un appel. C'est aussi la page
 * d'arrivée du groupe d'annonces correspondant dans Google Ads, d'où le numéro
 * répété en haut et en bas.
 */
export function ServiceLanding({
  service,
  title,
  intro,
  included,
  sections,
  faq,
}: ServiceLandingProps) {
  const url = `${SITE_URL}${service.href ?? ""}`;

  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      description: intro,
      serviceType: service.name,
      url,
      provider: {
        "@type": "LocalBusiness",
        name: "Mister Pellets",
        telephone: "+3281138309",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rue des Fagotis 3A",
          postalCode: "5380",
          addressLocality: "Fernelmont",
          addressCountry: "BE",
        },
      },
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: 50.5364,
          longitude: 4.9779,
        },
        geoRadius: 50000,
      },
      // Pas d'offre chiffrée : le tarif dépend de l'appareil et de l'accès.
      // Ne rien annoncer plutôt qu'annoncer un prix qui ne sera pas tenu.
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <>
      <JsonLd data={schema} />

      <HeroSecondary
        eyebrow="Service"
        title={title}
        description={intro}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Services", href: "/prendre-rendez-vous" },
          { label: service.name },
        ]}
      />

      {/* Appel : c'est la seule action possible sur cette page. */}
      <section className="bg-mp-green-deep py-8">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <p className="text-mp-cream text-lg font-semibold">
                Ce rendez-vous se prend par téléphone.
              </p>
              <p className="text-mp-cream/75 text-sm mt-1">
                On vérifie d&apos;abord le modèle et l&apos;accès au conduit, puis on cale un
                créneau. Lun-Ven 9h-18h, Sam 9h-13h.
              </p>
            </div>
            <Button asChild variant="primary" size="lg" className="shrink-0">
              <a href={PHONE_HREF}>
                <Phone className="h-4 w-4" />
                {PHONE_DISPLAY}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            <div className="lg:col-span-7 flex flex-col gap-10">
              {sections.map((s) => (
                <div key={s.heading}>
                  <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-3">
                    {s.heading}
                  </h2>
                  <div className="text-mp-ink-soft leading-relaxed flex flex-col gap-3">
                    {s.body}
                  </div>
                </div>
              ))}

              <div>
                <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-4">
                  Questions fréquentes
                </h2>
                <dl className="flex flex-col gap-5">
                  {faq.map((item) => (
                    <div key={item.q}>
                      <dt className="font-semibold text-mp-green-deep mb-1">{item.q}</dt>
                      <dd className="text-mp-ink-soft leading-relaxed">{item.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <aside className="lg:col-span-5 flex flex-col gap-5">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-mp-green-deep mb-4">
                  Ce que comprend la prestation
                </h2>
                <ul className="flex flex-col gap-2.5">
                  {included.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm text-mp-ink leading-relaxed">
                      <Check className="h-4 w-4 text-mp-orange-flame shrink-0 mt-0.5" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 pt-5 border-t border-mp-sand/40 flex flex-col gap-2 text-sm text-mp-ink-soft">
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {service.durationLabel}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    À domicile, 50 km autour de Fernelmont
                  </span>
                </div>

                <Button asChild variant="primary" size="lg" className="w-full justify-center mt-5">
                  <a href={PHONE_HREF}>
                    <Phone className="h-4 w-4" />
                    Appeler le {PHONE_DISPLAY}
                  </a>
                </Button>
                <p className="text-xs text-mp-ink-soft mt-3 text-center">
                  Tarif communiqué au téléphone, selon le modèle et l&apos;accès au conduit.
                </p>
              </Card>

              <Card className="p-6 bg-mp-beige">
                <h2 className="text-lg font-semibold text-mp-green-deep mb-2">
                  Vous cherchez plutôt un poêle&nbsp;?
                </h2>
                <p className="text-sm text-mp-ink-soft leading-relaxed mb-4">
                  Le devis pour l&apos;achat et la pose, lui, se réserve en ligne.
                </p>
                <Button asChild variant="outline" size="default" className="w-full justify-center">
                  <Link href="/prendre-rendez-vous">
                    Prendre rendez-vous
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </Card>
            </aside>

          </div>
        </div>
      </section>
    </>
  );
}
