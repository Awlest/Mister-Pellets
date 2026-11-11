/**
 * Renvois de Mister Pellets vers Mister Bois.
 *
 * Mister Pellets ne vend que des appareils à pellets. Le bois bûche est le
 * métier de mister-bois.be, l'autre site de la même société (Awlest SRL).
 * Décisions du 11/11/2026 :
 *
 * - les fiches 100 % bois quittent Mister Pellets : chaque adresse
 *   `/produit/<slug>` est redirigée en permanent vers la fiche du même
 *   appareil sur mister-bois.be (FICHES_BOIS_VERS_MISTER_BOIS), ou vers sa
 *   catégorie quand l'appareil n'y a pas de fiche (FICHES_BOIS_SANS_EQUIVALENT) ;
 * - les hybrides bois + pellets restent affichés sur les deux sites mais ne
 *   sont référencés que sur Mister Bois : leur page porte un canonical vers la
 *   fiche de mister-bois.be (FICHES_HYBRIDES_SUR_MISTER_BOIS) et sort du
 *   sitemap.
 *
 * Les tables viennent du relevé des catalogues publics des deux sites du
 * 11/11/2026. Chaque adresse de destination a été contrôlée ce jour-là :
 * réponse 200, canonical sur elle-même. Une fiche bois créée plus tard dans
 * l'admin sans figurer ici est quand même redirigée, vers la catégorie de son
 * appareil (lib/catalog-scope.ts, misterBoisDestination).
 *
 * scripts/check-catalogue.ts vérifie la forme des tables et l'absence de
 * chaîne ou de boucle avec les autres redirections (config/redirects.ts).
 */

export const MISTER_BOIS_URL = "https://mister-bois.be";

/** Pages de mister-bois.be vers lesquelles renvoie un texte qui parle de bois bûche. */
export const MISTER_BOIS = {
  home: MISTER_BOIS_URL,
  stoves: `${MISTER_BOIS_URL}/poeles-a-bois`,
  inserts: `${MISTER_BOIS_URL}/inserts-a-bois`,
  hybrids: `${MISTER_BOIS_URL}/poeles-hybrides-bois-pellets`,
  hybridGuide: `${MISTER_BOIS_URL}/guides/poele-hybride-bois-pellets`,
  brandEdilkamin: `${MISTER_BOIS_URL}/nos-marques/edilkamin`,
  brandGirolami: `${MISTER_BOIS_URL}/nos-marques/girolami`,
  brandAustroflamm: `${MISTER_BOIS_URL}/nos-marques/austroflamm`,
} as const;

