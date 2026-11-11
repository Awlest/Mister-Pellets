import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Robots de recherche et d'IA nommés, en plus de `*`.
 *
 * Un robot qui trouve un groupe à son nom n'applique QUE ce groupe : il ignore
 * celui de `*`. Les quatre robots d'IA nommés auparavant (« Allow: / » seul)
 * n'avaient donc plus aucun `Disallow` et pouvaient lire /api/. Tous les
 * robots partagent maintenant un seul groupe, avec les mêmes règles. Même
 * liste sur les quatre sites d'Awlest.
 */
const USER_AGENTS = [
  "*",
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "MistralAI-User",
  "DuckAssistBot",
  "CCBot",
];

/**
 * robots.txt dynamique. Bloque tout en preview (Vercel),
 * autorise tout en prod via NEXT_PUBLIC_ALLOW_INDEXING=true.
 * Cf. brief §9.3. Pas de directive `Host` : ni Google ni Bing ne la lisent.
 */
export default function robots(): MetadataRoute.Robots {
  const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

  if (!allowIndex) {
    return {
      rules: [{ userAgent: USER_AGENTS, disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: USER_AGENTS,
        allow: [
          "/",
          // Photos des fiches (servies par l'API Payload) et flux Merchant.
          "/api/media/",
          "/api/feed/",
        ],
        disallow: [
          "/admin/",
          "/api/",
          "/*.json$",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
