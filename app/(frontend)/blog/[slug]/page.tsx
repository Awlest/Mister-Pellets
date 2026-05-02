import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Calendar, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  ARTICLES,
  CATEGORY_LABELS,
  getArticleBySlug,
  getRelatedArticles,
  type ArticleSection,
} from "@/lib/articles";
import { GUIDES } from "@/lib/guides";
import { BRAND_LIST } from "@/lib/brands";
import { CITIES } from "@/lib/cities";
import {
  buildPageMetadata,
  buildBreadcrumbSchema,
  buildFAQSchema,
  buildArticleSchema,
  SITE_URL,
} from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };

  return buildPageMetadata({
    title: article.metaTitle,
    description: article.metaDescription,
    path: `/blog/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
    modifiedTime: article.modifiedAt,
    authors: [article.authorName],
    keywords: article.tags,
  });
}

// =====================================================================
// Helpers de rendu
// =====================================================================

function CalloutBox({ variant, text }: { variant: "info" | "warning" | "success"; text: string }) {
  const config = {
    info: {
      icon: Info,
      bg: "bg-mp-beige border-mp-sand/40",
      iconColor: "text-mp-orange-flame",
    },
    warning: {
      icon: AlertTriangle,
      bg: "bg-mp-orange-light/40 border-mp-orange-flame/30",
      iconColor: "text-mp-orange-flame",
    },
    success: {
      icon: CheckCircle2,
      bg: "bg-mp-green-mid/15 border-mp-green-mid/40",
      iconColor: "text-mp-green-deep",
    },
  }[variant];
  const Icon = config.icon;

  return (
    <div className={`my-8 p-5 md:p-6 rounded-2xl border ${config.bg} flex gap-4`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${config.iconColor}`} />
      <p className="text-mp-ink leading-relaxed text-base">{text}</p>
    </div>
  );
}

function SectionRenderer({ section }: { section: ArticleSection }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6 mt-2 leading-snug">
        {section.heading}
      </h2>

      {section.paragraphs?.map((p, i) => (
        <p key={i} className="text-lg text-mp-ink leading-relaxed mb-4">
          {p}
        </p>
      ))}

      {section.list && (
        section.list.ordered ? (
          <ol className="space-y-3 my-6">
            {section.list.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-mp-ink leading-relaxed">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-mp-orange-light text-mp-orange-flame font-bold text-xs shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-3 my-6">
            {section.list.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-mp-ink leading-relaxed">
                <span className="h-1.5 w-1.5 rounded-full bg-mp-orange-flame shrink-0 mt-2.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )
      )}

      {section.table && (
        <figure className="my-8 -mx-4 md:mx-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse rounded-2xl overflow-hidden bg-mp-cream border border-mp-sand/40">
            <thead className="bg-mp-green-deep text-mp-cream">
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i} className="p-3 md:p-4 text-left font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-mp-beige/40" : "bg-mp-cream"}
                >
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 md:p-4 border-t border-mp-sand/30 text-mp-ink">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {section.table.caption && (
            <figcaption className="text-xs text-mp-ink-soft italic mt-2 px-4 md:px-0">
              {section.table.caption}
            </figcaption>
          )}
        </figure>
      )}

      {section.callout && <CalloutBox {...section.callout} />}
    </section>
  );
}

