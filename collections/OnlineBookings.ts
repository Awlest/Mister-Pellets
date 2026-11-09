import type { CollectionConfig } from "payload";
import { isAdmin } from "../lib/access";

/**
 * OnlineBookings — trace des réservations en ligne des dernières 24 heures,
 * qui sert aux plafonds de /api/rdv/book (lib/booking-limits.ts) : deux
 * rendez-vous par e-mail ou par téléphone, huit pour tout le site. Sans eux,
 * un robot remplissait l'agenda de Dorian (partagé avec mister-clim.be) en
 * quelques dizaines de requêtes.
 *
 * Ni l'e-mail ni le numéro ne sont gardés : seulement leur empreinte HMAC,
 * calculée avec PAYLOAD_SECRET. Les lignes de plus de 24 heures sont effacées
 * à la réservation suivante. Écrite par l'API locale seulement ; cachée dans
 * l'admin, lisible et effaçable par un admin (pour lever un blocage).
 */
export const OnlineBookings: CollectionConfig = {
  slug: "online-bookings",
  labels: { singular: "Réservation en ligne", plural: "Réservations en ligne" },
  access: {
    read: isAdmin,
    create: () => false,
    update: () => false,
    delete: isAdmin,
  },
  admin: {
    hidden: true,
    group: "Leads",
  },
  // Rien à verrouiller : personne ne l'édite dans l'admin.
  lockDocuments: false,
  fields: [
    { name: "emailKey", type: "text", index: true },
    { name: "phoneKey", type: "text", index: true },
    { name: "service", type: "text" },
  ],
};
