import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPhone } from "@/lib/utils";
import { BookingWidget } from "@/components/booking/BookingWidget";
import {
  SERVICES,
  ONLINE_SERVICES,
  PHONE_SERVICES,
  PHONE_DISPLAY,
  PHONE_HREF,
} from "@/lib/services";

export const metadata: Metadata = {
  title: "Prendre rendez-vous, Showroom Fernelmont & services Mister Pellets",
  description:
    "Showroom Fernelmont (5380), modèles d'exposition tournants. Devis sur place, visite, entretien annuel, dépannage, ramonage : 5 services Mister Pellets pour poêles à pellets en Wallonie.",
  alternates: { canonical: "https://mister-pellets.be/prendre-rendez-vous" },
};

const PHONE = "081 13 83 09";

export default function PrendreRendezVousPage() {
  // Schema.org : un Service par offre, agrégés en CollectionPage
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Services Mister Pellets",
    itemListElement: SERVICES.map((s, i) => ({
      "@type": "Service",
      position: i + 1,
      name: s.name,
      description: s.shortDescription,
      provider: {
        "@type": "HomeAndConstructionBusiness",
        "@id": "https://mister-pellets.be/#business",
      },
      areaServed: {
        "@type": "AdministrativeArea",
        name: "Wallonie",
      },
    })),
  };

  return (
    <>
      <JsonLd data={serviceSchema} />

      <HeroSecondary
        eyebrow="Showroom Fernelmont · 5 services"
        title={
          <>
            Voir nos poêles, <span className="mp-italic">faire chiffrer</span>, ou nous appeler en SAV
          </>
        }
        description="Notre showroom à Fernelmont accueille plusieurs modèles d'exposition (sélection tournante, on confirme avant votre visite). Devis à domicile, visite showroom, entretien annuel, dépannage, ramonage : 5 services pour poêles à pellets en Wallonie."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Prendre rendez-vous" },
        ]}
      />

      {/* Présentation du showroom */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-5">
            Showroom Mister Pellets à Fernelmont
          </h2>
          <div className="space-y-4 text-mp-ink leading-relaxed text-base md:text-lg">
            <p>
              Notre showroom est situé Rue des Fagotis 3A, 5380 Fernelmont, à 17 km de Namur centre
              et accessible par la N4. Parking devant le bâtiment, accès PMR au rez-de-chaussée. On
              y expose plusieurs modèles des marques que nous distribuons (Edilkamin, EK63,
              Girolami).
            </p>
            <p>
              La sélection en exposition tourne régulièrement selon les nouveautés de saison et les
              modèles que nous testons en condition réelle. Pour cette raison, on ne peut pas
              garantir à l'avance qu'un modèle précis sera physiquement présent au moment de votre
              visite. Si vous visez un modèle particulier, prenez rendez-vous : on vous confirme la
              veille les références effectivement en exposition, et au besoin on en sort un du
              stock atelier pour votre visite.
            </p>
            <p>
              <strong className="text-mp-green-deep">Pour être certain d'être reçu</strong> et
              bénéficier de conseils personnalisés (avec un café, accessoirement),
              <strong> prendre rendez-vous est fortement recommandé</strong>. Les visites sans RDV
              sont possibles aux heures d'ouverture mais on ne peut pas garantir la disponibilité
              d'un conseiller selon la charge du jour.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3 items-center text-sm text-mp-ink-soft">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mp-orange-flame" />
              Rue des Fagotis 3A, 5380 Fernelmont
            </span>
            <span className="text-mp-sand">·</span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-mp-orange-flame" />
              Lun-Ven 9h-18h, Sam 9h-13h
            </span>
            <span className="text-mp-sand">·</span>
            <span className="font-medium text-mp-orange-flame">Sur rendez-vous uniquement</span>
          </div>
        </div>
      </section>

      {/* Rendez-vous commerciaux : réservables en ligne */}
      <section className="bg-mp-beige py-12 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-4">
              Réserver un rendez-vous en ligne
            </h2>
            <p className="text-base md:text-lg text-mp-ink-soft leading-relaxed">
              Pour chiffrer un projet ou venir voir les modèles, choisissez directement votre
              créneau dans notre agenda. Vous recevez l&apos;invitation par email, et le
              rendez-vous se pose dans le nôtre.
            </p>
          </div>

          <BookingWidget
            services={ONLINE_SERVICES.map((s) => ({
              slug: s.slug,
              name: s.name,
              durationLabel: s.durationLabel,
              location: s.location,
            }))}
            phoneDisplay={PHONE_DISPLAY}
            phoneHref={PHONE_HREF}
          />
        </div>
      </section>

      {/* Interventions techniques : par téléphone uniquement */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-4">
              Entretien, ramonage, dépannage
            </h2>
            <p className="text-base md:text-lg text-mp-ink-soft leading-relaxed">
              Ces trois interventions se calent <strong className="text-mp-green-deep">par
              téléphone</strong>, et pas en ligne. On a besoin de connaître la marque, le modèle
              et l&apos;accès au conduit avant de bloquer un créneau : c&apos;est ce qui permet
              d&apos;arriver avec les bonnes pièces et le bon matériel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PHONE_SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <Card key={service.slug} className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-mp-orange-light text-mp-orange-flame">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-mp-orange-flame uppercase tracking-wider">
                      {service.priceLabel}
                    </span>
                  </div>

                  <h3
                    className="text-xl font-semibold text-mp-green-deep mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {service.name}
                  </h3>

                  <p className="text-sm text-mp-ink-soft leading-relaxed mb-4 flex-1">
                    {service.shortDescription}
                  </p>

                  <p className="text-xs text-mp-ink-soft italic mb-4">
                    Pour les poêles et inserts à pellets uniquement.
                  </p>

                  <div className="flex flex-col gap-2 mt-auto">
                    <Button asChild variant="primary" size="default" className="w-full justify-center">
                      <a href={`tel:${formatPhone(PHONE)}`}>
                        <Phone className="h-4 w-4" />
                        {PHONE}
                      </a>
                    </Button>
                    {service.href && (
                      <Button asChild variant="outline" size="default" className="w-full justify-center">
                        <Link href={service.href}>
                          En savoir plus
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alternative téléphone (toujours utile pour qui n'aime pas le formulaire) */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-4">
            Plus simple : appelez-nous
          </h2>
          <p className="text-base md:text-lg text-mp-ink-soft mb-8 leading-relaxed max-w-2xl mx-auto">
            Si vous préférez le téléphone (souvent plus rapide), on cale un créneau en 30 secondes.
            Ou par email si vous voulez écrire à tête reposée.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Button asChild variant="primary" size="lg">
              <a href={`tel:${formatPhone(PHONE)}`}>
                <Phone className="h-5 w-5" />
                {PHONE}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Écrire un email</Link>
            </Button>
          </div>

          <p className="text-sm text-mp-ink-soft mt-8">
            Lun-Ven 9h-18h, Sam 9h-13h
          </p>
        </div>
      </section>

      <CTAFinal
        title="Pas envie de venir au showroom ?"
        description="On peut aussi se voir en visio (15 minutes) ou directement chez vous pour un diagnostic. Au choix selon ce qui vous arrange."
        primaryCta={{ label: "Demander un devis", href: "/demande-de-devis" }}
      />
    </>
  );
}
