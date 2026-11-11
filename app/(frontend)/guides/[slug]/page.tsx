import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { InlineText } from "@/components/ui/inline-text";
import { plainText } from "@/lib/inline-text";
import { typo } from "@/lib/typo";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { GUIDES, getGuideBySlug } from "@/lib/guides";
import { buildArticleSchema, buildPageMetadata, ogImagePath, SITE_URL } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Les guides sont compilés dans lib/guides.ts : la liste ne bouge qu'au
 * déploiement. Sans ce réglage, un slug inconnu renvoyait une page « Guide
 * introuvable » en HTTP 200 — un soft 404 que Search Console remonte comme
 * une erreur. Ici, tout slug hors liste donne un vrai 404.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide introuvable", robots: { index: false } };
  return buildPageMetadata({
    title: guide.metaTitle,
    description: guide.metaDescription,
    path: `/guides/${slug}`,
    image: ogImagePath("guides", guide.slug),
    type: "article",
    publishedTime: guide.publishedAt,
    modifiedTime: guide.modifiedAt,
  });
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  // Schema Article (dates réelles, image propre au guide) + éventuel FAQPage.
  // Le fil d'Ariane est balisé par HeroSecondary.
  const schemas: Record<string, unknown>[] = [
    buildArticleSchema({
      headline: guide.title,
      description: guide.directAnswer ? plainText(guide.directAnswer) : guide.description,
      url: `${SITE_URL}/guides/${guide.slug}`,
      imageUrl: `${SITE_URL}${ogImagePath("guides", guide.slug)}`,
      datePublished: guide.publishedAt,
      dateModified: guide.modifiedAt,
    }),
  ];

  if (guide.faq && guide.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: plainText(q.answer) },
      })),
    });
  }

  // Guides "à lire ensuite" : tous sauf le courant, max 2
  const others = GUIDES.filter((g) => g.slug !== guide.slug).slice(0, 2);

  return (
    <>
      <JsonLd data={schemas} />

      <HeroSecondary
        eyebrow={`${guide.category} · ${guide.readingTime} de lecture`}
        title={guide.title}
        description={guide.excerpt}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title },
        ]}
      />

      <article className="bg-mp-cream mp-band">
        <div className="mp-shell">
          <div className="mp-measure">
            {/* Dates réelles du guide : le lecteur sait de quand datent les chiffres. */}
            <p className="mb-10 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-mp-ink-soft">
              <span>
                Publié le <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
              </span>
              {guide.modifiedAt > guide.publishedAt && (
                <span>
                  Mis à jour le <time dateTime={guide.modifiedAt}>{formatDate(guide.modifiedAt)}</time>
                </span>
              )}
              <span>Par l&apos;équipe Mister Pellets</span>
            </p>
            {guide.directAnswer && (
              <p className="mb-10 border-l-4 border-mp-orange-flame pl-4 text-lg font-medium leading-relaxed text-mp-ink md:text-xl">
                <InlineText text={guide.directAnswer} />
              </p>
            )}
              {guide.sections.map((section, i) => (
              <section key={i} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6 mt-2">
                  {typo(section.heading)}
                </h2>

                {section.paragraphs?.map((p, k) => (
                  <p key={k} className="text-lg text-mp-ink leading-relaxed mb-4">
                    <InlineText text={p} />
                  </p>
                ))}

                {section.table && (
                  <div className="-mx-4 mb-4 overflow-x-auto bg-white md:mx-0 md:rounded-[20px] md:border md:border-mp-sand/40">
                    <table className="w-full min-w-[30rem] text-left text-sm md:text-base">
                      {section.table.caption && (
                        <caption className="caption-bottom px-4 py-3 text-left text-xs text-mp-ink-soft">
                          {typo(section.table.caption)}
                        </caption>
                      )}
                      <thead>
                        <tr className="border-b border-mp-sand/40 text-mp-green-deep">
                          {section.table.headers.map((h) => (
                            <th key={h} scope="col" className="px-4 py-3 font-semibold">
                              {typo(h)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, r) => (
                          <tr key={r} className="border-b border-mp-sand/40 last:border-b-0">
                            {row.map((cell, c) =>
                              c === 0 ? (
                                <th key={c} scope="row" className="px-4 py-3 font-medium text-mp-ink">
                                  <InlineText text={cell} />
                                </th>
                              ) : (
                                <td key={c} className="px-4 py-3 tabular-nums text-mp-ink">
                                  <InlineText text={cell} />
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {section.list && (
                  <ul className="space-y-3">
                    {section.list.map((item, k) => (
                      <li key={k} className="flex items-start gap-3 text-mp-ink leading-relaxed">
                        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-mp-orange-light text-mp-orange-ink font-bold text-xs shrink-0 mt-0.5">
                          {k + 1}
                        </span>
                        <span>
                          <InlineText text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            {guide.sources && guide.sources.length > 0 && (
              <section className="border-t border-mp-sand/40 pt-8">
                <h2 className="mb-4 text-xl font-semibold text-mp-green-deep">Sources</h2>
                <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-mp-ink-soft">
                  {guide.sources.map((src) => (
                    <li key={src.label}>
                      {src.href ? <InlineText text={`[${src.label}](${src.href})`} /> : typo(src.label)}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </article>

      {guide.faq && guide.faq.length > 0 && (
        <FAQAccordion
          title="Questions fréquentes sur ce sujet"
          items={guide.faq.map((q) => ({ question: q.question, answer: q.answer }))}
        />
      )}

      {/* Autres guides */}
      {others.length > 0 && (
        <section className="bg-mp-beige mp-band">
          <div className="mp-shell">
            <h2 className="text-3xl font-semibold text-mp-green-deep mb-8 text-center">
              Continuer sur le sujet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {others.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group p-6 rounded-2xl bg-mp-cream border border-mp-sand/40 hover:border-mp-orange-flame transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{g.category}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-mp-ink-soft">
                      <Clock className="h-3.5 w-3.5" /> {g.readingTime}
                    </span>
                  </div>
                  <h3
                    className="text-xl font-semibold text-mp-green-deep group-hover:text-mp-orange-flame transition-colors mb-2"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {g.title}
                  </h3>
                  <p className="text-sm text-mp-ink-soft line-clamp-2">{g.excerpt}</p>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/guides"
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Tous les guides
              </Link>
            </div>
          </div>
        </section>
      )}

      <CTAFinal
        title="Devis personnalisé après lecture ?"
        description="Maintenant que vous savez ce qui vous convient, on chiffre la pose en 48h, TVA comprise."
      />
    </>
  );
}
