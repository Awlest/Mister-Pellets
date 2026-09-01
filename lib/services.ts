import type { LucideIcon } from "lucide-react";
import { Home, Coffee, Wrench, Flame, Brush } from "lucide-react";

/**
 * Catalogue des prestations Mister Pellets.
 *
 * SOURCE UNIQUE : la page /prendre-rendez-vous, les pages de service
 * (/ramonage, /entretien-poele-a-pellets, /depannage-poele-a-pellets), la
 * navigation, le sitemap et le balisage Schema.org lisent tous ce fichier.
 * Modifier une prestation ici la met à jour partout.
 *
 * ⚠️ `booking` porte une règle métier, pas une préférence d'affichage :
 * seuls les rendez-vous COMMERCIAUX se réservent en ligne, dans l'agenda de
 * Dorian. Les interventions techniques (entretien, dépannage, ramonage) se
 * calent par téléphone, parce qu'elles demandent de qualifier l'appareil, son
 * accessibilité et l'urgence avant de bloquer un créneau.
 */

export type ServiceLocation = "domicile" | "showroom";
export type BookingMode = "online" | "phone";

export interface Service {
  slug: string;
  name: string;
  /** Page dédiée, si la prestation en a une. Sinon la fiche vit sur /prendre-rendez-vous. */
  href?: string;
  shortDescription: string;
  longDescription: string;
  durationLabel: string;
  priceLabel: string;
  location: ServiceLocation;
  booking: BookingMode;
  icon: LucideIcon;
}

export const PHONE_DISPLAY = "081 13 83 09";
export const PHONE_HREF = "tel:+3281138309";

/**
 * Page de réservation adossée à l'agenda Google de dorian@awlest.com
 * (planning de rendez-vous Google Agenda). Renseignée via
 * NEXT_PUBLIC_BOOKING_URL.
 *
 * Tant que la variable n'est pas définie, `canBookOnline` vaut false et
 * l'interface bascule sur le téléphone. C'est délibéré : le site a déjà
 * affiché pendant des mois cinq boutons « Réserver » pointant vers
 * booking.mister-pellets.be, un sous-domaine qui n'a jamais existé. Aucun
 * bouton de réservation ne doit pouvoir mener nulle part.
 */
export const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL ?? "";
export const canBookOnline = BOOKING_URL.length > 0;

export const SERVICES: Service[] = [
  {
    slug: "devis-sur-place",
    name: "Devis sur place",
    shortDescription: "Diagnostic à domicile pour chiffrer votre projet pellets.",
    longDescription:
      "On vient chez vous, on regarde la pièce, le conduit existant, l'isolation, l'arrivée d'air comburant. Sortie : un devis chiffré sous 48 heures avec le modèle adapté, la prime Wallonie déjà calculée, et le délai de pose.",
    durationLabel: "60 minutes",
    priceLabel: "Gratuit",
    location: "domicile",
    booking: "online",
    icon: Home,
  },
  {
    slug: "visite-showroom",
    name: "Visite showroom + conseils",
    shortDescription: "Voir les modèles d'exposition à Fernelmont, comparer en vrai.",
    longDescription:
      "On vous accueille au showroom de Fernelmont, café, vous voyez les flammes, vous comparez les designs, on parle puissance et budget. La sélection en exposition tourne régulièrement, donc on peut vous confirmer quels modèles seront sur place le jour de votre visite.",
    durationLabel: "45 minutes",
    priceLabel: "Gratuit",
    location: "showroom",
    booking: "online",
    icon: Coffee,
  },
  {
    slug: "entretien-annuel",
    name: "Entretien annuel",
    href: "/entretien-poele-a-pellets",
    shortDescription: "Révision complète, obligatoire chaque année.",
    longDescription:
      "Démontage, nettoyage du creuset, de l'échangeur de chaleur, de la chambre de combustion, du conduit interne, de la sonde de fumée, du ventilateur d'extraction. Vérification des joints, du tirage, des paramètres de combustion.",
    durationLabel: "Environ 90 minutes",
    priceLabel: "Sur devis",
    location: "domicile",
    booking: "phone",
    icon: Wrench,
  },
  {
    slug: "depannage",
    name: "Dépannage",
    href: "/depannage-poele-a-pellets",
    shortDescription: "Intervention en cas de panne ou d'extinction répétée.",
    longDescription:
      "Diagnostic sur place, remplacement éventuel de pièces : résistance d'allumage, motoréducteur, sonde de fumée, carte électronique. Intervention sous 48 à 72 heures autour de Fernelmont.",
    durationLabel: "Variable selon la cause",
    priceLabel: "Sur devis",
    location: "domicile",
    booking: "phone",
    icon: Flame,
  },
  {
    slug: "ramonage",
    name: "Ramonage",
    href: "/ramonage",
    shortDescription: "Ramonage annuel du conduit, certificat fourni.",
    longDescription:
      "Ramonage mécanique du conduit de fumée, contrôle du chapeau, vérification des distances de sécurité. Certificat de ramonage remis sur place, à conserver pour votre assurance habitation.",
    durationLabel: "Environ 60 minutes",
    priceLabel: "Sur devis",
    location: "domicile",
    booking: "phone",
    icon: Brush,
  },
];

/** Prestations réservables en ligne (rendez-vous commerciaux). */
export const ONLINE_SERVICES = SERVICES.filter((s) => s.booking === "online");

/** Interventions techniques, à caler par téléphone. */
export const PHONE_SERVICES = SERVICES.filter((s) => s.booking === "phone");

export function getService(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/** URLs des pages de service, pour le sitemap. */
export const SERVICE_PAGE_PATHS = SERVICES.map((s) => s.href).filter(
  (h): h is string => typeof h === "string",
);
