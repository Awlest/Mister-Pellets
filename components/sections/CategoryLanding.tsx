import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { CatalogueListing } from "@/components/product/ProductListing";
import { JsonLd } from "@/components/seo/JsonLd";
import { InlineText } from "@/components/ui/inline-text";
import { ROUTES } from "@/config/navigation";
import { encodeListing, sortForGrid } from "@/lib/catalogue-listing";
import { productsInCategory, summarizeCategory, type CategoryData } from "@/lib/categories";
import { formatKw } from "@/lib/power";
import { shownPriceTTC } from "@/lib/product-price";
import { getAllProducts } from "@/lib/products";
import { buildFAQSchema } from "@/lib/seo";
import { NBSP, formatEuros, typo } from "@/lib/typo";

const LINK =
  "inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mp-green-deep underline underline-offset-4 decoration-mp-sand hover:text-mp-orange-ink";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Fourchette « 5,1 à 24 kW » : sur téléphone, elle passe sur deux lignes avant « à », jamais au milieu d'une valeur. */
function Range({ min, max, format }: { min?: number; max?: number; format: (n: number) => string }) {
  if (min == null || max == null) return null;
  if (min === max) return <span className="whitespace-nowrap">{format(min)}</span>;
  return (
    <>
      <span className="whitespace-nowrap">{format(min)}</span>{" "}
      <span className="whitespace-nowrap">à {format(max)}</span>
    </>
  );
}

const kwLabel = (n: number) => `${formatKw(n)}${NBSP}kW`;

/**
 * Page d'une catégorie du catalogue (lib/categories.ts) : chapô, liste
 * complète des fiches (24 cartes, puis une ligne par fiche, toutes en liens
 * dans le HTML servi : ProductListing.tsx), tableau par marque calculé au
 * rendu, texte « comment choisir », fiches et guides liés, FAQ balisée.
 */