/** Les 43 fiches 100 % bois retirées de Mister Pellets et leur fiche sur Mister Bois. */
export const FICHES_BOIS_VERS_MISTER_BOIS: Readonly<Record<string, string>> = {
  "edilkamin-bench-54-evo": "https://mister-bois.be/poeles-a-bois/edilkamin-bench-54-evo",
  "edilkamin-bench-65-evo": "https://mister-bois.be/poeles-a-bois/edilkamin-bench-65-evo",
  "edilkamin-blokk-70-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-blokk-70-evo",
  "edilkamin-blokk-90-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-blokk-90-evo",
  "edilkamin-body": "https://mister-bois.be/poeles-a-bois/edilkamin-body",
  "edilkamin-code-int": "https://mister-bois.be/poeles-a-bois/edilkamin-code-int",
  "edilkamin-code-j-int": "https://mister-bois.be/poeles-a-bois/edilkamin-code-j-int",
  "edilkamin-firebox-49-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-firebox-49-evo",
  "edilkamin-firebox-49-evo-l-r": "https://mister-bois.be/inserts-a-bois/edilkamin-firebox-49-evo-l-r",
  "edilkamin-firebox-54-evo2": "https://mister-bois.be/inserts-a-bois/edilkamin-firebox-54-evo2",
  "edilkamin-firebox-60-evo2": "https://mister-bois.be/inserts-a-bois/edilkamin-firebox-60-evo2",
  "edilkamin-firebox-60-evo2-l-r": "https://mister-bois.be/inserts-a-bois/edilkamin-firebox-60-evo2-l-r",
  "edilkamin-firebox-65-evo2": "https://mister-bois.be/inserts-a-bois/edilkamin-firebox-65-evo2",
  "edilkamin-firepocket-100": "https://mister-bois.be/inserts-a-bois/edilkamin-firepocket-100",
  "edilkamin-firepocket-100-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-firepocket-100-evo",
  "edilkamin-firepocket-60": "https://mister-bois.be/inserts-a-bois/edilkamin-firepocket-60",
  "edilkamin-firepocket-60-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-firepocket-60-evo",
  "edilkamin-firepocket-80": "https://mister-bois.be/inserts-a-bois/edilkamin-firepocket-80",
  "edilkamin-firepocket-80-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-firepocket-80-evo",
  "edilkamin-klass": "https://mister-bois.be/poeles-a-bois/edilkamin-klass",
  "edilkamin-krio": "https://mister-bois.be/poeles-a-bois/edilkamin-krio",
  "edilkamin-krio-s": "https://mister-bois.be/poeles-a-bois/edilkamin-krio-s",
  "edilkamin-polo-evo2": "https://mister-bois.be/poeles-a-bois/edilkamin-polo-evo2",
  "edilkamin-polo-open-evo2": "https://mister-bois.be/poeles-a-bois/edilkamin-polo-open-evo2",
  "edilkamin-tally-gl-int": "https://mister-bois.be/poeles-a-bois/edilkamin-tally-gl-int",
  "edilkamin-tally-gl-s-int": "https://mister-bois.be/poeles-a-bois/edilkamin-tally-gl-s-int",
  "edilkamin-tally-int": "https://mister-bois.be/poeles-a-bois/edilkamin-tally-int",
  "edilkamin-tally-s-int": "https://mister-bois.be/poeles-a-bois/edilkamin-tally-s-int",
  "edilkamin-windo-100-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-windo-100-evo",
  "edilkamin-windo-120": "https://mister-bois.be/inserts-a-bois/edilkamin-windo-120",
  "edilkamin-windo-70-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-windo-70-evo",
  "edilkamin-windo-90-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-windo-90-evo",
  "edilkamin-windo2-50": "https://mister-bois.be/inserts-a-bois/edilkamin-windo2-50",
  "edilkamin-windo2-75-evo-r-l": "https://mister-bois.be/inserts-a-bois/edilkamin-windo2-75-evo-r-l",
  "edilkamin-windo2-95-evo-r-l": "https://mister-bois.be/inserts-a-bois/edilkamin-windo2-95-evo-r-l",
  "edilkamin-windo3-50": "https://mister-bois.be/inserts-a-bois/edilkamin-windo3-50",
  "edilkamin-windo3-85-evo": "https://mister-bois.be/inserts-a-bois/edilkamin-windo3-85-evo",
  "girolami-tc-evo": "https://mister-bois.be/inserts-a-bois/girolami-tc-evo-75",
  "girolami-tc-evo-plus-80": "https://mister-bois.be/inserts-a-bois/girolami-tc-evo-plus-80",
  "girolami-vision-evo-100": "https://mister-bois.be/inserts-a-bois/girolami-vision-evo-100",
  "girolami-vision-evo-70": "https://mister-bois.be/inserts-a-bois/girolami-vision-evo-70",
  "girolami-vision-evo-80": "https://mister-bois.be/inserts-a-bois/girolami-vision-evo-80",
  "girolami-vision-evo-90": "https://mister-bois.be/inserts-a-bois/girolami-vision-evo-90",
};

/**
 * Fiches bois déjà masquées de la boutique, sans fiche du même nom sur Mister
 * Bois. Les variantes du foyer TC EVO 75 vont sur sa fiche ; les foyers Alfa,
 * Frame et MBS F vont sur la catégorie des inserts et foyers.
 */
