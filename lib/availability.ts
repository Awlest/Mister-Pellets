/**
 * Disponibilité d'un produit — SOURCE UNIQUE.
 *
 * Google recoupe la valeur `availability` du flux Merchant avec le balisage
 * Schema.org de la page produit. Deux calculs séparés finissent toujours par
 * diverger : le flux annonçait `backorder` pendant que la page affichait
 * `InStock` sur 141 articles, ce qui est exactement le genre d'écart qui fait
 * refuser un compte pour « informations trompeuses ».
 *
 * Les deux fonctions ci-dessous partent donc du même `stockStatus` interne et
 * doivent rester alignées ligne à ligne.
 */

/** stockStatus interne → valeur `availability` du flux Google Merchant. */
export function merchantAvailability(
  status: string | undefined | null,
): "in_stock" | "backorder" | "out_of_stock" {
  if (status === "out_of_stock" || status === "discontinued") return "out_of_stock";
  if (status === "on_order") return "backorder";
  return "in_stock";
}

/** Même statut, exprimé en URL Schema.org pour le JSON-LD de la page produit. */
export function schemaAvailability(status: string | undefined | null): string {
  switch (merchantAvailability(status)) {
    case "out_of_stock":
      return "https://schema.org/OutOfStock";
    case "backorder":
      return "https://schema.org/BackOrder";
    default:
      return "https://schema.org/InStock";
  }
}

const BRUSSELS = "Europe/Brussels";

/** Décalage de Bruxelles à un instant donné, en heures (1 en hiver, 2 en été). */
function brusselsOffsetHours(instant: number): number {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: BRUSSELS, timeZoneName: "longOffset" })
      .formatToParts(new Date(instant))
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  const m = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3]) / 60) : 0;
}

/**
 * Minuit à Bruxelles, `days` jours après `from`, au format ISO 8601 avec le
 * décalage de cette date-là : « 2026-12-16T00:00:00+01:00 » en hiver,
 * « +02:00 » en été. Le flux écrivait « +02:00 » toute l'année (vérification
 * du 11/11/2026). Le décalage est celui de l'instant de minuit, pas de midi :
 * le jour du passage à l'heure d'été, minuit est encore en +01:00.
 */
export function brusselsMidnightISO(from: Date, days = 0): string {
  // Date civile à Bruxelles de l'instant de départ, puis + `days` jours.
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: BRUSSELS, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(from)
    .split("-")
    .map(Number) as [number, number, number];
  const civil = new Date(Date.UTC(y, m - 1, d + days));
  const yy = civil.getUTCFullYear();
  const mm = civil.getUTCMonth();
  const dd = civil.getUTCDate();
  // Minuit local = minuit UTC moins le décalage ; on garde celui qui se confirme.
  const offset = [1, 2].find((h) => brusselsOffsetHours(Date.UTC(yy, mm, dd) - h * 3_600_000) === h) ?? 1;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${yy}-${pad(mm + 1)}-${pad(dd)}T00:00:00+${pad(offset)}:00`;
}
