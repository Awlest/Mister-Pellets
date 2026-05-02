import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Guides poêle à pellets — 5 guides complets",
  description:
    "Le guide d'achat 2026, le canalisable, l'hydro, l'entretien, le dimensionnement. Conseils complets et indépendants par les techniciens Mister Pellets.",
};

export default function GuidesHubPage() {
  return (
    <>
      <HeroSecondary
        eyebrow="Guides éditoriaux"
        title={
          <>
            Tout savoir avant <span className="mp-italic">d'acheter</span>
          </>
        }
        description="5 guides complets écrits par nos techniciens, pas par un rédacteur générique. Choix de marques, technologies, dimensionnement, entretien, primes — sans bullshit, avec les vrais chiffres."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Guides" },
        ]}
      />

      <section className="bg-mp-cream py-16 md:py-20">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {GUIDES.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group"
              >
                <Card className="p-8 h-full flex flex-col hover:-translate-y-1 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="secondary">{guide.category}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-mp-ink-soft">
                      <Clock className="h-3.5 w-3.5" /> {guide.readingTime}
                    </span>
                  </div>

                  <h2
                    className="text-2xl md:text-3xl font-semibold text-mp-green-deep group-hover:text-mp-orange-flame transition-colors mb-4 leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {guide.title}
                  </h2>

                  <p className="text-mp-ink-soft leading-relaxed flex-1 mb-6">
                    {guide.excerpt}
                  </p>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-mp-orange-flame group-hover:gap-3 transition-all">
                    Lire le guide
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="inline-block p-6 bg-mp-beige border-mp-sand/40">
              <BookOpen className="h-8 w-8 text-mp-orange-flame mx-auto mb-3" />
              <p className="text-sm text-mp-ink-soft">
                Plus d'articles à venir dans le{" "}
                <Link href="/blog" className="text-mp-orange-flame underline hover:no-underline font-semibold">
                  blog
                </Link>{" "}
                : actualités, comparatifs, retours d'installation.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <CTAFinal
        title="Une question pas couverte par les guides ?"
        description="Nos techniciens répondent personnellement par téléphone ou email. Pas de SAV externalisé, pas de chatbot."
      />
    </>
  );
}