export async function CategoryLanding({ category }: { category: CategoryData }) {
  const products = sortForGrid(productsInCategory(category, await getAllProducts()));
  const summary = summarizeCategory(products);
  const featured = (category.featured ?? [])
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is (typeof products)[number] => Boolean(p));
  const hasText = Boolean(category.sections && category.sections.length > 0);
  const faq = category.faq ?? [];

  return (
    <>
      {faq.length > 0 && <JsonLd data={buildFAQSchema(faq)} />}

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
            <p className="text-lg text-mp-ink leading-relaxed">{typo(category.intro)}</p>
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
            <CatalogueListing entries={encodeListing(products)} priority />
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

      {(products.length > 0 || hasText) && (
        <section className="bg-mp-cream mp-band">
          <div className="mp-shell">
            <div className="mp-measure">
              {products.length > 0 && (
                <div className="mb-12">
                  <h2 className="mb-4 text-2xl font-semibold text-mp-green-deep md:text-3xl">
                    {typo(`Le catalogue en chiffres : ${category.label.toLowerCase()}`)}
                  </h2>
                  <div className="overflow-x-auto rounded-[20px] border border-mp-sand/40 bg-white">
                    <table className="w-full text-left text-sm md:text-base">
                      <caption className="sr-only">
                        Fiches visibles au catalogue, calculées à l&apos;affichage de la page. Prix de
                        l&apos;appareil seul, TVA à 21 % comprise, tels qu&apos;affichés sur les fiches ; une fiche sans
                        prix est sur devis. Pose et évacuation en plus.
                      </caption>
                      <thead>
                        <tr className="border-b border-mp-sand/40 text-mp-green-deep">
                          <th scope="col" className="py-3 pl-3 pr-1 font-semibold sm:px-4">Marque</th>
                          <th scope="col" className="px-1 py-3 text-right font-semibold sm:px-3">Modèles</th>
                          <th scope="col" className="px-2 py-3 font-semibold sm:px-3">Puissance</th>
                          <th scope="col" className="py-3 pl-1 pr-3 text-right font-semibold sm:px-4">Prix affichés</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...summary.rows, summary.total].map((row, i, all) => {
                          const isTotal = i === all.length - 1;
                          return (
                            <tr
                              key={row.brand}
                              className={
                                isTotal ? "font-semibold text-mp-green-deep" : "border-b border-mp-sand/40"
                              }
                            >
                              <th scope="row" className="py-3 pl-3 pr-1 font-medium sm:px-4">{row.brand}</th>
                              <td className="px-1 py-3 text-right tabular-nums sm:px-3">{row.models}</td>
                              <td className="px-2 py-3 tabular-nums sm:px-3">
                                {row.minKw == null ? "-" : <Range min={row.minKw} max={row.maxKw} format={kwLabel} />}
                              </td>
                              <td className="py-3 pl-1 pr-3 text-right tabular-nums sm:px-4">
                                {row.minPrice == null ? "Sur devis" : <Range min={row.minPrice} max={row.maxPrice} format={formatEuros} />}
                                {row.priced > 0 && row.priced < row.models && (
                                  <span className="block text-xs font-normal text-mp-ink-soft">
                                    {row.priced} {row.priced > 1 ? "fiches" : "fiche"} sur {row.models}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-mp-ink-soft">Fiches visibles au catalogue, calculées à l&apos;affichage de la page. Prix de
                        l&apos;appareil seul, TVA à 21 % comprise, tels qu&apos;affichés sur les fiches ; une fiche sans
                        prix est sur devis. Pose et évacuation en plus.</p>
                  <p className="mt-3 text-sm text-mp-ink-soft">
                    Texte mis à jour le <time dateTime={category.modifiedAt}>{formatDate(category.modifiedAt)}</time>.
                  </p>
                </div>
              )}

              {category.sections?.map((section) => (
                <div key={section.heading} className="mb-10 last:mb-0">
                  <h2 className="mb-4 text-2xl font-semibold text-mp-green-deep md:text-3xl">{typo(section.heading)}</h2>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="mb-4 text-lg text-mp-ink leading-relaxed">
                      <InlineText text={p} />
                    </p>
                  ))}
                </div>
              ))}

              {(featured.length > 0 || (category.readMore?.length ?? 0) > 0) && (
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
                  {featured.length > 0 && (
                    <div className="min-w-0">
                      <h2 className="mb-3 text-xl font-semibold text-mp-green-deep">Modèles à regarder</h2>
                      <ul>
                        {featured.map((p) => {
                          const price = shownPriceTTC(p);
                          return (
                            <li key={p.slug} className="border-b border-mp-sand/40 last:border-b-0">
                              <Link
                                href={`/produit/${p.slug}`}
                                className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-3 py-2 text-mp-green-deep hover:text-mp-orange-ink"
                              >
                                <span className="font-semibold underline underline-offset-4 decoration-mp-sand">{p.name}</span>
                                <span className="text-sm tabular-nums text-mp-ink-soft">
                                  {formatKw(p.powerKw)} kW · {price ? formatEuros(price) : "Sur devis"}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="mb-3 text-xl font-semibold text-mp-green-deep">À lire avant de choisir</h2>
                    <ul>
                      {[...(category.guide ? [category.guide] : []), ...(category.readMore ?? [])].map((g) => (
                        <li key={g.href}>
                          <Link href={g.href} className={LINK}>
                            {g.label}
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {faq.length > 0 && (
        <FAQAccordion tone="beige" title={`Questions fréquentes : ${category.label.toLowerCase()}`} items={faq} />
      )}

      <CTAFinal
        tone={faq.length > 0 ? "cream" : products.length > 0 || hasText ? "beige" : "cream"}
        title="Besoin d'un avis sur le bon modèle ?"
        description="Décrivez votre maison et votre conduit : on vous propose deux ou trois modèles adaptés, pose et TVA comprises."
      />
    </>
  );
}
