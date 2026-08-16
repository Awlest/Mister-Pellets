import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Shield, FileCheck } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Devis gratuit, Poêle à pellets en Wallonie",
  description:
    "Demandez votre devis personnalisé en 60 secondes. 6 questions sur votre projet, on revient sous 48h avec un chiffrage clair, primes incluses.",
  alternates: { canonical: "https://mister-pellets.be/demande-de-devis" },
};

export default function DevisPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="60 secondes"
        title={
          <>
            Devis personnalisé en <span className="mp-italic">6 questions</span>
          </>
        }
        description="Plus précis que le devis générique : on adapte au PEB de votre maison, à votre budget, et au délai. Réponse sous 48h ouvrées avec un chiffrage net incluant les primes Wallonie."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Demande de devis" },
        ]}
      />

      <section className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mb-8 text-sm text-mp-ink-soft">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-mp-orange-flame" />
              Réponse sous 48h
            </span>
            <span className="inline-flex items-center gap-2">
              <Shield className="h-4 w-4 text-mp-orange-flame" />
              Aucune obligation
            </span>
            <span className="inline-flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-mp-orange-flame" />
              Primes calculées
            </span>
          </div>

          {/* Parcours alternatif : celui qui sait déjà quel poêle l'intéresse
              préfère souvent voir un chiffre tout de suite. */}
          <div className="mb-8 rounded-2xl border border-mp-orange-flame/30 bg-mp-orange-light/30 p-5 md:p-6">
            <h2 className="mb-1 text-lg font-semibold text-mp-green-deep">
              Vous voulez un chiffre tout de suite ?
            </h2>
            <p className="mb-4 text-sm text-mp-ink-soft">
              Notre estimation en ligne compose votre installation à partir des poêles du catalogue :
              prix du modèle, pose, TVA, prime Wallonie et mensualité à 0 %, affichés en direct.
            </p>
            <Button asChild variant="primary" size="default">
              <Link href="/estimation">Estimer mon installation →</Link>
            </Button>
          </div>

          <QuoteForm />

          <p className="text-xs text-mp-ink-soft text-center mt-8">
            Vos réponses sont sauvegardées localement, vous pouvez fermer la page et revenir, le formulaire repartira où vous en étiez.
          </p>
        </div>
      </section>
    </>
  );
}
