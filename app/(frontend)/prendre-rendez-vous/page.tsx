import type { Metadata } from "next";
import Link from "next/link";
import {
  Phone,
  MapPin,
  Calendar,
  Coffee,
  Wrench,
  Flame,
  Brush,
  Home,
  Clock,
  ArrowRight,
} from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { JsonLd } from "@/components/seo/JsonLd";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prendre rendez-vous, Showroom Fernelmont & services Mister Pellets",
  description:
    "Showroom Fernelmont (5380), modèles d'exposition tournants. Devis sur place, visite, entretien annuel, dépannage, ramonage : 5 services Mister Pellets pour poêles à pellets en Wallonie.",
};

const PHONE = "0472 04 32 22";
// Sous-domaine Easy!Appointments, à activer via DNS Combell + install PHP/MySQL
const BOOKING_BASE = "https://booking.mister-pellets.be";

type ServiceLocation = "domicile" | "showroom";

interface Service {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  durationLabel: string;
  priceLabel: string;
  location: ServiceLocation;
  icon: typeof Calendar;
  // ID du service correspondant dans Easy!Appointments (à configurer côté admin E!A)
  easyAppointmentsServiceId: string;
}

/**
 * 5 services Mister Pellets exposés via Easy!Appointments self-hosté
 * (cf. doc corrections-mobile-v1 §5.2 et §5.4).
 *
 * Configuration finale via collection Payload `Services` (Phase 8).
 * Tarifs "Sur devis" = à compléter par le client dans l'admin Payload.
 */