export const FICHES_BOIS_SANS_EQUIVALENT: Readonly<Record<string, string>> = {
  "girolami-alfa": MISTER_BOIS.inserts,
  "girolami-alfa-double": MISTER_BOIS.inserts,
  "girolami-frame": MISTER_BOIS.inserts,
  "girolami-frame-100": MISTER_BOIS.inserts,
  "girolami-frame-100-dx-sx": MISTER_BOIS.inserts,
  "girolami-frame-120": MISTER_BOIS.inserts,
  "girolami-frame-120-dx-sx": MISTER_BOIS.inserts,
  "girolami-frame-80-dx-sx": MISTER_BOIS.inserts,
  "girolami-mbs-f": MISTER_BOIS.inserts,
  "girolami-mbs-f-100": MISTER_BOIS.inserts,
  "girolami-mbs-f-120": MISTER_BOIS.inserts,
  "girolami-tc-evo-75-curvo": `${MISTER_BOIS_URL}/inserts-a-bois/girolami-tc-evo-75`,
  "girolami-tc-evo-75-dx-sx": `${MISTER_BOIS_URL}/inserts-a-bois/girolami-tc-evo-75`,
};

/**
 * Les 19 hybrides bois + pellets : affichés ici, référencés sur Mister Bois
 * (canonical de la fiche, hors sitemap).
 */
export const FICHES_HYBRIDES_SUR_MISTER_BOIS: Readonly<Record<string, string>> = {
  "austroflamm-clou-duo": "https://mister-bois.be/poeles-hybrides-bois-pellets/austroflamm-clou-duo",
  "austroflamm-mo-duo": "https://mister-bois.be/poeles-hybrides-bois-pellets/austroflamm-mo-duo",
  "austroflamm-mo-duo-cook": "https://mister-bois.be/poeles-hybrides-bois-pellets/austroflamm-mo-duo-cook",
  "austroflamm-quadra-duo": "https://mister-bois.be/poeles-hybrides-bois-pellets/austroflamm-quadra-duo",
  "austroflamm-scotty-duo": "https://mister-bois.be/poeles-hybrides-bois-pellets/austroflamm-scotty-duo",
  "girolami-alfa-bio": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-alfa-bio",
  "girolami-edge": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-edge",
  "girolami-furni": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-furni",
  "girolami-grid-panorama": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-grid-panorama",
  "girolami-grid-verticale": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-grid-verticale",
  "girolami-sharp": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-sharp",
  "girolami-soft": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-soft",
  "girolami-soft-maiolica": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-soft-maiolica",
  "girolami-soft-slim": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-soft-slim",
  "girolami-tc-bio-evo-80": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-tc-bio-evo-80",
  "girolami-ti": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-ti",
  "girolami-ti-panorama": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-ti-panorama",
  "girolami-ti-slim": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-ti-slim",
  "girolami-ti-slim-panorama": "https://mister-bois.be/poeles-hybrides-bois-pellets/girolami-ti-slim-panorama",
};

export type SiteRedirect = { source: string; destination: string; permanent: boolean };

/**
 * Redirections permanentes des fiches bois. Les deux formes d'adresse d'une
 * fiche sont couvertes : `/produit/<slug>` et l'ancienne `/product-page/<slug>`
 * de Wix, qui sinon passerait d'abord par `/produit/<slug>` (deux sauts).
 */
export const misterBoisRedirects: SiteRedirect[] = Object.entries({
  ...FICHES_BOIS_VERS_MISTER_BOIS,
  ...FICHES_BOIS_SANS_EQUIVALENT,
}).flatMap(([slug, destination]) =>
  ["/produit", "/product-page"].map((prefix) => ({
    source: `${prefix}/${slug}`,
    destination,
    permanent: true,
  })),
);
