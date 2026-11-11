import { girolamiVariantRedirects } from "./girolami-variant-redirects";
import { misterBoisRedirects, type SiteRedirect } from "./mister-bois";

/**
 * Toutes les redirections permanentes du site, lues par next.config.ts.
 *
 * Elles vivent ici plutôt que dans next.config.ts pour pouvoir être
 * contrôlées sans démarrer Next : scripts/check-catalogue.ts refuse une
 * chaîne (une destination qui est elle-même redirigée), une boucle ou une
 * source en double.
 */

/** Anciennes adresses (Wix, WordPress) et pages renommées. */
const LEGACY_REDIRECTS: SiteRedirect[] = [
  // Doublons internes fondus le 11/11/2026 (constat MP-51) : la puissance dans
  // son guide, les aides dans leur page de référence.
  { source: "/blog/dimensionner-poele-pellets-surface-wallonie", destination: "/guides/quelle-puissance-poele-pellets", permanent: true },
  { source: "/blog/primes-wallonie-2026-poele-pellets-combien-recuperer", destination: "/aides-poele-a-pellets-wallonie", permanent: true },

  // Anciennes URLs marques
  { source: "/marques", destination: "/nos-marques", permanent: true },
  { source: "/edilkamin", destination: "/nos-marques/edilkamin", permanent: true },
  { source: "/ek63", destination: "/nos-marques/ek63", permanent: true },
  // Dielle et Ferlux ne sont plus affichées : leurs pages et leurs anciennes
  // adresses renvoient vers la liste des marques.
  { source: "/dielle", destination: "/nos-marques", permanent: true },
  { source: "/ferlux", destination: "/nos-marques", permanent: true },
  { source: "/nos-marques/dielle", destination: "/nos-marques", permanent: true },
  { source: "/nos-marques/ferlux", destination: "/nos-marques", permanent: true },

  // Anciennes URLs WP courantes
  // Le panier a été retiré avec le paiement en ligne : les anciennes URL
  // de panier et de checkout renvoient vers le chiffrage.
  { source: "/cart", destination: "/estimation", permanent: true },
  { source: "/panier", destination: "/estimation", permanent: true },
  { source: "/checkout", destination: "/estimation", permanent: true },
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
  // La page des aides a perdu son millésime le 11/11/2026 : l'ancienne adresse
  // et les raccourcis pointent tous droit sur la nouvelle.
  { source: "/primes-energie-wallonie-2026", destination: "/aides-poele-a-pellets-wallonie", permanent: true },
  { source: "/primes", destination: "/aides-poele-a-pellets-wallonie", permanent: true },
  { source: "/primes-wallonie", destination: "/aides-poele-a-pellets-wallonie", permanent: true },
  { source: "/aides", destination: "/aides-poele-a-pellets-wallonie", permanent: true },
  { source: "/aides-wallonie", destination: "/aides-poele-a-pellets-wallonie", permanent: true },

  // Guides — redirection des vieilles URLs courantes
  { source: "/guide-achat", destination: "/guides/guide-achat-poele-pellets-wallonie", permanent: true },
  { source: "/canalisable", destination: "/guides/poele-pellets-canalisable", permanent: true },
  { source: "/hydro", destination: "/guides/poele-pellets-hydro", permanent: true },
  { source: "/entretien", destination: "/guides/comment-entretenir-poele-pellets", permanent: true },
  { source: "/dimensionnement", destination: "/guides/quelle-puissance-poele-pellets", permanent: true },

  // Zones d'intervention legacy
  { source: "/zones", destination: "/zones-d-intervention", permanent: true },
  { source: "/wallonie", destination: "/zones-d-intervention", permanent: true },
];

/** Marques et provinces des anciennes pages /installation/<marque>/<province>. */
export const RETIRED_LOCAL_BRANDS = ["mcz", "edilkamin", "ek63", "girolami", "austroflamm", "cadel"] as const;
export const RETIRED_LOCAL_PROVINCES = ["namur", "brabant-wallon", "hainaut", "liege", "luxembourg"] as const;

