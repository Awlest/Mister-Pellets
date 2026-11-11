import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { ProductGrid, sortForGrid } from "@/components/product/ProductGrid";
import { ROUTES } from "@/config/navigation";
import { productsInCategory, type CategoryData } from "@/lib/categories";
import { getAllProducts } from "@/lib/products";

const LINK =
  "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mp-green-deep underline underline-offset-4 decoration-mp-sand hover:text-mp-orange-ink";

/**
 * Page d'une catégorie du catalogue (lib/categories.ts) : chapô, liens utiles
 * et grille complète des fiches, rendue par le serveur. Le texte long viendra
 * dans `category.sections`, affiché sous la grille.
 */
export async function CategoryLanding({ category }: { category: CategoryData }) {
  const products = sortForGrid(productsInCategory(category, await getAllProducts()));

  return (
    <>
      <HeroSecondary
        eyebrow={`${products.length} ${products.length > 1 ? "modèles" : "modèle"} au catalogue`}
        title={
          <>
            {category.h1.lead} <span className="mp-italic">{category.h1.accent}</span>
          </>
        }
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Boutique", href: ROUTES.shop },
          { label: category.label },
        ]}
        compact
      />

      <section className="bg-mp-cream mp-band-sm">
        <div className="mp-shell">
          <div className="mp-measure">
            <p className="text-lg text-mp-ink leading-relaxed">{category.intro}</p>
            <ul className="mt-4 flex flex-col gap-x-6 sm:flex-row sm:flex-wrap">
              {category.guide && (
                <li>
                  <Link href={category.guide.href} className={LINK}>
                    {category.guide.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              )}
              <li>
                <Link href={ROUTES.prices} className={LINK}>
                  Prix d&apos;un poêle à pellets posé
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
              <li>
                <Link href={ROUTES.configurator} className={LINK}>
                  Estimer mon installation
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-mp-beige mp-band">
        <div className="mp-shell">
          <h2 className="mp-measure mx-auto mb-10 text-center text-3xl font-semibold text-mp-green-deep md:text-5xl">
            Les modèles
          </h2>
          {products.length > 0 ? (
            <ProductGrid products={products} initial={12} priority />
          ) : (
            <p className="mp-measure text-center text-lg text-mp-ink-soft">
              Aucune fiche pour le moment.{" "}
              <Link href={ROUTES.shop} className="text-mp-orange-ink underline hover:no-underline">
                Voir toute la boutique
              </Link>
              .
            </p>
          )}
        </div>
      </section>

      {/* Texte long de la catégorie : rempli dans un second temps (lib/categories.ts). */}
      {category.sections && category.sections.length > 0 && (
        <section className="bg-mp-cream mp-band">
          <div className="mp-shell">
            <div className="mp-measure">
              {category.sections.map((section) => (
                <div key={section.heading} className="mb-10 last:mb-0">
                  <h2 className="mb-4 text-2xl font-semibold text-mp-green-deep md:text-3xl">{section.heading}</h2>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="mb-4 text-lg text-mp-ink leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTAFinal
        tone={category.sections && category.sections.length > 0 ? "beige" : "cream"}
        title="Besoin d'un avis sur le bon modèle ?"
        description="Décrivez votre maison et votre conduit : on vous propose deux ou trois modèles adaptés, pose et TVA comprises."
      />
    </>
  );
}
