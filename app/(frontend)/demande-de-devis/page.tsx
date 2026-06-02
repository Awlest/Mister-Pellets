import type { Metadata } from "next";
import { Clock, Shield, FileCheck } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { QuoteForm } from "@/components/forms/QuoteForm";

export const metadata: Metadata = {
  title: "Devis gratuit, Poêle à pellets en Wallonie",
  description:
    "Demande ton devis personnalisé en 60 secondes. 6 questions sur ton projet, on revient sous 48h avec un chiffrage clair, primes incluses.",
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
        description="Plus précis que le devis générique : on adapte au PEB de ta maison, à ton budget, et au délai. Réponse sous 48h ouvrées avec un chiffrage net incluant les primes Wallonie."
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

          <QuoteForm />

          <p className="text-xs text-mp-ink-soft text-center mt-8">
            Tes réponses sont sauvegardées localement, tu peux fermer la page et revenir, le formulaire repartira où tu en étais.
          </p>
        </div>
      </section>
    </>
  );
}
