import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CITIES } from "@/lib/cities";
import { GUIDES } from "@/lib/guides";
import { TOP_TIER_BRANDS } from "@/lib/brands";
import { PROVINCES } from "@/lib/local-seo";
import { ARTICLES } from "@/lib/articles";
import { getPayloadClient } from "@/lib/payload-client";
import { getProductSitemapEntries } from "@/lib/products";

/**
 * Sitemap dynamique généré au build + revalidé toutes les heures.
 * Cf. brief §9.2.
 *
 * Hiérarchie de priorité :
 * - 1.0 : homepage
 * - 0.9 : pages structurantes (boutique, devis, primes)
 * - 0.8 : pages services (installation, contact, etc.) + zones-d-intervention
 * - 0.7 : pages produits + pages marques
 * - 0.6 : pages locales (villes) + guides
 * - 0.5 : articles blog
 * - 0.3 : pages légales
 */

export const revalidate = 3600; // 1h ISR

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ===== PAGES STATIQUES =====
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL,                                       lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/boutique`,                          lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE_URL}/demande-de-devis`,                  lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/primes-energie-wallonie-2026`,      lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/nos-marques`,                       lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/guides`,                            lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/zones-d-intervention`,              lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog`,                              lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/contact`,                           lastModified: now, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${SITE_URL}/faq`,                               lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/prendre-rendez-vous`,               lastModified: now, changeFrequency: "yearly",  priority: 0.7 },
    { url: `${SITE_URL}/a-propos`,                          lastModified: now, changeFrequency: "yearly",  priority: 0.6 },
    { url: `${SITE_URL}/mentions-legales`,                  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/cgv`,                               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/politique-confidentialite`,         lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/politique-cookies`,                 lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ];

  // ===== PAGES MARQUES =====
  const brandPages: MetadataRoute.Sitemap = TOP_TIER_BRANDS.map((brand) => ({
    url: `${SITE_URL}/nos-marques/${brand.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ===== PAGES SEO LOCALES (installation marque × province) =====
  const localPages: MetadataRoute.Sitemap = TOP_TIER_BRANDS.flatMap((brand) =>
    PROVINCES.map((province) => ({
      url: `${SITE_URL}/installation/${brand.slug}/${province.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  );

  // ===== PAGES VILLES (avec rewrite vers /poeles-pellets-{slug}) =====
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${SITE_URL}/poeles-pellets-${city.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ===== GUIDES =====
  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ===== ARTICLES BLOG (Phase 7) =====
  const blogPages: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: a.modifiedAt ? new Date(a.modifiedAt) : new Date(a.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // ===== PRODUITS : on s'aligne EXACTEMENT sur la boutique.
  // getProductSitemapEntries filtre hiddenFromBoutique (produits masques
  // exclus) et desactive la pagination (plus de plafond a 100). Le sitemap ne
  // doit lister QUE les produits reellement vendables : les masques (ex.
  // Dielle/Ferlux/Girolami en cours d'encodage) en sont exclus tant qu'ils ne
  // sont pas publies. lastmod = updatedAt Payload (vrai signal de fraicheur
  // pour Google, plutot que la date de generation du sitemap). =====
  let payloadProductPages: MetadataRoute.Sitemap = [];
  let payloadArticlePages: MetadataRoute.Sitemap = [];
  try {
    const entries = await getProductSitemapEntries();
    payloadProductPages = entries
      .filter((e) => Boolean(e.slug))
      .map((e) => ({
        url: `${SITE_URL}/produit/${e.slug}`,
        lastModified: e.updatedAt ? new Date(e.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
  } catch (err) {
    console.warn("[sitemap] produits non joignables :", err);
  }

  // Articles (Phase 7) si la collection existe
  try {
    const payload = await getPayloadClient();
    const articles = await payload.find({
      collection: "articles",
      limit: 100,
      depth: 0,
    });
    const articleDocs = articles.docs as Array<{ slug?: string; updatedAt?: string }>;
    payloadArticlePages = articleDocs
      .filter((a) => Boolean(a.slug))
      .map((a) => ({
        url: `${SITE_URL}/blog/${a.slug}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // Collection Articles pas encore migree, fallback silencieux
  }

  const merged = [
    ...staticPages,
    ...brandPages,
    ...localPages,
    ...cityPages,
    ...guidePages,
    ...blogPages,
    ...payloadProductPages,
    ...payloadArticlePages,
  ];

  const seenUrls = new Set<string>();
  const deduped: MetadataRoute.Sitemap = [];
  for (const item of merged) {
    if (!seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      deduped.push(item);
    }
  }

  return deduped;
}