// =====================================================================
// PAGE
// =====================================================================

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  // ---------- Schemas Schema.org ----------
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Accueil", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: article.title, url: `/blog/${article.slug}` },
  ]);

  const articleSchema = buildArticleSchema({
    headline: article.title,
    description: article.metaDescription,
    url: `${SITE_URL}/blog/${article.slug}`,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    authorName: article.authorName,
  });

  const schemas: Record<string, unknown>[] = [breadcrumb, articleSchema];
  if (article.faqs.length > 0) {
    schemas.push(buildFAQSchema(article.faqs));
  }

  // ---------- Maillage interne ----------
  const relatedArticles = getRelatedArticles(article.slug, 3);
  const relatedGuides = (article.related.guides ?? [])
    .map((s) => GUIDES.find((g) => g.slug === s))
    .filter((g): g is NonNullable<typeof g> => Boolean(g))
    .slice(0, 2);
  const relatedCities = (article.related.cities ?? [])
    .map((s) => CITIES.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 4);
  const relatedBrands = (article.related.brands ?? [])
    .map((s) => BRAND_LIST.find((b) => b.slug === s))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .slice(0, 4);

  // ---------- Date affichée ----------
  const publishedDate = new Date(article.publishedAt);
  const formattedDate = publishedDate.toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <JsonLd data={schemas} />

      <HeroSecondary
        eyebrow={`${CATEGORY_LABELS[article.category]} · ${article.readingTimeMinutes} min de lecture`}
        title={article.title}
        description={article.excerpt}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: article.title },
        ]}
      />

      {/* Méta-infos auteur + date */}
      <section className="bg-mp-cream py-6 border-b border-mp-sand/30">
        <div className="container mx-auto max-w-3xl px-4 md:px-6 flex flex-wrap items-center gap-4 text-sm text-mp-ink-soft">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.publishedAt}>{formattedDate}</time>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {article.readingTimeMinutes} min
          </span>
          <span>Par <strong className="text-mp-ink">{article.authorName}</strong> — {article.authorRole}</span>
        </div>
      </section>

      {/* TL;DR — réponse directe pour LLMs (GEO) */}
      <section className="bg-mp-beige py-10 md:py-12 border-b border-mp-sand/30">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          <Card className="p-6 md:p-8 bg-mp-cream border-mp-orange-flame/30">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-mp-orange-flame">
                Réponse directe
              </span>
            </div>
            <p className="text-base md:text-lg text-mp-ink leading-relaxed">
              {article.tldr}
            </p>
          </Card>
        </div>
      </section>

      {/* Corps de l'article */}
      <article className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          {article.sections.map((section, i) => (
            <SectionRenderer key={i} section={section} />
          ))}

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-mp-sand/40">
              <span className="text-xs font-semibold text-mp-ink-soft uppercase tracking-wider mr-2">
                Sujets :
              </span>
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="mr-2 mb-2">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* FAQ structurée */}
      {article.faqs.length > 0 && (
        <FAQAccordion
          title="Questions fréquentes sur ce sujet"
          items={article.faqs}
        />
      )}

      {/* Maillage interne — Guides */}
      {relatedGuides.length > 0 && (
        <section className="bg-mp-beige py-12 md:py-16">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-8">
              Approfondir avec un guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group p-6 rounded-2xl bg-mp-cream border border-mp-sand/40 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <Badge variant="secondary" className="mb-3">
                    Guide · {g.readingTime}
                  </Badge>
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
          </div>
        </section>
      )}

      {/* Maillage interne — Articles liés */}
      {relatedArticles.length > 0 && (
        <section className="bg-mp-cream py-12 md:py-16">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-8">
              Continuer la lecture
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group">
                  <Card className="p-6 h-full flex flex-col hover:-translate-y-1 transition-all">
                    <Badge variant="secondary" className="mb-3 self-start">
                      {CATEGORY_LABELS[a.category]}
                    </Badge>
                    <h3
                      className="text-lg font-semibold text-mp-green-deep group-hover:text-mp-orange-flame transition-colors mb-3 leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {a.title}
                    </h3>
                    <p className="text-sm text-mp-ink-soft leading-relaxed flex-1 mb-4 line-clamp-3">
                      {a.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-mp-orange-flame group-hover:gap-2 transition-all">
                      Lire <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Cross-link villes + marques */}
            {(relatedCities.length > 0 || relatedBrands.length > 0) && (
              <div className="mt-12 pt-8 border-t border-mp-sand/40 flex flex-wrap gap-x-8 gap-y-4">
                {relatedCities.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold text-mp-ink-soft uppercase tracking-wider mb-2">
                      Notre service dans :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {relatedCities.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/poeles-pellets-${c.slug}`}
                          className="text-sm text-mp-green-deep hover:text-mp-orange-flame underline underline-offset-4 decoration-mp-sand"
                        >
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {relatedBrands.length > 0 && (
                  <div>
                    <span className="block text-xs font-semibold text-mp-ink-soft uppercase tracking-wider mb-2">
                      Marques mentionnées :
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {relatedBrands.map((b) => (
                        <Link
                          key={b.slug}
                          href={`/nos-marques/${b.slug}`}
                          className="text-sm text-mp-green-deep hover:text-mp-orange-flame underline underline-offset-4 decoration-mp-sand"
                        >
                          {b.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              href="/blog"
              className="inline-flex items-center gap-2 mt-10 text-sm font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tous les articles
            </Link>
          </div>
        </section>
      )}

      <CTAFinal
        title="Prêt à passer à l'action ?"
        description="Devis chiffré sous 48h, primes incluses, pose en 1 jour. Sans engagement."
      />
    </>
  );
}
