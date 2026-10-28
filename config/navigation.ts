/**
 * Arborescence du site, partagée par l'en-tête, la barre du bas, le volet
 * Menu et le pied de page. Une page qui change d'adresse change ici.
 *
 * Menu, onglets mobiles et colonnes du pied de page suivent le standard commun
 * des sites Mister (awlest-next, ecosysteme/standard-sites-mister.md, 17/10/2026) :
 * même ordre et mêmes libellés sur Mister Pellets, Mister Clim et Mister Bois.
 * scripts/check-famille.ts le vérifie (pnpm check:famille).
 */

import { PHONE_HREF } from "./site";

export const ROUTES = {
  home: "/",
  shop: "/boutique",
  pellets: "/palette-pellets-comfo",
  product: "/produit",
  brands: "/nos-marques",
  maintenance: "/entretien-poele-a-pellets",
  sweeping: "/ramonage",
  repair: "/depannage-poele-a-pellets",
  zones: "/zones-d-intervention",
  configurator: "/estimation",
  quoteForm: "/demande-de-devis",
  booking: "/prendre-rendez-vous",
  bookingWidget: "/prendre-rendez-vous#reserver",
  grants: "/primes-energie-wallonie-2026",
  realisations: "/realisations",
  guides: "/guides",
  blog: "/blog",
  faq: "/faq",
  about: "/a-propos",
  contact: "/contact",
  legal: "/mentions-legales",
  terms: "/cgv",
  privacy: "/politique-confidentialite",
  cookies: "/politique-cookies",
} as const;

/**
 * Pages réellement publiées. Un lien vers une page absente de cette liste
 * n'est pas affiché : jamais de lien interne en 404. Ajouter la route ici en
 * même temps que sa page ; check:famille vérifie que chaque route listée a
 * bien son page.tsx.
 */
export const PUBLISHED: ReadonlySet<string> = new Set<string>([
  ROUTES.home,
  ROUTES.shop,
  ROUTES.pellets,
  ROUTES.brands,
  ROUTES.maintenance,
  ROUTES.sweeping,
  ROUTES.repair,
  ROUTES.zones,
  ROUTES.configurator,
  ROUTES.quoteForm,
  ROUTES.booking,
  ROUTES.grants,
  ROUTES.guides,
  ROUTES.blog,
  ROUTES.faq,
  ROUTES.about,
  ROUTES.contact,
  ROUTES.legal,
  ROUTES.terms,
  ROUTES.privacy,
  ROUTES.cookies,
]);

/** Les fiches marque et les guides sont des routes dynamiques : publiées avec leur page mère. */
const DYNAMIC_PARENTS: readonly string[] = [ROUTES.brands, ROUTES.guides];

export function isPublished(href: string): boolean {
  if (/^(https?:|tel:|mailto:)/.test(href)) return true;
  const path = href.split("#")[0]!.split("?")[0]!;
  if (PUBLISHED.has(path)) return true;
  return DYNAMIC_PARENTS.some((p) => path.startsWith(`${p}/`) && PUBLISHED.has(p));
}

/** Garde les liens dont la page existe. */
export function published<T extends { href: string }>(links: readonly T[]): T[] {
  return links.filter((l) => isPublished(l.href));
}

/**
 * Un lien vers la boutique avec des filtres (`?chauffage=hydro`) se suit par
 * un chargement complet : BoutiqueExplorer ne lit l'URL qu'au montage, une
 * navigation client depuis /boutique garderait les filtres précédents.
 */
export function isFilterLink(href: string): boolean {
  return href.startsWith(`${ROUTES.shop}?`);
}

export type NavLink = { href: string; label: string; desc?: string; short?: string };

/** Catalogue : toute la boutique, puis les familles les plus demandées. */
export const CATALOGUE_LINKS: readonly NavLink[] = [
  { href: ROUTES.shop, label: "Tous nos poêles", short: "Tous les poêles", desc: "Prix TVAC, pose sur devis" },
  { href: `${ROUTES.shop}?chauffage=ventile`, label: "Poêles à air", short: "À air", desc: "Chauffer la pièce de vie" },
  { href: `${ROUTES.shop}?chauffage=hydro`, label: "Poêles hydro", short: "Hydro", desc: "Raccordés aux radiateurs" },
  { href: `${ROUTES.shop}?combustible=hybride`, label: "Poêles hybrides bois et pellets", short: "Hybrides", desc: "Bûches ou pellets, au choix" },
  { href: ROUTES.pellets, label: "Pellets Comfo en palette", short: "Pellets", desc: "975 kg, retrait à Fernelmont" },
];

export const BRAND_LINKS: readonly NavLink[] = [
  { href: `${ROUTES.brands}/edilkamin`, label: "Edilkamin", desc: "Premium · Italie" },
  { href: `${ROUTES.brands}/ek63`, label: "EK63", desc: "Connecté · Italie" },
  { href: `${ROUTES.brands}/girolami`, label: "Girolami", desc: "Polycombustible · Italie" },
  { href: `${ROUTES.brands}/austroflamm`, label: "Austroflamm", desc: "Haut de gamme · Autriche" },
  { href: `${ROUTES.brands}/cadel`, label: "Cadel", desc: "Connecté · Italie" },
];

