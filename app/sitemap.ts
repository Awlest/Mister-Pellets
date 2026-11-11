import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CITIES } from "@/lib/cities";
import { GUIDES } from "@/lib/guides";
import { TOP_TIER_BRANDS } from "@/lib/brands";
import { ARTICLES } from "@/lib/articles";
import { CATEGORIES } from "@/lib/categories";
import { ROUTES } from "@/config/navigation";
import { getPayloadClient } from "@/lib/payload-client";
import { getProductSitemapEntries } from "@/lib/products";
import { errorInfo } from "@/lib/log-error";

/**
 * Sitemap dynamique généré au build + revalidé toutes les heures.
 * Cf. brief §9.2.
 *
 * Hiérarchie de priorité :
 * - 1.0 : homepage
 * - 0.9 : pages structurantes (boutique, catégories, devis, prix, aides)
 * - 0.8 : pages services (installation, contact, etc.) + zones-d-intervention
 * - 0.7 : pages produits + pages marques
 * - 0.6 : pages locales (villes) + guides
 * - 0.5 : articles blog
 * - 0.3 : pages légales
 *
 * N'y figurent que des adresses indexables, non redirigées et canoniques sur
 * elles-mêmes : ni fiche masquée, ni fiche bois (redirigée vers
 * mister-bois.be), ni hybride (canonical vers mister-bois.be).
 */

export const revalidate = 3600; // 1h ISR

/**
 * Dernière modification du CONTENU de chaque page, tenue à la main
 * (AAAA-MM-JJ). Jamais l'heure de génération : un `lastmod` qui change toutes
 * les heures ne dit rien à un moteur, qui finit par l'ignorer. Mettez la date
 * à jour quand le texte, les prix ou les liens d'une page changent. Les fiches
 * produit prennent la date de l'admin, les articles et les guides leur
 * `modifiedAt`.
 */
const CONTENT_DATES = {
  // Lot du 11/11/2026 : catalogue recentré sur le pellet, maillage, données structurées.
  [ROUTES.home]: "2026-11-11",
  [ROUTES.shop]: "2026-11-11",
  [ROUTES.pellets]: "2026-11-11",
  [ROUTES.quoteForm]: "2026-11-11",
  [ROUTES.configurator]: "2026-11-11",
  [ROUTES.prices]: "2026-11-11",
  [ROUTES.grants]: "2026-11-11",
  [ROUTES.brands]: "2026-11-11",
  [ROUTES.zones]: "2026-11-11",
  [ROUTES.blog]: "2026-11-11",
  [ROUTES.contact]: "2026-11-11",
  [ROUTES.faq]: "2026-11-11",
  [ROUTES.booking]: "2026-11-11",
  [ROUTES.sweeping]: "2026-11-11",
  [ROUTES.about]: "2026-11-11",
  [ROUTES.legal]: "2026-11-11",
  [ROUTES.guides]: "2026-10-17",
  [ROUTES.maintenance]: "2026-10-25",
  [ROUTES.repair]: "2026-10-25",
  [ROUTES.reviews]: "2026-11-01",
  [ROUTES.terms]: "2026-10-25",
  [ROUTES.privacy]: "2026-10-25",
  [ROUTES.cookies]: "2026-10-25",
} as const satisfies Record<string, string>;

/** Pages marque, installation, ville et catégories : gabarits et données revus le 11/11/2026. */
const CATALOGUE_PAGES_DATE = "2026-11-11";

