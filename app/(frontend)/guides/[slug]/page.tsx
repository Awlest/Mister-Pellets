import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { HeroSecondary } from "@/components/sections/HeroSecondary";
import { CTAFinal } from "@/components/sections/CTAFinal";
import { FAQAccordion } from "@/components/sections/FAQAccordion";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/JsonLd";
import { GUIDES, getGuideBySlug } from "@/lib/guides";
import { buildPageMetadata } from "@/lib/seo";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide introuvable", robots: { index: false } };
  // Certains metaTitle de guides contiennent déjà " | Mister Pellets" : dans ce
  // cas on passe le titre en absolu pour éviter le double suffixe du template racine.
  const hasBrandSuffix = guide.metaTitle.includes("| Mister Pellets");
  return buildPageMetadata({
    title: guide.metaTitle,
    absoluteTitle: hasBrandSuffix,
    description: guide.metaDescription,
    path: `/guides/${slug}`,
    type: "article",
  });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  // Schema Article + éventuel FAQPage
  const schemas: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      author: {
        "@type": "Organization",
        name: "Mister Pellets",
        url: "https://mister-pellets.be",
      },
      publisher: {
        "@type": "Organization",
        name: "Mister Pellets",
        logo: {
          "@type": "ImageObject",
          url: "https://mister-pellets.be/logo-mister-pellets-full.svg",
        },
      },
      mainEntityOfPage: `https://mister-pellets.be/guides/${guide.slug}`,
    },
  ];

  if (guide.faq && guide.faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
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

      <article className="bg-mp-cream py-12 md:py-16">
        <div className="container mx-auto max-w-3xl px-4 md:px-6">
          {guide.sections.map((section, i) => (
            <section key={i} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-mp-green-deep mb-6 mt-2">
                {section.heading}
              </h2>

              {section.paragraphs?.map((p, k) => (
                <p key={k} className="text-lg text-mp-ink leading-relaxed mb-4">
                  {p}
                </p>
              ))}

              {section.list && (
                <ul className="space-y-3">
                  {section.list.map((item, k) => (
                    <li key={k} className="flex items-start gap-3 text-mp-ink leading-relaxed">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-mp-orange-light text-mp-orange-flame font-bold text-xs shrink-0 mt-0.5">
                        {k + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
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
        <section className="bg-mp-beige py-16 md:py-20">
          <div className="container mx-auto max-w-[1280px] px-4 md:px-6">
            <h2 className="text-3xl font-semibold text-mp-green-deep mb-8">
              Continuer sur le sujet
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {others.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group p-6 rounded-2xl bg-mp-cream border border-mp-sand/40 hover:-translate-y-0.5 hover:shadow-md transition-all"
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

            <Link
              href="/guides"
              className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-mp-green-deep hover:text-mp-orange-flame transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Tous les guides
            </Link>
          </div>
        </section>
      )}

      <CTAFinal
        title="Devis personnalisé après lecture ?"
        description="Maintenant que vous savez ce qui vous convient, on chiffre la pose en 48h avec primes incluses."
      />
    </>
  );
}
