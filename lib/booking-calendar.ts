/**
 * Entrée d'agenda d'un rendez-vous réservé en ligne, côté client.
 *
 * Depuis le 01/10/2026, le client ne reçoit plus l'invitation Google envoyée
 * au nom de l'agenda de Dorian, mais l'e-mail de confirmation Mister Pellets
 * (lib/email.ts). Ce module fournit ce qui remplace l'invitation : le fichier
 * .ics (pièce jointe de l'e-mail et route /api/rdv/ics) et le lien « Ajouter à
 * Google Agenda » (e-mail et écran de confirmation).
 *
 * PUR et sans dépendance serveur : le widget de réservation l'importe aussi.
 * Aucune donnée du client ici (ni nom, ni e-mail, ni adresse) : ces textes
 * finissent dans des URL et dans l'agenda du client, qui connaît son adresse.
 */

export const SHOWROOM_ADDRESS = "Rue des Fagotis 3A, 5380 Fernelmont";
export const SHOWROOM_LABEL = `Showroom Mister Pellets, ${SHOWROOM_ADDRESS}`;
export const SHOWROOM_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent(`Mister Pellets, ${SHOWROOM_ADDRESS}`);

const PHONE_DISPLAY = "081 13 83 09";

export interface CalendarEntry {
  /** Identifiant stable : le même rendez-vous importé deux fois ne se double pas. */
  uid: string;
  title: string;
  /** Instants epoch en millisecondes. */
  start: number;
  end: number;
  location: string;
  description: string;
}

export interface BookedService {
  slug: string;
  name: string;
  location: "domicile" | "showroom";
}

/** Entrée d'agenda d'un rendez-vous, à partir du service et du créneau. */
export function bookingCalendarEntry(
  service: BookedService,
  start: number,
  durationMin: number,
): CalendarEntry {
  const atHome = service.location === "domicile";
  return {
    uid: `rdv-${service.slug}-${start}@mister-pellets.be`,
    title: `Mister Pellets · ${service.name}`,
    start,
    end: start + durationMin * 60000,
    location: atHome ? "À votre domicile" : SHOWROOM_LABEL,
    description: [
      atHome
        ? "Diagnostic gratuit chez vous pour chiffrer votre poêle. Le devis suit sous 48 heures."
        : "Visite du showroom Mister Pellets. Parking devant le bâtiment.",
      `Un empêchement ? Appelez le ${PHONE_DISPLAY}.`,
      "https://mister-pellets.be",
    ].join("\n"),
  };
}

/** Instant au format iCalendar UTC, ex. « 20261008T083000Z ». */
function icsInstant(ms: number): string {
  return new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Échappement des valeurs texte (RFC 5545 §3.3.11). */
function icsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function utf8Length(codePoint: number): number {
  if (codePoint < 0x80) return 1;
  if (codePoint < 0x800) return 2;
  if (codePoint < 0x10000) return 3;
  return 4;
}

/**
 * Repli des lignes à 75 octets (RFC 5545 §3.1), sans couper un caractère
 * accentué en deux : Outlook refuse un fichier dont une ligne dépasse.
 */
function foldLine(line: string): string {
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  let limit = 75;
  for (const char of line) {
    const size = utf8Length(char.codePointAt(0) ?? 0);
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
      // Chaque ligne de continuation commence par une espace, qui compte.
      limit = 74;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/**
 * Fichier .ics d'un rendez-vous. METHOD:PUBLISH et sans ORGANIZER : c'est
 * une entrée à ajouter, pas une invitation qui attend une réponse.
 */
export function buildIcs(entry: CalendarEntry, now: number = Date.now()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Mister Pellets//Rendez-vous//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${entry.uid}`,
    `DTSTAMP:${icsInstant(now)}`,
    `DTSTART:${icsInstant(entry.start)}`,
    `DTEND:${icsInstant(entry.end)}`,
    `SUMMARY:${icsText(entry.title)}`,
    `LOCATION:${icsText(entry.location)}`,
    `DESCRIPTION:${icsText(entry.description)}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-P1D",
    `DESCRIPTION:${icsText(`Demain : ${entry.title}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/**
 * Lien « Ajouter à Google Agenda » (formulaire de création prérempli).
 * Espaces encodés en %20 et non en « + » : certains agendas affichent le
 * « + » tel quel.
 */
export function googleCalendarUrl(entry: CalendarEntry): string {
  const params: Record<string, string> = {
    action: "TEMPLATE",
    text: entry.title,
    dates: `${icsInstant(entry.start)}/${icsInstant(entry.end)}`,
    details: entry.description,
    location: entry.location,
    ctz: "Europe/Brussels",
  };
  const query = Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return `https://calendar.google.com/calendar/render?${query}`;
}

/**
 * Chemin du fichier .ics servi par le site (/api/rdv/ics). Ne transporte que
 * le service et l'instant : la route reconstruit l'entrée elle-même.
 */
export function icsDownloadPath(serviceSlug: string, start: number): string {
  return `/api/rdv/ics?service=${encodeURIComponent(serviceSlug)}&start=${start}`;
}
