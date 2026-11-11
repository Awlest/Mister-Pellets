/**
 * Demande de prix d'un modèle « sur devis ».
 *
 * Une fiche sans aucun prix (MCZ et une partie de Cadel en novembre 2026)
 * n'est pas dans l'estimation en ligne, qui ne garde que les poêles chiffrés
 * (lib/estimate-catalog.ts). Son bouton principal envoie donc vers le
 * formulaire de contact, sujet « Question sur un produit », message prérempli
 * avec le modèle (components/forms/ContactForm.tsx), au lieu d'ouvrir une
 * estimation qui bloquait à l'étape du modèle (vérification du 11/11/2026).
 *
 * Module sans dépendance serveur : lu par la fiche, le formulaire et
 * l'estimation, et contrôlé par scripts/check-coherence.ts.
 */

import { ROUTES } from "@/config/navigation";
import { SITE_URL } from "@/lib/seo";

/** Formulaire qui reçoit la demande de prix. */
export const PRICE_REQUEST_PATH = ROUTES.contact;

/** Sujet du formulaire de contact présélectionné pour une demande de prix. */
export const PRICE_REQUEST_SUBJECT = "info-produit";

/** Libellé du bouton principal d'une fiche sans prix. */
export const PRICE_REQUEST_LABEL = "Demander le prix de ce modèle";

/** Un slug de fiche : minuscules, chiffres et tirets, comme dans l'admin. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MAX = 80;

/**
 * Adresse de la demande de prix d'un modèle : `/contact?modele=<slug>`. Seul
 * le slug passe, contrôlé par une expression stricte : un lien forgé ne peut
 * pas faire écrire un texte libre sur le site (relecture du lot 3). La page
 * reste statique : le formulaire lit l'adresse dans le navigateur.
 */
export function priceRequestHref(slug: string): string {
  return `${PRICE_REQUEST_PATH}?${new URLSearchParams({ modele: slug }).toString()}`;
}

/**
 * Slug lu dans le paramètre `modele` d'une adresse (`?modele=…`), ou null
 * s'il n'a pas exactement la forme d'un slug (80 caractères au plus). Aucune
 * mise en forme : une valeur hors norme est refusée, pas corrigée.
 */
export function readModelParam(search: string): string | null {
  const slug = new URLSearchParams(search).get("modele");
  if (!slug || slug.length > SLUG_MAX || !SLUG_RE.test(slug)) return null;
  return slug;
}

/** Adresse de la fiche, construite sur l'URL du site. */
export const productUrl = (slug: string): string => `${SITE_URL}${ROUTES.product}/${slug}`;

/** Message prérempli du formulaire de contact : il cite l'adresse de la fiche, pas un nom. */
export function priceRequestMessage(slug: string): string {
  return (
    "Bonjour, je souhaite connaître le prix de ce modèle, pose comprise : " +
    `${productUrl(slug)}\n` +
    "Mon code postal : \n" +
    "Mon conduit actuel (cheminée, ventouse, aucun) : "
  );
}

/**
 * Bouton principal d'une fiche, selon la règle partagée avec l'estimation
 * (lib/estimable.ts) :
 * - fiche dans l'estimation : l'estimation ouverte sur ce modèle ;
 * - fiche chiffrée mais absente de l'estimation (sans puissance exploitable,
 *   masquée) : l'estimation sans modèle prérempli, la fiche garde son prix ;
 * - fiche sans prix : la demande de prix du modèle.
 */
export function productPrimaryAction(
  product: { slug: string; name: string; priceTTC?: number | null; isEstimable?: boolean },
  labels: { estimate: string },
): { href: string; label: string; kind: "estimate" | "price-request" } {
  if (product.isEstimable) {
    return {
      href: `${ROUTES.configurator}?modele=${encodeURIComponent(product.slug)}`,
      label: labels.estimate,
      kind: "estimate",
    };
  }
  if (product.priceTTC && product.priceTTC > 0) {
    return { href: ROUTES.configurator, label: labels.estimate, kind: "estimate" };
  }
  return {
    href: priceRequestHref(product.slug),
    label: PRICE_REQUEST_LABEL,
    kind: "price-request",
  };
}