const day = (iso: string): Date => new Date(`${iso.slice(0, 10)}T00:00:00.000Z`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const page = (
    path: keyof typeof CONTENT_DATES,
    changeFrequency: "weekly" | "monthly" | "yearly",
    priority: number,
  ): MetadataRoute.Sitemap[number] => ({
    url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
    lastModified: day(CONTENT_DATES[path]),
    changeFrequency,
    priority,
  });

  // ===== PAGES STATIQUES =====
  const staticPages: MetadataRoute.Sitemap = [
    page(ROUTES.home, "weekly", 1.0),
    page(ROUTES.shop, "weekly", 0.9),
    page(ROUTES.pellets, "weekly", 0.8),
    page(ROUTES.quoteForm, "monthly", 0.9),
    page(ROUTES.configurator, "weekly", 0.9),
    page(ROUTES.prices, "weekly", 0.9),
    page(ROUTES.grants, "monthly", 0.9),
    page(ROUTES.brands, "monthly", 0.8),
    page(ROUTES.guides, "weekly", 0.8),
    page(ROUTES.zones, "monthly", 0.8),
    page(ROUTES.blog, "weekly", 0.8),
    page(ROUTES.contact, "yearly", 0.7),
    page(ROUTES.faq, "monthly", 0.8),
    page(ROUTES.booking, "yearly", 0.7),
    // Prestations d'entretien : pages d'arrivée du groupe d'annonces « services »
    // et cibles des requêtes « ramonage / entretien / dépannage poêle à pellets ».
    page(ROUTES.sweeping, "monthly", 0.8),
    page(ROUTES.maintenance, "monthly", 0.8),
    page(ROUTES.repair, "monthly", 0.8),
    page(ROUTES.reviews, "monthly", 0.6),
    page(ROUTES.about, "yearly", 0.6),
    page(ROUTES.legal, "yearly", 0.3),
    page(ROUTES.terms, "yearly", 0.3),
    page(ROUTES.privacy, "yearly", 0.3),
    page(ROUTES.cookies, "yearly", 0.3),
  ];

  // ===== CATÉGORIES DU CATALOGUE =====
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${SITE_URL}${category.path}`,
    lastModified: day(category.modifiedAt),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ===== PAGES MARQUES =====
  const brandPages: MetadataRoute.Sitemap = TOP_TIER_BRANDS.map((brand) => ({
    url: `${SITE_URL}/nos-marques/${brand.slug}`,
    lastModified: day(CATALOGUE_PAGES_DATE),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));


  // ===== PAGES VILLES (avec rewrite vers /poeles-pellets-{slug}) =====
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: `${SITE_URL}/poeles-pellets-${city.slug}`,
    lastModified: day(CATALOGUE_PAGES_DATE),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // ===== GUIDES : date de dernière modification du texte (lib/guides.ts) =====
  const guidePages: MetadataRoute.Sitemap = GUIDES.map((guide) => ({
    url: `${SITE_URL}/guides/${guide.slug}`,
    lastModified: day(guide.modifiedAt),
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

  // ===== PRODUITS : on s'aligne sur ce que la boutique référence ici.
  // getProductSitemapEntries écarte les fiches masquées, les fiches bois et les
  // hybrides, et désactive la pagination (plus de plafond à 100). lastmod =
  // updatedAt Payload (vrai signal de fraîcheur) ; sans date, pas de lastmod
  // plutôt que l'heure de génération. Photo principale en <image:image>. =====
  let payloadProductPages: MetadataRoute.Sitemap = [];
  let payloadArticlePages: MetadataRoute.Sitemap = [];
  try {
    const entries = await getProductSitemapEntries();
    payloadProductPages = entries
      .filter((e) => Boolean(e.slug))
      .map((e) => ({
        url: `${SITE_URL}/produit/${e.slug}`,
        ...(e.updatedAt ? { lastModified: new Date(e.updatedAt) } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        ...(e.image ? { images: [e.image.startsWith("http") ? e.image : `${SITE_URL}${e.image}`] } : {}),
      }));
  } catch (err) {
    console.warn("[sitemap] produits non joignables :", errorInfo(err));
  }

  // Articles (Phase 7) si la collection existe
  try {
    const payload = await getPayloadClient();
    const articles = await payload.find({
      collection: "articles",
      limit: 100,
      depth: 0,
      // Règle de lecture publique : les articles publiés seulement, pas les
      // brouillons (collections/Articles.ts).
      overrideAccess: false,
    });
    const articleDocs = articles.docs as Array<{ slug?: string; updatedAt?: string }>;
    payloadArticlePages = articleDocs
      .filter((a) => Boolean(a.slug))
      .map((a) => ({
        url: `${SITE_URL}/blog/${a.slug}`,
        ...(a.updatedAt ? { lastModified: new Date(a.updatedAt) } : {}),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
  } catch {
    // Collection Articles pas encore migree, fallback silencieux
  }

  const merged = [
    ...staticPages,
    ...categoryPages,
    ...brandPages,
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
