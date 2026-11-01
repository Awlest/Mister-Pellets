/**
 * Coordonnées et sites de la famille, lus par l'en-tête, la barre du bas, le
 * volet Menu et le pied de page. Mêmes valeurs que la page Contact et le
 * balisage (components/seo/JsonLd.tsx).
 */

export const SITE_NAME = "Mister Pellets";

export const PHONE_DISPLAY = "081 13 83 09";
export const PHONE_HREF = "tel:+3281138309";
export const EMAIL = "info@awlest.com";
/**
 * Heures où l'on décroche le 081 13 83 09 : la ligne OVH sonne au bureau de
 * 9 h à 16 h puis sur le mobile jusqu'à 19 h, répondeur le soir et le
 * week-end (novembre 2026). Même plage que le composant Appel de Google Ads.
 * Ce ne sont pas des heures d'ouverture au public : le showroom se visite
 * uniquement sur rendez-vous (SHOWROOM_ACCESS), et le balisage n'annonce donc
 * aucun horaire d'ouverture (components/seo/JsonLd.tsx).
 */
export const PHONE_HOURS = "lun-ven 9 h-19 h";
export const PHONE_HOURS_LONG = "du lundi au vendredi, de 9 h à 19 h";
/** Créneaux de visite proposés à la réservation, alignés sur lib/booking.ts. */
export const VISIT_HOURS = "lun-ven 9 h-18 h";
export const VISIT_HOURS_LONG = "du lundi au vendredi, de 9 h à 18 h";
export const SHOWROOM_ACCESS = "Showroom uniquement sur rendez-vous";

export const ADDRESS = {
  street: "Rue des Fagotis 3A",
  postalCode: "5380",
  city: "Fernelmont",
} as const;

/** Identité légale affichée en bas du pied de page. */
export const LEGAL_ENTITY = {
  name: "Awlest SRL",
  enterpriseNumber: "0656.514.212",
} as const;

/**
 * Sites de la famille, liés dans le pied de page (bande « La famille Awlest »)
 * et le volet Menu. Ordre commun aux trois sites Mister.
 */
export const FAMILY_SITES = [
  { name: "Mister Bois", description: "Poêles, inserts et foyers à bois", href: "https://mister-bois.be" },
  { name: "Mister Clim", description: "Climatisation", href: "https://mister-clim.be" },
  { name: "Awlest", description: "Pompe à chaleur, photovoltaïque, rénovation", href: "https://www.awlest.com" },
] as const;

/**
 * Bande « Un service Awlest » du pied de page (plan écosystème v1.1, règle 1 :
 * les sites Mister présentent Awlest comme l'entreprise qui installe).
 * Lien vers l'accueil tant qu'awlest.com tourne sur Wix ; à passer sur
 * /a-propos à la mise en ligne du nouveau site (5 novembre 2026).
 */
export const PARENT_BRAND = {
  name: "Awlest",
  since: "2016",
  href: "https://www.awlest.com",
} as const;

/** Domaines de la famille : un clic vers l'un d'eux est mesuré (cross_brand_click). */
export const FAMILY_HOSTS = ["mister-bois.be", "mister-clim.be", "awlest.com"] as const;
