import Link from "next/link";
import { Calculator, PiggyBank, Wrench } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { EstimateConfigurator } from "@/components/forms/EstimateConfigurator";
import { getEstimateCatalog } from "@/lib/estimate-catalog";
import { isBonusPeriod } from "@/lib/bonus";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildPageMetadata({
  title: "Estimation en ligne, poêle à pellets posé",
  description:
    "Composez votre installation en 2 minutes : le poêle de notre catalogue, la pose, la TVA 6 % et la mensualité à 0 %. Estimation immédiate, prix ferme après visite technique.",
  path: "/estimation",
});

/**
 * ISR comme la boutique : le catalogue chiffrable vient de Payload, la page est
 * servie depuis le cache CDN et se régénère quand un prix change dans l'admin.
 */
export const revalidate = 60;

export default async function EstimationPage() {
  const products = await getEstimateCatalog();

  return (
    <>
      <HeroSecondary
        eyebrow="2 minutes"
        title={
          <>
            Votre poêle à pellets posé, <span className="mp-italic">chiffré en direct</span>
          </>
        }
        description="Vous choisissez le poêle dans notre catalogue, nous ajoutons la pose, la TVA applicable et la mensualité à 0 %. Le tout sans attendre un rappel."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Estimation en ligne" }]}
        compact
      />

      {/* Mobile d'abord : héros resserré, arguments déplacés sous le
        * configurateur, pour que la première question tienne dans le premier
        * écran (elle tombait à 832 px du haut sur un téléphone). */}
      <section className="bg-mp-cream pt-4 pb-14 sm:pt-10 md:pt-14 md:pb-20">
        <div className="mp-shell">
          <TrustPoints className="mb-8 hidden lg:flex" />

          {products.length === 0 ? (
            <div className="rounded-3xl border border-mp-sand/40 bg-white p-8 text-center shadow-md">
              <h2 className="mb-3 text-2xl font-semibold text-mp-green-deep">
                Estimation momentanément indisponible
              </h2>
              <p className="text-mp-ink-soft">
                Notre catalogue est en cours de mise à jour. Appelez-nous au 081 13 83 09 ou{" "}
                <Link
                  href="/demande-de-devis"
                  className="text-mp-orange-ink underline hover:no-underline"
                >
                  décrivez-nous votre projet
                </Link>
                , nous chiffrons à la main.
              </p>
            </div>
          ) : (
            <EstimateConfigurator products={products} bonusAtRender={isBonusPeriod()} />
          )}

          <TrustPoints className="mt-8 lg:hidden" />

          <div className="mx-auto mt-10 mp-measure space-y-4 text-sm text-mp-ink-soft">
            <p>
              <strong className="text-mp-green-deep">Ce que couvre l&apos;estimation.</strong> Le
              poêle au prix de notre catalogue, la pose et le raccordement selon votre type
              d&apos;évacuation, les fournitures courantes, la mise en service et le réglage de la
              combustion. Les forfaits de pose sont des budgets moyens : une configuration
              inhabituelle (accès compliqué, conduit hors normes, maçonnerie à reprendre) se chiffre
              après la visite technique gratuite.
            </p>
            <p>
              <strong className="text-mp-green-deep">Pas envie de choisir un modèle ?</strong>{" "}
              <Link
                href="/demande-de-devis"
                className="text-mp-orange-ink underline hover:no-underline"
              >
                Décrivez-nous votre projet en 6 questions
              </Link>{" "}
              et nous vous proposons la sélection qui convient.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/** Les trois arguments du configurateur : au-dessus sur grand écran, dessous sur mobile. */
function TrustPoints({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 text-sm text-mp-ink-soft sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2">
        <Calculator className="h-4 w-4 text-mp-orange-flame" aria-hidden />
        Prix du catalogue, pas une fourchette
      </span>
      <span className="inline-flex items-center gap-2">
        <Wrench className="h-4 w-4 text-mp-orange-flame" aria-hidden />
        Pose et mise en service comprises
      </span>
      <span className="inline-flex items-center gap-2">
        <PiggyBank className="h-4 w-4 text-mp-orange-flame" aria-hidden />
        TVA et 0 % simulés
      </span>
    </div>
  );
}