const SERVICES: Service[] = [
  {
    slug: "devis-sur-place",
    name: "Devis sur place",
    shortDescription: "Diagnostic à domicile pour chiffrer ton projet pellets.",
    longDescription:
      "On vient chez toi, on regarde la pièce, le conduit existant, l'isolation, l'arrivée d'air comburant. Sortie : un devis chiffré sous 48 heures avec le modèle adapté, la prime Wallonie déjà calculée, et le délai de pose.",
    durationLabel: "60 minutes",
    priceLabel: "Gratuit",
    location: "domicile",
    icon: Home,
    easyAppointmentsServiceId: "1",
  },
  {
    slug: "visite-showroom",
    name: "Visite showroom + conseils",
    shortDescription: "Voir les modèles d'exposition à Fernelmont, comparer en vrai.",
    longDescription:
      "On t'accueille au showroom de Fernelmont, café, tu vois les flammes, tu compares les designs, on parle puissance et budget. La sélection en exposition tourne régulièrement, donc on peut te confirmer quels modèles seront sur place le jour de ta visite.",
    durationLabel: "45 minutes",
    priceLabel: "Gratuit",
    location: "showroom",
    icon: Coffee,
    easyAppointmentsServiceId: "2",
  },
  {
    slug: "entretien-annuel",
    name: "Entretien annuel",
    shortDescription: "Révision complète obligatoire chaque année (poêles à pellets).",
    longDescription:
      "Démontage, nettoyage du creuset, de l'échangeur de chaleur, de la chambre de combustion, du conduit interne, de la sonde de fumée, du ventilateur d'extraction. Vérification des joints, du tirage, des paramètres de combustion. Service réservé aux poêles à pellets.",
    durationLabel: "Environ 90 minutes",
    priceLabel: "Sur devis",
    location: "domicile",
    icon: Wrench,
    easyAppointmentsServiceId: "3",
  },
  {
    slug: "depannage",
    name: "Dépannage",
    shortDescription: "Intervention rapide en cas de panne ou d'extinction répétée.",
    longDescription:
      "Diagnostic sur place, remplacement éventuel de pièces (résistance d'allumage, motoréducteur, sonde de fumée, carte électronique). Intervention sous 48 à 72 heures dans la zone Fernelmont et 50 km autour. Service réservé aux poêles à pellets.",
    durationLabel: "Variable selon la cause",
    priceLabel: "Sur devis",
    location: "domicile",
    icon: Flame,
    easyAppointmentsServiceId: "4",
  },
  {
    slug: "ramonage",
    name: "Ramonage",
    shortDescription: "Ramonage du conduit annuel, certificat fourni.",
    longDescription:
      "Ramonage mécanique du conduit de fumée, contrôle du chapeau, vérification des distances de sécurité. Certificat de ramonage remis sur place (à conserver pour ton assurance habitation). Service réservé aux poêles à pellets.",
    durationLabel: "Environ 60 minutes",
    priceLabel: "Sur devis",
    location: "domicile",
    icon: Brush,
    easyAppointmentsServiceId: "5",
  },
];

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
        description="Notre showroom à Fernelmont accueille plusieurs modèles d'exposition (sélection tournante, on confirme avant ta visite). Devis à domicile, visite showroom, entretien annuel, dépannage, ramonage : 5 services pour poêles à pellets en Wallonie."
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
              y expose plusieurs modèles parmi les 4 marques que nous distribuons (Edilkamin, EK63,
              Dielle, Ferlux).
            </p>
            <p>
              La sélection en exposition tourne régulièrement selon les nouveautés de saison et les
              modèles que nous testons en condition réelle. Pour cette raison, on ne peut pas
              garantir à l'avance qu'un modèle précis sera physiquement présent au moment de ta
              visite. Si tu vises un modèle particulier, prends rendez-vous : on te confirme la
              veille les références effectivement en exposition, et au besoin on en sort un du
              stock atelier pour ta visite.
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
          </div>
        </div>
      </section>

      {/* Les 5 services */}
      <section className="bg-mp-beige py-12 md:py-16">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="max-w-3xl mb-10">
            <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-4">
              Cinq raisons de nous voir
            </h2>
            <p className="text-base md:text-lg text-mp-ink-soft leading-relaxed">
              Choisis le service qui correspond à ton besoin. Le créneau se réserve sur notre
              système de prise de rendez-vous en ligne. Tu reçois une confirmation par email,
              avec une option d'ajout direct à ton agenda Google ou Apple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              const bookingHref = `${BOOKING_BASE}/?service=${service.easyAppointmentsServiceId}`;
              const isTechnical = ["entretien-annuel", "depannage", "ramonage"].includes(service.slug);

              return (
                <Card
                  key={service.slug}
                  className="p-6 flex flex-col h-full"
                >
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
                    {service.longDescription}
                  </p>

                  <div className="flex flex-wrap gap-3 mb-5 text-xs text-mp-ink-soft">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {service.durationLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {service.location === "domicile" ? "À domicile" : "Showroom Fernelmont"}
                    </span>
                  </div>

                  {isTechnical && (
                    <p className="text-xs text-mp-ink-soft italic mb-3 -mt-2">
                      Pour les poêles à pellets uniquement.
                    </p>
                  )}

                  <Button asChild variant="primary" size="default" className="w-full justify-center">
                    <a
                      href={bookingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Réserver
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </Button>
                </Card>
              );
            })}
          </div>

          <p className="mt-8 text-xs text-mp-ink-soft italic max-w-3xl">
            Le système de prise de rendez-vous repose sur Easy!Appointments, hébergé sur notre
            sous-domaine <code className="text-mp-green-deep not-italic">booking.mister-pellets.be</code>.
            Confirmation automatique par email, synchronisation native avec notre agenda Google.
          </p>
        </div>
      </section>

      {/* Alternative téléphone (toujours utile pour qui n'aime pas le formulaire) */}
      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-semibold text-mp-green-deep mb-4">
            Plus simple : appelle-nous
          </h2>
          <p className="text-base md:text-lg text-mp-ink-soft mb-8 leading-relaxed max-w-2xl mx-auto">
            Si tu préfères le téléphone (souvent plus rapide), on cale un créneau en 30 secondes.
            Ou par email si tu veux écrire à tête reposée.
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
        description="On peut aussi se voir en visio (15 minutes) ou directement chez toi pour un diagnostic. Au choix selon ce qui t'arrange."
        primaryCta={{ label: "Demander un devis", href: "/demande-de-devis" }}
      />
    </>
  );
}