/**
 * Règles à motif. Elles passent APRÈS les adresses exactes : Next applique la
 * première règle qui correspond, et une fiche bois demandée par son ancienne
 * adresse Wix doit partir droit vers Mister Bois (misterBoisRedirects), pas
 * vers `/produit/<slug>` d'abord.
 */
const PATTERN_REDIRECTS: SiteRedirect[] = [
  // Wix Stores legacy
  { source: "/product-page/:slug", destination: "/produit/:slug", permanent: true },
  // Pages ville : une seule adresse, celle du sitemap et du canonical,
  // `/poeles-pellets-<ville>`. La forme à barre est la route interne de Next,
  // atteinte par la réécriture de next.config.ts ; demandée directement, elle
  // renvoie vers la forme à tiret. Pas de boucle : Next applique les
  // redirections à l'adresse demandée, avant les réécritures, et ne les
  // rejoue pas sur l'adresse réécrite.
  { source: "/poeles-pellets/:ville", destination: "/poeles-pellets-:ville", permanent: true },
  // Pages « installation marque × province » retirées le 11/11/2026 (décision
  // du client) : chacune des 30 renvoie vers la page de sa marque. Marques et
  // provinces énumérées : une autre adresse reste en 404, sans passer par
  // /nos-marques/dielle ou /nos-marques/ferlux, elles-mêmes redirigées.
  {
    source: `/installation/:brand(${RETIRED_LOCAL_BRANDS.join("|")})/:province(${RETIRED_LOCAL_PROVINCES.join("|")})`,
    destination: "/nos-marques/:brand",
    permanent: true,
  },
];

const isPattern = (source: string): boolean => /[:*(]/.test(source);

/**
 * Supprime les chaînes : si la destination d'une règle est elle-même la source
 * exacte d'une autre règle, la règle vise directement la destination finale.
 * Exemple : `/produit/girolami-tc-evo-75` visait `/produit/girolami-tc-evo`,
 * fiche bois désormais redirigée vers Mister Bois.
 */
export function resolveRedirectChains(rules: readonly SiteRedirect[]): SiteRedirect[] {
  const bySource = new Map<string, string>();
  for (const r of rules) {
    if (!isPattern(r.source) && !bySource.has(r.source)) bySource.set(r.source, r.destination);
  }
  return rules.map((rule) => {
    let destination = rule.destination;
    const seen = new Set<string>([rule.source]);
    while (bySource.has(destination)) {
      if (seen.has(destination)) {
        throw new Error(`Boucle de redirections à partir de ${rule.source}`);
      }
      seen.add(destination);
      destination = bySource.get(destination)!;
    }
    return destination === rule.destination ? rule : { ...rule, destination };
  });
}

/** Une seule règle par source : la première gagne, comme dans Next. */
function dedupeBySource(rules: readonly SiteRedirect[]): SiteRedirect[] {
  const seen = new Set<string>();
  return rules.filter((r) => (seen.has(r.source) ? false : (seen.add(r.source), true)));
}

export const SITE_REDIRECTS: SiteRedirect[] = dedupeBySource(
  resolveRedirectChains([
    ...LEGACY_REDIRECTS,
    // Fiches 100 % bois : vers mister-bois.be (config/mister-bois.ts). Avant
    // les anciennes fiches Girolami, dont certaines sont aussi des fiches bois.
    ...misterBoisRedirects,
    // Anciennes fiches Girolami (par puissance, canalisation, coaxiale ou
    // combustible) regroupées en produits à variantes le 2026-06-12.
    ...girolamiVariantRedirects,
    ...PATTERN_REDIRECTS,
  ]),
);

/**
 * Slugs de `/produit/<slug>` déjà redirigés : leur page n'est jamais servie,
 * inutile de la construire (app/(frontend)/produit/[slug]/page.tsx).
 */
export const REDIRECTED_PRODUCT_SLUGS: ReadonlySet<string> = new Set(
  SITE_REDIRECTS.filter((r) => /^\/produit\/[^/:*(]+$/.test(r.source)).map((r) =>
    r.source.slice("/produit/".length),
  ),
);
