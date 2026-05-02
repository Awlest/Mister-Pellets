import type { Metadata } from "next";
import Link from "next/link";
import { Phone, MapPin, Calendar, Coffee } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { formatPhone } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Prendre rendez-vous — Showroom Fernelmont",
  description:
    "Viens voir nos modèles de poêles à pellets en vrai à Fernelmont. RDV gratuit sans engagement, on prend le temps de discuter de ton projet autour d'un café.",
};

const PHONE = "0472 04 32 22";

export default function PrendreRendezVousPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="Showroom Fernelmont"
        title={
          <>
            Voir nos poêles <span className="mp-italic">en vrai</span>
          </>
        }
        description="Avant d'acheter, c'est mieux de toucher la matière, de regarder la flamme, de comparer les marques côte à côte. Notre showroom est ouvert toute l'année à Fernelmont, RDV gratuit et sans engagement."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Prendre rendez-vous" },
        ]}
      />

      {/* Pourquoi venir */}
      <section className="bg-mp-cream py-16 md:py-24">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-5">
                <Calendar className="h-6 w-6" />
              </div>
              <h3
                className="text-xl font-semibold text-mp-green-deep mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                15 modèles en démo
              </h3>
              <p className="text-mp-ink-soft leading-relaxed">
                Edilkamin, EK63, Dielle, Ferlux. Tu compares les designs, tu vois les flammes, tu
                compares les sons (oui c'est important). On a aussi 2 modèles allumés selon les jours.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-5">
                <Coffee className="h-6 w-6" />
              </div>
              <h3
                className="text-xl font-semibold text-mp-green-deep mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Conseil personnalisé
              </h3>
              <p className="text-mp-ink-soft leading-relaxed">
                On prend le temps. 30 à 60 minutes selon ton projet. Si tu veux on regarde ton plan
                de maison ensemble pour caler la puissance et le placement.
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-mp-orange-light text-mp-orange-flame mb-5">
                <MapPin className="h-6 w-6" />
              </div>
              <h3
                className="text-xl font-semibold text-mp-green-deep mb-3"
                style={{ fontFamily: "var(--font-display)" }}
              >
                À 17 km de Namur
              </h3>
              <p className="text-mp-ink-soft leading-relaxed">
                Rue des Fagotis 3A, 5380 Fernelmont. 15 minutes de Namur centre, parking devant le
                showroom. Du lundi au samedi (matinée).
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Take rendez-vous: téléphone + email */}
      <section className="bg-mp-beige py-16 md:py-24">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-semibold text-mp-green-deep mb-4">
            Comment fixer un RDV ?
          </h2>
          <p className="text-lg text-mp-ink-soft mb-10 leading-relaxed max-w-2xl mx-auto">
            Le calendrier en ligne arrive bientôt. En attendant, le plus rapide c'est de nous
            appeler — on cale un créneau dans les 30 secondes. Ou alors par email si tu préfères.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
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
            Heures d'ouverture · Lun-Ven 9h-18h · Sam 9h-13h
          </p>
        </div>
      </section>

      <CTAFinal
        title="Pas le temps de venir ?"
        description="On peut aussi se voir en visio (15 minutes) ou directement chez toi. Au choix selon ce qui t'arrange."
        primaryCta={{ label: "Demander un devis", href: "/demande-de-devis" }}
      />
    </>
  );
}
