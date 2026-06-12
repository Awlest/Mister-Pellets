import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.vercel-scripts.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://*.vercel-scripts.com",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
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
    return [
      {
        source: "/poeles-pellets-:ville",
        destination: "/poeles-pellets/:ville",
      },
    ];
  },

  /**
   * Redirections 301 — anciennes URLs (Wix + WordPress legacy) → nouvelles URLs Next.js.
   * Préserve le SEO et évite les 404 pour les utilisateurs qui suivent un ancien lien.
   * Cf. brief §9.4.
   */
  async redirects() {
    return [
      // Wix Stores legacy
      { source: "/product-page/:slug", destination: "/produit/:slug", permanent: true },

      // Anciennes URLs marques
      { source: "/marques", destination: "/nos-marques", permanent: true },
      { source: "/edilkamin", destination: "/nos-marques/edilkamin", permanent: true },
      { source: "/ek63", destination: "/nos-marques/ek63", permanent: true },
      { source: "/dielle", destination: "/nos-marques/dielle", permanent: true },
      { source: "/ferlux", destination: "/nos-marques/ferlux", permanent: true },

      // Anciennes URLs WP courantes
      { source: "/cart", destination: "/panier", permanent: true },
      { source: "/shop", destination: "/boutique", permanent: true },
      { source: "/devis", destination: "/demande-de-devis", permanent: true },
      { source: "/quote", destination: "/demande-de-devis", permanent: true },
      { source: "/rdv", destination: "/prendre-rendez-vous", permanent: true },
      { source: "/appointment", destination: "/prendre-rendez-vous", permanent: true },
      { source: "/about", destination: "/a-propos", permanent: true },
      { source: "/legal", destination: "/mentions-legales", permanent: true },
      { source: "/terms", destination: "/cgv", permanent: true },
      { source: "/privacy", destination: "/politique-confidentialite", permanent: true },
      { source: "/cookies", destination: "/politique-cookies", permanent: true },

      // Primes / aides
      { source: "/primes", destination: "/primes-energie-wallonie-2026", permanent: true },
      { source: "/primes-wallonie", destination: "/primes-energie-wallonie-2026", permanent: true },
      { source: "/aides", destination: "/primes-energie-wallonie-2026", permanent: true },
      { source: "/aides-wallonie", destination: "/primes-energie-wallonie-2026", permanent: true },

      // Guides — redirection des vieilles URLs courantes
      { source: "/guide-achat", destination: "/guides/guide-achat-poele-pellets-wallonie", permanent: true },
      { source: "/canalisable", destination: "/guides/poele-pellets-canalisable", permanent: true },
      { source: "/hydro", destination: "/guides/poele-pellets-hydro", permanent: true },
      { source: "/entretien", destination: "/guides/comment-entretenir-poele-pellets", permanent: true },
      { source: "/dimensionnement", destination: "/guides/quelle-puissance-poele-pellets", permanent: true },

      // Zones d'intervention legacy
      { source: "/zones", destination: "/zones-d-intervention", permanent: true },
      { source: "/wallonie", destination: "/zones-d-intervention", permanent: true },

      // FAQ : page créée en V1.3 §P2, plus de redirection vers /contact

      // Trailing slash normalization (Vercel le gère mais redirect explicite OK)
    ];
  },

  images: {
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
  },
};

export default withPayload(nextConfig);
