/**
 * Calcul des créneaux de rendez-vous.
 *
 * Volontairement PUR : aucune dépendance à Google, au réseau ou à l'heure
 * courante non passée en argument. Toute la logique se teste sans identifiants
 * (cf. scripts/check-booking.ts), et `app/api/rdv/*` ne fait que brancher
 * l'agenda réel dessus.
 *
 * Tout est calculé en UTC en interne. Les horaires d'ouverture sont exprimés
 * en heure locale belge et convertis à la volée, pour que le passage à
 * l'heure d'été ne décale pas les créneaux.
 */

export const TIME_ZONE = "Europe/Brussels";

/** Pas de la grille de créneaux, en minutes. */
export const SLOT_GRANULARITY_MIN = 30;

/**
 * Écart minimal exigé entre la FIN d'un rendez-vous existant et le DÉBUT d'un
 * créneau proposé. Règle demandée par Dorian : le temps de route entre deux
 * interventions.
 */
export const GAP_AFTER_EVENT_MIN = 30;

/**
 * Écart exigé entre la fin d'un créneau proposé et le DÉBUT du rendez-vous
 * suivant. Laissé à 0 : la consigne ne portait que sur le rendez-vous
 * précédent. Passer cette valeur à 30 suffit à rendre le tampon symétrique.
 */
export const GAP_BEFORE_EVENT_MIN = 0;

/** Délai de prévenance : on ne propose rien avant ce nombre d'heures. */
export const MIN_NOTICE_HOURS = 24;

/** Horizon de réservation, en jours. */
export const HORIZON_DAYS = 30;

/**
 * Horaires d'ouverture, en heure locale belge, indexés sur getDay()
 * (0 = dimanche). Doivent rester alignés sur les horaires publiés sur le site
 * et sur la fiche Google.
 */
export const BUSINESS_HOURS: Record<number, { open: string; close: string } | null> = {
  0: null, // dimanche
  1: { open: "09:00", close: "18:00" },
  2: { open: "09:00", close: "18:00" },
  3: { open: "09:00", close: "18:00" },
  4: { open: "09:00", close: "18:00" },
  5: { open: "09:00", close: "18:00" },
  6: { open: "09:00", close: "13:00" }, // samedi
};

export interface Interval {
  /** Instant de début, en millisecondes epoch. */
  start: number;
  /** Instant de fin, en millisecondes epoch. */
  end: number;
}

/** Décalage du fuseau, en minutes, pour un instant donné. */
function tzOffsetMinutes(instant: number, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(new Date(instant));
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  // `Intl` renvoie l'heure murale locale ; relue comme si elle était UTC,
  // l'écart avec l'instant réel donne le décalage du fuseau.
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second),
  );
  return (asUtc - instant) / 60000;
}

/**
 * Convertit une heure murale belge en instant UTC.
 *
 * Deux passes : la première estime le décalage, la seconde le corrige. C'est
 * nécessaire les nuits de changement d'heure, où le décalage dépend de
 * l'instant qu'on cherche justement à calculer.
 */
export function belgianWallTimeToInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  const naive = Date.UTC(year, month - 1, day, hour, minute);
  const firstGuess = naive - tzOffsetMinutes(naive, TIME_ZONE) * 60000;
  return naive - tzOffsetMinutes(firstGuess, TIME_ZONE) * 60000;
}

/** Champs de date locale belge pour un instant donné. */
export function belgianParts(instant: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
} {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const map: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(instant))) map[p.type] = p.value;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    weekday: weekdays.indexOf(map.weekday ?? ""),
  };
}

function parseHm(hm: string): { h: number; m: number } {
  const [h, m] = hm.split(":").map(Number);
  return { h: h ?? 0, m: m ?? 0 };
}

/**
 * Tous les créneaux théoriquement ouvrables sur la période, avant
 * confrontation à l'agenda.
 */
export function generateCandidateSlots(
  fromInstant: number,
  toInstant: number,
  durationMin: number,
): Interval[] {
  const slots: Interval[] = [];
  const step = SLOT_GRANULARITY_MIN * 60000;

  // On itère jour civil par jour civil, en repartant du midi local pour ne pas
  // sauter un jour lors des changements d'heure.
  let cursor = fromInstant;
  const seen = new Set<string>();

  while (cursor <= toInstant + 86400000) {
    const p = belgianParts(cursor);
    const key = `${p.year}-${p.month}-${p.day}`;
    if (!seen.has(key)) {
      seen.add(key);
      const hours = BUSINESS_HOURS[p.weekday];
      if (hours) {
        const o = parseHm(hours.open);
        const c = parseHm(hours.close);
        const dayOpen = belgianWallTimeToInstant(p.year, p.month, p.day, o.h, o.m);
        const dayClose = belgianWallTimeToInstant(p.year, p.month, p.day, c.h, c.m);
        for (let s = dayOpen; s + durationMin * 60000 <= dayClose; s += step) {
          if (s >= fromInstant && s <= toInstant) {
            slots.push({ start: s, end: s + durationMin * 60000 });
          }
        }
      }
    }
    cursor += 86400000;
  }

  return slots.sort((a, b) => a.start - b.start);
}

/** Deux intervalles se chevauchent-ils ? Le contact bord à bord ne compte pas. */
function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Retire les créneaux occupés ou trop proches d'un rendez-vous existant.
 *
 * Chaque plage occupée est élargie de `GAP_AFTER_EVENT_MIN` après sa fin et de
 * `GAP_BEFORE_EVENT_MIN` avant son début ; tout créneau qui touche la plage
 * ainsi élargie est écarté.
 */
export function filterAvailable(candidates: Interval[], busy: Interval[]): Interval[] {
  const padded = busy.map((b) => ({
    start: b.start - GAP_BEFORE_EVENT_MIN * 60000,
    end: b.end + GAP_AFTER_EVENT_MIN * 60000,
  }));
  return candidates.filter((slot) => !padded.some((b) => overlaps(slot, b)));
}

/**
 * Fenêtre de réservation : du délai de prévenance jusqu'à l'horizon.
 * `now` est passé en argument pour rester testable.
 */
export function bookingWindow(now: number): { from: number; to: number } {
  return {
    from: now + MIN_NOTICE_HOURS * 3600000,
    to: now + HORIZON_DAYS * 86400000,
  };
}

/** Chaîne d'affichage d'un créneau, en heure belge. Ex. « 14:30 ». */
export function formatSlotTime(instant: number): string {
  const p = belgianParts(instant);
  return `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`;
}

/** Clé de jour ISO en heure belge. Ex. « 2026-09-15 ». */
export function belgianDayKey(instant: number): string {
  const p = belgianParts(instant);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Pipeline complet : fenêtre, créneaux candidats, filtrage par l'agenda. */
export function availableSlots(
  now: number,
  durationMin: number,
  busy: Interval[],
): Interval[] {
  const { from, to } = bookingWindow(now);
  return filterAvailable(generateCandidateSlots(from, to, durationMin), busy);
}
