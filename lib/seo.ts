import type { Metadata } from "next";

/**
 * Helpers SEO centralisés (Phase 6).
 * Génération cohérente des meta tags, Open Graph, Schema.org.
 *
 * Stratégie GEO (Generative Engine Optimization) suivie :
 * - Réponses directes en H2 (à appliquer dans le contenu des pages)
 * - Données quantifiées et sourcées
 * - Citations d'experts internes ("Selon les techniciens Mister Pellets")
 * - FAQ riches sur chaque page
 * - Structured data exhaustif (LocalBusiness, Product, Article, FAQPage, BreadcrumbList)
 * - Maillage sémantique cohérent
 * - Mention explicite marque + zone géographique
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mister-pellets.be";
export const SITE_NAME = "Mister Pellets";
export const SITE_LOCALE = "fr_BE";
export const DEFAULT_OG_IMAGE = "/og-image.jpg"; // 1200×630, à fournir Phase 8

interface SEOPageMetaInput {
  title: string;
  description: string;
  path?: string;             // ex: "/boutique" → canonical = SITE_URL + path
  image?: string;            // override OG image
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;    // ISO date pour articles
  modifiedTime?: string;
  authors?: string[];
  keywords?: string[];
}

/**
 * Construit l'objet Metadata Next.js avec OG + Twitter + canonical.
 * À utiliser dans `generateMetadata` ou `export const metadata` des pages.
 */
export function buildPageMetadata(input: SEOPageMetaInput): Metadata {
  const url = input.path ? `${SITE_URL}${input.path}` : SITE_URL;
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  return {
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    authors: input.authors?.map((name) => ({ name })),
    alternates: {
      canonical: url,
    },
    robots: {
      index: !input.noindex && allowIndex,
      follow: !input.noindex && allowIndex,
    },
    openGraph: {
      type: input.type ?? "website",
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url,
      title: input.title,
      description: input.description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: input.title,
        },
      ],
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [image],
    },
  };
}

/**
 * Schema BreadcrumbList factorisé (Schema.org).
 */
export function buildBreadcrumbSchema(
  items: { name: string; url?: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url && { item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}` }),
    })),
  };
}

/**
 * Schema FAQPage factorisé.
 */
export function buildFAQSchema(
  faqs: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * Schema Article (blog post) factorisé.
 */
interface ArticleSchemaInput {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

export function buildArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.headline,
    description: input.description,
    image: input.imageUrl ?? `${SITE_URL}${DEFAULT_OG_IMAGE}`,
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: {
      "@type": "Organization",
      name: input.authorName ?? SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-mister-pellets-full.svg`,
      },
    },
    mainEntityOfPage: input.url,
  };
}

/**
 * Schema Service (page locale par ville).
 */
interface ServiceSchemaInput {
  serviceName: string;
  description: string;
  cityName: string;
  province: string;
}

export function buildServiceSchema(input: ServiceSchemaInput): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: input.serviceName,
    name: input.serviceName,
    description: input.description,
    provider: {
      "@type": "HomeAndConstructionBusiness",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
    },
    areaServed: {
      "@type": "City",
      name: input.cityName,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: input.province,
      },
    },
  };
}
