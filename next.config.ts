import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import { SITE_REDIRECTS } from "./config/redirects";

// =====================================================================
// HEADERS HTTP DE SÉCURITÉ (cf. audit V20260503 §3.BLOQUANT.1)
// =====================================================================
// Defense-in-depth contre XSS, clickjacking, downgrade SSL, leak referrer.
// Testable via Mozilla Observatory et securityheaders.com après prod.

const SECURITY_HEADERS = [
  // HSTS : force HTTPS + preload (à activer une fois certif Combell stable)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Empêche le navigateur de "deviner" le MIME type d'une réponse
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Anti-clickjacking : seul mister-pellets.be peut iframe le site
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Limite la fuite d'URLs sensibles dans les headers Referer sortants
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Désactive les API navigateur sensibles par défaut
  {
    key: "Permissions-Policy",
    value: "geolocation=(), camera=(), microphone=(), payment=(self), interest-cohort=()",
  },
  // CSP compatible Next.js + Google Fonts. Le paiement (Mollie) se fait par
  // redirection pleine page, sans iframe ni JS embarqué : aucun domaine Mollie
  // à whitelister ici. Reliquats Stripe + Supabase retirés (audit 2026-06-12
  // §P2-1). 'unsafe-inline' encore nécessaire pour les styles Tailwind et les
  // fragments Next.js/Payload — à durcir via nonce-based CSP plus tard.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // googletagmanager sert la bibliothèque gtag.js. Les hits (/g/collect) ne
      // partent pas vers www.google-analytics.com mais vers des sous-domaines
      // régionaux (region1.google-analytics.com, etc.), d'où le joker
      // *.google-analytics.com : sans lui, chaque hit est refusé par la CSP et la
      // mesure est perdue sans aucune erreur visible sur le site (constaté le
      // 22/09/2026). img-src couvre déjà https: pour le pixel de repli.
      // Google Ads (balise AW-, conversions) : domaines de la doc Google
      // « Content Security Policy » mise à jour le 18/09/2026. Pas de joker
      // possible sur le TLD, d'où www.google.be écrit en toutes lettres.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com https://va.vercel-scripts.com https://www.googletagmanager.com https://www.googleadservices.com https://www.google.com https://googleads.g.doubleclick.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.vercel-scripts.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://ad.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://google.com https://www.google.be",
      "frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Sans en-tête X-Powered-By : Next l'envoie par défaut et withPayload le
  // remplace par « Next.js, Payload », qui donnait la pile du site à tout
  // scanner. withPayload ne l'ajoute pas quand ce réglage vaut false.
  poweredByHeader: false,

  // Bloque l'indexation tant que NEXT_PUBLIC_ALLOW_INDEXING != "true"
  // + headers de sécurité applicables sur toutes les routes.
  async headers() {
    const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
    return [
      {
        source: "/:path*",
        headers: [
          ...SECURITY_HEADERS,
          ...(allowIndex
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
    ];
  },

  /**
   * Rewrites SEO-friendly :
   * - /poeles-pellets-{ville}/ (URL externe SEO, format historique WordPress)
   *   → /poeles-pellets/{ville}/ (URL interne Next.js, route dynamique standard)
   *
   * Avantages : préserve les URLs SEO WP existantes, tout en respectant le pattern
   * Next.js App Router (segment dynamique entièrement entre crochets).
   */
  async rewrites() {
    return {
      // Version Markdown des guides, articles, pages marque et FAQ :
      // /guides/x.md → /md/guides/x (app/md, lib/markdown.ts). « beforeFiles » :
      // sinon les routes [slug] prendraient « x.md » pour un slug inconnu.
      beforeFiles: [{ source: "/:path+.md", destination: "/md/:path+" }],
      afterFiles: [
        {
          source: "/poeles-pellets-:ville",
          destination: "/poeles-pellets/:ville",
        },
      ],
      fallback: [],
    };
  },

  /**
   * Redirections permanentes : anciennes adresses (Wix, WordPress), fiches
   * Girolami regroupées, fiches bois parties sur mister-bois.be. La liste vit
   * dans config/redirects.ts, qui retire les chaînes ; scripts/check-catalogue.ts
   * la contrôle.
   */
  async redirects() {
    return SITE_REDIRECTS;
  },

  images: {
    // ⚠️ NE PAS RETIRER. Le 17/09/2026, toutes les photos du site étaient
    // cassées : Vercel répondait « 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED »
    // sur chaque /_next/image, le quota d'optimisation d'images du plan Hobby
    // étant épuisé. Les photos produit sont désormais servies via un srcset
    // construit sur les tailles pré-générées par Payload (lib/product-image.ts),
    // et plus aucune image ne passe par l'optimiseur : `unoptimized` garantit
    // que les <Image> restants (logos SVG, vignettes du configurateur) servent
    // directement leur fichier.
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Vercel Blob : storage actif pour les uploads admin (Phase 5).
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
      // Same-origin Payload API : Payload sert parfois les médias via son
      // endpoint /api/media/file/* qui proxie vers Vercel Blob. Si une URL
      // absolue avec hostname mister-pellets.be arrive (lib/products.ts
      // tente de la rendre relative, mais en backup on whitelist).
      { protocol: "https", hostname: "mister-pellets.be" },
      { protocol: "https", hostname: "www.mister-pellets.be" },
      { protocol: "https", hostname: "*.vercel.app" },
      // Stockage S3-compatible futur (OVH Cellar, Supabase Storage)
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.cellar-c2.services.clever-cloud.com" },
    ],
  },

  experimental: {
    // Payload nécessite la résolution des paquets ESM modernes
    serverActions: { bodySizeLimit: "10mb" },
    // 404 des adresses inconnues dans app/global-not-found.tsx : le site n'a
    // pas de mise en page racine (l'admin Payload rend son propre <html>).
    globalNotFound: true,
  },
};

/**
 * Payload pose sur TOUTES les routes Accept-CH, Vary et Critical-CH
 * (Sec-CH-Prefers-Color-Scheme), qui ne servent qu'au thème de l'admin.
 * Critical-CH oblige Chrome à rejouer la requête de la page à la première
 * visite : un aller-retour réseau de plus avant le premier affichage, soit
 * 0,8 s en 4G simulée (Lighthouse mobile du 11/10/2026, 82 % du trafic Ads
 * arrive sur mobile). Ces en-têtes restent sur /admin et quittent le site public.
 */
const ADMIN_ONLY_HEADERS = new Set(["accept-ch", "critical-ch", "vary"]);

const payloadConfig = withPayload(nextConfig);
const payloadHeaders = payloadConfig.headers;

const config: NextConfig = {
  ...payloadConfig,
  async headers() {
    const rules = (await payloadHeaders?.()) ?? [];
    return rules.flatMap((rule) => {
      const adminOnly = rule.headers.filter((h) => ADMIN_ONLY_HEADERS.has(h.key.toLowerCase()));
      if (adminOnly.length === 0) return [rule];
      const others = rule.headers.filter((h) => !ADMIN_ONLY_HEADERS.has(h.key.toLowerCase()));
      return [
        ...(others.length > 0 ? [{ ...rule, headers: others }] : []),
        { ...rule, source: "/admin/:path*", headers: adminOnly },
      ];
    });
  },
};

export default config;
