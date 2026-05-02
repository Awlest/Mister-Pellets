import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { ARTICLES, ARTICLE_CATEGORIES, CATEGORY_LABELS } from "@/lib/articles";
import { buildPageMetadata, buildBreadcrumbSchema, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Blog poêle à pellets — articles techniques & guides Wallonie",
  description:
    "Guides d'achat, comparatifs marques, primes Wallonie 2026, dépannage et entretien. Le blog technique de Mister Pellets, écrit par les techniciens — pas par un rédacteur générique.",
  path: "/blog",
  keywords: [
    "blog poêle à pellets",
    "guide poêle pellets Wallonie",
    "primes Wallonie 2026",
    "entretien poêle pellets",
    "Mister Pellets",
  ],
});

export default function BlogHubPage() {
  const sorted = [...ARTICLES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const featured = sorted[0];
  const others = sorted.slice(1);

  // Schemas : Breadcrumb + ItemList des articles
  const breadcrumb = buildBreadcrumbSchema([
    { name: "Accueil", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Articles Mister Pellets",
    itemListElement: sorted.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${a.slug}`,
      name: a.title,
    })),
  };

  return (
    <>
      <JsonLd data={[breadcrumb, itemList]} />

      <HeroSecondary
        eyebrow="Blog éditorial"
        title={
          <>
            Le savoir-faire pellets, <span className="mp-italic">sans bullshit</span>
          </>
        }
        description="Articles techniques rédigés par les techniciens Mister Pellets. Données chiffrées, retours terrain, primes Wallonie 2026. Aucun contenu généré par IA, aucune généralité copiée d'ailleurs."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Blog" },
        ]}
      />

      {/* Article featured (le plus récent) */}
      {featured && (
        <section className="bg-mp-cream py-12 md:py-16">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <Link href={`/blog/${featured.slug}`} className="group block">
              <Card className="p-8 md:p-12 bg-mp-green-deep text-mp-cream border-mp-green-deep hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3 mb-5">
                  <Badge variant="secondary" className="bg-mp-orange-flame text-mp-cream border-0">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> À la une
                  </Badge>
                  <Badge variant="secondary" className="bg-mp-cream/10 text-mp-cream border-mp-cream/20">
                    {CATEGORY_LABELS[featured.category]}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-mp-cream/70">
                    <Clock className="h-3.5 w-3.5" /> {featured.readingTimeMinutes} min
                  </span>
                </div>

                <h2
                  className="text-3xl md:text-5xl font-semibold leading-tight mb-4 group-hover:text-mp-orange-light transition-colors"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {featured.title}
                </h2>

                <p className="text-lg text-mp-cream/85 leading-relaxed mb-6 max-w-3xl">
                  {featured.excerpt}
                </p>

                <span className="inline-flex items-center gap-2 text-sm font-semibold text-mp-orange-light group-hover:gap-3 transition-all">
                  Lire l'article
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Filtres catégories (visuels uniquement, scroll vers articles) */}
      <section className="bg-mp-beige py-6">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm font-semibold text-mp-ink mr-2">Catégories :</span>
            {ARTICLE_CATEGORIES.map((cat) => {
              const count = ARTICLES.filter((a) => a.category === cat.value).length;
              if (count === 0) return null;
              return (
                <Badge
                  key={cat.value}
                  variant="secondary"
                  className="bg-mp-cream border border-mp-sand/40"
                >
                  {cat.label} <span className="ml-1 opacity-60">({count})</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </section>

      {/* Liste des autres articles */}
      <section className="bg-mp-cream py-16 md:py-20">
        <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
          <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-8">
            Tous les articles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {others.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group">
                <Card className="p-6 h-full flex flex-col hover:-translate-y-1 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{CATEGORY_LABELS[a.category]}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-mp-ink-soft">
                      <Clock className="h-3.5 w-3.5" /> {a.readingTimeMinutes} min
                    </span>
                  </div>

                  <h3
                    className="text-xl font-semibold text-mp-green-deep group-hover:text-mp-orange-flame transition-colors mb-3 leading-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {a.title}
                  </h3>

                  <p className="text-sm text-mp-ink-soft leading-relaxed flex-1 mb-5">
                    {a.excerpt}
                  </p>

                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-mp-orange-flame group-hover:gap-3 transition-all">
                    Lire
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTAFinal
        title="Une question pas couverte par un article ?"
        description="Nos techniciens répondent personnellement, par téléphone ou email. Pas de chatbot, pas de SAV externalisé."
      />
    </>
  );
}
