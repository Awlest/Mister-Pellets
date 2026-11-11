import type { Metadata } from "next";
import { plainText } from "./inline-text";

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
// OG image générée dynamiquement par app/opengraph-image.tsx (1200×630 PNG)
// via @vercel/og. Le path stable est /opengraph-image (convention Next.js).
// Cf. audit V20260503 §1.H.1 et §4.H.2.
export const DEFAULT_OG_IMAGE = "/opengraph-image";
/** Suffixe posé par le gabarit de titre de app/(frontend)/layout.tsx. */
export const TITLE_SUFFIX = " | Mister Pellets";
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 158;
/** @id de l'entreprise (components/seo/JsonLd.tsx) : auteur, éditeur, prestataire et vendeur le citent. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** Image de partage d'un article ou d'un guide, construite par app/og/[type]/[slug]/route.tsx. */
export function ogImagePath(type: "blog" | "guides", slug: string): string {
  return `/og/${type}/${slug}`;
}

/** Coupe un texte à la dernière phrase entière qui tient, sinon au dernier mot. */
export function fitText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [];
  let out = "";
  for (const sentence of sentences) {
    if ((out + sentence).trim().length > max) break;
    out += sentence;
  }
  if (out.trim().length >= 40) return out.trim();
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:]$/, "")}…`;
}

interface SEOPageMetaInput {
  title: string;
  description: string;
  path?: string;             // ex: "/boutique" → canonical = SITE_URL + path
  /**
   * Canonical vers une autre adresse que la page (URL absolue). Sert aux
   * hybrides bois + pellets, dont la fiche de référence est sur mister-bois.be.
   * og:url reste l'adresse de la page partagée.
   */
  canonical?: string;
  image?: string;            // override OG image
  /**
   * "product" : la fiche produit pose elle-même sa balise og:type (le type
   * n'existe pas dans l'API Metadata de Next), aucun type n'est émis ici.
   */
  type?: "website" | "article" | "product";
  noindex?: boolean;
  /**
   * Si true, le titre n'est PAS passé dans le template "%s | Mister Pellets"
   * du root layout (à utiliser quand le titre contient déjà le suffixe marque,
   * ex. les metaTitle de marques). Évite le double " | Mister Pellets".
   */
  absoluteTitle?: boolean;
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
  // Titre de 60 caractères au plus, suffixe « | Mister Pellets » compris : s'il
  // ne tient pas, le titre est servi sans suffixe plutôt que coupé par Google.
  const withoutSuffix = input.absoluteTitle || input.title.length + TITLE_SUFFIX.length > TITLE_MAX;

  // Description de 158 caractères au plus : au-delà, on garde les phrases
  // entières qui tiennent.
  const description = fitText(input.description, DESCRIPTION_MAX);

  return {
    title: withoutSuffix ? { absolute: input.title } : input.title,
    description,
    keywords: input.keywords,
    authors: input.authors?.map((name) => ({ name })),
    alternates: {
      canonical: input.canonical ?? url,
    },
    robots: {
      index: !input.noindex && allowIndex,
      follow: !input.noindex && allowIndex,
    },
    openGraph: {
      ...(input.type === "product" ? {} : { type: input.type ?? "website" }),
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url,
      title: input.title,
      description,
      images: [
        {
          url: image,
          // Dimensions connues pour l'image générée seulement ; une photo de
          // fiche ou d'article garde les siennes.
          ...(input.image ? {} : { width: 1200, height: 630 }),
          alt: input.title,
        },
      ],
      ...(input.publishedTime && { publishedTime: input.publishedTime }),
      ...(input.modifiedTime && { modifiedTime: input.modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
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
 * Schema FAQPage factorisé. Les réponses peuvent porter des liens
 * `[texte](adresse)` (lib/inline-text.ts) : le balisage reçoit le texte seul.
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
      acceptedAnswer: { "@type": "Answer", text: plainText(f.answer) },
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
    // Auteur et éditeur : l'entreprise, citée par son @id (jamais redécrite).
    author: { "@type": "Organization", "@id": ORGANIZATION_ID, name: SITE_NAME, url: SITE_URL },
    publisher: { "@id": ORGANIZATION_ID },
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
    provider: { "@id": ORGANIZATION_ID },
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
