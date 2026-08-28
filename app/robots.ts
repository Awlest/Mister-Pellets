import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt dynamique. Bloque tout en preview (Vercel),
 * autorise tout en prod via NEXT_PUBLIC_ALLOW_INDEXING=true.
 * Cf. brief §9.3.
 */
export default function robots(): MetadataRoute.Robots {
  const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  if (!allowIndex) {
    // Preview / staging : on bloque tout
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      host: SITE_URL,
    };
  }

  // Production
  return {
    rules: [
      {
        userAgent: "*",
        // L'ordre des Allow / Disallow respecte le longest-match : on autorise
        // explicitement /api/media/ (images produit Payload) et le flux
        // Google Merchant, puis on bloque le reste de /api/ et /admin/.
        // /_next/ n'est PAS bloqué : les images produit sont servies par
        // /_next/image et le CSS/JS par /_next/static. Les bloquer empêchait
        // Googlebot de rendre les pages et d'indexer les visuels.
        allow: [
          "/",
          "/api/media/",
          "/api/feed/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/panier/",
          "/checkout/",
          "/commande/",
          "/*.json$",
        ],
      },
      // Googlebot-Image doit pouvoir crawler les images servies par Payload
      // (chemin /api/media/file/...) pour valider les annonces Merchant,
      // ainsi que les images optimisées par Next (/_next/image?url=...).
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/api/media/", "/_next/image"],
        disallow: ["/admin/", "/checkout/", "/commande/"],
      },
      // Bloquer les bots aggressifs (optionnel)
      { userAgent: "GPTBot", allow: "/" },         // Autorise OpenAI (GEO friendly)
      { userAgent: "Google-Extended", allow: "/" }, // Autorise Google AI (GEO friendly)
      { userAgent: "PerplexityBot", allow: "/" },   // Autorise Perplexity (GEO friendly)
      { userAgent: "ClaudeBot", allow: "/" },       // Autorise Claude (GEO friendly)
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