/** Services : pose et suivi, puis les deux portes d'entrée d'un projet. */
export const SERVICE_LINKS: readonly NavLink[] = [
  { href: ROUTES.maintenance, label: "Entretien annuel", short: "Entretien", desc: "Révision complète, par téléphone" },
  { href: ROUTES.sweeping, label: "Ramonage", short: "Ramonage", desc: "Certificat remis sur place" },
  { href: ROUTES.repair, label: "Dépannage", short: "Dépannage", desc: "Panne, code erreur, extinction" },
  { href: ROUTES.zones, label: "Zones d'intervention", desc: "Les villes où nous posons" },
  { href: ROUTES.booking, label: "Prendre rendez-vous", desc: "Devis à domicile ou showroom" },
  { href: ROUTES.configurator, label: "Estimer mon projet", desc: "Prix de votre installation en 2 minutes" },
];

/** Conseils : sous-menu commun Guides, Blog, FAQ. */
export const ADVICE_LINKS: readonly NavLink[] = [
  { href: ROUTES.guides, label: "Guides", desc: "Achat, puissance, canalisable, hydro" },
  { href: ROUTES.blog, label: "Blog", desc: "Articles et actualités" },
  { href: ROUTES.faq, label: "Questions fréquentes", desc: "Réponses aux questions courantes" },
];

/** Colonne « S'informer » du pied de page et du volet. */
export const INFO_LINKS: readonly NavLink[] = [
  { href: ROUTES.grants, label: "Aides", desc: "Fin de la prime, ce qui reste" },
  { href: ROUTES.realisations, label: "Réalisations", desc: "Des poêles posés près de chez vous" },
  ...ADVICE_LINKS,
  { href: ROUTES.about, label: "À propos", desc: "Qui pose votre poêle" },
  { href: ROUTES.contact, label: "Contact", desc: "Téléphone, e-mail, formulaire" },
];

export const LEGAL_LINKS: readonly NavLink[] = [
  { href: ROUTES.legal, label: "Mentions légales" },
  { href: ROUTES.terms, label: "CGV" },
  { href: ROUTES.privacy, label: "Confidentialité" },
  { href: ROUTES.cookies, label: "Cookies" },
];

/**
 * Menu principal commun aux trois sites Mister. Clés, ordre et libellés sont
 * fixes ; seuls les sous-menus parlent du produit de la marque.
 */
export const FAMILY_NAV_KEYS = ["catalogue", "marques", "services", "aides", "realisations", "conseils", "contact"] as const;
export type FamilyNavKey = (typeof FAMILY_NAV_KEYS)[number];

export type NavEntry = { key: FamilyNavKey; label: string; href: string; children?: readonly NavLink[] };

export const MAIN_NAV: readonly NavEntry[] = [
  { key: "catalogue", label: "Catalogue", href: ROUTES.shop, children: CATALOGUE_LINKS },
  { key: "marques", label: "Marques", href: ROUTES.brands, children: BRAND_LINKS },
  { key: "services", label: "Services", href: ROUTES.maintenance, children: SERVICE_LINKS.slice(0, 3) },
  { key: "aides", label: "Aides", href: ROUTES.grants },
  { key: "realisations", label: "Réalisations", href: ROUTES.realisations },
  { key: "conseils", label: "Conseils", href: ROUTES.guides, children: ADVICE_LINKS },
  { key: "contact", label: "Contact", href: ROUTES.contact },
];

/**
 * Entrées affichées : une entrée à sous-menu vise son propre lien s'il est
 * publié, sinon son premier enfant publié ; une entrée sans page publiée
 * disparaît.
 */
export function visibleNav(entries: readonly NavEntry[] = MAIN_NAV): NavEntry[] {
  return entries.flatMap((entry) => {
    if (!entry.children) return isPublished(entry.href) ? [entry] : [];
    const children = published(entry.children);
    if (children.length === 0) return [];
    const href = isPublished(entry.href) ? entry.href : children[0]!.href;
    return [{ ...entry, href, children }];
  });
}

/**
 * Barre flottante du bas : l'appel reste à un geste sur toutes les pages.
 *
 * Écart au standard commun des trois sites (Accueil, Catalogue, Estimer,
 * Appeler, Menu), décidé le 28/10/2026 : sur Mister Pellets, le rendez-vous
 * prend la place d'Accueil, au centre. 80 % des visites viennent d'un
 * téléphone et la réservation n'était qu'au fond du volet Menu. L'accueil
 * reste en tête du volet et dans le fil d'Ariane de chaque page.
 */
export const MOBILE_TAB_IDS = ["catalogue", "estimate", "booking", "call", "menu"] as const;
export type MobileTabId = (typeof MOBILE_TAB_IDS)[number];

/** `short` : libellé affiché sous 370 px (téléphones de 320 à 360 px), où « Rendez-vous » passait sur deux lignes. */
export const MOBILE_TABS: readonly { id: MobileTabId; label: string; short?: string; href?: string }[] = [
  { id: "catalogue", label: "Catalogue", href: ROUTES.shop },
  { id: "estimate", label: "Estimer", href: ROUTES.configurator },
  { id: "booking", label: "Rendez-vous", short: "RDV", href: ROUTES.bookingWidget },
  { id: "call", label: "Appeler", href: PHONE_HREF },
  { id: "menu", label: "Menu" },
];

export function isCataloguePath(path: string): boolean {
  return path.startsWith(ROUTES.shop) || path.startsWith(`${ROUTES.product}/`);
}
