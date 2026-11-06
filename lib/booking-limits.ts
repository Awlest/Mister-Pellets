import { createHmac } from "node:crypto";
import type { Payload, Where } from "payload";
import { errorInfo } from "@/lib/log-error";

/**
 * Plafonds de la réservation en ligne (/api/rdv/book), tenus en base
 * (collection online-bookings) et non en mémoire : le compteur de
 * lib/rate-limit.ts vit dans une seule instance Vercel, et un robot qui
 * changeait d'adresse IP remplissait l'agenda de Dorian, partagé avec
 * mister-clim.be. Au-delà, le visiteur est invité à appeler.
 */
export const BOOKING_LIMITS = {
  /** Rendez-vous par e-mail ou par téléphone sur la fenêtre. */
  perContact: 2,
  /** Rendez-vous en ligne pour tout le site sur la fenêtre. */
  perSite: 8,
  /** Fenêtre glissante : 24 heures. */
  windowMs: 24 * 3600 * 1000,
} as const;

const COLLECTION = "online-bookings";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** « 0470 12 34 56 », « +32 470… » et « 0032 470… » : une seule forme, « 0470123456 ». */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+32")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0032")) return `0${digits.slice(4)}`;
  return digits;
}

/** Empreinte HMAC : la base ne garde ni l'e-mail ni le numéro. */
export function contactKey(kind: "email" | "phone", value: string, secret: string): string {
  return createHmac("sha256", secret).update(`${kind}:${value}`).digest("hex");
}

export type BookingQuota =
  | { ok: true; release: () => Promise<void> }
  | { ok: false; reason: "contact" | "site" };

/** Base injoignable : la réservation passe sans plafond plutôt que de perdre le client. */
export const UNCHECKED_QUOTA: BookingQuota = { ok: true, release: async () => {} };

type QuotaStore = Pick<Payload, "count" | "create" | "delete">;

/**
 * Réserve une place sous les plafonds. La ligne est posée AVANT de compter :
 * deux demandes simultanées se voient l'une l'autre. Refus : la ligne est
 * retirée et ne compte pas. Accord : `release()` la retire si le rendez-vous
 * ne se fait pas (créneau pris, agenda en panne).
 */
export async function reserveBookingQuota(
  payload: QuotaStore,
  args: { email?: string; phone?: string; service: string; now: number; secret: string },
): Promise<BookingQuota> {
  const since = new Date(args.now - BOOKING_LIMITS.windowMs).toISOString();
  const emailKey = args.email ? contactKey("email", normalizeEmail(args.email), args.secret) : null;
  const phoneKey = args.phone ? contactKey("phone", normalizePhone(args.phone), args.secret) : null;

  // Ménage : au-delà de la fenêtre, une ligne ne compte plus.
  await payload.delete({
    collection: COLLECTION,
    where: { createdAt: { less_than: since } },
    overrideAccess: true,
  });

  const own = await payload.create({
    collection: COLLECTION,
    data: { emailKey, phoneKey, service: args.service },
    overrideAccess: true,
  });
  const release = async () => {
    try {
      await payload.delete({ collection: COLLECTION, id: own.id, overrideAccess: true });
    } catch (err) {
      console.error("[rdv/book] plafond : ligne non retirée", errorInfo(err));
    }
  };

  try {
    const recent: Where = { createdAt: { greater_than_equal: since } };
    const sameContact: Where[] = [];
    if (emailKey) sameContact.push({ emailKey: { equals: emailKey } });
    if (phoneKey) sameContact.push({ phoneKey: { equals: phoneKey } });

    if (sameContact.length > 0) {
      const { totalDocs } = await payload.count({
        collection: COLLECTION,
        where: { and: [recent, { or: sameContact }] },
        overrideAccess: true,
      });
      if (totalDocs > BOOKING_LIMITS.perContact) {
        await release();
        return { ok: false, reason: "contact" };
      }
    }

    const { totalDocs } = await payload.count({ collection: COLLECTION, where: recent, overrideAccess: true });
    if (totalDocs > BOOKING_LIMITS.perSite) {
      await release();
      return { ok: false, reason: "site" };
    }
  } catch (err) {
    await release();
    throw err;
  }

  return { ok: true, release };
}
