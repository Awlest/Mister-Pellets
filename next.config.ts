import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Bloque l'indexation tant que NEXT_PUBLIC_ALLOW_INDEXING != "true"
  async headers() {
    const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
    return [
      {
        source: "/:path*",
        headers: allowIndex
          ? []
          : [
              { key: "X-Robots-Tag", value: "noindex, nofollow" },
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

      // FAQ — page pas encore créée mais on prépare
      { source: "/faq", destination: "/contact", permanent: true },

      // Trailing slash normalization (Vercel le gère mais redirect explicite OK)
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Pour servir les médias Supabase Storage / S3 public plus tard
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
